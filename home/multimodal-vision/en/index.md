---
scene: multimodal-vision
lang: en
order: 10
eyebrow: Multimodal virtual model
title: Give text models controlled vision.
description: Keep a strong text model responsible for planning and coding, then let it call a vision model only when an image, UI, chart, or document needs to be understood.
highlights:
  - The main text model keeps control of the task
  - Vision is exposed as a reusable mounted tool
  - Every tool call, result, token, and failure stays traceable
detailUrl: https://github.com/taichuy/1flowbase/wiki/Make-GLM-5.2-See-Images-in-Claude-Code-with-1flowbase
detailLabel: Read the vision workflow guide
enabled: true
images:
  - src: ../assets/main-model.jpeg
    alt: GLM 5.2 configured as the main text model with a mounted multimodal tool
    caption: Keep the text model as the main reasoning entry
  - src: ../assets/tool-registration.png
    alt: Mounted vision tool registration in 1flowbase
    caption: Register vision as a callable model tool
  - src: ../assets/vision-schema.png
    alt: JSON Schema configuration for the mounted vision tool
    caption: Constrain visual input with a clear tool schema
  - src: ../assets/trace-log.jpeg
    alt: Execution trace for a Claude Code image workflow in 1flowbase
    caption: Inspect the complete multimodal execution trace
---
