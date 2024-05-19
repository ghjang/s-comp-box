<svelte:options customElement="s-monaco-editor" />

<script>
  import { onDestroy, createEventDispatcher, tick } from "svelte";
  import {
    createMonacoEditor,
    getMonacoKeyBindingConstant,
  } from "./monaco-editor-bundle/monaco-editor-small-python.bundle.js";

  export let cssBasePath = "";
  export let monacoEditorBundleName = "monaco-editor-small-python";

  export let width = "400px";
  export let height = "300px";

  export let value = "";
  export let language = "python";
  export let theme = "vs-dark";

  export const setCodeText = (code) => (value = code);
  export const getCodeText = () => value;

  const dispatch = createEventDispatcher();

  let editorContainer;
  let editor;

  export function layout(revealPosition = false) {
    if (editor) {
      const pos = editor.getPosition();
      editor.layout();
      if (revealPosition) {
        editor.revealPosition(pos);
      }
    }
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

    // NOTE: 모나코 에디터의 CSS 파일을 동적으로 로드한다.
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${cssBasePath}/${monacoEditorBundleName}.css`;
    const rootNode = container.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      // '표준 웹 컴포넌트'로 사용할 때 Shadow DOM에 스타일을 적용한다.
      rootNode.appendChild(cssLink);
    } else {
      document.head.appendChild(cssLink);
    }

    editor = createMonacoEditor(editorContainer, {
      value,
      language,
      theme,
      contextmenu: false,
      scrollBeyondLastLine: false,
    });

    editor.getModel().onDidChangeContent(async () => {
      value = editor.getValue();
      await tick();
      dispatch("contentChange", { value });
    });

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

  $: editorContainer && initMonacoEditor(editorContainer);
</script>

<div
  bind:this={editorContainer}
  id="svelte-monaco-editor-container"
  style:width
  style:height
></div>
