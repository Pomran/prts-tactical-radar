# Changelog

本项目所有重要变更都会记录在此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

### 新增
- 隐私政策弹窗 + 页脚(数据收集/存储/删除说明)
- Worker 写入接口限流(IP 级,10 次/10 秒,防滥用)

### 改进
- 开源为社区项目:默认分支 `main`、Fork+PR 协作流程、CI/CD 自动化、Issue/PR 模板、行为准则、安全策略
- README 增加社区贡献引导区与在线预览链接

### 技术
- CI/CD 升级至 Node 22(wrangler 4.x 要求)
- CD 改用 `npx wrangler deploy` 替代 wrangler-action,规避依赖冲突
- 移除 bun.lock,统一使用 npm

## [1.0.0] - 2026-08-27

### 新增
- 基于高德地图的博士在线雷达(React 19 + Vite + Tailwind + Leaflet)
- 干员助理选择、理智互动、战术迷彩隐私防护
- 附近博士名录、战术密话与日志
- 定位链路:浏览器 GPS → 高德 → Cloudflare IP 定位
- Cloudflare Worker 后端(雷达扫描 / 广播 / 互动 / 收件箱 / 逆地理编码)
- KV 写入节流优化(客户端 5 分钟节流 + 大半径粗粒度桶)
- 微信小程序配套(独立维护,不在本仓库)
