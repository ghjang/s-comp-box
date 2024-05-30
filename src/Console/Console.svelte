<script>
  export let height = "100%";

  let consoleDiv;

  export function log(output, autoScrollDown = true) {
    if (!consoleDiv) {
      return;
    }

    consoleDiv.innerHTML += `<div>${output}</div>`;
    if (autoScrollDown) {
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
  }

  export function error(output, autoScrollDown = true) {
    if (!consoleDiv) {
      return;
    }

    consoleDiv.innerHTML += `<div style="color: red;">${output}</div>`;
    if (autoScrollDown) {
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
  }
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
