# LEGO Slide Grid Design

## Goal

Rebuild the dependency tower slide so it keeps the existing conceptual labels but behaves like a real LEGO structure. The main correction is layout logic: every brick should sit on a shared stud grid, with widths and positions expressed in stud units rather than arbitrary pixels.

## Design

The slide uses one global stud pitch. Brick widths are whole stud counts, and brick x positions are whole stud columns. Stud centers are derived from the brick's global grid position, so studs align across rows even when rows are staggered.

The final composition keeps the current hierarchy:

- `Codebase` as the wide base.
- `Monorepo` above it as a long supporting brick.
- `review`, `tests`, `CI/CD`, `commit history`, and `revert` as staggered foundation bricks.
- `Foundational models`, `Coding harnesses`, and `Modern coding agents` as the upper stack.

The reveal animation remains step-based: show the top agent layer, introduce models, assemble harnesses, then reveal the underlying foundation. The visual system stays inside `DependencyTowerSlide.tsx`.

## Validation

Run the deck locally and inspect the fourth slide at each reveal step. The success criterion is visual: brick seams should be intentionally staggered, and studs should line up on a coherent grid rather than drifting per brick width.
