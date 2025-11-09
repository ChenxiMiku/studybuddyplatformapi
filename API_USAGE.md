# Study Buddy Platform API - 使用说明

## 概述

基于你的需求，已经实现了完整的数据库表结构和 RESTful API 端点。

## 数据库结构

### 1. Users 表
存储用户基本信息：
- `id`: 主键
- `username`: 用户名（唯一）
- `email`: 邮箱（唯一）
- `password_hash`: 密码哈希（安全存储）
- `goals`: 学习目标（自由文本）
- `study_preference`: 学习偏好（'group', 'one-on-one', 'both'）
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 2. Courses 表
每个用户可自由输入的课程：
- `id`: 主键
- `user_id`: 用户ID（外键）
- `course_name`: 课程名称
- `created_at`: 创建时间

### 3. Skills 表
预设的技能标签列表（支持结构化推荐）：
- `id`: 主键
- `skill_name`: 技能名称（唯一）
- `created_at`: 创建时间

预设技能包括：JavaScript, TypeScript, Python, Java, C++, React, Node.js, Database Design, Machine Learning, Data Structures, Algorithms, Web Development, Mobile Development, Cloud Computing, DevOps

### 4. User_Skills 表
用户与技能的多对多关系：
- `id`: 主键
- `user_id`: 用户ID（外键）
- `skill_id`: 技能ID（外键）
- `proficiency_level`: 熟练程度（'beginner', 'intermediate', 'advanced'）
- `created_at`: 创建时间

### 5. Availability 表
用户每周可用时间段（支持时间匹配）：
- `id`: 主键
- `user_id`: 用户ID（外键）
- `weekday`: 星期几（0=周日, 6=周六）
- `time_slot`: 时间段（如 "09:00-11:00"）
- `created_at`: 创建时间

## API 端点

所有端点都支持标准的 CRUD 操作：

### Users API
- `GET /users` - 获取用户列表
- `POST /users` - 创建新用户
- `GET /users/:id` - 获取单个用户信息
- `PUT /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户

### Courses API
- `GET /courses` - 获取课程列表
- `POST /courses` - 创建新课程
- `GET /courses/:id` - 获取单个课程
- `PUT /courses/:id` - 更新课程
- `DELETE /courses/:id` - 删除课程

### Skills API
- `GET /skills` - 获取技能列表
- `POST /skills` - 创建新技能
- `GET /skills/:id` - 获取单个技能
- `PUT /skills/:id` - 更新技能
- `DELETE /skills/:id` - 删除技能

### User Skills API
- `GET /user-skills` - 获取用户技能关联列表
- `POST /user-skills` - 为用户添加技能
- `GET /user-skills/:id` - 获取单个用户技能关联
- `PUT /user-skills/:id` - 更新用户技能熟练度
- `DELETE /user-skills/:id` - 删除用户技能关联

### Availability API
- `GET /availability` - 获取可用时间列表
- `POST /availability` - 添加可用时间
- `GET /availability/:id` - 获取单个可用时间
- `PUT /availability/:id` - 更新可用时间
- `DELETE /availability/:id` - 删除可用时间

## API 特性

### 搜索功能
- Users: 支持按 username, email, goals 搜索
- Courses: 支持按 course_name 搜索
- Skills: 支持按 skill_name 搜索

### 排序
- Users: 默认按 id 降序
- Courses: 默认按 id 降序
- Skills: 默认按 skill_name 升序
- User Skills: 默认按 id 降序
- Availability: 默认按 weekday, time_slot 升序

### 分页
所有列表端点都支持分页参数

## 示例请求

### 创建用户
```json
POST /users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password_hash": "hashed_password_here",
  "goals": "Learn full-stack development",
  "study_preference": "group"
}
```

### 添加课程
```json
POST /courses
{
  "user_id": 1,
  "course_name": "Introduction to Computer Science"
}
```

### 添加用户技能
```json
POST /user-skills
{
  "user_id": 1,
  "skill_id": 1,
  "proficiency_level": "intermediate"
}
```

### 添加可用时间
```json
POST /availability
{
  "user_id": 1,
  "weekday": 1,
  "time_slot": "14:00-16:00"
}
```

## 数据库迁移

数据库迁移文件位于：
- `migrations/0002_add_users_and_related_tables.sql`

运行迁移以创建所有必要的表和索引。

## 安全性考虑

1. **密码安全**: 使用 `password_hash` 字段存储加密后的密码
2. **外键约束**: 所有关联表都使用外键约束，支持级联删除
3. **唯一约束**: username、email、skill_name 等字段有唯一约束
4. **索引优化**: 为常用查询字段添加了索引

## 可扩展性

- 分离的表结构支持多用户、多课程、多技能、多时间段
- 使用多对多关系表（user_skills）支持复杂的技能匹配
- 时间可用性表支持灵活的时间段匹配
- 预设技能列表可以轻松扩展

## OpenAPI 文档

启动服务器后，访问根路径 `/` 可以查看完整的 OpenAPI 文档。
