<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { draggable } from "./draggable.js";

  const dispatch = createEventDispatcher();

  export let content_panel_0_length = "50%";

  let panel_0;
  let panel_1;
  let splitterPanelLength = "2px";

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry.target === panel_0) {
        const panelSizeInfo = {
          panel_0: panel_0.getBoundingClientRect(),
          panel_1: panel_1.getBoundingClientRect(),
        };
        dispatch("panelSizeChanged", panelSizeInfo);
      }
    });

    observer.observe(panel_0);

    return () => observer.unobserve(panel_0);
  });
</script>

<div id="svelte-splitter-container">
  <div
    id="content-panel-0"
    class="content-panel"
    bind:this={panel_0}
    style:width={content_panel_0_length}
  >
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
