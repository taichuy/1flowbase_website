# 1flowbase Website：Cloudflare Workers Static Assets 部署与排障手册

本文档是 `1flowbase_website` 的部署、验证、回滚和常见故障处理 SOP。面向维护者使用，不包含任何真实 API Token。

## 1. 当前部署模型

| 项目 | 当前值 |
| --- | --- |
| 应用类型 | Astro 纯静态站点 |
| 构建命令 | `pnpm build` |
| 构建目录 | `dist/` |
| Cloudflare 产品 | Workers Static Assets |
| Worker 名称 | `1flowbase-website` |
| 默认生产地址 | `https://1flowbase-website.taichu2021.workers.dev` |
| Wrangler 配置 | `wrangler.jsonc` |
| 服务端运行时代码 | 无 |
| 数据库与运行时绑定 | 无 |

部署链路：

```text
src/ + public/
      │
      │ pnpm build
      ▼
    dist/
      │
      │ wrangler deploy
      ▼
1flowbase-website Worker
      │
      ▼
workers.dev / 后续自定义域名
```

## 2. 前置要求

- Node.js 24 或更高版本。
- pnpm 11。
- Wrangler 4.110.0 或经过项目验证的更新版本。
- 对目标 Cloudflare 账户具有相应权限的 API Token。
- 工作区中不存在未确认的冲突修改。

检查本地版本：

```bash
node --version
pnpm --version
wrangler --version
```

## 3. Wrangler 安装

当前机器使用全局 Wrangler：

```bash
npm install --global wrangler@4.110.0
```

对于 CI 或新开发环境，优先尝试固定为项目开发依赖：

```bash
pnpm add --save-dev --save-exact wrangler@4.110.0
```

如果代理导致 `workerd` 大文件下载超时，可以先使用已经验证的全局 Wrangler 完成部署，不要提交未完成的依赖或不一致的锁文件。

## 4. API Token 管理

Token 创建入口：

<https://dash.cloudflare.com/profile/api-tokens>

原则：

1. 使用自定义 API Token，不使用 Global API Key。
2. 资源范围只选择目标账户和必要 Zone。
3. 只授予 Workers 部署所需权限；需要 Routes 或自定义域名时再增加 Zone 权限。
4. Token 不进入仓库、Issue、聊天、截图或 shell 历史。

本机凭据文件：

```text
~/.config/cloudflare/wrangler.env
```

权限必须为 `600`：

```bash
stat -c '%a %n' "$HOME/.config/cloudflare/wrangler.env"
```

预期输出：

```text
600 /home/<user>/.config/cloudflare/wrangler.env
```

加载并验证：

```bash
source "$HOME/.config/cloudflare/wrangler.env"
wrangler whoami
```

不要把完整 `whoami` 输出复制到公开位置。

<!-- TODO(SCREENSHOT-DOC-01): 添加一张脱敏后的 wrangler whoami 成功截图。遮盖邮箱、Account ID 和所有凭据。建议路径：docs/images/wrangler-whoami-redacted.png -->

## 5. 项目配置

`wrangler.jsonc`：

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "1flowbase-website",
  "compatibility_date": "2026-07-14",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

字段说明：

| 字段 | 作用 | 修改条件 |
| --- | --- | --- |
| `name` | 对应 Cloudflare Worker 名称 | 迁移到新 Worker 时 |
| `compatibility_date` | 固定 Cloudflare 运行时兼容行为 | 评估变更并完成验证后 |
| `assets.directory` | 指定待上传静态目录 | Astro 输出目录变化时 |
| `html_handling` | 自动处理目录式 URL 和尾斜杠 | 路由策略变化时 |
| `not_found_handling` | 使用生成的 `404.html` | 自定义错误页策略变化时 |

Astro 的生产站点地址由 `SITE_URL` 决定：

```ts
const site =
  process.env.SITE_URL ??
  'https://1flowbase-website.taichu2021.workers.dev';
```

绑定正式域名后，部署时应使用正式域名：

```bash
SITE_URL='https://example.com' pnpm deploy
```

## 6. 标准部署流程

### 6.1 确认 Git 状态

```bash
git status --short
```

明确区分本次部署修改和其他未提交修改，不要覆盖无关工作。

### 6.2 加载凭据

```bash
source "$HOME/.config/cloudflare/wrangler.env"
wrangler whoami
```

### 6.3 构建

```bash
pnpm build
```

通过标准：

- Astro check 为 0 errors。
- 构建命令退出码为 0。
- `dist/index.html` 存在。
- `dist/404.html` 存在。
- `dist/sitemap-index.xml` 和 `dist/rss.xml` 存在。

快速检查：

```bash
test -f dist/index.html
test -f dist/404.html
test -f dist/sitemap-index.xml
test -f dist/rss.xml
```

### 6.4 Dry-run

```bash
wrangler deploy --dry-run
```

确认 Wrangler 能读取 `dist` 中的静态文件，并且没有配置或绑定错误。

### 6.5 部署

```bash
pnpm deploy
```

部署成功后记录：

- 部署时间。
- Current Version ID。
- 资产上传数量。
- 生产 URL。
- 对应 Git commit。

不要记录 API Token。

<!-- TODO(SCREENSHOT-DOC-02): 添加 Wrangler 部署成功截图模板，标注应保留的 Uploaded、Deployed、URL 与 Version ID，以及必须遮盖的信息。建议路径：docs/images/wrangler-deploy-redacted.png -->

## 7. 上线验证清单

### 7.1 HTTP 状态

```bash
BASE_URL='https://1flowbase-website.taichu2021.workers.dev'

for path in / /zh/ /features/ /llms.txt /definitely-not-found; do
  curl -sS -o /dev/null \
    -w "path=$path status=%{http_code}\n" \
    "$BASE_URL$path"
done
```

预期：

| 路径 | 状态码 |
| --- | ---: |
| `/` | 200 |
| `/zh/` | 200 |
| `/features/` | 200 |
| `/llms.txt` | 200 |
| `/definitely-not-found` | 404 |

### 7.2 页面内容

```bash
curl -sS "$BASE_URL/" | grep '<title>'
curl -sS "$BASE_URL/zh/" | grep '<title>'
```

确认英文和中文页面标题正确，页面内容不是 Cloudflare 模板或错误页。

### 7.3 canonical

```bash
curl -sS "$BASE_URL/" | grep 'rel="canonical"'
```

canonical 必须指向当前生产域名，不能残留旧的 `pages.dev` 地址。

### 7.4 Sitemap 和 RSS

```bash
curl -sS "$BASE_URL/sitemap-0.xml" | grep "$BASE_URL"
curl -sS "$BASE_URL/rss.xml" | grep "$BASE_URL"
```

### 7.5 Cloudflare 当前版本

```bash
wrangler deployments status \
  --name 1flowbase-website \
  --json
```

确认最新 Version ID 获得 100% 流量。

## 8. 故障诊断

### 8.1 `wrangler whoami` 显示未认证

检查变量是否加载，但不要输出变量值：

```bash
source "$HOME/.config/cloudflare/wrangler.env"

if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Token loaded, length=${#CLOUDFLARE_API_TOKEN}"
else
  echo "Token missing"
fi
```

常见原因：

- 凭据文件中保存的是空字符串。
- 变量名不是 `CLOUDFLARE_API_TOKEN`。
- 当前 shell 没有 `source` 凭据文件。
- Token 已删除、过期或权限不足。

### 8.2 本地构建成功，线上返回 `1042`

先判断实际部署资源：

```bash
wrangler pages project list --json

wrangler deployments list \
  --name 1flowbase-website \
  --json
```

如果 Pages 列表为空，但存在同名 Worker，检查该 Worker 是否真的包含静态资产。不要仅凭 Dashboard 中的服务名称判断网站已部署。

### 8.3 首页正常，子路径 404

检查：

- `dist` 中是否存在对应目录的 `index.html`。
- `html_handling` 是否为 `auto-trailing-slash`。
- Astro `trailingSlash` 配置是否与部署策略一致。
- 链接是否遗漏语言前缀或尾斜杠。

### 8.4 自定义 404 返回 200

确认配置包含：

```jsonc
"not_found_handling": "404-page"
```

并确认 `dist/404.html` 存在。

### 8.5 canonical 或 Sitemap 指向错误域名

检查 `astro.config.ts` 中的 `site`，以及部署 shell 中的 `SITE_URL`。修改后必须重新执行构建和部署，因为这些 URL 在静态生成阶段写入文件。

### 8.6 Wrangler 通过代理下载或请求失败

Wrangler 会识别常见代理环境变量。先确认：

```bash
env | grep -E '^(HTTP|HTTPS|ALL|NO)_PROXY='
```

输出代理配置时注意不要附带含密码的代理 URL。若项目内安装 `workerd` 大文件持续超时，可暂时使用已验证的全局 Wrangler，但不要提交半成品 `node_modules` 或不一致锁文件。

### 8.7 查看运行时日志

当前站点是纯静态资产，通常不需要运行时日志。如果以后加入 Worker 代码，可以使用：

```bash
wrangler tail 1flowbase-website --format pretty
```

高流量环境应增加过滤条件，避免采样和噪声。

## 9. 回滚

部署前查看历史：

```bash
wrangler deployments list \
  --name 1flowbase-website \
  --json
```

回滚到已知正常版本：

```bash
wrangler rollback <VERSION_ID> \
  --name 1flowbase-website
```

回滚属于生产变更，执行前必须：

1. 核对 Worker 名称。
2. 核对目标 Version ID。
3. 记录回滚原因。
4. 回滚后重新执行第 7 节验证清单。

## 10. Pages 与 Workers Static Assets 的选择

当前项目继续使用 Workers Static Assets，原因是：

- 已有同名 Worker，可以直接修复并保留历史版本。
- Astro 输出完全静态，不需要 Pages Functions。
- Wrangler 能统一完成资产上传、版本管理和回滚。
- 避免额外创建一套重复 Pages 项目。

以下情况可以重新评估 Pages：

- 团队明确依赖 Pages 的 Git 自动构建工作流。
- 已有成熟的 Pages Preview 和分支环境流程。
- 需要与现有 Pages 项目保持一致的管理方式。

迁移前先确认域名、预览环境、构建变量和回滚策略，不要同时维护两个都对外提供生产流量的同名站点。

## 11. 安全要求

- 永远不要提交 `~/.config/cloudflare/wrangler.env`。
- 永远不要把 API Token 写进 `wrangler.jsonc`、`.env.example` 或 Markdown 示例。
- 截图必须遮盖 Token、邮箱、Account ID 和私有域名。
- 优先使用资源范围受限的 API Token。
- Token 疑似泄漏时立即撤销并重新创建。
- 自动化部署使用独立 Token，不复用个人高权限 Token。

## 12. 截图待办索引

| 标记 | 截图内容 | 必须脱敏 |
| --- | --- | --- |
| `TODO(SCREENSHOT-DOC-01)` | `wrangler whoami` 认证成功 | 邮箱、Account ID、Token |
| `TODO(SCREENSHOT-DOC-02)` | Wrangler 部署成功 | 邮箱、Account ID、Token、私有版本信息 |

添加图片后，把对应 HTML 注释替换成普通 Markdown 图片引用，并再次执行 Markdown 检查与站点构建。

