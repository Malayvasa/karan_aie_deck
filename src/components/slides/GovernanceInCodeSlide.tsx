"use client";

import { motion } from "framer-motion";
import {
	Check,
	ChevronDown,
	Clock,
	FileCode2,
	GitPullRequest,
	Lock,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useContext, type ComponentType, type ReactNode } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

// GitHub (dark) palette — matched to VerificationInCodeSlide so the code-side
// surface stays consistent across primitives.
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
	attention: "#d29922",
	attentionSoft: "rgba(210,153,34,0.12)",
	danger: "#f85149",
	dangerSoft: "rgba(248,81,73,0.12)",
} as const;

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

// Pacing — left card lands first, then its sections cascade, then the right
// column follows ~0.35s after the left finishes.
const LEFT_DELAY = 0.45;
const SECTION_BASE = LEFT_DELAY + 0.18;
const SECTION_STAGGER = 0.16;
const REQUIREMENT_COUNT = 4;
const RIGHT_FILE_DELAY = SECTION_BASE + REQUIREMENT_COUNT * SECTION_STAGGER + 0.1;
const RIGHT_ENV_DELAY = RIGHT_FILE_DELAY + 0.35;

type ReqStatus = "passed" | "pending" | "locked";

type Requirement = {
	status: ReqStatus;
	label: string;
	meta: string;
};

const REQUIREMENTS: Requirement[] = [
	{
		status: "passed",
		label: "All checks have passed",
		meta: "6 successful · 1 neutral",
	},
	{
		status: "pending",
		label: "Code-owner review",
		meta: "@acme/platform-team",
	},
	{
		status: "pending",
		label: "1 approving review",
		meta: "0 of 1",
	},
	{
		status: "locked",
		label: "Branch protection — main",
		meta: "linear history · signed",
	},
];

export function GovernanceInCodeSlide() {
	return (
		<DeckSlide>
			<GovernanceInCodeBody />
		</DeckSlide>
	);
}

function GovernanceInCodeBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<>
			<div
				className="flex flex-1 items-center justify-center"
				style={{ fontFamily: SANS }}
			>
				<div
					className="flex w-full items-stretch gap-6"
					style={{ maxWidth: 1100, height: 470 }}
				>
					{/* ====================== LEFT: blocked PR ====================== */}
					<motion.div
						className="flex shrink-0 overflow-hidden rounded-md"
						style={{
							width: 560,
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
							delay: LEFT_DELAY,
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
							{/* Header */}
							<RevealRow active={isSlideActive} delay={SECTION_BASE}>
								<div
									className="flex items-start gap-2.5 px-3.5 py-2"
									style={{
										borderBottom: `1px solid ${GH.borderMuted}`,
									}}
								>
									<BlockedRing />
									<div className="min-w-0 flex-1 leading-tight">
										<div
											className="text-[14px] font-semibold"
											style={{ color: GH.textStrong }}
										>
											Merging is blocked
										</div>
										<div
											className="mt-0.5 text-[12.5px]"
											style={{ color: GH.muted }}
										>
											Some required things still need to happen.
										</div>
									</div>
									<ChevronDown
										size={14}
										style={{ color: GH.muted, marginTop: 4 }}
									/>
								</div>
							</RevealRow>

							{/* Requirements list */}
							<div
								className="flex-1 px-3.5 pt-2.5 pb-2"
								style={{
									borderBottom: `1px solid ${GH.borderMuted}`,
								}}
							>
								<SectionHeader label="required" />
								{REQUIREMENTS.map((r, i) => (
									<RevealRow
										key={r.label}
										active={isSlideActive}
										delay={
											SECTION_BASE + (i + 1) * SECTION_STAGGER
										}
									>
										<div
											style={{
												borderBottom:
													i < REQUIREMENTS.length - 1
														? `1px solid ${GH.borderMuted}`
														: undefined,
											}}
										>
											<RequirementRow req={r} />
										</div>
									</RevealRow>
								))}
							</div>

							{/* Disabled merge button row */}
							<RevealRow
								active={isSlideActive}
								delay={
									SECTION_BASE +
									(REQUIREMENT_COUNT + 1) * SECTION_STAGGER
								}
							>
								<div className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px]">
									<DisabledMergeButton />
									<span
										className="truncate"
										style={{ color: GH.muted }}
									>
										You can&apos;t merge until the required reviews land.
									</span>
								</div>
							</RevealRow>

							{/* Deployments strip */}
							<RevealRow
								active={isSlideActive}
								delay={
									SECTION_BASE +
									(REQUIREMENT_COUNT + 2) * SECTION_STAGGER
								}
							>
								<div
									className="px-3.5 pt-2 pb-3"
									style={{ borderTop: `1px solid ${GH.borderMuted}` }}
								>
									<SectionHeader label="deployments" />
									<DeploymentRow
										status="success"
										env="Preview"
										url="preview-pr-421.acme.dev"
										note="2m ago"
									/>
									<div style={{ borderTop: `1px solid ${GH.borderMuted}` }}>
										<DeploymentRow
											status="locked"
											env="Production"
											url="acme.dev"
											note="approval required"
										/>
									</div>
								</div>
							</RevealRow>
						</div>
					</motion.div>

					{/* ===================== RIGHT: rules-as-code ===================== */}
					<div className="flex min-w-0 flex-1 flex-col gap-3">
						<CodeownersPanel
							isActive={isSlideActive}
							delay={RIGHT_FILE_DELAY}
						/>
						<EnvironmentPanel
							isActive={isSlideActive}
							delay={RIGHT_ENV_DELAY}
						/>
					</div>
				</div>
			</div>

			<Notes>
				In code, governance is layered and structural. The agent can branch
				freely, but the wall stops it from merging — branch protection rules,
				required code-owner review, environment protection on production. None
				of it is a request to the agent; it&apos;s declared in CODEOWNERS and
				env rules. Not one gate — a stack of them, sized to how much damage is
				possible.
			</Notes>
		</>
	);
}

/* ============================ Left helpers ============================== */

function BlockedRing() {
	return (
		<div
			className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
			style={{
				background: GH.dangerSoft,
				border: `2px solid ${GH.danger}`,
			}}
			aria-hidden
		>
			<Lock size={11} strokeWidth={2.6} style={{ color: GH.danger }} />
		</div>
	);
}

function SectionHeader({ label }: { label: string }) {
	return (
		<div className="mb-1.5 flex items-center gap-1.5 pt-0.5">
			<span
				className="font-mono text-[11px] uppercase tracking-[0.14em]"
				style={{ color: GH.muted }}
			>
				{label}
			</span>
			<div
				className="flex-1"
				style={{ height: 1, background: GH.borderMuted }}
			/>
		</div>
	);
}

function RequirementRow({ req }: { req: Requirement }) {
	return (
		<div className="flex items-center gap-2.5 py-1.5 pl-1">
			<ReqStatusIcon status={req.status} />
			<span
				className="truncate text-[12.5px]"
				style={{ color: GH.textStrong, fontWeight: 500 }}
			>
				{req.label}
			</span>
			<span
				className="truncate text-[12px]"
				style={{ color: GH.muted, marginLeft: "auto" }}
			>
				{req.meta}
			</span>
		</div>
	);
}

function ReqStatusIcon({ status }: { status: ReqStatus }) {
	if (status === "passed") {
		return (
			<div
				className="mt-[2px] flex size-[18px] shrink-0 items-center justify-center rounded-full"
				style={{ background: GH.successBg }}
			>
				<Check size={11} strokeWidth={3} color="#fff" />
			</div>
		);
	}
	if (status === "pending") {
		return (
			<div
				className="mt-[2px] flex size-[18px] shrink-0 items-center justify-center rounded-full"
				style={{
					background: GH.attentionSoft,
					border: `1.5px solid ${GH.attention}`,
				}}
			>
				<Clock size={10} strokeWidth={2.4} style={{ color: GH.attention }} />
			</div>
		);
	}
	// locked
	return (
		<div
			className="mt-[2px] flex size-[18px] shrink-0 items-center justify-center rounded-full"
			style={{
				background: GH.cardHi,
				border: `1.5px solid ${GH.border}`,
			}}
		>
			<Lock size={10} strokeWidth={2.4} style={{ color: GH.muted }} />
		</div>
	);
}

function DisabledMergeButton() {
	return (
		<div
			className="flex shrink-0 items-stretch overflow-hidden rounded-md"
			style={{
				border: `1px solid ${GH.border}`,
				opacity: 0.55,
			}}
		>
			<div
				className="whitespace-nowrap px-3 py-1 text-[12.5px] font-medium"
				style={{ background: GH.cardHi, color: GH.muted }}
			>
				Merge pull request
			</div>
			<div
				className="flex w-7 shrink-0 items-center justify-center"
				style={{
					background: GH.cardHi,
					borderLeft: `1px solid ${GH.border}`,
					color: GH.muted,
				}}
			>
				<ChevronDown size={13} />
			</div>
		</div>
	);
}

type DeploymentStatus = "success" | "locked";

function DeploymentRow({
	status,
	env,
	url,
	note,
}: {
	status: DeploymentStatus;
	env: string;
	url: string;
	note: string;
}) {
	return (
		<div className="flex items-center gap-2.5 py-1.5 pl-1">
			{status === "success" ? (
				<div
					className="flex size-[18px] shrink-0 items-center justify-center rounded-full"
					style={{ background: GH.successBg }}
				>
					<Check size={11} strokeWidth={3} color="#fff" />
				</div>
			) : (
				<div
					className="flex size-[18px] shrink-0 items-center justify-center rounded-full"
					style={{
						background: GH.cardHi,
						border: `1.5px solid ${GH.border}`,
					}}
				>
					<Lock size={10} strokeWidth={2.4} style={{ color: GH.muted }} />
				</div>
			)}
			<span
				className="shrink-0 rounded-full px-2 py-[1px] text-[10.5px] font-medium uppercase tracking-wider"
				style={{
					background:
						status === "success"
							? "rgba(63,185,80,0.12)"
							: GH.attentionSoft,
					color: status === "success" ? GH.success : GH.attention,
				}}
			>
				{env}
			</span>
			<span
				className="truncate text-[12.5px]"
				style={{ color: GH.link, textDecoration: "underline" }}
			>
				{url}
			</span>
			<span
				className="truncate text-[11.5px]"
				style={{ color: GH.muted, marginLeft: "auto" }}
			>
				{note}
			</span>
		</div>
	);
}

/* =========================== Right: rules =============================== */

function CodeownersPanel({
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
				path=".github/CODEOWNERS"
				meta="Code · just now"
			/>
			<div
				className="flex flex-1 flex-col gap-0.5 font-mono"
				style={{
					background: GH.card,
					color: GH.text,
					fontSize: 12,
					lineHeight: 1.8,
					padding: "12px 14px",
				}}
			>
				<OwnerLine path="/packages/billing/" owner="@acme/platform-team" />
				<OwnerLine path="/packages/auth/" owner="@acme/security" />
				<OwnerLine
					path="/infra/"
					owner="@acme/sre @acme/platform-team"
				/>
				<OwnerLine path="/.github/workflows/" owner="@acme/security" />
				<OwnerLine path="/migrations/" owner="@acme/data" />
			</div>
		</motion.div>
	);
}

function OwnerLine({ path, owner }: { path: string; owner: string }) {
	return (
		<div className="flex items-center justify-between gap-6 whitespace-pre">
			<span style={{ color: "#79c0ff" }}>{path}</span>
			<span style={{ color: "#a5d6ff" }}>{owner}</span>
		</div>
	);
}

function EnvironmentPanel({
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
				icon={ShieldCheck}
				path="Environment · production"
				meta={
					<span
						className="rounded-full px-2 py-[1px] font-mono text-[10.5px] uppercase tracking-wider"
						style={{
							background: GH.dangerSoft,
							color: GH.danger,
							border: `1px solid rgba(248,81,73,0.35)`,
						}}
					>
						protected
					</span>
				}
			/>
			<div
				className="flex flex-1 flex-col justify-between gap-2.5"
				style={{
					background: GH.card,
					color: GH.text,
					padding: "14px 16px",
					fontSize: 12.5,
					lineHeight: 1.5,
				}}
			>
				<EnvRule
					icon={Users}
					label="Required reviewers"
					value="@acme/sre"
				/>
				<EnvRule
					icon={GitPullRequest}
					label="Deployment branches"
					value="main only"
				/>
				<EnvRule icon={Clock} label="Wait timer" value="5 min" />
				<EnvRule
					icon={Lock}
					label="Secrets"
					value="revealed after approval"
				/>
				<EnvRule
					icon={ShieldCheck}
					label="Allowed actors"
					value="humans only"
				/>
			</div>
		</motion.div>
	);
}

function EnvRule({
	icon: Icon,
	label,
	value,
}: {
	icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center gap-2.5">
			<div
				className="flex size-6 shrink-0 items-center justify-center rounded-md"
				style={{
					background: GH.cardHi,
					border: `1px solid ${GH.border}`,
				}}
			>
				<Icon size={12} strokeWidth={2} style={{ color: GH.muted }} />
			</div>
			<span
				className="text-[12.5px]"
				style={{ color: GH.muted, minWidth: 130 }}
			>
				{label}
			</span>
			<span
				className="font-mono text-[12px]"
				style={{ color: GH.textStrong }}
			>
				{value}
			</span>
		</div>
	);
}

function PanelHeader({
	icon: Icon,
	path,
	meta,
}: {
	icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
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

/* ============================= Animation ================================ */

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
