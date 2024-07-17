import debounce from "lodash-es/debounce";

export function resizeObserver(panel_0, params) {
    let {
        panel_1,
        onPanelSizeChanged,
        observePanel1,
        debounceTime
    } = params;

    const debouncedHandler = debounce((entries) => {
        const entry = entries[0];
        if (entry.target === panel_0 || entry.target === panel_1) {
            const panelSizeInfo = {
                panel_0: panel_0.getBoundingClientRect(),
                panel_1: panel_1?.getBoundingClientRect(),
            };
            onPanelSizeChanged?.(panelSizeInfo);
        }
    }, debounceTime ?? 200); // 200ms debounce

    const observer = new ResizeObserver(debouncedHandler);
    observer.observe(panel_0);

    return {
        update(newParams) {
            if (observePanel1 && panel_1) {
                observer.unobserve(panel_1);
            }

            ({
                panel_1,
                onPanelSizeChanged,
                observePanel1,
                debounceTime
            } = newParams);

            if (observePanel1 && panel_1) {
                observer.observe(panel_1);
            }
        },
        destroy() {
            observer.unobserve(panel_0);
            if (observePanel1 && panel_1) {
                observer.unobserve(panel_1);
            }
        }
    };
}
