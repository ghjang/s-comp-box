<svelte:options accessors />

<script>
  import { createEventDispatcher } from "svelte";
  import Floor from "../Floor/Floor.svelte";
  import StackPanel from "../Layout/StackPanel.svelte";
  import TabButtonGroup from "./TabButtonGroup.svelte";
  import ContextMenuMediator from "../ContextMenuMediator/ContextMenuMediator.svelte";
  import {
    CustomEventsRegister,
    combineCustomEvents,
  } from "../common/customEvents.js";

  const dispatch = createEventDispatcher();

  // FIXME: 다수의 '탭'들이 추가될 경우 탭이 잘려서 표시되거나 아예 보이지 않음.
  export let tabs = [];
  export let selectedTabIndex = 0;
  export let tabPosition = "top";
  export let showContentControl = false;

  export let customEvents = ["updateChildComponentInfo"];

  export const getTabComponents = () => tabComponents;

  let tabComponents = [];
  let customEventsRegisters = [];

  let tabDirection = "vertical";
  let tabHAlign = "left";
  let tabVAlign = "bottom";
  let tabReverse = false;

  let contextMenu;
  let menuItems = [];

  // NOTE: 탭 컴포넌트가 '추가, 삭제'될 경우에도 실행됨.
  $: if (tabs.length === tabComponents.length) {
    customEventsRegisters.forEach((register) => register?.unregister?.());
    customEventsRegisters = [];

    tabComponents.forEach((component, index) => {
      if (!component) {
        return;
      }

      const register = new CustomEventsRegister(
        dispatch,
        component,
        () => {
          // event의 'detail' 속성에 설정할 값
          return {
            componentName: "Tab",
            tabComponents,
            selectedTabIndex,
          };
        },
        (callback) => {
          // 'queryContainerInfo' 이벤트 발생시 'callback'으로 값 전달
          callback({
            containerName: "Tab",
            tabComponents,
            tabIndex: index,
            selectedTabIndex,
            ensureTabVisible: (tabIndex) => (selectedTabIndex = tabIndex),
          });
        },
      );

      customEventsRegisters.push(register);
    });

    tabComponents.forEach((component) => {
      if (component && component.customEvents) {
        customEvents = combineCustomEvents(
          component.customEvents,
          customEvents,
        );
      }
    });
  }

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

    dispatch("updateChildComponentInfo", {
      updateCallback: (childComponentInfo) => {
        const _childComponentInfo = childComponentInfo.childComponentInfo;
        if (_childComponentInfo.componentClassName === "Tab") {
          _childComponentInfo.props.selectedTabIndex = tabIndex;
          _childComponentInfo.props.tabPosition = tabPosition;
        }
      },
    });
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

  function handleTabsContextMenu(event) {
    if (!contextMenu) {
      return;
    }

    // NOTE: 최소 1개의 탭은 있다.
    const firstTabComponent = tabComponents[0];
    if (!firstTabComponent) {
      return;
    }

    menuItems = [];

    // 'Floor' 컴포넌트를 이미 사용하고 있는 경우만 'Add New Tab' 메뉴 추가
    if (typeof firstTabComponent.getComponentScriptBasePath == "function") {
      const scriptBasePath = firstTabComponent.getComponentScriptBasePath();
      const items = firstTabComponent.getMenuItems();
      menuItems.push(
        {
          action: {
            text: "Add New Tab",
            handler: () => {
              const newTabChildComponentInfo = {
                label: "Tab 1",
                component: Floor,
                componentClassName: "Floor",
                props: {
                  componentScriptBasePath: scriptBasePath,
                  menuItems: items,
                },
              };

              tabs = [...tabs, newTabChildComponentInfo];

              selectedTabIndex = tabs.length - 1;

              dispatch("updateChildComponentInfo", {
                updateCallback: (childComponentInfo) => {
                  const _childComponentInfo =
                    childComponentInfo.childComponentInfo;
                  _childComponentInfo.props.tabs.push(newTabChildComponentInfo);
                  _childComponentInfo.props.selectedTabIndex = selectedTabIndex;
                },
              });
            },
          },
        },
        {
          divider: { style: {} },
        },
      );
    }

    // '탭 위치' 변경 메뉴 항목 추가
    const tabPositions = ["top", "bottom", "left", "right"];
    tabPositions.forEach((position) => {
      menuItems.push({
        action: {
          text: `${position}`,
          checked: tabPosition === position,
          handler: () => (tabPosition = position),
        },
      });
    });

    contextMenu.showContextMenu(event, true, { parentBox: tabView });
  }

  function handleMenuItemClicked(event) {
    const { action } = event.detail;
    if (action && typeof action.handler === "function") {
      action.handler();
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={tabView}
  class="tab-view {tabPosition}"
  tabindex="-1"
  on:keyup={handleKeyUp}
  on:contextmenu|preventDefault|stopPropagation
>
  <StackPanel
    direction={tabDirection}
    hAlign={tabHAlign}
    vAlign={tabVAlign}
    reverse={tabReverse}
  >
    <div
      class="tabs"
      on:contextmenu|preventDefault|stopPropagation={handleTabsContextMenu}
    >
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
            <div bind:this={tabComponents[index]}>
              {JSON.stringify(tab)}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </StackPanel>
</div>

{#if showContentControl}
  <ContextMenuMediator
    {menuItems}
    bind:this={contextMenu}
    on:menuItemClicked={handleMenuItemClicked}
  />
{/if}

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
        width: 100%;
      }

      .tab-content {
        height: calc(100% - $tabs-length);
      }
    }

    &.left,
    &.right {
      .tabs {
        width: $tabs-length;
        height: 100%;
      }

      .tab-content {
        width: calc(100% - $tabs-length);
      }
    }
  }
</style>
