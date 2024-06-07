import ComponentMapper from '/build/dev/default/ComponentMapper.js';

const gSCompMapperTargetElem = document.getElementById("gSCompMapper") ?? document.createElement("div");
gSCompMapperTargetElem.id = "gSCompMapper";
gSCompMapperTargetElem.style.display = "none";
document.body.appendChild(gSCompMapperTargetElem);

const gSCompMapper = new ComponentMapper({ target: gSCompMapperTargetElem });

window.gSCompMapper = gSCompMapper;
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

            // NOTE: 기본 export(컴포넌트 클래스)를 등록한다.
            //
            //       'module.default', 여기서 '클래스 명'이 'production' 빌드환경에서
            //       원래의 클래스 이름이 아닌 '단축된 이름'으로 변경되기 때문에 클래스 이름 문자열을
            //       첫번째 인자로 명시적으로 전달한다.
            //
            //       참고로 'import XXX from "YYY";'와 같은 형태로 사용할 경우에
            //       'XXX' 부분은 'default export' 부분을 '이름을 XXX 바꾸어 참조'한다는 의미이다.
            //       즉 'module.default'에 대한 'alias' 지정 문법이라는 것이다.
            //       단순히 alias를 지정하는 것이기 때문에 엉뚱한 이름으로 지정할 수 있는 경우가 있어
            //       주의할 필요가 있다.
            gSCompMapper.registerComponent(componentName, module.default);
            //console.log(`Component '${componentName}' has been loaded and registered.`);
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
        }
    }
}


// 컴포넌트 로딩 및 등록
await loadAndRegisterComponents();
