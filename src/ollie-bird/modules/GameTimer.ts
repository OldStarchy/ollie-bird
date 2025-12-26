import Module from '../IModular';

export default class GameTimer extends Module {
	private elapsedTime: number = 0;
	private running: boolean = false;

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
		this.owner.onGameEvent('gameStart', () => {
			this.reset();
			this.start();
		});

		this.owner.onGameEvent('gameOver', () => {
			this.stop();
		});
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
		context.save();
		context.font = '20px Arial';
		context.fillStyle = 'black';
		const centerX = this.owner.game.canvas.width / 2;
		context.textAlign = 'center';
		context.fillText(timeString, centerX, 30);
		context.textAlign = 'left';
		context.restore();
	}
}
