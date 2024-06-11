<script>
  import { createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";
  import ComponentLoader from "../ComponentLoader/ComponentLoader.svelte";
  import StackPanel from "../FlexBox/StackPanel.svelte";

  const dispatch = createEventDispatcher();

  export let activatedValue = null;
  export let direction = "vertical";
  export let reverse = false;
  export let hAlign = "left";
  export let vAlign = "top";
  export let trapFocus = false;
  export let defaultItemProps = {};
  export let items = [];

  const contextName = "toggle-group-context";
  const context = initContext(contextName);
  $: updateToggleGroupState($context);

  function initContext(ctxtName) {
    const context = writable({
      activatedValue: null,
    });
    setContext(ctxtName, context);
    return context;
  }

  function updateToggleGroupState(context) {
  }

  function handleToggleItemChanged(event) {
    // NOTE: '토글 그룹'과 관련된 '자식 컴포넌트'에게 '토글 아이템 변경' 이벤트를 전달한다.
    $context.activatedValue = event.detail.value;

    // 현재 '토글 그룹'에 활성화된 토글 아이템의 값을 설정한다.
    activatedValue = event.detail.value;

    dispatch("toggleItemChanged", {
      value: activatedValue,
      itemIndex: event.detail.context.index,
    });
  }

  let loader;
  let isAllComponentsLoaded = false;

  // NOTE: '스벨트 컴포넌트 클래스'가 포함된 스크립트를 찾아서 동적으로 로딩한다.
  async function loadComponents(loader, targetItems) {
    if (!loader) {
      return;
    }

    for (let i = 0; i < targetItems.length; ++i) {
      targetItems[i] = { ...defaultItemProps, ...targetItems[i] };
    }

    await loader.loadAll(targetItems);

    targetItems.forEach((item) => {
      if (typeof item.component === "string") {
        item.component = loader.getRegisteredComponent(item.component);
      }
    });

    isAllComponentsLoaded = true;
  }

  function renderComponents(targetItems) {
    for (let i = 0; i < targetItems.length; ++i) {
      const item = targetItems[i];

      if (typeof item.component === "string") {
        const componentClass = loader.getRegisteredComponent(item.component);
        if (!componentClass) {
          // NOTE: 아직 컴포넌트에 대한 클래스 로딩이 완료되지 않은 경우 로딩을 제시도하도록 한다.
          //       이 코드는 토글링 그룹 컴포넌트에 동적으로 'items'가 변경된 경우를
          //       보완하기 위한 것이다. 현재의 로직 상에서 이 부분이 정상적으로 실행되는지
          //       테스트가 필요하다.
          isAllComponentsLoaded = false;
          return;
        }
        item.component = componentClass;
      }

      item.customEvents = ["toggleItemChanged"];
    }

    // NOTE: 이 대입문은 아래의 'rederComponents' 함수 호출을 하는 '반응형 블럭'을 '재실행'하지 않는다.
    //       스벨트는 '한 tick' 내에서 발생한 변경사항을 '한 번'만 처리하기 때문이다.
    //       물론 다른 반응형 블럭에서 'items'의 변경사항을 감지하고 있다면, 그 반응형 블럭은 재실행된다.
    //
    //       여기서 'targetItems' 참조는 'items' 참조와 동일하다. 이 실행 문맥에서 단순히 'items'에
    //       'targetItems'를 대입하는 것은 'items'의 참조를 변경하지 않는다. 그러므로 'items'의 변경사항을
    //       감지하는 반응형 블럭은 재실행되지 안게된다. 해서 '객체 복사본'을 대입해서 변경되었음을 알려야 한다.
    items = [...targetItems];
  }

  $: !isAllComponentsLoaded && loadComponents(loader, items);
  $: isAllComponentsLoaded && renderComponents(items);
  $: $context.activatedValue = activatedValue;
</script>

<ComponentLoader bind:this={loader} />

{#if isAllComponentsLoaded}
  <StackPanel
    {direction}
    {reverse}
    {hAlign}
    {vAlign}
    {trapFocus}
    {items}
    on:toggleItemChanged={handleToggleItemChanged}
  ></StackPanel>
{:else}
  <!-- FIXME: 컴포넌트가 로딩되고 있다는 것을 어떤 식으로든지 인지 할 수 있게 할 필요가 있다. -->
  <div>Loading...</div>
{/if}
