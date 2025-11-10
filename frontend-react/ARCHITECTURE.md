# 前端架构重构文档

## 📋 概述

本次重构完全重新设计了前端的页面结构和逻辑架构,实现了完整的学习伙伴平台功能。

## 🗂️ 新增页面结构

### 1. 首页 (HomePage)
**路由:** `/`  
**访问权限:** 所有用户  
**功能:**
- 展示平台欢迎横幅和核心功能介绍
- 显示平台统计数据(活跃用户、学习小组、今日消息)
- 快速导航卡片(学习小组、实时聊天、通知中心、用户评价)
- 推荐小组展示(已登录用户)
- 最新动态列表(已登录用户)
- 未登录用户显示登录/注册入口

### 2. 用户认证页面

#### 登录页 (LoginPage)
**路由:** `/login`  
**访问权限:** 未登录用户(已登录自动跳转到首页)  
**功能:**
- 用户名/邮箱登录
- 密码输入
- 记住登录状态
- 跳转到注册页

#### 注册页 (RegisterPage)
**路由:** `/register`  
**访问权限:** 未登录用户(已登录自动跳转到首页)  
**功能:**
- 用户名、邮箱、密码输入
- 密码确认
- 表单验证
- 跳转到登录页

### 3. 学习小组模块

#### 小组列表页 (GroupListPage)
**路由:** `/groups`  
**访问权限:** 已登录用户  
**功能:**
- 展示所有学习小组
- 搜索功能(名称、描述)
- 筛选功能(全部/公开/私密)
- 创建新小组按钮
- 小组卡片显示:
  - 小组名称
  - 成员数量/最大成员数
  - 公开/私密标识
  - 简短描述
  - 查看详情按钮

#### 小组详情页 (GroupDetailPage)
**路由:** `/groups/:groupId`  
**访问权限:** 已登录用户  
**功能:**
- 展示小组详细信息
- 成员列表显示
- 加入/离开小组按钮
- 小组创建者额外功能:
  - 编辑小组信息
  - 删除小组
  - 移除成员
- 进入小组聊天室入口

#### 创建小组页 (CreateGroupPage)
**路由:** `/groups/create`  
**访问权限:** 已登录用户  
**功能:**
- 小组名称输入(必填)
- 小组描述输入
- 最大成员数设置
- 公开/私密选择
- 表单验证
- 创建成功后跳转到小组详情页

### 4. 聊天系统 (ChatPage)
**路由:** `/chat`  
**访问权限:** 已登录用户  
**功能:**
- 聊天列表(私聊、群聊)
- 实时消息显示
- WebSocket 连接
- 在线状态显示
- 消息发送和接收

### 5. 用户中心模块

#### 个人资料页 (ProfilePage)
**路由:** `/profile`  
**访问权限:** 已登录用户  
**功能:**
- 显示用户头像
- 用户名、邮箱、个人简介
- 加入时间
- 统计数据:
  - 加入的小组数量
  - 消息数量
  - 平均评分
- 最近活动列表
- 我的小组列表
- 收到的评价列表
- 编辑资料按钮

#### 编辑资料页 (EditProfilePage)
**路由:** `/profile/edit`  
**访问权限:** 已登录用户  
**功能:**
- 修改用户名
- 修改邮箱
- 修改个人简介
- 修改头像链接
- 头像预览
- 修改密码功能:
  - 输入当前密码
  - 输入新密码
  - 确认新密码
  - 密码强度验证
- 保存更改/取消按钮

## 🧩 组件架构

### 通用布局组件

#### Layout
**位置:** `src/components/Layout.tsx`  
**功能:**
- 应用主布局容器
- 包含导航栏
- 页面内容区域
- 响应式设计

#### Navbar
**位置:** `src/components/Navbar.tsx`  
**功能:**
- 平台 Logo 和名称
- 导航链接(首页、学习小组、聊天)
- 用户菜单:
  - 用户头像和用户名
  - 个人中心链接
  - 退出登录按钮
- 未登录状态显示登录/注册按钮

### 聊天相关组件
- ChatList: 聊天列表
- ChatWindow: 聊天窗口
- UserProfile: 用户资料卡片

## 🗄️ 状态管理 (Zustand Stores)

### authStore
**位置:** `src/stores/authStore.ts`  
**状态:**
- token: 访问令牌
- refreshToken: 刷新令牌
- user: 当前用户信息

**方法:**
- setAuth: 设置认证信息
- setUser: 更新用户信息
- updateToken: 更新令牌
- logout: 退出登录

### chatStore
**位置:** `src/stores/chatStore.ts`  
**功能:** 管理聊天状态、消息、在线用户

### groupStore (新增)
**位置:** `src/stores/groupStore.ts`  
**状态:**
- groups: 小组列表
- currentGroup: 当前选中的小组
- loading: 加载状态

**方法:**
- setGroups: 设置小组列表
- setCurrentGroup: 设置当前小组
- addGroup: 添加新小组
- updateGroup: 更新小组信息
- removeGroup: 删除小组
- setLoading: 设置加载状态

## 🔌 API 服务扩展

### 新增 API 端点 (api.ts)

#### 学习小组相关
- `getStudyGroups()`: 获取所有学习小组
- `getStudyGroup(groupId)`: 获取单个小组详情
- `createStudyGroup(data)`: 创建新小组
- `updateStudyGroup(groupId, data)`: 更新小组信息
- `deleteStudyGroup(groupId)`: 删除小组
- `joinStudyGroup(groupId)`: 加入小组
- `leaveStudyGroup(groupId)`: 离开小组
- `getStudyGroupMembers(groupId)`: 获取小组成员列表
- `manageStudyGroupMember(groupId, userId, action)`: 管理小组成员

#### 用户相关
- `getUserProfile(userId?)`: 获取用户资料
- `updateUserProfile(data)`: 更新用户资料
- `changePassword(oldPassword, newPassword)`: 修改密码

## 🛣️ 路由配置

### 路由结构
```
/ (Layout)
├── / (HomePage) - 公开访问
├── /login (LoginPage) - 未登录访问
├── /register (RegisterPage) - 未登录访问
├── /chat (ChatPage) - 需要登录
├── /groups (GroupListPage) - 需要登录
├── /groups/create (CreateGroupPage) - 需要登录
├── /groups/:groupId (GroupDetailPage) - 需要登录
├── /profile (ProfilePage) - 需要登录
└── /profile/edit (EditProfilePage) - 需要登录
```

### 路由保护
- **ProtectedRoute**: 保护需要登录的页面,未登录自动跳转到 `/login`
- **PublicRoute**: 认证页面的保护,已登录自动跳转到 `/`

## 🎨 UI/UX 特性

### 设计特点
- 使用 Tailwind CSS 进行样式设计
- 响应式布局,支持移动端和桌面端
- 统一的配色方案(Indigo 主题色)
- 卡片式设计,清晰的视觉层次
- Emoji 图标增强用户体验
- 悬浮效果和过渡动画
- 加载状态和错误提示

### 交互特性
- 实时搜索和筛选
- 表单验证和错误提示
- 成功操作的反馈
- 确认对话框(删除、离开等操作)
- 自动跳转和导航
- 响应式导航栏

## 📦 数据流

### 页面加载流程
1. 用户访问页面
2. 检查认证状态(authStore)
3. 根据路由保护规则决定访问权限
4. 加载页面数据(通过 API)
5. 更新相应的 Store
6. 渲染页面内容

### 状态更新流程
1. 用户操作触发事件
2. 调用 API 服务
3. API 返回数据
4. 更新相应的 Store
5. 组件自动重新渲染
6. 显示操作结果

## 🔐 安全特性

- JWT Token 认证
- 自动 Token 刷新
- Token 过期自动登出
- 路由级别的权限控制
- 密码强度验证
- 表单数据验证

## 🚀 部署说明

### 构建命令
```bash
cd frontend-react
npm run build
```

### 开发服务器
```bash
cd frontend-react
npm run dev
```

## 📝 下一步改进建议

1. **通知系统**: 实现通知中心页面
2. **用户评价**: 完善用户评价功能
3. **搜索优化**: 添加高级搜索和智能匹配
4. **文件上传**: 支持头像上传功能
5. **国际化**: 完善多语言支持
6. **主题切换**: 支持深色模式
7. **性能优化**: 
   - 虚拟滚动优化长列表
   - 图片懒加载
   - 代码分割
8. **PWA支持**: 添加离线功能和推送通知

## 📊 技术栈

- **框架**: React 18 + TypeScript
- **路由**: React Router v6
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **HTTP客户端**: Fetch API
- **WebSocket**: 原生 WebSocket API
- **国际化**: react-i18next

## 🎯 重构成果

✅ 完整的页面架构  
✅ 统一的布局和导航  
✅ 完善的路由保护  
✅ 学习小组完整功能  
✅ 用户中心完整功能  
✅ API 服务完全集成  
✅ 状态管理优化  
✅ 响应式设计  
✅ 良好的用户体验
