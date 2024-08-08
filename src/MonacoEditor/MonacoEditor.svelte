<script>
  import { onDestroy, createEventDispatcher, tick } from "svelte";
  import {
    createMonacoEditor,
    createRange,
    getMonacoKeyBindingConstant,
    setWorkerUrl,
    registerCustomLanguage as register,
    setWarnings,
    clearWarnings,
  } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";

  const dispatch = createEventDispatcher();

  export let resourcePath = null;
  export let bundleName = "monaco-editor-custom";
  export let workerPath = "editor.worker.bundle.js";

  export let width = "100%";
  export let height = "100%";

  export let value = "";
  export let language = "python";
  export let theme = "vs-dark";
  export let minimap = true;
  export let hover = false;
  export let matchBrackets = "near";
  export let bracketPairColorization = true;
  export let autoFindInSelection = "multiline";
  export let autoFindMatches = false;

  export const registerCustomLanguage = register;
  export const setEditorWarnings = (warnings) =>
    editor && setWarnings(editor, warnings);
  export const clearEditorWarnings = () => editor && clearWarnings(editor);

  let editorContainer;
  let editor;

  export async function update() {
    await tick();
    layout();
  }

  export function layout(revealPosition = false) {
    if (editor) {
      const pos = editor.getPosition();
      editor.layout();
      if (revealPosition) {
        editor.revealPosition(pos);
      }
    }
  }

  export function focus() {
    if (editor) {
      editor.focus();
    }
  }

  export function getText() {
    return editor ? editor.getValue() : "";
  }

  export function setText(text, formatDocument = false) {
    if (editor) {
      editor.setValue(text);
      if (formatDocument) {
        // FIXME: '코드 포맷팅' 기능 동작하지 않음.
        //
        // 'HTML, CSS, JavaScript'등의 기본적인 언어에 대한 코드 텍스트의 포맷팅은
        // 모나코 에디터 자체에서 기본적으로 지원(?)한다고 하는 것 같음. 확인 필요함.
        //
        // 'Python'같은 언어의 경우에는 자체 지원은 없고 'Prettier' 같은
        // 외부 라이브러리를 사용해야 한다고 함(?).
        editor.getAction("editor.action.formatDocument").run();
      }
    }
  }

  export function getSelection() {
    return editor ? editor.getSelection() : null;
  }

  export function setSelection(range) {
    if (
      range &&
      typeof range.startLineNumber === "number" &&
      typeof range.startColumn === "number" &&
      typeof range.endLineNumber === "number" &&
      typeof range.endColumn === "number"
    ) {
      const r = createRange(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn
      );
      editor.setSelection(r);
    } else {
      throw new Error("Invalid selection object");
    }
  }

  export function getModel() {
    return editor ? editor.getModel() : null;
  }

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });

  function initMonacoEditor(container) {
    if (editor) {
      return;
    }

    // NOTE: '모나코 에디터'의 CSS 파일을 동적으로 로드한다.
    if (resourcePath) {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = `${resourcePath}/${bundleName}.css`;
      const rootNode = container.getRootNode();
      if (rootNode instanceof ShadowRoot) {
        // '표준 웹 컴포넌트'로 사용할 때 Shadow DOM 하위 범위에 해당 스타일을 적용한다.
        rootNode.appendChild(cssLink);
      } else {
        document.head.appendChild(cssLink);
      }
    }

    if (workerPath) {
      setWorkerUrl(`${resourcePath}/${workerPath}`);
    }

    editor = createMonacoEditor(editorContainer, {
      value,
      language,
      theme,
      minimap: {
        enabled: minimap,
      },
      hover,
      contextmenu: false,
      scrollBeyondLastLine: false,
      matchBrackets,
      bracketPairColorization: {
        enabled: bracketPairColorization,
      },
      find: {
        autoFindInSelection,
      },
    });

    editor.getModel().onDidChangeContent(async () => {
      value = editor.getValue();
      await tick();
      dispatch("contentChange", { value });
    });

    if (autoFindMatches) {
      let currentDecorations = [];

      editor.onDidChangeCursorPosition((e) => {
        dispatch("cursorPositionChange", { position: e.position });
      });

      editor.onDidChangeCursorSelection((e) => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);

        if (
          editor.hasTextFocus() &&
          selectedText &&
          selectedText.trim() !== ""
        ) {
          const matches = editor.getModel().findMatches(
            selectedText,
            true, // searchOnlyEditableRange
            false, // isRegex
            true, // matchCase
            null, // wordSeparators
            true // captureMatches
          );

          // 현재 선택된 영역의 범위
          const selectionRange = createRange(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          );

          // 현재 선택된 영역을 제외한 매칭 결과
          const decorations = matches
            .filter((match) => !selectionRange.equalsRange(match.range))
            .map((match) => ({
              range: match.range,
              options: {
                className: "s-comp-monaco-editor-selection-match",
              },
            }));

          currentDecorations = editor.deltaDecorations(
            currentDecorations,
            decorations
          );
        } else {
          currentDecorations = editor.deltaDecorations(currentDecorations, []);
        }
      });
    }

    const { keyMod, keyCode } = getMonacoKeyBindingConstant();
    editor.addAction({
      id: "svelte-monaco-editor-action",
      label: "Run Code",
      keybindings: [keyMod.Alt | keyMod.Shift | keyCode.KeyR],
      run: function (ed) {
        dispatch("runCode", { value: ed.getValue() });
      },
    });
  }

  $: if (editorContainer) {
    initMonacoEditor(editorContainer);
    dispatch("editorInit");
  }
</script>

<div
  bind:this={editorContainer}
  id="svelte-monaco-editor-container"
  style:width
  style:height
>
  <div style:display="none">
    <slot />
  </div>
</div>

<style>
  /* 'outline'은 'border'와 다르게 요소의 크기를 변경하지 않는다. */
  :global(.s-comp-monaco-editor-selection-match) {
    background-color: rgba(128, 128, 128, 0.2); /* 회색 계열의 옅은 배경색 */
    outline: 1px solid rgba(255, 255, 0, 0.3); /* 얇은 노란색 옅은 보더 */
  }
</style>
