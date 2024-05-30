const marquee4 = document.createElement('s-marquee');
marquee4.text = 'This is a test marquee with direction btt.';
marquee4.direction = 'btt';
marquee4.duration = 3;
marquee4.debug = true;
const lastMarqueeCell = document.getElementById('last-marquee-cell');
lastMarqueeCell.appendChild(marquee4);
