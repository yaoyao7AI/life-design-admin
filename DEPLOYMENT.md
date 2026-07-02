# 🚀 后台管理页面部署指南

## ✅ 构建完成

前端项目已构建完成，构建产物在 `dist` 目录中。

---

## 📦 方式一：使用后端 Express 托管（最简单）

### 1. 上传构建文件到服务器

将 `dist` 目录下的所有文件上传到服务器的 `public/admin` 目录：

```bash
# 在本地执行（需要先构建）
cd /Users/mac/Desktop/life-design-admin
npm run build

# 上传 dist 目录到服务器
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
```

### 2. 确保后端 Express 配置正确

在后端 `src/app.js` 中确保有以下配置：

```javascript
// 托管静态文件
app.use(express.static("public"));

// 托管后台管理页面
app.use("/admin", express.static("public/admin"));
```

### 3. 访问后台

访问地址：
```
http://123.56.17.118:3000/admin
```

---

## 🌐 方式二：使用独立域名（推荐）

### 1. 创建子域名

登录阿里云 DNS → 添加记录：

| 类型 | 主机记录 | 指向 |
|------|---------|------|
| A | admin | 123.56.17.118 |

### 2. 配置 Nginx（如果使用 Nginx）

创建 Nginx 配置文件 `/etc/nginx/conf.d/admin.life-design.me.conf`：

```nginx
server {
    listen 80;
    server_name admin.life-design.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 访问后台

访问地址：
```
http://admin.life-design.me/admin
```

或如果配置了 HTTPS：
```
https://admin.life-design.me/admin
```

---

## 🔧 后端配置说明

### 确保后端 app.js 包含以下配置：

```javascript
const express = require('express');
const app = express();

// ... 其他中间件 ...

// 托管静态文件（包括上传的文件）
app.use(express.static("public"));

// 托管后台管理页面（React 应用）
app.use("/admin", express.static("public/admin", {
  index: 'index.html',  // 默认文件
  fallthrough: true      // 允许继续处理其他路由
}));

// API 路由（必须在静态文件之后）
app.use("/api", require("./routes/affirmations"));

// 处理 React Router 的路由（SPA 回退）
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/index.html"));
});
```

### 重要提示：

1. **API 代理**：前端构建后的代码中，API 请求会直接访问 `/api`，需要确保后端正确配置了 API 路由
2. **React Router**：由于使用了 React Router，需要配置回退路由，确保所有 `/admin/*` 路径都返回 `index.html`
3. **静态资源**：确保 CSS、JS 等静态资源路径正确

---

## 📝 部署步骤总结

### 快速部署（方式一）

```bash
# 1. 本地构建
cd /Users/mac/Desktop/life-design-admin
npm run build

# 2. 上传到服务器
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/

# 3. 确保后端配置正确（检查 app.js）
# 4. 重启后端服务
ssh root@123.56.17.118 "pm2 restart life-design-backend"

# 5. 访问测试
# http://123.56.17.118:3000/admin
```

---

## 🧪 测试清单

部署后请测试：

- [ ] 访问 `http://123.56.17.118:3000/admin` 能正常打开
- [ ] 列表页能正常加载数据
- [ ] API 请求正常工作（检查浏览器 Network 标签）
- [ ] 创建、编辑、删除功能正常
- [ ] 短链接功能正常
- [ ] 播放页面 `/admin/play?a=001` 正常
- [ ] 页面刷新不会 404

---

## ⚠️ 注意事项

1. **API 地址**：前端构建后，API 请求会使用相对路径 `/api`，确保后端正确配置了 API 路由
2. **路由回退**：React Router 需要配置回退路由，确保刷新页面不会 404
3. **静态资源**：确保 CSS、JS 等静态资源能正常加载
4. **CORS**：如果前后端分离部署，需要配置 CORS

---

## 🔄 更新部署

每次更新代码后：

```bash
# 1. 本地构建
npm run build

# 2. 上传新文件
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/

# 3. 重启服务（如果需要）
ssh root@123.56.17.118 "pm2 restart life-design-backend"
```

---

## 📞 问题排查

### 问题：页面空白

**检查：**
1. 浏览器控制台是否有错误
2. 静态资源路径是否正确
3. 后端是否正确配置了静态文件托管

### 问题：API 请求失败

**检查：**
1. 后端 API 路由是否正确配置
2. CORS 配置是否正确
3. 网络请求路径是否正确（应该是 `/api/...`）

### 问题：刷新页面 404

**解决：**
确保后端配置了 React Router 的回退路由：
```javascript
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/index.html"));
});
```

---

## ✅ 完成状态

**构建产物已准备就绪！**

**下一步：**
1. 上传 `dist` 目录到服务器
2. 配置后端 Express
3. 访问测试

**部署完成后即可使用！** 🎉



