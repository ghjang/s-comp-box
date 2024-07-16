import Splitter from '/build/dev/default/Splitter.js';
import TreeView from '/build/dev/default/TreeView.js';
import WebView from '/build/dev/default/WebView.js';

function addIdToNode(nodes, parentId = null) {
    nodes.forEach((node, index) => {
        node.id = index + 1;
        if (parentId) {
            node.id += parentId * 100;
        }
        if (node.children) {
            addIdToNode(node.children, node.id);
        }
    });
}

function updateNodeName(nodes, level = 0) {
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        if (level === 0) {
            node.name = `${i + 1}. ${node.name}`;
        } else {
            const prefix = (i !== nodes.length - 1) ? '├' : '└';
            node.name = `${prefix} ${node.name}`;
        }
        if (node.children) {
            updateNodeName(node.children, level + 1);
        }
    }
}

fetch('./s-comp.treeview.node-data.json')
    .then(response => response.json())
    .then(nodeData => {
        addIdToNode(nodeData);
        updateNodeName(nodeData);

        const splitter = new Splitter({
            target: document.querySelector('#container'),
            props: {
                orientation: 'horizontal',
                panel_0_length: '25%',

                component_0: {
                    component: TreeView,
                    props: {
                        data: nodeData
                    }
                },

                component_1: {
                    component: WebView,
                    props: {
                        url: 'about:blank'
                    }
                }
            }
        });

        splitter.$on('treeNodeSelected', (event) => {
            const bubble = event.detail.bubble;
            const detail = bubble.forwardingDetail;
            const webView = bubble.detail.component_1
            webView.url = detail.data;
        });

        window.addEventListener("beforeunload", () => splitter?.$destroy());
    });
