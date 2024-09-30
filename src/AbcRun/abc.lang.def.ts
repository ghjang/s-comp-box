// refer to:
//   - https://microsoft.github.io/monaco-editor/monarch.html
//    - Monaco Editor API: https://microsoft.github.io/monaco-editor/typedoc/index.html
//
// NOTE: '토크나이저'는 '문법 체크'를 하는 것이 아님에 유의할 것.
//       어느 정도 '토크나이징 컨텍스트'를 정의할 수 있지만,
//       토크나이저 자체는 그 해석 컨텍스트 자체의 문법을 체크하는 것이 아니다.
//       해석 컨텍스트 내에서 유효한 '토큰'을 (어느 정도는 순서에 상관없이) 분리해내는 것이
//       토크나이저의 주관심사이다.

import {
  type IMonarchLanguage,
  type IMonarchLanguageRule,
  IndentAction,
} from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";
import { headers, headerRules } from "./abc.lang.header";

interface LanguageDefinition extends IMonarchLanguage {
  headers: string[];
  tokenizer: {
    root: IMonarchLanguageRule[];
    string: IMonarchLanguageRule[];
    whitespace: IMonarchLanguageRule[];
    [key: string]: IMonarchLanguageRule[];
  };
  autoClosingPairs: { open: string; close: string }[];
  surroundingPairs: { open: string; close: string }[];
  folding: {
    offSide: boolean;
    markers: {
      start: RegExp | string;
      end: RegExp | string;
    };
  };
  onEnterRules: {
    beforeText: RegExp;
    afterText?: RegExp;
    action: { indentAction: number };
  }[];
}

const langdef: LanguageDefinition = {
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

  // NOTE: 'brackets' 속성은 IMonarchLanguageBracket 타입 원소의 배열 형태로 정의되어 있다.
  //       IMonarchLanguageBracket은 '객체' 형태로 정의된 '인터페이스'이지만,
  //       Monaco Editor의 실제 구현에서는 배열 형태를 지정하지 않으면 런타임 오류가 발생한다.
  //       해서 임시로 타입 체크 경고를 무시하고 배열 형태로 사용한다.
  brackets: [
    ["{", "}", "delimiter.curly"],
    ["[", "]", "delimiter.square"],
    ["(", ")", "delimiter.parenthesis"],
    ["%{", "%}", "delimiter.bracket"],
  ] as any, // 'as any'를 사용하여 타입 체크 경고를 억제

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
