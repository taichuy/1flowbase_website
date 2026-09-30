import type { Locale } from '../config';

export const homeCopy = {
  en: {
    badge: 'Open source · Self-hosted · Observable',
    heroTitle: '1flowbase',
    heroSubTitle: 'Conversation is the moat. The native foundation for AI apps.',
    heroDescription:
      'Compose models, tools, and workflows into reusable AI capabilities, then publish them through one observable, OpenAI- and Claude-compatible runtime.',
    heroUseCases: [
      'Add vision capabilities to LLM text models, such as DeepSeek V4 and GLM 5.2',
      'Daily review, path optimization, and cost control based on AI chat logs.',
      'MCP Gateway: convert any HTTP to MCP, integrate third-party MCPs to publish exclusive MCP',
    ],
    primaryCta: 'Explore on GitHub',
    secondaryCta: 'Read the guides',
    worksWith: 'Works with the tools you already use',
    capabilities: ['AI Gateway', 'Virtual Model', 'MCP Gateway', 'Protocol Translation'],
    visualLabel: 'workflow / fusion-reviewer',
    visualStatus: 'published',
    useCasesEyebrow: 'Compose, publish, observe',
    useCasesTitle: 'Build a better virtual model from the models you already trust.',
    useCasesDescription:
      '1flowbase sits between agent clients and model providers. The client still calls one familiar model name while your workflow decides what happens behind it.',
    useCases: [
      {
        number: '01',
        title: 'Compose text models into multimodal capability',
        body: 'Use DeepSeek V4 for reasoning, GLM 5.2 for synthesis, and visual tools for perception, then publish the whole workflow as one model.',
        flow: 'DeepSeek V4 + GLM 5.2 + vision tools → multimodal model',
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
    finalTitle: 'Make every conversation compound into your AI application moat.',
    finalDescription: 'Start with the multimodal composition, adapt the workflow, and publish it as your own model endpoint.',
  },
  zh: {
    badge: '开源 · 自托管 · 全链路可观测',
    heroTitle: '1flowbase',
    heroSubTitle: '对话即是壁垒，AI 应用原生底座',
    heroDescription:
      '把模型、工具与工作流组合成可复用的 AI 能力，通过一个兼容 OpenAI 与 Claude、全链路可观测的运行时持续发布。',
    heroUseCases: [
      'LLM 文本模型增加看图能力，如 DeepSeek V4、GLM 5.2',
      '基于 AI 聊天记录进行每日复盘，路径优化，成本控制。',
      'MCP 网关，将任意 HTTP 转为 MCP，将第三方 MCP 整合发布专属 MCP',
    ],
    primaryCta: '前往 GitHub',
    secondaryCta: '阅读教程',
    worksWith: '兼容你已经在使用的工具',
    capabilities: ['AI 网关', '虚拟模型', 'MCP 网关', '协议转换'],
    visualLabel: '工作流 / fusion-reviewer',
    visualStatus: '已发布',
    useCasesEyebrow: '编排、发布、观测',
    useCasesTitle: '用你信任的模型，组合出更强的虚拟模型。',
    useCasesDescription:
      '1flowbase 位于本地 Agent 客户端与模型供应商之间。客户端仍然只调用一个熟悉的模型名，而真正的多模型编排发生在背后的工作流里。',
    useCases: [
      {
        number: '01',
        title: '用文本模型组合出多模态能力',
        body: '让 DeepSeek V4 负责推理、GLM 5.2 负责综合，再接入视觉工具负责感知，把整个工作流发布成一个模型。',
        flow: 'DeepSeek V4 + GLM 5.2 + 视觉工具 → 多模态模型',
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
    finalTitle: '让每一次对话，都沉淀为 AI 应用的壁垒。',
    finalDescription: '从多模态组合样例开始，调整工作流，并发布成属于你的模型端点。',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const pageCopy = {
  en: {
    features: {
      eyebrow: 'Product capabilities',
      title: 'From AI Gateway to a complete application runtime.',
      description: 'Distribute AI capabilities, retain complete conversations, and build with workflows, APIs, business data, and React. Self-host the foundation on infrastructure you control.',
    },
    useCases: {
      eyebrow: 'Use cases',
      title: 'Connect your models. Build on what they create.',
      description: 'Start with a unified AI endpoint, compose models around your tasks, and turn conversation data into the foundation for your next application.',
    },
  },
  zh: {
    features: {
      eyebrow: '产品能力',
      title: '从 AI Gateway 到完整的应用运行时。',
      description: '分发 AI 能力，完整沉淀会话，再通过工作流、API、业务数据与 React 构建应用。把这一切自托管在你掌控的基础设施中。',
    },
    useCases: {
      eyebrow: '使用场景',
      title: '统一接入模型，让每次调用成为应用的起点。',
      description: '从统一的 AI 入口开始，围绕任务组合模型，把持续积累的会话数据用于分析、优化与业务应用。',
    },
  },
} as const;

type FeaturePageCopy = {
  sections: [title: string, body: string, bullets: string[]][];
  galleryTitle: string;
  galleryDescription: string;
  images: string[];
  ctaTitle: string;
  ctaBody: string;
  cta: string;
};

export const featuresCopy = {
  en: {
    sections: [
      ['AI Gateway', 'Access models and published workflows through one gateway, with conversion between three supported AI API protocols.', ['OpenAI Chat Completions', 'OpenAI Responses', 'Anthropic Messages']],
      ['Workflow & virtual models', 'Combine models, tools, APIs, and business logic, then publish the workflow as a virtual model. A worker model can also become a tool for your primary model.', ['Visual workflow composition', 'Workflow published as a model', 'Model-as-tool delegation']],
      ['Complete conversation data', 'Store the complete AI conversations that pass through your gateway in PostgreSQL. Use that history to analyze usage and improve prompts, routing, and model composition.', ['Complete AI sessions', 'Model and tool execution logs', 'Token and duration metrics']],
      ['API-first backend', 'Runtime operations are built on APIs. Create business tables in PostgreSQL and manage application data alongside the AI conversations that inform it.', ['API-based runtime operations', 'Dynamic business tables', 'AI data and business data together']],
      ['MCP Gateway', 'Expose APIs and MCP tools to Agents through progressive discovery. Find available tools, load the definition you need, then call the tool for the task.', ['list: discover available tools', 'get: retrieve a tool definition', 'call: execute the selected tool']],
      ['React Blocks', 'Build application interfaces with React code blocks. Use the React ecosystem to connect your UI with the APIs, workflows, and data behind it.', ['Editable React code', 'React ecosystem components', 'Business application interfaces']],
    ],
    galleryTitle: 'Compose capabilities. Inspect how they run.',
    galleryDescription: 'The workflow editor, API publishing, execution logs, and token dashboard provide a view into your AI runtime.',
    images: ['Workflow editor', 'API publishing', 'Detailed execution logs', 'Token dashboard'],
    ctaTitle: 'Self-host the runtime. Build from there.',
    ctaBody: 'Open source under Apache 2.0. Application templates and improved Agent building without source-code context are in progress. For complex applications today, keep your coding Agent in the 1flowbase project context.',
    cta: 'View source',
  },
  zh: {
    sections: [
      ['AI Gateway', '通过统一网关接入模型与已发布的工作流，支持三种主流 AI API 协议之间的转换。', ['OpenAI Chat Completions', 'OpenAI Responses', 'Anthropic Messages']],
      ['工作流与虚拟模型', '把模型、工具、API 与业务逻辑组合成工作流，再将它发布为虚拟模型。也可以把工作模型作为工具，交给主模型按需调用。', ['可视化组合工作流', '将工作流发布为模型', '模型作为工具调用']],
      ['完整会话数据', '将经过 Gateway 的完整 AI 会话保存在 PostgreSQL 中，用于分析使用情况，并持续优化 Prompt、路由与模型组合。', ['完整 AI 会话记录', '模型与工具执行日志', 'Token 与耗时统计']],
      ['API-first 后端', '运行时操作以 API 为基础。在 PostgreSQL 中动态创建业务表，让应用数据与 AI 会话数据进入同一个系统。', ['基于 API 的运行时操作', '动态创建业务数据表', 'AI 数据与业务数据协同']],
      ['MCP Gateway', '通过渐进式工具发现，把 API 与 MCP Tool 暴露给 Agent。先发现可用工具，再读取所需定义，最后执行当前任务需要的能力。', ['list：发现可用工具', 'get：获取工具定义', 'call：执行所选工具']],
      ['React Blocks', '使用 React 代码区块构建应用界面，继续使用 React 生态，将 UI 连接到背后的 API、工作流与业务数据。', ['直接编写 React 代码', '使用 React 生态组件', '构建业务应用界面']],
    ],
    galleryTitle: '组合 AI 能力，查看真实运行过程。',
    galleryDescription: '通过工作流编辑器、API 发布、执行日志与 Token 面板，了解 AI 运行时中的配置与执行情况。',
    images: ['工作流编辑器', 'API 发布配置', '详细执行日志', 'Token 消耗面板'],
    ctaTitle: '自托管运行时，继续构建你的应用。',
    ctaBody: '基于 Apache 2.0 开源。应用模板与降低 Agent 构建应用对源码上下文依赖的能力仍在持续完善。当前构建复杂应用时，建议让 Coding Agent 在 1flowbase 项目上下文中工作。',
    cta: '查看源码',
  },
} satisfies Record<Locale, FeaturePageCopy>;

type UseCase = {
  index: string;
  title: string;
  problem: string;
  solution: string;
  flow: string[];
  guide: string;
};

export const useCasesCopy = {
  en: [
    {
      index: '01',
      title: 'Give your team a shared AI entry point',
      problem: 'Different applications may use different model providers and API protocols. Your team needs a common way to access and distribute those capabilities.',
      solution: 'Use the AI Gateway to publish models and workflows through OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages, while retaining complete conversations in PostgreSQL.',
      flow: ['Applications and Agents', 'AI Gateway', 'Models and published workflows', 'Conversation data in PostgreSQL'],
      guide: '',
    },
    {
      index: '02',
      title: 'Let models work together on a task',
      problem: 'Planning, execution, and review can have different capability and cost requirements. One model does not have to perform every step.',
      solution: 'Compose a workflow in which one model plans, a worker model executes, and another step reviews the result. Publish it as one virtual model, or make a worker model a callable tool.',
      flow: ['Primary model: plan', 'Worker model: execute', 'Review the result', 'Virtual model response'],
      guide: 'Fusion-Style-Workflow',
    },
    {
      index: '03',
      title: 'Build an AI improvement loop from conversation data',
      problem: 'To improve an AI application, you need to understand what people ask, how Agents respond, where tasks fail, and which calls consume resources.',
      solution: 'Use complete sessions stored in PostgreSQL as a foundation for your own usage, quality, and cost analysis. Apply the findings to prompts, harnesses, routing, and model composition.',
      flow: ['AI usage', 'Complete conversation data', 'Analysis', 'Prompt, routing, and workflow improvements'],
      guide: '',
    },
    {
      index: '04',
      title: 'Build an Agent-ready business application',
      problem: 'A working AI application also needs business data, APIs, and a usable interface. Those pieces need to connect with its models and workflows.',
      solution: 'Combine dynamic PostgreSQL tables, an API-first backend, workflows, and React Blocks. Use MCP list / get / call to discover and invoke exposed capabilities. Templates and improved building without source-code context are in progress; complex apps currently benefit from an Agent working in the project context.',
      flow: ['Business data model', 'APIs and AI workflows', 'React application interface', 'Agent access through MCP'],
      guide: '',
    },
  ],
  zh: [
    {
      index: '01',
      title: '为团队建立统一的 AI 入口',
      problem: '不同应用可能使用不同模型供应商与 API 协议，团队需要统一接入与分发这些能力。',
      solution: '通过 AI Gateway，以 OpenAI Chat Completions、OpenAI Responses 和 Anthropic Messages 发布模型与工作流，同时把完整会话沉淀到 PostgreSQL。',
      flow: ['应用与 Agent', 'AI Gateway', '模型与已发布的工作流', 'PostgreSQL 中的会话数据'],
      guide: '',
    },
    {
      index: '02',
      title: '让不同模型协作完成一个任务',
      problem: '规划、执行与审查，对模型能力和成本的要求各不相同。一个任务的所有步骤不必都由同一个模型完成。',
      solution: '通过工作流让主模型负责规划、工作模型负责执行，再审查最终结果。将它发布成一个虚拟模型，也可以把工作模型作为主模型按需调用的工具。',
      flow: ['主模型：规划任务', '工作模型：执行任务', '审查执行结果', '返回虚拟模型响应'],
      guide: 'Fusion-Style-Workflow',
    },
    {
      index: '03',
      title: '用会话数据构建 AI 优化闭环',
      problem: '改进 AI 应用，需要了解用户提出了什么问题、Agent 如何回答、哪些任务失败，以及资源消耗发生在哪里。',
      solution: '以 PostgreSQL 中的完整会话为基础，构建自己的使用、质量与成本分析，并将发现用于优化 Prompt、Harness、路由策略与模型组合。',
      flow: ['AI 使用', '完整会话数据', '分析问题与机会', '优化 Prompt、路由与工作流'],
      guide: '',
    },
    {
      index: '04',
      title: '构建能被 Agent 使用的业务应用',
      problem: '完整的 AI 应用还需要业务数据、API 和可用的界面，这些能力需要与模型和工作流连接起来。',
      solution: '组合动态 PostgreSQL 业务表、API-first 后端、工作流与 React Blocks，通过 MCP 的 list / get / call 发现和调用已暴露的能力。应用模板与降低源码上下文依赖仍在完善；当前构建复杂应用时，建议让 Agent 在项目上下文中工作。',
      flow: ['业务数据模型', 'API 与 AI 工作流', 'React 应用界面', '通过 MCP 接入 Agent'],
      guide: '',
    },
  ],
} satisfies Record<Locale, UseCase[]>;
