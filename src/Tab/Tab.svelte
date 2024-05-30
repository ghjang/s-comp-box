<script>
  import { trapFocus } from "../common/action/trapFocus.js";

  export let tabs = [];
  export let selectedTabIndex = 0;
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
          <svelte:component this={tab.component} {...props} />
        {:else}
          {JSON.stringify(tab)}
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  .tab-view {
    .tabs {
      background-color: #f0f0f0;

      button {
        padding: 0.1rem 0.6rem;
        border: none;
        border-radius: 0;
        background-color: #d0d0d0;
        user-select: none;
        clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);

        &:focus {
          outline: 1px dotted blue;
          outline-offset: -3px;
        }

        &.selected {
          background-color: #b0b0b0;
        }
      }
    }

    .tab-content {
      display: none;
      width: 100%;
      height: 100vh;

      &.selected {
        display: block;
      }
    }
  }
</style>
