import { AsyncOption } from './AsyncOption';
import { AsyncResult } from './AsyncResult';
import { None, Option, Some } from './Option';
import { Err, Ok, Result } from './Result';

/**
 * Defines interoperability methods between Option and Result.
 *
 * This file is separate from the main Option and Result implementations to
 * avoid circular dependencies.
 */

Option.prototype.okOr = function <T, E>(this: Option<T>, err: E) {
	if (this.isSome()) {
		return Ok(this.unwrap());
	} else {
		return Err(err);
	}
};

AsyncOption.prototype.okOr = function <T, E>(this: AsyncOption<T>, err: E) {
	return new AsyncResult<T, E>(this.then((v) => v.okOr(err)));
};

Result.prototype.ok = function <T>(this: Result<T, unknown>) {
	if (this.isOk()) {
		return Some<T>(this.unwrap());
	} else {
		return None<T>();
	}
};

AsyncResult.prototype.ok = function <T>(this: AsyncResult<T, unknown>) {
	return new AsyncOption<T>(this.then((v) => v.ok()));
};
