export function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fetch(filePath, { method: "HEAD" })
      .then((response) => resolve(response.status !== 404))
      .catch(() => resolve(false));
  });
}

export function loadScript(
  scriptPath,
  ignoreIfNotFound = false,
  isModule = true
) {
  return new Promise((resolve, reject) => {
    const existingScript = document.head.querySelector(
      `script[src="${scriptPath}"]`
    );
    if (existingScript) {
      resolve();
      return;
    }

    fetch(scriptPath, { method: "HEAD" })
      .then((response) => {
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
          scriptElem.onerror = () =>
            reject(new Error(`Failed to load script: ${scriptPath}`));

          document.head.appendChild(scriptElem);
        }
      })
      .catch((error) => {
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

        if (Class && typeof Class === "function" && Class.prototype) {
          resolve(Class);
        } else {
          reject(
            new Error(
              `Class ${className} not found or is not a valid class in module ${modulePath}`
            )
          );
        }
      })
      .catch((error) => {
        console.error(
          `Failed to load class ${className} from module ${modulePath}:`,
          error
        );
        reject(error);
      });
  });
}

export function deepCopy(obj) {
  if (typeof structuredClone === "function") {
    // structuredClone이 지원되는 경우 (ECMAScript 2022부터 도입)
    return structuredClone(obj);
  } else {
    // structuredClone이 지원되지 않는 경우
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.warn("깊은 복사 중 오류 발생:", error);
      return obj; // 복사 실패 시 원본 객체 반환
    }
  }
}

export function cLog(...args) {
  const processedArgs = args.map((arg) =>
    typeof arg === "object" && arg !== null ? deepCopy(arg) : arg
  );
  console.log(...processedArgs);
}

export function diffObj(obj1, obj2, isRoot = true) {
  if (obj1 === obj2) return isRoot ? {} : undefined;

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const result = [];
    for (let i = 0; i < Math.max(obj1.length, obj2.length); i++) {
      const diff = diffObj(obj1[i], obj2[i], false);
      if (diff !== undefined) {
        result[i] = diff;
      }
    }
    return result.length > 0 ? result : undefined;
  }

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return `${formatValue(obj1)} => ${formatValue(obj2)}`;
  }

  const result = {};
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (key === "__proto__" || key === "constructor" || key === "prototype")
      continue;

    if (!(key in obj1)) {
      result[key] = `undefined => ${formatValue(obj2[key])}`;
    } else if (!(key in obj2)) {
      result[key] = `${formatValue(obj1[key])} => undefined`;
    } else {
      const diff = diffObj(obj1[key], obj2[key], false);
      if (diff !== undefined) {
        result[key] = diff;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function cDiffObj(obj1, obj2, message = "") {
  const diff = compareObjects(obj1, obj2);
  if (diff !== undefined) {
    console.log(message);
    console.log(JSON.stringify(diff, null, 2));
  }
}

function compareObjects(obj1, obj2) {
  if (obj1 === obj2) return undefined;

  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return `${formatValue(obj1)} => ${formatValue(obj2)}`;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return compareArrays(obj1, obj2);
  }

  const result = {};
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (!(key in obj2)) {
      result[key] = `${formatValue(obj1[key])} => undefined`;
    } else if (!(key in obj1)) {
      result[key] = `undefined => ${formatValue(obj2[key])}`;
    } else {
      const nestedDiff = compareObjects(obj1[key], obj2[key]);
      if (nestedDiff !== undefined) {
        result[key] = nestedDiff;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function compareArrays(arr1, arr2) {
  const result = {};
  const maxLength = Math.max(arr1.length, arr2.length);

  for (let i = 0; i < maxLength; i++) {
    if (i >= arr1.length) {
      result[i] = `undefined => ${formatValue(arr2[i])}`;
    } else if (i >= arr2.length) {
      result[i] = `${formatValue(arr1[i])} => undefined`;
    } else {
      const nestedDiff = compareObjects(arr1[i], arr2[i]);
      if (nestedDiff !== undefined) {
        result[i] = nestedDiff;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function formatValue(value) {
  if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else if (typeof value === "string") {
    return `'${value}'`;
  } else if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`;
  } else if (typeof value === "object") {
    return "{...}";
  } else {
    return `${typeof value}(${String(value)})`;
  }
}
