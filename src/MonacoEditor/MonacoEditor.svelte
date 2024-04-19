<svelte:options customElement="s-monaco-editor" />

<script>
  import { createMonacoEditor } from "./monaco-editor-bundle/monaco-editor-small-python.bundle.js";

  export let width = "400px";
  export let height = "300px";

  export let value = "";
  export let language = "python";
  export let theme = "vs-dark";

  let editorContainer;
  let editor;

  $: {
    if (editorContainer) {
      editor = createMonacoEditor(editorContainer, {
        value,
        language,
        theme,
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
