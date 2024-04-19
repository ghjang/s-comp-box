<svelte:options customElement="s-pyrun" />

<script>
  import { onMount } from "svelte";
  import Pyodide from "./Pyodide.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";

  export let pyodideIndexURL = ".";
  export let code = "";
  export let runCodeWhenPyodideLoaded = false;

  const customConsole = {
    log: (output) => {
      if (pyrunConsoleOutputElem) {
        pyrunConsoleOutputElem.innerHTML += `<div>${output}</div>`;
      }
    },

    error: (output) => {
      if (pyrunConsoleOutputElem) {
        pyrunConsoleOutputElem.innerHTML += `<div style="color: red;">${output}</div>`;
      }
    },
  };

  let pyodide;
  let pyrunConsoleOutputElem;

  export const isPyodideLoaded = () => pyodide && pyodide.isLoaded();
  export const runCode = (code = "") => pyodide && pyodide.runCode(code);

  function pyodideLoaded() {
    if (runCodeWhenPyodideLoaded && code) {
      runCode(code);
    }
  }

  function handleRunCodeFromEditor(event) {
    const code = event.detail.value;
    runCode(code);
  }
</script>

<Pyodide
  bind:this={pyodide}
  {pyodideIndexURL}
  console={customConsole}
  on:loaded={pyodideLoaded}
/>

<div class="pyrun-box">
  <div class="pyrun-code-editor">
    <MonacoEditor
      width="100%"
      height="100%"
      value={code}
      on:runCode={handleRunCodeFromEditor}
    />
  </div>
  <div bind:this={pyrunConsoleOutputElem} class="pyrun-console-output"></div>
</div>

<style>
  .pyrun-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 3px solid #333;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
  }
  .pyrun-code-editor {
    width: 100%;
    height: 70%;
    border-bottom: 2px solid #333;
  }
  .pyrun-console-output {
    width: 100%;
    height: 30%;
    background-color: black;
    color: lime;
    padding: 10px;
    font-family: monospace;
    white-space: pre-wrap;
    overflow: auto;
    box-sizing: border-box;
  }
</style>
