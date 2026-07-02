#!/bin/bash
# 修复 /admin 路由的脚本

echo "🔧 开始修复 /admin 路由问题..."
echo ""

# 1. 检查文件是否存在
echo "=== 1. 检查文件 ==="
if ssh root@123.56.17.118 "test -f /root/apps/life-design-backend/public/admin/index.html"; then
    echo "✅ index.html 文件存在"
else
    echo "❌ index.html 文件不存在，开始上传..."
    cd /Users/mac/Desktop/life-design-admin
    scp -r dist/* root@123.56.17.118:/root/apps/life-design-backend/public/admin/
    echo "✅ 文件上传完成"
fi

echo ""
echo "=== 2. 检查后端配置 ==="
echo "请确保后端 src/app.js 包含以下配置："
echo ""
cat << 'EOF'
const path = require('path');

// ===== 静态文件托管（必须在错误处理之前）=====
app.use(express.static("public"));

// 托管后台管理页面
app.use("/admin", express.static(path.join(__dirname, "../public/admin"), {
  index: 'index.html',
  fallthrough: false
}));

// React Router 回退路由
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// ===== API 路由 =====
app.use("/api/affirmations", require("./routes/affirmations"));

// ===== 错误处理（必须在最后）=====
app.use((req, res) => {
  res.status(404).json({ error: "页面不存在" });
});
EOF

echo ""
echo "=== 3. 重启服务 ==="
read -p "是否现在重启服务？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh root@123.56.17.118 "pm2 restart life-design-backend"
    echo "✅ 服务已重启"
    echo ""
    echo "等待 3 秒后测试..."
    sleep 3
    echo ""
    echo "=== 4. 测试访问 ==="
    curl -s http://123.56.17.118:3000/admin | head -20
fi

echo ""
echo "✅ 修复完成！"
echo "访问：http://123.56.17.118:3000/admin"



