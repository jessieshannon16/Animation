let w = 0, h = 0;
const spriteStrip = new Image();
const backdrop = new Image();
let sprites = [];
let markers = [];
let lastTimestamp = 0;


function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('pathCanvas');
    canvas.width = w;
    canvas.height = h;
}

function rainbow(c) {		// See next slide for this code
    c = Math.abs(c) % 6;
    if (c < 1) {
        return `rgb(255, ${255*c}, 0)`; // red -> yellow
    } if (c < 2) {
        return `rgb(${255*(2-c)}, 255, 0)`; // yellow -> green
    } if (c < 3) {
        return `rgb(0, 255, ${255*(c-2)})`; // green -> cyan
    } if (c < 4) {
        return `rgb(0, ${255*(4-c)}, 255)`; // cyan -> blue
    } if (c < 5) {
        return `rgb(${255*(c-4)}, 0, 255)`; // blue -> magenta
    } else {
        return `rgb(255, 0, ${255*(6-c)})`; // magenta -> red
    }
}

function pageLoad() {

    window.addEventListener("resize", fixSize);
    fixSize();
markers.push({x:-200, y:h/2});
markers.push({x:w+200, y:h/2, d:w+400});
    spriteStrip.src = "SpriteSheet.png";
    backdrop.src = "Backdrop.png";
//context.fillStyle = '#F5F9FA';

//context.rect(0,0,w,h);

    window.requestAnimationFrame(redraw);
    const canvas = document.getElementById('pathCanvas');

/*canvas.addEventListener('click', event => {
addMarker(event.clientX, event.clientY);
}, false);

canvas.addEventListener('contextmenu', event => {
removeMarker();
event.preventDefault();
}, false);*/

setInterval(addSprite, 700);
}


function addSprite(){
  let x = markers[0].x;
	let y = markers[0].y;
	let r = 200;
	let v = 600;
	let frame = 0;
	let frames = 72;
	let nextMarker = 1;
	let progress = 0;

	sprites.push({x, y, r, v, frame, frames, nextMarker, progress});

}

let t = 0;

function redraw(timestamp) {

    const canvas = document.getElementById('pathCanvas');
    const context = canvas.getContext('2d');

  //context.drawImage(backdrop, 0, 0, backdrop.width, backdrop.height, 0, 0, w, h);

  t++;
    for (let i = 0; i < w; i += w/64) {
      for (let j = 0; j < h; j += h/48) {
      //  context.fillStyle = rainbow(t/20 + /Math.sin/(12.75*i/w) + 8*j/h);
        context.fillStyle = rainbow(t/40 + (0*i/w) + 3*j/h);
        context.beginPath();
        context.rect(i, j, w/64, h/48);
        context.fill();
      }
    }

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    for (let s of sprites) {

    	if (s.nextMarker >= markers.length) continue;

    	let n = s.nextMarker;
    	s.x = markers[n-1].x + (markers[n].x - markers[n-1].x) * s.progress;
    	s.y = markers[n-1].y + (markers[n].y - markers[n-1].y) * s.progress;

    	s.progress += frameLength * s.v / markers[n].d;
    	if (s.progress >= 1) {
    			s.nextMarker++;
    			s.progress = 0;
    }

          s.frame += frameLength*72;
          if (s.frame >= s.frames) s.frame = 0;

    }
    while (sprites.length > 0) {
        if (sprites[0].nextMarker < markers.length) break;
        sprites.shift();
    }

    for (let s of sprites) {
        context.drawImage(spriteStrip,
            Math.floor(s.frame)*spriteStrip.width/s.frames, 0,
            spriteStrip.width/s.frames, spriteStrip.height,
            s.x-s.r, s.y-s.r, s.r*2, s.r*2);
    }

    window.requestAnimationFrame(redraw);

}
function separation(b1, b2) {
    return Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));
}



function addMarker(x, y) {

    let markerAfter = markers.pop();
    let markerBefore = markers[markers.length - 1];

    let d = separation(markerBefore, {x, y});
    markers.push({x, y, d});

    markerAfter.d = separation({x, y}, markerAfter);
    markers.push(markerAfter);

}
function removeMarker() {

    if (markers.length <= 2) return;

    markers.splice(markers.length - 2, 1);

    markers[markers.length - 1].d = separation(
			markers[markers.length - 1], markers[markers.length - 2]);

}
