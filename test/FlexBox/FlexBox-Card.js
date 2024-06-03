import FlexBox from '/build/dev/default/FlexBox.js';
import Card from '/build/dev/default/Card.js';

const flexBox = new FlexBox({
    target: document.getElementById('flex-box'),
    props: {
        direction: "row",

        items: [
            { component: Card, title: "Feature 1", body: "Feature 1 is a very useful feature.", height: "100px" },
            { component: Card, title: "Feature 2", body: "Feature 2 is a super useful feature.", height: "100px" },
            { component: Card, title: "Feature 3", body: "피처 3은 온갖 환경 조건에서도 아주 유연하게 동작할 수 있는 기능입니다." },
            { component: Card, title: "Feature 4", body: "피처 4는 피쳐 3보다 더욱 유연하게 동작할 수 있는 기능입니다. 너무 너무 좋은 기능입니다. 한번 꼭 사용해보길 권장해드립니다." },
            { component: Card, title: "Feature 5", body: "피처 5는 미친 기능입니다. 안 쓰고는 못 견디실 겁니다." },
            { component: Card, title: "Feature 6", body: "피처 6은 완벽한 기능이라할 수 있습니다." }
        ]
    }
});

window.addEventListener('beforeunload', () => flexBox.$destroy());
