import { describe, expect, test } from 'vitest';
import Gamepad from './Gamepad';
import { XboxGamepadButtonMap } from './XboxGamepadButtonMap';

function fakeGamepad(index: number, pressed: number[] = []) {
	return {
		index,
		connected: true,
		axes: [0, 0, 0, 0],
		buttons: Array.from({ length: 17 }, (_, i) => ({
			pressed: pressed.includes(i),
			touched: pressed.includes(i),
			value: pressed.includes(i) ? 1 : 0,
		})),
	} as unknown as globalThis.Gamepad;
}

function setGamepads(gamepads: (globalThis.Gamepad | null)[]) {
	Object.defineProperty(navigator, 'getGamepads', {
		configurable: true,
		value: () => gamepads,
	});
}

describe('Gamepad', () => {
	test('assigns slot 0 to a gamepad the browser puts at index 1', () => {
		const input = new Gamepad();
		const flap = input.getButton(0, XboxGamepadButtonMap.A);

		setGamepads([null, fakeGamepad(1, [XboxGamepadButtonMap.A])]);
		input.step();

		expect(flap.isDown).toBe(true);
		expect(input.getButton(1, XboxGamepadButtonMap.A).isDown).toBe(false);
	});

	test('keeps slots stable when an earlier gamepad disconnects', () => {
		const input = new Gamepad();

		setGamepads([fakeGamepad(0), fakeGamepad(1)]);
		input.step();

		setGamepads([null, fakeGamepad(1, [XboxGamepadButtonMap.A])]);
		input.step();

		expect(input.getButton(0, XboxGamepadButtonMap.A).isDown).toBe(false);
		expect(input.getButton(1, XboxGamepadButtonMap.A).isDown).toBe(true);
	});

	test('reuses a freed slot for a newly connected gamepad', () => {
		const input = new Gamepad();

		setGamepads([fakeGamepad(0), fakeGamepad(1)]);
		input.step();

		setGamepads([null, fakeGamepad(1)]);
		input.step();

		setGamepads([
			null,
			fakeGamepad(1),
			fakeGamepad(2, [XboxGamepadButtonMap.A]),
		]);
		input.step();

		expect(input.getButton(0, XboxGamepadButtonMap.A).isDown).toBe(true);
	});
});
