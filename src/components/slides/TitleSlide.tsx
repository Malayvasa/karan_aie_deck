"use client";

import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";

/**
 * Slide 1 — title. Monospace title pinned top-left, speaker byline bottom-left,
 * on solid black. Content sits inside the 128px slide margin; title and byline
 * are pushed to the top and bottom edges of that safe area.
 */
export function TitleSlide() {
	return (
		<DeckSlide>
			<div className="flex flex-1 flex-col justify-between">
				<h1 className="max-w-[24ch] font-normal font-mono text-[84px] leading-[1.05] tracking-tight text-foreground">
					Bridging agents from code to knowledge-work
				</h1>

				<div className="font-mono text-[30px] leading-[1.35] text-foreground">
					<div>Karan Vaidya</div>
					<div>CTO &amp; Co-founder, Composio</div>
				</div>
			</div>

			<Notes>
				Hey everyone, I&apos;m Karan, Co-Founder and CTO of Composio. Today
				I&apos;m here to answer one question: why is the power of agents still
				stuck in coding — and what it takes to bridge them into all the other
				knowledge work.
			</Notes>
		</DeckSlide>
	);
}
