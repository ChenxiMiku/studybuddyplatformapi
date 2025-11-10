# 🚀 快速参考 - 前端集成

## 📋 一分钟上手

### 本地开发
```powershell
.\start-dev.ps1
# 前端: http://localhost:3000
# 后端: http://localhost:8787
```

### 部署到生产
```powershell
.\build-and-deploy.ps1
# 选择 P (生产环境)
```

## 📁 关键文件

| 文件 | 作用 |
|------|------|
| `wrangler.jsonc` | Workers 配置，包含 assets 绑定 |
| `frontend-react/dist/` | 前端构建输出（被 Workers 服务） |
| `frontend-react/vite.config.ts` | Vite 构建配置 |
| `src/index.ts` | Workers 入口，包含路由 |
| `build-and-deploy.ps1` | 一键部署脚本 |
| `start-dev.ps1` | 本地开发脚本 |

## 🔌 重要端点

| 路径 | 说明 |
|------|------|
| `/` | React 应用首页 |
| `/chat` | 聊天界面（需登录） |
| `/auth/login` | 登录 API |
| `/auth/register` | 注册 API |
| `/messages/*` | 消息 API |
| `/ws` | WebSocket 连接 |
| `/docs` | API 文档 |
| `/playground` | 测试页面 |

## 🛠️ 常用命令

### 开发
```powershell
# 启动开发服务器
.\start-dev.ps1

# 只启动后端
npx wrangler dev

# 只启动前端
cd frontend-react; npm run dev
```

### 构建
```powershell
# 构建前端
cd frontend-react
npm run build
cd ..

# 查看构建产物
ls frontend-react/dist
```

### 部署
```powershell
# 完整部署流程
.\build-and-deploy.ps1

# 仅部署（不重新构建）
npx wrangler deploy

# 部署到开发环境
npx wrangler deploy --env dev
```

### 调试
```powershell
# 查看实时日志
npx wrangler tail

# 查看错误日志
npx wrangler tail --status error

# 查看 D1 数据库
npx wrangler d1 execute studybuddyplatformdb --command "SELECT * FROM users LIMIT 10"

# 查看 KV 存储
npx wrangler kv:key list --binding=ONLINE_STATUS
```

## 🔧 故障排查

### 问题：前端构建失败
```powershell
cd frontend-react
rm -rf node_modules
npm install
npm run build
```

### 问题：端口被占用
```powershell
# 检查端口占用
Get-NetTCPConnection -LocalPort 8787
Get-NetTCPConnection -LocalPort 3000

# 杀死进程
Stop-Process -Id <进程ID> -Force
```

### 问题：WebSocket 连接失败
- 开发环境：确保后端运行在 8787 端口
- 生产环境：确保使用 HTTPS (wss://)
- 检查 JWT token 是否有效

### 问题：API 请求 404
- 检查路由配置在 `src/index.ts`
- 确认 API 路径以 `/` 开头
- 开发环境检查 Vite 代理配置

## 📊 架构简图

```
开发环境:
浏览器 → Vite(3000) → [代理] → Workers(8787) → D1 + KV

生产环境:
浏览器 → Workers → {
  / → React App (Assets)
  /auth/* → API
  /ws → WebSocket
} → D1 + KV
```

## 🎯 关键概念

### 1. 同源部署
前端和后端在同一域名，无需 CORS

### 2. 静态资源服务
Workers 自动服务 `frontend-react/dist` 中的文件

### 3. SPA 路由
所有未匹配的路径返回 `index.html`，由前端路由处理

### 4. 环境检测
- 开发环境：通过 Vite 代理访问 API
- 生产环境：直接访问同域 API

## 📚 完整文档

- [详细集成指南](FRONTEND_INTEGRATION.md)
- [集成完成总结](FRONTEND_INTEGRATION_SUMMARY.md)
- [消息系统文档](MESSAGING_SYSTEM.md)
- [API 使用文档](API_USAGE_ZH.md)

## ✅ 部署检查清单

- [ ] `npm install` 已执行
- [ ] `cd frontend-react && npm install` 已执行
- [ ] D1 数据库已创建并迁移
- [ ] KV 命名空间已创建
- [ ] JWT_SECRET 已更新
- [ ] 前端构建成功 (`dist/` 存在)
- [ ] 本地测试通过
- [ ] 准备部署！

## 🆘 获取帮助

```powershell
# Wrangler 帮助
npx wrangler --help
npx wrangler deploy --help

# 查看 Workers 状态
npx wrangler whoami
npx wrangler deployments list

# 查看绑定
npx wrangler d1 list
npx wrangler kv:namespace list
```
