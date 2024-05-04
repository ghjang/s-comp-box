<script>
  import { draggable } from "./draggable.js";

  let panel_0;
  let splitterPanelLength = "2px";
</script>

<div id="svelte-splitter-container">
  <div id="content-panel-0" class="content-panel" bind:this={panel_0}>
    <slot name="left"></slot>
  </div>
  <div id="splitter-panel" style:width={splitterPanelLength}>
    <div
      class="splitter-grip"
      use:draggable={{ direction: "horizontal", panel: panel_0 }}
    ></div>
    <div id="splitter-content"></div>
    <div
      class="splitter-grip"
      use:draggable={{ direction: "horizontal", panel: panel_0 }}
    ></div>
  </div>
  <div id="content-panel-1" class="content-panel">
    <slot name="right"></slot>
  </div>
</div>

<style lang="scss">
  @import "./splitter.scss";

  #svelte-splitter-container {
    flex-direction: row;

    #splitter-panel {
      flex-direction: row;
    }

    .splitter-grip {
      width: 1px;
      cursor: ew-resize;
    }

    #content-panel-0 {
      width: 50%;
    }

    #content-panel-1 {
      flex-grow: 1;
    }
  }
</style>
