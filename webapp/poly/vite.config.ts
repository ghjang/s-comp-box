import { resolve } from 'path';
import fs from 'fs-extra';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

function copyMonacoEditorResource() {
	return {
		name: 'copy-monaco-editor-resource',
		buildStart() {
			const sourcePath = resolve(
				__dirname,
				'../../vendor/monaco-editor/browser-rollup-custom/dist'
			);
			const destPath = resolve(__dirname, './static/resources/monaco-editor');

			try {
				fs.ensureDirSync(destPath);
				fs.copySync(sourcePath, destPath, { overwrite: true });
				console.log('Successfully copied Monaco editor resources.');
			} catch (err) {
				console.error('Error occurred while copying Monaco editor resources:', err);
				throw new Error('Build aborted due to failure in copying Monaco editor resources.');
			}
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), copyMonacoEditorResource()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: {
		'import.meta.env.MONACO_EDITOR_RESOURCE_PATH': JSON.stringify('/resources/monaco-editor')
	},
	resolve: {
		alias: {
			$s_comp_extra: resolve(__dirname, '../../src'),
			$components: resolve(__dirname, './src/components')
		}
	}
});
