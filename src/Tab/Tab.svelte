<script>
  import { trapFocus } from "../common/action/trapFocus.js";

  export let tabs = [];
  export let selectedTabIndex = 0;

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

<div class="tab-view">
  <!-- TODO: 'tabs' 버튼 부분을 'ToggleButtonGroup' 컴포넌트로 분리 -->
  <div class="tabs" use:trapFocus>
    {#each tabs as tab, index}
      <button
        class:selected={index === selectedTabIndex}
        on:click={() => (selectedTabIndex = index)}
        on:focus={() => (selectedTabIndex = index)}
      >
        {tab.label || `Tab ${index + 1}`}
      </button>
    {/each}
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
  $tabs-height: 1.25em;

  .tab-view {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;

    .tabs {
      display: flex;
      align-items: flex-end;
      height: $tabs-height;
      background-color: #f0f0f0;

      button {
        padding: 0.2em 0.5em;
        border: none;
        border-radius: 0;
        background-color: #d0d0d0;
        font-size: 0.7em;
        user-select: none;
        clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);

        &:focus {
          outline: 1px dotted blue;
          outline-offset: -0.3em;
        }

        &.selected {
          background-color: #b0b0b0;
        }
      }
    }

    .tab-content {
      display: none;
      width: 100%;
      height: calc(100% - #{$tabs-height});

      &.selected {
        display: block;
      }
    }
  }
</style>
