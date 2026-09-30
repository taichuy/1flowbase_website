---
title: "From AI run logs to an internal review app"
description: "A practical 1flowbase pattern for teams that need to investigate AI runs, keep review decisions and build a small internal tool around execution evidence."
publishedAt: 2026-09-30
lang: en
slug: from-ai-run-logs-to-review-app
tags:
  - AI observability
  - application runtime
  - run review
---

A teammate reports that an AI assistant gave a poor answer. The screenshot shows the result, but leaves the useful questions unanswered: which workflow ran, what did a tool return, and did the final response include that evidence?

For a prototype, someone can inspect a log manually. For a team reviewing repeated incidents, that investigation also needs an owner, a conclusion and a link back to the relevant run. This is where an AI gateway can become the starting point for an internal application.

1flowbase combines model and workflow execution with run inspection, PostgreSQL-backed business Data Models, APIs and React-based interfaces. The scenario below shows how those pieces can support a small run-review tool. It is a proposed implementation pattern using documented capabilities, not a shipped review-app template or a report of a completed deployment.

## Who is this for?

This pattern fits an AI product developer, an internal-tools engineer or a small team maintaining an assistant whose answers require occasional investigation. The immediate goal is to answer “what happened, and what did we decide to change?” without copying full conversations into a spreadsheet or chat channel.

A useful first version could support three actions:

1. Find a run that needs review.
2. Inspect the available execution evidence.
3. Save a human review decision linked to that run.

If the built-in log view already meets your needs, start there. If you need enterprise-wide telemetry, formal compliance controls or a guaranteed recovery engine, evaluate those requirements separately. This scenario does not establish those guarantees.

## Keep execution evidence and review decisions separate

The [existing Token BOM guide](/docs/token-bom/) explains how to inspect model calls, tool callbacks and usage. Use that evidence rather than inferring a cause from the final answer alone.

For the internal application, add your own review record. A minimal data shape might be:

```text
Review record (your business data)
  application reference
  run reference
  review status: new / investigating / resolved
  issue category
  reviewer note
  created time and updated time
```

These are suggested fields for a Data Model you create; they are not promised built-in column names. Keep a reference to the original run rather than duplicating the entire prompt, tool output and response. That reduces unnecessary copies of sensitive material and keeps the review note distinct from the execution record.

The current [log-structure note](https://github.com/taichuy/1flowbase/wiki/1flowbase%E6%97%A5%E5%BF%97%E7%BB%93%E6%9E%84) describes a development schema snapshot, including task, run, message and trace projections. It also distinguishes execution status, whether a final answer was observed, and whether the trace projection is ready. The task-level grouping is newer than v0.4.1 and must not be assumed available in that release. Those are different questions. Do not label a task successful merely because a log row exists, or assume an incomplete display proves the model failed.

Do not build a new application by writing directly into internal log tables. Check the supported interfaces for your installed version, and use an authorized read path. The [v0.4.1 console log handlers](https://github.com/taichuy/1flowbase/blob/v0.4.1/api/apps/api-server/src/routes/applications/application_runtime/log_handlers.rs) use console authorization; an application API key is not a grant to read administration logs. If it cannot expose the reference or fields you need, keep the review process manual until that gap is addressed.

## Build the smallest useful vertical slice

### 1. Establish the evidence source

Start with a non-production deployment and synthetic prompts. Record the version and provider configuration. Run a simple request and confirm that its answer can be matched to the log entry and trace. The [gateway checklist](/docs/gateway-evaluation/) covers this prerequisite.

Inspect what is actually available: inputs and outputs, status, model calls, tool results and usage. Missing fields should remain unknown. A token count is not automatically a currency amount, and an empty output is not automatically a successful answer.

### 2. Create a business Data Model

Define a small review-record model using 1flowbase's Data Model capability. Its generated CRUD API can support the review records your app owns. Validate required fields and permitted status transitions in your implementation.

The product's [v0.4.1 README](https://github.com/taichuy/1flowbase/blob/v0.4.1/README.md) documents Data Models, automatic CRUD APIs and workflow-backed APIs. That establishes the building blocks; it does not imply that a read/write review queue appears without configuration.

### 3. Add a narrow interface

Use React/TSX blocks for a list of review items and a detail screen. Start with filters for review status and a route to the original run evidence. The interface should make clear whether the information shown is a human note, a model output or an execution status.

Test permissions as well as layout. An interface hiding a button is not a substitute for backend authorization. A person allowed to edit a review note should not automatically gain access to every conversation or another application's run.

### 4. Introduce agent tooling after the human flow works

The documented MCP gateway uses progressive discovery through `mcp_list`, `mcp_get` and `mcp_call`. This can help an agent discover and invoke exposed capabilities while you build or operate the application.

Expose only the capabilities needed for the task. Verify the authenticated principal and permission boundaries, and distinguish read-only inspection from actions that change business data. Do not give an agent broad write access just because the first prototype is internal.

MCP tooling and application templates are being refined. Complex applications currently benefit from giving the coding agent the 1flowbase project context. This guide does not promise arbitrary application creation without source context.

## What should you observe before calling it useful?

Use the [run-review checklist](/docs/run-review-evaluation/) to test a small, complete loop:

- A synthetic request produces an identifiable run.
- The reviewer can inspect the relevant evidence through an authorized path.
- A review record links to that run without copying unnecessary sensitive content.
- Changing the review status persists and can be read back.
- A user without access cannot retrieve another application's evidence.
- Missing, still-processing or unavailable evidence is shown honestly.

A screenshot of a finished interface proves only that the interface rendered. These checks establish whether the application can support the actual investigation.

## Persistence has limits

Stored conversations and run records help with later inspection. They do not, by themselves, prove automatic execution recovery after a worker or process crash. Recovery, retry ownership, idempotency and external side effects need their own version-specific design and tests.

Retention also creates obligations. Choose what to store, who can read it, how long to keep it and how to back it up. A review record may outlive the original run after retention cleanup; decide whether to preserve a safe summary or mark the evidence unavailable. A cloud model still receives the data routed to it, even when the application and database are self-hosted.

Start with one investigation loop, then expand only after it works with your permissions and data lifecycle. Explore the [project and installation instructions](https://github.com/taichuy/1flowbase) or follow the [evaluation checklist](/docs/run-review-evaluation/) to turn this scenario into a bounded prototype.
