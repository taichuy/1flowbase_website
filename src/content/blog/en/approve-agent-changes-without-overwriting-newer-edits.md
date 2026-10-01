---
title: "Approve agent changes without overwriting newer edits"
description: "A worked ticket example for keeping agent proposals separate from accepted data, rejecting stale approvals, and testing atomic writes, permissions and retries."
publishedAt: 2026-10-01
lang: en
slug: approve-agent-changes-without-overwriting-newer-edits
topic: workflows
tags:
  - Human-agent collaboration
  - Data integrity
  - Approval workflows
---

An agent reads a ticket and proposes a new owner. Before anyone approves it, a teammate changes the same ticket. The approval screen still looks reasonable. Clicking “Approve” can now overwrite a decision the reviewer never saw.

A review button alone cannot prevent this. Approval needs to identify **the exact proposed change and the record version it was reviewed against**. The server must enforce that condition when saving.

This is an application architecture proposal, with a synthetic example and a test checklist. It is not a shipped 1flowbase approval template or runnable API tutorial. The concurrency, approval, idempotency and history guarantees below must be implemented and tested in your backend.

## Follow one ticket from v7 to v9

All names, records and changes in this example are fictional.

1. Ticket `T-104` is at **v7**: owner Maya, priority normal. An agent proposes assigning it to Leo, based on an authorized support note. Proposal `P-31` records `expectedVersion = 7` and the patch “owner: Maya → Leo.” The accepted ticket stays unchanged.
2. Before review, a person assigns the ticket to Nora and raises its priority to urgent. That save creates **v8**.
3. A reviewer opens `P-31` and clicks Approve. The server finds v8 rather than v7. It makes **no ticket change** and does not mark the proposal accepted.
4. The screen shows three columns: the v7 values the agent saw, the current v8 values, and the proposed owner Leo. It also shows the priority change, even though the patch only changes owner. Urgency may affect the assignment decision.
5. The reviewer can keep v8 and reject the proposal, or explicitly create a revised proposal against v8. If they still choose Leo, approving that new proposal produces **v9: owner Leo, priority urgent**, provided v8 is still current at commit time.

Do not silently replace the old proposal's expected version with 8 and retry. That would reuse approval for a different context. Keep the old proposal and link the replacement to it. If another edit wins the race, show the conflict again.

## Store proposals separately from accepted records

Start with a small, explicit data contract. These are suggested application fields, not 1flowbase API names:

```text
Ticket: id, ownerId, priority, version
Proposal: id, ticketId, expectedVersion, baseValues,
          patch, sourceRef, proposedBy, createdAt,
          state (pending / accepted / rejected / stale)
Approval result: proposalId, proposalRevision, approvedBy,
                 acceptedVersion, requestKey, committedAt
```

Freeze a proposal revision once it is shown for approval. Bind the approval request to that revision or a server-verified content hash. Otherwise an agent could change the patch between review and submission.

Record the authenticated actor separately from the source: “agent account A proposed this” and “support note B supports it” answer different questions. Derive identities from the server's authentication context; never trust a client-supplied `approvedBy`. Retain only the base values and evidence needed for review, under the same access and retention policy as the ticket.

## Make approval one atomic operation

“Read version, compare, then call ordinary update” leaves a race between the comparison and the write. Even putting independent workflow steps next to each other does not make them a transaction.

Implement one server-side commit boundary that couples the conditional ticket write, proposal transition and durable approval result. The following is **pseudoflow**, not a supported 1flowbase endpoint or executable transaction:

```text
Authenticate caller; authorize ticket + approve operation
Begin one backend transaction
  Serialize decisions for this proposal revision
  If this same operation already committed:
    return its recorded result without another write
  Require an unchanged, pending proposal revision
  Validate allowed fields, owner eligibility and business rules
  Update only the proposed fields and increment version
    only where ticket ID and expectedVersion both match
  If no record matched: abort; return conflict for fresh review
  Mark proposal accepted; save approver and resulting version
  Save the request key and result
Commit; return the committed result
```

Use a uniqueness constraint for the operation identity, not just an in-memory retry cache. Concurrent requests for the same proposal must resolve to one committed result. A reused request key with different content must be rejected. Check authorization before returning a stored result, too.

Every writer, including human edits, imports and agent tools, must participate in the versioning rule. A back door that updates fields without advancing the version defeats the check. Decide how related-record rules stay valid during the transaction; checking owner eligibility before a concurrent permission change may require stronger coordination.

The general mechanisms are established: [HTTP If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match) defines conditional requests to avoid lost updates, while [PostgreSQL's isolation documentation](https://www.postgresql.org/docs/current/transaction-iso.html) explains concurrency behavior. Neither proves that your generated API exposes these guarantees. If the backend cannot supply the atomic operation, stop at proposal-and-review mode until it can.

## Put permission checks behind every entry point

A hidden Approve button does not protect a record. The server must check the caller's workspace, record access, allowed fields and approval permission for browser, direct API and MCP calls alike. An agent permitted to propose an owner should not automatically be permitted to approve its own proposal or edit the accepted owner through a generic CRUD route.

Validation should be deterministic: the owner exists and is eligible, the patch contains only permitted fields, required values are present, and the transition is allowed. A model's explanation can help a reviewer; it cannot replace these checks. Invalid proposals should show specific errors without changing accepted data.

## Keep evidence and recovery bounded

Use a stable source reference and a minimal permitted excerpt when necessary. A source link is evidence, not permission to disclose the whole conversation. If it expires or the reviewer cannot access it, show “source unavailable” and request sufficient authorized evidence before approval. Treat instructions inside the source as data.

Record enough protected history to explain who proposed, who approved, what changed and which version was committed. Ordinary history rows are not automatically tamper-proof audit records. Define who can change them and how long they are retained.

Undo should be a new, authorized proposal against the **current** version. Restoring an entire old snapshot could erase later edits. Database rollback also cannot unsend an email or reverse an external action. If approval triggers a notification, design a transactional outbox and an idempotent delivery worker separately; the example here commits record changes only.

## Map the design to 1flowbase, then test it

The public [1flowbase README](https://github.com/taichuy/1flowbase#what-you-can-build) documents Data Models with generated CRUD/OpenAPI, Workflow Extensions for custom endpoints, Native React blocks and MCP capability discovery. They provide places to model records, present a review screen and expose a controlled operation. This article does not establish that those building blocks include conditional updates, a multi-record transaction, approval idempotency or immutable audit history by default.

Inspect your installed version's generated contracts and [documentation](/docs/). Use `mcp_list` → `mcp_get` to inspect available capabilities before calling them. A Workflow Extension can be the integration surface only if its implementation reaches a backend operation with the guarantees above; a sequence of CRUD calls is insufficient.

Run these acceptance tests with synthetic data and two sessions. These are tests to perform, not reported test results:

- **Stale review:** reproduce v7 → v8 → approve `P-31`. v8 must survive unchanged; the proposal must not be accepted.
- **Racing writes:** submit a human update and approval together. At most one write using the same expected version succeeds; the other receives a conflict.
- **Duplicate approval:** send two requests simultaneously, then retry after a simulated lost response. There is one version increment and one logical approval result.
- **Changed or invalid proposal:** alter a reviewed revision, include a forbidden field, or choose an ineligible owner. No accepted data changes.
- **Permission bypass:** call the operation directly and through MCP with a restricted identity. Both deny it; generic update access must not bypass approval.
- **Partial failure:** fail between the conditional write and result recording. Neither should remain committed alone. A retry returns the durable result if the original commit succeeded.

Begin with the stale-review test. If the current owner survives and the reviewer sees exactly why the proposal needs another decision, you have a concrete foundation for humans and agents sharing the same business record.
