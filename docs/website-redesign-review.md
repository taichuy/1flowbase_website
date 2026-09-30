# 官网改版交付与发布检查

## 定位与转化

依据最新产品介绍 `1flowbase-readme(2).md`，定位更新为「可自托管的 AI Gateway 与 AI 应用运行时」。

- 首屏直接说明产品类别，主要入口为部署，次要入口为 GitHub
- 用运行时架构说明 Gateway、Workflow、Data、API、MCP 与 React 的关系
- 以真实项目截图说明编排、执行记录、接口发布，取消自动轮播
- 按企业 AI 团队、AI 产品团队、高级个人用户组织价值
- Linux/macOS、PowerShell、Windows CMD 安装命令可切换、复制，并提供脚本审阅链接
- 官方 MCP 工具完善、模板与降低源码上下文依赖仍明确列为进行中
- 没有添加虚构用户数、客户评价、节省成本比例或未经验证的竞品比较

## SEO 与可访问性

- 正式默认域名为 `https://1flowbase.taichuy.com`
- 更新中英标题、摘要、软件与 FAQ 结构化数据及 llms.txt
- 修复只有中文版本的文档错误输出不存在英文 hreflang 的问题
- 保留文档、博客、许可协议、Wiki 同步及原部署架构
- 添加跳转正文链接、键盘标签页、复制状态反馈和菜单 Escape/外部点击关闭
- 未添加第三方追踪代码；界面改版不能单独保证流量增长

## 验证状态

- 已运行完整 `pnpm build`，Astro 检查零诊断、生成 26 页
- 已静态检查站内路由、资产、锚点、标题与图片替代文本
- 浏览器截图及交互测试尚未完成：当前执行环境的浏览器预览/本地 Chromium 受限
- 发布前必须在可用浏览器完成桌面与手机检查，尤其是 320px、390px、768px 与桌面宽度
- 确认产品截图标签页、安装命令切换与复制、FAQ、手机菜单、语言切换，以及文档/博客页面
- 现有社交分享图片保持不变；如需使分享视觉与新版一致，应另行更新

## 发布边界

本次未推送、创建 PR、合并或发布。

当前唯一版本化 workflow 为 `.github/workflows/deploy.yml`。它在以下情况执行 Cloudflare 生产发布：

1. push 到 `main`
2. 每小时第 17 与 47 分钟的定时触发
3. `repository_dispatch`，事件 `wiki-content-updated`
4. `workflow_dispatch`

该文件没有 `pull_request` 触发器，因此隔离分支 push 和 draft PR 本身不会触发此 workflow。仓库以外的 GitHub App、webhook 或 Cloudflare 外部集成不在本地文件验证范围内。

建议先批准推送隔离分支并打开 draft PR，完成可视验收后，再单独批准合并到 main。不要使用 `pnpm release` 做单纯审阅，它会合并并推送 main，进而触发生产发布。

## 后续推广建议

先发布可运行的具体教程，再分发到适合的开发者社区：

- 将「规划 → 执行 → 审计」组合发布成一个模型接口
- 用 PostgreSQL 会话数据分析失败任务与模型成本
- 用 MCP list/get/call 发现能力，并连接业务表、API 与 React Block

建议在取得相应账户权限后建立 Search Console 与隐私合适的访问统计基线，观察搜索曝光、GitHub 出站点击、文档进入率与部署命令使用意图。未在本次改版中开通账户、配置跟踪或发布推广内容。
