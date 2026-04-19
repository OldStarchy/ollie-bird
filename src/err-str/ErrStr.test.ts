import { describe, expect, test } from 'vitest';
import { bullets, error, errorTree, group, indent, para } from './ErrStr';

describe('ErrStr', () => {
	test('single line', () => {
		const err = error('Failed to compile');
		expect(err.toString()).toBe('Failed to compile\n');
	});

	test('multiple lines', () => {
		const err = group([
			'Failed to compile',
			'Syntax error in line 1',
			'Syntax error in line 2',
		]);
		expect(err.toString()).toBe(`\
Failed to compile
Syntax error in line 1
Syntax error in line 2
`);
	});

	test('indent', () => {
		const err = group([
			'Failed to compile',
			indent(['Syntax error in line 1', 'Syntax error in line 2']),
		]);

		expect(err.toString()).toBe(`\
Failed to compile
  Syntax error in line 1
  Syntax error in line 2
`);
	});

	test('bullets', () => {
		const err = group([
			'Failed to compile',
			bullets(['Syntax error in line 1', 'Syntax error in line 2']),
		]);

		expect(err.toString()).toBe(`\
Failed to compile
* Syntax error in line 1
* Syntax error in line 2
`);
	});

	test('tree', () => {
		const err = errorTree('Failed to compile', [
			'Syntax error in line 1',
			'Syntax error in line 2',
			errorTree('Missing dependencies', [
				'Module "foo" not found',
				'Module "bar" not found',
			]),
		]);

		expect(err.toString()).toBe(`\
Failed to compile
├─Syntax error in line 1
├─Syntax error in line 2
└─Missing dependencies
  ├─Module "foo" not found
  └─Module "bar" not found
`);
	});

	test('all things', () => {
		const err = group([
			'Failed to compile',
			bullets([
				'Syntax error in line 1',
				'Syntax error in line 2',
				errorTree('Missing dependencies', [
					group(["Module 'foo' not found", "Module 'bar' not found"]),
					group([
						error('Hello:'),
						bullets([
							"Module 'foo' not found",
							bullets([
								para(`\
This is some information

\`\`\`ts
const foo = 'hello';
console.log(foo);
\`\`\``),
								para('asdfasldkjfawe'),
							]),
							"Module 'bar' not found",
						]),
					]),
				]),
				errorTree('Missing dependencies', [
					errorTree('Something:', ["Module 'foo' not found"]),
					group(["Module 'foo' not found", "Module 'bar' not found"]),
				]),
			]),
		]);

		const expected = `\
Failed to compile
* Syntax error in line 1
* Syntax error in line 2
* Missing dependencies
  ├─Module 'foo' not found
  │ Module 'bar' not found
  └─Hello:
    * Module 'foo' not found
      * This is some information

        \`\`\`ts
        const foo = 'hello';
        console.log(foo);
        \`\`\`
      * asdfasldkjfawe
    * Module 'bar' not found
* Missing dependencies
  ├─Something:
  │ └─Module 'foo' not found
  └─Module 'foo' not found
    Module 'bar' not found
`;

		expect(err.toString()).toBe(expected);
	});
});
