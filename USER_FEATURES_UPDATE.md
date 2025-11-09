# 用户功能更新说明

## 🎉 新增的用户基本功能

### 1. 用户注册 (User Registration)
**端点**: `POST /auth/register`

用户可以注册新账号，无需管理员权限。

**请求示例**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "goals": "Learn full-stack development",
  "study_preference": "group"
}
```

**功能**:
- ✅ 检查用户名和邮箱是否已存在
- ✅ 密码自动哈希（使用 SHA-256，生产环境建议使用 bcrypt）
- ✅ 自动设置创建时间和更新时间

---

### 2. 用户登录 (User Login)
**端点**: `POST /auth/login`

用户可以使用用户名或邮箱登录。

**请求示例**:
```json
{
  "username_or_email": "john_doe",
  "password": "securePassword123"
}
```

**响应示例**:
```json
{
  "success": true,
  "result": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "goals": "Learn full-stack development",
      "study_preference": "group"
    },
    "token": "authentication_token_here"
  }
}
```

**功能**:
- ✅ 支持用户名或邮箱登录
- ✅ 密码验证
- ✅ 返回认证 token（占位符，生产环境建议使用 JWT）

---

### 3. 获取用户完整资料 (User Profile)
**端点**: `GET /users/:id/profile`

获取用户的完整信息，包括所有课程、技能和可用时间。

**响应示例**:
```json
{
  "success": true,
  "result": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "goals": "Learn full-stack development",
      "study_preference": "group",
      "created_at": "2025-11-09T10:00:00.000Z",
      "updated_at": "2025-11-09T10:00:00.000Z"
    },
    "courses": [
      {
        "id": 1,
        "course_name": "CS50",
        "created_at": "2025-11-09T10:05:00.000Z"
      }
    ],
    "skills": [
      {
        "id": 1,
        "skill_id": 1,
        "skill_name": "JavaScript",
        "proficiency_level": "intermediate",
        "created_at": "2025-11-09T10:10:00.000Z"
      }
    ],
    "availability": [
      {
        "id": 1,
        "weekday": 1,
        "time_slot": "14:00-16:00",
        "created_at": "2025-11-09T10:15:00.000Z"
      }
    ]
  }
}
```

**功能**:
- ✅ 一次请求获取用户所有信息
- ✅ 包含课程列表（带课程名称）
- ✅ 包含技能列表（带技能名称和熟练度）
- ✅ 包含可用时间（按星期和时间排序）

---

### 4. 修改密码 (Change Password)
**端点**: `POST /users/:id/change-password`

用户可以修改自己的密码。

**请求示例**:
```json
{
  "old_password": "oldPassword123",
  "new_password": "newSecurePassword456"
}
```

**功能**:
- ✅ 验证旧密码是否正确
- ✅ 设置新密码（自动哈希）
- ✅ 更新 updated_at 时间戳

---

### 5. 搜索匹配的学习伙伴 (Match Search)
**端点**: `GET /search/match`

根据多种条件搜索合适的学习伙伴。

**查询参数**:
- `user_id`: 当前用户ID（排除自己）
- `course`: 课程名称（模糊搜索）
- `skill_id`: 技能ID
- `weekday`: 星期几（0-6）
- `time_slot`: 时间段
- `study_preference`: 学习偏好
- `limit`: 最大结果数（默认20）

**示例 1: 搜索学习相同课程的用户**:
```bash
GET /search/match?user_id=1&course=CS50&limit=10
```

**示例 2: 搜索有相同技能的用户**:
```bash
GET /search/match?user_id=1&skill_id=1&limit=10
```

**示例 3: 搜索在周一14:00-16:00有空的用户**:
```bash
GET /search/match?user_id=1&weekday=1&time_slot=14:00-16:00&limit=10
```

**示例 4: 搜索偏好小组学习的用户**:
```bash
GET /search/match?user_id=1&study_preference=group&limit=10
```

**响应示例**:
```json
{
  "success": true,
  "result": [
    {
      "id": 2,
      "username": "alice_chen",
      "email": "alice@example.com",
      "goals": "Become a frontend developer",
      "study_preference": "group",
      "match_reason": "Same course: CS50",
      "created_at": "2025-11-09T09:00:00.000Z"
    }
  ]
}
```

**功能**:
- ✅ 多条件搜索
- ✅ 显示匹配原因
- ✅ 自动排除当前用户
- ✅ 支持学习偏好过滤
- ✅ 可限制结果数量

---

## 📊 现有功能完善

### 用户 CRUD 操作
所有用户端点都添加了详细的文档说明：

- `GET /users` - 列出所有用户（支持搜索和分页）
- `POST /users` - 创建用户（管理员功能）
- `GET /users/:id` - 获取用户基本信息
- `PUT /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户（级联删除所有相关数据）

### 课程管理
- `GET /courses` - 列出所有课程
- `POST /courses` - 添加课程
- `GET /courses/:id` - 获取课程详情
- `PUT /courses/:id` - 更新课程
- `DELETE /courses/:id` - 删除课程

### 技能管理
- `GET /skills` - 列出所有技能
- `POST /skills` - 添加新技能
- `GET /skills/:id` - 获取技能详情
- `PUT /skills/:id` - 更新技能
- `DELETE /skills/:id` - 删除技能

### 用户技能管理
- `GET /user-skills` - 列出所有用户技能关联
- `POST /user-skills` - 为用户添加技能
- `GET /user-skills/:id` - 获取用户技能详情
- `PUT /user-skills/:id` - 更新技能熟练度
- `DELETE /user-skills/:id` - 删除用户技能

### 可用时间管理
- `GET /availability` - 列出所有可用时间
- `POST /availability` - 添加可用时间
- `GET /availability/:id` - 获取可用时间详情
- `PUT /availability/:id` - 更新可用时间
- `DELETE /availability/:id` - 删除可用时间

---

## 🗑️ 已删除的无用接口

- ❌ `/tasks/*` - 示例任务接口（已删除）
- ❌ `/dummy/:slug` - 示例端点（已删除）

---

## 📁 API 路由结构

```
/auth
  POST /register          # 用户注册
  POST /login             # 用户登录

/users
  GET    /                # 列出所有用户
  POST   /                # 创建用户（管理员）
  GET    /:id             # 获取用户基本信息
  PUT    /:id             # 更新用户信息
  DELETE /:id             # 删除用户
  GET    /:id/profile     # 获取用户完整资料 ⭐ 新增
  POST   /:id/change-password  # 修改密码 ⭐ 新增

/courses
  GET    /                # 列出所有课程
  POST   /                # 添加课程
  GET    /:id             # 获取课程
  PUT    /:id             # 更新课程
  DELETE /:id             # 删除课程

/skills
  GET    /                # 列出所有技能
  POST   /                # 添加技能
  GET    /:id             # 获取技能
  PUT    /:id             # 更新技能
  DELETE /:id             # 删除技能

/user-skills
  GET    /                # 列出所有用户技能
  POST   /                # 添加用户技能
  GET    /:id             # 获取用户技能
  PUT    /:id             # 更新技能熟练度
  DELETE /:id             # 删除用户技能

/availability
  GET    /                # 列出所有可用时间
  POST   /                # 添加可用时间
  GET    /:id             # 获取可用时间
  PUT    /:id             # 更新可用时间
  DELETE /:id             # 删除可用时间

/search
  GET    /match           # 搜索匹配的学习伙伴 ⭐ 新增
```

---

## 🔐 安全性提示

当前实现使用的是简单的 SHA-256 密码哈希，**仅用于演示目的**。

**生产环境建议**:
1. 使用 bcrypt 或 argon2 进行密码哈希
2. 实现真正的 JWT token 认证
3. 添加 token 过期和刷新机制
4. 实现权限和角色控制
5. 添加请求限流（rate limiting）
6. 使用 HTTPS

---

## 🎯 使用示例

### 完整的用户注册和使用流程

```bash
# 1. 注册新用户
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePass123",
    "goals": "Learn web development",
    "study_preference": "group"
  }'

# 2. 登录
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "john_doe",
    "password": "securePass123"
  }'

# 3. 添加课程
curl -X POST http://localhost:8787/courses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "course_name": "CS50"
  }'

# 4. 添加技能
curl -X POST http://localhost:8787/user-skills \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate"
  }'

# 5. 添加可用时间
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 1,
    "time_slot": "14:00-16:00"
  }'

# 6. 查看完整资料
curl http://localhost:8787/users/1/profile

# 7. 搜索学习伙伴
curl "http://localhost:8787/search/match?user_id=1&course=CS50"

# 8. 修改密码
curl -X POST http://localhost:8787/users/1/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "securePass123",
    "new_password": "newSecurePass456"
  }'
```

---

## 📖 API 文档

启动服务器后，访问 `http://localhost:8787/` 查看完整的 OpenAPI 交互式文档。

所有端点都包含：
- ✅ 详细的描述
- ✅ 请求参数说明
- ✅ 响应示例
- ✅ 错误代码说明
- ✅ 标签分类

---

## 🚀 下一步建议

### 短期优化
1. 实现真正的 JWT 认证
2. 添加输入验证和错误处理
3. 实现邮箱验证功能
4. 添加忘记密码/重置密码功能

### 中期功能
1. 用户头像上传
2. 学习小组创建和管理
3. 用户之间的消息系统
4. 学习进度追踪

### 长期规划
1. 推荐算法优化
2. 实时通知系统
3. 移动应用 API
4. 数据分析和报表
