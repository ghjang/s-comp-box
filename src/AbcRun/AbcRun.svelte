<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
  import AbcRenderer from "../AbcRenderer/AbcRenderer.svelte";
  import DataStore from "../DataStore/DataStore.svelte";
  import langdef from "./abc.lang.def.js";
  import completionItemProvider from "./abc.completion.js";
  import EditAreaAdaptor from "./abc.monaco.adaptor.js";
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
  export let noRenderer = false;
  export let showPlayControl = false;
  export let enableMidiFileDownload = false;
  export let enablePdfFileDownload = false;

  export const getDataStore = () => dataStore;

  export const update = async (focus = false) => {
    if (editor) {
      await tick();
      editor.layout(true);
      if (focus) {
        editor.focus();
      }
    }
  };

  let lastEditorHeight = 0;

  let abcParams = {};

  let editor: MonacoEditor;
  let editAreaAdaptor: EditAreaAdaptor;
  let dataStore: DataStore;

  $: if (editor) {
    const languageId = "abc";
    editor.registerCustomLanguage({
      id: languageId,
      languageDef: langdef,
      completionItemProvider,
    });
  }

  // NOTE: 'MonacoEditor' 자식 컴포넌트 내부에서 '모나코 에디터'가 'init'되는 시점이
  //       현재 구현에서 'AbcRun' 컴포넌트의 'onMount' 이벤트 핸들러가 호출되는 시점보다
  //       나중이다. 실제 모나코 에디터 내부 인스턴스가 생성되는 'editorInit' 시점에 텍스트를
  //       로딩하도록 함.
  function handleEditorInit() {
    if (abcText) {
      editor.setText(abcText);
      editAreaAdaptor = new EditAreaAdaptor(editor);
      abcParams = { abcText, editAreaAdaptor };
      dataStore?.set(abcParams);
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
  function handlePanelSizeChange(e: CustomEvent) {
    const heightDiff = e.detail.panel_1.height - lastEditorHeight;
    const roundedHeightDiff = roundToNDecimals(Math.abs(heightDiff), 2);

    // NOTE: '상태바'를 표시할 경우에 과도하게 'update(layout)'이 호출되는 것을 줄이기 위한 workaround이다.
    //       '1.2'라는 수치는 테스트를 통해서 구한 적당한 값이다.
    if (roundedHeightDiff > 1.2) {
      lastEditorHeight = e.detail.panel_1.height;
      editor?.update();
    }

    function roundToNDecimals(num: number, n: number) {
      const factor = Math.pow(10, n);
      return Math.round(num * factor) / factor;
    }
  }

  function handleContentChange(event: any) {
    abcText = event.detail.value;
    abcParams = { abcText };
    dataStore?.set({ ...abcParams, editAreaAdaptor });
    if (autoSave) {
      saveToLocalStorage(abcText);
    }
  }

  function handleCursorPositionChange(event: any) {
    abcParams = { position: event.detail.position };
    dataStore?.set({ ...abcParams, editAreaAdaptor });
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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="abcrun-box" on:contextmenu|preventDefault|stopPropagation>
  {#if noRenderer}
    <MonacoEditor
      bind:this={editor}
      resourcePath={editorResourcePath}
      language="abc"
      minimap={editorMiniMap}
      hover={true}
      matchBrackets="near"
      bracketPairColorization={true}
      autoFindMatches={true}
      showStatusBar={true}
      on:editorInit={handleEditorInit}
      on:contentChange={handleContentChange}
      on:cursorPositionChange={handleCursorPositionChange}
    />
    <DataStore
      bind:this={dataStore}
      dataProps={{ sourceComponentName: "AbcRun" }}
    />
  {:else}
    <Splitter
      orientation="vertical"
      on:panelSizeChanged={handlePanelSizeChange}
    >
      <AbcRenderer
        slot="top"
        {abcParams}
        {showPlayControl}
        {enableMidiFileDownload}
        {enablePdfFileDownload}
      ></AbcRenderer>
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
        showStatusBar={true}
        on:editorInit={handleEditorInit}
        on:contentChange={handleContentChange}
        on:cursorPositionChange={handleCursorPositionChange}
      />
    </Splitter>
  {/if}
</div>

<style lang="scss">
  .abcrun-box {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
