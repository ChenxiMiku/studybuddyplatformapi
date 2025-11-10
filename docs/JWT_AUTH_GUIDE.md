# JWT 认证系统文档

## 📋 概述

Study Buddy Platform API 现在使用行业标准的 **JWT (JSON Web Token)** 认证系统，配合 **bcrypt** 密码哈希，提供安全可靠的用户认证机制。

## 🔐 安全特性

### 1. **密码哈希 - bcrypt**
- 使用 bcrypt (salt rounds: 10) 对密码进行单向加密
- 不可逆的哈希算法，即使数据库泄露也无法恢复原始密码
- 每个密码都有独特的 salt，防止彩虹表攻击

### 2. **双 Token 机制**
- **Access Token** (访问令牌)
  - 短期有效 (默认 15 分钟)
  - 用于所有 API 请求的身份验证
  - 存储在客户端内存中，不建议持久化

- **Refresh Token** (刷新令牌)
  - 长期有效 (默认 7 天)
  - 仅用于获取新的 access token
  - 可安全存储在 HttpOnly Cookie 或 localStorage

### 3. **Token 结构**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "type": "access" | "refresh",
  "iat": 1699999999,  // 签发时间
  "exp": 1700000899   // 过期时间
}
```

## 🚀 API 端点

### 1. 用户注册 `POST /auth/register`

**请求体：**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "goals": "Learn programming",
  "study_preference": "group"
}
```

**响应：**
```json
{
  "success": true,
  "result": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "goals": "Learn programming",
      "study_preference": "group",
      "created_at": "2025-01-09T12:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900  // 秒
    }
  }
}
```

### 2. 用户登录 `POST /auth/login`

**请求体：**
```json
{
  "username_or_email": "john@example.com",
  "password": "securePassword123"
}
```

**响应：** (同注册响应)

### 3. 刷新令牌 `POST /auth/refresh`

**请求体：**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应：**
```json
{
  "success": true,
  "result": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

### 4. 修改密码 `POST /users/{id}/change-password`

**请求头：**
```
Authorization: Bearer <accessToken>
```

**请求体：**
```json
{
  "old_password": "securePassword123",
  "new_password": "newSecurePassword456"
}
```

**响应：**
```json
{
  "success": true,
  "result": {
    "message": "Password changed successfully"
  }
}
```

## 💻 客户端集成示例

### JavaScript/TypeScript

```typescript
class AuthService {
  private baseURL = 'https://studybuddyplatformapi.15098646873.workers.dev';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // 注册
  async register(username: string, email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.result.tokens.accessToken;
      this.refreshToken = data.result.tokens.refreshToken;
      localStorage.setItem('refreshToken', this.refreshToken);
      return data.result.user;
    }
    throw new Error(data.errors[0].message);
  }

  // 登录
  async login(usernameOrEmail: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username_or_email: usernameOrEmail, 
        password 
      })
    });
    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.result.tokens.accessToken;
      this.refreshToken = data.result.tokens.refreshToken;
      localStorage.setItem('refreshToken', this.refreshToken);
      return data.result.user;
    }
    throw new Error(data.errors[0].message);
  }

  // 刷新 Token
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.result.tokens.accessToken;
      this.refreshToken = data.result.tokens.refreshToken;
      localStorage.setItem('refreshToken', this.refreshToken);
      return true;
    }
    
    // Refresh token 过期，需要重新登录
    this.logout();
    return false;
  }

  // 携带 Token 的 API 请求
  async apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    let response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    // 如果 access token 过期，自动刷新
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // 重试原请求
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers
        });
      }
    }

    return response.json();
  }

  // 登出
  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
  }
}

// 使用示例
const auth = new AuthService();

// 注册
await auth.register('john_doe', 'john@example.com', 'password123');

// 登录
await auth.login('john@example.com', 'password123');

// 获取用户资料 (自动处理 token 刷新)
const profile = await auth.apiRequest('/users/1/profile');

// 登出
auth.logout();
```

### Python 示例

```python
import requests
from datetime import datetime, timedelta

class AuthService:
    def __init__(self, base_url):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.token_expires_at = None

    def register(self, username, email, password):
        response = requests.post(
            f'{self.base_url}/auth/register',
            json={'username': username, 'email': email, 'password': password}
        )
        data = response.json()
        
        if data['success']:
            self._save_tokens(data['result']['tokens'])
            return data['result']['user']
        raise Exception(data['errors'][0]['message'])

    def login(self, username_or_email, password):
        response = requests.post(
            f'{self.base_url}/auth/login',
            json={'username_or_email': username_or_email, 'password': password}
        )
        data = response.json()
        
        if data['success']:
            self._save_tokens(data['result']['tokens'])
            return data['result']['user']
        raise Exception(data['errors'][0]['message'])

    def refresh_access_token(self):
        if not self.refresh_token:
            raise Exception('No refresh token available')
        
        response = requests.post(
            f'{self.base_url}/auth/refresh',
            json={'refreshToken': self.refresh_token}
        )
        data = response.json()
        
        if data['success']:
            self._save_tokens(data['result']['tokens'])
            return True
        return False

    def api_request(self, endpoint, method='GET', **kwargs):
        # 检查 token 是否即将过期
        if self.token_expires_at and datetime.now() >= self.token_expires_at:
            self.refresh_access_token()

        headers = kwargs.get('headers', {})
        headers['Authorization'] = f'Bearer {self.access_token}'
        kwargs['headers'] = headers

        response = requests.request(
            method, 
            f'{self.base_url}{endpoint}',
            **kwargs
        )

        # 如果 401，尝试刷新
        if response.status_code == 401:
            if self.refresh_access_token():
                headers['Authorization'] = f'Bearer {self.access_token}'
                response = requests.request(
                    method, 
                    f'{self.base_url}{endpoint}',
                    **kwargs
                )

        return response.json()

    def _save_tokens(self, tokens):
        self.access_token = tokens['accessToken']
        self.refresh_token = tokens['refreshToken']
        self.token_expires_at = datetime.now() + timedelta(seconds=tokens['expiresIn'] - 60)

# 使用示例
auth = AuthService('https://studybuddyplatformapi.15098646873.workers.dev')

# 登录
user = auth.login('john@example.com', 'password123')

# 获取用户资料
profile = auth.api_request('/users/1/profile')
```

## 🔧 环境配置

### 生产环境安全设置

**重要：** 在生产环境中，必须修改 `wrangler.jsonc` 中的 JWT_SECRET：

```jsonc
{
  "vars": {
    "JWT_SECRET": "使用至少32字符的强随机密钥！",
    "JWT_ACCESS_EXPIRATION": "15m",  // 可调整
    "JWT_REFRESH_EXPIRATION": "7d"   // 可调整
  }
}
```

**生成安全的 JWT_SECRET：**

```bash
# Linux/macOS
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 过期时间格式

支持的时间格式：
- `s` - 秒 (例如: `60s` = 60秒)
- `m` - 分钟 (例如: `15m` = 15分钟)
- `h` - 小时 (例如: `24h` = 24小时)
- `d` - 天 (例如: `7d` = 7天)

## 📝 最佳实践

### 1. Token 存储
- ✅ **推荐**: Access Token 存储在内存 (变量)
- ✅ **推荐**: Refresh Token 存储在 HttpOnly Cookie 或 localStorage
- ❌ **不推荐**: Access Token 存储在 localStorage (XSS 风险)

### 2. Token 刷新策略
- 在 access token 过期前 1-2 分钟主动刷新
- API 返回 401 时自动刷新并重试
- Refresh token 过期后强制用户重新登录

### 3. 安全建议
- 使用 HTTPS
- 定期更换 JWT_SECRET
- 实施 rate limiting
- 记录可疑的认证失败
- 添加 IP 白名单(如需要)

## 🐛 错误代码

| 错误码 | 描述 |
|-------|------|
| 4001 | 用户名或邮箱已存在 |
| 4010 | 缺少 Authorization token |
| 4011 | Token 无效或已过期 |
| 4012 | 用户名/密码错误 |
| 4013 | 当前密码不正确 |
| 4014 | Refresh token 无效或已过期 |
| 4015 | 用户不存在 |
| 5001 | 服务器内部错误 |

## 📚 相关文件

- `/src/utils/jwt.ts` - JWT 工具函数
- `/src/utils/password.ts` - 密码哈希工具
- `/src/middlewares/auth.ts` - 认证中间件
- `/src/endpoints/users/userRegister.ts` - 注册端点
- `/src/endpoints/users/userLogin.ts` - 登录端点
- `/src/endpoints/users/tokenRefresh.ts` - 刷新端点
- `/src/endpoints/users/userChangePassword.ts` - 修改密码端点

## 🎉 总结

新的 JWT 认证系统提供：
- ✅ 行业标准的安全性 (bcrypt + JWT)
- ✅ 双 Token 机制，平衡安全与用户体验
- ✅ 自动 Token 刷新，无缝用户体验
- ✅ 易于集成的 RESTful API
- ✅ 完整的错误处理

现在你的 API 已经具备生产级的认证系统！🚀
