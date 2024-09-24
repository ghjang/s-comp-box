/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import fg from "fast-glob";
import { join, dirname, posix, resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILE_PATH = join(__dirname, "src/monaco-editor-custom.js");
generateLanguages();
generateFeatures();

/**
 * @returns { Promise<string[]> }
 */
async function getBasicLanguages() {
  const pattern =
    "./node_modules/monaco-editor/esm/vs/basic-languages/**/*.contribution.js";
  const options = { cwd: __dirname };

  try {
    const files = await fg(pattern, options);

    return files.map((file) => {
      // 절대 경로로 변환하고, 불필요한 부분을 제거
      return resolve(file)
        .replace(resolve("node_modules/monaco-editor/esm/"), "")
        .replace(/\.js$/, "")
        .replace(/^\/+/, ""); // 경로의 시작 부분에서 불필요한 '/'를 제거
    });
  } catch (err) {
    console.log("error:", err);
    throw err;
  }
}

/**
 * @returns { Promise<string[]> }
 */
async function getAdvancedLanguages() {
  const pattern =
    "./node_modules/monaco-editor/esm/vs/language/*/monaco.contribution.js";
  const options = { cwd: __dirname };

  try {
    const files = await fg(pattern, options);

    return files
      .map(
        (file) =>
          resolve(file)
            .replace(resolve("node_modules/monaco-editor/esm/vs/language/"), "")
            .replace("/monaco.contribution.js", "")
            .replace(/^\/+/, "") // 경로의 시작 부분에서 불필요한 '/'를 제거
      )
      .map((lang) => `vs/language/${lang}/monaco.contribution`);
  } catch (err) {
    console.log("error:", err);
    throw err;
  }
}

async function generateLanguages() {
  const [basicLanguages, advancedLanguages] = await Promise.all([
    getBasicLanguages(),
    getAdvancedLanguages(),
  ]);

  basicLanguages.sort(strcmp);
  advancedLanguages.sort(strcmp);

  const allLanguages = advancedLanguages.concat(basicLanguages);
  const imports = allLanguages
    .map((l) => `import 'monaco-editor/esm/${l}.js';`)
    .map((l) => `${/python/.test(l) ? "" : "// "}${l}`)
    .join("\n");

  let contents = readFileSync(FILE_PATH).toString();
  contents = contents.replace(
    /\/\/ BEGIN_LANGUAGES\n([\s\S]*?)\/\/ END_LANGUAGES/,
    `// BEGIN_LANGUAGES\n${imports}\n// END_LANGUAGES`
  );
  writeFileSync(FILE_PATH, contents);
}

function strcmp(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/**
 * @returns { string[] }
 */
function generateFeatures() {
  const skipImports = [
    "vs/editor/common/standaloneStrings",
    "vs/editor/contrib/tokenization/tokenization",
    "vs/editor/editor.all",
    "vs/base/browser/ui/codicons/codiconStyles",
  ];

  let features = [];
  const files =
    readFileSync(
      join(
        __dirname,
        "./node_modules/monaco-editor/esm/vs/editor/edcore.main.js"
      )
    ).toString() +
    readFileSync(
      join(
        __dirname,
        "./node_modules/monaco-editor/esm/vs/editor/editor.all.js"
      )
    ).toString();
  files.split(/\r\n|\n/).forEach((line) => {
    const m = line.match(/import '([^']+)'/);
    if (m) {
      const tmp = posix.join("vs/editor", m[1]).replace(/\.js$/, "");
      if (skipImports.indexOf(tmp) === -1) {
        features.push(tmp);
      }
    }
  });

  features.sort(strcmp);
  const imports = features
    .map((l) => `import 'monaco-editor/esm/${l}.js';`)
    .map((l) => `${/(coreCommands)|(findController)/.test(l) ? "" : "// "}${l}`)
    .join("\n");

  let contents = readFileSync(FILE_PATH).toString();
  contents = contents.replace(
    /\/\/ BEGIN_FEATURES\n([\s\S]*?)\/\/ END_FEATURES/,
    `// BEGIN_FEATURES\n${imports}\n// END_FEATURES`
  );
  writeFileSync(FILE_PATH, contents);
}
