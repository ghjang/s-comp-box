<svelte:options customElement="s-monaco-editor" />

<script>
  import { onDestroy, createEventDispatcher, tick } from "svelte";
  import {
    createMonacoEditor,
    getMonacoKeyBindingConstant,
  } from "./monaco-editor-bundle/monaco-editor-small-python.bundle.js";

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

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });

  $: {
    if (editorContainer && !editor) {
      editor = createMonacoEditor(editorContainer, {
        value,
        language,
        theme,
        contextmenu: false,
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
  }
</script>

<div
  bind:this={editorContainer}
  id="svelte-monaco-editor-container"
  style:width
  style:height
></div>

<style>
</style>
