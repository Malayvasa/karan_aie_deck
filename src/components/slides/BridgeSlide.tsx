"use client";

import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";
import {
	brickPath,
	LegoBrick,
	ROW_Y,
	studCenters,
	TOTAL_H,
	widthForStuds,
	type Brick,
} from "./lego/LegoBrick";

const TITLE_CLASS =
	"font-mono text-[40px] font-normal leading-[1.05] tracking-tight text-center text-foreground";

const BRICK_STUDS = 3;
const BRICK_W = widthForStuds(BRICK_STUDS);
const COLS = 3;
const ROWS = 2;
const NUM_BRICKS = COLS * ROWS;
// Use lego stacking spacing so the rows interlock (studs of row 2 tuck into
// row 1's body height) instead of sitting in a loose grid.
const GRID_W = COLS * BRICK_W;
const GRID_H = TOTAL_H + (ROWS - 1) * ROW_Y;

const GHOST_STROKE = "rgba(255,255,255,0.5)";
const GHOST_DIM_OPACITY = 0.35;
const ENTER_LIFT = -14;
const WORDS_DURATION = 0.5;
// Bricks wait for the two words to land before they start stacking in.
const FIRST_BRICK_DELAY = WORDS_DURATION + 0.2;
const BRICK_STAGGER = 0.22;

// First primitive — drops into the bottom-left slot on step 0.
const CENTRALIZATION: Brick = {
	label: "centralization",
	color: "#2C2C2C",
	text: "#ffffff",
	icon: Boxes,
};
const CENTRALIZATION_DROP = -120;

export function BridgeSlide() {
	return (
		<DeckSlide>
			<BridgeBody />
		</DeckSlide>
	);
}

function BridgeBody() {
	// Spectacle's slide context — animations gate on this so they only fire
	// when the audience actually reaches the slide.
	const { isSlideActive } = useContext(SlideContext);
	const { reached, placeholder } = useStepMotion(1);
	const showCentralization = reached(0);

	return (
		<>
			{placeholder}
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
						{Array.from({ length: NUM_BRICKS }, (_, i) => {
							const col = i % COLS;
							const row = Math.floor(i / COLS);
							// Lay the bottom row first, then the top row — reading
							// order within each row.
							const orderIndex = (ROWS - 1 - row) * COLS + col;
							const isCentralizationSlot = col === 0 && row === 1;
							// Hide the centralization slot's ghost outright; dim the
							// rest once a real piece has landed so attention pulls
							// to it.
							const targetOpacity = !isSlideActive
								? 0
								: isCentralizationSlot && showCentralization
									? 0
									: showCentralization
										? GHOST_DIM_OPACITY
										: 1;
							const isEntering = isSlideActive && !showCentralization;
							return (
								<motion.div
									key={i}
									className="absolute"
									style={{
										width: BRICK_W,
										height: TOTAL_H,
										left: col * BRICK_W,
										top: row * ROW_Y,
										// Top row paints over bottom row so the lego
										// interlock reads cleanly.
										zIndex: ROWS - row,
									}}
									initial={{ opacity: 0, y: ENTER_LIFT }}
									animate={{
										opacity: targetOpacity,
										y: isEntering ? 0 : isSlideActive ? 0 : ENTER_LIFT,
									}}
									transition={{
										duration: 0.45,
										ease: [0.34, 1.18, 0.6, 1],
										delay: isEntering
											? FIRST_BRICK_DELAY +
												orderIndex * BRICK_STAGGER
											: 0,
									}}
								>
									<GhostBrick studs={BRICK_STUDS} />
								</motion.div>
							);
						})}

						{/* Centralization — drops into the bottom-left slot on step 0,
						    replacing the ghost outline that was holding the position. */}
						<motion.div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: 0,
								top: ROW_Y,
								filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.4))",
								// Sits above ghosts and above the top row of bricks so
								// it lands cleanly on top of whatever's there.
								zIndex: 20,
							}}
							initial={{ opacity: 0, y: CENTRALIZATION_DROP }}
							animate={
								showCentralization
									? { opacity: 1, y: 0 }
									: { opacity: 0, y: CENTRALIZATION_DROP }
							}
							transition={{
								duration: 0.55,
								ease: [0.34, 1.4, 0.6, 1],
							}}
						>
							<LegoBrick
								brick={CENTRALIZATION}
								idx={1000}
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
				So how do we bridge the gap between coding agents and knowledge work
				agents? Hold the question — the rest of the talk is the answer.
			</Notes>
		</>
	);
}

function GhostBrick({ studs }: { studs: number }) {
	const width = widthForStuds(studs);
	const centers = studCenters(studs);
	const path = brickPath(width, centers);

	return (
		<svg
			width={width}
			height={TOTAL_H}
			viewBox={`0 0 ${width} ${TOTAL_H}`}
			style={{ display: "block", overflow: "visible" }}
			aria-hidden
		>
			<path
				d={path}
				fill="none"
				stroke={GHOST_STROKE}
				strokeWidth="1.75"
				strokeDasharray="5 4"
			/>
		</svg>
	);
}
