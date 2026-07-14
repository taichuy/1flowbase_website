---
title: "从 Cloudflare 1042 到成功上线：用 Wrangler 部署 Astro 静态站实战"
description: "一次真实的 Cloudflare 部署排障：识别 Pages 与 Workers 配置错位，用最小权限 API Token、Wrangler 和 Workers Static Assets 把 Astro 网站稳定上线。"
publishedAt: 2026-07-14
lang: zh
slug: astro-cloudflare-workers-static-assets-deployment
tags:
  - Cloudflare
  - Astro
  - Wrangler
  - 部署实战
draft: true
---

一个本地构建完全正常的 Astro 静态站，部署到 Cloudflare 后却只返回：

```text
HTTP 404
error code: 1042
```

问题看起来像是代码异常，最后却发现：**网站代码根本没有部署到线上服务**。Cloudflare 上存在的是一个 Dashboard 创建的普通 Worker 模板，而项目本身按 Cloudflare Pages 编写，二者从一开始就没有接上。

这篇文章完整记录从认证、诊断、方案选择到上线验证的过程。最终方案没有创建新的 Pages 项目，而是复用已有 Worker，使用 **Cloudflare Workers Static Assets** 部署 Astro 的 `dist` 目录。

<!-- TODO(SCREENSHOT-01): 插入故障页面截图。画面应包含浏览器地址栏、HTTP 404 页面和 error code: 1042。请遮盖任何非公开账户信息。建议文件名：public/images/blog/cloudflare-1042-error.png -->
<!-- ![Cloudflare Worker 返回 1042 错误](/images/blog/cloudflare-1042-error.png) -->

## 最终架构

整个链路很简单：Astro 负责静态生成，Wrangler 负责把构建产物上传为 Worker 静态资产，Cloudflare 负责全球分发。

```text
Astro 源码
   │
   │ pnpm build
   ▼
dist/（HTML、CSS、图片、RSS、Sitemap）
   │
   │ wrangler deploy
   ▼
Cloudflare Worker + Static Assets
   │
   ├── /             200
   ├── /zh/          200
   ├── /llms.txt     200
   └── 未知路径       404.html
```

这个方案适合没有服务端渲染、没有运行时数据库、输出目录固定为 `dist` 的 Astro 站点。

## 一、先确认本地构建没有问题

排查云端部署之前，先把本地问题排除掉：

```bash
pnpm build
```

本次项目的结果是：

```text
Result (29 files):
- 0 errors
- 0 warnings
- 0 hints

11 page(s) built
Complete!
```

这一步非常重要。如果本地构建已经失败，就应该先处理 TypeScript、Astro 内容 Schema、依赖或构建命令，而不是继续修改 Cloudflare。

<!-- TODO(SCREENSHOT-02): 插入本地 pnpm build 成功截图。画面包含 0 errors、生成页面列表和 Complete，不要包含 Token 或环境变量。建议文件名：public/images/blog/astro-build-success.png -->
<!-- ![Astro 本地构建成功](/images/blog/astro-build-success.png) -->

## 二、使用 Wrangler，而不是预览版 cf

Cloudflare 正在开发面向整个平台的新 CLI `cf`，但在技术预览阶段，Workers 和 Pages 的成熟部署、日志与版本管理仍然优先使用 Wrangler。

安装并验证：

```bash
npm install --global wrangler@4.110.0
wrangler --version
```

实际项目也可以把 Wrangler 固定为开发依赖，以保证本地和 CI 使用同一版本：

```bash
pnpm add --save-dev --save-exact wrangler@4.110.0
```

如果项目依赖安装受代理或镜像影响，全局安装可以作为临时工作路径，但长期仍建议在项目中锁定版本。

## 三、创建最小权限 API Token

进入 Cloudflare 的 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)，创建自定义 Token。

权限只覆盖实际需要管理的账户和资源：

- Workers 脚本与部署所需的读取、编辑权限。
- 使用自定义域名或 Worker Routes 时，再添加相应 Zone 权限。
- 不使用 Global API Key。
- 不把 Token 写入 Git 仓库、聊天记录或命令历史。

<!-- TODO(SCREENSHOT-03): 插入 Cloudflare 创建 Token 的权限配置页。必须完全遮盖 Token、账户 ID、邮箱和不准备公开的域名。建议文件名：public/images/blog/cloudflare-token-permissions.png -->
<!-- ![Cloudflare API Token 最小权限配置](/images/blog/cloudflare-token-permissions.png) -->

为了让终端输入不回显、Token 不进入命令历史，可以把它保存在用户级配置文件中：

```bash
install -d -m 700 "$HOME/.config/cloudflare"

token=''
while [ -z "$token" ]; do
  read -rsp "请粘贴 Cloudflare API Token，然后按回车: " token
  printf '\n'
  [ -z "$token" ] && echo "未检测到输入，请重新粘贴"
done

printf 'export CLOUDFLARE_API_TOKEN=%q\n' "$token" \
  > "$HOME/.config/cloudflare/wrangler.env"
chmod 600 "$HOME/.config/cloudflare/wrangler.env"
unset token
```

加载并验证身份：

```bash
source "$HOME/.config/cloudflare/wrangler.env"
wrangler whoami
```

只要 Wrangler 能识别用户和目标账户，认证链路就已经建立。不要在文章、Issue 或日志中粘贴完整的 `whoami` 输出，因为它可能包含邮箱和 Account ID。

## 四、判断自己部署的是 Pages 还是 Worker

本次问题最关键的信号来自下面两组命令。

先列出 Pages 项目：

```bash
wrangler pages project list --json
```

输出是空数组：

```json
[]
```

再查询同名 Worker：

```bash
wrangler deployments list \
  --name 1flowbase-website \
  --json
```

Worker 确实存在，而且来源是 Dashboard 模板，但版本资源中只有 `fetch` 处理器，没有网站的静态资产。

这说明当时的真实状态是：

```text
本地期望：Astro -> dist -> Cloudflare Pages
线上实际：Dashboard Worker 模板 -> fetch handler
```

Cloudflare Dashboard 中“存在一个服务”不代表项目源码已经部署。必须结合项目类型、部署记录和资源配置一起判断。

<!-- TODO(SCREENSHOT-04): 插入 Workers & Pages 控制台中 1flowbase-website 服务概览。突出它位于 Workers、部署来源为 Dashboard；遮盖账户信息。建议文件名：public/images/blog/cloudflare-worker-before-fix.png -->
<!-- ![修复前的 Cloudflare Worker 服务](/images/blog/cloudflare-worker-before-fix.png) -->

## 五、复现线上错误

先不要急着覆盖服务，直接请求现有地址：

```bash
curl -i https://1flowbase-website.taichu2021.workers.dev/
```

修复前返回：

```text
HTTP/2 404
content-type: text/plain; charset=UTF-8

error code: 1042
```

与此同时，本地 `pnpm build` 完全通过。这组证据已经足以把问题收敛到 Cloudflare 线上服务配置，而不是 Astro 页面代码。

## 六、把现有 Worker 改成静态资产部署

在项目根目录新增 `wrangler.jsonc`：

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

这里有三个关键点：

1. `name` 必须与要复用的线上 Worker 名称一致。
2. `assets.directory` 指向 Astro 的构建产物目录。
3. `404-page` 会让未知路径返回生成好的 `404.html`，同时保持正确的 HTTP 404 状态。

在 `package.json` 中增加统一部署命令：

```json
{
  "scripts": {
    "build": "astro check && astro build",
    "deploy": "pnpm build && wrangler deploy"
  }
}
```

## 七、先 dry-run，再真正部署

先检查 Wrangler 是否正确识别静态文件：

```bash
wrangler deploy --dry-run
```

预期看到类似输出：

```text
Read 49 files from the assets directory
No bindings found.
--dry-run: exiting now.
```

确认无误后部署：

```bash
pnpm deploy
```

Wrangler 会计算资产差异，只上传新增或变化的文件，然后创建新的 Worker 版本：

```text
Success! Uploaded 37 files
Uploaded 1flowbase-website
Deployed 1flowbase-website triggers
Current Version ID: <version-id>
```

Cloudflare 会保留历史部署，因此这次操作不是不可逆覆盖；出现问题时仍可以使用历史版本回滚。

<!-- TODO(SCREENSHOT-05): 插入 wrangler deploy 成功终端截图。保留 Uploaded、Deployed、公开 URL；遮盖邮箱、Account ID、Token 和不公开的版本信息。建议文件名：public/images/blog/wrangler-deploy-success.png -->
<!-- ![Wrangler 上传静态资产并完成部署](/images/blog/wrangler-deploy-success.png) -->

## 八、修正 canonical、RSS 和 Sitemap

页面能打开不代表发布已经完整成功。Astro 的 `site` 配置会影响 canonical、RSS、Sitemap 和结构化数据。

项目原来的回退地址仍然是并不存在的 Pages 域名：

```ts
const site = process.env.SITE_URL ?? 'https://1flowbase-website.pages.dev';
```

实际部署到 Workers 后，应改成当前生产地址，或者在部署环境中设置 `SITE_URL`：

```ts
const site =
  process.env.SITE_URL ??
  'https://1flowbase-website.taichu2021.workers.dev';
```

如果以后绑定正式域名，只需要把 `SITE_URL` 改为正式域名并重新构建部署，不必改变静态资产架构。

## 九、上线后不要只测试首页

至少覆盖以下路径：

```bash
curl -o /dev/null -w '%{http_code}\n' \
  https://1flowbase-website.taichu2021.workers.dev/

curl -o /dev/null -w '%{http_code}\n' \
  https://1flowbase-website.taichu2021.workers.dev/zh/

curl -o /dev/null -w '%{http_code}\n' \
  https://1flowbase-website.taichu2021.workers.dev/llms.txt

curl -o /dev/null -w '%{http_code}\n' \
  https://1flowbase-website.taichu2021.workers.dev/definitely-not-found
```

本次最终验证结果：

| 路径 | 预期 | 实际 |
| --- | ---: | ---: |
| `/` | 200 | 200 |
| `/zh/` | 200 | 200 |
| `/features/` | 200 | 200 |
| `/llms.txt` | 200 | 200 |
| 不存在的路径 | 404 | 404 |

还要检查首页 canonical 与 Sitemap 中的域名：

```bash
curl -s https://1flowbase-website.taichu2021.workers.dev/ \
  | grep 'rel="canonical"'

curl -s https://1flowbase-website.taichu2021.workers.dev/sitemap-0.xml \
  | grep 'workers.dev'
```

<!-- TODO(SCREENSHOT-06): 插入修复后的生产首页截图，最好同时显示浏览器地址栏和完整首屏。建议文件名：public/images/blog/1flowbase-workers-live.png -->
<!-- ![部署成功后的 1flowbase 网站](/images/blog/1flowbase-workers-live.png) -->

## 常见误区

### 1. Dashboard 里有同名服务，就认为网站已经部署

服务可能只是模板、空 Worker 或旧项目。需要检查部署来源、版本资源和公开响应。

### 2. 本地构建成功，就认为云端一定是代码问题

本地成功只能证明构建链路正常。云端仍可能存在项目类型、输出目录、路由、权限或环境变量错配。

### 3. 一开始就给 API Token 全账户权限

调试方便不等于权限越大越好。按账户、Zone 和资源范围配置最小权限，排障完成后还可以继续收紧。

### 4. 首页 200 就结束验证

多语言路由、静态资源、RSS、Sitemap、canonical 和 404 都可能单独出错。

### 5. 把 Workers 和 Pages 当成完全相同的部署入口

两者都能托管静态网站，但项目、命令和线上资源不是同一个概念。先识别当前资源，再选择迁移还是复用，能避免制造第二套重复服务。

## 结论

这次故障的修复代码很少，真正重要的是诊断顺序：

```text
先验证本地构建
  -> 再验证认证和账户
  -> 区分 Pages 与 Workers
  -> 读取部署元数据
  -> 复现线上响应
  -> 用 dry-run 验证配置
  -> 部署新版本
  -> 检查全部关键路由和 SEO 输出
```

当本地静态站与 Cloudflare 线上资源类型不一致时，继续盲改页面代码只会浪费时间。先确认“真正部署了什么”，往往比研究错误码本身更快找到答案。

