# 🔒 管理後台安全性說明

## 已實作的安全機制

### 1. 密碼保護
管理後台現在需要輸入密碼才能訪問。

**預設密碼：** `admin123`

⚠️ **重要：請立即修改預設密碼！**

### 如何修改密碼

編輯檔案：`D:\網頁\website\frontend\assets\js\admin.js`

找到第 7 行：
```javascript
const ADMIN_PASSWORD = 'admin123'; // 請改為您的自訂密碼
```

將 `admin123` 改為您的自訂密碼，例如：
```javascript
const ADMIN_PASSWORD = 'MySecurePassword2025!';
```

**密碼建議：**
- 至少 12 個字元
- 包含大小寫字母、數字和特殊符號
- 不要使用常見單詞或生日
- 定期更換密碼

---

## 安全特性

### ✅ Session 驗證
- 使用 `sessionStorage` 儲存登入狀態
- 關閉瀏覽器後自動登出
- 不會永久儲存密碼

### ✅ 登入保護
- 密碼錯誤會顯示提示
- 自動清空輸入欄位
- 未登入無法訪問管理功能

### ✅ 登出功能
- 點擊右上角「登出」按鈕
- 清除所有驗證狀態
- 返回登入頁面

---

## 安全等級說明

### 🟡 目前安全等級：基本保護

**優點：**
- ✅ 防止未授權訪問
- ✅ 簡單易用
- ✅ 無需額外設定

**限制：**
- ⚠️ 密碼儲存在前端 JavaScript（可被查看）
- ⚠️ 沒有後端驗證
- ⚠️ 沒有登入次數限制
- ⚠️ 沒有 IP 白名單

**適用場景：**
- 內部網路環境
- 測試和開發環境
- 小型團隊使用

---

## 進階安全建議

### 🔐 建議 1：後端 API 身份驗證

在生產環境中，建議添加後端 API 身份驗證：

#### 方法 A：API 密鑰驗證

1. 在 `.env` 添加：
```env
ADMIN_API_KEY=your-secret-api-key-here
```

2. 在 `leaderboard.routes.js` 添加中間件：
```javascript
// 管理 API 身份驗證中間件
function adminAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (apiKey === process.env.ADMIN_API_KEY) {
        next();
    } else {
        res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }
}

// 套用到所有管理路由
router.get('/admin/players', adminAuth, async (req, res) => {
    // ...
});
```

3. 在前端添加 API 密鑰：
```javascript
async function apiCall(url, options = {}) {
    options.headers = {
        ...options.headers,
        'X-API-Key': 'your-secret-api-key-here'
    };
    return fetch(url, options);
}
```

#### 方法 B：JWT Token 驗證

更安全的方案是使用 JWT：

```bash
npm install jsonwebtoken
```

實作步驟請參考 JWT 官方文檔。

### 🔐 建議 2：IP 白名單

只允許特定 IP 訪問管理後台：

在 `server.js` 添加：
```javascript
const ALLOWED_IPS = ['127.0.0.1', '192.168.1.100'];

app.use('/api/leaderboard/admin/*', (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (ALLOWED_IPS.includes(clientIP)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }
});
```

### 🔐 建議 3：HTTPS

在生產環境必須使用 HTTPS：

```javascript
// 強制 HTTPS
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});
```

### 🔐 建議 4：HTTP Basic Auth

最簡單的伺服器級保護：

在 Nginx 配置：
```nginx
location /admin.html {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### 🔐 建議 5：速率限制

防止暴力破解：

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100, // 最多 100 次請求
    message: 'Too many requests'
});

app.use('/api/leaderboard/admin/*', adminLimiter);
```

---

## 最佳實踐

### ✅ 開發環境
- 使用目前的密碼保護機制即可
- 可使用簡單密碼方便測試
- 確保不會公開訪問

### ✅ 測試環境
- 使用較複雜的密碼
- 考慮添加 IP 白名單
- 定期檢查訪問日誌

### ✅ 生產環境
- **必須**修改預設密碼
- **必須**使用 HTTPS
- **必須**添加後端身份驗證
- **建議**添加 IP 白名單
- **建議**使用 JWT 或 OAuth
- **建議**設定速率限制
- **必須**定期備份資料
- **必須**監控異常訪問

---

## 安全檢查清單

在部署到生產環境前，請確認：

- [ ] 已修改預設密碼
- [ ] 已啟用 HTTPS
- [ ] 已添加後端身份驗證
- [ ] 已設定 IP 白名單（可選）
- [ ] 已設定速率限制
- [ ] 已配置防火牆
- [ ] 已設定定期備份
- [ ] 已測試登入/登出功能
- [ ] 已測試未授權訪問被拒絕
- [ ] 已檢查所有敏感資訊不在前端暴露

---

## 常見問題

### Q: 忘記密碼怎麼辦？
A: 編輯 `assets/js/admin.js` 檔案，查看或修改 `ADMIN_PASSWORD` 常數。

### Q: 如何允許多個管理員？
A: 目前只支援單一密碼。建議升級為後端 JWT 驗證系統，可支援多用戶。

### Q: 密碼會被看到嗎？
A: 是的，目前密碼儲存在前端 JavaScript 中，技術人員可以查看原始碼。這是基本保護級別，適合內部使用。生產環境請使用後端驗證。

### Q: Session 會持續多久？
A: 使用 `sessionStorage`，關閉瀏覽器分頁後就會清除。如需持久登入，可改用 `localStorage`，但安全性較低。

### Q: 可以集成現有的用戶系統嗎？
A: 可以。建議實作後端 API 身份驗證，與您現有的用戶系統整合。

---

## 緊急處理

### 發現未授權訪問時

1. **立即修改密碼**
   ```javascript
   const ADMIN_PASSWORD = 'NewSecurePassword!';
   ```

2. **檢查 Firebase 日誌**
   - 前往 Firebase Console
   - 查看 Firestore 操作記錄
   - 檢查是否有異常刪除

3. **啟用 IP 白名單**
   - 限制只有您的 IP 可訪問

4. **備份資料**
   - 立即備份當前資料
   - 準備還原點

5. **升級安全機制**
   - 實作後端驗證
   - 添加操作日誌
   - 設定告警通知

---

## 聯絡資訊

如需協助提升安全性，請：
- 查閱 Express.js 安全最佳實踐
- 查閱 Firebase 安全規則文檔
- 考慮聘請資安專家審查

---

**最後更新：** 2025-01-15
**安全等級：** 基本保護 🟡
**建議升級：** 後端驗證 🔐
