import { describe, test } from 'vitest';
import BaseGame from './BaseGame';

describe('BaseGame', () => {
	test("constructor doesn't throw", () => {
		new BaseGame();
	});
});
