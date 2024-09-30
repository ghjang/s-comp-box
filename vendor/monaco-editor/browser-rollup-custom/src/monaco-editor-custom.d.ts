import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

export type IMonarchLanguage = monaco.languages.IMonarchLanguage;
export type IMonarchLanguageRule = monaco.languages.IMonarchLanguageRule;
export type IMonarchLanguageBracket = monaco.languages.IMonarchLanguageBracket;

export type CompletionItemKindType = typeof monaco.languages.CompletionItemKind;
export type IndentActionType = typeof monaco.languages.IndentAction;
export const CompletionItemKind: typeof monaco.languages.CompletionItemKind;
export const IndentAction: typeof monaco.languages.IndentAction;

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
