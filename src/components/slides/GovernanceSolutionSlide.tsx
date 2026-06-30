"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertOctagon, Check, Mail, Trash2, X } from "lucide-react";
import {
	useContext,
	useEffect,
	useState,
	type ComponentType,
	type ReactNode,
} from "react";
import { Notes, SlideContext } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';
const MONO =
	'"JetBrains Mono", "SF Mono", Menlo, Consolas, "Courier New", monospace';

// Composio surface — clean light theme with dark text.
const C = {
	bg: "#fafafa",
	surface: "#ffffff",
	surfaceAlt: "#f7f8fa",
	border: "#e5e7eb",
	borderMuted: "#eef0f3",
	text: "#0f172a",
	textMuted: "#64748b",
	textFaint: "#94a3b8",
	accent: "#0f172a",
	accentSoft: "rgba(15,23,42,0.06)",
	success: "#16a34a",
	successSoft: "#dcfce7",
	successBorder: "#bbf7d0",
	danger: "#dc2626",
	dangerSoft: "#fee2e2",
	dangerBorder: "#fecaca",
	dangerLine: "#f87171",
	composio: "#0f172a",
	flowLine: "#cbd5e1",
} as const;

type Action = {
	at: number;
	tool: string;
	arg: string;
	result: "allowed" | "blocked";
	reason?: string;
};

const ACTIONS: Action[] = [
	{
		at: 1400,
		tool: "gmail.read",
		arg: "in:inbox · 50",
		result: "allowed",
	},
	{
		at: 2000,
		tool: "github.view",
		arg: "repo:acme/api",
		result: "allowed",
	},
	{
		at: 2600,
		tool: "gmail.send",
		arg: "candidate@acme.com",
		result: "allowed",
	},
	{
		at: 3300,
		tool: "gmail.delete",
		arg: "200 messages",
		result: "blocked",
		reason: "policy: max 10 destructive / call",
	},
	{
		at: 4000,
		tool: "github.push",
		arg: "main branch",
		result: "blocked",
		reason: "scope: not granted",
	},
	{
		at: 4700,
		tool: "gmail.send",
		arg: "external@spam.com",
		result: "blocked",
		reason: "policy: outbound = @acme.com",
	},
];

const POLICIES: Array<{
	icon: ComponentType<{
		size?: number;
		strokeWidth?: number;
		color?: string;
		style?: React.CSSProperties;
	}>;
	rule: string;
	value: string;
}> = [
	{ icon: Trash2, rule: "max destructive ops", value: "10 / call" },
	{ icon: Mail, rule: "outbound email", value: "@acme.com only" },
	{ icon: AlertOctagon, rule: "confirm on bulk", value: "any > 25 records" },
];

export function GovernanceSolutionSlide() {
	return (
		<DeckSlide>
			<GovernanceSolutionBody />
		</DeckSlide>
	);
}

function GovernanceSolutionBody() {
	const { isSlideActive } = useContext(SlideContext);
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (!isSlideActive) {
			setElapsed(0);
			return;
		}
		const start = performance.now();
		let raf = 0;
		const tick = () => {
			setElapsed(performance.now() - start);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [isSlideActive]);

	const visibleActions = ACTIONS.filter((a) => elapsed >= a.at);

	return (
		<>
			<div
				className="flex flex-1 items-center justify-center"
				style={{ fontFamily: SANS }}
			>
				<div
					className="flex w-full items-stretch gap-4"
					style={{ maxWidth: 1140, height: 510 }}
				>
					{/* LEFT — Agent flow chart (matches the reference) */}
					<div
						className="relative flex shrink-0 flex-col gap-3"
						style={{ width: 580 }}
					>
						<SectionLabel
							active={isSlideActive}
							delay={0.15}
						>
							Scoped access via Composio
						</SectionLabel>
						<div className="relative flex-1">
							<AgentFlowChart active={isSlideActive} />
						</div>
					</div>

					{/* MIDDLE — connector + arrow into runtime */}
					<div
						className="relative flex shrink-0 items-center"
						style={{ width: 96 }}
					>
						<FlowConnector active={isSlideActive} />
					</div>

					{/* RIGHT — policy runtime */}
					<div className="relative flex flex-1 flex-col gap-3">
						<SectionLabel active={isSlideActive} delay={0.3}>
							Policy Runtime · enforced before execute
						</SectionLabel>
						<PolicyHeader active={isSlideActive} delay={0.55} />
						<ActionLog
							actions={visibleActions}
							active={isSlideActive}
							delay={0.75}
						/>
					</div>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="governanceSolution" />
			</Notes>
		</>
	);
}

function SectionLabel({
	children,
	active,
	delay,
}: {
	children: ReactNode;
	active: boolean;
	delay: number;
}) {
	return (
		<motion.div
			className="font-mono text-[10px] uppercase tracking-[0.18em]"
			style={{ color: C.textMuted }}
			initial={{ opacity: 0, y: 4 }}
			animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
			transition={{ duration: 0.35, ease: "easeOut", delay }}
		>
			{children}
		</motion.div>
	);
}

/* ========================== Agent flow chart =========================== */

// SVG layout coordinates (single coordinate system for nodes + lines).
const FC = {
	W: 580,
	H: 460,
	// Agent box
	agentX: 20,
	agentY: 200,
	agentW: 110,
	agentH: 44,
	// Composio gateway
	composioX: 165,
	composioY: 200,
	composioSize: 46,
	// Toolkits
	toolkitX: 280,
	toolkitSize: 40,
	gmailY: 90,
	githubY: 320,
	// Action labels — start at x=380; vertical positions per row
	actionX: 380,
	gmailRows: [50, 110, 170] as const, // READ, SEND, DELETE
	githubRows: [290, 350, 410] as const, // VIEW, PUSH, DELETE
} as const;

type GmailAction = { label: string; allowed: boolean };
type GithubAction = { label: string; allowed: boolean };

const GMAIL_ACTIONS: GmailAction[] = [
	{ label: "READ", allowed: true },
	{ label: "SEND", allowed: true },
	{ label: "DELETE", allowed: false },
];

const GITHUB_ACTIONS: GithubAction[] = [
	{ label: "VIEW", allowed: true },
	{ label: "PUSH", allowed: false },
	{ label: "DELETE", allowed: false },
];

function AgentFlowChart({ active }: { active: boolean }) {
	const agentRight = FC.agentX + FC.agentW; // 130
	const agentMidY = FC.agentY + FC.agentH / 2; // 222
	const composioLeft = FC.composioX; // 165
	const composioRight = FC.composioX + FC.composioSize; // 211
	const composioMidY = FC.composioY + FC.composioSize / 2; // 223
	const gmailLeft = FC.toolkitX; // 280
	const gmailRight = FC.toolkitX + FC.toolkitSize; // 320
	const gmailMidY = FC.gmailY + FC.toolkitSize / 2; // 110
	const githubMidY = FC.githubY + FC.toolkitSize / 2; // 340

	// Build path strings for the SVG lines.
	const agentToComposio = `M ${agentRight} ${agentMidY} L ${composioLeft} ${composioMidY}`;
	const composioToGmail = `M ${composioRight} ${composioMidY} C ${composioRight + 40} ${composioMidY}, ${gmailLeft - 35} ${gmailMidY}, ${gmailLeft} ${gmailMidY}`;
	const composioToGithub = `M ${composioRight} ${composioMidY} C ${composioRight + 40} ${composioMidY}, ${gmailLeft - 35} ${githubMidY}, ${gmailLeft} ${githubMidY}`;

	const gmailToAction = (y: number) =>
		`M ${gmailRight} ${gmailMidY} C ${gmailRight + 30} ${gmailMidY}, ${FC.actionX - 35} ${y}, ${FC.actionX - 5} ${y}`;
	const githubToAction = (y: number) =>
		`M ${gmailRight} ${githubMidY} C ${gmailRight + 30} ${githubMidY}, ${FC.actionX - 35} ${y}, ${FC.actionX - 5} ${y}`;

	return (
		<div
			className="relative h-full w-full"
			style={{ minHeight: FC.H }}
		>
			{/* SVG lines beneath the nodes */}
			<svg
				className="absolute inset-0 h-full w-full"
				viewBox={`0 0 ${FC.W} ${FC.H}`}
				preserveAspectRatio="xMidYMid meet"
				aria-hidden
			>
				<FlowPath d={agentToComposio} active={active} delay={0.25} />
				<FlowPath d={composioToGmail} active={active} delay={0.45} />
				<FlowPath d={composioToGithub} active={active} delay={0.45} />

				{GMAIL_ACTIONS.map((a, i) => (
					<FlowPath
						key={`gm-${a.label}`}
						d={gmailToAction(FC.gmailRows[i])}
						active={active}
						delay={0.7 + i * 0.06}
						dashed={!a.allowed}
					/>
				))}
				{GITHUB_ACTIONS.map((a, i) => (
					<FlowPath
						key={`gh-${a.label}`}
						d={githubToAction(FC.githubRows[i])}
						active={active}
						delay={0.7 + i * 0.06}
						dashed={!a.allowed}
					/>
				))}
			</svg>

			{/* Agent node */}
			<NodeWrap
				x={FC.agentX}
				y={FC.agentY}
				w={FC.agentW}
				h={FC.agentH}
				active={active}
				delay={0.1}
			>
				<div
					className="flex h-full w-full items-center justify-center rounded-md"
					style={{
						background: C.surfaceAlt,
						border: `1px solid ${C.border}`,
						fontFamily: MONO,
						fontSize: 13,
						color: C.text,
					}}
				>
					Agent
				</div>
			</NodeWrap>

			{/* Composio gateway */}
			<NodeWrap
				x={FC.composioX}
				y={FC.composioY}
				w={FC.composioSize}
				h={FC.composioSize}
				active={active}
				delay={0.35}
			>
				<ToolkitIcon slug="composio" />
			</NodeWrap>

			{/* Gmail toolkit */}
			<NodeWrap
				x={FC.toolkitX}
				y={FC.gmailY}
				w={FC.toolkitSize}
				h={FC.toolkitSize}
				active={active}
				delay={0.6}
			>
				<ToolkitIcon slug="gmail" />
			</NodeWrap>

			{/* GitHub toolkit */}
			<NodeWrap
				x={FC.toolkitX}
				y={FC.githubY}
				w={FC.toolkitSize}
				h={FC.toolkitSize}
				active={active}
				delay={0.6}
			>
				<ToolkitIcon slug="github" />
			</NodeWrap>

			{/* Action labels — Gmail */}
			{GMAIL_ACTIONS.map((a, i) => (
				<ActionLabel
					key={`gm-l-${a.label}`}
					x={FC.actionX}
					y={FC.gmailRows[i]}
					allowed={a.allowed}
					label={a.label}
					active={active}
					delay={0.85 + i * 0.06}
				/>
			))}
			{/* Action labels — GitHub */}
			{GITHUB_ACTIONS.map((a, i) => (
				<ActionLabel
					key={`gh-l-${a.label}`}
					x={FC.actionX}
					y={FC.githubRows[i]}
					allowed={a.allowed}
					label={a.label}
					active={active}
					delay={0.85 + i * 0.06}
				/>
			))}
		</div>
	);
}

function FlowPath({
	d,
	active,
	delay,
	dashed,
}: {
	d: string;
	active: boolean;
	delay: number;
	dashed?: boolean;
}) {
	const stroke = dashed ? C.dangerLine : C.flowLine;
	return (
		<motion.path
			d={d}
			fill="none"
			stroke={stroke}
			strokeWidth={1.5}
			strokeDasharray={dashed ? "4 4" : undefined}
			strokeOpacity={dashed ? 0.55 : 1}
			initial={{ pathLength: 0, opacity: 0 }}
			animate={
				active
					? { pathLength: 1, opacity: 1 }
					: { pathLength: 0, opacity: 0 }
			}
			transition={{
				pathLength: { duration: 0.5, ease: "easeOut", delay },
				opacity: { duration: 0.25, delay },
			}}
		/>
	);
}

function NodeWrap({
	x,
	y,
	w,
	h,
	active,
	delay,
	children,
}: {
	x: number;
	y: number;
	w: number;
	h: number;
	active: boolean;
	delay: number;
	children: ReactNode;
}) {
	const leftPct = `${(x / FC.W) * 100}%`;
	const topPct = `${(y / FC.H) * 100}%`;
	const widthPct = `${(w / FC.W) * 100}%`;
	const heightPct = `${(h / FC.H) * 100}%`;
	return (
		<motion.div
			className="absolute"
			style={{
				left: leftPct,
				top: topPct,
				width: widthPct,
				height: heightPct,
			}}
			initial={{ opacity: 0, scale: 0.92 }}
			animate={
				active
					? { opacity: 1, scale: 1 }
					: { opacity: 0, scale: 0.92 }
			}
			transition={{ duration: 0.4, ease: [0.34, 1.18, 0.6, 1], delay }}
		>
			{children}
		</motion.div>
	);
}

function ActionLabel({
	x,
	y,
	allowed,
	label,
	active,
	delay,
}: {
	x: number;
	y: number;
	allowed: boolean;
	label: string;
	active: boolean;
	delay: number;
}) {
	const leftPct = `${(x / FC.W) * 100}%`;
	const topPct = `${(y / FC.H) * 100}%`;
	return (
		<motion.div
			className="absolute flex -translate-y-1/2 items-center gap-2"
			style={{ left: leftPct, top: topPct }}
			initial={{ opacity: 0, x: -6 }}
			animate={
				active ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }
			}
			transition={{ duration: 0.35, ease: "easeOut", delay }}
		>
			{allowed ? (
				<Check
					size={12}
					strokeWidth={3}
					color={C.success}
					style={{ flexShrink: 0 }}
				/>
			) : (
				<X size={12} strokeWidth={3} color={C.dangerLine} />
			)}
			<span
				className="font-mono text-[12px] tracking-wider"
				style={{
					color: allowed ? C.success : C.textFaint,
					textDecoration: allowed ? "none" : "line-through",
					textDecorationColor: C.textFaint,
					fontWeight: 700,
				}}
			>
				{label}
			</span>
		</motion.div>
	);
}

function ToolkitIcon({ slug }: { slug: string }) {
	// Pulls the official toolkit logo from Composio's CDN. The CDN returns
	// inline SVG, so this stays crisp at any size and always matches Composio's
	// current branding.
	return (
		<div
			className="flex h-full w-full items-center justify-center rounded-md p-1"
			style={{
				background: "#fff",
				border: `1px solid ${C.borderMuted}`,
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={`https://logos.composio.dev/api/${slug}`}
				alt={`${slug} logo`}
				width={26}
				height={26}
				style={{ display: "block", objectFit: "contain" }}
			/>
		</div>
	);
}

/* ============================== Connector =============================== */

function FlowConnector({ active }: { active: boolean }) {
	const SHADOW =
		"drop-shadow(0 1px 1.5px rgba(15,23,42,0.18)) drop-shadow(0 0 1px rgba(15,23,42,0.25))";
	return (
		<motion.div
			className="relative flex w-full items-center"
			initial={{ opacity: 0 }}
			animate={active ? { opacity: 1 } : { opacity: 0 }}
			transition={{ duration: 0.5, delay: 1.0 }}
		>
			{/* Line stretches to fill the middle column end-to-end */}
			<div
				className="flex-1"
				style={{
					height: 2.4,
					background: "#ffffff",
					borderRadius: 2,
					filter: SHADOW,
				}}
			/>
			{/* Arrowhead — fixed size at the right end */}
			<svg
				width={14}
				height={20}
				viewBox="0 0 14 20"
				aria-hidden
				style={{ filter: SHADOW, marginLeft: -1 }}
			>
				<path
					d="M 1 3 L 11 10 L 1 17"
					fill="none"
					stroke="#ffffff"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</motion.div>
	);
}

/* ============================ Right column ============================== */

function PolicyHeader({
	active,
	delay,
}: {
	active: boolean;
	delay: number;
}) {
	return (
		<motion.div
			className="flex flex-col gap-2 rounded-lg px-3 py-2.5"
			style={{
				background: C.surface,
				border: `1px solid ${C.border}`,
				boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
			}}
			initial={{ opacity: 0, y: 12 }}
			animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
			transition={{ duration: 0.45, ease: [0.34, 1.18, 0.6, 1], delay }}
		>
			<div
				className="font-mono text-[10px] uppercase tracking-[0.16em]"
				style={{ color: C.textMuted }}
			>
				Policies
			</div>
			<div className="flex flex-wrap items-center gap-1.5">
				{POLICIES.map((p, i) => {
					const Icon = p.icon;
					return (
						<motion.div
							key={p.rule}
							className="flex items-center gap-1.5 rounded-md px-2 py-1"
							style={{
								background: C.surfaceAlt,
								border: `1px solid ${C.borderMuted}`,
							}}
							initial={{ opacity: 0, scale: 0.96 }}
							animate={
								active
									? { opacity: 1, scale: 1 }
									: { opacity: 0, scale: 0.96 }
							}
							transition={{
								duration: 0.3,
								ease: "easeOut",
								delay: delay + 0.15 + i * 0.07,
							}}
						>
							<Icon size={11} strokeWidth={2} color={C.textMuted} />
							<span
								className="text-[11px]"
								style={{ color: C.text }}
							>
								{p.rule}
							</span>
							<span
								className="font-mono text-[10.5px]"
								style={{ color: C.textMuted }}
							>
								{p.value}
							</span>
						</motion.div>
					);
				})}
			</div>
		</motion.div>
	);
}

function ActionLog({
	actions,
	active,
	delay,
}: {
	actions: Action[];
	active: boolean;
	delay: number;
}) {
	return (
		<motion.div
			className="flex flex-1 flex-col overflow-hidden rounded-lg"
			style={{
				background: C.surface,
				border: `1px solid ${C.border}`,
				boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
			}}
			initial={{ opacity: 0, y: 12 }}
			animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
			transition={{ duration: 0.45, ease: [0.34, 1.18, 0.6, 1], delay }}
		>
			<div
				className="flex items-center justify-between px-3 py-2"
				style={{ borderBottom: `1px solid ${C.borderMuted}` }}
			>
				<span
					className="font-mono text-[10px] uppercase tracking-[0.16em]"
					style={{ color: C.textMuted }}
				>
					Action log · live
				</span>
				<span
					className="font-mono text-[10px] tabular-nums"
					style={{ color: C.textFaint }}
				>
					{actions.length} / {ACTIONS.length}
				</span>
			</div>
			<div className="flex flex-1 flex-col">
				<AnimatePresence initial={false}>
					{actions.map((a) => (
						<ActionRow key={`${a.at}-${a.tool}`} action={a} />
					))}
				</AnimatePresence>
				{actions.length < ACTIONS.length ? (
					<div
						className="mt-auto px-3 py-2 font-mono text-[10px]"
						style={{ color: C.textFaint }}
					>
						waiting on next call…
					</div>
				) : null}
			</div>
		</motion.div>
	);
}

function ActionRow({ action }: { action: Action }) {
	const isBlocked = action.result === "blocked";

	return (
		<motion.div
			className="flex flex-col gap-1 px-3 py-2"
			style={{ borderBottom: `1px solid ${C.borderMuted}` }}
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -10 }}
			transition={{ duration: 0.28, ease: "easeOut" }}
		>
			<div className="flex items-center gap-2">
				<span
					className="font-mono text-[11.5px]"
					style={{ color: C.text }}
				>
					{action.tool}
				</span>
				<span
					className="font-mono text-[11px]"
					style={{ color: C.textMuted }}
				>
					· {action.arg}
				</span>
				<div className="ml-auto">
					<StatusPill blocked={isBlocked} />
				</div>
			</div>
			{isBlocked && action.reason ? (
				<motion.div
					className="flex items-center gap-1.5 pl-1"
					initial={{ opacity: 0, x: -4 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.25, delay: 0.08 }}
				>
					<span
						className="size-1 shrink-0 rounded-full"
						style={{ background: C.danger }}
					/>
					<span
						className="font-mono text-[10.5px]"
						style={{ color: C.danger }}
					>
						{action.reason}
					</span>
				</motion.div>
			) : null}
		</motion.div>
	);
}

function StatusPill({ blocked }: { blocked: boolean }) {
	const bg = blocked ? C.dangerSoft : C.successSoft;
	const fg = blocked ? C.danger : C.success;
	const border = blocked ? C.dangerBorder : C.successBorder;

	return (
		<motion.div
			className="flex items-center gap-1 rounded-full px-1.5 py-[2px] font-mono text-[9.5px] font-bold uppercase tracking-[0.12em]"
			style={{
				background: bg,
				color: fg,
				border: `1px solid ${border}`,
			}}
			initial={{ scale: 0.85, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{
				duration: 0.25,
				ease: [0.34, 1.6, 0.6, 1],
				delay: 0.05,
			}}
		>
			{blocked ? (
				<X size={9} strokeWidth={3.5} />
			) : (
				<Check size={9} strokeWidth={3.5} />
			)}
			{blocked ? "blocked" : "allowed"}
		</motion.div>
	);
}
