
import Book from '/build/dev/default/Book.js';

const book = new Book({
    target: document.getElementById('container'),
    props: {
        pages: [
            "<h1>Light Coral</h1><br><br><img src='00.jpeg' width='500px' height='500px'>",
            "Page 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Page 2: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br><br><img src='01.jpeg' width='500px' height='500px'>",
            "Page 3: Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.<br><br><img src='02.jpeg' width='500px' height='500px'>",
            "Page 4: Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "Page 5: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Page 6: Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
            "Page 7: Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
            "<img src='03.jpeg' width='500px' height='500px'>",
        ]
    }
});

window.addEventListener("beforeunload", () => book?.$destroy());
