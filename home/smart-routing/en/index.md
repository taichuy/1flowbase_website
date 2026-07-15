---
scene: smart-routing
lang: en
order: 30
eyebrow: AI gateway routing
title: Route each task through the right model path.
description: Keep one stable model endpoint for Claude Code, Codex, and other clients while the workflow selects a specialist model, fallback, or tool path from the request context.
highlights:
  - Clients keep one familiar endpoint and model name
  - Routing logic stays visible and editable in the workflow
  - Latency, token use, and failures remain attributable to each path
detailUrl: https://github.com/taichuy/1flowbase/wiki/Smart-LLM-Routing-for-AI-Agents
detailLabel: Read the smart routing guide
enabled: true
images:
  - src: ../assets/client-demo.png
    alt: Claude Code calling a stable 1flowbase model endpoint
    caption: Keep the client integration unchanged
  - src: ../assets/tool-registration.png
    alt: Smart routing tool and model path configuration in 1flowbase
    caption: Make routing rules explicit in the workflow
  - src: ../assets/run-log.png
    alt: Smart routing execution log showing the selected path
    caption: See which path ran and why
---
