import path from "path";
import { fileURLToPath } from "url";
import terser from "@rollup/plugin-terser";
import css from "rollup-plugin-css-only";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import url from "@rollup/plugin-url";
import commonjs from "@rollup/plugin-commonjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "dist";
const outputDirBaseName = isProduction ? "dist" : "dev";
const outputDirPath = `../../../build/${outputDirBaseName}/vendor/monaco-editor`;

const inputs = {
  "monaco-editor-custom": "./src/monaco-editor-custom.js",
  "editor.worker":
    "./node_modules/monaco-editor/esm/vs/editor/editor.worker.js",
  "typescript.worker":
    "./node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js",
};

export default Object.keys(inputs).map((name) => {
  const configObj = {
    input: inputs[name],
    output: {
      dir: path.resolve(__dirname, outputDirPath),
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].bundle.js",
      chunkFileNames: "[name].bundle.[hash].js",
      manualChunks(id) {
        if (id.includes("node_modules")) {
          const libraryName = id.split("node_modules/")[1].split("/")[0];
          return `vendor.${libraryName}`;
        }
      },
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      css({ output: `${name}.css` }),
      url({
        include: ["**/*.ttf"],
        limit: Infinity,
      }),
      isProduction &&
        terser({
          mangle: false,
          keep_fnames: true,
          keep_classnames: true,
        }),
    ],
    context: "window",
  };

  // NOTE: '모나코 에디터'의 '웹 워커'를 'ESM'으로 빌드시 '런타임 에러'가 발생함.
  if (name.endsWith("worker")) {
    configObj.output.format = "umd";
    configObj.output.name = "MonacoEditorWorker"; // UMD 네임스페이스
  }

  return configObj;
});
