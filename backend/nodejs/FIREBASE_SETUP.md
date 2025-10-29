# Firebase 设置指南

## 前置准备

1. 在 [Firebase Console](https://console.firebase.google.com/) 创建项目
2. 启用 Firestore 数据库

## 获取 Firebase 凭证

### 方式 1: 使用服务账号 JSON 文件(推荐用于开发环境)

1. 在 Firebase Console 中,进入 **项目设置** > **服务账号**
2. 点击 **生成新的私钥**
3. 下载 JSON 文件,保存到 `config/firebase-service-account.json`
4. 在 `.env` 文件中设置:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```

### 方式 2: 使用环境变量(推荐用于生产环境)

1. 下载服务账号 JSON 文件(同上)
2. 从 JSON 文件中提取以下字段:
   - `project_id`
   - `client_email`
   - `private_key`
3. 在 `.env` 文件中设置:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   ```

## Firestore 数据结构

### Collections

#### users
存储用户基本信息
```
users/{userId}
  - username: string
  - createdAt: timestamp
```

#### scores
存储每次提交的分数记录
```
scores/{scoreId}
  - userId: string
  - score: number
  - gameType: string
  - createdAt: timestamp
```

#### userTotals
存储用户总分,用于排行榜查询
```
userTotals/{userId}
  - userId: string
  - username: string
  - totalScore: number
  - lastUpdated: timestamp
```

### 需要创建的索引

在 Firestore 中创建以下复合索引:

1. **userTotals** 集合:
   - 字段: `totalScore` (降序) + `lastUpdated` (升序)
   - 用途: 排行榜查询

创建索引的步骤:
1. 进入 Firebase Console > Firestore > 索引
2. 点击 "创建索引"
3. 集合 ID: `userTotals`
4. 添加字段:
   - `totalScore`: 降序
   - `lastUpdated`: 升序
5. 查询范围: Collection
6. 保存

或者,当你第一次运行查询时,Firebase 会在控制台中显示错误信息,并提供一个链接来自动创建所需的索引。

## 启动服务器

```bash
npm start
# 或
npm run dev
```

## 测试 API

### 1. 提交分数
```bash
curl -X POST http://localhost:3000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "score": 100, "gameType": "default"}'
```

### 2. 获取排行榜
```bash
curl http://localhost:3000/api/leaderboard?page=1&limit=10
```

### 3. 获取用户排名
```bash
curl http://localhost:3000/api/leaderboard/my-rank/user1
```

### 4. 获取用户周围排名
```bash
curl http://localhost:3000/api/leaderboard/around/user1?range=5
```

## 从 MySQL 迁移数据(可选)

如果你有现有的 MySQL 数据需要迁移,可以创建一个迁移脚本:

```javascript
// scripts/migrate-from-mysql.js
import { mysqlPool } from '../config/database.js.backup';
import { getFirestore, admin } from '../config/firebase.js';

async function migrate() {
    const db = getFirestore();

    // 迁移用户
    const [users] = await mysqlPool.query('SELECT * FROM users');
    for (const user of users) {
        await db.collection('users').doc(String(user.id)).set({
            username: user.username,
            createdAt: admin.firestore.Timestamp.fromDate(user.created_at || new Date())
        });
    }

    // 迁移总分
    const [totals] = await mysqlPool.query('SELECT * FROM user_total_loves');
    for (const total of totals) {
        await db.collection('userTotals').doc(String(total.user_id)).set({
            userId: String(total.user_id),
            username: users.find(u => u.id === total.user_id)?.username || `User ${total.user_id}`,
            totalScore: total.total_loves,
            lastUpdated: admin.firestore.Timestamp.fromDate(total.last_updated || new Date())
        });
    }

    console.log('Migration completed!');
}

migrate().catch(console.error);
```

## 注意事项

1. **安全规则**: 在生产环境中,记得设置适当的 Firestore 安全规则
2. **索引**: 确保创建了必要的复合索引,否则某些查询会失败
3. **凭证安全**: 不要将 `.env` 文件或服务账号 JSON 文件提交到版本控制系统
4. **成本**: Firestore 按读写次数收费,请注意优化查询
