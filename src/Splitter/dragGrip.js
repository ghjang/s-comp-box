export function dragGrip(node, initialParams) {
    let params = initialParams;
    
    let isDragging = false;
    let startX, startY, startWidth, startHeight;

    let panel_0_display = null;
    let panel_1_display = null;

    function handleMousedown(event) {
        // '드래깅' 중에 '텍스트'와 같은 선택 가능한 것들이 선택되는 것을 방지
        event.preventDefault();

        isDragging = true;

        if (params.panel_0.firstElementChild) {
            panel_0_display = params.panel_0.firstElementChild.style.display;
            params.panel_0.firstElementChild.style.display = "none";
        }
        if (params.panel_1.firstElementChild) {
            panel_1_display = params.panel_1.firstElementChild.style.display;
            params.panel_1.firstElementChild.style.display = "none";
        }

        if (params.direction === "horizontal") {
            startX = event.clientX;
            startWidth = params.panel_0.offsetWidth;
        } else {
            startY = event.clientY;
            startHeight = params.panel_0.offsetHeight;
        }
    }

    function handleMousemove(event) {
        if (!isDragging) {
            return;
        }

        if (params.direction === "horizontal") {
            const dx = event.clientX - startX;
            params.panel_0.style.width = `${startWidth + dx}px`;
        } else {
            const dy = event.clientY - startY;
            params.panel_0.style.height = `${startHeight + dy}px`;
        }
    }

    function handleMouseup() {
        isDragging = false;

        if (params.panel_0.firstElementChild) {
            params.panel_0.firstElementChild.style.display = panel_0_display;
            panel_0_display = null;
        }
        if (params.panel_1.firstElementChild) {
            params.panel_1.firstElementChild.style.display = panel_1_display;
            panel_1_display = null;
        }
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
