---
title: "Turn agent conversations into a project tracker you can keep using"
description: "A practical pattern for turning confirmed decisions from agent conversations into project records, CRUD APIs and a React interface, with MCP for ongoing updates."
publishedAt: 2026-10-01
lang: en
slug: from-agent-conversations-to-project-tracker
topic: field-notes
tags:
  - Agent applications
  - Data Models
  - MCP
---

A project discussion ends with a useful summary: the landing page is ready, someone needs to check the mobile layout, and the launch date still needs a decision. Next week, another conversation produces another summary. Finding the current owner and unresolved decisions now means reading both threads.

A small project tracker gives those decisions a place to live. The conversation remains the source; a record carries the latest confirmed state, and a screen makes it easy to review and change.

This article describes a proposed implementation using 1flowbase's documented building blocks. It is not a shipped chat-to-project template. You or your agent must configure the models, implement the extraction and review flow, and build the interface. Start with synthetic data and check the capabilities exposed by your installed version.

## Start with one decision, not the whole transcript

Consider this fictional conversation:

- User: “The landing page is ready for review.”
- Agent: “We could check the mobile layout on Friday.”
- User: “Add the mobile check. Leave the owner and date open.”

The confirmed task is “Check the mobile layout.” Its owner and due date are unknown. Friday was a suggestion, not an agreed deadline. The page being ready for review also does not mean the mobile check is complete.

Have an agent propose a small record and show it for review before writing it. Keep missing values empty and retain a source reference. A useful first data shape is:

```text
Project: title
Action item:
  project reference
  title
  owner (optional)
  due date (optional)
  status: proposed / confirmed / in progress / done
  source reference
  confirmed by / confirmed at
```

These are fields you design, not built-in names. Choose a source reference that authorized reviewers can open. If a chat has no stable link, use an approved export identifier and message locator; do not invent a permalink or copy an entire private transcript into a task title.

## Give the confirmed record a backend

The current [1flowbase README](https://github.com/taichuy/1flowbase#what-you-can-build) documents Data Models that materialize PostgreSQL schemas and generate CRUD APIs with OpenAPI contracts. It also documents workflow-backed custom endpoints, Native React blocks and MCP operation. These provide the application foundation for this pattern.

Create and publish `Project` and `ActionItem` Data Models, with a relation between them. Inspect the generated API contract rather than guessing endpoint paths or request fields. Test creating one synthetic item, listing it and changing its status through the supported API.

Decide how updates should behave before adding automation:

- Give each imported proposal a stable source key and implement duplicate detection. Retrying the same import should not create another task.
- Re-read the current item before applying a change. Where the API supports it, use a version check; otherwise implement a conflict check and send ambiguous updates back for review.
- Keep task status separate from approval to send a message, publish a page or spend money. Confirming a task does not authorize its external side effects.

Those safeguards are application logic you must implement and test. A generated CRUD API does not establish your project's approval rules. If a transition needs more than a record update, define a Workflow Extension with an explicit input/output contract and publish a custom endpoint. Verify authorization and validation on the backend, including requests made outside the UI.

## Build a screen for the next conversation

Use Native React/TSX blocks to create a focused interface:

1. A review queue for proposed items, showing the source and uncertain fields.
2. A project list filtered by status, with unassigned work visible.
3. A detail view for confirming an owner, changing a date or marking an item done.

Bind it to the APIs exposed by your application. Make the difference between a proposed value and a confirmed value visible. After saving, read the record back; if the write fails, retain the draft and show the error instead of displaying a success state.

A useful acceptance test is simple: close the page, open it again, and see the same confirmed task. Then update it in a second session and verify that the first session does not silently overwrite the newer state. This is what makes the tracker useful beyond the chat that created it.

## Let MCP maintain the application

1flowbase's documented discovery loop is `mcp_list` → `mcp_get` → `mcp_call`: discover a capability, inspect its contract, then call it. An authorized agent can use exposed capabilities to build and operate the application. The precise tools and permissions depend on the instance configuration.

Give the agent a bounded task such as: “Find this project's confirmed items with no owner and propose follow-up questions.” Start with read access. Add narrowly scoped write operations only when you have tested their behavior and approval boundaries.

For a later conversation, the flow you implement can be:

```text
Read authorized source + current project state
  → propose a change with its source
  → resolve uncertainty and obtain required approval
  → call the permitted application capability
  → read back and report the saved result
```

MCP supplies a tool interface. Your agent and application still need the instructions, scheduling, error handling and confirmation logic. Connecting MCP alone does not start a background worker or automatically turn every conversation into tasks.

## Keep the source and permission boundaries clear

The tracker only needs enough context to support the decision. Avoid duplicating credentials, private customer details or unrelated conversation content. Set retention rules for both the source material and your derived records; if the source expires, mark it unavailable rather than showing a broken link as evidence.

A person allowed to view a project task should not automatically gain access to administration logs or all conversations. Test access using a second, restricted identity. Self-hosting the application also does not prevent data being sent to a cloud model if you configure that model to process it.

You can begin with a manually selected, authorized excerpt. If you want to use gateway logs, first verify a supported, authorized read path for your installed version. The [run-review article](/blog/from-ai-run-logs-to-review-app/) covers that separate evidence-access problem. Do not assume the application's CRUD key grants console-log access.

## Try one complete loop

1. Follow the official [installation instructions](https://github.com/taichuy/1flowbase#installation-or-upgrade), or choose your operating system in the [website quick start](/#get-started). Use a test instance and record its version.
2. Create the two Data Models and verify one synthetic record through the generated API.
3. Build the review and detail screens with React blocks.
4. Connect an authorized agent through the instance's MCP setup and inspect the available tool contracts.
5. Feed it the fictional conversation above. Verify that the owner and date stay empty until confirmed.
6. Repeat the import, edit the item in another session, and test with a restricted identity. Check duplicates, conflicts and denied access before using real project data.

The first milestone is one confirmed item that survives a reload and can be updated safely in the next conversation. Once that works, expand the model and review flow around the decisions your project actually needs to track. The [source repository](https://github.com/taichuy/1flowbase) and [documentation](/docs/) are the starting points for checking your version's supported capabilities.
