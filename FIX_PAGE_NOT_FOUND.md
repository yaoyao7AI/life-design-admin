# 🔧 修复 "页面不存在" 错误

## 问题分析

错误信息：`{"error":"页面不存在"}`

这说明：
1. 后端服务正在运行 ✅
2. 但是 `/admin` 路由返回了 JSON 错误，而不是 HTML 页面 ❌
3. 可能是后端路由配置问题，或者错误处理拦截了静态文件请求

---

## ✅ 解决方案

### 问题原因

后端可能有一个全局的错误处理中间件，当找不到路由时返回了 `{"error":"页面不存在"}`，这导致静态文件请求也被拦截了。

### 解决方法

在后端 `src/app.js` 中，**静态文件托管必须在错误处理之前**：

```javascript
const express = require('express');
const path = require('path');
const app = express();

// ... 其他中间件 ...

// ===== 静态文件托管（必须在错误处理之前）=====
// 1. 托管 public 目录
app.use(express.static("public"));

// 2. 托管后台管理页面
app.use("/admin", express.static(path.join(__dirname, "../public/admin"), {
  index: 'index.html'
}));

// 3. React Router 回退路由
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// ===== API 路由 =====
app.use("/api/affirmations", require("./routes/affirmations"));

// ===== 错误处理（必须在最后）=====
// 注意：错误处理应该在静态文件和 API 路由之后
app.use((req, res) => {
  res.status(404).json({ error: "页面不存在" });
});
```

---

## 🔍 排查步骤

### 1. 检查文件是否存在

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 检查文件
ls -la /root/apps/life-design-backend/public/admin/
```

应该看到：
- `index.html`
- `assets/` 目录

### 2. 检查后端配置顺序

确保后端 `src/app.js` 中的顺序是：

1. ✅ 中间件（cors, json, urlencoded）
2. ✅ **静态文件托管**（express.static）
3. ✅ **API 路由**
4. ✅ **错误处理**（404 处理）

**错误处理必须在最后！**

### 3. 检查错误处理中间件

如果后端有这样的代码：

```javascript
// ❌ 错误：这个会拦截所有未匹配的请求
app.use((req, res) => {
  res.status(404).json({ error: "页面不存在" });
});
```

需要修改为：

```javascript
// ✅ 正确：只处理非静态文件和非 API 的请求
app.use((req, res) => {
  // 排除静态文件和 API 路由
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    res.status(404).json({ error: "页面不存在" });
  } else {
    res.status(404).send('Not Found');
  }
});
```

或者更好的方式：

```javascript
// ✅ 最佳实践：静态文件和 API 路由之后才处理 404
// 静态文件和 API 路由在上面已经定义
// 这里只处理其他未匹配的路由
app.use((req, res) => {
  res.status(404).json({ error: "页面不存在" });
});
```

---

## 🚀 完整配置示例

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// ===== 中间件 =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== 静态文件托管（必须在错误处理之前）=====
// 1. 托管 public 目录
app.use(express.static("public"));

// 2. 托管后台管理页面
const adminPath = path.join(__dirname, "../public/admin");
app.use("/admin", express.static(adminPath, {
  index: 'index.html',
  fallthrough: false  // 如果找不到文件，不继续处理
}));

// 3. React Router 回退路由
app.get("/admin/*", (req, res) => {
  const indexPath = path.join(__dirname, "../public/admin/index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(404).json({ error: "页面不存在" });
    }
  });
});

// ===== API 路由 =====
app.use("/api/affirmations", require("./routes/affirmations"));

// ===== 错误处理（必须在最后）=====
// 处理其他未匹配的路由
app.use((req, res) => {
  res.status(404).json({ error: "页面不存在" });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
```

---

## 🔧 快速修复

### 方法 1：调整中间件顺序

确保静态文件托管在错误处理之前：

```javascript
// ✅ 正确顺序
app.use(express.static("public"));
app.use("/admin", express.static(...));
app.get("/admin/*", ...);
app.use("/api", ...);
app.use((req, res) => { ... }); // 错误处理在最后
```

### 方法 2：修改错误处理逻辑

```javascript
// 修改错误处理，排除静态文件路径
app.use((req, res) => {
  // 如果是静态文件或 API 请求，不返回 JSON
  if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
    res.status(404).send('Not Found');
  } else {
    res.status(404).json({ error: "页面不存在" });
  }
});
```

---

## 📝 验证步骤

修复后：

1. **重启服务**
   ```bash
   ssh root@123.56.17.118 "pm2 restart life-design-backend"
   ```

2. **测试访问**
   ```bash
   curl http://123.56.17.118:3000/admin
   ```
   应该返回 HTML 内容，而不是 JSON

3. **浏览器访问**
   ```
   http://123.56.17.118:3000/admin
   ```
   应该能看到页面

---

## ⚠️ 常见错误

### 错误 1：错误处理在静态文件之前

```javascript
// ❌ 错误
app.use((req, res) => {
  res.status(404).json({ error: "页面不存在" });
});
app.use("/admin", express.static(...));
```

### 错误 2：fallthrough 设置错误

```javascript
// ❌ 错误：fallthrough: true 会让请求继续传递到错误处理
app.use("/admin", express.static(..., { fallthrough: true }));
```

```javascript
// ✅ 正确
app.use("/admin", express.static(..., { fallthrough: false }));
```

---

## ✅ 完成检查

修复后应该：
- ✅ 访问 `/admin` 返回 HTML 页面
- ✅ 访问 `/admin/assets/...` 返回静态资源
- ✅ 访问 `/api/...` 返回 JSON
- ✅ 访问其他路径返回 JSON 错误



