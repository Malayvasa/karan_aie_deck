"use client";

import { motion } from "framer-motion";
import {
	FileCode2,
	Network,
	type LucideIcon,
} from "lucide-react";
import { useContext, type ReactNode } from "react";
import { Notes, SlideContext } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";

// GitHub (dark) palette — matched to CodebaseBentoSlide so the two code-side
// slides read as the same surface.
const GH = {
	bg: "#0d1117",
	card: "#161b22",
	inset: "#010409",
	border: "#30363d",
	borderMuted: "#21262d",
	text: "#c9d1d9",
	textStrong: "#f0f6fc",
	muted: "#8b949e",
	link: "#2f81f7",
	success: "#3fb950",
	danger: "#f85149",
	attention: "#d29922",
	attentionSoft: "rgba(210,153,34,0.12)",
	merged: "#a371f7",
} as const;

const ENTER_LIFT = 18;

// Pacing — outline first, then content. Mirrors CodebaseBentoSlide's rhythm so
// jumping between the two code-side slides feels consistent.
const OUTLINE_FADE = 0.35;
const OUTLINE_STAGGER = 0.05;
const LEFT_CONTENT_DELAY = OUTLINE_FADE + 0.1;
const RIGHT_CONTENT_DELAY = LEFT_CONTENT_DELAY + 0.32;

// Graph internals
const NODE_STAGGER = 0.07;
const EDGE_TRACE_DURATION = 0.5;

// Snippet internals
const LINE_STAGGER = 0.05;
const DECORATOR_POP_DURATION = 0.32;

export function ContextInCodeSlide() {
	return (
		<DeckSlide primitive="context">
			<ContextInCodeBody />
		</DeckSlide>
	);
}

function ContextInCodeBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="grid w-full max-w-[1100px]"
					style={{
						gridTemplateColumns: "1fr 1fr",
						gap: 16,
						height: 470,
					}}
				>
					<ContextCard
						title="acme-co/platform · imports"
						icon={Network}
						isActive={isSlideActive}
						index={0}
						contentDelay={LEFT_CONTENT_DELAY}
					>
						<DependencyGraph isActive={isSlideActive} />
					</ContextCard>

					<ContextCard
						title="packages/api/src/customers.controller.ts"
						icon={FileCode2}
						isActive={isSlideActive}
						index={1}
						contentDelay={RIGHT_CONTENT_DELAY}
					>
						<DecoratorSnippet isActive={isSlideActive} />
					</ContextCard>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="contextInCode" />
			</Notes>
		</>
	);
}

function ContextCard({
	children,
	icon: Icon,
	title,
	isActive,
	index,
	contentDelay,
}: {
	children: ReactNode;
	icon: LucideIcon;
	title: string;
	isActive: boolean;
	index: number;
	contentDelay: number;
}) {
	const outlineDelay = isActive ? index * OUTLINE_STAGGER : 0;
	const filledDelay = isActive ? contentDelay : 0;

	return (
		<div style={{ position: "relative" }}>
			<motion.div
				className="absolute inset-0 rounded-md"
				style={{ border: `1.5px dashed ${GH.borderMuted}` }}
				initial={{ opacity: 0 }}
				animate={isActive ? { opacity: 1 } : { opacity: 0 }}
				transition={{
					duration: OUTLINE_FADE,
					ease: "easeOut",
					delay: outlineDelay,
				}}
			/>
			<motion.div
				className="absolute inset-0 flex flex-col overflow-hidden rounded-md border"
				style={{
					background: GH.card,
					borderColor: GH.border,
				}}
				initial={{ opacity: 0, y: ENTER_LIFT }}
				animate={
					isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: ENTER_LIFT }
				}
				transition={{
					duration: 0.5,
					ease: [0.34, 1.18, 0.6, 1],
					delay: filledDelay,
				}}
			>
				<div
					className="flex items-center gap-2 px-3.5 py-2.5"
					style={{
						borderBottom: `1px solid ${GH.borderMuted}`,
						background: GH.bg,
					}}
				>
					<Icon size={14} strokeWidth={2} style={{ color: GH.muted }} />
					<span
						className="font-mono text-[13px] font-medium tracking-tight"
						style={{ color: GH.textStrong }}
					>
						{title}
					</span>
				</div>
				<div className="flex-1 overflow-hidden">{children}</div>
			</motion.div>
		</div>
	);
}

/* ============================== Architecture ============================== */

type NodeKind = "app" | "service" | "pkg" | "data";

type GraphNode = {
	id: string;
	label: string;
	x: number;
	y: number;
	w: number;
	kind: NodeKind;
};

type GraphEdge = { from: string; to: string };

// Hand-tuned positions inside the card body (≈520×410). Apps on top, service
// hub in the middle, leaf packages around it, data at the bottom. Layout is
// stable across reloads, no force solver.
const NODES: GraphNode[] = [
	{ id: "web", label: "apps/web", x: 70, y: 36, w: 110, kind: "app" },
	{ id: "admin", label: "apps/admin", x: 330, y: 36, w: 122, kind: "app" },
	{ id: "api", label: "@acme/api", x: 200, y: 145, w: 116, kind: "service" },
	{ id: "ui", label: "@acme/ui", x: 50, y: 235, w: 104, kind: "pkg" },
	{ id: "auth", label: "@acme/auth", x: 200, y: 235, w: 122, kind: "pkg" },
	{ id: "billing", label: "@acme/billing", x: 350, y: 235, w: 138, kind: "pkg" },
	{ id: "db", label: "@acme/db", x: 215, y: 332, w: 110, kind: "data" },
];

// Routing rule: every edge flows top-down, no curve passes through a node body.
// `api → db`, `admin → ui` removed for that reason; `admin → billing` keeps the
// right column saturated.
const EDGES: GraphEdge[] = [
	{ from: "web", to: "api" },
	{ from: "web", to: "ui" },
	{ from: "admin", to: "api" },
	{ from: "admin", to: "billing" },
	{ from: "api", to: "auth" },
	{ from: "api", to: "billing" },
	{ from: "auth", to: "db" },
	{ from: "billing", to: "db" },
];

const KIND_DOT: Record<NodeKind, string> = {
	app: GH.link,
	service: GH.attention,
	pkg: GH.merged,
	data: GH.success,
};

function nodeCenter(n: GraphNode) {
	return { cx: n.x + n.w / 2, cy: n.y + 17 };
}

function DependencyGraph({ isActive }: { isActive: boolean }) {
	const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));
	const nodesEnd = LEFT_CONTENT_DELAY + NODES.length * NODE_STAGGER + 0.15;

	return (
		<div
			className="relative h-full w-full"
			style={{ background: GH.card }}
		>
			{/* Edges layer */}
			<svg
				className="absolute inset-0"
				viewBox="0 0 540 410"
				preserveAspectRatio="none"
				style={{ width: "100%", height: "100%" }}
			>
				<defs>
					{/* Arrow tip is small + matches the line tone so edges don't shout. */}
					<marker
						id="arrow"
						viewBox="0 0 10 10"
						refX="9"
						refY="5"
						markerWidth="4.5"
						markerHeight="4.5"
						orient="auto-start-reverse"
					>
						<path d="M0,1.5 L10,5 L0,8.5 Z" fill={GH.border} />
					</marker>
				</defs>
				{EDGES.map((e, i) => {
					const a = nodeMap[e.from];
					const b = nodeMap[e.to];
					if (!a || !b) return null;
					const { cx: x1, cy: y1 } = nodeCenter(a);
					const { cx: x2, cy: y2 } = nodeCenter(b);

					// All edges flow top→bottom in this layout — pin endpoints to the
					// source's bottom edge and the target's top edge.
					const fromY = y1 + 17;
					const toY = y2 - 17;

					// Cubic bezier with control points pulled to mid-y. Gives a clean
					// vertical-axis S-curve when endpoints are horizontally offset, and
					// a straight line when they're aligned. Same shape engineers expect
					// from architecture diagrams.
					const midY = fromY + (toY - fromY) * 0.55;
					const path = `M ${x1},${fromY} C ${x1},${midY} ${x2},${midY} ${x2},${toY}`;

					return (
						<motion.path
							key={`${e.from}->${e.to}`}
							d={path}
							fill="none"
							stroke={GH.border}
							strokeWidth={1.2}
							strokeLinecap="round"
							strokeLinejoin="round"
							markerEnd="url(#arrow)"
							initial={{ pathLength: 0, opacity: 0 }}
							animate={
								isActive
									? { pathLength: 1, opacity: 1 }
									: { pathLength: 0, opacity: 0 }
							}
							transition={{
								duration: EDGE_TRACE_DURATION,
								ease: "easeOut",
								delay: isActive ? nodesEnd + i * 0.04 : 0,
							}}
						/>
					);
				})}
			</svg>

			{/* Nodes layer */}
			<div
				className="absolute inset-0"
				style={{ pointerEvents: "none" }}
			>
				<div
					className="relative"
					style={{ width: "100%", height: "100%" }}
				>
					{/* Inner positioned box matches SVG viewBox aspect for stable coords */}
					<div
						className="absolute"
						style={{
							left: 0,
							top: 0,
							width: "100%",
							height: "100%",
						}}
					>
						<div
							className="relative"
							style={{
								width: "100%",
								height: "100%",
								aspectRatio: "540 / 410",
							}}
						>
							{NODES.map((n, i) => {
								// Convert hand-tuned 540×410 coords into % so the layer scales
								// with the card body without a measured ref.
								const leftPct = (n.x / 540) * 100;
								const topPct = (n.y / 410) * 100;
								const widthPct = (n.w / 540) * 100;
								return (
									<motion.div
										key={n.id}
										className="absolute flex items-center gap-1.5 rounded-full font-mono"
										style={{
											left: `${leftPct}%`,
											top: `${topPct}%`,
											width: `${widthPct}%`,
											height: 34,
											background: GH.inset,
											border: `1px solid ${GH.border}`,
											color: GH.textStrong,
											fontSize: 11.5,
											padding: "0 10px",
										}}
										initial={{ opacity: 0, y: 8 }}
										animate={
											isActive
												? { opacity: 1, y: 0 }
												: { opacity: 0, y: 8 }
										}
										transition={{
											duration: 0.38,
											ease: [0.34, 1.18, 0.6, 1],
											delay: isActive
												? LEFT_CONTENT_DELAY + i * NODE_STAGGER
												: 0,
										}}
									>
										<span
											className="inline-block shrink-0 rounded-full"
											style={{
												width: 7,
												height: 7,
												background: KIND_DOT[n.kind],
											}}
										/>
										<span className="truncate">{n.label}</span>
									</motion.div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ============================== Style snippet ============================ */

type SnippetLine =
	| { kind: "code"; tokens: Token[] }
	| { kind: "blank" }
	| { kind: "decorator"; tokens: Token[]; group: number };

type Token = { t: string; c?: string };

const SYN = {
	keyword: "#ff7b72",
	identifier: "#79c0ff",
	string: "#a5d6ff",
	param: "#ffa657",
	comment: "#8b949e",
	plain: GH.text,
} as const;

// Line-by-line because we want per-line stagger and the decorator highlights
// to wrap a specific group of lines.
const SNIPPET: SnippetLine[] = [
	{
		kind: "code",
		tokens: [
			{ t: "import", c: SYN.keyword },
			{ t: " { " },
			{ t: "Controller", c: SYN.identifier },
			{ t: ", " },
			{ t: "Get", c: SYN.identifier },
			{ t: " } " },
			{ t: "from", c: SYN.keyword },
			{ t: ' "', c: SYN.string },
			{ t: "@acme/http", c: SYN.string },
			{ t: '"', c: SYN.string },
		],
	},
	{ kind: "blank" },
	{
		kind: "code",
		tokens: [
			{ t: "@" },
			{ t: "Controller", c: SYN.identifier },
			{ t: "(" },
			{ t: '"/customers"', c: SYN.string },
			{ t: ")" },
		],
	},
	{
		kind: "code",
		tokens: [
			{ t: "export", c: SYN.keyword },
			{ t: " " },
			{ t: "class", c: SYN.keyword },
			{ t: " " },
			{ t: "CustomersController", c: SYN.identifier },
			{ t: " {" },
		],
	},
	{
		kind: "decorator",
		group: 0,
		tokens: [{ t: "  @" }, { t: "AuthRequired", c: SYN.identifier }, { t: "()" }],
	},
	{
		kind: "decorator",
		group: 0,
		tokens: [
			{ t: "  @" },
			{ t: "Audited", c: SYN.identifier },
			{ t: "(" },
			{ t: '"customer.read"', c: SYN.string },
			{ t: ")" },
		],
	},
	{
		kind: "decorator",
		group: 0,
		tokens: [
			{ t: "  @" },
			{ t: "RateLimited", c: SYN.identifier },
			{ t: "(" },
			{ t: '"standard"', c: SYN.string },
			{ t: ")" },
		],
	},
	{
		kind: "code",
		tokens: [
			{ t: "  @" },
			{ t: "Get", c: SYN.identifier },
			{ t: "(" },
			{ t: '"/:id"', c: SYN.string },
			{ t: ")" },
		],
	},
	{
		kind: "code",
		tokens: [
			{ t: "  " },
			{ t: "async", c: SYN.keyword },
			{ t: " " },
			{ t: "findOne", c: SYN.identifier },
			{ t: "(" },
			{ t: "id", c: SYN.param },
			{ t: ": " },
			{ t: "string", c: SYN.keyword },
			{ t: ") {" },
		],
	},
	{
		kind: "code",
		tokens: [
			{ t: "    " },
			{ t: "return", c: SYN.keyword },
			{ t: " " },
			{ t: "this", c: SYN.keyword },
			{ t: ".repo." },
			{ t: "findOne", c: SYN.identifier },
			{ t: "(" },
			{ t: "id", c: SYN.param },
			{ t: ")" },
		],
	},
	{ kind: "code", tokens: [{ t: "  }" }] },
	{ kind: "blank" },
	{
		kind: "decorator",
		group: 1,
		tokens: [{ t: "  @" }, { t: "AuthRequired", c: SYN.identifier }, { t: "()" }],
	},
	{
		kind: "decorator",
		group: 1,
		tokens: [
			{ t: "  @" },
			{ t: "Audited", c: SYN.identifier },
			{ t: "(" },
			{ t: '"customer.list"', c: SYN.string },
			{ t: ")" },
		],
	},
	{
		kind: "code",
		tokens: [
			{ t: "  @" },
			{ t: "Get", c: SYN.identifier },
			{ t: '("/")' },
		],
	},
	{
		kind: "code",
		tokens: [
			{ t: "  " },
			{ t: "async", c: SYN.keyword },
			{ t: " " },
			{ t: "list", c: SYN.identifier },
			{ t: "() { " },
			{ t: "/* … */", c: SYN.comment },
			{ t: " }" },
		],
	},
	{ kind: "code", tokens: [{ t: "}" }] },
];

function DecoratorSnippet({ isActive }: { isActive: boolean }) {
	// Walk the snippet building visual blocks: consecutive decorator lines of
	// the same group get wrapped in a highlight container so the eye locks onto
	// the convention as a unit.
	type Block =
		| { kind: "line"; line: SnippetLine; index: number }
		| { kind: "highlight"; group: number; lines: { line: SnippetLine; index: number }[] };
	const blocks: Block[] = [];
	let i = 0;
	while (i < SNIPPET.length) {
		const line = SNIPPET[i];
		if (line.kind === "decorator") {
			const group = line.group;
			const collected: { line: SnippetLine; index: number }[] = [];
			while (i < SNIPPET.length) {
				const l = SNIPPET[i];
				if (l.kind !== "decorator" || l.group !== group) break;
				collected.push({ line: l, index: i });
				i++;
			}
			blocks.push({ kind: "highlight", group, lines: collected });
			continue;
		}
		blocks.push({ kind: "line", line, index: i });
		i++;
	}

	return (
		<div
			className="h-full w-full overflow-hidden font-mono"
			style={{
				background: GH.card,
				color: GH.text,
				fontSize: 12,
				lineHeight: 1.6,
				padding: "10px 0",
			}}
		>
			{blocks.map((block, b) => {
				if (block.kind === "line") {
					return (
						<CodeLine
							key={`l-${block.index}`}
							line={block.line}
							isActive={isActive}
							delay={
								isActive
									? RIGHT_CONTENT_DELAY + block.index * LINE_STAGGER
									: 0
							}
						/>
					);
				}
				// Highlight wrap — the decorator group reveals together with a
				// background pulse keyed off the last line in the group.
				const lastIndex = block.lines[block.lines.length - 1].index;
				const popDelay = isActive
					? RIGHT_CONTENT_DELAY + lastIndex * LINE_STAGGER + 0.18
					: 0;
				return (
					<motion.div
						key={`h-${b}`}
						className="relative"
						initial={{ background: "transparent" }}
						animate={
							isActive
								? { background: GH.attentionSoft }
								: { background: "transparent" }
						}
						transition={{
							duration: DECORATOR_POP_DURATION,
							ease: "easeOut",
							delay: popDelay,
						}}
						style={{
							borderLeft: `2px solid transparent`,
						}}
					>
						<motion.div
							className="absolute inset-y-0 left-0"
							style={{ width: 2, background: GH.attention }}
							initial={{ opacity: 0 }}
							animate={isActive ? { opacity: 1 } : { opacity: 0 }}
							transition={{
								duration: DECORATOR_POP_DURATION,
								ease: "easeOut",
								delay: popDelay,
							}}
						/>
						{block.lines.map(({ line, index }) => (
							<CodeLine
								key={`d-${index}`}
								line={line}
								isActive={isActive}
								delay={
									isActive
										? RIGHT_CONTENT_DELAY + index * LINE_STAGGER
										: 0
								}
							/>
						))}
					</motion.div>
				);
			})}
		</div>
	);
}

function CodeLine({
	line,
	isActive,
	delay,
}: {
	line: SnippetLine;
	isActive: boolean;
	delay: number;
}) {
	if (line.kind === "blank") {
		return <div style={{ height: "1em" }} />;
	}
	return (
		<motion.div
			className="whitespace-pre px-4"
			initial={{ opacity: 0, y: 4 }}
			animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
			transition={{
				duration: 0.32,
				ease: "easeOut",
				delay,
			}}
		>
			{line.tokens.map((tok, i) => (
				<span key={i} style={{ color: tok.c ?? GH.text }}>
					{tok.t}
				</span>
			))}
		</motion.div>
	);
}
