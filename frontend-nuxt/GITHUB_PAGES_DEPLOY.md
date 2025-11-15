# GitHub Pages 部署指南（GitHub Actions）

**创建时间**：2025-11-15
**部署方式**：GitHub Actions 自动部署

---

## 🚀 快速开始

### 步骤 1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/)
2. 点击右上角 **+** → **New repository**
3. 填写仓库信息：
   - **Repository name**: `my-website`（或你喜欢的名字）
   - **Description**: `愛心互動遊戲`
   - **Public** 或 **Private**（都可以）
4. 点击 **Create repository**

---

### 步骤 2：初始化 Git 并推送代码

在本地项目目录中执行：

```bash
# 进入项目目录
cd D:\網頁\website\frontend-nuxt

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: Nuxt 3 遷移完成 100%"

# 添加远程仓库（替换成你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/你的用户名/my-website.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**注意**：
- 将 `你的用户名` 替换成你的 GitHub 用户名
- 将 `my-website` 替换成你的仓库名

---

### 步骤 3：启用 GitHub Pages

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分：
   - 选择 **GitHub Actions**
5. 保存

---

### 步骤 4：等待自动部署

1. 回到仓库主页
2. 点击 **Actions** 标签
3. 你会看到 "Deploy to GitHub Pages" workflow 正在运行
4. 等待构建完成（约 1-2 分钟）
5. 构建成功后，点击 **Settings** → **Pages**
6. 你会看到网站的 URL，类似：
   ```
   https://你的用户名.github.io/my-website/
   ```

---

## 📁 项目结构

你的项目现在包含以下关键文件：

```
frontend-nuxt/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✅ GitHub Actions 配置
├── .output/
│   └── public/                 # 生成的静态文件
├── components/                 # Vue 组件
├── pages/                      # 页面
├── public/                     # 静态资源
├── stores/                     # Pinia stores
├── .gitignore                  # Git 忽略文件
├── nuxt.config.ts             # ✅ Nuxt 配置（已配置 ssr: false）
├── package.json
├── DEPLOYMENT.md              # 详细部署指南
└── GITHUB_PAGES_DEPLOY.md     # 本文件
```

---

## 🔄 后续更新流程

每次修改代码后，只需推送到 GitHub，自动部署：

```bash
# 添加修改
git add .

# 提交修改
git commit -m "描述你的修改"

# 推送到 GitHub
git push

# GitHub Actions 会自动构建和部署！
```

---

## ⚙️ GitHub Actions Workflow 说明

`.github/workflows/deploy.yml` 文件配置了自动化流程：

### 触发条件
- ✅ 推送到 `main` 分支时自动运行
- ✅ 可以在 GitHub 网页上手动触发

### 工作流程
1. **构建阶段**：
   - Checkout 代码
   - 设置 Node.js 18
   - 安装依赖：`npm ci`
   - 生成静态网站：`npm run generate`
   - 上传构建产物

2. **部署阶段**：
   - 部署到 GitHub Pages
   - 自动更新网站

### 权限设置
- `contents: read` - 读取仓库内容
- `pages: write` - 写入 GitHub Pages
- `id-token: write` - 身份验证

---

## 🎯 验证部署

### 1. 检查 Actions 运行状态

在 GitHub 仓库页面：
1. 点击 **Actions** 标签
2. 查看最新的 workflow 运行
3. 确认所有步骤都显示 ✅ 绿色勾

### 2. 访问网站

部署成功后，访问你的网站：
```
https://你的用户名.github.io/my-website/
```

### 3. 测试功能

- [ ] 主页面加载正常
- [ ] 音效和音乐播放正常
- [ ] 愛心點擊系統运作
- [ ] Boss 戰鬥系統（包含對話）
- [ ] 月球世界進入和返回
- [ ] 專注鬧鐘功能
- [ ] 所有視覺效果和動畫

---

## 🔧 常见问题

### Q1: Actions 运行失败怎么办？

**解决步骤**：
1. 点击失败的 workflow
2. 查看错误日志
3. 常见问题：
   - **依赖安装失败**：检查 `package.json`
   - **构建失败**：检查代码语法错误
   - **权限不足**：确认 Settings → Actions → General → Workflow permissions 设置为 "Read and write permissions"

### Q2: 网站显示 404 错误

**可能原因**：
1. GitHub Pages 还未启用
2. 分支选择错误
3. 构建产物路径不对

**解决方法**：
1. 检查 Settings → Pages → Source 是否选择 "GitHub Actions"
2. 等待几分钟让 DNS 生效
3. 清除浏览器缓存

### Q3: 资源文件（音频/图片）404

**检查清单**：
- [ ] `public/audio/` 文件夹存在
- [ ] `public/images/` 文件夹存在
- [ ] 文件已提交到 Git
- [ ] `.gitignore` 没有忽略这些文件

### Q4: 如何使用自定义域名？

1. 在仓库中创建 `public/CNAME` 文件：
   ```
   your-domain.com
   ```
2. 在域名提供商设置 DNS：
   - Type: `A`
   - Name: `@`
   - Value: GitHub Pages IP（查看 [GitHub 文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)）
3. 推送到 GitHub
4. 在 Settings → Pages → Custom domain 输入域名
5. 等待 DNS 生效（可能需要 24-48 小时）

### Q5: 部署到子路径（如 `/my-website/`）

如果你的网站不在根路径，需要修改 `nuxt.config.ts`：

```typescript
export default defineNuxtConfig({
  app: {
    baseURL: '/my-website/', // 替换成你的仓库名
  }
})
```

然后：
1. 提交修改：`git commit -am "Update baseURL"`
2. 推送：`git push`
3. GitHub Actions 会自动重新部署

---

## 📊 部署状态徽章

在你的 `README.md` 中添加部署状态徽章：

```markdown
[![Deploy to GitHub Pages](https://github.com/你的用户名/my-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/你的用户名/my-website/actions/workflows/deploy.yml)
```

---

## 🎉 恭喜！

你的網頁已經成功部署到 GitHub Pages！

**下一步**：
- [ ] 分享你的网站链接
- [ ] 添加自定义域名（可选）
- [ ] 监控网站性能
- [ ] 收集用户反馈
- [ ] 考虑添加 Firebase 后端支持

---

## 📞 需要帮助？

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Nuxt 3 部署文档](https://nuxt.com/docs/getting-started/deployment)

---

**部署完成！享受你的愛心互動遊戲吧！** 🎮❤️
