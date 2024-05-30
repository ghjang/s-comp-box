
import PopUp from '/build/dev/default/PopUp.js';

let popUp = new PopUp({
    target: document.getElementById('container'),
    props: {
        kind: "custom",
        title: 'Title',
        content: "'custom' 팝업 컨텐트 테스트입니다."
    }
});

popUp.$on('buttonClicked', (e) => {
    const { text, value } = e.detail;
    console.log(`Button Clicked: ${text} (${value})`);
    popUp.$destroy();
    popUp = null;
});

window.addEventListener("beforeunload", () => popUp?.$destroy());
