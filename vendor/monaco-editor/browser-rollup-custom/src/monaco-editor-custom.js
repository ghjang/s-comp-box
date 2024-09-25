// (1) Desired editor features:
// BEGIN_FEATURES
import 'monaco-editor/esm/vs/editor/browser/coreCommands.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/codeEditor/codeEditorWidget.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/diffEditor/diffEditor.contribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/anchorSelect/browser/anchorSelect.js';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/browser/transpose.js';
// import 'monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js';
// import 'monaco-editor/esm/vs/editor/contrib/codeAction/browser/codeActionContributions.js';
// import 'monaco-editor/esm/vs/editor/contrib/codelens/browser/codelensController.js';
// import 'monaco-editor/esm/vs/editor/contrib/colorPicker/browser/colorContributions.js';
// import 'monaco-editor/esm/vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions.js';
// import 'monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js';
// import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js';
// import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js';
// import 'monaco-editor/esm/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/dnd/browser/dnd.js';
// import 'monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/documentSymbols.js';
// import 'monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.js';
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js';
// import 'monaco-editor/esm/vs/editor/contrib/fontZoom/browser/fontZoom.js';
// import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoError/browser/gotoError.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/goToCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js';
import 'monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js';
// import 'monaco-editor/esm/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.js';
import 'monaco-editor/esm/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.js';
import 'monaco-editor/esm/vs/editor/contrib/inlineEdit/browser/inlineEdit.contribution.js';
import 'monaco-editor/esm/vs/editor/contrib/inlineEdits/browser/inlineEdits.contribution.js';
import 'monaco-editor/esm/vs/editor/contrib/inlineProgress/browser/inlineProgress.js';
// import 'monaco-editor/esm/vs/editor/contrib/lineSelection/browser/lineSelection.js';
// import 'monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/linkedEditing/browser/linkedEditing.js';
// import 'monaco-editor/esm/vs/editor/contrib/links/browser/links.js';
// import 'monaco-editor/esm/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.js';
// import 'monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js';
// import 'monaco-editor/esm/vs/editor/contrib/parameterHints/browser/parameterHints.js';
// import 'monaco-editor/esm/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/readOnlyMessage/browser/contribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/rename/browser/rename.js';
// import 'monaco-editor/esm/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.js';
// import 'monaco-editor/esm/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.js';
// import 'monaco-editor/esm/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.js';
import 'monaco-editor/esm/vs/editor/contrib/smartSelect/browser/smartSelect.js';
// import 'monaco-editor/esm/vs/editor/contrib/snippet/browser/snippetController2.js';
// import 'monaco-editor/esm/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.js';
// import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js';
// import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestInlineCompletions.js';
// import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js';
// import 'monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js';
// import 'monaco-editor/esm/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.js';
// import 'monaco-editor/esm/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';
// END_FEATURES
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

// (2) Desired languages:
// BEGIN_LANGUAGES
// import 'monaco-editor/esm/vs/language/css/monaco.contribution.js';
// import 'monaco-editor/esm/vs/language/html/monaco.contribution.js';
// import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
// import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/_.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/abap/abap.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/apex/apex.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/azcli/azcli.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/bicep/bicep.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/cameligo/cameligo.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/clojure/clojure.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/cypher/cypher.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/dart/dart.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ecl/ecl.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/elixir/elixir.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/flow9/flow9.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/freemarker2/freemarker2.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/go/go.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/hcl/hcl.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/julia/julia.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/less/less.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/lexon/lexon.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/liquid/liquid.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/m3/m3.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/mdx/mdx.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/mips/mips.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/monaco.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pascal/pascal.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pascaligo/pascaligo.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/perl/perl.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/php/php.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pla/pla.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/powerquery/powerquery.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/protobuf/protobuf.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/qsharp/qsharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/r/r.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/restructuredtext/restructuredtext.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/rust/rust.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/scala/scala.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/scheme/scheme.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sophia/sophia.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sparql/sparql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/st/st.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/systemverilog/systemverilog.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/tcl/tcl.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/twig/twig.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/typespec/typespec.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/wgsl/wgsl.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js';
// END_LANGUAGES

//==============================================================================
// NOTE: 'browser-esm-webpack-small' 샘플 번들링 예제를 참고해서 작성함.
//==============================================================================

let workerUrl = new URL("./editor.worker.bundle.js", import.meta.url);

globalThis.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId, _label) {
    // if (label === 'json') {
    // 	return './json.worker.bundle.js';
    // }
    // if (label === 'css' || label === 'scss' || label === 'less') {
    // 	return './css.worker.bundle.js';
    // }
    // if (label === 'html' || label === 'handlebars' || label === 'razor') {
    // 	return './html.worker.bundle.js';
    // }
    // if (label === 'typescript' || label === 'javascript') {
    // 	return './ts.worker.bundle.js';
    // }

    return workerUrl;
  },
};

// 전역 변수로 에디터 인스턴스와 명령어를 관리합니다.
const editorInstances = new Map();
let activeEditorId = null;

// 공통 커맨드 정의
const commonCommands = [
  {
    id: "deleteLines",
    keybinding:
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK,
    handler: (editor) => {
      const position = editor.getPosition();
      const selection = editor.getSelection();
      const model = editor.getModel();
      const lastLineNumber = model.getLineCount();

      let newLineNumber;
      let newColumn;
      let range;

      if (selection.isEmpty()) {
        // No selection, delete the current line
        const lineNumber = position.lineNumber;
        const column = position.column;

        if (lineNumber === lastLineNumber) {
          // If it's the last line, set the new column to 1 and delete till the end of the line
          newLineNumber = lineNumber;
          newColumn = 1;
          range = new monaco.Range(
            lineNumber,
            1,
            lineNumber,
            model.getLineMaxColumn(lineNumber)
          );
        } else {
          // Otherwise, calculate the new column based on the next line's content and delete the entire line
          newLineNumber = lineNumber;
          const newLineContent = model.getLineContent(newLineNumber + 1) || "";
          newColumn = Math.min(column, newLineContent.length + 1);
          range = new monaco.Range(lineNumber, 1, lineNumber + 1, 1);
        }
      } else {
        // Selection exists, delete all lines in the selection
        const startLineNumber = selection.startLineNumber;
        const endLineNumber = selection.endLineNumber;
        const column = selection.startColumn;

        if (endLineNumber === lastLineNumber) {
          // If the selection ends at the last line, set the new column to 1 and delete till the end of the last line
          newLineNumber = endLineNumber;
          newColumn = 1;
          range = new monaco.Range(
            startLineNumber,
            1,
            endLineNumber,
            model.getLineMaxColumn(endLineNumber)
          );
        } else {
          // Otherwise, calculate the new column based on the next line's content and delete all lines in the selection
          newLineNumber = startLineNumber;
          const newLineContent = model.getLineContent(endLineNumber + 1) || "";
          newColumn = Math.min(column, newLineContent.length + 1);
          range = new monaco.Range(startLineNumber, 1, endLineNumber + 1, 1);
        }
      }

      // Execute the deletion
      editor.executeEdits("", [
        { range: range, text: "", forceMoveMarkers: true },
      ]);

      // Set the new position
      editor.setPosition({ lineNumber: newLineNumber, column: newColumn });
    },
  },
  {
    id: "joinLine",
    keybinding: monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyJ,
    handler: (editor) => {
      const position = editor.getPosition();
      const model = editor.getModel();
      const lineNumber = position.lineNumber;
      const lineContent = model.getLineContent(lineNumber);
      const nextLineContent = model.getLineContent(lineNumber + 1);

      if (nextLineContent !== undefined) {
        const range = new monaco.Range(lineNumber + 1, 1, lineNumber + 2, 1);
        const newText = lineContent + nextLineContent;
        editor.executeEdits("", [
          { range: range, text: "", forceMoveMarkers: true },
        ]);
        editor.executeEdits("", [
          {
            range: new monaco.Range(
              lineNumber,
              1,
              lineNumber,
              lineContent.length + 1
            ),
            text: newText,
            forceMoveMarkers: true,
          },
        ]);
        editor.setPosition({
          lineNumber: lineNumber,
          column: lineContent.length + 1,
        });
      }
    },
  },
  {
    id: "duplicateLinesUp",
    keybinding:
      monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
    handler: (editor) => {
      duplicateLines(editor, true);
    },
  },
  {
    id: "duplicateLinesDown",
    keybinding:
      monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
    handler: (editor) => {
      duplicateLines(editor, false);
    },
  },
  {
    id: "moveLinesUp",
    keybinding: monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
    handler: (editor) => {
      moveLines(editor, "up");
    },
  },
  {
    id: "moveLinesDown",
    keybinding: monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
    handler: (editor) => {
      moveLines(editor, "down");
    },
  },
  {
    id: "expandSelection",
    keybinding:
      monaco.KeyMod.WinCtrl |
      monaco.KeyMod.CtrlCmd |
      monaco.KeyMod.Shift |
      monaco.KeyCode.RightArrow,
    handler: (editor) => {
      editor.trigger("keyboard", "editor.action.smartSelect.expand");
    },
  },
  {
    id: "shrinkSelection",
    keybinding:
      monaco.KeyMod.WinCtrl |
      monaco.KeyMod.CtrlCmd |
      monaco.KeyMod.Shift |
      monaco.KeyCode.LeftArrow,
    handler: (editor) => {
      editor.trigger("keyboard", "editor.action.smartSelect.shrink");
    },
  },
];

export function createMonacoEditor(element, options) {
  const editor = monaco.editor.create(element, options);
  const editorId = `editor_${crypto.randomUUID()}`;

  editorInstances.set(editorId, editor);

  editor.onDidFocusEditorText(() => {
    activeEditorId = editorId;
  });

  // 에디터 소멸 시 정리 로직 추가
  editor.onDidDispose(() => {
    editorInstances.delete(editorId);
    if (activeEditorId === editorId) {
      activeEditorId = null;
    }
  });

  // 공통 커맨드 추가
  commonCommands.forEach((cmd) => {
    addCommand(editor, editorId, cmd.keybinding, cmd.handler);
  });

  return editor;
}

function addCommand(editor, editorId, keybinding, handler) {
  editor.addCommand(keybinding, () => {
    const activeEditor = editorInstances.get(activeEditorId);
    if (activeEditor) {
      handler(activeEditor);
    }
  });
}

function duplicateLines(editor, isUp) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  const position = editor.getPosition();
  const lineNumber = position.lineNumber;
  const column = position.column;

  if (selection.isEmpty()) {
    // No selection, duplicate current line
    const lineContent = model.getLineContent(lineNumber);
    const newLineNumber = isUp ? lineNumber : lineNumber + 1;
    const range = new monaco.Range(newLineNumber, 1, newLineNumber, 1);
    const lineCount = model.getLineCount();
    const newLineContent =
      lineNumber === lineCount ? "\n" + lineContent : lineContent + "\n";
    editor.executeEdits("", [
      { range: range, text: newLineContent, forceMoveMarkers: true },
    ]);
    editor.setPosition({ lineNumber: newLineNumber, column: column });
  } else {
    // Selection exists, duplicate selected lines
    const startLineNumber = selection.startLineNumber;
    const endLineNumber = selection.endLineNumber;
    const selectedText = model.getValueInRange(
      new monaco.Range(
        startLineNumber,
        1,
        endLineNumber,
        model.getLineMaxColumn(endLineNumber)
      )
    );
    const newLineNumber = isUp ? startLineNumber : endLineNumber + 1;

    // Check if the selected end line is the last line of the document
    const isEndLineLastLine = endLineNumber === model.getLineCount();

    // If duplicating down and the selected end line is the last line, adjust the range and text
    if (!isUp && isEndLineLastLine) {
      const range = new monaco.Range(newLineNumber, 1, newLineNumber, 1);
      editor.executeEdits("", [
        { range: range, text: "\n" + selectedText, forceMoveMarkers: true },
      ]);
    } else {
      const range = new monaco.Range(newLineNumber, 1, newLineNumber, 1);
      editor.executeEdits("", [
        { range: range, text: selectedText + "\n", forceMoveMarkers: true },
      ]);
    }

    // Adjust selection to the new duplicated lines
    const lineCount = endLineNumber - startLineNumber + 1;
    const newStartLineNumber = isUp
      ? startLineNumber
      : startLineNumber + lineCount;
    const newEndLineNumber = isUp ? endLineNumber : endLineNumber + lineCount;
    editor.setSelection(
      new monaco.Selection(
        newStartLineNumber,
        selection.startColumn,
        newEndLineNumber,
        selection.endColumn
      )
    );
  }
}

function moveLines(editor, direction) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  const lastLineNumber = model.getLineCount();

  if (selection.isEmpty()) {
    // No selection, move the current line
    const position = editor.getPosition();
    const lineNumber = position.lineNumber;
    const column = position.column;

    if (
      (direction === "up" && lineNumber <= 1) ||
      (direction === "down" && lineNumber >= lastLineNumber)
    ) {
      return;
    }

    const targetLineNumber =
      direction === "up" ? lineNumber - 1 : lineNumber + 1;
    let lineContent = model.getLineContent(lineNumber) + model.getEOL();
    let targetLineContent =
      model.getLineContent(targetLineNumber) + model.getEOL();

    if (direction === "down" && targetLineNumber === lastLineNumber) {
      lineContent = model.getEOL() + lineContent.trimRight();
    }

    const targetLineWithEOL =
      targetLineNumber < lastLineNumber && lineNumber !== lastLineNumber
        ? targetLineContent
        : targetLineContent.trimRight();

    // Swap lines
    editor.executeEdits("", [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber + 1, 1),
        text: targetLineWithEOL,
        forceMoveMarkers: true,
      },
      {
        range: new monaco.Range(targetLineNumber, 1, targetLineNumber + 1, 1),
        text: lineContent,
        forceMoveMarkers: true,
      },
    ]);

    // Move cursor to the new position
    editor.setPosition({ lineNumber: targetLineNumber, column: column });
  } else {
    // Selection exists, move selected lines
    const startLineNumber = selection.startLineNumber;
    const endLineNumber = selection.endLineNumber;

    if (
      (direction === "up" && startLineNumber <= 1) ||
      (direction === "down" && endLineNumber >= lastLineNumber)
    ) {
      return;
    }

    const targetLineNumber =
      direction === "up" ? startLineNumber - 1 : endLineNumber + 1;

    const selectedText = model.getValueInRange(
      new monaco.Range(
        startLineNumber,
        1,
        endLineNumber,
        model.getLineMaxColumn(endLineNumber)
      )
    );
    const targetText = model.getValueInRange(
      new monaco.Range(
        targetLineNumber,
        1,
        targetLineNumber,
        model.getLineMaxColumn(targetLineNumber)
      )
    );

    const newSelectedText =
      direction === "down" && targetLineNumber === lastLineNumber
        ? selectedText
        : selectedText + model.getEOL();
    const newTargetText =
      endLineNumber === lastLineNumber && targetLineNumber < lastLineNumber
        ? targetText
        : targetText + model.getEOL();

    // Ensure no overlapping ranges by applying edits in reverse order
    if (direction === "up") {
      editor.executeEdits("", [
        {
          range: new monaco.Range(targetLineNumber, 1, targetLineNumber + 1, 1),
          text: newSelectedText,
          forceMoveMarkers: true,
        },
        {
          range: new monaco.Range(startLineNumber, 1, endLineNumber + 1, 1),
          text: newTargetText,
          forceMoveMarkers: true,
        },
      ]);
    } else {
      editor.executeEdits("", [
        {
          range: new monaco.Range(startLineNumber, 1, endLineNumber + 1, 1),
          text: newTargetText,
          forceMoveMarkers: true,
        },
        {
          range: new monaco.Range(targetLineNumber, 1, targetLineNumber + 1, 1),
          text: newSelectedText,
          forceMoveMarkers: true,
        },
      ]);
    }

    const newStartLineNumber =
      direction === "up" ? startLineNumber - 1 : startLineNumber + 1;
    const newEndLineNumber =
      direction === "up" ? endLineNumber - 1 : endLineNumber + 1;
    editor.setSelection(
      new monaco.Selection(
        newStartLineNumber,
        selection.startColumn,
        newEndLineNumber,
        selection.endColumn
      )
    );
  }
}

//==============================================================================
export const CompletionItemKind = monaco.languages.CompletionItemKind;
export const IndentAction = monaco.languages.IndentAction;

export function setWorkerUrl(url) {
  workerUrl = new URL(url, import.meta.url);
}

export function createRange(
  startLineNumber,
  startColumn,
  endLineNumber,
  endColumn
) {
  return new monaco.Range(
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn
  );
}

export function getMonacoKeyBindingConstant() {
  return {
    keyMod: monaco.KeyMod,
    keyCode: monaco.KeyCode,
  };
}

export function registerCustomLanguage(langOpts) {
  const { id, languageDef, completionItemProvider } = langOpts;

  if (!id) {
    throw new Error("custom language 'id' is required.");
  }

  monaco.languages.register({ id });

  if (languageDef) {
    monaco.languages.setMonarchTokensProvider(id, languageDef);

    monaco.languages.setLanguageConfiguration(id, {
      brackets: languageDef.brackets || [],
      autoClosingPairs: languageDef.autoClosingPairs || [],
      surroundingPairs: languageDef.surroundingPairs || [],
      onEnterRules: languageDef.onEnterRules || [],
    });
  }

  if (completionItemProvider) {
    monaco.languages.registerCompletionItemProvider(id, completionItemProvider);
  }
}

let markerStore = {};

function decodeHtmlEntities(text) {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x2F;": "/",
    "&#x5C;": "\\",
    "&#x60;": "`",
  };
  return text.replace(
    /&[a-zA-Z0-9#]+;/g,
    (entity) => entities[entity] || entity
  );
}

function escapeRegExp(string) {
  const decodedString = decodeHtmlEntities(string);
  return decodedString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $&는 일치한 전체 문자열을 의미
}

export function getMarkerStore() {
  return markerStore;
}

export function setWarnings(editor, warnings) {
  const model = editor.getModel();
  const text = model.getValue();
  const markers = [];

  warnings.forEach((warning, index) => {
    const problemText = escapeRegExp(warning.problemText);
    const regex = new RegExp(problemText, "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = model.getPositionAt(match.index);
      const end = model.getPositionAt(match.index + match[0].length);
      const lineNumber = warning.lineNumber;
      const columnNumber = warning.columnNumber;
      const lineNumColNum =
        lineNumber && columnNumber && `${lineNumber}:${columnNumber}`;
      const markerId = lineNumColNum || `warning-${index}-${match.index}`;

      const marker = {
        startLineNumber: start.lineNumber,
        startColumn: columnNumber || start.column,
        endLineNumber: end.lineNumber,
        endColumn: columnNumber ? columnNumber + 1 : end.column,
        message: warning.message,
        severity: monaco.MarkerSeverity.Warning,
        id: markerId,
      };

      markers.push(marker);
      markerStore[markerId] = marker;
    }
  });

  monaco.editor.setModelMarkers(model, "owner", markers);

  return markerStore;
}

export function clearWarnings(editor) {
  const model = editor.getModel();
  monaco.editor.setModelMarkers(model, "owner", []);
  markerStore = {}; // Clear the marker store
}

export function clearSpecificWarning(editor, markerId) {
  const model = editor.getModel();
  const markers = monaco.editor.getModelMarkers({ owner: "owner" });

  const updatedMarkers = markers.filter((marker) => marker.id !== markerId);
  monaco.editor.setModelMarkers(model, "owner", updatedMarkers);

  delete markerStore[markerId];
}
