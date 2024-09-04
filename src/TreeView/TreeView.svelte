<script>
  import { createEventDispatcher } from "svelte";
  import Tree from "./Tree.svelte";

  // TODO: '트리 노드 텍스트 필털깅 박스' 기능 추가

  // NOTE: '재귀 Tree' 컴포넌트 자체에서 키보드 이벤트를 처리하는 것이
  //       다소 복잡하므로 키보드 이벤트 처리 부분을 상위 컴포넌트에서 처리하도록 함.
  import { _handleKeyDown, _handleKeyUp } from "./treeview.key.js";

  export let data = [];

  export let openIcon = "▼";
  export let closeIcon = "►";

  export let nodeStyler = null;

  export const customEvents = ["treeNodeSelected", "treeNodeRemove"];

  let treeContainer;
  let tree;
  let showSelectRect = false;

  const dispatch = createEventDispatcher();
  const handleKeyDown = (event) => _handleKeyDown(event, treeContainer, tree);
  const handleKeyUp = (event) => _handleKeyUp(event, treeContainer, tree);

  // '노드명'이나 노드며 우측의 '빈 공간'을 클릭했을 때 처리
  function handleTreeNodeSelected(event) {
    const nodeId = event.detail.id;
    tree.updateNodeSelected(nodeId);

    // NOTE: 'tabindex="-1"'로 지정된 요소는 '탭' 키를 사용하여 포커스를 이동할 수 없지만,
    //       'focus()' 메서드를 사용하여 포커스를 설정할 수는 있다.
    treeContainer.focus();

    dispatch("treeNodeSelected", event.detail);
  }

  function handleTreeNodeRemove(event) {
    tree.updateNodeSelected(null);
    dispatch("treeNodeRemove", event.detail);
  }

  // '노드명' 좌측의 '버튼'을 클릭했을 때 처리
  function handleTreeNodeButtonClicked(event) {
    treeContainer.focus();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={treeContainer}
  class="tree-container"
  tabindex="-1"
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
  on:focusin={() => (showSelectRect = true)}
  on:focusout={() => (showSelectRect = false)}
  on:click={treeContainer?.focus()}
>
  <Tree
    bind:this={tree}
    {data}
    {openIcon}
    {closeIcon}
    {showSelectRect}
    {nodeStyler}
    on:treeNodeSelected={handleTreeNodeSelected}
    on:treeNodeRemove={handleTreeNodeRemove}
    on:treeNodeButtonClicked={handleTreeNodeButtonClicked}
  />
</div>

<style>
  .tree-container {
    margin: 0;
    padding: 0 0 1px 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    outline: none;
  }
</style>
