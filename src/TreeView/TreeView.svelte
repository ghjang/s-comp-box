<script>
  import { getContext, setContext, createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  export let nodeLevel = 0;
  export let data = [];

  export let openIcon = "▼";
  export let closeIcon = "►";

  export const customEvents = ["treeNodeSelected"];


  const context = initContext();
  $: updateTreeViewState($context);

  function initContext() {
    let context;
    if (nodeLevel === 0) {
      context = writable({
        maxLevel: 0,
        selectedNode: null,
      });
      setContext("context", context);
    } else {
      context = getContext("context");
      context.update((value) => {
        if (nodeLevel > value.maxLevel) {
          value.maxLevel = nodeLevel;
        }
        return value;
      });
    }
    return context;
  }

  function updateTreeViewState(context) {
    if (nodeLevel === 0) {
    } else {
    }
  }

  function toggle(nodeData) {
    nodeData.open = !nodeData.open;
    data = [...data];
  }

  function select(node) {
    let prevSelectedNode = $context.selectedNode;

    if (prevSelectedNode) {
      prevSelectedNode.style.backgroundColor = "";
    }

    node.style.backgroundColor = "lightblue";

    $context.selectedNode = node;
  }

  function toggleSelect(event) {
    let prevSelectedNode = $context.selectedNode;

    if (prevSelectedNode === event.target) {
      return;
    }

    if (prevSelectedNode) {
      prevSelectedNode.style.backgroundColor = "";
    }

    event.target.style.backgroundColor = "lightblue";

    $context.selectedNode = event.target;
  }
</script>

<ul>
  {#each data as node (node.id)}
    <li class="node-item">
      <button
        class="toggle-button"
        on:click={(e) => {
          toggle(node);
          select(e.target.parentElement.querySelector(".node-name"));
          dispatch("treeNodeSelected", node);
        }}
      >
        {#if node.children && node.children.length > 0}
          {node.open ? openIcon : closeIcon}
        {:else}
          <span class="dummy-toggle-button-span"></span>
        {/if}
      </button>

      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="node-name"
        on:click={(e) => {
          toggleSelect(e);
          dispatch("treeNodeSelected", node);
        }}
        on:dblclick|preventDefault|stopPropagation={(e) => {
          toggle(node);
          select(e.target);
        }}
      >
        {node.name}
      </span>

      {#if node.children && node.open}
        <svelte:self
          nodeLevel={nodeLevel + 1}
          data={node.children}
          on:treeNodeSelected
        />
      {/if}
    </li>
  {/each}

  <!-- NOTE: 'ul ul' CSS 셀렉터가 코드 상에 명시적으로 보이지 않아서 번들링시에 해당 CSS가 제거되는 문제 workaround -->
  <li class="dummy" style:display="none">
    <ul></ul>
  </li>
</ul>

<style lang="scss">
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    .node-item {
      margin-top: 0.2em;
      user-select: none;

      .toggle-button {
        border: none;
        background: none;
        box-shadow: none;
        color: inherit;
        padding: 0;
        cursor: pointer;

        .dummy-toggle-button-span {
          display: inline-block;
          width: 1em;
        }
      }

      .node-name {
        margin: 0;
        padding-left: 0.2em;
        padding-right: 0.2em;
        border-radius: 0.2em;
      }
    }
  }

  ul {
    ul {
      margin-left: 1em;
    }
  }
</style>
