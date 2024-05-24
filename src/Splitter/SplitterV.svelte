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
    style:height={content_panel_0_length}
    use:resizeObserver={{panel_1, onPanelSizeChanged}}
  >
    <slot name="top"></slot>
  </div>
  <div id="splitter-panel" style:height={splitterPanelLength}>
    <div
      class="splitter-grip"
      use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
    ></div>
    <div id="splitter-content"></div>
    <div
      class="splitter-grip"
      use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
    ></div>
  </div>
  <div id="content-panel-1" class="content-panel" bind:this={panel_1}>
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

    #content-panel-1 {
      flex-grow: 1;
    }
  }
</style>
