# Study Buddy 消息系统 - React 前端

这是 Study Buddy Platform 消息系统的 React 前端应用。

## 功能特性

- ✅ 用户注册和登录
- ✅ 私聊（一对一实时聊天）
- ✅ 群聊（学习小组群聊）
- ✅ 在线状态显示
- ✅ 消息历史记录
- ✅ WebSocket 实时推送
- ✅ 响应式设计

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **React Router** - 路由管理
- **WebSocket** - 实时通信

## 快速开始

### 1. 安装依赖

```bash
cd frontend-react
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# API 基础 URL（留空表示使用相同域名）
VITE_API_BASE=

# WebSocket URL
VITE_WS_URL=ws://localhost:8787/ws
```

对于生产环境：
```env
VITE_API_BASE=https://your-worker.workers.dev
VITE_WS_URL=wss://your-worker.workers.dev/ws
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 4. 构建生产版本

```bash
npm run build
```

构建结果会输出到 `dist` 目录。

## 项目结构

```
frontend-react/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatList.tsx    # 聊天列表
│   │   ├── ChatWindow.tsx  # 聊天窗口
│   │   └── UserProfile.tsx # 用户资料
│   ├── pages/              # 页面组件
│   │   ├── LoginPage.tsx   # 登录页
│   │   ├── RegisterPage.tsx # 注册页
│   │   └── ChatPage.tsx    # 聊天主页
│   ├── services/           # 服务层
│   │   ├── api.ts          # API 客户端
│   │   └── websocket.ts    # WebSocket 客户端
│   ├── stores/             # 状态管理
│   │   ├── authStore.ts    # 认证状态
│   │   └── chatStore.ts    # 聊天状态
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 核心功能说明

### 认证系统

- 支持用户注册和登录
- JWT Token 持久化存储
- 自动登录状态恢复
- 退出登录功能

### 聊天功能

#### 私聊
- 与其他用户一对一聊天
- 实时消息推送
- 查看对方在线状态
- 消息历史记录

#### 群聊
- 学习小组群聊
- 实时消息广播
- 成员列表显示
- 群组信息展示

### WebSocket 实时通信

- 自动连接和断线重连
- 心跳保持连接
- 消息实时推送
- 在线状态更新

### 状态管理

使用 Zustand 进行状态管理：

- **authStore**: 用户认证状态
- **chatStore**: 聊天列表、消息、在线状态

## 开发指南

### 添加新功能

1. 在 `src/components/` 创建新组件
2. 在 `src/services/api.ts` 添加 API 方法
3. 在对应的 store 中添加状态和操作
4. 在页面中使用新组件

### 调试

1. 打开浏览器开发者工具
2. 查看 Console 标签页的日志
3. 查看 Network 标签页的网络请求
4. WebSocket 连接状态会在 Console 中显示

### 常见问题

**Q: WebSocket 连接失败？**

A: 检查 `.env` 文件中的 `VITE_WS_URL` 配置，确保后端服务正在运行。

**Q: API 请求 CORS 错误？**

A: Vite 配置了代理，开发环境下会自动代理 API 请求。生产环境需要确保后端配置了正确的 CORS。

**Q: 登录后无法发送消息？**

A: 检查 WebSocket 是否已连接，查看 Console 日志确认认证是否成功。

## 样式定制

使用 Tailwind CSS 进行样式定制，主要颜色：

- **主色**: 蓝色 (`blue-600`)
- **辅助色**: 紫色 (`purple-500`)
- **成功色**: 绿色 (`green-500`)
- **错误色**: 红色 (`red-500`)

修改 `tailwind.config.js` 可以自定义主题。

## 部署

### 部署到 Cloudflare Pages

1. 构建项目：
```bash
npm run build
```

2. 登录 Cloudflare Pages

3. 创建新项目，连接 Git 仓库

4. 配置构建设置：
   - 构建命令: `npm run build`
   - 构建输出目录: `dist`
   - 根目录: `frontend-react`

5. 设置环境变量：
   - `VITE_API_BASE`: 后端 API URL
   - `VITE_WS_URL`: WebSocket URL

### 部署到其他平台

可以部署到任何静态网站托管服务：
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

确保配置正确的环境变量。

## 性能优化

- ✅ 代码分割（Vite 自动处理）
- ✅ 懒加载路由组件
- ✅ 消息虚拟滚动（大量消息时）
- ✅ WebSocket 连接复用
- ✅ 状态持久化（LocalStorage）

## 安全考虑

- ✅ JWT Token 安全存储
- ✅ XSS 防护（React 自动转义）
- ✅ HTTPS/WSS 加密传输
- ✅ 输入验证
- ✅ 密码强度要求

## 浏览器支持

- Chrome/Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）

需要支持 ES2020 和 WebSocket。

## 开发路线图

- [ ] 消息已读/未读状态
- [ ] 消息撤回功能
- [ ] 富文本消息
- [ ] 图片和文件发送
- [ ] 表情符号选择器
- [ ] 消息搜索
- [ ] @提醒功能
- [ ] 暗黑模式
- [ ] 多语言支持

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**需要帮助？** 查看 [API 文档](../docs/MESSAGING_SYSTEM.md) 或提交 Issue
