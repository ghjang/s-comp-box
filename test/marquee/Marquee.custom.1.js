const marquee3 = document.createElement('s-marquee');
marquee3.setAttribute('text', 'This is a test marquee with direction ltr.');
marquee3.setAttribute('direction', 'ttb');
marquee3.setAttribute('duration', '3');
marquee3.setAttribute('debug', 'true');
document.write(marquee3.outerHTML);
