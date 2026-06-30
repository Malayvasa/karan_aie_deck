"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	ChevronDown,
	ChevronUp,
	FileCode2,
	FileText,
	GitPullRequest,
	MoreHorizontal,
	Settings,
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

// GitHub (dark) palette — matched to CodebaseBentoSlide / ContextInCodeSlide so
// the code-side surface stays consistent.
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
} as const;

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

// Pacing — card first, then sections inside, then checks resolve in lockstep.
const CARD_DELAY = 0.45;
const SECTION_STAGGER = 0.18;
const SECTION_BASE_DELAY = CARD_DELAY + 0.15;

// Right column lands alongside the left card with a small stagger so the
// composition completes early and the audience can scan both halves.
const RIGHT_FILE_DELAY = CARD_DELAY + 0.15;
const RIGHT_SKILL_DELAY = RIGHT_FILE_DELAY + 0.35;

const FIRST_RESOLVE_MS = 1500;
const RESOLVE_STEP_MS = 520;

type RowFinal = "success" | "neutral";

type CheckRow = {
	name: string;
	pendingMeta: string;
	resolvedMeta: string;
	finalState: RowFinal;
	mark: "github" | "cursor";
};

const CHECKS: CheckRow[] = [
	{
		name: "Cursor Bugbot",
		pendingMeta: "Queued",
		resolvedMeta: "Completed in 1m — Bugbot Review",
		finalState: "neutral",
		mark: "cursor",
	},
	{
		name: "CI — lint, tests / checks (pull_request)",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 4m",
		finalState: "success",
		mark: "github",
	},
	{
		name: "CI: Tenant Data Isolation / Block raw db/clickhouse imports and unscoped queries in tRPC r…",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 38s",
		finalState: "success",
		mark: "github",
	},
	{
		name: "CI: Typecheck / tsgo typecheck (pull_request)",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 1m 12s",
		finalState: "success",
		mark: "github",
	},
	{
		name: "Code scanning results / CodeQL",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 3s — No new alerts in code changed by this pull req…",
		finalState: "success",
		mark: "github",
	},
	{
		name: "CodeQL / Analyze (actions) (dynamic)",
		pendingMeta: "In progress",
		resolvedMeta: "Successful in 44s",
		finalState: "success",
		mark: "github",
	},
];

const SUCCESS_COUNT = CHECKS.filter((c) => c.finalState === "success").length;

export function VerificationInCodeSlide() {
	return (
		<DeckSlide primitive="verification">
			<VerificationInCodeBody />
		</DeckSlide>
	);
}

function VerificationInCodeBody() {
	const { isSlideActive } = useContext(SlideContext);
	const [resolvedCount, setResolvedCount] = useState(0);

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

	const allResolved = resolvedCount >= CHECKS.length;
	const headerState: "pending" | "passed" = allResolved ? "passed" : "pending";

	return (
		<>
			<div
				className="flex flex-1 items-center justify-center"
				style={{ fontFamily: SANS }}
			>
				<div
					className="flex w-full gap-6"
					style={{ maxWidth: 1100, height: 470 }}
				>
					{/* ====================== LEFT: merge box ====================== */}
					<div
						className="relative shrink-0"
						style={{ width: 520 }}
					>
						<div className="absolute inset-0 flex items-center">
							<motion.div
								className="flex w-full overflow-hidden rounded-md"
								style={{
									background: GH.card,
									border: `1px solid ${GH.border}`,
								}}
								initial={{ opacity: 0, y: 16 }}
								animate={
									isSlideActive
										? { opacity: 1, y: 0 }
										: { opacity: 0, y: 16 }
								}
								transition={{
									duration: 0.5,
									ease: [0.34, 1.18, 0.6, 1],
									delay: CARD_DELAY,
								}}
							>
								{/* Left timeline rail */}
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
									{/* Checks header — pending → passed */}
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
															style={{ color: GH.textStrong }}
														>
															{headerState === "pending"
																? "Running checks…"
																: "All checks have passed"}
														</div>
														<div
															className="mt-0.5 text-[12.5px]"
															style={{ color: GH.muted }}
														>
															{headerState === "pending"
																? `${resolvedCount} of ${CHECKS.length} complete`
																: `1 neutral, ${SUCCESS_COUNT} successful checks`}
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

									{/* Check list — every row pending, resolves in order. */}
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
														? "1 neutral check"
														: "checks"
												}
												rightGear
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

									{/* Active merge button — green once all checks pass,
									    GH.cardHi/disabled while still running. */}
									<RevealRow
										delay={SECTION_BASE_DELAY + SECTION_STAGGER * 2}
										active={isSlideActive}
									>
										<div className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px]">
											<MergeButton enabled={allResolved} />
											<span
												className="truncate"
												style={{ color: GH.muted }}
											>
												You can also merge with the command line.{" "}
												<span
													style={{
														color: GH.link,
														textDecoration: "underline",
													}}
												>
													View instructions.
												</span>
											</span>
										</div>
									</RevealRow>
								</div>
							</motion.div>
						</div>
					</div>

					{/* ===================== RIGHT: file + skill ===================== */}
					<div className="flex min-w-0 flex-1 flex-col gap-3">
						<FilePanel
							isActive={isSlideActive}
							delay={RIGHT_FILE_DELAY}
						/>
						<SkillPanel
							isActive={isSlideActive}
							delay={RIGHT_SKILL_DELAY}
						/>
					</div>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="verificationInCode" />
			</Notes>
		</>
	);
}

/* ============================ Right column ============================== */

function FilePanel({
	isActive,
	delay,
}: {
	isActive: boolean;
	delay: number;
}) {
	return (
		<motion.div
			className="flex flex-1 flex-col overflow-hidden rounded-md"
			style={{
				background: GH.card,
				border: `1px solid ${GH.border}`,
			}}
			initial={{ opacity: 0, y: 14 }}
			animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
			transition={{
				duration: 0.5,
				ease: [0.34, 1.18, 0.6, 1],
				delay,
			}}
		>
			<PanelHeader
				icon={FileCode2}
				path="packages/api/src/customers.controller.ts"
				meta="Edited just now"
			/>
			<div
				className="flex-1 overflow-hidden font-mono"
				style={{
					background: GH.card,
					color: GH.text,
					fontSize: 12,
					lineHeight: 1.6,
					padding: "10px 14px",
				}}
			>
				<CodeFile />
			</div>
		</motion.div>
	);
}

function SkillPanel({
	isActive,
	delay,
}: {
	isActive: boolean;
	delay: number;
}) {
	return (
		<motion.div
			className="flex flex-1 flex-col overflow-hidden rounded-md"
			style={{
				background: GH.card,
				border: `1px solid ${GH.border}`,
			}}
			initial={{ opacity: 0, y: 14 }}
			animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
			transition={{
				duration: 0.5,
				ease: [0.34, 1.18, 0.6, 1],
				delay,
			}}
		>
			<PanelHeader
				icon={FileText}
				path=".claude/skills/api-handlers/SKILL.md"
				meta={
					<span
						className="rounded-full px-2 py-[1px] font-mono text-[10.5px] uppercase tracking-wider"
						style={{
							background: GH.attentionSoft,
							color: GH.attention,
							border: `1px solid rgba(210,153,34,0.35)`,
						}}
					>
						skill
					</span>
				}
			/>
			<div
				className="flex-1 overflow-hidden"
				style={{
					background: GH.card,
					color: GH.text,
					fontFamily: SANS,
					fontSize: 12.5,
					lineHeight: 1.55,
					padding: "10px 14px",
				}}
			>
				<SkillBody />
			</div>
		</motion.div>
	);
}

function PanelHeader({
	icon: Icon,
	path,
	meta,
}: {
	icon: typeof FileCode2;
	path: string;
	meta?: ReactNode;
}) {
	return (
		<div
			className="flex items-center gap-2 px-3.5 py-2"
			style={{
				borderBottom: `1px solid ${GH.borderMuted}`,
				background: GH.bg,
			}}
		>
			<Icon size={13} strokeWidth={2} style={{ color: GH.muted }} />
			<span
				className="truncate font-mono text-[12.5px] font-medium tracking-tight"
				style={{ color: GH.textStrong }}
			>
				{path}
			</span>
			{meta ? (
				<div
					className="ml-auto flex shrink-0 items-center text-[11px]"
					style={{ color: GH.muted }}
				>
					{meta}
				</div>
			) : null}
		</div>
	);
}

const SYN = {
	keyword: "#ff7b72",
	identifier: "#79c0ff",
	string: "#a5d6ff",
	param: "#ffa657",
	comment: "#8b949e",
	plain: GH.text,
} as const;

type Tok = { t: string; c?: string };

function CodeLine({ tokens }: { tokens: Tok[] }) {
	return (
		<div className="whitespace-pre">
			{tokens.map((tok, i) => (
				<span key={i} style={{ color: tok.c ?? SYN.plain }}>
					{tok.t}
				</span>
			))}
		</div>
	);
}

function Blank() {
	return <div style={{ height: "0.7em" }} />;
}

function CodeFile() {
	return (
		<>
			<CodeLine
				tokens={[
					{ t: "import", c: SYN.keyword },
					{ t: " { " },
					{ t: "Controller", c: SYN.identifier },
					{ t: ", " },
					{ t: "Get", c: SYN.identifier },
					{ t: " } " },
					{ t: "from", c: SYN.keyword },
					{ t: " " },
					{ t: '"@acme/http"', c: SYN.string },
				]}
			/>
			<Blank />
			<CodeLine
				tokens={[
					{ t: "@" },
					{ t: "Controller", c: SYN.identifier },
					{ t: "(" },
					{ t: '"/customers"', c: SYN.string },
					{ t: ")" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "export", c: SYN.keyword },
					{ t: " " },
					{ t: "class", c: SYN.keyword },
					{ t: " " },
					{ t: "CustomersController", c: SYN.identifier },
					{ t: " {" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "  @" },
					{ t: "AuthRequired", c: SYN.identifier },
					{ t: "()" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "  @" },
					{ t: "Audited", c: SYN.identifier },
					{ t: "(" },
					{ t: '"customer.read"', c: SYN.string },
					{ t: ")" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "  @" },
					{ t: "RateLimited", c: SYN.identifier },
					{ t: "(" },
					{ t: '"standard"', c: SYN.string },
					{ t: ")" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "  @" },
					{ t: "Get", c: SYN.identifier },
					{ t: "(" },
					{ t: '"/:id"', c: SYN.string },
					{ t: ")" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "  " },
					{ t: "async", c: SYN.keyword },
					{ t: " " },
					{ t: "findOne", c: SYN.identifier },
					{ t: "(" },
					{ t: "id", c: SYN.param },
					{ t: ": " },
					{ t: "string", c: SYN.keyword },
					{ t: ") {" },
				]}
			/>
			<CodeLine
				tokens={[
					{ t: "    " },
					{ t: "return", c: SYN.keyword },
					{ t: " " },
					{ t: "this", c: SYN.keyword },
					{ t: ".repo." },
					{ t: "findOne", c: SYN.identifier },
					{ t: "(" },
					{ t: "id", c: SYN.param },
					{ t: ")" },
				]}
			/>
			<CodeLine tokens={[{ t: "  }" }]} />
			<CodeLine tokens={[{ t: "}" }]} />
		</>
	);
}

function SkillBody() {
	// Lightweight markdown-ish render — frontmatter block, then rules.
	const rules: Array<{ deco: string; note: string }> = [
		{ deco: "@AuthRequired()", note: "over every route" },
		{ deco: "@Audited('<entity>.<action>')", note: "for reads" },
		{ deco: "@RateLimited('standard')", note: "tenant-bound calls" },
	];
	return (
		<div className="flex flex-col gap-2">
			<div
				className="rounded-sm px-2.5 py-1.5 font-mono text-[11.5px]"
				style={{
					background: GH.bg,
					border: `1px solid ${GH.borderMuted}`,
					color: GH.muted,
				}}
			>
				<div>
					<span style={{ color: SYN.keyword }}>---</span>
				</div>
				<div>
					<span style={{ color: SYN.identifier }}>name</span>
					{": "}
					<span style={{ color: SYN.string }}>api-handlers</span>
				</div>
				<div>
					<span style={{ color: SYN.identifier }}>description</span>
					{": "}
					<span style={{ color: SYN.string }}>
						Conventions for HTTP controllers in @acme/api.
					</span>
				</div>
				<div>
					<span style={{ color: SYN.keyword }}>---</span>
				</div>
			</div>

			<div className="mt-0.5">
				<span style={{ color: GH.textStrong, fontWeight: 600 }}>
					Every route handler MUST stack:
				</span>
			</div>
			<div className="flex flex-col gap-1 pl-3">
				{rules.map((r) => (
					<div
						key={r.deco}
						className="flex items-baseline gap-2"
					>
						<span
							className="font-mono text-[11.5px]"
							style={{
								color: GH.attention,
								background: GH.attentionSoft,
								padding: "1px 6px",
								borderRadius: 3,
								border: `1px solid rgba(210,153,34,0.25)`,
							}}
						>
							{r.deco}
						</span>
						<span style={{ color: GH.muted, fontSize: 11.5 }}>
							— {r.note}
						</span>
					</div>
				))}
			</div>

			<div className="mt-1">
				<span style={{ color: GH.textStrong, fontWeight: 600 }}>
					NEVER
				</span>{" "}
				<span style={{ color: GH.muted }}>
					import{" "}
					<span
						className="font-mono"
						style={{ color: GH.text }}
					>
						@acme/db
					</span>{" "}
					directly — go via{" "}
					<span
						className="font-mono"
						style={{ color: GH.text }}
					>
						@acme/repos
					</span>
					.
				</span>
			</div>
		</div>
	);
}

/* ============================== Helpers ================================= */

function MergeButton({ enabled }: { enabled: boolean }) {
	const bg = enabled ? GH.successBg : GH.cardHi;
	const bgHi = enabled ? GH.successBgHi : GH.cardHi;
	const color = enabled ? "#fff" : GH.muted;
	const border = enabled ? GH.successBgHi : GH.border;
	const opacity = enabled ? 1 : 0.55;
	return (
		<motion.div
			className="flex shrink-0 items-stretch overflow-hidden rounded-md"
			style={{ border: `1px solid ${border}`, opacity }}
			animate={{ scale: enabled ? [1, 1.04, 1] : 1 }}
			transition={{ duration: 0.45, ease: "easeOut" }}
		>
			<div
				className="whitespace-nowrap px-3 py-1 text-[12.5px] font-medium"
				style={{ background: bg, color }}
			>
				Merge pull request
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
}: {
	label: string;
	rightGear?: boolean;
}) {
	return (
		<div className="mb-1.5 flex items-center gap-1.5">
			<span className="text-[12.5px]" style={{ color: GH.text }}>
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
					style={{ color: GH.muted }}
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
	if (state === "pending") {
		return <SpinnerDot />;
	}
	if (state === "success") {
		return (
			<Check
				size={13}
				strokeWidth={3}
				style={{ color: GH.success, flexShrink: 0 }}
			/>
		);
	}
	// neutral
	return (
		<span
			className="inline-block size-[10px] shrink-0 rounded-[2px]"
			style={{ background: "#6e7681" }}
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

function ChecksHeaderRing({
	state,
}: {
	state: "pending" | "passed";
}) {
	if (state === "passed") {
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
						stroke={GH.success}
						strokeWidth="3"
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
