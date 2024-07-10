<script>
  import { getContext, setContext, createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  export let floorLevel = -1;
  export let floorId = null;
  export let ancestorFloorId = null;
  export let childComponentInfo = null;

  const contextName = "floor-context";
  let context;

  $: floorLevel >= 0 && (context = initContext(contextName));
  $: context && updateFloorState($context);

  $: childComponentInfo
    ? updateChildComponentTreeData()
    : clearChildComponentTreeData();

  function initContext(ctxName) {
    let context;
    if (floorLevel === 0) {
      context = writable({
        maxLevel: 0,
        componentTreeData: [
          {
            id: floorId,
            name: null,
            open: true,
            children: [],
          },
        ],
      });
      setContext(ctxName, context);
    } else {
      context = getContext(ctxName);
      context.update((value) => {
        if (floorLevel > value.maxLevel) {
          value.maxLevel = floorLevel;
        }
        const treeData = value.componentTreeData;
        addNodeById(treeData, ancestorFloorId);
        return value;
      });

      function addNodeById(tree, id) {
        for (const node of tree) {
          if (node.id === id) {
            node.children.push({
              id: floorId,
              name: null,
              open: true,
              children: [],
            });
            return true;
          }
          if (node.children.length > 0) {
            const found = addNodeById(node.children, id);
            if (found) {
              return true;
            }
          }
        }
        return false;
      }
    }
    return context;
  }

  function updateFloorState(context) {
    if (floorLevel === 0) {
      // NOTE: 'root floor'에서만 업데이트해주면 된다.
      dispatch("componentTreeChanged", {
        componentTreeData: context.componentTreeData,
      });
    } else {
      // do nothing
    }
  }

  function updateChildComponentTreeData() {
    context.update((value) => {
      const treeData = value.componentTreeData;
      updateNodeById(treeData, floorId);
      return value;
    });

    function updateNodeById(tree, id) {
      for (const node of tree) {
        if (node.id === id) {
          const compName = childComponentInfo.componentClass
            ? childComponentInfo.componentClass.name
            : childComponentInfo.customElementName;
          node.name = compName;
          node.children = [];
          return true;
        }
        if (node.children.length > 0) {
          const found = updateNodeById(node.children, id);
          if (found) {
            return true;
          }
        }
      }
      return false;
    }
  }

  function clearChildComponentTreeData() {
    context?.update((value) => {
      const treeData = value.componentTreeData;
      resetNodeById(treeData, floorId);
      return value;
    });

    function resetNodeById(tree, id) {
      for (const node of tree) {
        if (node.id === id) {
          node.name = null;
          node.children = [];
          return true;
        }
        if (node.children.length > 0) {
          const found = resetNodeById(node.children, id);
          if (found) {
            return true;
          }
        }
      }
      return false;
    }
  }
</script>

{#if childComponentInfo}
  {#if childComponentInfo.componentClass}
    <svelte:component
      this={childComponentInfo.componentClass}
      {...childComponentInfo.props}
    />
  {:else if childComponentInfo.customElementName}
    <svelte:element
      this={childComponentInfo.customElementName}
      {...childComponentInfo.props}
    />
  {/if}
{/if}
