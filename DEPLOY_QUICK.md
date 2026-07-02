# 🚀 快速部署指南

## ✅ 构建已完成

前端项目已构建完成，构建产物在 `dist` 目录。

---

## 📤 部署步骤

### 1. 上传文件到服务器

```bash
# 在本地执行
cd /Users/mac/Desktop/life-design-admin

# 上传 dist 目录下的所有文件到服务器的 public/admin 目录
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
```

### 2. 确保后端配置正确

在后端 `src/app.js` 中添加或检查以下配置：

```javascript
const path = require('path');

// 托管静态文件
app.use(express.static("public"));

// 托管后台管理页面
app.use("/admin", express.static("public/admin", {
  index: 'index.html'
}));

// React Router 回退路由（重要！）
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});
```

### 3. 重启后端服务

```bash
ssh root@123.56.17.118 "pm2 restart life-design-backend"
```

### 4. 访问测试

访问地址：
```
http://123.56.17.118:3000/admin
```

---

## 🌐 使用独立域名（可选）

### 1. 创建子域名

在阿里云 DNS 添加：
- 类型：A
- 主机记录：admin
- 指向：123.56.17.118

### 2. 访问

```
http://admin.life-design.me:3000/admin
```

或配置 Nginx 后：
```
http://admin.life-design.me/admin
```

---

## ✅ 部署完成检查清单

- [ ] 访问 `http://123.56.17.118:3000/admin` 能正常打开
- [ ] 页面样式正常（CSS 加载成功）
- [ ] 列表页能加载数据
- [ ] API 请求正常（检查浏览器 Network）
- [ ] 创建、编辑、删除功能正常
- [ ] 刷新页面不会 404

---

## 🔄 更新部署

每次代码更新后：

```bash
# 1. 重新构建
npm run build

# 2. 上传新文件
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/

# 3. 重启服务（如果需要）
ssh root@123.56.17.118 "pm2 restart life-design-backend"
```

---

## ⚠️ 重要提示

1. **React Router 回退路由**：必须配置，否则刷新页面会 404
2. **API 路径**：前端使用相对路径 `/api`，确保后端 API 路由正确
3. **静态资源**：确保 CSS、JS 文件能正常加载

---

**部署完成后即可使用！** 🎉



