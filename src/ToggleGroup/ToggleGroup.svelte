<script>
  import { createEventDispatcher } from "svelte";
  import ComponentMapper from "../ComponentMapper/ComponentMapper.svelte";
  import StackPanel from "../FlexBox/StackPanel.svelte";

  const dispatch = createEventDispatcher();

  export let activatedValue = null;
  export let itemDirection = "vertical";
  export let itemHAlign = "left";
  export let itemVAlign = "top";
  export let items = [];

  function handleToggleItemActivated(event, item, itemIndex) {
    if (activatedValue === event.detail.value) {
      activatedValue = null;
    } else {
      activatedValue = event.detail.value;
    }
    dispatch("itemActivated", { value: activatedValue, item, itemIndex });
  }

  let mapper;

  $: if (mapper && items && items.length > 0) {
    items.forEach((item) => {
      if (typeof item.component === "string") {
        const className = item.component;
        const registeredComponent = mapper.getRegisteredComponent(className);
        if (!registeredComponent) {
          // FIXME: '컴포넌트 로딩'이 지연되서 로딩이 실패하는 경우 처리 추가
          //
          // 여러가지 방법이 있을 수 있겠다. 한가지 방법은 '로딩 실패' 'alert'를 띄우고
          // 잠시후에 다시 시도하도록 유도하는 방법이 있겠다.
          //
          // 또는 자동으로 로딩이 성공할때까지 재시도하는 방법도 있겠다.
          throw new Error(`Component '${className}' not found`);
        }
        item.component = registeredComponent;
      }
    });

    items = [...items];
  }
</script>

<ComponentMapper bind:this={mapper} />

<StackPanel direction={itemDirection} hAlign={itemHAlign} vAlign={itemVAlign}>
  {#each items as item, index}
    {#if typeof item.component === "function"}
      <svelte:component
        this={item.component}
        {...item.props}
        {activatedValue}
        on:itemActivated={(e) => handleToggleItemActivated(e, item, index)}
      />
    {/if}
  {/each}
</StackPanel>
