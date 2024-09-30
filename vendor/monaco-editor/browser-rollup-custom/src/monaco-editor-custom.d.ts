import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

export type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

export type IMonarchLanguage = monaco.languages.IMonarchLanguage;
export type IMonarchLanguageRule = monaco.languages.IMonarchLanguageRule;
export type IMonarchLanguageBracket = monaco.languages.IMonarchLanguageBracket;

export type IRange = monaco.IRange;
export type ITextModel = monaco.editor.ITextModel;
export type Position = monaco.Position;
export type CompletionItem = monaco.languages.CompletionItem;
export type CompletionItemProvider = monaco.languages.CompletionItemProvider;
export type CompletionList = monaco.languages.CompletionList;
export type ProviderResult<T> = monaco.languages.ProviderResult<T>;

export type CompletionItemKindType = typeof monaco.languages.CompletionItemKind;
export type IndentActionType = typeof monaco.languages.IndentAction;
export const CompletionItemKind: typeof monaco.languages.CompletionItemKind;
export const IndentAction: typeof monaco.languages.IndentAction;

// NOTE: 'monaco.editor.TrackedRangeStickiness'를 직접 참조할 경우에 추가적인 의존 모듈이 필요해져서
//       결과적으로 'SvelteKit'에서 'SSR'시에 문제가 발생한다.
//export const TrackedRangeStickiness: typeof monaco.editor.TrackedRangeStickiness;

export function getIndentAction(
  indentAction: string
): monaco.languages.IndentAction;

export function setWorkerUrl(url: string): void;

export function createRange(
  startLineNumber: number,
  startColumn: number,
  endLineNumber: number,
  endColumn: number
): monaco.Range;

export function equalsRange(
  range1: monaco.Range,
  range2: monaco.Range
): boolean;

export function getMonacoKeyBindingConstant(): {
  keyMod: typeof monaco.KeyMod;
  keyCode: typeof monaco.KeyCode;
};

export interface LanguageOptions {
  id: string;
  languageDef?: monaco.languages.IMonarchLanguage;
  completionItemProvider?: monaco.languages.CompletionItemProvider;
}

export function registerCustomLanguage(langOpts: LanguageOptions): void;

export interface Warning {
  problemText: string;
  message: string;
  lineNumber?: number;
  columnNumber?: number;
}

export interface Marker extends monaco.editor.IMarkerData {
  id: string;
}

export function getMarkerStore(): { [key: string]: Marker };

export function setWarnings(
  editor: monaco.editor.IStandaloneCodeEditor,
  warnings: Warning[]
): { [key: string]: Marker };

export function clearWarnings(
  editor: monaco.editor.IStandaloneCodeEditor
): void;

export function clearSpecificWarning(
  editor: monaco.editor.IStandaloneCodeEditor,
  markerId: string
): void;

export function createMonacoEditor(
  element: HTMLElement,
  options: monaco.editor.IStandaloneEditorConstructionOptions
): monaco.editor.IStandaloneCodeEditor;

//============================================================
export interface MonacoBundleModule {
  registerCustomLanguage: (langOpts: LanguageOptions) => void;
  setWarnings: (
    editor: IStandaloneCodeEditor,
    warnings: Warning[]
  ) => { [key: string]: Marker };
  clearWarnings: (editor: IStandaloneCodeEditor) => void;
  clearSpecificWarning: (
    editor: IStandaloneCodeEditor,
    markerId: string
  ) => void;
  createRange: (
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number
  ) => monaco.Range;
  equalsRange: (range1: monaco.Range, range2: monaco.Range) => boolean;
  setWorkerUrl: (url: string) => void;
  createMonacoEditor: (
    element: HTMLElement,
    options: any
  ) => IStandaloneCodeEditor;
  getMonacoKeyBindingConstant: () => { keyMod: any; keyCode: any };
  getMarkerStore: () => { [key: string]: Marker };
  CompletionItemKind: CompletionItemKindType;
  IndentAction: IndentActionType;
  getIndentAction: (indentAction: string) => IndentActionType;
}
