# 🔧 后端配置指南 - 修复 "Cannot GET /admin" 错误

## 问题：访问 `http://123.56.17.118:3000/admin` 显示 "Cannot GET /admin"

这个错误说明后端服务正在运行，但是 `/admin` 路由没有正确配置。

---

## ✅ 解决方案

### 步骤 1：确保文件已上传

```bash
# 在本地执行，上传构建文件
cd /Users/mac/Desktop/life-design-admin
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
```

### 步骤 2：检查文件是否存在

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 检查文件
ls -la /root/apps/life-design-backend/public/admin/
```

应该看到：
- `index.html`
- `assets/` 目录

### 步骤 3：配置后端 Express

在后端 `src/app.js` 中添加以下配置：

```javascript
const express = require('express');
const path = require('path');
const app = express();

// ... 其他中间件配置 ...

// ===== 静态文件托管配置 =====

// 1. 托管 public 目录下的静态文件（上传的文件等）
app.use(express.static("public"));

// 2. 托管后台管理页面（React 应用）
app.use("/admin", express.static(path.join(__dirname, "../public/admin"), {
  index: 'index.html',
  fallthrough: false  // 如果找不到文件，不继续处理
}));

// 3. React Router 回退路由（重要！处理所有 /admin/* 路由）
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// ===== API 路由（必须在静态文件之后）=====
app.use("/api", require("./routes/affirmations"));

// ... 其他路由 ...

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
```

---

## 🔍 完整配置示例

如果 `src/app.js` 文件，完整的配置应该是：

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== 静态文件托管 =====
// 托管 public 目录（上传的文件等）
app.use(express.static("public"));

// 托管后台管理页面
app.use("/admin", express.static(path.join(__dirname, "../public/admin"), {
  index: 'index.html'
}));

// React Router 回退路由
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// ===== API 路由 =====
app.use("/api/affirmations", require("./routes/affirmations"));

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
```

---

## 🚀 快速修复步骤

### 1. 上传文件（如果还没上传）

```bash
# 在本地执行
cd /Users/mac/Desktop/life-design-admin
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
```

### 2. 修改后端配置

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 编辑 app.js
cd /root/apps/life-design-backend
nano src/app.js
```

添加或修改静态文件配置部分。

### 3. 重启服务

```bash
pm2 restart life-design-backend

# 查看日志确认
pm2 logs life-design-backend --lines 20
```

### 4. 测试

访问：
```
http://123.56.17.118:3000/admin
```

---

## 🔍 排查检查清单

- [ ] 文件已上传到 `public/admin/` 目录
- [ ] `public/admin/index.html` 文件存在
- [ ] `public/admin/assets/` 目录存在
- [ ] 后端 `app.js` 配置了静态文件托管
- [ ] 配置了 React Router 回退路由
- [ ] 服务已重启
- [ ] 端口监听正确（`0.0.0.0:3000`）

---

## ⚠️ 常见错误

### 错误 1：路径错误

**错误：**
```javascript
app.use("/admin", express.static("public/admin"));
```

**正确：**
```javascript
app.use("/admin", express.static(path.join(__dirname, "../public/admin")));
```

### 错误 2：缺少回退路由

**必须添加：**
```javascript
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});
```

### 错误 3：文件路径不对

确保文件在：
```
/root/apps/life-design-backend/public/admin/index.html
```

---

## 📝 验证命令

```bash
# 1. 检查文件
ls -la /root/apps/life-design-backend/public/admin/

# 2. 检查服务
pm2 list

# 3. 测试本地访问
curl http://localhost:3000/admin

# 4. 查看日志
pm2 logs life-design-backend
```

---

## ✅ 完成检查

配置完成后，应该能够：
- ✅ 访问 `http://123.56.17.118:3000/admin` 看到页面
- ✅ 页面样式正常加载
- ✅ API 请求正常工作
- ✅ 刷新页面不会 404



