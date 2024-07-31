<!--
 FIXME: 'accessors'와 같은 속성이 'customElement' 속성 앞에 배치되면 '커스터 요소' 빌드가 되지 않음.
 현재 롤업 설정에서 'svelte:options customElement' 문자열을 '.svelte'에서 찾아서 '커스텀 요소' 빌드 여부를 결정하고 있음.
 -->
<svelte:options customElement="s-splitter" accessors />

<script>
  import { createEventDispatcher } from "svelte";

  import SplitterH from "./SplitterH.svelte";
  import SplitterV from "./SplitterV.svelte";

  const dispatch = createEventDispatcher();

  export let orientation = "horizontal";
  export let showPanelControl = false;

  export let panel_0_length = "50%";

  export let component_0 = {
    component: null,
    componentClassName: null,
    props: {},
  };
  export let component_1 = {
    component: null,
    componentClassName: null,
    props: {},
  };

  export let customEvents = ["splitterOrientationChanged"];

  export const toggleOrientation = () => {
    if (orientation === "horizontal") {
      orientation = "vertical";
      if (panelSize.panelSize) {
        const sizeInfo = panelSize.panelSize;
        const prevTotalWidth = sizeInfo.panel_1.right - sizeInfo.panel_0.left;
        const prevPanel0WidthPercent =
          (sizeInfo.panel_0.width / prevTotalWidth) * 100;
        panel_0_length = `${prevPanel0WidthPercent}%`;
      }
    } else if (orientation === "vertical") {
      orientation = "horizontal";
      if (panelSize.panelSize) {
        const sizeInfo = panelSize.panelSize;
        const prevTotalHeight = sizeInfo.panel_1.bottom - sizeInfo.panel_0.top;
        const prevPanel0HeightPercent =
          (sizeInfo.panel_0.height / prevTotalHeight) * 100;
        panel_0_length = `${prevPanel0HeightPercent}%`;
      }
    }

    dispatch("splitterOrientationChanged", { orientation });
  };

  export const clearPanel = () => {
    component_0 = { component: null, componentClassName: null, props: {} };
    component_1 = { component: null, componentClassName: null, props: {} };
  };
  export const clearPanel_0 = () =>
    (component_0 = { component: null, componentClassName: null, props: {} });
  export const clearPanel_1 = () =>
    (component_1 = { component: null, componentClassName: null, props: {} });

  export const swapPanel = () => {
    const temp = component_0;
    component_0 = { ...component_1 };
    component_1 = { ...temp };
  };

  export const getPanelSize = () => panelSize;

  let panelSize = {};

  let this_component_0;
  let this_component_1;

  $: registerCustomEventHandler(this_component_0);
  $: registerCustomEventHandler(this_component_1);

  function registerCustomEventHandler(component) {
    if (!component || !component.customEvents) {
      return;
    }

    if (!Array.isArray(component.customEvents)) {
      return;
    }

    // NOTE: 'Splitter'의 자식 컴포넌트로 'Splitter'가 포함되는 경우를 처리하기 위함.
    const combinedCustomEvents = [...customEvents, ...component.customEvents];
    customEvents = [...new Set(combinedCustomEvents)];

    component.customEvents.forEach((eventName) => {
      if (eventName === "queryContainerInfo") {
        component.$on(eventName, (event) => {
          const callback = event.detail.infoCallback;
          if (typeof callback === "function") {
            if (component === this_component_0) {
              callback({
                containerName: "Splitter",
                component_0,
              });
            } else if (component === this_component_1) {
              callback({
                containerName: "Splitter",
                component_1,
              });
            }
          } else {
            console.error(`Invalid callback function for event '${eventName}'`);
          }
        });
      } else {
        component.$on(eventName, (event) => {
          const bubble = event.detail.bubble || {};
          bubble.chain = bubble.chain || [];

          bubble.chain.push(component);
          bubble.forwardingDetail = bubble.forwardingDetail || event.detail;
          bubble.detail = {
            componentName: "Splitter",
            component_0: this_component_0,
            component_1: this_component_1,
          };

          dispatch(eventName, { bubble });
        });
      }
    });
  }

  // TODO: 'panelSizeChange' 이벤트 발생 횟수 최적화
  //
  // 'panelSizeChange' 이벤트가 발생하는 경우:
  //   - '스플릿터 그립'을 드래깅해서 패널 크기를 변경할 때
  //   - '브라우저 윈도'의 크기를 변경할 때
  //   - '브라우저의 개발자 도구'를 열거나 닫을 때
  //   - ...
  //
  // 'debounce' 처리를 하고는 있으나,
  // '처리 방식 자체'에 개선 가능한 부분이 있는지 점검할 것.
  function handlePanelSizeChange(event) {
    panelSize = { panelSize: event.detail };

    if (orientation === "horizontal") {
      panel_0_length = `${event.detail.panel_0.width}px`;
    } else if (orientation === "vertical") {
      panel_0_length = `${event.detail.panel_0.height}px`;
    }
  }

  /**
   * NOTE
   * - 'slot' 태그가 부모 태그 하위에 직접 오지 않으면 스벨트 컴파일러(플러그인)이 오류를 발생시킴.
   *   부모 태그 하위에 'if'와 같은 제어 블럭이 있고 그 안에 'slot' 태그가 있으면 오류가 발생하는 것으로 보임.
   *   따라서 현재 아래와 같이 좀 번잡한 'if ~ else if ~ else' 제어문이 구성됨.
   *
   * - 'horizontal'과 'vertical' 구분에 따라서 'slot' 처리 부분을 'SplitterSlotH'와 'SplitterSlotV'로
   *   코드 분리를 시도해 보았으나 컴파일러(플러그인) 오류는 발생하지 않지만 렌더링이 제대로 되지 않음.
   *   'slot' 처리에 있어서 이런 식의 컴포넌트를 분리해서 'slot' 처리할 방법이 없는 것으로 보임.
   */
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="dummy-splitter-container"
  on:contextmenu|preventDefault|stopPropagation
>
  {#if orientation === "horizontal"}
    {#if component_0.component && component_1.component}
      <SplitterH
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
        on:panelSwapButtonClicked={swapPanel}
        on:panelOrientationButtonClicked={toggleOrientation}
      >
        <svelte:component
          this={component_0.component}
          bind:this={this_component_0}
          {...component_0.props}
          slot="left"
        />
        <svelte:component
          this={component_1.component}
          bind:this={this_component_1}
          {...component_1.props}
          slot="right"
        />
      </SplitterH>
    {:else if component_0.component}
      <SplitterH
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
        on:panelSwapButtonClicked={swapPanel}
        on:panelOrientationButtonClicked={toggleOrientation}
      >
        <svelte:component
          this={component_0.component}
          bind:this={this_component_0}
          {...component_0.props}
          slot="left"
        />
        <slot name="right" slot="right" />
      </SplitterH>
    {:else if component_1.component}
      <SplitterH
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
        on:panelSwapButtonClicked={swapPanel}
        on:panelOrientationButtonClicked={toggleOrientation}
      >
        <slot name="left" slot="left" />
        <svelte:component
          this={component_1.component}
          bind:this={this_component_1}
          {...component_1.props}
          slot="right"
        />
      </SplitterH>
    {:else}
      <SplitterH
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged
        on:panelSwapButtonClicked
        on:panelOrientationButtonClicked
      >
        <slot name="left" slot="left" />
        <slot name="right" slot="right" />
      </SplitterH>
    {/if}
  {:else if orientation === "vertical"}
    {#if component_0.component && component_1.component}
      <SplitterV
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
        on:panelSwapButtonClicked={swapPanel}
        on:panelOrientationButtonClicked={toggleOrientation}
      >
        <svelte:component
          this={component_0.component}
          bind:this={this_component_0}
          {...component_0.props}
          slot="top"
        />
        <svelte:component
          this={component_1.component}
          bind:this={this_component_1}
          {...component_1.props}
          slot="bottom"
        />
      </SplitterV>
    {:else if component_0.component}
      <SplitterV
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
        on:panelSwapButtonClicked={swapPanel}
        on:panelOrientationButtonClicked={toggleOrientation}
      >
        <svelte:component
          this={component_0.component}
          bind:this={this_component_0}
          {...component_0.props}
          slot="top"
        />
        <slot name="bottom" slot="bottom" />
      </SplitterV>
    {:else if component_1.component}
      <SplitterV
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
        on:panelSwapButtonClicked={swapPanel}
        on:panelOrientationButtonClicked={toggleOrientation}
      >
        <slot name="top" slot="top" />
        <svelte:component
          this={component_1.component}
          bind:this={this_component_1}
          {...component_1.props}
          slot="bottom"
        />
      </SplitterV>
    {:else}
      <SplitterV
        {showPanelControl}
        {panel_0_length}
        on:panelSizeChanged
        on:panelSwapButtonClicked
        on:panelOrientationButtonClicked
      >
        <slot name="top" slot="top" />
        <slot name="bottom" slot="bottom" />
      </SplitterV>
    {/if}
  {:else}
    <script>
      console.log(`Invalid orientation: ${orientation}`);
    </script>
  {/if}
</div>

<style>
  .dummy-splitter-container {
    margin: 0;
    padding: 0;
    border: none;
    width: 100%;
    height: 100%;
  }
</style>
