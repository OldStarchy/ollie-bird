import { styled } from '@stitches/react';
import { createFileRoute } from '@tanstack/react-router';
import React, { useId, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';

export const Route = createFileRoute('/grid')({
	component: GridPage,
});

const Pages = styled('div', {
	'@media screen': {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '20px',
	},

	'@media print': {
		background: 'none',
		padding: '0',
		margin: '0',
		display: 'block',
	},
});

const Page = styled('div', {
	'@media screen': {
		background: `
			repeating-linear-gradient(
				45deg,
				#f8f8f8 0px,
				#f8f8f8 10px,
				#e8e8e8 10px,
				#e8e8e8 20px
			)
		`,
		color: 'black',
		width: '210mm' /* Standard A4 Width */,
		height: '297mm' /* Standard A4 Height */,
		padding: '$$padding' /* Standard print margins */,
		boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
		boxSizing: 'border-box' /* Includes padding in the width/height */,
		zoom: 0.75,
	},

	'@media print': {
		boxShadow: 'none',
		margin: 0,
		padding: '$$padding',
		width: '100%' /* Let the @page rule handle dimensions */,
		minHeight: '100vh',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		breakAfter: 'page',
		zoom: 1,
		'&:last-child': {
			breakAfter: 'auto' /* Avoids an extra blank page at the end */,
		},
	},
});

const GridContainer = styled('div', {
	width: '100%',
	overflow: 'hidden',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	background: 'white',

	'@media screen': {
		border: '1px solid #aaa',
		height: '100%',
		'& line': {
			// strokeWidth: '2px',
		},
	},

	'@media print': {
		flex: 'none', // Don't grow/shrink in the flex container
	},
});

const NoPrint = styled('div', {
	'@media print': {
		display: 'none',
	},
});

function GridPage() {
	const pageWidthMm = 210;
	const pageHeightMm = 297;

	const [pageMarginMm, setPageMarginMm] = useState(8);

	const [lineThickness, setLineThickness] = useState(0.1);
	const [lineColor, setLineColor] = useState('#eee');
	const [gridSize, setGridSize] = useState(35);

	const [drawCircles, setDrawCircles] = useState(true);
	const [circleSize, setCircleSize] = useState(100); // Percentage of cell size
	const [drawDiagonals, setDrawDiagonals] = useState(false);
	const [pageCount, setPageCount] = useState(1);

	const safePageMarginMm = Number.isFinite(pageMarginMm)
		? Math.max(0, pageMarginMm)
		: 0;
	const safeGridSize =
		Number.isFinite(gridSize) && gridSize > 0 ? gridSize : 1;

	const printableWidthMm = Math.max(0, pageWidthMm - 2 * safePageMarginMm);
	const printableHeightMm = Math.max(0, pageHeightMm - 2 * safePageMarginMm);

	const gridColumns = Math.max(
		0,
		Math.floor(printableWidthMm / safeGridSize),
	);
	const gridRows = Math.max(0, Math.floor(printableHeightMm / safeGridSize));

	return (
		<div
			style={{
				display: 'grid',
				width: '100vw',
				height: '100vh',
				gridTemplateColumns: '1fr auto',
				gridTemplateRows: '1fr',
			}}
			className="print"
		>
			<style>
				{`\
body {
	display: flex;
	justify-content: center;
	padding: 20px;
}

@media print {
	body {
		background: none;
		padding: 0;
		margin: 0;
		display: block;
	}

	@page {
		size: A4;
		margin: 0;
	}
}
`}
			</style>
			<Pages className="print">
				{Array.from({ length: pageCount }).map((_, i) => (
					<Page css={{ $$padding: `${pageMarginMm}mm` }} key={i}>
						<GridContainer>
							<svg
								width={`${gridColumns * gridSize + lineThickness}mm`}
								height={`${gridRows * gridSize + lineThickness}mm`}
								viewBox={`-${lineThickness / 2} -${lineThickness / 2} ${gridColumns * gridSize + lineThickness} ${gridRows * gridSize + lineThickness}`}
								style={{ display: 'block' }}
							>
								{/* Vertical lines */}
								{Array.from({ length: gridColumns + 1 }).map(
									(_, i) => (
										<line
											key={`v-${i}`}
											x1={i * gridSize}
											y1={0}
											x2={i * gridSize}
											y2={gridRows * gridSize}
											stroke={lineColor}
											strokeWidth={lineThickness}
										/>
									),
								)}
								{/* Horizontal lines */}
								{Array.from({ length: gridRows + 1 }).map(
									(_, i) => (
										<line
											key={`h-${i}`}
											x1={0}
											y1={i * gridSize}
											x2={gridColumns * gridSize}
											y2={i * gridSize}
											stroke={lineColor}
											strokeWidth={lineThickness}
										/>
									),
								)}
								{/* Circles */}
								{drawCircles &&
									Array.from({ length: gridRows })
										.map((_, row) =>
											Array.from({
												length: gridColumns,
											}).map((_, col) => (
												<circle
													key={`circle-${row}-${col}`}
													cx={(col + 0.5) * gridSize}
													cy={(row + 0.5) * gridSize}
													r={Math.max(
														(gridSize / 2) *
															(circleSize / 100),
														lineThickness / 2,
													)}
													stroke={lineColor}
													strokeWidth={lineThickness}
													fill="none"
												/>
											)),
										)
										.flat()}
								{/* Diagonals */}
								{drawDiagonals &&
									Array.from({ length: gridRows })
										.map((_, row) =>
											Array.from({
												length: gridColumns,
											}).map((_, col) => [
												<line
													key={`diag1-${row}-${col}`}
													x1={col * gridSize}
													y1={row * gridSize}
													x2={(col + 1) * gridSize}
													y2={(row + 1) * gridSize}
													stroke={lineColor}
													strokeWidth={lineThickness}
												/>,
												<line
													key={`diag2-${row}-${col}`}
													x1={(col + 1) * gridSize}
													y1={row * gridSize}
													x2={col * gridSize}
													y2={(row + 1) * gridSize}
													stroke={lineColor}
													strokeWidth={lineThickness}
												/>,
											]),
										)
										.flat()
										.flat()}
							</svg>
						</GridContainer>
					</Page>
				))}
			</Pages>
			<NoPrint>
				<div
					style={{
						position: 'fixed',
						top: '1rem',
						right: '1rem',
						background: '#333',
						padding: '1rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '1rem',
						alignItems: 'flex-end',
					}}
				>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'auto 1fr',
							gap: '0.5rem',
						}}
					>
						<Field
							title="Line Thickness (mm)"
							type="number"
							value={lineThickness}
							onChange={(e) =>
								setLineThickness(e.target.valueAsNumber)
							}
							step="0.01"
							min="0.01"
						/>
						<Field
							title="Line Color"
							type="color"
							value={lineColor}
							onChange={(e) => setLineColor(e.target.value)}
						/>
						<Field
							title="Grid Size (mm)"
							type="number"
							value={gridSize}
							onChange={(e) =>
								setGridSize(e.target.valueAsNumber)
							}
							step="1"
							min="1"
						/>
						<Field
							title="Page Margin (mm)"
							type="number"
							value={pageMarginMm}
							onChange={(e) =>
								setPageMarginMm(e.target.valueAsNumber)
							}
							step="1"
							min="0"
						/>
						<Field
							title="Page Count"
							type="number"
							value={pageCount}
							onChange={(e) =>
								setPageCount(e.target.valueAsNumber)
							}
							step="1"
							min="1"
						/>
						<Field
							title="Draw Circles"
							type="checkbox"
							checked={drawCircles}
							onChange={(e) => setDrawCircles(e.target.checked)}
						/>
						<Field
							title="Circle Size (%)"
							type="number"
							value={circleSize}
							onChange={(e) =>
								setCircleSize(e.target.valueAsNumber)
							}
							step="5"
							min="0"
							max="100"
						/>
						<Field
							title="Draw Diagonals"
							type="checkbox"
							checked={drawDiagonals}
							onChange={(e) => setDrawDiagonals(e.target.checked)}
						/>
					</div>
					<Button onClick={() => window.print()}>Print</Button>
				</div>{' '}
			</NoPrint>
		</div>
	);
}

function Field({
	title,
	...props
}: React.ComponentProps<typeof Input> & { title: string }) {
	const id = useId();
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'subgrid',
				gridColumn: '1 / -1',
			}}
		>
			<label htmlFor={id}>{title}</label>
			<Input id={id} {...props} />
		</div>
	);
}
