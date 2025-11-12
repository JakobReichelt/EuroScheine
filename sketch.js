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
  let temp = createGraphics(w, h);
  temp.image(img, 0, 0, w, h);
  temp.loadPixels();
  
  pg.background(255);
  pg.loadPixels();
  
  const noiseScale = 0.003;
  const distortionStrength = 600;
  
  randomSeed(42);
  noiseSeed(42);
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const noiseX = noise(x * noiseScale, y * noiseScale, 0) * 2 - 1;
      const noiseY = noise(x * noiseScale, y * noiseScale, 100) * 2 - 1;
      const turbulenceX = noise(x * noiseScale * 4, y * noiseScale * 4, 50) * 2 - 1;
      const turbulenceY = noise(x * noiseScale * 4, y * noiseScale * 4, 150) * 2 - 1;
      
      const offsetX = (noiseX + turbulenceX * 0.7) * distortionStrength;
      const offsetY = (noiseY + turbulenceY * 0.7) * distortionStrength;
      
      const srcX = constrain(floor(x + offsetX), 0, w - 1);
      const srcY = constrain(floor(y + offsetY), 0, h - 1);
      
      const srcIdx = (srcY * w + srcX) * 4;
      const destIdx = (y * w + x) * 4;
      
      pg.pixels[destIdx] = temp.pixels[srcIdx];
      pg.pixels[destIdx + 1] = temp.pixels[srcIdx + 1];
      pg.pixels[destIdx + 2] = temp.pixels[srcIdx + 2];
      pg.pixels[destIdx + 3] = temp.pixels[srcIdx + 3];
    }
  }
  
  pg.updatePixels();
  temp.remove();
}

