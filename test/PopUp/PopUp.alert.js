
import PopUp from '/build/dev/default/PopUp.js';

let popUp = new PopUp({
    target: document.getElementById('container'),
    props: {
        kind: "alert",
        title: 'Title',
        content: "'alert' 팝업 컨텐트 테스트입니다.\n줄 분리 테스트입니다.\n생각보다 괜찮은 결과가 나온 것 같네요. 좋습니다.",
    }
});

popUp.$on('buttonClicked', (e) => {
    const { text, value } = e.detail;
    console.log(`Button Clicked: ${text} (${value})`);
    popUp.$destroy();
    popUp = null;
});

window.addEventListener("beforeunload", () => popUp?.$destroy());
