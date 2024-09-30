<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher, tick } from "svelte";
  import type {
    IStandaloneCodeEditor as Editor,
    IRange,
    LanguageOptions,
    MonacoBundleModule,
    Warning,
  } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";

  const dispatch = createEventDispatcher();
  let monacoBundleModule: MonacoBundleModule;

  export let resourcePath: string | null = null;
  export let bundleName = "monaco-editor-custom";
  export let workerPath = "editor.worker.bundle.js";

  export let width = "100%";
  export let height = "100%";

  export let value = "";
  export let language = "python";
  export let theme = "vs-dark";
  export let minimap = true;
  export let hover = false;
  export let matchBrackets: "never" | "near" | "always" = "near";
  export let bracketPairColorization = true;
  export let autoFindInSelection: "never" | "always" | "multiline" =
    "multiline";
  export let autoFindMatches = false;
  export let showStatusBar = false;

  export const registerCustomLanguage = (langOpts: LanguageOptions): void => {
    monacoBundleModule.registerCustomLanguage(langOpts);
  };

  export const setEditorWarnings = (warnings: Warning[]): void => {
    editor && monacoBundleModule.setWarnings(editor, warnings);
  };

  export const clearEditorWarnings = (): void => {
    editor && monacoBundleModule.clearWarnings(editor);
  };

  let editorContainer: HTMLElement;
  let editor: Editor;
  let editorBgColor: string | null;
  let statusBar: HTMLElement;

  export async function update(): Promise<void> {
    await tick();
    layout();
  }

  export function layout(revealPosition = false): void {
    if (editor) {
      editor.layout();

      if (revealPosition) {
        const pos = editor.getPosition();
        pos && editor.revealPosition(pos);
      }

      if (!editorBgColor) {
        editorBgColor = getEditorBackgroundColor();
      }
    }
  }

  export function focus(): void {
    if (editor) {
      editor.focus();
    }
  }

  export function getText(): string {
    return editor ? editor.getValue() : "";
  }

  export function setText(text: string, formatDocument = false): void {
    if (!editor || text === undefined || text === null) {
      return;
    }

    editor.setValue(text);
    if (formatDocument) {
      // FIXME: '코드 포맷팅' 기능 동작하지 않음.
      //
      // 'HTML, CSS, JavaScript'등의 기본적인 언어에 대한 코드 텍스트의 포맷팅은
      // 모나코 에디터 자체에서 기본적으로 지원(?)한다고 하는 것 같음. 확인 필요함.
      //
      // 'Python'같은 언어의 경우에는 자체 지원은 없고 'Prettier' 같은
      // 외부 라이브러리를 사용해야 한다고 함(?).
      editor.getAction("editor.action.formatDocument")?.run();
    }
  }

  export function getSelection(): IRange | null {
    return editor ? editor.getSelection() : null;
  }

  export function setSelection(range: IRange): void {
    if (
      range &&
      typeof range.startLineNumber === "number" &&
      typeof range.startColumn === "number" &&
      typeof range.endLineNumber === "number" &&
      typeof range.endColumn === "number"
    ) {
      const r = monacoBundleModule.createRange(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn,
      );
      editor.setSelection(r);
    } else {
      throw new Error("Invalid selection object");
    }
  }

  export function getModel() {
    return editor ? editor.getModel() : null;
  }

  export function getEditorBackgroundColor(): string | null {
    if (editorContainer) {
      const monacoEditorDiv = editorContainer.querySelector(".monaco-editor");
      if (monacoEditorDiv instanceof HTMLElement) {
        const bgColor =
          window.getComputedStyle(monacoEditorDiv).backgroundColor;
        return bgColor;
      }
    }
    return null;
  }

  function initMonacoEditor(container: HTMLElement): void {
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
      monacoBundleModule.setWorkerUrl(`${resourcePath}/${workerPath}`);
    }

    editor = monacoBundleModule.createMonacoEditor(editorContainer, {
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

    editor.getModel()?.onDidChangeContent(async () => {
      value = editor.getValue();
      await tick();
      dispatch("contentChange", { value });
    });

    if (autoFindMatches) {
      let currentDecorations: string[] = [];

      editor.onDidChangeCursorPosition((e) => {
        dispatch("cursorPositionChange", { position: e.position });
      });

      editor.onDidChangeCursorSelection((_e) => {
        const selection = editor.getSelection();
        if (!selection) return;

        const selectedText = editor.getModel()?.getValueInRange(selection);

        if (
          editor.hasTextFocus() &&
          selectedText &&
          selectedText.trim() !== ""
        ) {
          const matches = editor.getModel()?.findMatches(
            selectedText,
            true, // searchOnlyEditableRange
            false, // isRegex
            true, // matchCase
            null, // wordSeparators
            true, // captureMatches
          );

          if (!matches) return;

          // 현재 선택된 영역의 범위
          const selectionRange = monacoBundleModule.createRange(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn,
          );

          // 현재 선택된 영역을 제외한 매칭 결과
          const decorations = matches
            .filter(
              (match) =>
                !monacoBundleModule.equalsRange(selectionRange, match.range),
            )
            .map((match) => ({
              range: match.range,
              options: {
                className: "s-comp-monaco-editor-selection-match",
              },
            }));

          // FIXME: 'deprecated'된 'deltaDecorations' 메서드 제거
          currentDecorations = editor.deltaDecorations(
            currentDecorations,
            decorations,
          );
        } else {
          currentDecorations = editor.deltaDecorations(currentDecorations, []);
        }
      });
    }

    if (showStatusBar && statusBar) {
      editor.onDidChangeCursorPosition((e) => {
        const lineNumber = e.position.lineNumber;
        const column = e.position.column;
        const model = editor.getModel();
        const lineCount = model?.getLineCount() ?? 0;
        statusBar.textContent = `Ln ${lineNumber}, Col ${column} (${lineCount} lines)`;
      });
    }

    const { keyMod, keyCode } =
      monacoBundleModule.getMonacoKeyBindingConstant();
    editor.addAction({
      id: "svelte-monaco-editor-action",
      label: "Run Code",
      keybindings: [keyMod.Alt | keyMod.Shift | keyCode.KeyR],
      run: function (ed) {
        dispatch("runCode", { value: ed.getValue() });
      },
    });
  }

  onMount(async () => {
    monacoBundleModule = (await import(
      "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js"
    )) as unknown as MonacoBundleModule;
    initMonacoEditor(editorContainer);
    dispatch("editorInit");
  });

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });
</script>

<div class="editor-wrapper" style:background-color={editorBgColor}>
  <div
    bind:this={editorContainer}
    class="monaco-editor-container"
    style:width
    style:height
  >
    <div style:display="none">
      <slot />
    </div>
  </div>
  {#if showStatusBar}
    <div bind:this={statusBar} class="status-bar"></div>
  {/if}
</div>

<style>
  /* 'outline'은 'border'와 다르게 요소의 크기를 변경하지 않는다. */
  :global(.s-comp-monaco-editor-selection-match) {
    background-color: rgba(128, 128, 128, 0.2); /* 회색 계열의 옅은 배경색 */
    outline: 1px solid rgba(255, 255, 0, 0.3); /* 얇은 노란색 옅은 보더 */
  }

  .editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .monaco-editor-container {
    flex-grow: 1;
  }

  .status-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 1.2em;
    text-align: right;
    padding-right: 10px;
    background-color: #1e1e1e;
    color: #d4d4d4;
    font-family: "Courier New", Courier, monospace;
    border-top: 1px solid #3c3c3c;
  }
</style>
