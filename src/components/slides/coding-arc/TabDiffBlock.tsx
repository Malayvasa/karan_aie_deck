"use client";

import "highlight.js/styles/atom-one-dark.css";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRightToLine,
	Bug,
	ChevronDown,
	ChevronRight,
	FileCode2,
	FileJson,
	Files,
	GitBranch,
	Package,
	Search,
	Settings,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { highlightCode } from "~/lib/highlight";

type Line = { kind: "context" | "add"; text: string };

const ABOVE: Line[] = [
	{ kind: "context", text: `import { db } from "./db"` },
	{ kind: "context", text: `import { rateLimit } from "./limit"` },
	{ kind: "context", text: `` },
	{ kind: "context", text: `export async function handler(req) {` },
	{ kind: "context", text: `  const ip = req.headers.get("x-real-ip")` },
	{ kind: "context", text: `  await rateLimit(ip)` },
];

const ADD_CHUNKS: Line[][] = [
	[{ kind: "add", text: `  const { id } = await req.json()` }],
	[{ kind: "add", text: `  const user = await db.find(id)` }],
	[{ kind: "add", text: `  if (!user) return notFound()` }],
];

const BELOW: Line[] = [
	{ kind: "context", text: `  return Response.json(user)` },
	{ kind: "context", text: `}` },
	{ kind: "context", text: `` },
	{ kind: "context", text: `export const config = {` },
	{ kind: "context", text: `  runtime: "edge",` },
	{ kind: "context", text: `}` },
];

const START_DELAY = 800; // wait for the slide to animate in before playing
const GHOST_MS = 850; // suggestion shown before Tab is pressed
const ACCEPT_GAP_MS = 550; // pause after accepting, before the next suggestion
const HOLD_MS = 1500; // pause at the end before looping

type FileNode = { name: string; depth: number; kind: "ts" | "json"; active?: boolean };
const FILES: FileNode[] = [
	{ name: "app", depth: 0, kind: "ts" },
	{ name: "page.tsx", depth: 1, kind: "ts" },
	{ name: "server", depth: 0, kind: "ts" },
	{ name: "handler.ts", depth: 1, kind: "ts", active: true },
	{ name: "router.ts", depth: 1, kind: "ts" },
	{ name: "db.ts", depth: 1, kind: "ts" },
	{ name: "limit.ts", depth: 1, kind: "ts" },
	{ name: "lib", depth: 0, kind: "ts" },
	{ name: "utils.ts", depth: 1, kind: "ts" },
	{ name: "middleware.ts", depth: 0, kind: "ts" },
	{ name: "package.json", depth: 0, kind: "json" },
	{ name: "tsconfig.json", depth: 0, kind: "json" },
];

const VSCODE_BLUE = "#0e639c";

/** Far-left activity bar — the strongest VS Code tell. */
function ActivityBar() {
	const icons = [Files, Search, GitBranch, Bug, Package];
	return (
		<div
			className="flex w-11 shrink-0 flex-col items-center gap-4 py-3"
			style={{ backgroundColor: "#2c2c2c" }}
		>
			{icons.map((Icon, i) => (
				<div
					key={Icon.displayName ?? i}
					className="relative flex w-full justify-center"
				>
					{i === 0 && (
						<span className="absolute left-0 top-0 h-full w-[2px] bg-white" />
					)}
					<Icon
						className="size-[18px]"
						strokeWidth={1.6}
						style={{ color: i === 0 ? "#ffffff" : "rgba(255,255,255,0.42)" }}
					/>
				</div>
			))}
			<Settings
				className="mt-auto size-[18px]"
				strokeWidth={1.6}
				style={{ color: "rgba(255,255,255,0.42)" }}
			/>
		</div>
	);
}

function Sidebar() {
	return (
		<div
			className="flex w-[148px] shrink-0 flex-col gap-px overflow-hidden py-2 font-mono text-[10.5px]"
			style={{ backgroundColor: "#1c1c1c" }}
		>
			<div className="px-3 pb-1.5 text-[9px] uppercase tracking-[0.12em] text-white/35">
				Explorer
			</div>
			{FILES.map((f) => {
				const isFolder = f.depth === 0 && !f.name.includes(".");
				return (
					<div
						key={f.name}
						className="flex items-center gap-1.5 py-[3px] pr-2"
						style={{
							paddingLeft: 8 + f.depth * 12,
							backgroundColor: f.active ? "rgba(255,255,255,0.07)" : undefined,
							color: f.active ? "#ffffff" : "rgba(255,255,255,0.5)",
						}}
					>
						{isFolder ? (
							f.name === "server" ? (
								<ChevronDown className="size-3 shrink-0 text-white/40" />
							) : (
								<ChevronRight className="size-3 shrink-0 text-white/40" />
							)
						) : f.kind === "json" ? (
							<FileJson className="size-3 shrink-0 text-white/40" />
						) : (
							<FileCode2
								className="size-3 shrink-0"
								style={{ color: f.active ? "#519aba" : "rgba(255,255,255,0.4)" }}
							/>
						)}
						<span className="truncate">{f.name}</span>
					</div>
				);
			})}
		</div>
	);
}

type Row = { kind: "context" | "add" | "ghost"; text: string };

/**
 * Stage — "tab, tab, tab": each chunk is first shown as a dim suggestion, then
 * Tab is pressed and it's accepted (committed as a green diff).
 */
export function TabDiffBlock() {
	const [committed, setCommitted] = useState(0); // accepted chunks
	const [suggesting, setSuggesting] = useState(false); // is the next chunk previewed?
	const [pressKey, setPressKey] = useState(0);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		let done = 0;
		let previewing = false;
		const tick = () => {
			if (done < ADD_CHUNKS.length) {
				if (!previewing) {
					// show the suggestion (ghost)
					previewing = true;
					setSuggesting(true);
					timer = setTimeout(tick, GHOST_MS);
				} else {
					// press Tab → accept the suggestion
					setPressKey((k) => k + 1);
					done += 1;
					previewing = false;
					setCommitted(done);
					setSuggesting(false);
					timer = setTimeout(tick, ACCEPT_GAP_MS);
				}
			} else {
				// hold, then loop
				timer = setTimeout(() => {
					done = 0;
					previewing = false;
					setCommitted(0);
					setSuggesting(false);
					tick();
				}, HOLD_MS);
			}
		};
		// Delay the first tick so the loop starts only after the slide settles.
		timer = setTimeout(tick, START_DELAY);
		return () => clearTimeout(timer);
	}, []);

	// committed chunks render as accepted; the (committed)th chunk previews as ghost.
	const visibleChunks = ADD_CHUNKS.slice(
		0,
		committed + (suggesting && committed < ADD_CHUNKS.length ? 1 : 0),
	);
	const rows: Row[] = [
		...ABOVE.map((l): Row => ({ kind: "context", text: l.text })),
		...visibleChunks.flatMap((chunk, ci): Row[] =>
			chunk.map((l) => ({ kind: ci < committed ? "add" : "ghost", text: l.text })),
		),
		...BELOW.map((l): Row => ({ kind: "context", text: l.text })),
	];

	return (
		<div className="relative h-full w-full">
		<div
			className="flex h-full w-full flex-col overflow-hidden rounded-[10px] border"
			style={{ backgroundColor: "#1e1e1e", borderColor: "rgba(255,255,255,0.12)" }}
		>
			{/* title bar */}
			<div
				className="flex items-center gap-2 px-3 py-1.5"
				style={{ backgroundColor: "#323233" }}
			>
				<div className="flex shrink-0 gap-1.5">
					<div className="size-[9px] rounded-full" style={{ background: "#ff5f57" }} />
					<div className="size-[9px] rounded-full" style={{ background: "#febc2e" }} />
					<div className="size-[9px] rounded-full" style={{ background: "#28c840" }} />
				</div>
				<div className="flex-1 text-center font-mono text-[10.5px] text-white/45">
					handler.ts — composio-api
				</div>
			</div>

			{/* body: activity bar + explorer + editor */}
			<div className="flex min-h-0 flex-1">
				<ActivityBar />
				<Sidebar />

				<div className="flex min-w-0 flex-1 flex-col">
					{/* editor tab bar */}
					<div className="flex shrink-0" style={{ backgroundColor: "#252526" }}>
						<div
							className="flex items-center gap-2 px-3 py-1.5 font-mono text-[10.5px]"
							style={{
								backgroundColor: "#1e1e1e",
								borderTop: "1px solid #519aba",
								color: "#ffffff",
							}}
						>
							<FileCode2 className="size-3" style={{ color: "#519aba" }} />
							handler.ts
							<span
								className="ml-1 size-2 rounded-full"
								style={{ background: "rgba(255,255,255,0.55)" }}
							/>
							<X className="size-3 text-white/40" />
						</div>
					</div>

					{/* code */}
					<div className="relative min-h-0 flex-1 overflow-hidden py-2 font-mono text-[11px] leading-[1.65]">
						{rows.map((row, i) => {
							const isAdd = row.kind === "add";
							const isGhost = row.kind === "ghost";
							const isDiff = isAdd || isGhost;
							return (
								<motion.div
									key={`${row.text}-${i}`}
									className="flex items-baseline"
									initial={false}
									animate={{
										backgroundColor: isAdd
											? "rgba(76,195,138,0.12)"
											: "rgba(76,195,138,0)",
									}}
									transition={{ duration: 0.28, ease: "easeOut" }}
								>
									<span
										className="w-8 shrink-0 select-none pr-2 text-right text-[10px]"
										style={{ color: "rgba(255,255,255,0.25)" }}
									>
										{i + 1}
									</span>
									<span
										className="w-3 shrink-0 select-none text-center"
										style={{ color: isAdd ? "#4cc38a" : "transparent" }}
									>
										{isDiff ? "+" : " "}
									</span>
									{isGhost ? (
										// Suggested code — grayed out + italic (VS Code ghost text).
										<span
											className="whitespace-pre italic"
											style={{ color: "#9b9b9b" }}
										>
											{row.text || " "}
										</span>
									) : (
										<code
											className="hljs whitespace-pre !bg-transparent !p-0"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static code
											dangerouslySetInnerHTML={{
												__html: row.text ? highlightCode(row.text) : "&nbsp;",
											}}
										/>
									)}
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>

			{/* VS Code status bar */}
			<div
				className="flex shrink-0 items-center gap-3 px-3 py-1 font-mono text-[10px] text-white/90"
				style={{ backgroundColor: VSCODE_BLUE }}
			>
				<span className="flex items-center gap-1">
					<GitBranch className="size-3" /> main*
				</span>
				<span>⚠ 0</span>
				<span>✕ 0</span>
				<span className="ml-auto">Ln 8, Col 3</span>
				<span>Spaces: 2</span>
				<span>TypeScript</span>
			</div>
			</div>

			{/* Tab keycap — centered near the bottom of the IDE, above the status bar. */}
			<div className="pointer-events-none absolute bottom-9 left-1/2 -translate-x-1/2">
				<AnimatePresence mode="popLayout">
					<motion.div
						key={pressKey}
						className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-[14px] font-medium"
						style={{ background: "#ffffff", color: "#000000" }}
						initial={{ scale: 1 }}
						animate={{ scale: [1, 0.82, 1] }}
						transition={{ duration: 0.34, ease: "easeOut" }}
					>
						<ArrowRightToLine className="size-[18px]" strokeWidth={2} />
						Tab
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
