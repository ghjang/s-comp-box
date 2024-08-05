<script>
  import { onMount, onDestroy } from "svelte";
  import abcjs from "../../vendor/abcjs/dist/abcjs.bundle.js";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
  import langdef from "./abc.lang.def.js";
  import completionItemProvider from "./abc.completion.js";
  import { downloadMidiFile, downloadPdfFile } from "./abc.download.js";
  import EditAreaAdaptor from "./abc.editarea.adaptor.js";
  import {
    createLocalStorageDebouncedSaver,
    loadFromLocalStorage,
  } from "./storage.js";

  const localStorageKey = "abcText";
  const saveToLocalStorage = createLocalStorageDebouncedSaver(localStorageKey);

  export let editorResourcePath;
  export let editorMiniMap = false;
  export let abcText = "";
  export let autoSave = false;
  export let showPlayControl = false;
  export let enableMidiFileDownload = false;
  export let enablePdfFileDownload = false;

  let editAreaAdaptor = null;
  let abcjsEditor = null;
  let timerId = null;

  // FIXME: '오류 메시지 문자열 패턴' 분석 방식을 제거하고 '파서 API'로 가능하면 대체할 것.
  //
  // 아래 'regex 문자열' 패턴은 오류 메시지를 확인해 가면서 직접 작성한 것이다.
  // 추후 오류 메시지 포맷이 변경되면 이 부분은 제대로 동작하지 않을 것이다.
  //
  // 'abcjs'에서 파서 API를 제공한다면 오류 문자열이 아닌 'abc 텍스트'를 분석해서 오류를 가능할 것이다.
  //  다만 이경우 성능상에 문제가 있을지도 모르겠다.
  //
  // 아니면, renderAbc후에 '경고 문자열'이 아닌 오류 정보를 나타내는 객체가 어딘가에 있다면
  // 그것을 활용할 수도 있을 것이다.
  function extractWarnings(warnings, unique = false) {
    const warningMap = new Map();
    const allWarnings = [];

    warnings.forEach((warning) => {
      const regex = /Music Line:(\d+):(\d+): ([^:]+):( ([^:]+):)? (.+)/;
      const match = warning.match(regex);

      if (!match) {
        console.warn("not supported warning format: ", warning);
        return;
      }

      const lineNumber = parseInt(match[1]);
      const columnNumber = parseInt(match[2]);
      const message = match[3].trim();
      const problemText = match[6]
        .replace(/<[^>]+>/g, "")
        .replace(/SPACE/g, " ")
        .trim();

      if (!message || !problemText) {
        console.warn("not supported warning format: ", warning);
        return;
      }

      if (unique) {
        // 유니크한 경고만 저장
        if (!warningMap.has(problemText)) {
          warningMap.set(problemText, {
            lineNumber,
            columnNumber,
            message,
            problemText,
          });
        }
      } else {
        // 모든 경고를 배열에 추가
        allWarnings.push({
          lineNumber,
          columnNumber,
          message,
          problemText,
        });
      }
    });

    return unique ? Array.from(warningMap.values()) : allWarnings;
  }

  function renderAbc() {
    const noteStaffId = crypto.randomUUID();
    noteStaff.id = noteStaffId;

    if (!abcjsEditor) {
      abcjsEditor = new abcjs.Editor(editAreaAdaptor, {
        canvas_id: noteStaffId,
        add_classes: true,
      });
    }

    abcjsEditor.fireChanged();
    editor.clearEditorWarnings();
    needToInitSynth = true;

    // NOTE: 'abcjs'의 'abc_editor.js'의 'fireChanged' 메소드에서 가정하고 있는
    //       처리시간이 '300ms'이다. 이 시간을 고려해서 경고 메시지를 좀더 늦게 확인하도록 함.
    const timeOutVal = 350;

    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      const abcjsWarnings = abcjsEditor.warnings;
      if (abcjsWarnings) {
        console.log("before extractWarnings", abcjsWarnings);
        const warnings = extractWarnings(abcjsWarnings);
        console.log("after extractWarnings", warnings);
        editor.setEditorWarnings(warnings);
      } else {
        //console.log("abcjs: no warnings");
      }
    }, timeOutVal);
  }

  const synth = new abcjs.synth.CreateSynth();
  let needToInitSynth = true;
  let isPlaying = false;

  let noteStaff;
  let editor;

  $: if (editor) {
    const languageId = "abc";
    editor.registerCustomLanguage({
      id: languageId,
      languageDef: langdef,
      completionItemProvider,
    });
    editAreaAdaptor = new EditAreaAdaptor(editor);
    renderAbc();
  }

  // NOTE: 'MonacoEditor' 자식 컴포넌트 내부에서 '모나코 에디터'가 'init'되는 시점이
  //       현재 구현에서 'AbcRun' 컴포넌트의 'onMount' 이벤트 핸들러가 호출되는 시점보다
  //       나중이다. 실제 모나코 에디터 내부 인스턴스가 생성되는 'editorInit' 시점에 텍스트를
  //       로딩하도록 함.
  function handleEditorInit() {
    if (abcText) {
      editor?.setText(abcText);
    }
  }

  // FIXME: 'AbcRun' 컴포넌트의 '스플릿터 그립'을 드래그해서 '패널'의 크기 조정시 배경색이 제대로 표시되지 않음.
  //
  // '스플릿터 그립'을 드래그해서 스플릿터 패널의 크기를 조정시에 빠르게 아래 '모나코 에디터 레이아웃' 조정 메쏘드가
  // 호출되지 않는다. 결과적으로 패널의 크기를 기존보다 크게 조정하는 경우에 '모나코 에디터' 영역의 크기가 재조정되기
  // 전의 짧은 시간 동안 에디터를 포함하고 있는 패널의 배경색이 보여 그닥 보기 좋지 않다.
  //
  // 'panelSizeChange' 이벤트 처리 방식 자체를 바꾸는 것을 고려해보거나,
  // 'Splitter' 컴포넌트 쪽에서 설정되는 '패널 자식 컴포넌트'의 가장 가까운 요소의 '배경색'을 런타임에 조사해서
  //  패널 리싸이징시에 최대한 덜 이상하게 보이도록 하는 방법을 취할 수 있을 것 같다(?).
  function handlePanelSizeChange() {
    editor?.update();
  }

  function handleContentChange(event) {
    abcText = event.detail.value;
    renderAbc();
    if (autoSave) {
      saveToLocalStorage(abcText);
    }
  }

  function handleCursorPositionChange() {
    abcjsEditor?.fireSelectionChanged();
  }

  async function handlePlayButtonClick() {
    if (synth.isRunning) {
      synth.stop();
      return;
    }

    if (needToInitSynth) {
      await synth.init({ visualObj: abcjsEditor.tunes[0] });
      await synth.prime();
      synth.onEnded = () => {
        // NOTE: 'onEnded'가 호출된 후에도 여전히 'synth.isRunning'이 'true'일 수 있음.
        synth.stop();

        isPlaying = false;
      };
      needToInitSynth = false;
    }

    synth.start();
    isPlaying = true;
  }

  onMount(() => {
    if (!abcText) {
      const savedAbcText = loadFromLocalStorage("abcText");
      if (savedAbcText) {
        abcText = savedAbcText;
      }
    }
  });

  onDestroy(() => {
    if (autoSave) {
      saveToLocalStorage(abcText);
    }
  });
</script>

<div class="abcrun-box">
  <Splitter orientation="vertical" on:panelSizeChanged={handlePanelSizeChange}>
    <div class="note-box" slot="top">
      <div class="note-item-group">
        <div bind:this={noteStaff} class="note-staff"></div>
        <div class="control-box">
          {#if abcText && !isPlaying && enableMidiFileDownload}
            <button use:downloadMidiFile={{ abcjs, abcjsEditor }}
              >Download MIDI</button
            >
          {/if}
          {#if abcText && !isPlaying && enablePdfFileDownload}
            <button use:downloadPdfFile={{ abcjs, abcjsEditor }}
              >Download PDF</button
            >
          {/if}
          {#if abcText && showPlayControl}
            <button on:click={handlePlayButtonClick}
              >{isPlaying ? "Stop" : "Play"}</button
            >
          {/if}
        </div>
      </div>
    </div>
    <MonacoEditor
      bind:this={editor}
      slot="bottom"
      resourcePath={editorResourcePath}
      language="abc"
      minimap={editorMiniMap}
      hover={true}
      matchBrackets="near"
      bracketPairColorization={true}
      autoFindMatches={true}
      on:editorInit={handleEditorInit}
      on:contentChange={handleContentChange}
      on:cursorPositionChange={handleCursorPositionChange}
    />
  </Splitter>
</div>

<style lang="scss">
  .abcrun-box {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;

    .note-box {
      display: flex;
      flex-direction: row;
      justify-content: center;
      width: 100%;
      height: 100%;
      border: none;

      .note-item-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: min-content;
        height: 100%;
        border: none;

        .note-staff {
          width: min-content;
          height: 100%;
          overflow: scroll !important;
          background-color: lightgray;
        }

        .control-box {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          width: 100%;
          margin-top: 0.5em;

          button {
            margin-right: 0.25em;
          }

          button:last-child {
            margin-right: 1.25em;
          }
        }
      }
    }
  }
</style>
