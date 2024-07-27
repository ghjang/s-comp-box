export function fileExists(filePath) {
    return new Promise((resolve, reject) => {
        fetch(filePath, { method: 'HEAD' })
            .then(response => resolve(response.status !== 404))
            .catch(() => resolve(false));
    });
}

export function loadScript(scriptPath, ignoreIfNotFound = false, isModule = true) {
    return new Promise((resolve, reject) => {
        const existingScript = document.head.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) {
            resolve();
            return;
        }

        fetch(scriptPath, { method: 'HEAD' })
            .then(response => {
                if (response.status === 404) {
                    if (ignoreIfNotFound) {
                        console.warn(`Script not found: ${scriptPath}`);
                        resolve();
                    } else {
                        throw new Error(`Script not found: ${scriptPath}`);
                    }
                } else {
                    const scriptElem = document.createElement("script");
                    if (isModule) {
                        scriptElem.type = "module";
                    }
                    scriptElem.src = scriptPath;

                    scriptElem.onload = () => resolve();
                    scriptElem.onerror = () => reject(new Error(`Failed to load script: ${scriptPath}`));

                    document.head.appendChild(scriptElem);
                }
            })
            .catch(error => {
                if (ignoreIfNotFound) {
                    console.warn(error.message);
                    resolve();
                } else {
                    reject(error);
                }
            });
    });
}

export function loadClassFromModule(modulePath, className) {
    return new Promise((resolve, reject) => {
        import(modulePath)
            .then((module) => {
                // NOTE: 'module.default.name' 값은 '번들링 최적화'시에 원래의 이름이 아닌 변경된 (짧게 축소된) 이름이 나올 수 있어서
                //       'className'과 일치하지 않을 수 있다.

                const Class = module[className] || module.default;

                if (Class && typeof Class === 'function' && Class.prototype) {
                    resolve(Class);
                } else {
                    reject(new Error(`Class ${className} not found or is not a valid class in module ${modulePath}`));
                }
            })
            .catch((error) => {
                console.error(`Failed to load class ${className} from module ${modulePath}:`, error);
                reject(error);
            });
    });
}
