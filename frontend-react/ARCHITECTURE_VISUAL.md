# 前端架构可视化

## 📊 页面结构树

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│                  (BrowserRouter)                             │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │           Layout.tsx                 │
        │  ┌──────────────────────────────┐   │
        │  │      Navbar.tsx              │   │
        │  │  (Logo, Navigation, User)    │   │
        │  └──────────────────────────────┘   │
        │  ┌──────────────────────────────┐   │
        │  │      <Outlet />              │   │───┐
        │  │   (Page Content Area)        │   │   │
        │  └──────────────────────────────┘   │   │
        └──────────────────────────────────────┘   │
                                                    │
        ┌───────────────────────────────────────────┘
        │
        ├─── 🏠 HomePage (/)
        │    Public access
        │    - Welcome banner
        │    - Stats, Features
        │    - Recommended groups
        │
        ├─── 🔐 Auth Pages
        │    ├── LoginPage (/login)
        │    └── RegisterPage (/register)
        │    Public only (redirect if logged in)
        │
        ├─── 💬 ChatPage (/chat)
        │    Protected route
        │    - ChatList
        │    - ChatWindow
        │    - UserProfile
        │
        ├─── 👥 Study Groups
        │    Protected routes
        │    ├── GroupListPage (/groups)
        │    │   - Search & Filter
        │    │   - Group cards
        │    │
        │    ├── GroupDetailPage (/groups/:id)
        │    │   - Group info
        │    │   - Members list
        │    │   - Join/Leave
        │    │
        │    └── CreateGroupPage (/groups/create)
        │        - Create form
        │
        └─── 👤 User Profile
             Protected routes
             ├── ProfilePage (/profile)
             │   - User info
             │   - Stats
             │   - Activity
             │
             └── EditProfilePage (/profile/edit)
                 - Edit form
                 - Change password
```

## 🔄 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                     User Actions                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   React Components                           │
│  HomePage │ GroupList │ Profile │ Chat │ etc.                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──────────────┐
                  ▼              ▼
         ┌────────────────┐  ┌──────────────┐
         │  Zustand Store │  │  API Client  │
         ├────────────────┤  ├──────────────┤
         │ • authStore    │  │ • login      │
         │ • chatStore    │  │ • getGroups  │
         │ • groupStore   │  │ • getProfile │
         └────────┬───────┘  └──────┬───────┘
                  │                  │
                  │                  ▼
                  │          ┌───────────────┐
                  │          │  Backend API  │
                  │          │  (Cloudflare) │
                  │          └───────┬───────┘
                  │                  │
                  │                  ▼
                  │          ┌───────────────┐
                  │          │   Database    │
                  │          │   (D1/KV)     │
                  │          └───────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  LocalStorage  │
         │  (Persist)     │
         └────────────────┘
```

## 🏗️ 组件层次结构

```
App
 │
 ├── Layout
 │    ├── Navbar
 │    │    ├── Logo
 │    │    ├── NavLinks
 │    │    └── UserMenu
 │    │
 │    └── Main (Outlet)
 │         │
 │         ├── HomePage
 │         │    ├── HeroSection
 │         │    ├── StatsSection
 │         │    ├── FeaturesGrid
 │         │    ├── RecommendedGroups
 │         │    └── ActivityFeed
 │         │
 │         ├── GroupListPage
 │         │    ├── SearchBar
 │         │    ├── FilterButtons
 │         │    └── GroupGrid
 │         │         └── GroupCard []
 │         │
 │         ├── GroupDetailPage
 │         │    ├── GroupHeader
 │         │    ├── MembersList
 │         │    │    └── MemberCard []
 │         │    └── ChatButton
 │         │
 │         ├── CreateGroupPage
 │         │    └── GroupForm
 │         │
 │         ├── ProfilePage
 │         │    ├── ProfileHeader
 │         │    ├── StatsCards
 │         │    ├── ActivitySection
 │         │    ├── GroupsSection
 │         │    └── ReviewsSection
 │         │
 │         ├── EditProfilePage
 │         │    ├── ProfileForm
 │         │    └── PasswordSection
 │         │
 │         └── ChatPage
 │              ├── ChatList
 │              ├── ChatWindow
 │              └── UserProfile
 │
 └── [Route Guards]
      ├── ProtectedRoute
      └── PublicRoute
```

## 📦 Store 状态结构

```
authStore
├── token: string | null
├── refreshToken: string | null
├── user: User | null
└── methods
    ├── setAuth(token, refreshToken, user)
    ├── setUser(user)
    ├── updateToken(token, refreshToken)
    └── logout()

chatStore
├── chats: Chat[]
├── currentChat: Chat | null
├── messages: Message[]
├── onlineUsers: Set<number>
└── methods
    ├── setChats(chats)
    ├── setCurrentChat(chat)
    ├── addMessage(message)
    ├── setOnlineUsers(users)
    └── ...

groupStore (NEW)
├── groups: StudyGroup[]
├── currentGroup: StudyGroup | null
├── loading: boolean
└── methods
    ├── setGroups(groups)
    ├── setCurrentGroup(group)
    ├── addGroup(group)
    ├── updateGroup(id, updates)
    ├── removeGroup(id)
    └── setLoading(loading)
```

## 🔐 路由保护流程

```
User visits URL
      │
      ▼
┌──────────────┐
│ Check route  │
│    type      │
└──────┬───────┘
       │
       ├─── Public Route ────────┐
       │                         │
       ├─── Protected Route ─────┤
       │                         │
       └─── Public Only ─────────┤
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │ Check auth status   │
                    │ (token in authStore)│
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         token exists    no token      token exists
                │              │              │
                ▼              ▼              ▼
        ┌──────────────┐  ┌──────────┐  ┌──────────┐
        │ Show page    │  │ Redirect │  │ Redirect │
        │              │  │ to /login│  │ to /     │
        └──────────────┘  └──────────┘  └──────────┘
         (Protected)      (Protected)    (Public Only)
```

## 🎨 样式系统

```
Tailwind CSS
    │
    ├── Colors
    │   ├── Primary: Indigo (600, 700, 50, 100)
    │   ├── Success: Green (600, 50, 100)
    │   ├── Warning: Yellow (600, 50, 100)
    │   ├── Error: Red (600, 50, 100)
    │   └── Gray: (50, 100, 200, 300, 600, 700, 900)
    │
    ├── Components
    │   ├── Buttons
    │   │   ├── Primary: bg-indigo-600 hover:bg-indigo-700
    │   │   ├── Secondary: bg-gray-100 hover:bg-gray-200
    │   │   └── Danger: bg-red-50 text-red-600
    │   │
    │   ├── Cards
    │   │   ├── bg-white rounded-xl shadow-sm
    │   │   └── border border-gray-200
    │   │
    │   ├── Forms
    │   │   ├── Input: border rounded-lg focus:ring-2
    │   │   └── Label: text-sm font-medium text-gray-700
    │   │
    │   └── Badges
    │       └── px-3 py-1 rounded-full text-xs
    │
    └── Utilities
        ├── Spacing: p-4, p-6, p-8, gap-4, gap-6
        ├── Typography: text-xl, text-2xl, font-bold
        └── Effects: hover:shadow-md, transition-colors
```

## 🚀 部署流程

```
Development
    │
    ├── npm run dev ──────────────> Local Dev Server (Vite)
    │                                http://localhost:5173
    │
    └── Code Changes ─────────────> Hot Module Reload (HMR)
                                    
Production
    │
    ├── npm run build ────────────> Build with Vite
    │                                ├── Bundle optimization
    │                                ├── Code splitting
    │                                └── Asset optimization
    │                                
    └── Output: dist/
         ├── index.html
         └── assets/
              ├── index-[hash].js
              └── index-[hash].css

Deployment
    │
    └── npx wrangler deploy ──────> Cloudflare Workers
         │                           ├── Upload assets
         │                           ├── Configure routes
         │                           └── Activate worker
         │
         └── Live at: your-domain.workers.dev
```

## 📱 响应式设计断点

```
Mobile First Approach

sm:  640px  ────> Tablets (portrait)
md:  768px  ────> Tablets (landscape)
lg:  1024px ────> Desktop
xl:  1280px ────> Large Desktop

Examples:
- grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- flex-col md:flex-row
- text-sm md:text-base lg:text-lg
```

## 🔄 实时通信架构

```
Client (Browser)
    │
    ├── WebSocket Connection
    │   │
    │   └── wsClient.ts
    │       ├── connect()
    │       ├── sendMessage()
    │       ├── onMessage()
    │       └── disconnect()
    │
    ▼
Cloudflare Worker (Backend)
    │
    ├── Durable Objects
    │   └── ChatRoom
    │       ├── handleWebSocket()
    │       ├── broadcast()
    │       └── userJoin/Leave()
    │
    └── REST API
        ├── POST /messages/user
        ├── POST /messages/group
        └── GET /messages/online
```

这个可视化文档帮助理解整个前端架构的结构和数据流!
