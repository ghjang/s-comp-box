import MenuBar from '/build/dev/default/MenuBar.js';

fetch('./menus.json')
    .then(response => response.json())
    .then(menus => {
        const container = document.getElementById('container');

        const menuBar = new MenuBar({
            target: container,
            props: {
                menus
            }
        });

        menuBar.$on(
            'menuItemClicked',
            (event) => {
                const e = event.detail;
                const menuItem = e.link || e.popup || e.action;
                console.log(`clicked: ${menuItem.text}`)
            }
        );

        window.addEventListener('beforeunload', () => menuBar.$destroy());
    });
