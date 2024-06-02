<script>
  import FlexBox from "../FlexBox/FlexBox.svelte";

  // FIXME: 다수의 '탭'들이 추가될 경우 탭이 잘려서 표시되거나 아예 보이지 않음.
  export let tabs = [];
  export let selectedTabIndex = 0;
  export let tabPosition = "top";
  export let tabTrapFocus = false;

  let tabButtonItems = [];
  let tabDirection = "row";
  let tabReverse = false;
  let tabJustifyContent = "flex-start";
  let tabAlignItems = "flex-end";

  $: {
    if (tabs && tabs.length > 0) {
      tabButtonItems.length = 0;

      tabs.forEach((item, index) => {
        const itemCopy = { ...item };
        itemCopy.type = "tabButton";
        itemCopy.tabPosition = tabPosition;
        if (itemCopy.label === undefined) {
          itemCopy.label = `Tab ${index + 1}`;
        }
        delete itemCopy.component;
        delete itemCopy.props;
        tabButtonItems.push(itemCopy);
      });

      tabButtonItems = [...tabButtonItems];
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

  let tabComponents = [];

  // NOTE: '모나코 에디터'와 같은 특정 컴포넌트는 화면에 보이지 않는 탭에 설정된 상태에서
  //       초기화되었을 경우에 자신의 화면을 정상적으로 'update(layout)'할 수 없는 문제가 있음.
  //       이를 해결하기 위해 명시적으로 탭이 선택되었을 때 명시적으로 컴포넌트에 'update' 함수가
  //       존재할 경우에 호출하도록해 workaround함.
  function updateSelectedTab(tabIndex) {
    if (
      tabComponents[tabIndex] &&
      typeof tabComponents[tabIndex].update === "function"
    ) {
      tabComponents[tabIndex].update();
    }
  }

  $: updateSelectedTab(selectedTabIndex);
</script>

<div
  class="tab-view"
  class:top={tabPosition === "top"}
  class:bottom={tabPosition === "bottom"}
  class:left={tabPosition === "left"}
  class:right={tabPosition === "right"}
>
  <div class="tabs">
    <FlexBox
      direction={tabDirection}
      reverse={tabReverse}
      justifyContent={tabJustifyContent}
      alignItems={tabAlignItems}
      enableTrapFocus={tabTrapFocus}
      items={tabButtonItems}
      selectedItemIndex={selectedTabIndex}
      on:itemSelected={({ detail }) => (selectedTabIndex = detail.itemIndex)}
    />
  </div>

  {#if tabs.length > 0}
    {#each tabs as tab, index}
      <div class="tab-content" class:selected={selectedTabIndex === index}>
        {#if tab.component}
          {@const props = tab.props || {}}
          <svelte:component
            this={tab.component}
            bind:this={tabComponents[index]}
            {...props}
          />
        {:else}
          {JSON.stringify(tab)}
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  $tabs-length: 1.25em;
  $button-margin: 0.2em;

  .tab-view {
    display: flex;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;

    .tabs {
      background-color: #f0f0f0;
    }

    .tab-content {
      display: none;
      width: 100%;
      height: 100%;

      &.selected {
        display: block;
      }
    }

    &.top,
    &.bottom {
      flex-direction: column;

      .tabs {
        height: $tabs-length;
      }

      .tab-content {
        height: calc(100% - $tabs-length);
      }
    }

    &.bottom {
      flex-direction: column-reverse;
    }

    &.left,
    &.right {
      flex-direction: row;

      .tabs {
        width: $tabs-length;
        height: auto;
      }

      .tab-content {
        width: calc(100% - $tabs-length);
      }
    }

    &.right {
      flex-direction: row-reverse;
    }
  }
</style>
