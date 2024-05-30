import ContextMenuMediator from '/build/dev/default/ContextMenuMediator.js';

fetch('./menu-items.json')
    .then(response => response.json())
    .then(menuItems => {
        const container = document.getElementById('container');

        const contextMenu = new ContextMenuMediator({
            target: container,
            props: {
                menuItems
            }
        });

        contextMenu.$on(
            'menuItemClicked',
            (event) => {
                // NOTE: 스벨트 컴포넌트내에서 'dispatch'로 부모 컴포넌트에 발생시키는 이벤트는
                //       실질적으로 'CustomEvent' 객체로 전달된다. dispatch에 설정한 정보는
                //       'detail' 프로퍼티에 담겨져 있다.
                const e = event.detail;

                const menuItem = e.link || e.popup || e.action;
                console.log(`clicked: ${menuItem.text}`)
            }
        );

        container.addEventListener('contextmenu', e => contextMenu.showContextMenu(e));

        window.addEventListener('beforeunload', () => contextMenu.$destroy());
    });
