export default class ContextSave implements Disposable {
	private context: CanvasRenderingContext2D;

	constructor(context: CanvasRenderingContext2D) {
		this.context = context;
		this.context.save();
	}

	[Symbol.dispose](): void {
		this.context.restore();
	}
}
