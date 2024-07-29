<script>
  import {
    getContext,
    setContext,
    createEventDispatcher,
    onDestroy,
  } from "svelte";
  import { writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  export let floorLevel = -1;
  export let floorId = null;
  export let ancestorFloorId = null;
  export let childComponentInfo = null;

  const contextName = "floor-context";
  let context;
  let unsubscribe;

  $: floorLevel >= 0 && (context = initContext(contextName));

  // NOTE: 아래 '$context' 문법을 사용해 스토어 '자동 구독'을 한 경우에
  //       '최상위 Floor'에 'Splitter' 같은 '컨테이너' 성격의
  //       컴포넌트가 아닌 'Marquee'와 같은 일반 컴포넌트를 추가시
  //       'context.update'가 분명 호출되었음에도 이 '반응형 블럭'이
  //       트리거 되지 않은 문제가 있었음. 디버깅을 통해서 확인 결과
  //       다른 곳에 변경은 없는 상태에서 자동 구독이 아닌 'context.subscribe'를
  //       이용한 '수동 구독'의 경우에 정상적으로 동작하는 것을 확인했음.
  //$: context && updateFloorState($context);

  $: if (context) {
    unsubscribe = context.subscribe((value) => {
      updateFloorState(value);
    });
  }

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
          let compName;

          if (typeof childComponentInfo.componentClass === "function") {
            // NOTE: '릴리즈 번들링 최적화'시에 '컴포넌트 클래스'를 사용하는 경우에
            //       '클래스 이름'이 '축소 변경'될 수 있어 '원래의 클래스 이름'을
            //       클래스 생성자 함수로부터 얻을 수가 없어 명시적으로 지정된
            //       '컴포넌트 클래스 이름'을 사용한다.
            compName = childComponentInfo.componentClassName;
          } else {
            compName = childComponentInfo.customElementName;
          }

          if (!compName) {
            throw new Error("Component name is required.");
          }

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

  onDestroy(() => {
    unsubscribe?.();
  });
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
