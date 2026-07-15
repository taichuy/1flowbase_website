---
scene: multimodal-vision
lang: zh
order: 10
eyebrow: 多模态虚拟模型
title: 让文本模型获得可控的看图能力。
description: 主文本模型继续负责规划与编码，只在需要理解截图、界面、图表或文档时调用视觉模型，把多模态能力组合进同一个虚拟模型入口。
highlights:
  - 主文本模型始终掌控任务主线
  - 视觉模型作为可复用的挂载工具
  - 工具调用、结果、Token 与失败完整可追踪
detailUrl: https://github.com/taichuy/1flowbase/wiki/Make-GLM-5.2-See-Images-in-Claude-Code-with-1flowbase-CN
detailLabel: 阅读完整视觉工作流教程
enabled: true
images:
  - src: ../assets/main-model.jpeg
    alt: GLM 5.2 作为主文本模型并挂载多模态工具
    caption: 保留文本模型作为主推理入口
  - src: ../assets/tool-registration.png
    alt: 在 1flowbase 中注册挂载视觉工具
    caption: 把视觉模型注册成可调用工具
  - src: ../assets/vision-schema.png
    alt: 视觉工具的 JSON Schema 配置
    caption: 用明确的工具结构约束视觉输入
  - src: ../assets/trace-log.jpeg
    alt: Claude Code 图片工作流的完整执行轨迹
    caption: 检查完整的多模态执行轨迹
---
