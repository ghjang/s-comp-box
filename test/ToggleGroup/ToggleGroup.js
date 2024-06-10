import ToggleGroup from '/build/dev/default/ToggleGroup.js';

const radioButtonGroup = new ToggleGroup({
    target: document.getElementById("radioButtonContainer"),
    props: {
        items: [
            {
                "component": "RadioButton",
                "props": {
                    "label": "Radio Button 1",
                    "value": "radio1"
                }
            },
            {
                "component": "RadioButton",
                "props": {
                    "label": "Radio Button 2",
                    "value": "radio2"
                }
            },
            {
                "component": "RadioButton",
                "props": {
                    "label": "Radio Button 3",
                    "value": "radio3"
                }
            }
        ]

    }
});

radioButtonGroup.$on("toggleItemChanged", (event) => {
    console.log("toggleItemChanged", event.detail);
});

window.addEventListener("beforeunload", () => radioButtonGroup?.$destroy());
