export function dragGrip(node, initialParams) {
  let params = initialParams;

  let isMouseDown = false;
  let isDragging = false;
  let startX, startY, startWidth, startHeight;

  let panel_0_display = null;
  let panel_1_display = null;

  function handleMousedown(event) {
    // '드래깅' 중에 '텍스트'와 같은 선택 가능한 것들이 선택되는 것을 방지
    event.preventDefault();

    // NOTE: 'WebView'등의 컴포넌트에 '복잡한 내용', 특히 '마우스 이동' 이벤트를 처리하는 로직이
    //       포함되어 있는 경우 '스플리터 그립'쪽에 이벤트가 전달되지 않아 '그립 드래깅'이 제대로
    //       동작하지 않은 문제 workaround함.
    //
    // 명시적으로 'false'로 설정한 경우가 아닌 경우에 '탑 레벨 더미 레이어'를 사용하여
    // '마우스 이동' 이벤트를 캡처하도록 함.
    if (params.useTopLevelLayerMouseMoveEventCapture !== false) {
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
      layerDiv.className = "top-level-layer-for-mousemove-event-capture";
      layerDiv.addEventListener("mousemove", handleMousemove);
      layerDiv.addEventListener("mouseup", handleMouseup);
      node.appendChild(layerDiv);
    }

    // NOTE: 이 블럭에서 해제한 'min-width'와 'max-width' 설정값은 '마우스업' 이벤트후에
    //       스벨트의 반응성 블럭 코드에 의해서 다시 설정된다.
    if (params.direction === "horizontal") {
      startX = event.clientX;
      startWidth = params.panel_0.offsetWidth;

      // min-width와 max-width 설정값 해제
      params.panel_0.style.minWidth = "0";
      params.panel_0.style.maxWidth = "none";
    } else {
      startY = event.clientY;
      startHeight = params.panel_0.offsetHeight;

      // min-height와 max-height 설정값 해제
      params.panel_0.style.minHeight = "0";
      params.panel_0.style.maxHeight = "none";
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

    isMouseDown = true;
    isDragging = false;
  }

  function handleMousemove(event) {
    if (!isMouseDown) {
      return;
    }

    if (!isDragging) {
      const diffX = event.clientX - startX;
      const diffY = event.clientY - startY;
      if (Math.abs(diffX) > 0 || Math.abs(diffY) > 0) {
        isDragging = true;
      } else {
        return;
      }
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

  function handleMouseup(event) {
    if (params.useTopLevelLayerMouseMoveEventCapture !== false) {
      event.stopPropagation();

      const layerDiv = node.querySelector(
        ".top-level-layer-for-mousemove-event-capture"
      );
      if (layerDiv) {
        layerDiv.removeEventListener("mousemove", handleMousemove);
        layerDiv.removeEventListener("mouseup", handleMouseup);
        layerDiv.remove();
      }
    }

    if (isMouseDown) {
      if (isDragging) {
        if (params.direction === "horizontal") {
          const dx = event.clientX - startX;
          params.panel_0.style.width = `${startWidth + dx}px`;
        } else {
          const dy = event.clientY - startY;
          params.panel_0.style.height = `${startHeight + dy}px`;
        }
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

    isMouseDown = false;
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
