<svelte:options customElement="s-pyrun" />

<script>
  import { onMount, tick } from "svelte";
  import Pyodide from "./Pyodide.svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
  import Console from "../Console/Console.svelte";
  import DataStore from "../DataStore/DataStore.svelte";

  export let pyodideIndexURL = ".";
  export let editorResourcePath;
  export let code = "";
  export let runCodeWhenPyodideLoaded = false;
  export let autoClearConsole = false;
  export let noConsole = false;
  export let consoleFontSize = "0.5em";

  export const getDataStore = () => dataStore;

  let dataStore = undefined;

  let pyodide;
  let editor;
  let customConsole;
  let customConsoleHeight = "100%";

  export const isPyodideLoaded = () => pyodide && pyodide.isLoaded();

  export const update = async (focus = false) => {
    if (editor) {
      await tick();
      editor.layout(true);
      if (focus) {
        editor.focus();
      }
    }
  };

  export const runCode = (code = "") => {
    if (pyodide) {
      try {
        pyodide.runCode(code);
      } catch (error) {
        if (customConsole) {
          customConsole.error(error);
        } else {
          console.warn("custom console is not available.");
          console.error(`Error from PyRun:\n${error.message}`);
        }
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

  function handlePanelSizeChange(event) {
    if (editor) {
      editor.layout(true);
    }

    // NOTE: 높이가 '100%'로 설정되면 'overflow: auto'가 동작하지 않음.
    //       스플릿터의 해당 컨텐트 패널의 높이로 커스텀 콘솔의 높이를 고정시킴.
    customConsoleHeight = `${event.detail.panel_1.height}px`;
  }

  onMount(() => {
    if (noConsole) {
      editor.layout(true);
    }
  });

  $: if (noConsole && dataStore) {
    customConsole = {
      log: (msg) => {
        if (dataStore.subscriberCount > 0) {
          dataStore.set({ log: msg });
        } else {
          console.log(msg);
        }
      },
      error: (msg) => {
        if (dataStore.subscriberCount > 0) {
          dataStore.set({ error: msg });
        } else {
          console.error(msg);
        }
      }
    };
  }
</script>

<Pyodide
  bind:this={pyodide}
  {pyodideIndexURL}
  console={customConsole}
  on:loaded={pyodideLoaded}
/>

<div class="pyrun-box">
  {#if noConsole}
    <MonacoEditor
      width="100%"
      height="100%"
      value={code}
      resourcePath={editorResourcePath}
      bind:this={editor}
      on:runCode={handleRunCodeFromEditor}
    />
    <DataStore bind:this={dataStore} />
  {:else}
    <Splitter
      orientation="vertical"
      panel_0_length={"60%"}
      on:panelSizeChanged={handlePanelSizeChange}
    >
      <MonacoEditor
        slot="top"
        width="100%"
        height="100%"
        value={code}
        resourcePath={editorResourcePath}
        bind:this={editor}
        on:runCode={handleRunCodeFromEditor}
      />
      <Console
        slot="bottom"
        bind:this={customConsole}
        bind:height={customConsoleHeight}
        fontSize={consoleFontSize}
        autoClear={autoClearConsole}
      />
    </Splitter>
  {/if}
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
