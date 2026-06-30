# Verification-in-Knowledge-Work Slide (s18)

## Goal

Land the knowledge-work side of the verification primitive: the agent acts, every "check" you could write would pass, and the only signal that it went wrong is a human noticing — sometimes after the damage is permanent. Mirrors the layered checks slide (s17) by showing the same scaffolding *missing*.

## Design

Full content area, three stacked panels arranged so the eye walks the failure: the draft → the missing check stack → the disaster.

- **Left card — Sent mail.** A Gmail-style "Sent" view, 480×320 ish. Header: `Sent · agent@acme.com`. Body shows one row representing a mass send — `To: 247 candidates`, subject `Quick intro — Acme Engineering`, snippet of body text, timestamp `9:14 AM`. A small `Sent ✓` badge in success green at the right. The implied scale (247 recipients) does the work; we don't list them.

- **Center card — Checks (knowledge work).** Mirrors the four groups from the code slide so the symmetry is unmistakable, but every row is `—` / "no check exists" in `GH.muted`, not green:
  1. `Hard gate` — `compile · —`, `build · —`
  2. `Type system` — `typecheck · —`, `schema · —`
  3. `Tests` — `unit · —`, `integration · —`, `e2e · —`
  4. `Soft layer` — `lint · —`, `lsp · —`, `bugbot · —`
  
  Below the four ghost groups, one row in `GH.attention` (yellow): `judgment · ?` — with the value rendered as a literal `?` glyph. That's the missing test: "is this any good?"

  Then one final row pinned at the bottom in `GH.danger` background: `human review · BLOCKING` — except the icon is a single sleeping/dim user silhouette, communicating "in theory, in practice it didn't happen here."

- **Right card — Twitter receipt.** A small dark-mode X/Twitter post card. Display name and handle generic ("@candidate_023" / "Marcus Chen"). Body: "got the same 'personal' note from acme as 50 other people lol. agents are wild." Timestamp `9:41 AM`. Quote-RT count: 1.2K. The post is the only "test" that actually fired — and it fired in public, 27 minutes too late.

Layout: left card and right card sit at the top of the content area, side by side. The center "Checks" card spans below them, anchoring the three into one scene. Subtle dashed connector from `Sent → Checks → Twitter` so the read order is forced.

## Animation

1. Left "Sent" card outline + content land first (same `BentoTile` lift used elsewhere). Send badge pops a beat after.
2. Center "Checks" card outline appears next. Group headers fade in. Rows reveal with the *same* timing as the s17 reveal — but the rows land as muted dashes instead of green ticks, so audiences who just watched s17 feel the asymmetry physically.
3. `judgment · ?` row tints in last in the four groups, in `GH.attention`.
4. `human review · BLOCKING` row pulses in at the bottom with a soft danger flash, then settles.
5. Right "Twitter" card slides in last with a short delay — the receipt arriving after the fact.
6. A thin dashed connector traces left→center→right after all three cards settle, in `GH.attention`.

No step gating. Single auto-playing reveal, ~2.5–3.0s. The sequencing carries the argument; the slide doesn't need clicks.

## Speaker Notes

Adapted from `speaker-notes.json#s18`: the agent sent the emails. Every check from the last slide would have passed — addresses valid, syntax fine, it compiled, basically. There was no test in the world for the question that mattered: should this have gone out at all? "Good" splits in two — facts right (eyeball-able) and is-it-any-good (judgment, no answer key). The second has no compiler. The only check left is a human, one item at a time — and that's the thing that doesn't scale.

## Validation

Run the deck, advance to the new slide (right after `VerificationInCodeSlide`). Success criteria:

- The three cards read as one scene at a glance — left "sent," center "what should have caught it," right "what actually caught it, too late."
- The center "Checks" card mirrors the s17 layout exactly enough that the row-by-row asymmetry (green ticks vs `—`) registers without explanation.
- The `judgment · ?` row visually breaks the dash pattern — it's the one row that's a real category, not a missing one.
- The `human review · BLOCKING` row lands as a closing punctuation, not a feature.
- The Twitter card arrives *after* the checks card finishes, so the audience reads "no check fired → consequences arrived."
