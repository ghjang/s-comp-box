import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
	return {
		plugins: [sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		define: {
			'import.meta.env.MONACO_CSS_PATH': JSON.stringify('/monaco-editor-custom.css')
		}
	};
});
