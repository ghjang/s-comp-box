<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';
	import { Splitter } from 's-comp-core';

	const monacoCssPath = import.meta.env.MONACO_CSS_PATH;
	let _MonacoEditor: ComponentType;
	let jsEditor: any;
	let tsEditor: any;

	onMount(async () => {
		_MonacoEditor = (await import('../../../../src/MonacoEditor/MonacoEditor.svelte')).default;
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
				{#if browser && _MonacoEditor}
					<svelte:component this={_MonacoEditor} bind:this={jsEditor} />
				{/if}
			</div>
			<div slot="right" class="editor-container">
				{#if browser && _MonacoEditor}
					<svelte:component this={_MonacoEditor} bind:this={tsEditor} />
				{/if}
			</div>
		</Splitter>
	</div>
</div>

<style lang="scss">
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;

		.main-container {
			flex: 1;
			overflow: hidden;

			.editor-container {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
