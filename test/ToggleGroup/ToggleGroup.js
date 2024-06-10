import ToggleGroup from '/build/dev/default/ToggleGroup.js';


//==== Radio Button Group
const radioButtonGroup = new ToggleGroup({
    target: document.getElementById("radioButtonContainer"),
    props: {
        items: [
            {
                component: "RadioButton",
                label: "Radio Button 1",
                value: "radio1"
            },
            {
                component: "RadioButton",
                label: "Radio Button 2",
                value: "radio2"
            },
            {
                component: "RadioButton",
                label: "Radio Button 3",
                value: "radio3"
            }
        ]

    }
});

radioButtonGroup.$on("toggleItemChanged", (event) => {
    console.log("toggleItemChanged", event.detail);
});

window.addEventListener("beforeunload", () => radioButtonGroup?.$destroy());


//==== Tab Button Group
const defaultTabButtonItemPropsTop = {
    component: "TabButton",
    tabPosition: "top"
};

const defaultTabButtonItemPropsBottom = {
    component: "TabButton",
    tabPosition: "bottom"
};

const defaultTabButtonItemPropsLeft = {
    component: "TabButton",
    tabPosition: "left"
};

const defaultTabButtonItemPropsRight = {
    component: "TabButton",
    tabPosition: "right"
};


const tabButtonItems = [
    {
        label: "Tab Button 1",
        value: "tab1"
    },
    {
        label: "Tab Button 2",
        value: "tab2"
    },
    {
        label: "Tab Button 3",
        value: "tab3"
    }
];

const tabButtonGroupTop = new ToggleGroup({
    target: document.getElementById("tabButtonContainerTop"),
    props: {
        direction: "horizontal",
        hAlign: "left",
        vAlign: "bottom",
        trapFocus: true,
        defaultItemProps: defaultTabButtonItemPropsTop,
        items: [...tabButtonItems]
    }
});

const tabButtonGroupRight = new ToggleGroup({
    target: document.getElementById("tabButtonContainerRight"),
    props: {
        direction: "vertical",
        hAlign: "left",
        vAlign: "top",
        trapFocus: true,
        defaultItemProps: defaultTabButtonItemPropsRight,
        items: [...tabButtonItems]
    }
});

const tabButtonGroupBottom = new ToggleGroup({
    target: document.getElementById("tabButtonContainerBottom"),
    props: {
        direction: "horizontal",
        hAlign: "left",
        vAlign: "top",
        trapFocus: true,
        defaultItemProps: defaultTabButtonItemPropsBottom,
        items: [...tabButtonItems]
    }
});

const tabButtonGroupLeft = new ToggleGroup({
    target: document.getElementById("tabButtonContainerLeft"),
    props: {
        direction: "vertical",
        hAlign: "right",
        vAlign: "top",
        trapFocus: true,
        defaultItemProps: defaultTabButtonItemPropsLeft,
        items: [...tabButtonItems]
    }
});


tabButtonGroupTop.$on("toggleItemChanged", (event) => {
    console.log("toggleItemChanged", event.detail);
});

tabButtonGroupRight.$on("toggleItemChanged", (event) => {
    console.log("toggleItemChanged", event.detail);
});

tabButtonGroupBottom.$on("toggleItemChanged", (event) => {
    console.log("toggleItemChanged", event.detail);
});

tabButtonGroupLeft.$on("toggleItemChanged", (event) => {
    console.log("toggleItemChanged", event.detail);
});

window.addEventListener("beforeunload", () => tabButtonGroupTop?.$destroy());
window.addEventListener("beforeunload", () => tabButtonGroupRight?.$destroy());
window.addEventListener("beforeunload", () => tabButtonGroupBottom?.$destroy());
window.addEventListener("beforeunload", () => tabButtonGroupLeft?.$destroy());
