<svelte:options customElement="s-pyrun" />

<script>
  import Pyodide from "./Pyodide.svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
  import Console from "../Console/Console.svelte";

  export let pyodideIndexURL = ".";
  export let editorCssBasePath;
  export let code = "";
  export let runCodeWhenPyodideLoaded = false;
  export let autoClearConsole = false;

  let pyodide;
  let customConsole;

  export const isPyodideLoaded = () => pyodide && pyodide.isLoaded();

  export const runCode = (code = "") => {
    if (pyodide) {
      try {
        pyodide.runCode(code);
      } catch (error) {
        customConsole.error(error);
      }
    }
  };

  function pyodideLoaded() {
    if (runCodeWhenPyodideLoaded && code) {
      runCode(code);
    }
  }

  function handleRunCodeFromEditor(event) {
    const code = event.detail.value;
    runCode(code);
  }

  let editor;
  let customConsoleHeight = "100%";

  function handlePanelSizeChange(event) {
    if (editor) {
      editor.layout(true);
    }

    // NOTE: 높이가 '100%'로 설정되면 'overflow: auto'가 동작하지 않음.
    //       스플릿터의 해당 컨텐트 패널의 높이로 커스텀 콘솔의 높이를 고정시킴.
    customConsoleHeight = `${event.detail.panel_1.height}px`;
  }
</script>

<Pyodide
  bind:this={pyodide}
  {pyodideIndexURL}
  console={customConsole}
  on:loaded={pyodideLoaded}
/>

<div class="pyrun-box">
  <Splitter
    orientation="vertical"
    content_panel_0_length={"60%"}
    on:panelSizeChanged={handlePanelSizeChange}
  >
    <MonacoEditor
      slot="top"
      width="100%"
      height="100%"
      value={code}
      cssBasePath={editorCssBasePath}
      bind:this={editor}
      on:runCode={handleRunCodeFromEditor}
    />
    <Console
      slot="bottom"
      bind:this={customConsole}
      bind:height={customConsoleHeight}
      autoClear={autoClearConsole}
    />
  </Splitter>
</div>

<style>
  .pyrun-box {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
