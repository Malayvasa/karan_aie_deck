"use client";

import { motion } from "framer-motion";
import { Notes } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";
import { TabDiffBlock } from "./coding-arc/TabDiffBlock";
import { TerminalBlock } from "./coding-arc/TerminalBlock";

const BLOCK_H = 400;
const BLOCK_W = 505;
const GAP_W = 90;
const GROUP_W = BLOCK_W * 2 + GAP_W; // 1100
const IDE_CENTER = BLOCK_W / 2; // 252.5
const TERM_CENTER = BLOCK_W + GAP_W + BLOCK_W / 2; // 847.5
// In step 1 the IDE is alone; shift it (and its year) right to center it.
const CENTER_OFFSET = GROUP_W / 2 - IDE_CENTER; // 297.5
const ARROW_PAD = 52; // clearance between a year label and the arrow
const ARROW_LEFT = IDE_CENTER + ARROW_PAD;
const ARROW_W = TERM_CENTER - ARROW_PAD - ARROW_LEFT;
const SPRING = { type: "spring", stiffness: 240, damping: 28 } as const;
const YEAR = "whitespace-nowrap font-mono text-[22px] tabular-nums text-white";

/**
 * Slide 3 (s2) — the arc of coding agents.
 * Step 1: the IDE ("tab, tab, tab") plays, centered, with 2023 beneath it.
 * Step 2: the IDE slides left, the terminal enters from the right, 2026 appears
 * beneath it, and an arrow spans between the two years.
 */
export function CodingArcSlide() {
	return (
		<DeckSlide>
			<CodingArcBody />
		</DeckSlide>
	);
}

function CodingArcBody() {
	const { reached, placeholder } = useStepMotion(1);
	const split = reached(0);

	return (
		<>
			{placeholder}
			<div className="flex flex-1 flex-col justify-center gap-14">
				{/* blocks */}
				<div className="flex items-center justify-center" style={{ height: BLOCK_H }}>
					<motion.div
						className="shrink-0"
						style={{ width: BLOCK_W, height: BLOCK_H }}
						initial={false}
						animate={{ x: split ? 0 : CENTER_OFFSET }}
						transition={SPRING}
					>
						<TabDiffBlock />
					</motion.div>

					<div className="shrink-0" style={{ width: GAP_W }} />

					<motion.div
						className="shrink-0"
						style={{ width: BLOCK_W, height: BLOCK_H }}
						initial={false}
						animate={{ opacity: split ? 1 : 0, x: split ? 0 : 140 }}
						transition={{ ...SPRING, delay: split ? 0.12 : 0 }}
					>
						<TerminalBlock active={split} />
					</motion.div>
				</div>

				{/* timeline — years centered under each block, arrow between them */}
				<div className="relative mx-auto h-8" style={{ width: GROUP_W }}>
					{/* 2023 — tracks the IDE */}
					<motion.div
						className="absolute top-1/2"
						style={{ left: IDE_CENTER }}
						initial={false}
						animate={{ x: split ? 0 : CENTER_OFFSET, y: "-50%" }}
						transition={SPRING}
					>
						<span className={`block -translate-x-1/2 ${YEAR}`}>2023</span>
					</motion.div>

					{/* arrow between the two years — draws out from the left on enter,
					    retracts back on exit (instead of fading in place). */}
					<motion.div
						className="absolute top-1/2 flex items-center"
						// originX 0 → draws out from the left (toward 2026) on enter;
						// originX 1 → retracts toward the right (away from 2023) on exit.
						style={{ left: ARROW_LEFT, width: ARROW_W, originX: split ? 0 : 1 }}
						initial={false}
						animate={{
							opacity: split ? 1 : 0,
							scaleX: split ? 1 : 0,
							y: "-50%",
						}}
						transition={{ duration: 0.45, delay: split ? 0.22 : 0, ease: "easeOut" }}
					>
						<div className="h-[1.5px] flex-1" style={{ background: "#ffffff" }} />
						<span
							style={{
								width: 0,
								height: 0,
								borderTop: "5px solid transparent",
								borderBottom: "5px solid transparent",
								borderLeft: "8px solid #ffffff",
							}}
						/>
					</motion.div>

					{/* 2026 — under the terminal */}
					<motion.div
						className="absolute top-1/2"
						style={{ left: TERM_CENTER }}
						initial={false}
						animate={{ opacity: split ? 1 : 0, x: split ? 0 : 140, y: "-50%" }}
						transition={{ ...SPRING, delay: split ? 0.12 : 0 }}
					>
						<span className={`block -translate-x-1/2 ${YEAR}`}>2026</span>
					</motion.div>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="codingArc" steps={1} />
			</Notes>
		</>
	);
}
