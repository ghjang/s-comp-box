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

        if (params.direction === "horizontal") {
            startX = event.clientX;
            startWidth = params.panel_0.offsetWidth;
        } else {
            startY = event.clientY;
            startHeight = params.panel_0.offsetHeight;
        }

        // '드래깅' 중에 패널 컨텐트 숨김
        if (params.hidePanel) {
            if (params.panel_0.firstElementChild) {
                panel_0_display = params.panel_0.firstElementChild.style.display;
                params.panel_0.firstElementChild.style.display = "none";
            }
            if (params.panel_1.firstElementChild) {
                panel_1_display = params.panel_1.firstElementChild.style.display;
                params.panel_1.firstElementChild.style.display = "none";
            }
        }

        // NOTE: 'WebView'등의 컴포넌트에 '복잡한 내용', 특히 '마우스 이동' 이벤트를 처리하는 로직이
        //       포함되어 있는 경우 '스플리터 그립'쪽에 이벤트가 전달되지 않아 '그립 드래깅'이 제대로
        //       동작하지 않은 문제 workaround함.
        //
        // 명시적으로 'false'로 설정한 경우가 아닌 경우에 '탑 레벨 더미 레이어'를 사용하여
        // '마우스 이동' 이벤트를 캡처하도록 함.
        if (params.useTopLevelLayerMouseMoveEventCapture !== false) {
            const layerDiv = document.createElement("div");
            layerDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                margin: 0;
                padding: 0;
                z-index: 9999;
            `;
            layerDiv.id = "top-level-layer-for-mousemove-event-capture";
            layerDiv.addEventListener("mousemove", handleMousemove);
            node.appendChild(layerDiv);
        }
    }

    function handleMousemove(event) {
        if (!isDragging) {
            return;
        }

        if (params.useTopLevelLayerMouseMoveEventCapture !== false) {
            event.stopPropagation();
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

        // 숨겼던 패널 컨텐트 복원
        if (params.hidePanel) {
            if (params.panel_0.firstElementChild) {
                params.panel_0.firstElementChild.style.display = panel_0_display;
                panel_0_display = null;
            }
            if (params.panel_1.firstElementChild) {
                params.panel_1.firstElementChild.style.display = panel_1_display;
                panel_1_display = null;
            }
        }

        if (params.useTopLevelLayerMouseMoveEventCapture !== false) {
            const layerDiv = document.getElementById("top-level-layer-for-mousemove-event-capture");
            if (layerDiv) {
                layerDiv.removeEventListener("mousemove", handleMousemove);
                layerDiv.remove();
            }
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
