---
scene: smart-routing
lang: zh
order: 30
eyebrow: AI 网关路由
title: 让每个任务走向合适的模型路径。
description: Claude Code、Codex 等客户端始终调用一个稳定模型入口，工作流根据请求上下文选择专用模型、降级路径或工具能力。
highlights:
  - 客户端保留熟悉的端点和模型名
  - 路由逻辑在工作流里可见、可调整
  - 延迟、Token 与失败都能归因到具体路径
detailUrl: https://github.com/taichuy/1flowbase/wiki/Smart-LLM-Routing-for-AI-Agents-CN
detailLabel: 阅读完整智能路由教程
enabled: true
images:
  - src: ../assets/client-demo.png
    alt: Claude Code 调用稳定的 1flowbase 模型端点
    caption: 保持客户端接入方式不变
  - src: ../assets/tool-registration.png
    alt: 1flowbase 中的智能路由工具与模型路径配置
    caption: 在工作流里显式维护路由规则
  - src: ../assets/run-log.png
    alt: 展示所选路径的智能路由执行日志
    caption: 看清实际执行了哪条路径以及运行结果
---
