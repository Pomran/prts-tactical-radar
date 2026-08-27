# Contributing to PRTS Tactical Radar

感谢你对 PRTS 战术雷达感兴趣!这是一个社区项目,我们欢迎任何人参与。

## 项目定位

- **非商业开源项目**:本项目的所有贡献都必须是非商业性质的(详见 [LICENSE](LICENSE))
- **明日方舟同人项目**:所有明日方舟相关素材版权归 Hypergraph / Yostar 所有
- **社区驱动**:代码、文档、设计、测试、反馈,任何形式的贡献都欢迎

## 参与方式

### 不需要写代码的方式

- 报告 Bug(见下方「报告 Bug」)
- 提出功能建议(使用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.yml))
- 改进文档、翻译
- 在 GitHub Discussions 讨论想法
- 帮其他贡献者测试、复现问题
- 分享你的使用体验和反馈

### 写代码的协作流程 (Fork + PR)

本项目使用标准的 **Fork + Pull Request** 工作流。整体流程:

```
Fork 仓库 → 建分支 → 改代码 → 提 PR → 维护者审阅 → 合并到 main
```

#### 1. Fork 仓库

在 [GitHub 仓库页面](https://github.com/Pomran/prts-tactical-radar) 点击右上角 **Fork**,把项目复制到你的账号下。

#### 2. Clone 你的 Fork

```bash
git clone https://github.com/你的用户名/prts-tactical-radar.git
cd prts-tactical-radar
```

#### 3. 添加上游仓库(同步用)

```bash
git remote add upstream https://github.com/Pomran/prts-tactical-radar.git
git fetch upstream
```

以后保持与主仓库同步:

```bash
git checkout main
git pull upstream main
```

#### 4. 创建功能分支

```bash
git checkout -b feature/my-feature
```

命名规范:
- 新功能: `feature/描述`
- Bug 修复: `fix/描述`
- 文档: `docs/描述`
- 重构: `refactor/描述`

#### 5. 安装依赖并开发

```bash
npm install
npm run dev        # 启动 Vite 开发服务器 (端口 3000)
npm run dev:cf     # 同时启动本地 Cloudflare Worker (端口 8787)
```

本地调试 Worker 需要配置密钥:
```bash
cp .dev.vars.example .dev.vars   # 填入你的高德 WebService key
cp wrangler.example.jsonc wrangler.jsonc   # 填入你的 KV namespace id 等
```

#### 6. 提交前检查

在提交前,确保以下命令全部通过:

```bash
npm run lint       # TypeScript 类型检查
npm run build      # 构建生产包
```

#### 7. 提交并推送

```bash
git add .
git commit -m "feat: 添加 xxx 功能"   # 用清晰的信息描述你的改动
git push origin feature/my-feature
```

#### 8. 创建 Pull Request

到你的 Fork 仓库页面,会看到「Compare & pull request」按钮。点击后:

1. 确认 base 仓库是 `Pomran/prts-tactical-radar` 的 `main` 分支
2. 填写 PR 描述(使用 [PR 模板](.github/PULL_REQUEST_TEMPLATE.md))
3. 关联相关 Issue(如果有)

**注意**:PR 里不要包含任何 API key、token、密码等敏感信息!CI 也会检查密钥格式。

#### 9. 等待审阅

维护者会审阅你的 PR,可能会要求修改。修改后推送到同一个分支即可,PR 会自动更新。

## 开发规范

### 代码风格

- 使用 TypeScript,类型安全优先
- 遵循现有代码风格(参考 `src/` 下的已有代码)
- 组件、函数命名清晰,保持单一职责
- 不要添加无意义的注释,代码自文档化

### Git 提交信息规范

采用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 风格:

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档
- `refactor:` 重构
- `style:` 样式/格式
- `test:` 测试
- `chore:` 杂项

示例:
```
feat: 添加干员支援位展示
fix: 修复定位按钮在移动端被推出屏幕的问题
docs: 更新部署文档
```

## CI / CD

本项目使用 GitHub Actions 自动检查:

- **CI**:每个 PR 都会自动运行 `npm run lint` + `npm run build`,通过后才能合并
- **CD**:合并到 `main` 后自动部署到 Cloudflare Workers(仅限主仓库)

## 敏感信息与安全

**禁止提交以下内容到仓库:**

- 高德(AMap)WebService REST key(`GAODE_KEY`)
- 高德 JS API key / securityJsCode
- Cloudflare API Token
- KV namespace id
- 任何密码、token、cookie

这些信息请通过 GitHub Secrets 或 `.dev.vars`(本地,已被 gitignore)配置。

## 维护者指南

> 以下是给有权限的维护者的说明。

### 合并 PR

1. 检查 CI 是否通过
2. 确认 PR 不包含敏感信息
3. 用 **Squash and merge** 合并,保持 main 历史整洁
4. 合并后删除源分支(推荐)

### 分支保护

`main` 分支已开启保护:
- 禁止直接 push,所有变更必须通过 PR
- 至少需要 1 人审阅批准
- CI 必须通过

### 发布

合并到 main 后会自动部署。如需要手动触发:

```bash
npm run build
npx wrangler deploy
```

## 行为准则

请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。参与本项目即表示你同意遵守该行为准则。

## 感谢

参与就是最好的支持!无论你是写代码、报 bug、提建议还是帮测试,都让这个社区项目变得更好。

---

*本项目是非商业的明日方舟同人项目,所有贡献都应在非商业前提下进行。*
