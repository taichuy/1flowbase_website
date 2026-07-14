---
title: "在 Cloudflare 部署官网：无需服务器，甚至不需要域名"
description: "从零搭建一个 Astro 静态官网，通过 Wrangler 部署到 Cloudflare Workers Static Assets，并直接获得可公网访问的 workers.dev 地址。"
publishedAt: 2026-07-14
lang: zh
slug: deploy-website-to-cloudflare-without-server-or-domain
tags:
  - Cloudflare
  - Astro
  - Wrangler
  - 静态网站
draft: true
---

很多个人开发者和开源项目都需要一个官网：介绍产品是什么、展示功能、提供文档入口、发布博客，以及告诉用户如何开始使用。

这类网站通常没有复杂的后端逻辑。页面内容在构建时就可以生成 HTML、CSS 和 JavaScript，部署后只需要有人把这些静态文件稳定地发送给访问者。

传统做法往往是购买服务器、安装 Nginx、配置 HTTPS、注册域名，再处理续费、证书和服务器安全。但如果你的目标只是上线一个官网、公开博客或者产品介绍页，这套基础设施可能比网站本身还复杂。

Cloudflare 提供了更直接的路径：

```text
静态网站项目
  -> 本地构建为 dist/
  -> Wrangler 上传到 Cloudflare
  -> 自动获得公网 HTTPS 地址
```

你不需要购买服务器，甚至可以暂时不买域名。部署完成后，Cloudflare 会分配一个类似下面的地址：

```text
https://your-website.your-account.workers.dev
```

这个地址可以直接从公网访问，并且默认使用 HTTPS。以后有正式域名，再绑定到同一个项目即可。

<!-- TODO(SCREENSHOT-01): 添加文章完成效果图。截图应包含浏览器地址栏中的 workers.dev 公网地址和网站首页首屏。建议文件名：public/images/blog/cloudflare-workers-website-live.png -->
<!-- ![无需服务器和域名即可访问的 Cloudflare 官网](/images/blog/cloudflare-workers-website-live.png) -->

## 这篇文章适合什么场景

这套方案主要面向可以生成静态文件的网站：

- 产品官网和开源项目官网。
- Landing Page、活动页和作品集。
- 公开博客、技术博客和更新日志。
- 文档站、帮助中心和公开知识库。
- 不依赖服务端数据库的公司介绍网站。

如果网站需要传统常驻服务器、私有数据库连接或者复杂的服务端状态，需要继续评估 Workers、D1、Pages Functions 或其他后端方案。但对于纯静态网站，Workers Static Assets 已经足够。

## 最终会得到什么

完成本教程后，你会拥有：

1. 一个可在本地开发的 Astro 静态网站。
2. 一套可以重复执行的构建和部署命令。
3. 一个 Cloudflare Workers Static Assets 项目。
4. 一个无需购买域名即可公网访问的 `workers.dev` 地址。
5. 一套可以交给 AI Agent 执行的 CLI 部署流程。

整体结构如下：

```text
Astro / AstroWind 项目
        │
        │ pnpm build
        ▼
      dist/
        │
        │ wrangler deploy
        ▼
Cloudflare Workers Static Assets
        │
        └── https://<项目名>.<账户子域>.workers.dev
```

## 准备材料

开始之前，只需要准备三样东西。

### 1. Cloudflare 账号

前往 [Cloudflare](https://dash.cloudflare.com/sign-up) 注册账号。仅使用 `workers.dev` 公网地址时，不需要提前购买或接入域名。

### 2. 静态网站项目

本文使用 Astro。你可以从空项目开始，也可以直接使用成熟模板。

这里推荐 [AstroWind](https://github.com/arthelokyo/astrowind)：它是一个基于 Astro 和 Tailwind CSS 的开源模板，内置官网、Landing Page 和博客常用结构。

本文同时以 1flowbase 官网的实际部署过程作为参考。1flowbase 是一个开源 AI Gateway 项目，可以在附录中找到仓库地址。

### 3. Wrangler CLI

Wrangler 是 Cloudflare 官方开源的命令行工具，用于开发、构建、部署和管理 Workers。

它还有一个很实用的价值：配置授权后，AI 编程工具也可以调用 Wrangler 完成构建检查、部署、读取版本信息和验证线上页面。你不必在 Dashboard 中反复点击配置。

<!-- TODO(SCREENSHOT-02): 添加准备材料拼图或三张小图：Cloudflare 控制台、AstroWind GitHub 页面、终端中的 wrangler --version。所有账户信息需要脱敏。建议文件名：public/images/blog/cloudflare-deployment-prerequisites.png -->
<!-- ![Cloudflare、AstroWind 和 Wrangler](/images/blog/cloudflare-deployment-prerequisites.png) -->

## 第一步：从零创建静态官网

### 方案 A：使用 AstroWind 模板

克隆 AstroWind：

```bash
git clone https://github.com/arthelokyo/astrowind.git my-website
cd my-website
```

安装依赖并启动本地开发服务器：

```bash
corepack enable
pnpm install
pnpm dev
```

终端会显示本地地址，通常是：

```text
http://localhost:4321
```

用浏览器打开它，就能看到模板网站。

接下来修改站点名称、首页标题、产品介绍、导航、页脚、Logo 和博客内容。第一次上线不必一次写完所有页面，可以先完成最重要的内容：

- 你是谁，或者产品叫什么。
- 解决什么问题。
- 用户为什么需要它。
- 用户下一步应该点击什么。
- GitHub、文档或者联系方式在哪里。

<!-- TODO(SCREENSHOT-03): 添加 AstroWind 本地开发页面截图。建议同时展示浏览器中的 localhost:4321 和编辑器项目结构。建议文件名：public/images/blog/astrowind-local-development.png -->
<!-- ![AstroWind 本地开发环境](/images/blog/astrowind-local-development.png) -->

### 方案 B：创建一个空 Astro 项目

如果不需要模板，也可以从 Astro 官方初始化器开始：

```bash
pnpm create astro@latest my-website
cd my-website
pnpm install
pnpm dev
```

选择静态输出即可。对于纯静态官网，不需要添加服务端 Adapter。

## 第二步：确认项目能生成静态文件

Cloudflare 最终接收的不是开发服务器，而是构建后的静态目录。因此在配置云端之前，先执行：

```bash
pnpm build
```

Astro 默认把生产文件写到：

```text
dist/
```

检查核心文件：

```bash
test -f dist/index.html && echo "首页已生成"
```

也可以在本地预览生产结果：

```bash
pnpm preview
```

只有本地构建成功，才继续下一步。否则应该先处理依赖、TypeScript、内容 Schema 或图片构建错误。

<!-- TODO(SCREENSHOT-04): 添加 pnpm build 成功截图。保留构建完成、页面数量和 dist 输出目录，不要包含敏感环境变量。建议文件名：public/images/blog/astro-production-build.png -->
<!-- ![Astro 成功生成静态网站](/images/blog/astro-production-build.png) -->

## 第三步：安装 Cloudflare Wrangler

确认本机已经安装 Node.js，然后安装 Wrangler：

```bash
npm install --global wrangler
```

验证：

```bash
wrangler --version
```

也可以把 Wrangler 固定为项目开发依赖，让团队和 CI 使用一致版本：

```bash
pnpm add --save-dev --save-exact wrangler
```

本文实际部署使用的是 Wrangler 4.x。Cloudflare CLI 更新较快，生产项目建议固定一个已经验证的版本，再主动安排升级。

## 第四步：授权 Wrangler 访问 Cloudflare

个人在本机操作时，可以直接执行：

```bash
wrangler login
```

Wrangler 会打开浏览器，让你登录 Cloudflare 并确认授权。

如果准备让 AI Agent 或自动化脚本协助部署，更适合使用 API Token。创建入口：

<https://dash.cloudflare.com/profile/api-tokens>

创建自定义 Token 时遵循最小权限原则：

- 只选择要部署网站的 Cloudflare 账户。
- 只授予 Workers 部署所需的读取和编辑权限。
- 暂时不绑定域名时，不需要额外开放无关 Zone。
- 不要使用 Global API Key。

Token 只会完整显示一次。不要把它粘贴到聊天、代码仓库、Issue 或截图中。

可以把 Token 保存为仅当前用户可读的本地环境文件：

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

以后部署前加载：

```bash
source "$HOME/.config/cloudflare/wrangler.env"
wrangler whoami
```

当 `wrangler whoami` 能识别账户时，授权已经完成。

<!-- TODO(SCREENSHOT-05): 添加脱敏后的 wrangler whoami 成功截图。必须遮盖邮箱、Account ID 和任何 Token。建议文件名：public/images/blog/wrangler-cloudflare-authenticated.png -->
<!-- ![Wrangler 已连接 Cloudflare 账户](/images/blog/wrangler-cloudflare-authenticated.png) -->

## 第五步：添加 Workers Static Assets 配置

在网站项目根目录创建 `wrangler.jsonc`：

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-website",
  "compatibility_date": "2026-07-14",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

把 `my-website` 换成自己的项目名称。它会出现在 Cloudflare Dashboard 和默认公网地址中。

配置含义：

| 配置 | 作用 |
| --- | --- |
| `name` | Cloudflare Worker 名称 |
| `compatibility_date` | 固定运行时兼容行为 |
| `assets.directory` | 指定 Astro 构建生成的 `dist` 目录 |
| `html_handling` | 自动处理 `/about/` 这类静态页面路径 |
| `not_found_handling` | 使用项目生成的 `404.html` |

如果模板没有生成 `404.html`，可以暂时删除 `not_found_handling`，或者先添加自定义 404 页面。

在 `package.json` 中加入部署命令：

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "pnpm build && wrangler deploy"
  }
}
```

这样以后只需要执行：

```bash
pnpm deploy
```

## 第六步：先检查，再部署

加载 Cloudflare 凭据：

```bash
source "$HOME/.config/cloudflare/wrangler.env"
```

先执行 dry-run：

```bash
pnpm build
wrangler deploy --dry-run
```

dry-run 不修改线上资源，只检查 Wrangler 是否能读取 `dist`、解析配置和生成待上传内容。

确认无误后执行：

```bash
wrangler deploy
```

第一次部署时，Wrangler 会创建 Worker、上传静态文件并启用 `workers.dev` 地址。成功输出类似：

```text
Read 49 files from the assets directory
Success! Uploaded 49 files
Uploaded my-website
Deployed my-website triggers
https://my-website.<account-subdomain>.workers.dev
```

复制最后的 URL，在浏览器中打开。至此，一个不需要自购服务器、也不需要域名的官网已经上线。

<!-- TODO(SCREENSHOT-06): 添加 Wrangler 首次部署成功截图。保留 Uploaded、Deployed 和 workers.dev URL；遮盖邮箱、Account ID、Token 等信息。建议文件名：public/images/blog/wrangler-first-deployment.png -->
<!-- ![Wrangler 首次部署静态官网](/images/blog/wrangler-first-deployment.png) -->

## 第七步：验证线上网站

不要只看首页是否能打开。至少检查主页、关键页面和不存在的路径：

```bash
BASE_URL='https://my-website.<account-subdomain>.workers.dev'

for path in / /blog/ /about/ /definitely-not-found; do
  curl -sS -o /dev/null \
    -w "path=$path status=%{http_code}\n" \
    "$BASE_URL$path"
done
```

预期结果：

- 已存在页面返回 `200`。
- 不存在的页面返回 `404`。
- CSS、图片和字体能正常加载。
- 页面中的 GitHub、文档和行动按钮指向正确地址。

如果项目包含 Sitemap、RSS 或 canonical，也要检查它们是否使用当前公网地址，而不是模板自带的示例域名。

Astro 可以通过 `site` 设置生产地址：

```ts
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ??
    'https://my-website.<account-subdomain>.workers.dev',
});
```

修改后重新构建和部署。

## 第八步：把重复部署交给 AI

Wrangler 的优势不只是命令短，而是命令输出结构清楚，适合 AI Agent 调用。

完成一次授权后，可以把本地项目路径告诉 AI，并提出类似需求：

```text
检查这个 Astro 官网的构建和 Cloudflare 配置。
先执行本地构建和 wrangler dry-run；确认无误后部署。
部署完成后验证首页、中文页、静态资源、404、canonical 和 Sitemap。
不要输出 API Token，不要自动 push Git。
```

AI 可以依次完成：

```text
读取项目
  -> pnpm build
  -> 检查 wrangler.jsonc
  -> wrangler deploy --dry-run
  -> wrangler deploy
  -> curl 验证关键页面
  -> 记录 Version ID
```

这种方式比让 AI 操作 Dashboard 更稳定，也更容易留下可复现的配置。

但授权 AI 不等于取消安全边界：

- Token 只保存在本机，不直接发到对话中。
- 使用最小权限 Token。
- 删除 Worker、修改 DNS、扩大权限等操作仍需单独确认。
- 正式部署前先构建和 dry-run。
- Cloudflare 部署完成不代表允许自动 push 仓库。

<!-- TODO(SCREENSHOT-07): 添加 AI Agent 执行构建、dry-run、部署和 URL 验证的终端过程截图。所有凭据、邮箱和 Account ID 必须脱敏。建议文件名：public/images/blog/ai-agent-cloudflare-deployment.png -->
<!-- ![AI 使用 Wrangler 完成 Cloudflare 部署](/images/blog/ai-agent-cloudflare-deployment.png) -->

## 以后如何更新官网

修改页面后，流程仍然只有三步：

```bash
cd my-website
source "$HOME/.config/cloudflare/wrangler.env"
pnpm deploy
```

`pnpm deploy` 会先重新构建，再让 Wrangler 计算文件差异。没有变化的静态资源不会重复上传。

Cloudflare 会为部署创建版本。上线后发现问题，可以查看历史部署并回滚：

```bash
wrangler deployments list --name my-website --json
wrangler rollback <VERSION_ID> --name my-website
```

回滚属于生产操作，执行前要核对 Worker 名称和目标版本。

## 以后想绑定域名怎么办

域名不是上线前置条件。

可以先使用 `workers.dev` 地址完成内容、设计和用户验证。确认网站值得长期维护后，再购买域名并在 Cloudflare 中绑定 Custom Domain。

绑定正式域名后，记得同步修改：

- Astro 的 `site` 或部署环境中的 `SITE_URL`。
- canonical。
- Sitemap 和 RSS。
- Open Graph 分享地址。
- 网站中写死的绝对链接。

然后重新构建部署即可，网站架构不需要重做。

## 常见问题

### 必须使用 Astro 吗？

不必须。只要项目能构建出一个静态目录，就可以使用相同思路。Vite、Vue、React SPA、Hugo、Jekyll 和手写 HTML 都可以，主要区别是构建命令和输出目录。

### 必须购买服务器吗？

纯静态网站不需要自购和维护传统服务器。静态文件由 Cloudflare Workers Static Assets 承载。

### 必须购买域名吗？

不需要。Cloudflare 会分配 `workers.dev` 公网 HTTPS 地址。域名可以以后再绑定。

### 为什么不用 Cloudflare Pages？

Pages 同样能托管静态网站。本文选择 Workers Static Assets，是因为 Wrangler 可以把静态资产、版本管理和未来 Worker 能力放在同一部署模型中，也方便 AI 通过 CLI 操作。

如果团队已经有成熟的 Pages Git 自动构建和 Preview 工作流，继续使用 Pages 也合理。不要为了“统一”同时维护两套生产部署。

### API Token 可以直接发给 AI 吗？

不要。把 Token 保存在本机权限受限的文件或密钥管理器中，让 Agent 在执行命令时加载，不要让密钥出现在对话、截图或 Git 中。

### 部署后页面是 404 怎么办？

依次确认：

1. `pnpm build` 是否成功。
2. `dist/index.html` 是否存在。
3. `assets.directory` 是否指向正确目录。
4. Wrangler 部署的 Worker 名称是否正确。
5. 打开的是否是部署输出中的最新地址。

## 总结

一个静态官网真正需要的基础设施，可以压缩成下面这条链路：

```text
Astro 项目 + Cloudflare 账号 + Wrangler
  -> 构建 dist
  -> 上传静态资产
  -> 自动获得 workers.dev 公网地址
```

不需要先购买服务器，不需要配置 Nginx，也不需要为了“先上线看看”立即购买域名。

更重要的是，Wrangler 把部署过程变成了可复现的代码和命令。完成安全授权后，你可以让 AI 帮你检查构建、修改配置、部署和验证，把时间留给官网内容和产品本身。

## 附录：相关地址

- AstroWind 静态官网模板：<https://github.com/arthelokyo/astrowind>
- 1flowbase 开源项目及官网案例：<https://github.com/taichuy/1flowbase>
- 1flowbase 官网：<https://1flowbase.taichuy.com/>
- Cloudflare 注册：<https://dash.cloudflare.com/sign-up>
- Cloudflare API Tokens：<https://dash.cloudflare.com/profile/api-tokens>
- Wrangler 官方文档：<https://developers.cloudflare.com/workers/wrangler/>
- Workers Static Assets 文档：<https://developers.cloudflare.com/workers/static-assets/>

