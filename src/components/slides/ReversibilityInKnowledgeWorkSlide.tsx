"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	BatteryFull,
	MoreVertical,
	Phone,
	Pin,
	Wifi,
} from "lucide-react";
import { useContext, type ReactNode } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

const SANS =
	'-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const MONO =
	'"JetBrains Mono", "SF Mono", Menlo, Consolas, "Courier New", monospace';

// Telegram light theme — matches the OpenClaw governance slide so the chat
// reads as the same continuing thread, different incident.
const TG = {
	chatBgTop: "#b6d39c",
	chatBgBot: "#a8c98d",
	headerBg: "#5db075",
	headerText: "#ffffff",
	headerBorder: "rgba(0,0,0,0.08)",
	sentBubble: "#dcf8c6",
	receivedBubble: "#ffffff",
	textDark: "#1a1a1a",
	textMuted: "#5b6f54",
	timestampSent: "#5e8a55",
	timestampReceived: "#9aa39a",
	readReceipt: "#4fc3f7",
	pinnedBg: "rgba(255,255,255,0.92)",
	pinnedAccent: "#3f8a5a",
	doodle: "#7ba66a",
	panicHalo: "#d93025",
} as const;

const STRIPE = {
	purple: "#635bff",
	purpleDeep: "#4f46e5",
	bg: "#ffffff",
	text: "#0a2540",
	muted: "#697386",
	subtle: "#8c95a8",
	border: "rgba(10,37,64,0.06)",
} as const;

const STRING = {
	loose: "rgba(255,255,255,0.65)",
	tight: "#ef4444",
} as const;

// Layout
const SVG_W = 1140;
const SVG_H = 620;
const PHONE_W = 360;
const PHONE_H = 600;
const PHONE_LEFT = 90;
const PHONE_TOP = 10;
const BEZEL_PAD = 8;

// Anchor — at the right edge of the phone, at the height of the "sent ✓"
// Exec bubble. That's the moment the email leaves. The panic that follows
// lands lower, in the fade zone.
const ANCHOR_X = PHONE_LEFT + PHONE_W;
const ANCHOR_Y = PHONE_TOP + 260;

const NOTIF_W = 320;
const NOTIF_H = 78;
const NOTIF_START_X = ANCHOR_X + 10;
const NOTIF_END_X = SVG_W + 140;
const NOTIF_Y = ANCHOR_Y - NOTIF_H / 2;

// Fast pacing — the action and the panic should land in the same breath.
const UI_DELAY = 0.2;
const EXEC_1_AT = UI_DELAY + 0.45;
const YUE_AT = EXEC_1_AT + 0.55;
const EXEC_2_AT = YUE_AT + 0.55;
const LAUNCH_AT = EXEC_2_AT + 0.2;
const TRAVEL_DURATION = 1.5;
const SNAP_PROGRESS = 0.7;
const SNAP_AT = LAUNCH_AT + TRAVEL_DURATION * SNAP_PROGRESS;
const EXIT_AT = LAUNCH_AT + TRAVEL_DURATION;
const YUE_PANIC_AT = LAUNCH_AT + 0.45;
// Agent's casual apology lands AFTER the snap — too late, no take-backs.
const EXEC_APOLOGY_AT = SNAP_AT + 0.4;
const HOLD_END = EXEC_APOLOGY_AT + 1.4;
const TOTAL = HOLD_END;
const LOOP_GAP = 0.4;

// Phone fade mask — fades the bottom of the phone away. The panic bubble
// lands inside the fade zone, signaling "your words are too late."
const PHONE_MASK =
	"linear-gradient(to bottom, black 0%, black 56%, rgba(0,0,0,0.7) 64%, rgba(0,0,0,0.3) 73%, transparent 84%)";

// Helpers
function notifXAt(time: number) {
	if (time <= LAUNCH_AT) return NOTIF_START_X;
	if (time >= EXIT_AT) return NOTIF_END_X;
	const p = (time - LAUNCH_AT) / TRAVEL_DURATION;
	return NOTIF_START_X + p * (NOTIF_END_X - NOTIF_START_X);
}

function stringDAt(time: number) {
	const notifX = notifXAt(time);
	// String terminates INSIDE the chip's left edge so the chip's surface
	// occludes the endpoint — reads as "tied to the Stripe wire."
	const stringEnd = notifX + 10;
	const tensionT = Math.min(
		1,
		Math.max(0, (time - LAUNCH_AT) / (SNAP_AT - LAUNCH_AT)),
	);
	const maxSag = 32;
	const sag = maxSag * Math.max(0, 1 - tensionT * tensionT * 0.85);
	const midX = (ANCHOR_X + stringEnd) / 2;
	const midY = ANCHOR_Y + sag;
	return `M ${ANCHOR_X} ${ANCHOR_Y} Q ${midX.toFixed(2)} ${midY.toFixed(2)} ${stringEnd.toFixed(2)} ${ANCHOR_Y}`;
}

const PINNED_D = `M ${ANCHOR_X} ${ANCHOR_Y} Q ${ANCHOR_X + 2} ${ANCHOR_Y} ${ANCHOR_X + 4} ${ANCHOR_Y}`;

// Pre-compute string keyframes
const STRING_STEPS = 8;
const stringDKeys: string[] = [PINNED_D, PINNED_D];
const stringTimes: number[] = [0, Math.min(LAUNCH_AT / TOTAL, 0.999)];
for (let i = 0; i <= STRING_STEPS; i++) {
	const t = i / STRING_STEPS;
	const time = LAUNCH_AT + t * (SNAP_AT - LAUNCH_AT);
	stringDKeys.push(stringDAt(time));
	stringTimes.push(Math.min(time / TOTAL, 0.999));
}
stringDKeys.push(stringDAt(SNAP_AT));
stringTimes.push(Math.min((SNAP_AT + 0.04) / TOTAL, 0.999));
stringDKeys.push(PINNED_D);
stringTimes.push(1);

const stringWidthKeys = [0, 0, 2.4, 2.0, 1.5, 1.0, 0.55, 0, 0, 0];
const stringWidthTimes = [
	0,
	Math.min(LAUNCH_AT / TOTAL, 0.999),
	Math.min((LAUNCH_AT + 0.05) / TOTAL, 0.999),
	Math.min((LAUNCH_AT + (SNAP_AT - LAUNCH_AT) * 0.35) / TOTAL, 0.999),
	Math.min((LAUNCH_AT + (SNAP_AT - LAUNCH_AT) * 0.6) / TOTAL, 0.999),
	Math.min((LAUNCH_AT + (SNAP_AT - LAUNCH_AT) * 0.85) / TOTAL, 0.999),
	Math.min((SNAP_AT - 0.05) / TOTAL, 0.999),
	Math.min(SNAP_AT / TOTAL, 0.999),
	Math.min((SNAP_AT + 0.05) / TOTAL, 0.999),
	1,
];

const stringColorKeys = [
	STRING.loose,
	STRING.loose,
	STRING.loose,
	STRING.loose,
	STRING.loose,
	STRING.tight,
	STRING.tight,
	STRING.tight,
	STRING.tight,
	STRING.loose,
];

const notifXKeys = [
	NOTIF_START_X,
	NOTIF_START_X,
	NOTIF_START_X,
	notifXAt(SNAP_AT),
	NOTIF_END_X,
	NOTIF_END_X,
];
const notifXTimes = [
	0,
	Math.min(LAUNCH_AT / TOTAL, 0.999),
	Math.min(LAUNCH_AT / TOTAL, 0.999),
	Math.min(SNAP_AT / TOTAL, 0.999),
	Math.min(EXIT_AT / TOTAL, 0.999),
	1,
];

const notifOpacityKeys = [0, 0, 1, 1, 1, 0, 0];
const notifOpacityTimes = [
	0,
	Math.min((LAUNCH_AT - 0.01) / TOTAL, 0.999),
	Math.min(LAUNCH_AT / TOTAL, 0.999),
	Math.min((EXIT_AT - 0.05) / TOTAL, 0.999),
	Math.min(EXIT_AT / TOTAL, 0.999),
	Math.min((EXIT_AT + 0.05) / TOTAL, 0.999),
	1,
];

const notifScaleKeys = [0.85, 0.85, 1, 1, 1, 1];
const notifScaleTimes = [
	0,
	Math.min((LAUNCH_AT - 0.01) / TOTAL, 0.999),
	Math.min((LAUNCH_AT + 0.14) / TOTAL, 0.999),
	Math.min(SNAP_AT / TOTAL, 0.999),
	Math.min(EXIT_AT / TOTAL, 0.999),
	1,
];

export function ReversibilityInKnowledgeWorkSlide() {
	return (
		<DeckSlide primitive="reversibility">
			<Body />
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<>
			<div
				className="flex flex-1 items-center justify-center"
				style={{
					fontFamily: SANS,
					WebkitFontSmoothing: "antialiased",
					MozOsxFontSmoothing: "grayscale",
				}}
			>
				<div
					className="relative"
					style={{ width: SVG_W, height: SVG_H }}
				>
					<PhoneSurface active={isSlideActive} />
					<svg
						width={SVG_W}
						height={SVG_H}
						viewBox={`0 0 ${SVG_W} ${SVG_H}`}
						style={{
							position: "absolute",
							inset: 0,
							overflow: "visible",
							pointerEvents: "none",
						}}
					>
						<StringTether active={isSlideActive} />
						<DanglingRemnant active={isSlideActive} />
					</svg>
					<StripeNotification active={isSlideActive} />
				</div>
			</div>
			<Notes>
				OpenClaw confirms the email — drafted and sending. Yue tries to
				stop it, but the action has already fired. The Stripe wire is
				in flight, tethered by a thin recall line that tightens as it
				pulls away — and snaps. Past this point, the world has it. No
				git revert for what just left.
			</Notes>
		</>
	);
}

/* ============================== Phone ================================ */

function PhoneSurface({ active }: { active: boolean }) {
	return (
		<motion.div
			className="absolute"
			style={{
				left: PHONE_LEFT,
				top: PHONE_TOP,
				width: PHONE_W,
				height: PHONE_H,
				// Bottom-fade — the panic bubble lands inside this zone,
				// reading as "your words don't even reach the agent."
				WebkitMaskImage: PHONE_MASK,
				maskImage: PHONE_MASK,
			}}
			initial={{ opacity: 0, y: 16 }}
			animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
			transition={{
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1],
				delay: UI_DELAY,
			}}
		>
			<div
				className="relative h-full w-full overflow-hidden"
				style={{
					background: "#000",
					borderRadius: 46,
					padding: BEZEL_PAD,
					boxShadow:
						"0 30px 70px rgba(0,0,0,0.55), 0 10px 24px rgba(0,0,0,0.4), inset 0 0 0 1px #2a2a2a",
				}}
			>
				<div
					className="relative flex h-full w-full flex-col overflow-hidden"
					style={{
						background: `linear-gradient(to bottom, ${TG.chatBgTop}, ${TG.chatBgBot})`,
						borderRadius: 38,
					}}
				>
					<DoodlePattern />
					<PhoneStatusBar />
					<TelegramHeader />
					<PinnedRule />
					<ChatBody active={active} />
				</div>
			</div>
		</motion.div>
	);
}

function PhoneStatusBar() {
	return (
		<div
			className="relative flex items-center justify-between"
			style={{
				padding: "14px 24px 6px",
				color: TG.textDark,
				fontSize: 15,
				fontWeight: 600,
				letterSpacing: "-0.01em",
			}}
		>
			<span style={{ minWidth: 60 }}>9:41</span>

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

			<div
				className="flex items-center gap-1.5"
				style={{ minWidth: 60, justifyContent: "flex-end" }}
			>
				<SignalBars />
				<Wifi size={14} strokeWidth={2.5} color={TG.textDark} />
				<BatteryFull size={22} strokeWidth={1.8} color={TG.textDark} />
			</div>
		</div>
	);
}

function SignalBars() {
	return (
		<svg width={16} height={11} viewBox="0 0 16 11" aria-hidden>
			<rect x="0" y="7" width="3" height="4" rx="0.6" fill={TG.textDark} />
			<rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={TG.textDark} />
			<rect x="9" y="3" width="3" height="8" rx="0.6" fill={TG.textDark} />
			<rect x="13" y="0" width="3" height="11" rx="0.6" fill={TG.textDark} />
		</svg>
	);
}

function TelegramHeader() {
	return (
		<div
			className="relative flex items-center gap-3 px-3.5 py-2"
			style={{
				background: TG.headerBg,
				borderBottom: `1px solid ${TG.headerBorder}`,
			}}
		>
			<ArrowLeft size={18} color={TG.headerText} strokeWidth={2.2} />
			<div className="min-w-0 flex-1 leading-tight">
				<div
					className="text-[15px] font-semibold"
					style={{ color: TG.headerText }}
				>
					OpenClaw
				</div>
				<div
					className="text-[12px]"
					style={{ color: "rgba(255,255,255,0.78)" }}
				>
					exec · online
				</div>
			</div>
			<Phone size={18} color={TG.headerText} strokeWidth={2.2} />
			<MoreVertical size={18} color={TG.headerText} strokeWidth={2.2} />
			<div
				className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-full"
				style={{
					background: "linear-gradient(135deg, #6dc486, #4aa56b)",
					color: "#fff",
					fontWeight: 700,
					fontSize: 15,
					border: "2px solid rgba(255,255,255,0.85)",
				}}
			>
				⌥
			</div>
		</div>
	);
}

function PinnedRule() {
	return (
		<div
			className="relative flex items-center gap-2.5 px-3.5 py-2"
			style={{
				background: TG.pinnedBg,
				borderBottom: `1px solid ${TG.headerBorder}`,
			}}
		>
			<Pin size={14} strokeWidth={2.2} style={{ color: TG.pinnedAccent }} />
			<div
				className="self-stretch"
				style={{
					width: 2,
					background: TG.pinnedAccent,
					borderRadius: 1,
				}}
			/>
			<div className="min-w-0 flex-1 leading-tight">
				<div
					className="text-[11.5px] font-semibold"
					style={{ color: TG.pinnedAccent }}
				>
					Pinned · Rule
				</div>
				<div
					className="truncate text-[12.5px]"
					style={{ color: TG.textDark }}
				>
					confirm before any external action
				</div>
			</div>
		</div>
	);
}

function ChatBody({ active }: { active: boolean }) {
	return (
		<div className="relative flex flex-1 flex-col gap-1.5 px-3 pt-3">
			<ExecBubble active={active} delay={EXEC_1_AT} time="9:41">
				<span style={{ color: "#7a7a7a" }}>
					# drafting wire email → ops@external-llc.com
					&nbsp;($50,000 vendor invoice)
				</span>
			</ExecBubble>

			<UserBubble active={active} delay={YUE_AT} time="9:41">
				hold on — wrong recipient
			</UserBubble>

			<ExecBubble active={active} delay={EXEC_2_AT} time="9:41">
				<span style={{ color: "#7a7a7a" }}>
					# sent ✓ — Stripe wire authorized
				</span>
			</ExecBubble>

			<UserBubble
				active={active}
				delay={YUE_PANIC_AT}
				time="9:41"
				panic
			>
				STOP STOP STOP
			</UserBubble>

			<ExecBubble
				active={active}
				delay={EXEC_APOLOGY_AT}
				time="9:42"
			>
				<span style={{ color: "#7a7a7a" }}>
					# oops my bad
				</span>
			</ExecBubble>
		</div>
	);
}

function UserBubble({
	children,
	active,
	delay,
	time,
	panic,
}: {
	children: ReactNode;
	active: boolean;
	delay: number;
	time: string;
	panic?: boolean;
}) {
	// Looping keyframes: hidden → entrance at `delay` → hold → fade at end.
	const times = [
		0,
		Math.min((delay - 0.01) / TOTAL, 0.999),
		Math.min((delay + 0.28) / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];
	return (
		<motion.div
			className="flex justify-end"
			initial={{ opacity: 0, y: 6, scale: 0.96 }}
			animate={
				active
					? {
							opacity: [0, 0, 1, 1, 0],
							y: [6, 6, 0, 0, 6],
							scale: [0.96, 0.96, 1, 1, 0.96],
						}
					: { opacity: 0, y: 6, scale: 0.96 }
			}
			transition={{
				duration: TOTAL,
				times,
				ease: [0.22, 1.18, 0.6, 1],
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<div
				className="relative max-w-[85%] px-3 pt-1.5 pb-1 text-[14px] leading-snug"
				style={{
					background: TG.sentBubble,
					color: TG.textDark,
					borderRadius: 12,
					borderTopRightRadius: 4,
					fontWeight: panic ? 700 : 500,
					boxShadow: panic
						? `0 0 0 2px ${TG.panicHalo}, 0 1px 1px rgba(0,0,0,0.07)`
						: "0 1px 1px rgba(0,0,0,0.07)",
				}}
			>
				<span>{children}</span>
				<span
					className="ml-2 inline-flex translate-y-[2px] items-center gap-1 text-[10.5px]"
					style={{ color: TG.timestampSent, fontWeight: 400 }}
				>
					{time}
					<DoubleCheck />
				</span>
			</div>
		</motion.div>
	);
}

function ExecBubble({
	children,
	active,
	delay,
	time,
}: {
	children: ReactNode;
	active: boolean;
	delay: number;
	time: string;
}) {
	const times = [
		0,
		Math.min((delay - 0.01) / TOTAL, 0.999),
		Math.min((delay + 0.28) / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];
	return (
		<motion.div
			className="flex justify-start"
			initial={{ opacity: 0, y: 6, scale: 0.96 }}
			animate={
				active
					? {
							opacity: [0, 0, 1, 1, 0],
							y: [6, 6, 0, 0, 6],
							scale: [0.96, 0.96, 1, 1, 0.96],
						}
					: { opacity: 0, y: 6, scale: 0.96 }
			}
			transition={{
				duration: TOTAL,
				times,
				ease: [0.22, 1.18, 0.6, 1],
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<div
				className="relative max-w-[88%] px-3 pt-1.5 pb-1"
				style={{
					background: TG.receivedBubble,
					color: TG.textDark,
					borderRadius: 12,
					borderTopLeftRadius: 4,
					boxShadow: "0 1px 1px rgba(0,0,0,0.07)",
				}}
			>
				<span
					className="text-[13.5px] font-bold"
					style={{ marginRight: 4 }}
				>
					🔧 Exec:
				</span>
				<span
					className="text-[13px] leading-snug"
					style={{ fontFamily: MONO }}
				>
					{children}
				</span>
				<span
					className="ml-2 inline-flex translate-y-[2px] items-center gap-1 text-[10.5px]"
					style={{ color: TG.timestampReceived, fontFamily: SANS }}
				>
					{time}
				</span>
			</div>
		</motion.div>
	);
}

function DoubleCheck() {
	return (
		<svg width={14} height={10} viewBox="0 0 16 12" aria-hidden>
			<path
				d="M1 6 L4 9 L9 3"
				fill="none"
				stroke={TG.readReceipt}
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6 6 L9 9 L15 2"
				fill="none"
				stroke={TG.readReceipt}
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function DoodlePattern() {
	return (
		<svg
			className="pointer-events-none absolute inset-0 h-full w-full"
			style={{ opacity: 0.16 }}
			aria-hidden
		>
			<defs>
				<pattern
					id="rev-tg-doodles"
					width="96"
					height="96"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(8)"
				>
					<g
						fill="none"
						stroke={TG.doodle}
						strokeWidth="1.3"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M16 12 L18 18 L24 18 L19 22 L21 28 L16 24 L11 28 L13 22 L8 18 L14 18 Z" />
						<circle cx="60" cy="20" r="4" />
						<path d="M44 56 c-4 -4 0 -10 4 -6 c4 -4 8 2 4 6 l-4 4 z" />
						<path d="M80 60 l6 10 l-12 0 z" />
						<rect x="20" y="68" width="14" height="10" rx="1" />
						<path d="M27 68 v10" />
						<path d="M62 72 q3 -4 6 0 t6 0" />
					</g>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#rev-tg-doodles)" />
		</svg>
	);
}

/* ============================ String + flash =========================== */

function StringTether({ active }: { active: boolean }) {
	return (
		<g>
			<motion.circle
				cx={ANCHOR_X}
				cy={ANCHOR_Y}
				r={3.5}
				fill={STRING.loose}
				initial={{ opacity: 0 }}
				animate={
					active
						? { opacity: [0, 0, 1, 1, 0.3, 0] }
						: { opacity: 0 }
				}
				transition={{
					duration: TOTAL,
					times: [
						0,
						Math.min(LAUNCH_AT / TOTAL, 0.999),
						Math.min((LAUNCH_AT + 0.04) / TOTAL, 0.999),
						Math.min(SNAP_AT / TOTAL, 0.999),
						Math.min((SNAP_AT + 0.3) / TOTAL, 0.999),
						1,
					],
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			/>
			<motion.path
				fill="none"
				strokeLinecap="round"
				initial={{
					d: PINNED_D,
					strokeWidth: 0,
					stroke: STRING.loose,
				}}
				animate={
					active
						? {
								d: stringDKeys,
								strokeWidth: stringWidthKeys,
								stroke: stringColorKeys,
							}
						: {
								d: PINNED_D,
								strokeWidth: 0,
								stroke: STRING.loose,
							}
				}
				transition={{
					d: {
						duration: TOTAL,
						times: stringTimes,
						ease: "linear",
						repeat: Infinity,
						repeatDelay: LOOP_GAP,
					},
					strokeWidth: {
						duration: TOTAL,
						times: stringWidthTimes,
						ease: "linear",
						repeat: Infinity,
						repeatDelay: LOOP_GAP,
					},
					stroke: {
						duration: TOTAL,
						times: stringWidthTimes,
						ease: "linear",
						repeat: Infinity,
						repeatDelay: LOOP_GAP,
					},
				}}
			/>
		</g>
	);
}

// After the cut, the piece still tied to the phone swings down under gravity.
// Hangs limp afterwards — no burst, no scatter. The chip leaving carries the
// rest of the string with it; what stays behind drops.
function DanglingRemnant({ active }: { active: boolean }) {
	const LEN = 56;
	const HIDDEN_D = `M ${ANCHOR_X} ${ANCHOR_Y} L ${ANCHOR_X} ${ANCHOR_Y}`;
	const HORIZ_D = `M ${ANCHOR_X} ${ANCHOR_Y} L ${ANCHOR_X + LEN} ${ANCHOR_Y}`;
	// Pendulum overshoot past vertical (angle ≈ 100°), then swing back
	// (angle ≈ 84°), then settle straight down (angle 90°).
	const OVERSHOOT_D = `M ${ANCHOR_X} ${ANCHOR_Y} L ${(ANCHOR_X - 10).toFixed(2)} ${(ANCHOR_Y + 55).toFixed(2)}`;
	const SWING_BACK_D = `M ${ANCHOR_X} ${ANCHOR_Y} L ${(ANCHOR_X + 6).toFixed(2)} ${(ANCHOR_Y + 55.6).toFixed(2)}`;
	const SETTLED_D = `M ${ANCHOR_X} ${ANCHOR_Y} L ${ANCHOR_X} ${ANCHOR_Y + LEN}`;

	const dKeys = [
		HIDDEN_D,
		HIDDEN_D,
		HORIZ_D,
		OVERSHOOT_D,
		SWING_BACK_D,
		SETTLED_D,
		SETTLED_D,
		SETTLED_D,
	];
	const opacityKeys = [0, 0, 1, 1, 1, 1, 1, 0];
	const times = [
		0,
		Math.min((SNAP_AT - 0.02) / TOTAL, 0.999),
		Math.min(SNAP_AT / TOTAL, 0.999),
		Math.min((SNAP_AT + 0.22) / TOTAL, 0.999),
		Math.min((SNAP_AT + 0.42) / TOTAL, 0.999),
		Math.min((SNAP_AT + 0.62) / TOTAL, 0.999),
		Math.min((TOTAL - 0.2) / TOTAL, 0.999),
		1,
	];

	return (
		<motion.path
			fill="none"
			stroke="rgba(255,255,255,0.55)"
			strokeWidth={1.5}
			strokeLinecap="round"
			initial={{ d: HIDDEN_D, opacity: 0 }}
			animate={
				active
					? { d: dKeys, opacity: opacityKeys }
					: { d: HIDDEN_D, opacity: 0 }
			}
			transition={{
				duration: TOTAL,
				times,
				ease: "easeInOut",
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		/>
	);
}

/* =========================== Stripe notification ======================= */

function StripeNotification({ active }: { active: boolean }) {
	return (
		<motion.div
			className="absolute"
			style={{
				top: NOTIF_Y,
				left: 0,
				width: NOTIF_W,
				height: NOTIF_H,
				willChange: "transform",
			}}
			initial={{ x: NOTIF_START_X, opacity: 0, scale: 0.85 }}
			animate={
				active
					? {
							x: notifXKeys,
							opacity: notifOpacityKeys,
							scale: notifScaleKeys,
						}
					: {
							x: NOTIF_START_X,
							opacity: 0,
							scale: 0.85,
						}
			}
			transition={{
				duration: TOTAL,
				ease: "linear",
				times: notifXTimes,
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
				opacity: {
					duration: TOTAL,
					times: notifOpacityTimes,
					ease: "linear",
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				},
				scale: {
					duration: TOTAL,
					times: notifScaleTimes,
					ease: [0.22, 1.18, 0.36, 1],
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				},
			}}
		>
			<div
				className="flex h-full w-full items-center gap-3 px-3"
				style={{
					background: STRIPE.bg,
					borderRadius: 16,
					border: `1px solid ${STRIPE.border}`,
					boxShadow:
						"0 20px 44px rgba(10,37,64,0.18), 0 4px 12px rgba(10,37,64,0.1), 0 0 0 1px rgba(10,37,64,0.04)",
				}}
			>
				<div
					className="flex size-11 shrink-0 items-center justify-center"
					style={{
						background:
							"linear-gradient(135deg, #7a73ff 0%, #635bff 50%, #4f46e5 100%)",
						borderRadius: 12,
						boxShadow:
							"0 6px 14px rgba(99,91,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
					}}
				>
					<StripeMark />
				</div>
				<div className="flex min-w-0 flex-1 flex-col leading-tight">
					<div className="flex items-baseline justify-between">
						<span
							style={{
								color: STRIPE.text,
								fontSize: 12.5,
								fontWeight: 700,
								letterSpacing: "-0.01em",
							}}
						>
							Stripe
						</span>
						<span
							style={{
								fontSize: 10.5,
								color: STRIPE.subtle,
								letterSpacing: "-0.005em",
							}}
						>
							now
						</span>
					</div>
					<span
						style={{
							color: STRIPE.text,
							fontSize: 13.5,
							fontWeight: 600,
							marginTop: 1,
							letterSpacing: "-0.01em",
						}}
					>
						Wire authorized
					</span>
					<span
						style={{
							color: STRIPE.muted,
							fontSize: 11.5,
							marginTop: 1,
							fontFamily: MONO,
							fontVariantNumeric: "tabular-nums",
							letterSpacing: "-0.005em",
						}}
					>
						$50,000.00 → ACME EXT LLC
					</span>
				</div>
			</div>
		</motion.div>
	);
}

function StripeMark() {
	return (
		<svg
			width={22}
			height={22}
			viewBox="0 0 32 32"
			fill="none"
			aria-hidden
		>
			<path
				d="M16.55 12.78c0-1.14.94-1.58 2.49-1.58 2.22 0 5.03.67 7.25 1.86V6.2c-2.43-.96-4.83-1.34-7.25-1.34-5.93 0-9.88 3.1-9.88 8.27 0 8.06 11.1 6.78 11.1 10.25 0 1.35-1.18 1.79-2.83 1.79-2.42 0-5.52-.99-7.97-2.33v6.96c2.71 1.17 5.46 1.66 7.97 1.66 6.08 0 10.26-3.01 10.26-8.24 0-8.69-11.14-7.16-11.14-10.44z"
				fill="#ffffff"
			/>
		</svg>
	);
}
