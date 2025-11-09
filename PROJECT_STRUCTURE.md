# 📂 项目结构

```
studybuddyplatformapi/
│
├── 📁 src/                                 # 后端源代码
│   ├── index.ts                           # 主入口文件
│   ├── types.ts                           # TypeScript 类型定义
│   │
│   ├── 📁 endpoints/                       # API 端点
│   │   ├── 📁 users/                      # 用户管理 API
│   │   ├── 📁 courses/                    # 课程管理 API
│   │   ├── 📁 skills/                     # 技能管理 API
│   │   ├── 📁 user-skills/                # 用户技能关联 API
│   │   ├── 📁 availability/               # 可用时间 API
│   │   ├── 📁 tasks/                      # 任务管理 API
│   │   └── 📁 study-groups/               # 学习小组 API
│   │
│   ├── 📁 middlewares/                     # 中间件
│   │   └── auth.ts                        # JWT 认证中间件
│   │
│   └── 📁 utils/                          # 工具函数
│       ├── jwt.ts                         # JWT 令牌工具
│       ├── password.ts                    # 密码加密工具
│       └── matchingAlgorithm.ts          # 匹配算法
│
├── 📁 frontend-react/                      # React 前端应用
│   ├── 📁 src/
│   │   ├── 📁 components/                 # React 组件
│   │   │   ├── Layout.tsx                # 布局组件
│   │   │   ├── Navbar.tsx                # 导航栏组件
│   │   │   ├── ChatList.tsx              # 聊天列表组件
│   │   │   └── ChatWindow.tsx            # 聊天窗口组件
│   │   │
│   │   ├── 📁 pages/                      # 页面组件
│   │   │   ├── HomePage.tsx              # 首页
│   │   │   ├── LoginPage.tsx             # 登录页
│   │   │   ├── RegisterPage.tsx          # 注册页
│   │   │   ├── GroupListPage.tsx         # 小组列表
│   │   │   ├── GroupDetailPage.tsx       # 小组详情
│   │   │   ├── CreateGroupPage.tsx       # 创建小组
│   │   │   ├── ChatPage.tsx              # 消息页面
│   │   │   ├── FriendsPage.tsx           # 好友管理页面
│   │   │   ├── DiscoverPage.tsx          # 寻找好友页面
│   │   │   ├── ProfilePage.tsx           # 个人资料
│   │   │   └── EditProfilePage.tsx       # 编辑资料
│   │   │
│   │   ├── 📁 stores/                     # Zustand 状态管理
│   │   │   ├── authStore.ts              # 认证状态
│   │   │   ├── chatStore.ts              # 聊天状态
│   │   │   └── groupStore.ts             # 小组状态
│   │   │
│   │   ├── 📁 services/                   # API 服务
│   │   │   └── api.ts                    # API 客户端
│   │   │
│   │   ├── 📁 i18n/                       # 国际化
│   │   │   └── 📁 locales/               # 语言文件
│   │   │       ├── en.json               # 英文
│   │   │       └── zh.json               # 中文
│   │   │
│   │   └── App.tsx                       # 根组件
│   │
│   ├── ARCHITECTURE.md                    # 前端架构文档
│   ├── ARCHITECTURE_VISUAL.md             # 架构可视化
│   └── README.md                         # 前端说明
│
├── 📁 migrations/                          # 数据库迁移
│   ├── 0001_add_tasks_table.sql
│   ├── 0002_add_users_and_related_tables.sql
│   ├── 0003_add_study_groups_tables.sql
│   └── 0004_seed_test_data.sql
│
├── 📁 tests/                              # 测试文件
│   ├── 📁 integration/
│   │   ├── users.test.ts                 # 用户 API 测试
│   │   ├── tasks.test.ts                 # 任务 API 测试
│   │   └── messaging.test.ts             # 消息系统测试
│   │
│   ├── apply-migrations.ts               # 迁移应用工具
│   └── vitest.config.mts                 # Vitest 配置
│
├── 📁 scripts/                            # 脚本工具
│   ├── 📁 deployment/                     # 部署脚本
│   │   ├── build-and-deploy.ps1         # 构建并部署
│   │   ├── setup-database.ps1           # 数据库设置
│   │   ├── test-production.ps1          # 生产测试
│   │   └── verify-data.ps1              # 数据验证
│   │
│   └── seed-database.mjs                # 数据库种子数据
│
├── 📁 docs/                               # 文档目录
│   ├── INDEX.md                          # 📌 文档索引（从这里开始）
│   ├── README.md                         # 文档说明
│   │
│   ├── API_OVERVIEW_ZH.md                # API 概览（中文）
│   ├── API_USAGE_ZH.md                   # API 使用指南（中文）
│   ├── API_USAGE_EN.md                   # API 使用指南（英文）
│   ├── EXAMPLES.md                       # 示例代码（中文）
│   ├── EXAMPLES_EN.md                    # 示例代码（英文）
│   │
│   ├── JWT_AUTH_GUIDE.md                 # JWT 认证指南
│   ├── FRIENDS_SYSTEM.md                 # 好友系统文档
│   ├── QUICK_REFERENCE.md                # 快速参考
│   ├── DEPLOYMENT_CHECKLIST.md           # 部署检查清单
│   │
│   ├── MESSAGING_SYSTEM.md               # 消息系统架构
│   ├── MESSAGING_QUICKSTART.md           # 消息系统快速开始
│   └── MESSAGING_DEPLOYMENT.md           # 消息系统部署
│
├── 📄 README.md                           # 📌 项目主文档（从这里开始）
├── 📄 package.json                        # Node.js 依赖配置
├── 📄 tsconfig.json                       # TypeScript 配置
├── 📄 wrangler.jsonc                      # Cloudflare Workers 配置（git 忽略）
├── 📄 wrangler.jsonc.example              # 配置模板
├── 📄 openapi.json                        # OpenAPI 规范
└── 📄 openapi-spec.json                   # OpenAPI 规范（详细版）
```

## 🎯 快速导航

### 快速导航
1. 阅读 [README.md](../README.md) 了解项目概述
2. 查看 [docs/INDEX.md](../docs/INDEX.md) 浏览所有文档
3. 参考 [docs/SECURITY_CONFIG.md](../docs/SECURITY_CONFIG.md) 配置环境

### API 使用
1. 查看 [API_USAGE_ZH.md](../docs/API_USAGE_ZH.md) 了解 API 使用方法
2. 参考 [EXAMPLES.md](../docs/EXAMPLES.md) 查看示例代码
3. 阅读 [JWT_AUTH_GUIDE.md](../docs/JWT_AUTH_GUIDE.md) 了解认证机制

### 前端架构
1. 进入 `frontend-react/` 目录
2. 阅读 [ARCHITECTURE.md](../frontend-react/ARCHITECTURE.md) 了解架构
3. 查看 [README.md](../frontend-react/README.md) 了解组件结构

### 部署运维
1. 使用 `scripts/deployment/` 中的脚本
2. 查看 [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md)
3. 参考 [scripts/README.md](../scripts/README.md) 了解脚本用法

## 📊 技术栈

### 后端
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Framework**: Hono (轻量级 Web 框架)
- **Database**: Cloudflare D1 (分布式 SQLite)
- **Authentication**: JWT + bcrypt
- **Language**: TypeScript

### 前端
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Language**: TypeScript

### 开发工具
- **Testing**: Vitest
- **API Spec**: OpenAPI 3.0
- **Deployment**: Wrangler CLI

## 🔄 工作流程

### 部署流程
```
1. 数据库迁移 (scripts/deployment/setup-database.ps1)
2. 构建前端 (cd frontend-react && npm run build)
3. 部署到生产 (scripts/deployment/build-and-deploy.ps1)
4. 测试生产环境 (scripts/deployment/test-production.ps1)
```

## 📝 文件说明

### 配置文件
- `wrangler.jsonc`: Cloudflare Workers 配置（git 忽略，包含敏感资源 ID）
- `wrangler.jsonc.example`: 配置模板（提交到 git）
- `tsconfig.json`: TypeScript 编译配置
- `package.json`: Node.js 项目配置
- `frontend-react/vite.config.ts`: Vite 构建配置

### 环境变量和 Secrets
- **JWT_SECRET**: 通过 `npx wrangler secret put JWT_SECRET` 设置
- **资源 ID**: 在 `wrangler.jsonc` 中配置（从 `wrangler.jsonc.example` 复制）
- **其他配置**: 在 `wrangler.jsonc` 的 `vars` 中定义

### 数据文件
- `openapi.json`: API 规范定义
- `migrations/*.sql`: 数据库迁移脚本

### 文档文件
- `docs/`: 所有项目文档
- `README.md`: 项目主文档

---

*最后更新: 2025年11月10日*
