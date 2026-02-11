import contextCheckpoint from '../../contextCheckpoint';
import Module from '../core/Module';
import filterEvent from '../core/rxjs/filterEvent';
import LevelEditor from '../game-object/LevelEditor';

export default class GameTimer extends Module {
	static readonly displayName = 'GameTimer';

	private elapsedTime: number = 0;
	private running: boolean = false;

	private get levelController(): LevelEditor {
		if (this.owner instanceof LevelEditor) return this.owner;

		// TODO(#47): move LevelEditor logic to module
		throw new Error(
			`${GameTimer.displayName} must be attached to a ${LevelEditor.defaultName}`,
		);
	}

	start(): void {
		this.running = true;
	}

	stop(): void {
		this.running = false;
	}

	reset(): void {
		this.elapsedTime = 0;
	}

	protected override update(): void {
		if (this.running) {
			this.elapsedTime += this.owner.game.secondsPerFrame;
		}
	}

	protected override initialize(): void {
		this.disposableStack.use(
			this.levelController.levelEvent$
				.pipe(filterEvent('levelStart'))
				.subscribe(() => {
					this.reset();
					this.start();
				}),
		);

		this.disposableStack.use(
			this.levelController.levelEvent$
				.pipe(filterEvent('levelComplete'))
				.subscribe(() => {
					this.stop();
				}),
		);
	}

	private formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const secs = Math.floor(seconds % 60)
			.toString()
			.padStart(2, '0');
		const millis = Math.floor((seconds % 1) * 1000)
			.toString()
			.padStart(3, '0');
		return `${mins}:${secs}.${millis}`;
	}

	protected override render(context: CanvasRenderingContext2D): void {
		const timeString = this.formatTime(this.elapsedTime);
		using _ = contextCheckpoint(context);

		context.font = '20px Arial';
		context.fillStyle = 'black';
		const centerX = this.owner.game.width / 2;
		context.textAlign = 'center';
		context.fillText(timeString, centerX, 30);
		context.textAlign = 'left';
	}
}
