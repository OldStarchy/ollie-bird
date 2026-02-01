import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		setupFiles: ['disposablestack/auto', './src/rxjs-disposable'],
		coverage: {
			provider: 'v8',
			reporter: ['json', 'json-summary'],
			exclude: ['src/assets/**', '**/*.test.ts', '**/*.test.tsx'],
		},
	},
});
