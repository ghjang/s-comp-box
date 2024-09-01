import SCompBox from "/build/dev/default/SCompBox.js";

const sCompBox = new SCompBox({
  target: document.querySelector("#s-comp-box-container"),
  props: {
    customElementConfigBasePath: "/build/dev/default",

    compJsBundleBasePath: "/build/dev/default",
    customCompJsBundleBasePath: "/build/dev/custom",

    compProps: {
      AbcRun: {
        editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
      },
      Marquee: {
        text: "Hello, SCompBox!",
        preAction: {
          type: "prompt",
          title: "New Text",
          content: "Input New Marquee Text",
          targetProp: "text",
        },
      },
      PyRun: {
        pyodideIndexURL: "/build/dev/vendor/pyodide",
        editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
        code: 'print("Hello, Pyodide!")',
      },
    },
  },
});

window.addEventListener("beforeunload", () => sCompBox.$destroy());
