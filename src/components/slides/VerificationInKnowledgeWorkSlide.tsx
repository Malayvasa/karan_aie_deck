"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	BadgeCheck,
	BarChart3,
	BatteryFull,
	Bookmark,
	Bot,
	CheckCheck,
	Heart,
	MessageCircle,
	MoreHorizontal,
	MoreVertical,
	Phone,
	Repeat2,
	Wifi,
} from "lucide-react";
import {
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

// Chat row timings (ms) — chat auto-plays through to Karan's panicked
// "??? what did you send?". Notification cascade and tweet are step-gated.
const ROW_DELAYS_MS = [300, 1300, 2400, 3500, 4500, 5500];

const X = {
	bg: "#ffffff",
	text: "#0f1419",
	muted: "#536471",
	link: "#1d9bf0",
	border: "#eff3f4",
} as const;

export function VerificationInKnowledgeWorkSlide() {
	return (
		<DeckSlide>
			<VerificationInKnowledgeWorkBody />
		</DeckSlide>
	);
}

function VerificationInKnowledgeWorkBody() {
	const { isSlideActive } = useContext(SlideContext);
	const [shownRows, setShownRows] = useState(0);
	// Step 0: chat auto-plays. Step 1 (arrow right): notification cascade.
	// Step 2 (arrow right again): tweet overlay drops.
	const { reached, placeholder } = useStepMotion(2);
	const notificationsShown = reached(0);
	const tweetShown = reached(1);

	useEffect(() => {
		if (!isSlideActive) {
			setShownRows(0);
			return;
		}
		const timers: ReturnType<typeof setTimeout>[] = [];
		ROW_DELAYS_MS.forEach((ms, i) => {
			timers.push(setTimeout(() => setShownRows(i + 1), ms));
		});
		return () => timers.forEach(clearTimeout);
	}, [isSlideActive]);

	return (
		<>
			{placeholder}
			<div
				className="relative flex min-h-0 flex-1 items-start justify-center pt-2"
				style={{ fontFamily: SANS }}
			>
				{/* iPhone in the center, top-anchored. `shrink-0` keeps the phone
				    at its full 640px height even though the flex slot is shorter,
				    so the phone overflows the slot rather than dragging the
				    body's measured height down — that way the notification
				    cascade's % positions stay aligned to the visible slide. */}
				<div
					className="relative z-10 shrink-0"
					style={{ width: 360, height: 640 }}
				>
					<ChatSession shownRows={shownRows} />
				</div>

				{/* Notifications cascade across the slide once Send fires */}
				<NotificationCascade
					shown={isSlideActive && notificationsShown && !tweetShown}
				/>

				{/* Tweet overlay — step 1 */}
				<AnimatePresence>
					{isSlideActive && tweetShown ? (
						<TweetOverlay key="tweet-overlay" />
					) : null}
				</AnimatePresence>
			</div>

			<Notes>
				Karan asks his agent to do hiring outreach. The agent reads the list,
				drafts the template, and says &quot;Okay, sending all these emails.&quot;
				The inbox floods. Every check that would have run, would have passed.
				The first signal that the work was actually bad came from the
				internet — that tweet, on the next click.
			</Notes>
		</>
	);
}

/* =============================== Chat ================================== */

// Telegram dark palette — the recognizable cues are the navy chat background,
// the muted-blue sent bubble, and the dark-grey received bubble.
const TG = {
	chatBg: "#0e1621",
	headerBg: "#17212b",
	headerBorder: "#0b131c",
	sentBubble: "#2b5278",
	receivedBubble: "#182533",
	text: "#ffffff",
	muted: "#7a8a99",
	iconMuted: "#6c7883",
	timestamp: "rgba(255,255,255,0.55)",
	readReceipt: "#6cb4ff",
	online: "#4fc04f",
	gradientFrom: "#5da0e8",
	gradientTo: "#3987d3",
} as const;

type ChatItem =
	| { kind: "msg"; from: "karan" | "bot"; time: string; text: ReactNode }
	| { kind: "typing" };

const CHAT: ChatItem[] = [
	{
		kind: "msg",
		from: "karan",
		time: "14:03",
		text: (
			<>
				send a personalized intro email to every candidate in
				hiring_list.csv — we&apos;re hiring a DevRel engineer
			</>
		),
	},
	{ kind: "typing" },
	{
		kind: "msg",
		from: "bot",
		time: "14:04",
		text: (
			<>
				Got it. 247 candidates loaded. I&apos;ll enrich each from LinkedIn
				and draft personalized variants.
			</>
		),
	},
	{ kind: "typing" },
	{
		kind: "msg",
		from: "bot",
		time: "14:05",
		text: "All emails sent.",
	},
	{
		kind: "msg",
		from: "karan",
		time: "14:06",
		text: "??? what did you send?",
	},
];

function ChatSession({ shownRows }: { shownRows: number }) {
	// Trim the slice so a typing indicator only appears when it's the trailing
	// item (i.e. before the next bot reply lands).
	const visible = CHAT.slice(0, shownRows).filter(
		(item, i, arr) => item.kind !== "typing" || i === arr.length - 1,
	);

	// The whole iPhone — frame + screen — gets masked by a vertical gradient so
	// the bottom dissolves into the slide. Top-anchored content (status bar →
	// header → messages) stays crisp; the empty bottom of the chat fades to
	// nothing.
	const fadeMask =
		"linear-gradient(to bottom, black 0%, black 58%, transparent 96%)";

	return (
		<div
			className="relative h-full w-full"
			style={{
				WebkitMaskImage: fadeMask,
				maskImage: fadeMask,
			}}
		>
			{/* Phone bezel */}
			<div
				className="relative h-full w-full overflow-hidden"
				style={{
					background: "#000",
					borderRadius: 44,
					padding: 8,
					boxShadow:
						"0 24px 60px rgba(0,0,0,0.55), 0 6px 16px rgba(0,0,0,0.35), inset 0 0 0 1px #2a2a2a",
				}}
			>
				{/* Phone screen */}
				<div
					className="relative h-full w-full overflow-hidden"
					style={{
						background: TG.chatBg,
						borderRadius: 36,
					}}
				>
					<PhoneStatusBar />
					<TelegramHeader />
					<div
						className="flex flex-col gap-1.5 px-3 pt-3"
						style={{ background: TG.chatBg }}
					>
						{visible.map((item, i) =>
							item.kind === "typing" ? (
								<TypingBubble key={`typing-${i}`} />
							) : (
								<Bubble
									key={`m-${i}`}
									fromMe={item.from === "karan"}
									time={item.time}
									read={item.from === "karan"}
								>
									{item.text}
								</Bubble>
							),
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function PhoneStatusBar() {
	// iOS-style status bar with the Dynamic Island centered. Time on the left
	// of the island; signal / wifi / battery on the right.
	return (
		<div
			className="relative flex items-center justify-between"
			style={{
				background: TG.chatBg,
				padding: "14px 24px 6px",
				color: "#fff",
				fontSize: 15,
				fontWeight: 600,
				letterSpacing: "-0.01em",
			}}
		>
			<span style={{ minWidth: 60 }}>14:05</span>

			{/* Dynamic Island — floats over the status bar, centered. */}
			<div
				className="absolute left-1/2 -translate-x-1/2"
				style={{
					top: 10,
					width: 110,
					height: 32,
					background: "#000",
					borderRadius: 999,
				}}
				aria-hidden
			/>

			<div className="flex items-center gap-1.5" style={{ minWidth: 60, justifyContent: "flex-end" }}>
				<SignalBars />
				<Wifi size={14} strokeWidth={2.5} />
				<BatteryFull size={22} strokeWidth={1.8} />
			</div>
		</div>
	);
}

function SignalBars() {
	// iOS-style cellular bars — four ascending dots.
	return (
		<svg width={16} height={11} viewBox="0 0 16 11" aria-hidden>
			<rect x="0" y="7" width="3" height="4" rx="0.6" fill="#fff" />
			<rect x="4.5" y="5" width="3" height="6" rx="0.6" fill="#fff" />
			<rect x="9" y="3" width="3" height="8" rx="0.6" fill="#fff" />
			<rect x="13" y="0" width="3" height="11" rx="0.6" fill="#fff" />
		</svg>
	);
}

function TelegramHeader() {
	return (
		<div
			className="flex items-center gap-3 px-3.5 py-2"
			style={{
				background: TG.headerBg,
				borderBottom: `1px solid ${TG.headerBorder}`,
			}}
		>
			<ArrowLeft size={18} style={{ color: TG.iconMuted }} />
			<div
				className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
				style={{
					background: `linear-gradient(135deg, ${TG.gradientFrom}, ${TG.gradientTo})`,
				}}
			>
				<Bot size={18} strokeWidth={2.2} color="#fff" />
				<span
					className="absolute right-0 bottom-0 size-2.5 rounded-full"
					style={{
						background: TG.online,
						border: `2px solid ${TG.headerBg}`,
					}}
				/>
			</div>
			<div className="min-w-0 flex-1 leading-tight">
				<div
					className="text-[14.5px] font-semibold"
					style={{ color: TG.text }}
				>
					Jarvis
				</div>
				<div className="text-[12px]" style={{ color: TG.muted }}>
					bot · online
				</div>
			</div>
			<Phone size={18} style={{ color: TG.iconMuted }} />
			<MoreVertical size={18} style={{ color: TG.iconMuted }} />
		</div>
	);
}

function Bubble({
	children,
	fromMe,
	time,
	read,
}: {
	children: ReactNode;
	fromMe: boolean;
	time: string;
	read?: boolean;
}) {
	return (
		<motion.div
			className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
			initial={{ opacity: 0, y: 6, scale: 0.96 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.28, ease: [0.34, 1.2, 0.6, 1] }}
		>
			<div
				className="relative max-w-[78%] px-3 pt-1.5 pb-1 text-[14px] leading-snug"
				style={{
					background: fromMe ? TG.sentBubble : TG.receivedBubble,
					color: TG.text,
					borderRadius: 14,
					borderTopRightRadius: fromMe ? 4 : 14,
					borderTopLeftRadius: fromMe ? 14 : 4,
				}}
			>
				<span>{children}</span>
				<span
					className="ml-2 inline-flex translate-y-[2px] items-center gap-1 text-[10.5px]"
					style={{ color: TG.timestamp }}
				>
					{time}
					{fromMe ? (
						<CheckCheck
							size={14}
							strokeWidth={2.2}
							style={{ color: read ? TG.readReceipt : TG.timestamp }}
						/>
					) : null}
				</span>
			</div>
		</motion.div>
	);
}

function TypingBubble() {
	return (
		<motion.div
			className="flex justify-start"
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.22 }}
		>
			<div
				className="flex items-center gap-1 px-3 py-2.5"
				style={{
					background: TG.receivedBubble,
					borderRadius: 14,
					borderTopLeftRadius: 4,
				}}
			>
				{[0, 1, 2].map((i) => (
					<motion.span
						key={i}
						className="inline-block size-1.5 rounded-full"
						style={{ background: "#a8b4bf" }}
						animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
						transition={{
							duration: 1,
							repeat: Infinity,
							delay: i * 0.18,
							ease: "easeInOut",
						}}
					/>
				))}
			</div>
		</motion.div>
	);
}

/* ====================== Gmail notification cascade ===================== */

type Notif = {
	name: string;
	first: string;
};

const NOTIFICATIONS: Notif[] = [
	{ name: "Marcus Chen", first: "Marcus" },
	{ name: "Priya Patel", first: "Priya" },
	{ name: "Sam Rivera", first: "Sam" },
	{ name: "Jamie Liu", first: "Jamie" },
	{ name: "Diego Martinez", first: "Diego" },
	{ name: "Sasha Kim", first: "Sasha" },
	{ name: "Alex Johnson", first: "Alex" },
	{ name: "Maya Singh", first: "Maya" },
	{ name: "Chris O'Brien", first: "Chris" },
	{ name: "Wei Zhang", first: "Wei" },
	{ name: "Olivia Foster", first: "Olivia" },
	{ name: "Raj Kumar", first: "Raj" },
	{ name: "Riley Park", first: "Riley" },
	{ name: "Noah Kim", first: "Noah" },
	{ name: "Aisha Khan", first: "Aisha" },
	{ name: "Jordan Lee", first: "Jordan" },
	{ name: "Tariq Hassan", first: "Tariq" },
	{ name: "Emma Wright", first: "Emma" },
	{ name: "Lin Chen", first: "Lin" },
	{ name: "Mateo Garcia", first: "Mateo" },
	{ name: "Yuki Tanaka", first: "Yuki" },
	{ name: "Hassan Ali", first: "Hassan" },
	{ name: "Lucia Romano", first: "Lucia" },
	{ name: "Ben Cohen", first: "Ben" },
];

// Clustered positions — pulled in from the edges so notifications don't get
// clipped by the slide's outer overflow. Dense pile around the centered chat
// so the "inbox flood" reads. 24 slots so all NOTIFICATIONS get a unique spot.
const POSITIONS = [
	// Row 1 (top)
	{ left: "10%", top: "2%", rotate: -3 },
	{ left: "30%", top: "8%", rotate: 1.5 },
	{ left: "48%", top: "3%", rotate: -1 },
	{ left: "62%", top: "10%", rotate: 2 },
	// Row 2
	{ left: "4%", top: "18%", rotate: -2 },
	{ left: "24%", top: "22%", rotate: 1 },
	{ left: "42%", top: "18%", rotate: -1.5 },
	{ left: "60%", top: "24%", rotate: 2.5 },
	// Row 3
	{ left: "14%", top: "34%", rotate: -1 },
	{ left: "34%", top: "38%", rotate: 1.5 },
	{ left: "52%", top: "34%", rotate: -2 },
	{ left: "2%", top: "40%", rotate: 1 },
	// Row 4
	{ left: "20%", top: "50%", rotate: 1.5 },
	{ left: "40%", top: "54%", rotate: -1 },
	{ left: "56%", top: "50%", rotate: 2 },
	{ left: "8%", top: "56%", rotate: -2 },
	// Row 5
	{ left: "28%", top: "66%", rotate: 1 },
	{ left: "46%", top: "70%", rotate: -1.5 },
	{ left: "60%", top: "66%", rotate: 2.5 },
	{ left: "12%", top: "72%", rotate: -2 },
	// Row 6 (bottom)
	{ left: "20%", top: "82%", rotate: 1 },
	{ left: "40%", top: "84%", rotate: -2.5 },
	{ left: "54%", top: "80%", rotate: 1.5 },
	{ left: "4%", top: "84%", rotate: -1.5 },
] as const;

function NotificationCascade({ shown }: { shown: boolean }) {
	return (
		<AnimatePresence>
			{shown ? (
				<motion.div
					key="notif-cascade"
					className="pointer-events-none absolute inset-0 z-30"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.4 }}
				>
					{NOTIFICATIONS.map((n, i) => {
						const pos = POSITIONS[i % POSITIONS.length];
						return (
							<motion.div
								key={n.name}
								className="absolute"
								style={{ left: pos.left, top: pos.top }}
								initial={{
									opacity: 0,
									y: -32,
									scale: 0.88,
									rotate: pos.rotate,
								}}
								animate={{
									opacity: 1,
									y: 0,
									scale: 1,
									rotate: pos.rotate,
								}}
								exit={{
									opacity: 0,
									y: -16,
									scale: 0.92,
								}}
								transition={{
									delay: i * 0.09,
									duration: 0.42,
									ease: [0.34, 1.3, 0.6, 1],
								}}
							>
								<GmailNotification name={n.name} first={n.first} />
							</motion.div>
						);
					})}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

function GmailNotification({
	name,
	first,
}: {
	name: string;
	first: string;
}) {
	return (
		<div
			className="flex items-start gap-2.5 rounded-2xl"
			style={{
				width: 340,
				background: "rgba(255,255,255,0.94)",
				backdropFilter: "blur(20px)",
				boxShadow:
					"0 12px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)",
				padding: "10px 12px 10px 10px",
				fontFamily: SANS,
			}}
		>
			<GmailIcon size={36} />
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline justify-between text-[11px]">
					<span
						className="font-semibold uppercase tracking-wider"
						style={{ color: "#3c3c43" }}
					>
						Gmail
					</span>
					<span style={{ color: "#8e8e93" }}>now</span>
				</div>
				<div
					className="mt-0.5 truncate text-[13.5px] font-semibold leading-tight"
					style={{ color: "#000" }}
				>
					Composio x {name} — from Karan&apos;s AI assistant
				</div>
				<div
					className="mt-0.5 truncate text-[13px] leading-tight"
					style={{ color: "#3c3c43" }}
				>
					Hey {first}, I&apos;m Jarvis — Karan&apos;s AI assistant…
				</div>
			</div>
		</div>
	);
}

// Logo CDN used elsewhere in the deck (see KnowledgeFragmentsSlide).
const COMPOSIO_LOGO = (slug: string) => `https://logos.composio.dev/api/${slug}`;

function GmailIcon({ size = 36 }: { size?: number }) {
	return (
		<div
			className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[8px]"
			style={{
				width: size,
				height: size,
				background: "#fff",
				boxShadow:
					"0 0 0 0.5px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={COMPOSIO_LOGO("gmail")}
				alt="Gmail"
				width={Math.round(size * 0.7)}
				height={Math.round(size * 0.7)}
				style={{
					width: Math.round(size * 0.7),
					height: Math.round(size * 0.7),
					display: "block",
				}}
			/>
		</div>
	);
}

/* ============================ Tweet overlay ============================ */

// Reply tweets that pile up behind Tejas's main tweet — taken from the real
// pile-on the user shared.
const REPLY_TWEETS: ReplyTweetData[] = [
	{
		name: "giancarlo",
		handle: "@gc_psk",
		time: "Mar 30",
		verified: false,
		body: "I just find it weird people are just fine running automated slop spamming people and have no shame putting their name on it",
		avatarSrc: "/gian.jpg",
		stats: { replies: 14, retweets: 8, likes: 124, views: 18200 },
		// Positioned around the main tweet — offsets are from center, in px.
		offsetX: -360,
		offsetY: -150,
		rotate: -5,
		scale: 0.92,
		delay: 0.55,
	},
	{
		name: "darpan",
		handle: "@darpunn",
		time: "Mar 29",
		verified: true,
		body: (
			<>
				I like how the email says &ldquo;hiring is karan&apos;s #1
				priority&rdquo;
				<br />
				Then why is he sending a clanker to talk to a potential colleague
			</>
		),
		avatarSrc: "/darpan.jpg",
		stats: { replies: 31, retweets: 22, likes: 412, views: 41200 },
		offsetX: 360,
		offsetY: -120,
		rotate: 4,
		scale: 0.92,
		delay: 0.75,
	},
	{
		name: "AM A",
		handle: "@AMA59620833",
		time: "Mar 30",
		verified: false,
		body: "Open claw is lame af. But naming it Jarvis is next level cringe",
		avatarSrc: "/AMA.jpg",
		stats: { replies: 0, retweets: 0, likes: 1, views: 35 },
		offsetX: 0,
		offsetY: 140,
		rotate: -2,
		scale: 0.9,
		delay: 0.95,
	},
];

function TweetOverlay() {
	return (
		<motion.div
			className="absolute inset-0 z-50 flex items-center justify-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
		>
			<motion.div
				className="absolute inset-0"
				style={{
					background: "rgba(0,0,0,0.55)",
					backdropFilter: "blur(2px)",
				}}
			/>

			{/* Reply tweets — render before (behind) the main tweet so they pile
			    underneath it. Each is offset + rotated so they peek out from the
			    main tweet's perimeter. */}
			{REPLY_TWEETS.map((t) => (
				<ReplyTweet key={t.handle} {...t} />
			))}

			<motion.div
				className="relative z-10 flex flex-col overflow-hidden rounded-md"
				style={{
					background: X.bg,
					border: `1px solid ${X.border}`,
					fontFamily: SANS,
					color: X.text,
					width: 560,
					boxShadow:
						"0 30px 80px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.35)",
				}}
				initial={{ opacity: 0, scale: 0.65, y: -10 }}
				animate={{ opacity: 1, scale: 1.06, y: -30 }}
				exit={{ opacity: 0, scale: 0.7, y: -10 }}
				transition={{
					type: "spring",
					damping: 20,
					stiffness: 240,
					mass: 0.9,
				}}
			>
				<div className="flex items-start gap-3 px-5 pt-4">
					<TejasAvatar />
					<div className="flex min-w-0 flex-1 flex-col leading-tight">
						<div className="flex flex-wrap items-center gap-x-1">
							<span
								className="text-[15.5px] font-bold"
								style={{ color: X.text }}
							>
								Tejas @ AI Engineer World&apos;s Fair (AIE WF)
							</span>
							<BadgeCheck
								size={16}
								fill={X.link}
								strokeWidth={0}
								style={{ color: "#fff" }}
							/>
						</div>
						<div
							className="mt-0.5 text-[13.5px]"
							style={{ color: X.muted }}
						>
							@TejasKumar_
						</div>
					</div>
					<div className="ml-auto flex shrink-0 items-center gap-2">
						<XLogo />
						<MoreHorizontal size={16} style={{ color: X.muted }} />
					</div>
				</div>

				<div
					className="px-5 pt-3 text-[22px] leading-snug"
					style={{ color: X.text }}
				>
					fuck off{" "}
					<span style={{ color: X.link }}>@KaranVaidya6</span>
				</div>

				<div
					className="px-5 pt-3 text-[13.5px]"
					style={{ color: X.muted }}
				>
					5:06 AM · Mar 29, 2026
					<span> · </span>
					<span style={{ color: X.text, fontWeight: 700 }}>
						<AnimatedCount
							to={199800}
							delay={350}
							duration={1500}
							format={formatViewCount}
						/>
					</span>{" "}
					<span style={{ color: X.muted }}>Views</span>
				</div>

				<div
					className="mx-5 mt-3"
					style={{ borderTop: `1px solid ${X.border}` }}
				/>

				<div
					className="flex items-center justify-between px-5 py-2.5 text-[13.5px]"
					style={{ color: X.muted }}
				>
					<EngagementIcon
						icon={MessageCircle}
						count={<AnimatedCount to={66} delay={400} duration={1100} />}
					/>
					<EngagementIcon
						icon={Repeat2}
						tint="#00ba7c"
						count={<AnimatedCount to={54} delay={500} duration={1100} />}
					/>
					<EngagementIcon
						icon={Heart}
						tint="#f91880"
						count={<AnimatedCount to={856} delay={600} duration={1300} />}
					/>
					<EngagementIcon
						icon={Bookmark}
						tint={X.link}
						count={<AnimatedCount to={133} delay={700} duration={1100} />}
					/>
					<EngagementIcon icon={ShareIcon} />
				</div>
			</motion.div>
		</motion.div>
	);
}

type ReplyTweetStats = {
	replies: number;
	retweets: number;
	likes: number;
	views: number;
};

type ReplyTweetData = {
	name: string;
	handle: string;
	time: string;
	verified: boolean;
	body: ReactNode;
	avatarSrc: string;
	stats: ReplyTweetStats;
	offsetX: number;
	offsetY: number;
	rotate: number;
	scale: number;
	delay: number;
};

function ReplyTweet({
	name,
	handle,
	time,
	verified,
	body,
	avatarSrc,
	stats,
	offsetX,
	offsetY,
	rotate,
	scale,
	delay,
}: ReplyTweetData) {
	// Counts begin ticking once the card has finished springing in.
	const countDelay = (delay + 0.3) * 1000;
	return (
		<motion.div
			className="absolute flex flex-col overflow-hidden rounded-md"
			style={{
				background: X.bg,
				border: `1px solid ${X.border}`,
				fontFamily: SANS,
				color: X.text,
				width: 380,
				boxShadow:
					"0 18px 40px rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)",
			}}
			initial={{
				opacity: 0,
				x: offsetX * 0.5,
				y: offsetY * 0.5,
				scale: 0.6,
				rotate: rotate * 0.5,
			}}
			animate={{
				opacity: 1,
				x: offsetX,
				y: offsetY,
				scale,
				rotate,
			}}
			exit={{
				opacity: 0,
				x: offsetX * 0.5,
				y: offsetY * 0.5,
				scale: 0.6,
			}}
			transition={{
				type: "spring",
				damping: 18,
				stiffness: 220,
				mass: 0.85,
				delay,
			}}
		>
			<div className="flex items-start gap-2.5 px-3.5 pt-3">
				<div
					className="relative size-9 shrink-0 overflow-hidden rounded-full"
					style={{ background: "#fff", border: `1px solid ${X.border}` }}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={avatarSrc}
						alt={name}
						width={36}
						height={36}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							display: "block",
						}}
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col leading-tight">
					<div className="flex flex-wrap items-center gap-x-1">
						<span
							className="text-[13.5px] font-bold"
							style={{ color: X.text }}
						>
							{name}
						</span>
						{verified ? (
							<BadgeCheck
								size={14}
								fill={X.link}
								strokeWidth={0}
								style={{ color: "#fff" }}
							/>
						) : null}
						<span className="text-[12.5px]" style={{ color: X.muted }}>
							{handle}
						</span>
						<span className="text-[12.5px]" style={{ color: X.muted }}>
							· {time}
						</span>
					</div>
				</div>
				<MoreHorizontal
					size={14}
					style={{ color: X.muted, marginTop: 2 }}
				/>
			</div>
			<div
				className="px-3.5 pt-1.5 pb-2 text-[14px] leading-snug"
				style={{ color: X.text }}
			>
				{body}
			</div>
			<div
				className="flex items-center justify-between px-3.5 pb-2.5 text-[12px]"
				style={{ color: X.muted }}
			>
				<EngagementIcon
					icon={MessageCircle}
					iconSize={14}
					count={
						<AnimatedCount
							to={stats.replies}
							delay={countDelay}
							duration={900}
						/>
					}
				/>
				<EngagementIcon
					icon={Repeat2}
					iconSize={14}
					tint="#00ba7c"
					count={
						<AnimatedCount
							to={stats.retweets}
							delay={countDelay + 80}
							duration={900}
						/>
					}
				/>
				<EngagementIcon
					icon={Heart}
					iconSize={14}
					tint="#f91880"
					count={
						<AnimatedCount
							to={stats.likes}
							delay={countDelay + 160}
							duration={1000}
						/>
					}
				/>
				<EngagementIcon
					icon={BarChart3}
					iconSize={14}
					count={
						<AnimatedCount
							to={stats.views}
							delay={countDelay + 240}
							duration={1100}
							format={formatViewCount}
						/>
					}
				/>
				<EngagementIcon icon={Bookmark} iconSize={14} tint={X.link} />
				<EngagementIcon icon={ShareIcon} iconSize={14} />
			</div>
		</motion.div>
	);
}

function EngagementIcon({
	icon: Icon,
	count,
	tint,
	iconSize = 16,
}: {
	icon: typeof MessageCircle;
	count?: ReactNode;
	tint?: string;
	iconSize?: number;
}) {
	return (
		<span
			className="inline-flex items-center gap-1.5"
			style={{ color: tint ?? X.muted }}
		>
			<Icon size={iconSize} strokeWidth={1.8} />
			{count != null ? <span>{count}</span> : null}
		</span>
	);
}

function ShareIcon(props: { size?: number; strokeWidth?: number }) {
	const { size = 16, strokeWidth = 1.8 } = props;
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
			<path d="M12 3v12" />
			<path d="m7 8 5-5 5 5" />
			<path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
		</svg>
	);
}

function XLogo() {
	return (
		<svg
			width={14}
			height={14}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function TejasAvatar() {
	return (
		<div
			className="relative size-10 shrink-0 overflow-hidden rounded-full"
			style={{ border: `1px solid ${X.border}`, background: "#fff" }}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src="/tejas.jpg"
				alt="Tejas Kumar"
				width={40}
				height={40}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
					display: "block",
				}}
			/>
		</div>
	);
}

function AnimatedCount({
	to,
	duration = 1200,
	delay = 0,
	format,
}: {
	to: number;
	duration?: number;
	delay?: number;
	format?: (n: number) => string;
}) {
	const [v, setV] = useState(0);
	const formatter = format ?? ((n: number) => Math.floor(n).toString());
	useEffect(() => {
		const startAt = performance.now() + delay;
		let raf: number;
		const tick = (now: number) => {
			if (now < startAt) {
				raf = requestAnimationFrame(tick);
				return;
			}
			const t = Math.min(1, (now - startAt) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			setV(to * eased);
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [to, duration, delay]);
	// Reserve the FINAL-formatted string's width with an invisible
	// placeholder so the box doesn't grow/shrink as the count transitions
	// across digit counts ("999" → "1.0K") or K-formatting kicks in.
	// `tabular-nums` keeps each digit position uniform inside that box.
	const finalText = formatter(to);
	const currentText = formatter(v);
	return (
		<span
			className="relative inline-block tabular-nums"
			aria-label={finalText}
		>
			<span aria-hidden style={{ visibility: "hidden" }}>
				{finalText}
			</span>
			<span
				aria-hidden
				className="absolute left-0 top-0"
				style={{ whiteSpace: "nowrap" }}
			>
				{currentText}
			</span>
		</span>
	);
}

function formatViewCount(n: number): string {
	if (n >= 1000) return (n / 1000).toFixed(1) + "K";
	return Math.floor(n).toString();
}
