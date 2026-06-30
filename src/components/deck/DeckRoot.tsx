"use client";

import { Deck, defaultTransition } from "spectacle";
import { BridgeSlide } from "~/components/slides/BridgeSlide";
import { CodebaseBentoSlide } from "~/components/slides/CodebaseBentoSlide";
import { CodingArcSlide } from "~/components/slides/CodingArcSlide";
import { ContextBridgeSlide } from "~/components/slides/ContextBridgeSlide";
import { ContextInCodeSlide } from "~/components/slides/ContextInCodeSlide";
import { ContextInKnowledgeWorkSlide } from "~/components/slides/ContextInKnowledgeWorkSlide";
import { ContextRecordSlide } from "~/components/slides/ContextRecordSlide";
import { DependencyTowerSlide } from "~/components/slides/DependencyTowerSlide";
import { EmptyTowerSlide } from "~/components/slides/EmptyTowerSlide";
import { EventLogSlide } from "~/components/slides/EventLogSlide";
import { GitHistorySlide } from "~/components/slides/GitHistorySlide";
import { HistoryBridgeSlide } from "~/components/slides/HistoryBridgeSlide";
import { KnowledgeFragmentsSlide } from "~/components/slides/KnowledgeFragmentsSlide";
import { KnowledgeHistoryGapSlide } from "~/components/slides/KnowledgeHistoryGapSlide";
import { TitleSlide } from "~/components/slides/TitleSlide";
import { ToolCallsSlide } from "~/components/slides/ToolCallsSlide";
import { VerificationBridgeSlide } from "~/components/slides/VerificationBridgeSlide";
import { VerificationInCodeSlide } from "~/components/slides/VerificationInCodeSlide";
import { VerificationInKnowledgeWorkSlide } from "~/components/slides/VerificationInKnowledgeWorkSlide";

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
 * The deck. Empty starting point — we build it one slide at a time.
 * Add each finished slide as a child below.
 */
export function DeckRoot() {
	return (
		<Deck theme={theme} transition={defaultTransition}>
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
		</Deck>
	);
}

export default DeckRoot;
