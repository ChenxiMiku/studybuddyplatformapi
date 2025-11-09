# 部署实时消息系统指南

本文档介绍如何部署实时消息系统所需的基础设施。

## 步骤 1: 创建 KV 命名空间

### 为生产环境创建 KV 命名空间

```bash
npx wrangler kv:namespace create "ONLINE_STATUS"
```

执行后会输出类似以下内容：
```
🌀 Creating namespace with title "studybuddyplatformapi-ONLINE_STATUS"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "ONLINE_STATUS", id = "abc123..." }
```

### 为预览环境创建 KV 命名空间

```bash
npx wrangler kv:namespace create "ONLINE_STATUS" --preview
```

执行后会输出类似以下内容：
```
🌀 Creating namespace with title "studybuddyplatformapi-ONLINE_STATUS_preview"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "ONLINE_STATUS", preview_id = "def456..." }
```

## 步骤 2: 更新 wrangler.jsonc

将输出的 ID 更新到 `wrangler.jsonc` 文件中：

```jsonc
{
  // ... 其他配置
  "kv_namespaces": [
    {
      "binding": "ONLINE_STATUS",
      "id": "abc123...",  // 替换为实际的生产环境 ID
      "preview_id": "def456..."  // 替换为实际的预览环境 ID
    }
  ],
  // ... 其他配置
}
```

## 步骤 3: 运行数据库迁移

### 本地开发环境

```bash
npx wrangler d1 execute studybuddyplatformdb --local --file=./migrations/0004_add_messages_table.sql
```

### 生产环境

```bash
npx wrangler d1 execute studybuddyplatformdb --remote --file=./migrations/0004_add_messages_table.sql
```

## 步骤 4: 部署应用

```bash
npm run deploy
```

## 步骤 5: 测试消息系统

### 测试 REST API

使用提供的测试脚本或 Postman/curl 测试以下端点：

1. **发送私聊消息**:
```bash
curl -X POST https://your-worker.workers.dev/messages/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id": 2, "content": "Hello!"}'
```

2. **获取私聊历史**:
```bash
curl https://your-worker.workers.dev/messages/user/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **查询在线状态**:
```bash
curl "https://your-worker.workers.dev/messages/online?user_ids=1,2,3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 测试 WebSocket

在浏览器控制台中测试：

```javascript
// 连接 WebSocket
const ws = new WebSocket('wss://your-worker.workers.dev/ws');

ws.onopen = () => {
  console.log('已连接');
  
  // 认证
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_JWT_TOKEN'
  }));
};

ws.onmessage = (event) => {
  console.log('收到消息:', JSON.parse(event.data));
};

// 认证成功后，发送消息
ws.send(JSON.stringify({
  type: 'private',
  to: 2,
  content: 'Hello via WebSocket!'
}));
```

## 验证清单

- [ ] KV 命名空间已创建并正确配置
- [ ] 数据库迁移已成功执行
- [ ] 应用已部署
- [ ] REST API 端点正常工作
- [ ] WebSocket 连接正常
- [ ] 在线状态正确显示
- [ ] 消息能够成功发送和接收

## 常见问题

### Q: KV 命名空间创建失败
A: 确保已登录 Cloudflare 账户：`npx wrangler login`

### Q: 数据库迁移失败
A: 检查 `wrangler.jsonc` 中的数据库配置是否正确，确保数据库已创建。

### Q: WebSocket 连接失败
A: 
- 检查 JWT token 是否有效
- 确认使用的是 `wss://` 协议（生产环境）或 `ws://` （本地开发）
- 查看浏览器控制台的错误信息

### Q: 消息发送失败
A:
- 确认用户已通过 WebSocket 认证
- 检查接收者 ID 是否存在
- 对于群聊，确认用户是群组成员

## 监控与维护

### 查看 KV 存储的内容

```bash
# 列出所有键
npx wrangler kv:key list --binding=ONLINE_STATUS

# 获取特定键的值
npx wrangler kv:key get "online:user:1" --binding=ONLINE_STATUS
```

### 清理过期的在线状态

KV 键会在 5 分钟后自动过期，无需手动清理。

### 查看消息统计

```bash
# 连接到数据库
npx wrangler d1 execute studybuddyplatformdb --command "SELECT COUNT(*) as total_messages FROM messages"

# 查看最近的消息
npx wrangler d1 execute studybuddyplatformdb --command "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10"
```

## 性能优化建议

1. **批量查询在线状态**: 前端应该批量查询多个用户的在线状态，而不是逐个查询
2. **WebSocket 重连**: 实现指数退避的重连策略
3. **消息缓存**: 在前端缓存最近的消息，减少 API 调用
4. **分页加载**: 消息历史使用分页加载，每页 20-50 条
5. **压缩**: 考虑对消息内容进行压缩以减少传输数据量

## 安全建议

1. **速率限制**: 添加每用户每分钟最多发送 X 条消息的限制
2. **内容过滤**: 添加敏感词过滤和垃圾消息检测
3. **消息大小**: 限制单条消息的最大长度（目前为 5000 字符）
4. **审计日志**: 记录所有消息发送操作用于审计

## 扩展功能

准备好后，可以考虑添加以下功能：

- 消息已读/未读状态
- 消息撤回
- 消息编辑
- 文件和图片分享
- 表情包支持
- @提醒功能
- 消息转发
- 消息置顶
