<script>
  import abcjs from "../../vendor/abcjs/dist/abcjs.bundle.js";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
  import tokenizer from "./abc.tokenizer.js";
  import completionItemProvider from "./abc.completion.js";

  export let editorResourcePath;
  export let abcText = "";

  const renderAbc = () => abcjs.renderAbc("note-staff", abcText);

  let editor;

  $: if (editor) {
    const languageId = "abc";
    editor.registerCustomLanguage({
      id: languageId,
      tokenizer,
      completionItemProvider,
    });
    renderAbc();
  }

  function handlePanelSizeChange() {
    editor?.update();
  }

  function handleContentChange(event) {
    abcText = event.detail.value;
    renderAbc();
  }
</script>

<div class="abcrun-box">
  <Splitter orientation="vertical" on:panelSizeChanged={handlePanelSizeChange}>
    <div id="note-staff" slot="top"></div>
    <MonacoEditor
      bind:this={editor}
      slot="bottom"
      resourcePath={editorResourcePath}
      language="abc"
      value={abcText}
      hover={true}
      on:contentChange={handleContentChange}
    />
  </Splitter>
</div>

<style lang="scss">
  .abcrun-box {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;

    #note-staff {
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: lightgray;
    }
  }
</style>
