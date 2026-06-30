"use client";

import { motion } from "framer-motion";
import {
	ChevronDown,
	ChevronRight,
	MessageSquare,
	MoreHorizontal,
	Search,
	Share2,
	Star,
} from "lucide-react";
import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

/* ───────────────────────────── Tokens ───────────────────────────── */

const SANS =
	'-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const MONO =
	"var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace";

// Real brand logos via Composio's logo CDN — same pattern KnowledgeFragments
// uses, so the source windows feel like authentic app screenshots.
const LOGO = (slug: string) => `https://logos.composio.dev/api/${slug}`;

const ELEV_LIGHT =
	"0 0 0 1px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)";
const ELEV_DARK =
	"0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.35)";

// "Missing" tone — Claude wrote around the point. The sentence exists but
// it never reaches for the actual fact. Amber reads as "incomplete."
const ATTN = "#E1A33B";
const ATTN_SOFT = "rgba(225,163,59,0.18)";
const ATTN_DARK = "#5C3A08";

// "Correct" tone — Claude pulled the right value cleanly from the source.
const OK = "#16A34A";
const OK_SOFT = "rgba(22,163,74,0.14)";
const OK_DARK = "#14532D";

// "Incorrect" tone — Claude wrote a confident value that contradicts the
// source of truth. Red reads as a hard flag.
const ERR = "#DC2626";
const ERR_SOFT = "rgba(220,38,38,0.14)";
const ERR_DARK = "#7F1D1D";

const CLAUDE = "#D97757";

/* ───────────────────────────── Stage layout ───────────────────────────── */

const STAGE_W = 1100;
const STAGE_H = 500;

const DOC = { x: 380, y: 25, w: 400, h: 460 } as const;
const POSTHOG = { x: 30, y: 25, w: 270, h: 175 } as const;
const SALESFORCE = { x: 800, y: 25, w: 270, h: 175 } as const;
// DB matches the other source heights but sits a touch lower so the doc has
// vertical room for intro + body + outro before the DB card overlaps it.
const DB = { x: 30, y: 335, w: 380, h: 160 } as const;

const SOURCE_EXITS = {
	posthog: { x: POSTHOG.x + POSTHOG.w, y: POSTHOG.y + POSTHOG.h - 30 },
	salesforce: { x: SALESFORCE.x, y: SALESFORCE.y + SALESFORCE.h - 30 },
	db: { x: DB.x + 220, y: DB.y },
} as const;

type BracketKey = "posthog" | "salesforce" | "db";

const BRACKETS_FALLBACK: Record<BracketKey, { x: number; y: number }> = {
	posthog: { x: DOC.x + 170, y: DOC.y + 240 },
	salesforce: { x: DOC.x + 158, y: DOC.y + 280 },
	db: { x: DOC.x + 130, y: DOC.y + 320 },
};

// Claude types the entire document. Three body sentences, three failure
// modes:
//   - factual + correct  → pulled the right value from the source
//   - factual + incorrect → hallucinated a value that contradicts the source
//   - vague (missing)    → wrote a sentence that walked around the point
//                          entirely; the source has the real fact but the
//                          sentence never reaches for it
type Status = "correct" | "incorrect" | "missing";

type Para =
	| { kind: "intro"; text: string }
	| { kind: "outro"; text: string }
	| {
			kind: "body";
			variant: "factual";
			pre: string;
			bracket: BracketKey;
			post: string;
			value: string;
			status: "correct" | "incorrect";
		}
	| {
			kind: "body";
			variant: "vague";
			text: string;
			bracket: BracketKey;
			status: "missing";
		};

const PARAS: Para[] = [
	{
		kind: "intro",
		text: "Renewal-cycle synthesis pulled from product, pipeline, and provisioning data.",
	},
	{
		kind: "body",
		variant: "factual",
		pre: "Daily active users grew",
		bracket: "posthog",
		post: " in the last 30 days.",
		value: "312%",
		status: "correct",
	},
	{
		kind: "body",
		variant: "factual",
		pre: "Pipeline still stuck in",
		bracket: "salesforce",
		post: " stage since August.",
		value: "Discovery",
		status: "incorrect",
	},
	{
		kind: "body",
		variant: "vague",
		text: "Provisioning rollout is broadly on track.",
		bracket: "db",
		status: "missing",
	},
	{
		kind: "outro",
		text: "Risk profile: green. Recommendation: proceed with the standard renewal.",
	},
];

const STATUS_BY_BRACKET: Record<BracketKey, Status> = (() => {
	const out: Record<BracketKey, Status> = {
		posthog: "missing",
		salesforce: "missing",
		db: "missing",
	};
	for (const p of PARAS) {
		if (p.kind === "body") out[p.bracket] = p.status;
	}
	return out;
})();

const DOC_DELAY = 0.15;
// Each source window slides in only after Claude finishes its sentence.
// SOURCE_REVEAL = the time the window takes to land; the arc waits for that
// before tracing so the source has settled into place.
const SOURCE_REVEAL = 0.45;
const ARC_DURATION = 0.55;
const BADGE_AFTER_ARC = 0.05;

/* ───────────────────────────── Slide ───────────────────────────── */

export function ContextInKnowledgeWorkSlide() {
	return (
		<DeckSlide>
			<ContextInKnowledgeWorkBody />
		</DeckSlide>
	);
}

function ContextInKnowledgeWorkBody() {
	const { isSlideActive } = useContext(SlideContext);
	const stageRef = useRef<HTMLDivElement>(null);
	const [brackets, setBrackets] =
		useState<Record<BracketKey, { x: number; y: number }>>(BRACKETS_FALLBACK);
	const [revealed, setRevealed] = useState<Record<BracketKey, boolean>>({
		posthog: false,
		salesforce: false,
		db: false,
	});
	// Highlighted = the arc has landed and we're now flagging the
	// hallucination as incorrect (flips arc + gap red).
	const [highlighted, setHighlighted] = useState<Record<BracketKey, boolean>>({
		posthog: false,
		salesforce: false,
		db: false,
	});

	const measure = useRef<() => void>(() => {});
	const handleBracketReveal = (key: BracketKey) => {
		// Source window slides in first; arc waits for it to land (see Arc's
		// `delay`); only after the arc lands does the sentence flip to status.
		setRevealed((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
		requestAnimationFrame(() => measure.current?.());
		setTimeout(
			() =>
				setHighlighted((prev) =>
					prev[key] ? prev : { ...prev, [key]: true },
				),
			(SOURCE_REVEAL + ARC_DURATION + 0.1) * 1000,
		);
	};

	measure.current = () => {
		const stage = stageRef.current;
		if (!stage) return;
		const r = stage.getBoundingClientRect();
		if (!r.width || !r.height) return;
		const sx = STAGE_W / r.width;
		const sy = STAGE_H / r.height;
		setBrackets((prev) => {
			const next = { ...prev };
			(["posthog", "salesforce", "db"] as BracketKey[]).forEach((key) => {
				const el = stage.querySelector(
					`[data-bracket="${key}"]`,
				) as HTMLElement | null;
				if (!el) return;
				const br = el.getBoundingClientRect();
				next[key] = {
					x: (br.left + br.width / 2 - r.left) * sx,
					y: (br.top + br.height / 2 - r.top) * sy,
				};
			});
			return next;
		});
	};

	useLayoutEffect(() => {
		measure.current?.();
		const id = requestAnimationFrame(() => measure.current?.());
		return () => cancelAnimationFrame(id);
	}, [isSlideActive, revealed]);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const anyDoc = document as unknown as {
			fonts?: { ready?: Promise<unknown> };
		};
		anyDoc.fonts?.ready?.then(() => measure.current?.());
	}, []);

	// Reset reveal + highlight state when the slide deactivates so the
	// animation replays cleanly next time it's shown.
	useEffect(() => {
		if (!isSlideActive) {
			setRevealed({ posthog: false, salesforce: false, db: false });
			setHighlighted({ posthog: false, salesforce: false, db: false });
		}
	}, [isSlideActive]);

	return (
		<>
			<div
				className="relative flex flex-1 items-center justify-center"
				style={{
					fontFamily: SANS,
					WebkitFontSmoothing: "antialiased",
					MozOsxFontSmoothing: "grayscale",
				}}
			>
				<div
					ref={stageRef}
					className="relative"
					style={{ width: STAGE_W, height: STAGE_H }}
				>
					{/* Top sources — back layer. Each window appears only when
					    Claude has finished typing its corresponding sentence. */}
					<PositionedSource
						box={POSTHOG}
						delay={0}
						isActive={revealed.posthog}
					>
						<PostHogCard />
					</PositionedSource>
					<PositionedSource
						box={SALESFORCE}
						delay={0}
						isActive={revealed.salesforce}
					>
						<SalesforceCard />
					</PositionedSource>

					{/* Doc — sits above top sources */}
					<motion.div
						className="absolute overflow-hidden"
						style={{
							left: DOC.x,
							top: DOC.y,
							width: DOC.w,
							height: DOC.h,
							background: "#ffffff",
							color: "#37352F",
							borderRadius: 8,
							boxShadow: ELEV_LIGHT,
						}}
						initial={{ opacity: 0, y: 14 }}
						animate={
							isSlideActive
								? { opacity: 1, y: 0 }
								: { opacity: 0, y: 14 }
						}
						transition={{
							duration: 0.5,
							ease: [0.16, 1, 0.3, 1],
							delay: isSlideActive ? DOC_DELAY : 0,
						}}
					>
						<NotionPage
							isActive={isSlideActive}
							onBracketReveal={handleBracketReveal}
							highlighted={highlighted}
						/>
					</motion.div>

					{/* DB on top of doc so its SQL editor stays visible in the
					    overlap region. Also gated on its sentence finishing. */}
					<PositionedSource
						box={DB}
						delay={0}
						isActive={revealed.db}
					>
						<PostgresCard />
					</PositionedSource>

					{/* Dashed arcs — above doc + DB so the line stays visible from
					    the source through to the value Claude wrote. Each arc
					    flips red once it lands at the gap. */}
					<svg
						className="absolute inset-0"
						viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
						style={{ width: "100%", height: "100%", pointerEvents: "none" }}
					>
						<Arc
							from={SOURCE_EXITS.posthog}
							to={brackets.posthog}
							curveDir="down"
							status={STATUS_BY_BRACKET.posthog}
							isActive={revealed.posthog}
							highlighted={highlighted.posthog}
						/>
						<Arc
							from={SOURCE_EXITS.salesforce}
							to={brackets.salesforce}
							curveDir="down"
							status={STATUS_BY_BRACKET.salesforce}
							isActive={revealed.salesforce}
							highlighted={highlighted.salesforce}
						/>
						<Arc
							from={SOURCE_EXITS.db}
							to={brackets.db}
							curveDir="up"
							status={STATUS_BY_BRACKET.db}
							isActive={revealed.db}
							highlighted={highlighted.db}
						/>
					</svg>

					{/* Status chip drops next to each bracket — "Correct" in green
					    or "Missing" in amber depending on the bracket's status. */}
					<StatusChip
						position={brackets.posthog}
						status={STATUS_BY_BRACKET.posthog}
						isActive={highlighted.posthog}
					/>
					<StatusChip
						position={brackets.salesforce}
						status={STATUS_BY_BRACKET.salesforce}
						isActive={highlighted.salesforce}
					/>
					<StatusChip
						position={brackets.db}
						status={STATUS_BY_BRACKET.db}
						isActive={highlighted.db}
					/>
				</div>
			</div>

			<Notes>
				Claude drafts the customer brief and keeps hitting gaps — usage,
				deal stage, active seats — that live in PostHog, Salesforce, and
				the database. The synthesis lives in a human&apos;s head, not in
				any one tool, so the agent can&apos;t reach it.
			</Notes>
		</>
	);
}

/* ───────────────────────────── Notion page ───────────────────────────── */

const N = {
	text: "#37352F",
	textMuted: "rgba(55,53,47,0.65)",
	textVeryMuted: "rgba(55,53,47,0.45)",
	divider: "rgba(55,53,47,0.09)",
	inlineCodeBg: "#F7F6F3",
} as const;

function NotionPage({
	isActive,
	onBracketReveal,
	highlighted,
}: {
	isActive: boolean;
	onBracketReveal: (key: BracketKey) => void;
	highlighted: Record<BracketKey, boolean>;
}) {
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{
				color: N.text,
				background: "#ffffff",
				fontFamily: SANS,
			}}
		>
			{/* Top bar */}
			<div
				className="flex h-[34px] shrink-0 items-center gap-1.5 px-3"
				style={{ boxShadow: `inset 0 -1px 0 ${N.divider}` }}
			>
				<div
					className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[11.5px]"
					style={{ color: N.textMuted, letterSpacing: "-0.005em" }}
				>
					<span aria-hidden>🏢</span>
					<span>Customers</span>
					<ChevronRight
						size={11}
						style={{ color: N.textVeryMuted }}
						strokeWidth={2.2}
					/>
					<span style={{ color: N.text, fontWeight: 500 }}>ACME Corp</span>
				</div>
				<div
					className="flex items-center gap-3"
					style={{ color: N.textMuted }}
				>
					<Share2 size={13} strokeWidth={1.9} />
					<MessageSquare size={13} strokeWidth={1.9} />
					<Star size={13} strokeWidth={1.9} />
					<MoreHorizontal size={13} strokeWidth={1.9} />
				</div>
			</div>

			{/* Body */}
			<div className="flex flex-1 flex-col overflow-hidden px-9 pt-5">
				<div className="text-[30px] leading-[1] select-none" aria-hidden>
					🏢
				</div>
				<h1
					className="mt-2 text-[22px] font-bold text-balance"
					style={{
						color: N.text,
						letterSpacing: "-0.018em",
						lineHeight: 1.15,
					}}
				>
					ACME Corp — Q4 customer brief
				</h1>

				{/* Properties — collapsed to a single inline row */}
				<div
					className="mt-2 flex items-center gap-2 text-[11.5px]"
					style={{ color: N.textMuted }}
				>
					<OwnerBadge name="Alice Wu" />
					<span style={{ color: N.textVeryMuted }}>·</span>
					<StatusPill label="Drafting" />
					<span style={{ color: N.textVeryMuted }}>·</span>
					<span>Renewals · Q4 ’26</span>
				</div>

				<div
					className="mt-3 h-px shrink-0"
					style={{ background: N.divider }}
				/>

				{/* Typewriter owns the entire doc body — intro, the three
				    bracketed body sentences, and the outro all flow through it. */}
				<TypewriterBody
					isActive={isActive}
					onBracketReveal={onBracketReveal}
					highlighted={highlighted}
				/>
			</div>
		</div>
	);
}

type Progress =
	| { kind: "idle" }
	| {
			kind: "active";
			paraIdx: number;
			chars: number;
			bracketShown: boolean;
	  };

const FAST_CHAR_DELAY = 14; // intro / outro: rip through it
const BODY_CHAR_DELAY = 32; // body sentences: deliberate

function TypewriterBody({
	isActive,
	onBracketReveal,
	highlighted,
}: {
	isActive: boolean;
	onBracketReveal: (key: BracketKey) => void;
	highlighted: Record<BracketKey, boolean>;
}) {
	const [progress, setProgress] = useState<Progress>({ kind: "idle" });
	const [done, setDone] = useState<Set<number>>(new Set());

	const onBracketRevealRef = useRef(onBracketReveal);
	useEffect(() => {
		onBracketRevealRef.current = onBracketReveal;
	}, [onBracketReveal]);

	useEffect(() => {
		if (!isActive) {
			setProgress({ kind: "idle" });
			setDone(new Set());
			return;
		}

		let cancelled = false;
		const timers: ReturnType<typeof setTimeout>[] = [];
		const at = (delay: number, fn: () => void) => {
			timers.push(
				setTimeout(() => {
					if (!cancelled) fn();
				}, delay),
			);
		};

		let t = 700;

		PARAS.forEach((para, idx) => {
			if (para.kind === "intro" || para.kind === "outro") {
				const text = para.text;
				at(t, () =>
					setProgress({
						kind: "active",
						paraIdx: idx,
						chars: 0,
						bracketShown: false,
					}),
				);
				for (let i = 1; i <= text.length; i++) {
					t += FAST_CHAR_DELAY;
					at(t, () =>
						setProgress({
							kind: "active",
							paraIdx: idx,
							chars: i,
							bracketShown: false,
						}),
					);
				}
				t += 180;
				at(t, () =>
					setDone((prev) => {
						const next = new Set(prev);
						next.add(idx);
						return next;
					}),
				);
				t += 120;
				return;
			}

			// body paragraph
			if (para.variant === "vague") {
				// Vague: type the whole sentence straight through, no bracket.
				const text = para.text;
				at(t, () =>
					setProgress({
						kind: "active",
						paraIdx: idx,
						chars: 0,
						bracketShown: false,
					}),
				);
				for (let i = 1; i <= text.length; i++) {
					t += BODY_CHAR_DELAY;
					at(t, () =>
						setProgress({
							kind: "active",
							paraIdx: idx,
							chars: i,
							bracketShown: false,
						}),
					);
				}
				t += 200;
				at(t, () =>
					setDone((prev) => {
						const next = new Set(prev);
						next.add(idx);
						return next;
					}),
				);
				t += 80;
				at(t, () => onBracketRevealRef.current(para.bracket));
				// hold for source slide-in + arc trace + highlight before
				// starting the next paragraph
				t += 1400;
				return;
			}

			// Factual: type pre, pause, drop bracket, type post.
			at(t, () =>
				setProgress({
					kind: "active",
					paraIdx: idx,
					chars: 0,
					bracketShown: false,
				}),
			);
			for (let i = 1; i <= para.pre.length; i++) {
				t += BODY_CHAR_DELAY;
				at(t, () =>
					setProgress({
						kind: "active",
						paraIdx: idx,
						chars: i,
						bracketShown: false,
					}),
				);
			}
			// brief pause at the bracket position, cursor blinks
			t += 220;
			at(t, () =>
				setProgress({
					kind: "active",
					paraIdx: idx,
					chars: para.pre.length,
					bracketShown: true,
				}),
			);
			// hold for the bracket pop-in
			t += 260;
			for (let i = 1; i <= para.post.length; i++) {
				t += BODY_CHAR_DELAY;
				at(t, () =>
					setProgress({
						kind: "active",
						paraIdx: idx,
						chars: para.pre.length + i,
						bracketShown: true,
					}),
				);
			}
			// settle, then mark done so the next paragraph can start typing
			t += 200;
			at(t, () =>
				setDone((prev) => {
					const next = new Set(prev);
					next.add(idx);
					return next;
				}),
			);
			// arc reveal — parent will slide the source in, trace the arc,
			// then flip the sentence to its status colour
			t += 80;
			at(t, () => onBracketRevealRef.current(para.bracket));
			t += 1400;
		});

		at(t, () => setProgress({ kind: "idle" }));

		return () => {
			cancelled = true;
			timers.forEach(clearTimeout);
		};
	}, [isActive]);

	return (
		<div
			className="mt-3 flex flex-col gap-2 text-[12.5px]"
			style={{
				color: N.text,
				lineHeight: 1.55,
				letterSpacing: "-0.003em",
			}}
		>
			{PARAS.map((para, idx) => {
				const isDone = done.has(idx);
				const isActiveLine =
					progress.kind === "active" && progress.paraIdx === idx;
				if (!isDone && !isActiveLine) return null;

				if (para.kind === "intro" || para.kind === "outro") {
					const text = isDone
						? para.text
						: para.text.slice(
								0,
								progress.kind === "active" ? progress.chars : 0,
							);
					return (
						<p
							key={idx}
							style={{
								textWrap: "pretty",
								color: para.kind === "outro" ? N.text : N.textMuted,
							}}
						>
							{text}
							{isActiveLine && !isDone ? <TypingMarker /> : null}
						</p>
					);
				}

				// body paragraph — branches on factual vs vague
				const isHighlighted = highlighted[para.bracket];

				if (para.variant === "vague") {
					const text = isDone
						? para.text
						: progress.kind === "active"
							? para.text.slice(0, progress.chars)
							: "";
					const cursorActive = isActiveLine && !isDone;
					return (
						<BodyParagraph
							key={idx}
							highlighted={isHighlighted}
							status={para.status}
						>
							{text}
							{cursorActive ? <TypingMarker /> : null}
							{/* Invisible anchor — gives the arc + status chip a
							    measurable endpoint at the end of the sentence
							    so the audience sees them aimed at this line. */}
							<VagueAnchor bracketKey={para.bracket} visible={isDone} />
						</BodyParagraph>
					);
				}

				const showBracket =
					isDone ||
					(isActiveLine &&
						progress.kind === "active" &&
						progress.bracketShown);
				const preChars = isDone
					? para.pre.length
					: progress.kind === "active"
						? Math.min(progress.chars, para.pre.length)
						: 0;
				const postChars =
					isDone
						? para.post.length
						: progress.kind === "active"
							? Math.max(0, progress.chars - para.pre.length)
							: 0;
				const cursorInPre =
					isActiveLine && !isDone && preChars < para.pre.length;
				const cursorAtGap =
					isActiveLine &&
					!isDone &&
					preChars === para.pre.length &&
					!showBracket;
				const cursorInPost =
					isActiveLine && !isDone && showBracket && !cursorAtGap;

				return (
					<BodyParagraph
						key={idx}
						highlighted={isHighlighted}
						status={para.status}
					>
						{para.pre.slice(0, preChars)}
						{cursorInPre ? <TypingMarker /> : null}
						{cursorAtGap ? (
							<>
								{" "}
								<TypingMarker />
							</>
						) : null}
						{showBracket ? (
							<>
								{" "}
								<InlineGap
									bracketKey={para.bracket}
									lit
									highlighted={isHighlighted}
									status={para.status}
									value={para.value}
								/>
							</>
						) : null}
						{showBracket ? para.post.slice(0, postChars) : null}
						{cursorInPost ? <TypingMarker /> : null}
					</BodyParagraph>
				);
			})}
		</div>
	);
}

// Wraps a body sentence and tints it once the arc lands. Soft green for
// correct, soft red for incorrect, soft amber for missing. Background only —
// no left bar.
function BodyParagraph({
	children,
	highlighted,
	status,
}: {
	children: React.ReactNode;
	highlighted: boolean;
	status: Status;
}) {
	const bg =
		status === "correct" ? OK_SOFT : status === "incorrect" ? ERR_SOFT : ATTN_SOFT;
	return (
		<motion.div
			className="relative"
			style={{
				marginInline: -8,
				padding: "3px 8px",
				borderRadius: 4,
				textWrap: "pretty" as const,
			}}
			initial={{ background: "rgba(0,0,0,0)" }}
			animate={{
				background: highlighted ? bg : "rgba(0,0,0,0)",
			}}
			transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.div>
	);
}

function TypingMarker() {
	return (
		<span
			className="inline-flex items-center align-baseline"
			style={{ gap: 3, marginLeft: 1 }}
		>
			<motion.span
				aria-hidden
				className="inline-block"
				style={{
					width: 1.5,
					height: 14,
					background: CLAUDE,
					borderRadius: 0.5,
					transform: "translateY(2px)",
				}}
				animate={{ opacity: [1, 1, 0, 0] }}
				transition={{
					duration: 0.95,
					ease: "linear",
					times: [0, 0.5, 0.5, 1],
					repeat: Infinity,
				}}
			/>
			<ClaudeLogo size={12} />
		</span>
	);
}

// Real Anthropic Claude mark, sourced from public/images/clients/claude.svg.
function ClaudeLogo({ size = 12 }: { size?: number }) {
	return (
		<span
			aria-hidden
			className="inline-flex"
			style={{ width: size, height: size, transform: "translateY(2px)" }}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src="/images/clients/claude.svg"
				alt=""
				width={size}
				height={size}
				style={{ display: "block", width: size, height: size }}
			/>
		</span>
	);
}

function OwnerBadge({ name }: { name: string }) {
	return (
		<span className="inline-flex items-center gap-1.5">
			<span
				className="flex size-[16px] items-center justify-center rounded-full text-[9px] font-semibold text-white"
				style={{
					background: "#5C8DC9",
					boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
				}}
			>
				{name[0]}
			</span>
			<span>{name}</span>
		</span>
	);
}

function StatusPill({ label }: { label: string }) {
	return (
		<span
			className="inline-flex items-center gap-1 rounded-sm px-1.5 py-[1px] text-[10.5px]"
			style={{ background: "#FDECC8", color: "#7A4D0A" }}
		>
			<span
				className="size-[6px] rounded-full"
				style={{ background: "#C28A2A" }}
			/>
			{label}
		</span>
	);
}

// Invisible anchor at the end of a vague sentence — gives the arc + status
// chip a measurable endpoint without rendering a visible pill.
function VagueAnchor({
	bracketKey,
	visible,
}: {
	bracketKey: BracketKey;
	visible: boolean;
}) {
	return (
		<span
			data-bracket={visible ? bracketKey : undefined}
			aria-hidden
			style={{
				display: "inline-block",
				width: 1,
				height: 1,
				marginLeft: 2,
				verticalAlign: "baseline",
			}}
		/>
	);
}

// Inline slot in the body sentence. Three states:
//   1) hidden — bracket not yet typed
//   2) lit (neutral amber) — value just appeared, arc tracing
//   3) highlighted — arc landed; colour is decided by status (green or red)
function InlineGap({
	bracketKey,
	lit,
	highlighted,
	status,
	value,
}: {
	bracketKey: BracketKey;
	lit: boolean;
	highlighted: boolean;
	status: "correct" | "incorrect";
	value: string;
}) {
	const finalBg = status === "correct" ? OK_SOFT : ERR_SOFT;
	const finalStroke = status === "correct" ? OK : ERR;
	const finalText = status === "correct" ? OK_DARK : ERR_DARK;

	const target = highlighted
		? {
				scale: 1,
				opacity: 1,
				background: finalBg,
				boxShadow: `inset 0 0 0 1.5px ${finalStroke}`,
				color: finalText,
			}
		: lit
			? {
					scale: 1,
					opacity: 1,
					background: ATTN_SOFT,
					boxShadow: `inset 0 0 0 1px ${ATTN}`,
					color: ATTN_DARK,
				}
			: {
					scale: 0.7,
					opacity: 0,
					background: N.inlineCodeBg,
					boxShadow: "inset 0 0 0 1px transparent",
					color: "transparent",
				};
	return (
		<motion.span
			data-bracket={bracketKey}
			className="inline-flex items-center justify-center align-baseline"
			style={{
				minWidth: 30,
				height: 18,
				padding: "0 6px",
				borderRadius: 3,
				fontFamily: MONO,
				fontSize: 11,
				lineHeight: 1,
				fontWeight: 600,
				fontVariantNumeric: "tabular-nums",
			}}
			initial={{
				scale: 0.7,
				opacity: 0,
				background: ATTN_SOFT,
				boxShadow: `inset 0 0 0 1px ${ATTN}`,
				color: "transparent",
			}}
			animate={target}
			transition={{ duration: 0.3, ease: [0.22, 1.4, 0.36, 1] }}
		>
			{value}
		</motion.span>
	);
}

/* ───────────────────────────── Arc + badges ───────────────────────────── */

function Arc({
	from,
	to,
	curveDir,
	status,
	isActive,
	highlighted,
}: {
	from: { x: number; y: number };
	to: { x: number; y: number };
	curveDir: "up" | "down";
	status: Status;
	isActive: boolean;
	highlighted: boolean;
}) {
	const mx = (from.x + to.x) / 2;
	const my = (from.y + to.y) / 2;
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const len = Math.max(1, Math.hypot(dx, dy));
	let nx = -dy / len;
	let ny = dx / len;
	if (curveDir === "up") {
		nx = -nx;
		ny = -ny;
	}
	const BOW = 56;
	const cx = mx + nx * BOW;
	const cy = my + ny * BOW;
	const path = `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`;

	// Once the arc lands, take the status colour. Until then, neutral amber
	// for the trace-in motion.
	const landedColor =
		status === "correct" ? OK : status === "incorrect" ? ERR : ATTN;

	return (
		<motion.path
			d={path}
			fill="none"
			strokeWidth={highlighted ? 1.6 : 1.3}
			strokeDasharray="4 4"
			strokeLinecap="round"
			initial={{ pathLength: 0, opacity: 0, stroke: ATTN }}
			animate={
				highlighted
					? { pathLength: 1, opacity: 1, stroke: landedColor }
					: isActive
						? { pathLength: 1, opacity: 0.9, stroke: ATTN }
						: { pathLength: 0, opacity: 0, stroke: ATTN }
			}
			transition={{
				duration: ARC_DURATION,
				ease: [0.22, 1, 0.36, 1],
				// Wait for the source window to land before the arc starts
				// tracing — otherwise the line draws from a card that hasn't
				// finished sliding in.
				delay: isActive && !highlighted ? SOURCE_REVEAL : 0,
			}}
		/>
	);
}

// Status tag that anchors the flag at the bracket — green "Correct", red
// "Incorrect", or amber "Missed". Sits just above and to the right of the
// inline gap (or, for vague paragraphs, the end of the sentence) once the
// arc has landed.
function StatusChip({
	position,
	status,
	isActive,
}: {
	position: { x: number; y: number };
	status: Status;
	isActive: boolean;
}) {
	const bg =
		status === "correct" ? OK : status === "incorrect" ? ERR : ATTN;
	const text =
		status === "correct"
			? "Correct"
			: status === "incorrect"
				? "Incorrect"
				: "Missed";
	const glyph =
		status === "correct" ? "✓" : status === "incorrect" ? "✕" : "!";
	return (
		<motion.div
			className="absolute inline-flex items-center gap-0.5 rounded-sm"
			style={{
				left: position.x + 22,
				top: position.y,
				marginTop: -10,
				padding: "1px 5px",
				background: bg,
				color: "#FFFFFF",
				fontSize: 9,
				fontWeight: 700,
				letterSpacing: "0.04em",
				fontFamily: SANS,
				textTransform: "uppercase",
				boxShadow: "0 0 0 2px #ffffff",
				pointerEvents: "none",
			}}
			initial={{ scale: 0.6, opacity: 0, y: -4 }}
			animate={
				isActive
					? { scale: 1, opacity: 1, y: 0 }
					: { scale: 0.6, opacity: 0, y: -4 }
			}
			transition={{
				duration: 0.28,
				ease: [0.22, 1.4, 0.36, 1],
				delay: isActive ? 0.05 : 0,
			}}
		>
			{glyph} {text}
		</motion.div>
	);
}

/* ───────────────────────────── Source positioner ──────────────────────── */

function PositionedSource({
	box,
	delay,
	isActive,
	children,
}: {
	box: { x: number; y: number; w: number; h: number };
	delay: number;
	isActive: boolean;
	children: React.ReactNode;
}) {
	return (
		<motion.div
			className="absolute overflow-hidden"
			style={{
				left: box.x,
				top: box.y,
				width: box.w,
				height: box.h,
				borderRadius: 8,
				// Layered drop shadow — downward offset for depth, not a halo.
				// Dark deck bg means we need real opacity to read.
				boxShadow:
					"0 18px 36px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.38), 0 0 0 1px rgba(0,0,0,0.4)",
			}}
			initial={{ opacity: 0, y: 12 }}
			animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
			transition={{
				duration: 0.45,
				ease: [0.16, 1, 0.3, 1],
				delay: isActive ? delay : 0,
			}}
		>
			{children}
		</motion.div>
	);
}

/* ───────────────────────────── PostHog (light) ───────────────────────── */

const PH = {
	bg: "#FFFFFF",
	chrome: "#FAFAF9",
	text: "#0A0A0A",
	muted: "#71717A",
	border: "rgba(15,23,42,0.08)",
	yellow: "#F9BD2B",
	green: "#1A7F37",
	greenSoft: "#DAFBE1",
} as const;

function PostHogCard() {
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{
				background: PH.bg,
				color: PH.text,
				fontFamily: SANS,
				boxShadow: ELEV_LIGHT,
				borderRadius: 8,
			}}
		>
			<div
				className="flex items-center gap-1.5 px-3 py-2"
				style={{
					background: PH.chrome,
					boxShadow: `inset 0 -1px 0 ${PH.border}`,
				}}
			>
				<BrandLogo slug="posthog" size={14} />
				<span
					className="text-[11px] font-semibold"
					style={{ letterSpacing: "-0.01em" }}
				>
					PostHog
				</span>
				<span
					className="text-[10.5px]"
					style={{ color: PH.muted, letterSpacing: "-0.005em" }}
				>
					/ Insights / DAU
				</span>
				<button
					className="ml-auto inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px]"
					style={{
						color: PH.muted,
						boxShadow: `inset 0 0 0 1px ${PH.border}`,
					}}
				>
					Last 30d
					<ChevronDown size={10} strokeWidth={2.2} />
				</button>
			</div>
			<div className="flex flex-1 flex-col px-3 pt-2 pb-1.5">
				<div
					className="text-[10px] font-medium uppercase"
					style={{ color: PH.muted, letterSpacing: "0.06em" }}
				>
					Daily active users · ACME Corp
				</div>
				<div className="mt-1 flex items-baseline gap-2">
					<span
						className="text-[26px] font-semibold leading-none"
						style={{
							color: PH.text,
							fontVariantNumeric: "tabular-nums",
							letterSpacing: "-0.025em",
						}}
					>
						147
					</span>
					<span
						className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-[1px] text-[10px] font-semibold"
						style={{
							background: PH.greenSoft,
							color: PH.green,
							fontVariantNumeric: "tabular-nums",
						}}
					>
						↑ 312%
					</span>
					<span
						className="text-[10px]"
						style={{ color: PH.muted, letterSpacing: "-0.005em" }}
					>
						vs prev 30d
					</span>
				</div>
				<div className="relative mt-1.5 flex-1">
					<svg
						viewBox="0 0 240 56"
						className="absolute inset-0"
						preserveAspectRatio="none"
						style={{ width: "100%", height: "100%" }}
					>
						<defs>
							<linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={PH.yellow} stopOpacity="0.28" />
								<stop offset="100%" stopColor={PH.yellow} stopOpacity="0" />
							</linearGradient>
						</defs>
						<line
							x1="0"
							x2="240"
							y1="44"
							y2="44"
							stroke="rgba(15,23,42,0.06)"
							strokeWidth="1"
							strokeDasharray="2 3"
						/>
						<path
							d="M0,50 L24,48 L48,47 L72,44 L96,40 L120,33 L144,24 L168,15 L192,9 L216,5 L240,3 L240,56 L0,56 Z"
							fill="url(#ph-fill)"
						/>
						<path
							d="M0,50 L24,48 L48,47 L72,44 L96,40 L120,33 L144,24 L168,15 L192,9 L216,5 L240,3"
							stroke={PH.yellow}
							strokeWidth="1.75"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<circle cx="240" cy="3" r="2.5" fill={PH.yellow} />
						<circle cx="240" cy="3" r="4.5" fill={PH.yellow} fillOpacity="0.25" />
					</svg>
				</div>
				<div
					className="flex items-center justify-between text-[9.5px]"
					style={{
						color: PH.muted,
						fontVariantNumeric: "tabular-nums",
						letterSpacing: "-0.005em",
					}}
				>
					<span>Sep 1</span>
					<span>Sep 15</span>
					<span>Sep 30</span>
				</div>
			</div>
		</div>
	);
}

/* ───────────────────────────── Salesforce (light) ────────────────────── */

const SF = {
	bg: "#FFFFFF",
	chrome: "#032D60",
	border: "rgba(15,23,42,0.08)",
	text: "#181818",
	muted: "#5C5C5C",
	link: "#0176D3",
	pathDone: "#2E844A",
	pathActive: "#1AB9FF",
	pathRest: "#ECEBEA",
	pathRestText: "#5C5C5C",
} as const;

function SalesforceCard() {
	const stages = [
		{ name: "Discovery", done: true },
		{ name: "Qualify", done: true },
		{ name: "Propose", done: true },
		{ name: "Negotiate", active: true },
		{ name: "Closed Won" },
	];
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{
				background: SF.bg,
				color: SF.text,
				fontFamily: SANS,
				boxShadow: ELEV_LIGHT,
				borderRadius: 8,
			}}
		>
			<div
				className="flex items-center gap-1.5 px-3 py-2 text-white"
				style={{ background: SF.chrome }}
			>
				<BrandLogo slug="salesforce" size={16} />
				<span
					className="text-[11px] font-semibold"
					style={{ letterSpacing: "-0.01em" }}
				>
					Sales Cloud
				</span>
				<span className="text-[10.5px] opacity-65">/ Opportunities</span>
				<Search size={11} className="ml-auto opacity-70" strokeWidth={2.2} />
			</div>
			<div className="flex items-center px-2.5 pt-2" style={{ background: SF.bg }}>
				{stages.map((s, i) => {
					const bg = s.active
						? SF.pathActive
						: s.done
							? SF.pathDone
							: SF.pathRest;
					const color = s.active || s.done ? "#FFFFFF" : SF.pathRestText;
					return (
						<div
							key={s.name}
							className="relative px-1 py-1 text-center text-[8.5px] font-bold uppercase"
							style={{
								background: bg,
								color,
								letterSpacing: "0.04em",
								// Only the active stage shows a label — let it grow
								// to take the rest of the row so "Negotiate" isn't
								// truncated. Other stages are chevron indicators at
								// a fixed compact width.
								flex: s.active ? "1 1 auto" : "0 0 auto",
								minWidth: s.active ? 0 : 26,
								whiteSpace: "nowrap",
								overflow: "hidden",
								clipPath:
									i === stages.length - 1
										? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 6px 50%)"
										: i === 0
											? "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)"
											: "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)",
							}}
						>
							{s.active ? s.name : null}
						</div>
					);
				})}
			</div>
			<div className="flex flex-1 flex-col px-3 pt-2.5">
				<div className="flex items-center gap-2">
					<div
						className="flex size-7 items-center justify-center rounded-sm font-bold text-white"
						style={{
							background: SF.link,
							fontSize: 13,
							boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
						}}
					>
						$
					</div>
					<div className="min-w-0 flex-1">
						<div
							className="text-[8.5px] font-semibold uppercase"
							style={{ color: SF.muted, letterSpacing: "0.06em" }}
						>
							Opportunity
						</div>
						<div
							className="truncate text-[12px] font-semibold"
							style={{ color: SF.link, letterSpacing: "-0.01em" }}
						>
							ACME Corp — Platform Rollout
						</div>
					</div>
				</div>
				<div className="mt-2 h-px" style={{ background: SF.border }} />
				<div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1">
					<SfKv k="Amount" v="$250K" />
					<SfKv k="Close" v="Q4 ’26" />
					<SfKv k="Owner" v="A. Wu" />
				</div>
			</div>
		</div>
	);
}

function SfKv({ k, v }: { k: string; v: string }) {
	return (
		<div className="flex flex-col leading-tight">
			<span
				className="text-[8.5px] font-semibold uppercase"
				style={{ color: SF.muted, letterSpacing: "0.06em" }}
			>
				{k}
			</span>
			<span
				className="text-[11px] font-medium"
				style={{
					color: SF.text,
					fontVariantNumeric: "tabular-nums",
					letterSpacing: "-0.005em",
				}}
			>
				{v}
			</span>
		</div>
	);
}

/* ───────────────────────────── Postgres (dark editor) ────────────────── */

const PG = {
	bg: "#1E1E1E",
	chrome: "#252526",
	border: "rgba(255,255,255,0.07)",
	text: "#D4D4D4",
	muted: "#858585",
	keyword: "#569CD6",
	fn: "#DCDCAA",
	string: "#CE9178",
	number: "#B5CEA8",
	gutter: "#5A5A5A",
	accent: "#75BEFF",
} as const;

function PostgresCard() {
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{
				background: PG.bg,
				color: PG.text,
				fontFamily: SANS,
				boxShadow: ELEV_DARK,
				borderRadius: 8,
			}}
		>
			<div
				className="flex items-center"
				style={{
					background: PG.chrome,
					boxShadow: `inset 0 -1px 0 ${PG.border}`,
				}}
			>
				<div
					className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10.5px]"
					style={{
						background: PG.bg,
						color: PG.text,
						boxShadow: `inset 0 1px 0 ${PG.accent}`,
					}}
				>
					<BrandLogo slug="postgres" size={14} />
					<span style={{ letterSpacing: "-0.005em" }}>acme_production</span>
					<span className="opacity-50">·</span>
					<span style={{ color: PG.muted }}>query.sql</span>
				</div>
				<span
					className="ml-auto mr-2.5 inline-flex items-center gap-1 text-[9.5px]"
					style={{
						color: PG.muted,
						fontVariantNumeric: "tabular-nums",
						letterSpacing: "-0.005em",
					}}
				>
					<span
						className="size-[6px] rounded-full"
						style={{ background: "#3FB950" }}
					/>
					1 row · 12 ms
				</span>
			</div>
			<div
				className="grid flex-1"
				style={{ gridTemplateColumns: "1fr 96px" }}
			>
				<div
					className="flex flex-col gap-0.5 py-1.5 pr-3"
					style={{
						fontFamily: MONO,
						fontSize: 10.5,
						lineHeight: 1.5,
					}}
				>
					<SqlLine n={1}>
						<PgKw>SELECT</PgKw> <PgFn>count</PgFn>(<PgNum>*</PgNum>){" "}
						<PgKw>FROM</PgKw> seats
					</SqlLine>
					<SqlLine n={2}>
						<PgKw>WHERE</PgKw> account_id = <PgStr>&apos;acme&apos;</PgStr>
					</SqlLine>
					<SqlLine n={3}>
						<PgKw>AND</PgKw> last_active{" "}
						<span style={{ color: PG.text }}>&gt;</span>{" "}
						<PgFn>now</PgFn>() - <PgStr>&apos;7 days&apos;</PgStr>
						<PgPunct>;</PgPunct>
					</SqlLine>
				</div>
				<div
					className="flex flex-col items-center justify-center"
					style={{
						background: "#161616",
						boxShadow: `inset 1px 0 0 ${PG.border}`,
					}}
				>
					<div
						className="text-[8.5px] font-semibold uppercase"
						style={{ color: PG.muted, letterSpacing: "0.08em" }}
					>
						count
					</div>
					<div
						className="text-[22px] font-semibold leading-none"
						style={{
							color: PG.number,
							fontVariantNumeric: "tabular-nums",
							letterSpacing: "-0.02em",
						}}
					>
						34
					</div>
				</div>
			</div>
		</div>
	);
}

function SqlLine({ n, children }: { n: number; children: React.ReactNode }) {
	return (
		<div className="flex items-baseline gap-2">
			<span
				className="w-[18px] shrink-0 text-right select-none"
				style={{
					color: PG.gutter,
					fontVariantNumeric: "tabular-nums",
					fontSize: 9.5,
				}}
			>
				{n}
			</span>
			<span>{children}</span>
		</div>
	);
}

function PgKw({ children }: { children: React.ReactNode }) {
	return <span style={{ color: PG.keyword }}>{children}</span>;
}
function PgFn({ children }: { children: React.ReactNode }) {
	return <span style={{ color: PG.fn }}>{children}</span>;
}
function PgStr({ children }: { children: React.ReactNode }) {
	return <span style={{ color: PG.string }}>{children}</span>;
}
function PgNum({ children }: { children: React.ReactNode }) {
	return <span style={{ color: PG.number }}>{children}</span>;
}
function PgPunct({ children }: { children: React.ReactNode }) {
	return <span style={{ color: PG.text }}>{children}</span>;
}

/* ───────────────────────────── Brand logo ───────────────────────────── */

function BrandLogo({ slug, size }: { slug: string; size: number }) {
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
				borderRadius: 3,
				display: "block",
				flexShrink: 0,
			}}
		/>
	);
}
