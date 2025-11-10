# 实时消息系统文档

## 概述

Study Buddy Platform 的实时消息系统支持私聊和群聊功能，使用 WebSocket 实现实时通信，并通过 Cloudflare KV 存储用户在线状态。

## 功能特性

- ✅ **私聊**: 用户之间一对一的实时消息
- ✅ **群聊**: 学习小组内的群组消息
- ✅ **在线状态**: 实时显示用户是否在线
- ✅ **消息历史**: 查询历史聊天记录
- ✅ **消息持久化**: 所有消息保存到数据库

## API 端点

### 1. 获取私聊历史

```
GET /messages/user/:peerId
```

**权限**: 需要 JWT 认证

**参数**:
- `peerId` (路径参数): 对方用户的 ID
- `limit` (查询参数, 可选): 返回的最大消息数，默认 50
- `offset` (查询参数, 可选): 跳过的消息数，默认 0

**响应示例**:
```json
{
  "success": true,
  "result": {
    "messages": [
      {
        "id": 1,
        "sender_id": 2,
        "receiver_id": 1,
        "content": "你好！",
        "created_at": "2025-11-10T10:30:00Z",
        "sender_username": "alice",
        "is_online": true
      }
    ],
    "peer": {
      "id": 2,
      "username": "alice",
      "email": "alice@example.com",
      "is_online": true
    },
    "total": 15
  }
}
```

### 2. 获取群聊历史

```
GET /messages/group/:groupId
```

**权限**: 需要 JWT 认证，且用户必须是群组成员

**参数**:
- `groupId` (路径参数): 群组 ID
- `limit` (查询参数, 可选): 返回的最大消息数，默认 50
- `offset` (查询参数, 可选): 跳过的消息数，默认 0

**响应示例**:
```json
{
  "success": true,
  "result": {
    "messages": [
      {
        "id": 10,
        "sender_id": 3,
        "group_id": 1,
        "content": "大家好！",
        "created_at": "2025-11-10T11:00:00Z",
        "sender_username": "bob",
        "is_online": false
      }
    ],
    "group": {
      "id": 1,
      "name": "数学学习小组",
      "description": "一起学习高等数学",
      "member_count": 5
    },
    "total": 42
  }
}
```

### 3. 发送私聊消息

```
POST /messages/user
```

**权限**: 需要 JWT 认证

**请求体**:
```json
{
  "receiver_id": 2,
  "content": "你好，我们一起学习吧！"
}
```

**响应示例**:
```json
{
  "success": true,
  "result": {
    "message": {
      "id": 20,
      "sender_id": 1,
      "receiver_id": 2,
      "content": "你好，我们一起学习吧！",
      "created_at": "2025-11-10T12:00:00Z"
    }
  }
}
```

### 4. 发送群聊消息

```
POST /messages/group
```

**权限**: 需要 JWT 认证，且用户必须是群组成员

**请求体**:
```json
{
  "group_id": 1,
  "content": "今天我们学习微积分！"
}
```

**响应示例**:
```json
{
  "success": true,
  "result": {
    "message": {
      "id": 30,
      "sender_id": 1,
      "group_id": 1,
      "content": "今天我们学习微积分！",
      "created_at": "2025-11-10T13:00:00Z"
    }
  }
}
```

### 5. 查询用户在线状态

```
GET /messages/online?user_ids=1,2,3
```

**权限**: 需要 JWT 认证

**参数**:
- `user_ids` (查询参数): 逗号分隔的用户 ID 列表

**响应示例**:
```json
{
  "success": true,
  "result": {
    "online_users": {
      "1": true,
      "2": false,
      "3": true
    }
  }
}
```

## WebSocket 实时通信

### 连接到 WebSocket

```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/ws');

ws.onopen = () => {
  console.log('WebSocket 已连接');
  
  // 发送认证消息
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};
```

### WebSocket 消息类型

#### 1. 认证 (必须首先发送)

```javascript
{
  "type": "auth",
  "token": "your-jwt-access-token"
}
```

**响应**:
```javascript
{
  "type": "authenticated",
  "userId": 1
}
```

#### 2. 心跳 (保持连接活跃)

建议每 60 秒发送一次心跳，以保持在线状态并防止连接超时。

```javascript
{
  "type": "heartbeat"
}
```

**响应**:
```javascript
{
  "type": "heartbeat_ack"
}
```

#### 3. 发送私聊消息

```javascript
{
  "type": "private",
  "to": 2,  // 接收者的用户 ID
  "content": "你好！"
}
```

**响应**:
```javascript
{
  "type": "message_sent",
  "message": {
    "id": 50,
    "sender_id": 1,
    "receiver_id": 2,
    "content": "你好！",
    "created_at": "2025-11-10T14:00:00Z"
  }
}
```

#### 4. 发送群聊消息

```javascript
{
  "type": "group",
  "to": 1,  // 群组 ID
  "content": "大家好！"
}
```

**响应**:
```javascript
{
  "type": "message_sent",
  "message": {
    "id": 60,
    "sender_id": 1,
    "group_id": 1,
    "content": "大家好！",
    "created_at": "2025-11-10T14:30:00Z"
  }
}
```

#### 5. 接收新消息

当有新的私聊消息时：
```javascript
{
  "type": "new_message",
  "message": {
    "id": 70,
    "sender_id": 2,
    "receiver_id": 1,
    "content": "收到！",
    "created_at": "2025-11-10T15:00:00Z",
    "sender_username": "alice"
  }
}
```

当有新的群聊消息时：
```javascript
{
  "type": "new_group_message",
  "message": {
    "id": 80,
    "sender_id": 3,
    "group_id": 1,
    "content": "我也来了！",
    "created_at": "2025-11-10T15:30:00Z",
    "sender_username": "bob"
  }
}
```

## 前端集成示例

### 完整的 WebSocket 客户端

```javascript
class MessageClient {
  constructor(wsUrl, token) {
    this.wsUrl = wsUrl;
    this.token = token;
    this.ws = null;
    this.authenticated = false;
    this.heartbeatInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageHandlers = [];
  }

  connect() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立');
      this.reconnectAttempts = 0;
      
      // 发送认证
      this.send({ type: 'auth', token: this.token });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'authenticated') {
        this.authenticated = true;
        console.log('认证成功, User ID:', data.userId);
        
        // 开始心跳
        this.startHeartbeat();
      } else if (data.type === 'new_message' || data.type === 'new_group_message') {
        // 触发消息处理器
        this.messageHandlers.forEach(handler => handler(data.message));
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
      this.authenticated = false;
      this.stopHeartbeat();
      
      // 尝试重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  sendPrivateMessage(receiverId, content) {
    this.send({
      type: 'private',
      to: receiverId,
      content: content
    });
  }

  sendGroupMessage(groupId, content) {
    this.send({
      type: 'group',
      to: groupId,
      content: content
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, 60000); // 每 60 秒
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 使用示例
const client = new MessageClient('wss://your-worker.workers.dev/ws', 'your-jwt-token');
client.connect();

// 监听新消息
client.onMessage((message) => {
  console.log('收到新消息:', message);
  // 更新 UI
});

// 发送消息
client.sendPrivateMessage(2, '你好！');
client.sendGroupMessage(1, '大家好！');
```

## 数据库迁移

在部署前，请运行以下迁移以创建消息表：

```bash
npx wrangler d1 execute studybuddyplatformdb --remote --file=./migrations/0004_add_messages_table.sql
```

## KV 命名空间设置

在部署前，请创建 KV 命名空间：

```bash
# 创建生产环境的 KV 命名空间
npx wrangler kv:namespace create "ONLINE_STATUS"

# 创建预览环境的 KV 命名空间
npx wrangler kv:namespace create "ONLINE_STATUS" --preview
```

然后更新 `wrangler.jsonc` 中的 KV 绑定 ID：

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "ONLINE_STATUS",
      "id": "your-production-kv-id",
      "preview_id": "your-preview-kv-id"
    }
  ]
}
```

## 在线状态管理

- 用户在 WebSocket 连接时自动设置为在线
- 在线状态在 KV 中存储 5 分钟 TTL
- 通过定期发送心跳消息保持在线状态
- 用户断开连接时自动设置为离线

## 安全考虑

1. **认证**: 所有 WebSocket 连接必须先通过 JWT 认证
2. **授权**: 
   - 只能向存在的用户发送私聊消息
   - 只能向自己是成员的群组发送群聊消息
3. **消息持久化**: 所有消息都保存到数据库以防数据丢失
4. **速率限制**: 建议在生产环境中添加速率限制以防止滥用

## 性能优化

1. **KV 缓存**: 使用 Cloudflare KV 存储在线状态，减少数据库查询
2. **连接管理**: 在当前实现中，WebSocket 连接存储在内存中。对于生产环境，建议使用 Durable Objects 实现跨实例的连接管理
3. **消息分页**: 历史消息支持分页查询，避免一次加载过多数据

## 限制与未来改进

### 当前限制
- WebSocket 连接在单个 Worker 实例中管理，不支持跨实例通信
- 消息只支持文本内容

### 未来改进
- [ ] 使用 Durable Objects 实现多实例 WebSocket 支持
- [ ] 支持图片、文件等富媒体消息
- [ ] 消息已读/未读状态
- [ ] 消息撤回功能
- [ ] @提醒功能（群聊中）
- [ ] 消息搜索功能
- [ ] 推送通知集成

## 故障排查

### WebSocket 连接失败
- 检查 JWT token 是否有效
- 确认 Worker 已部署并启用 WebSocket 支持
- 检查浏览器控制台的错误信息

### 消息未送达
- 确认接收者在线（通过在线状态 API）
- 检查接收者是否有活跃的 WebSocket 连接
- 消息已保存到数据库，可通过历史记录 API 查询

### 在线状态不准确
- 确认客户端定期发送心跳消息
- KV 的 TTL 设置为 5 分钟，可能有延迟
- 刷新 KV 状态可能需要一些时间传播
