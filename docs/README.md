# Study Buddy Platform API Documentation | 学习伙伴平台 API 文档

> **📌 提示**: 查看 [文档索引](INDEX.md) 快速找到您需要的文档

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## 📚 English Documentation

Welcome to the Study Buddy Platform API documentation. This comprehensive guide will help you understand and integrate with our intelligent matching system.

### 📖 Core Documentation

#### Getting Started
- **[Quick Reference](QUICK_REFERENCE.md)** - Common commands and operations cheat sheet

#### API Documentation
- **[API Overview](API_OVERVIEW.md)** - Complete API architecture and design overview
- **[API Usage Guide](API_USAGE_EN.md)** - Detailed API usage instructions
- **[Examples](EXAMPLES_EN.md)** - Practical examples and code snippets

#### Authentication & Security
- **[JWT Authentication Guide](JWT_AUTH_GUIDE.md)** - Complete JWT authentication guide

#### Real-time Messaging
- **[Messaging System](MESSAGING_SYSTEM.md)** - WebSocket messaging architecture
- **[Messaging Quick Start](MESSAGING_QUICKSTART.md)** - Quick integration guide
- **[Messaging Deployment](MESSAGING_DEPLOYMENT.md)** - Deployment and configuration guide

#### Deployment
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Production deployment checklist

### 🚀 Quick Start

```bash
# 1. Register a new user
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}'

# 2. Login and get JWT tokens
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"john@example.com","password":"password123"}'

# 3. Use the access token for authenticated requests
curl -X GET https://studybuddyplatformapi.15098646873.workers.dev/users/1/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 🔗 Live API

- **Production**: https://studybuddyplatformapi.15098646873.workers.dev
- **Development**: https://dev.studybuddyplatformapi.mikufans.me
- **API Documentation**: https://studybuddyplatformapi.15098646873.workers.dev (Interactive Swagger UI)

### 💡 Key Features

- ✅ RESTful API design
- ✅ JWT authentication with bcrypt password hashing
- ✅ Intelligent study buddy matching algorithm
- ✅ OpenAPI 3.0 specification
- ✅ Cloudflare Workers serverless deployment
- ✅ D1 database (distributed SQLite)
- ✅ TypeScript with full type safety

---

<a name="chinese"></a>
## 📚 中文文档

欢迎使用学习伙伴平台 API 文档。本综合指南将帮助您理解和集成我们的智能匹配系统。

### 📖 核心文档

#### 快速开始
- **[快速参考](QUICK_REFERENCE.md)** - 常用命令和操作速查表

#### API 文档
- **[API 概览](API_OVERVIEW_ZH.md)** - 完整的 API 架构和设计概览
- **[API 使用指南](API_USAGE_ZH.md)** - 详细的 API 使用说明
- **[示例](../EXAMPLES.md)** - 实际使用示例和代码片段

#### 认证与安全
- **[JWT 认证指南](JWT_AUTH_GUIDE.md)** - JWT 令牌认证完整指南

#### 实时通讯系统
- **[消息系统概览](MESSAGING_SYSTEM.md)** - WebSocket 消息系统架构
- **[消息系统快速开始](MESSAGING_QUICKSTART.md)** - 快速集成消息功能
- **[消息系统部署](MESSAGING_DEPLOYMENT.md)** - 部署和配置指南

#### 部署与运维
- **[部署检查清单](DEPLOYMENT_CHECKLIST.md)** - 生产环境部署检查项

### 🚀 快速开始

```bash
# 1. 注册新用户
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}'

# 2. 登录并获取 JWT tokens
curl -X POST https://studybuddyplatformapi.15098646873.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"john@example.com","password":"password123"}'

# 3. 使用 access token 进行认证请求
curl -X GET https://studybuddyplatformapi.15098646873.workers.dev/users/1/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 🔗 在线 API

- **生产环境**: https://studybuddyplatformapi.15098646873.workers.dev
- **开发环境**: https://dev.studybuddyplatformapi.mikufans.me
- **API 文档**: https://studybuddyplatformapi.15098646873.workers.dev (交互式 Swagger UI)

### 💡 核心特性

- ✅ RESTful API 设计
- ✅ JWT 认证配合 bcrypt 密码哈希
- ✅ 智能学习伙伴匹配算法
- ✅ OpenAPI 3.0 规范
- ✅ Cloudflare Workers 无服务器部署
- ✅ D1 数据库（分布式 SQLite）
- ✅ TypeScript 完整类型安全

---

## 📞 Support | 支持

If you have any questions or need help, please:
- Check the documentation first
- Open an issue on GitHub
- Contact the development team

如果您有任何问题或需要帮助，请：
- 首先查看文档
- 在 GitHub 上提交 issue
- 联系开发团队

---

## 📄 License | 许可证

This project is licensed under the MIT License.

本项目采用 MIT 许可证。
