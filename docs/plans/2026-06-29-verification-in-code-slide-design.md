# Verification-in-Code Slide (s17)

## Goal

Land the "verification primitive" code-side beat: when an agent writes code, a layered stack of checks runs automatically and tells it within seconds whether the work is good. No human needed. The slide is the visual mirror of s17 in the speaker notes and sets up s18 (the knowledge-work side, coming next).

## Design

Single GitHub-dark "Checks" surface, full-bleed-ish inside the content area, reusing the GitHub palette (`GH.bg / card / border / success / muted`) and `BentoTile`-style chrome from `CodebaseBentoSlide` so the slide reads as a continuation of the code-side argument.

Layout — one wide panel framed like a GitHub PR's Checks tab:

- **Header strip.** Branch + PR title: `agent/refactor-billing-api` and `#421 · refactor: extract billing helpers`. On the right, `All checks have passed` pill in `GH.success`, a `5m 42s` timer, and a `Merge` button (subtle, not the point).
- **Body — four labeled groups, top to bottom.** Each group is a section header in `GH.muted` mono caps and a list of check rows. Every row: status icon + name + duration + tiny `Details` link. All success.
  1. `Hard gate` — `compile · 2m 14s`, `build · 1m 02s`.
  2. `Type system` — `typecheck · 21s`, `schema-validate · 14s`.
  3. `Tests` — `unit · 1m 14s`, `integration · 3m 02s`, `e2e · 2m 33s`.
  4. `Soft layer` — `lint · 32s`, `lsp · 8s`, `bugbot · 41s`, `skill-files · 12s`.
- **Right-rail callouts.** A thin column of three muted labels aligned to the group rows, naming what each layer catches in 3–4 words: "won't run if broken", "kills a class of bugs", "breaks three modules away", "house style, not correctness." Lean, mono, small.

The pattern: rows in a real PR layout, but grouped so the *kinds* of checks become a visual taxonomy. The audience should see "this is a stack, not a single test."

## Animation

Same outline-then-content rhythm as `CodebaseBentoSlide`:

1. Panel outline (dashed `GH.borderMuted`) fades in.
2. Header strip lands (`PR title` + `All checks have passed` pill).
3. Group sections cascade in top→bottom with ~0.18s stagger between groups; rows inside each group fan in with a fast inner stagger (~0.06s) and a tiny y-lift.
4. As each row lands, the success check pops with a slight scale punch (0.92 → 1) so the green ticks read as "result arrived."
5. Right-rail callouts fade in after the rows that own them are settled.

No step gating — single auto-playing reveal once the slide is active. Total run ~2.0–2.5s.

## Speaker Notes

Adapted from `speaker-notes.json#s17`: the work checks itself. Compiler is the hard gate. Type system kills classes of bugs. Tests catch behavior — unit for the small stuff, integration for what breaks three modules away. On top, a softer layer — linters, LSP, bugbot, skill files — pushing past correct into how your team does it. No human needed, real signal in seconds, which is why these agents keep getting better.

## Validation

Run the deck locally, navigate to the new slide (right after `ContextInKnowledgeWorkSlide` when the context worktree merges). Success criteria are visual:

- Outline appears first; the green pill + checks waterfall reveal feels like one beat, not eight independent ones.
- The four groups read as a taxonomy — eye can land on the section names and instantly see "compile, type, test, soft."
- All ticks are green at rest; no row reads as decorative — every one names a real kind of check.
