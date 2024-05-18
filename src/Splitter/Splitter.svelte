<svelte:options customElement="s-splitter" />

<script>
  import SplitterH from "./SplitterH.svelte";
  import SplitterV from "./SplitterV.svelte";

  export let orientation = "horizontal";

  export let content_panel_0_length = "50%";

  export let component_0 = { component: null, props: {} };
  export let component_1 = { component: null, props: {} };

  let panelSize = {};

  let component_0_props = { ...component_0.props, ...panelSize };
  let component_1_props = { ...component_1.props, ...panelSize };

  function handlePanelSizeChange(event) {
    panelSize = { panelSize: event.detail };
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
        {content_panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
      >
        <svelte:component
          this={component_0.component}
          {...component_0_props}
          slot="left"
        />
        <svelte:component
          this={component_1.component}
          {...component_1_props}
          slot="right"
        />
      </SplitterH>
    {:else if component_0.component}
      <SplitterH
        {content_panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
      >
        <svelte:component
          this={component_0.component}
          {...component_0_props}
          slot="left"
        />
        <slot name="right" slot="right" />
      </SplitterH>
    {:else if component_1.component}
      <SplitterH
        {content_panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
      >
        <slot name="left" slot="left" />
        <svelte:component
          this={component_1.component}
          {...component_1_props}
          slot="right"
        />
      </SplitterH>
    {:else}
      <SplitterH {content_panel_0_length} on:panelSizeChanged>
        <slot name="left" slot="left" />
        <slot name="right" slot="right" />
      </SplitterH>
    {/if}
  {:else if orientation === "vertical"}
    {#if component_0.component && component_1.component}
      <SplitterV
        {content_panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
      >
        <svelte:component
          this={component_0.component}
          {...component_0_props}
          slot="top"
        />
        <svelte:component
          this={component_1.component}
          {...component_1_props}
          slot="bottom"
        />
      </SplitterV>
    {:else if component_0.component}
      <SplitterV
        {content_panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
      >
        <svelte:component
          this={component_0.component}
          {...component_0_props}
          slot="top"
        />
        <slot name="bottom" slot="bottom" />
      </SplitterV>
    {:else if component_1.component}
      <SplitterV
        {content_panel_0_length}
        on:panelSizeChanged={handlePanelSizeChange}
      >
        <slot name="top" slot="top" />
        <svelte:component
          this={component_1.component}
          {...component_1_props}
          slot="bottom"
        />
      </SplitterV>
    {:else}
      <SplitterV {content_panel_0_length} on:panelSizeChanged>
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
