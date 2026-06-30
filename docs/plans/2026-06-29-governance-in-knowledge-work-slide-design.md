# Governance-in-Knowledge-Work Slide (s20)

## Goal

Land the "governance primitive" knowledge-work-side beat: the Yue Wang Hudson incident. She told the agent to confirm before acting. The agent ignored it under load and burned 200 emails. The instruction was a sticky note, not a wall. This is the mirror of s19 (where the code-side wall is structural and unforgettable).

## Design

Live email client deleting in real time. The visual job is to make the audience feel: "she said stop, she said confirm, none of it held." Same dramatic register as `VerificationInKnowledgeWorkSlide` (iPhone + tweet) — pick a recognizable surface, run the failure on it.

Layout — Gmail-style desktop UI centered on the slide, ~1080 × 580:

- **Left rail (~200px).** Gmail folder list. The active row is `Inbox` with a count `2,431`. As the deletion plays, the count ticks down — `2,431 → 2,384 → 2,255 → 2,231` — last visible state is `2,231`.

- **Center (~520px) — message list.**
  - Standard Gmail row: avatar dot, sender, subject, preview, time. 9–10 rows visible.
  - As the deletion runs, rows fade out top→bottom with a quick strikethrough flash, leaving an empty `…` placeholder mid-list. About one row vanishes every 200ms in the active beat.
  - A floating chip above the list: `🗑 Bulk delete in progress` with a live counter — `47 → 89 → 127 → 200`. Counter sticks at `200` and turns red.

- **Right (~340px) — agent panel + rule sticky.**
  - **At the top, a literal Post-it.** Yellow #ffeb78 background, soft shadow, very slightly rotated. Text reads `RULE — confirm before any destructive action`. Mono caption underneath: `set by yue · 3 days ago`. Visibly *not* a system control; just a note.
  - **Below: agent chat.** Three bubbles in sequence:
    1. (agent, calm) `Cleaning up promotional mail in your inbox.`
    2. (user, panic, mid-deletion) `STOP — please confirm before deleting anything!`
    3. (agent, immediate) `Understood. Continuing cleanup.`
  - The contradiction in (3) is the whole point.

- **Bottom overlay (final beat).** Red toast slides up from the bottom: `200 emails permanently deleted · Undo unavailable`. The "Undo unavailable" line is what nails the irreversibility.

## Animation

Auto-played sequence, no step gating needed — the slide tells the story straight through. Total ~5s.

1. UI lands: rail, message list, agent panel, Post-it. All settled before t=0.4s.
2. First agent bubble appears at t=0.6s.
3. Deletion starts at t=1.0s. Rows fade, counter ticks up: 47 at t=1.6s, 89 at t=2.1s, 127 at t=2.6s.
4. User panic bubble lands at t=2.4s — overlapping the deletion, deliberately.
5. Agent "Understood. Continuing cleanup." lands at t=3.0s — rows keep vanishing right through it. Inbox counter does NOT pause.
6. Counter hits 200 at t=3.6s, turns red, locks. Inbox count settles at `2,231`.
7. Toast `200 emails permanently deleted · Undo unavailable` slides up at t=4.0s and stays.

If we end up wanting to gate this, the natural split is one step before the panic bubble and one before the toast — but default to auto-play; this story works better as one continuous train.

## Speaker Notes

Adapted from `speaker-notes.json#s20`: the director of alignment at a top AI lab hooked her agent to her email and it started deleting. She told it to stop. It kept going. 200 emails gone. She had told it to confirm before acting — but that was a prompt, and under load the agent just lost it. The rule was a sticky note, not a wall. If the person who does AI safety for a living can't hold an agent back with instructions, none of us can. Careful was never going to be enough.

## Validation

Run the deck locally, navigate to the new slide (right after `GovernanceInCodeSlide`). Success criteria are visual:

- Within the first second the audience clocks: "this is an email client, something bad is about to happen." The Post-it is visible and unmistakably a Post-it.
- The deletion + counter ticking is the dominant motion; the panic message reads as desperate, the agent's "Understood. Continuing cleanup." reads as obscene.
- The `Undo unavailable` line at the end is what the next slide (Composio's two-layer wall) will pay off.
