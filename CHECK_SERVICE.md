# 🔍 检查后端服务状态

## 检查命令

### 1. 检查服务是否运行

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 检查 PM2 服务状态
pm2 list

# 检查 life-design-backend 服务
pm2 status life-design-backend

# 查看服务日志
pm2 logs life-design-backend --lines 20
```

### 2. 检查端口监听

```bash
# 检查 3000 端口是否被监听
netstat -tlnp | grep 3000
# 或
lsof -i :3000
```

### 3. 测试 API 访问

```bash
# 测试 API
curl http://123.56.17.118:3000/api/affirmations

# 测试根路径
curl http://123.56.17.118:3000/
```

### 4. 如果服务未运行，启动服务

```bash
# SSH 到服务器
ssh root@123.56.17.118

# 进入项目目录
cd /root/apps/life-design-backend

# 启动服务
pm2 start ecosystem.config.js
# 或
pm2 start src/app.js --name life-design-backend

# 查看状态
pm2 list
pm2 logs life-design-backend
```

---

## 常见问题

### 问题 1：服务未启动

**症状：** 无法访问任何接口

**解决：**
```bash
pm2 start life-design-backend
# 或
cd /root/apps/life-design-backend
pm2 start ecosystem.config.js
```

### 问题 2：服务崩溃

**症状：** 服务启动后立即停止

**解决：**
```bash
# 查看错误日志
pm2 logs life-design-backend --err

# 检查代码错误
cd /root/apps/life-design-backend
node src/app.js
```

### 问题 3：端口被占用

**症状：** 启动失败，提示端口被占用

**解决：**
```bash
# 查看占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或修改端口
# 在 .env 文件中设置 PORT=3001
```

---

## 一键检查脚本

```bash
# 在服务器上执行
ssh root@123.56.17.118 << 'EOF'
echo "=== PM2 服务状态 ==="
pm2 list
echo ""
echo "=== 端口监听 ==="
netstat -tlnp | grep 3000 || echo "端口 3000 未监听"
echo ""
echo "=== 测试 API ==="
curl -s http://localhost:3000/api/affirmations | head -c 100
echo ""
echo "=== 服务日志（最后10行）==="
pm2 logs life-design-backend --lines 10 --nostream
EOF
```



