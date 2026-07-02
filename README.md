# 肯定语后台管理系统

一个基于 React + TypeScript + Vite 的现代化后台管理前端项目，用于管理肯定语（Affirmations）的增删改查操作。

## 功能特性

- ✅ 肯定语列表展示
- ✅ 新建肯定语（支持文本和音频上传）
- ✅ 编辑肯定语
- ✅ 删除肯定语
- ✅ 响应式设计，现代化 UI

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Axios** - HTTP 请求

## 项目结构

```
life-design-admin/
├── src/
│   ├── pages/
│   │   ├── AffirmationsList.tsx    # 列表页
│   │   ├── CreateAffirmation.tsx   # 新建页
│   │   └── EditAffirmation.tsx     # 编辑页
│   ├── api/
│   │   └── affirmations.ts         # API 调用
│   ├── App.tsx                      # 主应用组件
│   └── main.tsx                     # 入口文件
├── index.html
├── package.json
└── vite.config.ts
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## API 配置

项目默认配置了代理，将 `/api` 请求代理到后端服务器 `http://123.56.17.118:3000`。

如需修改后端地址，请编辑 `vite.config.ts` 中的 `proxy` 配置：

```typescript
proxy: {
  '/api': {
    target: 'http://your-backend-url:port',
    changeOrigin: true,
  }
}
```

## API 接口说明

项目使用以下 API 接口：

- `GET /api/affirmations` - 获取所有肯定语
- `GET /api/affirmations/:id` - 获取单个肯定语
- `POST /api/affirmations` - 创建肯定语
- `PUT /api/affirmations/:id` - 更新肯定语
- `DELETE /api/affirmations/:id` - 删除肯定语
- `POST /api/affirmations/upload-audio` - 上传音频文件

## 使用说明

1. **查看列表**：访问首页 `/` 查看所有肯定语
2. **新建肯定语**：点击"新增肯定语"按钮，填写文本内容（必填），标题可选（不填写则使用文本前50字符），可选择上传音频文件
3. **编辑肯定语**：在列表页点击"编辑"按钮，修改信息后保存
4. **删除肯定语**：在列表页点击"删除"按钮，确认后删除

## 特性说明

- **标题可选**：创建和编辑时，标题字段是可选的。如果不填写，后端会自动使用文本内容的前50字符作为标题
- **音频可选**：音频文件是可选的，可以只创建文本内容
- **自动适配**：前端已完全适配后端 API，包括字段可选性和空值处理

## 开发

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

## 许可证

MIT

