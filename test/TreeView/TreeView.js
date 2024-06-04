
import TreeView from '/build/dev/default/TreeView.js';

const nodeData = [
    {
        id: 1,
        name: 'Root',
        open: false,
        children: [
            {
                id: 2,
                name:
                    'Child 1',
                open: false
            },
            {
                id: 3,
                name: 'Child 2',
                open: false,
                children: [
                    { id: 4, name: 'Grandchild', open: false }
                ]
            },
            {
                id: 5,
                name: 'Child 3',
                open: false,
                children: [
                    { id: 6, name: 'Grandchild 1', open: false },
                    { id: 7, name: 'Grandchild 2', open: false }
                ]
            }
        ],
    },
];

const treeView = new TreeView({
    target: document.getElementById('container'),
    props: {
        data: nodeData
    }
});

treeView.$on("treeNodeSelected", (event) => {
    console.log("Selected node: ", event.detail);
});

window.addEventListener("beforeunload", () => treeView?.$destroy());
