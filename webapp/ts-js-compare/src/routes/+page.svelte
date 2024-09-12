<script lang="ts">
	import { debounce } from 'lodash-es';
	import { Splitter } from 's-comp-core';
	import MonacoEditor from '../../../../src/MonacoEditor/MonacoEditor.svelte';
	const MONACO_EDITOR_RESOURCE_PATH = import.meta.env.MONACO_EDITOR_RESOURCE_PATH;

	let tsEditor: MonacoEditor;
	let jsEditor: MonacoEditor;

	$: {
		tsEditor?.layout();
		jsEditor?.layout();
	}

	const handleTsContentChange = debounce(async (event: CustomEvent) => {
		const tsCode = event.detail.value;
		try {
			const response = await fetch('/api/ts-to-js', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tsCode })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'An error occurred during conversion.');
			}

			const { jsCode } = await response.json();
			jsEditor.setText(jsCode);
		} catch (error) {
			console.error('Failed to convert TypeScript to JavaScript:', error);
		}
	}, 500);
</script>

<div class="page-container">
	<h1>TypeScript vs. JavaScript</h1>

	<div class="main-container">
		<Splitter orientation="horizontal">
			<div slot="left" class="editor-container">
				<MonacoEditor
					bind:this={tsEditor}
					resourcePath={MONACO_EDITOR_RESOURCE_PATH}
					language="typescript"
					workerPath="ts.worker.bundle.js"
					on:contentChange={handleTsContentChange}
				/>
			</div>
			<div slot="right" class="editor-container">
				<MonacoEditor
					bind:this={jsEditor}
					resourcePath={MONACO_EDITOR_RESOURCE_PATH}
					language="javascript"
				/>
			</div>
		</Splitter>
	</div>
</div>

<style lang="scss">
	.page-container {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 1em);

		.main-container {
			flex: 1;
			margin-bottom: 0.5em;
			overflow: hidden;

			.editor-container {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
