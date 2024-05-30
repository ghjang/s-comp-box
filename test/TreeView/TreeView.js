
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
        ],
    },
];

let treeView = new TreeView({
    target: document.getElementById('container'),
    props: {
        data: nodeData
    }
});

window.addEventListener("beforeunload", () => treeView?.$destroy());
