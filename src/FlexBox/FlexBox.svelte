<svelte:options accessors />

<script>
  import { createEventDispatcher } from "svelte";
  import { conditionalTrapFocus } from "../common/action/trapFocus.js";

  const dispatch = createEventDispatcher();

  // FIXME: 'FlexBox' 컴포넌트내에서 'Bubble', 'Card', 'TabButton' 컴포넌트 명시적 참조 제거
  // 가능하면 제거할 것.
  // '스토어'나 '이벤트 등록'용 이벤트를 정의할 수 있을 것 같음.
  import Bubble from "./Bubble.svelte";
  import Card from "./Card.svelte";
  import TabButton from "./TabButton.svelte";

  export let direction = "column";
  export let reverse = false;
  export let justifyContent = "flex-start";
  export let alignItems = "flex-start";

  export let enableTrapFocus = false;

  export let defaultItemProps = {};
  export let items = [];
  export let selectedItemIndex = -1;

  export const customEvents = ["cardFolding", "itemSelected"];

  // FIXME: 'on:tabClicked' 이벤트 발생시 'on:tabFocused' 이벤트도 함꼐 발생해 'itemSelected'가 2번 발생함.
  // 가능하면 제거할 것.
  function handleSelectedItem(event) {
    const { itemIndex } = event.detail;
    selectedItemIndex = itemIndex;
    dispatch("itemSelected", event.detail);
  }
</script>

<div
  class="flex-box"
  style:flex-direction={reverse ? `${direction}-reverse` : direction}
  style:justify-content={justifyContent}
  style:align-items={alignItems}
  use:conditionalTrapFocus={{ predicate: enableTrapFocus }}
>
  {#each items as item, index}
    {@const itemProps = { ...defaultItemProps, ...item }}
    {@const type = itemProps.type}
    {@const deleted = delete itemProps.type}
    {#if type === "bubble"}
      <Bubble {...itemProps} />
    {:else if type === "card"}
      <Card
        {...itemProps}
        on:cardFolding={(e) =>
          dispatch("cardFolding", {
            itemIndex: index,
            ...e.detail,
          })}
      />
    {:else if type === "tabButton"}
      <TabButton
        {...itemProps}
        context={{ itemIndex: index, ...item }}
        selected={selectedItemIndex === index}
        on:tabClicked={handleSelectedItem}
        on:tabFocused={handleSelectedItem}
      />
    {:else if deleted}
      {@html JSON.stringify({ type: type, ...itemProps })}
    {/if}
  {/each}
</div>

<style>
  /* NOTE: 'flex-box' div 영역내에서 'flex' 방식으로 '자식 요소'를 배치한다. */
  .flex-box {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    flex-wrap: nowrap;
    overflow: auto;
  }
</style>
