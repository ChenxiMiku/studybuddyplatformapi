# 📚 Study Buddy Platform - 文档索引

## 📖 核心文档

### 快速开始
- [README](../README.md) - 项目概述和快速开始
- [快速参考](QUICK_REFERENCE.md) - 常用命令和操作速查

### API 文档
- [API 概览 (中文)](API_OVERVIEW_ZH.md) - API 架构和设计概览
- [API 使用指南 (中文)](API_USAGE_ZH.md) - 详细的 API 使用说明
- [API 使用指南 (English)](API_USAGE_EN.md) - Detailed API usage guide
- [API 示例 (中文)](EXAMPLES.md) - 实际使用示例和代码片段
- [API 示例 (English)](EXAMPLES_EN.md) - Practical examples and code snippets

### 认证与安全
- [JWT 认证指南](JWT_AUTH_GUIDE.md) - JWT 令牌认证完整指南
- [安全配置指南](SECURITY_CONFIG.md) - 🔐 环境变量和密钥管理（必读）

### 实时通讯系统
- [消息系统概览](MESSAGING_SYSTEM.md) - WebSocket 消息系统架构
- [消息系统快速开始](MESSAGING_QUICKSTART.md) - 快速集成消息功能
- [消息系统部署](MESSAGING_DEPLOYMENT.md) - 部署和配置指南

### 部署与运维
- [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 生产环境部署检查项



## 🗂️ 目录结构

```
docs/
├── INDEX.md                          # 本文档索引
├── README.md                         # 文档目录说明
│
├── API 文档/
│   ├── API_OVERVIEW_ZH.md           # API 概览 (中文)
│   ├── API_USAGE_ZH.md              # API 使用 (中文)
│   ├── API_USAGE_EN.md              # API 使用 (English)
│   ├── EXAMPLES.md                  # 示例 (中文)
│   └── EXAMPLES_EN.md               # 示例 (English)
│
├── 认证与安全/
│   └── JWT_AUTH_GUIDE.md            # JWT 认证指南
│
├── 实时通讯/
│   ├── MESSAGING_SYSTEM.md          # 消息系统架构
│   ├── MESSAGING_QUICKSTART.md      # 快速开始
│   └── MESSAGING_DEPLOYMENT.md      # 部署指南
│
├── 部署/
│   └── DEPLOYMENT_CHECKLIST.md      # 部署检查清单
│
├── 参考/
│   └── QUICK_REFERENCE.md           # 快速参考
│

```

## 🚀 脚本工具

```
scripts/
├── deployment/                      # 部署脚本
│   ├── build-and-deploy.ps1        # 构建并部署到生产
│   ├── setup-database.ps1          # 数据库设置
│   └── test-production.ps1         # 生产环境测试
│
└── dev/                            # 开发脚本
    ├── start-dev.ps1               # 启动开发服务器
    └── start-frontend.ps1          # 启动前端开发服务器
```

## 📝 前端文档

前端相关文档位于 `frontend-react/` 目录：
- [前端架构](../frontend-react/ARCHITECTURE.md)
- [架构可视化](../frontend-react/ARCHITECTURE_VISUAL.md)
- [前端 README](../frontend-react/README.md)

## 🔍 查找文档

- **API 使用**: 查看 `API_USAGE_ZH.md` 或 `API_USAGE_EN.md`
- **快速集成**: 查看 `QUICK_REFERENCE.md` 和 `MESSAGING_QUICKSTART.md`
- **认证问题**: 查看 `JWT_AUTH_GUIDE.md`
- **部署问题**: 查看 `DEPLOYMENT_CHECKLIST.md` 和 `MESSAGING_DEPLOYMENT.md`
- **示例代码**: 查看 `EXAMPLES.md` 或 `EXAMPLES_EN.md`

## 🆘 获取帮助

如果在文档中找不到需要的信息：
1. 查看 [README](../README.md) 中的项目信息
2. 访问在线 API 文档：https://studybuddyplatformapi.15098646873.workers.dev/
3. 查看项目结构：[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)

---

*最后更新: 2025年11月10日*
