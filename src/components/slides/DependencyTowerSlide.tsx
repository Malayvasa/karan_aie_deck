"use client";

import { motion, type Transition } from "framer-motion";
import {
	Briefcase,
	DollarSign,
	Eye,
	FlaskConical,
	GitCommitHorizontal,
	Headphones,
	Megaphone,
	RotateCcw,
	ScanText,
	UserPlus,
	Workflow,
	type LucideIcon,
} from "lucide-react";
import Matter from "matter-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";

const STUD_PITCH = 72;
const STUD_W = 34;
const STUD_H = 10;
const STUD_R = 3;
const BLOCK_H = 52;
const LABEL_FONT_SIZE = 14;
const BODY_R = 5;
const TOP_R = 5;
const PEEK = 0;
const TOTAL_H = STUD_H + BLOCK_H;
const ROW_Y = BLOCK_H + PEEK;
const PHYSICS_STEP_MS = 1000 / 120;
const COLLIDER_PAD_X = 10;
const COLLIDER_PAD_Y = 6;

const GRID_STUDS = 12;
const GRID_W = GRID_STUDS * STUD_PITCH;
const N_ROWS = 9;
const CONTAINER_H = (N_ROWS - 1) * ROW_Y + TOTAL_H;

type Brick = { label: string; color: string; text: string; icon?: LucideIcon };
type PlacedBrick = {
	brick: Brick;
	xStud: number;
	row: number;
	studs: number;
	idx: number;
	fontSize?: number;
};
type DroppedAgentKey = "sales" | "marketing" | "support" | "hiring" | "finance";

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
const SALES_AGENT: Brick = {
	label: "Sales",
	color: "#C96442",
	text: "#ffffff",
	icon: Briefcase,
};
const MARKETING_AGENT: Brick = {
	label: "Marketing",
	color: "#F5C518",
	text: "#1a1a1a",
	icon: Megaphone,
};
const SUPPORT_AGENT: Brick = {
	label: "Support",
	color: "#2EA8A8",
	text: "#ffffff",
	icon: Headphones,
};
const HIRING_AGENT: Brick = {
	label: "Hiring",
	color: "#5A3286",
	text: "#ffffff",
	icon: UserPlus,
};
const FINANCE_AGENT: Brick = {
	label: "Finance",
	color: "#2E8B3D",
	text: "#ffffff",
	icon: DollarSign,
};

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
const DROPPED_AGENT_BRICKS = [
	{ key: "sales", cell: { brick: SALES_AGENT, xStud: 0, row: 0, studs: 2, idx: 30 } },
	{ key: "marketing", cell: { brick: MARKETING_AGENT, xStud: 0, row: 0, studs: 3, idx: 31 } },
	{ key: "support", cell: { brick: SUPPORT_AGENT, xStud: 0, row: 0, studs: 3, idx: 32 } },
	{ key: "hiring", cell: { brick: HIRING_AGENT, xStud: 0, row: 0, studs: 2, idx: 33 } },
	{ key: "finance", cell: { brick: FINANCE_AGENT, xStud: 0, row: 0, studs: 2, idx: 34 } },
] satisfies { key: DroppedAgentKey; cell: PlacedBrick }[];

function widthForStuds(studs: number) {
	return studs * STUD_PITCH;
}

function xForStud(xStud: number) {
	return xStud * STUD_PITCH;
}

function yForRow(row: number) {
	return row * ROW_Y;
}

function zForRow(row: number) {
	return N_ROWS - row;
}

function withBrickColor(cell: PlacedBrick, color: string): PlacedBrick {
	return {
		...cell,
		brick: { ...cell.brick, color, text: "#ffffff" },
	};
}

function studCenters(studs: number) {
	return Array.from({ length: studs }, (_, i) => (i + 0.5) * STUD_PITCH);
}

function brickPath(width: number, centers: number[]): string {
	const top = STUD_H;
	const bottom = STUD_H + BLOCK_H;
	let d = `M ${TOP_R} ${top}`;
	for (const cx of centers) {
		const l = cx - STUD_W / 2;
		const r = cx + STUD_W / 2;
		d += ` L ${l} ${top}`;
		d += ` L ${l} ${STUD_R}`;
		d += ` Q ${l} 0 ${l + STUD_R} 0`;
		d += ` L ${r - STUD_R} 0`;
		d += ` Q ${r} 0 ${r} ${STUD_R}`;
		d += ` L ${r} ${top}`;
	}
	d += ` L ${width - TOP_R} ${top}`;
	d += ` Q ${width} ${top} ${width} ${top + TOP_R}`;
	d += ` L ${width} ${bottom - BODY_R}`;
	d += ` Q ${width} ${bottom} ${width - BODY_R} ${bottom}`;
	d += ` L ${BODY_R} ${bottom}`;
	d += ` Q 0 ${bottom} 0 ${bottom - BODY_R}`;
	d += ` L 0 ${top + TOP_R}`;
	d += ` Q 0 ${top} ${TOP_R} ${top}`;
	d += " Z";
	return d;
}

function LegoBrick({
	brick,
	idx,
	studs,
	fontSize,
}: {
	brick: Brick;
	idx: number;
	studs: number;
	fontSize?: number;
}) {
	const width = widthForStuds(studs);
	const clip = `brick-clip-${idx}`;
	const shade = `brick-shade-${idx}`;
	const side = `brick-side-${idx}`;
	const studHi = `brick-stud-${idx}`;
	const studSide = `brick-stud-side-${idx}`;
	const centers = studCenters(studs);
	const path = brickPath(width, centers);
	const Icon = brick.icon;
	const labelStyle = {
		color: brick.text,
		fontSize: fontSize ?? LABEL_FONT_SIZE,
		textShadow: "0 -1px 0 rgba(0,0,0,0.46), 0 1px 0 rgba(255,255,255,0.18)",
	} as const;

	return (
		<div className="relative" style={{ width, height: TOTAL_H }}>
			<svg
				width={width}
				height={TOTAL_H}
				viewBox={`0 0 ${width} ${TOTAL_H}`}
				style={{ display: "block", overflow: "visible" }}
				aria-hidden
			>
				<defs>
					<clipPath id={clip}>
						<path d={path} />
					</clipPath>
					<linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
						<stop offset="12%" stopColor="#fff" stopOpacity="0.1" />
						<stop offset="34%" stopColor="#fff" stopOpacity="0" />
						<stop offset="72%" stopColor="#000" stopOpacity="0" />
						<stop offset="93%" stopColor="#000" stopOpacity="0.34" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.52" />
					</linearGradient>
					<linearGradient id={side} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#000" stopOpacity="0.2" />
						<stop offset="8%" stopColor="#000" stopOpacity="0" />
						<stop offset="92%" stopColor="#000" stopOpacity="0" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.2" />
					</linearGradient>
					<linearGradient id={studHi} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
						<stop offset="100%" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<linearGradient id={studSide} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#000" stopOpacity="0.2" />
						<stop offset="45%" stopColor="#fff" stopOpacity="0.12" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.22" />
					</linearGradient>
				</defs>

				<g clipPath={`url(#${clip})`}>
					<path d={path} fill={brick.color} />
					<rect width={width} height={TOTAL_H} fill={`url(#${shade})`} />
					<rect width={width} height={TOTAL_H} fill={`url(#${side})`} />

					<rect
						x={0}
						y={STUD_H}
						width={width}
						height={1.5}
						fill="#fff"
						opacity={0.16}
					/>

					{centers.map((cx) => (
						<g key={cx}>
							<rect
								x={cx - STUD_W / 2}
								y={STUD_H - 1.5}
								width={STUD_W}
								height={2}
								fill="#000"
								opacity={0.16}
							/>
							<rect
								x={cx - STUD_W / 2}
								y={0}
								width={STUD_W}
								height={STUD_H}
								fill={`url(#${studSide})`}
							/>
							<rect
								x={cx - STUD_W / 2 + 3}
								y={1.3}
								width={STUD_W - 6}
								height={STUD_H + 1}
								rx={3}
								fill={`url(#${studHi})`}
							/>
						</g>
					))}

					<rect
						x={0}
						y={TOTAL_H - 3}
						width={width}
						height={3}
						fill="#000"
						opacity={0.3}
					/>
				</g>

				<path d={path} fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="1" />
			</svg>

			<div
				className="absolute inset-x-0 flex items-center justify-center px-2 text-center"
				style={{ top: STUD_H, height: BLOCK_H }}
			>
				<span
					className="inline-flex items-center justify-center gap-2 font-mono font-medium uppercase leading-none tracking-[0.06em]"
					style={labelStyle}
				>
					{Icon ? (
						<Icon
							aria-hidden
							size={15}
							strokeWidth={2.4}
							className="shrink-0"
							style={{
								filter:
									"drop-shadow(0 -1px 0 rgba(0,0,0,0.48)) drop-shadow(0 1px 0 rgba(255,255,255,0.16))",
							}}
						/>
					) : null}
					{brick.label}
				</span>
			</div>
		</div>
	);
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
type TopPhysicsKey = "models" | "harness" | "agents";
type TopPhysicsState = Record<TopPhysicsKey, { rotate: number; x: number; y: number }>;

const DOMAIN_DROP_TARGETS = {
	sales: { x: 30, y: 350, rotate: -2.5, startY: -132, delay: 0 },
	marketing: { x: 198, y: 350, rotate: 1.5, startY: -204, delay: 0.16 },
	support: { x: 438, y: 350, rotate: -1.7, startY: -276, delay: 0.32 },
	hiring: { x: 678, y: 350, rotate: 2.2, startY: -348, delay: 0.48 },
	finance: { x: 360, y: 288, rotate: -1, startY: -420, delay: 0.64 },
} satisfies Record<
	DroppedAgentKey,
	{ x: number; y: number; rotate: number; startY: number; delay: number }
>;

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
	const { reached, placeholder } = useStepMotion(6);
	const showModels = reached(0);
	const assembled = reached(1);
	const showMonorepo = reached(2);
	const showFoundation = reached(3);
	const snapped = reached(4);
	const showDomainAgents = reached(5);
	const [phase, setPhase] = useState<"idle" | "apart" | "in">("idle");
	const [foundationSettled, setFoundationSettled] = useState(false);
	const [topPhysics, setTopPhysics] = useState<TopPhysicsState | null>(null);
	const physicsFrame = useRef<number | null>(null);

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
		snapped
			? { duration: 0 }
			: foundationSettled
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

	useEffect(() => {
		if (physicsFrame.current !== null) {
			cancelAnimationFrame(physicsFrame.current);
			physicsFrame.current = null;
		}

		if (!snapped) {
			setTopPhysics(null);
			return;
		}

		if (showDomainAgents) return;

		const engine = Matter.Engine.create();
		engine.gravity.y = 1.55;
		engine.positionIterations = 12;
		engine.velocityIterations = 10;

		const floorTop = yForRow(8) + 22;
		const ground = Matter.Bodies.rectangle(GRID_W / 2, floorTop + 26, GRID_W + 220, 52, {
			isStatic: true,
			friction: 0.55,
			restitution: 0.42,
		});
		const leftWall = Matter.Bodies.rectangle(-70, 260, 40, 680, { isStatic: true });
		const rightWall = Matter.Bodies.rectangle(GRID_W + 70, 260, 40, 680, {
			isStatic: true,
		});

		const makeBody = (
			key: TopPhysicsKey,
			cell: PlacedBrick,
			x: number,
			y: number,
			rotate: number,
			velocityX: number,
			angularVelocity: number,
		) => {
			const width = widthForStuds(cell.studs);
			const body = Matter.Bodies.rectangle(
				xForStud(cell.xStud) + x + width / 2,
				y + TOTAL_H / 2,
				width + COLLIDER_PAD_X,
				TOTAL_H + COLLIDER_PAD_Y,
				{
					friction: 0.48,
					frictionAir: 0.008,
					restitution: 0.68,
					density: 0.004,
					slop: 0.01,
					label: key,
				},
			);
			Matter.Body.setAngle(body, (rotate * Math.PI) / 180);
			Matter.Body.setVelocity(body, { x: velocityX, y: 1 });
			Matter.Body.setAngularVelocity(body, angularVelocity);
			return body;
		};

		const bodies = {
			models: makeBody(
				"models",
				modelCell,
				topLean.models.x,
				modelY,
				topLean.models.rotate,
				-0.35,
				-0.012,
			),
			harness: makeBody(
				"harness",
				harnessCell,
				harnessX,
				harnessY,
				topLean.harness.rotate,
				0.55,
				0.018,
			),
			agents: makeBody(
				"agents",
				agentCell,
				topLean.agents.x,
				agentY,
				topLean.agents.rotate,
				-0.45,
				-0.02,
			),
		};

		Matter.Composite.add(engine.world, [
			ground,
			leftWall,
			rightWall,
			bodies.models,
			bodies.harness,
			bodies.agents,
		]);

		const toState = (): TopPhysicsState => ({
			models: {
				rotate: (bodies.models.angle * 180) / Math.PI,
				x:
					bodies.models.position.x -
					xForStud(modelCell.xStud) -
					widthForStuds(modelCell.studs) / 2,
				y: bodies.models.position.y - TOTAL_H / 2,
			},
			harness: {
				rotate: (bodies.harness.angle * 180) / Math.PI,
				x:
					bodies.harness.position.x -
					xForStud(harnessCell.xStud) -
					widthForStuds(harnessCell.studs) / 2,
				y: bodies.harness.position.y - TOTAL_H / 2,
			},
			agents: {
				rotate: (bodies.agents.angle * 180) / Math.PI,
				x:
					bodies.agents.position.x -
					xForStud(agentCell.xStud) -
					widthForStuds(agentCell.studs) / 2,
				y: bodies.agents.position.y - TOTAL_H / 2,
			},
		});

		let last = performance.now();
		const start = last;
		const tick = (now: number) => {
			const delta = Math.min(now - last, 32);
			last = now;
			for (let elapsed = 0; elapsed < delta; elapsed += PHYSICS_STEP_MS) {
				Matter.Engine.update(engine, Math.min(PHYSICS_STEP_MS, delta - elapsed));
			}
			setTopPhysics(toState());

			if (now - start < 6500) {
				physicsFrame.current = requestAnimationFrame(tick);
			}
		};

		setTopPhysics(toState());
		physicsFrame.current = requestAnimationFrame(tick);

		return () => {
			if (physicsFrame.current !== null) {
				cancelAnimationFrame(physicsFrame.current);
				physicsFrame.current = null;
			}
			Matter.Composite.clear(engine.world, false);
			Matter.Engine.clear(engine);
		};
	}, [
		snapped,
		showDomainAgents,
		modelCell,
		harnessCell,
		agentCell,
		modelY,
		harnessX,
		harnessY,
		agentY,
		topLean.models.x,
		topLean.models.rotate,
		topLean.harness.rotate,
		topLean.agents.x,
		topLean.agents.rotate,
	]);

	const modelAnimate = topPhysics?.models ?? {
		rotate: topLean.models.rotate,
		x: topLean.models.x,
		y: modelY,
	};
	const harnessAnimate = topPhysics?.harness ?? {
		rotate: topLean.harness.rotate,
		x: harnessX,
		y: harnessY,
	};
	const agentAnimate = topPhysics?.agents ?? {
		rotate: topLean.agents.rotate,
		x: topLean.agents.x,
		y: agentY,
	};

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
						transition={snapped ? { duration: 0 } : topImpactTransition(modelCell.row)}
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
						transition={snapped ? { duration: 0 } : topImpactTransition(harnessCell.row)}
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
						transition={snapped ? { duration: 0 } : topImpactTransition(agentCell.row)}
					/>

					{FOUNDATION_BRICKS.map((cell, orderIdx) => {
						const isMonorepo = cell.brick.label === MONOREPO.label;
						const visible = isMonorepo ? showMonorepo : showFoundation;
						const appearDelay = isMonorepo ? 0 : 0.35 + 0.46 * orderIdx;
						const snapDelay = 0.08 + orderIdx * 0.075;
						const tiltDelay = foundationSettled
							? impactDelayForBrick(cell.brick.label, cell.row)
							: 0;

						return (
							<PlacedLegoBrick
								key={cell.brick.label}
								cell={cell}
								zIndex={zForRow(cell.row)}
								animate={{
									filter: snapped ? "blur(9px)" : "blur(0px)",
									opacity: visible && !snapped ? 1 : 0,
									rotate: snapped
										? 8 + orderIdx * 3
										: foundationTilt(cell.brick.label),
									scale: snapped ? 0.72 : 1,
									x: snapped ? 90 + orderIdx * 18 : 0,
									y:
										yForRow(cell.row) +
										(visible ? 0 : 36) +
										(snapped ? -46 - orderIdx * 9 : 0),
								}}
								transition={{
									duration: snapped ? 0.58 : FOUND_EASE.duration,
									ease: snapped ? "easeIn" : FOUND_EASE.ease,
									delay: snapped
										? snapDelay
										: visible
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
							filter: snapped ? "blur(9px)" : "blur(0px)",
							opacity: showFoundation && !snapped ? 1 : 0,
							rotate: showFoundation && foundationSettled ? 0 : 14,
							scale: snapped ? 0.72 : 1,
							x:
								xForStud(7) +
								(showFoundation ? 0 : 170) +
								(snapped ? 170 : 0),
							y:
								yForRow(8) -
								widthForStuds(SIDEWAYS_REVERT.studs) -
								REVERT_HEIGHT_BONUS +
								(showFoundation ? 0 : 36) +
								(snapped ? -96 : 0),
						}}
						transition={
							snapped
								? { duration: 0.58, ease: "easeIn", delay: 0.54 }
								: foundationSettled
								? REVERT_STRAIGHTEN
								: {
										...FOUND_EASE,
										delay: showFoundation ? REVERT_DELAY : 0,
							}
						}
					/>

					{DROPPED_AGENT_BRICKS.map(({ key, cell }, orderIdx) => {
						const drop = DOMAIN_DROP_TARGETS[key];

						return (
							<PlacedLegoBrick
								key={key}
								cell={cell}
								zIndex={30 + orderIdx}
								animate={{
									opacity: showDomainAgents ? 1 : 0,
									rotate: showDomainAgents
										? [
												drop.rotate * 0.35,
												drop.rotate * 1.12,
												drop.rotate,
											]
										: 0,
									x: drop.x,
									y: showDomainAgents
										? [drop.startY, drop.y + 10, drop.y - 3, drop.y]
										: drop.startY,
								}}
								transition={{
									duration: showDomainAgents ? 0.82 : 0.18,
									ease: showDomainAgents ? "easeOut" : "easeIn",
									delay: showDomainAgents ? drop.delay : 0,
								}}
							/>
						);
					})}
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
