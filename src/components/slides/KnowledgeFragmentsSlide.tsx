"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Bell,
	Bookmark,
	ChevronDown,
	ChevronRight,
	CircleDot,
	CircleHelp,
	Edit3,
	Filter,
	Hash,
	HelpCircle,
	Inbox,
	LayoutGrid,
	Lock,
	Menu,
	MessageSquare,
	MoreHorizontal,
	MoreVertical,
	Paperclip,
	Phone,
	Plus,
	Puzzle,
	RotateCw,
	Search,
	Send,
	Settings,
	Star,
	Tag,
	User,
	UserCircle2,
	Users,
	Video,
	X,
} from "lucide-react";
import { useContext, useEffect, useState, type ReactNode } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";

const LOGO = (slug: string) => `https://logos.composio.dev/api/${slug}`;
const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const TABS = [
	{
		slug: "salesforce",
		title: "ACME Corp — Platform Rollout | Salesforce",
		url: "lightning.salesforce.com/lightning/r/Opportunity/006XX0000045HJq/view",
	},
	{
		slug: "notion",
		title: "ACME Corp — Discovery",
		url: "notion.so/acme/ACME-Corp-Discovery-a3b1c2dee54f4b9c",
	},
	{
		slug: "slack",
		title: "#deal-acme-corp — Slack",
		url: "app.slack.com/client/T024A1B2C/C03A1B7F",
	},
	{
		slug: "gmail",
		title: "Inbox (248) — alice@acme.com — Gmail",
		url: "mail.google.com/mail/u/0/#inbox/FMfcgzGtwXqxJTpQrSdF",
	},
	{
		slug: "zendesk",
		title: "Ticket #1284 ACME Corp — Zendesk",
		url: "acme.zendesk.com/agent/tickets/1284",
	},
] as const;

const TAB_STAGGER = 0.95;
const FIRST_TAB_DELAY = 0.25;
// Phase 2 — the active-tab cycle once all five are open. Slower than phase 1
// so each tab gets a clear beat before the next one takes over.
const PHASE2_CYCLE = 2.2;

// Step 0 — the five tabs collapse into a single Composio tab and the toolkits
// dashboard fills the (expanded) content area below.
const COMPOSIO_TAB = {
	slug: "composio",
	title: "Toolkits — Composio Platform",
	url: "platform.composio.dev/test_org_new/composio/toolkits",
} as const;

const COMPACT_CONTENT_H = 280;
const EXPANDED_CONTENT_H = 540;

// Chrome dark-mode palette so the navbar reads as "an actual browser".
const C = {
	titleBg: "#272A2D",
	titleBg2: "#1E2022",
	tabInactive: "#2F3236",
	tabActive: "#3C4043",
	tabHi: "#FFFFFF",
	tabTextActive: "#E8EAED",
	tabTextInactive: "#9AA0A6",
	urlBar: "#3C4043",
	urlText: "#E8EAED",
	urlMuted: "#9AA0A6",
	contentBg: "#202124",
	border: "#3C4043",
	divider: "#1E2022",
} as const;

export function KnowledgeFragmentsSlide() {
	return (
		<DeckSlide>
			<KnowledgeFragmentsBody />
		</DeckSlide>
	);
}

function KnowledgeFragmentsBody() {
	const { isSlideActive } = useContext(SlideContext);
	const { reached, placeholder } = useStepMotion(1);
	const collapsed = reached(0);
	const [enteredCount, setEnteredCount] = useState(0);
	const [activeIdx, setActiveIdx] = useState(-1);

	useEffect(() => {
		if (!isSlideActive || collapsed) {
			// Once the audience advances the step, freeze the loop — the tabs
			// are about to be replaced by the Composio tab.
			if (!isSlideActive) {
				setEnteredCount(0);
				setActiveIdx(-1);
			}
			return;
		}
		let cancelled = false;
		let cycleInterval: ReturnType<typeof setInterval> | null = null;
		const timers: ReturnType<typeof setTimeout>[] = [];

		// Phase 1 — open each tab in sequence; newest is the active one.
		for (let i = 0; i < TABS.length; i++) {
			const delay = (FIRST_TAB_DELAY + i * TAB_STAGGER) * 1000;
			timers.push(
				setTimeout(() => {
					if (cancelled) return;
					setEnteredCount(i + 1);
					setActiveIdx(i);
				}, delay),
			);
		}

		// Phase 2 — all five tabs are open. Cycle the active one forever to
		// show the audience the relentless context-switching between apps.
		const phase2Start =
			(FIRST_TAB_DELAY + (TABS.length - 1) * TAB_STAGGER + 1.6) * 1000;
		timers.push(
			setTimeout(() => {
				if (cancelled) return;
				let cycleI = TABS.length - 1;
				cycleInterval = setInterval(() => {
					if (cancelled) return;
					cycleI = (cycleI + 1) % TABS.length;
					setActiveIdx(cycleI);
				}, PHASE2_CYCLE * 1000);
			}, phase2Start),
		);

		return () => {
			cancelled = true;
			timers.forEach(clearTimeout);
			if (cycleInterval) clearInterval(cycleInterval);
		};
	}, [isSlideActive, collapsed]);

	const active = activeIdx >= 0 ? TABS[activeIdx] : null;

	return (
		<>
			{placeholder}
			<div
				className="relative flex flex-1 items-center justify-center"
				style={{ fontFamily: SANS }}
			>
				<motion.div
					className="overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.55),0_10px_24px_rgba(0,0,0,0.4)]"
					style={{ width: 1100, background: C.contentBg }}
					initial={false}
					animate={{ y: collapsed ? -50 : 0 }}
					transition={{ duration: 0.75, ease: [0.34, 1.12, 0.6, 1] }}
				>
					{/* macOS title bar + tab strip */}
					<div
						className="relative flex items-end pl-[88px] pr-3 pt-2"
						style={{
							background: `linear-gradient(180deg, ${C.titleBg} 0%, ${C.titleBg2} 100%)`,
							height: 44,
						}}
					>
						{/* Traffic lights */}
						<div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
							<span
								className="size-[12px] rounded-full"
								style={{
									background: "#FF5F57",
									border: "0.5px solid rgba(0,0,0,0.25)",
								}}
							/>
							<span
								className="size-[12px] rounded-full"
								style={{
									background: "#FEBC2E",
									border: "0.5px solid rgba(0,0,0,0.25)",
								}}
							/>
							<span
								className="size-[12px] rounded-full"
								style={{
									background: "#28C840",
									border: "0.5px solid rgba(0,0,0,0.25)",
								}}
							/>
						</div>

						{/* Tabs */}
						<div className="flex items-end gap-[2px]">
							{TABS.map((tab, i) => {
								const entered = enteredCount > i;
								const isActive = !collapsed && activeIdx === i;
								return (
									<motion.div
										key={tab.slug}
										initial={{ width: 0, opacity: 0 }}
										animate={
											collapsed
												? { width: 0, opacity: 0 }
												: entered
													? { width: 220, opacity: 1 }
													: { width: 0, opacity: 0 }
										}
										transition={{
											duration: 0.45,
											ease: [0.34, 1.1, 0.6, 1],
										}}
										style={{ overflow: "hidden", flexShrink: 0 }}
									>
										<ChromeTab tab={tab} active={isActive} />
									</motion.div>
								);
							})}
							{/* Composio tab — grows in once the five collapse. */}
							<motion.div
								initial={{ width: 0, opacity: 0 }}
								animate={
									collapsed
										? { width: 260, opacity: 1 }
										: { width: 0, opacity: 0 }
								}
								transition={{
									duration: 0.55,
									ease: [0.34, 1.18, 0.6, 1],
									delay: collapsed ? 0.35 : 0,
								}}
								style={{ overflow: "hidden", flexShrink: 0 }}
							>
								<ChromeTab
									tab={{
										slug: COMPOSIO_TAB.slug,
										title: COMPOSIO_TAB.title,
										url: COMPOSIO_TAB.url,
									}}
									active
								/>
							</motion.div>
							{/* + new tab button */}
							<motion.button
								className="ml-1 mb-1 flex size-7 items-center justify-center rounded-full"
								style={{ color: C.tabTextInactive }}
								initial={{ opacity: 0 }}
								animate={
									isSlideActive
										? { opacity: 1 }
										: { opacity: 0 }
								}
								transition={{ duration: 0.4, delay: 0.1 }}
							>
								<span className="text-[16px] leading-none">+</span>
							</motion.button>
						</div>
					</div>

					{/* URL bar */}
					<div
						className="flex items-center gap-2 px-3 py-2"
						style={{
							background: C.titleBg2,
							borderBottom: `1px solid ${C.divider}`,
						}}
					>
						<NavButton icon={ArrowLeft} dim />
						<NavButton icon={ArrowRight} dim />
						<NavButton icon={RotateCw} />

						{/* URL pill */}
						<div
							className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5"
							style={{ background: C.urlBar }}
						>
							<Lock size={13} style={{ color: C.urlMuted }} />
							<AnimatePresence mode="wait">
								<motion.div
									key={collapsed ? COMPOSIO_TAB.url : (active?.url ?? "blank")}
									initial={{ opacity: 0, y: 3 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -3 }}
									transition={{ duration: 0.22 }}
									className="flex-1 truncate font-mono text-[11px]"
									style={{ color: C.urlText }}
								>
									{collapsed ? (
										<UrlText url={COMPOSIO_TAB.url} />
									) : active ? (
										<UrlText url={active.url} />
									) : (
										<span style={{ color: C.urlMuted }}>
											chrome://newtab
										</span>
									)}
								</motion.div>
							</AnimatePresence>
							<Star size={13} style={{ color: C.urlMuted }} />
						</div>

						<NavButton icon={Puzzle} dim />
						<div
							className="ml-1 flex size-7 items-center justify-center rounded-full"
							style={{ background: "#185ABC", color: "#fff" }}
						>
							<User size={13} />
						</div>
						<NavButton icon={MoreVertical} dim />
					</div>

					{/* Content area — when collapsed, expands and shows the real
					    Composio toolkits dashboard. */}
					<motion.div
						className="relative overflow-hidden"
						initial={false}
						animate={{
							height: collapsed ? EXPANDED_CONTENT_H : COMPACT_CONTENT_H,
						}}
						transition={{ duration: 0.75, ease: [0.34, 1.12, 0.6, 1] }}
						style={{ background: "#000000" }}
					>
						<AnimatePresence mode="wait">
							{collapsed ? (
								<motion.div
									key="composio-dashboard"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className="absolute inset-0 overflow-hidden"
								>
									{/* The captured dashboard was rendered at a desktop
									    viewport (~1440px). Let the iframe think it's
									    still that wide and scale it down so the layout
									    proportions match the original. */}
									<iframe
										src="/composio-dashboard.html"
										title="Composio toolkits"
										style={{
											width: 1600,
											height: 900,
											border: 0,
											display: "block",
											transform: `scale(${1100 / 1600})`,
											transformOrigin: "top left",
											pointerEvents: "none",
										}}
										sandbox="allow-same-origin"
									/>
								</motion.div>
							) : active ? (
								<motion.div
									key={active.slug}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.28 }}
									className="absolute inset-0"
								>
									<AppFakeUI slug={active.slug} />
								</motion.div>
							) : null}
						</AnimatePresence>
						{/* Black fade. Compact state (five tabs) — long gentle fade.
						    Collapsed state (dashboard) — only the very bottom fades
						    so the toolkit grid dissolves off the slide instead of
						    cutting against a hard edge. */}
						<div
							className="pointer-events-none absolute inset-0"
							style={{
								zIndex: 10,
								background: collapsed
									? "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 92%, rgba(0,0,0,1) 100%)"
									: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 25%, #000000 95%)",
							}}
						/>
						{/* Belt-and-suspenders cover for any sub-pixel sliver at the
						    very bottom of the content area — kills any artifact from
						    rounded corners or iframe stacking. */}
						{collapsed ? (
							<div
								className="pointer-events-none absolute inset-x-0 bottom-0"
								style={{ height: 8, background: "#000000", zIndex: 11 }}
							/>
						) : null}
					</motion.div>
				</motion.div>
			</div>

			<Notes>
				A single deal lives in five places — the record&apos;s in Salesforce,
				docs in Notion, threads in Slack, comms in Gmail, support in
				Zendesk. The audience watches the tab bar fill up: every new tab is
				another shard of the same deal, another login the agent would have
				to wrangle.
			</Notes>
		</>
	);
}

function ChromeTab({
	tab,
	active,
}: {
	tab: { slug: string; title: string; url: string };
	active: boolean;
}) {
	return (
		<div
			className="relative flex h-[34px] items-center gap-2 overflow-hidden pl-3 pr-2"
			style={{
				width: 220,
				background: active ? C.tabActive : C.tabInactive,
				borderTopLeftRadius: 9,
				borderTopRightRadius: 9,
				color: active ? C.tabTextActive : C.tabTextInactive,
			}}
		>
			<AppLogo slug={tab.slug} size={14} round={3} />
			<span className="truncate text-[12.5px]">{tab.title}</span>
			<X
				size={13}
				strokeWidth={2}
				style={{
					color: active ? C.tabTextActive : C.tabTextInactive,
					marginLeft: "auto",
					opacity: 0.7,
				}}
			/>
			{active ? (
				<div
					className="absolute inset-x-0 bottom-0 h-[1px]"
					style={{ background: C.tabActive }}
				/>
			) : null}
		</div>
	);
}

function NavButton({ icon: Icon, dim }: { icon: typeof ArrowLeft; dim?: boolean }) {
	return (
		<button
			className="flex size-7 items-center justify-center rounded-full"
			style={{ color: dim ? C.urlMuted : C.urlText }}
		>
			<Icon size={14} strokeWidth={2} />
		</button>
	);
}

function UrlText({ url }: { url: string }) {
	// Mute the scheme/host suffixes, accent the host like Chrome does.
	const [host, ...rest] = url.split("/");
	return (
		<span>
			<span style={{ color: C.urlText }}>{host}</span>
			<span style={{ color: C.urlMuted }}>{rest.length ? "/" + rest.join("/") : ""}</span>
		</span>
	);
}

function AppLogo({
	slug,
	size,
	round = 4,
}: {
	slug: string;
	size: number;
	round?: number;
}) {
	// Composio's own logo ships as dark-on-transparent; force it white so it
	// reads clearly inside the dark chrome tab.
	const isComposio = slug === "composio";
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={LOGO(slug)}
			alt=""
			width={size}
			height={size}
			style={{
				width: size,
				height: size,
				borderRadius: round,
				display: "block",
				flexShrink: 0,
				filter: isComposio ? "brightness(0) invert(1)" : undefined,
			}}
		/>
	);
}

/* ============================== Fake per-app UIs ========================= */

const DEAL = "ACME Corp";

function AppFakeUI({ slug }: { slug: string }) {
	switch (slug) {
		case "salesforce":
			return <SalesforceFake />;
		case "notion":
			return <NotionFake />;
		case "slack":
			return <SlackFake />;
		case "gmail":
			return <GmailFake />;
		case "zendesk":
			return <ZendeskFake />;
		default:
			return null;
	}
}


function SalesforceFake() {
	const muted = "rgba(255,255,255,0.55)";
	const stages = [
		{ name: "Discovery", done: true },
		{ name: "Qualify", done: true },
		{ name: "Propose", done: true },
		{ name: "Negotiate", active: true },
		{ name: "Closed Won", done: false },
	];
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{ background: "#0E1A2B", color: "#E5EAF1", fontFamily: SANS }}
		>
			{/* Top global nav */}
			<div
				className="flex items-center gap-3 px-3 py-1.5"
				style={{ background: "#001639", color: "#fff" }}
			>
				<LayoutGrid size={12} className="opacity-80" />
				<AppLogo slug="salesforce" size={14} round={2} />
				<span className="text-[12px] font-semibold tracking-tight">
					Sales Cloud
				</span>
				<div
					className="ml-2 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px]"
					style={{ background: "rgba(255,255,255,0.08)", color: muted }}
				>
					<Search size={10} />
					<span>Search Salesforce</span>
				</div>
				<div className="ml-auto flex items-center gap-2.5 opacity-80">
					<Settings size={12} />
					<Bell size={12} />
					<CircleHelp size={12} />
					<UserCircle2 size={14} />
				</div>
			</div>
			{/* Object tabs */}
			<div
				className="flex items-center gap-4 px-4 py-1.5 text-[11px]"
				style={{
					background: "#0B2540",
					borderBottom: "1px solid rgba(255,255,255,0.06)",
				}}
			>
				<span style={{ color: muted }}>Home</span>
				<span style={{ color: muted }}>Accounts</span>
				<span style={{ color: muted }}>Contacts</span>
				<span style={{ color: muted }}>Leads</span>
				<span
					className="rounded-sm px-1.5 py-0.5"
					style={{ background: "rgba(26,185,255,0.18)", color: "#7DD3FC" }}
				>
					Opportunities
				</span>
				<span style={{ color: muted }}>Reports</span>
				<span style={{ color: muted }}>Dashboards</span>
				<span style={{ color: muted }}>Chatter</span>
				<MoreHorizontal size={12} style={{ color: muted }} />
			</div>
			{/* Record highlight panel */}
			<div
				className="flex items-start gap-3 px-5 py-3"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
			>
				<div
					className="flex size-10 items-center justify-center rounded-sm text-[16px] font-bold text-white"
					style={{ background: "#0176D3" }}
				>
					$
				</div>
				<div className="min-w-0 flex-1">
					<div
						className="text-[9.5px] font-semibold uppercase tracking-wider"
						style={{ color: muted }}
					>
						Opportunity
					</div>
					<div className="text-[15.5px] font-semibold leading-tight">
						{DEAL} — Platform Rollout
					</div>
					<div className="text-[11px]" style={{ color: "#7DD3FC" }}>
						Acme Corp · acme.com · Owner: Alice Wu
					</div>
				</div>
				<div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[10.5px]">
					<Kv k="Amount" v="$250,000" muted={muted} />
					<Kv k="Close Date" v="Q4 2026" muted={muted} />
					<Kv k="Probability" v="75%" muted={muted} />
					<Kv k="Stage" v="Negotiate" muted={muted} />
					<Kv k="Source" v="Inbound" muted={muted} />
					<Kv k="Type" v="New Logo" muted={muted} />
				</div>
				<div
					className="ml-3 flex items-center gap-1.5 text-[10.5px]"
					style={{ color: muted }}
				>
					<button
						className="rounded px-2 py-1"
						style={{ border: "1px solid rgba(255,255,255,0.15)" }}
					>
						Edit
					</button>
					<button
						className="rounded px-2 py-1"
						style={{ border: "1px solid rgba(255,255,255,0.15)" }}
					>
						New Note
					</button>
				</div>
			</div>
			{/* Sales path */}
			<div
				className="flex items-center px-3 py-2 text-[9.5px] font-semibold uppercase tracking-wider"
				style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
			>
				{stages.map((s, i) => {
					const bg = s.active ? "#1AB9FF" : s.done ? "#2E844A" : "transparent";
					const color = s.active || s.done ? "#0E1A2B" : muted;
					return (
						<div
							key={s.name}
							className="relative flex-1 truncate px-1 py-1 text-center"
							style={{
								background: bg,
								color,
								border: "1px solid rgba(255,255,255,0.08)",
								clipPath:
									i === stages.length - 1
										? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)"
										: i === 0
											? "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)"
											: "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)",
							}}
						>
							{s.name}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function Kv({ k, v, muted }: { k: string; v: string; muted: string }) {
	return (
		<div className="flex flex-col leading-tight">
			<span
				className="text-[8.5px] uppercase tracking-wider"
				style={{ color: muted }}
			>
				{k}
			</span>
			<span className="text-[11px] font-medium">{v}</span>
		</div>
	);
}

function NotionFake() {
	const muted = "#7E7E7E";
	return (
		<div
			className="flex h-full w-full"
			style={{ background: "#191919", color: "#DCDDDC", fontFamily: SANS }}
		>
			<div
				className="flex w-[160px] shrink-0 flex-col gap-0.5 py-2"
				style={{ background: "#202020", borderRight: "1px solid #2C2C2C" }}
			>
				<div className="flex items-center gap-1.5 px-3 py-1 text-[11px]">
					<AppLogo slug="notion" size={14} round={3} />
					<span className="font-semibold">acme workspace</span>
					<ChevronDown size={10} className="ml-auto opacity-60" />
				</div>
				<div className="flex items-center gap-1.5 px-3 py-1 text-[10.5px]" style={{ color: muted }}>
					<Search size={10} /> <span>Search</span>
				</div>
				<div className="flex items-center gap-1.5 px-3 py-1 text-[10.5px]" style={{ color: muted }}>
					<Inbox size={10} /> <span>Inbox</span>
					<span className="ml-auto rounded-full px-1.5 text-[9px]" style={{ background: "#2A2A2A" }}>
						3
					</span>
				</div>
				<div className="flex items-center gap-1.5 px-3 py-1 text-[10.5px]" style={{ color: muted }}>
					<Settings size={10} /> <span>Settings</span>
				</div>
				<div className="mt-2 px-3 text-[9px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
					Favorites
				</div>
				<NotionSidebarRow emoji="⭐" name="Pipeline" />
				<NotionSidebarRow emoji="📊" name="Q4 Forecast" />
				<div className="mt-2 px-3 text-[9px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
					Sales
				</div>
				<NotionSidebarRow emoji="📁" name="Deals" expanded />
				<NotionSidebarRow emoji="📄" name={`${DEAL} — Discovery`} active indent />
				<NotionSidebarRow emoji="📄" name="Globex — Renewal" indent />
				<NotionSidebarRow emoji="📄" name="Initech — POC" indent />
				<NotionSidebarRow emoji="📓" name="Playbook" />
				<NotionSidebarRow emoji="📅" name="Meeting Notes" />
			</div>
			<div className="flex min-w-0 flex-1 flex-col">
				<div
					className="flex items-center gap-1.5 px-4 py-2 text-[10.5px]"
					style={{ color: muted, borderBottom: "1px solid #2C2C2C" }}
				>
					<Menu size={11} />
					<span>Sales</span>
					<ChevronRight size={9} />
					<span>Deals</span>
					<ChevronRight size={9} />
					<span style={{ color: "#DCDDDC" }}>{DEAL} — Discovery</span>
					<div className="ml-auto flex items-center gap-3 text-[10.5px]">
						<span>Edited 2h ago</span>
						<span>Share</span>
						<MessageSquare size={11} />
						<Star size={11} />
						<MoreHorizontal size={11} />
					</div>
				</div>
				<div className="px-5 py-3">
					<div className="text-[28px] leading-none" aria-hidden>
						🎯
					</div>
					<div className="mt-2 text-[19px] font-bold leading-tight">
						{DEAL} — Discovery
					</div>
					<div
						className="mt-2.5 flex flex-col gap-1 text-[10.5px]"
						style={{ color: muted }}
					>
						<div className="flex items-center gap-3">
							<span className="w-[64px]">Status</span>
							<span
								className="rounded-sm px-1.5 py-0.5"
								style={{ background: "#1F3047", color: "#7DD3FC" }}
							>
								In progress
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="w-[64px]">Owner</span>
							<span style={{ color: "#DCDDDC" }}>@bob</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="w-[64px]">Account</span>
							<span style={{ color: "#DCDDDC" }}>{DEAL}</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="w-[64px]">Tags</span>
							<span className="rounded-sm px-1.5 py-0.5" style={{ background: "#1F3047", color: "#7DD3FC" }}>
								Sales
							</span>
							<span className="rounded-sm px-1.5 py-0.5" style={{ background: "#3B1F2C", color: "#F4A6BD" }}>
								Q4
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function NotionSidebarRow({
	emoji,
	name,
	active,
	expanded,
	indent,
}: {
	emoji: string;
	name: string;
	active?: boolean;
	expanded?: boolean;
	indent?: boolean;
}) {
	return (
		<div
			className="mx-1 flex items-center gap-1 truncate rounded-sm px-2 py-0.5 text-[10.5px]"
			style={{
				background: active ? "rgba(35,131,226,0.15)" : "transparent",
				color: active ? "#DCDDDC" : "#9B9A97",
				fontWeight: active ? 600 : 400,
				paddingLeft: indent ? 18 : undefined,
			}}
		>
			{expanded ? (
				<ChevronDown size={9} className="opacity-60" />
			) : indent ? null : (
				<ChevronRight size={9} className="opacity-60" />
			)}
			<span style={{ fontSize: 11 }} aria-hidden>
				{emoji}
			</span>
			<span className="truncate">{name}</span>
		</div>
	);
}

function SlackFake() {
	const muted = "#9A9B9D";
	return (
		<div
			className="flex h-full w-full"
			style={{ background: "#1A1D21", color: "#D1D2D3", fontFamily: SANS }}
		>
			{/* Workspace rail */}
			<div
				className="flex w-[50px] shrink-0 flex-col items-center gap-2 py-2.5"
				style={{ background: "#19171D", borderRight: "1px solid #272A2F" }}
			>
				<div
					className="flex size-8 items-center justify-center rounded-md"
					style={{ background: "#fff" }}
				>
					<AppLogo slug="slack" size={22} round={4} />
				</div>
				<div
					className="flex size-7 items-center justify-center rounded-md text-[9px] font-bold"
					style={{ background: "#350D36", color: "#fff" }}
				>
					AC
				</div>
				<div
					className="mt-1 flex size-7 items-center justify-center rounded-md"
					style={{ background: "#2A292E", color: muted }}
				>
					<Plus size={11} />
				</div>
				<div className="mt-auto flex flex-col items-center gap-2">
					<Bell size={11} style={{ color: muted }} />
					<UserCircle2 size={13} style={{ color: muted }} />
				</div>
			</div>
			{/* Channel sidebar */}
			<div
				className="flex w-[170px] shrink-0 flex-col gap-0.5 py-2"
				style={{ background: "#222529" }}
			>
				<div className="flex items-center gap-1 px-2.5 text-[12.5px] font-bold" style={{ color: "#E8E8E8" }}>
					<span>acme corp</span>
					<ChevronDown size={11} className="opacity-70" />
					<Edit3 size={11} className="ml-auto opacity-70" />
				</div>
				<div
					className="mx-2 mt-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px]"
					style={{ background: "#27292D", color: muted }}
				>
					<Search size={10} /> <span>Jump to or search…</span>
				</div>
				<SlackSidebarItem icon={<MessageSquare size={11} />} label="Threads" />
				<SlackSidebarItem icon={<Bell size={11} />} label="Activity" />
				<SlackSidebarItem icon={<Bookmark size={11} />} label="Saved" />
				<SlackSidebarItem icon={<MoreHorizontal size={11} />} label="More" />
				<div className="mt-1.5 px-2.5 text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
					Channels
				</div>
				<SlackChannelRow name="general" />
				<SlackChannelRow name="random" />
				<SlackChannelRow name="sales-deals" />
				<SlackChannelRow name="deal-acme-corp" active />
				<SlackChannelRow name="deal-globex" />
				<SlackChannelRow name="support-escalations" unread />
				<div className="mt-1.5 px-2.5 text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
					Direct Messages
				</div>
				<SlackDmRow name="Alice Wu" color="#2BAC76" online />
				<SlackDmRow name="Bob Patel" color="#1D9BD1" />
				<SlackDmRow name="Carol Reyes" color="#E37A00" />
			</div>
			{/* Main channel */}
			<div className="flex min-w-0 flex-1 flex-col">
				<div
					className="flex items-center gap-2 border-b px-3 py-2"
					style={{ borderColor: "#272A2F" }}
				>
					<Hash size={13} style={{ color: muted }} />
					<span className="text-[13px] font-bold" style={{ color: "#E8E8E8" }}>
						deal-acme-corp
					</span>
					<ChevronDown size={11} style={{ color: muted }} />
					<div className="flex items-center -space-x-1">
						<div className="size-4 rounded-sm border border-[#1A1D21]" style={{ background: "#2BAC76" }} />
						<div className="size-4 rounded-sm border border-[#1A1D21]" style={{ background: "#1D9BD1" }} />
						<div className="size-4 rounded-sm border border-[#1A1D21]" style={{ background: "#E37A00" }} />
					</div>
					<span className="text-[10.5px]" style={{ color: muted }}>
						4
					</span>
					<span className="text-[10.5px]" style={{ color: muted }}>
						·
					</span>
					<span className="text-[10.5px]" style={{ color: muted }}>
						pinned: ACME discovery notes
					</span>
					<div className="ml-auto flex items-center gap-2.5" style={{ color: muted }}>
						<Phone size={12} />
						<Video size={12} />
						<Search size={12} />
						<MoreHorizontal size={12} />
					</div>
				</div>
				<div className="flex flex-col gap-2 px-4 py-2.5 text-[11.5px]">
					<SlackMessage
						user="alice"
						time="9:14 AM"
						color="#2BAC76"
						body={
							<>
								can someone pull the latest call notes for <b>{DEAL}</b>?
							</>
						}
					/>
					<SlackMessage
						user="bob"
						time="9:17 AM"
						color="#1D9BD1"
						body={
							<>
								threading in <span style={{ color: "#1D9BD1" }}>@carol</span> —
								she ran discovery yesterday
							</>
						}
					/>
				</div>
			</div>
		</div>
	);
}

function SlackSidebarItem({
	icon,
	label,
}: {
	icon: ReactNode;
	label: string;
}) {
	return (
		<div className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px]" style={{ color: "#9A9B9D" }}>
			{icon}
			<span>{label}</span>
		</div>
	);
}

function SlackDmRow({
	name,
	color,
	online,
}: {
	name: string;
	color: string;
	online?: boolean;
}) {
	return (
		<div className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px]" style={{ color: "#9A9B9D" }}>
			<div className="relative">
				<div className="size-4 rounded-sm" style={{ background: color }} />
				{online ? (
					<div
						className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full"
						style={{ background: "#2BAC76", border: "1px solid #222529" }}
					/>
				) : null}
			</div>
			<span className="truncate">{name}</span>
		</div>
	);
}

function SlackChannelRow({
	name,
	active,
	unread,
}: {
	name: string;
	active?: boolean;
	unread?: boolean;
}) {
	return (
		<div
			className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px]"
			style={{
				background: active ? "#4A154B" : "transparent",
				color: active ? "#fff" : unread ? "#E8E8E8" : "#9A9B9D",
				fontWeight: unread ? 600 : 400,
			}}
		>
			<Hash size={11} />
			<span className="truncate">{name}</span>
		</div>
	);
}

function SlackMessage({
	user,
	time,
	color,
	body,
}: {
	user: string;
	time: string;
	color: string;
	body: ReactNode;
}) {
	return (
		<div className="flex gap-2">
			<div
				className="flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
				style={{ background: color }}
			>
				{user[0]?.toUpperCase()}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-1.5 leading-none">
					<span className="text-[12px] font-bold" style={{ color: "#E8E8E8" }}>
						{user}
					</span>
					<span className="text-[10.5px] opacity-60">{time}</span>
				</div>
				<div className="mt-0.5 leading-snug">{body}</div>
			</div>
		</div>
	);
}

function GmailFake() {
	const muted = "#9AA0A6";
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{ background: "#202124", color: "#E8EAED", fontFamily: SANS }}
		>
			{/* Top bar */}
			<div
				className="flex items-center gap-2 border-b px-3 py-1.5"
				style={{ background: "#1F1F1F", borderColor: "#3C4043" }}
			>
				<Menu size={13} style={{ color: muted }} />
				<AppLogo slug="gmail" size={18} round={3} />
				<span className="text-[13px] font-medium">Mail</span>
				<div
					className="ml-3 flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px]"
					style={{ background: "#2F3033", color: muted }}
				>
					<Search size={12} />
					<span>Search mail</span>
					<Filter size={11} className="ml-auto" />
				</div>
				<div className="ml-2 flex items-center gap-2.5" style={{ color: muted }}>
					<CircleHelp size={13} />
					<Settings size={13} />
					<LayoutGrid size={13} />
					<UserCircle2 size={16} style={{ color: "#1A73E8" }} />
				</div>
			</div>
			<div className="flex flex-1 min-h-0">
				{/* Sidebar */}
				<div
					className="flex w-[120px] shrink-0 flex-col gap-0.5 py-2"
					style={{ borderRight: "1px solid #3C4043" }}
				>
					<button
						className="mx-2 mb-2 inline-flex items-center gap-2 rounded-2xl px-2.5 py-1.5 text-[11.5px]"
						style={{
							background: "#1F4275",
							color: "#C2E7FF",
							fontWeight: 600,
						}}
					>
						<Plus size={12} /> Compose
					</button>
					<GmailSidebarRow label="Inbox" count="248" active icon={Inbox} />
					<GmailSidebarRow label="Starred" icon={Star} />
					<GmailSidebarRow label="Snoozed" icon={Bookmark} />
					<GmailSidebarRow label="Important" icon={Tag} />
					<GmailSidebarRow label="Sent" icon={Send} />
					<GmailSidebarRow label="Drafts" count="12" icon={Edit3} />
					<div className="mt-1 px-3 text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
						Labels
					</div>
					<GmailSidebarRow label="Sales" icon={Tag} />
					<GmailSidebarRow label="Work" icon={Tag} />
				</div>
				{/* Thread */}
				<div className="flex min-w-0 flex-1 flex-col px-4 py-2.5">
					<div className="flex items-center gap-1.5">
						<div
							className="rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
							style={{ background: "#5C2521", color: "#F2B8B5" }}
						>
							sales
						</div>
						<div
							className="rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
							style={{ background: "#1A3556", color: "#A8C7FA" }}
						>
							deal/acme
						</div>
						<Star size={12} fill="#F9AB00" style={{ color: "#F9AB00" }} />
						<div className="ml-auto flex items-center gap-2" style={{ color: muted }}>
							<MoreHorizontal size={12} />
						</div>
					</div>
					<div className="mt-1.5 text-[15px] font-medium leading-tight">
						RE: {DEAL} — next steps after Tuesday call
					</div>
					<div className="mt-2.5 flex items-center gap-2">
						<div
							className="flex size-8 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
							style={{ background: "#1A73E8" }}
						>
							S
						</div>
						<div className="min-w-0 flex-1">
							<div className="text-[12px]">
								<span className="font-semibold">Sarah Chen</span>{" "}
								<span style={{ color: muted }}>
									&lt;sarah@acmecorp.com&gt;
								</span>
							</div>
							<div className="text-[10.5px]" style={{ color: muted }}>
								to me, bob@acme · 3:42 PM (3h ago)
							</div>
						</div>
						<div className="flex items-center gap-2" style={{ color: muted }}>
							<Star size={12} />
							<MoreHorizontal size={12} />
						</div>
					</div>
					<div className="mt-2 text-[11.5px] leading-snug" style={{ color: "#D4D6D9" }}>
						<p>Hi Alice — looped in Bob from procurement.</p>
					</div>
					<div
						className="mt-2 inline-flex items-center gap-1.5 self-start rounded-md border px-2 py-1 text-[10.5px]"
						style={{ borderColor: "#3C4043" }}
					>
						<Paperclip size={11} style={{ color: muted }} />
						<span style={{ color: "#8AB4F8" }}>discovery-deck.pdf</span>
						<span style={{ color: muted }}>· 1.2 MB</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function GmailSidebarRow({
	label,
	count,
	active,
	icon: Icon,
}: {
	label: string;
	count?: string;
	active?: boolean;
	icon?: typeof Inbox;
}) {
	return (
		<div
			className="mx-1 flex items-center gap-2 rounded-r-2xl px-3 py-1 text-[11px]"
			style={{
				background: active ? "#264369" : "transparent",
				color: active ? "#D2E3FC" : "#BDC1C6",
				fontWeight: active ? 600 : 400,
			}}
		>
			{Icon ? <Icon size={12} /> : null}
			<span className="flex-1 truncate">{label}</span>
			{count ? <span className="text-[10px] opacity-80">{count}</span> : null}
		</div>
	);
}

function ZendeskFake() {
	const muted = "#90A2A7";
	return (
		<div
			className="flex h-full w-full"
			style={{ background: "#0E2226", color: "#E1ECEF", fontFamily: SANS }}
		>
			{/* Left nav rail */}
			<div
				className="flex w-[44px] shrink-0 flex-col items-center gap-3 py-3"
				style={{ background: "#03363D", color: "#fff" }}
			>
				<AppLogo slug="zendesk" size={20} round={4} />
				<div className="my-1 h-[1px] w-6 bg-white/10" />
				<Inbox size={14} className="opacity-90" />
				<Users size={14} className="opacity-60" />
				<Phone size={14} className="opacity-60" />
				<HelpCircle size={14} className="opacity-60" />
				<div className="mt-auto flex flex-col items-center gap-2">
					<Bell size={13} className="opacity-60" />
					<UserCircle2 size={14} className="opacity-90" />
				</div>
			</div>
			<div className="flex min-w-0 flex-1 flex-col">
				{/* Top tabs bar */}
				<div
					className="flex items-center gap-3 border-b px-3 py-1.5 text-[11px]"
					style={{ background: "#13373B", borderColor: "#1F4A4F" }}
				>
					<span className="font-semibold">Tickets</span>
					<span style={{ color: muted }}>Views</span>
					<span style={{ color: muted }}>Customers</span>
					<span style={{ color: muted }}>Reporting</span>
					<span style={{ color: muted }}>Knowledge</span>
					<div className="ml-auto flex items-center gap-2.5" style={{ color: muted }}>
						<Search size={12} />
						<Bell size={12} />
						<Plus size={12} />
					</div>
				</div>
				{/* Subject + status */}
				<div className="px-4 pt-2.5 pb-2">
					<div className="flex items-center gap-2 text-[10.5px]" style={{ color: muted }}>
						<span>Tickets</span>
						<ChevronRight size={9} />
						<span style={{ color: "#E1ECEF" }}>#1284</span>
					</div>
					<div className="mt-0.5 flex items-center gap-2">
						<div className="text-[14.5px] font-semibold leading-tight">
							{DEAL} — SSO login failing on production
						</div>
						<button
							className="ml-auto rounded-md px-2 py-0.5 text-[10.5px]"
							style={{
								background: "#178A3F",
								color: "#fff",
							}}
						>
							Submit as Solved
						</button>
					</div>
					<div className="mt-1.5 flex items-center gap-1.5">
						<div
							className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
							style={{ background: "#FFB057", color: "#000" }}
						>
							<CircleDot size={9} />
							Open
						</div>
						<div
							className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
							style={{ background: "#5C1B16", color: "#F49A8E" }}
						>
							Urgent
						</div>
						<div
							className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
							style={{ background: "#22323A", color: muted }}
						>
							Incident
						</div>
						<div
							className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
							style={{ background: "#22323A", color: muted }}
						>
							Tier 1
						</div>
					</div>
				</div>
				{/* Two-pane body */}
				<div className="flex min-h-0 flex-1">
					<div className="flex-1 px-4 py-2">
						<div
							className="rounded-md p-2 text-[11px]"
							style={{ background: "#13373B", border: "1px solid #1F4A4F" }}
						>
							<div className="flex items-center gap-1.5 text-[10px]">
								<div
									className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
									style={{ background: "#5293C7" }}
								>
									S
								</div>
								<span className="font-semibold">Sam (Acme IT)</span>
								<span style={{ color: muted }}>· 1h</span>
							</div>
							<p className="mt-1 leading-snug">
								SAML response failing for 3 users since deploy.
							</p>
						</div>
					</div>
					<div
						className="w-[140px] shrink-0 border-l px-3 py-2 text-[10px]"
						style={{ borderColor: "#1F4A4F", background: "#13373B" }}
					>
						<div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
							Details
						</div>
						<div className="mt-1.5 space-y-1.5">
							<Kv k="Requester" v="it@acme.com" muted={muted} />
							<Kv k="Assignee" v="Diane K." muted={muted} />
							<Kv k="Brand" v="Acme Support" muted={muted} />
							<Kv k="Priority" v="Urgent" muted={muted} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
