export class CustomEventsRegister {
    #unregisters = [];
    customEvents = [];

    constructor(dispatch, component, detailHandler = null, queryContainerInfoHandler = null) {
        if (!dispatch || !typeof dispatch === "function") {
            throw new Error("dispatch must be a function.");
        }

        if (!component) {
            throw new Error("component must be an object.");
        }

        if (!component.customEvents) {
            // 등록할 커스텀 이벤트가 없을 경우 아무것도 하지 않음.
            return;
        }

        if (!Array.isArray(component.customEvents)) {
            throw new Error("customEvents must be an array.");
        }

        if (detailHandler && !typeof detailHandler === "function") {
            throw new Error("detailHandler must be a function.");
        }

        if (queryContainerInfoHandler && !typeof queryContainerInfoHandler === "function") {
            throw new Error("queryContainerInfoHandler must be a function.");
        }

        this.customEvents = [...component.customEvents];

        component.customEvents.forEach((eventName) => {
            if (eventName === "queryContainerInfo") {
                const unregister = component.$on(eventName, (event) => {
                    const callback = event.detail.infoCallback;
                    if (typeof callback === "function") {
                        queryContainerInfoHandler?.(callback, component);
                    } else {
                        throw new Error("queryContainerInfo event must have a 'infoCallback' function in the detail object.");
                    }
                });
                this.#unregisters.push(unregister);
            } else {
                const unregister = component.$on(eventName, (event) => {
                    const bubble = event.detail.bubble || {};
                    bubble.chain = bubble.chain || [];

                    bubble.chain.push(component);
                    bubble.forwardingDetail = bubble.forwardingDetail || event.detail;
                    bubble.detail = detailHandler?.(eventName, bubble, component);

                    dispatch(eventName, { bubble });
                });
                this.#unregisters.push(unregister);
            }
        });
    }

    unregister() {
        this.#unregisters.forEach((unregister) => {
            unregister();
        });
    }
}


export function combineCustomEvents(...customEvents) {
    const combinedArray = customEvents.flat();
    return [...new Set(combinedArray)];
}
