"use client";

import { motion } from "framer-motion";
import { Notes } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { useStepMotion } from "~/components/deck/useStepMotion";

/** % of agentic tool calls by domain. Order matters — SWE dwarfs everything. */
const DATA = [
	{ label: "Software engineering", value: 49.7 },
	{ label: "Back-office", value: 9.1 },
	{ label: "Other", value: 7.1 },
	{ label: "Marketing", value: 4.4 },
	{ label: "Sales & CRM", value: 4.3 },
	{ label: "Finance", value: 4.0 },
	{ label: "Data & BI", value: 3.5 },
	{ label: "Research", value: 2.8 },
	{ label: "Cybersecurity", value: 2.4 },
	{ label: "Customer support", value: 2.2 },
	{ label: "Gaming", value: 2.1 },
	{ label: "Documents", value: 1.9 },
	{ label: "Education", value: 1.8 },
	{ label: "E-commerce", value: 1.3 },
	{ label: "Healthcare", value: 1.0 },
	{ label: "Legal", value: 0.9 },
	{ label: "Logistics", value: 0.8 },
];

// Chart geometry (in the fixed 1366×768 canvas, inside the 128px margin).
const LABEL_W = 215; // category label column (snug to "Software engineering")
const PLOT_W = 700; // 0–50% plotting area
const VALUE_W = 52; // room for the value label past the bar end
const ROW_H = 26;
const BAR_H = 15;
const MAX = 50;
const TICKS = [0, 10, 20, 30, 40, 50];
const ACCENT = "#c8765a";
const DIM = "rgba(255,255,255,0.55)";
const xFor = (v: number) => (v / MAX) * PLOT_W;

export function ToolCallsSlide() {
	return (
		<DeckSlide>
			<ToolCallsBody />
		</DeckSlide>
	);
}

function ToolCallsBody() {
	// 1 step: begin with only Software engineering, then reveal the rest.
	const { reached, placeholder } = useStepMotion(1);
	const showAll = reached(0);

	return (
		<>
			{placeholder}
			<div className="flex flex-1 flex-col justify-center">
				<div className="mx-auto" style={{ width: LABEL_W + PLOT_W + VALUE_W }}>
					{/* Plot: rows in flow so the block recenters as rows reveal. */}
					<div className="relative">
						{/* Gridlines span exactly the current rows height. */}
						<div
							className="absolute inset-y-0"
							style={{ left: LABEL_W, width: PLOT_W }}
						>
							{TICKS.map((t) => (
								<div
									key={t}
									className="absolute inset-y-0 w-px"
									style={{
										left: xFor(t),
										backgroundColor:
											t === 0
												? "rgba(255,255,255,0.18)"
												: "rgba(255,255,255,0.07)",
									}}
								/>
							))}
						</div>

						{DATA.map((d, i) => {
							const isSwe = i === 0;
							const visible = isSwe || showAll;
							// Each subsequent domain cascades in ~90ms after the previous.
							const stagger = (i - 1) * 0.09;
							return (
									<motion.div
										key={d.label}
										// Fixed height always — the full chart frame is reserved in both
										// states, so SWE stays pinned at the top and nothing shifts.
										className="relative flex items-center"
										style={{ height: ROW_H }}
										initial={false}
										animate={{ opacity: visible ? 1 : 0 }}
										transition={{ duration: 0.35, delay: isSwe ? 0 : stagger }}
									>
										<div
											className="shrink-0 pr-4 text-right font-mono text-[15px] uppercase leading-none tracking-[0.01em]"
											style={{ width: LABEL_W, color: isSwe ? "#fff" : DIM }}
										>
											{d.label}
										</div>

										<div
											className="relative"
											style={{ width: PLOT_W, height: BAR_H }}
										>
											<motion.div
												className="absolute top-0 left-0 rounded-[2px]"
												style={{ height: BAR_H, backgroundColor: ACCENT }}
												initial={false}
												animate={{ width: visible ? xFor(d.value) : 0 }}
												transition={{
													type: "spring",
													stiffness: 130,
													damping: 22,
													delay: isSwe ? 0 : 0.1 + stagger,
												}}
											/>
											<motion.span
												className="absolute top-1/2 font-mono text-[15px] uppercase leading-none tracking-[0.01em] tabular-nums"
												style={{
													left: xFor(d.value) + 8,
													color: isSwe ? "#fff" : DIM,
												}}
												initial={false}
												animate={{ opacity: visible ? 1 : 0, y: "-50%" }}
												transition={{ duration: 0.3, delay: isSwe ? 0 : 0.28 + stagger }}
											>
												{d.value.toFixed(1)}%
											</motion.span>
										</div>
									</motion.div>
								);
						})}
					</div>

					{/* X axis ticks + title, directly under the bars block. */}
					<div className="relative mt-3" style={{ height: 44 }}>
						<div
							className="absolute top-0"
							style={{ left: LABEL_W, width: PLOT_W }}
						>
							{TICKS.map((t) => (
								<span
									key={t}
									className="absolute top-0 font-mono text-[13px] text-white/40 tabular-nums"
									style={{ left: xFor(t), transform: "translateX(-50%)" }}
								>
									{t}
								</span>
							))}
							<div className="absolute top-7 w-full text-center font-mono text-[15px] uppercase tracking-[0.08em] text-white/55">
								% of tool calls
							</div>
						</div>
					</div>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="toolCalls" steps={1} />
			</Notes>
		</>
	);
}
