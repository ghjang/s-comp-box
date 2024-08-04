const dbName = 'SCompBox';
const dbVersion = 1;

const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.errorCode);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            let objectStore;
            if (!db.objectStoreNames.contains('floors')) {
                objectStore = db.createObjectStore('floors', { keyPath: 'floorId' });
            } else {
                objectStore = request.transaction.objectStore('floors');
            }

            if (!objectStore.indexNames.contains('ancestorFloorId')) {
                objectStore.createIndex('ancestorFloorId', 'ancestorFloorId', { unique: false });
            }
        };
    });
};


const promisifyRequest = (request) => {
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const promisifyTransaction = (transaction) => {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
        transaction.onabort = (event) => reject(event.target.error);
    });
};


export const getFloorRecordCount = async () => {
    const db = await openDatabase();
    const transaction = db.transaction('floors', 'readonly');
    const objectStore = transaction.objectStore('floors');
    const countRequest = objectStore.count();
    return await promisifyRequest(countRequest);
};


export const loadFloor = async (floorId) => {
    const db = await openDatabase();
    const transaction = db.transaction(['floors']);
    const objectStore = transaction.objectStore('floors');
    const request = objectStore.get(floorId);
    return await promisifyRequest(request) ?? null;
};


export const saveFloor = async (floor, overwrite = true) => {
    const db = await openDatabase();
    const transaction = db.transaction(['floors'], 'readwrite');
    const objectStore = transaction.objectStore('floors');
    const request = overwrite ? objectStore.put(floor) : objectStore.add(floor);
    await promisifyRequest(request);
    await promisifyTransaction(transaction);
};

export const loadDescendentFloor = async (ancestorFloorId) => {
    const db = await openDatabase();
    const transaction = db.transaction(['floors'], 'readonly');
    const objectStore = transaction.objectStore('floors');
    const index = objectStore.index('ancestorFloorId');
    const request = index.getAll(ancestorFloorId);
    return await promisifyRequest(request);
};


export const removeFloor = async (floorId) => {
    const db = await openDatabase();
    const transaction = db.transaction('floors', 'readwrite');
    const objectStore = transaction.objectStore('floors');

    const deleteDescendents = async (ancestorFloorId) => {
        const index = objectStore.index('ancestorFloorId');
        const request = index.getAll(ancestorFloorId);
        const descendents = await promisifyRequest(request);

        for (const descendent of descendents) {
            await deleteDescendents(descendent.floorId);
            await promisifyRequest(objectStore.delete(descendent.floorId));
        }
    };

    const floorRequest = objectStore.get(floorId);
    const floor = await promisifyRequest(floorRequest);

    if (floor) {
        await deleteDescendents(floorId);
        await promisifyRequest(objectStore.delete(floorId));
    }

    await promisifyTransaction(transaction);
};


export const swapFloorData = async (floorId_0, floorId_1, splitterInfo) => {
    const db = await openDatabase();
    const transaction = db.transaction('floors', 'readwrite');
    const store = transaction.objectStore('floors');

    const floorData_0 = await promisifyRequest(store.get(floorId_0));
    const floorData_1 = await promisifyRequest(store.get(floorId_1));

    if (floorData_0 && floorData_1) {
        // Swap the fields except the keys
        const temp = { ...floorData_0 };
        Object.keys(floorData_0).forEach(key => {
            if (key !== 'floorId' && key !== 'nonFloorParentInfo') {
                floorData_0[key] = floorData_1[key];
                floorData_1[key] = temp[key];
            }
        });

        await promisifyRequest(store.put(floorData_0));
        await promisifyRequest(store.put(floorData_1));

        await swapAncestorFloorId(store, floorId_0, floorId_1);
    } else if (floorData_0) {
        floorData_0.floorId = floorId_1;
        delete floorData_0.nonFloorParentInfo.component_0;
        floorData_0.nonFloorParentInfo.component_1 = splitterInfo.props.component_1;
        await promisifyRequest(store.delete(floorId_0));
        await promisifyRequest(store.put(floorData_0));

        await swapAncestorFloorId(store, floorId_0, floorId_1);
    } else if (floorData_1) {
        floorData_1.floorId = floorId_0;
        delete floorData_1.nonFloorParentInfo.component_1;
        floorData_1.nonFloorParentInfo.component_0 = splitterInfo.props.component_0;
        await promisifyRequest(store.delete(floorId_1));
        await promisifyRequest(store.put(floorData_1));

        await swapAncestorFloorId(store, floorId_0, floorId_1);
    }

    await promisifyTransaction(transaction);
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
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => updateMenuItemsInProps(item, floorMenuItems));
    }

    const updatedObject = { ...obj };
    for (const key in updatedObject) {
        if (updatedObject.hasOwnProperty(key)) {
            const value = updatedObject[key];
            if (key === 'props' && typeof value === 'object' && value.menuItems) {
                updatedObject[key] = { ...value, menuItems: floorMenuItems };
            } else {
                updatedObject[key] = updateMenuItemsInProps(value, floorMenuItems);
            }
        }
    }
    return updatedObject;
};
