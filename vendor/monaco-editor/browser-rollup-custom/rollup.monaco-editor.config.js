import path from "path";
import { fileURLToPath } from "url";
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

    // NOTE: 'terser' 플러그인을 사용하지 않음. terser는 모나코 에디터 번들링 결과를 다시 참조하는
    //       프로젝트에서 번들링후 최종 결과물에서만 실행되도 충분할 것임.
    //
    //       참고로, terser를 잘못 사용하면 의도하지 않게 생성 결과물에서 특정 내용이 제거되어 문제가 발생할 수도 있음.
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        modulesOnly: true,
        customResolveOptions: {
          preserveSymlinks: false,
        },
      }),
      commonjs(),
      css({ output: `${name}.css` }),
      url({
        include: ["**/*.ttf"],
        limit: Infinity,
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
