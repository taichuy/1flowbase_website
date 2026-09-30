import type { Locale } from '../config';

export const topicOrder = ['gateway', 'workflows', 'observability', 'field-notes'] as const;
export type BlogTopic = (typeof topicOrder)[number];

export const blogTopics = {
  en: {
    gateway: { title: 'Evaluate an AI gateway', description: 'Decide where a shared endpoint fits and test it with one real client.', guide: 'gateway-evaluation', next: 'Run the gateway evaluation checklist', featured: 'self-hosted-ai-gateway-for-small-teams' },
    workflows: { title: 'Compose models and tools', description: 'Build reusable model behavior and inspect the calls behind it.', guide: 'fusion-workflow', next: 'Explore the Fusion workflow guide', featured: 'workflow-backed-virtual-models' },
    observability: { title: 'Investigate an AI run', description: 'Connect execution evidence to a review decision and a useful next step.', guide: 'run-review-evaluation', next: 'Run the review-app evaluation checklist', featured: 'from-ai-run-logs-to-review-app' },
    'field-notes': { title: 'Engineering notes', description: 'Practical notes from building and operating an open-source project.', guide: '', next: 'Explore the documentation', featured: '' },
  },
  zh: {
    gateway: { title: '评估 AI 网关', description: '判断统一入口是否适合你的应用，再用一个真实客户端验证。', guide: 'gateway-evaluation', next: '按网关评估清单开始验证', featured: 'self-hosted-ai-gateway-for-small-teams' },
    workflows: { title: '组合模型与工具', description: '把模型行为组织成可复用工作流，查看背后的调用过程。', guide: 'fusion-workflow', next: '继续阅读 Fusion 工作流指南', featured: 'workflow-backed-virtual-models' },
    observability: { title: '排查一次 AI 运行', description: '把执行证据连接到复盘结论，找到下一步需要验证的改动。', guide: 'run-review-evaluation', next: '按复盘应用清单开始验证', featured: 'from-ai-run-logs-to-review-app' },
    'field-notes': { title: '工程实践', description: '构建与维护开源项目时的实践记录。', guide: '', next: '探索产品文档', featured: '' },
  },
} satisfies Record<Locale, Record<BlogTopic, { title: string; description: string; guide: string; next: string; featured: string }>>;
