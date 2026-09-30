---
title: "A self-hosted AI gateway for small application teams"
description: "When an AI app needs several providers, one client-facing API and inspectable workflow runs, see where 1flowbase fits and how to evaluate it."
publishedAt: 2026-09-30
lang: en
slug: self-hosted-ai-gateway-for-small-teams
tags:
  - AI gateway
  - application teams
  - self-hosting
---

Your internal assistant started with one model call. Now the support tool uses one provider, the coding assistant uses another, and a document feature needs a specialist model. Each application has its own provider configuration and debugging path. Changing the model is becoming an application change.

A self-hosted AI gateway can give those clients a common entry point. In 1flowbase, the published model can also represent a workflow. That makes it useful for a small engineering team that wants to own its deployment, reuse model behavior across clients, and inspect what happened behind a response.

This is an evaluation guide, not a claim that every client or provider combination has been tested. The API contract below is grounded in the [v0.4.1 source](https://github.com/taichuy/1flowbase/tree/v0.4.1). Main, development branches, provider plugins and Docker `latest` can differ.

## Who needs this layer?

Consider 1flowbase when several of these are true:

- You maintain more than one AI application or agent client.
- Provider-specific setup is repeated across those clients.
- A request sometimes needs multiple models or tools.
- You need to trace a result back to the calls and workflow nodes that produced it.
- Your team can operate a self-hosted service and its database.

For example, an internal knowledge assistant might start with a single-model workflow, then add a review step for a narrow class of answers. The client can keep calling the published model name while the team changes the workflow behind it. The team still needs to test the new behavior; a stable API shape does not guarantee unchanged answers, latency or cost.

A direct provider SDK is often enough for a small application making one straightforward model call. Adding a gateway introduces another service, configuration surface and failure boundary. Use it when the shared behavior and visibility justify that work.

## What the architecture looks like

```text
Application backend or agent client
  -> 1flowbase API + application key + public model name
  -> published model or AgentFlow
  -> configured provider/model and optional tools
  -> response plus recorded execution evidence
```

1flowbase documents OpenAI Chat Completions, OpenAI Responses and Claude-compatible Messages interfaces. Treat compatibility as something to verify against the exact features your client uses: a successful text request does not establish streaming, tool-call, image and cancellation behavior.

There are also two different kinds of credentials. Provider credentials connect 1flowbase to the upstream model service. An application API key lets a client call the published 1flowbase application. Keep both private, and keep application keys out of browser-delivered JavaScript. Self-hosting the gateway does not stop configured cloud providers from receiving the requests you send to them.

## Start with one successful request

The first milestone should be small: one provider, one published model, one synthetic prompt and one matching run log.

1. Follow the [official installation and upgrade instructions](https://github.com/taichuy/1flowbase#installation-or-upgrade) in an isolated test deployment. Record source revision, resolved image versions and provider plugin versions. The moving installer fetches deployment files from main; it is not a pinned release installation.
2. Configure an authorized provider and model using the deployment's private settings. Confirm the provider works before building a multi-model graph.
3. Configure a minimal AgentFlow with Start and LLM nodes. Give its public model a name such as `first-request`, publish it, and use its application API key. Consult the installed version's API panel for its exact endpoint and supported parameters.
4. Send a synthetic text request. Keep secrets in your private local environment and disable shell tracing or terminal capture that might reveal them.

The following is a source-based example, not output from a live installation test. `FLOWBASE_BASE_URL` is the deployment origin without a trailing slash; `FLOWBASE_APP_KEY` is the application key, not your provider key. The published model must actually be named `first-request`.

```bash
curl --silent --show-error --fail-with-body \
  "${FLOWBASE_BASE_URL}/v1/chat/completions" \
  --header "Authorization: Bearer ${FLOWBASE_APP_KEY}" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "first-request",
    "messages": [{"role": "user", "content": "Reply with a short greeting. This is synthetic test data."}],
    "stream": false
  }'
```

Success means a successful HTTP response with a non-empty assistant answer **and** the corresponding run in 1flowbase. Match the prompt and time, then inspect the model call and final result. An HTTP error, missing log or empty answer is something to investigate, not a completed evaluation.

The [gateway evaluation checklist](/docs/gateway-evaluation/) keeps the version, request and trace checks together.

## Add orchestration only for a specific need

Once the single-model path works, choose one extension:

- A screenshot-heavy coding task can use the [vision-model pattern](/docs/glm-vision/).
- A task needing independent reviews can use the [Fusion workflow](/docs/fusion-workflow/).
- A specialist branch needing tools can follow the [smart-routing guide](/docs/smart-routing/).

These are workflow choices you configure and evaluate. Do not assume that adding a second model creates automatic failover or makes every answer better. A multi-model run may consume more tokens, introduce additional latency and send data to additional providers.

Test the same small set of representative prompts before and after the change. Record answer quality against your own acceptance criteria, errors, latency and available usage fields. Include failed requests and repeated attempts in the comparison. Token totals alone are not a complete bill.

## What remains your responsibility

Self-hosting means operating the service: access control, HTTPS, database backups, retention, upgrades and capacity all need owners. Review the [deployment documentation](https://github.com/taichuy/1flowbase/blob/v0.4.1/docker/README.md) for the version you run. Do not expose a fresh test deployment or reuse demonstration credentials in production.

Application templates and reduced-source-context agent setup are still being improved. For complex application work, expect engineering effort and project context. The gateway is a useful first step without requiring you to adopt every part of the application runtime at once.

Start with the [checklist](/docs/gateway-evaluation/), then use the [run-review application guide](/blog/from-ai-run-logs-to-review-app/) when your team needs to turn execution evidence into an internal workflow.
