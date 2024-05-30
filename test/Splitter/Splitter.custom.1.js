window.onload = function () {
    const splitter = document.createElement('s-splitter');
    splitter.setAttribute('orientation', 'horizontal');

    const marqueeLeft = document.createElement('s-marquee');
    marqueeLeft.setAttribute('slot', 'left');
    marqueeLeft.textContent = 'Dynamic Left Marquee';

    const marqueeRight = document.createElement('s-marquee');
    marqueeRight.setAttribute('slot', 'right');
    marqueeRight.textContent = 'Dynamic Right Marquee';

    splitter.appendChild(marqueeLeft);
    splitter.appendChild(marqueeRight);

    document.getElementById('dynamic-content').appendChild(splitter);
}