<script lang="ts">
  import { DataProps, DataSink } from "s-comp-core/common/data";
  import abcjs from "../../vendor/abcjs/dist/abcjs.bundle.js";
  import { downloadMidiFile, downloadPdfFile } from "./abc.download.js";
  import StringAdaptor from "./abc.string.adaptor.js";

  interface AbcParams {
    noTextEditor?: boolean;
    abcText?: string | String;
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

    if (
      typeof params.abcText === "string" ||
      params.abcText instanceof String
    ) {
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

    if (abcjsEditor?.tunes?.length === 0) {
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
    <div class="note-staff-wrapper">
      <div bind:this={noteStaff} class="note-staff"></div>
    </div>
    <div class="control-box">
      <div class="button-group">
        {#if !isPlaying && enableMidiFileDownload}
          <button use:downloadMidiFile={{ abcjs, abcjsEditor }}>MIDI</button>
        {/if}
        {#if !isPlaying && enablePdfFileDownload}
          <button use:downloadPdfFile={{ abcjs, abcjsEditor }}>PDF</button>
        {/if}
        {#if showPlayControl}
          <button on:click={handlePlayButtonClick}>
            {isPlaying ? "STOP" : "PLAY"}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @use "sass:color";
  
  $control-box-bg-color: rgb(240, 240, 240);
  $control-box-opacity: 0.25;
  $control-box-hover-opacity: 1;
  $transition-duration: 0.3s;

  .note-box {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: none;
    background-color: lightgray;

    .note-item-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      padding-left: 2em;
      padding-right: 2em;
      border: none;

      .note-staff-wrapper {
        width: 100%;
        height: 0;
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        justify-content: center;

        .note-staff {
          max-width: 100%;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          padding: 0.5em 1em 1em 1em;
          border: 1px solid #d3d3d3;
          background-color: transparent;

          /* 악보 데이터가 렌더링된 경우에만 용지 디자인을 설정 */
          &:has(> *) {
            background-color: #fff;
            box-shadow:
              0 2px 4px rgba(0, 0, 0, 0.1),
              0 0 10px rgba(0, 0, 0, 0.05);
            border-radius: 2px;
            transition: box-shadow 0.3s ease;

            &:hover {
              box-shadow:
                0 4px 8px rgba(0, 0, 0, 0.15),
                0 0 15px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }

      .control-box {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        padding: 0.25em;
        opacity: $control-box-opacity;
        transition: opacity $transition-duration ease;

        &:hover {
          opacity: $control-box-hover-opacity;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          button {
            margin-bottom: 0.5em;
            width: 4em;
            border: none;
            background-color: $control-box-bg-color;
            color: #333;
            padding: 0.5em;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color $transition-duration ease;

            &:hover {
              font-weight: bold;
              outline: 1px solid color.scale($control-box-bg-color, $lightness: -20%);
              background-color: color.scale($control-box-bg-color, $lightness: -15%);
            }

            &:active {
              outline: 1px solid color.scale($control-box-bg-color, $lightness: -20%);
              background-color: color.scale($control-box-bg-color, $lightness: -15%);
            }

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
</style>
