import { Observable, Subject } from 'rxjs';
import contextCheckpoint from '../../contextCheckpoint';
import CircleCollider from '../core/collider/CircleCollider';
import type GameObject from '../core/GameObject';
import type { Button } from '../core/input/Button';
import Mouse from '../core/input/mouse/Mouse';
import type { Pointer } from '../core/input/Pointer';
import Module from '../core/Module';
import Collider2d from '../core/modules/Collider2d';
import { Ok, type Result } from '../core/monad/Result';

export default class ObjectSelector extends Module {
	static readonly displayName = 'ObjectSelector';

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
	#soDisposable: null | Disposable = null;
	set selectedObject(value: GameObject | null) {
		if (this.#selectedObject === value) return;

		this.#soDisposable?.[Symbol.dispose]();
		this.#selectedObject = value;

		if (value) {
			this.#soDisposable = value.destroy$.subscribe(() => {
				this.selectedObject = null;
			});
		}
		this.notify();
	}

	#selectButton: Button = this.owner.game.input.mouse.getButton(
		Mouse.BUTTON_LEFT,
	);
	#selectPointer: Pointer = this.owner.game.input.mouse;

	protected override update(): void {
		if (this.#selectButton.isPressed) {
			const mousePoint = new CircleCollider(
				this.#selectPointer.x,
				this.#selectPointer.y,
				5,
			);

			const collidingObjects = this.owner.game
				.getObjects()
				.filter(Collider2d.collidingWith(mousePoint))
				.toArray();

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

		const colliders = this.selectedObject.getModulesByType(Collider2d);
		for (const collider of colliders) {
			collider.doRenderGizmos(context);
		}
	}

	override serialize(): unknown {
		return undefined;
	}
	static deserialize(
		_obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		return Ok(context.gameObject.addModule(ObjectSelector));
	}

	static {
		Module.serializer.registerSerializationType('ObjectSelector', this);
	}
}
