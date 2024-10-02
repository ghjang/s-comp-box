<script context="module" lang="ts">
	enum PolyPrompt {
		Expand = `다음 다항식을 전개 후 최종 전개 결과만 주세요!

[제약사항]
- 계산된 결과 다항식은 내림차순으로 정렬
- 부가적인 설명은 필요없음.
- 곱셈 기호 '*'를 생략 가능한 경우 생략
- 거듭제곱 기호로 '^'를 사용
- 숫자로만 구성된 수식일 경우에는 전개가 아니라 계산 결과 숫자값만 꼼꼼히 틀리지 않게 계산
- 이미 전개된 수식일 경우에는 이미 전개 되었음을 알리는 간결한 한글 설명 제공
- 표현식이 잘못된 표현일 경우에 문제가된 내용에 대한 간결한 한글 설명제공

[다항식]
`,
		Refactor = `다음 다항식 표현을 인수분해 후 최종 인수분해 결과만 주세요!

[제약사항]
- 계산된 결과 다항식은 내림차순으로 정렬
- 부가적인 설명은 필요없음.
- 곱셈 기호 '*'를 생략 가능한 경우 생략
- 거듭제곱 기호로 '^'를 사용
- 숫자로만 구성된 수식일 경우에는 인수분해가 아니라 계산 결과 숫자값만 꼼꼼히 틀리지 않게 계산
- 이미 인수분해된 수식일 경우에는 이미 인수분해 되었음을 알리는 간결한 한글 설명 제공
- 표현식이 잘못된 표현일 경우에 문제가된 내용에 대한 간결한 한글 설명제공

[다항식]
`
	}

	export type LLMSingleQueryFunction = (
		content: string,
		polyPromptHeader: string
	) => Promise<string>;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { debounce } from 'lodash-es';

	import MonacoEditor, {
		type MonacoEditorEvents,
		TrackedRangeStickiness
	} from '$s_comp_extra/MonacoEditor/MonacoEditor.svelte';
	import { MONACO_EDITOR_RESOURCE_PATH } from '$lib/constants';

	export let autoComplete: boolean = true;
	export let llmSingleQuery: LLMSingleQueryFunction;

	export function update() {
		editor?.layout();
	}

	let langdef: any;

	let editor: MonacoEditor;
	let editorContent: string;

	let markers: Map<string, { lineNumber: number; column: number }> = new Map();
	let lastInput: { content: string; markerId: string | null } = { content: '', markerId: null };
	let isActionTriggered: boolean = false;
	let isLoading: boolean = false;

	let polyPromptHeader: PolyPrompt = PolyPrompt.Expand;

	const localStorageKey = 'poly-editor-content';
	const debouncedHandleLastContentChange = debounce(handleLastContentChange, 300);

	onMount(() => {
		// 로컬 스토리지에서 저장된 내용 불러오기
		const savedContent = localStorage.getItem(localStorageKey);
		if (savedContent) {
			editorContent = savedContent;
		}

		return () => {
			debouncedHandleLastContentChange.cancel();
		};
	});

	// 자동 완성이 활성화되어 있거나 특정 액션 키 입력에 의해
	// 'lastInput.content'가 수정되어 호출된 경우 처리를 시도
	$: if ((autoComplete || isActionTriggered) && !isLoading) {
		debouncedHandleLastContentChange(lastInput.content);
	}

	// NOTE: 'onMount' 보다 나중에 호출된다.
	async function handleEditorInit(_event: CustomEvent<MonacoEditorEvents['editorInit']>) {
		if (!langdef) {
			const module = await import('$lib/poly/lang.def');
			langdef = module.default;
		}

		editor.registerCustomLanguage({
			id: 'poly',
			languageDef: langdef
		});

		const { keyMod, keyCode } = editor.getMonacoKeyBindingConstant();

		editor.addAction({
			id: 'poly-expand',
			label: 'Expand',
			precondition: 'editorTextFocus',
			keybindings: [keyMod.Alt | keyMod.Shift | keyCode.KeyE],
			run: () => handlePolyAction(PolyPrompt.Expand)
		});

		editor.addAction({
			id: 'poly-refactor',
			label: 'Refactor',
			precondition: 'editorTextFocus',
			keybindings: [keyMod.Alt | keyMod.Shift | keyCode.KeyR],
			run: () => handlePolyAction(PolyPrompt.Refactor)
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
					console.debug('유효하지 않은 커서 위치:', cursorPosition);
					return;
				}

				const lineContent = model.getLineContent(cursorPosition.lineNumber);

				// 열(column) 위치 유효성 검사
				if (cursorPosition.column > lineContent.length + 1 || cursorPosition.column < 1) {
					console.debug('유효하지 않은 커서 위치:', cursorPosition);
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
		if (content.trim() !== '#' || !lastInput.markerId || isLoading) {
			isActionTriggered = false;
			return;
		}

		const model = editor.getModel();
		if (!model) {
			isActionTriggered = false;
			return;
		}

		const markerId = lastInput.markerId;
		const marker = model.getDecorationRange(markerId);
		const markerPosition = markers.get(markerId);

		if (!marker || !markerPosition) {
			isActionTriggered = false;
			return;
		}

		isLoading = true;
		try {
			const lineContent = model.getLineContent(markerPosition.lineNumber);
			const leftContent = lineContent.substring(0, markerPosition.column - 2).trim(); // '#' 제외

			const apiResponse = await llmSingleQuery(leftContent, polyPromptHeader);
			const cleanedResponse = apiResponse.replace(/\n/g, ' ').trim();

			const range = editor.createRange(
				markerPosition.lineNumber,
				markerPosition.column,
				markerPosition.lineNumber,
				model.getLineMaxColumn(markerPosition.lineNumber)
			);

			// 출력시에 앞에 '공백 1자'를 추가하여 출력
			model.pushEditOperations([], [{ range, text: ` ${cleanedResponse}` }], () => null);

			// 마커 제거
			model.deltaDecorations([markerId], []);
			markers.delete(markerId);

			if (markerId === lastInput.markerId) {
				lastInput.markerId = null;
			}
		} finally {
			isLoading = false;
			isActionTriggered = false;
		}
	}

	function handlePolyAction(promptType: PolyPrompt) {
		if (isLoading) return;

		const model = editor.getModel();
		const position = editor.getPosition();
		if (!model || !position) return;

		const lineContent = model.getLineContent(position.lineNumber);
		const leftContent = lineContent.substring(0, position.column);
		const lastHashIndex = leftContent.lastIndexOf('#');

		if (lastHashIndex === -1) return;

		const range = editor.createRange(
			position.lineNumber,
			lastHashIndex + 2, // '#' 다음 문자부터 시작
			position.lineNumber,
			lineContent.length + 1
		);

		// 편집 작업과 커서 위치 설정을 한 번에 수행
		model.pushEditOperations([], [{ range, text: '' }], () => null);

		polyPromptHeader = promptType;
		isActionTriggered = true;
	}
</script>

<MonacoEditor
	bind:this={editor}
	resourcePath={MONACO_EDITOR_RESOURCE_PATH}
	language="poly"
	value={editorContent}
	on:editorInit={handleEditorInit}
	on:contentChange={handleContentChange}
/>
