export function draggable(node, initialParams) {
    let params = initialParams;
    
    let isDragging = false;
    let startX, startY, startWidth, startHeight;

    function handleMousedown(event) {
        // '드래깅' 중에 '텍스트'와 같은 선택 가능한 것들이 선택되는 것을 방지
        event.preventDefault();

        isDragging = true;
        if (params.direction === "horizontal") {
            startX = event.clientX;
            startWidth = params.panel.offsetWidth;
        } else {
            startY = event.clientY;
            startHeight = params.panel.offsetHeight;
        }
    }

    function handleMousemove(event) {
        if (!isDragging) return;
        if (params.direction === "horizontal") {
            const dx = event.clientX - startX;
            params.panel.style.width = `${startWidth + dx}px`;
        } else {
            const dy = event.clientY - startY;
            params.panel.style.height = `${startHeight + dy}px`;
        }
    }

    function handleMouseup() {
        isDragging = false;
    }

    node.addEventListener("mousedown", handleMousedown);
    window.addEventListener("mousemove", handleMousemove);
    window.addEventListener("mouseup", handleMouseup);

    return {
        update(newParams) {
            params = newParams;
        },
        destroy() {
            node.removeEventListener("mousedown", handleMousedown);
            window.removeEventListener("mousemove", handleMousemove);
            window.removeEventListener("mouseup", handleMouseup);
        },
    };
}
