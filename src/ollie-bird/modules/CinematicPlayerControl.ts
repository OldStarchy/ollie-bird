import type { BirdControls } from '../BirdControls';
import Module from '../core/Module';
import Cinematic from './Cinematic';

export default class CinematicPlayerControl extends Module {
	get cinematic(): Cinematic | null {
		return this.getModule(Cinematic);
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.cinematic) {
			return;
		}

		const controls = this.game.input.getSchema<BirdControls>(`Player 1`);

		const text =
			`Play/pause: ${controls.Flap.name}\nBack: ${controls.Left.name}\nForward: ${controls.Right.name}\nSkip: ${controls.Restart.name}`.split(
				'\n',
			);

		context.font = '16px sans-serif';
		context.textAlign = 'right';
		context.textBaseline = 'bottom';

		const textWidth = text
			.map((line) => context.measureText(line))
			.reduce((max, metrics) => {
				return Math.max(max, metrics.width);
			}, 0);

		const padding = 10;
		const lineHeight = 20;
		const totalHeight = lineHeight * text.length;

		context.beginPath();
		context.rect(
			this.game.width - textWidth - padding * 2,
			this.game.height - totalHeight - padding * 2,
			textWidth + padding * 2,
			totalHeight + padding * 2,
		);
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.fill();

		context.fillStyle = 'white';
		text.forEach((line, index) => {
			context.fillText(
				line,
				this.game.width - padding,
				this.game.height - totalHeight + index * lineHeight + padding,
			);
		});
	}

	handleInput(): void {
		const cinematic = this.cinematic;
		if (!cinematic) return;

		const controls = this.game.input.getSchema<BirdControls>(`Player 1`);

		if (controls.Flap.isPressed) {
			cinematic.toggle();
		}

		if (controls.Restart.isPressed) {
			this.owner.destroy();
		}

		if (controls.Left.isPressed) {
			cinematic.jumpBack();
		}

		if (controls.Right.isPressed) {
			cinematic.jumpForward();
		}
	}

	protected override beforeUpdate(): void {
		this.handleInput();
	}
}
