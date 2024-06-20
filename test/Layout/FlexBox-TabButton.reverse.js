import FlexBox from '/build/dev/default/FlexBox.js';
import TabButton from '/build/dev/default/TabButton.js';


const items = [
    { label: "Feature 1" },
    { label: "Feature 2" },
    { label: "Feature 3" },
    { label: "Feature 4" },
    { label: "Feature 5" }
];

// NOTE: flex item의 '정렬' 방식이 굉장히 혼동되는 면이 있다.
//       별도로 추가한 'FlexBox'의 wrapper인 'StackPanel'을 사용해 특정 상황에서 단순하게 대상을 배치할 수 있다.

const flexBoxTop = new FlexBox({
    target: document.getElementById('flex-box-top'),
    props: {
        direction: "row",

        // 'row' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 '역순'으로 배치한다.
        // 'flex item' 자체도 '역순'으로 배치되고 'justifyContent' 속성의 의미도 '역순'으로 변경된다.
        // 결과적으로 여기서 'flex-start'의 의미는 '역순'으로 뒤바뀐 '첫번째 flex item'의 배치가
        // 오른쪽 경계에서 시작해 왼쪽으로 이동한다.
        reverse: true,
        justifyContent: "flex-start",

        // 각 'flex item'의 수직 정렬 방향을 결정. 이 경우 'flex-end'로 설정하면 'flex item'이 아래쪽 정렬된다.
        alignItems: "flex-end",

        defaultItemProps: {
            component: TabButton,
            tabPosition: "top"
        },

        items
    }
});


const flexBoxBottom = new FlexBox({
    target: document.getElementById('flex-box-bottom'),
    props: {
        direction: "row",

        // 'row' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 '역순'으로 배치한다.
        // 'flex item' 자체도 '역순'으로 배치되고 'justifyContent' 속성의 의미도 '역순'으로 변경된다.
        // 결과적으로 여기서 'flex-end'의 의미는 '역순'으로 뒤바뀐 '마지막 flex item'의 배치가
        // 왼쪽 경계에서 시작해 오른쪽으로 이동한다.
        reverse: true,
        justifyContent: "flex-end",
        
        // 각 'flex item'의 수직 정렬 방향을 결정. 이 경우 'flex-start'로 설정하면 'flex item'이 위쪽 정렬된다.
        alignItems: "flex-start",

        defaultItemProps: {
            component: TabButton,
            tabPosition: "bottom"
        },

        items
    }
});


const flexBoxLeft = new FlexBox({
    target: document.getElementById('flex-box-left'),
    props: {
        direction: "column",

        // 'column' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 '역순'으로 배치한다.
        // 'flex item' 자체도 '역순'으로 배치되고 'justifyContent' 속성의 의미도 '역순'으로 변경된다.
        // 결과적으로 여기서 'flex-end'의 의미는 '역순'으로 뒤바뀐 '마지막 flex item'의 배치가
        // 최상위 경계에서 시작해 아래로 내려간다.
        reverse: true,
        justifyContent: "flex-end",

        // 각 'flex item'의 수평 정렬 방향을 결정. 이 경우 'flex-end'로 설정하면 'flex item'이 오른쪽 정렬된다.
        alignItems: "flex-end",

        defaultItemProps: {
            component: TabButton,
            tabPosition: "left"
        },

        items
    }
});


const flexBoxRight = new FlexBox({
    target: document.getElementById('flex-box-right'),
    props: {
        direction: "column",

        // 'column' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 '역순'으로 배치한다.
        // 'flex item' 자체도 '역순'으로 배치되고 'justifyContent' 속성의 의미도 '역순'으로 변경된다.
        // 결과적으로 여기서 'flex-start'의 의미는 '역순'으로 뒤바뀐 '첫번째 flex item'의 배치가
        // 최하단 경계에서 시작해 위로 올라간다.
        reverse: true,
        justifyContent: "flex-start",

        // 각 'flex item'의 수평 정렬 방향을 결정. 이 경우 'flex-start'로 설정하면 'flex item'이 왼쪽 정렬된다.
        alignItems: "flex-start",

        defaultItemProps: {
            component: TabButton,
            tabPosition: "right"
        },

        items
    }
});


window.addEventListener('beforeunload', () => flexBoxTop.$destroy());
window.addEventListener('beforeunload', () => flexBoxBottom.$destroy());
window.addEventListener('beforeunload', () => flexBoxLeft.$destroy());
window.addEventListener('beforeunload', () => flexBoxRight.$destroy());
