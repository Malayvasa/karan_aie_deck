"use client";

import { motion } from "framer-motion";
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";
import {
	BODY_R,
	brickPath,
	LegoBrick,
	ROW_Y,
	STUD_H,
	STUD_R,
	STUD_W,
	studCenters,
	TOP_R,
	TOTAL_H,
	widthForStuds,
	type Brick,
} from "./lego/LegoBrick";
import { PRIMITIVES as PRIMITIVE_BRICKS } from "./lego/primitives";

/**
 * Slide 25 — The diagnosis, and the close (one slide, stepped).
 *
 * The deck assembled into one tower, revealed by following the bottleneck: model
 * → harness → the infrastructure we then build (the six primitives), all on a
 * Composio foundation. Then — within the same slide, so framer's shared layout
 * can morph it — the Composio wordmark flies out of the cover brick up into the
 * top-left corner, and the production stats + hiring close land together.
 *
 * Steps (useStepMotion(5)):
 *   base — frontier models; bottleneck on it.
 *   0    — harness lands; bottleneck climbs.
 *   1    — agent + empty infra grid; bottleneck drops in.
 *   2    — the six primitives cascade in.
 *   3    — Composio lands as one brick over the six.
 *   4    — close: logo morphs to the corner, hiring CTA lands on the left and
 *          the stats count up on the right — both arriving together.
 */

const LOGO_SRC = "/composio-logo-white.svg";

const DARK = "#2C2C2C";
const SHADOW = "drop-shadow(0 5px 6px rgba(0,0,0,0.4))";
const CHOKE = "#ff5a5a";
const GHOST_STROKE = "rgba(255,255,255,0.5)";
const ACCENT = "#51a2ff";
const MUTED = "#8a8a8a";

/* ───────────────────────────── tower layout ───────────────────────────── */

const COLS = 3;
const CELL_STUDS = 3;
const CELL_W = widthForStuds(CELL_STUDS);
const FULL_STUDS = COLS * CELL_STUDS;
const FULL_W = widthForStuds(FULL_STUDS);

const ROW_AGENT = 0;
const ROW_HARNESS = 1;
const ROW_MODEL = 2;
const ROW_GRID_TOP = 3;
const ROW_GRID_BOTTOM = 4;
const N_ROWS = 5;
const CONTAINER_H = (N_ROWS - 1) * ROW_Y + TOTAL_H;

const yForLocalRow = (row: number) => row * ROW_Y;

const AGENT: Brick = { label: "knowledge work agents", color: "#D0121A", text: "#ffffff" };
const HARNESS: Brick = { label: "harness", color: "#F5C518", text: "#1a1a1a" };
const MODEL: Brick = { label: "frontier models", color: "#0057A8", text: "#ffffff" };

type Cell = { brick: Brick; col: number; row: number };
// Colors/icons come from the shared primitive palette so every appearance of a
// primitive — bridge slides, badges, this tower — reads as the same brick.
const PRIMITIVES: Cell[] = [
	{ brick: PRIMITIVE_BRICKS.centralization, col: 0, row: ROW_GRID_BOTTOM },
	{ brick: PRIMITIVE_BRICKS.history, col: 1, row: ROW_GRID_BOTTOM },
	{ brick: PRIMITIVE_BRICKS.context, col: 2, row: ROW_GRID_BOTTOM },
	{ brick: PRIMITIVE_BRICKS.verification, col: 0, row: ROW_GRID_TOP },
	{ brick: PRIMITIVE_BRICKS.governance, col: 1, row: ROW_GRID_TOP },
	{ brick: PRIMITIVE_BRICKS.reversibility, col: 2, row: ROW_GRID_TOP },
];
const CASCADE_STAGGER = 0.26;
const LAND_EASE = [0.34, 1.4, 0.6, 1] as const;

const GRID_TOP = yForLocalRow(ROW_GRID_TOP);
const GRID_HEIGHT = yForLocalRow(ROW_GRID_BOTTOM) + TOTAL_H - GRID_TOP;
const COVER_LOGO_H = 34;

const BR_LEFT = -34;
const MODEL_TOP = yForLocalRow(ROW_MODEL);
const HARNESS_TOP = yForLocalRow(ROW_HARNESS);

/* ───────────────────────────── close layout ───────────────────────────── */

const MARGIN_X = 128;
const LOGO_TOP = 92;

type StatDef = { target: number; format: (v: number) => string; reserve: string; label: string; sub?: string };
const HERO: StatDef[] = [
	{ target: 1000, format: (v) => { const n = Math.round(v); return n >= 1000 ? "1B+" : `${n}M`; }, reserve: "999M", label: "tool calls total" },
	{ target: 300, format: (v) => `${Math.round(v)}M`, reserve: "300M", label: "tool calls last month" },
];
const PROOF: StatDef[] = [
	{ target: 1000, format: (v) => `${Math.round(v).toLocaleString()}+`, reserve: "1,000+", label: "apps connected" },
	{ target: 2000, format: (v) => { const n = Math.round(v); return n >= 1000 ? "2M+" : `${n}K`; }, reserve: "999K", label: "connected accounts" },
	{ target: 50000, format: (v) => `${Math.round(v).toLocaleString()}+`, reserve: "50,000+", label: "tools in production" },
];

type Customer = { src: string; alt: string; h: number };
const CUSTOMERS: Customer[] = [
	{ src: "/images/customers/aws.svg", alt: "AWS", h: 34 },
	{ src: "/images/customers/zoom-wordmark.svg", alt: "Zoom", h: 22 },
	{ src: "/images/customers/glean.svg", alt: "Glean", h: 24 },
	{ src: "/images/customers/base44.svg", alt: "Base44", h: 21 },
	{ src: "/images/customers/runner.svg", alt: "Runner", h: 15 },
	{ src: "/images/customers/viktor.svg", alt: "Viktor", h: 20 },
];

const COUNT_DURATION = 1500;
const BRICK_FADE = { duration: 0.55, ease: "easeOut" } as const;

// One persistent wordmark, moved (never re-mounted) between three spots: the
// cover brick, the top-left corner, and centered for the thank-you. Positions are
// computed from MEASURED slide + logo widths (offsetWidth is in the internal
// slide space, so it ignores Spectacle's CSS scaling) — no hardcoded canvas math
// to drift out of alignment.
const LOGO_BASE_H = 44;
const LOGO_MOVE = { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 } as const;

/** Top-left x/y + scale that centers a `height`-tall logo of width `logoW` on a point. */
function centeredBox(centerX: number, centerY: number, height: number, logoW: number) {
	const scale = height / LOGO_BASE_H;
	return {
		x: centerX - (logoW * scale) / 2,
		y: centerY - (LOGO_BASE_H * scale) / 2,
		scale,
	};
}

export function DiagnosisSlide() {
	return (
		<DeckSlide padded={false}>
			<DiagnosisBody />
		</DeckSlide>
	);
}

function DiagnosisBody() {
	const { isSlideActive: active } = useContext(SlideContext);
	const { reached, placeholder } = useStepMotion(5);

	const showHarness = reached(0);
	const showInfra = reached(1);
	const building = reached(2);
	const covered = reached(3);
	const showClose = reached(4);

	return (
		<div className="relative h-full w-full overflow-hidden bg-background">
			{placeholder}
			{/* Tower stays mounted and eases out, so the bricks don't pop. */}
			<Tower
				active={active}
				showHarness={showHarness}
				showInfra={showInfra}
				building={building}
				covered={covered}
				fadeOut={showClose}
			/>
			{showClose ? <Close /> : null}

			{/* One logo for the whole slide — moves between cover brick and corner. */}
			<PersistentLogo covered={covered} showClose={showClose} />

			<Notes>
				<p>
					If you take one thing away today, take this. For two years,
					the model was the bottleneck — so everyone raced to make it
					better, and it worked. Good enough that coding agents are
					autonomous, because everything around the code was already
					there.
				</p>
				<p>
					But the model isn&apos;t the bottleneck anymore. The same
					one that writes your code could run your sales, your
					hiring, your finance — it&apos;s just as capable the moment
					it leaves the repo. But, it would be working blind: no
					history, no context, no way to verify, no guardrails, no
					undo.
				</p>
				<p>
					So the bottleneck moved. For years it was the model. Now
					it&apos;s the infrastructure nobody built around the work.
					Build that, and the agents we have today get dramatically
					better.
				</p>
				<p>And that&apos;s what we&apos;re building at Composio.</p>
				<p>
					So if you&apos;re building agents, point one at Composio
					and watch what it can suddenly do. Most of the work you
					think you&apos;d have to build yourself is already there.
				</p>
				<p>
					And if you want to build this future with us — the layer
					every agent in the world runs on — come find me.
					We&apos;re hiring, and there&apos;s a lot left to do.
				</p>
				<p>
					The models will keep getting better. The bottleneck
					won&apos;t be the models. Thank you.
				</p>
			</Notes>
		</div>
	);
}

/* ════════════════════════════════ TOWER ════════════════════════════════ */

function Tower({
	active,
	showHarness,
	showInfra,
	building,
	covered,
	fadeOut,
}: {
	active: boolean;
	showHarness: boolean;
	showInfra: boolean;
	building: boolean;
	covered: boolean;
	fadeOut: boolean;
}) {
	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<motion.div
				className="relative"
				style={{ width: FULL_W, height: CONTAINER_H }}
				initial={false}
				animate={{ opacity: fadeOut ? 0 : 1, scale: fadeOut ? 0.97 : 1 }}
				transition={BRICK_FADE}
			>
				{/* Model layer. */}
				<WideBrick brick={MODEL} row={ROW_MODEL} idx={2} show={active} delay={0.2} />
				<WideBrick brick={HARNESS} row={ROW_HARNESS} idx={1} show={active && showHarness} delay={0} />
				<WideBrick brick={AGENT} row={ROW_AGENT} idx={0} show={active && showInfra} delay={0} />

				{/* Six primitives — one press cascades them in. */}
				{PRIMITIVES.map((cell, i) => (
					<PrimitiveSlot
						key={cell.brick.label}
						cell={cell}
						idx={40 + i}
						showGhost={active && showInfra}
						filled={building}
						delay={i * CASCADE_STAGGER}
					/>
				))}

				{/* Composio — slab covers the six. The wordmark is the persistent
				    logo, drawn at slide level so it can travel out of here. */}
				<ComposioCoverSlab show={covered} />

				{/* Bottleneck — model → harness → stack, then clears. */}
				<Bracket
					y={showHarness ? HARNESS_TOP : MODEL_TOP}
					height={TOTAL_H}
					show={active && !showInfra}
					delay={showHarness ? 0 : 0.5}
				/>
				<Bracket y={GRID_TOP} height={GRID_HEIGHT} show={showInfra && !building} delay={0.2} />
			</motion.div>
		</div>
	);
}

function zForRow(row: number) {
	return N_ROWS - row + 1;
}

function WideBrick({
	brick,
	row,
	idx,
	show,
	delay,
}: {
	brick: Brick;
	row: number;
	idx: number;
	show: boolean;
	delay: number;
}) {
	const y = yForLocalRow(row);
	return (
		<motion.div
			className="absolute left-0 top-0"
			style={{ width: FULL_W, filter: SHADOW, transformOrigin: "50% 100%", zIndex: zForRow(row) + 20 }}
			initial={false}
			animate={{ opacity: show ? 1 : 0, y: show ? y : y - 84, rotate: show ? 0 : -1.6 }}
			transition={{ type: "spring", stiffness: 260, damping: 17, delay: show ? delay : 0 }}
		>
			<LegoBrick brick={brick} idx={idx} studs={FULL_STUDS} />
		</motion.div>
	);
}

function PrimitiveSlot({
	cell,
	idx,
	showGhost,
	filled,
	delay,
}: {
	cell: Cell;
	idx: number;
	showGhost: boolean;
	filled: boolean;
	delay: number;
}) {
	const x = cell.col * CELL_W;
	const y = yForLocalRow(cell.row);
	const tilt = cell.col % 2 === 0 ? -4 : 4;
	return (
		<div
			className="absolute left-0 top-0"
			style={{ width: CELL_W, height: TOTAL_H, transform: `translate(${x}px, 0)` }}
		>
			<motion.div
				className="absolute left-0 top-0"
				style={{ width: CELL_W }}
				initial={false}
				animate={{ opacity: showGhost && !filled ? 1 : 0, y }}
				transition={{ duration: 0.3, delay: filled ? delay : 0 }}
			>
				<GhostBrick />
			</motion.div>
			<motion.div
				className="absolute left-0 top-0"
				style={{ width: CELL_W, filter: SHADOW, transformOrigin: "50% 100%", zIndex: zForRow(cell.row) + 5 }}
				initial={false}
				animate={{ opacity: filled ? 1 : 0, y: filled ? y : y - 90, rotate: filled ? 0 : tilt }}
				transition={{ duration: 0.55, ease: LAND_EASE, delay: filled ? delay : 0 }}
			>
				<LegoBrick brick={cell.brick} idx={idx} studs={CELL_STUDS} />
			</motion.div>
		</div>
	);
}

function GhostBrick() {
	const centers = studCenters(CELL_STUDS);
	const path = brickPath(CELL_W, centers);
	return (
		<svg
			width={CELL_W}
			height={TOTAL_H}
			viewBox={`0 0 ${CELL_W} ${TOTAL_H}`}
			style={{ display: "block", overflow: "visible" }}
			aria-hidden
		>
			<path d={path} fill="none" stroke={GHOST_STROKE} strokeWidth="1.75" strokeDasharray="5 4" />
		</svg>
	);
}

/** The Composio cover slab — tall brick that covers the six. Logo is separate. */
function ComposioCoverSlab({ show }: { show: boolean }) {
	const uid = useId();
	const clip = `cover-clip-${uid}`;
	const shade = `cover-shade-${uid}`;
	const blockH = GRID_HEIGHT - STUD_H;
	const centers = studCenters(FULL_STUDS);
	const path = slabPath(FULL_W, centers, blockH);
	return (
		<motion.div
			className="absolute left-0 top-0"
			style={{ width: FULL_W, filter: SHADOW, transformOrigin: "50% 50%", zIndex: 15 }}
			initial={false}
			animate={{ opacity: show ? 1 : 0, y: show ? GRID_TOP : GRID_TOP - 52, scale: show ? 1 : 0.98 }}
			transition={{ type: "spring", stiffness: 240, damping: 18 }}
		>
			<svg
				width={FULL_W}
				height={GRID_HEIGHT}
				viewBox={`0 0 ${FULL_W} ${GRID_HEIGHT}`}
				style={{ display: "block", overflow: "visible" }}
				aria-hidden
			>
				<defs>
					<clipPath id={clip}>
						<path d={path} />
					</clipPath>
					<linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.30" />
						<stop offset="14%" stopColor="#fff" stopOpacity="0.08" />
						<stop offset="40%" stopColor="#fff" stopOpacity="0" />
						<stop offset="78%" stopColor="#000" stopOpacity="0" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.5" />
					</linearGradient>
				</defs>
				<g clipPath={`url(#${clip})`}>
					<path d={path} fill={DARK} />
					<rect width={FULL_W} height={GRID_HEIGHT} fill={`url(#${shade})`} />
					<rect x={0} y={STUD_H} width={FULL_W} height={1.5} fill="#fff" opacity={0.14} />
					{centers.map((cx) => (
						<rect key={cx} x={cx - STUD_W / 2} y={STUD_H - 1.5} width={STUD_W} height={2} fill="#000" opacity={0.16} />
					))}
				</g>
				<path d={path} fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="1" />
			</svg>
		</motion.div>
	);
}

function slabPath(width: number, centers: number[], blockH: number): string {
	const top = STUD_H;
	const bottom = STUD_H + blockH;
	let d = `M ${TOP_R} ${top}`;
	for (const cx of centers) {
		const l = cx - STUD_W / 2;
		const r = cx + STUD_W / 2;
		d += ` L ${l} ${top} L ${l} ${STUD_R} Q ${l} 0 ${l + STUD_R} 0 L ${r - STUD_R} 0 Q ${r} 0 ${r} ${STUD_R} L ${r} ${top}`;
	}
	d += ` L ${width - TOP_R} ${top} Q ${width} ${top} ${width} ${top + TOP_R}`;
	d += ` L ${width} ${bottom - BODY_R} Q ${width} ${bottom} ${width - BODY_R} ${bottom}`;
	d += ` L ${BODY_R} ${bottom} Q 0 ${bottom} 0 ${bottom - BODY_R}`;
	d += ` L 0 ${top + TOP_R} Q 0 ${top} ${TOP_R} ${top} Z`;
	return d;
}

function Bracket({
	y,
	height,
	show,
	delay,
}: {
	y: number;
	height: number;
	show: boolean;
	delay: number;
}) {
	const ARM = 14;
	return (
		<motion.div
			className="absolute left-0 top-0"
			style={{ width: 0, height, zIndex: 60 }}
			initial={false}
			animate={{ x: BR_LEFT, y, opacity: show ? 1 : 0 }}
			transition={{
				x: { type: "spring", stiffness: 320, damping: 30 },
				y: { type: "spring", stiffness: 320, damping: 30 },
				opacity: { duration: 0.35, delay: show ? delay : 0 },
			}}
		>
			<div className="absolute" style={{ left: 0, top: 0, height: "100%", width: 2, background: CHOKE }} />
			<div className="absolute" style={{ left: 0, top: 0, width: ARM, height: 2, background: CHOKE }} />
			<div className="absolute" style={{ left: 0, bottom: 0, width: ARM, height: 2, background: CHOKE }} />
			<div className="absolute top-1/2 -translate-y-1/2" style={{ right: 8 }}>
				<span
					className="block whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.2em]"
					style={{ color: CHOKE, transform: "rotate(-90deg)" }}
				>
					bottleneck
				</span>
			</div>
		</motion.div>
	);
}

/* ════════════════════════════════ CLOSE ════════════════════════════════ */

function Close() {
	// Count-up clock — runs once the close is reached. Offset so the stats begin
	// counting after the logo has finished travelling to the corner.
	const [elapsed, setElapsed] = useState(0);
	useEffect(() => {
		const start = performance.now();
		let raf = 0;
		const tick = () => {
			setElapsed(performance.now() - start);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);
	const COUNT_START = 1150; // ms — after the logo morph settles
	const count = (s: StatDef, offsetMs: number) => {
		const t = clamp01((elapsed - COUNT_START - offsetMs) / COUNT_DURATION);
		return s.format(s.target * (1 - (1 - t) ** 3));
	};

	return (
		<>

			<motion.div
				className="absolute inset-0 flex flex-col"
				style={{ paddingInline: MARGIN_X, paddingTop: 196, paddingBottom: 80 }}
				initial={{ opacity: 1 }}
				animate={{ opacity: 0.6 }}
				transition={{ duration: 8, ease: "easeInOut", delay: 4.6 }}
			>
				<div className="flex items-start justify-end gap-24">
					{HERO.map((s, i) => (
						<Reveal key={s.label} delay={1.05 + i * 0.1} className="flex flex-col items-end text-right">
							<CountValue
								value={count(s, i * 120)}
								reserve={s.reserve}
								className="font-mono text-[88px] font-normal leading-[0.9] tracking-tight text-foreground"
							/>
							<span className="mt-3 font-sans text-[18px] text-muted-foreground">
								{s.label}
								{s.sub ? <span style={{ color: ACCENT }}> · {s.sub}</span> : null}
							</span>
						</Reveal>
					))}
				</div>

				<div className="mt-12 flex items-start justify-end gap-20">
					{PROOF.map((p, i) => (
						<Reveal key={p.label} delay={1.3 + i * 0.1} className="flex flex-col items-end text-right">
							<CountValue
								value={count(p, (i + 2) * 90)}
								reserve={p.reserve}
								className="font-mono text-[46px] font-normal leading-none tracking-tight"
								style={{ color: ACCENT }}
							/>
							<span className="mt-2.5 font-sans text-[15px] text-muted-foreground">{p.label}</span>
						</Reveal>
					))}
				</div>

				<Reveal delay={1.5} className="mt-auto flex items-center gap-9">
					<span className="shrink-0 font-mono text-[12px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
						Used in production by
					</span>
					<div className="flex flex-wrap items-center gap-x-11 gap-y-3">
						{CUSTOMERS.map((c) => (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								key={c.alt}
								src={c.src}
								alt={c.alt}
								height={c.h}
								style={{ display: "block", height: c.h, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.8 }}
							/>
						))}
					</div>
				</Reveal>
			</motion.div>

			{/* Hiring CTA — left side, top-aligned with the hero numbers; comes in together with the stats. */}
			<div
				className="absolute z-30 flex flex-col items-start text-left"
				style={{ left: MARGIN_X, top: 196 }}
			>
				<Reveal delay={1.05} className="font-mono text-[26px] font-medium uppercase tracking-[0.16em] text-foreground">
					Build the future with us
				</Reveal>
				<Reveal delay={1.15} className="mt-5 flex items-center gap-3 font-sans text-[18px] text-foreground">
					<span>karan@composio.dev</span>
					<span style={{ color: MUTED }}>·</span>
					<span>@KaranVaidya6</span>
				</Reveal>
			</div>
		</>
	);
}

/**
 * The single Composio wordmark for the whole slide. It never re-mounts — it just
 * moves between the cover brick, the top-left corner, and the centered thank-you
 * position, so it reads as one element travelling rather than fading in anew.
 */
function PersistentLogo({
	covered,
	showClose,
}: {
	covered: boolean;
	showClose: boolean;
}) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	// Measured in the internal slide coordinate space (offsetWidth ignores the
	// CSS transform Spectacle uses to scale the deck).
	const [m, setM] = useState({ slideW: 1366, slideH: 768, logoW: 228 });
	useLayoutEffect(() => {
		const parent = wrapRef.current?.parentElement;
		const img = imgRef.current;
		if (!parent || !img) return;
		const measure = () =>
			setM({ slideW: parent.offsetWidth, slideH: parent.offsetHeight, logoW: img.offsetWidth });
		if (img.complete) measure();
		else img.addEventListener("load", measure, { once: true });
		const ro = new ResizeObserver(measure);
		ro.observe(parent);
		return () => ro.disconnect();
	}, []);

	const containerTop = (m.slideH - CONTAINER_H) / 2;
	const coverCenterY = containerTop + GRID_TOP + STUD_H + (GRID_HEIGHT - STUD_H) / 2;
	const cover = centeredBox(m.slideW / 2, coverCenterY, COVER_LOGO_H, m.logoW);
	const corner = { x: MARGIN_X, y: LOGO_TOP, scale: 1 };

	const box = covered && showClose ? corner : cover;

	return (
		<motion.div
			ref={wrapRef}
			className="absolute left-0 top-0 z-40"
			style={{ transformOrigin: "left top" }}
			initial={false}
			animate={{ x: box.x, y: box.y, scale: box.scale, opacity: covered ? 1 : 0 }}
			transition={{ x: LOGO_MOVE, y: LOGO_MOVE, scale: LOGO_MOVE, opacity: { duration: 0.4 } }}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				ref={imgRef}
				src={LOGO_SRC}
				alt="Composio"
				style={{ display: "block", height: LOGO_BASE_H, width: "auto" }}
			/>
		</motion.div>
	);
}


function Reveal({
	children,
	delay,
	className,
}: {
	children: React.ReactNode;
	delay: number;
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: "easeOut", delay }}
		>
			{children}
		</motion.div>
	);
}

function CountValue({
	value,
	reserve,
	className,
	style,
}: {
	value: string;
	reserve: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	// Reserve the widest string the counter ever renders so a changing digit
	// count (e.g. 0M -> 300M) never reflows the row. tabular-nums keeps the
	// digits equal-width on top of that.
	return (
		<span className={`inline-grid w-fit tabular-nums ${className ?? ""}`} style={style}>
			<span aria-hidden className="col-start-1 row-start-1 invisible">
				{reserve}
			</span>
			<span className="col-start-1 row-start-1">{value}</span>
		</span>
	);
}

function clamp01(n: number) {
	return Math.max(0, Math.min(1, n));
}
