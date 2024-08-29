export function dragGrip(node, initialParams) {
  let params = initialParams;

  let isPointerDown = false;
  let isDragging = false;
  let startX, startY, startWidth, startHeight;

  let panel_0_display = null;
  let panel_1_display = null;

  function handlePointerDown(event) {
    event.preventDefault(); // '드래깅' 중에 '텍스트'와 같은 선택 가능한 것들이 선택되는 것을 방지
    event.stopPropagation();

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
    layerDiv.className = "top-level-layer-for-pointer-event-capture";
    layerDiv.addEventListener("pointermove", handlePointerMove);
    layerDiv.addEventListener("pointerup", handlePointerUp);
    layerDiv.addEventListener("pointercancel", handlePointerUp);
    node.appendChild(layerDiv);

    let newSize = null;
    if (params.direction === "horizontal") {
      startX = event.clientX;
      startWidth = params.panel_0.offsetWidth;
      newSize = startWidth;
    } else {
      startY = event.clientY;
      startHeight = params.panel_0.offsetHeight;
      newSize = startHeight;
    }
    params.panelSizeUpdater(newSize);

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

    isPointerDown = true;
    isDragging = false;
  }

  function handlePointerMove(event) {
    if (!isPointerDown) {
      return;
    }

    if (!isDragging) {
      const diffX = event.clientX - startX;
      const diffY = event.clientY - startY;
      if (Math.abs(diffX) === 0 && Math.abs(diffY) === 0) {
        return;
      }
      isDragging = true;
    }

    event.stopPropagation();

    const delta =
      params.direction === "horizontal"
        ? event.clientX - startX
        : event.clientY - startY;
    const newSize = `${
      (params.direction === "horizontal" ? startWidth : startHeight) + delta
    }px`;
    params.panelSizeUpdater(newSize);
  }

  function handlePointerUp(event) {
    event.stopPropagation();

    const layerDiv = node.querySelector(
      ".top-level-layer-for-pointer-event-capture"
    );
    if (layerDiv) {
      layerDiv.removeEventListener("pointermove", handlePointerMove);
      layerDiv.removeEventListener("pointerup", handlePointerUp);
      layerDiv.removeEventListener("pointercancel", handlePointerUp);
      layerDiv.remove();
    }

    if (isPointerDown) {
      if (isDragging) {
        const delta =
          params.direction === "horizontal"
            ? event.clientX - startX
            : event.clientY - startY;
        const newSize = `${
          (params.direction === "horizontal" ? startWidth : startHeight) + delta
        }px`;
        params.panelSizeUpdater(newSize);
      }

      // 숨겼던 패널 컨텐트 복원
      if (params.hidePanel) {
        // NOTE: '모나코 에디터'와 같이 자체적으로 크기를 조절하려 시도하는 요소가 포함되어 있을 경우에
        //       곧바로 패널 컨텐트를 복원하면 크기 조절이 제대로 이루어지지 않는 문제를 workaround함.
        //
        //       자식 컴포넌트에 'min-content, max-content'와 같은 크기 조절이 필요한 CSS 속성이
        //       설정되어 있는 경우에 패널 크기 조절이 제대로 안될 수도 있다.
        setTimeout(() => {
          if (params.panel_0.firstElementChild) {
            params.panel_0.firstElementChild.style.display = panel_0_display;
            panel_0_display = null;
          }
          if (params.panel_1.firstElementChild) {
            params.panel_1.firstElementChild.style.display = panel_1_display;
            panel_1_display = null;
          }
        }, 250);
      }
    }

    isPointerDown = false;
    isDragging = false;
  }

  node.addEventListener("pointerdown", handlePointerDown);

  return {
    update(newParams) {
      params = newParams;
    },
    destroy() {
      node.removeEventListener("pointerdown", handlePointerDown);
    },
  };
}
