<script>
  import { draggable } from "./draggable.js";

  let panel_0;
  let splitterPanelLength = "2px";
</script>

<div id="svelte-splitter-container">
  <div id="content-panel-0" class="content-panel" bind:this={panel_0}>
    <slot name="top"></slot>
  </div>
  <div id="splitter-panel" style:height={splitterPanelLength}>
    <div
      class="splitter-grip"
      use:draggable={{ direction: "vertical", panel: panel_0 }}
    ></div>
    <div id="splitter-content"></div>
    <div
      class="splitter-grip"
      use:draggable={{ direction: "vertical", panel: panel_0 }}
    ></div>
  </div>
  <div id="content-panel-1" class="content-panel">
    <slot name="bottom"></slot>
  </div>
</div>

<style lang="scss">
  @import "./splitter.scss";

  #svelte-splitter-container {
    flex-direction: column;

    #splitter-panel {
      flex-direction: column;
    }

    .splitter-grip {
      height: 1px;
      cursor: ns-resize;
    }

    #content-panel-0 {
      height: 50%;
    }

    #content-panel-1 {
      flex-grow: 1;
    }
  }
</style>
