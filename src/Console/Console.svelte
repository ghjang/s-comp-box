<script>
  import { onMount } from "svelte";

  export let height = "100%";

  // TODO: 여러 유형의 '콘솔 출력' 정의
  //
  // 현재 '문자열'을 입력하는 것으로만 처리하고 있음. 다음과 같은 유형을 지원할 수 있을 것 같음:
  // - 문자열
  // - 객체
  // - 배열
  // - 유용한 특수 데이터에 대한 출력 포맷 (예: 표, 그래프, 이미지)
  
  export let initialOutput = null;

  let consoleDiv;

  export function clear() {
    if (!consoleDiv) {
      return;
    }

    consoleDiv.innerHTML = "";
  }

  export function log(output, autoScrollDown = true) {
    if (!consoleDiv) {
      return;
    }

    output = processNewLine(output);
    consoleDiv.innerHTML += `<div>${output}</div>`;
    if (autoScrollDown) {
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
  }

  export function error(output, autoScrollDown = true) {
    if (!consoleDiv) {
      return;
    }

    output = processNewLine(output);
    consoleDiv.innerHTML += `<div style="color: red;">${output}</div>`;
    if (autoScrollDown) {
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
  }

  function processNewLine(output) {
    return output.replace(/\n/g, "<br>");
  }

  onMount(() => {
    if (initialOutput) {
      log(initialOutput);
    }
  });
</script>

<div class="console-output" bind:this={consoleDiv} style:height></div>

<style>
  .console-output {
    width: 100%;
    background-color: black;
    color: lime;
    padding: 10px;
    font-family: monospace;
    white-space: pre-wrap;
    overflow: auto;
    box-sizing: border-box;
  }
</style>
