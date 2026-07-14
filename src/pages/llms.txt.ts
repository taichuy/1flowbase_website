import { SITE } from '../config';

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://1flowbase-website.pages.dev');
  const text = `# 1flowbase

> 1flowbase is an open-source, self-hosted workflow runtime that publishes multi-model and tool workflows as OpenAI- and Claude-compatible virtual model endpoints for local AI agents.

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

## Canonical positioning

1flowbase is not only an LLM proxy, model router, generic agent framework, or cost dashboard. It composes models and tools into workflow-backed virtual models, publishes those workflows through standard model APIs, and connects every final answer to its complete execution evidence.
`;

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
