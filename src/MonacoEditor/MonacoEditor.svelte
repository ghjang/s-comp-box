<svelte:options customElement="s-monaco-editor" />

<script>
  import { onDestroy, createEventDispatcher, tick } from "svelte";
  import {
    createMonacoEditor,
    getMonacoKeyBindingConstant,
    setWorkerUrl,
    registerCustomLanguage as register,
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

  export const setCodeText = (code) => (value = code);
  export const getCodeText = () => value;
  export const registerCustomLanguage = register;

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

    const slotElem = container.querySelector("slot");
    if (slotElem) {
      const firstCodeElem = slotElem
        .assignedNodes()
        .find((node) => node.nodeName === "CODE");

      if (firstCodeElem) {
        const codeText = firstCodeElem.textContent;
        setText(codeText, true);
      }
    }
  }

  $: editorContainer && initMonacoEditor(editorContainer);
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
