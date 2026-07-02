# 🔧 修复 404 错误 - "Cannot GET /admin"

## 问题分析

从错误信息看：
1. `/admin` 路由返回 404
2. 静态资源文件也返回 404
3. 后端服务正在运行，但路由配置不正确

---

## ✅ 解决方案

### 步骤 1：确认文件已上传

```bash
# SSH 到服务器检查
ssh root@123.56.17.118
ls -la /root/apps/life-design-backend/public/admin/
```

应该看到：
- `index.html`
- `assets/` 目录

**如果文件不存在，重新上传：**
```bash
# 在本地执行
cd /Users/mac/Desktop/life-design-admin
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
```

### 步骤 2：检查后端配置

后端 `src/app.js` 必须包含以下配置：

```javascript
const express = require('express');
const path = require('path');
const app = express();

// ... 其他中间件 ...

// ===== 静态文件托管 =====
// 1. 托管 public 目录
app.use(express.static("public"));

// 2. 托管后台管理页面（重要！）
app.use("/admin", express.static(path.join(__dirname, "../public/admin"), {
  index: 'index.html'
}));

// 3. React Router 回退路由（必须！）
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// ===== API 路由 =====
app.use("/api/affirmations", require("./routes/affirmations"));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

### 步骤 3：检查文件路径

确保文件结构正确：

```
/root/apps/life-design-backend/
├── src/
│   └── app.js
└── public/
    └── admin/
        ├── index.html
        └── assets/
            ├── index-Vw11b8fT.css
            └── index-YgVQczyj.js
```

### 步骤 4：重启服务

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 重启服务
pm2 restart life-design-backend

# 查看日志
pm2 logs life-design-backend --lines 30
```

---

## 🔍 排查命令

```bash
# 1. 检查文件是否存在
ls -la /root/apps/life-design-backend/public/admin/

# 2. 检查文件内容
cat /root/apps/life-design-backend/public/admin/index.html

# 3. 测试本地访问
curl http://localhost:3000/admin

# 4. 检查服务状态
pm2 list
pm2 logs life-design-backend

# 5. 检查端口监听
netstat -tlnp | grep 3000
```

---

## ⚠️ 常见错误

### 错误 1：路径配置错误

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

### 错误 3：文件未上传

**检查：**
```bash
ls -la /root/apps/life-design-backend/public/admin/
```

如果目录为空或不存在，重新上传文件。

---

## 🚀 一键修复脚本

```bash
# 在服务器上执行
cd /root/apps/life-design-backend

# 1. 检查文件
echo "=== 检查文件 ==="
ls -la public/admin/ 2>/dev/null || echo "admin 目录不存在！"

# 2. 检查配置
echo ""
echo "=== 检查配置 ==="
grep -n "express.static.*admin" src/app.js || echo "未找到 admin 静态文件配置！"

# 3. 重启服务
echo ""
echo "=== 重启服务 ==="
pm2 restart life-design-backend

# 4. 查看日志
echo ""
echo "=== 服务日志 ==="
pm2 logs life-design-backend --lines 10 --nostream
```

---

## ✅ 验证步骤

配置完成后：

1. **测试主页**
   ```bash
   curl http://localhost:3000/admin
   ```
   应该返回 HTML 内容

2. **测试资源文件**
   ```bash
   curl -I http://localhost:3000/admin/assets/index-Vw11b8fT.css
   ```
   应该返回 200 状态码

3. **浏览器访问**
   ```
   http://123.56.17.118:3000/admin
   ```
   应该能看到页面

---

## 📝 完整配置示例

如果后端 `src/app.js` 文件，完整的静态文件配置应该是：

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
const adminPath = path.join(__dirname, "../public/admin");
app.use("/admin", express.static(adminPath, {
  index: 'index.html',
  fallthrough: false
}));

// React Router 回退路由（处理所有 /admin/* 路由）
app.get("/admin/*", (req, res) => {
  const indexPath = path.join(__dirname, "../public/admin/index.html");
  res.sendFile(indexPath);
});

// ===== API 路由 =====
app.use("/api/affirmations", require("./routes/affirmations"));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Admin files path: ${adminPath}`);
});
```

---

## 🎯 快速修复

**最快的方式：**

1. **重新上传文件**
   ```bash
   cd /Users/mac/Desktop/life-design-admin
   scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
   ```

2. **检查并修改后端配置**
   - 确保 `src/app.js` 包含静态文件托管配置
   - 确保添加了 React Router 回退路由

3. **重启服务**
   ```bash
   ssh root@123.56.17.118 "pm2 restart life-design-backend"
   ```

4. **测试访问**
   ```
   http://123.56.17.118:3000/admin
   ```

---

完成这些步骤后，404 错误应该就能解决了！



