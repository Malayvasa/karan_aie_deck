"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { LegoBrick, ROW_Y, TOTAL_H, widthForStuds } from "./lego/LegoBrick";
import { PRIMITIVES } from "./lego/primitives";

const TITLE_CLASS =
	"font-mono text-[40px] font-normal leading-[1.05] tracking-tight text-center text-foreground";

const BRICK_STUDS = 3;
const BRICK_W = widthForStuds(BRICK_STUDS);
const COLS = 3;
const ROWS = 2;
const GRID_W = COLS * BRICK_W;
const GRID_H = TOTAL_H + (ROWS - 1) * ROW_Y;

const WORDS_DURATION = 0.5;
const FIRST_BRICK_DELAY = WORDS_DURATION + 0.2;
const FILLED_DROP = -120;

const CENTRALIZATION = PRIMITIVES.centralization;
const HISTORY = PRIMITIVES.history;
const CONTEXT = PRIMITIVES.context;
const VERIFICATION = PRIMITIVES.verification;
const GOVERNANCE = PRIMITIVES.governance;
const REVERSIBILITY = PRIMITIVES.reversibility;

export function ReversibilityBridgeSlide() {
	return (
		<DeckSlide>
			<ReversibilityBridgeBody />
		</DeckSlide>
	);
}

function ReversibilityBridgeBody() {
	const { isSlideActive } = useContext(SlideContext);
	// Only the NEW brick (reversibility) gets the drop animation. All five
	// other bricks are already established by this point in the deck. This is
	// the final brick — the wall is complete after it lands.
	const FILLED_DELAY = FIRST_BRICK_DELAY;

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div className="flex items-center justify-center gap-10">
					<motion.h2
						className={`${TITLE_CLASS} whitespace-nowrap`}
						initial={{ opacity: 0, x: -16 }}
						animate={
							isSlideActive
								? { opacity: 1, x: 0 }
								: { opacity: 0, x: -16 }
						}
						transition={{ duration: WORDS_DURATION, ease: "easeOut" }}
					>
						Coding
					</motion.h2>

					<div
						className="relative shrink-0"
						style={{ width: GRID_W, height: GRID_H }}
					>
						{/* All five established bricks render under the new one's drop
						    target. No ghost bricks remain — reversibility completes
						    the wall. */}

						{/* Centralization — established */}
						<div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: 0,
								top: ROW_Y,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								zIndex: 20,
							}}
						>
							<LegoBrick
								brick={CENTRALIZATION}
								idx={1000}
								studs={BRICK_STUDS}
							/>
						</div>

						{/* History — established */}
						<div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: BRICK_W,
								top: ROW_Y,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								zIndex: 20,
							}}
						>
							<LegoBrick
								brick={HISTORY}
								idx={1001}
								studs={BRICK_STUDS}
							/>
						</div>

						{/* Context — established */}
						<div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: 2 * BRICK_W,
								top: ROW_Y,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								zIndex: 20,
							}}
						>
							<LegoBrick
								brick={CONTEXT}
								idx={1002}
								studs={BRICK_STUDS}
							/>
						</div>

						{/* Verification — established */}
						<div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: 0,
								top: 0,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								zIndex: 20,
							}}
						>
							<LegoBrick
								brick={VERIFICATION}
								idx={1003}
								studs={BRICK_STUDS}
							/>
						</div>

						{/* Governance — established */}
						<div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: BRICK_W,
								top: 0,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								zIndex: 20,
							}}
						>
							<LegoBrick
								brick={GOVERNANCE}
								idx={1004}
								studs={BRICK_STUDS}
							/>
						</div>

						{/* Reversibility — the NEW brick this slide adds (drops in).
						    Lands in the top-right slot, capping the wall. */}
						<motion.div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: 2 * BRICK_W,
								top: 0,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								zIndex: 20,
							}}
							initial={{ opacity: 0, y: FILLED_DROP }}
							animate={
								isSlideActive
									? { opacity: 1, y: 0 }
									: { opacity: 0, y: FILLED_DROP }
							}
							transition={{
								duration: 0.55,
								ease: [0.34, 1.4, 0.6, 1],
								delay: isSlideActive ? FILLED_DELAY : 0,
							}}
						>
							<LegoBrick
								brick={REVERSIBILITY}
								idx={1005}
								studs={BRICK_STUDS}
							/>
						</motion.div>
					</div>

					<motion.h2
						className={TITLE_CLASS}
						initial={{ opacity: 0, x: 16 }}
						animate={
							isSlideActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }
						}
						transition={{ duration: WORDS_DURATION, ease: "easeOut" }}
					>
						Knowledge
						<br />
						work
					</motion.h2>
				</div>
			</div>

			<Notes>
				Reversibility is the last primitive. In code, every action has an
				undo — git revert, throwaway branches, preview deployments,
				migration down-scripts. The agent can try something destructive
				because there&apos;s a road back. Knowledge work doesn&apos;t have
				that — sent is sent, deleted is gone.
			</Notes>
		</>
	);
}
