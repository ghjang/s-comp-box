export function resizeObserver(panel_0, params) {
    let currentParams = params;

    const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry.target === panel_0) {
            const panelSizeInfo = {
                panel_0: panel_0.getBoundingClientRect(),
                panel_1: currentParams.panel_1.getBoundingClientRect(),
            };
            currentParams.onPanelSizeChanged(panelSizeInfo);
        }
    });

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
