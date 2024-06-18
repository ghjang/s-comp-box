<script>
  import StackPanel from "../FlexBox/StackPanel.svelte";
  import TabButtonGroup from "./TabButtonGroup.svelte";

  // FIXME: 다수의 '탭'들이 추가될 경우 탭이 잘려서 표시되거나 아예 보이지 않음.
  export let tabs = [];
  export let selectedTabIndex = 0;
  export let tabPosition = "top";

  let tabComponents = [];

  let tabDirection = "vertical";
  let tabHAlign = "left";
  let tabVAlign = "bottom";
  let tabReverse = false;

  // NOTE: '모나코 에디터'와 같은 특정 컴포넌트는 화면에 보이지 않는 탭에 설정된 상태에서
  //       초기화되었을 경우에 자신의 화면을 정상적으로 'update(layout)'할 수 없는 문제가 있음.
  //       이를 해결하기 위해 명시적으로 탭이 선택되었을 때 명시적으로 컴포넌트에 'update' 함수가
  //       존재할 경우에 호출하도록해 workaround함.
  function updateSelectedTab(tabIndex, tabPosition) {
    // '탭 컨텐트' 업데이트
    if (
      tabComponents[tabIndex] &&
      typeof tabComponents[tabIndex].update === "function"
    ) {
      const focus = true;
      tabComponents[tabIndex].update(focus);
    }

    // '탭 버튼 그릅' 위치 업데이트
    switch (tabPosition) {
      case "top":
        tabDirection = "vertical";
        tabHAlign = "left";
        tabVAlign = "bottom";
        tabReverse = false;
        break;

      case "bottom":
        tabDirection = "vertical";
        tabHAlign = "left";
        tabVAlign = "top";
        tabReverse = true;
        break;

      case "left":
        tabDirection = "horizontal";
        tabHAlign = "right";
        tabVAlign = "top";
        tabReverse = false;
        break;

      case "right":
        tabDirection = "horizontal";
        tabHAlign = "left";
        tabVAlign = "top";
        tabReverse = true;
        break;
        
      default:
        throw new Error(`Invalid tab position: ${tabPosition}`);
    }
  }

  $: updateSelectedTab(selectedTabIndex, tabPosition);

  let tabView;

  // 'Ctrl + 숫자' 키 입력을 통한 '탭' 선택, 'Ctrl + 1'은 '첫 번째 탭'을 의미함.
  function handleKeyUp(event) {
    const index = parseInt(event.key) - 1;
    if (event.ctrlKey && index >= 0 && index < tabs.length) {
      tabView.focus();
      selectedTabIndex = index;
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={tabView}
  class="tab-view {tabPosition}"
  tabindex="-1"
  on:keyup={handleKeyUp}
>
  <StackPanel
    direction={tabDirection}
    hAlign={tabHAlign}
    vAlign={tabVAlign}
    reverse={tabReverse}
  >
    <div class="tabs">
      <TabButtonGroup
        {tabs}
        {selectedTabIndex}
        {tabPosition}
        on:tabSelected={({ detail }) => (selectedTabIndex = detail.tabIndex)}
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
  </StackPanel>
</div>

<style lang="scss">
  $tabs-length: 1.25em;
  $button-margin: 0.2em;

  .tab-view {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    outline: none;

    .tabs {
      background-color: #f0f0f0;
    }

    /*
      NOTE: 'flex-grow: 1'을 'tab-content'에 적용해본 결과 원하는 형태가 아닌 것으로 확인되어,
            일단 'width, height'를 기존 방식으로 설정해 사용하도록 함.
     */
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
      .tabs {
        height: $tabs-length;
      }

      .tab-content {
        height: calc(100% - $tabs-length);
      }
    }

    &.left,
    &.right {
      .tabs {
        width: $tabs-length;
        height: auto;
      }

      .tab-content {
        width: calc(100% - $tabs-length);
      }
    }
  }
</style>
