"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

/* ---------- palette ---------- */

const C = {
	textPrimary: "#c9d1d9",
	textSecondary: "#8b949e",
	textMuted: "#6e7681",
	textVeryMuted: "#484f58",
	green: "#3fb950",
	blue: "#79c0ff",
	claude: "#D97757",
	rowSep: "rgba(255,255,255,0.04)",
} as const;

/* ---------- mini log feed (pre-populated) ---------- */

type LogEntry = {
	slug: string;
	tool: string;
	time: string;
};

const LOG_ENTRIES: LogEntry[] = [
	{ slug: "gmail", tool: "gmail.send_email", time: "09:42:15.842" },
	{ slug: "slack", tool: "slack.post_message", time: "09:42:15.512" },
	{ slug: "salesforce", tool: "salesforce.create_lead", time: "09:42:15.084" },
	{ slug: "notion", tool: "notion.create_page", time: "09:42:14.671" },
	{ slug: "linear", tool: "linear.create_issue", time: "09:42:14.382" },
	{ slug: "hubspot", tool: "hubspot.update_deal", time: "09:42:13.861" },
	{ slug: "zendesk", tool: "zendesk.update_ticket", time: "09:42:13.418" },
	{ slug: "stripe", tool: "stripe.create_invoice", time: "09:42:13.214" },
	{ slug: "sentry", tool: "sentry.resolve_issue", time: "09:42:12.847" },
	{ slug: "asana", tool: "asana.create_task", time: "09:42:12.371" },
	{ slug: "calendly", tool: "calendly.list_events", time: "09:42:11.965" },
	{ slug: "datadog", tool: "datadog.query_metrics", time: "09:42:11.628" },
	{ slug: "intercom", tool: "intercom.reply", time: "09:42:11.241" },
	{ slug: "sendgrid", tool: "sendgrid.send_email", time: "09:42:10.687" },
	{ slug: "twilio", tool: "twilio.send_sms", time: "09:42:10.281" },
	{ slug: "github", tool: "github.create_pr", time: "09:42:09.923" },
	{ slug: "figma", tool: "figma.get_comments", time: "09:42:09.558" },
	{ slug: "snowflake", tool: "snowflake.query", time: "09:42:09.281" },
	{ slug: "jira", tool: "jira.transition_issue", time: "09:42:08.847" },
	{ slug: "airtable", tool: "airtable.create_record", time: "09:42:08.512" },
	{ slug: "monday", tool: "monday.create_item", time: "09:42:08.142" },
	{ slug: "clickup", tool: "clickup.create_task", time: "09:42:07.768" },
	{ slug: "discord", tool: "discord.send_message", time: "09:42:07.412" },
	{ slug: "trello", tool: "trello.create_card", time: "09:42:07.018" },
];

const LOG_EMIT_MS = 360;
const ROW_H = 26;

/* ---------- layout ---------- */

const PANEL_W = 1040;
const PANEL_H = 540;
const LOG_W = 360;
const LAYERS_X = LOG_W + 80;
const LAYERS_W = PANEL_W - LAYERS_X;

/* Each card gets its OWN shape — proportions match its UI metaphor.
   API docs: wide screen.   Notion: taller page.   Sticky: small square. */
type CardLayout = {
	left: number;
	top: number;
	width: number;
	height: number;
	rotate: number;
};

const CARD_LAYOUTS: CardLayout[] = [
	// GLOBAL — wide horizontal API panel, top-aligned, slight counter-tilt
	{ left: 8, top: 8, width: 600, height: 130, rotate: -1.1 },
	// COMPOSIO — narrow portrait page (real Notion proportions)
	{ left: 4, top: 175, width: 320, height: 250, rotate: 0.7 },
	// KARAN — small square sticky, bottom-right, pronounced tilt
	{ left: 372, top: 384, width: 220, height: 150, rotate: -3.2 },
];

function curve(x1: number, y1: number, x2: number, y2: number) {
	const midX = (x1 + x2) / 2;
	return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

/* Paths land on the LEFT edge of each card, vertically centered. */
function cardAnchor(layerIdx: number) {
	const c = CARD_LAYOUTS[layerIdx];
	return {
		x: LAYERS_X + c.left + 4,
		y: c.top + c.height / 2,
	};
}

type Connection = { fromY: number; layerIdx: number; accent: string };

const CONNECTIONS: Connection[] = [
	{ fromY: 80, layerIdx: 0, accent: C.blue },
	{ fromY: 250, layerIdx: 1, accent: C.green },
	{ fromY: 440, layerIdx: 2, accent: C.claude },
];

const KICKOFF_DELAY = 0.6;

export function ContextRecordSlide() {
	return (
		<DeckSlide primitive="context">
			<Body />
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="relative"
					style={{ width: PANEL_W, height: PANEL_H }}
				>
					<MiniLog active={isSlideActive} />
					<LayerStack active={isSlideActive} />
					<ConnectionsOverlay active={isSlideActive} />
				</div>
			</div>

			<Notes>
				Same record, three scales: an API spec for everyone, a company
				playbook in Notion, a personal sticky note. The agent reads
				whichever format the level calls for.
			</Notes>
		</>
	);
}

/* ---------- mini log ---------- */

type EntryWithId = LogEntry & { _id: string };

function MiniLog({ active }: { active: boolean }) {
	const VISIBLE_MAX = Math.floor((PANEL_H - 40) / ROW_H);

	const [visible, setVisible] = useState<EntryWithId[]>(() =>
		LOG_ENTRIES.slice(0, VISIBLE_MAX).map((e, i) => ({
			...e,
			_id: `init-${i}`,
		})),
	);
	const counterRef = useRef(VISIBLE_MAX);

	useEffect(() => {
		if (!active) return;
		const interval = window.setInterval(() => {
			const idx = counterRef.current % LOG_ENTRIES.length;
			const seq = counterRef.current + 1;
			const next = LOG_ENTRIES[idx];
			setVisible((prev) => [
				{ ...next, _id: `e-${seq}` },
				...prev.slice(0, VISIBLE_MAX - 1),
			]);
			counterRef.current = seq;
		}, LOG_EMIT_MS);
		return () => window.clearInterval(interval);
	}, [active, VISIBLE_MAX]);

	return (
		<div
			className="absolute"
			style={{
				left: 0,
				top: 0,
				width: LOG_W,
				height: PANEL_H,
				borderRadius: 10,
				border: "1px solid rgba(255,255,255,0.10)",
				background: "rgba(15, 17, 22, 0.6)",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					padding: "8px 14px 6px",
					display: "flex",
					alignItems: "baseline",
					gap: 10,
					borderBottom: "1px solid rgba(255,255,255,0.06)",
					flexShrink: 0,
				}}
			>
				<span
					style={{
						color: C.textPrimary,
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: "0.08em",
						fontFamily: "var(--font-jetbrains-mono), monospace",
					}}
				>
					EVENT LOG
				</span>
				<span
					style={{
						color: C.textMuted,
						fontSize: 10,
						fontFamily: "var(--font-jetbrains-mono), monospace",
					}}
				>
					every action, recorded
				</span>
			</div>

			<div
				className="relative"
				style={{ flex: 1, overflow: "hidden" }}
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
							<MiniLogRow entry={entry} />
						</motion.div>
					))}
				</AnimatePresence>

				<div
					className="pointer-events-none absolute inset-x-0 bottom-0"
					style={{
						height: ROW_H + 28,
						background:
							"linear-gradient(to top, rgba(15,17,22,1) 0%, rgba(15,17,22,1) 40%, transparent 100%)",
						zIndex: 5,
					}}
				/>
			</div>
		</div>
	);
}

function MiniLogRow({ entry }: { entry: EntryWithId }) {
	return (
		<div
			className="flex items-center"
			style={{
				height: ROW_H,
				padding: "0 14px",
				gap: 8,
				fontFamily: "var(--font-jetbrains-mono), monospace",
				fontSize: 10,
				color: C.textPrimary,
				borderBottom: `1px solid ${C.rowSep}`,
			}}
		>
			<div
				style={{
					width: 12,
					height: 12,
					borderRadius: 9999,
					background: `${C.green}1A`,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				<Check size={8} color={C.green} strokeWidth={2.6} />
			</div>
			<img
				src={`https://logos.composio.dev/api/${entry.slug}?theme=dark`}
				width={14}
				height={14}
				alt=""
				style={{ display: "block", flexShrink: 0 }}
			/>
			<span
				style={{
					flex: 1,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{entry.tool}
			</span>
			<span
				style={{
					color: C.textVeryMuted,
					fontSize: 9,
					whiteSpace: "nowrap",
				}}
			>
				{entry.time}
			</span>
		</div>
	);
}

/* ---------- three UIs stack ---------- */

function LayerStack({ active }: { active: boolean }) {
	return (
		<div
			className="absolute"
			style={{
				left: LAYERS_X,
				top: 0,
				width: LAYERS_W,
				height: PANEL_H,
			}}
		>
			{[0, 1, 2].map((i) => (
				<CardWrapper
					key={i}
					layout={CARD_LAYOUTS[i]}
					active={active}
					revealDelay={KICKOFF_DELAY + i * 0.18}
					zIndex={3 - i}
				>
					{i === 0 && <ApiDocsCard />}
					{i === 1 && <NotionCard />}
					{i === 2 && <StickyNoteCard />}
				</CardWrapper>
			))}
		</div>
	);
}

function CardWrapper({
	layout,
	active,
	revealDelay,
	zIndex,
	children,
}: {
	layout: CardLayout;
	active: boolean;
	revealDelay: number;
	zIndex: number;
	children: React.ReactNode;
}) {
	return (
		<motion.div
			className="absolute"
			style={{
				left: layout.left,
				top: layout.top,
				width: layout.width,
				height: layout.height,
				zIndex,
				transformOrigin: "center",
				willChange: "transform, opacity",
			}}
			initial={{ opacity: 0, x: 12, rotate: layout.rotate }}
			animate={
				active
					? { opacity: 1, x: 0, rotate: layout.rotate }
					: { opacity: 0, x: 12, rotate: layout.rotate }
			}
			transition={{
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1],
				delay: active ? revealDelay : 0,
			}}
		>
			{children}
		</motion.div>
	);
}

/* ---------- card 1 — GLOBAL → looks like API docs / spec ---------- */

function ApiDocsCard() {
	const blue = C.blue;
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				borderRadius: 8,
				border: `1px solid ${blue}33`,
				background:
					"linear-gradient(180deg, #0d1117 0%, #060708 100%)",
				overflow: "hidden",
				fontFamily: "var(--font-jetbrains-mono), monospace",
				display: "flex",
				flexDirection: "column",
				boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
			}}
		>
			{/* tab/title bar */}
			<div
				style={{
					padding: "8px 14px",
					background: "#161b22",
					borderBottom: `1px solid ${blue}1F`,
					display: "flex",
					alignItems: "center",
					gap: 10,
					fontSize: 10.5,
				}}
			>
				<span
					style={{
						color: blue,
						fontWeight: 700,
						background: `${blue}1A`,
						padding: "2px 6px",
						borderRadius: 3,
					}}
				>
					POST
				</span>
				<span style={{ color: C.textPrimary }}>
					slack.chat.postMessage
				</span>
				<span style={{ marginLeft: "auto", color: C.textMuted }}>
					v2.13
				</span>
				<span
					style={{
						color: C.green,
						fontSize: 9,
						padding: "1px 6px",
						borderRadius: 3,
						border: `1px solid ${C.green}40`,
					}}
				>
					stable
				</span>
			</div>

			{/* spec body — two columns: params + default */}
			<div
				style={{
					flex: 1,
					padding: "10px 14px",
					display: "flex",
					gap: 18,
					fontSize: 10.5,
					color: C.textPrimary,
					lineHeight: 1.55,
				}}
			>
				<div style={{ flex: 1 }}>
					<div
						style={{
							color: C.textMuted,
							fontSize: 8.5,
							textTransform: "uppercase",
							letterSpacing: "0.08em",
							marginBottom: 4,
						}}
					>
						Params
					</div>
					<div>
						<span style={{ color: "#ffa657" }}>channel</span>
						<span style={{ color: "#f85149" }}>*</span>{" "}
						<span style={{ color: C.textMuted }}>string</span>
					</div>
					<div>
						<span style={{ color: "#ffa657" }}>text</span>
						<span style={{ color: "#f85149" }}>*</span>{" "}
						<span style={{ color: C.textMuted }}>string</span>
					</div>
					<div>
						<span style={{ color: "#ffa657" }}>thread_ts</span>{" "}
						<span style={{ color: C.textMuted }}>string</span>
					</div>
				</div>
				<div
					style={{
						flex: 1.1,
						paddingLeft: 14,
						borderLeft: "1px dashed #30363d",
					}}
				>
					<div
						style={{
							color: C.textMuted,
							fontSize: 8.5,
							textTransform: "uppercase",
							letterSpacing: "0.08em",
							marginBottom: 4,
						}}
					>
						Default
					</div>
					<div
						style={{
							color: C.textSecondary,
							fontStyle: "italic",
						}}
					>
						// when thread_ts is omitted,
					</div>
					<div
						style={{
							color: C.textSecondary,
							fontStyle: "italic",
						}}
					>
						// message replies in the
					</div>
					<div
						style={{
							color: C.textSecondary,
							fontStyle: "italic",
						}}
					>
						// thread root by default.
					</div>
				</div>
			</div>

			{/* footer scope tag */}
			<div
				style={{
					padding: "5px 14px",
					background: "#0a0d12",
					borderTop: "1px solid #21262d",
					display: "flex",
					alignItems: "center",
					gap: 8,
					fontSize: 9,
				}}
			>
				<span
					style={{
						color: blue,
						fontWeight: 700,
						letterSpacing: "0.1em",
					}}
				>
					GLOBAL
				</span>
				<span style={{ color: C.textMuted }}>·</span>
				<span style={{ color: C.textMuted }}>
					how the tool works · true for everyone
				</span>
			</div>
		</div>
	);
}

/* ---------- card 2 — COMPOSIO → looks like a Notion page ---------- */

function NotionCard() {
	const green = C.green;
	// One sans font + one mono font, used consistently in this card.
	const SANS =
		'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
	const MONO = "var(--font-jetbrains-mono), monospace";
	// Consistent type scale: small / body / title.
	const T_SMALL = 11;
	const T_BODY = 12;
	const T_TITLE = 20;

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				borderRadius: 6,
				border: `1px solid ${green}33`,
				background: "#ffffff",
				overflow: "hidden",
				fontFamily: SANS,
				fontSize: T_BODY,
				color: "#37352f",
				display: "flex",
				flexDirection: "column",
				boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
			}}
		>
			{/* top bar — breadcrumb + share */}
			<div
				style={{
					padding: "6px 10px",
					background: "#ffffff",
					borderBottom: "1px solid #ededec",
					display: "flex",
					alignItems: "center",
					gap: 5,
					fontSize: T_SMALL,
					color: "#9b9a97",
				}}
			>
				<img
					src="https://logos.composio.dev/api/notion?theme=light"
					width={11}
					height={11}
					alt=""
					style={{ display: "block" }}
				/>
				<span>Composio</span>
				<span style={{ color: "#d5d4d2" }}>/</span>
				<span style={{ color: "#37352f", fontWeight: 500 }}>
					Playbooks
				</span>
				<div
					style={{
						marginLeft: "auto",
						display: "flex",
						alignItems: "center",
						gap: 8,
						fontSize: T_SMALL,
					}}
				>
					<span style={{ color: "#9b9a97" }}>★</span>
					<span
						style={{
							padding: "1px 7px",
							color: "#9b9a97",
							borderRadius: 3,
							fontWeight: 500,
							border: "1px solid #ededec",
						}}
					>
						Share
					</span>
				</div>
			</div>

			{/* page body */}
			<div
				style={{
					flex: 1,
					padding: "14px 20px 10px",
					display: "flex",
					flexDirection: "column",
					gap: 6,
				}}
			>
				{/* page icon — emoji on its own line, Notion-distinctive */}
				<div style={{ fontSize: 32, lineHeight: 1 }}>📋</div>

				{/* title */}
				<div
					style={{
						fontSize: T_TITLE,
						fontWeight: 700,
						letterSpacing: "-0.02em",
						lineHeight: 1.15,
						color: "#37352f",
					}}
				>
					Renewal email playbook
				</div>

				{/* property rows — stacked vertically (fits narrow width) */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 4,
						marginTop: 4,
						fontSize: T_SMALL,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}
					>
						<span
							style={{
								color: "#9b9a97",
								width: 56,
								flexShrink: 0,
							}}
						>
							Status
						</span>
						<span
							style={{
								padding: "1px 8px",
								borderRadius: 3,
								background: "#dbe6c5",
								color: "#446e29",
								fontWeight: 500,
								display: "inline-flex",
								alignItems: "center",
								gap: 5,
							}}
						>
							<span
								style={{
									width: 5,
									height: 5,
									borderRadius: 9999,
									background: "#669c40",
								}}
							/>
							Active
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}
					>
						<span
							style={{
								color: "#9b9a97",
								width: 56,
								flexShrink: 0,
							}}
						>
							Owner
						</span>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							<span
								style={{
									width: 16,
									height: 16,
									borderRadius: 9999,
									background: "#e16b8c",
									color: "#fff",
									fontSize: 9,
									fontWeight: 600,
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								S
							</span>
							<span
								style={{
									color: "#37352f",
									fontWeight: 500,
								}}
							>
								Soham
							</span>
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}
					>
						<span
							style={{
								color: "#9b9a97",
								width: 56,
								flexShrink: 0,
							}}
						>
							Edited
						</span>
						<span style={{ color: "#37352f", fontWeight: 500 }}>
							2 weeks ago
						</span>
					</div>
				</div>

				{/* callout — Notion's classic "💡" tinted box */}
				<div
					style={{
						marginTop: 8,
						display: "flex",
						alignItems: "flex-start",
						gap: 8,
						padding: "10px 12px",
						background: "#f1f1ef",
						borderRadius: 4,
						fontSize: T_BODY,
						lineHeight: 1.45,
						color: "#37352f",
					}}
				>
					<span style={{ fontSize: 14, lineHeight: 1 }}>💡</span>
					<span>
						Reference{" "}
						<code
							style={{
								background: "#ffefe8",
								padding: "1px 5px",
								borderRadius: 3,
								fontFamily: MONO,
								fontSize: T_SMALL,
								color: "#eb5757",
							}}
						>
							#1827
						</code>{" "}
						in subject. CC the AE on every reply.
					</span>
				</div>
			</div>

			{/* footer scope tag */}
			<div
				style={{
					padding: "5px 18px",
					borderTop: "1px solid #ededec",
					background: "#fbfbf9",
					display: "flex",
					alignItems: "center",
					gap: 6,
					fontSize: 9.5,
					fontFamily: MONO,
					color: "#9b9a97",
				}}
			>
				<span
					style={{
						color: green,
						fontWeight: 700,
						letterSpacing: "0.1em",
					}}
				>
					COMPOSIO
				</span>
				<span>·</span>
				<span>how your company does it</span>
			</div>
		</div>
	);
}

/* ---------- card 3 — KARAN → looks like an Apple Notes / sticky note ---------- */

function StickyNoteCard() {
	const claude = C.claude;
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				borderRadius: 6,
				border: "1px solid rgba(0,0,0,0.18)",
				background:
					"linear-gradient(180deg, #fef3a0 0%, #fde87a 100%)",
				overflow: "hidden",
				fontFamily: '"Caveat", "Marker Felt", "Bradley Hand", cursive',
				color: "#3d2914",
				display: "flex",
				flexDirection: "column",
				transform: "rotate(-0.4deg)",
				boxShadow:
					"0 10px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2)",
			}}
		>
			{/* tape strip */}
			<div
				style={{
					height: 14,
					width: "40%",
					margin: "0 auto",
					background: "rgba(217, 119, 87, 0.32)",
					borderRadius: "0 0 4px 4px",
					boxShadow: "0 2px 3px rgba(0,0,0,0.08)",
				}}
			/>

			{/* note body */}
			<div
				style={{
					flex: 1,
					padding: "6px 18px 4px",
					display: "flex",
					flexDirection: "column",
					gap: 4,
				}}
			>
				<div
					style={{
						fontSize: 18,
						fontWeight: 700,
						lineHeight: 1,
						color: "#5c3a1c",
						display: "flex",
						alignItems: "center",
						gap: 6,
					}}
				>
					<span style={{ fontSize: 16 }}>✏️</span>
					<span>my rules</span>
				</div>
				<div
					style={{
						fontSize: 17,
						lineHeight: 1.18,
						color: "#3d2914",
					}}
				>
					async first.
					<br />
					<em>Notion doc</em> → Slack.
				</div>
			</div>

			{/* footer scope tag */}
			<div
				style={{
					padding: "4px 18px",
					display: "flex",
					alignItems: "center",
					gap: 6,
					fontSize: 8.5,
					color: "rgba(61, 41, 20, 0.7)",
					borderTop: "1px dashed rgba(0,0,0,0.18)",
					fontFamily: "var(--font-jetbrains-mono), monospace",
				}}
			>
				<span
					style={{
						color: claude,
						fontWeight: 700,
						letterSpacing: "0.1em",
					}}
				>
					KARAN
				</span>
				<span>·</span>
				<span>Mar 14, 2026</span>
			</div>
		</div>
	);
}

/* ---------- SVG connections from log → each card ---------- */

function ConnectionsOverlay({ active }: { active: boolean }) {
	return (
		<svg
			className="pointer-events-none absolute"
			width={PANEL_W}
			height={PANEL_H}
			viewBox={`0 0 ${PANEL_W} ${PANEL_H}`}
			style={{
				left: 0,
				top: 0,
				zIndex: 10,
				overflow: "visible",
			}}
		>
			{CONNECTIONS.map((conn, i) => {
				const x1 = LOG_W;
				const y1 = conn.fromY;
				const anchor = cardAnchor(conn.layerIdx);
				const x2 = anchor.x;
				const y2 = anchor.y;
				const d = curve(x1, y1, x2, y2);
				const delay = KICKOFF_DELAY + 0.6 + i * 0.2;
				return (
					<motion.g
						key={i}
						initial={{ opacity: 0 }}
						animate={active ? { opacity: 1 } : { opacity: 0 }}
						transition={{
							duration: 0.4,
							delay: active ? delay : 0,
						}}
					>
						<motion.circle
							cx={x1}
							cy={y1}
							r={3.5}
							fill="#ffffff"
							stroke="#000000"
							strokeWidth={1.5}
							initial={{ opacity: 0, scale: 0.3 }}
							animate={
								active
									? { opacity: 1, scale: 1 }
									: { opacity: 0, scale: 0.3 }
							}
							transition={{
								duration: 0.3,
								ease: [0.22, 1, 0.36, 1],
								delay: active ? delay - 0.05 : 0,
							}}
							style={{
								transformOrigin: `${x1}px ${y1}px`,
							}}
						/>
						<motion.path
							d={d}
							fill="none"
							stroke="#ffffff"
							strokeWidth={1.3}
							strokeDasharray="4 4"
							strokeLinecap="round"
							style={{ opacity: 0.7 }}
							initial={{ pathLength: 0 }}
							animate={
								active ? { pathLength: 1 } : { pathLength: 0 }
							}
							transition={{
								duration: 0.75,
								ease: [0.22, 1, 0.36, 1],
								delay: active ? delay : 0,
							}}
						/>
					</motion.g>
				);
			})}
		</svg>
	);
}
