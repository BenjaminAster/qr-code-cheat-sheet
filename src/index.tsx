
import { css, type Config as WinzigConfig } from "winzig";

winzigConfig: ({
	output: "../",
	appfiles: "appfiles",
	css: "./main.css",
	noCSSScopeRules: true,
	// noJavaScript: true,
}) satisfies WinzigConfig;

const masks = [
	{
		// reference before unmasking: 000
		// reference after unmasking: 101
		condition: (x: number, y: number) => (y * x) % 2 + (y * x) % 3 === 0,
		repeatX: 6,
		repeatY: 6,
	},
	{
		// reference before unmasking: 001
		// reference after unmasking: 100
		condition: (x: number, y: number) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
		repeatX: 6,
		repeatY: 4,
	},
	{
		// reference before unmasking: 010
		// reference after unmasking: 111
		condition: (x: number, y: number) => (((y + x) % 2 + (y * x) % 3) % 2) === 0,
		repeatX: 6,
		repeatY: 6,
	},
	{
		// reference before unmasking: 011
		// reference after unmasking: 110
		condition: (x: number, y: number) => (((y * x) % 2 + (y * x) % 3) % 2) === 0,
		repeatX: 6,
		repeatY: 6,
	},
	{
		// reference before unmasking: 100
		// reference after unmasking: 001
		condition: (x: number, y: number) => y % 2 === 0,
		repeatX: 6,
		repeatY: 6,
	},
	{
		// reference before unmasking: 101
		// reference after unmasking: 000
		condition: (x: number, y: number) => (y + x) % 2 === 0,
		repeatX: 6,
		repeatY: 6,
	},
	{
		// reference before unmasking: 110
		// reference after unmasking: 011
		condition: (x: number, y: number) => (y + x) % 3 === 0,
		repeatX: 6,
		repeatY: 6,
	},
	{
		// reference before unmasking: 111
		// reference after unmasking: 010
		condition: (x: number, y: number) => x % 3 === 0,
		repeatX: 6,
		repeatY: 6,
	},
];


const QRCode = ({ version, mask }: { version: number, mask: number; }) => {
	const size = version * 4 + 17;
	const svg = <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} width={1} height={1}>
		{css`
			& {
				--black: light-dark(#aaa, #777);
				--function-pattern: light-dark(blue, royalblue);
				/* --mask-information: light-dark(green, limegreen); */
				--mask-information: light-dark(red, red);
				/* --format-information: light-dark(gold, yellow); */
				--format-information: light-dark(yellowgreen, yellowgreen);
				--format-information: light-dark(yellow, gold);
				/* --function-pattern: light-dark(limegreen, springgreen); */
				/* --byte-border: light-dark(red, red); */
				--byte-border: light-dark(black, white);

				display: block;
				inline-size: 100%;
				block-size: 100%;
			}

			rect.black {
				fill: var(--black);
				stroke: none;
			}

			.function-pattern-rect-outline {
				fill: none;
				stroke: var(--function-pattern);
				stroke-width: 1;
				stroke-linejoin: miter;
			}

			.function-pattern-rect {
				fill: var(--function-pattern);
			}

			.function-pattern-background {
				fill: color-mix(in srgb, var(--function-pattern), transparent 60%);
			}

			.mask-information {
				fill: var(--mask-information);
			}

			.mask-information-background {
				fill: color-mix(in srgb, var(--mask-information), transparent 60%);
			}

			.format-information {
				fill: var(--format-information);
			}

			.byte-border {
				stroke: var(--byte-border);
				stroke-width: .2;
				stroke-linecap: round;
			}

			.byte-border-inside {
				stroke: white;
				stroke-width: .05;
				stroke-linecap: square;
			}

			.grid-marker {
				fill: light-dark(black, white);
			}

			.mask-repeat-grid-marker {
				stroke: light-dark(black, white);
				fill: light-dark(white, black);
				stroke-width: .2;
			}

			.turn-around-arrow {
				fill: none;
				stroke: red;
				stroke-width: .3;
				stroke-linecap: round;
				stroke-linejoin: round;
			}
		`}
	</svg>;
	const maskMatrix = Array.from({ length: size }, () => new Array(size).fill(0));
	const byteMatrix = Array.from({ length: size }, () => new Array(size).fill(1));
	const maskInfo = masks[mask];
	for (let y = 0; y < size; ++y) {
		for (let x = 0; x < size; ++x) {
			if (maskInfo.condition(x, y)) {
				maskMatrix[y][x] = 1;
			}
		}
	}
	for (let [finderX, finderY, width, height] of [[0, 0, 9, 9], [size - 8, 0, 8, 9], [0, size - 8, 9, 8]]) {
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				maskMatrix[finderY + y][finderX + x] = 0;
				byteMatrix[finderY + y][finderX + x] = undefined;
			}
		}
	}
	for (let i = 8; i < size - 8; ++i) {
		maskMatrix[6][i] = 0;
		maskMatrix[i][6] = 0;
		byteMatrix[6][i] = undefined;
		byteMatrix[i][6] = undefined;
	}
	if (version >= 2) {
		for (let y = 0; y < 5; ++y) {
			for (let x = 0; x < 5; ++x) {
				maskMatrix[size - 9 + y][size - 9 + x] = 0;
				byteMatrix[size - 9 + y][size - 9 + x] = undefined;
			}
		}
	}

	for (let y = 0; y < size; ++y) {
		for (let x = 0; x < size; ++x) {
			if (maskMatrix[y][x] === 1) {
				svg.append(<rect x={x} y={y} width={1} height={1} class="black" />);
			}
		}
	}

	svg.append(
		<path class="function-pattern-background" d={[
			`M 0 0`,
			`h 8`,
			`v 6`,
			`h ${size - 16}`,
			`v -6`,
			`h 8`,
			`v 8`,
			`h -8`,
			`v -1`,
			`h ${-(size - 16)}`,
			`v 1`,
			`h -1`,
			`v ${size - 16}`,
			`h 1`,
			`v 8`,
			`h -8`,
			`v -8`,
			`h 6`,
			`v ${-(size - 16)}`,
			`h -6`,
			`z`,
		].join(" ")} />
	);
	for (let [finderX, finderY] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
		svg.append(
			<rect class="function-pattern-rect-outline"
				x={finderX + .5} y={finderY + .5}
				width={6} height={6}
			/>,
			<rect class="function-pattern-rect"
				x={finderX + 2} y={finderY + 2}
				width={3} height={3}
			/>,
		);
	}
	for (let i = 8; i < size - 8; i += 2) {
		svg.append(
			<rect class="function-pattern-rect"
				x={i} y={6}
				width={1} height={1}
			/>,
			<rect class="function-pattern-rect"
				x={6} y={i}
				width={1} height={1}
			/>,
		);
	}
	svg.append(
		<rect class="function-pattern-rect"
			x={8} y={size - 8}
			width={1} height={1}
		/>,
	);
	if (version >= 2) {
		svg.append(
			<rect class="function-pattern-background"
				x={size - 9} y={size - 9}
				width={5} height={5}
			/>,
			<rect class="function-pattern-rect-outline"
				x={size - 8.5} y={size - 8.5}
				width={4} height={4}
			/>,
			<rect class="function-pattern-rect"
				x={size - 7} y={size - 7}
				width={1} height={1}
			/>,
		);
	}
	svg.append(
		<rect class="mask-information-background"
			x={2} y={8}
			width={3} height={1}
		/>,
		<rect class="mask-information-background"
			x={8} y={size - 5}
			width={1} height={3}
		/>,
	);
	for (let i = 0; i < 3; ++i) {
		if (mask & (1 << i)) {
			svg.append(
				<rect class="mask-information"
					x={4 - i} y={8}
					width={1} height={1}
				/>,
				<rect class="mask-information"
					x={8} y={size - 5 + i}
					width={1} height={1}
				/>,
			);
		}
	}
	svg.append(
		<rect class="format-information"
			x={0} y={8}
			width={2} height={1}
		/>,
		<rect class="format-information"
			x={5} y={8}
			width={1} height={1}
		/>,
		<path class="format-information"
			d="M 8 7 h 1 v 2 h -2 v -1 h 1"
		/>,
		<rect class="format-information"
			x={8} y={0}
			width={1} height={6}
		/>,
		<rect class="format-information"
			x={size - 8} y={8}
			width={8} height={1}
		/>,
		<rect class="format-information"
			x={8} y={size - 7}
			width={1} height={2}
		/>,
		<rect class="format-information"
			x={8} y={size - 2}
			width={1} height={2}
		/>,
	);

	for (let y = 1; y <= 2; ++y) {
		for (let x = 1; x <= 2; ++x) {
			byteMatrix[size - y][size - x] = 2;
		}
	}

	let currentByteNumber = 3;
	let currentByteBitCount = 0;
	for (let i = 0; i <= size; i += 2) {
		if (i === size - 7) ++i;
		for (let j = 0; j < size; ++j) {
			for (let k = 1; k <= 2; ++k) {
				const x = size - i - k;
				const y = (i & 2) ? j : (size - j - 1);
				if (byteMatrix[y][x] === 1) {
					byteMatrix[y][x] = currentByteNumber;
					++currentByteBitCount;
					if (currentByteBitCount >= 8) {
						++currentByteNumber;
						currentByteBitCount = 0;
					}
				}
			}
		}
	}

	for (let y = 0; y <= size; ++y) {
		for (let x = 0; x <= size; ++x) {
			if (byteMatrix[y - 1]?.[x] !== byteMatrix[y]?.[x]) {
				svg.append(
					<line x1={x} y1={y} x2={x + 1} y2={y} class="byte-border" />
				);
			}
			if (byteMatrix[y]?.[x - 1] !== byteMatrix[y]?.[x]) {
				svg.append(
					<line x1={x} y1={y} x2={x} y2={y + 1} class="byte-border" />
				);
			}
		}
	}

	for (let y = 0; y <= size; ++y) {
		for (let x = 0; x <= size; ++x) {
			svg.append(
				(x % maskInfo.repeatX === 0 && y % maskInfo.repeatY === 0)
					? <ellipse cx={x} cy={y} rx={.3} ry={.3} class="mask-repeat-grid-marker" />
					: <ellipse cx={x} cy={y} rx={.075} ry={.075} class="grid-marker" />,
			);
		}
	}

	// for (let y = 0; y <= size; y += maskInfo.repeatY) {
	// 	for (let x = 0; x <= size; x += maskInfo.repeatX) {
	// 		svg.append(
	// 			<ellipse cx={x} cy={y} rx={.3} ry={.3} class="mask-repeat-grid-marker" />
	// 		);
	// 	}
	// }

	for (let x = size - 6; x >= 11; x -= 4) {
		svg.append(
			<path d={`M ${x + 1} ${size - .5} v .5 a .5 .5 0 0 0 .5 .5 h 1 a .5 .5 0 0 0 .5 -.5 v -.5`} class="turn-around-arrow" />,
			<polyline points={[x + .5, size, x + 1, size - .5, x + 1.5, size].join(" ")} class="turn-around-arrow" />,
		);
	}

	for (let x = size - 4; x >= 9; x -= 4) {
		const y = (x >= size - 8) ? 9 : 0;
		svg.append(
			<path d={`M ${x + 1} ${y + .5} v -.5 a .5 .5 0 0 1 .5 -.5 h 1 a .5 .5 0 0 1 .5 .5 v .5`} class="turn-around-arrow" />,
			<polyline points={[x + .5, y, x + 1, y + .5, x + 1.5, y].join(" ")} class="turn-around-arrow" />,
		);
	}

	return svg;
};

const MaskSVG = ({ mask }: { mask: number; }) => {
	const maskInfo = masks[mask];
	const width = maskInfo.repeatX;
	const height = maskInfo.repeatY;
	const svg = <svg viewBox={`-1 -1 8 8`} width={8} height={8}>
		{css`
			& {
				display: block;
				inline-size: 100%;
				block-size: 100%;
			}

			.black {
				fill: light-dark(black, white);
			}

			.border {
				stroke: light-dark(gray, gray);
				stroke-width: .1;
				stroke-linecap: round;
			}
		`}
	</svg>;
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (maskInfo.condition(x, y)) {
				svg.append(
					<rect class="black" x={x} y={y} width={1} height={1} />,
				);
			}
		}
	}
	for (let y = 0; y <= height; ++y) {
		svg.append(
			<line class="border" x1={0} y1={y} x2={width} y2={y} />,
		);
	}
	for (let x = 0; x <= width; ++x) {
		svg.append(
			<line class="border" x1={x} y1={0} x2={x} y2={height} />,
		);
	}
	return svg;
};

const Table = () => {
	let tBody: HTMLTableSectionElement;
	let tHeadRow: HTMLTableRowElement;
	const table = <table>
		<thead>
			<tr bind:this={tHeadRow}>
				<td class="corner"></td>
			</tr>
		</thead>
		<tbody bind:this={tBody}></tbody>
		{css`
			& {
				/* block-size: 120dvi; */
				inline-size: 100%;
				border-spacing: 0;
				table-layout: fixed;
			}

			td.corner {
				inline-size: 4rem;
			}

			th, td {
				font-weight: normal;
				padding: 0;
				text-align: center;
			}

			tbody th {
				text-align: -webkit-center;
				inline-size: 4rem;
			}
		`}
	</table>;

	for (let version = 1; version <= 6; ++version) {
		tHeadRow.append(
			<th>
				Version {version} ({version * 4 + 17}&#xD7;{version * 4 + 17})<br />
				<span>
					{version * 2 + 1} black timing modules
					{css`
						& {
							font-size: .8rem;
						}
					`}
				</span>
			</th>
		);
	}

	for (let mask = 0; mask <= 7; ++mask) {
		const tableRow = <tr>
			<th>
				Mask {mask}
				<div>
					{...Array.from({ length: 3 }, (_, i) => {
						const isOne = (mask & (1 << (2 - i)));
						return <div className={isOne ? "one" : "zero"}>{isOne ? 1 : 0}</div>;
					})}
					{css`
						& {
							border-collapse: collapse;
							line-height: 1;
							inline-size: fit-content;
							font-size: .8rem;
						}

						& > div {
							font-family: monospace;
							display: table-cell;
							border: 1px solid gray;
							block-size: 1.3em;
							inline-size: 1.3em;
							vertical-align: middle;

							&.one {
								background: light-dark(black, white);
								color: light-dark(white, black);
							}
						}
					`}
				</div>
				<MaskSVG mask={mask} />
			</th>
		</tr>;
		for (let version = 1; version <= 6; ++version) {
			tableRow.append(
				<td>
					<QRCode mask={mask} version={version} />
				</td>
			);
		}
		tBody.append(tableRow);
	}

	return table;
};

;
<html lang="en">
	<head>
		<title>QR Code Cheat Sheet</title>
		<meta name="description" content="An app built with winzig." />
	</head>
	<body>
		<Table />
	</body>
</html>;
