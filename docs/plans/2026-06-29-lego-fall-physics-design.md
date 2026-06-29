# LEGO Fall Physics Design

## Goal

Make the snap-away step feel physically plausible without adding a full rigid-body physics engine.

## Design

Use deterministic Framer Motion keyframes for the top three bricks. On the final step, each block accelerates downward, overshoots the floor, squashes on impact, rebounds, and settles with a small rotation. The blocks use slightly different delays, drops, and rotations so the fall feels like individual objects with different mass.

The foundation blocks keep the existing snap-away/dust behavior. The change stays inside `DependencyTowerSlide.tsx`.

## Validation

Run TypeScript after the change. Visual tuning can continue from the running deck.
