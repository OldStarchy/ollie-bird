import { useEffect, useImperativeHandle, useRef, type RefObject } from 'react';
import useResizeObserver from 'use-resize-observer';
import type BaseGame from '../ollie-bird/BaseGame';
import type { GameCanvas as GameCanvasObj } from '../ollie-bird/BaseGame';

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
				const w = width;
				const h = height;

				canvasRef.current.style.width = `${w}px`;
				canvasRef.current.style.height = `${h}px`;
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

	return (
		<div ref={containerRef} style={style}>
			<canvas
				tabIndex={-1}
				style={{
					width: '100%',
					height: '100%',
				}}
				ref={canvasRef}
			/>
		</div>
	);
}
