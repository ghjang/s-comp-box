import IndexedDBManager, {
  promisifyRequest,
  promisifyTransaction,
} from "../common/data/IndexedDBManager";

const dbName = "SCompBox";
const dbVersion = 1;

const dbManager = new IndexedDBManager(dbName, dbVersion);

dbManager.addStoreConfig("floors", "floorId", [
  { name: "ancestorFloorId", keyPath: "ancestorFloorId", unique: false },
]);

export const getFloorRecordCount = async () =>
  await dbManager.getRecordCount("floors");

export const loadFloor = async (floorId) =>
  await dbManager.getData("floors", floorId);

export const loadDescendentFloor = async (ancestorFloorId) =>
  await dbManager.getDataByIndex("floors", "ancestorFloorId", ancestorFloorId);

export const saveFloor = async (floor, overwrite = true) =>
  await dbManager.saveData("floors", floor, null, overwrite);

export const removeFloor = async (floorId) => {
  await dbManager.deleteData("floors", floorId);
  const descendents = await loadDescendentFloor(floorId);
  for (const descendent of descendents) {
    await removeFloor(descendent.floorId);
  }
};

export const swapFloorData = async (floorId_0, floorId_1, splitterInfo) => {
  const db = await dbManager.getDatabase();
  const transaction = db.transaction("floors", "readwrite");
  const store = transaction.objectStore("floors");

  try {
    const [floorData_0, floorData_1] = await Promise.all([
      promisifyRequest(store.get(floorId_0)),
      promisifyRequest(store.get(floorId_1)),
    ]);

    if (floorData_0 && floorData_1) {
      // Swap the fields except the keys
      const temp = { ...floorData_0 };
      Object.keys(floorData_0).forEach((key) => {
        if (key !== "floorId" && key !== "nonFloorParentInfo") {
          floorData_0[key] = floorData_1[key];
          floorData_1[key] = temp[key];
        }
      });

      // Perform all updates in a single transaction
      await Promise.all([
        promisifyRequest(store.put(floorData_0)),
        promisifyRequest(store.put(floorData_1)),
        swapAncestorFloorId(store, floorId_0, floorId_1),
      ]);
    } else if (floorData_0) {
      // Handle case where only floorData_0 exists
      floorData_0.floorId = floorId_1;
      delete floorData_0.nonFloorParentInfo.component_0;
      floorData_0.nonFloorParentInfo.component_1 =
        splitterInfo.props.component_1;

      await Promise.all([
        promisifyRequest(store.delete(floorId_0)),
        promisifyRequest(store.put(floorData_0)),
        swapAncestorFloorId(store, floorId_0, floorId_1),
      ]);
    } else if (floorData_1) {
      // Handle case where only floorData_1 exists
      floorData_1.floorId = floorId_0;
      delete floorData_1.nonFloorParentInfo.component_1;
      floorData_1.nonFloorParentInfo.component_0 =
        splitterInfo.props.component_0;

      await Promise.all([
        promisifyRequest(store.delete(floorId_1)),
        promisifyRequest(store.put(floorData_1)),
        swapAncestorFloorId(store, floorId_0, floorId_1),
      ]);
    }

    await promisifyTransaction(transaction);
  } catch (error) {
    transaction.abort();
    throw error;
  }
};

// NOTE: 'store.openCursor()'가 리턴하는 '객체'의 속성으로 'onsuccess'와 'onerror'가 있다.
//       때문에 'promisifyRequest'를 사용할 수 있을 것 같아 보이지만, 커서의 경우 그렇게하면
//       예상치 못한 결과가 발생하는 것을 확인했다. 이상 현상으로는 '조회 순서'가 이상하거나(?),
//       조회 자체가 제대로 이루어지지 않는 증상등이 있었다.
//
//       '단일 레코드'의 '삽입, 삭제, 갱신'건의 경우는 '1회성 작업'이기 때문에 'promisifyRequest'를
//       사용해서 코드가 간결해지고 또 정상적으로 작동하는 것을 확인했지만, '커서'와 같이 '여러 레코드'를
//       순회해야하는, 그러니까 'IndexedDB' 내부적으로 상태를 유지해야하는 경우에는 커서로 현재 레코드건을
//       참조하고 'continue()' 호출후에 'promisifyRequest'를 사용할 경우에 (아마도) 내부 커서
//       상태 조작 부분이 제대로 이루어지지 않는 것으로 보인다.
//
//       해서 일단은 아래와 같이 원래의 방식대로 'onsuccess'와 'onerror'를 직접 사용해서 처리하도록 했다.
//       한번 등록한 'onsuccess'와 'onerror' 핸들러가 '커서'가 끝날때까지 계속 재사용되는 구조로 보인다.
//
// NOTE: '성능' 개선 가능성 포인트로 필요하다면,
//       'IndexedDB'의 'transaction' 동작 방식에 대해서 좀 더 알아보는게 맞겠다.
async function swapAncestorFloorId(store, floorId_0, floorId_1) {
  return new Promise((resolve, reject) => {
    const request = store.openCursor();

    request.onsuccess = async (event) => {
      const cursor = event.target.result;

      if (cursor) {
        const value = cursor.value;

        if (value.ancestorFloorId === floorId_0) {
          value.ancestorFloorId = floorId_1;
          await promisifyRequest(cursor.update(value));
        } else if (value.ancestorFloorId === floorId_1) {
          value.ancestorFloorId = floorId_0;
          await promisifyRequest(cursor.update(value));
        }

        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export const updateMenuItemsInProps = (obj, floorMenuItems) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => updateMenuItemsInProps(item, floorMenuItems));
  }

  const updatedObject = { ...obj };
  for (const key in updatedObject) {
    if (updatedObject.hasOwnProperty(key)) {
      const value = updatedObject[key];
      if (key === "props" && typeof value === "object" && value.menuItems) {
        updatedObject[key] = { ...value, menuItems: floorMenuItems };
      } else {
        updatedObject[key] = updateMenuItemsInProps(value, floorMenuItems);
      }
    }
  }
  return updatedObject;
};

export const updateFloorChildComponentProps = async (floorId, props) => {
  const db = await dbManager.getDatabase();
  const transaction = db.transaction("floors", "readwrite");
  const store = transaction.objectStore("floors");
  const request = store.get(floorId);
  const floorData = await promisifyRequest(request);

  if (floorData && floorData.childComponentInfo) {
    floorData.childComponentInfo.props = {
      ...(floorData.childComponentInfo.props || {}),
      ...props,
    };
    await promisifyRequest(store.put(floorData));
  }

  await promisifyTransaction(transaction);
};
