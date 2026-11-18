import { SITE } from '../config';

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://1flowbase.taichuy.com');
  const text = `# 1flowbase

> Enterprise AI App Foundation — An open-source, self-hosted multi-user application foundation connecting humans and every Super-agent. Good context lowers Agent cost and boosts Agent efficiency.

## Primary resources

- Website (English): ${origin}
- Website (简体中文): ${new URL('/zh/', origin)}
- App templates & features: ${new URL('/features/', origin)}
- Use cases: ${new URL('/use-cases/', origin)}
- Documentation: ${new URL('/docs/', origin)}
- Blog: ${new URL('/blog/', origin)}
- GitHub Repository: ${SITE.repository}
- Releases & native installers: ${SITE.repository}/releases/latest
- Wiki: ${SITE.wiki}
- Issues: ${SITE.issues}

## Philosophy

We believe AI-era applications grow from the data layer up. Daily interaction trajectories, enterprise documentation, and live business tables together form the shared context AI needs to understand current reality and act continuously.

## Core capabilities

- **AI Gateway (Model Aggregation, Smart Routing & Chat Trajectory Store)**: Build workflow-backed AI Gateways with smart model routing and parallel Fusion branches across Claude, DeepSeek, OpenAI, and Gemini—translating seamlessly across OpenAI Chat, Responses, and Anthropic Messages while retaining 3-tier chat trajectories in PostgreSQL (or syncing local coding agents via the agent-logs CLI).
- **Business App Foundation (Memory Wiki, Dynamic DB & Native React Blocks)**: Dynamically create physical PostgreSQL tables (standard CRUD, hierarchical tree, and file-linked tables) with instant OpenAPI 3.1 endpoints, and pair them with native React TSX code blocks or built-in templates to build enterprise Wikis, shared memory hubs, CRMs, and custom business systems.
- **GUI & Progressive MCP Parity (Human + Agent Co-Management)**: Decoupled API-first architecture means every action available to humans in the Web GUI is simultaneously exposed to Agents through 4 progressive MCP meta-tools (mcp_list, mcp_get, mcp_call, paginated mcp_result) without context window overflow—plus Event Center hooks and WeChat IM channels.
- **Enterprise Multi-User Governance**: Multi-workspace context isolation, organization & role management down to individual API permission points (RBAC), server-vaulted upstream API keys, and per-user balance & consumption quotas under Apache-2.0.
`;

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
