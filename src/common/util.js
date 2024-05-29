export function loadScript(scriptPath, isModule = true) {
    const scriptElem = document.createElement("script");
    if (isModule) {
        scriptElem.type = "module";
    }
    scriptElem.src = scriptPath;
    document.head.appendChild(scriptElem);
}
