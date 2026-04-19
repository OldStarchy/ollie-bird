import { describe, expect, test } from 'vitest';
import { SwipeDetector } from './SwipeDetector';
import Touch from './Touch';
import { TouchButton } from './TouchButton';
import { TouchPointer } from './TouchPointer';

// ─── TouchPointer ─────────────────────────────────────────────────────────────

describe('TouchPointer', () => {
	test('starts inactive', () => {
		const pointer = new TouchPointer();
		expect(pointer.isActive).toBe(false);
		expect(pointer.wasActive).toBe(false);
	});

	test('isActive reflects _setActive', () => {
		const pointer = new TouchPointer();
		pointer._setActive(true);
		expect(pointer.isActive).toBe(true);
	});

	test('wasActive reflects previous state after _step', () => {
		const pointer = new TouchPointer();
		pointer._setActive(true);
		pointer._step();
		expect(pointer.wasActive).toBe(true);
		pointer._setActive(false);
		expect(pointer.wasActive).toBe(true); // still true until next step
		pointer._step();
		expect(pointer.wasActive).toBe(false);
	});

	test('isPressed is true for exactly one step', () => {
		const pointer = new TouchPointer();
		// Before first touch
		expect(pointer.isPressed).toBe(false);

		pointer._setActive(true);
		expect(pointer.isPressed).toBe(true); // just pressed

		pointer._step();
		expect(pointer.isPressed).toBe(false); // held
	});

	test('isReleased is true for exactly one step', () => {
		const pointer = new TouchPointer();
		pointer._setActive(true);
		pointer._step();

		pointer._setActive(false);
		expect(pointer.isReleased).toBe(true); // just released

		pointer._step();
		expect(pointer.isReleased).toBe(false);
	});

	test('position is updated by _setPosition', () => {
		const pointer = new TouchPointer();
		pointer._setPosition(100, 200);
		expect(pointer.x).toBe(100);
		expect(pointer.y).toBe(200);
	});

	test('previousPosition is updated by _step', () => {
		const pointer = new TouchPointer();
		pointer._setPosition(100, 200);
		pointer._step();
		pointer._setPosition(300, 400);
		expect(pointer.previousX).toBe(100);
		expect(pointer.previousY).toBe(200);
	});
});

// ─── TouchButton ──────────────────────────────────────────────────────────────

describe('TouchButton', () => {
	test('isDown mirrors pointer.isActive', () => {
		const pointer = new TouchPointer();
		const btn = new TouchButton(pointer);
		expect(btn.isDown).toBe(false);

		pointer._setActive(true);
		expect(btn.isDown).toBe(true);
	});

	test('wasDown mirrors pointer.wasActive', () => {
		const pointer = new TouchPointer();
		const btn = new TouchButton(pointer);
		pointer._setActive(true);
		pointer._step();
		expect(btn.wasDown).toBe(true);
	});
});

// ─── SwipeDetector ────────────────────────────────────────────────────────────

describe('SwipeDetector', () => {
	function makePointerWithDetector(threshold = 50) {
		const pointer = new TouchPointer();
		const detector = new SwipeDetector(pointer, threshold);
		return { pointer, detector };
	}

	/** Simulate: step, then set state, representing "events happened, now step" */
	function frame(
		pointer: TouchPointer,
		detector: SwipeDetector,
		active: boolean,
		x?: number,
		y?: number,
	) {
		// Swipe detector steps before pointer state is advanced (matches Touch.step())
		detector.step();
		pointer._step();
		if (x !== undefined && y !== undefined) pointer._setPosition(x, y);
		pointer._setActive(active);
	}

	test('no swipe when movement is below threshold', () => {
		const { pointer, detector } = makePointerWithDetector(50);

		// Touch down at (0,0)
		pointer._setPosition(0, 0);
		pointer._setActive(true);

		// Step a few frames, move slightly
		frame(pointer, detector, true, 20, 0);
		frame(pointer, detector, true, 30, 0);

		// Lift at (30,0) – only 30px, below threshold of 50
		frame(pointer, detector, false);
		// One more frame to see the swipe button
		frame(pointer, detector, false);

		expect(detector.isSwipe('right')).toBe(false);
	});

	test('detects right swipe', () => {
		const { pointer, detector } = makePointerWithDetector(50);

		pointer._setPosition(0, 0);
		pointer._setActive(true);
		frame(pointer, detector, true, 80, 0); // moved right
		frame(pointer, detector, false); // lifted
		// Swipe should now be detected
		detector.step();

		expect(detector.isSwipe('right')).toBe(true);
		expect(detector.isSwipe('left')).toBe(false);
		expect(detector.isSwipe('up')).toBe(false);
		expect(detector.isSwipe('down')).toBe(false);
	});

	test('detects left swipe', () => {
		const { pointer, detector } = makePointerWithDetector(50);

		pointer._setPosition(100, 0);
		pointer._setActive(true);
		frame(pointer, detector, true, 30, 0);
		frame(pointer, detector, false);
		detector.step();

		expect(detector.isSwipe('left')).toBe(true);
	});

	test('detects down swipe', () => {
		const { pointer, detector } = makePointerWithDetector(50);

		pointer._setPosition(0, 0);
		pointer._setActive(true);
		frame(pointer, detector, true, 0, 80);
		frame(pointer, detector, false);
		detector.step();

		expect(detector.isSwipe('down')).toBe(true);
	});

	test('detects up swipe', () => {
		const { pointer, detector } = makePointerWithDetector(50);

		pointer._setPosition(0, 100);
		pointer._setActive(true);
		frame(pointer, detector, true, 0, 30);
		frame(pointer, detector, false);
		detector.step();

		expect(detector.isSwipe('up')).toBe(true);
	});

	test('swipe fires for only one step', () => {
		const { pointer, detector } = makePointerWithDetector(50);

		pointer._setPosition(0, 0);
		pointer._setActive(true);
		frame(pointer, detector, true, 80, 0);
		frame(pointer, detector, false);

		// Simulate one frame: detector reads "just released" → swipe fires
		detector.step();
		pointer._step();

		expect(detector.isSwipe('right')).toBe(true);

		// Next frame — swipe should be cleared
		detector.step();
		pointer._step();

		expect(detector.isSwipe('right')).toBe(false);
	});
});

// ─── Touch (integration) ─────────────────────────────────────────────────────

describe('Touch', () => {
	test('getPointer returns a TouchPointer for each index', () => {
		const touch = new Touch();
		const p0 = touch.getPointer(0);
		const p1 = touch.getPointer(1);
		expect(p0).toBeInstanceOf(TouchPointer);
		expect(p1).toBeInstanceOf(TouchPointer);
		expect(p0).not.toBe(p1);
	});

	test('getButton returns a TouchButton', () => {
		const touch = new Touch();
		const btn = touch.getButton(0);
		expect(btn).toBeInstanceOf(TouchButton);
	});

	test('step advances all pointer states', () => {
		const touch = new Touch();
		const p = touch.getPointer(0);
		p._setActive(true);
		touch.step();
		expect(p.wasActive).toBe(true);
	});

	test('createSwipeDetector returns a SwipeDetector', () => {
		const touch = new Touch();
		const detector = touch.createSwipeDetector(0, 40);
		expect(detector).toBeInstanceOf(SwipeDetector);
		expect(detector.threshold).toBe(40);
	});
});
