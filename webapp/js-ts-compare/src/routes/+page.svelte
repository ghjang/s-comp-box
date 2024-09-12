<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';
	import { Splitter } from 's-comp-core';
	import type MonacoEditor from '../../../../src/MonacoEditor/MonacoEditor.svelte';

	const monacoCssPath = import.meta.env.MONACO_CSS_PATH;
	let MonacoEditorConstructor: ComponentType<MonacoEditor>;
	let tsEditor: MonacoEditor;
	let jsEditor: MonacoEditor;

	onMount(async () => {
		MonacoEditorConstructor = (await import('../../../../src/MonacoEditor/MonacoEditor.svelte'))
			.default;
	});

	$: if (jsEditor) {
		jsEditor.layout();
	}
	$: if (tsEditor) {
		tsEditor.layout();
	}
</script>

<svelte:head>
	<link rel="stylesheet" href={monacoCssPath} />
</svelte:head>

<div class="page-container">
	<h1>JavaScript vs. TypeScript</h1>

	<div class="main-container">
		<Splitter orientation="horizontal">
			<div slot="left" class="editor-container">
				{#if browser && MonacoEditorConstructor}
					<svelte:component this={MonacoEditorConstructor} bind:this={tsEditor} />
				{/if}
			</div>
			<div slot="right" class="editor-container">
				{#if browser && MonacoEditorConstructor}
					<svelte:component this={MonacoEditorConstructor} bind:this={jsEditor} />
				{/if}
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
