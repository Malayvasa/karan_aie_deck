"use client";

import { motion } from "framer-motion";

// Inline Golden Gate from /public/golden-gate.svg, restructured so each layer
// can animate on its own. The actual cables use pathLength so they draw on
// like a pen rather than wiping in. Fills (towers, deck, cross-bracing) use
// scaleX/scaleY/clip-path so the construction reads left → up → across.

const C_DARK = "#76110C";
const C_STROKE = "#D42E2F";
const C_TOWER = "#A32525";
const C_DECK = "#D42E2F";
const C_MED = "#B7292B";
const C_ORANGE = "#D42C2A";
const C_HANGER_FILL = "#890D0A";

// Strokeable cables (cls-1). Each gets its own pathLength animation so they
// look hand-drawn.
const CABLES_1 = [
	"m29.2 1.3c-2.2 13-9.4 34.7-29.2 46.4v1.5c21.2-11.4 27.6-33.2 29.3-47.9h-0.1z",
	"m42.5 1.5-0.1-0.5h0.2c2.6 14.1 14.2 49 42.6 52.8 5.1 0.7 4.7 0.1 4.7 0.1-19.9-1-39.9-17.2-47.4-52.4z",
	"m149.8 1.5-0.2-0.5h-0.3c2.4 13.7 10.6 36.2 30.2 46.7v0.7c-19.2-10.3-27.5-31-29.7-46.9z",
	"m0 52.4c13.4-3.5 26.8-13.7 34.9-29.7 3.4-6.8 5.5-15.9 5.8-21.4h0.3c-2.6 15.8-13.5 44.4-41 51.1z",
	"m148 1.3-0.8 3.8c-3.7 14.9-15.1 41.2-46.3 48.4-4.6 0.7-7 0.4-11 0.3 14.1-0.7 42-10.5 47.3-52.5h0.8v0.2",
];

// Thin hanger details (cls-2) — one long multi-segment path covering most of
// the vertical hangers from left to right, plus right-side details. pathLength
// fills them in across the deck.
const HANGERS_MAIN =
	"m46.1 16.3v41.6m6.4-29.4v29.5m6-21.5v21.5m6.3-15.2v15.2m6-10.9v10.9m6-7.6v7.6m6.2-5.5v5.5m2.3-3.9v3.9m9.7-4.2-0.1 4.2m2.6-6.2v6m6.1-8.1v8.3m5.3-11.5v11.5m7-16.4v16.4m6-22.5v22.5m6.1-31.2v31.2m6.4-45.1v45m-18.4-9v9.1m3.4-11.1v11m5.8-15v15m6.3-20.4v20.4m3.6-24.5v24.5m-110.7-39.8v39.8m-6.1-27.9v27.9m-6.3-20v20m-5.6-14.6v14.6m-2.6-6.8v6.8m18.2-18.3v18.1m-6.6-12.9v13.1m-5.8-9.5v9.5m22-53.4v4m0.1-4.1c0.1 0.7 2 7.5 2.6 9.1h0.2c-0.4-1.4-2.7-9.4-2.8-9.8l-0.1 0.1m2.5 11.6v42.6m2.3-42.4v42.4m2.2-51c-0.6 1.6-0.8 3-1.3 4.8l0.2 0.2c0.2-0.6 1.1-4.4 1.9-7m0.8-1.7v9.7m3.4 3.5-0.1-0.2";

const HANGERS_RIGHT = [
	"m143.4 18.2v39.8",
	"m146.1 26.3v31.5",
	"m142.6 58v-38.2",
	"m156.1 20.9 0.1 37",
	"m162.1 31.6 0.3 26.1",
	"m156.1 37.8v20",
	"m158.4 40.5 0.3 17.5",
	"m164.1 45.2 0.8 0.7v12.1",
	"m168 38.8 0.2 8.9",
	"m174 44.4 0.1 6.3",
];

// Cross-bracing polygons (cls-7) — drawn as a single group with a left-to-right
// clip-path wipe so they appear to fill in along the deck.
const CROSS_BRACING = [
	"0.1 59.2 0.1 61.8 3.5 61.8 3.6 59.2",
	"1.5 59.2 4.8 62 7.9 59.2",
	"6.6 59.2 6.6 61.8 9.9 61.8 10 59.2",
	"8 59.2 11.3 62 14.4 59.2",
	"11.2 59.2 11.2 61.8 14.5 61.8 14.6 59.2",
	"12.6 59.2 16 62 19.1 59.2",
	"16.7 59.2 16.7 61.8 20 61.8 20 59.2",
	"18.2 59.2 21.5 62 24.6 59.2",
	"20.3 59.1 20.3 61.8 23.8 61.8 23.8 59.2",
	"24 59.1 24 61.7 27.4 61.7 27.5 59.1",
	"25.3 59.1 28.6 61.9 31.7 59.1",
	"30.8 59.1 30.8 61.7 34.1 61.7 34.2 59.1",
	"32.2 59.1 35.5 61.9 38.6 59.1",
	"37.6 59.1 37.6 61.7 40.8 61.8 40.9 59.1",
	"38.9 59.1 42.3 61.9 45.3 59.1",
	"44.5 59.1 44.5 61.7 47.9 61.7 48 59.1",
	"45.5 59.2 48.9 62 52 59.2",
	"48.3 59.1 48.3 61.7 51.9 61.7 51.9 59.1",
	"51.5 59.2 54.8 62 57.9 59.2",
	"55 59.1 55 61.7 58.4 61.8 58.4 59.1",
	"58.2 59.2 61.5 62 64.6 59.2",
	"59 59.2 59 61.8 62.9 61.9 62.9 59.2",
	"62.8 59.2 66.1 62 69.1 59.2",
	"63.8 59.2 63.8 61.8 67.2 61.8 67.3 59.2",
	"67.1 59.2 70.5 62 73.6 59.2",
	"69.5 59.2 69.5 61.8 72.9 61.8 73 59.2",
	"73.2 59.2 76.5 62 79.6 59.2",
	"73.4 59.1 73.4 61.7 77.3 61.8 77.3 59.1",
	"78.1 59.2 81.9 62 84.9 59.2",
	"80 59.2 80 61.8 83.9 61.9 83.9 59.2",
	"83.5 59.2 87 62 90.1 59.2",
	"84.4 59.2 84.4 61.8 87.9 61.8 87.9 59.2",
	"87.2 59.2 90.6 62 93.7 59.2",
	"90.3 59.2 90.2 61.8 93.8 61.8 93.8 59.2",
	"93.5 59.2 96.8 62 99.9 59.2",
	"94.3 59.2 94.3 61.8 98 61.8 98 59.2",
	"97 59.2 100.4 62 103.5 59.2",
	"100.3 59.2 100.3 61.8 103.3 61.9 103.4 59.2",
	"104 59.1 107.3 62 110.4 59.2",
	"104.2 59.1 104.2 61.7 107.7 61.7 107.7 59.1",
	"107.5 59.2 110.8 62 113.9 59.2",
	"110.6 59.2 110.6 61.8 114.2 61.8 114.3 59.2",
	"114.3 59.1 117.7 62 120.8 59.1",
	"114.5 59.1 114.5 61.7 118.1 61.7 118.2 59.1",
	"117.9 59.2 121.2 62 124.3 59.2",
	"121.1 59.2 121.1 61.8 124.5 61.8 124.6 59.2",
	"121.9 59.2 125.3 62 128.4 59.2",
	"124.8 59.1 124.7 61.7 127.9 61.7 128 59.1",
	"127.5 59.2 130.8 62 133.9 59.2",
	"127.6 59.1 127.6 61.7 130.9 61.8 131 59.1",
	"129.2 59.1 129.3 61.7 132.6 61.7 132.7 59.1",
	"131.7 59.2 134.7 62 137.9 59.2",
	"132.8 59.2 132.8 61.8 136.5 61.8 136.5 59.2",
	"135.8 59.2 137.5 61.5 141 59.2",
	"135.6 59.2 135.5 61.8 138.9 61.8 139 59.2",
	"136 59.2 139.4 62 142.5 59.2",
	"139 59.1 139.1 61.7 142.4 61.8 142.4 59.1",
	"141.6 59.1 144.8 62 147.9 59.1",
	"145.2 59.1 145.1 61.7 148.5 61.7 148.6 59.1",
	"145.6 59.2 148.9 62 152.6 59.2",
	"149.1 59.1 149.1 61.7 152.9 61.8 152.9 59.1",
	"152.5 59.1 155.6 62 158.7 59.2",
	"155.7 59.1 155.6 61.7 159.1 61.7 159.4 59.1",
	"159.2 59.1 162.5 62 165.6 59.2",
	"163.5 59.1 163.4 61.7 167 61.7 167 59.1",
	"166.8 59.1 170.1 62 173.2 59.2",
	"170.7 59.1 170.6 61.7 174.1 61.8 174.1 59.1",
	"173.9 59.1 176.7 61.8 179.5 61.8 179.5 59.2",
];

const STROKE_TRANS = (delay: number) => ({
	duration: 1.4,
	ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
	delay,
});

export function GoldenGateBridge({ active }: { active: boolean }) {
	return (
		<svg
			viewBox="0 0 179.5 88"
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			style={{ display: "block", overflow: "visible" }}
			aria-hidden
		>
			{/* Layer 1 — stroked main cables. pathLength gives the pen-on-paper feel. */}
			{CABLES_1.map((d, i) => (
				<motion.path
					key={`c1-${i}`}
					d={d}
					fill="none"
					stroke={C_STROKE}
					strokeWidth={0.5635}
					strokeMiterlimit={10}
					initial={{ pathLength: 0 }}
					animate={active ? { pathLength: 1 } : { pathLength: 0 }}
					transition={STROKE_TRANS(0.25 + i * 0.08)}
				/>
			))}

			{/* Layer 2 — thick cable silhouettes (filled cls-0). Wipe left → right
			    so they "fill in" behind the strokes. */}
			<motion.g
				initial={{ clipPath: "inset(0 100% 0 0)" }}
				animate={
					active
						? { clipPath: "inset(0 0% 0 0)" }
						: { clipPath: "inset(0 100% 0 0)" }
				}
				transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
			>
				<path
					fill={C_DARK}
					d="m85 54c-27.9 0-45.3-24.8-53.4-49v-0.7c8.6 24.7 26.3 49.2 53.4 49.6 28.3 0.4 48.6-23.8 53.7-42l0.3-0.9c-6 19.7-24.9 42.9-54 43z"
				/>
				<path
					fill={C_DARK}
					d="m140 5-0.3-0.8c4.3 21.1 19.6 43.2 39.8 47.9v0.4c-17.5-3.3-34.2-20.6-39.5-47.5z"
				/>
			</motion.g>

			{/* Layer 3 — left tower. ScaleY from base, so it "rises". */}
			<motion.g
				style={{ transformOrigin: "33px 88px" }}
				initial={{ scaleY: 0, opacity: 0 }}
				animate={
					active ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }
				}
				transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
			>
				<path
					fill={C_TOWER}
					d="m45.2 87.9v-5.9l-1.2-1.4v-16.3h0.9v-1h0.7v-1.3h-19.5v1.3h0.6v1h0.9v16.3l-1.3 1.4v5.9h-4.5v2.6h28v-2.6h-4.6zm-6.1-7.3-1.7 1.4v5.9h-3.6v-5.9l-1.3-1.3v-16.4h0.9v-1h0.7v-1.3h3.1v1.3h0.7v1h1v16.3h0.2z"
				/>
				<path
					fill={C_TOWER}
					d="m40.1 2.3v-1.1h0.5v-1h0.5v-1.2h0.5v1.2h0.6v1h0.6v1.1h-0.2v9.4l0.1 0.3v13.5l0.6 0.7v15l1 1.1v15.6h-16.8v-15.6l0.9-0.8v-15.4l0.7-0.7v-13.4l0.2-0.4v-9.3h-0.4v-1.1h0.7v-1h0.3v-1.2h0.6v1.2h0.6v1h0.4v1.1h8.6zm-0.6 13.5h-6.8c-0.6 0-1.2 0.5-1.2 1.1v2.5h-0.2v6.9l-0.3 0.4v14.5l1.5 1.3v0.7h6.3v-0.7l1.1-1.2v-15l-0.3-0.5v-9.9l-0.1-0.1zm-6.9 33.9 0.5-0.1v-2.2c0-0.5 0.5-1.2 1.1-1.2h4.6v3.5h-6.2zm1.3-19.4c-0.6 0-1.7 0.2-1.7 1.7v2h-0.3l0.1 8.2 1 1v-0.1h1l-0.1-12.8z"
				/>
				<path
					fill={C_DECK}
					d="m45.2 87.9v-5.9l-1.3-1.4v-16.3h0.8v-1h0.8l0.1-1.3v-4h-6.7l0.2 22.6-1.6 1.4-0.1 5.9h-1.7v2.6h14.1v-2.6h-4.6z"
				/>
				<polygon
					fill={C_ORANGE}
					points="39.6 26 39.6 12 40.3 11.7 40.3 1.5 42.4 1.4 42.6 11.7 42.7 12 42.7 25.6 43.3 25.6 43.3 41.3 44.3 42.3 44.3 58.8 38.7 58.9 38.7 42.3 39.7 41.3"
				/>
				<rect fill={C_MED} x="29.2" y="0.5" width="2.5" height="1.2" />
				<rect fill={C_ORANGE} x="40.1" y="0.5" width="2.5" height="1.2" />
				<polyline
					fill={C_MED}
					points="28.5 41.5 27.7 42.4 32.6 42.4 31.8 41.5"
				/>
				<polyline
					fill={C_ORANGE}
					points="39.6 41.5 38.7 42.4 43.8 42.4 43 41.5"
				/>
				<polyline
					fill={C_MED}
					points="39.8 26 42.9 26 42.6 25.6 39.9 25.6"
				/>
				<polygon
					fill={C_MED}
					points="28.5 26.1 31.5 26.1 31.1 25.5 29 25.5"
				/>
				<polygon
					fill={C_MED}
					points="38.8 64.3 44.6 64.3 44.6 63.5 38.1 63.5"
				/>
				<polygon
					fill={C_ORANGE}
					points="37.7 82.1 45.2 82.1 44 80.8 39 80.8"
				/>
				<polygon
					fill={C_MED}
					points="26.4 63.3 34.1 63.2 33.8 64.1 26.7 64.1"
				/>
				<polygon
					fill={C_ORANGE}
					points="37.2 62.3 45.5 62.3 45.5 63.3 37.3 63.3"
				/>
				<rect fill={C_TOWER} x="29" y="2.3" width="11.3" height="3.1" />
				<polygon
					fill={C_TOWER}
					points="30.9 12.8 40.2 12.8 40.3 15.9 32.8 15.9 31.5 16.3 31.5 19.5 31.1 19.6 31.1 25.4 29.1 25.5 29.1 12"
				/>
				<polygon
					fill={C_TOWER}
					points="32.6 43.1 38.7 43.1 38.7 46.2 33.8 46.2 33 46.7 33.1 49.6 32.6 49.7"
				/>
				<polygon
					fill={C_TOWER}
					points="32.8 27.4 39.7 27.4 39.7 30.3 33.1 30.3 32.2 30.9 32.2 33.9 32 34 32 41.3 29 41.3 28.6 27.3"
				/>
				{/* Tower X-bracing (left) */}
				<polygon fill={C_TOWER} points="32.6 65 38.9 65 39.2 65.6 32.5 65.7" />
				<polygon fill={C_TOWER} points="32.3 71.7 39.1 71.7 39.1 72.5 32.5 72.4" />
				<polygon fill={C_TOWER} points="32.3 78.6 39.1 78.6 39.4 79.3 32.3 79.3" />
				<polygon fill={C_TOWER} points="32.4 65.7 38.8 70.8 39 70.1 33 65.2" />
				<polygon fill={C_TOWER} points="32.6 73 39 78.3 39.1 77.3 32.9 72.2" />
				<polygon fill={C_TOWER} points="39.1 65.2 32.3 70.9 32.4 71.5 39 65.8" />
				<polygon fill={C_TOWER} points="39 77 32.3 80.1 32.1 79 39 73.1" />
			</motion.g>

			{/* Layer 4 — right tower. */}
			<motion.g
				style={{ transformOrigin: "146px 88px" }}
				initial={{ scaleY: 0, opacity: 0 }}
				animate={
					active ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }
				}
				transition={{ duration: 0.55, ease: "easeOut", delay: 0.75 }}
			>
				<path
					fill={C_TOWER}
					d="m152.9 87.9v-5.9l-1.3-1.4v-16.3h0.8v-1h0.9v-1.3h-19.4v1.3h0.5v1h0.9v16.3l-1.2 1.4v5.9h-4.7v2.6h13.8v-2.6h-1.8v-5.8l-1.5-1.5v-16.3h0.9v-1h0.9v-1.3h2.8l0.1 1.3h1.2l0.5 1-1.3 17.8 0.1 5.8h-2.2v2.6h14.7l0.1-2.6h-4.8z"
				/>
				<polygon
					fill={C_TOWER}
					points="139.3 2.3 139.4 1.2 138.9 1.2 138.6 0.2 138.3 0.2 138.1 -1 137.8 -1 137.7 0.2 137 0.2 136.9 1.2 136.6 1.2 136.7 2.3 136.9 2.3 136.9 11.8 136.8 12 136.8 25.6 136.3 26.1 136.3 41.3 135.3 42.4 135.3 58 140.6 57.9 140.4 41.6 139.6 41.3 139.6 25.7 140.1 25.5 139.5 25.4 139.5 19.4 139.1 19.2 139.2 16.3 140 15.9 147.9 15.9 147.9 12.7 138.7 12.7 138.7 11.8 138.8 11.7 138.8 2.3"
				/>
				<path
					fill={C_DECK}
					d="m152.9 87.9v-5.9l-1.3-1.4v-16.3h0.8v-1h0.9v-1.3h-8.8l0.1 1.3h1.2l0.5 1-1.3 17.8v5.8h-1.8v2.6h14.4l0.1-2.6h-4.8z"
				/>
				<path
					fill={C_ORANGE}
					d="m148.1 11.7v-10.4l1.5-0.1 0.3 10.8 0.7 13.6 0.3 0.5v15.1l0.8 1.1v16.6h-5.6v-16.7l0.8-0.9 0.1-15.2 0.8-0.7 0.2-13.5 0.1-0.2z"
				/>
				<rect fill={C_ORANGE} x="147.9" y="0.4" width="1.9" height="1.2" />
				<polygon
					fill={C_MED}
					points="144.1 62.3 153.3 62.3 153.3 63.3 144.5 63.3"
				/>
				<polygon
					fill={C_ORANGE}
					points="145 82 152.9 82.1 151.6 80.6 146.5 80.6"
				/>
				<polygon
					fill={C_TOWER}
					points="133.9 62.3 141.6 62.3 141.4 63.3 133.9 63.3"
				/>
				<polygon
					fill={C_ORANGE}
					points="150.5 11.8 147.9 11.8 147.5 12.3 147.5 25.4 150.4 25.6"
				/>
				<rect fill={C_TOWER} x="139.1" y="2.2" width="8.9" height="2.5" />
				<polygon
					fill={C_TOWER}
					points="139.1 12.8 147.9 12.8 147.9 15.9 139.7 15.9 139.1 16.6 139.1 19.5 138.6 19.6 138.7 25.4 136.9 25.4 136.9 11.9 137.2 11.7"
				/>
				<polygon
					fill={C_TOWER}
					points="140.4 43.1 146.1 43.1 146.1 46.2 141.9 46.2 140.6 46.6 140.6 49.8 140.2 49.8"
				/>
				<path
					fill={C_TOWER}
					d="m139.5 27.4h7.4l0.1 2.4v0.5h-6.7l-0.6 0.6v2.8h-0.3z"
				/>
				<polygon
					fill={C_ORANGE}
					points="146.9 41.3 151 41.4 150.4 40.5 147.5 40.5"
				/>
				<polygon
					fill={C_MED}
					points="136.5 41.7 139.6 41.3 140.4 42.1 135.5 42.3"
				/>
				<polygon
					fill={C_MED}
					points="147 25.9 150.9 25.9 150.4 25.6 147.4 25.6"
				/>
				<polygon
					fill={C_MED}
					points="136.3 26.1 139.6 26.1 139.6 25.7 136.6 25.6"
				/>
				{/* Tower X-bracing (right) */}
				<polygon fill={C_TOWER} points="140 65 146.6 65 146.8 65.6 140 65.7" />
				<polygon fill={C_TOWER} points="139.9 71.7 146.5 71.7 146.5 72.5 140.1 72.5" />
				<polygon fill={C_TOWER} points="139.8 78.6 146.6 78.6 146.8 79.3 139.9 79.3" />
				<polygon fill={C_TOWER} points="139.9 65.7 146.4 70.8 146.5 70 140.6 65.2" />
				<polygon fill={C_TOWER} points="140.1 73.1 146.5 78.2 146.5 77.4 140.4 72.2" />
				<polygon fill={C_TOWER} points="146.6 65.2 139.9 70.7 139.9 71.5 146.5 65.9" />
				<polygon fill={C_TOWER} points="146.6 73 139.8 78.7 139.9 77.6 146.5 72.2" />
			</motion.g>

			{/* Layer 5 — vertical hangers (cls-2). Long multi-segment paths, pathLength
			    draws them in left → right. */}
			<motion.path
				d={HANGERS_MAIN}
				fill="none"
				stroke={C_STROKE}
				strokeWidth={0.25}
				strokeMiterlimit={10}
				initial={{ pathLength: 0 }}
				animate={active ? { pathLength: 1 } : { pathLength: 0 }}
				transition={{
					duration: 1.6,
					ease: [0.4, 0, 0.2, 1],
					delay: 0.9,
				}}
			/>
			{HANGERS_RIGHT.map((d, i) => (
				<motion.path
					key={`h2-${i}`}
					d={d}
					fill="none"
					stroke={C_STROKE}
					strokeWidth={0.25}
					strokeMiterlimit={10}
					initial={{ pathLength: 0 }}
					animate={active ? { pathLength: 1 } : { pathLength: 0 }}
					transition={{
						duration: 0.5,
						ease: "easeOut",
						delay: 1.1 + i * 0.03,
					}}
				/>
			))}

			{/* Layer 6 — deck. scaleX from left so the road draws across. */}
			<motion.g
				style={{ transformOrigin: "0 60px" }}
				initial={{ scaleX: 0 }}
				animate={active ? { scaleX: 1 } : { scaleX: 0 }}
				transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 1.2 }}
			>
				<polygon
					fill={C_DECK}
					points="0 57.5 0 58.3 179.5 58.2 179.5 57.5"
				/>
				<polygon
					fill={C_DECK}
					points="0 58.6 0 62.5 179.5 62.5 179.5 58.6"
				/>
				{/* Cross-bracing in the deck (cls-7). Same scaleX since they're part
				    of the deck — they fill in as the road draws. */}
				{CROSS_BRACING.map((points, i) => (
					<polygon key={`xb-${i}`} fill={C_HANGER_FILL} points={points} />
				))}
			</motion.g>

		</svg>
	);
}
