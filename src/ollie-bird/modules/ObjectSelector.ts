import { Observable, Subject, Subscription } from 'rxjs';
import contextCheckpoint from '../../contextCheckpoint';
import CircleCollider from '../core/collider/CircleCollider';
import type GameObject from '../core/GameObject';
import Module from '../core/IModular';
import ButtonState from '../core/input/ButtonState';
import Mouse from '../core/input/Mouse';
import Collider2d from '../core/modules/Collider2d';

export default class ObjectSelector extends Module {
	#change$ = new Subject<void>();

	private notify(): void {
		this.#change$.next();
	}

	public observe(): Observable<void> {
		return this.#change$.asObservable();
	}

	#selectedObject: GameObject | null = null;
	get selectedObject(): GameObject | null {
		return this.#selectedObject;
	}
	#selectedObjectSub = new Subscription();
	set selectedObject(value: GameObject | null) {
		if (this.#selectedObject === value) return;

		this.#selectedObjectSub.unsubscribe();
		this.#selectedObjectSub = new Subscription();
		this.#selectedObject = value;
		if (value) {
			this.#selectedObjectSub.add(
				value.destroy$.subscribe(() => {
					this.selectedObject = null;
				}),
			);
		}
		this.notify();
	}

	protected override update(): void {
		const mouse = this.owner.game.mouse;

		if (mouse.getButton(Mouse.BUTTON_LEFT) === ButtonState.Pressed) {
			const mousePoint = new CircleCollider(mouse.x, mouse.y, 5);

			const collidingObjects = this.owner.game
				.getObjects()
				.filter(Collider2d.collidingWith(mousePoint));

			this.trySelectObject(collidingObjects);
		}
	}

	private trySelectObject(collidingObjects: GameObject[]): void {
		if (collidingObjects.length === 0) {
			this.selectedObject = null;
			return;
		}

		const currentSelectedIndex = collidingObjects.indexOf(
			this.selectedObject!,
		);
		const nextIndex = (currentSelectedIndex + 1) % collidingObjects.length;

		this.selectedObject = collidingObjects[nextIndex]!;
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.selectedObject) return;

		using _ = contextCheckpoint(context);

		const colliders = this.selectedObject.getModules(Collider2d);
		for (const collider of colliders) {
			collider.doRenderGizmos(context);
		}
	}
}
