import { useEffect, useMemo, useRef, useState } from 'react';
import z from 'zod';
import type Sprite from '../../ollie-bird/core/Sprite';
import type EventSource from '../../ollie-bird/EventSource';
import Resources from '../../ollie-bird/Resources';
import type { NotifyPropertyChanged } from '../../property/NotifyPropertyChanged';
import useGameContext from '../GameContext';
import ZodField from '../ZodField';

export default function ResourcesPanel() {
	const _game = useGameContext();

	const sprites = useMemo(() => Resources.sprites, []);

	return (
		<div>
			{sprites.map((sprite, index) => (
				<div key={index}>
					<SpriteEditor sprite={sprite} />
				</div>
			))}
		</div>
	);
}

function useChangingObject<
	T extends { change: EventSource<{ change: void }>; clone(): T },
>(obj: T): T {
	const [snap, setSnap] = useState(obj.clone());

	useEffect(() => {
		setSnap(obj.clone());
		const off = obj.change.on('change', () => {
			setSnap(obj.clone());
		});
		return () => off();
	}, [obj]);

	return snap;
}

function useChangingProperty<
	T extends NotifyPropertyChanged,
	K extends keyof T,
>(obj: T, key: K): T[K] {
	const [value, setValue] = useState(obj[key]);

	useEffect(() => {
		setValue(obj[key]);
		const off = obj.propertyChanged.on('change', (e) => {
			if (e.name === key) {
				setValue(obj[key]);
			}
		});
		return () => off();
	}, [obj, key]);

	return value;
}

function SpriteEditor({ sprite }: { sprite: Sprite }) {
	const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);

	const [rr, rerender] = useState({});

	const sourceRect = useChangingObject(sprite.sourceRect);
	const origin = useChangingObject(sprite.origin);

	useEffect(
		() => sprite.propertyChanged.on('change', () => rerender({})),
		[sprite],
	);
	useEffect(
		() => sprite.sourceRect.change.on('change', () => rerender({})),
		[sprite],
	);

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
			<ZodField
				schema={z.string().meta({ title: 'Image URL' })}
				value={sprite.image.src}
				onChange={(v) => {
					sprite.image.src = v;
				}}
			/>
			<label>Source Rect</label>
			<div>
				<ZodField
					schema={z.number().min(0).meta({ title: 'X' })}
					value={sprite.sourceRect.x}
					onChange={(v) => {
						sprite.sourceRect.x = v;
					}}
				/>
				<ZodField
					schema={z.number().min(0).meta({ title: 'Y' })}
					value={sprite.sourceRect.y}
					onChange={(v) => {
						sprite.sourceRect.y = v;
					}}
				/>
				<ZodField
					schema={z.number().min(1).meta({ title: 'Width' })}
					value={sprite.sourceRect.width}
					onChange={(v) => {
						sprite.sourceRect.width = v;
					}}
				/>
				<ZodField
					schema={z.number().min(1).meta({ title: 'Height' })}
					value={sprite.sourceRect.height}
					onChange={(v) => {
						sprite.sourceRect.height = v;
					}}
				/>
			</div>
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
