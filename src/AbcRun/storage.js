import debounce from "lodash-es/debounce";

export function saveToLocalStorage(key, value) {
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
}

export function createLocalStorageDebouncedSaver(key, debounceTime = 3000) {
    return debounce((value) => {
        saveToLocalStorage(key, value);
    }, debounceTime);
}

export function loadFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    if (value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            // 'value'가 유효한 JSON 문자열이 아닌 경우에 원래 문자열을 그대로 반환
            return value;
        }
    }
    return null;
}
