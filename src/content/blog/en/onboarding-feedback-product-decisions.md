---
title: "Build a self-hosted feedback app with 1flowbase"
description: "Build a feedback app with 1flowbase data models and React. Keep observations, hypotheses, human decisions and status together, then verify persistence."
publishedAt: 2026-10-04
lang: en
slug: onboarding-feedback-product-decisions
topic: field-notes
tags:
  - Data Models
  - Native React
  - Product feedback
draft: false
---

You watch someone create their first project. They pause, open Settings twice, and still cannot find how to add an item. Later, a task appears on your roadmap: “Improve onboarding.” What happened to the observation, your interpretation, and the reason you chose that task?

This tutorial builds a small feedback app that keeps those pieces together. It stores an observation, a proposed improvement, a human decision, and the item's current status in the same server-backed record.

The opening scenario and every record in this demo are synthetic. On our test 1flowbase instance, we tested one record through new → planned → in_progress → done, and a second through new → declined. After a full browser refresh, both records and their saved reasons remained.

This is a text-and-code tutorial based on a working demo. The implementation uses a data model and one native React/TSX block. Decisions are manual. The page calls generated CRUD APIs directly; it makes no LLM calls and does not run an approval workflow.

## Why keep the observation separate from the interpretation

For this app, record three things separately:

- Observed facts: In the synthetic scenario, the participant created a project, opened Settings twice, and did not find how to add the first item
- Hypothesis: The next action may be hard to discover
- Moderator prompt: After the pause, the moderator asked what the participant would try next, without pointing out a button

That separation leaves room to question the hypothesis. It also preserves a useful caveat: the participant received a prompt. A proposed checklist is a decision to investigate or implement, not something the observation automatically proves will help.

## What this version contains

The page has a capture form, a server-backed list, and a detail panel. The panel shows the original observation alongside the hypothesis, moderator help, proposed improvement, current status, and accumulated decision reasons.

It is a single-operator demonstration using synthetic data. The authenticated session used for the test was an administrator session. Anonymous access and least-privilege roles were not tested, so this is not a public trial or a tested multi-user deployment.

The tested interface reported v0.5.0 in its Help menu on 4 October 2026. The backend commit and container image digest were not verified. The following steps describe that interface; inspect your installation's actual API contract before using the code.

## Step 1: Define the feedback record

Start with your own running 1flowbase instance and an account authorized to create a model and a page. Use a fresh demo model so the tests do not touch existing product feedback.

In Settings → Data Sources, open the built-in main source and create a General table called Feedback Evidence with the code `feedback_evidence`. Add these nine custom fields:

- `public_title` — string, required; a short title
- `public_summary` — text, required; the proposed improvement
- `source_type` — string, required; this page offers feedback and onboarding_observation
- `status` — string, required, default new
- `internal_source_url` — string, optional; a relevant public source URL, if any
- `internal_observed_step` — text, required; the attempt and observed friction
- `internal_decision_reason` — text, optional at creation; reasons are added when deciding
- `internal_hypothesis` — text, optional; an interpretation to investigate
- `internal_moderator_prompt` — text, optional; prompts or help given during the session

Let 1flowbase generate its system fields. In the tested model, these were id, scope_id, created_by, updated_by, created_at, and updated_at. They were not create/update inputs.

The `public_` and `internal_` prefixes describe intended use. They do not enforce access control. Keep this exercise synthetic; a future public view needs a separately verified server-side data boundary.

## Step 2: Inspect the generated API before connecting the page

Check that the model is available at runtime. In UI mode, use the top-level Add menu → New page to create a separate Feedback to Roadmap Demo page with an unused route. Add a native code block and open its TSX editor.

Use the editor's Interface Connector to inspect the live model contract. On the tested installation, it generated these call shapes:

```ts
// List returns an object with items and total.
ctx.api.get('/api/runtime/models/feedback_evidence/list', {
  query: { page: 1, page_size: 100, sort: 'created_at:desc' }
});

// Create returns the saved record. body contains the model's fields.
ctx.api.post('/api/runtime/models/feedback_evidence/create', { body });

// Update returns the saved record. id is the server-generated record ID.
ctx.api.patch('/api/runtime/models/feedback_evidence/update/{id}', {
  path: { id },
  body
});
```

If your generated contract differs, adapt the block to that contract before writing data. [Download the complete tested TSX source as plain text](/downloads/onboarding-feedback-product-decisions/feedback-manual-block.tsx.txt), or copy it from the code appendix below. The download and appendix contain the same source used for the verified demo. If saving a local source file, remove the final `.txt` extension to name it `feedback-manual-block.tsx`. Save it in the native block, run the preview, and confirm that the list loads before creating an example.

## Step 3: Make each human decision explicit

The block offers this status sequence:

```text
new → planned → in_progress → done
```

An item can also move to declined from new, planned, or in_progress. The UI offers no further transitions from done or declined.

Each decision needs a nonempty reason in the UI. The page appends that reason to the record's existing decision text with a status label. It waits for the update, reloads the server-backed list, and checks that the same record ID has the requested status before displaying success.

These are frontend checks. The test did not establish server-side enforcement of the status sequence or reason requirement. The accumulated text is useful context, but it is not an immutable audit log.

## Step 4: Walk one synthetic observation through the app

In a fresh model, the initial list should contain zero records. The form starts with a synthetic first-project example. Review the fields, then click Create as new.

The page should show a returned server ID and the new status. Keep that ID as you follow the item:

1. With the reason field empty, confirm that the decision buttons are disabled
2. Enter a reason for trying the proposed improvement, then choose Adopt → planned
3. Enter a separate progress reason and choose Start work
4. Enter an explicitly synthetic completion reason and choose Mark done
5. Reload the whole browser page, then reopen the record

For the last reason, wording such as “Synthetic walkthrough: marking this example complete to test persistence; no product change was shipped” keeps the demonstration honest. Use your own reasons rather than presenting them as customer quotes.

The live test kept the same record ID through all three transitions. After the full reload, its status was done and its accumulated decision text was still present. The result establishes a saved state transition; it does not establish a shipped improvement or better onboarding outcomes.

## Step 5: Keep an explicit decision to decline

Change the capture form to a second synthetic example with a distinct title, such as Demo-02: Add a full social network. Replace the observation, hypothesis, proposed improvement, and moderator prompt so they describe that fictional example consistently.

Create it as new. Enter the reason it is outside the scope of this demo and choose Decline. Refresh the whole page and reopen it.

In the test, the final list contained two saved records: one done and one declined. Reopening the declined record after refresh retained its ID, observation, hypothesis, moderator prompt, and decline reason.

Recording a decline leaves the decision available to revisit. A future reviewer can see why the idea stopped instead of finding only an unexplained status label.

## Step 6: Check a repeated submission carefully

The code disables its controls while a write is in progress. Before creating a record, it also reloads the list and looks for the same trimmed title. If it finds one, it selects that record instead of creating another.

In the tested sequence, repeating Create for the first title after refresh kept the count at one and preserved the existing done record. The second example was created afterward.

This is a small-demo convenience. The code requests page 1 with a page size of 100, sorted by creation time descending, and compares titles on the client. This checks only the latest 100 loaded records, not the whole model. It does not provide backend idempotency or concurrent duplicate prevention, and two different observations could legitimately share a title. For a larger or multi-user app, design and verify a server-side identity and conflict policy before relying on this behavior.

If a write has an uncertain outcome, inspect the server's saved state before retrying. This demo's warning is not a complete timeout-recovery mechanism.

## What the test establishes

- The model was available through the generated CRUD contract
- The native React page created two synthetic records and reloaded server data after writes
- One record followed new → planned → in_progress → done
- A second record followed new → declined with a reason
- A full browser refresh retained both records and their decision context
- A repeated-title create attempt selected the existing item on the tested single-operator path

## What still needs work before real use

The demo does not verify multi-user authorization, anonymous access, field-level separation, atomic stale-write rejection, server-enforced business transitions, or backend idempotency. Its status counts are calculated from the loaded rows, so they are not a full-dataset reporting feature beyond that page of results.

A separate workflow draft was saved during development. It remains unpublished and unexecuted, and its Data Model Create node is Disabled. The page does not use it. Workflow confirmation, cancellation, resume, and automated analysis are outside the tested implementation.

No application-template ZIP was exported, and installing a template was not tested as a way to populate records. The two examples were created explicitly through the page.

## Start with the small loop

The useful result is concrete: a saved observation stays beside the interpretation, human reason, and current decision. You can reopen the record after a refresh and inspect that context.

To reproduce it on your own instance, start with the official 1flowbase installation instructions, then use the schema, code, and checks above:
[Official installation instructions](https://github.com/taichuy/1flowbase#quick-start)

## Code appendix: the tested native React block

Use this in a 1flowbase native TSX block after creating the model and checking its generated contract. It expects the block runtime to provide React, Ant Design, and the block SDK; it is not a standalone React app.

```tsx
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Input, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { BlockComponentProps } from '@1flowbase/block-sdk';

const BASE = '/api/runtime/models/feedback_evidence';
const initial = {
  public_title: 'Demo-01: First project needs a clearer next step',
  public_summary: 'Add a guided checklist after creating the first project.',
  source_type: 'onboarding_observation',
  status: 'new',
  internal_source_url: '',
  internal_observed_step: 'SYNTHETIC: The participant created a project, opened Settings twice, and did not find how to add the first item.',
  internal_decision_reason: '',
  internal_hypothesis: 'Hypothesis, not observed fact: the next action may be hard to discover.',
  internal_moderator_prompt: 'After the participant paused, the moderator asked: What would you try next? No button was pointed out.'
};
const transitions: Record<string, string[]> = { new: ['planned', 'declined'], planned: ['in_progress', 'declined'], in_progress: ['done', 'declined'], done: [], declined: [] };
const colors: Record<string, string> = { new: 'blue', planned: 'gold', in_progress: 'cyan', done: 'green', declined: 'red' };
const labels: Record<string, string> = { public_title: 'Title', public_summary: 'Proposed improvement', internal_observed_step: 'Observed facts: attempt and point of friction', internal_hypothesis: 'Hypothesis, separate from evidence', internal_moderator_prompt: 'Moderator prompt or help', internal_source_url: 'Optional public evidence URL' };

export default function FeedbackDemo({ ctx }: BlockComponentProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState(initial);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [total, setTotal] = useState(0);
  const request = useRef(0);
  const locked = useRef(false);

  async function load() {
    const ticket = ++request.current;
    const result: any = await ctx.api.get(BASE + '/list', { query: { page: 1, page_size: 100, sort: 'created_at:desc' } });
    if (!Array.isArray(result.items)) throw new Error('The server did not return the expected items list.');
    if (ticket === request.current) { setRows(result.items); setTotal(result.total ?? result.items.length); }
    return result.items;
  }
  useEffect(() => { load().catch(e => setError(String(e.message || e))); return () => { request.current++; }; }, []);
  async function action(work: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(''); setNotice('');
    try { await work(); } catch (e: any) { setError(String(e.message || e) + ' Refresh before retrying an uncertain write.'); }
    finally { locked.current = false; setBusy(false); }
  }
  async function create() {
    await action(async () => {
      for (const key of ['public_title', 'public_summary', 'internal_observed_step'] as const) if (!draft[key].trim()) throw new Error(labels[key] + ' is required.');
      if (!['feedback', 'onboarding_observation'].includes(draft.source_type)) throw new Error('Choose a valid source type.');
      const existing = await load();
      const same = existing.find((r: any) => r.public_title === draft.public_title.trim());
      if (same) { setSelected(same); setNotice('This synthetic title already exists. Selected the saved record; no duplicate was created.'); return; }
      const saved: any = await ctx.api.post(BASE + '/create', { body: { ...draft, public_title: draft.public_title.trim(), status: 'new', internal_decision_reason: '' } });
      if (!saved.id) throw new Error('No server record ID was returned. Reconcile before retrying.');
      const fresh = await load();
      const verified = fresh.find((r: any) => r.id === saved.id);
      if (!verified) throw new Error('Write returned an ID, but the refreshed list did not contain it.');
      setSelected(verified); setReason(''); setNotice('Created and reloaded server record ' + saved.id);
    });
  }
  async function decide(target: string) {
    await action(async () => {
      if (!selected || !reason.trim()) throw new Error('Select an item and enter a human decision reason.');
      const fresh = await load();
      const current = fresh.find((r: any) => r.id === selected.id);
      if (!current || current.status !== selected.status) throw new Error('The record changed. Select its current version before deciding.');
      if (!(transitions[current.status] || []).includes(target)) throw new Error('This status transition is not available.');
      const history = [current.internal_decision_reason, '[' + target + '] ' + reason.trim()].filter(Boolean).join('\n');
      await ctx.api.patch(BASE + '/update/{id}', { path: { id: current.id }, body: { status: target, internal_decision_reason: history } });
      const updated = (await load()).find((r: any) => r.id === current.id);
      if (!updated || updated.status !== target) throw new Error('The refreshed server state did not match the requested status.');
      setSelected(updated); setReason(''); setNotice('Saved and reloaded: ' + target);
    });
  }
  const field = (key: keyof typeof labels, rows = 2) => <div key={key} style={{ marginBottom: 12 }}><Typography.Text strong>{labels[key]}</Typography.Text><Input.TextArea value={(draft as any)[key]} rows={rows} disabled={busy} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></div>;
  return <div style={{ padding: 24, maxWidth: 1400, margin: 'auto' }}>
    <Typography.Title level={2}>Evidence → decision → roadmap</Typography.Title>
    <Alert type="info" showIcon message="Synthetic demo · manual operator decisions" description="This page uses the model CRUD API directly. It does not execute the draft workflow or demonstrate workflow approval. Field-level public/private isolation and atomic conflict protection have not been verified." />
    <Space style={{ margin: '16px 0' }} wrap><Button disabled={busy} onClick={() => action(async () => { const fresh = await load(); if (selected) setSelected(fresh.find((r: any) => r.id === selected.id) || null); setNotice('Reloaded current server data.'); })}>Refresh server data</Button><Typography.Text>{total} saved records</Typography.Text>{Object.keys(transitions).map(s => <Tag key={s} color={colors[s]}>{s}: {rows.filter(r => r.status === s).length}</Tag>)}</Space>
    {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}
    {notice && <Alert type="success" showIcon message={notice} style={{ marginBottom: 12 }} />}
    <Table rowKey="id" size="small" pagination={{ pageSize: 5 }} dataSource={rows} columns={[
      { title: 'Evidence', dataIndex: 'public_title' },
      { title: 'Source', dataIndex: 'source_type' },
      { title: 'Roadmap', dataIndex: 'status', render: (s: string) => <Tag color={colors[s]}>{s}</Tag> },
      { title: 'Review', render: (_: any, r: any) => <Button disabled={busy} onClick={() => { setSelected(r); setReason(''); }}>Open</Button> }
    ]} />
    <Row gutter={[20, 20]} style={{ marginTop: 18 }}>
      <Col xs={24} lg={12}><Card title="1. Capture a synthetic observation">
        {field('public_title', 1)}{field('public_summary')}
        <Typography.Text strong>Source type</Typography.Text><Select style={{ width: '100%', marginBottom: 12 }} value={draft.source_type} disabled={busy} options={[{ value: 'onboarding_observation', label: 'Onboarding observation' }, { value: 'feedback', label: 'Feedback' }]} onChange={source_type => setDraft({ ...draft, source_type })} />
        {field('internal_observed_step', 3)}{field('internal_hypothesis')}{field('internal_moderator_prompt', 3)}{field('internal_source_url', 1)}
        <Button type="primary" disabled={busy} loading={busy} onClick={create}>Create as new</Button>
      </Card></Col>
      <Col xs={24} lg={12}><Card title="2. Human decision and delivery">
        {selected ? <><Typography.Title level={4}>{selected.public_title}</Typography.Title><Tag color={colors[selected.status]}>{selected.status}</Tag><Typography.Paragraph type="secondary">Server ID: {selected.id}</Typography.Paragraph>
          {[['Observed facts', selected.internal_observed_step], ['Hypothesis', selected.internal_hypothesis], ['Moderator prompt', selected.internal_moderator_prompt], ['Proposed improvement', selected.public_summary]].map(([label, value]) => <div key={label}><Typography.Text strong>{label}</Typography.Text><Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{value || 'Not recorded'}</Typography.Paragraph></div>)}
          <Typography.Text strong>Recorded decisions</Typography.Text><Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selected.internal_decision_reason || 'Awaiting a human decision'}</Typography.Paragraph>
          <Input.TextArea rows={3} placeholder="Explain the evidence and your decision" value={reason} disabled={busy} onChange={e => setReason(e.target.value)} />
          <Space wrap style={{ marginTop: 12 }}>{(transitions[selected.status] || []).map(s => <Button key={s} disabled={busy || !reason.trim()} onClick={() => decide(s)}>{s === 'planned' ? 'Adopt → planned' : s === 'in_progress' ? 'Start work' : s === 'done' ? 'Mark done' : 'Decline'}</Button>)}</Space>
        </> : <Typography.Paragraph>Select an existing item or create the synthetic observation.</Typography.Paragraph>}
      </Card></Col>
    </Row>
    <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>Single-operator demonstration. UI validation and duplicate-title reconciliation are not backend idempotency or atomic compare-and-set. No automatic seeding, deletion, or external model calls.</Typography.Paragraph>
  </div>;
}
```
