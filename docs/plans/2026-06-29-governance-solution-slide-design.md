# Composio Governance Slide (s28)

## Goal

Pay off s19 + s20: the missing wall around knowledge-work agents now exists, in two layers. The same agent that nuked Yue's inbox runs here, asks for `gmail.delete · 200 messages`, and gets stopped — *before* the action hits anything real. The audience should see the rule live *outside* the agent.

## Design

Single light "Composio Governance" surface, mirroring the wide-card rhythm of the in-code/in-knowledge slides so the solution beat reads as a continuation of the argument.

Layout — one wide row, three columns, ~1100 × 470:

- **Left (~320px) — Agents on Composio.**
  - Tiny mono caps eyebrow: `AGENTS · COMPOSIO`.
  - Two agent cards stacked: `Hiring Agent` (blue icon) and `Support Agent` (purple icon). Each card lists scoped tools as small rows — green ✓ or grey ✗ for granted vs. denied. Concretely:
    - Hiring: ✓ `gmail.inbox.read`, ✓ `gmail.draft.create`, ✓ `gmail.send`, ✓ `gmail.delete`.
    - Support: ✓ `zendesk.tickets.read`, ✓ `zendesk.draft.create`, ✗ `zendesk.send.public`, ✗ `slack.dm.send`.
  - Below the cards: a compact `Composio Gateway` chip (single hub) with thin lines from each agent merging into it. Visually obvious that *all* tool calls funnel through Composio.

- **Middle (~64px) — connector.** A horizontal arrow + dotted line from the Composio gateway over to the runtime panel. Carries the "every action passes through here" signal without taking real estate. Pulses subtly when an action fires.

- **Right (~640px) — Policy Runtime.**
  - Top strip: `POLICY RUNTIME · enforced before execute`. Below it, three policies in plain-language chips:
    - `max destructive ops · 10 / call`
    - `outbound email · @acme.com only`
    - `confirm on bulk · any > 25 records`
  - Below the policies: live action log. Rows append top→bottom over time:
    1. ✓ `hiring · gmail.inbox.read · in:inbox · 50` → allowed
    2. ✓ `support · zendesk.tickets.read · open · recent` → allowed
    3. ✓ `hiring · gmail.send · candidate@acme.com` → allowed
    4. ✗ `hiring · gmail.delete · 200 messages` → **blocked** · `policy: max 10 destructive/call` *(the Yue callback)*
    5. ✗ `support · zendesk.send.public · ticket #4521` → blocked · `scope: not granted`
    6. ✗ `hiring · gmail.send · external@spam.com` → blocked · `policy: outbound = @acme.com`
  - Each allowed row: green pill + mono action. Each blocked row: red pill + mono action + small reason line in red.

The pattern: scopes live on the LEFT (deterministic, declared up-front). Policies live on the RIGHT (behavioral, enforced at runtime). Together they form the wall, with a literal line drawn between them.

## Animation

1. Card outlines fade in left-to-right with a small stagger (~0.4s total).
2. Agent scope rows reveal in cascade, then the Composio gateway chip lands.
3. Right panel: policy chips drop in.
4. Action log starts firing — one row every ~700ms. Each row appears with a subtle x-from-left motion, status pill scales-in on land. Blocked rows shake the reason line in.
5. Optional: a dot pulses along the dotted connector each time a new action lands (subtle, not distracting).

No step gating — auto-plays once active. Total run ~5s.

## Speaker Notes

Adapted from `speaker-notes.json#s28`: we build the wall the agent can't argue with — in two layers. First, deterministic scope control: each agent gets the tools and only the tools it needs. The boundary lives outside the agent — can't be compacted away or forgotten under load. Second, plain-language policy: "never delete more than ten records at once," "never email outside our domain." Enforced before the action goes through. Yue's rule lived in the agent's memory. This one doesn't.

## Validation

Run the deck locally, navigate to the new slide (right after `GovernanceInKnowledgeWorkSlide`). Success criteria are visual:

- The audience clocks within a beat: "two halves, scopes on the left, policies on the right, line between them."
- The `gmail.delete · 200 messages` row reads as the obvious Yue callback — it shows up red with a specific policy reason.
- Two distinct reasons appear in the log (`scope` and `policy`) so it's visible that BOTH layers can block — not the same gate twice.
