# 静态网站部署指南

**生成时间**：2025-11-15
**部署类型**：纯静态前端（不含 Firebase 后端）

---

## 📦 静态文件位置

生成的静态文件位于：`D:\網頁\website\frontend-nuxt\.output\public`

### 文件结构
```
.output/public/
├── audio/          # 音频文件
├── images/         # 图片资源
├── _nuxt/          # JS/CSS 资源
├── index.html      # 主页面
├── 200.html        # SPA fallback
├── 404.html        # 404 页面
├── favicon.ico     # 网站图标
└── robots.txt      # SEO 配置
```

---

## 🚀 部署选项

### 选项 1：GitHub Pages（推荐）

#### 前置条件
- GitHub 账号
- 创建一个 GitHub 仓库

#### 部署步骤

**方法 A：使用 GitHub Actions（自动部署）**

1. 在 GitHub 创建新仓库
2. 将代码推送到仓库
3. 创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install
        working-directory: frontend-nuxt

      - name: Generate static files
        run: npm run generate
        working-directory: frontend-nuxt

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend-nuxt/.output/public
```

4. 在 GitHub 仓库设置中：
   - 进入 Settings → Pages
   - Source 选择 `gh-pages` 分支
   - 点击 Save

5. 推送代码后自动部署

**方法 B：手动部署**

1. 复制 `.output/public` 文件夹的所有内容
2. 推送到 `gh-pages` 分支：

```bash
# 进入项目目录
cd D:\網頁\website\frontend-nuxt

# 生成静态文件
npm run generate

# 进入生成的文件夹
cd .output/public

# 初始化 git（如果还没有）
git init
git add -A
git commit -m 'deploy'

# 推送到 GitHub Pages
git push -f git@github.com:你的用户名/你的仓库名.git main:gh-pages
```

3. 访问网站：`https://你的用户名.github.io/你的仓库名/`

**注意事项**：
- 如果部署到子路径（如 `/my-website/`），需要修改 `nuxt.config.ts` 的 `baseURL`：
  ```typescript
  app: {
    baseURL: '/my-website/',
  }
  ```
- 然后重新生成：`npm run generate`

---

### 选项 2：Netlify

#### 部署步骤

1. 访问 [Netlify](https://www.netlify.com/)
2. 注册/登录账号
3. 点击 "Add new site" → "Import an existing project"
4. 选择 GitHub 仓库（或手动上传文件夹）
5. 配置构建设置：
   - **Build command**: `npm run generate`
   - **Publish directory**: `.output/public`
   - **Base directory**: `frontend-nuxt`
6. 点击 "Deploy site"

**自动部署配置**：创建 `netlify.toml`

```toml
[build]
  base = "frontend-nuxt"
  command = "npm run generate"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 选项 3：Vercel

#### 部署步骤

1. 访问 [Vercel](https://vercel.com/)
2. 注册/登录账号
3. 点击 "New Project"
4. 导入 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Nuxt.js
   - **Root Directory**: `frontend-nuxt`
   - **Build Command**: `npm run generate`
   - **Output Directory**: `.output/public`
6. 点击 "Deploy"

---

### 选项 4：手动部署到任何静态托管

1. 生成静态文件：
   ```bash
   cd D:\網頁\website\frontend-nuxt
   npm run generate
   ```

2. 将 `.output/public` 文件夹的所有内容上传到：
   - Apache / Nginx 服务器
   - Amazon S3
   - Google Cloud Storage
   - Cloudflare Pages
   - 等任何支持静态网站的托管服务

3. 配置服务器（如 Nginx）：
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /path/to/.output/public;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

---

## ⚠️ 重要注意事项

### 功能限制（无 Firebase 后端）

由于是纯静态部署，以下功能**暂时无法使用**：

- ❌ **许愿池**：需要 Firebase Firestore
- ❌ **排行榜**：需要 Firebase Firestore
- ❌ **意见回馈**：需要 Firebase Firestore

其他功能**正常运作**：
- ✅ 愛心點擊系統
- ✅ 月球世界
- ✅ Boss 戰鬥系統（包含對話）
- ✅ 專注鬧鐘（本地存储）
- ✅ 所有視覺效果和音效

### 后续添加 Firebase 支持

如果将来需要启用完整功能：

1. 创建 Firebase 项目
2. 添加环境变量（`.env`）：
   ```env
   NUXT_PUBLIC_FIREBASE_API_KEY=你的_API_KEY
   NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的_AUTH_DOMAIN
   NUXT_PUBLIC_FIREBASE_PROJECT_ID=你的_PROJECT_ID
   NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的_STORAGE_BUCKET
   NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的_SENDER_ID
   NUXT_PUBLIC_FIREBASE_APP_ID=你的_APP_ID
   ```
3. 重新生成和部署

---

## 🧪 本地预览

部署前可以本地预览：

```bash
# 安装 serve（如果还没有）
npm install -g serve

# 预览生成的静态网站
cd D:\網頁\website\frontend-nuxt\.output\public
serve

# 或者使用 npx
npx serve .output/public
```

访问 `http://localhost:3000` 查看效果

---

## 📊 生成的文件大小

- **Client bundle**: ~126 KB (gzipped: ~48 KB)
- **CSS**: ~4.35 KB (gzipped: ~1.61 KB)
- **总大小**: 包含所有资源约 ~10 MB（主要是音频和图片）

---

## 🔧 故障排除

### 问题 1：页面刷新后 404 错误

**原因**：单页应用需要服务器配置

**解决**：
- **GitHub Pages**: 自动处理（通过 200.html）
- **Netlify**: 使用 `netlify.toml` 配置重定向
- **Nginx**: 配置 `try_files $uri $uri/ /index.html;`

### 问题 2：资源文件 404

**原因**：baseURL 配置不正确

**解决**：
1. 检查 `nuxt.config.ts` 的 `app.baseURL`
2. 如果部署到子路径，设置正确的 baseURL
3. 重新生成：`npm run generate`

### 问题 3：音频/图片无法加载

**原因**：资源路径问题

**解决**：
1. 确认 `public/audio/` 和 `public/images/` 文件夹存在
2. 检查生成的 `.output/public/` 中是否包含这些文件夹
3. 如果缺失，手动复制到 `public/` 目录后重新生成

---

## ✅ 快速部署清单

- [ ] 生成静态文件：`npm run generate`
- [ ] 检查生成的文件：`.output/public`
- [ ] 选择部署平台（GitHub Pages / Netlify / Vercel）
- [ ] 上传/推送文件
- [ ] 配置域名（可选）
- [ ] 测试所有功能
- [ ] 验证音频和图片加载正常
- [ ] 检查 SEO meta tags

---

**部署完成后，记得测试所有功能！** 🚀
