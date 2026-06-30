"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	GitPullRequest,
	MoreHorizontal,
	Settings,
	X,
} from "lucide-react";
import {
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { Notes, SlideContext } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { cn } from "~/lib/utils";

/* ============================== Palettes =============================== */

// GitHub (dark) palette — matched to VerificationInCodeSlide so the LEFT
// card visually rhymes with the in-code merge box from 3 slides back.
const GH = {
	bg: "#0d1117",
	card: "#161b22",
	cardHi: "#1c2128",
	border: "#30363d",
	borderMuted: "#21262d",
	text: "#c9d1d9",
	textStrong: "#f0f6fc",
	muted: "#8b949e",
	link: "#2f81f7",
	success: "#3fb950",
	successBg: "#238636",
	successBgHi: "#2ea043",
	attention: "#d29922",
	attentionSoft: "rgba(210,153,34,0.12)",
	danger: "#f85149",
	dangerSoft: "rgba(248,81,73,0.12)",
} as const;

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

/* ============================== Layout ================================= */

const STAGE_W = 1040;
const STAGE_H = 460;
const PANEL_W = 480;

/* ============================ LEFT card data =========================== */

type RowFinal = "success" | "fail";

type CheckRow = {
	name: string;
	pendingMeta: string;
	resolvedMeta: string;
	finalState: RowFinal;
	mark: "github" | "cursor";
};

const CHECKS: CheckRow[] = [
	{
		name: "Cursor Bugbot — Tone match · vs 47 past Karan outreaches",
		pendingMeta: "Queued",
		resolvedMeta: "Score 4.1/10 — below baseline 7.8",
		finalState: "fail",
		mark: "cursor",
	},
	{
		name: "Personalization · references candidate background",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 0.4s",
		finalState: "success",
		mark: "github",
	},
	{
		name: "CTA / length within bounds",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 0.2s",
		finalState: "success",
		mark: "github",
	},
	{
		name: "Style guide · @acme outreach voice",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 0.5s",
		finalState: "success",
		mark: "github",
	},
	{
		name: "Spam triggers / formality",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 0.3s",
		finalState: "success",
		mark: "github",
	},
];

const SUCCESS_COUNT = CHECKS.filter((c) => c.finalState === "success").length;
const FAIL_COUNT = CHECKS.filter((c) => c.finalState === "fail").length;

// Pacing — card first, then sections inside, then checks resolve in lockstep.
const CARD_DELAY = 0.45;
const SECTION_STAGGER = 0.18;
const SECTION_BASE_DELAY = CARD_DELAY + 0.15;

const FIRST_RESOLVE_MS = 1500;
const RESOLVE_STEP_MS = 520;

/* =========================== RIGHT card data =========================== */

const SANDBOX_CODE = `# working copy of Gmail — no real sends
hiring = sandbox.gmail.search(
    label='outreach:devrel-q3',
)
for c in hiring:
    sandbox.gmail.send(
        to=c.email,
        body=draft.render(c),
        preview=True,
    )`;

type Stage = {
	task: string;
	result: string;
	from: number;
	to: number;
	tone?: "danger";
};

const STAGES: Stage[] = [
	{ task: "load hiring list", result: "247 candidates", from: 2, to: 4 },
	{ task: "simulate outreach", result: "247 → mock_inbox", from: 4, to: 6 },
	{
		task: "flag anomalies",
		result: "23 flagged · tone mismatch",
		from: 6,
		to: 8,
		tone: "danger",
	},
];

/* =============================== Slide ================================== */

export function VerificationSolutionSlide() {
	return (
		<DeckSlide>
			<VerificationSolutionBody />
		</DeckSlide>
	);
}

function VerificationSolutionBody() {
	const { isSlideActive } = useContext(SlideContext);
	const [resolvedCount, setResolvedCount] = useState(0);
	const [sandboxStep, setSandboxStep] = useState(0);

	// LEFT — resolve check rows on a fixed cadence.
	useEffect(() => {
		if (!isSlideActive) {
			setResolvedCount(0);
			return;
		}
		const timers = CHECKS.map((_, i) =>
			setTimeout(
				() => setResolvedCount(i + 1),
				FIRST_RESOLVE_MS + i * RESOLVE_STEP_MS,
			),
		);
		return () => timers.forEach(clearTimeout);
	}, [isSlideActive]);

	// RIGHT — step machine for the sandbox panel. Holds at step 8 (final).
	// Steps: 0 idle, 1 code starts, 2 stage1 running, 4 stage2 running,
	// 6 stage3 running, 8 all done.
	useEffect(() => {
		if (!isSlideActive) {
			setSandboxStep(0);
			return;
		}
		const stops = [
			setTimeout(() => setSandboxStep(1), 600),
			setTimeout(() => setSandboxStep(2), 1500),
			setTimeout(() => setSandboxStep(3), 2400),
			setTimeout(() => setSandboxStep(4), 3300),
			setTimeout(() => setSandboxStep(5), 4400),
			setTimeout(() => setSandboxStep(6), 5300),
			setTimeout(() => setSandboxStep(7), 6400),
			setTimeout(() => setSandboxStep(8), 7300),
		];
		return () => stops.forEach(clearTimeout);
	}, [isSlideActive]);

	const allResolved = resolvedCount >= CHECKS.length;
	const headerState: "pending" | "failed" = allResolved ? "failed" : "pending";

	return (
		<>
			<div
				className="flex flex-1 items-center justify-center"
				style={{ fontFamily: SANS }}
			>
				<div
					className="relative flex items-center justify-between"
					style={{ width: STAGE_W, height: STAGE_H }}
				>
					{/* LEFT — GitHub goodness-checks card */}
					<div className="relative" style={{ width: PANEL_W }}>
						<ChecksCard
							isSlideActive={isSlideActive}
							resolvedCount={resolvedCount}
							headerState={headerState}
							allResolved={allResolved}
						/>
					</div>

					{/* RIGHT — Composio sandbox terminal */}
					<div className="relative" style={{ width: PANEL_W, height: STAGE_H }}>
						<SandboxPanel
							isSlideActive={isSlideActive}
							step={sandboxStep}
						/>
					</div>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="verificationSolution" />
			</Notes>
		</>
	);
}

/* ============================ LEFT — checks ============================ */

function ChecksCard({
	isSlideActive,
	resolvedCount,
	headerState,
	allResolved,
}: {
	isSlideActive: boolean;
	resolvedCount: number;
	headerState: "pending" | "failed";
	allResolved: boolean;
}) {
	return (
		<motion.div
			className="flex w-full overflow-hidden rounded-md"
			style={{
				background: GH.card,
				border: `1px solid ${GH.border}`,
			}}
			initial={{ opacity: 0, y: 16 }}
			animate={
				isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
			}
			transition={{
				duration: 0.5,
				ease: [0.34, 1.18, 0.6, 1],
				delay: CARD_DELAY,
			}}
		>
			{/* Left timeline rail — matches in-code slide */}
			<div className="flex shrink-0 items-start pt-2.5 pl-2.5">
				<div
					className="flex size-8 items-center justify-center rounded-md"
					style={{
						background: "#3d444d",
						border: `1px solid ${GH.border}`,
					}}
				>
					<GitPullRequest
						size={14}
						strokeWidth={2}
						style={{ color: GH.text }}
					/>
				</div>
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Header — pending → failed (red ring) */}
				<RevealRow
					delay={SECTION_BASE_DELAY}
					active={isSlideActive}
				>
					<div
						className="flex items-start gap-2.5 px-3.5 py-2"
						style={{
							borderBottom: `1px solid ${GH.borderMuted}`,
						}}
					>
						<ChecksHeaderRing state={headerState} />
						<div className="min-w-0 flex-1 leading-tight">
							<AnimatePresence mode="wait">
								<motion.div
									key={headerState}
									initial={{ opacity: 0, y: 4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									transition={{ duration: 0.22 }}
								>
									<div
										className="text-[14px] font-semibold"
										style={{
											color:
												headerState === "failed"
													? GH.danger
													: GH.textStrong,
										}}
									>
										{headerState === "pending"
											? "Running goodness checks…"
											: `${FAIL_COUNT} check failed — revise before sending`}
									</div>
									<div
										className="mt-0.5 text-[12.5px]"
										style={{ color: GH.muted }}
									>
										{headerState === "pending"
											? `${resolvedCount} of ${CHECKS.length} complete`
											: `${FAIL_COUNT} failing, ${SUCCESS_COUNT} successful checks`}
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
						<ChevronUp
							size={14}
							style={{ color: GH.muted, marginTop: 4 }}
						/>
					</div>
				</RevealRow>

				{/* Check list — Bugbot first (the goodness test that fails), then GH actions */}
				<RevealRow
					delay={SECTION_BASE_DELAY + SECTION_STAGGER}
					active={isSlideActive}
				>
					<div
						className="px-3.5 pt-2.5 pb-1.5"
						style={{
							borderBottom: `1px solid ${GH.borderMuted}`,
						}}
					>
						<SectionHeader
							label={
								allResolved
									? `${FAIL_COUNT} failing check`
									: "goodness check"
							}
							rightGear
							tone={allResolved ? "danger" : "neutral"}
						/>
						<CheckRowView
							row={CHECKS[0]}
							resolved={resolvedCount > 0}
						/>

						<div className="pt-2">
							<SectionHeader
								label={
									allResolved
										? `${SUCCESS_COUNT} successful checks`
										: `${CHECKS.length - 1} pending checks`
								}
							/>
						</div>
						{CHECKS.slice(1).map((row, i) => (
							<div
								key={row.name}
								style={{
									borderBottom:
										i < CHECKS.length - 2
											? `1px solid ${GH.borderMuted}`
											: undefined,
								}}
							>
								<CheckRowView
									row={row}
									resolved={resolvedCount > i + 1}
								/>
							</div>
						))}
					</div>
				</RevealRow>

				{/* Footer button — "Send to 247 candidates" stays disabled
				    because the goodness check failed. Never goes green. */}
				<RevealRow
					delay={SECTION_BASE_DELAY + SECTION_STAGGER * 2}
					active={isSlideActive}
				>
					<div className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px]">
						<SendButton enabled={false} />
						<span
							className="truncate"
							style={{ color: GH.muted }}
						>
							Resolve the failing check before sending.
						</span>
					</div>
				</RevealRow>
			</div>
		</motion.div>
	);
}

function RevealRow({
	children,
	delay,
	active,
}: {
	children: ReactNode;
	delay: number;
	active: boolean;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
			transition={{ duration: 0.4, ease: "easeOut", delay }}
		>
			{children}
		</motion.div>
	);
}

function SectionHeader({
	label,
	rightGear,
	tone = "neutral",
}: {
	label: string;
	rightGear?: boolean;
	tone?: "neutral" | "danger";
}) {
	return (
		<div className="mb-1.5 flex items-center gap-1.5">
			<span
				className="text-[12.5px]"
				style={{ color: tone === "danger" ? GH.danger : GH.text }}
			>
				{label}
			</span>
			<ChevronDown size={11} style={{ color: GH.muted }} />
			{rightGear ? (
				<Settings
					size={13}
					style={{ color: GH.muted, marginLeft: "auto" }}
				/>
			) : null}
		</div>
	);
}

function CheckRowView({
	row,
	resolved,
}: {
	row: CheckRow;
	resolved: boolean;
}) {
	const state: RowFinal | "pending" = resolved ? row.finalState : "pending";

	return (
		<div className="flex items-center gap-2.5 py-1.5 pl-1">
			<StatusIndicator state={state} />
			{row.mark === "cursor" ? <CursorMark /> : <GithubMark />}
			<span
				className="truncate text-[12.5px]"
				style={{ color: GH.textStrong }}
			>
				{row.name}
			</span>
			<AnimatePresence mode="wait">
				<motion.span
					key={state}
					initial={{ opacity: 0, x: -3 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 3 }}
					transition={{ duration: 0.2 }}
					className="truncate text-[12px]"
					style={{
						color: state === "fail" ? GH.danger : GH.muted,
					}}
				>
					{state === "pending" ? row.pendingMeta : row.resolvedMeta}
				</motion.span>
			</AnimatePresence>
			<MoreHorizontal
				size={13}
				style={{ color: GH.muted, marginLeft: "auto" }}
			/>
		</div>
	);
}

function StatusIndicator({ state }: { state: RowFinal | "pending" }) {
	if (state === "pending") return <SpinnerDot />;
	if (state === "success") {
		return (
			<svg
				width={13}
				height={13}
				viewBox="0 0 13 13"
				aria-hidden
				style={{ flexShrink: 0 }}
			>
				<path
					d="M3 6.6 L5.8 9.4 L10 4"
					fill="none"
					stroke={GH.success}
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		);
	}
	// fail
	return (
		<X
			size={13}
			strokeWidth={3}
			style={{ color: GH.danger, flexShrink: 0 }}
		/>
	);
}

function SpinnerDot() {
	return (
		<motion.div
			className="shrink-0"
			style={{ width: 13, height: 13 }}
			animate={{ rotate: 360 }}
			transition={{ repeat: Infinity, duration: 1.05, ease: "linear" }}
			aria-hidden
		>
			<svg width={13} height={13} viewBox="0 0 13 13">
				<circle
					cx="6.5"
					cy="6.5"
					r="5"
					fill="none"
					stroke={GH.attention}
					strokeOpacity={0.25}
					strokeWidth="1.6"
				/>
				<path
					d="M 6.5 1.5 A 5 5 0 0 1 11.5 6.5"
					fill="none"
					stroke={GH.attention}
					strokeWidth="1.6"
					strokeLinecap="round"
				/>
			</svg>
		</motion.div>
	);
}

function ChecksHeaderRing({ state }: { state: "pending" | "failed" }) {
	if (state === "failed") {
		return (
			<div
				className="mt-0.5 flex size-6 shrink-0 items-center justify-center"
				aria-hidden
			>
				<svg width={24} height={24} viewBox="0 0 28 28">
					<circle
						cx="14"
						cy="14"
						r="11"
						fill="none"
						stroke={GH.danger}
						strokeWidth="3"
					/>
					<path
						d="M 9 9 L 19 19 M 19 9 L 9 19"
						stroke={GH.danger}
						strokeWidth="3"
						strokeLinecap="round"
					/>
				</svg>
			</div>
		);
	}
	return (
		<motion.div
			className="mt-0.5 shrink-0"
			style={{ width: 24, height: 24 }}
			animate={{ rotate: 360 }}
			transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
			aria-hidden
		>
			<svg width={24} height={24} viewBox="0 0 28 28">
				<circle
					cx="14"
					cy="14"
					r="11"
					fill="none"
					stroke={GH.attention}
					strokeOpacity={0.25}
					strokeWidth="3"
				/>
				<path
					d="M 14 3 A 11 11 0 0 1 25 14"
					fill="none"
					stroke={GH.attention}
					strokeWidth="3"
					strokeLinecap="round"
				/>
			</svg>
		</motion.div>
	);
}

function GithubMark() {
	return (
		<div
			className="flex size-[16px] shrink-0 items-center justify-center rounded-sm"
			style={{ background: "#0d1117", border: `1px solid ${GH.border}` }}
		>
			<svg
				width={10}
				height={10}
				viewBox="0 0 16 16"
				fill={GH.text}
				aria-hidden
			>
				<path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
			</svg>
		</div>
	);
}

function CursorMark() {
	return (
		<div
			className="flex size-[16px] shrink-0 items-center justify-center rounded-sm"
			style={{ background: "#0d1117", border: `1px solid ${GH.border}` }}
		>
			<svg width={10} height={10} viewBox="0 0 16 16" aria-hidden>
				<path
					d="M8 1.5L14 5v6l-6 3.5L2 11V5l6-3.5z"
					fill="none"
					stroke={GH.text}
					strokeWidth="1.25"
					strokeLinejoin="round"
				/>
				<path
					d="M8 1.5L14 5l-6 3.5L2 5l6-3.5zM8 8.5v6"
					fill="none"
					stroke={GH.text}
					strokeWidth="1.25"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

function SendButton({ enabled }: { enabled: boolean }) {
	const bg = enabled ? GH.successBg : GH.cardHi;
	const bgHi = enabled ? GH.successBgHi : GH.cardHi;
	const color = enabled ? "#fff" : GH.muted;
	const border = enabled ? GH.successBgHi : GH.border;
	const opacity = enabled ? 1 : 0.55;
	return (
		<motion.div
			className="flex shrink-0 items-stretch overflow-hidden rounded-md"
			style={{ border: `1px solid ${border}`, opacity }}
		>
			<div
				className="whitespace-nowrap px-3 py-1 text-[12.5px] font-medium"
				style={{ background: bg, color }}
			>
				Send to 247 candidates
			</div>
			<div
				className="flex w-7 shrink-0 items-center justify-center"
				style={{
					background: bgHi,
					borderLeft: `1px solid ${border}`,
					color,
				}}
			>
				<ChevronDown size={13} />
			</div>
		</motion.div>
	);
}

/* ============================ RIGHT — sandbox ============================ */

const SHEEN_BLUE = "#51a2ff";

function SandboxPanel({
	isSlideActive,
	step,
}: {
	isSlideActive: boolean;
	step: number;
}) {
	const running = step >= 1 && step < 8;
	const done = step >= 8;
	const typing = step >= 1;

	// Type the full code over ~1.4s once running.
	const [typed, setTyped] = useState(0);
	useEffect(() => {
		if (!isSlideActive || !typing) {
			setTyped(0);
			return;
		}
		setTyped(0);
		let n = 0;
		const id = setInterval(() => {
			n += 2;
			setTyped(Math.min(n, SANDBOX_CODE.length));
			if (n >= SANDBOX_CODE.length) clearInterval(id);
		}, 24);
		return () => clearInterval(id);
	}, [isSlideActive, typing]);

	const fullText = typing ? SANDBOX_CODE.slice(0, typed) : "";
	const HEAD_WORDS = 4;
	const stillTyping = typed < SANDBOX_CODE.length;
	const wordStarts = [...fullText.matchAll(/\S+/g)].map((m) => m.index ?? 0);
	const wordHead =
		wordStarts.length > HEAD_WORDS
			? (wordStarts[wordStarts.length - HEAD_WORDS] ?? 0)
			: 0;
	const headStart = stillTyping ? wordHead : fullText.length;

	let pos = 0;
	const codeLines = fullText.split("\n").map((line) => {
		const segs = highlight(line).map((seg) => {
			pos += seg.t.length;
			return { ...seg, end: pos };
		});
		pos += 1; // newline
		return segs;
	});

	const stageState = (i: number): "idle" | "running" | "done" => {
		const s = STAGES[i];
		if (step < s.from) return "idle";
		if (step < s.to) return "running";
		return "done";
	};

	return (
		<motion.div
			className="flex h-full w-full flex-col overflow-hidden bg-[#0c0c0e]"
			initial={{ opacity: 0, y: 16 }}
			animate={
				isSlideActive
					? {
							opacity: 1,
							y: 0,
							boxShadow: running
								? "0 0 0 1px #51a2ff, 0 16px 46px -16px rgba(81,162,255,0.5)"
								: "0 0 0 1px rgba(255,255,255,0.09), 0 22px 60px -26px rgba(0,0,0,0.7)",
						}
					: { opacity: 0, y: 16 }
			}
			transition={{
				opacity: {
					duration: 0.5,
					ease: [0.34, 1.18, 0.6, 1],
					delay: CARD_DELAY + 0.05,
				},
				y: {
					duration: 0.5,
					ease: [0.34, 1.18, 0.6, 1],
					delay: CARD_DELAY + 0.05,
				},
				boxShadow: { duration: 0.4 },
			}}
		>
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.015] px-3 py-2">
				<div className="flex min-w-0 items-center gap-2">
					<CpuLights active={running} cols={9} />
					<span className="truncate font-mono text-[9.5px] uppercase tracking-wider text-white/40">
						composio_sandbox · python 3.11
					</span>
				</div>
				<span className="shrink-0 font-mono text-[9px] tabular-nums text-white/30">
					{done ? (
						<span className="flex items-center gap-1 text-green-400/80">
							<Check className="size-3" />
							done
						</span>
					) : running ? (
						"pid:4821"
					) : (
						""
					)}
				</span>
			</div>

			{/* Code */}
			<div className="flex-1 px-3 py-3">
				{codeLines.map((segs, i) => (
					<div
						className="whitespace-pre font-mono text-[10.5px] leading-[1.65]"
						// biome-ignore lint/suspicious/noArrayIndexKey: static code lines
						key={i}
					>
						{segs.map((seg, j) => {
							const head = stillTyping && seg.end > headStart;
							return (
								<span
									key={`${i}-${j}`}
									style={{
										color: head ? SHEEN_BLUE : segColor(seg.c),
										textShadow: head
											? "0 0 6px rgba(81,162,255,1), 0 0 14px rgba(81,162,255,0.85), 0 0 26px rgba(81,162,255,0.5)"
											: "0 0 0 rgba(81,162,255,0)",
										transition:
											"color 0.6s ease-out, text-shadow 0.9s ease-out",
									}}
								>
									{seg.t}
								</span>
							);
						})}
					</div>
				))}
			</div>

			{/* Stage stripe */}
			<div className="shrink-0 border-t border-white/[0.06] bg-white/[0.015]">
				{STAGES.map((s, i) => {
					const st = stageState(i);
					const isDanger = s.tone === "danger" && st === "done";
					const rowHeight = isDanger ? 38 : 30;
					return (
						<motion.div
							animate={{
								height: step >= 1 ? rowHeight : 0,
								opacity: step >= 1 ? 1 : 0,
								backgroundColor: isDanger
									? "rgba(248,81,73,0.10)"
									: "rgba(0,0,0,0)",
							}}
							className="flex items-center gap-2 overflow-hidden px-3 font-mono text-[10px]"
							initial={false}
							key={s.task}
							transition={{
								duration: 0.35,
								delay: step >= 1 ? 0.12 + i * 0.12 : 0,
								ease: [0.22, 1, 0.36, 1],
							}}
						>
							<span
								className={cn(
									"tabular-nums",
									isDanger ? "text-[#f85149]/70" : "text-white/25",
								)}
							>
								{i + 1}
							</span>
							{st === "running" ? (
								<Spinner className="size-2.5" />
							) : st === "done" ? (
								isDanger ? (
									<motion.div
										initial={{ scale: 0.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{
											type: "spring",
											stiffness: 360,
											damping: 14,
										}}
									>
										<AlertTriangle
											className="size-3.5"
											strokeWidth={2.4}
											style={{ color: "#f85149" }}
										/>
									</motion.div>
								) : (
									<Check className="size-3 text-green-400/70" />
								)
							) : (
								<span className="size-1.5 rounded-full bg-white/15" />
							)}
							<span
								className={cn(
									"min-w-0 flex-1 truncate uppercase tracking-wider",
									isDanger
										? "font-semibold text-[#f85149]"
										: st === "running"
											? "text-[#51a2ff]"
											: st === "done"
												? "text-white/55"
												: "text-white/30",
								)}
							>
								{s.task}
							</span>
							{st === "done" && (
								<span
									className={cn(
										"shrink-0",
										isDanger
											? "font-semibold tracking-wider text-[#f85149]"
											: "text-green-400/70",
									)}
								>
									{s.result}
								</span>
							)}
						</motion.div>
					);
				})}
			</div>
		</motion.div>
	);
}

/* ============================ Sandbox primitives ============================ */

function noise2d(x: number, y: number, t: number): number {
	const n = Math.sin(x * 12.9898 + y * 78.233 + t * 43.758) * 43758.5453;
	return n - Math.floor(n);
}

function CpuLights({ active, cols = 9 }: { active: boolean; cols?: number }) {
	const ROWS = 2;
	const [tick, setTick] = useState(0);
	useEffect(() => {
		if (!active) return;
		const id = setInterval(() => setTick((t) => t + 1), 80);
		return () => clearInterval(id);
	}, [active]);
	return (
		<div
			className="inline-grid gap-[2px]"
			style={{
				gridTemplateColumns: `repeat(${cols}, 5px)`,
				gridTemplateRows: `repeat(${ROWS}, 5px)`,
			}}
		>
			{Array.from({ length: ROWS * cols }).map((_, idx) => {
				const col = idx % cols;
				const row = Math.floor(idx / cols);
				const wave =
					Math.sin((col * 0.5 - tick * 0.15) * Math.PI) * 0.5 + 0.5;
				const n =
					noise2d(col * 0.6, row * 0.7, tick * 0.08) * 0.4 + wave * 0.6;
				const lit = active && n > 0.25;
				const brightness = n > 0.7 ? 2 : n > 0.5 ? 1 : 0;
				return (
					<div
						className={cn(
							"h-[5px] w-[5px] transition-colors duration-300",
							!lit && "bg-white/[0.04]",
							lit && brightness === 2 && "bg-[#51a2ff]",
							lit && brightness === 1 && "bg-[#51a2ff]/70",
							lit && brightness === 0 && "bg-[#51a2ff]/40",
						)}
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed grid
						key={idx}
					/>
				);
			})}
		</div>
	);
}

function Spinner({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				"size-3 shrink-0 animate-spin rounded-full border-2 border-[#51a2ff]/25 border-t-[#51a2ff]",
				className,
			)}
		/>
	);
}

function Check({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={cn("size-3.5 shrink-0", className)}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2.5}
			viewBox="0 0 24 24"
		>
			<path d="M5 13l4 4L19 7" />
		</svg>
	);
}

/* ============================ Syntax highlighter ============================ */

const FNS = new Set(["sandbox.gmail.search", "sandbox.gmail.send", "draft.render", "len"]);

function highlight(line: string) {
	const re =
		/('[^']*'|"[^"]*")|(#.*$)|\b(sandbox\.gmail\.search|sandbox\.gmail\.send|draft\.render|len)\b|\b(True|False|None|if|not|in|for|while|break)\b/g;
	const out: { t: string; c?: string }[] = [];
	let last = 0;
	let m: RegExpExecArray | null = re.exec(line);
	while (m !== null) {
		if (m.index > last) out.push({ t: line.slice(last, m.index) });
		if (m[1]) out.push({ t: m[1], c: "string" });
		else if (m[2]) out.push({ t: m[2], c: "comment" });
		else if (m[3]) out.push({ t: m[3], c: FNS.has(m[3]) ? "fn" : undefined });
		else if (m[4]) out.push({ t: m[4], c: "keyword" });
		last = re.lastIndex;
		m = re.exec(line);
	}
	if (last < line.length) out.push({ t: line.slice(last) });
	return out;
}

function segColor(c?: string): string {
	switch (c) {
		case "string":
			return "#7ee787";
		case "keyword":
			return "#d2a8ff";
		case "fn":
			return "#51a2ff";
		case "comment":
			return "rgba(255,255,255,0.28)";
		default:
			return "rgba(255,255,255,0.55)";
	}
}
