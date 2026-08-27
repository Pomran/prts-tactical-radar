# 安全策略

## 支持的版本

| 版本 | 支持状态 |
|------|----------|
| main 分支(最新) | 支持 |

## 报告安全问题

**请不要在公开的 issue 中披露安全漏洞。**

如果你发现安全问题,请:

1. 发送邮件或通过 GitHub 的 [安全漏洞报告](https://github.com/Pomran/prts-tactical-radar/security/advisories/new) 功能(Private vulnerability reporting)提交
2. 或者直接联系仓库维护者

我们会:
- 在 48 小时内确认收到你的报告
- 评估漏洞严重程度并制定修复计划
- 修复后公开披露(如适用)

## 本项目的安全边界

本项目部署于 Cloudflare Workers,代码公开在 GitHub。请注意:

- **前端**的高德(AMap)JS API key 属于公开 key,请勿在个人部署中使用他人的 key
- **后端**的高德 WebService REST key 通过 `GAODE_KEY` Secret 注入,请勿提交到代码仓库
- Cloudflare 账号 token、KV namespace id 等属于敏感信息,请勿提交
- 所有贡献者提交 PR 时,**禁止包含任何 API key、token、密码**等敏感信息
