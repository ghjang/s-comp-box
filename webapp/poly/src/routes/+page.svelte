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

	const localStorageKey = 'poly-editor-content';
	let editorContent: string = '';

	let markers: Map<string, { lineNumber: number; column: number }> = new Map();
	let lastInput: { content: string; markerId: string | null } = { content: '', markerId: null };

	const handleResize = debounce(() => {
		editor?.layout();
	}, 100);

	const debouncedHandleLastContentChange = debounce(handleLastContentChange, 100);

	onMount(() => {
		window.addEventListener('resize', handleResize);

		// 로컬 스토리지에서 저장된 내용 불러오기
		const savedContent = localStorage.getItem(localStorageKey);
		if (savedContent) {
			editorContent = savedContent;
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			handleResize.cancel();
			debouncedHandleLastContentChange.cancel();
		};
	});

	$: debouncedHandleLastContentChange(lastInput.content);

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
		const { value, cursorPosition } = event.detail;

		// 에디터 내용이 변경될 때마다 로컬 스토리지에 저장
		if (value) {
			editorContent = value;
			localStorage.setItem(localStorageKey, value);
		}

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
					lastInput.content = lineContent.substring(
						wordAtPosition.startColumn - 1,
						wordAtPosition.endColumn - 1
					);
				} else {
					lastInput.content = lineContent.charAt(cursorPosition.column - 2) || '';
				}

				if (lastInput.content === '#') {
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
					const newMarkerId = newDecorations[0];
					markers.set(newMarkerId, {
						lineNumber: cursorPosition.lineNumber,
						column: cursorPosition.column
					});
					lastInput.markerId = newMarkerId;
				} else {
					lastInput.markerId = null;
				}
			}
		}
	}

	async function handleLastContentChange(content: string) {
		if (content.trim() === '#' && lastInput.markerId) {
			const model = editor.getModel();
			if (model) {
				const markerId = lastInput.markerId;
				const marker = model.getDecorationRange(markerId);
				const markerPosition = markers.get(markerId);
				if (marker && markerPosition) {
					const lineContent = model.getLineContent(markerPosition.lineNumber);
					const leftContent = lineContent.substring(0, markerPosition.column - 1).trim();

					const apiResponse = await callGeminiAPI(leftContent);
					const cleanedResponse = apiResponse.replace(/\n/g, ' ').trim();

					const range = editor.createRange(
						markerPosition.lineNumber,
						markerPosition.column,
						markerPosition.lineNumber,
						model.getLineMaxColumn(markerPosition.lineNumber)
					);

					model.pushEditOperations([], [{ range, text: ` ${cleanedResponse}` }], () => null);

					// 마커 제거
					model.deltaDecorations([markerId], []);
					markers.delete(markerId);

					if (markerId === lastInput.markerId) {
						lastInput.markerId = null;
					}
				}
			}
		}
	}

	async function callGeminiAPI(content: string): Promise<string> {
		const apiPrompt = `다음 다항식의 최종 전개 결과만 계산해주세요!

[제약사항]
- 계산된 결과 다항식은 내림차순으로 정렬
- 부가적인 설명은 필요없음.
- 곱셈 기호 '*'를 생략 가능한 경우 생략
- 거듭제곱 기호로 '^'를 사용
- 숫자로만 구성된 수식일 경우에는 전개가 아니라 계산 결과 숫자값만 계산
- 계산식이 잘못된 표현일 경우에 문제가된 내용에 대한 간결한 한글 설명제공

[다항식]
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
		language="poly"
		value={editorContent}
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
