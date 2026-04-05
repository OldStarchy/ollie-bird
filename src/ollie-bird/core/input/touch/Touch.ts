import type { Vec2Like } from '../../math/Vec2';
import type { Button } from '../Button';
import { SwipeDetector } from './SwipeDetector';
import { TouchButton } from './TouchButton';
import { TouchPointer } from './TouchPointer';

/**
 * Tracks all active touch points and manages swipe detectors.
 *
 * Attach to a canvas element via attachTo(). Call step() each frame
 * (done automatically when added to Input).
 */
export default class Touch implements Disposable {
	readonly #disposableStack = new DisposableStack();

	/** Indexed by slot (0 = first finger down, 1 = second, …). */
	readonly #pointers: TouchPointer[] = [];

	/** Maps DOM touch identifier → slot index. */
	readonly #touchIdToSlot = new Map<number, number>();

	readonly #swipeDetectors: SwipeDetector[] = [];

	// ─── Internal helpers ────────────────────────────────────────────────────

	#getOrCreatePointer(slot: number): TouchPointer {
		if (!this.#pointers[slot]) {
			this.#pointers[slot] = new TouchPointer();
		}
		return this.#pointers[slot];
	}

	#getFreeSlot(): number {
		for (let i = 0; i < this.#pointers.length; i++) {
			const pointer = this.#pointers[i];
			if (pointer && !pointer.isActive) {
				return i;
			}
		}
		return this.#pointers.length;
	}

	// ─── Event handlers ──────────────────────────────────────────────────────

	readonly #handleTouchStart = (id: number, x: number, y: number): void => {
		const slot = this.#getFreeSlot();
		this.#touchIdToSlot.set(id, slot);
		const pointer = this.#getOrCreatePointer(slot);
		pointer._setPosition(x, y);
		pointer._setActive(true);
	};

	readonly #handleTouchMove = (id: number, x: number, y: number): void => {
		const slot = this.#touchIdToSlot.get(id);
		if (slot === undefined) return;
		this.#pointers[slot]?._setPosition(x, y);
	};

	readonly #handleTouchEnd = (id: number): void => {
		const slot = this.#touchIdToSlot.get(id);
		if (slot === undefined) return;
		this.#pointers[slot]?._setActive(false);
		this.#touchIdToSlot.delete(id);
	};

	// ─── Public API ──────────────────────────────────────────────────────────

	[Symbol.dispose](): void {
		this.#disposableStack.dispose();
	}

	/**
	 * Attach touch event listeners to a canvas element.
	 *
	 * @param element       The HTML element to listen on.
	 * @param projectTouch  Transforms a DOM Touch into game-space coordinates.
	 */
	attachTo(
		element: HTMLElement,
		projectTouch: (touch: globalThis.Touch) => Vec2Like,
	): Disposable {
		const ds = new DisposableStack();

		const onTouchStart = (e: TouchEvent): void => {
			e.preventDefault();
			Array.from(e.changedTouches).forEach((t) => {
				const { x, y } = projectTouch(t);
				this.#handleTouchStart(t.identifier, x, y);
			});
		};

		const onTouchMove = (e: TouchEvent): void => {
			e.preventDefault();
			Array.from(e.changedTouches).forEach((t) => {
				const { x, y } = projectTouch(t);
				this.#handleTouchMove(t.identifier, x, y);
			});
		};

		const onTouchEnd = (e: TouchEvent): void => {
			Array.from(e.changedTouches).forEach((t) => {
				this.#handleTouchEnd(t.identifier);
			});
		};

		element.addEventListener('touchstart', onTouchStart, {
			passive: false,
		});
		element.addEventListener('touchmove', onTouchMove, { passive: false });
		element.addEventListener('touchend', onTouchEnd);
		element.addEventListener('touchcancel', onTouchEnd);

		ds.defer(() => {
			element.removeEventListener('touchstart', onTouchStart);
			element.removeEventListener('touchmove', onTouchMove);
			element.removeEventListener('touchend', onTouchEnd);
			element.removeEventListener('touchcancel', onTouchEnd);
		});

		this.#disposableStack.use(ds);

		return ds;
	}

	/**
	 * Advance all touch pointers and swipe detectors to the next frame.
	 * Called automatically by Input.step().
	 */
	step(): void {
		// Swipe detectors must be stepped BEFORE pointer state is advanced so
		// they can still observe the isActive / wasActive transition.
		for (const detector of this.#swipeDetectors) {
			detector.step();
		}
		for (const pointer of this.#pointers) {
			pointer._step();
		}
	}

	/**
	 * Returns the TouchPointer for the nth simultaneous touch (0-indexed).
	 * The pointer is created lazily; use isActive to check whether a finger
	 * is currently down for that slot.
	 */
	getPointer(index: number): TouchPointer {
		return this.#getOrCreatePointer(index);
	}

	/**
	 * Returns a Button that is "down" while the nth touch is active.
	 */
	getButton(index: number): Button {
		return new TouchButton(this.getPointer(index));
	}

	/**
	 * Creates a SwipeDetector for the nth touch point and registers it so
	 * it is stepped automatically each frame.
	 *
	 * @param index     Touch slot index (0 = first finger).
	 * @param threshold Minimum pixel distance for a recognised swipe (default 50).
	 */
	createSwipeDetector(index: number, threshold: number = 50): SwipeDetector {
		const pointer = this.getPointer(index);
		const detector = new SwipeDetector(pointer, threshold);
		this.#swipeDetectors.push(detector);
		return detector;
	}
}
