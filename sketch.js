const bills = [
  { width: 1417, height: 732, baseImg: 'assets/Base/Base_front-01.png', topImg: 'assets/Top/Top_front-07.png' },
  { width: 1500, height: 791, baseImg: 'assets/Base/Base_front-02.png', topImg: 'assets/Top/Top_front-08.png' },
  { width: 1571, height: 850, baseImg: 'assets/Base/Base_front-03.png', topImg: 'assets/Top/Top_front-09.png' },
  { width: 1654, height: 909, baseImg: 'assets/Base/Base_front-04.png', topImg: 'assets/Top/Top_front-10.png' },
  { width: 1736, height: 969, baseImg: 'assets/Base/Base_front-05.png', topImg: 'assets/Top/Top_front-11.png' },
  { width: 1807, height: 969, baseImg: 'assets/Base/Base_front-06.png', topImg: 'assets/Top/Top_front-12.png' }
];

let baseImages = [];
let topImages = [];

function preload() {
  baseImages = bills.map(b => loadImage(b.baseImg));
  topImages = bills.map(b => loadImage(b.topImg));
}

function setup() {
  pixelDensity(1);
  noCanvas();
  const container = document.getElementById('canvas-container');

  bills.forEach((bill, i) => {
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.flexDirection = 'row';
    rowDiv.style.alignItems = 'center';
    rowDiv.style.marginTop = i === 0 ? '0px' : '20px';

    // Create a container for layered images
    const frontContainer = document.createElement('div');
    frontContainer.style.position = 'relative';
    frontContainer.style.width = bill.width + 'px';
    frontContainer.style.height = bill.height + 'px';
    frontContainer.style.marginRight = '20px';
    
    // Create base layer canvas (distorted with generative noise)
    const baseLayer = createGraphics(bill.width, bill.height);
    baseLayer.pixelDensity(1);
    applyNoiseDistortion(baseLayer, baseImages[i], bill.width, bill.height);
    baseLayer.canvas.style.position = 'relative';
    baseLayer.canvas.style.display = 'block';
    frontContainer.appendChild(baseLayer.canvas);
    
    // Create top layer as HTML img element (to preserve transparency)
    const topImg = document.createElement('img');
    topImg.src = bills[i].topImg;
    topImg.style.position = 'absolute';
    topImg.style.top = '0';
    topImg.style.left = '0';
    topImg.style.width = bill.width + 'px';
    topImg.style.height = bill.height + 'px';
    frontContainer.appendChild(topImg);
    
    rowDiv.appendChild(frontContainer);

    const back = createGraphics(bill.width, bill.height);
    back.background(255);
    back.canvas.style.display = 'block';
    rowDiv.appendChild(back.canvas);

    container.appendChild(rowDiv);
  });
}

function applyNoiseDistortion(pg, img, w, h) {
  pg.image(img, 0, 0, w, h);
  pg.filter(BLUR, 25);
  
  // Apply digital glitch effect
  pg.loadPixels();
  
  randomSeed(42);
  const glitchIntensity = 8;
  const numGlitches = 12;
  
  for (let i = 0; i < numGlitches; i++) {
    const glitchY = floor(random(h));
    const glitchHeight = floor(random(5, 30));
    const glitchOffset = floor(random(-80, 80));
    
    for (let y = glitchY; y < min(glitchY + glitchHeight, h); y++) {
      for (let x = 0; x < w; x++) {
        let srcX = x - glitchOffset;
        
        if (srcX >= 0 && srcX < w) {
          const srcIdx = (y * w + srcX) * 4;
          const destIdx = (y * w + x) * 4;
          
          pg.pixels[destIdx] = pg.pixels[srcIdx];
          pg.pixels[destIdx + 1] = pg.pixels[srcIdx + 1];
          pg.pixels[destIdx + 2] = pg.pixels[srcIdx + 2];
          pg.pixels[destIdx + 3] = pg.pixels[srcIdx + 3];
        }
      }
    }
  }
  
  pg.updatePixels();
  
  // Apply pattern filter - create repeating geometric pattern
  applyPatternFilter(pg, w, h);
}

function applyPatternFilter(pg, w, h) {
  pg.loadPixels();
  
  const patternSize = 30;
  const lineThickness = 1.5;
  const whiteThreshold = 240;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      
      // Check if pixel is not white
      const r = pg.pixels[idx];
      const g = pg.pixels[idx + 1];
      const b = pg.pixels[idx + 2];
      const isNotWhite = (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold);
      
      // Create more intriguing pattern with multiple layers
      const isDiagonal = (x + y) % patternSize < lineThickness;
      const isReverseDiagonal = (x - y + h) % patternSize < lineThickness;
      const isCircle = (x % patternSize - patternSize/2) * (x % patternSize - patternSize/2) + 
                       (y % patternSize - patternSize/2) * (y % patternSize - patternSize/2) < 16;
      const isWave = Math.abs(Math.sin(x * 0.1) * 10 - (y % patternSize)) < lineThickness;
      const isHexagon = (x % (patternSize * 2) < lineThickness) || 
                        ((x + y) % (patternSize * 2) < lineThickness * 2);
      
      if ((isDiagonal || isReverseDiagonal || isCircle || isWave || isHexagon) && isNotWhite) {
        // Make pattern lines white with slight variation
        const brightness = 255 - Math.random() * 20;
        pg.pixels[idx] = brightness;
        pg.pixels[idx + 1] = brightness;
        pg.pixels[idx + 2] = brightness;
      }
    }
  }
  
  pg.updatePixels();
}

