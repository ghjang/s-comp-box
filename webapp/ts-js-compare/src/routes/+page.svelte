<script lang="ts">
	import { Splitter } from 's-comp-core';
	import MonacoEditor from '../../../../src/MonacoEditor/MonacoEditor.svelte';
	const MONACO_EDITOR_RESOURCE_PATH = import.meta.env.MONACO_EDITOR_RESOURCE_PATH;

	let tsEditor: MonacoEditor;
	let jsEditor: MonacoEditor;

	$: {
		tsEditor?.layout();
		jsEditor?.layout();
	}
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
