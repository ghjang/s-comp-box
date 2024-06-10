<script>
  import { createEventDispatcher } from "svelte";
  import ComponentLoader from "../ComponentLoader/ComponentLoader.svelte";
  import StackPanel from "../FlexBox/StackPanel.svelte";

  const dispatch = createEventDispatcher();

  export let activatedValue = null;
  export let itemDirection = "vertical";
  export let itemReverse = false;
  export let itemHAlign = "left";
  export let itemVAlign = "top";
  export let itemsTrapFocus = false;
  export let items = [];

  function handleToggleItemChanged(event) {
    // NOTE: 'activatedValue' 값의 대입으로 인해
    //       'renderComponents' 함수 호축 '반응형 블럭'이 '재실행'된다.
    activatedValue = event.detail.value;

    dispatch("toggleItemChanged", {
      value: activatedValue,
      itemIndex: event.detail.context.index,
    });
  }

  let loader;
  let isAllComponentsLoaded = false;

  async function loadComponents(loader, targetItems) {
    if (!loader) {
      return;
    }

    await loader.loadAll(targetItems);

    targetItems.forEach((item) => {
      if (typeof item.component === "string") {
        item.component = loader.getRegisteredComponent(item.component);
      }
    });

    isAllComponentsLoaded = true;
  }

  function renderComponents(targetItems, activatedValue) {
    const itemsCopy = [];

    for (let i = 0; i < targetItems.length; ++i) {
      const item = targetItems[i];

      if (typeof item.component === "string") {
        // NOTE: 아직 컴포넌트에 대한 클래스 로딩이 완료되지 않은 경우 로딩을 제시도하도록 한다.
        //       이 코드는 토글링 그룹 컴포넌트에 동적으로 'items'가 변경된 경우를
        //       보완하기 위한 것이다. 현재의 로직 상에서 이 부분이 정상적으로 실행되는지
        //       테스트가 필요하다.
        isAllComponentsLoaded = false;
        return;
      }

      const itemCopy = { ...item, ...(item.props ?? {}) };
      itemCopy.customEvents = ["toggleItemChanged"];
      itemCopy.activatedValue = activatedValue;
      delete itemCopy.props;

      itemsCopy.push(itemCopy);
    }

    // NOTE: 이 대입문은 아래의 'rederComponents' 함수 호출을 하는 '반응형 블럭'을 '재실행'하지 않는다.
    //       스벨트는 '한 tick' 내에서 발생한 변경사항을 '한 번'만 처리하기 때문이다.
    //       물론 다른 반응형 블럭에서 'items'의 변경사항을 감지하고 있다면, 그 반응형 블럭은 재실행된다.
    items = itemsCopy;
  }

  $: !isAllComponentsLoaded && loadComponents(loader, items);
  $: isAllComponentsLoaded && renderComponents(items, activatedValue);
</script>

<ComponentLoader bind:this={loader} />

{#if isAllComponentsLoaded}
  <StackPanel
    direction={itemDirection}
    reverse={itemReverse}
    hAlign={itemHAlign}
    vAlign={itemVAlign}
    enableTrapFocus={itemsTrapFocus}
    {items}
    on:toggleItemChanged={handleToggleItemChanged}
  ></StackPanel>
{/if}
