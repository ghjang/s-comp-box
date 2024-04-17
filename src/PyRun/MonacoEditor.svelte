<script>
    import * as monaco from "monaco-editor";
  
    /*
    import workerMainJs from "monaco-editor/dev/vs/base/worker/workerMain.js";
    import editorWorkerJs from "monaco-editor/esm/vs/editor/editor.worker.js";
  
    globalThis.MonacoEnvironment = {
      getWorkerUrl(moduleId, label) {
        if (label === "editorWorkerService") {
          return URL.createObjectURL(new Blob([editorWorkerJs], { type: "application/javascript" }));
        } else if (moduleId === "workerMain.js") {
          return URL.createObjectURL(new Blob([workerMainJs], { type: "application/javascript" }));
        }
      }
    };
    */
  
    let editorContainer;
    let editor;
  
    $: {
      if (editorContainer) {
        editor = monaco.editor.create(editorContainer, {
          value: `print("Hello, Python!")`,
          language: "python",
        });
      }
    }
  </script>
  
  <div
    bind:this={editorContainer}
    id="monaco-container"
    style="width:800px;height:600px;border:1px solid grey"
  ></div>
  
  <style>
  </style>
  