<script>
  import { getContext, setContext, createEventDispatcher } from "svelte";
  import {
    getFirstNodeId,
    getLastNodeId,
    getPrevNodeId,
    getNextNodeId,
  } from "./tree.dom.js";
  import { writable } from "svelte/store";

  const _dispatch = createEventDispatcher();
  const dispatch = (type, nodeData) => {
    $context.lastSelectRectNodeId = nodeData.id;
    _dispatch(type, nodeData);
  };

  export let nodeLevel = 0;
  export let data = [];

  export let openIcon = "▼";
  export let closeIcon = "►";

  export let showSelectRect = false;

  export function updateNodeSelected(nodeId) {
    $context.selectedNodeId = nodeId;
    $context.lastSelectRectNodeId = nodeId;
  }

  export function openNodeAtSelectRect(rootUlElem) {
    const nodeId = $context.lastSelectRectNodeId;
    const nodeBtnElem = rootUlElem.querySelector(
      `div.node-content[data-node-id="${nodeId}"] button.toggle-button`
    );
    if (nodeBtnElem) {
      const contentNode = nodeBtnElem.parentNode;
      const isOpen = contentNode.dataset.nodeOpen == "true";
      if (!isOpen) {
        nodeBtnElem.click();
      }
    }
  }

  export function closeNodeAtSelectRect(rootUlElem) {
    const nodeId = $context.lastSelectRectNodeId;
    const nodeBtnElem = rootUlElem.querySelector(
      `div.node-content[data-node-id="${nodeId}"] button.toggle-button`
    );
    if (nodeBtnElem) {
      const contentNode = nodeBtnElem.parentNode;
      const isOpen = contentNode.dataset.nodeOpen == "true";
      if (isOpen) {
        nodeBtnElem.click();
      }
    }
  }

  export function selectNodeAtSelectRect(rootUlElem) {
    const nodeId = $context.lastSelectRectNodeId;
    const nodeElem = rootUlElem.querySelector(
      `div.node-content[data-node-id="${nodeId}"]`
    );
    if (nodeElem) {
      nodeElem.querySelector(".node-name").click();
    }
  }

  export function moveSelectRectToPrevNode(rootUlElem) {
    const lastNodeId = $context.lastSelectRectNodeId;

    if (!lastNodeId) {
      const lastNodeId = getLastNodeId(rootUlElem);
      updateNodeSelectRect(lastNodeId);
      return;
    }

    const prevNodeId = getPrevNodeId(rootUlElem, lastNodeId);
    updateNodeSelectRect(prevNodeId);
  }

  export function moveSelectRectToNextNode(rootUlElem) {
    const lastNodeId = $context.lastSelectRectNodeId;

    if (!lastNodeId) {
      const firstNodeId = getFirstNodeId(rootUlElem);
      updateNodeSelectRect(firstNodeId);
      return;
    }

    const nextNodeId = getNextNodeId(rootUlElem, lastNodeId);
    updateNodeSelectRect(nextNodeId);
  }

  export function moveSelectRectToFirstNode(rootUlElem) {
    const firstNodeId = getFirstNodeId(rootUlElem);
    updateNodeSelectRect(firstNodeId);
  }

  export function moveSelectRectToLastNode(rootUlElem) {
    const lastNodeId = getLastNodeId(rootUlElem);
    updateNodeSelectRect(lastNodeId);
  }

  function updateNodeSelectRect(nodeId) {
    $context.lastSelectRectNodeId = nodeId ?? $context.lastSelectRectNodeId;
  }

  function toggleNodeOpenState(nodeData) {
    nodeData.open = !nodeData.open;
    data = [...data];
  }

  const context = initContext();
  $: updateTreeViewState($context);

  function initContext() {
    let context;
    if (nodeLevel === 0) {
      context = writable({
        maxLevel: 0,
        selectedNodeId: null,
        lastSelectRectNodeId: null,
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

  // NOTE: '노드명'에서 더블 클릭시 'dblclick' 이벤트만 발생시키고
  //       'click' 이벤트는 발생시키지 않도록 workaround하기 위해 사용함.
  let clickTimeout = null;

  function handleNodeNameClick(event, nodeData) {
    // 'click()' 함수 호출을 통해 발생한 경우는 '타임아웃 workaround'를 사용할 필요가 없음.
    if (!event.isTrusted) {
      dispatch("treeNodeSelected", nodeData);
      return;
    }

    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      clickTimeout = null;
      dispatch("treeNodeSelected", nodeData);
    }, 250);
  }

  function handleNodeNameDbClick(event, nodeData) {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      dispatch("treeNodeSelected", nodeData);
    }
    toggleNodeOpenState(nodeData);
  }
</script>

<ul data-node-level={nodeLevel}>
  {#each data as node (node.id)}
    <li class="node-item" title={node.tooltip ?? ""}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="node-content"
        class:select-rect={node.id == $context.lastSelectRectNodeId &&
          showSelectRect}
        data-node-id={node.id}
        data-node-open={node.open}
        on:click={dispatch("treeNodeSelected", node)}
      >
        <button
          class="toggle-button"
          tabindex="-1"
          on:mousedown|preventDefault
          on:click|preventDefault|stopPropagation={() => {
            toggleNodeOpenState(node);
            updateNodeSelectRect(node.id);
            dispatch("treeNodeButtonClicked", node);
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
          class:selected={node.id == $context.selectedNodeId}
          on:click|preventDefault|stopPropagation={(e) =>
            handleNodeNameClick(e, node)}
          on:dblclick|preventDefault|stopPropagation={(e) =>
            handleNodeNameDbClick(e, node)}
        >
          {node.name}
        </span>
      </div>

      {#if node.children && node.open}
        <svelte:self
          nodeLevel={nodeLevel + 1}
          data={node.children}
          {showSelectRect}
          on:treeNodeSelected
          on:treeNodeButtonClicked
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

      .node-content {
        margin-left: 2px;
        margin-right: 2px;

        &.select-rect {
          outline: none;
          box-shadow: 0 0 0 1px darkgray;
        }

        .toggle-button {
          border: none;
          background: none;
          box-shadow: none;
          color: inherit;
          padding: 0;
          user-select: none;
          outline: none;
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
          border-radius: 0.05em;

          &.selected {
            background-color: darkgray;
          }
        }
      }
    }
  }

  ul {
    ul {
      margin-left: 1em;
    }
  }
</style>
