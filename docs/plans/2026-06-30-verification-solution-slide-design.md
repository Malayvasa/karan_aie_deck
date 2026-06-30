# Verification Solution Slide (s18)

## Goal

Cap the Verification primitive with the answer for knowledge work, paying off the Jarvis email-blast disaster from the prior slide. The audience should see two pre-flight checks — one quality, one simulation — that catch the bad outreach *before* it ships. Together: "the check that was missing."

The slide is the Verification analog to `GovernanceSolutionSlide` and `ReversibilitySolutionSlide`, slotting in as the section's fourth slide right before the Governance bridge.

## Design

Two-card composition, side-by-side. The two cards use **different visual languages on purpose**:

- **LEFT — GitHub checks card (dark GH palette).** Mirrors `VerificationInCodeSlide`'s merge box exactly. Tells the audience: "the same checks code has, now for knowledge work."
- **RIGHT — Composio sandbox terminal (dark blue terminal).** Reuses the `SandboxPanel` visual language from `ReversibilitySolutionSlide`. Tells the audience: "and the agent watches what would happen, in a sandbox, before it does it for real."

Layout — two ~470px wide cards, ~440px tall, ~40px gap between them, centered on the stage.

### LEFT — Goodness checks card

Visually identical to the merge box on `VerificationInCodeSlide`. Same `GH` palette (`bg:#0d1117`, `card:#161b22`, `border:#30363d`, etc.). Same `GitPullRequest` rail, same row layout, same `ChecksHeaderRing` + `SectionHeader` + `CheckRowView` primitives. Only the content and the final state differ.

- **Header:** "Running goodness checks…" → resolves to **"1 check failed — revise"** (red ring, not green).
- **Subtitle:** "0 of 5 complete" → "1 failed, 4 successful".
- **Section labels:** "1 failing check" (Bugbot row) and "4 successful checks" (the rest).
- **Rows (resolve top-down, ~520ms apart):**
  1. **Cursor Bugbot** — `Tone match · vs 47 past Karan outreaches` → **FAIL** — "Score 4.1/10 — below baseline 7.8"
  2. **GitHub Actions** — `Personalization · references candidate background` → PASS — "Successful in 0.4s"
  3. **GitHub Actions** — `CTA / length within bounds` → PASS — "Successful in 0.2s"
  4. **GitHub Actions** — `Style guide · @acme outreach voice` → PASS — "Successful in 0.5s"
  5. **GitHub Actions** — `Spam triggers / formality` → PASS — "Successful in 0.3s"
- **Footer button:** `Send to 247 candidates` (replaces "Merge pull request" — same shape, honest to the scenario). Stays **disabled grey** throughout because the tone check failed. The button **never turns green**. This is the punchline of the left card: the goodness check is what stopped the blast.

The Bugbot row is intentionally the FIRST check (the unique-to-verification one). The four GH Actions checks are easy/boring — they all pass, just like syntax checks always pass on bad emails. The point: the AI-judged "is this as good as your past work" check is the new primitive.

### RIGHT — Sandbox terminal card

Visually identical to the `SandboxPanel` on `ReversibilitySolutionSlide`. Same dark `#0c0c0e` panel, same CPU lights header, same code typing + status stripe pattern. Only the content differs — this run is the Jarvis hiring blast, not Yue's archive.

- **Header bar:** CPU lights, `composio_sandbox · python 3.11`, `pid:4821`.
- **Code (types in over ~1.5s):**
  ```python
  # working copy of Gmail — no real sends
  hiring = sandbox.gmail.search(
      label='outreach:devrel-q3',
  )
  for c in hiring:
      sandbox.gmail.send(
          to=c.email,
          body=draft.render(c),
          preview=True,
      )
  ```
- **Stage stripe (three stages stream in below the code):**
  1. `load hiring list` → "247 candidates"
  2. `simulate outreach` → "247 → mock_inbox"
  3. `flag anomalies` → "23 flagged · tone mismatch"
- **Final state:** all three stages green-check'd, code dimmed back to baseline color, `done` badge replaces `pid` in the header.

The "23 flagged · tone mismatch" stat ties the sandbox panel back to the left card — same failure mode (tone), discovered by both checks from different angles. The "inbox untouched" framing makes clear this never reached the real candidates.

### Composition

- Centered horizontal layout, ~1000px wide × ~440px tall stage.
- The two cards do **not** share a connector — each stands as its own check. The user's script frames them as "Two ways we do that," parallel not sequential.
- No bottom fused status. Matches `GovernanceSolutionSlide` and `ReversibilitySolutionSlide` conventions.

## Animation

Auto-play, **does not loop** — holds final state so the audience can read the verdict during the talk. (Differs from `ReversibilitySolutionSlide` which loops; matches `VerificationInCodeSlide` which holds.)

Timeline:
1. `t=0`: slide active. Both cards fade in (y-up, ~500ms, 0.4s base delay).
2. `t≈0.45s`: left card header reveals ("Running goodness checks…").
3. `t≈0.6s`: left card check rows render, all in pending state. Right card code starts typing.
4. `t≈1.5s`: right card finishes typing; stage stripe appears with first stage running.
5. `t≈1.5s + i·0.52s`: left card checks resolve top-down (Bugbot row → fail; the other four → pass).
6. `t≈2s, 4s, 6s`: right card stages complete in sequence (load → simulate → flag).
7. `t≈7s`: both cards in final state. Left header reads red "1 check failed — revise", footer button still disabled. Right card shows `done` badge, three green-check'd stages. Slide stays here until the speaker advances.

## Speaker Notes

Use existing `verificationSolution` entry in `src/content/speaker-notes.ts` (already added). No in-slide step gating — single static script, `<PresenterNote noteKey="verificationSolution" />` with no `steps` arg.

## Validation

Run the deck locally, navigate to the new slide (right after `VerificationInKnowledgeWorkSlide`). Success criteria are visual:

- Audience clocks within a beat: "two checks side by side, like a GitHub PR plus a sandbox run."
- The left card's red header and the right card's "23 flagged" both land on **tone** — same failure, two perspectives.
- The disabled "Send to 247 candidates" button is unmistakably the punchline — it never goes green.
- Visual continuity: left card looks identical to the in-code merge box (3 slides back); right card looks identical to the Reversibility sandbox (10 slides later). The audience should feel "I've seen this primitive before, this is its knowledge-work twin."

## Files touched

- `src/components/slides/VerificationSolutionSlide.tsx` — new.
- `src/components/deck/DeckRoot.tsx` — register `<VerificationSolutionSlide />` between `<VerificationInKnowledgeWorkSlide />` and `<GovernanceBridgeSlide />`.
- `src/content/speaker-notes.ts` — `verificationSolution` entry (already added).
