export default function contextCheckpoint(
	context: CanvasRenderingContext2D,
): Disposable {
	context.save();

	return {
		[Symbol.dispose](): void {
			context.restore();
		},
	};
}
