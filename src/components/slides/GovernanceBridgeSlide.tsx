"use client";

import { motion } from "framer-motion";
import { Boxes, History, Lock, Network, ShieldCheck } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
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
const GRID_W = COLS * BRICK_W;
const GRID_H = TOTAL_H + (ROWS - 1) * ROW_Y;

const GHOST_STROKE = "rgba(255,255,255,0.5)";
const ENTER_LIFT = -14;
const WORDS_DURATION = 0.5;
const FIRST_BRICK_DELAY = WORDS_DURATION + 0.2;
const BRICK_STAGGER = 0.22;
const FILLED_DROP = -120;

const CENTRALIZATION: Brick = {
	label: "centralization",
	color: "#2C2C2C",
	text: "#ffffff",
	icon: Boxes,
};

const HISTORY: Brick = {
	label: "history",
	color: "#2C2C2C",
	text: "#ffffff",
	icon: History,
};

const CONTEXT: Brick = {
	label: "context",
	color: "#2C2C2C",
	text: "#ffffff",
	icon: Network,
};

const VERIFICATION: Brick = {
	label: "verification",
	color: "#2C2C2C",
	text: "#ffffff",
	icon: ShieldCheck,
};

const GOVERNANCE: Brick = {
	label: "governance",
	color: "#2C2C2C",
	text: "#ffffff",
	icon: Lock,
};

export function GovernanceBridgeSlide() {
	return (
		<DeckSlide>
			<GovernanceBridgeBody />
		</DeckSlide>
	);
}

function GovernanceBridgeBody() {
	const { isSlideActive } = useContext(SlideContext);
	// Only the NEW brick (governance) gets the drop animation. Bottom row
	// and verification are already established; ghost brick just sits.
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
						{Array.from({ length: NUM_BRICKS }, (_, i) => {
							const col = i % COLS;
							const row = Math.floor(i / COLS);
							// Skip only the established slots (bottom row +
							// verification at top-left). The new brick's slot
							// (governance, top-middle) keeps its ghost — covered
							// when the brick drops in.
							const isEstablishedSlot =
								row === 1 || (row === 0 && col === 0);
							if (isEstablishedSlot) return null;
							return (
								<div
									key={i}
									className="absolute"
									style={{
										width: BRICK_W,
										height: TOTAL_H,
										left: col * BRICK_W,
										top: row * ROW_Y,
										zIndex: ROWS - row,
									}}
								>
									<GhostBrick studs={BRICK_STUDS} />
								</div>
							);
						})}

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

						{/* Governance — the NEW brick this slide adds (drops in). */}
						<motion.div
							className="absolute"
							style={{
								width: BRICK_W,
								height: TOTAL_H,
								left: BRICK_W,
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
								brick={GOVERNANCE}
								idx={1004}
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
				Governance is the next primitive. In code, branches, code owners
				and preview environments stop the agent from touching production.
				Knowledge work has no comparable wall.
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
