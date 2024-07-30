const dbName = 'SCompBox';


// IndexedDB 데이터베이스 열기 및 객체 저장소 생성
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('floors')) {
                db.createObjectStore('floors', { keyPath: 'floorId' });
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


export const getFloor = async (floorId) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['floors']);
        const objectStore = transaction.objectStore('floors');
        const request = objectStore.get(floorId);

        request.onsuccess = (event) => {
            resolve(event.target.result);
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


// 함수가 설정된 속성을 제거하는 함수
export const removeUnserializableProperties = (obj, printLog = true, keyPath = []) => {
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

                plainObject[key] = `removed function: ${value.name}`;
            } else {
                plainObject[key] = removeUnserializableProperties(value, printLog, keyPath.concat(key));
            }
        }
    }
    return plainObject;
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


