"use client";

import { motion } from "framer-motion";
import {
	Bell,
	Bot,
	Boxes,
	Briefcase,
	Bug,
	Calendar,
	Cloud,
	Code,
	Compass,
	Cpu,
	Database,
	Eye,
	FileText,
	FlaskConical,
	Folder,
	GitBranch,
	GitCommitHorizontal,
	Hash,
	Inbox,
	Key,
	Layers,
	Link,
	Lock,
	Mail,
	Map,
	MessageCircle,
	Network,
	Package,
	Phone,
	RotateCcw,
	ScanText,
	Server,
	Settings,
	Shield,
	Tag,
	Target,
	Terminal,
	Workflow,
	Zap,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import {
	BLOCK_H,
	brickPath,
	GRID_W,
	LegoBrick,
	ROW_Y,
	STUD_H,
	TOTAL_H,
	studCenters,
	widthForStuds,
	xForStud,
	yForRow,
	type Brick,
	type PlacedBrick,
} from "./lego/LegoBrick";

const N_ROWS = 9;
const CONTAINER_H = (N_ROWS - 1) * ROW_Y + TOTAL_H;

const HARNESS: Brick = {
	label: "Coding harnesses",
	color: "#F5C518",
	text: "#1a1a1a",
};
const MODELS: Brick = {
	label: "Foundational models",
	color: "#0057A8",
	text: "#ffffff",
};
const REVERT: Brick = { label: "revert", color: "#D0121A", text: "#ffffff", icon: RotateCcw };
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
const MONOREPO: Brick = {
	label: "Monorepo",
	color: FOUNDATION_BASE_COLOR,
	text: "#ffffff",
};

type LeanedBrick = PlacedBrick & { rotate?: number };

const HARNESS_CELL: LeanedBrick = {
	brick: HARNESS,
	xStud: 3,
	row: 1,
	studs: 6,
	idx: 1,
	rotate: -1.4,
};
const MODELS_CELL: LeanedBrick = {
	brick: MODELS,
	xStud: 3,
	row: 2,
	studs: 6,
	idx: 2,
	rotate: -0.8,
};

const GHOST_BRICKS: LeanedBrick[] = [
	{ brick: COMMIT_HISTORY, xStud: 3, row: 3, studs: 4, idx: 11, rotate: -0.7 },
	{ brick: TESTS, xStud: 4, row: 4, studs: 4, idx: 12, rotate: -0.55 },
	{ brick: CI_CD, xStud: 2, row: 5, studs: 3, idx: 13, rotate: -0.4 },
	{ brick: REVIEW, xStud: 3, row: 6, studs: 3, idx: 14, rotate: 0.5 },
	{ brick: LINTER, xStud: 4, row: 7, studs: 2, idx: 17, rotate: -0.3 },
	{ brick: MONOREPO, xStud: 3, row: 8, studs: 6, idx: 15, rotate: 0 },
];

const SIDEWAYS_REVERT: LeanedBrick = {
	brick: REVERT,
	xStud: 7,
	row: 4,
	studs: 2,
	idx: 10,
};

type AgentTry = {
	label: string;
	color: string;
	text: string;
	studs: number;
	xStud: number;
	idx: number;
};

// Each "agent" is a different brick: distinct size, color, and target attach
// position. None of them fit — they all bounce off the harness because the
// stack itself has no foundation.
const AGENT_TRIES: AgentTry[] = [
	{ label: "Sales agents", color: "#2EA8A8", text: "#ffffff", studs: 5, xStud: 4, idx: 200 },
	{ label: "Support agents", color: "#E07B27", text: "#ffffff", studs: 4, xStud: 5, idx: 201 },
	{ label: "Marketing agents", color: "#D94F9F", text: "#ffffff", studs: 6, xStud: 3, idx: 202 },
	{ label: "Finance agents", color: "#2E8B3D", text: "#ffffff", studs: 3, xStud: 2, idx: 203 },
];

const SHADOW = "drop-shadow(0 5px 6px rgba(0,0,0,0.4))";
const GHOST_STROKE = "rgba(255,255,255,0.42)";
const GHOST_TEXT = "rgba(255,255,255,0.55)";
const REVERT_HEIGHT_BONUS = 12;
const HOVER_LIFT = -34;
const ENTRY_LIFT = HOVER_LIFT - 30;

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;':,.<>?/~`abcdefghijklmnopqrstuvwxyz0123456789";
const SCRAMBLE_ICONS: LucideIcon[] = [
	Bell,
	Bot,
	Boxes,
	Briefcase,
	Bug,
	Calendar,
	Cloud,
	Code,
	Compass,
	Cpu,
	Database,
	FileText,
	Folder,
	GitBranch,
	Hash,
	Inbox,
	Key,
	Layers,
	Link,
	Lock,
	Mail,
	Map,
	MessageCircle,
	Network,
	Package,
	Phone,
	Server,
	Settings,
	Shield,
	Tag,
	Target,
	Terminal,
	Zap,
];

function randomChar() {
	return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function scramble(template: string) {
	// Preserve spaces and slashes so labels keep their shape; replace everything
	// else with random characters. Keeps the line length stable (no layout shift).
	let out = "";
	for (const ch of template) {
		out += ch === " " || ch === "/" ? ch : randomChar();
	}
	return out;
}

export function EmptyTowerSlide() {
	return (
		<DeckSlide>
			<EmptyTowerBody />
		</DeckSlide>
	);
}

function EmptyTowerBody() {
	const [agentIdx, setAgentIdx] = useState(0);
	const variant = AGENT_TRIES[agentIdx];
	const variantBrick: Brick = useMemo(
		() => ({ label: variant.label, color: variant.color, text: variant.text }),
		[variant.label, variant.color, variant.text],
	);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<motion.div
					className="relative"
					style={{
						width: GRID_W,
						height: CONTAINER_H,
						transformOrigin: "50% 100%",
					}}
					animate={{
						rotate: [0, 0.5, -0.4, 0.3, 0],
						y: [0, 2, -1, 1, 0],
					}}
					transition={{
						duration: 6,
						ease: "easeInOut",
						repeat: Infinity,
					}}
				>
					{GHOST_BRICKS.map((cell) => (
						<GhostBrickAt key={cell.brick.label} cell={cell} />
					))}
					<GhostSidewaysBrickAt cell={SIDEWAYS_REVERT} />

					<StaticBrick cell={HARNESS_CELL} />
					<StaticBrick cell={MODELS_CELL} />

					{/* Cycling agent — fades in above the harness, descends to almost
					    attach, bounces, then fades out. Different size/color/position
					    each cycle. */}
					<motion.div
						key={agentIdx}
						className="absolute"
						style={{
							left: xForStud(variant.xStud),
							top: yForRow(0),
							width: widthForStuds(variant.studs),
							filter: SHADOW,
							zIndex: N_ROWS,
						}}
						initial={{ opacity: 0, y: ENTRY_LIFT }}
						animate={{
							opacity: [0, 1, 1, 1, 1, 1, 0],
							y: [
								ENTRY_LIFT,
								HOVER_LIFT,
								HOVER_LIFT,
								0,
								0,
								HOVER_LIFT,
								ENTRY_LIFT,
							],
						}}
						transition={{
							duration: 2.6,
							times: [0, 0.15, 0.4, 0.55, 0.62, 0.82, 1.0],
							ease: "easeInOut",
						}}
						onAnimationComplete={() =>
							setAgentIdx((i) => (i + 1) % AGENT_TRIES.length)
						}
					>
						<LegoBrick
							brick={variantBrick}
							idx={variant.idx}
							studs={variant.studs}
						/>
					</motion.div>
				</motion.div>
			</div>

			<Notes>
				Different agents for different domains — sales, support, marketing,
				finance — each tries to land on the same coding stack and bounces
				off. The substrate they need isn&apos;t there. The ghost foundation
				is just noise: scrambled labels, scrambled icons. No commit history,
				no tests, no CI/CD, no review, no monorepo, no revert.
			</Notes>
		</>
	);
}

function StaticBrick({ cell }: { cell: LeanedBrick }) {
	return (
		<div
			className="absolute top-0 left-0"
			style={{
				width: widthForStuds(cell.studs),
				filter: SHADOW,
				transform: `translate(${xForStud(cell.xStud)}px, ${yForRow(cell.row)}px) rotate(${cell.rotate ?? 0}deg)`,
				transformOrigin: "50% 100%",
				zIndex: N_ROWS - cell.row,
			}}
		>
			<LegoBrick brick={cell.brick} idx={cell.idx} studs={cell.studs} />
		</div>
	);
}

function ScrambledLabel({ template }: { template: string }) {
	const [text, setText] = useState(() => scramble(template));
	useEffect(() => {
		// Jitter the period so each ghost label scrambles on its own rhythm
		// rather than the whole tower flickering in lockstep.
		const base = 90 + Math.floor(Math.random() * 60);
		const t = setInterval(() => setText(scramble(template)), base);
		return () => clearInterval(t);
	}, [template]);
	return <>{text}</>;
}

function ScramblingIcon({ size = 16 }: { size?: number }) {
	const [idx, setIdx] = useState(() =>
		Math.floor(Math.random() * SCRAMBLE_ICONS.length),
	);
	useEffect(() => {
		const base = 140 + Math.floor(Math.random() * 100);
		const t = setInterval(
			() =>
				setIdx(
					(i) =>
						(i +
							1 +
							Math.floor(Math.random() * (SCRAMBLE_ICONS.length - 1))) %
						SCRAMBLE_ICONS.length,
				),
			base,
		);
		return () => clearInterval(t);
	}, []);
	const Icon = SCRAMBLE_ICONS[idx];
	return (
		<Icon
			aria-hidden
			size={size}
			strokeWidth={2.6}
			className="shrink-0"
		/>
	);
}

function GhostBrickAt({ cell }: { cell: LeanedBrick }) {
	const width = widthForStuds(cell.studs);
	const centers = studCenters(cell.studs);
	const path = brickPath(width, centers);

	return (
		<motion.div
			className="absolute top-0 left-0"
			style={{
				width,
				height: TOTAL_H,
				transform: `translate(${xForStud(cell.xStud)}px, ${yForRow(cell.row)}px) rotate(${cell.rotate ?? 0}deg)`,
				transformOrigin: "50% 100%",
				zIndex: 0,
			}}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: 0.6,
				ease: "easeOut",
				delay: 0.2 + cell.row * 0.06,
			}}
		>
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
			<div
				className="absolute inset-x-0 flex items-center justify-center px-2 text-center"
				style={{ top: STUD_H, height: BLOCK_H }}
			>
				<span
					className="inline-flex items-center gap-2 font-mono font-medium uppercase leading-none tracking-[0.06em]"
					style={{ color: GHOST_TEXT, fontSize: 16 }}
				>
					<ScramblingIcon />
					<ScrambledLabel template={cell.brick.label} />
				</span>
			</div>
		</motion.div>
	);
}

function GhostSidewaysBrickAt({ cell }: { cell: LeanedBrick }) {
	const width = widthForStuds(cell.studs);
	const verticalSize = width + REVERT_HEIGHT_BONUS;
	const verticalScale = verticalSize / width;
	const centers = studCenters(cell.studs);
	const path = brickPath(width, centers);

	return (
		<motion.div
			className="absolute top-0 left-0"
			style={{
				width: TOTAL_H,
				height: verticalSize,
				transform: `translate(${xForStud(cell.xStud)}px, ${yForRow(8) - verticalSize}px)`,
				zIndex: 0,
			}}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: 0.6,
				ease: "easeOut",
				delay: 0.75,
			}}
		>
			<div
				className="absolute left-0"
				style={{
					top: verticalSize,
					transform: `rotate(-90deg) scaleX(${verticalScale})`,
					transformOrigin: "top left",
				}}
			>
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
						strokeWidth="1.25"
						strokeDasharray="4 5"
					/>
				</svg>
				<div
					className="absolute inset-x-0 flex items-center justify-center px-2 text-center"
					style={{ top: STUD_H, height: BLOCK_H }}
				>
					<span
						className="inline-flex items-center gap-2 font-mono font-medium uppercase leading-none tracking-[0.06em]"
						style={{ color: GHOST_TEXT, fontSize: 16 }}
					>
						<ScramblingIcon />
						<ScrambledLabel template={cell.brick.label} />
					</span>
				</div>
			</div>
		</motion.div>
	);
}
