# 消息系统快速入门

## 🚀 30秒快速配置

### 1️⃣ 创建 KV 命名空间

```bash
npx wrangler kv:namespace create "ONLINE_STATUS"
npx wrangler kv:namespace create "ONLINE_STATUS" --preview
```

### 2️⃣ 更新配置

复制输出的 ID 到 `wrangler.jsonc`：

```jsonc
"kv_namespaces": [
  {
    "binding": "ONLINE_STATUS",
    "id": "你的生产环境ID",
    "preview_id": "你的预览环境ID"
  }
]
```

### 3️⃣ 运行迁移

```bash
npx wrangler d1 execute studybuddyplatformdb --remote --file=./migrations/0004_add_messages_table.sql
```

### 4️⃣ 部署

```bash
npm run deploy
```

## ✅ 验证

访问 OpenAPI 文档，应该能看到新的 "Messages" 标签：
```
https://your-worker.workers.dev/
```

## 📖 完整文档

详细使用说明请查看：
- [API 使用文档](./MESSAGING_SYSTEM.md)
- [部署详细指南](./MESSAGING_DEPLOYMENT.md)

## 🧪 快速测试

### 发送第一条消息

```bash
# 1. 注册并登录获取 token
curl -X POST "https://your-worker.workers.dev/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"123456"}'

# 2. 发送私聊消息
curl -X POST "https://your-worker.workers.dev/messages/user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiver_id":2,"content":"Hello!"}'

# 3. 查看消息历史
curl "https://your-worker.workers.dev/messages/user/2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 测试 WebSocket

浏览器控制台：

```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/ws');
ws.onopen = () => ws.send(JSON.stringify({type:'auth',token:'YOUR_TOKEN'}));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 🎯 核心功能

- ✅ **私聊**: 1对1 实时聊天
- ✅ **群聊**: 学习小组群聊
- ✅ **在线状态**: 实时显示用户在线/离线
- ✅ **消息历史**: 持久化存储，支持分页
- ✅ **WebSocket**: 低延迟实时通信

## 📊 API 端点总览

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/messages/user/:peerId` | 获取私聊历史 |
| GET | `/messages/group/:groupId` | 获取群聊历史 |
| POST | `/messages/user` | 发送私聊消息 |
| POST | `/messages/group` | 发送群聊消息 |
| GET | `/messages/online?user_ids=1,2,3` | 查询在线状态 |
| WS | `/ws` | WebSocket 实时通信 |

## 💡 常见问题

**Q: KV 命名空间 ID 在哪里？**  
A: 运行 `wrangler kv:namespace create` 后会显示

**Q: 如何测试本地开发？**  
A: 运行 `npm run dev`，然后访问 `http://localhost:8787`

**Q: WebSocket 连接失败？**  
A: 确保使用 `wss://` 协议，并在连接后立即发送认证消息

**Q: 消息没有实时送达？**  
A: 检查接收者是否在线并有活跃的 WebSocket 连接

## 🛠️ 技术栈

- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **实时通信**: WebSocket
- **认证**: JWT
- **框架**: Hono + Chanfana

## 📈 下一步

1. 集成前端 WebSocket 客户端
2. 添加消息通知系统
3. 实现已读/未读状态
4. 添加富媒体消息支持（图片、文件）

---

**需要帮助？** 查看完整文档或提交 Issue
