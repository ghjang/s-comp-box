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

  let this_component_0;
  let this_component_1;

  // TODO: Splitter에 설정되는 컴포넌트의 이벤트를 Splitter 컴포넌트의 부모 컴포넌트로 포워딩
  //
  // 'this_component_0'와 'this_component_1'은 Splitter 컴포넌트에 설정되는 컴포넌트의 인스턴스를
  // 참조하는 변수로, 이 변수를 통해 설정되는 컴포넌트의 이벤트를 '$on'을 통해서 수신후 부모 컴포넌트로 포워딩할
  // 수 있을 것으로 보임.
  // 
  // 부모에게 이벤트 포워딩시 2개의 팬 패널 컴포넌트 정보를 모두 보내면 부모 쪽에서 어떤 패널에서 이벤트가 발생했는지
  // 확인후 다른 쪽 패널 조작 등을 할 수 있을 것으로 보임.

  $: if (this_component_0) {
    console.log("this_component_0", this_component_0);
    if (typeof this_component_0.getCustomEventNames === "function") {
      console.log("this_component_0.getCustomEventNames", this_component_0.getCustomEventNames());
    }
  } else {
    console.log("this_component_0 is null");
  }

  $: if (this_component_1) {
    console.log("this_component_1", this_component_1);
    if (typeof this_component_1.getCustomEventNames === "function") {
      console.log("this_component_1.getCustomEventNames", this_component_1.getCustomEventNames());
    }
  } else {
    console.log("this_component_1 is null");
  }

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
          bind:this={this_component_0}
          {...component_0_props}
          slot="left"
        />
        <svelte:component
          this={component_1.component}
          bind:this={this_component_1}
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
          bind:this={this_component_0}
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
          bind:this={this_component_1}
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
          bind:this={this_component_0}
          {...component_0_props}
          slot="top"
        />
        <svelte:component
          this={component_1.component}
          bind:this={this_component_1}
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
          bind:this={this_component_0}
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
          bind:this={this_component_1}
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
