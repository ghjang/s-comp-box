export function preventOverscroll(node) {
    function handleWheel(event) {
        // 스크롤 방향이 아래이고 스크롤이 맨 아래에 도달한 경우
        const isScrollingDownAtBottom =
            event.deltaY > 0 &&
            node.scrollHeight - node.scrollTop === node.clientHeight;

        // 스크롤 방향이 위이고 스크롤이 맨 위에 도달한 경우
        const isScrollingUpAtTop = event.deltaY < 0 && node.scrollTop === 0;

        if (isScrollingDownAtBottom || isScrollingUpAtTop) {
            event.preventDefault();
        }
    }

    node.addEventListener('wheel', handleWheel);

    return {
        destroy() {
            node.removeEventListener('wheel', handleWheel);
        }
    };
}