---
title: "小型应用团队何时需要自托管 AI 网关？"
description: "当多个 AI 应用需要不同模型、统一调用入口和可检查的工作流记录时，了解 1flowbase 的适用场景、接入路径与评估边界。"
publishedAt: 2026-09-30
lang: zh
slug: self-hosted-ai-gateway-for-small-teams
tags:
  - AI 网关
  - 应用开发
  - 自托管
---

内部助手最初只有一次模型调用。后来，客服工具接入一个供应商，编程助手接入另一个，文档功能还需要专门的模型。每个应用分别维护配置，出了问题也要分别排查。换一个模型，开始变成多个应用的修改任务。

自托管 AI 网关可以为这些客户端提供共同入口。在 1flowbase 中，发布的模型还可以对应一个工作流。因此，它适合希望自己管理部署、让多个客户端复用模型能力，并能检查每次响应背后执行过程的小型工程团队。

本文是一份评估指南，不代表所有客户端和供应商组合都已通过实测。示例 API 契约以 [v0.4.1 源码](https://github.com/taichuy/1flowbase/tree/v0.4.1) 为依据。main、开发分支、供应商插件与 Docker `latest` 可能不同。

## 哪些团队需要这一层？

如果你符合其中几项，可以考虑评估 1flowbase：

- 同时维护多个 AI 应用或 Agent 客户端
- 各个客户端重复配置供应商和模型
- 部分请求需要组合模型或工具
- 需要从最终回答追溯到模型调用和工作流节点
- 有能力维护自托管服务和数据库

例如，内部知识助手先采用单模型工作流，再为特定类型的回答增加评审步骤。客户端仍然调用已发布的模型名称，团队在后端调整流程。调整后仍要重新测试：API 形状保持一致，并不代表回答、延迟和成本不变。

如果一个小应用只需直接调用单一模型，供应商 SDK 可能已经足够。网关会增加服务、配置和故障边界；应当由复用需求与可观测性收益来证明这份维护成本值得承担。

## 请求如何经过 1flowbase？

```text
应用后端或 Agent 客户端
  -> 1flowbase API + 应用密钥 + 公开模型名称
  -> 已发布模型或 AgentFlow
  -> 配置的供应商、模型及可选工具
  -> 响应与运行记录
```

1flowbase 文档覆盖 OpenAI Chat Completions、OpenAI Responses 和 Claude 兼容 Messages 接口。需要按客户端实际使用的功能验证兼容性：文本请求成功，不代表流式输出、工具调用、图片和取消请求也全部一致。

还需要区分两类密钥。供应商密钥用于 1flowbase 访问上游模型；应用 API 密钥用于客户端访问已发布的 1flowbase 应用。两者都应私密保存，不能把应用密钥放进下发到浏览器的 JavaScript。网关自托管，也不代表配置的云模型不会收到请求数据。

## 先完成一个请求与一条对应日志

第一个里程碑应当很小：一个供应商、一个已发布模型、一条合成测试提示，以及对应的运行日志。

1. 按[官方安装与升级说明](https://github.com/taichuy/1flowbase#installation-or-upgrade)建立隔离测试环境。记录源码版本、实际镜像版本和供应商插件版本。滚动安装脚本获取 main 的部署文件，不能视为固定版本安装
2. 在私密设置中配置一个有权使用的供应商和模型，先确认它能正常工作
3. 建立最小 AgentFlow，配置 Start 与 LLM 节点，设置如 `first-request` 的公开模型名称并发布，使用该应用的 API 密钥。具体地址和参数以安装版本的 API 面板为准
4. 发出合成文本请求。真实密钥仅在私密本地环境中设置，关闭可能泄露密钥的命令跟踪和终端录制

以下为依据源码整理的示例，未在本文中进行真实安装测试。`FLOWBASE_BASE_URL` 是不带末尾斜杠的部署地址，`FLOWBASE_APP_KEY` 是应用密钥，并非供应商密钥。已发布模型必须确实命名为 `first-request`。

```bash
curl --silent --show-error --fail-with-body \
  "${FLOWBASE_BASE_URL}/v1/chat/completions" \
  --header "Authorization: Bearer ${FLOWBASE_APP_KEY}" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "first-request",
    "messages": [{"role": "user", "content": "Reply with a short greeting. This is synthetic test data."}],
    "stream": false
  }'
```

完成条件是：HTTP 请求成功、助手返回非空回答，并且能在 1flowbase 中找到对应运行。通过提示内容和时间确认关联，再检查模型调用与最终结果。HTTP 错误、缺失日志或空回答，都需要继续排查。

[AI 网关评估清单](/zh/docs/gateway-evaluation/)把版本、请求和日志检查整理成了一条完整路径。

## 为明确需求增加编排

单模型路径跑通后，再选择一种扩展：

- 编程任务需要理解截图：参考[视觉模型挂载指南](/zh/docs/glm-vision/)
- 任务需要独立评审视角：参考 [Fusion 工作流](/zh/docs/fusion-workflow/)
- 专家分支需要调用工具：参考[智能路由指南](/zh/docs/smart-routing/)

这些都需要你配置并评估。增加一个模型，并不自动带来故障切换，也不保证每个回答更好。多模型运行可能消耗更多 token、增加延迟，并把数据发送给更多供应商。

用同一组代表性提示比较改动前后效果。根据自己的验收标准记录回答质量、错误、延迟和可取得的用量字段；把失败请求和重复尝试也算进去。token 总数不能直接等同于完整账单。

## 哪些事情仍需团队负责？

自托管意味着访问控制、HTTPS、数据库备份、保留策略、升级和容量都需要有人维护。阅读[对应版本的部署文档](https://github.com/taichuy/1flowbase/blob/v0.4.1/docker/README.md)，不要直接把新建测试环境暴露到公网，也不要把演示凭据用于生产环境。

应用模板与减少源码上下文依赖的 Agent 配置体验仍在完善。构建复杂应用，目前应预期需要工程工作和项目上下文。你可以先使用网关，再按真实需要采用应用运行时的其他能力。

从[评估清单](/zh/docs/gateway-evaluation/)开始；当团队希望围绕执行证据建立内部处理流程时，再看[从 AI 运行日志到内部评审应用](/zh/blog/from-ai-run-logs-to-review-app/)。
