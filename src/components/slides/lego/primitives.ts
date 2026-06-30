import {
	Boxes,
	History,
	Lock,
	Network,
	ShieldCheck,
	Undo2,
} from "lucide-react";
import type { Brick } from "./LegoBrick";

/**
 * Single source of truth for the deck's six primitive bricks. Every bridge
 * slide, the top-of-slide PrimitiveBadge, and any other lego appearance of a
 * primitive imports from here so the color/icon for "history" is the same
 * brick everywhere.
 *
 * Palette pulled from Lego's classic brick set, avoiding the three colors
 * already in use for adjacent concepts elsewhere in the deck:
 *   - Bright Red (#D0121A) — agent
 *   - Bright Yellow (#F5C518) — harness
 *   - Bright Blue (#0057A8) — frontier models
 */
export const PRIMITIVE_COLORS = {
	centralization: "#C91A09", // Bright Red (Lego)
	history: "#00852B", // Bright Green
	context: "#812F90", // Bright Purple / Magenta
	verification: "#26A4D1", // Sand Blue / Cyan
	governance: "#4338CA", // Indigo
	reversibility: "#FE8A18", // Bright Orange
} as const;

export const PRIMITIVES = {
	centralization: {
		label: "centralization",
		color: PRIMITIVE_COLORS.centralization,
		text: "#ffffff",
		icon: Boxes,
	},
	history: {
		label: "history",
		color: PRIMITIVE_COLORS.history,
		text: "#ffffff",
		icon: History,
	},
	context: {
		label: "context",
		color: PRIMITIVE_COLORS.context,
		text: "#ffffff",
		icon: Network,
	},
	verification: {
		label: "verification",
		color: PRIMITIVE_COLORS.verification,
		text: "#ffffff",
		icon: ShieldCheck,
	},
	governance: {
		label: "governance",
		color: PRIMITIVE_COLORS.governance,
		text: "#ffffff",
		icon: Lock,
	},
	reversibility: {
		label: "reversibility",
		color: PRIMITIVE_COLORS.reversibility,
		text: "#ffffff",
		icon: Undo2,
	},
} as const satisfies Record<string, Brick>;

export type PrimitiveKey = keyof typeof PRIMITIVES;
