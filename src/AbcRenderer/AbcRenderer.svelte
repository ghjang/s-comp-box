<script lang="ts">
  import { DataProps, DataSink } from "../common/data/DataStore";
  import abcjs from "../../vendor/abcjs/dist/abcjs.bundle.js";
  import { downloadMidiFile, downloadPdfFile } from "./abc.download.js";
  import StringAdaptor from "./abc.string.adaptor.js";

  interface AbcParams {
    noTextEditor?: boolean;
    abcText?: string;
    editAreaAdaptor?: any;
    position?: any;
  }

  export let abcParams: AbcParams = {};
  export let showPlayControl = false;
  export let enableMidiFileDownload = false;
  export let enablePdfFileDownload = false;

  export function getDataSink(): DataSink {
    interface Data {
      detail?: {
        abcText?: string;
        position?: any;
        editAreaAdaptor?: any;
      };
      [key: string]: any;
    }

    return new (class extends DataSink {
      isCompatible(props: DataProps): boolean {
        return props.sourceComponentName === "AbcRun";
      }

      update(data: Data) {
        const { detail } = data;
        if (Object.keys(data).length === 0) {
          // 완전히 '빈 객체'는 무시
        } else if (detail) {
          abcParams = { ...detail };
        } else {
          console.warn("invalid abc data: ", data);
        }
      }
    })();
  }

  let editAreaAdaptor: any = null;
  let abcjsEditor: any = null;
  let timerId: number | undefined;

  let noteStaff: HTMLDivElement | undefined;
  $: if (noteStaff) {
    noteStaff.id = crypto.randomUUID();
    if (editAreaAdaptor && editAreaAdaptor.isStringAdaptor) {
      renderAbc();
    }
  }

  $: updateAbcParams(abcParams);

  function updateAbcParams(params: AbcParams): void {
    if (params.noTextEditor) {
      editAreaAdaptor = new StringAdaptor(params.abcText);
    } else if (params.editAreaAdaptor) {
      editAreaAdaptor = params.editAreaAdaptor;
    }

    if (params.abcText) {
      if (editAreaAdaptor?.isStringAdaptor) {
        editAreaAdaptor.setString(params.abcText);
      }
      renderAbc();
    }

    if (params.position) {
      abcjsEditor?.fireSelectionChanged();
    }
  }

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
  function extractWarnings(warnings: string[], unique = false) {
    const warningMap = new Map();
    const allWarnings: any[] = [];

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
    if (!editAreaAdaptor) {
      return;
    }

    if (editAreaAdaptor.isStringAdaptor && !noteStaff) {
      return;
    }

    if (!abcjsEditor) {
      if (!noteStaff) {
        return;
      }
      abcjsEditor = new abcjs.Editor(editAreaAdaptor, {
        canvas_id: noteStaff.id,
        add_classes: true,
      });
    }

    abcjsEditor.fireChanged();
    editAreaAdaptor.clearEditorWarnings();
    needToInitSynth = true;

    // NOTE: 'abcjs'의 'abc_editor.js'의 'fireChanged' 메소드에서 가정하고 있는
    //       처리시간이 '300ms'이다. 이 시간을 고려해서 경고 메시지를 좀더 늦게 확인하도록 함.
    const timeOutVal = 350;

    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = window.setTimeout(() => {
      const abcjsWarnings = abcjsEditor.warnings;
      if (abcjsWarnings) {
        console.log("before extractWarnings", abcjsWarnings);
        const warnings = extractWarnings(abcjsWarnings);
        console.log("after extractWarnings", warnings);
        editAreaAdaptor.setEditorWarnings(warnings);
      } else {
        //console.log("abcjs: no warnings");
      }
    }, timeOutVal);
  }

  const synth = new abcjs.synth.CreateSynth();
  let needToInitSynth = true;
  let isPlaying = false;

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
</script>

<div class="note-box">
  <div class="note-item-group">
    <div bind:this={noteStaff} class="note-staff"></div>
    <div class="control-box">
      {#if abcParams.abcText && !isPlaying && enableMidiFileDownload}
        <button use:downloadMidiFile={{ abcjs, abcjsEditor }}
          >Download MIDI</button
        >
      {/if}
      {#if abcParams.abcText && !isPlaying && enablePdfFileDownload}
        <button use:downloadPdfFile={{ abcjs, abcjsEditor }}
          >Download PDF</button
        >
      {/if}
      {#if abcParams.abcText && showPlayControl}
        <button on:click={handlePlayButtonClick}
          >{isPlaying ? "Stop" : "Play"}</button
        >
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
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
      width: 100%;
      height: 100%;
      padding-left: 2em;
      padding-right: 2em;
      border: none;

      .note-staff {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
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
</style>
