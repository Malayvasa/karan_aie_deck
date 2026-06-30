"use client";

import { LegoBrick } from "./LegoBrick";
import { PRIMITIVES, type PrimitiveKey } from "./primitives";

export type { PrimitiveKey };

// Stable idx per primitive so SVG <defs> ids don't collide across slides.
const IDX_BASE: Record<PrimitiveKey, number> = {
	centralization: 9000,
	history: 9001,
	context: 9002,
	verification: 9003,
	governance: 9004,
	reversibility: 9005,
};

/**
 * Renders the lego brick for the current primitive at the top-center of the
 * slide, marking "you are here" in the deck. Same dimensions as the bricks
 * in the bridge wall — no scaling.
 */
export function PrimitiveBadge({ primitive }: { primitive: PrimitiveKey }) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute top-6 left-1/2 z-40"
			style={{
				transform: "translateX(-50%)",
				filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
			}}
		>
			<LegoBrick
				brick={PRIMITIVES[primitive]}
				idx={IDX_BASE[primitive]}
				studs={3}
			/>
		</div>
	);
}
