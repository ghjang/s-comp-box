const dbName = 'SCompBox';
const dbVersion = 1;

const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

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

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.errorCode);
        };
    });
};


export const getFloorRecordCount = async () => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('floors', 'readonly');
        const objectStore = transaction.objectStore('floors');
        const countRequest = objectStore.count();

        countRequest.onsuccess = () => {
            resolve(countRequest.result);
        };

        countRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
};


export const loadFloor = async (floorId) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['floors']);
        const objectStore = transaction.objectStore('floors');
        const request = objectStore.get(floorId);

        request.onsuccess = (event) => {
            const result = event.target.result ?? null;
            resolve(result);
        };

        request.onerror = (event) => {
            reject('Error getting floor: ' + event.target.errorCode);
        };
    });
};


export const saveFloor = async (floor, overwrite = true) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['floors'], 'readwrite');
        const objectStore = transaction.objectStore('floors');

        if (overwrite) {
            // overwrite가 true인 경우, 기존 데이터를 덮어쓰기
            const putRequest = objectStore.put(floor);
            putRequest.onsuccess = () => {
                resolve('Floor saved successfully');
            };
            putRequest.onerror = (event) => {
                reject(`Error saving floor: ${event.target.errorCode}`);
            };
        } else {
            // 기존 키가 존재하는지 확인
            const getRequest = objectStore.get(floor.floorId);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    // 키가 존재하면 저장하지 않음
                    reject(`Error: Floor with ID '${floor.floorId}' already exists.`);
                } else {
                    // 키가 존재하지 않으면 저장
                    const putRequest = objectStore.put(floor);
                    putRequest.onsuccess = () => {
                        resolve('Floor saved successfully');
                    };
                    putRequest.onerror = (event) => {
                        reject(`Error saving floor: ${event.target.errorCode}`);
                    };
                }
            };
            getRequest.onerror = (event) => {
                reject(`Error checking floor existence: ${event.target.errorCode}`);
            };
        }
    });
};

export const loadDescendentFloor = async (ancestorFloorId) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['floors'], 'readonly');
        const objectStore = transaction.objectStore('floors');
        const index = objectStore.index('ancestorFloorId');
        const request = index.getAll(ancestorFloorId);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};


export const removeFloor = async (floorId) => {
    const db = await openDatabase();
    const transaction = db.transaction('floors', 'readwrite');
    const objectStore = transaction.objectStore('floors');

    const deleteDescendents = async (ancestorFloorId) => {
        return new Promise((resolve, reject) => {
            const index = objectStore.index('ancestorFloorId');
            const request = index.getAll(ancestorFloorId);

            request.onsuccess = async (event) => {
                const descendents = event.target.result;
                for (const descendent of descendents) {
                    await deleteDescendents(descendent.floorId);
                    objectStore.delete(descendent.floorId);
                }
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    };

    // Check if the floorId exists
    const floorRequest = objectStore.get(floorId);
    const floorExists = await new Promise((resolve, reject) => {
        floorRequest.onsuccess = (event) => {
            resolve(!!event.target.result);
        };
        floorRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });

    if (floorExists) {
        await deleteDescendents(floorId);
        objectStore.delete(floorId);
    }

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// 함수가 설정된 속성을 제거하는 함수
export const removeUnserializableProperties = (obj, printLog = false, keyPath = []) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item, index) => {
            removeUnserializableProperties(item, printLog, keyPath.concat(`[${index}]`))
        });
    }

    const plainObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'function') {
                if (printLog) {
                    const keyPathStr = keyPath.concat(key).join('.').replace(/\.\[/g, '[');
                    console.log(`removing function with key: '${keyPathStr}' and function name: '${value.name}'`);
                }

                plainObject[key] = `removed: ${value.name}`;
            } else {
                plainObject[key] = removeUnserializableProperties(value, printLog, keyPath.concat(key));
            }
        }
    }
    return plainObject;
};


export const restoreUnserializableProperties = async (obj, scriptBase, printLog = false, keyPath = []) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return Promise.all(obj.map((item, index) => {
            return restoreUnserializableProperties(item, scriptBase, printLog, keyPath.concat(`[${index}]`));
        }));
    }

    const restoredObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'string' && value.startsWith('removed: ')) {
                const className = value.replace('removed: ', '');
                const keyPathStr = keyPath.concat(key).join('.').replace(/\.\[/g, '[');

                if (printLog) {
                    console.log(`restoring function with key: '${keyPathStr}' and class name: '${className}'`);
                }

                const module = await import(`${scriptBase}/${className}.js`);
                restoredObject[key] = module[className] || module.default;
            } else {
                restoredObject[key] = await restoreUnserializableProperties(value, scriptBase, printLog, keyPath.concat(key));
            }
        }
    }
    return restoredObject;
};


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


// NOTE: IndexDB에 직접 저장할 수 없는 '클래스, 함수'등을 속성으로 가지는 객체를 저장할 때 사용
export const classToPlainObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(classToPlainObject);
    }

    const plainObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            plainObject[key] = classToPlainObject(obj[key]);
        }
    }
    return plainObject;
};


// 클래스 인스턴스를 문자열 이름으로 변환하는 함수
export const replaceClassInstancesWithNames = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(replaceClassInstancesWithNames);
    }

    const plainObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'object' && value.constructor && value.constructor.name) {
                plainObject[key] = value.constructor.name;
            } else {
                plainObject[key] = replaceClassInstancesWithNames(value);
            }
        }
    }
    return plainObject;
};
