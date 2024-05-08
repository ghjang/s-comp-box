<script>
  import { createEventDispatcher } from "svelte";
  import { resizeObserver } from "./resizeObserver.js";
  import { dragGrip } from "./dragGrip.js";

  const dispatch = createEventDispatcher();

  export let content_panel_0_length = "50%";

  let panel_0;
  let panel_1;
  let splitterPanelLength = "2px";

  function onPanelSizeChanged(panelSizeInfo) {
    dispatch("panelSizeChanged", panelSizeInfo);
  }
</script>

<div id="svelte-splitter-container">
  <div
    id="content-panel-0"
    class="content-panel"
    bind:this={panel_0}
    style:width={content_panel_0_length}
    use:resizeObserver={{ panel_1, onPanelSizeChanged }}
  >
    <slot name="left"></slot>
  </div>
  <div id="splitter-panel" style:width={splitterPanelLength}>
    <div
      class="splitter-grip"
      use:dragGrip={{ direction: "horizontal", panel: panel_0 }}
    ></div>
    <div id="splitter-content"></div>
    <div
      class="splitter-grip"
      use:dragGrip={{ direction: "horizontal", panel: panel_0 }}
    ></div>
  </div>
  <div id="content-panel-1" class="content-panel" bind:this={panel_1}>
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

    #content-panel-1 {
      flex-grow: 1;
    }
  }
</style>
