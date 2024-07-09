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
                const Class = module[className];
                if (Class) {
                    resolve(Class);
                } else {
                    reject(new Error(`Class ${className} not found in module ${modulePath}`));
                }
            })
            .catch((error) => {
                console.error(`Failed to load class ${className} from module ${modulePath}:`, error);
                reject(error);
            });
    });
}
