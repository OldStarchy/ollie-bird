import { useEffect, useRef } from 'react';
import type Sprite from '../ollie-bird/core/Sprite';
import { useReactInterop } from '../react-interop/ReactInterop';
import { ReactInteropInspector } from '../react-interop/ReactInteropInspector';

export function SpriteEditor({ sprite }: { sprite: Sprite }) {
	const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);

	const [{ origin: _origin, sourceRect, src: _src }] =
		useReactInterop(sprite);

	useEffect(() => {
		const sheetCanvas = sheetCanvasRef.current;
		const previewCanvas = previewCanvasRef.current;

		const image = sprite.image;

		if (sheetCanvas)
			renderImageSheetWithSourceRect(sheetCanvas, image, sprite);
		if (previewCanvas) renderImageSourceRect(previewCanvas, image, sprite);
	}, [sprite, sourceRect]);

	return (
		<div>
			<div style={{ display: 'flex' }}>
				<canvas
					ref={sheetCanvasRef}
					style={{ width: '100px', height: '100px' }}
				/>
				<canvas
					ref={previewCanvasRef}
					style={{ width: '100px', height: '100px' }}
				/>
			</div>
			<ReactInteropInspector model={sprite} />
		</div>
	);
}

function renderImageSheetWithSourceRect(
	canvas: HTMLCanvasElement,
	image: HTMLImageElement,
	sprite: Sprite,
) {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.scale(canvas.width / image.width, canvas.height / image.height);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, 0, 0, image.width, image.height);

	ctx.strokeStyle = 'red';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.rect(
		sprite.sourceRect.x,
		sprite.sourceRect.y,
		sprite.sourceRect.width,
		sprite.sourceRect.height,
	);
	ctx.stroke();

	ctx.beginPath();
	ctx.rect(0, 0, image.width, sprite.sourceRect.y);
	ctx.rect(
		0,
		sprite.sourceRect.y,
		sprite.sourceRect.x,
		sprite.sourceRect.height,
	);
	ctx.rect(
		sprite.sourceRect.x + sprite.sourceRect.width,
		sprite.sourceRect.y,
		image.width - (sprite.sourceRect.x + sprite.sourceRect.width),
		sprite.sourceRect.height,
	);
	ctx.rect(
		0,
		sprite.sourceRect.y + sprite.sourceRect.height,
		image.width,
		image.height - (sprite.sourceRect.y + sprite.sourceRect.height),
	);
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fill();
}

function renderImageSourceRect(
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement,
	sprite: Sprite,
) {
	if (!canvas) return;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.scale(
		canvas.width / sprite.sourceRect.width,
		canvas.height / sprite.sourceRect.height,
	);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(
		image,
		sprite.sourceRect.x,
		sprite.sourceRect.y,
		sprite.sourceRect.width,
		sprite.sourceRect.height,
		0,
		0,
		sprite.sourceRect.width,
		sprite.sourceRect.height,
	);
}
