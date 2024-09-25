// refer to:
//   - https://microsoft.github.io/monaco-editor/monarch.html
//    - Monaco Editor API: https://microsoft.github.io/monaco-editor/typedoc/index.html
//
// NOTE: '토크나이저'는 '문법 체크'를 하는 것이 아님에 유의할 것.
//       어느 정도 '토크나이징 컨텍스트'를 정의할 수 있지만,
//       토크나이저 자체는 그 해석 컨텍스트 자체의 문법을 체크하는 것이 아니다.
//       해석 컨텍스트 내에서 유효한 '토큰'을 (어느 정도는 순서에 상관없이) 분리해내는 것이
//       토크나이저의 주관심사이다.

import { IndentAction } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";
import { headers, headerRules } from "./abc.lang.header";

const langdef = {
  ignoreCase: false,
  includeLF: true,
  defaultToken: "invalid",

  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  headers,

  tokenizer: {
    root: [
      [
        /([A-Z])(\s*)(:)/,
        [
          {
            cases: {
              "@headers": "keyword",
            },
          },
          "white",
          { token: "delimiter", next: "@header$1" },
        ],
      ],

      { include: "@whitespace" },

      [/[\[\]]/, "@brackets"],

      [/!.*?!/, "decorator"],

      [/[A-Ga-gz]/, "constant"],

      [/\d+/, "number"],

      // accidentals, factors and tie
      [/[\^_=\/,>-]/, "operator"],

      [/\|:|:\||\|/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // characters
      [/'[^\\']'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/%\{/, { token: "delimiter.bracket", bracket: "@open" }],
      [/%\}/, { token: "delimiter.bracket", bracket: "@close" }],
      [/%.*\n/, "comment"],
    ],

    ...headerRules,
  },

  brackets: [
    ["{", "}", "delimiter.curly"],
    ["[", "]", "delimiter.square"],
    ["(", ")", "delimiter.parenthesis"],
    ["%{", "%}", "delimiter.bracket"],
  ],

  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "%{", close: "%}" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],

  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "%{", close: "%}" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],

  folding: {
    offSide: true,
    markers: {
      start: /%\{/,
      end: /%\}/,
    },
  },

  onEnterRules: [
    {
      beforeText: /%\{\s*$/,
      afterText: /%\}/,
      action: { indentAction: IndentAction.IndentOutdent },
    },
  ],
};

export default langdef;
