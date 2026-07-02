# 🔧 502 错误排查指南

## 问题：访问 `admin.life-design.me:3000/admin` 出现 HTTP 502 错误

---

## 🔍 排查步骤

### 1. 检查后端服务是否运行

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 检查 PM2 服务状态
pm2 list

# 检查 life-design-backend 服务
pm2 status life-design-backend
```

**如果服务没有运行：**
```bash
# 启动服务
cd /root/apps/life-design-backend
pm2 start ecosystem.config.js
# 或
pm2 start src/app.js --name life-design-backend
```

---

### 2. 检查端口监听

```bash
# 检查 3000 端口是否被监听
netstat -tlnp | grep 3000
# 或
lsof -i :3000
```

**如果没有监听：**
- 检查后端服务是否正常启动
- 检查后端配置的端口是否正确

---

### 3. 检查防火墙

```bash
# 检查防火墙状态
ufw status
# 或
firewall-cmd --list-all

# 如果防火墙阻止了 3000 端口，需要开放
ufw allow 3000/tcp
# 或
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload
```

---

### 4. 检查后端日志

```bash
# 查看 PM2 日志
pm2 logs life-design-backend

# 查看最近的错误
pm2 logs life-design-backend --lines 50
```

---

### 5. 检查后端配置

确保后端 `src/app.js` 正确配置了静态文件托管：

```javascript
const express = require('express');
const path = require('path');
const app = express();

// ... 其他中间件 ...

// 托管静态文件
app.use(express.static("public"));

// 托管后台管理页面
app.use("/admin", express.static("public/admin", {
  index: 'index.html'
}));

// React Router 回退路由
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**重要：** 确保监听地址是 `0.0.0.0`，而不是 `localhost` 或 `127.0.0.1`

---

### 6. 检查文件是否存在

```bash
# 检查 admin 目录是否存在
ls -la /root/apps/life-design-backend/public/admin/

# 检查 index.html 是否存在
ls -la /root/apps/life-design-backend/public/admin/index.html
```

**如果文件不存在：**
```bash
# 重新上传文件
# 在本地执行
cd /Users/mac/Desktop/life-design-admin
scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
```

---

### 7. 测试直接访问后端

```bash
# 在服务器上测试
curl http://localhost:3000/admin

# 或测试 API
curl http://localhost:3000/api/affirmations
```

如果本地可以访问，说明后端正常，问题可能在：
- 域名 DNS 配置
- Nginx 配置（如果使用了 Nginx）
- 防火墙规则

---

## 🔧 解决方案

### 方案 A：直接使用 IP 访问（最简单）

如果域名配置有问题，可以直接使用 IP：

```
http://123.56.17.118:3000/admin
```

---

### 方案 B：配置 Nginx 反向代理（推荐）

如果使用域名，建议配置 Nginx：

1. **安装 Nginx（如果未安装）**
```bash
sudo yum install nginx
# 或
sudo apt install nginx
```

2. **创建 Nginx 配置**

创建文件 `/etc/nginx/conf.d/admin.life-design.me.conf`：

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **测试并重启 Nginx**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

4. **访问（不需要端口）**
```
http://admin.life-design.me/admin
```

---

### 方案 C：检查 DNS 配置

确保 DNS 正确指向服务器：

1. 登录阿里云 DNS 控制台
2. 检查 `admin.life-design.me` 的 A 记录
3. 确保指向：`123.56.17.118`
4. 等待 DNS 生效（可能需要几分钟）

---

## 🚀 快速修复步骤

```bash
# 1. SSH 到服务器
ssh root@123.56.17.118

# 2. 检查服务状态
pm2 list

# 3. 如果服务未运行，启动服务
cd /root/apps/life-design-backend
pm2 restart life-design-backend

# 4. 检查日志
pm2 logs life-design-backend --lines 20

# 5. 测试本地访问
curl http://localhost:3000/admin

# 6. 检查端口
netstat -tlnp | grep 3000
```

---

## ✅ 验证步骤

1. **测试后端服务**
   ```bash
   curl http://123.56.17.118:3000/api/affirmations
   ```

2. **测试后台页面**
   ```bash
   curl http://123.56.17.118:3000/admin
   ```

3. **浏览器访问**
   - 直接 IP：`http://123.56.17.118:3000/admin`
   - 域名：`http://admin.life-design.me:3000/admin`（如果 DNS 配置正确）

---

## 📝 常见问题

### Q: 502 错误但服务在运行？
A: 检查后端是否监听 `0.0.0.0`，而不是 `localhost`

### Q: 域名无法访问但 IP 可以？
A: DNS 配置问题，检查 DNS 记录是否正确

### Q: 端口被占用？
A: 检查是否有其他服务占用 3000 端口，或修改后端端口

---

## 🎯 推荐配置

**最简单的方式：直接使用 IP 访问**
```
http://123.56.17.118:3000/admin
```

**生产环境推荐：配置 Nginx**
```
http://admin.life-design.me/admin
```



