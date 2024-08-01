// 'tree' 노드 중에 'id'가 'ancestorFloorId'인 노드를 찾아서 그 노드의 'children'에 'newFloorId'를 추가한다.
// 리턴값은 'newFloorId'를 추가했는지 여부이다.
export function addNodeById(tree, ancestorFloorId, newFloorId) {
    for (const node of tree) {
        if (node.id === ancestorFloorId) {
            node.children.push({
                id: newFloorId,
                name: null,
                open: true,
                children: [],
            });
            return true;
        }
        if (node.children.length > 0) {
            const found = addNodeById(node.children, ancestorFloorId, newFloorId);
            if (found) {
                return true;
            }
        }
    }
    return false;
}


// 'tree' 노드 중에 'id'가 'floorId'인 노드를 찾아서 그 노드의 내용을 '리셋'한다.
export function resetNodeById(tree, id) {
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


// 'tree' 노드 중에 'id'에 해당하는 노드의 'name' 정보를 업데이트한다.
// 'childComponentInfo'는 'id'와 대응되는 '컴포넌트' 정보를 가지고 있다.
export function updateNodeById(tree, id, childComponentInfo, isDesignMode) {
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
                    showPanelControl: isDesignMode,
                };
            }

            return true;
        }
        if (node.children.length > 0) {
            const found = updateNodeById(node.children, id, childComponentInfo, isDesignMode);
            if (found) {
                return true;
            }
        }
    }
    return false;
}


// 'tree' 전체를 순회하면서 'oldId'를 'newId'로 변경한다.
export function replaceNodeId(tree, oldId, newId) {
    for (let i = 0; i < tree.length; ++i) {
        const node = tree[i];
        if (node.id === oldId) {
            node.id = newId;
        }
        if (node.children.length > 0) {
            replaceNodeId(node.children, oldId, newId);
        }
    }
}


// 'TreeView'에 표시를 위해서 구성된 데이터 중에 DOM에서 '삭제'된 'Floor' 컴포넌트 데이터를 제거한다.
// 
// treeRootData: 'SCompBox'의 '디자인 모드'에서 좌측 '트리'를 표현하는 데이터
// excludeIdMap: NOTE: '스벨트' 컴포넌트의 동장 방식으로 인해 현재 '처림 시점' 제어가 쉽지 않은 상황이다.
//                     일단은 돌아가는 임시 방법으로 도입한 것이다.
//                     'excludeIdMap'에 포함된 'id'는 '삭제'하지 않도록 한다.
export function removeInvalidNode(treeRootData, excludeIdMap) {
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
