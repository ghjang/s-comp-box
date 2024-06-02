import FlexBox from '/build/dev/default/FlexBox.js';


const items = [
    { label: "Feature 1" },
    { label: "Feature 2" },
    { label: "Feature 3" },
    { label: "Feature 4" },
    { label: "Feature 5" }
];


const flexBoxTop = new FlexBox({
    target: document.getElementById('flex-box-top'),
    props: {
        direction: "row",

        // 'row' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 어디서부터 배치할지 결정한다.
        // 이 경우 'flex-start'로 설정하면 첫번째 'flex item'의 배치가 왼쪽 경계에서 시작해 오른쪽으로 이동한다.
        justifyContent: "flex-start",

        // 각 'flex item'의 수직 정렬 방향을 결정. 이 경우 'flex-end'로 설정하면 'flex item'이 아래쪽 정렬된다.
        alignItems: "flex-end",

        enableTrapFocus: true,

        defaultItemProps: {
            type: "tabButton",
            tabPosition: "top"
        },

        items
    }
});


const flexBoxBottom = new FlexBox({
    target: document.getElementById('flex-box-bottom'),
    props: {
        direction: "row",

        // 'row' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 어디서부터 배치할지 결정한다.
        // 이 경우 'flex-start'로 설정하면 마지막 'flex item'의 배치가 오른쪽에 경계에서 시작해 왼쪽으로 이동한다.
        justifyContent: "flex-end",
        
        // 각 'flex item'의 수직 정렬 방향을 결정. 이 경우 'flex-start'로 설정하면 'flex item'이 위쪽 정렬된다.
        alignItems: "flex-start",

        defaultItemProps: {
            type: "tabButton",
            tabPosition: "bottom"
        },

        items
    }
});


const flexBoxLeft = new FlexBox({
    target: document.getElementById('flex-box-left'),
    props: {
        direction: "column",

        // 'column' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 어디서부터 배치할지 결정한다.
        // 이 경우 'flex-end'로 설정하면 마지막 'flex item'의 배치가 최하단 경계에서 시작해 위로 올라간다.
        justifyContent: "flex-end",

        // 각 'flex item'의 수평 정렬 방향을 결정. 이 경우 'flex-end'로 설정하면 'flex item'이 오른쪽 정렬된다.
        alignItems: "flex-end",

        defaultItemProps: {
            type: "tabButton",
            tabPosition: "left"
        },

        items
    }
});


const flexBoxRight = new FlexBox({
    target: document.getElementById('flex-box-right'),
    props: {
        direction: "column",

        // 'column' 방향의 'flex-box-top' 컨테이너 영역에서 'flex item'을 어디서부터 배치할지 결정한다.
        // 이 경우 'flex-start'로 설정하면 첫번째 'flex item'의 배치가 최상단 경계에서 시작해 아래로 내려간다.
        justifyContent: "flex-start",

        // 각 'flex item'의 수평 정렬 방향을 결정. 이 경우 'flex-start'로 설정하면 'flex item'이 왼쪽 정렬된다.
        alignItems: "flex-start",

        defaultItemProps: {
            type: "tabButton",
            tabPosition: "right"
        },

        items
    }
});


window.addEventListener('beforeunload', () => flexBoxTop.$destroy());
window.addEventListener('beforeunload', () => flexBoxBottom.$destroy());
window.addEventListener('beforeunload', () => flexBoxLeft.$destroy());
window.addEventListener('beforeunload', () => flexBoxRight.$destroy());
