type ErrorFormatContext = { indent: string };
declare const _isBaseError: unique symbol;
export abstract class BaseError {
	declare private [_isBaseError]: true;

	abstract format(context: ErrorFormatContext): string;

	toString(): string {
		return this.format({ indent: '' });
	}
}

class StringError extends BaseError {
	constructor(public message: string) {
		super();
	}
	format(_context: ErrorFormatContext): string {
		return this.message + '\n';
	}

	static cast(value: BaseError | string): BaseError {
		if (typeof value === 'string') {
			return new StringError(value);
		}
		return value;
	}
}

class TreeError extends BaseError {
	constructor(
		public title: string,
		public lines: BaseError[],
	) {
		super();
	}
	format(context: ErrorFormatContext): string {
		const indent = context.indent;
		const contextWithPipe = { ...context, indent: indent + '│ ' };
		const contextWithSpace = { ...context, indent: indent + '  ' };

		const lines = this.lines.slice();
		const tail = lines.splice(-1, 1);

		const result = [
			`${this.title}\n`,
			...lines.map(
				(line) => `${indent}├─${line.format(contextWithPipe)}`,
			),
			...tail.map(
				(line) => `${indent}└─${line.format(contextWithSpace)}`,
			),
		];

		return result.join('');
	}
}

class GroupError extends BaseError {
	constructor(public lines: BaseError[]) {
		super();
	}

	format(context: ErrorFormatContext): string {
		return this.lines
			.map(
				(line, i) =>
					(i != 0 ? context.indent : '') + line.format(context),
			)
			.map((str) => str.trimEnd() + '\n')
			.join('');
	}
}

class IndentError extends BaseError {
	constructor(
		public errors: BaseError[],
		public indent: string = '  ',
	) {
		super();
	}
	format(context: ErrorFormatContext): string {
		return this.errors
			.map(
				(error, i) =>
					(i !== 0 ? context.indent : '') +
					(error instanceof IndentError
						? ' '.repeat(this.indent.length)
						: this.indent) +
					error.format({
						...context,
						indent: context.indent + ' '.repeat(this.indent.length),
					}),
			)
			.map((str) => str.trimEnd() + '\n')
			.join('');
	}
}

export function error(message: string): BaseError {
	return new StringError(message);
}

export function errorTree(
	title: string,
	lines: (BaseError | string)[],
): BaseError {
	return new TreeError(title, lines.map(StringError.cast));
}

export function group(lines: (BaseError | string)[]): BaseError {
	return new GroupError(lines.map(StringError.cast));
}

export function indent(lines: (BaseError | string)[]): BaseError {
	return new IndentError(lines.map(StringError.cast));
}

export function bullets(lines: (BaseError | string)[]): BaseError {
	return new IndentError(lines.map(StringError.cast), '* ');
}

export function para(text: string) {
	return new GroupError(
		text.split('\n').map((line) => new StringError(line)),
	);
}
