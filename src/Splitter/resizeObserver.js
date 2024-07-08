import debounce from "lodash-es/debounce";

export function resizeObserver(panel_0, params) {
    let currentParams = params;

    const debouncedHandler = debounce((entries) => {
        const entry = entries[0];
        if (entry.target === panel_0) {
            const panelSizeInfo = {
                panel_0: panel_0.getBoundingClientRect(),
                panel_1: currentParams.panel_1.getBoundingClientRect(),
            };
            currentParams.onPanelSizeChanged(panelSizeInfo);
        }
    }, 100); // 100ms debounce

    const observer = new ResizeObserver(debouncedHandler);
    observer.observe(panel_0);

    return {
        update(newParams) {
            currentParams = newParams;
        },
        destroy() {
            observer.unobserve(panel_0);
        }
    };
}
