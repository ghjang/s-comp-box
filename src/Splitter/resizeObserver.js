import debounce from "lodash-es/debounce";

export function resizeObserver(panel_0, params) {
  let { panel_1, onPanelSizeChanged, observePanel1, debounceTime } = params;

  const debouncedHandler = debounce((entries) => {
    const entry = entries[0];
    if (entry.target === panel_0 || entry.target === panel_1) {
      const container = (
        panel_0 || panel_1
      ).parentElement.getBoundingClientRect();

      // NOTE: 패널이 화면에 보이는지 확인한다.
      //       'Tab' 컴포넌트의 특정 탭에 'Splitter' 컴포넌트가 추가된 후에
      //       스플리터가 추가된 탭이 아닌 다른 탭이 활성화 되었을때 등의 상황에서
      //       잘못된 스플리터 크기 업데이트가 일어나지 않게 하기 위함이다.
      const isVisible = container.width > 0 && container.height > 0;

      if (isVisible) {
        const panelSizeInfo = {
          container,
          panel_0: panel_0.getBoundingClientRect(),
          panel_1: panel_1?.getBoundingClientRect(),
        };
        onPanelSizeChanged?.(panelSizeInfo);
      }
    }
  }, debounceTime ?? 200); // 200ms debounce

  const observer = new ResizeObserver(debouncedHandler);
  observer.observe(panel_0);

  return {
    update(newParams) {
      if (observePanel1 && panel_1) {
        observer.unobserve(panel_1);
      }

      ({ panel_1, onPanelSizeChanged, observePanel1, debounceTime } =
        newParams);

      if (observePanel1 && panel_1) {
        observer.observe(panel_1);
      }
    },
    destroy() {
      observer.unobserve(panel_0);
      if (observePanel1 && panel_1) {
        observer.unobserve(panel_1);
      }
    },
  };
}
