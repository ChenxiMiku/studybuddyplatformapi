# Study Buddy Platform API 🎓

> 一个帮助学习者找到学习伙伴的平台 API，支持课程匹配、技能匹配和时间匹配。

[![API Documentation](https://img.shields.io/badge/API-Documentation-blue)](https://studybuddyplatformapi.15098646873.workers.dev/)
[![Built with](https://img.shields.io/badge/Built%20with-Cloudflare%20Workers-orange)](https://workers.cloudflare.com/)

## 🌟 核心功能

### 认证系统
- ✅ 用户注册 (`POST /auth/register`)
- ✅ 用户登录 (`POST /auth/login`)

### 用户管理
- ✅ 完整的用户 CRUD 操作
- ✅ 获取用户完整资料 (`GET /users/:id/profile`)
- ✅ 修改密码 (`POST /users/:id/change-password`)

### 学习管理
- ✅ 课程管理（自由添加课程）
- ✅ 技能管理（15个预设技能 + 熟练度）
- ✅ 可用时间管理（按星期和时间段）

### 智能匹配
- ✅ 按课程搜索学习伙伴
- ✅ 按技能搜索学习伙伴
- ✅ 按时间搜索学习伙伴
- ✅ 按学习偏好过滤

## 🚀 快速开始

### 部署
```bash
npm run deploy
```

### 本地开发
```bash
npm run dev
```

### 测试 API
```bash
.\test-api.ps1
```

## 📖 API 文档

**在线文档**: https://studybuddyplatformapi.15098646873.workers.dev/

## 📚 详细文档

- [用户功能更新说明](USER_FEATURES_UPDATE.md)
- [功能总结](FINAL_SUMMARY.md)
- [更新日志](CHANGELOG.md)
- [API 使用指南](API_USAGE.md)
- [使用示例](EXAMPLES.md)

## 🎯 API 端点概览

| 分类 | 端点数 | 说明 |
|------|--------|------|
| 认证 | 2 | 注册、登录 |
| 用户 | 7 | CRUD + 资料 + 密码 |
| 课程 | 5 | 课程管理 |
| 技能 | 5 | 技能管理 |
| 用户技能 | 5 | 技能关联 |
| 可用时间 | 5 | 时间管理 |
| 搜索 | 1 | 智能匹配 |
| **总计** | **32** | 完整功能 |

## 💡 使用示例

### 注册用户
```bash
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "goals": "Learn full-stack development",
    "study_preference": "group"
  }'
```

### 获取完整资料
```bash
curl https://studybuddyplatformapi.15098646873.workers.dev/users/1/profile
```

### 搜索学习伙伴
```bash
curl "https://studybuddyplatformapi.15098646873.workers.dev/search/match?user_id=1&course=CS50"
```

## 🛠️ 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono + Chanfana
- **数据库**: Cloudflare D1 (SQLite)
- **验证**: Zod
- **语言**: TypeScript
- **文档**: OpenAPI 3.0

## ✅ 测试结果

所有 10 项功能测试全部通过：
- ✅ 用户注册
- ✅ 用户登录
- ✅ 添加课程
- ✅ 获取技能列表
- ✅ 添加用户技能
- ✅ 添加可用时间
- ✅ 获取完整资料
- ✅ 搜索匹配用户
- ✅ 修改密码
- ✅ 新密码登录

---

# OpenAPI Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/chanfana-openapi-template)

![OpenAPI Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/91076b39-1f5b-46f6-7f14-536a6f183000/public)

<!-- dash-content-start -->

This is a Cloudflare Worker with OpenAPI 3.1 Auto Generation and Validation using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono).

This is an example project made to be used as a quick start into building OpenAPI compliant Workers that generates the
`openapi.json` schema automatically from code and validates the incoming request to the defined parameters or request body.

This template includes various endpoints, a D1 database, and integration tests using [Vitest](https://vitest.dev/) as examples. In endpoints, you will find [chanfana D1 AutoEndpoints](https://chanfana.com/endpoints/auto/d1) and a [normal endpoint](https://chanfana.com/endpoints/defining-endpoints) to serve as examples for your projects.

Besides being able to see the OpenAPI schema (openapi.json) in the browser, you can also extract the schema locally no hassle by running this command `npm run schema`.

<!-- dash-content-end -->

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](https://github.com/cloudflare/templates/tree/main/openapi-template#setup-steps) before deploying.

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/openapi-template
```

A live public deployment of this template is available at [https://openapi-template.templates.workers.dev](https://openapi-template.templates.workers.dev)

## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```
2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) with the name "openapi-template-db":
   ```bash
   npx wrangler d1 create openapi-template-db
   ```
   ...and update the `database_id` field in `wrangler.json` with the new database ID.
3. Run the following db migration to initialize the database (notice the `migrations` directory in this project):
   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```
4. Deploy the project!
   ```bash
   npx wrangler deploy
   ```
5. Monitor your worker
   ```bash
   npx wrangler tail
   ```

## Testing

This template includes integration tests using [Vitest](https://vitest.dev/). To run the tests locally:

```bash
npm run test
```

Test files are located in the `tests/` directory, with examples demonstrating how to test your endpoints and database interactions.

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. Integration tests are located in the `tests/` directory.
4. For more information read the [chanfana documentation](https://chanfana.com/), [Hono documentation](https://hono.dev/docs), and [Vitest documentation](https://vitest.dev/guide/).
