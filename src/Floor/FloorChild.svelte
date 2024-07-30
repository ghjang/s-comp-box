<script>
  import {
    getContext,
    setContext,
    createEventDispatcher,
    onDestroy,
  } from "svelte";
  import { writable, get } from "svelte/store";
  import {
    getFloor,
    saveFloor,
    removeUnserializableProperties as cleanProps,
  } from "./persistency.js";

  const dispatch = createEventDispatcher();

  export let floorLevel = -1;
  export let floorId = null;
  export let ancestorFloorId = null;
  export let childComponentInfo = null;
  export let designMode = false;

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

  $: if (childComponentInfo) {
    updateChildComponentTreeData();

    // 유효한 컴포넌트 정보를 로컬 스토리지에 저장?

    console.log(
      `floorLevel: ${floorLevel}, floorId: ${floorId}`,
      "\nchildComponentInfo:",
      childComponentInfo,
      "\ncontext:",
      get(context)
    );

    const cleanedChildComponentInfo = cleanProps(childComponentInfo);
    saveFloor({
      floorId,
      ancestorFloorId,
      floorLevel,
      childComponentInfo: cleanedChildComponentInfo,
    });
  } else {
    clearChildComponentTreeData();

    // 초기에 빈 상태로 로딩될 경우에도 여기에 도달?
    // 로컬 스토리지에서 저장된 컴포넌트 정보가 있는지를 확인해서 로딩?

    if (floorLevel >= 0) {
      console.log(
        `childComponentInfo is null. floorLevel: ${floorLevel}, floorId: ${floorId}`,
        "\ncontext:",
        get(context)
      );
    }
  }

  export function highlight(targetFloorId) {
    context.update((value) => {
      value.updateReason = "highlightFloor";
      value.targetFloorId = targetFloorId;
      return value;
    });
  }

  export function removeComponent(targetFloorId) {
    context.update((value) => {
      value.updateReason = "componentRemove";
      value.targetFloorId = targetFloorId;
      return value;
    });
  }

  function initContext(ctxName) {
    let context;
    if (floorLevel === 0) {
      // 로컬 스토리지에 저장된 것이 있는지 확인후 로딩 처리?

      context = writable({
        maxLevel: 0,
        updateReason: null,
        targetFloorId: null,
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
        value.updateReason = "componentTreeChange";
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
    const updateReason = context.updateReason;
    context.updateReason = null;

    if (updateReason === "componentTreeChange") {
      if (floorLevel === 0) {
        // NOTE: 'root floor'에서만 업데이트해주면 된다.
        removeInvalidNode(context.componentTreeData);
        dispatch("componentTreeChanged", {
          componentTreeData: context.componentTreeData,
        });
      } else {
        // do nothing
      }
    } else if (updateReason === "highlightFloor" && context.targetFloorId) {
      dispatch("highlightFloor", { floorId: context.targetFloorId });
    } else if (
      updateReason === "componentRemove" &&
      context.targetFloorId &&
      context.targetFloorId === floorId
    ) {
      console.log(`unknown update reason: ${updateReason}`);
      childComponentInfo = null;
    }
  }

  function removeInvalidNode(treeRootData) {
    const floorRootElem = document.querySelector(
      "div.floor-container[data-floor-id='floor-root'][data-floor-level='0']"
    );

    if (!floorRootElem) {
      throw new Error("Root floor not found.");
    }

    // NOTE: '루트 노드'는 '1개'만 존재하는 것으로 가정했다.
    if (treeRootData.length !== 1) {
      return;
    }

    removeInvalidNodeArrayElement(floorRootElem, treeRootData[0].children);

    function removeInvalidNodeArrayElement(parentElem, treeData) {
      for (let i = 0; i < treeData.length; i++) {
        const node = treeData[i];
        const floorElem = parentElem.querySelector(
          `[data-floor-id="${node.id}"]`
        );

        if (!floorElem) {
          treeData.splice(i, 1);
          i--;
        } else {
          if (node.children.length > 0) {
            removeInvalidNodeArrayElement(floorElem, node.children);
          }
        }
      }
    }
  }

  function updateChildComponentTreeData() {
    context.update((value) => {
      value.updateReason = "componentTreeChange";
      if (floorLevel === 0 && value.componentTreeData.length === 0) {
        value.componentTreeData = [
          {
            id: "floor-root",
            open: true,
            children: [],
          },
        ];
      }
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

          if (compName === "Splitter") {
            childComponentInfo.props = {
              ...childComponentInfo.props,
              showPanelControl: designMode,
            };
          }

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
      value.updateReason = "componentTreeChange";
      if (floorLevel === 0) {
        value.componentTreeData = [];
      } else {
        const treeData = value.componentTreeData;
        resetNodeById(treeData, floorId);
      }
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
