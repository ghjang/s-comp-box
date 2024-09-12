<script lang="ts">
	import { onMount } from 'svelte';
	import { debounce } from 'lodash-es';
	import { Splitter } from 's-comp-core';
	import MonacoEditor from '../../../../src/MonacoEditor/MonacoEditor.svelte';
	import { jsVersions, type JSVersion } from '$lib/jsVersions';
	const MONACO_EDITOR_RESOURCE_PATH = import.meta.env.MONACO_EDITOR_RESOURCE_PATH;
	const TS_CONTENT_LOCAL_STORAGE_KEY = 'ts-content';

	let tsEditor: MonacoEditor;
	let jsEditor: MonacoEditor;
	let selectedJSVersion: JSVersion = jsVersions.find((v) => v.value === 'ES2015') || jsVersions[0];

	const handleResize = debounce(() => {
		tsEditor?.layout();
		jsEditor?.layout();
	}, 100);

	onMount(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	const handleTsContentChange = debounce(async (tsCode: string) => {
		localStorage.setItem(TS_CONTENT_LOCAL_STORAGE_KEY, tsCode);

		try {
			const response = await fetch('/api/ts-to-js', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tsCode, target: selectedJSVersion.value })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'An error occurred during conversion.');
			}

			const { jsCode } = await response.json();
			jsEditor.setText(jsCode);
		} catch (error) {
			console.error('TypeScript를 JavaScript로 변환하는 데 실패했습니다:', error);
		}
	}, 500);

	function onTsSourceEditorInit(_event: CustomEvent) {
		const savedTsContent = localStorage.getItem(TS_CONTENT_LOCAL_STORAGE_KEY);
		if (savedTsContent) {
			tsEditor.setText(savedTsContent);
		}
	}

	function onTsSourceEditorChange(event: CustomEvent) {
		handleTsContentChange(event.detail.value);
	}

	function onJSTargetVersionChange() {
		if (tsEditor) {
			handleTsContentChange(tsEditor.getText());
		}
	}
</script>

<div class="page-container">
	<div class="main-container">
		<Splitter orientation="horizontal" on:panelSizeChanged={handleResize}>
			<div slot="left" class="editor-container">
				<div class="editor-header">
					<h3 class="editor-title">TypeScript</h3>
				</div>
				<MonacoEditor
					bind:this={tsEditor}
					resourcePath={MONACO_EDITOR_RESOURCE_PATH}
					language="typescript"
					workerPath="ts.worker.bundle.js"
					on:editorInit={onTsSourceEditorInit}
					on:contentChange={onTsSourceEditorChange}
				/>
			</div>
			<div slot="right" class="editor-container">
				<div class="editor-header">
					<h3 class="editor-title">JavaScript:</h3>
					<select bind:value={selectedJSVersion} on:change={onJSTargetVersionChange}>
						{#each jsVersions as version}
							<option value={version}>{version.label}</option>
						{/each}
					</select>
				</div>
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

				.editor-header {
					margin: 0;
					padding: 0.2em 0.2em 0.2em 3em;

					.editor-title {
						display: inline-block;
						margin: 0;
					}

					select {
						outline: none;
					}
				}
			}
		}
	}
</style>
