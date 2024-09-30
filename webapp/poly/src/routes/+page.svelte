<script lang="ts">
	import { onMount } from 'svelte';
	import { debounce } from 'lodash-es';
	import MonacoEditor, {
		type MonacoEditorEvents,
		TrackedRangeStickiness
	} from '../../../../src/MonacoEditor/MonacoEditor.svelte';
	import { GeminiModel } from '../types/api';

	const MONACO_EDITOR_RESOURCE_PATH = import.meta.env.MONACO_EDITOR_RESOURCE_PATH;

	let editor: MonacoEditor;
	let langdef: any;

	let markers: string[] = [];
	let lastInputContent: string = '';

	const handleResize = debounce(() => {
		editor?.layout();
	}, 100);

	onMount(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	$: handleLastContentChange(lastInputContent);

	async function handleEditorInit(_event: CustomEvent<MonacoEditorEvents['editorInit']>) {
		if (!langdef) {
			const module = await import('$lib/poly/lang.def');
			langdef = module.default;
		}

		editor.registerCustomLanguage({
			id: 'poly',
			languageDef: langdef
		});
	}

	function handleContentChange(event: CustomEvent<MonacoEditorEvents['contentChange']>) {
		const { cursorPosition } = event.detail;
		if (cursorPosition) {
			const model = editor.getModel();
			if (model) {
				const lineCount = model.getLineCount();

				// 커서 위치의 유효성 검사
				if (cursorPosition.lineNumber > lineCount || cursorPosition.lineNumber < 1) {
					console.warn('유효하지 않은 커서 위치:', cursorPosition);
					return;
				}

				const lineContent = model.getLineContent(cursorPosition.lineNumber);

				// 열(column) 위치 유효성 검사
				if (cursorPosition.column > lineContent.length + 1 || cursorPosition.column < 1) {
					console.warn('유효하지 않은 커서 위치:', cursorPosition);
					return;
				}

				const wordAtPosition = model.getWordAtPosition(cursorPosition);

				if (wordAtPosition) {
					lastInputContent = lineContent.substring(
						wordAtPosition.startColumn - 1,
						wordAtPosition.endColumn - 1
					);
				} else {
					lastInputContent = lineContent.charAt(cursorPosition.column - 2) || '';
				}

				if (lastInputContent === '#') {
					const newDecorations = model.deltaDecorations(
						[],
						[
							{
								range: editor.createRange(
									cursorPosition.lineNumber,
									cursorPosition.column,
									cursorPosition.lineNumber,
									cursorPosition.column
								),
								options: {
									stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
								}
							}
						]
					);
					markers.push(newDecorations[0]);
				}
			}
		}
	}

	async function handleLastContentChange(content: string) {
		const trimmedContent = content.trim();
		if (trimmedContent === '#' && markers.length > 0) {
			const model = editor.getModel();
			if (model) {
				const markerId = markers[markers.length - 1];
				const marker = model.getDecorationRange(markerId);
				if (marker) {
					const lineContent = model.getLineContent(marker.startLineNumber);
					const leftContent = lineContent.substring(0, marker.startColumn - 1).trim();

					const apiResponse = await callGeminiAPI(leftContent);
					const cleanedResponse = apiResponse.replace(/\n/g, ' ').trim();

					const range = editor.createRange(
						marker.startLineNumber,
						marker.startColumn,
						marker.endLineNumber,
						model.getLineMaxColumn(marker.endLineNumber)
					);

					model.pushEditOperations([], [{ range: range, text: ` ${cleanedResponse}` }], () => null);

					// 마커 제거
					model.deltaDecorations([markerId], []);
					markers = markers.filter((id) => id !== markerId);
				}
			}
		}
	}

	async function callGeminiAPI(content: string): Promise<string> {
		const apiPrompt = `다음 다항식의 최종 전개 결과만 계산해주세요.
계산된 결과 다항식은 내림차순으로 정렬해주세요.
부가적인 설명은 필요없습니다.
곱셈 기호 '*'를 생략 가능한 경우 생략해주세요.
거듭제곱 기호로 '^'를 사용해주세요.:
${content}`;

		try {
			const response = await fetch('/api/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: apiPrompt,
					model: GeminiModel.Gemini15Flash8BExp,
					type: 'single-query'
				})
			});
			const data = await response.json();
			return data.response || '응답을 받지 못했습니다.';
		} catch (error) {
			console.error('Gemini API 호출 중 오류:', error);
			return '오류가 발생했습니다.';
		}
	}
</script>

<main>
	<MonacoEditor
		bind:this={editor}
		resourcePath={MONACO_EDITOR_RESOURCE_PATH}
		on:editorInit={handleEditorInit}
		on:contentChange={handleContentChange}
	/>
	<p>마지막 입력 내용: {lastInputContent}</p>
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
