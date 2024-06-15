<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { loadPyodide } from "../../vendor/pyodide/pyodide-core-0.25.1/pyodide.mjs";

  const dispatch = createEventDispatcher();

  export let pyodideIndexURL = ".";
  export let console = globalThis.console;

  let loadedPyodideModule;

  export function isLoaded() {
    return loadedPyodideModule !== undefined;
  }

  export function runCode(code) {
    if (!isLoaded()) {
      throw new Error("Pyodide is not loaded yet");
    }

    if (!code) {
      throw new Error("No code to run");
    }

    return loadedPyodideModule.runPython(code);
  }

  onMount(async () => {
    loadedPyodideModule = await loadPyodide({ indexURL: pyodideIndexURL });

    if (console !== globalThis.console) {
      loadedPyodideModule.setStdout({
        batched: (msg) => console.log(msg),
      });
      loadedPyodideModule.setStderr({
        batched: (msg) => console.error(msg),
      });
    }

    dispatch("loaded");
  });
</script>
