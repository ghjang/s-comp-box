<script>
  import debounce from "lodash-es/debounce";
  import { createEventDispatcher } from "svelte";
  import { resizeObserver } from "./resizeObserver.js";
  import { dragGrip } from "./dragGrip.js";

  const dispatch = createEventDispatcher();

  export let showPanelControl = false;
  export let content_panel_0_length = "50%";

  let panel_0;
  let panel_1;
  let leftPanelCollapsed = false; // '<' 버튼을 눌러서 '왼쪽 패널'이 접혀있는지 여부
  let rightPanelCollapsed = false; // '>' 버튼을 눌러서 '오른쪽 패널'이 접혀있는지 여부
  let ltrPanelCollapseButtonClicked = false; // '>' 버튼이 눌렸었는지 여부
  let resetLtrPanelCollapseButtonClicked = null;
  let splitterPanelLength = "auto";

  $: if (showPanelControl) {
    resetLtrPanelCollapseButtonClicked = debounce(
      () => (ltrPanelCollapseButtonClicked = false),
      300
    );
    splitterPanelLength = "auto";
  } else {
    resetLtrPanelCollapseButtonClicked = null;
    splitterPanelLength = "2px";
  }

  function onPanelSizeChanged(sizeInfo) {
    content_panel_0_length = `${sizeInfo.panel_0.width}px`;
    dispatch("panelSizeChanged", sizeInfo);

    if (!showPanelControl) {
      return;
    }

    leftPanelCollapsed = sizeInfo.panel_0.width === 0;

    if (ltrPanelCollapseButtonClicked) {
      // NOTE: '왼쪽 패널'이 접혀있는 상태에서 '>' 버튼을 눌러서 '오른쪽 패널'을 접는 경우에
      //       현재의 'flex box'를 이용한 레이아웃 구현에서 'onPanelSizeChanged' 이벤트가
      //       여러번 트리거 될 수 있다. 여러번 호출될 경우에 'rightPanelCollapsed = false;'가
      //       레이아웃이되는 중도에 설정되는 것으로 보이며, 결과적으로 오른쪽 패널이 완전히 접히지 앟을 수도 있다.
      //       일단 'lodash-es' 라이브러리의 'debounce' 함수를 사용해서 보완하였다.
      resetLtrPanelCollapseButtonClicked();
    } else if (
      (panel_1.style.display === "none" || panel_1.style.display === "") &&
      sizeInfo.panel_1.width === 0
    ) {
      // NOTE:
      // - 'ltrPanelCollapseButtonClicked' 플래그를 이용해서 '>' 버튼 클릭 직후에 이 코드 블럭이
      //   실행되지 않도록 막는다.
      // - '오른쪽 패널'이 화면에 안보이고 있는 상태가 '오른쪽 패널이 접힌 상태'이다.
      // - '오른쪽 패널'이 접힌 상태에서 'divider-grip-content' 요소를 드래깅해서 '오른쪽 패널'을
      //   다시 보이게 하는 경우에 'onPanelSizeChanged' 이벤트가 여러번 트리거되는데, 첫번째 이벤트에서
      //   sizeInfo.panel_1.width 값이 0으로 시작한다.
      //
      // 위의 조건으로 '오른쪽 패널'이 '접히지 않은 상태'라는 것으로 취급한다.
      rightPanelCollapsed = false; // 'rightPanelCollapsed' 클래스 제거
    } else {
      // do nothing
    }
  }

  // NOTE: 패널의 크기값 설정시 'onPanelSizeChanged' 이벤트가 자동으로 트리거 된다.
  function handlePanelCollapseButtonClick(direction = "rtl") {
    if (direction === "rtl") {
      panel_0.style.width = "0%";
    } else if (direction === "ltr") {
      rightPanelCollapsed = true; // 'rightPanelCollapsed' 클래스 추가
      ltrPanelCollapseButtonClicked = true;
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
    class:ltrPanelCollapseButtonClicked
    style:width={content_panel_0_length}
    use:resizeObserver={{ panel_1, onPanelSizeChanged }}
  >
    <slot name="left"></slot>
  </div>
  <div class="divider-panel" style:width={splitterPanelLength}>
    {#if showPanelControl}
      <div
        class="divider-grip-content panel-collapse"
        use:dragGrip={{ direction: "horizontal", panel_0, panel_1 }}
      >
        {#if !rightPanelCollapsed}
          <button
            on:click={() => handlePanelCollapseButtonClick("ltr")}
            on:mousedown|stopPropagation>▶</button
          >
        {/if}
        {#if !leftPanelCollapsed}
          <button
            on:click={() => handlePanelCollapseButtonClick("rtl")}
            on:mousedown|stopPropagation>◀</button
          >
        {/if}
      </div>
    {:else}
      <div
        class="divider-grip"
        use:dragGrip={{ direction: "horizontal", panel_0, panel_1 }}
      ></div>
    {/if}
  </div>
  <div
    bind:this={panel_1}
    class="content-panel content-panel-1"
    class:rightPanelCollapsed
  >
    <slot name="right"></slot>
  </div>
</div>

<style lang="scss">
  @import "./splitter.scss";

  .splitter-container {
    flex-direction: row;

    .content-panel-0 {
      &.ltrPanelCollapseButtonClicked {
        flex-grow: 1;
      }
    }

    .divider-panel {
      flex-direction: row;

      .divider-grip {
        width: 1px;
        cursor: ew-resize;
      }

      .divider-grip-content {
        &.panel-collapse {
          flex-direction: column;
          min-width: 1px;
          cursor: ew-resize;
        }
      }
    }

    .content-panel-1 {
      flex-grow: 1;

      &.rightPanelCollapsed {
        display: none;
      }
    }
  }
</style>
