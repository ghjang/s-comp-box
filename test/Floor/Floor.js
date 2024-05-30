
import Floor from '/build/dev/default/Floor.js';

fetch('./menu-items.json')
    .then(response => response.json())
    .then(menuItems => {
        const floorBox = new Floor({
            target: document.getElementById('floor-box'),
            props: {
                menuItems,
                defaultActionHandler: (action) => console.log(`clicked: ${action.text}`)
            }
        });

        window.addEventListener('beforeunload', () => floorBox.$destroy());

        const availablePatterns = floorBox.getAvailableFloorPatterns();
        const selectElem = document.getElementById('floor-pattern-select');

        availablePatterns.forEach((pattern, index) => {
            const optionElem = document.createElement('option');
            optionElem.value = index;
            optionElem.text = pattern;
            selectElem.appendChild(optionElem);
        });

        selectElem.addEventListener('change', (event) => {
            const pattern = availablePatterns[event.target.value];
            floorBox.setFloorPattern(pattern);
        });

        //selectElem.selectedIndex = 1;

        // NOTE: 'selectElem.selectedIndex'의 값으로 'change' 이벤트가 발생함.
        selectElem.dispatchEvent(new Event('change'));
    });
