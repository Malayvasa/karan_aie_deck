# Governance-in-Code Slide (s19)

## Goal

Land the "governance primitive" code-side beat: in code, the agent runs free on the safe stuff but a layered wall blocks the dangerous stuff — branch protection, code owners, preview deploys. Not one gate; a stack of them, sized to how much damage is possible. The slide is the visual mirror of s19 in the speaker notes and sets up s20 (the Yue / knowledge-work side).

## Design

Single GitHub-dark surface reusing the `GH` palette and chrome from `VerificationInCodeSlide` so the code-side argument keeps reading as one continuous body. The composition is a GitHub PR's "Merging blocked" view — the wall already did its job before the audience walked in.

Layout — wide centered card, ~1100px max width, two columns:

- **Left (~560px) — PR merge box, blocked.**
  - Header strip: PR icon, `#421 · refactor: extract billing helpers`, branch `agent/refactor-billing → main`.
  - **Status section.** Red lock pill `Merging is blocked` + sub-line `Some required things still need to happen.` The merge button below is disabled — `Merge pull request` greyed in `GH.cardHi`, no green.
  - **Required checklist.** Four rows, each `status icon · label · meta`:
    1. ✓ `All checks have passed` — `6 successful, 1 neutral` (verification carries over, lands first).
    2. ⏳ `Review required — code owners` — `Waiting on @acme/platform-team`.
    3. ⏳ `Review required — 1 approving review` — `0 / 1 approved`.
    4. 🔒 `Branch protection — main` — `Linear history, signed commits, dismiss stale`.
  - **Deployments strip.** Two rows under a `Deployments` header:
    - ✓ `preview-pr-421.preview.acme.dev · Preview` (green, deployed).
    - 🔒 `production · Production` — `Requires approval · restricted to main`.

- **Right (~480px) — the rules that produced the wall.**
  - **`.github/CODEOWNERS` panel.** GH file header (`Code · just now`), syntax-tinted body:
    ```
    /packages/billing/      @acme/platform-team
    /packages/auth/         @acme/security
    /infra/                 @acme/sre @acme/platform-team
    ```
  - **Environment protection panel.** Card titled `production` with `Protected environment` pill. Rule rows:
    - `Required reviewers: @acme/sre`
    - `Deployment branches: main only`
    - `Wait timer: 5 min`
    - `Secrets: revealed after approval`

The pattern: the left side shows the wall in effect (the agent can't merge or ship). The right side shows the wall as code — declarative rules, not instructions the agent has to remember. The visual taxonomy is "branch protection · code owners · environments" — the stack of gates.

## Animation

Outline-then-content rhythm, matched to `VerificationInCodeSlide`:

1. Both column outlines fade in (~0.4s).
2. Left card lands first: PR header, then `Merging is blocked` pill with a subtle pulse, then the four requirement rows cascade top→bottom (~0.18s stagger). The verification row's check pops first (callback to the prior slide), the two ⏳ rows land in `GH.attention`, and the 🔒 lock row lands last in `GH.muted`.
3. Disabled merge button settles in beneath the requirements.
4. Right column lands ~0.35s after the left card finishes: CODEOWNERS first, env rules second, each with the same `y: 14 → 0` reveal.

No step gating — single auto-playing reveal once the slide is active. Total run ~2.0–2.5s. Karan delivers it in one beat.

## Speaker Notes

Adapted from `speaker-notes.json#s19`: in code, governance is mostly solved, and it's layered. The agent runs wild on a branch, but it can't merge to master — a human stands between the mess and anything real. Critical paths have code owners, so the moment it writes there, the right person gets pulled in. And it ships to preview deployments, never the main one. Not one gate, but a stack of them, each sized to how much damage is possible.

## Validation

Run the deck locally, navigate to the new slide (right after `VerificationInKnowledgeWorkSlide`). Success criteria are visual:

- The red "Merging blocked" pill reads instantly — the audience sees the wall in the first half-second.
- The four required rows are obviously a *stack*: one passed check followed by two pending reviews and a branch-protection lock. Not a single hoop; a series.
- The right column makes it clear the rules are *declared, not requested* — CODEOWNERS as code, env protection as a structured policy. None of it is a sticky note for the agent.
