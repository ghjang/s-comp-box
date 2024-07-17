<script>
  import debounce from "lodash-es/debounce";
  import { createEventDispatcher } from "svelte";
  import { resizeObserver } from "./resizeObserver.js";
  import { dragGrip } from "./dragGrip.js";

  const dispatch = createEventDispatcher();

  export let showPanelControl = false;
  export let panel_0_length = "50%";

  let panel_0;
  let panel_1;
  let topPanelCollapsed = false;
  let bottomPanelCollapsed = false;
  let ttbPanelCollapseButtonClicked = false;
  let resetTtbPanelCollapseButtonClicked = null;
  let splitterPanelLength = "auto";

  $: if (showPanelControl) {
    resetTtbPanelCollapseButtonClicked = debounce(
      () => (ttbPanelCollapseButtonClicked = false),
      300
    );
    splitterPanelLength = "auto";
  } else {
    resetTtbPanelCollapseButtonClicked = null;
    splitterPanelLength = "2px";
  }

  function onPanelSizeChanged(panelSizeInfo) {
    panel_0_length = `${panelSizeInfo.panel_0.height}px`;
    dispatch("panelSizeChanged", panelSizeInfo);

    if (!showPanelControl) {
      return;
    }

    topPanelCollapsed = panelSizeInfo.panel_0.height === 0;

    if (ttbPanelCollapseButtonClicked) {
      resetTtbPanelCollapseButtonClicked();
    } else if (
      (panel_1.style.display === "none" || panel_1.style.display === "") &&
      panelSizeInfo.panel_1.height === 0
    ) {
      bottomPanelCollapsed = false; // 'bottomPanelCollapsed' 클래스 제거
    } else {
      // do nothing
    }
  }

  function handlePanelCollapseButtonClick(direction = "ttb") {
    if (direction === "ttb") {
      bottomPanelCollapsed = true; // 'bottomPanelCollapsed' 클래스 추가
      ttbPanelCollapseButtonClicked = true;
    } else if (direction === "btt") {
      panel_0.style.height = "0%";
    } else {
      // do nothing
    }
  }

  // NOTE: 'slot' 요소의 'name, slot' 속성은 동적으로 설정이 불가능하다.
</script>

<div class="splitter-container">
  <div
    bind:this={panel_0}
    class="content-panel content-panel-0"
    class:ttbPanelCollapseButtonClicked
    style:height={panel_0_length}
    use:resizeObserver={{ panel_1, onPanelSizeChanged, observePanel1: true }}
  >
    <slot name="top"></slot>
  </div>
  <div class="divider-panel" style:height={splitterPanelLength}>
    {#if showPanelControl}
      <div
        class="divider-grip-content panel-collapse"
        use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
      >
        {#if !bottomPanelCollapsed}
          <button
            on:click={() => handlePanelCollapseButtonClick("ttb")}
            on:mousedown|stopPropagation>▼</button
          >
        {/if}
        {#if !topPanelCollapsed}
          <button
            on:click={() => handlePanelCollapseButtonClick("btt")}
            on:mousedown|stopPropagation>▲</button
          >
        {/if}
      </div>
    {:else}
      <div
        class="divider-grip"
        use:dragGrip={{ direction: "vertical", panel_0, panel_1 }}
      ></div>
    {/if}
  </div>
  <div
    bind:this={panel_1}
    class="content-panel content-panel-1"
    class:bottomPanelCollapsed
  >
    <slot name="bottom"></slot>
  </div>
</div>

<style lang="scss">
  @import "./splitter.scss";

  .splitter-container {
    flex-direction: column;

    .content-panel-0 {
      &.ttbPanelCollapseButtonClicked {
        flex-grow: 1;
      }
    }

    .divider-panel {
      flex-direction: column;

      .divider-grip {
        height: 1px;
        cursor: ns-resize;
      }

      .divider-grip-content {
        &.panel-collapse {
          flex-direction: row;
          min-height: 1px;
          cursor: ns-resize;
        }
      }
    }

    .content-panel-1 {
      flex-grow: 1;

      &.bottomPanelCollapsed {
        display: none;
      }
    }
  }
</style>
