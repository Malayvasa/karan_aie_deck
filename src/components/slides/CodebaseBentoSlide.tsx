"use client";

import { motion } from "framer-motion";
import {
	Check,
	CheckCircle2,
	ChevronRight,
	CircleDot,
	Clock,
	Dot,
	FileCode2,
	Folder,
	GitBranch,
	GitCommit,
	GitMerge,
	GitPullRequest,
	type LucideIcon,
	XCircle,
} from "lucide-react";
import { useContext, type ReactNode } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

// GitHub (dark) palette — used directly so the bento reads as actual GitHub UI.
const GH = {
	bg: "#0d1117",
	card: "#161b22",
	inset: "#010409",
	border: "#30363d",
	borderMuted: "#21262d",
	text: "#c9d1d9",
	textStrong: "#f0f6fc",
	muted: "#8b949e",
	link: "#2f81f7",
	success: "#3fb950",
	danger: "#f85149",
	attention: "#d29922",
	merged: "#a371f7",
} as const;

const ENTER_LIFT = 18;

// Pacing
const OUTLINE_FADE = 0.35;
const OUTLINE_STAGGER = 0.05;
const CONTENT_STAGGER = 0.32;
// Content of the first tile starts filling in after the last outline lands.
const CONTENT_BASE_DELAY = OUTLINE_FADE + 0.1;

export function CodebaseBentoSlide() {
	return (
		<DeckSlide primitive="centralization">
			<CodebaseBentoBody />
		</DeckSlide>
	);
}

function CodebaseBentoBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="grid w-full max-w-[1100px]"
					style={{
						gridTemplateColumns: "1.45fr 1fr 1fr",
						gridTemplateRows: "1fr 1fr 1fr",
						gap: 12,
						height: 470,
					}}
				>
					<BentoTile
						gridArea="1 / 1 / 4 / 2"
						title="acme-co/platform"
						subtitle="monorepo"
						icon={Folder}
						headerRight={
							<div className="flex items-center gap-1 font-mono text-[11.5px]">
								<GitBranch size={12} style={{ color: GH.muted }} />
								<span style={{ color: GH.muted }}>main</span>
							</div>
						}
						isActive={isSlideActive}
						index={0}
					>
						<FileBrowser />
					</BentoTile>

					<BentoTile
						gridArea="1 / 2 / 2 / 3"
						title="Checks"
						icon={CheckCircle2}
						iconColor={GH.success}
						isActive={isSlideActive}
						index={1}
					>
						<TestList />
					</BentoTile>

					<BentoTile
						gridArea="1 / 3 / 2 / 4"
						title="Commits"
						icon={GitCommit}
						isActive={isSlideActive}
						index={2}
					>
						<CommitLog />
					</BentoTile>

					<BentoTile
						gridArea="2 / 2 / 3 / 3"
						title="@acme/db · user.ts"
						icon={FileCode2}
						isActive={isSlideActive}
						index={3}
					>
						<TypeSnippet />
					</BentoTile>

					<BentoTile
						gridArea="2 / 3 / 3 / 4"
						title="CI · main"
						icon={CheckCircle2}
						iconColor={GH.success}
						isActive={isSlideActive}
						index={4}
					>
						<CiPipeline />
					</BentoTile>

					<BentoTile
						gridArea="3 / 2 / 4 / 4"
						title="Pull requests"
						subtitle="3 Open"
						icon={GitPullRequest}
						iconColor={GH.success}
						isActive={isSlideActive}
						index={5}
					>
						<ReviewList />
					</BentoTile>
				</div>
			</div>

			<Notes>
				Coding agents work phenomenally well because everything they need is
				already in one place: the codebase. The map of the system, the
				history, the tests, the checks — all soaked into a single substrate
				they can read from and write to. That centralization is the part
				that makes coding agents look like magic.
			</Notes>
		</>
	);
}

function BentoTile({
	children,
	icon: Icon,
	iconColor,
	title,
	subtitle,
	headerRight,
	gridArea,
	isActive,
	index,
}: {
	children: ReactNode;
	icon: LucideIcon;
	iconColor?: string;
	title: string;
	subtitle?: string;
	headerRight?: ReactNode;
	gridArea: string;
	isActive: boolean;
	index: number;
}) {
	const outlineDelay = isActive ? index * OUTLINE_STAGGER : 0;
	const contentDelay = isActive
		? CONTENT_BASE_DELAY + index * CONTENT_STAGGER
		: 0;

	return (
		<div style={{ gridArea, position: "relative" }}>
			{/* Outline placeholder — appears quickly as a dashed frame, lets the
			    audience see all six slots before the content fills in. */}
			<motion.div
				className="absolute inset-0 rounded-md"
				style={{
					border: `1.5px dashed ${GH.borderMuted}`,
				}}
				initial={{ opacity: 0 }}
				animate={isActive ? { opacity: 1 } : { opacity: 0 }}
				transition={{
					duration: OUTLINE_FADE,
					ease: "easeOut",
					delay: outlineDelay,
				}}
			/>
			{/* Solid tile content — fades in over the outline with a larger
			    stagger so each piece lands clearly. */}
			<motion.div
				className="absolute inset-0 flex flex-col overflow-hidden rounded-md border"
				style={{
					background: GH.card,
					borderColor: GH.border,
				}}
				initial={{ opacity: 0, y: ENTER_LIFT }}
				animate={
					isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: ENTER_LIFT }
				}
				transition={{
					duration: 0.5,
					ease: [0.34, 1.18, 0.6, 1],
					delay: contentDelay,
				}}
			>
				<div
					className="flex items-center gap-2 px-3.5 py-2.5"
					style={{
						borderBottom: `1px solid ${GH.borderMuted}`,
						background: GH.bg,
					}}
				>
					<Icon
						size={14}
						strokeWidth={2}
						style={{ color: iconColor ?? GH.muted }}
					/>
					<span
						className="font-mono text-[13px] font-medium tracking-tight"
						style={{ color: GH.textStrong }}
					>
						{title}
					</span>
					{subtitle ? (
						<span
							className="rounded-full px-2 py-[1px] font-mono text-[11px]"
							style={{
								color: GH.muted,
								border: `1px solid ${GH.border}`,
							}}
						>
							{subtitle}
						</span>
					) : null}
					{headerRight ? <div className="ml-auto">{headerRight}</div> : null}
				</div>
				<div className="flex-1 overflow-hidden">{children}</div>
			</motion.div>
		</div>
	);
}

function FileBrowser() {
	const items: Array<{ icon: "folder" | "file"; name: string; msg: string; time: string }> = [
		{ icon: "folder", name: "apps", msg: "apps/web: add user auth", time: "2 hours ago" },
		{ icon: "folder", name: "packages", msg: "packages/ui: bump Button", time: "5 hours ago" },
		{ icon: "folder", name: "services", msg: "services/api: rate limit", time: "1 day ago" },
		{ icon: "folder", name: "infra", msg: "infra: scale workers", time: "2 days ago" },
		{ icon: "folder", name: "tools", msg: "tools: codegen update", time: "4 days ago" },
		{ icon: "file", name: "turbo.json", msg: "chore: cache outputs", time: "1 week ago" },
		{ icon: "file", name: "pnpm-workspace.yaml", msg: "chore: add @acme/db", time: "1 week ago" },
		{ icon: "file", name: "package.json", msg: "chore: bump deps", time: "2 weeks ago" },
		{ icon: "file", name: "README.md", msg: "docs: setup", time: "3 weeks ago" },
	];
	return (
		<div className="divide-y" style={{ borderColor: GH.borderMuted }}>
			{items.map((it) => (
				<div
					key={it.name}
					className="flex items-center gap-2 px-3.5 py-1.5 font-mono text-[12.5px]"
					style={{ borderColor: GH.borderMuted }}
				>
					{it.icon === "folder" ? (
						<Folder
							size={14}
							strokeWidth={2}
							style={{ color: GH.link }}
							fill={GH.link}
							fillOpacity={0}
						/>
					) : (
						<FileCode2 size={14} strokeWidth={1.8} style={{ color: GH.muted }} />
					)}
					<span
						style={{ color: it.icon === "folder" ? GH.textStrong : GH.text }}
					>
						{it.name}
					</span>
					<span
						className="ml-3 flex-1 truncate"
						style={{ color: GH.muted }}
					>
						{it.msg}
					</span>
					<span
						className="shrink-0 whitespace-nowrap"
						style={{ color: GH.muted }}
					>
						{it.time}
					</span>
				</div>
			))}
		</div>
	);
}

function TestList() {
	const checks = [
		{ name: "lint", time: "32s" },
		{ name: "unit-tests", time: "1m 14s" },
		{ name: "e2e", time: "3m 02s" },
		{ name: "typecheck", time: "21s" },
	];
	return (
		<div className="px-3.5 py-2.5 font-mono">
			<div
				className="mb-2 flex items-center gap-1.5 text-[12px]"
				style={{ color: GH.success }}
			>
				<CheckCircle2 size={12} strokeWidth={2.4} />
				<span>All checks have passed</span>
			</div>
			<div className="space-y-1">
				{checks.map((c) => (
					<div
						key={c.name}
						className="flex items-center gap-2 text-[12px]"
					>
						<Check size={11} strokeWidth={3} style={{ color: GH.success }} />
						<span style={{ color: GH.text }}>{c.name}</span>
						<span className="ml-auto" style={{ color: GH.muted }}>
							{c.time}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function CommitLog() {
	const commits = [
		{ msg: "apps/web: add user auth flow", hash: "a3b1c2d", by: "alice", time: "2h ago" },
		{ msg: "packages/db: handle race condition", hash: "9f4e2a1", by: "bob", time: "5h ago" },
		{ msg: "services/api: extract helper", hash: "c8d3f5e", by: "carol", time: "1d ago" },
		{ msg: "apps/admin: cover deal flow", hash: "4d1b8a3", by: "alice", time: "2d ago" },
	];
	return (
		<div className="space-y-1.5 px-3.5 py-2.5 font-mono text-[12px]">
			{commits.map((c) => (
				<div key={c.hash} className="flex flex-col gap-0.5">
					<span className="truncate" style={{ color: GH.text }}>
						{c.msg}
					</span>
					<div
						className="flex items-center gap-1.5 text-[11px]"
						style={{ color: GH.muted }}
					>
						<span style={{ color: GH.link }}>{c.hash}</span>
						<Dot size={10} />
						<span>@{c.by}</span>
						<Dot size={10} />
						<span>{c.time}</span>
					</div>
				</div>
			))}
		</div>
	);
}

function TypeSnippet() {
	return (
		<div className="overflow-hidden">
			<pre
				className="m-0 px-3.5 py-2.5 font-mono text-[12px] leading-[1.55]"
				style={{ color: GH.text, background: GH.bg }}
			>
				<span style={{ color: "#ff7b72" }}>type</span>{" "}
				<span style={{ color: "#79c0ff" }}>User</span> = {"{"}
				{"\n"}
				{"  "}
				<span style={{ color: "#79c0ff" }}>id</span>:{" "}
				<span style={{ color: "#ff7b72" }}>string</span>
				{"\n"}
				{"  "}
				<span style={{ color: "#79c0ff" }}>email</span>:{" "}
				<span style={{ color: "#ff7b72" }}>string</span>
				{"\n"}
				{"  "}
				<span style={{ color: "#79c0ff" }}>role</span>:{" "}
				<span style={{ color: "#a5d6ff" }}>{'"admin"'}</span>
				{" | "}
				<span style={{ color: "#a5d6ff" }}>{'"user"'}</span>
				{"\n"}
				{"}"}
			</pre>
		</div>
	);
}

function CiPipeline() {
	const jobs = [
		{ name: "lint", time: "32s" },
		{ name: "build", time: "1m 14s" },
		{ name: "test", time: "2m 33s" },
		{ name: "deploy", time: "18s" },
	];
	return (
		<div className="px-3.5 py-2.5 font-mono">
			<div
				className="mb-2 flex items-center gap-1.5 text-[12px]"
				style={{ color: GH.muted }}
			>
				<span style={{ color: GH.text }}>#248</span>
				<Dot size={10} />
				<span>Test & Build</span>
				<Dot size={10} />
				<span>2m 47s</span>
			</div>
			<div className="space-y-1">
				{jobs.map((j) => (
					<div key={j.name} className="flex items-center gap-2 text-[12px]">
						<CheckCircle2
							size={12}
							strokeWidth={2.2}
							style={{ color: GH.success }}
						/>
						<span style={{ color: GH.text }}>{j.name}</span>
						<span className="ml-auto" style={{ color: GH.muted }}>
							{j.time}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function ReviewList() {
	type State = "open" | "merged" | "changes";
	const prs: Array<{ pr: string; title: string; by: string; time: string; state: State }> = [
		{
			pr: "421",
			title: "apps/web: add user auth flow",
			by: "alice",
			time: "2h",
			state: "open",
		},
		{
			pr: "418",
			title: "packages/db: refactor query helpers",
			by: "bob",
			time: "1d",
			state: "changes",
		},
		{
			pr: "415",
			title: "services/api: document surface",
			by: "carol",
			time: "3d",
			state: "merged",
		},
	];

	const stateMeta: Record<State, { icon: LucideIcon; color: string; label: string }> = {
		open: { icon: CircleDot, color: GH.success, label: "Open" },
		merged: { icon: GitMerge, color: GH.merged, label: "Merged" },
		changes: { icon: XCircle, color: GH.danger, label: "Changes requested" },
	};

	return (
		<div className="divide-y" style={{ borderColor: GH.borderMuted }}>
			{prs.map((p) => {
				const m = stateMeta[p.state];
				const Icon = m.icon;
				return (
					<div
						key={p.pr}
						className="flex items-start gap-2 px-3.5 py-2 font-mono"
						style={{ borderColor: GH.borderMuted }}
					>
						<Icon
							size={14}
							strokeWidth={2}
							style={{ color: m.color, marginTop: 2 }}
						/>
						<div className="flex min-w-0 flex-1 flex-col gap-0.5">
							<div className="flex items-baseline gap-1.5">
								<span
									className="truncate text-[12.5px]"
									style={{ color: GH.textStrong }}
								>
									{p.title}
								</span>
							</div>
							<div
								className="flex items-center gap-1.5 text-[11px]"
								style={{ color: GH.muted }}
							>
								<span>#{p.pr}</span>
								<span>opened {p.time} ago</span>
								<span>by @{p.by}</span>
							</div>
						</div>
						<div className="flex items-center gap-1 text-[11px]">
							<Clock size={11} style={{ color: GH.muted }} />
							<span style={{ color: GH.muted }}>{p.time}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
