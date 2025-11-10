# API 概览 - 学习伙伴平台

## 📋 目录

- [简介](#简介)
- [基础 URL](#基础-url)
- [身份认证](#身份认证)
- [API 端点](#api-端点)
- [错误处理](#错误处理)
- [速率限制](#速率限制)

## 🌐 简介

学习伙伴平台 API 是基于 Cloudflare Workers 构建的 RESTful API，为寻找学习伙伴的学生提供智能匹配服务。API 特性包括：

- **基于 JWT 的认证**：安全的令牌认证机制
- **智能匹配算法**：多维度兼容性评分
- **实时数据**：由 Cloudflare D1 分布式数据库驱动
- **OpenAPI 3.0**：交互式 API 文档和 Swagger UI

## 🔗 基础 URL

```
生产环境：  https://studybuddyplatformapi.15098646873.workers.dev
开发环境：  https://dev.studybuddyplatformapi.mikufans.me
```

## 🔐 身份认证

大多数端点需要 JWT 认证。在 Authorization 请求头中包含访问令牌：

```http
Authorization: Bearer <your_access_token>
```

### 认证端点

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/auth/register` | 注册新用户 |
| POST | `/auth/login` | 登录并接收 JWT 令牌 |
| POST | `/auth/refresh` | 使用刷新令牌更新访问令牌 |

## 📍 API 端点

### 认证

#### 注册用户
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "goals": "学习编程",
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
      "goals": "学习编程",
      "study_preference": "group",
      "created_at": "2025-01-09T12:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": 900
    }
  }
}
```

#### 登录
```http
POST /auth/login
Content-Type: application/json

{
  "username_or_email": "john@example.com",
  "password": "password123"
}
```

#### 刷新令牌
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

### 用户

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|----------|
| GET | `/users` | 列出所有用户（分页） | ❌ |
| POST | `/users` | 创建用户（管理员） | ❌ |
| GET | `/users/{id}` | 根据 ID 获取用户 | ❌ |
| PUT | `/users/{id}` | 更新用户 | ❌ |
| DELETE | `/users/{id}` | 删除用户 | ❌ |
| GET | `/users/{id}/profile` | 获取完整用户资料 | ❌ |
| POST | `/users/{id}/change-password` | 修改用户密码 | ✅ |

#### 获取用户资料
```http
GET /users/1/profile
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
      "goals": "学习编程",
      "study_preference": "group"
    },
    "courses": [
      {
        "id": 1,
        "course_name": "计算机科学 101",
        "created_at": "2025-01-09T12:00:00Z"
      }
    ],
    "skills": [
      {
        "id": 1,
        "skill_name": "Python",
        "proficiency_level": "intermediate"
      }
    ],
    "availability": [
      {
        "id": 1,
        "weekday": 1,
        "time_slot": "14:00-16:00"
      }
    ]
  }
}
```

### 课程

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/courses` | 列出所有课程 |
| POST | `/courses` | 添加新课程 |
| GET | `/courses/{id}` | 根据 ID 获取课程 |
| PUT | `/courses/{id}` | 更新课程 |
| DELETE | `/courses/{id}` | 删除课程 |

#### 创建课程
```http
POST /courses
Content-Type: application/json

{
  "user_id": 1,
  "course_name": "计算机科学 101"
}
```

### 技能

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/skills` | 列出所有技能 |
| POST | `/skills` | 添加新技能（管理员） |
| GET | `/skills/{id}` | 根据 ID 获取技能 |
| PUT | `/skills/{id}` | 更新技能 |
| DELETE | `/skills/{id}` | 删除技能 |

### 用户技能

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/user-skills` | 列出用户-技能关联 |
| POST | `/user-skills` | 为用户添加技能 |
| GET | `/user-skills/{id}` | 根据 ID 获取用户技能 |
| PUT | `/user-skills/{id}` | 更新技能熟练度 |
| DELETE | `/user-skills/{id}` | 从用户移除技能 |

#### 为用户添加技能
```http
POST /user-skills
Content-Type: application/json

{
  "user_id": 1,
  "skill_id": 5,
  "proficiency_level": "intermediate"
}
```

**熟练度等级：**
- `beginner` - 初学者
- `intermediate` - 中级
- `advanced` - 高级

### 可用时间

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/availability` | 列出可用时间段 |
| POST | `/availability` | 添加可用时间 |
| GET | `/availability/{id}` | 根据 ID 获取可用时间 |
| PUT | `/availability/{id}` | 更新可用时间 |
| DELETE | `/availability/{id}` | 删除可用时间 |

#### 添加可用时间
```http
POST /availability
Content-Type: application/json

{
  "user_id": 1,
  "weekday": 1,
  "time_slot": "14:00-16:00"
}
```

**星期值：**
- `0` = 星期日
- `1` = 星期一
- `2` = 星期二
- `3` = 星期三
- `4` = 星期四
- `5` = 星期五
- `6` = 星期六

### 搜索与匹配

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/search/match` | 基础搜索（带过滤器） |
| GET | `/search/smart` | 智能匹配算法 |

#### 智能匹配搜索
```http
GET /search/smart?user_id=1&min_score=10&limit=10
```

**查询参数：**
- `user_id`（必需）：要寻找匹配对象的用户 ID
- `min_score`（可选）：最小兼容性分数（默认：10）
- `limit`（可选）：最大结果数量（默认：10）

**响应：**
```json
{
  "success": true,
  "result": {
    "matches": [
      {
        "user": {
          "id": 2,
          "username": "jane_smith",
          "email": "jane@example.com"
        },
        "score": 85.5,
        "breakdown": {
          "courseSimilarity": 0.75,
          "timeOverlap": 0.60,
          "skillSimilarity": 0.80
        },
        "reasons": [
          "3 门共同课程",
          "4 个重叠时间段",
          "5 项共同技能"
        ]
      }
    ],
    "total_candidates": 50,
    "algorithm_version": "2.0.0"
  }
}
```

## ⚠️ 错误处理

所有错误遵循统一格式：

```json
{
  "success": false,
  "errors": [
    {
      "code": 4041,
      "message": "用户未找到"
    }
  ]
}
```

### 常见错误代码

| 代码 | HTTP 状态 | 描述 |
|------|-----------|------|
| 4001 | 400 | 用户名或邮箱已存在 |
| 4010 | 401 | 缺少授权令牌 |
| 4011 | 401 | 令牌无效或已过期 |
| 4012 | 401 | 凭据无效 |
| 4013 | 401 | 密码不正确 |
| 4014 | 401 | 刷新令牌无效 |
| 4015 | 401 | 用户未找到 |
| 4041 | 404 | 资源未找到 |
| 5001 | 500 | 内部服务器错误 |

## 🚦 速率限制

目前没有严格的速率限制。但是，滥用 API 可能导致临时 IP 封禁。最佳实践：

- 尽可能缓存响应
- 对大型数据集使用分页
- 为重试实现指数退避

## 📊 分页

列表端点通过查询参数支持分页：

```http
GET /users?page=1&per_page=20
```

**参数：**
- `page`：页码（默认：1）
- `per_page`：每页项目数（默认：20，最大：100）

**响应包括：**
```json
{
  "success": true,
  "result": {
    "items": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

## 🔍 过滤与搜索

大多数列表端点支持过滤：

```http
GET /users?search=john&study_preference=group
GET /courses?user_id=1
GET /skills?search=python
```

## 📝 最佳实践

1. **始终使用 HTTPS** - 所有请求必须使用 HTTPS
2. **处理令牌刷新** - 在过期前实现自动令牌刷新
3. **验证输入** - 客户端验证改善用户体验
4. **适当缓存** - 缓存非敏感数据
5. **优雅处理错误** - 提供用户友好的错误消息

## 🛠️ 工具与 SDK

### 推荐工具

- **Postman/Insomnia**：用于 API 测试
- **Swagger UI**：基础 URL 的交互式文档
- **curl**：命令行测试

### curl 命令示例

```bash
# 注册
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# 登录
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"test@example.com","password":"password123"}'

# 带认证获取资料
curl -X GET https://studybuddyplatformapi.15098646873.workers.dev/users/1/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 相关文档

- [JWT 认证指南](./JWT_AUTH_GUIDE_ZH.md)
- [智能匹配算法](./MATCHING_ALGORITHM_ZH.md)
- [数据库架构](./DATABASE_SCHEMA_ZH.md)
- [部署指南](./DEPLOYMENT_GUIDE_ZH.md)

## 🆘 支持

如有问题或疑问：
- 查看 [常见问题](./FAQ_ZH.md)
- 在 GitHub 上提交 issue
- 联系：dev@studybuddy.example.com
