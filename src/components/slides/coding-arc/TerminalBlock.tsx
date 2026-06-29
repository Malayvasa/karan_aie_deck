"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Message,
	TerminalWindow,
	ThinkingIndicator,
} from "~/components/terminal-kit";

// Claude's whimsical loading gerunds — cycled at the trailing edge while it works.
const THINKING_WORDS = [
	"Spelunking",
	"Confabulating",
	"Conjuring",
	"Percolating",
	"Ruminating",
	"Noodling",
	"Marinating",
	"Cogitating",
	"Finagling",
	"Untangling",
	"Synthesizing",
	"Incubating",
	"Scheming",
	"Pondering",
	"Wrangling",
	"Vibing",
];

/** The trailing thinking line — spinner + a random gerund that changes as it works. */
function LiveThinking() {
	const [word, setWord] = useState(THINKING_WORDS[0]);
	useEffect(() => {
		const id = setInterval(() => {
			setWord((prev) => {
				let next = prev;
				while (next === prev) {
					next = THINKING_WORDS[Math.floor(Math.random() * THINKING_WORDS.length)];
				}
				return next;
			});
		}, 1800);
		return () => clearInterval(id);
	}, []);
	return (
		<ThinkingIndicator>
			<span>
				{word}…{" "}
				<span style={{ color: "var(--terminal-vdim)" }}>(esc to interrupt)</span>
			</span>
		</ThinkingIndicator>
	);
}

/** Word-by-word stream, terminal-kit style. Replays whenever it remounts. */
function StreamText({ text }: { text: string }) {
	const words = text.split(" ");
	const [n, setN] = useState(0);
	useEffect(() => {
		setN(0);
		let i = 0;
		const id = setInterval(() => {
			i += 1;
			setN(i);
			if (i >= words.length) clearInterval(id);
		}, 55);
		return () => clearInterval(id);
	}, [text, words.length]);
	return <span>{words.slice(0, n).join(" ")}</span>;
}

/** Colored diff stat — additions green, deletions red. */
function DiffStat({ add, del }: { add: number; del: number }) {
	return (
		<span className="tabular-nums">
			<span style={{ color: "var(--terminal-green)" }}>+{add}</span>{" "}
			<span style={{ color: "var(--terminal-red)" }}>−{del}</span>
		</span>
	);
}

/** Claude Code-style tool call: ⏺ name(args) + a bordered result line. */
function ToolCall({
	name,
	arg,
	result,
}: {
	name: string;
	arg: string;
	result: React.ReactNode;
}) {
	return (
		<motion.div
			className="font-mono text-[13px]"
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			<div className="flex items-baseline gap-2 whitespace-pre">
				<span style={{ color: "var(--terminal-green)" }}>⏺</span>
				<span style={{ color: "var(--terminal-fg)" }}>{name}</span>
				<span className="truncate" style={{ color: "var(--terminal-dim)" }}>
					({arg})
				</span>
			</div>
			<div
				className="mt-1 ml-[5px] flex items-center gap-2 border-l pl-3"
				style={{ borderColor: "var(--terminal-border)", color: "var(--terminal-dim)" }}
			>
				<Check className="size-3.5 shrink-0" style={{ color: "var(--terminal-green)" }} />
				<span className="truncate">{result}</span>
			</div>
		</motion.div>
	);
}

function AssistantLine({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			className="px-1 text-[13px] leading-relaxed"
			style={{ color: "color-mix(in srgb, var(--terminal-fg) 82%, transparent)" }}
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			{children}
		</motion.div>
	);
}

/**
 * The signature Claude-theme composer (stacked layout) — a field bounded by
 * top/bottom hairlines (no box), teal prompt, dim placeholder + meta. Mirrors
 * terminal-kit's `.terminal-input-field--stacked`.
 */
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
					Try &quot;refactor the auth flow&quot;
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
				<span className="inline-flex items-center gap-1">
					<Zap className="size-3" /> max
				</span>
			</div>
		</div>
	);
}

// A robust autonomous coding session, revealed step-by-step then looped.
const ROWS: React.ReactNode[] = [
	<Message key="intent">
		Add Redis-backed rate limiting to the public API, with tests
	</Message>,
	<ToolCall
		key="read"
		name="Read"
		arg="src/server/router.ts"
		result="read 84 lines"
	/>,
	<AssistantLine key="note1">
		The public routes are mounted here — I&apos;ll add a Redis token-bucket
		limiter in the middleware.
	</AssistantLine>,
	<ToolCall
		key="edit-mw"
		name="Update"
		arg="src/server/middleware.ts"
		result={<DiffStat add={18} del={2} />}
	/>,
	<AssistantLine key="note2">
		Now wire it into the public router and cover it with tests.
	</AssistantLine>,
	<ToolCall
		key="edit-router"
		name="Update"
		arg="src/server/router.ts"
		result={<DiffStat add={3} del={1} />}
	/>,
	<ToolCall
		key="write"
		name="Write"
		arg="test/rate-limit.test.ts"
		result="42 lines · 6 tests"
	/>,
	<ToolCall
		key="test"
		name="Bash"
		arg="pnpm test --filter api"
		result="48 passed in 3.2s"
	/>,
	<AssistantLine key="done">
		<StreamText text="Done — added a Redis token-bucket limiter in middleware.ts, wired it into the public routes, and covered it with 6 tests. All 48 pass." />
	</AssistantLine>,
];

const STEP_MS = 900;
const HOLD_MS = 3200;

/** Stage — "let Claude cook": a full autonomous session running in a terminal. */
export function TerminalBlock({ active = true }: { active?: boolean }) {
	const [shown, setShown] = useState(1);

	useEffect(() => {
		// Start (or restart) the session only when it's actually on screen.
		if (!active) {
			setShown(1);
			return;
		}
		let timer: ReturnType<typeof setTimeout>;
		const schedule = (current: number) => {
			const atEnd = current >= ROWS.length;
			timer = setTimeout(
				() => {
					const next = atEnd ? 1 : current + 1;
					setShown(next);
					schedule(next);
				},
				atEnd ? HOLD_MS : STEP_MS,
			);
		};
		schedule(1);
		return () => clearTimeout(timer);
	}, [active]);

	return (
		<TerminalWindow
			className="tk-claude-dark h-full"
			fill
			path="~/projects/api"
			pinScrollBottom
			theme="claude"
			variant="dark"
			footer={<Composer />}
		>
			<div className="flex flex-col gap-2.5">
				{ROWS.slice(0, shown)}
				{/* the thinking line always trails at the bottom while it's working */}
				{shown < ROWS.length && <LiveThinking />}
			</div>
		</TerminalWindow>
	);
}
