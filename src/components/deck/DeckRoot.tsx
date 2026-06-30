"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Deck, defaultTransition } from "spectacle";
import { BridgeSlide } from "~/components/slides/BridgeSlide";
import { LegoBrick } from "~/components/slides/lego/LegoBrick";
import {
	PRIMITIVES,
	type PrimitiveKey,
} from "~/components/slides/lego/primitives";
import { CodebaseBentoSlide } from "~/components/slides/CodebaseBentoSlide";
import { CodingArcSlide } from "~/components/slides/CodingArcSlide";
import { ContextBridgeSlide } from "~/components/slides/ContextBridgeSlide";
import { ContextInCodeSlide } from "~/components/slides/ContextInCodeSlide";
import { ContextInKnowledgeWorkSlide } from "~/components/slides/ContextInKnowledgeWorkSlide";
import { ContextRecordSlide } from "~/components/slides/ContextRecordSlide";
import { DependencyTowerSlide } from "~/components/slides/DependencyTowerSlide";
import { DiagnosisSlide } from "~/components/slides/DiagnosisSlide";
import { EmptyTowerSlide } from "~/components/slides/EmptyTowerSlide";
import { EventLogSlide } from "~/components/slides/EventLogSlide";
import { GitHistorySlide } from "~/components/slides/GitHistorySlide";
import { GovernanceBridgeSlide } from "~/components/slides/GovernanceBridgeSlide";
import { GovernanceInCodeSlide } from "~/components/slides/GovernanceInCodeSlide";
import { GovernanceInKnowledgeWorkSlide } from "~/components/slides/GovernanceInKnowledgeWorkSlide";
import { GovernanceSolutionSlide } from "~/components/slides/GovernanceSolutionSlide";
import { HistoryBridgeSlide } from "~/components/slides/HistoryBridgeSlide";
import { KnowledgeFragmentsSlide } from "~/components/slides/KnowledgeFragmentsSlide";
import { KnowledgeHistoryGapSlide } from "~/components/slides/KnowledgeHistoryGapSlide";
import { ReversibilityBridgeSlide } from "~/components/slides/ReversibilityBridgeSlide";
import { ReversibilityInCodeSlide } from "~/components/slides/ReversibilityInCodeSlide";
import { ReversibilityInKnowledgeWorkSlide } from "~/components/slides/ReversibilityInKnowledgeWorkSlide";
import { ReversibilitySolutionSlide } from "~/components/slides/ReversibilitySolutionSlide";
import { TitleSlide } from "~/components/slides/TitleSlide";
import { ToolCallsSlide } from "~/components/slides/ToolCallsSlide";
import { VerificationBridgeSlide } from "~/components/slides/VerificationBridgeSlide";
import { VerificationInCodeSlide } from "~/components/slides/VerificationInCodeSlide";
import { VerificationInKnowledgeWorkSlide } from "~/components/slides/VerificationInKnowledgeWorkSlide";
import { VerificationSolutionSlide } from "~/components/slides/VerificationSolutionSlide";

/**
 * Minimal Spectacle theme — visuals are driven through Tailwind, so this only
 * fixes the backdrop (the letterbox around the scaled slide) and points fonts at
 * the ported CSS variables.
 */
const theme = {
	// IMPORTANT: backdropStyle REPLACES Spectacle's default, which supplies the
	// viewport-filling box it measures to scale slides. Keep position/size or the
	// deck stops scaling (caps at 1366×768). We only want to add the black bg.
	backdropStyle: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100vw",
		height: "100vh",
		backgroundColor: "#000000",
	},
	fonts: {
		header: "var(--font-abc-diatype), sans-serif",
		text: "var(--font-abc-diatype), sans-serif",
		monospace: "var(--font-jetbrains-mono), monospace",
	},
	colors: { primary: "#ffffff", secondary: "#0007cd" },
};

/**
 * Single source of truth for "which primitive section does each slide belong
 * to." The order MUST match the slide JSX below. Bridge slides are null —
 * they have their own dropping-brick animation that would clash with a
 * persistent badge at the same spot. The PrimitiveBadge sits in the deck
 * `template` (rendered once, persistently across slides) and reads from this
 * map, so the brick visibly stays in place as you advance within a section
 * rather than re-animating in on every slide.
 */
const SLIDE_PRIMITIVES: (PrimitiveKey | null)[] = [
	null, // TitleSlide
	null, // ToolCallsSlide
	null, // CodingArcSlide
	null, // DependencyTowerSlide
	null, // EmptyTowerSlide
	null, // BridgeSlide
	"centralization", // CodebaseBentoSlide
	"centralization", // KnowledgeFragmentsSlide
	null, // HistoryBridgeSlide
	"history", // GitHistorySlide
	"history", // KnowledgeHistoryGapSlide
	"history", // EventLogSlide
	null, // ContextBridgeSlide
	"context", // ContextInCodeSlide
	"context", // ContextInKnowledgeWorkSlide
	"context", // ContextRecordSlide
	null, // VerificationBridgeSlide
	"verification", // VerificationInCodeSlide
	"verification", // VerificationInKnowledgeWorkSlide
	"verification", // VerificationSolutionSlide
	null, // GovernanceBridgeSlide
	"governance", // GovernanceInCodeSlide
	"governance", // GovernanceInKnowledgeWorkSlide
	"governance", // GovernanceSolutionSlide
	null, // ReversibilityBridgeSlide
	"reversibility", // ReversibilityInCodeSlide
	"reversibility", // ReversibilityInKnowledgeWorkSlide
	"reversibility", // ReversibilitySolutionSlide
	null, // DiagnosisSlide
];

// Stable idx per primitive so SVG <defs> ids don't collide.
const BADGE_IDX: Record<PrimitiveKey, number> = {
	centralization: 9000,
	history: 9001,
	context: 9002,
	verification: 9003,
	governance: 9004,
	reversibility: 9005,
};

/**
 * Persistent overlay rendered ONCE inside Spectacle's scaled wrapper, on top
 * of the slides at zIndex 1. Survives slide changes — so the brick stays put
 * when you advance within a primitive section. AnimatePresence keyed on
 * `primitive` means a smooth crossfade only fires when the primitive
 * actually changes (or appears/disappears at section boundaries), not on
 * every slide change.
 */
function DeckTemplate({ slideNumber }: { slideNumber: number }) {
	const primitive = SLIDE_PRIMITIVES[slideNumber - 1] ?? null;

	// Centering lives on the OUTER wrapper so framer-motion's animated
	// transform (y, opacity) doesn't clobber translateX(-50%). The inner
	// motion.div animates inside the centered slot.
	return (
		<div className="pointer-events-none absolute inset-0">
			<div
				className="absolute top-6 left-1/2 -translate-x-1/2"
				aria-hidden
			>
				<AnimatePresence mode="wait">
					{primitive ? (
						<motion.div
							key={primitive}
							style={{
								filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
							}}
							initial={{ opacity: 0, y: -16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -16 }}
							transition={{
								duration: 0.35,
								ease: [0.34, 1.18, 0.6, 1],
							}}
						>
							<LegoBrick
								brick={PRIMITIVES[primitive]}
								idx={BADGE_IDX[primitive]}
								studs={3}
							/>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		</div>
	);
}

/**
 * The deck. Empty starting point — we build it one slide at a time.
 * Add each finished slide as a child below.
 */
export function DeckRoot() {
	return (
		<Deck
			theme={theme}
			transition={defaultTransition}
			template={({ slideNumber }) => (
				<DeckTemplate slideNumber={slideNumber} />
			)}
		>
			<TitleSlide />
			<ToolCallsSlide />
			<CodingArcSlide />
			<DependencyTowerSlide />
			<EmptyTowerSlide />
			<BridgeSlide />
			<CodebaseBentoSlide />
			<KnowledgeFragmentsSlide />
			<HistoryBridgeSlide />
			<GitHistorySlide />
			<KnowledgeHistoryGapSlide />
			<EventLogSlide />
			<ContextBridgeSlide />
			<ContextInCodeSlide />
			<ContextInKnowledgeWorkSlide />
			<ContextRecordSlide />
			<VerificationBridgeSlide />
			<VerificationInCodeSlide />
			<VerificationInKnowledgeWorkSlide />
			<VerificationSolutionSlide />
			<GovernanceBridgeSlide />
			<GovernanceInCodeSlide />
			<GovernanceInKnowledgeWorkSlide />
			<GovernanceSolutionSlide />
			<ReversibilityBridgeSlide />
			<ReversibilityInCodeSlide />
			<ReversibilityInKnowledgeWorkSlide />
			<ReversibilitySolutionSlide />
			<DiagnosisSlide />
		</Deck>
	);
}

export default DeckRoot;
