
import Calendar from '/build/dev/default/Calendar.js';

const calendar = new Calendar({
    target: document.getElementById('container'),
    props: {
    }
});

calendar.$on('dateSelected', (event) => {
    console.log('dateSelected', event.detail);
});

window.addEventListener("beforeunload", () => calendar?.$destroy());
