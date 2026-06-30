"use client";

import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { Message, TerminalWindow } from "~/components/terminal-kit";
import { cn } from "~/lib/utils";

// Ported from landing-new/src/components/dev/meta-tools/remote-workbench-visual.tsx
// with content rescripted around the wire-transfer scenario from the prior slide,
// timed against the speech beat: "The agent runs them in a sandbox first…"

/* ─────────────────────────────── Connectors ──────────────────────────── */

type Pt = { x: number; y: number };

/** Straight line from p to q. */
function line(p: Pt, q: Pt): string {
	return `M ${p.x} ${p.y} L ${q.x} ${q.y}`;
}

/* ─────────────────────────────── Server CPU lights ───────────────────── */

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

/* ─────────────────────────────── Scenario script ─────────────────────── */

// Callback to the OpenClaw email-deletion incident from the prior slides.
// This time the agent runs the bulk delete in a sandbox first — and the
// sandbox catches that 23 of the targeted emails look important. The agent
// pauses and asks Yue before touching the real inbox.
const TASK = "Archive promotional emails older than 30 days";
const OUTPUT = "247 staged · 23 flagged · inbox untouched";
const REPLY_DONE =
	"Sandbox caught it: 247 emails matched the filter, but 23 look important — 18 are starred, 5 have replies. None of the real inbox was touched. Showing the sample below — approve to proceed, or refine the filter?";

const INSTANCES = [
	{
		task: "query candidate emails",
		result: "247 matched",
		code: `# working copy of Gmail — no real reads
candidates = sandbox.gmail.search(
    query='label:promotions older_than:30d',
)
log(f'matched {len(candidates)} emails')`,
		from: 2,
		to: 4,
	},
	{
		task: "simulate bulk archive",
		result: "247 staged",
		code: `# preview the archive — nothing leaves the inbox
result = sandbox.gmail.archive_messages(
    ids=[m.id for m in candidates],
    preview=True,
)
log(f'staged {result.count} for archive')`,
		from: 4,
		to: 6,
	},
	{
		task: "audit what would be lost",
		result: "23 look important",
		code: `# inspect the staged set for anomalies
suspect = [
    m for m in candidates
    if m.starred or m.has_replies
]
log(f'{len(suspect)} look important — pausing')`,
		from: 6,
		to: 8,
	},
];

/* ─────────────────────────────── Syntax highlighter ──────────────────── */

const FNS = new Set([
	"sandbox.gmail.search",
	"sandbox.gmail.archive_messages",
	"len",
	"log",
]);

function highlight(line: string) {
	const re =
		/('[^']*'|"[^"]*")|(#.*$)|\b(sandbox\.gmail\.search|sandbox\.gmail\.archive_messages|len|log)\b|\b(True|False|None|if|not|in|for|while|break)\b/g;
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
const SHEEN_BLUE = "#51a2ff";

/* ─────────────────────────────── Small pieces ────────────────────────── */

function StreamText({ text, play }: { text: string; play: boolean }) {
	const words = text.split(" ");
	const [n, setN] = useState(play ? 0 : words.length);
	useEffect(() => {
		if (!play) {
			setN(words.length);
			return;
		}
		setN(0);
		let i = 0;
		const id = setInterval(() => {
			i += 1;
			setN(i);
			if (i >= words.length) clearInterval(id);
		}, 55);
		return () => clearInterval(id);
	}, [text, play, words.length]);
	return <span>{words.slice(0, n).join(" ")}</span>;
}

function AssistantLine({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="px-1 text-[13px] leading-relaxed"
			initial={{ opacity: 0, y: 4 }}
			style={{ color: "color-mix(in srgb, var(--terminal-fg) 82%, transparent)" }}
			transition={{ duration: 0.3 }}
		>
			{children}
		</motion.div>
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

/* ─────────────────────────────── Sandbox panel ───────────────────────── */

function SandboxPanel({
	step,
	innerRef,
	className,
}: {
	step: number;
	innerRef?: React.Ref<HTMLDivElement>;
	className?: string;
}) {
	const idle = step < 2;
	const running = step >= 2 && step < 8;
	const activeIdx = step < 4 ? 0 : step < 6 ? 1 : 2;
	const active = INSTANCES[activeIdx]!;

	const [typed, setTyped] = useState(0);
	const [renderedIdx, setRenderedIdx] = useState(activeIdx);
	if (renderedIdx !== activeIdx) {
		setRenderedIdx(activeIdx);
		setTyped(0);
	}
	useEffect(() => {
		setTyped(0);
		if (idle) return;
		let n = 0;
		const id = setInterval(() => {
			n += 2;
			setTyped(Math.min(n, active.code.length));
			if (n >= active.code.length) clearInterval(id);
		}, 28);
		return () => clearInterval(id);
	}, [active.code, idle]);
	const typing = typed < active.code.length;

	const prefix = INSTANCES.slice(0, activeIdx)
		.map((inst) => inst.code)
		.join("\n\n");
	const typedActive = active.code.slice(0, typed);
	const activeStart = prefix ? prefix.length + 2 : 0;
	const fullText = idle
		? ""
		: prefix
			? `${prefix}\n\n${typedActive}`
			: typedActive;

	const HEAD_WORDS = 4;
	const wordStarts = [...fullText.matchAll(/\S+/g)].map((m) => m.index ?? 0);
	const wordHead =
		wordStarts.length > HEAD_WORDS
			? (wordStarts[wordStarts.length - HEAD_WORDS] ?? 0)
			: 0;
	const headStart = typing ? Math.max(activeStart, wordHead) : fullText.length;
	let pos = 0;
	const codeLines = fullText.split("\n").map((line) => {
		const segs = highlight(line).map((seg) => {
			pos += seg.t.length;
			return { ...seg, end: pos };
		});
		pos += 1;
		return segs;
	});

	const stageState = (i: number): "idle" | "running" | "done" => {
		const inst = INSTANCES[i]!;
		if (step < inst.from) return "idle";
		if (step < inst.to) return "running";
		return "done";
	};

	return (
		<motion.div
			animate={{
				boxShadow: running
					? "0 0 0 1px #51a2ff, 0 16px 46px -16px rgba(81,162,255,0.5)"
					: "0 0 0 1px rgba(255,255,255,0.09), 0 22px 60px -26px rgba(0,0,0,0.7)",
			}}
			className={cn(
				"flex flex-col overflow-hidden bg-[#0c0c0e]",
				className,
			)}
			initial={false}
			ref={innerRef}
			transition={{ duration: 0.4 }}
		>
			<div className="flex shrink-0 items-center justify-between gap-2 border-white/[0.06] border-b bg-white/[0.015] px-3 py-2">
				<div className="flex min-w-0 items-center gap-2">
					<CpuLights active={running} cols={9} />
					<span className="truncate font-mono text-[9.5px] text-white/40 uppercase tracking-wider">
						composio_sandbox · python 3.11
					</span>
				</div>
				<span className="shrink-0 font-mono text-[9px] text-white/30 tabular-nums">
					{step >= 8 ? (
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
			<div className="flex-1 px-3 py-3">
				{codeLines.map((segs, i) => (
					<div
						className="whitespace-pre font-mono text-[10.5px] leading-[1.65]"
						// biome-ignore lint/suspicious/noArrayIndexKey: static code lines
						key={i}
					>
						{segs.map((seg, j) => {
							const head = typing && seg.end > headStart;
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
			<div className="shrink-0 border-white/[0.06] border-t bg-white/[0.015]">
				{INSTANCES.map((inst, i) => {
					const st = stageState(i);
					return (
						<motion.div
							animate={{
								height: step >= 2 ? 30 : 0,
								opacity: step >= 2 ? 1 : 0,
							}}
							className="flex items-center gap-2 overflow-hidden px-3 font-mono text-[10px]"
							initial={false}
							key={inst.task}
							transition={{
								duration: 0.35,
								delay: step >= 2 ? 0.12 + i * 0.12 : 0,
								ease: [0.22, 1, 0.36, 1],
							}}
						>
							<span className="text-white/25 tabular-nums">{i + 1}</span>
							{st === "running" ? (
								<Spinner className="size-2.5" />
							) : st === "done" ? (
								<Check className="size-3 text-green-400/70" />
							) : (
								<span className="size-1.5 rounded-full bg-white/15" />
							)}
							<span
								className={cn(
									"min-w-0 flex-1 truncate uppercase tracking-wider",
									st === "running"
										? "text-[#51a2ff]"
										: st === "done"
											? "text-white/55"
											: "text-white/30",
								)}
							>
								{inst.task}
							</span>
							{st === "done" && (
								<span className="shrink-0 text-green-400/70">
									{inst.result}
								</span>
							)}
						</motion.div>
					);
				})}
			</div>
		</motion.div>
	);
}

/* ─────────────────────────────── Footer composer ─────────────────────── */

function Composer() {
	return (
		<div className="w-full pt-1">
			<div
				className="relative flex items-center gap-2 text-[13px]"
				style={{
					paddingBlock: 6,
					borderTop: "1.5px solid var(--terminal-input-border)",
					borderBottom: "1.5px solid var(--terminal-input-border)",
				}}
			>
				<span style={{ color: "var(--terminal-teal)" }}>›</span>
				<span style={{ color: "var(--terminal-dim)" }}>
					Try &quot;archive old promos&quot;
				</span>
				<span
					className="terminal-cursor ml-px inline-block h-[13px] w-[6px]"
					style={{ backgroundColor: "var(--terminal-teal)" }}
				/>
			</div>
			<div
				className="mt-1.5 flex items-center justify-between text-[10px] leading-4"
				style={{ color: "var(--terminal-dim)" }}
			>
				<span>? for shortcuts</span>
				<span>max</span>
			</div>
		</div>
	);
}

/* ─────────────────────────────── Slide ───────────────────────────────── */

export function ReversibilitySolutionSlide() {
	return (
		<DeckSlide>
			<Body />
		</DeckSlide>
	);
}

const STAGE_W = 1040;
const STAGE_H = 460;
const PANEL_W = 460;
const PANEL_H = 420;

function Body() {
	const { isSlideActive } = useContext(SlideContext);
	const [step, setStep] = useState(0);
	const handoff = step >= 2 && step < 8;

	// Static layout coords (in slide units). getBoundingClientRect returned
	// post-transform screen pixels, which the SVG (no viewBox) misread as
	// layout pixels — pushing the connectors off-canvas under Spectacle's
	// slide scaling. The layout is fixed, so just use the known geometry.
	const tRight = PANEL_W; // terminal sits at left=0
	const pLeft = STAGE_W - PANEL_W; // sandbox sits flush to right edge
	const midY = STAGE_H / 2;
	const c1 = line({ x: tRight, y: midY - 14 }, { x: pLeft, y: midY - 14 });
	const c2 = line({ x: pLeft, y: midY + 14 }, { x: tRight, y: midY + 14 });

	// Step machine — runs while slide is active, loops with a short hold.
	useEffect(() => {
		if (!isSlideActive) {
			setStep(0);
			return;
		}
		let stops: ReturnType<typeof setTimeout>[] = [];
		const run = () => {
			setStep(0);
			stops = [
				setTimeout(() => setStep(1), 450),
				setTimeout(() => setStep(2), 1300),
				setTimeout(() => setStep(3), 3200),
				setTimeout(() => setStep(4), 5000),
				setTimeout(() => setStep(5), 6400),
				setTimeout(() => setStep(6), 8200),
				setTimeout(() => setStep(7), 9500),
				setTimeout(() => setStep(8), 10800),
				setTimeout(() => setStep(9), 11800),
				setTimeout(() => run(), 15500),
			];
		};
		run();
		return () => {
			for (const s of stops) clearTimeout(s);
		};
	}, [isSlideActive]);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="relative flex items-center justify-between"
					style={{ width: STAGE_W, height: STAGE_H }}
				>
					{/* connectors — viewBox pins coords to slide units so they
					    survive Spectacle's CSS transform scale. */}
					<svg
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible text-[#51a2ff]"
						fill="none"
						preserveAspectRatio="none"
						viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
					>
						{step >= 2 && (
							<g key={`c1-${step}`}>
								<path
									d={c1}
									opacity={0.14}
									stroke="currentColor"
									strokeWidth={1}
								/>
								<motion.path
									animate={{ pathLength: 1 }}
									d={c1}
									initial={{ pathLength: 0 }}
									stroke="currentColor"
									strokeWidth={1.5}
									transition={{ duration: 0.55, ease: "easeOut" }}
								/>
							</g>
						)}
						{step >= 8 && (
							<g key={`c2-${step}`}>
								<path
									d={c2}
									opacity={0.14}
									stroke="currentColor"
									strokeWidth={1}
								/>
								<motion.path
									animate={{ pathLength: 1 }}
									d={c2}
									initial={{ pathLength: 0 }}
									stroke="currentColor"
									strokeWidth={1.5}
									transition={{ duration: 0.6, ease: "easeOut" }}
								/>
							</g>
						)}
					</svg>

					{/* terminal — left, flex centers it vertically */}
					<motion.div
						animate={{ opacity: handoff ? 0.4 : 1 }}
						className="relative shrink-0"
						initial={false}
						style={{ width: PANEL_W, height: PANEL_H }}
						transition={{ duration: 0.45 }}
					>
						<div style={{ height: "100%" }}>
							<TerminalWindow
								className="tk-claude-dark h-full"
								fill
								footer={<Composer />}
								path="~/yue/inbox"
								theme="claude"
								variant="dark"
							>
								<div className="flex flex-col gap-2.5">
									{step >= 1 && (
										<motion.div
											animate={{ opacity: 1, y: 0 }}
											initial={{ opacity: 0, y: 4 }}
											transition={{ duration: 0.25 }}
										>
											<Message>{TASK}</Message>
										</motion.div>
									)}
									{step >= 2 && (
										<div className="font-mono text-[13px]">
											<div className="flex items-center gap-2">
												<span className="text-[#51a2ff]">⏺</span>
												<span style={{ color: "var(--terminal-fg)" }}>
													SANDBOX
												</span>
											</div>
											<div
												className="mt-1 ml-[5px] flex items-center gap-2 border-l pl-3"
												style={{
													borderColor: "var(--terminal-border)",
													color: "color-mix(in srgb, var(--terminal-fg) 70%, transparent)",
												}}
											>
												{step < 8 ? (
													<>
														<Spinner />
														<span>running in sandbox…</span>
													</>
												) : (
													<>
														<Check className="text-green-400" />
														<span className="truncate">{OUTPUT}</span>
													</>
												)}
											</div>
										</div>
									)}
									{step >= 9 && (
										<AssistantLine>
											<StreamText play text={REPLY_DONE} />
										</AssistantLine>
									)}
								</div>
							</TerminalWindow>
						</div>
					</motion.div>

					{/* sandbox — right, flex centers it vertically */}
					<motion.div
						animate={{ opacity: step < 2 ? 0.45 : 1 }}
						className="relative shrink-0"
						initial={false}
						style={{ width: PANEL_W, height: PANEL_H }}
						transition={{ duration: 0.45 }}
					>
						<SandboxPanel className="h-full" step={step} />
					</motion.div>
				</div>
			</div>

			<Notes>
				The agent runs them in a sandbox first: a working copy of your real
				tools. There it can take the irreversible action and watch exactly
				what it would do. None of it touches the real world.
			</Notes>
		</>
	);
}
