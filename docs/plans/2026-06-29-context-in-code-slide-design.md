# Context-in-Code Slide (s11)

## Goal

Land the "context primitive" code-side beat: in the codebase, agents get both halves of context — architecture (what talks to what) and style (your team's conventions) — for free. The slide is the visual mirror of s11 in the speaker notes and sets up s12 (the knowledge-work side, coming later).

## Design

Two GitHub-dark cards sit side by side inside the standard content area, reusing the `BentoTile` chrome language from `CodebaseBentoSlide` so the slide feels like a continuation of the code-side argument.

- **Left card — Architecture.** Header reads `acme-co/platform · imports` with a `Network` icon. The body is a small node-and-edge graph: seven pill nodes (`apps/web`, `apps/admin`, `@acme/api`, `@acme/auth`, `@acme/db`, `@acme/billing`, `@acme/ui`) connected by thin curved arrows. Each node has a colored dot prefix to differentiate apps from packages. Edges reflect plausible imports (web → api, web → ui, api → auth, api → db, billing → db, admin → api, etc.). Layout is hand-tuned, not force-directed — predictable and stable.

- **Right card — Style.** Header reads `packages/api/src/customers.controller.ts` with `FileCode2`. The body is a ~16-line TypeScript snippet of a controller class with three custom decorators stacked over each handler: `@AuthRequired()`, `@Audited('customer.read')`, `@RateLimited('standard')`. Each decorator gets an attention-yellow background tint and a left border bar so the convention pops. Syntax colors reuse the palette already in `CodebaseBentoSlide.TypeSnippet`.

## Animation

Same outline-then-content rhythm as `CodebaseBentoSlide`:

1. Both card outlines (dashed `GH.borderMuted`) fade in together with a 0.05s stagger.
2. Left card content lands first (after `CONTENT_BASE_DELAY ≈ 0.45s`): nodes drop in staggered, then edges trace in with a stroke-dash path-draw (~0.35s each, fast stagger).
3. Right card content lands second (~0.32s after the left): code lines fade up in groups; the decorator highlights pop a beat after their line is in place.

## Speaker Notes

Adapted from `speaker-notes.json#s11`: context is two things at once — architecture (the shape of the system) and style (your conventions). In code, both come free because the repo *is* the map and the codebase soaks every team's convention.

## Validation

Run the deck locally, navigate to slide 9 (after `KnowledgeFragmentsSlide`), watch the reveal. Success criteria are visual:

- Left card: nodes settle, then edges trace cleanly with arrowheads pointing toward the importing side.
- Right card: code lands, then decorator rows highlight — the eye should lock onto the convention, not the handler bodies.
- Outlines appear together; content reveals are paced so neither card overwhelms the other.
