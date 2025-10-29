// Cleaned sketch: only place the person image centered on the FRONT of each bill.
// All previous effects removed.

const bills = [
  { value: '5', width: 1417, height: 732, frontImg: 'assets/5.1-Maria-Callas.png', color: '#8D9B9A' },
  { value: '10', width: 1500, height: 791, frontImg: 'assets/10.1-Ludwig-Van-Beethoven.png', color: '#C9727B' },
  { value: '20', width: 1571, height: 850, frontImg: 'assets/20.1-Marie-Curie.png', color: '#6A86B9' },
  { value: '50', width: 1654, height: 909, frontImg: 'assets/50.1-Miguel-de-Cervantes.png', color: '#D48F6A' },
  { value: '100', width: 1736, height: 969, frontImg: 'assets/100.1-Leonardo-Da-Vinci.png', color: '#72A87A' },
  { value: '200', width: 1807, height: 969, frontImg: 'assets/200.1-Bertha-Von-Suttner.png', color: '#E0C274' }
];

let billImages = [];

function preload() {
  // Load only the front images (the person portraits)
  billImages = bills.map(b => loadImage(b.frontImg));
}

function setup() {
  // We don't need a main canvas
  noCanvas();

  const container = document.getElementById('canvas-container');

  bills.forEach((bill, i) => {
    // Row container to keep front and back (back left blank)
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.flexDirection = 'row';
    rowDiv.style.alignItems = 'center';
    rowDiv.style.marginTop = i === 0 ? '0px' : '20px';

    // FRONT: draw the portrait centered
    const front = createGraphics(bill.width, bill.height);
    drawFront(front, bill, i);
    front.canvas.style.display = 'block';
    front.canvas.style.marginRight = '20px';
    rowDiv.appendChild(front.canvas);

    // BACK: keep blank (same background color)
    const back = createGraphics(bill.width, bill.height);
    back.background(bill.color || 255);
    back.canvas.style.display = 'block';
    rowDiv.appendChild(back.canvas);

    container.appendChild(rowDiv);
  });
}

function draw() {
  // No continuous drawing needed
}

function drawFront(pg, bill, idx) {
  // Clear and set background to bill color
  pg.clear();
  pg.background(bill.color || 255);

  const img = billImages[idx];
  if (!img) return;

  // Image width: 20% of bill width
  const imgW = bill.width * 0.2;
  const imgH = img.height * (imgW / img.width);

  // Center the image on the front page
  const x = (bill.width - imgW) / 2;
  const y = (bill.height - imgH) / 2;

  pg.image(img, x, y, imgW, imgH);
}