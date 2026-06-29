"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";

export const STUD_PITCH = 72;
export const STUD_W = 34;
export const STUD_H = 10;
export const STUD_R = 3;
export const BLOCK_H = 52;
export const LABEL_FONT_SIZE = 14;
export const BODY_R = 5;
export const TOP_R = 5;
export const PEEK = 0;
export const TOTAL_H = STUD_H + BLOCK_H;
export const ROW_Y = BLOCK_H + PEEK;

export const GRID_STUDS = 12;
export const GRID_W = GRID_STUDS * STUD_PITCH;

export type Brick = {
	label: string;
	color: string;
	text: string;
	icon?: LucideIcon;
};

export type PlacedBrick = {
	brick: Brick;
	xStud: number;
	row: number;
	studs: number;
	idx: number;
	fontSize?: number;
};

export function widthForStuds(studs: number) {
	return studs * STUD_PITCH;
}

export function xForStud(xStud: number) {
	return xStud * STUD_PITCH;
}

export function yForRow(row: number) {
	return row * ROW_Y;
}

export function studCenters(studs: number) {
	return Array.from({ length: studs }, (_, i) => (i + 0.5) * STUD_PITCH);
}

export function brickPath(width: number, centers: number[]): string {
	const top = STUD_H;
	const bottom = STUD_H + BLOCK_H;
	let d = `M ${TOP_R} ${top}`;
	for (const cx of centers) {
		const l = cx - STUD_W / 2;
		const r = cx + STUD_W / 2;
		d += ` L ${l} ${top}`;
		d += ` L ${l} ${STUD_R}`;
		d += ` Q ${l} 0 ${l + STUD_R} 0`;
		d += ` L ${r - STUD_R} 0`;
		d += ` Q ${r} 0 ${r} ${STUD_R}`;
		d += ` L ${r} ${top}`;
	}
	d += ` L ${width - TOP_R} ${top}`;
	d += ` Q ${width} ${top} ${width} ${top + TOP_R}`;
	d += ` L ${width} ${bottom - BODY_R}`;
	d += ` Q ${width} ${bottom} ${width - BODY_R} ${bottom}`;
	d += ` L ${BODY_R} ${bottom}`;
	d += ` Q 0 ${bottom} 0 ${bottom - BODY_R}`;
	d += ` L 0 ${top + TOP_R}`;
	d += ` Q 0 ${top} ${TOP_R} ${top}`;
	d += " Z";
	return d;
}

export function LegoBrick({
	brick,
	idx,
	studs,
	fontSize,
	labelOverride,
}: {
	brick: Brick;
	idx: number;
	studs: number;
	fontSize?: number;
	labelOverride?: React.ReactNode;
}) {
	const width = widthForStuds(studs);
	// useId() guarantees globally-unique SVG ids across slides — without this,
	// gradient/clip refs (e.g. url(#brick-shade-0)) collide between the dep
	// tower and empty tower bricks and the wrong defs render during slide
	// transitions, which shows up as the brick "flattening" briefly.
	const uid = useId();
	const clip = `brick-clip-${uid}-${idx}`;
	const shade = `brick-shade-${uid}-${idx}`;
	const side = `brick-side-${uid}-${idx}`;
	const studHi = `brick-stud-${uid}-${idx}`;
	const studSide = `brick-stud-side-${uid}-${idx}`;
	const centers = studCenters(studs);
	const path = brickPath(width, centers);
	const Icon = brick.icon;
	const labelStyle = {
		color: brick.text,
		fontSize: fontSize ?? LABEL_FONT_SIZE,
		textShadow: "0 -1px 0 rgba(0,0,0,0.46), 0 1px 0 rgba(255,255,255,0.18)",
	} as const;

	return (
		<div className="relative" style={{ width, height: TOTAL_H }}>
			<svg
				width={width}
				height={TOTAL_H}
				viewBox={`0 0 ${width} ${TOTAL_H}`}
				style={{ display: "block", overflow: "visible" }}
				aria-hidden
			>
				<defs>
					<clipPath id={clip}>
						<path d={path} />
					</clipPath>
					<linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
						<stop offset="12%" stopColor="#fff" stopOpacity="0.1" />
						<stop offset="34%" stopColor="#fff" stopOpacity="0" />
						<stop offset="72%" stopColor="#000" stopOpacity="0" />
						<stop offset="93%" stopColor="#000" stopOpacity="0.34" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.52" />
					</linearGradient>
					<linearGradient id={side} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#000" stopOpacity="0.2" />
						<stop offset="8%" stopColor="#000" stopOpacity="0" />
						<stop offset="92%" stopColor="#000" stopOpacity="0" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.2" />
					</linearGradient>
					<linearGradient id={studHi} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
						<stop offset="100%" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<linearGradient id={studSide} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#000" stopOpacity="0.2" />
						<stop offset="45%" stopColor="#fff" stopOpacity="0.12" />
						<stop offset="100%" stopColor="#000" stopOpacity="0.22" />
					</linearGradient>
				</defs>

				<g clipPath={`url(#${clip})`}>
					<path d={path} fill={brick.color} />
					<rect width={width} height={TOTAL_H} fill={`url(#${shade})`} />
					<rect width={width} height={TOTAL_H} fill={`url(#${side})`} />

					<rect
						x={0}
						y={STUD_H}
						width={width}
						height={1.5}
						fill="#fff"
						opacity={0.16}
					/>

					{centers.map((cx) => (
						<g key={cx}>
							<rect
								x={cx - STUD_W / 2}
								y={STUD_H - 1.5}
								width={STUD_W}
								height={2}
								fill="#000"
								opacity={0.16}
							/>
							<rect
								x={cx - STUD_W / 2}
								y={0}
								width={STUD_W}
								height={STUD_H}
								fill={`url(#${studSide})`}
							/>
							<rect
								x={cx - STUD_W / 2 + 3}
								y={1.3}
								width={STUD_W - 6}
								height={STUD_H + 1}
								rx={3}
								fill={`url(#${studHi})`}
							/>
						</g>
					))}

					<rect
						x={0}
						y={TOTAL_H - 3}
						width={width}
						height={3}
						fill="#000"
						opacity={0.3}
					/>
				</g>

				<path d={path} fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="1" />
			</svg>

			<div
				className="absolute inset-x-0 flex items-center justify-center px-2 text-center"
				style={{ top: STUD_H, height: BLOCK_H }}
			>
				<span
					className="inline-flex items-center justify-center gap-2 font-mono font-medium uppercase leading-none tracking-[0.06em]"
					style={labelStyle}
				>
					{Icon ? (
						<Icon
							aria-hidden
							size={15}
							strokeWidth={2.4}
							className="shrink-0"
							style={{
								filter:
									"drop-shadow(0 -1px 0 rgba(0,0,0,0.48)) drop-shadow(0 1px 0 rgba(255,255,255,0.16))",
							}}
						/>
					) : null}
					{labelOverride ?? brick.label}
				</span>
			</div>
		</div>
	);
}
