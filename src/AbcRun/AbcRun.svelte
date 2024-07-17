<script>
  import abcjs from "../../vendor/abcjs/dist/abcjs.bundle.js";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
  import tokenizer from "./abc.tokenizer.js";
  import completionItemProvider from "./abc.completion.js";
  import { downloadMidiFile, downloadPdfFile } from "./abc.download.js";

  export let editorResourcePath;
  export let abcText = "";
  export let showPlayControl = false;
  export let enableMidiFileDownload = false;
  export let enablePdfFileDownload = false;

  let visualObj = null;

  function renderAbc() {
    visualObj = abcjs.renderAbc("note-staff", abcText, { add_classes: true });
    needToInitSynth = true;
  }

  const synth = new abcjs.synth.CreateSynth();
  let needToInitSynth = true;
  let isPlaying = false;

  let editor;

  $: if (editor) {
    const languageId = "abc";
    editor.registerCustomLanguage({
      id: languageId,
      tokenizer,
      completionItemProvider,
    });
    renderAbc();
  }

  function handlePanelSizeChange() {
    editor?.update();
  }

  function handleContentChange(event) {
    abcText = event.detail.value;
    renderAbc();
  }

  async function handlePlayButtonClick() {
    if (synth.isRunning) {
      synth.stop();
      return;
    }

    if (needToInitSynth) {
      await synth.init({ visualObj: visualObj[0] });
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

  // FIXME: abcjs 최신 버전(6.4.1)에서 'synth.init'에서 오류 발생
  //
  // 6.3.0 버전에서는 정상 동작함. 다음 이슈 참고할 것:
  // - https://github.com/paulrosen/abcjs/issues/1024
</script>

<div class="abcrun-box">
  <Splitter orientation="vertical" on:panelSizeChanged={handlePanelSizeChange}>
    <div slot="top">
      <div id="note-staff"></div>
      {#if showPlayControl}
        <button on:click={handlePlayButtonClick}
          >{isPlaying ? "Stop" : "Play"}</button
        >
      {/if}
      {#if !isPlaying && enableMidiFileDownload}
        <button use:downloadMidiFile={{ abcjs, visualObj }}
          >Download MIDI</button
        >
      {/if}
      {#if !isPlaying && enablePdfFileDownload}
        <button use:downloadPdfFile={{ abcjs, visualObj }}>Download PDF</button>
      {/if}
    </div>
    <MonacoEditor
      bind:this={editor}
      slot="bottom"
      resourcePath={editorResourcePath}
      language="abc"
      value={abcText}
      hover={true}
      on:contentChange={handleContentChange}
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

    #note-staff {
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: lightgray;
    }
  }
</style>
