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

  let isAllComponentsRegistered = false;
  let mapper;

  // NOTE: '0.1초' 간격으로 최대 '5초' 동안 컴포넌트를 찾는다.
  function retryFindComponent(className, maxAttempts = 50) {
    let attempts = 0;
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      const intervalId = setInterval(() => {
        let registeredComponent =
          mapper.getRegisteredComponent(className) ||
          window.gSCompMapper?.getRegisteredComponent(className);
        if (registeredComponent) {
          clearInterval(intervalId);
          resolve(registeredComponent);
        } else if (++attempts >= maxAttempts) {
          clearInterval(intervalId);
          reject(
            new Error(
              `Component '${className}' not found after ${maxAttempts * 0.1} seconds`
            )
          );
        } else {
          elapsed += 0.1;
          console.log(
            `Component '${className}' not found after ${elapsed.toFixed(1)} seconds`
          );
        }
      }, 100);
    });
  }

  // FIXME: 동일 컴포넌트가 여러개 있을 수도 있다. 동시에 각각 로딩여부를 확인할 필요는 없을 듯,...
  //        중복 컴포넌트를 제거하고 하나씩 점검하도록 수정할 것.
  $: if (!isAllComponentsRegistered && mapper && items && items.length > 0) {
    Promise.all(
      items.map(async (item) => {
        if (typeof item.component === "string") {
          const registeredComponent = await retryFindComponent(item.component);
          item.component = registeredComponent;
          return item;
        } else {
          return Promise.resolve(item);
        }
      })
    )
      .then((updatedItems) => {
        items = updatedItems;
        isAllComponentsRegistered = true;
      })
      .catch((error) => {
        console.error(error);
        // FIXME: 컴포넌트 로딩 실패시 대처방안 필요. alert??
      });
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
