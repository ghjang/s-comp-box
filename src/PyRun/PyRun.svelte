<script>
  import { onMount, tick } from "svelte";
  import { Console, DataStore, Splitter } from "s-comp-core";
  import Pyodide from "./Pyodide.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";

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

    if (!noConsole && customConsole) {
      customConsole.update();
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

  function handleEditorInit() {
    const { keyMod, keyCode } = editor.getMonacoKeyBindingConstant();

    if (!keyMod || !keyCode) {
      return;
    }

    editor.addAction({
      id: "pyrun-run-code",
      label: "Run Code",
      precondition: "editorTextFocus",
      keybindings: [keyMod.Alt | keyMod.Shift | keyCode.KeyR],
      run: () => runCode(editor.getText()),
    });
  }

  function handlePanelSizeChange(event) {
    if (editor && typeof editor.layout === "function") {
      editor.layout(true);
    }

    // NOTE: 높이가 '100%'로 설정되면 'overflow: auto'가 동작하지 않음.
    //       스플릿터의 해당 컨텐트 패널의 높이로 커스텀 콘솔의 높이를 고정시킴.
    customConsoleHeight = `${event.detail.panel_1.height}px`;
  }

  onMount(() => {
    if (noConsole) {
      editor?.layout(true);
    } else {
      customConsole?.update();
    }
  });

  $: if (noConsole && dataStore) {
    customConsole = {
      log: (msg) => {
        if (dataStore.subscriberCount() > 0) {
          dataStore.set({ log: msg });
        } else {
          console.log(msg);
        }
      },
      error: (msg) => {
        if (dataStore.subscriberCount() > 0) {
          dataStore.set({ error: msg });
        } else {
          console.error(msg);
        }
      },
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
      bind:this={editor}
      width="100%"
      height="100%"
      value={code}
      resourcePath={editorResourcePath}
      on:editorInit={handleEditorInit}
    />
    <DataStore
      bind:this={dataStore}
      dataProps={{ sourceComponentName: "PyRun" }}
    />
  {:else}
    <Splitter
      orientation="vertical"
      panel_0_length={"60%"}
      on:panelSizeChanged={handlePanelSizeChange}
    >
      <MonacoEditor
        bind:this={editor}
        slot="top"
        width="100%"
        height="100%"
        value={code}
        resourcePath={editorResourcePath}
        on:editorInit={handleEditorInit}
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
