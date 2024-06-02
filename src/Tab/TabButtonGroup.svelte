<script>
  import { createEventDispatcher } from "svelte";
  import FlexBox from "../FlexBox/FlexBox.svelte";

  const dispatch = createEventDispatcher();

  export let tabs = [];
  export let selectedTabIndex = 0;
  export let tabPosition = "top";
  export let tabTrapFocus = false;

  let tabItems = [];
  let tabDirection = "row";
  let tabReverse = false;
  let tabJustifyContent = "flex-start";
  let tabAlignItems = "flex-end";

  $: {
    if (tabs && tabs.length > 0) {
      tabItems.length = 0;

      tabs.forEach((item, index) => {
        const itemCopy = { ...item };
        itemCopy.type = "tabButton";
        itemCopy.tabPosition = tabPosition;
        if (itemCopy.label === undefined) {
          itemCopy.label = `Tab ${index + 1}`;
        }
        delete itemCopy.component;
        delete itemCopy.props;
        tabItems.push(itemCopy);
      });

      tabItems = [...tabItems];
    }
  }

  $: {
    switch (tabPosition) {
      case "top":
        tabDirection = "row";
        tabReverse = false;
        tabJustifyContent = "flex-start";
        tabAlignItems = "flex-end";
        break;
      case "bottom":
        tabDirection = "row";
        tabReverse = false;
        tabJustifyContent = "flex-start";
        tabAlignItems = "flex-start";
        break;
      case "left":
        tabDirection = "column";
        tabReverse = true;
        tabJustifyContent = "flex-end";
        tabAlignItems = "flex-end";
        break;
      case "right":
        tabDirection = "column";
        tabReverse = false;
        tabJustifyContent = "flex-start";
        tabAlignItems = "flex-start";
        break;
    }
  }
</script>

<FlexBox
  direction={tabDirection}
  reverse={tabReverse}
  justifyContent={tabJustifyContent}
  alignItems={tabAlignItems}
  enableTrapFocus={tabTrapFocus}
  items={tabItems}
  selectedItemIndex={selectedTabIndex}
  on:itemSelected={({ detail }) => {
    const { itemIndex, ...detailInfo } = detail;
    detailInfo.tabIndex = itemIndex;
    dispatch("tabSelected", detailInfo);
  }}
/>
