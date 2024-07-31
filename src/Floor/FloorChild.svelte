<script>
  import {
    getContext,
    setContext,
    createEventDispatcher,
    onDestroy,
  } from "svelte";
  import { writable, get } from "svelte/store";
  import {
    getFloorRecordCount,
    loadFloor,
    loadDescendentFloor,
    saveFloor,
    removeFloor,
    removeUnserializableProperties as cleanProps,
    restoreUnserializableProperties as restoreComponentClass,
    updateMenuItemsInProps,
  } from "./persistency.js";

  const dispatch = createEventDispatcher();

  export let floorLevel = -1;
  export let floorId = null;
  export let ancestorFloorId = null;
  export let childComponentInfo = null;
  export let menuItems = [];
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
    console.log(
      `childComponentInfo was set: level: ${floorLevel}, id: ${floorId}`,
      childComponentInfo
    );

    const cleanedData = cleanProps(childComponentInfo);

    if (floorLevel === 0) {
      saveFloor({
        floorId,
        ancestorFloorId,
        childComponentInfo: cleanedData,
        nonFloorParentInfo: null,
      });
    } else {
      dispatch("queryContainerInfo", {
        infoCallback: (containerInfo) => {
          console.log(`queryContainerInfo, id: ${floorId},`, containerInfo);
          const cleanedInfo = cleanProps(containerInfo);
          saveFloor({
            floorId,
            ancestorFloorId,
            childComponentInfo: cleanedData,
            nonFloorParentInfo: cleanedInfo,
          });
        },
      });
    }
  } else {
    clearChildComponentTreeData();

    if (floorLevel === 0) {
      console.log("initial root floor is loaded.");

      getFloorRecordCount()
        .then((count) => {
          context.update((value) => {
            value.updateReason = "updateTotalFloorCount";
            value.totalFloorCount = count;
            return value;
          });
          return loadFloor(floorId);
        })
        .then((floorData) => {
          if (floorData) {
            restoreComponentClass(floorData, "/build/dev/default").then(
              (restoredData) => {
                const restoredChildInfo = updateMenuItemsInProps(
                  restoredData.childComponentInfo,
                  menuItems
                );
                childComponentInfo = restoredChildInfo;
              }
            );
          }
        });
    } else if (floorLevel > 0) {
      console.log(
        `initial floor is loaded, level: ${floorLevel}, floorId: ${floorId}`
      );

      dispatch("queryContainerInfo", {
        infoCallback: (containerInfo) => {
          console.log(`queryContainerInfo, id: ${floorId},`, containerInfo);
          const containerName = containerInfo.containerName;
          if (containerName === "Splitter") {
            loadDescendentFloor(ancestorFloorId).then((floors) => {
              const floorData = floors.find((floor) => {
                const nonFloorParentInfo = floor.nonFloorParentInfo;
                if (nonFloorParentInfo.containerName !== containerName) {
                  return false;
                }
                const hasComponent_0 =
                  nonFloorParentInfo.component_0 && containerInfo.component_0;
                const hasComponent_1 =
                  nonFloorParentInfo.component_1 && containerInfo.component_1;
                return hasComponent_0 || hasComponent_1;
              });

              if (floorData) {
                context.update((value) => {
                  value.updateReason = "updateChildComponentId";
                  const newInvalidFloorId = floorId;
                  const orgFloodId = floorData.floorId;
                  value.replaceIdMap.set(newInvalidFloorId, orgFloodId);
                  return value;
                });
                dispatch("loadFloorChildComponent", {
                  orgFloorId: floorData.floorId,
                  childComponentInfo: floorData.childComponentInfo,
                  isInContextDesignMode: getContextDesignMode(),
                });
              } else {
                console.log(`floor data not found: ${containerName}`);
              }
            });
          }
        },
      });
    }
  }

  export function getContextDesignMode() {
    return get(context).designMode;
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
        designMode,
        targetFloorId: null,
        totalFloorCount: 0,
        replaceIdMap: new Map(),
        childComponentInfo: null,
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
        console.log(
          `after addNodeById, ancestorFloorId: ${ancestorFloorId}, floorId: ${floorId}`
        );
        return value;
      });

      function addNodeById(tree, id) {
        for (const node of tree) {
          if (node.id === id) {
            console.log(
              `addNodeById, ancestorFloorId: ${id}, floorId: ${floorId}`
            );
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
    if (context.updateReason === "componentTreeChange") {
      console.log(`componentTreeChange, ${floorId}`);
      if (floorLevel === 0) {
        // NOTE: 'root floor'에서만 업데이트해주면 된다.
        removeInvalidNode(context.componentTreeData, context.replaceIdMap);
        dispatch("componentTreeChanged", {
          componentTreeData: context.componentTreeData,
        });
      } else {
        // do nothing
      }
    } else if (
      context.updateReason === "highlightFloor" &&
      context.targetFloorId
    ) {
      dispatch("highlightFloor", { floorId: context.targetFloorId });
    } else if (
      context.updateReason === "componentRemove" &&
      context.targetFloorId &&
      context.targetFloorId === floorId
    ) {
      removeFloor(floorId);
      childComponentInfo = null;
      console.log(`component removed: ${floorId}`);
    } else if (context.updateReason === "loadFloorChildComponent") {
      console.log(
        `loaded floor child component: ${context.targetFloorId}, floorId: ${floorId}`
      );
    } else if (context.updateReason === "updateChildComponentId") {
      console.log(`updateChildComponentId, ${floorId}`, context.replaceIdMap);
      let newInvalidFloorId = null;
      let orgFloodId = null;
      if (context.replaceIdMap.has(floorId)) {
        newInvalidFloorId = floorId;
        orgFloodId = context.replaceIdMap.get(newInvalidFloorId);
        replaceNodeId(context.componentTreeData, newInvalidFloorId, orgFloodId);
      }
    } else if (context.updateReason === "updateTotalFloorCount") {
      console.log(`updateTotalFloorCount: ${context.totalFloorCount}`);
    } else {
      /*
      console.log(
        `unhandled update reason: ${context.updateReason}, floorId: ${floorId}, targetFloorId: ${context.targetFloorId}`
      );
      */
    }
  }

  function removeInvalidNode(treeRootData, excludeIdMap) {
    const floorRootElem = document.querySelector(
      "div.floor-container[data-floor-id='floor-root'][data-floor-level='0']"
    );

    if (!floorRootElem && treeRootData.length !== 0) {
      throw new Error("Root floor not found.");
    }

    // NOTE: '루트 노드'는 '1개'만 존재하는 것으로 가정했다.
    if (treeRootData.length !== 1) {
      return;
    }

    const keySet = new Set(excludeIdMap?.keys());
    const valueSet = new Set(excludeIdMap?.values());
    const excludeIds = new Set([...keySet, ...valueSet]);

    removeInvalidNodeArrayElement(floorRootElem, treeRootData[0].children);

    function removeInvalidNodeArrayElement(parentElem, treeData) {
      for (let i = 0; i < treeData.length; i++) {
        const node = treeData[i];
        const floorElem = parentElem.querySelector(
          `[data-floor-id="${node.id}"]`
        );

        if (!floorElem && !excludeIds.has(node.id)) {
          console.log(`remove invalid node: ${node.id}`);
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

  function replaceNodeId(treeData, oldId, newId) {
    for (let i = 0; i < treeData.length; ++i) {
      const node = treeData[i];
      if (node.id === oldId) {
        // NOTE: 'Splitter'의 'orientation'을 변경하면 treeData가 2개가 아니라 '3개'로 되는 경우가 있는 것을 확인함.
        //       2개의 'Floor'중에 1개가 클리어 안되고 있는게 아닌지 모르겟음. 일단 아래의 임시 코드로 처리하면 되긴 함.
        const _newId = treeData.find((node) => node.id === newId);
        if (_newId) {
          treeData.splice(i, 1);
          --i;
        } else {
          node.id = newId;
        }
        console.log(`replaceNodeId: ${oldId} -> ${newId}`);
      }
      if (node.children.length > 0) {
        replaceNodeId(node.children, oldId, newId);
      }
    }
  }

  // NOTE: 'SCompBox'의 '디자인 모드'에서 좌측의 '컴포넌트 트리' 표시를 위한 데이터를 업데이트한다.
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
              showPanelControl: getContextDesignMode(),
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
