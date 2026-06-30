"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
	yellow: "#f0c674",
	pink: "#ff9ed4",
	addBg: "rgba(63, 185, 80, 0.15)",
	delBg: "rgba(255, 123, 114, 0.15)",
	claude: "#D97757",
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

const BRANCHES: Branch[] = [
	{
		id: "feat/eu-vat-grouping",
		color: C.purple,
		lane: 1,
		forkAt: 8,
		mergeAt: 26,
		commits: [
			{ pos: 11, hash: "a1b2c3d" },
			{ pos: 15, hash: "b2c3d4e" },
			{ pos: 19, hash: "c3d4e5f" },
			{ pos: 23, hash: "d4e5f6a" },
		],
	},
	{
		id: "feat/safety-controls",
		color: C.pink,
		lane: 2,
		forkAt: 20,
		mergeAt: 44,
		commits: [
			{ pos: 23, hash: "e2f3a4b" },
			{ pos: 28, hash: "f3a4b5c" },
			{ pos: 34, hash: "a4b5c6d" },
			{ pos: 40, hash: "b5c6d7e" },
		],
	},
	{
		id: "feat/stripe-retry",
		color: C.blue,
		lane: 3,
		forkAt: 38,
		mergeAt: 58,
		commits: [
			{ pos: 41, hash: "e5f6a7b" },
			{ pos: 46, hash: "f6a7b8c" },
			{ pos: 51, hash: "a7b8c9d" },
			{ pos: 55, hash: "b8c9d0e" },
		],
	},
	{
		id: "chore/react-19",
		color: C.orange,
		lane: 1,
		forkAt: 66,
		mergeAt: 84,
		commits: [
			{ pos: 70, hash: "c9d0e1f" },
			{ pos: 75, hash: "d0e1f2a" },
			{ pos: 80, hash: "e1f2a3b" },
		],
	},
];

type MainCommit = {
	pos: number;
	hash: string;
	isMerge?: boolean;
	target?: boolean;
};

const MAIN_COMMITS: MainCommit[] = [
	{ pos: 4, hash: "9e8f4d1" },
	{ pos: 8, hash: "f1e9a04" },
	{ pos: 26, hash: "d12fa00", isMerge: true },
	{ pos: 31, hash: "7f8e3c4", target: true },
	{ pos: 44, hash: "a3b4c5d", isMerge: true },
	{ pos: 58, hash: "5a2b7c8", isMerge: true },
	{ pos: 62, hash: "b3d8f12" },
	{ pos: 84, hash: "a91b4e2", isMerge: true },
	{ pos: 90, hash: "e8d3b21" },
	{ pos: 95, hash: "4f2a8b1" },
];

type Stop = {
	branchId: string;
	pos: number;
	lane: number;
	color: string;
	hash: string;
	file: string;
	lines: { text: string; kind?: "add" | "del" | "comment" }[];
};

const STOPS: Stop[] = [
	{
		branchId: "feat/stripe-retry",
		pos: 55,
		lane: 3,
		color: C.blue,
		hash: "b8c9d0e",
		file: "api/stripe-retry.ts",
		lines: [
			{ text: "async function stripeRetry(job) {" },
			{ text: "  const ctx = { attempt: 1 };" },
			{ text: "  metrics.histogram('retry.attempts', {" },
			{ text: "    attempt: ctx.attempt," },
			{ text: "    status: ctx.status," },
			{ text: "  });" },
			{ text: "  if (ctx.attempt > MAX_RETRIES) {" },
			{ text: "    metrics.counter('exhausted').inc();" },
			{ text: "    await dlq.enqueue(job);" },
			{ text: "    return;" },
			{ text: "  }" },
			{ text: "  await delay(backoff(ctx.attempt));" },
			{ text: "  try {" },
			{ text: "    return await stripe.charge(job);" },
			{ text: "  } catch (err) {" },
			{ text: "    ctx.attempt++;" },
			{ text: "    return stripeRetry(job);" },
			{ text: "  }" },
			{ text: "}" },
		],
	},
	{
		branchId: "main",
		pos: 31,
		lane: 0,
		color: C.yellow,
		hash: "7f8e3c4",
		file: "billing/invoice.ts",
		lines: [
			{ text: "import { Invoice } from './types';" },
			{ text: "import { groupByVATRate } from './vat';" },
			{ text: "" },
			{ text: "export function process(invoice: Invoice) {" },
			{ text: "  validate(invoice);" },
			{ text: "" },
			{ text: "  // revert: undo invoice grouping", kind: "comment" },
			{ text: "  //   (broke EU customers)", kind: "comment" },
			{ text: "" },
			{ text: "  if (invoice.region === 'EU') {", kind: "del" },
			{ text: "    groupByVATRate(invoice);", kind: "del" },
			{ text: "  }", kind: "del" },
			{ text: "  // reverted: see #1827", kind: "add" },
			{ text: "  // re-enable when per-country", kind: "add" },
			{ text: "  // rates are implemented", kind: "add" },
			{ text: "" },
			{ text: "  applyDiscount(invoice);" },
			{ text: "  return finalize(invoice);" },
			{ text: "}" },
		],
	},
	{
		branchId: "feat/eu-vat-grouping",
		pos: 19,
		lane: 1,
		color: C.purple,
		hash: "c3d4e5f",
		file: "billing/vat.ts",
		lines: [
			{ text: "import { EU_VAT_RATES } from './constants';" },
			{ text: "" },
			{ text: "export function mapCountryToVATRate(" },
			{ text: "  country: string," },
			{ text: "): number {" },
			{ text: "  const code = country.toUpperCase();" },
			{ text: "  const rate = EU_VAT_RATES[code];" },
			{ text: "  if (!rate) {" },
			{ text: "    throw new VATRateNotFound(code);" },
			{ text: "  }" },
			{ text: "  return rate;" },
			{ text: "}" },
			{ text: "" },
			{ text: "const EU_VAT_RATES = {" },
			{ text: "  DE: 0.19, FR: 0.20," },
			{ text: "  NL: 0.21, BE: 0.21," },
			{ text: "  IT: 0.22, ES: 0.21," },
			{ text: "  AT: 0.20, FI: 0.24," },
			{ text: "};" },
		],
	},
];

// Layout
const SVG_W = 1140;
const SVG_H = 440;
const PAD_X = 56;
const INNER_W = SVG_W - PAD_X * 2;
const POPUP_TOP = 10;
const POPUP_W = 300;
const POPUP_HEADER_H = 24;
const POPUP_BODY_H = 144;
const POPUP_H = POPUP_HEADER_H + POPUP_BODY_H;
const POPUP_LINE_H = 14;
const LINES_TOTAL_H_PER_SET = (lineCount: number) =>
	lineCount * POPUP_LINE_H;
const AGENT_TRACK_Y = POPUP_TOP + POPUP_H + 18;
const MAIN_Y = 250;
const LANE_Y: Record<number, number> = {
	0: MAIN_Y,
	1: 304,
	2: 330,
	3: 356,
};
const TIME_AXIS_Y = 395;

// Mechanical timing — agent starts AT stop1 (no fly-in from "today"),
// cycles through stops, and returns to stop1 to loop seamlessly.
const TRAVEL = 0.42;
const PAUSE = 2.6;
// Stop3 → stop1 return distance; still travels right but shorter than today.
const RETURN_TRAVEL = 1.0;
// Wait for all branch draw animations (last branch finishes ~2.1s) to land
// before the agent kicks off.
const KICKOFF_DELAY = 2.3;
const T1_ARRIVE = 0;
const T1_LEAVE = T1_ARRIVE + PAUSE;
const T2_ARRIVE = T1_LEAVE + TRAVEL;
const T2_LEAVE = T2_ARRIVE + PAUSE;
const T3_ARRIVE = T2_LEAVE + TRAVEL;
const T3_LEAVE = T3_ARRIVE + PAUSE;
const T_RETURN = T3_LEAVE + RETURN_TRAVEL;
const TOTAL = T_RETURN;
const LOOP_GAP = 0.8;

const norm = (t: number) => t / TOTAL;
const DIM = 0.18;

const xFor = (pos: number) => PAD_X + (pos / 100) * INNER_W;
const yFor = (lane: number) => LANE_Y[lane];

const SELECTED_BRANCH_IDS = STOPS.map((s) => s.branchId);

function dimKeyframes(thisBranchId: string) {
	const a1 = thisBranchId === SELECTED_BRANCH_IDS[0] ? 1 : DIM;
	const a2 = thisBranchId === SELECTED_BRANCH_IDS[1] ? 1 : DIM;
	const a3 = thisBranchId === SELECTED_BRANCH_IDS[2] ? 1 : DIM;
	// Cycle starts AT stop1 (a1 active), travels through stop2, stop3, then
	// returns to stop1. First and last keys both = a1 so the loop is seamless.
	const keys = [a1, a1, 1, 1, a2, a2, 1, 1, a3, a3, 1, 1, a1];
	const times = [
		0,
		norm(T1_LEAVE - 0.05),
		norm(T1_LEAVE + 0.08),
		norm(T2_ARRIVE - 0.08),
		norm(T2_ARRIVE + 0.05),
		norm(T2_LEAVE - 0.05),
		norm(T2_LEAVE + 0.08),
		norm(T3_ARRIVE - 0.08),
		norm(T3_ARRIVE + 0.05),
		norm(T3_LEAVE - 0.05),
		norm(T3_LEAVE + 0.08),
		1 - 0.04,
		1,
	];
	return { keys, times };
}

export function GitHistorySlide() {
	return (
		<DeckSlide primitive="history">
			<Body />
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);
	const stop1X = xFor(STOPS[0].pos);
	const stop2X = xFor(STOPS[1].pos);
	const stop3X = xFor(STOPS[2].pos);

	// Cycle: appears at stop1 → stop2 → stop3 → back to stop1. First and last
	// keyframes are stop1 so the loop wraps with no visible jump.
	const agentKeyframes = [
		stop1X,
		stop1X,
		stop2X,
		stop2X,
		stop3X,
		stop3X,
		stop1X,
	];
	const agentTimes = [
		0,
		norm(T1_LEAVE),
		norm(T2_ARRIVE),
		norm(T2_LEAVE),
		norm(T3_ARRIVE),
		norm(T3_LEAVE),
		1,
	];

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
					</svg>

					{STOPS.map((s, i) => {
						const arriveT =
							i === 0
								? T1_ARRIVE
								: i === 1
									? T2_ARRIVE
									: T3_ARRIVE;
						const leaveT =
							i === 0
								? T1_LEAVE
								: i === 1
									? T2_LEAVE
									: T3_LEAVE;
						return (
							<CodePopup
								key={s.hash}
								stop={s}
								active={isSlideActive}
								arriveT={arriveT}
								leaveT={leaveT}
							/>
						);
					})}

					{/* Outer wrapper: handles initial fade-in only */}
					<motion.div
						className="absolute"
						style={{
							top: AGENT_TRACK_Y - 14,
							left: 0,
							willChange: "opacity",
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: isSlideActive ? 1 : 0 }}
						transition={{
							duration: 0.3,
							delay: isSlideActive ? KICKOFF_DELAY - 0.2 : 0,
						}}
					>
						{/* Inner: handles x keyframes — no opacity interference */}
						<motion.div
							style={{ willChange: "transform" }}
							initial={{ x: stop1X }}
							animate={
								isSlideActive
									? { x: agentKeyframes }
									: { x: stop1X }
							}
							transition={{
								duration: TOTAL,
								times: agentTimes,
								delay: isSlideActive ? KICKOFF_DELAY : 0,
								ease: "linear",
								repeat: Infinity,
								repeatDelay: LOOP_GAP,
							}}
						>
							<div style={{ transform: "translateX(-50%)" }}>
								<AgentChip />
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>

			<Notes>
				The agent reads its own history. It scrubs back across branches,
				opens the file at each past commit, and reads the relevant code
				before moving on.
			</Notes>
		</>
	);
}

function Graph({ active }: { active: boolean }) {
	const mainDim = dimKeyframes("main");

	return (
		<>
			<motion.g
				initial={{ opacity: 0 }}
				animate={active ? { opacity: 1 } : { opacity: 0 }}
				transition={{
					duration: 0.3,
					delay: active ? 0.35 : 0,
				}}
			>
				<motion.g
					animate={
						active
							? { opacity: mainDim.keys }
							: { opacity: 1 }
					}
					transition={{
						duration: TOTAL,
						times: mainDim.times,
						ease: "linear",
						delay: active ? KICKOFF_DELAY : 0,
						repeat: Infinity,
						repeatDelay: LOOP_GAP,
					}}
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
						animate={
							active ? { pathLength: 1 } : { pathLength: 0 }
						}
						transition={{
							duration: 0.7,
							ease: [0.22, 1, 0.36, 1],
							delay: active ? 0.35 : 0,
						}}
					/>

					{MAIN_COMMITS.map((c, i) => {
						const cx = xFor(c.pos);
						const isTarget = !!c.target;
						const isMerge = !!c.isMerge;
						return (
							<motion.g
								key={c.hash}
								initial={{ opacity: 0, scale: 0.4 }}
								animate={
									active
										? { opacity: 1, scale: 1 }
										: { opacity: 0, scale: 0.4 }
								}
								transition={{
									duration: 0.25,
									ease: [0.22, 1, 0.36, 1],
									delay: active ? 0.5 + i * 0.04 : 0,
								}}
								style={{
									transformOrigin: `${cx}px ${MAIN_Y}px`,
								}}
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
										<circle
											cx={cx}
											cy={MAIN_Y}
											r={2}
											fill={C.green}
										/>
									</>
								) : (
									<circle
										cx={cx}
										cy={MAIN_Y}
										r={isTarget ? 7.5 : 5.5}
										fill={isTarget ? C.yellow : C.green}
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
									fill={isTarget ? C.yellow : C.textMuted}
									fontWeight={isTarget ? 600 : 400}
								>
									{c.hash}
								</text>
							</motion.g>
						);
					})}
				</motion.g>
			</motion.g>

			{BRANCHES.map((b, bi) => {
				const by = yFor(b.lane);
				const firstX = xFor(b.commits[0].pos);
				const lastX = xFor(b.commits[b.commits.length - 1].pos);
				const forkX = xFor(b.forkAt);
				const mergeX = xFor(b.mergeAt);
				const forkPath = curve(forkX, MAIN_Y, firstX, by);
				const horizPath = `M ${firstX} ${by} L ${lastX} ${by}`;
				const mergePath = curve(lastX, by, mergeX, MAIN_Y);
				const baseDelay = 0.55 + bi * 0.13;
				const dim = dimKeyframes(b.id);

				return (
					<motion.g
						key={b.id}
						initial={{ opacity: 0 }}
						animate={active ? { opacity: 1 } : { opacity: 0 }}
						transition={{
							duration: 0.3,
							delay: active ? baseDelay : 0,
						}}
					>
						<motion.g
							animate={
								active
									? { opacity: dim.keys }
									: { opacity: 1 }
							}
							transition={{
								duration: TOTAL,
								times: dim.times,
								ease: "linear",
								delay: active ? KICKOFF_DELAY : 0,
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
								animate={
									active
										? { pathLength: 1 }
										: { pathLength: 0 }
								}
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
								animate={
									active
										? { pathLength: 1 }
										: { pathLength: 0 }
								}
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
								animate={
									active
										? { pathLength: 1 }
										: { pathLength: 0 }
								}
								transition={{
									duration: 0.5,
									ease: [0.22, 1, 0.36, 1],
									delay: active ? baseDelay + 0.65 : 0,
								}}
							/>

							<text
								x={firstX}
								y={by + 14}
								fontSize={10}
								fontFamily="var(--font-jetbrains-mono), monospace"
								fill={b.color}
								fontWeight={600}
							>
								{b.id}
							</text>

							{b.commits.map((c, ci) => {
								const cx = xFor(c.pos);
								return (
									<motion.circle
										key={c.hash}
										cx={cx}
										cy={by}
										r={4.5}
										fill={b.color}
										stroke={C.canvas}
										strokeWidth={2}
										initial={{ opacity: 0, scale: 0.4 }}
										animate={
											active
												? { opacity: 1, scale: 1 }
												: {
														opacity: 0,
														scale: 0.4,
													}
										}
										transition={{
											duration: 0.2,
											ease: [0.22, 1, 0.36, 1],
											delay: active
												? baseDelay + 0.45 + ci * 0.06
												: 0,
										}}
										style={{
											transformOrigin: `${cx}px ${by}px`,
										}}
									/>
								);
							})}
						</motion.g>
					</motion.g>
				);
			})}

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
				{ pos: 5, label: "6m ago" },
				{ pos: 31, label: "47 days" },
				{ pos: 58, label: "3m" },
				{ pos: 84, label: "1m" },
				{ pos: 96, label: "today" },
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

function AgentChip() {
	return (
		<div
			className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
			style={{
				background: "rgba(13, 17, 23, 0.95)",
				border: "1px solid rgba(255, 255, 255, 0.16)",
				boxShadow: "0 4px 14px rgba(0, 0, 0, 0.55)",
				fontFamily: "var(--font-jetbrains-mono), monospace",
				color: C.textPrimary,
				fontSize: 11,
				fontWeight: 600,
			}}
		>
			<Image
				src="/images/clients/claude.svg"
				alt=""
				width={14}
				height={14}
				priority
				aria-hidden
			/>
			<span>claude</span>
		</div>
	);
}

function CodePopup({
	stop,
	active,
	arriveT,
	leaveT,
}: {
	stop: Stop;
	active: boolean;
	arriveT: number;
	leaveT: number;
}) {
	const cx = xFor(stop.pos);
	const cy = yFor(stop.lane);

	const popupLeft = Math.max(
		16,
		Math.min(SVG_W - POPUP_W - 16, cx - POPUP_W / 2),
	);

	const connectorTop = AGENT_TRACK_Y + 14;
	const connectorBottom = cy - 6;

	const duration = leaveT - arriveT;
	const opacityKeys = [0, 1, 1, 0];
	const opacityTimes = [0, 0.07, 0.93, 1.0];

	const linesHeight = LINES_TOTAL_H_PER_SET(stop.lines.length);
	// Fast scroll: ~1.8s for one full set to pass through.
	const SCROLL_DURATION = 1.8;

	return (
		<motion.div
			className="absolute pointer-events-none"
			style={{
				left: popupLeft,
				top: POPUP_TOP,
				width: POPUP_W,
				fontFamily: "var(--font-jetbrains-mono), monospace",
				willChange: "opacity",
			}}
			initial={{ opacity: 0 }}
			animate={active ? { opacity: opacityKeys } : { opacity: 0 }}
			transition={{
				duration,
				times: opacityTimes,
				delay: active ? KICKOFF_DELAY + arriveT : 0,
				ease: "linear",
				repeat: Infinity,
				repeatDelay: TOTAL - duration + LOOP_GAP,
			}}
		>
			{/* Connector from agent down to commit dot */}
			<svg
				className="absolute"
				style={{
					left: cx - popupLeft - 1,
					top: connectorTop - POPUP_TOP,
					width: 2,
					height: Math.max(
						10,
						connectorBottom - connectorTop + 4,
					),
					overflow: "visible",
				}}
			>
				<line
					x1={1}
					y1={0}
					x2={1}
					y2={Math.max(8, connectorBottom - connectorTop)}
					stroke={stop.color}
					strokeWidth={1.5}
					strokeDasharray="2 3"
				/>
				<circle
					cx={1}
					cy={Math.max(8, connectorBottom - connectorTop)}
					r={3}
					fill={stop.color}
				/>
			</svg>

			<div
				className="overflow-hidden rounded-md shadow-2xl"
				style={{
					background: C.terminal,
					border: `1px solid ${stop.color}`,
					height: POPUP_H,
				}}
			>
				{/* Terminal-kit header: traffic lights + title */}
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
						<span style={{ color: stop.color }}>{stop.hash}</span>
						<span style={{ color: C.textMuted }}> · </span>
						<span>{stop.file}</span>
					</div>
					<div style={{ width: 32 }} />
				</div>

				{/* Body: lines scroll upward fast */}
				<div
					className="relative"
					style={{
						height: POPUP_BODY_H,
						overflow: "hidden",
						background: C.terminal,
					}}
				>
					<motion.div
						initial={{ y: 0 }}
						animate={
							active
								? { y: [0, -linesHeight] }
								: { y: 0 }
						}
						transition={{
							duration: SCROLL_DURATION,
							ease: "linear",
							repeat: Infinity,
							delay: 0,
						}}
						style={{ willChange: "transform" }}
					>
						{[0, 1].map((dup) => (
							<div key={dup}>
								{stop.lines.map((line, i) => (
									<CodeLine
										key={`${dup}-${i}`}
										line={line}
										index={i + 1}
										color={stop.color}
										active={active}
									/>
								))}
							</div>
						))}
					</motion.div>

					{/* Top/bottom fade masks for terminal feel */}
					<div
						className="absolute pointer-events-none"
						style={{
							left: 0,
							right: 0,
							top: 0,
							height: 16,
							background: `linear-gradient(to bottom, ${C.terminal} 0%, transparent 100%)`,
						}}
					/>
					<div
						className="absolute pointer-events-none"
						style={{
							left: 0,
							right: 0,
							bottom: 0,
							height: 16,
							background: `linear-gradient(to top, ${C.terminal} 0%, transparent 100%)`,
						}}
					/>
				</div>
			</div>
		</motion.div>
	);
}

// JetBrains Mono char width at fontSize 10 — used to place the word-by-word
// reading highlight. Slightly tightened so the highlight tracks the text.
const CHAR_W = 6.02;
const HIGHLIGHT_DURATION = 1.4;

function getWordRanges(text: string) {
	const ranges: { start: number; len: number }[] = [];
	let pos = 0;
	for (const part of text.split(/(\s+)/)) {
		if (part.length === 0) continue;
		if (/^\s+$/.test(part)) {
			pos += part.length;
		} else {
			ranges.push({ start: pos, len: part.length });
			pos += part.length;
		}
	}
	return ranges;
}

function CodeLine({
	line,
	index,
	color,
	active,
}: {
	line: Stop["lines"][number];
	index: number;
	color: string;
	active: boolean;
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

	// Compute snappy word-by-word highlight keyframes.
	const words = getWordRanges(line.text);
	let xKeys: number[] = [];
	let widthKeys: number[] = [];
	let times: number[] = [];
	if (words.length > 0) {
		for (let i = 0; i < words.length; i++) {
			const w = words[i];
			const tStart = i / words.length;
			const tHold = Math.min(1, (i + 0.85) / words.length);
			xKeys.push(w.start * CHAR_W);
			widthKeys.push(w.len * CHAR_W);
			times.push(tStart);
			xKeys.push(w.start * CHAR_W);
			widthKeys.push(w.len * CHAR_W);
			times.push(tHold);
		}
	}

	return (
		<div
			className="flex relative"
			style={{
				background: bg,
				fontSize: 10,
				lineHeight: `${POPUP_LINE_H}px`,
				height: POPUP_LINE_H,
				color: fg,
			}}
		>
			<span
				className="select-none px-1.5 text-right"
				style={{ width: 26, color: C.textMuted, fontSize: 9 }}
			>
				{index}
			</span>
			<span
				className="select-none px-0.5"
				style={{ width: 10, color: C.textMuted }}
			>
				{marker}
			</span>
			<div
				className="relative flex-1"
				style={{ overflow: "hidden" }}
			>
				{words.length > 0 && active ? (
					<motion.div
						className="absolute"
						style={{
							top: 0,
							left: 0,
							height: POPUP_LINE_H,
							background: `${color}55`,
							borderRadius: 2,
							zIndex: 0,
							willChange: "transform, width",
						}}
						initial={{
							x: xKeys[0] ?? 0,
							width: widthKeys[0] ?? 0,
						}}
						animate={{ x: xKeys, width: widthKeys }}
						transition={{
							duration: HIGHLIGHT_DURATION,
							times,
							ease: "linear",
							repeat: Infinity,
						}}
					/>
				) : null}
				<span
					className="whitespace-pre"
					style={{ position: "relative", zIndex: 1 }}
				>
					{line.text}
				</span>
			</div>
		</div>
	);
}
