import type { Locale } from '../config';

export const homeCopy = {
  en: {
    badge: 'Open source · Self-hosted · Observable',
    heroTitle: 'One endpoint. Your own observable model workflow.',
    heroDescription:
      'Turn multi-model chains into OpenAI- and Claude-compatible virtual models for Claude Code, Codex, OpenCode, Cline, Continue, and any SDK.',
    primaryCta: 'Explore on GitHub',
    secondaryCta: 'Read the guides',
    worksWith: 'Works with the tools you already use',
    protocols: ['OpenAI Responses', 'Chat Completions', 'Claude Messages', 'Tool callbacks'],
    visualLabel: 'workflow / fusion-reviewer',
    visualStatus: 'published',
    useCasesEyebrow: 'Compose, publish, observe',
    useCasesTitle: 'Build a better virtual model from the models you already trust.',
    useCasesDescription:
      '1flowbase sits between agent clients and model providers. The client still calls one familiar model name while your workflow decides what happens behind it.',
    useCases: [
      {
        number: '01',
        title: 'Give coding models vision',
        body: 'Keep a strong text model as planner, then mount Gemini, GPT vision, OCR, or any multimodal model as a callable visual tool.',
        flow: 'coding model → vision tool → grounded answer',
      },
      {
        number: '02',
        title: 'Run a multi-model review panel',
        body: 'Fan out to several reviewers, preserve every branch, and synthesize one stronger answer behind a single model endpoint.',
        flow: 'parallel reviewers → synthesis → final answer',
      },
      {
        number: '03',
        title: 'Debug cost, latency, and failures',
        body: 'Inspect model calls, tool callbacks, tokens, duration, and errors as one connected execution trace instead of scattered logs.',
        flow: 'request → trace → evidence → improvement',
      },
    ],
    architectureEyebrow: 'A small surface, a powerful runtime',
    architectureTitle: 'Your agents see a normal model. You see the whole system.',
    architectureDescription:
      'Publish once and keep existing client integrations unchanged. 1flowbase handles orchestration, protocol compatibility, and observability behind the endpoint.',
    architectureSteps: [
      ['01', 'Agent client', 'Claude Code, Codex, OpenCode, SDKs'],
      ['02', 'Virtual model API', 'OpenAI- and Claude-compatible endpoints'],
      ['03', 'Workflow runtime', 'Models, branches, tools, and synthesis'],
      ['04', 'Execution evidence', 'Traces, tokens, latency, cost, failures'],
    ],
    featuresEyebrow: 'Control without lock-in',
    featuresTitle: 'Designed for local agents and real production debugging.',
    features: [
      ['Protocol compatible', 'Use the clients and SDKs you already have. Publish workflows through familiar OpenAI and Claude APIs.'],
      ['Provider flexible', 'Mix OpenAI-compatible providers, Claude-compatible models, vision models, and private endpoints in one workflow.'],
      ['Visual workflow editor', 'Make branching, tools, and synthesis explicit. Reuse a workflow instead of rebuilding orchestration in every client.'],
      ['Trace every call', 'Connect the final answer to every model invocation, tool callback, token count, duration, and error.'],
      ['Self-hosted by default', 'Keep model credentials and execution data under your control with a one-command Docker deployment.'],
      ['Open extension surface', 'Build workflow nodes, model providers, tools, and frontstage experiences on an open-source base.'],
    ],
    observeEyebrow: 'Evidence, not guesswork',
    observeTitle: 'See why an answer was slow, expensive, or wrong.',
    observeDescription:
      'A final answer is only the last line of a workflow. 1flowbase keeps the path that produced it visible, so you can compare branches, inspect tool results, and improve the system with evidence.',
    observePoints: ['Model and tool call timeline', 'Token, latency, and failure attribution', 'Inputs and outputs connected to workflow nodes'],
    installEyebrow: 'Run it on your own machine',
    installTitle: 'From zero to a workflow endpoint with one command.',
    installDescription: 'Deploy the full stack with Docker, open the visual editor, and publish your first virtual model.',
    copyLabel: 'Linux / macOS',
    faqEyebrow: 'Frequently asked',
    faqTitle: 'What developers usually want to know.',
    faqs: [
      ['Is 1flowbase another LLM proxy?', 'No. A proxy mainly selects or forwards to a model. 1flowbase composes models and tools into a workflow, publishes that workflow as a virtual model, and preserves the complete execution trace.'],
      ['Do I need to change Claude Code or Codex?', 'Usually no. If a client supports a custom OpenAI- or Claude-compatible endpoint, it can call a published 1flowbase workflow through the same model API shape it already understands.'],
      ['Can I use local or private model providers?', 'Yes. 1flowbase is designed for self-hosted deployments and provider-compatible endpoints, so credentials and traffic can remain in infrastructure you control.'],
      ['How is this different from coding an agent graph?', 'Agent frameworks help you write orchestration in code. 1flowbase gives that orchestration a visual editor, a reusable runtime, protocol publishing, and connected observability for local agent clients.'],
    ],
    finalTitle: 'Build the model endpoint your agents actually need.',
    finalDescription: 'Start with the fusion template, mount a vision model, or publish your own workflow from scratch.',
  },
  zh: {
    badge: '开源 · 自托管 · 全链路可观测',
    heroTitle: '一个端点，运行你的可观测多模型工作流。',
    heroDescription:
      '把多模型链路发布成 OpenAI 与 Claude 兼容的虚拟模型，让 Claude Code、Codex、OpenCode、Cline、Continue 和各种 SDK 直接调用。',
    primaryCta: '前往 GitHub',
    secondaryCta: '阅读教程',
    worksWith: '兼容你已经在使用的工具',
    protocols: ['OpenAI Responses', 'Chat Completions', 'Claude Messages', '工具回调'],
    visualLabel: '工作流 / fusion-reviewer',
    visualStatus: '已发布',
    useCasesEyebrow: '编排、发布、观测',
    useCasesTitle: '用你信任的模型，组合出更强的虚拟模型。',
    useCasesDescription:
      '1flowbase 位于本地 Agent 客户端与模型供应商之间。客户端仍然只调用一个熟悉的模型名，而真正的多模型编排发生在背后的工作流里。',
    useCases: [
      {
        number: '01',
        title: '让编程模型拥有视觉能力',
        body: '保留强文本模型作为主规划器，再把 Gemini、GPT Vision、OCR 或任意多模态模型挂载成可调用的视觉工具。',
        flow: '编程模型 → 视觉工具 → 有依据的回答',
      },
      {
        number: '02',
        title: '运行多模型评审面板',
        body: '并行调用多个评审模型，保留每个分支，再由综合模型生成更可靠的最终答案，对外仍是一个模型端点。',
        flow: '并行评审 → 综合判断 → 最终回答',
      },
      {
        number: '03',
        title: '定位成本、延迟与失败原因',
        body: '把模型调用、工具回调、Token、耗时与错误串成一次完整执行轨迹，而不是分散在互不关联的日志里。',
        flow: '请求 → 轨迹 → 证据 → 改进',
      },
    ],
    architectureEyebrow: '极简调用面，完整工作流运行时',
    architectureTitle: 'Agent 看到普通模型，你看到完整系统。',
    architectureDescription:
      '工作流发布后无需重写现有客户端集成。1flowbase 在端点背后处理编排、协议兼容与可观测性。',
    architectureSteps: [
      ['01', 'Agent 客户端', 'Claude Code、Codex、OpenCode、SDK'],
      ['02', '虚拟模型 API', '兼容 OpenAI 与 Claude 的标准端点'],
      ['03', '工作流运行时', '模型、分支、工具调用与结果综合'],
      ['04', '执行证据', '轨迹、Token、延迟、成本与失败'],
    ],
    featuresEyebrow: '掌控编排，不被供应商锁定',
    featuresTitle: '为本地 Agent 与真实生产调试而设计。',
    features: [
      ['兼容主流协议', '继续使用已有客户端与 SDK，通过熟悉的 OpenAI 和 Claude API 调用工作流。'],
      ['自由组合供应商', '在同一工作流里组合 OpenAI 兼容供应商、Claude 模型、视觉模型和私有端点。'],
      ['可视化工作流编辑器', '显式表达分支、工具与结果综合，一次构建后供多个客户端复用。'],
      ['追踪每次调用', '把最终答案连接到每个模型调用、工具回调、Token、耗时与错误。'],
      ['默认支持自托管', '使用一键 Docker 部署，让模型凭据与执行数据保留在自己的基础设施中。'],
      ['开放扩展能力', '基于开源底座构建工作流节点、模型供应商、工具与业务前台。'],
    ],
    observeEyebrow: '用证据代替猜测',
    observeTitle: '看清一次回答为什么慢、贵或者出错。',
    observeDescription:
      '最终答案只是工作流的最后一行。1flowbase 保留产生它的完整路径，让你比较分支结果、检查工具返回，并基于真实证据改进系统。',
    observePoints: ['模型与工具调用时间线', 'Token、延迟与失败归因', '输入输出与工作流节点直接关联'],
    installEyebrow: '运行在你自己的机器上',
    installTitle: '一条命令，启动完整工作流端点。',
    installDescription: '通过 Docker 部署完整服务，打开可视化编辑器并发布第一个虚拟模型。',
    copyLabel: 'Linux / macOS',
    faqEyebrow: '常见问题',
    faqTitle: '开发者通常最关心这些问题。',
    faqs: [
      ['1flowbase 是另一个 LLM 代理吗？', '不是。普通代理主要负责模型选择或请求转发；1flowbase 把多个模型和工具组合成工作流，再把整个工作流发布为虚拟模型，并保留完整执行轨迹。'],
      ['需要修改 Claude Code 或 Codex 吗？', '通常不需要。只要客户端支持自定义 OpenAI 或 Claude 兼容端点，就能通过熟悉的模型 API 调用已经发布的 1flowbase 工作流。'],
      ['可以接入本地或私有模型供应商吗？', '可以。1flowbase 面向自托管与兼容协议设计，模型凭据和调用流量可以保留在你掌控的基础设施中。'],
      ['它和直接编写 Agent Graph 有什么区别？', 'Agent 框架帮助你用代码实现编排；1flowbase 在此基础上提供可视化编辑、可复用运行时、协议发布以及面向本地 Agent 客户端的全链路观测。'],
    ],
    finalTitle: '构建你的 Agent 真正需要的模型端点。',
    finalDescription: '从 Fusion 模板开始，挂载视觉模型，或者从零发布你自己的多模型工作流。',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const pageCopy = {
  en: {
    features: {
      eyebrow: 'Product capabilities',
      title: 'Everything between one agent request and a trustworthy answer.',
      description: 'Build the workflow visually, publish it through standard model protocols, and keep every execution step inspectable.',
    },
    useCases: {
      eyebrow: 'Use cases',
      title: 'Practical model workflows for local AI agents.',
      description: 'Start from a concrete limitation in your current agent setup, then publish the improved behavior as one reusable virtual model.',
    },
  },
  zh: {
    features: {
      eyebrow: '产品能力',
      title: '覆盖从一次 Agent 请求到可信回答之间的完整链路。',
      description: '可视化构建工作流，通过标准模型协议发布，并让每一个执行步骤都可以检查和追溯。',
    },
    useCases: {
      eyebrow: '使用场景',
      title: '面向本地 AI Agent 的实用多模型工作流。',
      description: '从现有 Agent 的具体限制出发，把增强后的能力发布成一个可以持续复用的虚拟模型。',
    },
  },
} as const;
