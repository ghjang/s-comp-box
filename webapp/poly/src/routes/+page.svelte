<script lang="ts">
	import { onMount } from 'svelte';
	import { debounce } from 'lodash-es';
	import MonacoEditor from '../../../../src/MonacoEditor/MonacoEditor.svelte';

	const MONACO_EDITOR_RESOURCE_PATH = import.meta.env.MONACO_EDITOR_RESOURCE_PATH;

	let editor: MonacoEditor;

	const handleResize = debounce(() => {
		editor?.layout();
	}, 100);

	onMount(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function handleEditorInit(event: CustomEvent) {
	}

	function handleContentChange(event: CustomEvent) {
	}
</script>

<main>
	<MonacoEditor
		bind:this={editor}
		resourcePath={MONACO_EDITOR_RESOURCE_PATH}
		on:editorInit={handleEditorInit}
		on:contentChange={handleContentChange}
	/>
</main>

<style lang="scss">
	:global(html, body) {
		margin: 0;
		padding: 0;
	}

	main {
		width: 100%;
		height: 100vh;
	}
</style>
