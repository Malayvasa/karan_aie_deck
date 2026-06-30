"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";

type LogEntry = {
	slug: string;
	app: string;
	tool: string;
	snippet: string;
	status: "ok" | "err" | "run";
	ms: number;
	time: string;
};

const ENTRIES: LogEntry[] = [
	{
		slug: "gmail",
		app: "gmail",
		tool: "send_email",
		snippet: "to=maya@acme.co",
		status: "ok",
		ms: 312,
		time: "09:42:15.842",
	},
	{
		slug: "slack",
		app: "slack",
		tool: "post_message",
		snippet: "channel=#sales-team",
		status: "ok",
		ms: 89,
		time: "09:42:15.512",
	},
	{
		slug: "notion",
		app: "notion",
		tool: "create_page",
		snippet: "parent=Customer Docs",
		status: "ok",
		ms: 412,
		time: "09:42:15.084",
	},
	{
		slug: "salesforce",
		app: "salesforce",
		tool: "create_lead",
		snippet: "account=Acme Corp",
		status: "ok",
		ms: 287,
		time: "09:42:14.671",
	},
	{
		slug: "linear",
		app: "linear",
		tool: "create_issue",
		snippet: "team=ENG · P0",
		status: "ok",
		ms: 143,
		time: "09:42:14.382",
	},
	{
		slug: "github",
		app: "github",
		tool: "create_pull_request",
		snippet: "branch=fix/billing-race",
		status: "ok",
		ms: 521,
		time: "09:42:13.861",
	},
	{
		slug: "zendesk",
		app: "zendesk",
		tool: "update_ticket",
		snippet: "id=#4218 status=solved",
		status: "ok",
		ms: 178,
		time: "09:42:13.418",
	},
	{
		slug: "hubspot",
		app: "hubspot",
		tool: "update_deal",
		snippet: "stage=closed-won",
		status: "ok",
		ms: 92,
		time: "09:42:13.214",
	},
	{
		slug: "calendly",
		app: "calendly",
		tool: "list_events",
		snippet: "days=7",
		status: "ok",
		ms: 67,
		time: "09:42:12.847",
	},
	{
		slug: "stripe",
		app: "stripe",
		tool: "create_invoice",
		snippet: "amount=$2,500 net=30",
		status: "ok",
		ms: 256,
		time: "09:42:12.371",
	},
	{
		slug: "sentry",
		app: "sentry",
		tool: "resolve_issue",
		snippet: "issue=PROD-1827",
		status: "ok",
		ms: 71,
		time: "09:42:11.965",
	},
	{
		slug: "asana",
		app: "asana",
		tool: "create_task",
		snippet: "project=Q2 launch",
		status: "ok",
		ms: 134,
		time: "09:42:11.628",
	},
	{
		slug: "figma",
		app: "figma",
		tool: "get_file_comments",
		snippet: "file=design-system-v3",
		status: "ok",
		ms: 198,
		time: "09:42:11.241",
	},
	{
		slug: "googledrive",
		app: "googledrive",
		tool: "upload_file",
		snippet: "name=Q3 forecast.xlsx",
		status: "ok",
		ms: 423,
		time: "09:42:10.687",
	},
	{
		slug: "googlesheets",
		app: "googlesheets",
		tool: "append_row",
		snippet: "sheet=Renewals tracker",
		status: "ok",
		ms: 87,
		time: "09:42:10.281",
	},
	{
		slug: "googlecalendar",
		app: "googlecalendar",
		tool: "create_event",
		snippet: "title=Kickoff · thu",
		status: "ok",
		ms: 112,
		time: "09:42:09.923",
	},
	{
		slug: "intercom",
		app: "intercom",
		tool: "reply_conversation",
		snippet: "conv=c_7afa",
		status: "ok",
		ms: 156,
		time: "09:42:09.558",
	},
	{
		slug: "pagerduty",
		app: "pagerduty",
		tool: "trigger_incident",
		snippet: "severity=SEV-2",
		status: "err",
		ms: 24,
		time: "09:42:09.281",
	},
	{
		slug: "datadog",
		app: "datadog",
		tool: "query_metrics",
		snippet: "metric=api.latency.p99",
		status: "ok",
		ms: 312,
		time: "09:42:08.847",
	},
	{
		slug: "twilio",
		app: "twilio",
		tool: "send_sms",
		snippet: "to=+1415555…",
		status: "ok",
		ms: 178,
		time: "09:42:08.512",
	},
	{
		slug: "sendgrid",
		app: "sendgrid",
		tool: "send_email",
		snippet: "template=renewal_v3",
		status: "ok",
		ms: 246,
		time: "09:42:08.071",
	},
	{
		slug: "mailchimp",
		app: "mailchimp",
		tool: "add_subscriber",
		snippet: "list=product-news",
		status: "ok",
		ms: 89,
		time: "09:42:07.741",
	},
	{
		slug: "airtable",
		app: "airtable",
		tool: "create_record",
		snippet: "base=Sales CRM",
		status: "ok",
		ms: 167,
		time: "09:42:07.348",
	},
	{
		slug: "monday",
		app: "monday",
		tool: "create_item",
		snippet: "board=Roadmap",
		status: "ok",
		ms: 198,
		time: "09:42:06.921",
	},
	{
		slug: "clickup",
		app: "clickup",
		tool: "create_task",
		snippet: "list=Bug triage",
		status: "run",
		ms: 0,
		time: "09:42:06.582",
	},
	{
		slug: "snowflake",
		app: "snowflake",
		tool: "execute_query",
		snippet: "SELECT mrr FROM …",
		status: "ok",
		ms: 567,
		time: "09:42:05.812",
	},
	{
		slug: "jira",
		app: "jira",
		tool: "transition_issue",
		snippet: "PROJ-481 → In Review",
		status: "ok",
		ms: 89,
		time: "09:42:05.418",
	},
	{
		slug: "discord",
		app: "discord",
		tool: "send_message",
		snippet: "channel=announcements",
		status: "ok",
		ms: 134,
		time: "09:42:05.013",
	},
	{
		slug: "trello",
		app: "trello",
		tool: "create_card",
		snippet: "list=Doing",
		status: "ok",
		ms: 178,
		time: "09:42:04.641",
	},
	{
		slug: "dropbox",
		app: "dropbox",
		tool: "list_folder",
		snippet: "path=/Customers/Q4",
		status: "ok",
		ms: 178,
		time: "09:42:04.298",
	},
	{
		slug: "shopify",
		app: "shopify",
		tool: "fulfill_order",
		snippet: "order=#10287",
		status: "ok",
		ms: 312,
		time: "09:42:03.821",
	},
	{
		slug: "openai",
		app: "openai",
		tool: "embeddings_create",
		snippet: "model=text-embedding-3",
		status: "ok",
		ms: 198,
		time: "09:42:03.421",
	},
];

const C = {
	textPrimary: "#c9d1d9",
	textSecondary: "#8b949e",
	textMuted: "#6e7681",
	textVeryMuted: "#484f58",
	canvas: "#000000",
	terminal: "#000000",
	header: "#0a0a0a",
	border: "#21262d",
	rowSep: "rgba(255,255,255,0.04)",
	blue: "#79c0ff",
	green: "#3fb950",
	red: "#f85149",
	yellow: "#d29922",
	composio: "#D97757",
} as const;

const PANEL_W = 980;
const PANEL_H = 560;
// No GitHub-style header anymore; the list takes the full panel height.
const BODY_H = PANEL_H;
const ROW_H = 36;
const VISIBLE_COUNT = Math.floor(BODY_H / ROW_H);
const EMIT_INTERVAL_MS = 320;
const BASE_MS =
	9 * 3600 * 1000 + 42 * 60 * 1000 + 15 * 1000 + 842;

// Which model made the tool call. Mixed across the log so it reads like a
// real multi-agent fleet calling through Composio.
type AgentKey =
	| "opus48"
	| "opus47"
	| "sonnet46"
	| "haiku45"
	| "gpt55"
	| "gemini25"
	| "deepseek"
	| "grok";

const AGENTS: Record<AgentKey, { logo: string; label: string }> = {
	opus48: { logo: "/images/clients/claude.svg", label: "Opus 4.8" },
	opus47: { logo: "/images/clients/claude.svg", label: "Opus 4.7" },
	sonnet46: { logo: "/images/clients/claude.svg", label: "Sonnet 4.6" },
	haiku45: { logo: "/images/clients/claude.svg", label: "Haiku 4.5" },
	gpt55: {
		logo: "/logos/openai-dark.svg",
		label: "GPT 5.5",
	},
	gemini25: { logo: "/images/clients/gemini.svg", label: "Gemini 2.5" },
	deepseek: { logo: "/images/clients/deepseek.svg", label: "DeepSeek R1" },
	grok: { logo: "/images/clients/grok.svg", label: "Grok 3" },
};

// Position-indexed assignment so each ENTRY consistently gets the same agent
// when the list cycles.
const AGENT_FOR_ENTRY: AgentKey[] = [
	"opus48",
	"gpt55",
	"sonnet46",
	"opus47",
	"gemini25",
	"opus48",
	"haiku45",
	"opus47",
	"gpt55",
	"opus48",
	"deepseek",
	"sonnet46",
	"opus47",
	"gpt55",
	"haiku45",
	"opus48",
	"sonnet46",
	"grok",
	"opus47",
	"gpt55",
	"opus48",
	"gemini25",
	"sonnet46",
	"opus47",
	"gpt55",
	"deepseek",
	"opus48",
	"sonnet46",
	"gemini25",
	"opus47",
	"gpt55",
	"opus48",
];

type EntryWithId = LogEntry & { _id: string; agentKey: AgentKey };

function makeTimestamp(seq: number): string {
	const t = BASE_MS + seq * EMIT_INTERVAL_MS;
	const hh = Math.floor(t / 3600000) % 24;
	const mm = Math.floor((t / 60000) % 60);
	const ss = Math.floor((t / 1000) % 60);
	const mmm = t % 1000;
	return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

export function EventLogSlide() {
	return (
		<DeckSlide>
			<Body />
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<motion.div
					className="relative"
					style={{
						width: PANEL_W,
						height: PANEL_H,
					}}
					initial={{ opacity: 0, y: 16 }}
					animate={
						isSlideActive
							? { opacity: 1, y: 0 }
							: { opacity: 0, y: 16 }
					}
					transition={{
						duration: 0.5,
						ease: [0.22, 1, 0.36, 1],
					}}
				>
					<ScrollList active={isSlideActive} />
				</motion.div>
			</div>

			<Notes>
				<PresenterNote noteKey="eventLog" />
			</Notes>
		</>
	);
}

function LiveBadge() {
	return (
		<div
			className="absolute"
			style={{
				top: -28,
				right: 4,
				display: "flex",
				alignItems: "center",
				gap: 6,
				fontFamily: "var(--font-jetbrains-mono), monospace",
			}}
		>
			<motion.span
				style={{
					width: 6,
					height: 6,
					borderRadius: 9999,
					background: C.green,
				}}
				animate={{ opacity: [0.35, 1, 0.35] }}
				transition={{
					duration: 1.4,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
			<span
				style={{
					color: C.green,
					fontSize: 10,
					fontWeight: 600,
					letterSpacing: "0.05em",
				}}
			>
				LIVE
			</span>
		</div>
	);
}

function ScrollList({ active }: { active: boolean }) {
	const [visible, setVisible] = useState<EntryWithId[]>([]);
	const counterRef = useRef(0);

	useEffect(() => {
		if (!active) return;

		const interval = window.setInterval(() => {
			const entryIdx = counterRef.current % ENTRIES.length;
			const next = ENTRIES[entryIdx];
			const seq = counterRef.current + 1;
			const newEntry: EntryWithId = {
				...next,
				time: makeTimestamp(seq),
				_id: `e-${seq}`,
				agentKey:
					AGENT_FOR_ENTRY[entryIdx % AGENT_FOR_ENTRY.length],
			};
			setVisible((prev) => [
				newEntry,
				...prev.slice(0, VISIBLE_COUNT - 1),
			]);
			counterRef.current = seq;
		}, EMIT_INTERVAL_MS);

		return () => window.clearInterval(interval);
	}, [active]);

	return (
		<div
			className="relative"
			style={{
				height: BODY_H,
				background: C.canvas,
				overflow: "hidden",
			}}
		>
			<AnimatePresence initial={false} mode="popLayout">
				{visible.map((entry) => (
					<motion.div
						key={entry._id}
						layout
						initial={{ opacity: 0, y: -6, scale: 0.985 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8 }}
						transition={{
							duration: 0.32,
							ease: [0.22, 1, 0.36, 1],
						}}
						style={{ willChange: "transform, opacity" }}
					>
						<LogRow entry={entry} />
					</motion.div>
				))}
			</AnimatePresence>

			<div
				className="pointer-events-none absolute inset-x-0 top-0"
				style={{
					height: 28,
					background: `linear-gradient(to bottom, ${C.canvas} 0%, transparent 100%)`,
					zIndex: 5,
				}}
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0"
				style={{
					height: ROW_H + 36,
					background: `linear-gradient(to top, ${C.canvas} 0%, ${C.canvas} 40%, transparent 100%)`,
					zIndex: 5,
				}}
			/>
		</div>
	);
}

function LogRow({ entry }: { entry: EntryWithId }) {
	const statusColor =
		entry.status === "ok"
			? C.green
			: entry.status === "err"
				? C.red
				: C.yellow;
	const StatusIcon =
		entry.status === "ok"
			? Check
			: entry.status === "err"
				? X
				: Loader2;
	const statusBg = `${statusColor}1A`; // ~10% alpha
	const agent = AGENTS[entry.agentKey];

	return (
		<div
			className="flex items-center"
			style={{
				height: ROW_H,
				padding: "0 18px",
				gap: 12,
				borderBottom: `1px solid ${C.rowSep}`,
				fontFamily: "var(--font-jetbrains-mono), monospace",
				fontSize: 11,
				color: C.textPrimary,
			}}
		>
			<div
				style={{
					width: 16,
					height: 16,
					borderRadius: 9999,
					background: statusBg,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				<StatusIcon
					size={10}
					color={statusColor}
					strokeWidth={2.5}
					className={
						entry.status === "run" ? "animate-spin" : undefined
					}
				/>
			</div>

			{/* Agent that made the tool call */}
			<div
				className="flex items-center"
				style={{
					width: 108,
					gap: 6,
					flexShrink: 0,
				}}
			>
				<img
					src={agent.logo}
					width={13}
					height={13}
					alt=""
					style={{ display: "block", flexShrink: 0 }}
				/>
				<span
					style={{
						color: C.textPrimary,
						fontSize: 10.5,
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{agent.label}
				</span>
			</div>

			<img
				src={`/logos/${entry.slug}-dark.svg`}
				width={16}
				height={16}
				alt=""
				style={{ display: "block", flexShrink: 0 }}
			/>

			<div
				className="flex items-baseline gap-3"
				style={{
					flex: 1,
					minWidth: 0,
					overflow: "hidden",
				}}
			>
				<span
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					<span style={{ color: C.blue }}>{entry.app}</span>
					<span style={{ color: C.textMuted }}>.</span>
					<span style={{ color: C.textPrimary }}>{entry.tool}</span>
				</span>
				<span
					style={{
						color: C.textMuted,
						fontSize: 10,
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{entry.snippet}
				</span>
			</div>

			<span
				style={{
					width: 58,
					color: entry.status === "run" ? C.yellow : C.textSecondary,
					fontSize: 10,
					textAlign: "right",
					flexShrink: 0,
				}}
			>
				{entry.status === "run" ? "…" : `${entry.ms}ms`}
			</span>
			<span
				style={{
					width: 96,
					color: C.textVeryMuted,
					fontSize: 10,
					textAlign: "right",
					flexShrink: 0,
				}}
			>
				{entry.time}
			</span>
		</div>
	);
}
