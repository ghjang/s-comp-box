<script>
  import { createEventDispatcher } from "svelte";
  import StackPanel from "../FlexBox/StackPanel.svelte";
  import TabButton from "./TabButton.svelte";

  const dispatch = createEventDispatcher();

  export let tabs = [];
  export let selectedTabIndex = 0;
  export let tabPosition = "top";
  export let tabTrapFocus = false;

  let tabItems = [];
  let tabDirection = "horizontal";
  let tabReverse = false;
  let tabHAlign = "left";
  let tabVAlign = "bottom";

  $: {
    if (tabs && tabs.length > 0) {
      tabItems.length = 0;

      tabs.forEach((item, index) => {
        const itemCopy = { ...item };
        itemCopy.component = TabButton;
        itemCopy.customEvents = ["tabClicked", "tabFocused"];
        itemCopy.tabPosition = tabPosition;
        if (itemCopy.label === undefined) {
          itemCopy.label = `Tab ${index + 1}`;
        }
        delete itemCopy.props;
        if (index === selectedTabIndex) {
          itemCopy.selected = true;
        }
        tabItems.push(itemCopy);
      });

      tabItems = [...tabItems];
    }
  }

  $: {
    switch (tabPosition) {
      case "top":
        tabDirection = "horizontal";
        tabReverse = false;
        tabHAlign = "left";
        tabVAlign = "bottom";
        break;
      case "bottom":
        tabDirection = "horizontal";
        tabReverse = false;
        tabHAlign = "left";
        tabVAlign = "top";
        break;
      case "left":
        tabDirection = "vertical";
        tabReverse = true;
        tabHAlign = "right";
        tabVAlign = "top";
        break;
      case "right":
        tabDirection = "vertical";
        tabReverse = false;
        tabHAlign = "left";
        tabVAlign = "top";
        break;
    }
  }

  function handleTabButtonEvent(event) {
    const { detail } = event;
    detail.tabIndex = detail.context.index;
    dispatch("tabSelected", detail);
  }
</script>

<StackPanel
  direction={tabDirection}
  reverse={tabReverse}
  hAlign={tabHAlign}
  vAlign={tabVAlign}
  enableTrapFocus={tabTrapFocus}
  items={tabItems}
  on:tabClicked={handleTabButtonEvent}
  on:tabFocused={handleTabButtonEvent}
/>
