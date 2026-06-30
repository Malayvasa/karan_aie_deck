"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Undo2 } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

const C = {
	textPrimary: "#c9d1d9",
	textSecondary: "#8b949e",
	textMuted: "#6e7681",
	canvas: "#0d1117",
	terminal: "#0a0c10",
	border: "#30363d",
	green: "#7ee787",
	blue: "#79c0ff",
	purple: "#d2a8ff",
	orange: "#ffa657",
	danger: "#f85149",
	dangerSoft: "rgba(248,81,73,0.18)",
	success: "#3fb950",
	successSoft: "rgba(63,185,80,0.18)",
	addBg: "rgba(63, 185, 80, 0.15)",
	delBg: "rgba(255, 123, 114, 0.15)",
} as const;

function curve(
	px: number,
	py: number,
	qx: number,
	qy: number,
): string {
	const midX = (px + qx) / 2;
	return `M ${px} ${py} C ${midX} ${py}, ${midX} ${qy}, ${qx} ${qy}`;
}

type BranchCommit = { pos: number; hash: string };

type Branch = {
	id: string;
	color: string;
	lane: number;
	forkAt: number;
	mergeAt: number;
	commits: BranchCommit[];
};

// One branch only — the feature whose merge breaks prod. Everything else on
// the canvas exists to tell the bad-merge → revert story.
const BRANCHES: Branch[] = [
	{
		id: "feat/eu-vat-grouping",
		color: C.purple,
		lane: 1,
		forkAt: 14,
		mergeAt: 56,
		commits: [
			{ pos: 22, hash: "a1b2c3d" },
			{ pos: 32, hash: "b2c3d4e" },
			{ pos: 42, hash: "c3d4e5f" },
			{ pos: 50, hash: "d4e5f6a" },
		],
	},
];

type MainKind = "normal" | "merge" | "bad" | "revert";

type MainCommit = {
	pos: number;
	hash: string;
	kind: MainKind;
};

const BAD_HASH = "d12fa00";
const REVERT_HASH = "7f8e3c4";

// Two quiet commits, then the bad merge, then the revert. Nothing after —
// the story ends with prod restored. Bad@56, revert@78 = ~22 positions
// (~225px) so the arc reads clearly.
const MAIN_COMMITS: MainCommit[] = [
	{ pos: 6, hash: "9e8f4d1", kind: "normal" },
	{ pos: 14, hash: "f1e9a04", kind: "normal" },
	{ pos: 56, hash: BAD_HASH, kind: "bad" },
	{ pos: 78, hash: REVERT_HASH, kind: "revert" },
];

// Compact diff — 7 content lines. The deletions are the merged feature, the
// addition is the breadcrumb. Reads as a real revert.
type DiffLine = { text: string; kind?: "add" | "del" | "comment" };

const REVERT_DIFF: DiffLine[] = [
	{ text: "export function process(invoice) {" },
	{ text: "  validate(invoice);" },
	{ text: "  if (invoice.region === 'EU') {", kind: "del" },
	{ text: "    groupByVATRate(invoice);", kind: "del" },
	{ text: "  }", kind: "del" },
	{ text: "  // Revert d12fa00 — see #1827", kind: "add" },
	{ text: "  return finalize(invoice);" },
	{ text: "}" },
];

// Layout
const SVG_W = 1140;
const SVG_H = 420;
const PAD_X = 56;
const INNER_W = SVG_W - PAD_X * 2;
const MAIN_Y = 250;
const LANE_Y: Record<number, number> = {
	0: MAIN_Y,
	1: 312,
};
const TIME_AXIS_Y = 380;

// Popup geometry — anchored above the revert commit.
const POPUP_TOP = 18;
const POPUP_W = 340;
const POPUP_HEADER_H = 24;
const POPUP_LINE_H = 16;
const POPUP_BODY_PAD = 10;
const POPUP_BODY_H = REVERT_DIFF.length * POPUP_LINE_H + POPUP_BODY_PAD * 2;
const POPUP_H = POPUP_HEADER_H + POPUP_BODY_H;

// Pacing (seconds).
const GRAPH_BUILD_END = 2.2;
const INCIDENT_AT = GRAPH_BUILD_END + 0.3;
const INCIDENT_HOLD = 1.1;
const REVERT_AT = INCIDENT_AT + INCIDENT_HOLD;
const POPUP_AT = REVERT_AT + 0.35;
const PROD_GREEN_AT = POPUP_AT + 1.4;
const TOTAL = PROD_GREEN_AT + 2.4;
const LOOP_GAP = 1.4;

const xFor = (pos: number) => PAD_X + (pos / 100) * INNER_W;
const yFor = (lane: number) => LANE_Y[lane];

export function ReversibilityInCodeSlide() {
	return (
		<DeckSlide primitive="reversibility">
			<Body />
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);
	const restoreX = xFor(14); // f1e9a04 — the last known-good state
	const badX = xFor(56);
	const revertX = xFor(78);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="relative"
					style={{ width: SVG_W, height: SVG_H }}
				>
					<svg
						width={SVG_W}
						height={SVG_H}
						viewBox={`0 0 ${SVG_W} ${SVG_H}`}
						style={{
							position: "absolute",
							inset: 0,
							overflow: "visible",
						}}
					>
						<Graph active={isSlideActive} />
						<RevertArc
							active={isSlideActive}
							restoreX={restoreX}
							revertX={revertX}
						/>
					</svg>

					<ProdBadge
						active={isSlideActive}
						badX={badX}
						restoreX={restoreX}
					/>
					<RevertPopup active={isSlideActive} revertX={revertX} />
				</div>
			</div>

			<Notes>
				Even after a bad commit ships and breaks prod, one command rewinds
				it. `git revert` creates a new commit that inverts the old one.
				The bad commit stays in history — nothing is erased. The agent
				can ship because every action has a road back.
			</Notes>
		</>
	);
}

/* ============================== Graph ================================ */

function Graph({ active }: { active: boolean }) {
	return (
		<>
			{/* Trunk */}
			<motion.g
				initial={{ opacity: 0 }}
				animate={active ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 0.3, delay: active ? 0.35 : 0 }}
			>
				<text
					x={PAD_X + 8}
					y={MAIN_Y - 12}
					textAnchor="start"
					fontSize={11}
					fontFamily="var(--font-jetbrains-mono), monospace"
					fill={C.green}
					fontWeight={600}
				>
					main
				</text>

				<motion.line
					x1={PAD_X}
					y1={MAIN_Y}
					x2={PAD_X + INNER_W}
					y2={MAIN_Y}
					stroke={C.green}
					strokeWidth={2}
					initial={{ pathLength: 0 }}
					animate={active ? { pathLength: 1 } : { pathLength: 0 }}
					transition={{
						duration: 0.7,
						ease: [0.22, 1, 0.36, 1],
						delay: active ? 0.35 : 0,
					}}
				/>

				{MAIN_COMMITS.map((c, i) => (
					<MainCommitDot
						key={c.hash}
						commit={c}
						idx={i}
						active={active}
					/>
				))}
			</motion.g>

			{BRANCHES.map((b, bi) => (
				<BranchG key={b.id} branch={b} bi={bi} active={active} />
			))}

			{/* Time axis */}
			<motion.line
				x1={PAD_X}
				y1={TIME_AXIS_Y}
				x2={PAD_X + INNER_W}
				y2={TIME_AXIS_Y}
				stroke={C.border}
				strokeWidth={1}
				initial={{ pathLength: 0 }}
				animate={active ? { pathLength: 1 } : { pathLength: 0 }}
				transition={{
					duration: 0.5,
					delay: active ? 0.3 : 0,
				}}
			/>
			{[
				{ pos: 6, label: "6m ago" },
				{ pos: 56, label: "today · 2:14pm" },
				{ pos: 78, label: "2:31pm" },
			].map((t, i) => (
				<motion.g
					key={t.label}
					initial={{ opacity: 0 }}
					animate={active ? { opacity: 1 } : { opacity: 0 }}
					transition={{
						duration: 0.25,
						delay: active ? 0.45 + i * 0.04 : 0,
					}}
				>
					<line
						x1={xFor(t.pos)}
						y1={TIME_AXIS_Y - 4}
						x2={xFor(t.pos)}
						y2={TIME_AXIS_Y + 4}
						stroke={C.textMuted}
						strokeWidth={1}
					/>
					<text
						x={xFor(t.pos)}
						y={TIME_AXIS_Y + 17}
						textAnchor="middle"
						fontSize={10}
						fontFamily="var(--font-jetbrains-mono), monospace"
						fill={C.textMuted}
					>
						{t.label}
					</text>
				</motion.g>
			))}
		</>
	);
}

function BranchG({
	branch: b,
	bi,
	active,
}: {
	branch: Branch;
	bi: number;
	active: boolean;
}) {
	const by = yFor(b.lane);
	const firstX = xFor(b.commits[0].pos);
	const lastX = xFor(b.commits[b.commits.length - 1].pos);
	const forkX = xFor(b.forkAt);
	const mergeX = xFor(b.mergeAt);
	const forkPath = curve(forkX, MAIN_Y, firstX, by);
	const horizPath = `M ${firstX} ${by} L ${lastX} ${by}`;
	const mergePath = curve(lastX, by, mergeX, MAIN_Y);
	const baseDelay = 0.55 + bi * 0.2;

	// After the revert lands, the branch's contribution to main is undone.
	// Drop it visually — fade to near-invisible so the timeline reads as
	// "the bad merge is the only remaining trace, and even that is greyed."
	const DIMMED = 0.12;
	const dimKeys = [1, 1, DIMMED, DIMMED, 1];
	const dimTimes = [
		0,
		Math.min(REVERT_AT / TOTAL, 0.999),
		Math.min((REVERT_AT + 0.45) / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];

	return (
		<motion.g
			initial={{ opacity: 0 }}
			animate={active ? { opacity: 1 } : { opacity: 0 }}
			transition={{
				duration: 0.3,
				delay: active ? baseDelay : 0,
			}}
		>
			<motion.g
				animate={active ? { opacity: dimKeys } : { opacity: 1 }}
				transition={{
					duration: TOTAL,
					times: dimTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				<motion.path
					d={forkPath}
					fill="none"
					stroke={b.color}
					strokeWidth={1.75}
					initial={{ pathLength: 0 }}
					animate={active ? { pathLength: 1 } : { pathLength: 0 }}
					transition={{
						duration: 0.5,
						ease: [0.22, 1, 0.36, 1],
						delay: active ? baseDelay : 0,
					}}
				/>
				<motion.path
					d={horizPath}
					fill="none"
					stroke={b.color}
					strokeWidth={1.75}
					initial={{ pathLength: 0 }}
					animate={active ? { pathLength: 1 } : { pathLength: 0 }}
					transition={{
						duration: 0.4,
						ease: [0.22, 1, 0.36, 1],
						delay: active ? baseDelay + 0.35 : 0,
					}}
				/>
				<motion.path
					d={mergePath}
					fill="none"
					stroke={b.color}
					strokeWidth={1.75}
					initial={{ pathLength: 0 }}
					animate={active ? { pathLength: 1 } : { pathLength: 0 }}
					transition={{
						duration: 0.5,
						ease: [0.22, 1, 0.36, 1],
						delay: active ? baseDelay + 0.65 : 0,
					}}
				/>

				<text
					x={firstX}
					y={by + 18}
					fontSize={10}
					fontFamily="var(--font-jetbrains-mono), monospace"
					fill={b.color}
					fontWeight={600}
				>
					{b.id}
				</text>

				{b.commits.map((c, ci) => (
					<motion.circle
						key={c.hash}
						cx={xFor(c.pos)}
						cy={by}
						r={4.5}
						fill={b.color}
						stroke={C.canvas}
						strokeWidth={2}
						initial={{ opacity: 0, scale: 0.4 }}
						animate={
							active
								? { opacity: 1, scale: 1 }
								: { opacity: 0, scale: 0.4 }
						}
						transition={{
							duration: 0.2,
							ease: [0.22, 1, 0.36, 1],
							delay: active ? baseDelay + 0.45 + ci * 0.06 : 0,
						}}
						style={{ transformOrigin: `${xFor(c.pos)}px ${by}px` }}
					/>
				))}
			</motion.g>
		</motion.g>
	);
}

/* ============================ Commit dots ============================ */

function MainCommitDot({
	commit,
	idx,
	active,
}: {
	commit: MainCommit;
	idx: number;
	active: boolean;
}) {
	const cx = xFor(commit.pos);
	const baseDelay = 0.5 + idx * 0.05;

	if (commit.kind === "bad") {
		return <BadCommit cx={cx} hash={commit.hash} delay={baseDelay} active={active} />;
	}
	if (commit.kind === "revert") {
		return (
			<RevertCommit
				cx={cx}
				hash={commit.hash}
				active={active}
			/>
		);
	}

	const isMerge = commit.kind === "merge";
	return (
		<motion.g
			initial={{ opacity: 0, scale: 0.4 }}
			animate={
				active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }
			}
			transition={{
				duration: 0.25,
				ease: [0.22, 1, 0.36, 1],
				delay: active ? baseDelay : 0,
			}}
			style={{ transformOrigin: `${cx}px ${MAIN_Y}px` }}
		>
			{isMerge ? (
				<>
					<circle
						cx={cx}
						cy={MAIN_Y}
						r={6.5}
						fill="none"
						stroke={C.green}
						strokeWidth={2}
					/>
					<circle cx={cx} cy={MAIN_Y} r={2} fill={C.green} />
				</>
			) : (
				<circle
					cx={cx}
					cy={MAIN_Y}
					r={5.5}
					fill={C.green}
					stroke={C.canvas}
					strokeWidth={2}
				/>
			)}
			<text
				x={cx}
				y={MAIN_Y - 12}
				textAnchor="middle"
				fontSize={9}
				fontFamily="var(--font-jetbrains-mono), monospace"
				fill={C.textMuted}
				fontWeight={400}
			>
				{commit.hash}
			</text>
		</motion.g>
	);
}

function BadCommit({
	cx,
	hash,
	delay,
	active,
}: {
	cx: number;
	hash: string;
	delay: number;
	active: boolean;
}) {
	// Three color phases looped: green → danger → muted (post-revert) → green.
	const ringKeys = [C.green, C.green, C.danger, C.danger, C.textMuted, C.textMuted, C.green];
	const ringTimes = [
		0,
		Math.min(INCIDENT_AT / TOTAL, 0.999),
		Math.min((INCIDENT_AT + 0.3) / TOTAL, 0.999),
		Math.min(REVERT_AT / TOTAL, 0.999),
		Math.min((REVERT_AT + 0.45) / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];

	return (
		<motion.g
			initial={{ opacity: 0, scale: 0.4 }}
			animate={
				active
					? { opacity: 1, scale: 1 }
					: { opacity: 0, scale: 0.4 }
			}
			transition={{
				duration: 0.25,
				ease: [0.22, 1, 0.36, 1],
				delay: active ? delay : 0,
			}}
			style={{ transformOrigin: `${cx}px ${MAIN_Y}px` }}
		>
			{/* Danger halo */}
			<motion.circle
				cx={cx}
				cy={MAIN_Y}
				r={14}
				fill={C.dangerSoft}
				stroke="none"
				initial={{ opacity: 0 }}
				animate={
					active
						? { opacity: [0, 0, 1, 1, 0, 0, 0] }
						: { opacity: 0 }
				}
				transition={{
					duration: TOTAL,
					times: ringTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			/>
			{/* Merge ring */}
			<motion.circle
				cx={cx}
				cy={MAIN_Y}
				r={6.5}
				fill="none"
				strokeWidth={2}
				initial={{ stroke: C.green }}
				animate={active ? { stroke: ringKeys } : { stroke: C.green }}
				transition={{
					duration: TOTAL,
					times: ringTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			/>
			<motion.circle
				cx={cx}
				cy={MAIN_Y}
				r={2}
				initial={{ fill: C.green }}
				animate={active ? { fill: ringKeys } : { fill: C.green }}
				transition={{
					duration: TOTAL,
					times: ringTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			/>
			<motion.text
				x={cx}
				y={MAIN_Y - 12}
				textAnchor="middle"
				fontSize={9}
				fontFamily="var(--font-jetbrains-mono), monospace"
				fontWeight={500}
				initial={{ fill: C.textMuted }}
				animate={active ? { fill: ringKeys } : { fill: C.textMuted }}
				transition={{
					duration: TOTAL,
					times: ringTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				{hash}
			</motion.text>
		</motion.g>
	);
}

function RevertCommit({
	cx,
	hash,
	active,
}: {
	cx: number;
	hash: string;
	active: boolean;
}) {
	// Hidden until REVERT_AT, then visible for the rest of the loop.
	const opacityKeys = [0, 0, 1, 1, 0];
	const opacityTimes = [
		0,
		Math.min(REVERT_AT / TOTAL, 0.999),
		Math.min((REVERT_AT + 0.4) / TOTAL, 0.999),
		Math.min((TOTAL - 0.1) / TOTAL, 0.999),
		1,
	];

	return (
		<motion.g
			initial={{ opacity: 0 }}
			animate={
				active ? { opacity: opacityKeys } : { opacity: 0 }
			}
			transition={{
				duration: TOTAL,
				times: opacityTimes,
				ease: "linear",
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<circle
				cx={cx}
				cy={MAIN_Y}
				r={7.5}
				fill={C.canvas}
				stroke={C.orange}
				strokeWidth={2}
			/>
			<circle cx={cx} cy={MAIN_Y} r={3.2} fill={C.orange} />

			<text
				x={cx}
				y={MAIN_Y - 14}
				textAnchor="middle"
				fontSize={9}
				fontFamily="var(--font-jetbrains-mono), monospace"
				fill={C.orange}
				fontWeight={600}
			>
				{hash}
			</text>

			<foreignObject
				x={cx - 80}
				y={MAIN_Y + 12}
				width={160}
				height={22}
				style={{ overflow: "visible" }}
			>
				<div
					className="flex items-center justify-center gap-1"
					style={{
						fontFamily: "var(--font-jetbrains-mono), monospace",
						fontSize: 10,
						color: C.orange,
						fontWeight: 600,
						whiteSpace: "nowrap",
					}}
				>
					<Undo2 size={11} strokeWidth={2.4} />
					Revert {BAD_HASH}
				</div>
			</foreignObject>
		</motion.g>
	);
}

/* ============================ Revert arc ============================= */

function RevertArc({
	active,
	restoreX,
	revertX,
}: {
	active: boolean;
	restoreX: number;
	revertX: number;
}) {
	const midX = (restoreX + revertX) / 2;
	// Arc spans the full restore→revert distance and bows up between the
	// trunk (y=250) and the popup bottom (~y=160). Peak around y=190.
	const peakY = 192;
	const startX = revertX;
	const startY = MAIN_Y - 9;
	const endX = restoreX + 9;
	const endY = MAIN_Y - 9;
	const path = `M ${startX} ${startY} C ${midX + 40} ${peakY}, ${midX - 40} ${peakY}, ${endX} ${endY}`;

	// Arrowhead direction at the endpoint: roughly horizontal pointing left
	// into the bad commit.
	const arrowSize = 5;

	const opacityKeys = [0, 0, 1, 1, 0];
	const opacityTimes = [
		0,
		Math.min(REVERT_AT / TOTAL, 0.999),
		Math.min((REVERT_AT + 0.55) / TOTAL, 0.999),
		Math.min((TOTAL - 0.1) / TOTAL, 0.999),
		1,
	];
	const lengthKeys = [0, 0, 1, 1, 0];

	return (
		<motion.g
			initial={{ opacity: 0 }}
			animate={active ? { opacity: opacityKeys } : { opacity: 0 }}
			transition={{
				duration: TOTAL,
				times: opacityTimes,
				ease: "linear",
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<motion.path
				d={path}
				fill="none"
				stroke={C.orange}
				strokeWidth={1.5}
				strokeDasharray="4 4"
				strokeLinecap="round"
				initial={{ pathLength: 0 }}
				animate={active ? { pathLength: lengthKeys } : { pathLength: 0 }}
				transition={{
					duration: TOTAL,
					times: opacityTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			/>
			<path
				d={`M ${endX + arrowSize} ${endY - arrowSize} L ${endX} ${endY} L ${endX + arrowSize} ${endY + arrowSize}`}
				fill="none"
				stroke={C.orange}
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</motion.g>
	);
}

/* ============================ Prod badge ============================= */

function ProdBadge({
	active,
	badX,
	restoreX,
}: {
	active: boolean;
	badX: number;
	restoreX: number;
}) {
	const BADGE_W = 150;
	const top = MAIN_Y - 84;
	const left = badX - BADGE_W / 2;
	// When prod recovers, the badge slides from above the bad commit to
	// above the restored state (f1e9a04). The slide happens via translate x.
	const slideOffset = restoreX - badX;

	const opacityKeys = [0, 0, 1, 1, 1, 0];
	const opacityTimes = [
		0,
		Math.min(INCIDENT_AT / TOTAL, 0.999),
		Math.min((INCIDENT_AT + 0.3) / TOTAL, 0.999),
		Math.min(PROD_GREEN_AT / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];

	// Slide x: stays at 0 until PROD_GREEN_AT, then translates to slideOffset
	// over ~500ms and holds. Returns to 0 at loop reset.
	const SLIDE_START = PROD_GREEN_AT;
	const SLIDE_END = PROD_GREEN_AT + 0.5;
	const slideKeys = [0, 0, 0, slideOffset, slideOffset, 0];
	const slideTimes = [
		0,
		Math.min((SLIDE_START - 0.05) / TOTAL, 0.999),
		Math.min(SLIDE_START / TOTAL, 0.999),
		Math.min(SLIDE_END / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];

	// Color flip happens AFTER the badge arrives — slide first (still red),
	// then on arrival flip to green. Both bg/fg/border and icon/text use
	// matching timing so the whole badge changes as one beat.
	const FLIP_START = SLIDE_END;
	const FLIP_END = SLIDE_END + 0.12;
	const toneTimes = [
		0,
		Math.min((FLIP_START - 0.001) / TOTAL, 0.999),
		Math.min(FLIP_START / TOTAL, 0.999),
		Math.min(FLIP_END / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];
	const tone = {
		bg: [C.dangerSoft, C.dangerSoft, C.dangerSoft, C.successSoft, C.successSoft, C.dangerSoft],
		fg: [C.danger, C.danger, C.danger, C.success, C.success, C.danger],
		border: [
			"rgba(248,81,73,0.5)",
			"rgba(248,81,73,0.5)",
			"rgba(248,81,73,0.5)",
			"rgba(63,185,80,0.5)",
			"rgba(63,185,80,0.5)",
			"rgba(248,81,73,0.5)",
		],
	};

	return (
		<motion.div
			className="absolute pointer-events-none"
			style={{ top, left, width: BADGE_W }}
			initial={{ opacity: 0, y: -4, x: 0 }}
			animate={
				active
					? { opacity: opacityKeys, y: 0, x: slideKeys }
					: { opacity: 0, y: -4, x: 0 }
			}
			transition={{
				duration: TOTAL,
				times: opacityTimes,
				ease: "linear",
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
				x: {
					duration: TOTAL,
					times: slideTimes,
					ease: [0.22, 1, 0.36, 1],
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				},
			}}
		>
			<motion.div
				className="flex items-center gap-1.5 rounded-md px-2 py-1"
				style={{
					fontFamily: "var(--font-jetbrains-mono), monospace",
					fontSize: 10.5,
					fontWeight: 600,
				}}
				initial={{
					background: tone.bg[0],
					color: tone.fg[0],
					border: `1px solid ${tone.border[0]}`,
				}}
				animate={
					active
						? {
								background: tone.bg,
								color: tone.fg,
								border: tone.border.map(
									(b) => `1px solid ${b}`,
								),
							}
						: {
								background: tone.bg[0],
								color: tone.fg[0],
								border: `1px solid ${tone.border[0]}`,
							}
				}
				transition={{
					duration: TOTAL,
					times: toneTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				<ProdIcon active={active} />
				<ProdText active={active} />
			</motion.div>
			<svg
				className="absolute"
				style={{
					left: BADGE_W / 2 - 1,
					top: 26,
					width: 2,
					height: 42,
					overflow: "visible",
				}}
			>
				<motion.line
					x1={1}
					y1={0}
					x2={1}
					y2={40}
					strokeWidth={1.4}
					strokeDasharray="2 3"
					initial={{ stroke: C.danger }}
					animate={
						active
							? { stroke: tone.fg }
							: { stroke: C.danger }
					}
					transition={{
						duration: TOTAL,
						times: toneTimes,
						ease: "linear",
						repeat: Infinity,
						repeatDelay: LOOP_GAP,
					}}
				/>
			</svg>
		</motion.div>
	);
}

function ProdIcon({ active }: { active: boolean }) {
	// Crossfade fires AFTER the badge slides over — matches ProdBadge's
	// FLIP_START / FLIP_END so the icon and text swap in lockstep with the
	// background tone.
	const FLIP_START = PROD_GREEN_AT + 0.5;
	const FLIP_END = PROD_GREEN_AT + 0.62;
	const showRedKeys = [1, 1, 0, 0, 1];
	const showGreenKeys = [0, 0, 1, 1, 0];
	const times = [
		0,
		Math.min(FLIP_START / TOTAL, 0.999),
		Math.min(FLIP_END / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];
	return (
		<div className="relative" style={{ width: 12, height: 12 }}>
			<motion.div
				className="absolute inset-0"
				initial={{ opacity: 1 }}
				animate={active ? { opacity: showRedKeys } : { opacity: 1 }}
				transition={{
					duration: TOTAL,
					times,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				<AlertTriangle size={12} strokeWidth={2.4} />
			</motion.div>
			<motion.div
				className="absolute inset-0"
				initial={{ opacity: 0 }}
				animate={active ? { opacity: showGreenKeys } : { opacity: 0 }}
				transition={{
					duration: TOTAL,
					times,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				<CheckCircle2 size={12} strokeWidth={2.4} />
			</motion.div>
		</div>
	);
}

function ProdText({ active }: { active: boolean }) {
	// Crossfade fires AFTER the badge slides over — matches ProdBadge's
	// FLIP_START / FLIP_END so the icon and text swap in lockstep with the
	// background tone.
	const FLIP_START = PROD_GREEN_AT + 0.5;
	const FLIP_END = PROD_GREEN_AT + 0.62;
	const showRedKeys = [1, 1, 0, 0, 1];
	const showGreenKeys = [0, 0, 1, 1, 0];
	const times = [
		0,
		Math.min(FLIP_START / TOTAL, 0.999),
		Math.min(FLIP_END / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];
	return (
		<div className="relative flex-1" style={{ height: 14 }}>
			<motion.span
				className="absolute inset-0 whitespace-nowrap"
				initial={{ opacity: 1 }}
				animate={active ? { opacity: showRedKeys } : { opacity: 1 }}
				transition={{
					duration: TOTAL,
					times,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				prod · errors 12% ↑
			</motion.span>
			<motion.span
				className="absolute inset-0 whitespace-nowrap"
				initial={{ opacity: 0 }}
				animate={active ? { opacity: showGreenKeys } : { opacity: 0 }}
				transition={{
					duration: TOTAL,
					times,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				prod · errors 0.1% ✓
			</motion.span>
		</div>
	);
}

/* ============================ Code popup ============================= */

function RevertPopup({
	active,
	revertX,
}: {
	active: boolean;
	revertX: number;
}) {
	const popupLeft = Math.max(
		16,
		Math.min(SVG_W - POPUP_W - 16, revertX - POPUP_W / 2),
	);

	const opacityKeys = [0, 0, 1, 1, 0];
	const opacityTimes = [
		0,
		Math.min(POPUP_AT / TOTAL, 0.999),
		Math.min((POPUP_AT + 0.35) / TOTAL, 0.999),
		Math.min((TOTAL - 0.15) / TOTAL, 0.999),
		1,
	];

	const connectorTop = POPUP_TOP + POPUP_H;
	const connectorBottom = MAIN_Y - 9;
	const connectorH = Math.max(8, connectorBottom - connectorTop);

	return (
		<motion.div
			className="absolute pointer-events-none"
			style={{
				left: popupLeft,
				top: POPUP_TOP,
				width: POPUP_W,
				fontFamily: "var(--font-jetbrains-mono), monospace",
			}}
			initial={{ opacity: 0 }}
			animate={active ? { opacity: opacityKeys } : { opacity: 0 }}
			transition={{
				duration: TOTAL,
				times: opacityTimes,
				ease: "linear",
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<svg
				className="absolute"
				style={{
					left: revertX - popupLeft - 1,
					top: connectorTop - POPUP_TOP,
					width: 2,
					height: connectorH + 4,
					overflow: "visible",
				}}
			>
				<line
					x1={1}
					y1={0}
					x2={1}
					y2={connectorH}
					stroke={C.orange}
					strokeWidth={1.5}
					strokeDasharray="2 3"
				/>
				<circle cx={1} cy={connectorH} r={3} fill={C.orange} />
			</svg>

			<div
				className="overflow-hidden rounded-md shadow-2xl"
				style={{
					background: C.terminal,
					border: `1px solid ${C.orange}`,
					height: POPUP_H,
				}}
			>
				<div
					className="flex items-center px-2.5"
					style={{
						height: POPUP_HEADER_H,
						background: "#1a1d24",
						borderBottom: "1px solid rgba(255,255,255,0.05)",
					}}
				>
					<div className="flex items-center gap-1.5">
						<span
							style={{
								width: 10,
								height: 10,
								borderRadius: 9999,
								background: "#ff5f57",
							}}
						/>
						<span
							style={{
								width: 10,
								height: 10,
								borderRadius: 9999,
								background: "#febc2e",
							}}
						/>
						<span
							style={{
								width: 10,
								height: 10,
								borderRadius: 9999,
								background: "#28c840",
							}}
						/>
					</div>
					<div
						className="flex-1 text-center"
						style={{
							fontSize: 10,
							color: C.textSecondary,
							fontWeight: 500,
						}}
					>
						<span style={{ color: C.orange }}>{REVERT_HASH}</span>
						<span style={{ color: C.textMuted }}> · </span>
						<span>billing/invoice.ts</span>
					</div>
					<div style={{ width: 32 }} />
				</div>

				<div
					className="relative"
					style={{
						height: POPUP_BODY_H,
						overflow: "hidden",
						background: C.terminal,
						padding: `${POPUP_BODY_PAD}px 0`,
					}}
				>
					{REVERT_DIFF.map((line, i) => (
						<DiffLineRow key={i} line={line} index={i + 1} />
					))}
				</div>
			</div>
		</motion.div>
	);
}

function DiffLineRow({
	line,
	index,
}: {
	line: DiffLine;
	index: number;
}) {
	const bg =
		line.kind === "add"
			? C.addBg
			: line.kind === "del"
				? C.delBg
				: "transparent";
	const fg =
		line.kind === "comment"
			? C.textMuted
			: line.kind === "del"
				? "#ffa198"
				: line.kind === "add"
					? "#aff5b4"
					: C.textPrimary;
	const marker =
		line.kind === "add" ? "+" : line.kind === "del" ? "-" : " ";

	return (
		<div
			className="flex"
			style={{
				background: bg,
				fontSize: 11,
				lineHeight: `${POPUP_LINE_H}px`,
				height: POPUP_LINE_H,
				color: fg,
			}}
		>
			<span
				className="select-none px-1.5 text-right"
				style={{ width: 26, color: C.textMuted, fontSize: 10 }}
			>
				{index}
			</span>
			<span
				className="select-none px-0.5"
				style={{ width: 10, color: C.textMuted }}
			>
				{marker}
			</span>
			<span className="whitespace-pre">{line.text}</span>
		</div>
	);
}
