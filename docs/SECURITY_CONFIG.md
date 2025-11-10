# 🔐 安全配置指南

## JWT Secret 配置

### 生产环境（Cloudflare Workers）

⚠️ **重要：不要在 `wrangler.jsonc` 中存储生产环境的密钥！**

1. **设置 JWT Secret**
   ```powershell
   npx wrangler secret put JWT_SECRET
   ```
   
   系统会提示你输入密钥值（输入时不会显示）。

2. **验证密钥已设置**
   ```powershell
   npx wrangler secret list
   ```

3. **更新密钥（如果需要）**
   ```powershell
   npx wrangler secret put JWT_SECRET
   ```

4. **删除密钥（小心！）**
   ```powershell
   npx wrangler secret delete JWT_SECRET
   ```

## 环境变量配置

Cloudflare Workers 的环境变量设置方式：

1. **Secrets**（推荐用于敏感信息）- 通过 `wrangler secret` 设置
2. **vars** - 在 `wrangler.jsonc` 中定义（用于非敏感配置）

## 数据库和 KV 配置

### 配置方法

**1. 复制配置模板**

```powershell
Copy-Item wrangler.jsonc.example wrangler.jsonc
```

**2. 获取资源 ID**

获取 D1 数据库 ID：
```powershell
npx wrangler d1 list
```

获取 KV Namespace ID：
```powershell
npx wrangler kv:namespace list
```

**3. 编辑 wrangler.jsonc**

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "studybuddyplatformdb",
    "database_id": "your-actual-database-id"
  }
],
"kv_namespaces": [
  {
    "binding": "ONLINE_STATUS",
    "id": "your-actual-kv-id",
    "preview_id": "your-actual-preview-kv-id"
  }
]
```

### 安全说明

**为什么将 wrangler.jsonc 添加到 .gitignore？**

✅ **资源 ID 是敏感信息** - 虽然无法单独使用，但最好不公开
✅ **团队协作更安全** - 每个开发者使用自己的资源
✅ **防止意外泄露** - 避免将生产环境 ID 提交到公开仓库

**这些 ID 的特性：**

- 🔑 它们是资源标识符，不是访问密钥
- 🔒 访问需要 Cloudflare 账户权限和 API Token
- ⚠️ 但仍建议不公开共享

### 最佳实践建议

1. **环境隔离**
   - 开发环境：使用专门的 D1 数据库和 KV
   - 生产环境：使用独立的资源
   - 测试环境：可以共享开发资源

2. **访问控制**
   - 使用 Cloudflare API Token 而非全局 API Key
   - 为不同环境设置不同的 Token
   - 定期轮换 API Token

3. **监控和日志**
   - 启用 Cloudflare 审计日志
   - 监控异常访问模式
   - 设置访问告警

### 获取资源 ID

如果你需要创建新的数据库或 KV：

**创建 D1 数据库：**
```powershell
npx wrangler d1 create your-database-name
# 输出会包含 database_id
```

**创建 KV Namespace：**
```powershell
npx wrangler kv:namespace create "ONLINE_STATUS"
# 输出会包含 id

npx wrangler kv:namespace create "ONLINE_STATUS" --preview
# 输出会包含 preview_id
```

## 测试账号安全

### ⚠️ 测试脚本警告

测试脚本中使用的账号：
- ✅ **alice@example.com / password**
- ✅ **bob@example.com / password**
- ✅ **charlie@example.com / password**

**重要提示：**
1. 这些是测试账号，仅用于开发/测试环境
2. 生产环境应该删除或更改这些测试账号
3. 确保生产环境使用强密码

### 清理测试数据

在部署到生产前：

```sql
-- 删除测试用户
DELETE FROM users WHERE email LIKE '%@example.com';

-- 或者重置整个数据库
DROP TABLE IF EXISTS users;
-- 然后重新运行迁移
```

## 密码安全

### 当前实现

- ✅ 使用 bcrypt 进行密码哈希
- ✅ 密码不以明文存储
- ✅ 使用盐值（bcrypt 自动处理）

### 最佳实践

1. **强制密码策略**
   - 最小长度：8 个字符
   - 包含大小写字母、数字、特殊字符

2. **密码验证**
   ```typescript
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   ```

3. **账户安全**
   - 实现登录尝试限制
   - 添加验证码
   - 启用双因素认证（2FA）

## 部署前检查清单

### ✅ 必须完成

- [ ] 设置生产环境 JWT_SECRET
  ```powershell
  npx wrangler secret put JWT_SECRET
  ```

- [ ] 验证密钥已设置
  ```powershell
  npx wrangler secret list
  ```

- [ ] 删除或更改测试账号密码

### 🔄 建议完成

- [ ] 审查所有 API 端点的权限
- [ ] 启用 CORS 配置
- [ ] 配置速率限制
- [ ] 设置监控和日志
- [ ] 准备事故响应计划

## 常见问题

### Q: 如何在生产环境更新密钥？

**A:** 使用 `npx wrangler secret put JWT_SECRET` 重新设置即可。

### Q: 密钥应该多长？

**A:** 建议至少 32 个字符。使用 64 个字符更安全。

## 紧急情况处理

### 密钥泄露

如果密钥泄露：

1. **立即轮换密钥**
   ```powershell
   npx wrangler secret put JWT_SECRET
   ```

2. **撤销所有现有令牌**
   - 清除 KV 存储中的刷新令牌
   - 通知用户重新登录

3. **审查访问日志**
   - 检查是否有异常访问
   - 识别受影响的账户

4. **通知用户**
   - 如果有用户数据受影响
   - 建议用户更改密码

### 数据库凭据泄露

1. **轮换数据库凭据**（如果可能）
2. **检查数据库访问日志**
3. **评估数据泄露风险**
4. **遵守数据保护法规**（GDPR 等）

## 资源链接

- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [JWT 最佳实践](https://tools.ietf.org/html/rfc8725)
- [OWASP 密码存储备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

**最后更新**: 2025年11月10日

