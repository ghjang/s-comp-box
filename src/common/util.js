export function loadScript(scriptPath, isModule = true) {
    return new Promise((resolve, reject) => {
        const existingScript = document.head.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) {
            resolve();
            return;
        }

        const scriptElem = document.createElement("script");
        if (isModule) {
            scriptElem.type = "module";
        }
        scriptElem.src = scriptPath;

        scriptElem.onload = () => resolve();
        scriptElem.onerror = () => reject(new Error(`Failed to load script: ${scriptPath}`));

        document.head.appendChild(scriptElem);
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
