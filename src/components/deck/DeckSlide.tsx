"use client";

import { Slide } from "spectacle";
import { cn } from "~/lib/utils";

/**
 * Consistent slide chrome for the whole deck. Wraps Spectacle's <Slide> (which
 * gives us navigation, scaling and presenter mode) but hands layout entirely to
 * Tailwind so every slide uses the ported design system.
 *
 * The slide STAGE is full-bleed — backgrounds, full-width rules and absolutely
 * positioned layers can run edge-to-edge. The 128px margin lives on the inner
 * CONTENT container, not the slide. Set `padded={false}` to opt a slide out and
 * manage its own spacing (e.g. a full-bleed image), then drop a <SlideContent>
 * around any foreground that should respect the margin.
 */
export function DeckSlide({
	children,
	className,
	stageClassName,
	padded = true,
}: {
	children: React.ReactNode;
	/** Applied to the inner content container (the margined area). */
	className?: string;
	/** Applied to the full-bleed stage. */
	stageClassName?: string;
	padded?: boolean;
}) {
	return (
		<Slide backgroundColor="var(--background)" padding={0}>
			<div
				className={cn(
					"relative h-full w-full overflow-hidden bg-background text-foreground",
					stageClassName,
				)}
			>
				{padded ? (
					<SlideContent className={className}>{children}</SlideContent>
				) : (
					children
				)}
			</div>
		</Slide>
	);
}

/**
 * The 128px content margin. Wraps foreground content so it sits inside the safe
 * area while full-bleed siblings on the stage stay edge-to-edge.
 */
export function SlideContent({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative flex h-full w-full flex-col p-32", // 128px margin on content
				className,
			)}
		>
			{children}
		</div>
	);
}

/** Small mono eyebrow used to tag a slide's section / act. */
export function Kicker({
	children,
	className,
	tone = "muted",
}: {
	children: React.ReactNode;
	className?: string;
	tone?: "muted" | "brand" | "success" | "destructive";
}) {
	const toneClass = {
		muted: "text-muted-foreground",
		brand: "text-brand",
		success: "text-success",
		destructive: "text-destructive",
	}[tone];
	return (
		<span
			className={cn(
				"text-mono-sm uppercase tracking-[0.18em]",
				toneClass,
				className,
			)}
		>
			{children}
		</span>
	);
}
