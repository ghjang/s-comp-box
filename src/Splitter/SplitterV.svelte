<script>
  import { createEventDispatcher } from "svelte";
  import { resizeObserver } from "./resizeObserver.js";
  import { dragGrip } from "./dragGrip.js";

  const dispatch = createEventDispatcher();

  export let panelCollapseButton = "";
  export let content_panel_0_length = "50%";

  let panel_0;
  let panel_1;
  let splitterPanelLength = "auto";

  $: if (panelCollapseButton === "btt" || panelCollapseButton === "ttb") {
    splitterPanelLength = "auto";
  } else {
    splitterPanelLength = "2px";
  }

  function onPanelSizeChanged(panelSizeInfo) {
    dispatch("panelSizeChanged", panelSizeInfo);
  }

  // NOTE: 'slot' 요소의 'name, slot' 속성은 동적으로 설정이 불가능하다.
</script>

<div id="svelte-splitter-container">
  <div
    id="content-panel-0"
    class="content-panel"
    bind:this={panel_0}
    style:height={content_panel_0_length}
    use:resizeObserver={{ panel_1, onPanelSizeChanged }}
  >
    <slot name="top"></slot>
  </div>
  <div id="splitter-panel" style:height={splitterPanelLength}>
    {#if panelCollapseButton === "btt"}
      <div
        id="splitter-grip-content"
        class="panel-collapse"
        use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
      >
        <button>▲</button>
      </div>
    {:else if panelCollapseButton === "ttb"}
      <div
        id="splitter-grip-content"
        class="panel-collapse"
        use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
      >
        <button>▼</button>
      </div>
    {:else}
      <div
        class="splitter-grip"
        use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
      ></div>
    {/if}
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

    #splitter-grip-content {
      &.panel-collapse {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        min-height: 1px;
        cursor: ns-resize;

        button {
          margin: 0;
          padding: 0;
          font-size: 0.01em;
        }
      }
    }

    #content-panel-1 {
      flex-grow: 1;
    }
  }
</style>
