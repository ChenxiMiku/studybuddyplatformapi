# Study Buddy Platform API - 使用示例

## 完整使用流程示例

### 1. 创建用户

```bash
# 创建第一个用户
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_chen",
    "email": "alice@example.com",
    "password_hash": "$2a$10$...",
    "goals": "Master web development and build a portfolio project",
    "study_preference": "group"
  }'

# 响应
{
  "success": true,
  "result": {
    "id": 1,
    "username": "alice_chen",
    "email": "alice@example.com",
    "goals": "Master web development and build a portfolio project",
    "study_preference": "group",
    "created_at": "2025-11-09T10:00:00.000Z",
    "updated_at": "2025-11-09T10:00:00.000Z"
  }
}
```

### 2. 为用户添加课程

```bash
# 添加课程
curl -X POST http://localhost:8787/courses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "course_name": "CS50 - Introduction to Computer Science"
  }'

curl -X POST http://localhost:8787/courses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "course_name": "Full Stack Web Development Bootcamp"
  }'

# 响应
{
  "success": true,
  "result": {
    "id": 1,
    "user_id": 1,
    "course_name": "CS50 - Introduction to Computer Science",
    "created_at": "2025-11-09T10:05:00.000Z"
  }
}
```

### 3. 查看所有预设技能

```bash
# 获取技能列表
curl http://localhost:8787/skills

# 响应
{
  "success": true,
  "result": [
    { "id": 1, "skill_name": "JavaScript" },
    { "id": 2, "skill_name": "TypeScript" },
    { "id": 3, "skill_name": "Python" },
    { "id": 6, "skill_name": "React" },
    ...
  ]
}
```

### 4. 为用户添加技能

```bash
# 添加 JavaScript 技能（中级水平）
curl -X POST http://localhost:8787/user-skills \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate"
  }'

# 添加 React 技能（初级水平）
curl -X POST http://localhost:8787/user-skills \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "skill_id": 6,
    "proficiency_level": "beginner"
  }'

# 响应
{
  "success": true,
  "result": {
    "id": 1,
    "user_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate",
    "created_at": "2025-11-09T10:10:00.000Z"
  }
}
```

### 5. 设置用户可用时间

```bash
# 周一 14:00-16:00
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 1,
    "time_slot": "14:00-16:00"
  }'

# 周三 10:00-12:00
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 3,
    "time_slot": "10:00-12:00"
  }'

# 周五 19:00-21:00
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 5,
    "time_slot": "19:00-21:00"
  }'

# 响应
{
  "success": true,
  "result": {
    "id": 1,
    "user_id": 1,
    "weekday": 1,
    "time_slot": "14:00-16:00",
    "created_at": "2025-11-09T10:15:00.000Z"
  }
}
```

### 6. 查询用户信息

```bash
# 获取用户详情
curl http://localhost:8787/users/1

# 响应包含完整的用户信息
{
  "success": true,
  "result": {
    "id": 1,
    "username": "alice_chen",
    "email": "alice@example.com",
    "goals": "Master web development and build a portfolio project",
    "study_preference": "group",
    "created_at": "2025-11-09T10:00:00.000Z",
    "updated_at": "2025-11-09T10:00:00.000Z"
  }
}
```

### 7. 查询用户的课程

```bash
# 通过 user_id 过滤课程（使用查询参数）
curl "http://localhost:8787/courses?user_id=1"

# 响应
{
  "success": true,
  "result": [
    {
      "id": 1,
      "user_id": 1,
      "course_name": "CS50 - Introduction to Computer Science",
      "created_at": "2025-11-09T10:05:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "course_name": "Full Stack Web Development Bootcamp",
      "created_at": "2025-11-09T10:06:00.000Z"
    }
  ]
}
```

### 8. 查询用户的技能

```bash
# 通过 user_id 过滤用户技能
curl "http://localhost:8787/user-skills?user_id=1"

# 响应
{
  "success": true,
  "result": [
    {
      "id": 1,
      "user_id": 1,
      "skill_id": 1,
      "proficiency_level": "intermediate",
      "created_at": "2025-11-09T10:10:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "skill_id": 6,
      "proficiency_level": "beginner",
      "created_at": "2025-11-09T10:11:00.000Z"
    }
  ]
}
```

### 9. 查询用户的可用时间

```bash
# 通过 user_id 过滤可用时间
curl "http://localhost:8787/availability?user_id=1"

# 响应
{
  "success": true,
  "result": [
    {
      "id": 1,
      "user_id": 1,
      "weekday": 1,
      "time_slot": "14:00-16:00",
      "created_at": "2025-11-09T10:15:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "weekday": 3,
      "time_slot": "10:00-12:00",
      "created_at": "2025-11-09T10:16:00.000Z"
    },
    {
      "id": 3,
      "user_id": 1,
      "weekday": 5,
      "time_slot": "19:00-21:00",
      "created_at": "2025-11-09T10:17:00.000Z"
    }
  ]
}
```

### 10. 更新用户信息

```bash
# 更新学习目标和偏好
curl -X PUT http://localhost:8787/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "goals": "Build a full-stack e-commerce application and find a tech job",
    "study_preference": "both"
  }'

# 响应
{
  "success": true,
  "result": {
    "id": 1,
    "username": "alice_chen",
    "email": "alice@example.com",
    "goals": "Build a full-stack e-commerce application and find a tech job",
    "study_preference": "both",
    "updated_at": "2025-11-09T11:00:00.000Z"
  }
}
```

### 11. 更新技能熟练度

```bash
# 将 React 技能从初级提升到中级
curl -X PUT http://localhost:8787/user-skills/2 \
  -H "Content-Type: application/json" \
  -d '{
    "proficiency_level": "intermediate"
  }'

# 响应
{
  "success": true,
  "result": {
    "id": 2,
    "user_id": 1,
    "skill_id": 6,
    "proficiency_level": "intermediate",
    "created_at": "2025-11-09T10:11:00.000Z"
  }
}
```

### 12. 搜索功能

```bash
# 搜索包含 "web" 的课程
curl "http://localhost:8787/courses?search=web"

# 搜索包含 "Script" 的技能
curl "http://localhost:8787/skills?search=Script"

# 搜索用户（按用户名或邮箱）
curl "http://localhost:8787/users?search=alice"
```

### 13. 分页查询

```bash
# 获取第一页（每页 10 条）
curl "http://localhost:8787/users?page=1&per_page=10"

# 获取第二页
curl "http://localhost:8787/users?page=2&per_page=10"
```

### 14. 删除操作

```bash
# 删除课程
curl -X DELETE http://localhost:8787/courses/1

# 删除用户技能关联
curl -X DELETE http://localhost:8787/user-skills/1

# 删除可用时间
curl -X DELETE http://localhost:8787/availability/1

# 删除用户（会级联删除相关的课程、技能、可用时间）
curl -X DELETE http://localhost:8787/users/1
```

## 匹配推荐场景示例

### 场景 1: 查找有共同课程的学习伙伴

```sql
-- 这个查询在后端实现
SELECT u2.* FROM users u1
JOIN courses c1 ON u1.id = c1.user_id
JOIN courses c2 ON c1.course_name = c2.course_name
JOIN users u2 ON c2.user_id = u2.id
WHERE u1.id = 1 AND u2.id != 1
```

### 场景 2: 查找有相同技能的用户

```sql
-- 查找与用户 1 有相同技能的其他用户
SELECT DISTINCT u2.* FROM users u1
JOIN user_skills us1 ON u1.id = us1.user_id
JOIN user_skills us2 ON us1.skill_id = us2.skill_id
JOIN users u2 ON us2.user_id = u2.id
WHERE u1.id = 1 AND u2.id != 1
```

### 场景 3: 查找时间可用的匹配用户

```sql
-- 查找在周一 14:00-16:00 有空的用户
SELECT DISTINCT u.* FROM users u
JOIN availability a ON u.id = a.user_id
WHERE a.weekday = 1 AND a.time_slot = '14:00-16:00'
AND u.id != 1
```

## WebSocket / 实时推荐扩展

未来可以扩展的功能：
- 实时匹配通知
- 在线状态显示
- 即时消息功能
- 学习小组创建和管理

## 数据验证规则

- `username`: 3-50 字符
- `email`: 必须是有效的邮箱格式
- `study_preference`: 只能是 'group', 'one-on-one', 或 'both'
- `proficiency_level`: 只能是 'beginner', 'intermediate', 或 'advanced'
- `weekday`: 0-6 的整数（0=周日, 6=周六）
- `time_slot`: 字符串格式，建议 "HH:MM-HH:MM"
