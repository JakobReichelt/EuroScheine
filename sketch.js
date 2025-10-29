const bills = [
  { value: '5', width: 1417, height: 732, frontImg: 'assets/5.1-Maria-Callas.png', backImg: 'assets/5.2-Straßenkünstler.png', color: '#8D9B9A' },
  { value: '10', width: 1500, height: 791, frontImg: 'assets/10.1-Ludwig-Van-Beethoven.png', backImg: 'assets/10.2-Sängerchor.png', color: '#C9727B' },
  { value: '20', width: 1571, height: 850, frontImg: 'assets/20.1-Marie-Curie.png', backImg: 'assets/20.2-Universität.png', color: '#6A86B9' },
  { value: '50', width: 1654, height: 909, frontImg: 'assets/50.1-Miguel-de-Cervantes.png', backImg: 'assets/50.2-Bibliothek.png', color: '#D48F6A' },
  { value: '100', width: 1736, height: 969, frontImg: 'assets/100.1-Leonardo-Da-Vinci.png', backImg: 'assets/100.2-Museum.png', color: '#72A87A' },
  { value: '200', width: 1807, height: 969, frontImg: 'assets/200.1-Bertha-Von-Suttner.png', backImg: 'assets/200.2-Park.png', color: '#E0C274' },
];


let billGraphics = [];
let billImages = [];


function preload() {
  // billImages will be an array of objects: { front: p5.Image, back: p5.Image }
  billImages = bills.map(bill => ({
    front: loadImage(bill.frontImg),
    back: loadImage(bill.backImg)
  }));
}

function setup() {
  noCanvas();
  const container = document.getElementById('canvas-container');
  bills.forEach((bill, i) => {
    // Zeilencontainer für Vorder- und Rückseite
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.flexDirection = 'row';
    rowDiv.style.alignItems = 'center';
    rowDiv.style.marginTop = i === 0 ? '0px' : '20px';

    // Vorderseite
    let front = createGraphics(bill.width, bill.height);
    drawBill(front, bill, 'front', i);
    front.canvas.style.display = 'block';
    front.canvas.style.marginRight = '20px';
    rowDiv.appendChild(front.canvas);

    // Rückseite
    let back = createGraphics(bill.width, bill.height);
    drawBill(back, bill, 'back', i);
    back.canvas.style.display = 'block';
    rowDiv.appendChild(back.canvas);

    container.appendChild(rowDiv);
    billGraphics.push({ front, back });
  });
}



function draw() {
  // nicht benötigt
}

/**
 * Creates a p5.Graphics object with a gradient mask to soften the bottom edge.
 * The mask is solid white (opaque) at the top and fades to black (transparent)
 * only at the very bottom.
 * @param {number} w The width of the mask.
 * @param {number} h The height of the mask.
 * @param {number} fadeRatio The portion of the height (from the bottom) that should fade (e.g., 0.4 for 40%).
 * @returns {p5.Graphics} The graphics object to be used as a mask.
 */
function createGradientMask(w, h, fadeRatio = 0.4) {
  let mask = createGraphics(w, h);
  // Start with a fully opaque (white) background
  mask.background(255);
  mask.noFill();

  // Calculate the Y coordinate where the fade should begin
  let fadeStartY = h * (1 - fadeRatio);

  // Draw the gradient line by line, but only in the bottom fade section
  for (let y = fadeStartY; y < h; y++) {
    // Map the y-position within the fade area to a grayscale value from white to black
    let grayValue = map(y, fadeStartY, h, 255, 0);
    mask.stroke(grayValue);
    mask.line(0, y, w, y);
  }
  return mask;
}


function drawBill(pg, bill, side, idx) {
  pg.background(bill.color || 220);
  pg.fill(255);
  pg.stroke(0);
  let imgObj = billImages[idx];
  let img = null;
  if (side === 'front' && imgObj && imgObj.front) {
    img = imgObj.front;
  } else if (side === 'back' && imgObj && imgObj.back) {
    img = imgObj.back;
  }

  if (img) {
    if (side === 'front') {

      // --- Draw distorted simple object (ellipse) behind the stripes ---
      (function drawDistortedObject() {
        // Create a graphics buffer for the object
        let objW = bill.height * 0.5;
        let objH = objW * 1.1;
        let objGfx = createGraphics(objW, objH);
        // Darken the bill color
        let baseCol = color(bill.color || '#8c8c8cff');
        let darkCol = lerpColor(baseCol, color(0), 0.35); // 35% toward black
        objGfx.noStroke();
        objGfx.fill(darkCol);
        objGfx.ellipse(objW / 2, objH / 2, objW * 0.95, objH * 0.95);

        // Distort the object like the image stripes
        let numStripes = 120;
        let stripeW = objW / numStripes;
        // Position: left edge of the bill
        let cx = objW / 2;
        let cy = bill.height / 2;
        for (let i = 0; i < numStripes; i++) {
          let srcX = i * stripeW;
          let w = (i === numStripes - 1) ? objW - srcX : stripeW;
          // Stripe length: random, bias toward short
          let minLen = objW * 0.02;
          let maxLen = objW * 0.05;
          let randLen = Math.random() * (maxLen - minLen);
          let stripeLen = minLen + randLen;
          // Random horizontal and vertical position within the bill area (scattered)
          let randX = Math.random();
          let randY = Math.random();
          let destX = -objW / 2 + randX * (objW - stripeLen);
          let destY = -objH / 2 + randY * (objH - objH * 0.15);
          pg.push();
          pg.translate(cx, cy);
          pg.rotate(-HALF_PI);
          //pg.image(objGfx, destX, destY, stripeLen, objH * 0.9, srcX, 0, w, objH);
          pg.pop();
        }
      })();
      // --- End distorted object ---

      // Distort the image with stripes before drawing the intact image
      distort(pg, img, bill);

      // Calculate image size and position
      let imgW = bill.height * 0.5;
      let imgH = img.height * (imgW / img.width);
      let cx = bill.width - imgW / 2;
      let cy = bill.height / 2;

      // Draw a blurred circle (background color) between stripes and image
      // First, draw the solid ellipse
      pg.push();
      pg.noStroke();
      // Always use a valid color string for fill
      let bgCol = bill.color || '#cccccc';
      // Lighten the color by blending with white (e.g., 60% original, 40% white)
      let c = color(bgCol);
      let white = color(255, 255, 255);
      let lightCol = lerpColor(c, white, 0.4); // 0.4 = 40% white
      pg.fill(lightCol);
      let circleW = bill.height;
      let circleH = imgH * 1.18;
      pg.ellipse(cx + imgW / 2, cy, circleW, circleW);
      pg.pop();

      // --- Add fine-lined circular pattern ---
      pg.push();
      let centerX = cx + imgW / 2;
      let centerY = cy;
      let radius = circleW / 2 * 0.98; // slightly inside the circle
      let minR = radius * 0.1; // start pattern not at absolute center
      let maxR = radius;
      let numRings = 80; // number of concentric rings
      let minLines = 40; // lines in innermost ring
      let maxLines = 180; // lines in outermost ring
      for (let rStep = 0; rStep < numRings; rStep++) {
        let t = rStep / (numRings - 1);
        let r = lerp(minR, maxR, t);
        // More lines for outer rings, fewer for inner
        let lines = floor(lerp(minLines, maxLines, t));
        for (let i = 0; i < lines; i++) {
          let angle = (TWO_PI / lines) * i;
          let len = lerp(2, 8, t); // longer lines outside
          let x1 = centerX + cos(angle) * (r - len * 0.5);
          let y1 = centerY + sin(angle) * (r - len * 0.5);
          let x2 = centerX + cos(angle) * (r + len * 0.5);
          let y2 = centerY + sin(angle) * (r + len * 0.5);
          pg.stroke(0, 60); // fine black, slightly transparent
          pg.strokeWeight(2);
          pg.line(x1, y1, x2, y2);
        }
      }
      pg.pop();
      // --- End pattern ---

      // Then, draw a blurred gradient on the right side
      let blurW = circleW * 1;
      let blurSteps = 30;
      for (let i = 0; i < blurSteps; i++) {
        let alpha = map(i, 0, blurSteps - 1, 80, 0); // fade out
        let stepW = map(i, 0, blurSteps - 1, circleW, circleW + blurW);
        pg.push();
        pg.noStroke();
        // For blur, use rgba if hex, else fallback to gray
        let blurCol = bgCol;
        if (typeof blurCol === 'string' && blurCol[0] === '#') {
          // Convert hex to rgba and lighten for blur as well
          let c = color(blurCol);
          let white = color(255, 255, 255);
          let lightCol = lerpColor(c, white, 0.4);
          lightCol.setAlpha(alpha);
          pg.fill(lightCol);
        } else {
          pg.fill(blurCol, alpha);
        }
        // Only draw the right half of the ellipse for blur
        //pg.ellipse(cx + (stepW - circleW) / 2, cy, stepW, circleH);
        pg.pop();
      }

      // Create a copy of the image so we don't permanently modify the original
      let imageToDraw = img.get();
      // Create a gradient mask with the same dimensions as the original image
      let gradientMask = createGradientMask(imageToDraw.width, imageToDraw.height, 0.4);
      imageToDraw.mask(gradientMask);

  // Draw the image on top of the circle with engraving effect
  pg.push();
  pg.translate(cx, cy);
  pg.rotate(-HALF_PI);
    drawEngravedImage(pg, imageToDraw, -imgW / 2, -imgH / 2, imgW, imgH, bill.color || '#888');
  pg.pop();
// Draws an image with a fine ink/hatching effect (like a dollar bill)
function drawEngravedImage(pg, img, x, y, w, h, billColor = '#888') {
  // Renaissance pencil sketch effect
  img.loadPixels();
  let step = 2;
  for (let j = 0; j < img.height; j += step) {
    for (let i = 0; i < img.width; i += step) {
      let idx = 4 * (i + j * img.width);
      let r = img.pixels[idx];
      let g = img.pixels[idx + 1];
      let b = img.pixels[idx + 2];
      let a = img.pixels[idx + 3];
      if (a > 10) {
        // Calculate brightness
        let bright = 0.299 * r + 0.587 * g + 0.114 * b;
        // Pencil color: dark gray, more transparent for lighter areas
        let pencilAlpha = map(bright, 0, 255, 180, 10);
        let pencilWeight = map(bright, 0, 255, 2.5, 0.2);
        let px = map(i, 0, img.width, x, x + w);
        let py = map(j, 0, img.height, y, y + h);
        // Draw short, slightly angled pencil strokes
        let angle = map(noise(i * 0.03, j * 0.03), 0, 1, -PI/6, PI/6);
        let len = map(bright, 0, 255, step * 2.2, step * 0.7);
        let dx = cos(angle) * len;
        let dy = sin(angle) * len;
        pg.stroke(60, 50, 20, pencilAlpha); // brownish pencil
        pg.strokeWeight(pencilWeight);
        pg.line(px - dx/2, py - dy/2, px + dx/2, py + dy/2);
      }
    }
  }
}
    } else {
      // Back side: original placement
      let imgW = bill.width * 0.2;
      let imgH = img.height * (imgW / img.width);
      let x = bill.width / 2 - imgW - 20; // 20px Abstand von der Mittellinie
      let y = bill.height / 2 - imgH / 2;
      //pg.image(img, x, y, imgW, imgH);
    }
  }
  //showText(pg, bill, side, idx);
}


// Distorts the image by cutting it into many vertical stripes and randomly scattering them (random x/y) like the provided image
function distort(pg, img, bill) {
  let numStripes = 500;
  let imgW = bill.height; // width after rotation
  let imgH = img.height * (imgW / img.width);
  let stripeW = img.width / numStripes;
  for (let i = 0; i < numStripes; i++) {
    let srcX = i * stripeW;
    let w = (i === numStripes - 1) ? img.width - srcX : stripeW;
    // Stripe length: random, but use a bias so most are short, some are long
    let minLen = imgW * 0.02;
    let maxLen = imgW * 0.07;
    let randLen = Math.random(0,400); // bias toward 0
    let stripeLen = minLen + randLen;
    // Random horizontal and vertical position within the bill area (scattered)
    let randX = Math.random();
    let randY = Math.random();
    let destX = -imgW / 2 + randX * (imgW - stripeLen);
    let destY = -imgH / 2 + randY * (imgH - imgH * 0.15); // allow some vertical scatter, but keep mostly inside
    pg.push();
    pg.translate(bill.width + img.height / 2, bill.height / 2);
    pg.rotate(-HALF_PI);
    pg.tint(255, 90); // <-- more transparent stripes (alpha 90/255)
    pg.image(img, destX, destY, stripeLen, imgH * -0.9, srcX, 0, w, img.height);
    pg.noTint();
    pg.pop();
  }
    // --- Draw black bar on the left, behind the stripes ---
    pg.push();
    pg.noStroke();
    pg.fill(0);
    let barX = 30;
    let barY = 0;
    let barW = bill.width * 0.2;
    let barH = bill.height;
    pg.rect(barX, barY, barW, barH);
    pg.pop();
      // --- End white bar ---

}

// Displays different text depending on the side of the bill
function showText(pg, bill, side, idx) {
  pg.fill(255);
  pg.noStroke();
  pg.textSize(500);
  pg.textAlign(LEFT, TOP);
  if (side === 'front') {
    // Front: show value, rotated 90° left and bold
    pg.push();
    pg.textStyle && pg.textStyle(BOLD); // If p5 supports textStyle
    // Place text near left edge, vertically centered
    pg.translate(0, 0); // 100px from left, center vertically
    //pg.rotate(-HALF_PI);
    pg.text(bill.value, 0, 0);
    pg.pop();
  } else {
    // Back: show value and 'EURO'
      pg.text(bill.value + ' EURO', 30, 30);
  }
}