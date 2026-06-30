"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

type AppConfig = {
	slug: string;
	name: string;
	question: string;
	noResults: string;
	accent: string;

	bodyBg: string;
	bodyFg: string;

	searchBg: string;
	searchFg: string;
	searchBorder: string;
	searchRadius: number;
	searchIconColor: string;

	noResultsFg: string;
	noResultsMutedFg: string;
};

// Grid order: top row, then bottom row.
const APPS: AppConfig[] = [
	{
		slug: "salesforce",
		name: "Salesforce",
		question: "What led to the current CRM state?",
		noResults: "No matching records",
		accent: "#1B96FF",
		bodyBg: "#FAFAF9",
		bodyFg: "#16325C",
		searchBg: "#ffffff",
		searchFg: "#16325C",
		searchBorder: "#DDDBDA",
		searchRadius: 4,
		searchIconColor: "#706E6B",
		noResultsFg: "#16325C",
		noResultsMutedFg: "#706E6B",
	},
	{
		slug: "notion",
		name: "Notion",
		question: "What's the support escalation process?",
		noResults: "No matching pages",
		accent: "#2EAADC",
		bodyBg: "#ffffff",
		bodyFg: "#37352F",
		searchBg: "#F7F7F5",
		searchFg: "#37352F",
		searchBorder: "rgba(15,15,15,0.08)",
		searchRadius: 6,
		searchIconColor: "#9B9A97",
		noResultsFg: "#37352F",
		noResultsMutedFg: "#9B9A97",
	},
	{
		slug: "slack",
		name: "Slack",
		question: "How did Yue close the Acme deal?",
		noResults: "We didn't find any results",
		accent: "#ECB22E",
		bodyBg: "#1A1D29",
		bodyFg: "#FFFFFF",
		searchBg: "rgba(255,255,255,0.14)",
		searchFg: "#ffffff",
		searchBorder: "rgba(255,255,255,0)",
		searchRadius: 6,
		searchIconColor: "#E1E1E1",
		noResultsFg: "#FFFFFF",
		noResultsMutedFg: "#9A9CA8",
	},
	{
		slug: "gmail",
		name: "Gmail",
		question: "Find the renewal email template",
		noResults: "No conversations found",
		accent: "#EA4335",
		bodyBg: "#ffffff",
		bodyFg: "#202124",
		searchBg: "#EAF1FB",
		searchFg: "#202124",
		searchBorder: "transparent",
		searchRadius: 9999,
		searchIconColor: "#5F6368",
		noResultsFg: "#202124",
		noResultsMutedFg: "#5F6368",
	},
	{
		slug: "zendesk",
		name: "Zendesk",
		question: "When did escalation #4218 start?",
		noResults: "0 tickets match",
		accent: "#03A78F",
		bodyBg: "#17494D",
		bodyFg: "#FFFFFF",
		searchBg: "#ffffff",
		searchFg: "#2F3941",
		searchBorder: "#D8DCDE",
		searchRadius: 4,
		searchIconColor: "#68737D",
		noResultsFg: "#FFFFFF",
		noResultsMutedFg: "#C2D4D6",
	},
	{
		slug: "linear",
		name: "Linear",
		question: "Why did we deprioritize EU billing?",
		noResults: "0 issues match",
		accent: "#5E6AD2",
		bodyBg: "#1C1D27",
		bodyFg: "#F2F3F5",
		searchBg: "#2D2F3A",
		searchFg: "#F2F3F5",
		searchBorder: "transparent",
		searchRadius: 6,
		searchIconColor: "#94959E",
		noResultsFg: "#F2F3F5",
		noResultsMutedFg: "#94959E",
	},
];

// Grid
const COLS = 3;
const ROWS = 2;
const WIN_W = 370;
const WIN_H = 200;
const HEADER_H = 24;
const GAP = 24;
const CONTAINER_W = COLS * WIN_W + (COLS - 1) * GAP;
const CONTAINER_H = ROWS * WIN_H + (ROWS - 1) * GAP;

// Snake path: top-left → top-mid → top-right → bottom-right → bottom-mid → bottom-left.
const PATH_INDICES = [0, 1, 2, 5, 4, 3];

// Timing
const TRAVEL = 0.4;
const PAUSE = 1.6;
const TYPING_DURATION = 0.55;
const NO_RESULTS_REVEAL = 0.3;
const RETURN_TRAVEL = 0.85;
const KICKOFF_DELAY = 0.6;
const LOOP_GAP = 0.6;
const DIM = 0.3;
const BORDER_DIM = "rgba(255,255,255,0.08)";

const ARRIVE_TIMES: number[] = [];
const LEAVE_TIMES: number[] = [];
{
	let t = 0;
	for (let i = 0; i < PATH_INDICES.length; i++) {
		t += TRAVEL;
		ARRIVE_TIMES.push(t);
		t += PAUSE;
		LEAVE_TIMES.push(t);
	}
}
const TOTAL = LEAVE_TIMES[LEAVE_TIMES.length - 1] + RETURN_TRAVEL;
const norm = (t: number) => t / TOTAL;

function gridPos(idx: number) {
	const col = idx % COLS;
	const row = Math.floor(idx / COLS);
	return {
		left: col * (WIN_W + GAP),
		top: row * (WIN_H + GAP),
	};
}

function claudeAnchor(idx: number) {
	const p = gridPos(idx);
	return { x: p.left + WIN_W / 2, y: p.top - 4 };
}

export function KnowledgeHistoryGapSlide() {
	return (
		<DeckSlide primitive="history">
			<Body />
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);

	const xKeys: number[] = [];
	const yKeys: number[] = [];
	const times: number[] = [];

	const first = claudeAnchor(PATH_INDICES[0]);
	xKeys.push(first.x);
	yKeys.push(first.y);
	times.push(0);

	for (let i = 0; i < PATH_INDICES.length; i++) {
		const a = claudeAnchor(PATH_INDICES[i]);
		xKeys.push(a.x);
		yKeys.push(a.y);
		times.push(norm(ARRIVE_TIMES[i]));
		xKeys.push(a.x);
		yKeys.push(a.y);
		times.push(norm(LEAVE_TIMES[i]));
	}

	xKeys.push(first.x);
	yKeys.push(first.y);
	times.push(1);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="relative"
					style={{ width: CONTAINER_W, height: CONTAINER_H }}
				>
					{APPS.map((app, i) => {
						const pathPos = PATH_INDICES.indexOf(i);
						const arriveT = ARRIVE_TIMES[pathPos];
						const leaveT = LEAVE_TIMES[pathPos];
						const pos = gridPos(i);
						return (
							<WindowCard
								key={app.slug}
								config={app}
								left={pos.left}
								top={pos.top}
								active={isSlideActive}
								arriveT={arriveT}
								leaveT={leaveT}
								revealDelay={0.2 + i * 0.06}
							/>
						);
					})}

					<motion.div
						className="absolute"
						style={{ top: 0, left: 0, willChange: "opacity" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: isSlideActive ? 1 : 0 }}
						transition={{
							duration: 0.3,
							delay: isSlideActive ? KICKOFF_DELAY - 0.2 : 0,
						}}
					>
						<motion.div
							style={{ willChange: "transform" }}
							initial={{ x: first.x, y: first.y }}
							animate={
								isSlideActive
									? { x: xKeys, y: yKeys }
									: { x: first.x, y: first.y }
							}
							transition={{
								duration: TOTAL,
								times,
								delay: isSlideActive ? KICKOFF_DELAY : 0,
								ease: "linear",
								repeat: Infinity,
								repeatDelay: LOOP_GAP,
							}}
						>
							<div style={{ transform: "translate(-50%, -100%)" }}>
								<AgentChip />
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>

			<Notes>
				Knowledge work has no history. Claude flies across every app —
				CRM, docs, chat, email, support, tracker — types the same kind of
				lookback into each search box, and gets nothing.
			</Notes>
		</>
	);
}

function AgentChip() {
	return (
		<div
			className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
			style={{
				background: "rgba(13, 17, 23, 0.95)",
				border: "1px solid rgba(255, 255, 255, 0.18)",
				boxShadow: "0 6px 18px rgba(0, 0, 0, 0.6)",
				fontFamily: "var(--font-jetbrains-mono), monospace",
				color: "#c9d1d9",
				fontSize: 11,
				fontWeight: 600,
			}}
		>
			<img
				src="/images/clients/claude.svg"
				width={13}
				height={13}
				alt=""
				style={{ display: "block" }}
			/>
			<span>claude</span>
		</div>
	);
}

function WindowCard({
	config,
	left,
	top,
	active,
	arriveT,
	leaveT,
	revealDelay,
}: {
	config: AppConfig;
	left: number;
	top: number;
	active: boolean;
	arriveT: number;
	leaveT: number;
	revealDelay: number;
}) {
	// Window cycle: opacity + slight scale pop + desaturation when dim.
	// No border color shift, no glow.
	const opacityKeys = [DIM, DIM, 1, 1, DIM, DIM];
	const scaleKeys = [1, 1, 1.04, 1.04, 1, 1];
	const filterKeys = [
		"grayscale(0.5)",
		"grayscale(0.5)",
		"grayscale(0)",
		"grayscale(0)",
		"grayscale(0.5)",
		"grayscale(0.5)",
	];
	const cycleTimes = [
		0,
		norm(arriveT - 0.05),
		norm(arriveT + 0.03),
		norm(leaveT - 0.03),
		norm(leaveT + 0.05),
		1,
	];

	// Typing animation: search bar text width grows from 0 → 100% over TYPING_DURATION.
	const typingWidthKeys = ["0%", "0%", "100%", "100%", "0%", "0%"];
	const typingTimes = [
		0,
		norm(arriveT - 0.04),
		norm(arriveT + TYPING_DURATION),
		norm(leaveT - 0.03),
		norm(leaveT + 0.05),
		1,
	];

	// No-results fades in after typing completes.
	const noResultsOpacityKeys = [0, 0, 0, 1, 1, 0, 0];
	const noResultsTimes = [
		0,
		norm(arriveT - 0.04),
		norm(arriveT + TYPING_DURATION),
		norm(arriveT + TYPING_DURATION + NO_RESULTS_REVEAL),
		norm(leaveT - 0.03),
		norm(leaveT + 0.05),
		1,
	];

	// Shimmer visibility — only during active window.
	const shimmerOpacityKeys = [0, 0, 1, 1, 0, 0];

	return (
		<motion.div
			className="absolute"
			style={{ left, top, width: WIN_W, height: WIN_H }}
			initial={{ opacity: 0, y: 8 }}
			animate={
				active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
			}
			transition={{
				duration: 0.4,
				ease: [0.22, 1, 0.36, 1],
				delay: active ? revealDelay : 0,
			}}
		>
			<motion.div
				className="h-full w-full relative"
				style={{
					borderRadius: 8,
					overflow: "hidden",
					border: `1px solid ${BORDER_DIM}`,
					background: "#0d1117",
				}}
				animate={
					active
						? {
								opacity: opacityKeys,
								scale: scaleKeys,
								filter: filterKeys,
							}
						: { opacity: 1, scale: 1, filter: "grayscale(0)" }
				}
				transition={{
					duration: TOTAL,
					times: cycleTimes,
					ease: "linear",
					delay: active ? KICKOFF_DELAY : 0,
					repeat: Infinity,
					repeatDelay: LOOP_GAP,
				}}
			>
				<TerminalHeader config={config} />
				<AppBody
					config={config}
					active={active}
					typingTimes={typingTimes}
					typingWidthKeys={typingWidthKeys}
					noResultsTimes={noResultsTimes}
					noResultsOpacityKeys={noResultsOpacityKeys}
				/>
				<ShimmerOverlay
					accent={config.accent}
					active={active}
					shimmerOpacityKeys={shimmerOpacityKeys}
					shimmerTimes={cycleTimes}
				/>
			</motion.div>
		</motion.div>
	);
}

function TerminalHeader({ config }: { config: AppConfig }) {
	return (
		<div
			style={{
				background: "#1a1d24",
				height: HEADER_H,
				display: "flex",
				alignItems: "center",
				padding: "0 10px",
				borderBottom: "1px solid rgba(255,255,255,0.05)",
				flexShrink: 0,
				position: "relative",
				zIndex: 2,
			}}
		>
			<div className="flex items-center gap-1.5">
				{["#ff5f57", "#febc2e", "#28c840"].map((c) => (
					<span
						key={c}
						style={{
							width: 8,
							height: 8,
							borderRadius: 9999,
							background: c,
						}}
					/>
				))}
			</div>
			<div
				className="flex flex-1 items-center justify-center gap-1.5"
				style={{ paddingRight: 38 }}
			>
				<img
					src={`https://logos.composio.dev/api/${config.slug}?theme=light`}
					width={11}
					height={11}
					alt=""
					style={{ display: "block" }}
				/>
				<span
					style={{
						color: "#c9d1d9",
						fontSize: 10,
						fontWeight: 600,
						fontFamily:
							"var(--font-jetbrains-mono), monospace",
					}}
				>
					{config.name}
				</span>
			</div>
		</div>
	);
}

function AppBody({
	config,
	active,
	typingTimes,
	typingWidthKeys,
	noResultsTimes,
	noResultsOpacityKeys,
}: {
	config: AppConfig;
	active: boolean;
	typingTimes: number[];
	typingWidthKeys: string[];
	noResultsTimes: number[];
	noResultsOpacityKeys: number[];
}) {
	return (
		<div
			style={{
				height: WIN_H - HEADER_H - 2,
				background: config.bodyBg,
				padding: "12px 14px",
				display: "flex",
				flexDirection: "column",
				gap: 10,
				minHeight: 0,
				fontFamily:
					"var(--font-abc-diatype), Inter, system-ui, sans-serif",
				position: "relative",
				zIndex: 1,
			}}
		>
			<SearchBar
				config={config}
				active={active}
				typingTimes={typingTimes}
				typingWidthKeys={typingWidthKeys}
			/>
			<NoResults
				config={config}
				active={active}
				noResultsTimes={noResultsTimes}
				noResultsOpacityKeys={noResultsOpacityKeys}
			/>
		</div>
	);
}

function SearchBar({
	config,
	active,
	typingTimes,
	typingWidthKeys,
}: {
	config: AppConfig;
	active: boolean;
	typingTimes: number[];
	typingWidthKeys: string[];
}) {
	return (
		<div
			style={{
				background: config.searchBg,
				border: `1px solid ${config.searchBorder}`,
				borderRadius: config.searchRadius,
				padding: "7px 10px",
				display: "flex",
				alignItems: "center",
				gap: 8,
				flexShrink: 0,
			}}
		>
			<Search
				size={12}
				color={config.searchIconColor}
				style={{ flexShrink: 0, display: "block" }}
			/>
			<div
				style={{
					flex: 1,
					position: "relative",
					overflow: "visible",
					height: 16,
					display: "flex",
					alignItems: "center",
				}}
			>
				<motion.div
					style={{
						overflow: "hidden",
						whiteSpace: "nowrap",
						height: 16,
						display: "flex",
						alignItems: "center",
						willChange: "width",
					}}
					initial={{ width: "0%" }}
					animate={
						active
							? { width: typingWidthKeys }
							: { width: "0%" }
					}
					transition={{
						duration: TOTAL,
						times: typingTimes,
						ease: "linear",
						delay: active ? KICKOFF_DELAY : 0,
						repeat: Infinity,
						repeatDelay: LOOP_GAP,
					}}
				>
					<span
						style={{
							color: config.searchFg,
							fontSize: 11,
							lineHeight: 1,
						}}
					>
						{config.question}
					</span>
				</motion.div>

				{/* Typing caret — rides the right edge of the revealed text */}
				<TypingCaret
					color={config.searchFg}
					active={active}
					typingTimes={typingTimes}
				/>
			</div>
		</div>
	);
}

function TypingCaret({
	color,
	active,
	typingTimes,
}: {
	color: string;
	active: boolean;
	typingTimes: number[];
}) {
	// Position: stays at 0% until just before Claude arrives, slides to 100%
	// over TYPING_DURATION, then sits at 100% until window leaves, snaps back.
	const positionKeys = ["0%", "0%", "100%", "100%", "0%", "0%"];
	// Visibility: hidden outside the active window, on during typing + read.
	const visibilityKeys = [0, 0, 1, 1, 0, 0];

	return (
		<motion.div
			className="pointer-events-none absolute"
			style={{
				top: 2,
				bottom: 2,
				width: 1.5,
				transform: "translateX(-1px)",
				willChange: "transform, opacity",
			}}
			initial={{ left: "0%", opacity: 0 }}
			animate={
				active
					? { left: positionKeys, opacity: visibilityKeys }
					: { left: "0%", opacity: 0 }
			}
			transition={{
				duration: TOTAL,
				times: typingTimes,
				ease: "linear",
				delay: active ? KICKOFF_DELAY : 0,
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<motion.div
				style={{
					width: "100%",
					height: "100%",
					background: color,
				}}
				animate={{ opacity: [1, 1, 0, 0, 1] }}
				transition={{
					duration: 0.9,
					times: [0, 0.48, 0.5, 0.98, 1],
					ease: "linear",
					repeat: Infinity,
				}}
			/>
		</motion.div>
	);
}

function NoResults({
	config,
	active,
	noResultsTimes,
	noResultsOpacityKeys,
}: {
	config: AppConfig;
	active: boolean;
	noResultsTimes: number[];
	noResultsOpacityKeys: number[];
}) {
	return (
		<motion.div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 5,
				minHeight: 0,
				willChange: "opacity",
			}}
			initial={{ opacity: 0 }}
			animate={
				active
					? { opacity: noResultsOpacityKeys }
					: { opacity: 0 }
			}
			transition={{
				duration: TOTAL,
				times: noResultsTimes,
				ease: "linear",
				delay: active ? KICKOFF_DELAY : 0,
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<div
				style={{
					width: 22,
					height: 22,
					borderRadius: 9999,
					border: `1.5px solid ${config.noResultsMutedFg}66`,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<X size={12} color={config.noResultsMutedFg} />
			</div>
			<div
				style={{
					color: config.noResultsFg,
					fontSize: 11,
					fontWeight: 600,
					textAlign: "center",
				}}
			>
				{config.noResults}
			</div>
		</motion.div>
	);
}

function ShimmerOverlay({
	accent,
	active,
	shimmerOpacityKeys,
	shimmerTimes,
}: {
	accent: string;
	active: boolean;
	shimmerOpacityKeys: number[];
	shimmerTimes: number[];
}) {
	return (
		<motion.div
			className="absolute pointer-events-none"
			style={{
				top: HEADER_H,
				left: 0,
				right: 0,
				bottom: 0,
				overflow: "hidden",
				zIndex: 3,
				willChange: "opacity",
			}}
			initial={{ opacity: 0 }}
			animate={
				active ? { opacity: shimmerOpacityKeys } : { opacity: 0 }
			}
			transition={{
				duration: TOTAL,
				times: shimmerTimes,
				ease: "linear",
				delay: active ? KICKOFF_DELAY : 0,
				repeat: Infinity,
				repeatDelay: LOOP_GAP,
			}}
		>
			<motion.div
				style={{
					position: "absolute",
					top: 0,
					height: "100%",
					width: "50%",
					background:
						"linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.10) 50%, transparent 65%)",
					willChange: "transform",
				}}
				initial={{ x: "-80%" }}
				animate={{ x: ["-80%", "240%"] }}
				transition={{
					duration: 2.6,
					ease: "linear",
					repeat: Infinity,
				}}
			/>
		</motion.div>
	);
}
