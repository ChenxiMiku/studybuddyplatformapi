# Study Buddy Platform API - 使用指南

## 概述

根据您的需求，已实现完整的数据库架构和 RESTful API 端点。

## 数据库架构

### 1. 用户表（Users Table）
存储用户基本信息：
- `id`：主键
- `username`：唯一用户名
- `email`：唯一邮箱
- `password_hash`：安全存储的密码哈希值
- `goals`：学习目标（自由文本）
- `study_preference`：学习偏好（'group', 'one-on-one', 'both'）
- `created_at`：创建时间戳
- `updated_at`：更新时间戳

### 2. 课程表（Courses Table）
每个用户自由输入的课程：
- `id`：主键
- `user_id`：用户 ID（外键）
- `course_name`：课程名称
- `created_at`：创建时间戳

### 3. 技能表（Skills Table）
预设技能标签列表（支持结构化推荐）：
- `id`：主键
- `skill_name`：唯一技能名称
- `created_at`：创建时间戳

预设技能包括：JavaScript, TypeScript, Python, Java, C++, React, Node.js, 数据库设计, 机器学习, 数据结构, 算法, Web 开发, 移动开发, 云计算, DevOps

### 4. 用户技能表（User_Skills Table）
用户与技能的多对多关系：
- `id`：主键
- `user_id`：用户 ID（外键）
- `skill_id`：技能 ID（外键）
- `proficiency_level`：熟练程度（'beginner', 'intermediate', 'advanced'）
- `created_at`：创建时间戳

### 5. 可用时间表（Availability Table）
用户每周的可用时间段（支持时间匹配）：
- `id`：主键
- `user_id`：用户 ID（外键）
- `weekday`：星期几（0=周日, 6=周六）
- `time_slot`：时间段（例如 "09:00-11:00"）
- `created_at`：创建时间戳

## API 端点

所有端点支持标准的 CRUD 操作：

### 用户 API
- `GET /users` - 获取用户列表
- `POST /users` - 创建新用户
- `GET /users/:id` - 获取单个用户信息
- `PUT /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户

### 课程 API
- `GET /courses` - 获取课程列表
- `POST /courses` - 创建新课程
- `GET /courses/:id` - 获取单个课程
- `PUT /courses/:id` - 更新课程
- `DELETE /courses/:id` - 删除课程

### 技能 API
- `GET /skills` - 获取技能列表
- `POST /skills` - 创建新技能
- `GET /skills/:id` - 获取单个技能
- `PUT /skills/:id` - 更新技能
- `DELETE /skills/:id` - 删除技能

### 用户技能 API
- `GET /user-skills` - 获取用户技能关系列表
- `POST /user-skills` - 为用户添加技能
- `GET /user-skills/:id` - 获取单个用户技能关系
- `PUT /user-skills/:id` - 更新用户技能熟练程度
- `DELETE /user-skills/:id` - 删除用户技能关系

### 可用时间 API
- `GET /availability` - 获取可用时间列表
- `POST /availability` - 添加可用时间
- `GET /availability/:id` - 获取单个可用时间
- `PUT /availability/:id` - 更新可用时间
- `DELETE /availability/:id` - 删除可用时间

## API 特性

### 搜索功能
- 用户：按用户名、邮箱、目标搜索
- 课程：按课程名称搜索
- 技能：按技能名称搜索

### 排序
- 用户：默认按 id 降序
- 课程：默认按 id 降序
- 技能：默认按 skill_name 升序
- 用户技能：默认按 id 降序
- 可用时间：默认按 weekday, time_slot 升序

### 分页
所有列表端点支持分页参数

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

1. **密码安全**：在 `password_hash` 字段中存储哈希密码
2. **外键约束**：所有关联表使用外键约束，支持级联删除
3. **唯一约束**：字段如 username、email、skill_name 具有唯一约束
4. **索引优化**：为常用查询字段添加索引

## 可扩展性

- 解耦的表结构支持多用户、多课程、多技能和多时间段
- 多对多关系表（user_skills）支持复杂技能匹配
- 可用时间表支持灵活的时间段匹配
- 预设技能列表可以轻松扩展

## OpenAPI 文档

启动服务器后，访问根路径 `/` 查看完整的 OpenAPI 文档。