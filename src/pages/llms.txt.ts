import { SITE } from '../config';

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://1flowbase.taichuy.com');
  const text = `# 1flowbase

> 1flowbase is an open-source, self-hosted AI Gateway and AI application runtime. It connects model access, workflows, complete conversation data, APIs, business data, MCP and React interfaces.

## Primary resources

- Website: ${origin}
- Features: ${new URL('/features/', origin)}
- Use cases: ${new URL('/use-cases/', origin)}
- Blog: ${new URL('/blog/', origin)}
- Chinese website: ${new URL('/zh/', origin)}
- Source code: ${SITE.repository}
- Documentation and tutorials: ${SITE.wiki}
- Issues: ${SITE.issues}

## Core concepts

- Workflow-backed virtual model: a standard model endpoint whose behavior is implemented by a reusable workflow of models and tools.
- Protocol publishing: OpenAI Responses, Chat Completions, and Claude Messages-compatible endpoints.
- Visual orchestration: explicit model, branch, tool, and synthesis nodes.
- Connected observability: node inputs and outputs, model calls, tool callbacks, tokens, latency, cost, and failures in one execution trace.
- Self-hosted deployment: Docker-based installation that keeps credentials and execution data under the operator's control.

- Complete conversations: retained in PostgreSQL; plan storage, retention, backups and compliance before production use.
- Business data and API-first runtime: create data tables and APIs on the same application foundation.
- MCP Gateway: progressive tool discovery with list, get and call.
- React Blocks: code-based React interfaces using the React ecosystem.

## Current status

Official MCP tools, descriptions and defaults are being refined. For complex applications, coding agents should currently work with the 1flowbase project context. Ready-to-use application templates and simpler defaults are roadmap work, not finished one-click applications.

## Canonical positioning

Start with an AI Gateway, compose and distribute AI capabilities, retain your conversation data, and continue building a complete application on the same runtime. Built for people and agents.
`;

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
