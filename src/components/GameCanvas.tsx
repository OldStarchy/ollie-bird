import { styled } from '@stitches/react';
import {
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type RefObject,
} from 'react';
import useResizeObserver from 'use-resize-observer';
import type BaseGame from '../ollie-bird/core/BaseGame';
import type { GameCanvas as GameCanvasObj } from '../ollie-bird/core/BaseGame';
import type { VirtualButton } from '../ollie-bird/core/input/VirtualButton';
import { OnScreenButton } from './OnScreenButton';

const TouchOnlyContainer = styled('div', {
	display: 'none',
	'@media (pointer: coarse)': {
		display: 'contents',
	},
});

const CanvasBox = styled('div', {
	display: 'grid',
	gridTemplateColumns: '1fr',
	gridTemplateRows: '1fr',

	'@media (pointer: coarse)': {
		gridTemplateColumns: '1fr auto 1fr',
		gridTemplateRows: '1fr 1fr',
		gridTemplateAreas: `
			"reset canvas flap"
			"left canvas right"`,
	},

	'@media  (pointer: coarse) and (max-width: 600px)': {
		gridTemplateColumns: '1fr 1fr',
		gridTemplateRows: '1fr auto 1fr',
		gridTemplateAreas: `
				"reset flap"
				"canvas canvas"
				"left right"`,
	},
});

export default function GameCanvas({
	game,
	style,
	ref,
}: {
	game: BaseGame;
	style?: React.CSSProperties;
	ref?: RefObject<{ focus(): void } | null>;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasObj = useRef<GameCanvasObj | null>(null);

	const { ref: containerRef } = useResizeObserver<HTMLDivElement>({
		onResize: ({ width, height }) => {
			if (
				canvasRef.current &&
				width !== undefined &&
				height !== undefined
			) {
				// Calculate the game world aspect ratio
				const gameAspectRatio = game.width / game.height;
				const containerAspectRatio = width / height;

				let canvasWidth: number;
				let canvasHeight: number;

				// Maximize canvas size: 100% width for portrait, 100% height for landscape
				if (containerAspectRatio < 1) {
					// Portrait mode - fill width (100% width)
					canvasWidth = width;
					canvasHeight = width / gameAspectRatio;
				} else {
					// Landscape mode - fill height (100% height)
					canvasHeight = height;
					canvasWidth = height * gameAspectRatio;
				}

				canvasRef.current.style.width = `${canvasWidth}px`;
				canvasRef.current.style.height = `${canvasHeight}px`;
				canvasObj.current?.requestResize();
			}
		},
	});

	useImperativeHandle(ref, () => {
		return {
			focus() {
				canvasRef.current?.focus();
			},
		};
	}, []);

	useEffect(() => {
		if (!canvasRef.current) return;

		canvasObj.current = game.addCanvas(canvasRef.current);

		return () => {
			canvasObj.current?.[Symbol.dispose]();
			canvasObj.current = null;
		};
	}, [game]);

	const [leftButton, setLeftButton] = useState<VirtualButton | null>(null);
	const [rightButton, setRightButton] = useState<VirtualButton | null>(null);
	const [flapButton, setFlapButton] = useState<VirtualButton | null>(null);
	const [resetButton, setResetButton] = useState<VirtualButton | null>(null);

	useEffect(() => {
		const left = game.input.getButton('virtual.left') as VirtualButton;
		const right = game.input.getButton('virtual.right') as VirtualButton;
		const flap = game.input.getButton('virtual.up') as VirtualButton;
		const reset = game.input.getButton('virtual.reset') as VirtualButton;

		setResetButton(reset);
		setLeftButton(left);
		setRightButton(right);
		setFlapButton(flap);

		return () => {
			setLeftButton(null);
			setRightButton(null);
			setFlapButton(null);
			setResetButton(null);
		};
	}, [game]);

	return (
		<CanvasBox style={style}>
			<div
				style={{
					gridArea: 'canvas',
					position: 'relative',
				}}
				ref={containerRef}
			>
				<canvas
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
					tabIndex={-1}
					ref={canvasRef}
				/>
			</div>
			<TouchOnlyContainer>
				{flapButton && leftButton && rightButton && resetButton && (
					<>
						<OnScreenButton
							button={resetButton}
							style={{
								gridArea: 'reset',
								backgroundColor: 'green',
							}}
						/>
						<OnScreenButton
							button={flapButton}
							style={{
								gridArea: 'flap',
								backgroundColor: 'red',
							}}
						/>
						<OnScreenButton
							button={leftButton}
							style={{
								gridArea: 'left',
								backgroundColor: 'yellow',
							}}
						/>
						<OnScreenButton
							button={rightButton}
							style={{
								gridArea: 'right',
								backgroundColor: 'blue',
							}}
						/>
					</>
				)}
			</TouchOnlyContainer>
		</CanvasBox>
	);
}
