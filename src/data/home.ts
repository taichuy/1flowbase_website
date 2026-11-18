export interface LocaleHomeCopy {
  title: string;
  heroDescription: string;
  badge: string;
  headlineDark: string;
  headlineAccent: string;
  subtitle: string;
  leadBold: string;
  leadBody: string;
  heroChips: [string, string][];
  primary: string;
  secondary: string;
  versionNote: string;
  agentStripTitle: string;
  modelStripTitle: string;
  sections: {
    memory: {
      eyebrow: string;
      title: string;
      desc: string;
      cards: [string, string][];
    };
    superagent: {
      eyebrow: string;
      title: string;
      desc: string;
      cards: [string, string][];
    };
    mcpChat: {
      eyebrow: string;
      title: string;
      desc: string;
    };
    apps: {
      eyebrow: string;
      title: string;
      desc: string;
      tabs: [string, string, string];
    };
    governance: {
      eyebrow: string;
      title: string;
      desc: string;
      cards: [string, string][];
    };
  };
  comparison: {
    eyebrow: string;
    title: string;
    subtitle: string;
    headers: [string, string, string];
    rows: [string, string, string, string][];
  };
  install: {
    eyebrow: string;
    title: string;
    text: string;
    note: string;
    link: string;
    reviewScript: string;
    copy: string;
    copied: string;
    copyError: string;
  };
  faqEyebrow: string;
  faqTitle: string;
  faqs: [string, string][];
  closing: {
    title: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
}

export const homeCopy: Record<'zh' | 'en', LocaleHomeCopy> = {
  zh: {
    title: '1flowbase — 企业 AI 应用基座 | 支持多人共享的开源应用底座',
    heroDescription:
      '支持多人共享的开源企业 AI 应用基座，连接人与每一个 Super-agent。集成 AI Gateway 模型分发与聚合、PostgreSQL 动态建表与 React 应用底座，以及人与 Agent 共用的 GUI 与渐进式 MCP。',
    badge: '开源自托管 · Rust + PostgreSQL · Apache-2.0',
    headlineDark: '企业 AI ',
    headlineAccent: '应用基座',
    subtitle: '支持多人共享的开源应用底座，连接人与每一个 Super-agent',
    leadBold: '我们相信，AI 时代的应用一定是从数据层面长出来的。',
    leadBody:
      '日常的交互记录、文档资料与业务数据，共同构成了让 AI 理解全局的上下文。好的上下文能够降低 Agent 成本、提高 Agent 效率。',
    heroChips: [
      ['AI Gateway', '模型聚合分发 · 聊天记录留存'],
      ['业务应用底座', '记忆 Wiki · 动态建表 · React 区块'],
      ['GUI 与渐进式 MCP', '人操作界面 · Agent 接管接口'],
    ],
    primary: '本地安装',
    secondary: 'Docker 部署',
    versionNote: 'Apache-2.0 开源 · 支持 Windows、macOS、Linux 原生包与一键 Docker 部署',
    agentStripTitle: '连接的 AGENT 与交互入口',
    modelStripTitle: '支持的模型协议与供应商',
    sections: {
      memory: {
        eyebrow: '会话记忆与 AGENT-LOGS',
        title: '网关对话与本地 Agent 轨迹，全量沉淀为长期记忆。',
        desc: '经过网关的每一次调用自动按三级轨迹入库；不走网关的本地 Claude Code、Codex、DeepSeek Harness 与 OpenCode，也可安装轻量采集 CLI 无侵入集中归档。',
        cards: [
          ['三级轨迹全链路回放', '从会话摘要、消息流到底层请求载荷与输入/模型/工具耗时甘特条，清晰可查。'],
          ['端侧 CLI 无侵入同步', '保留现有开发习惯与代理配置，一键把多台开发机的历史对话汇聚到团队底座。'],
          ['记忆数据开放 API', '聊天记录天然具备查询接口，可随时交由定时工作流交叉核对并生成团队日报。'],
        ],
      },
      superagent: {
        eyebrow: '工作流 · 事件中心 · 通讯渠道',
        title: '不用重启后端、不用轮询盯屏，事件与微信指令即刻唤醒。',
        desc: '如果说 React 区块是前端 GUI 扩展，那么工作流就是系统不重启时的后端动态扩展——支持自定义接口扩展、接口请求前/响应后事件钩子、定时任务与 JS/SQL 节点，并直连微信自定义斜杠指令。',
        cards: [
          ['请求前/响应后事件钩子', '数据入库或文件上传完成瞬间自动触发下游工作流，彻底告别定时轮询脚本。'],
          ['热发布自定义业务接口', '无需重启服务，用工作流组合 SQL、JS 与分支判断，直接发布同步或异步 API。'],
          ['微信私聊斜杠指令触发', '接入日常高频使用的通讯工具，手机发一条 /指令 即可驱动后台复杂工作流并返回结论。'],
        ],
      },
      mcpChat: {
        eyebrow: '渐进式 MCP 引擎',
        title: '上百个系统接口，仅靠 4 个元工具按需接管，绝不撑爆上下文。',
        desc: '传统做法把上百个工具 Schema 一次性塞进系统提示词，既烧 Token 又稀释注意力。1flowbase 只注册 list / get / call / result 四个渐进式元工具，按目录发现、大结果分页提取。',
      },
      apps: {
        eyebrow: '真实构建案例',
        title: '连上 MCP、给张参考图，在底座上长出真正的业务系统。',
        desc: '物理表自动生成 CRUD 接口，工作流承载解析与调度，原生 React TSX 1:1 还原界面审美——从公开趋势榜、标书规则审校到研发复盘日报，皆可直接构建运行。',
        tabs: ['GitHub 官方日榜（导出海报）', '标书规则检测与逐页解析', '每日报告 · Daily Reports'],
      },
      governance: {
        eyebrow: '多人共享与企业治理',
        title: '精细到每一个 API 接口的权限点，消费额度算得清清楚楚。',
        desc: '从单人工作台平滑扩展至多部门协同：组织与角色权限精细到单个后端 API 开关，人与 MCP Agent 严格遵循同一套鉴权边界，并内置用户余额预留与扣费流水。',
        cards: [
          ['接口级 RBAC 权限开关', '按动态路由、数据表与后台设置精细勾选每个 GET/POST/DELETE 接口权限。'],
          ['人机同源安全边界', 'Agent 通过 MCP 调用任何模块均受角色权限约束，杜绝后台越权改表或删库。'],
          ['余额预留与扣费审计', '内置运行中额度预留、自动扣费、手动调整与退款流水，内部分摊或商业交付开箱即用。'],
        ],
      },
    },
    comparison: {
      eyebrow: '生态定位',
      title: '与常见生态产品的定位与区别',
      subtitle: '明确各产品的核心优势与侧重点，便于按个人、团队或上游接入场景选型与配合。',
      headers: ['产品', '核心优点与定位', '1flowbase 的区别与配合'],
      rows: [
        [
          'DSH (DeepSeek Harness)',
          '个人可扩展 Agent 工作台',
          '对个人使用非常友好，架构灵活，支持自由组合各类插件与模块来构建个人工作台。',
          '拥有完善的多人用户体系与接口级权限底座，支持 Rust 原生编译，并可集中采集归档多端 DSH 会话。',
        ],
        [
          'NocoBase',
          '数据表驱动低代码平台',
          '低代码建模与传统业务应用系统构建成熟完备，适合快速搭建标准化表单与企业管理后台。',
          'Rust 原生架构，核心优势在于内置事件中心、AI 网关多模式分发及 AI 应用构建，覆盖传统低代码之外的 AI 场景。',
        ],
        [
          'Magpie',
          'AI 自动路由与多账号反代',
          '自动路由与多账号反代体验出色，专注 AI 网关层的模型调度与切换（不含低代码及集中式数据管理）。',
          '非常适合作为 1flowbase 的上游模型供应商接入；1flowbase 进一步提供低代码/TSX 应用构建与集中式存储管理聊天记录，盘活聊天资产。',
        ],
        [
          'Langfuse',
          'LLM 可观测性与聊天记录管理',
          '专注于 LLM 链路追踪（Tracing）、Prompt 管理与评测分析，聊天记录管理与指标可观测性非常成熟。',
          '支持将 1flowbase 留存与采集的聊天记录直接导入 Langfuse 分析；同时可在 1flowbase 内基于聊天数据直接构建工作流与业务应用。',
        ],
        [
          'LiteLLM',
          '通用多模型 API 代理',
          '上游模型协议适配广泛、Python 生态成熟，专注于多厂商模型 API 的统一代理与转发。',
          'Rust 单体原生编译，在多模式 AI 网关之外，一体化融合 PostgreSQL 动态物理表、工作流与前端业务界面。',
        ],
        [
          'Dots / Grok Bot',
          '常驻智能助手与 Bot',
          '官方一体化常驻体验顺滑、开箱即用；采用闭源形态，主要面向单人场景独立使用。',
          'Apache-2.0 开源自托管，支持多人共享使用；面向多个专属 Bot（如多个 Grok Bot 实例）的统一管理与指挥能力完善中。',
        ],
      ],
    },
    install: {
      eyebrow: '快速部署',
      title: '一行命令，私有化跑起来。',
      text: '在你的服务器或本地运行官方 Docker 脚本即可启动，数据与密钥 100% 留在自有环境。',
      note: '需安装 Docker 环境。Windows / macOS / Linux 原生独立安装包可在页面顶部直接下载。',
      link: '查看完整部署文档',
      reviewScript: '审阅部署脚本',
      copy: '复制',
      copied: '已复制',
      copyError: '请手动选中复制',
    },
    faqEyebrow: '常见问题',
    faqTitle: '开始之前，你可能想了解。',
    faqs: [
      [
        '1flowbase 适合个人还是企业使用？',
        '两者兼顾。底层具备企业级多空间隔离、接口级权限点与用户余额管控，同时支持单机一行命令启动，个人可直接用内置的网关模板和 Wiki 模板管理日常模型与知识库。',
      ],
      [
        '怎么采集本地 Claude Code、Codex、DSH 的聊天记录做记忆？',
        '既可以把客户端接入 1flowbase 网关自动记录，也可以不改现有网关，在后台安装对应平台的采集 CLI 分发包，端侧历史轨迹就会自动按三级日志同步至服务器。',
      ],
      [
        '工作流与原生 React TSX 区块是如何配合构建应用的？',
        '在主数据源动态创建物理表后自动生成 CRUD API；复杂后端逻辑、定时抓取或事件后置处理用工作流扩展（无需重启服务），前端界面用 AI 最熟悉的原生 TSX 区块直连 API 渲染。',
      ],
      [
        '为什么渐进式 MCP 不会撑爆模型上下文窗口？',
        '系统不把上百个接口 Schema 一次性塞进提示词，只暴露 mcp_list、mcp_get、mcp_call、mcp_result 四个元工具，Agent 按目录树检索并在返回值过大时分页读取。',
      ],
    ],
    closing: {
      title: '沉淀私有上下文，筑牢企业 AI 应用基座。',
      sub: 'Apache-2.0 开源 · Rust 构建 · 支持 macOS、Windows、Linux 与 Docker。',
      ctaPrimary: '立即部署',
      ctaSecondary: '在 GitHub 上查看',
    },
  },
  en: {
    title: '1flowbase — Enterprise AI App Foundation | Open-Source Multi-User Runtime',
    heroDescription:
      'An open-source multi-user Enterprise AI App Foundation connecting humans and every Super-agent—unifying AI Gateway routing & fusion, dynamic PostgreSQL + React app building, and shared GUI + Progressive MCP.',
    badge: 'Open Source · Rust + PostgreSQL · Apache-2.0',
    headlineDark: 'Enterprise AI',
    headlineAccent: 'App Foundation',
    subtitle: 'An open-source multi-user app foundation connecting humans and every Super-agent',
    leadBold: 'We believe AI-era applications grow from the data layer up. ',
    leadBody:
      'Daily interaction logs, docs, and live business tables together form the context AI needs to understand the whole picture. Good context lowers Agent cost and boosts Agent efficiency.',
    heroChips: [
      ['AI Gateway', 'Model Routing & Fusion · Chat Logs'],
      ['App Foundation', 'Memory Wiki · Dynamic Tables · React'],
      ['GUI & Progressive MCP', 'UI for Humans · MCP APIs for Agents'],
    ],
    primary: 'Local install',
    secondary: 'Docker deploy',
    versionNote: 'Apache-2.0 Open Source · Native binaries for Windows, macOS, Linux & one-line Docker script',
    agentStripTitle: 'WORKS WITH YOUR AGENTS & CHANNELS',
    modelStripTitle: 'SUPPORTED PROTOCOLS & PROVIDERS',
    sections: {
      memory: {
        eyebrow: 'TRAJECTORY MEMORY & AGENT-LOGS',
        title: 'Gateway traffic and local Agent sessions become shared memory.',
        desc: 'Every gateway call is logged across 3 detail tiers automatically—and for local Claude Code, Codex, DeepSeek Harness, or OpenCode sessions, the lightweight collector CLI syncs trajectories without changing your proxy.',
        cards: [
          ['3-tier trajectory replay', 'Inspect session summaries, full message streams, raw payloads, and Input/LLM/Tool Gantt bars.'],
          ['Zero-proxy CLI collectors', 'Sync local coding agent histories across workstations straight into self-hosted PostgreSQL.'],
          ['API-ready memory assets', 'Query conversation tables directly from scheduled workflows to generate auditable daily reports.'],
        ],
      },
      superagent: {
        eyebrow: 'WORKFLOWS, EVENTS & IM CHANNELS',
        title: 'Extend backends without restarts. Wake flows from events or WeChat.',
        desc: 'React blocks extend the frontend UI; workflows extend the backend without restarting—supporting custom API endpoints, pre/post API event hooks, cron jobs, JS/SQL nodes, and WeChat slash commands.',
        cards: [
          ['Pre/Post API event hooks', 'Trigger downstream pipelines the instant records land or uploads finish—zero polling scripts.'],
          ['Hot-published API extensions', 'Compose SQL, JS, loops, and LLMs into custom sync/async REST endpoints with zero downtime.'],
          ['WeChat slash commands', 'Connect everyday messaging so a single /command triggers complex backend workflows on the go.'],
        ],
      },
      mcpChat: {
        eyebrow: 'PROGRESSIVE MCP ENGINE',
        title: 'Hundreds of system APIs through 4 lean meta-tools. Zero context bloat.',
        desc: 'Dumping 200+ tool schemas into prompts wastes tokens and degrades reasoning. 1flowbase exposes just mcp_list, mcp_get, mcp_call, and paginated mcp_result so Agents discover capabilities on demand.',
      },
      apps: {
        eyebrow: 'BUILT ON 1FLOWBASE',
        title: 'Connect MCP, drop a reference screenshot, and grow real business apps.',
        desc: 'Physical PostgreSQL tables generate CRUD APIs, workflows power document parsing & scheduling, and native React TSX delivers pixel-accurate UIs.',
        tabs: ['GitHub Trending (Poster Export)', 'Bid Document Rule Audit', 'Daily Engineering Reports'],
      },
      governance: {
        eyebrow: 'MULTI-USER GOVERNANCE & RBAC',
        title: 'Endpoint-granular RBAC switches and transparent credit quotas.',
        desc: 'Scale smoothly across teams: lock role permissions down to individual REST paths—enforced identically across human GUI users and MCP Agents—with built-in credit reservation and ledgers.',
        cards: [
          ['Per-endpoint RBAC toggles', 'Grant or revoke individual GET/POST/PATCH/DELETE operations across tables, routes, and settings.'],
          ['Unified human & Agent guardrails', 'MCP Agents inherit exact role boundaries, preventing unauthorized schema or billing changes.'],
          ['Credit reservation & ledger', 'Track live in-flight credit holds, deductions, top-ups, and refunds out of the box.'],
        ],
      },
    },
    comparison: {
      eyebrow: 'ECOSYSTEM POSITIONING',
      title: 'Positioning & distinctions across ecosystem tools',
      subtitle: 'A clear look at each product’s core strengths and focus—whether choosing for solo workflows, team foundations, or upstream integration.',
      headers: ['Product', 'Core Strengths & Focus', '1flowbase Distinction & Synergy'],
      rows: [
        [
          'DSH (DeepSeek Harness)',
          'Personal extensible Agent workbench',
          'Friendly for solo users with a flexible architecture to freely combine plugins and build a personal Agent workbench.',
          'Complete multi-user & endpoint RBAC foundation, compiled natively in Rust—plus centralized multi-device DSH log collection.',
        ],
        [
          'NocoBase',
          'Data-model-driven low-code platform',
          'Mature low-code modeling and traditional business system builder for standardized forms and enterprise admin panels.',
          'Rust-native architecture featuring an Event Center, multi-mode AI Gateway dispatch, and AI app building beyond traditional low-code.',
        ],
        [
          'Magpie',
          'AI auto-router & reverse proxy',
          'Strong auto-routing and multi-account reverse proxy focused on the AI gateway layer (without low-code or centralized chat storage).',
          'Fits directly as an upstream model provider for 1flowbase, which adds low-code/TSX apps and centralized chat storage to activate chat assets.',
        ],
        [
          'Langfuse',
          'LLM observability & chat log management',
          'Mature LLM tracing, prompt management, and evaluation analytics dedicated to chat log management and observability.',
          'Supports importing chat logs retained or collected in 1flowbase directly into Langfuse, while building workflows and business apps on top of chat data inside 1flowbase.',
        ],
        [
          'LiteLLM',
          'Universal multi-LLM API proxy',
          'Broad upstream protocol support and mature Python ecosystem focused on unified multi-provider model API forwarding.',
          'Single-binary Rust runtime uniting AI Gateway routing, dynamic PostgreSQL tables, workflows, and business UIs in one stack.',
        ],
        [
          'Dots / Grok Bot',
          'Always-on assistant & Bot',
          'Turnkey always-on assistant experience out of the box; closed-source and designed primarily for single-user use.',
          'Apache-2.0 open-source & self-hosted with multi-user sharing; unified management & command for multiple dedicated Bots (e.g., Grok Bot instances) is in progress.',
        ],
      ],
    },
    install: {
      eyebrow: 'SELF-HOSTED',
      title: 'Up and running in one command.',
      text: 'Run the official Docker deployment script on your server or workstation. Keys and data stay 100% yours.',
      note: 'Requires Docker. Native installers for Windows, macOS, and Linux are available in the top download button.',
      link: 'Read deployment docs',
      reviewScript: 'Inspect install script',
      copy: 'Copy',
      copied: 'Copied',
      copyError: 'Select manually to copy',
    },
    faqEyebrow: 'FAQ',
    faqTitle: 'Common questions, direct answers.',
    faqs: [
      [
        'Is 1flowbase built for individuals or enterprises?',
        'Both. It ships enterprise workspaces, endpoint-granular RBAC, and user credit quotas out of the box, while remaining a single-command install for solo builders using built-in Gateway and Wiki templates.',
      ],
      [
        'How do I collect local Claude Code, Codex, or DSH logs into shared memory?',
        'Either route clients through 1flowbase’s AI Gateway, or install the platform collector CLI from the agent-logs app to sync full 3-tier trajectories without changing your existing proxy.',
      ],
      [
        'How do workflows and native React TSX blocks work together?',
        'Dynamic physical tables expose instant CRUD APIs; workflows add custom backend endpoints, cron jobs, and pre/post event hooks without restarts; native TSX blocks render custom UIs directly against those APIs.',
      ],
      [
        'How does Progressive MCP prevent context window bloat?',
        'Instead of dumping 200+ endpoint schemas into prompts, 1flowbase exposes just mcp_list, mcp_get, mcp_call, and paginated mcp_result so Agents fetch schemas and large outputs on demand.',
      ],
    ],
    closing: {
      title: 'Own your context. Build on an Enterprise AI App Foundation.',
      sub: 'Apache-2.0 Open Source · Built in Rust · macOS, Windows, Linux & Docker.',
      ctaPrimary: 'Deploy now',
      ctaSecondary: 'View on GitHub',
    },
  },
};
