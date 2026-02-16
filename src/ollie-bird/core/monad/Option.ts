import optionResultInteropMissing from './optionResultInteropMissing';
import type { Result } from './Result';

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace OptionImpl {
	export abstract class OptionApi<T> implements Iterable<T> {
		declare okOr: <T, E>(this: Option<T>, err: E) => Result<T, E>;

		static {
			this.prototype.okOr = optionResultInteropMissing;
		}

		abstract isSome(): this is Some<T>;
		abstract isNone(): this is None;
		abstract map<U>(fn: (value: T) => U): Option<U>;
		abstract andThen<U>(fn: (value: T) => Option<U>): Option<U>;
		abstract inspect(fn: (value: T) => void): this;
		abstract unwrapOrNull(): T | null;
		abstract unwrapOrElse(fn: () => T): T;
		abstract unwrap(message?: string): T;
		abstract [Symbol.toStringTag](): string;
		abstract [Symbol.iterator](): Iterator<T>;
	}

	export class None extends OptionApi<never> {
		static instance = new None();

		private constructor() {
			super();
		}

		isSome<T>(): this is Some<T> {
			return false;
		}

		isNone(): this is None {
			return true;
		}

		map<U>(_fn: (value: never) => U): Option<U> {
			return this;
		}

		andThen<U>(_fn: (value: never) => Option<U>): Option<U> {
			return this;
		}

		inspect(_fn: (value: never) => void): this {
			return this;
		}

		unwrapOrNull(): null {
			return null;
		}

		unwrapOrElse<T>(fn: () => T): T {
			return fn();
		}

		unwrap(message?: string): never {
			const err = new Error(message ?? 'Tried to unwrap a None value');

			if ('captureStackTrace' in Error) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
				(Error.captureStackTrace as Function)(err, this.unwrap);
			}

			throw err;
		}

		[Symbol.toStringTag](): string {
			return 'None';
		}

		*[Symbol.iterator](): Iterator<never> {}
	}

	export class Some<T> extends OptionApi<T> {
		#value: T;
		constructor(value: T) {
			super();
			this.#value = value;
		}

		isSome(): this is Some<T> {
			return true;
		}

		isNone(): this is None {
			return false;
		}

		map<U>(fn: (value: T) => U): Option<U> {
			return new Some(fn(this.#value));
		}

		andThen<U>(fn: (value: T) => Option<U>): Option<U> {
			return fn(this.#value);
		}

		inspect(fn: (value: T) => void): this {
			fn(this.#value);
			return this;
		}

		unwrapOrNull(): T {
			return this.#value;
		}

		unwrapOrElse(_fn: () => T): T {
			return this.#value;
		}

		unwrap(_message?: string): T {
			return this.#value;
		}

		[Symbol.toStringTag](): string {
			return `Some(${Object.prototype.toString.call(this.#value)})`;
		}

		*[Symbol.iterator](): Iterator<T> {
			yield this.#value;
		}
	}
}

export type Option<T> = OptionImpl.Some<T> | OptionImpl.None;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Option {
	export const prototype = OptionImpl.OptionApi.prototype;

	export function of<T>(value: T | null | undefined): Option<T> {
		if (value === null || value === undefined) {
			return None();
		}
		return new OptionImpl.Some(value);
	}
}

export function Some<T>(value: T): Option<T> {
	return new OptionImpl.Some(value);
}

export function None<T>(): Option<T> {
	return OptionImpl.None.instance;
}
