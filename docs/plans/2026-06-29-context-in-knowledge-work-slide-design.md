# Context-in-Knowledge-Work Slide (s12)

## Goal

Land the knowledge-work side of the context primitive: to write anything real you have to hold DB + PostHog + Salesforce in your head at the same time, and that mental synthesis is the part the agent can't get because nobody ever wrote it down.

## Design

Full content area. The center is a draft Notion-style doc; three source app windows sit around it (top-left, top-right, bottom). Thin dashed arcs trace from each source into a bracketed gap in the doc, ending in a small `?` badge.

- **Draft doc.** ~380×280, centered. Title: `ACME Corp — Q4 customer brief`. Three lines have bracketed gaps the writer cannot fill alone:
  - `Usage spiked [...] in the last 30 days` ← PostHog
  - `Deal stuck in [...] stage since Aug` ← Salesforce
  - `[...] active seats out of 50 provisioned` ← Postgres

- **Sources.** Three smaller windows arranged around the doc:
  - **Top-left:** PostHog dashboard fragment — a line chart trending up with a small label.
  - **Top-right:** Salesforce opportunity record — stage badge + a couple of `Kv` rows.
  - **Bottom:** Postgres console — a short `SELECT` with one result row.

- **Connectors.** From each source, a thin dashed bezier arcs into the matching bracket in the doc. The line tone uses `GH.attention` so the eye groups all three as the "missing wire." Each arc ends with a small circular `?` badge tucked into the bracket.

## Animation

1. Doc shell fades in first with the same `BentoTile` lift used elsewhere.
2. The three source windows pop in around it with a 0.08s stagger.
3. Dashed arcs trace from each source into the doc (~0.5s each, in order top-left → top-right → bottom).
4. The `?` badges pop after each arc completes.
5. The bracketed text in the doc gets a quiet attention-tone background after all arcs land, so the audience sees "the gaps" as a group.

## Speaker Notes

Adapted from `speaker-notes.json#s12`: writing a customer doc means holding the database, PostHog, and Salesforce in your head at once. The agent gets none of that because the synthesis was never written down.

## Validation

Run the deck, advance to slide 10 (after `ContextInCodeSlide`). Success criteria:

- Doc lands cleanly; brackets stay readable as gaps even before the arcs come in.
- Source windows feel like real app fragments, not abstract boxes.
- Arcs trace cleanly without crossing through the source bodies or the doc body.
- After all arcs land, the gaps tint together so the room sees the missing context as one shape.
