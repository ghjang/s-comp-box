import ComponentMapper from '/build/dev/default/ComponentMapper.js';

const gSCompMapperTargetElem = document.getElementById("gSCompMapper") ?? document.createElement("div");
gSCompMapperTargetElem.id = "gSCompMapper";
gSCompMapperTargetElem.style.display = "none";
document.body.appendChild(gSCompMapperTargetElem);

const gSCompMapper = new ComponentMapper({ target: gSCompMapperTargetElem });

window.addEventListener("beforeunload", () => gSCompMapper?.$destroy());


async function loadAndRegisterComponents() {
    const response = await fetch('/build/dev/default/s-comp.list.txt');
    if (!response.ok) {
        console.error(`Failed to load component list: ${response.status} ${response.statusText}`);
        return;
    }

    const text = await response.text();
    const componentNames
        = text.split('\n')
            .map(componentName => componentName.trim())
            .filter(componentName => componentName !== '');

    // 각 컴포넌트 이름에 대해 동적 임포트를 수행하고, 컴포넌트를 등록
    for (let componentName of componentNames) {
        try {
            const module = await import(`/build/dev/default/${componentName}.js`);

            // 기본 export(컴포넌트 클래스)를 등록
            gSCompMapper.registerComponent(module.default);
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
        }
    }
}


// 컴포넌트 로딩 및 등록
await loadAndRegisterComponents();
