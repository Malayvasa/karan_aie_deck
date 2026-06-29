"use client";

import { motion, type Transition } from "framer-motion";
import {
	Eye,
	FlaskConical,
	GitCommitHorizontal,
	RotateCcw,
	ScanText,
	Workflow,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";
import {
	BLOCK_H,
	GRID_W,
	LegoBrick,
	ROW_Y,
	STUD_PITCH,
	TOTAL_H,
	widthForStuds,
	xForStud,
	yForRow,
	type Brick,
	type PlacedBrick,
} from "./lego/LegoBrick";

const N_ROWS = 9;
const CONTAINER_H = (N_ROWS - 1) * ROW_Y + TOTAL_H;

const AGENTS: Brick = { label: "Modern coding agents", color: "#D0121A", text: "#ffffff" };
const HARNESS: Brick = { label: "Coding harnesses", color: "#F5C518", text: "#1a1a1a" };
const MODELS: Brick = { label: "Foundational models", color: "#0057A8", text: "#ffffff" };
const REVERT: Brick = {
	label: "revert",
	color: "#D0121A",
	text: "#ffffff",
	icon: RotateCcw,
};
const COMMIT_HISTORY: Brick = {
	label: "commit history",
	color: "#2E8B3D",
	text: "#ffffff",
	icon: GitCommitHorizontal,
};
const TESTS: Brick = { label: "tests", color: "#E07B27", text: "#ffffff", icon: FlaskConical };
const CI_CD: Brick = { label: "CI/CD", color: "#5A3286", text: "#ffffff", icon: Workflow };
const REVIEW: Brick = { label: "review", color: "#2EA8A8", text: "#ffffff", icon: Eye };
const LINTER: Brick = { label: "linter", color: "#D94F9F", text: "#ffffff", icon: ScanText };
const FOUNDATION_BASE_COLOR = "#2C2C2C";
const MONOREPO: Brick = { label: "Monorepo", color: FOUNDATION_BASE_COLOR, text: "#ffffff" };

const TOP_BRICKS = {
	agents: { brick: AGENTS, xStud: 3, row: 0, studs: 6, idx: 0 },
	harness: { brick: HARNESS, xStud: 3, row: 1, studs: 6, idx: 1 },
	models: { brick: MODELS, xStud: 3, row: 2, studs: 6, idx: 2 },
} satisfies Record<string, PlacedBrick>;

const FOUNDATION_BRICKS: PlacedBrick[] = [
	{ brick: COMMIT_HISTORY, xStud: 3, row: 3, studs: 4, idx: 11 },
	{ brick: TESTS, xStud: 4, row: 4, studs: 4, idx: 12 },
	{ brick: CI_CD, xStud: 2, row: 5, studs: 3, idx: 13 },
	{ brick: REVIEW, xStud: 3, row: 6, studs: 3, idx: 14 },
	{ brick: LINTER, xStud: 4, row: 7, studs: 2, idx: 17 },
	{ brick: MONOREPO, xStud: 3, row: 8, studs: 6, idx: 15 },
];

const SIDEWAYS_REVERT = { brick: REVERT, xStud: 0, row: 4, studs: 2, idx: 10 };

function zForRow(row: number) {
	return N_ROWS - row;
}

function withBrickColor(cell: PlacedBrick, color: string): PlacedBrick {
	return {
		...cell,
		brick: { ...cell.brick, color, text: "#ffffff" },
	};
}

const LIFT = 34;
const REVERT_DELAY = 2.75;
const REVERT_SETTLE_MS = 3350;
const IMPACT_DELAY = 0.03;
const REVERT_HEIGHT_BONUS = 12;
const SHADOW = "drop-shadow(0 5px 6px rgba(0,0,0,0.4))";
const SNAP = { type: "spring", stiffness: 520, damping: 36 } as const;
const EASE = { duration: 0.32, ease: "easeOut" } as const;
const RECENTER = { type: "spring", stiffness: 300, damping: 32 } as const;
const FOUND_EASE = { duration: 0.4, ease: "easeOut" } as const;
const REVERT_STRAIGHTEN = { type: "spring", stiffness: 720, damping: 22 } as const;
const IMPACT_REACTION = {
	type: "spring",
	stiffness: 620,
	damping: 24,
} as const;
type MotionNumber = number | number[];

function addMotionOffset(value: MotionNumber | undefined, offset: number) {
	if (Array.isArray(value)) return value.map((v) => v + offset);
	return offset + (value ?? 0);
}

export function DependencyTowerSlide() {
	return (
		<DeckSlide>
			<DependencyTowerBody />
		</DeckSlide>
	);
}

function PlacedLegoBrick({
	cell,
	animate,
	transition,
	zIndex = 1,
}: {
	cell: PlacedBrick;
	animate: {
		filter?: string;
		opacity: number;
		rotate?: MotionNumber;
		scale?: MotionNumber;
		scaleX?: MotionNumber;
		scaleY?: MotionNumber;
		x?: MotionNumber;
		y: MotionNumber;
	};
	transition: Transition;
	zIndex?: number;
}) {
	return (
		<motion.div
			className="absolute top-0 left-0"
			style={{
				width: widthForStuds(cell.studs),
				filter: SHADOW,
				transformOrigin: "50% 100%",
				zIndex,
			}}
			initial={false}
			animate={{
				opacity: animate.opacity,
				filter: animate.filter ?? "blur(0px)",
				rotate: animate.rotate ?? 0,
				scale: animate.scale ?? 1,
				scaleX: animate.scaleX ?? 1,
				scaleY: animate.scaleY ?? 1,
				x: addMotionOffset(animate.x, xForStud(cell.xStud)),
				y: animate.y,
			}}
			transition={transition}
		>
			<LegoBrick
				brick={cell.brick}
				idx={cell.idx}
				studs={cell.studs}
				fontSize={cell.fontSize}
			/>
		</motion.div>
	);
}

function PlacedSidewaysLegoBrick({
	cell,
	animate,
	transition,
	zIndex = 1,
}: {
	cell: PlacedBrick;
	animate: { filter?: string; opacity: number; rotate?: number; scale?: number; x: number; y: number };
	transition: Transition;
	zIndex?: number;
}) {
	const width = widthForStuds(cell.studs);
	const verticalSize =
		cell.brick.label === REVERT.label ? width + REVERT_HEIGHT_BONUS : width;
	const verticalScale = verticalSize / width;

	return (
		<motion.div
			className="absolute top-0 left-0"
			style={{
				width: TOTAL_H,
				height: verticalSize,
				filter: SHADOW,
				transformOrigin: "50% 100%",
				zIndex,
			}}
			initial={false}
			animate={{
				opacity: animate.opacity,
				filter: animate.filter ?? "blur(0px)",
				rotate: animate.rotate ?? 0,
				scale: animate.scale ?? 1,
				x: animate.x,
				y: animate.y,
			}}
			transition={transition}
		>
			<div
				className="absolute left-0"
				style={{
					top: verticalSize,
					transform: `rotate(-90deg) scaleX(${verticalScale})`,
					transformOrigin: "top left",
				}}
			>
				<LegoBrick brick={cell.brick} idx={cell.idx} studs={cell.studs} />
			</div>
		</motion.div>
	);
}

function DependencyTowerBody() {
	const { reached, placeholder } = useStepMotion(4);
	const showModels = reached(0);
	const assembled = reached(1);
	const showMonorepo = reached(2);
	const showFoundation = reached(3);
	const [phase, setPhase] = useState<"idle" | "apart" | "in">("idle");
	const [foundationSettled, setFoundationSettled] = useState(false);

	useEffect(() => {
		if (!assembled) {
			setPhase("idle");
			return;
		}
		setPhase("apart");
		const t = setTimeout(() => setPhase("in"), 380);
		return () => clearTimeout(t);
	}, [assembled]);

	useEffect(() => {
		if (!showFoundation) {
			setFoundationSettled(false);
			return;
		}
		const t = setTimeout(() => setFoundationSettled(true), REVERT_SETTLE_MS);
		return () => clearTimeout(t);
	}, [showFoundation]);

	const lastVisibleRow = showMonorepo ? 8 : showModels ? 2 : 0;
	const visibleHeight = yForRow(lastVisibleRow) + TOTAL_H;
	const wrapperY = (CONTAINER_H - visibleHeight) / 2;

	const agentCell = useMemo(
		() =>
			showMonorepo
				? withBrickColor(TOP_BRICKS.agents, FOUNDATION_BASE_COLOR)
				: TOP_BRICKS.agents,
		[showMonorepo],
	);
	const harnessCell = useMemo(
		() =>
			showMonorepo
				? withBrickColor(TOP_BRICKS.harness, FOUNDATION_BASE_COLOR)
				: TOP_BRICKS.harness,
		[showMonorepo],
	);
	const modelCell = useMemo(
		() =>
			showMonorepo
				? withBrickColor(TOP_BRICKS.models, FOUNDATION_BASE_COLOR)
				: TOP_BRICKS.models,
		[showMonorepo],
	);
	const topLean = foundationSettled
		? {
				agents: { x: 0, rotate: -2 },
				harness: { x: 0, rotate: -1.4 },
				models: { x: 0, rotate: -0.8 },
			}
		: {
				agents: { x: 0, rotate: 0 },
				harness: { x: 0, rotate: 0 },
				models: { x: 0, rotate: 0 },
			};
	const foundationTilt = (label: string) => {
		if (!foundationSettled) return 0;
		if (label === COMMIT_HISTORY.label) return -0.7;
		if (label === TESTS.label) return -0.55;
		if (label === CI_CD.label) return -0.4;
		if (label === REVIEW.label) return 0.5;
		if (label === LINTER.label) return -0.3;
		return 0;
	};
	const impactDelayForBrick = (label: string, row: number) => {
		if (label === TESTS.label) return IMPACT_DELAY;
		if (label === REVIEW.label) return IMPACT_DELAY + 0.05;
		if (label === LINTER.label) return IMPACT_DELAY + 0.08;
		if (label === CI_CD.label) return IMPACT_DELAY + 0.11;
		if (label === COMMIT_HISTORY.label) return IMPACT_DELAY + 0.18;
		return IMPACT_DELAY + Math.max(0, 3 - row) * 0.08;
	};
	const topImpactTransition = (row: number): Transition =>
		foundationSettled
			? { ...IMPACT_REACTION, delay: IMPACT_DELAY + (3 - row) * 0.08 }
			: phase === "in"
				? SNAP
				: EASE;
	const modelY = showModels
		? assembled
			? yForRow(modelCell.row) + (phase === "apart" ? LIFT : 0)
			: yForRow(harnessCell.row)
		: yForRow(harnessCell.row) - ROW_Y;
	const harnessX =
		(assembled && phase === "in" ? 0 : STUD_PITCH * 2) + topLean.harness.x;
	const harnessY = yForRow(harnessCell.row);
	const agentY = yForRow(agentCell.row) + (phase === "apart" ? -LIFT : 0);

	const modelAnimate = { rotate: topLean.models.rotate, x: topLean.models.x, y: modelY };
	const harnessAnimate = { rotate: topLean.harness.rotate, x: harnessX, y: harnessY };
	const agentAnimate = { rotate: topLean.agents.rotate, x: topLean.agents.x, y: agentY };

	return (
		<>
			{placeholder}
			<div className="flex flex-1 items-center justify-center">
				<motion.div
					className="relative"
					style={{ width: GRID_W, height: CONTAINER_H }}
					initial={false}
					animate={{ y: wrapperY }}
					transition={RECENTER}
				>
					<PlacedLegoBrick
						cell={modelCell}
						zIndex={zForRow(modelCell.row)}
						animate={{
							opacity: showModels ? 1 : 0,
							rotate: modelAnimate.rotate,
							x: modelAnimate.x,
							y: modelAnimate.y,
						}}
						transition={topImpactTransition(modelCell.row)}
					/>

					<PlacedLegoBrick
						cell={harnessCell}
						zIndex={zForRow(harnessCell.row)}
						animate={{
							opacity: assembled ? 1 : 0,
							rotate: harnessAnimate.rotate,
							x: harnessAnimate.x,
							y: harnessAnimate.y,
						}}
						transition={topImpactTransition(harnessCell.row)}
					/>

					<PlacedLegoBrick
						cell={agentCell}
						zIndex={zForRow(agentCell.row)}
						animate={{
							opacity: 1,
							rotate: agentAnimate.rotate,
							x: agentAnimate.x,
							y: agentAnimate.y,
						}}
						transition={topImpactTransition(agentCell.row)}
					/>

					{FOUNDATION_BRICKS.map((cell, orderIdx) => {
						const isMonorepo = cell.brick.label === MONOREPO.label;
						const visible = isMonorepo ? showMonorepo : showFoundation;
						const appearDelay = isMonorepo ? 0 : 0.35 + 0.46 * orderIdx;
						const tiltDelay = foundationSettled
							? impactDelayForBrick(cell.brick.label, cell.row)
							: 0;

						return (
							<PlacedLegoBrick
								key={cell.brick.label}
								cell={cell}
								zIndex={zForRow(cell.row)}
								animate={{
									filter: "blur(0px)",
									opacity: visible ? 1 : 0,
									rotate: foundationTilt(cell.brick.label),
									scale: 1,
									x: 0,
									y:
										yForRow(cell.row) +
										(visible ? 0 : 36),
								}}
								transition={{
									duration: FOUND_EASE.duration,
									ease: FOUND_EASE.ease,
									delay: visible
										? foundationSettled
											? tiltDelay
											: appearDelay
										: 0,
								}}
							/>
						);
					})}

					<PlacedSidewaysLegoBrick
						cell={SIDEWAYS_REVERT}
						zIndex={zForRow(5)}
						animate={{
							filter: "blur(0px)",
							opacity: showFoundation ? 1 : 0,
							rotate: showFoundation && foundationSettled ? 0 : 14,
							scale: 1,
							x:
								xForStud(7) +
								(showFoundation ? 0 : 170),
							y:
								yForRow(8) -
								widthForStuds(SIDEWAYS_REVERT.studs) -
								REVERT_HEIGHT_BONUS +
								(showFoundation ? 0 : 36),
						}}
						transition={
							foundationSettled
								? REVERT_STRAIGHTEN
								: {
										...FOUND_EASE,
										delay: showFoundation ? REVERT_DELAY : 0,
							}
						}
					/>
				</motion.div>
			</div>

			<Notes>
				Why was the proliferation here so fast? Everybody thinks the answer is
				models - the foundational models and the harnesses, Claude Code, Cursor,
				the Codexes of the world, got better and better. And that matters a lot.
				But on their own it wouldn&apos;t have worked - not without the
				infrastructure software engineering already had: revert, commit history,
				tests, CI/CD, review, monorepos, and the codebase itself.
			</Notes>
		</>
	);
}
