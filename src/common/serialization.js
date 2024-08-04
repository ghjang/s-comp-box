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
