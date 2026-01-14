const bills = [
  {
    width: 1417,
    height: 732,
    baseImg: 'assets/Base/Base_front-01.png',
    topImg: 'assets/Top/Top_front-07.png',
    baseBackImg: 'assets/Base/Base_back-14.png',
    topBackImg: 'assets/Top/Top_back-20.png'
  },
  {
    width: 1500,
    height: 791,
    baseImg: 'assets/Base/Base_front-02.png',
    topImg: 'assets/Top/Top_front-08.png',
    baseBackImg: 'assets/Base/Base_back-15.png',
    topBackImg: 'assets/Top/Top_back-21.png'
  },
  {
    width: 1571,
    height: 850,
    baseImg: 'assets/Base/Base_front-03.png',
    topImg: 'assets/Top/Top_front-09.png',
    baseBackImg: 'assets/Base/Base_back-16.png',
    topBackImg: 'assets/Top/Top_back-22.png'
  },
  {
    width: 1654,
    height: 909,
    baseImg: 'assets/Base/Base_front-04.png',
    topImg: 'assets/Top/Top_front-10.png',
    baseBackImg: 'assets/Base/Base_back-17.png',
    topBackImg: 'assets/Top/Top_back-23.png'
  },
  {
    width: 1736,
    height: 969,
    baseImg: 'assets/Base/Base_front-05.png',
    topImg: 'assets/Top/Top_front-11.png',
    baseBackImg: 'assets/Base/Base_back-18.png',
    topBackImg: 'assets/Top/Top_back-24.png'
  },
  {
    width: 1807,
    height: 969,
    baseImg: 'assets/Base/Base_front-06.png',
    topImg: 'assets/Top/Top_front-12.png',
    baseBackImg: 'assets/Base/Base_back-19.png',
    topBackImg: 'assets/Top/Top_back-25.png'
  }
];

const CONFIG = {
  whiteThreshold: 240,
  tintStrength: 0.4,
  lineBlend: 0.15,

  // Glitchy color distortion for light/white base areas.
  // This effect samples displaced base-image pixels and pushes them into paper-light regions.
  lightGlitchStrength: 0.92,
  lightGlitchMaxShiftXPx: 70,
  lightGlitchMaxShiftYPx: 18,
  lightGlitchChannelShiftPx: 6,
  lightGlitchBandHeightPx: 10,
  lightGlitchBlockSizePx: 120,
  lightGlitchNoiseStrength: 16,
  lightGlitchScanlineStrength: 0.14,

  // Fade the pattern into darker regions.
  // At/above `billPatternFadeStartLuma` the pattern is full strength,
  // and it smoothly fades to 0 at/below `billPatternFadeEndLuma`.
  billPatternFadeStartLuma: 250,
  billPatternFadeEndLuma: 215
};

let baseImages = [];
let baseBackImages = [];

// Cache the first front/back base pixels so all later bills can reuse the same pattern source.
const patternCache = {
  front: { pixels: null, w: 0, h: 0 },
  back: { pixels: null, w: 0, h: 0 }
};

function preload() {
  baseImages = bills.map((b) => loadImage(b.baseImg));
  baseBackImages = bills.map((b) => loadImage(b.baseBackImg));
}

function setup() {
  pixelDensity(1);
  noCanvas();
  const container = document.getElementById('canvas-container');

  // Give each bill its own deterministic-ish glitch seed so the light-area glitch pattern
  // varies per bill, while remaining stable within that bill.
  const nowSeed = (Date.now() & 0x7fffffff) >>> 0;
  bills.forEach((bill, index) => {
    bill.glitchSeedFront = hash(index + 1, 17, nowSeed);
    bill.glitchSeedBack = hash(index + 1, 29, nowSeed);
  });

  const fragment = document.createDocumentFragment();
  bills.forEach((bill, index) => {
    fragment.appendChild(createBillRow(bill, index));
  });
  container.appendChild(fragment);
}

function createBillRow(bill, index) {
  const row = document.createElement('div');
  row.className = 'bill-row';

  const frontCaptureMode = index === 0 ? 'front' : 'front-reuse';
  const backCaptureMode = index === 0 ? 'back' : 'back-reuse';

  const front = createLayeredSide({
    w: bill.width,
    h: bill.height,
    baseImage: baseImages[index],
    topImageSrc: bill.topImg,
    captureMode: frontCaptureMode,
    glitchSeed: bill.glitchSeedFront,
  });
  const back = createLayeredSide({
    w: bill.width,
    h: bill.height,
    baseImage: baseBackImages[index],
    topImageSrc: bill.topBackImg,
    captureMode: backCaptureMode,
    glitchSeed: bill.glitchSeedBack
  });

  row.append(front, back);
  return row;
}

function createLayeredSide({ w, h, baseImage, topImageSrc, captureMode, glitchSeed = 0 }) {
  const container = document.createElement('div');
  container.className = 'canvas-frame';
  container.style.width = `${w}px`;
  container.style.height = `${h}px`;

  const baseLayer = createGraphics(w, h);
  baseLayer.pixelDensity(1);
  applyNoiseDistortion(baseLayer, baseImage, w, h, captureMode, glitchSeed);
  styleAsBlockCanvas(baseLayer.canvas);
  container.appendChild(baseLayer.canvas);

  container.appendChild(createOverlayImage(topImageSrc, w, h));
  return container;
}

function styleAsBlockCanvas(canvas) {
  canvas.style.position = 'relative';
  canvas.style.display = 'block';
}

function createOverlayImage(src, w, h) {
  const img = document.createElement('img');
  img.src = src;
  img.style.position = 'absolute';
  img.style.top = '0';
  img.style.left = '0';
  img.style.width = `${w}px`;
  img.style.height = `${h}px`;
  return img;
}

function applyNoiseDistortion(pg, img, w, h, capturePattern = null, glitchSeed = 0) {
  // Sample the base image colors.
  const baseCanvas = createGraphics(w, h);
  baseCanvas.pixelDensity(1);
  baseCanvas.image(img, 0, 0, w, h);
  baseCanvas.loadPixels();

  // Create a light colorful tint based on base colors.
  pg.loadPixels();
  const pixels = pg.pixels;
  const basePixels = baseCanvas.pixels;
  for (let i = 0; i < basePixels.length; i += 4) {
    const baseR = basePixels[i];
    const baseG = basePixels[i + 1];
    const baseB = basePixels[i + 2];
    pixels[i] = Math.round(255 - (255 - baseR) * CONFIG.tintStrength);
    pixels[i + 1] = Math.round(255 - (255 - baseG) * CONFIG.tintStrength);
    pixels[i + 2] = Math.round(255 - (255 - baseB) * CONFIG.tintStrength);
    pixels[i + 3] = 255;
  }
  pg.updatePixels();

  // Apply pattern filter using sampled colors from base image.
  applyPatternFilter(pg, baseCanvas, w, h, capturePattern, glitchSeed);
}

function applyPatternFilter(pg, baseImageCanvas, w, h, capturePattern = null, glitchSeed = 0) {
  pg.loadPixels();
  const basePixels = baseImageCanvas.pixels;

  // Capture first pattern sources.
  if (capturePattern === 'front') {
    patternCache.front.pixels = new Uint8ClampedArray(basePixels);
    patternCache.front.w = w;
    patternCache.front.h = h;
  } else if (capturePattern === 'back') {
    patternCache.back.pixels = new Uint8ClampedArray(basePixels);
    patternCache.back.w = w;
    patternCache.back.h = h;
  }

  // Pick the pattern reference (either same image or cached first).
  const reference = getReferencePattern(capturePattern, basePixels, w, h);
  const pixels = pg.pixels;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Sample color from base image.
      const baseR = basePixels[idx];
      const baseG = basePixels[idx + 1];
      const baseB = basePixels[idx + 2];

      // Glitchy color distortion in light areas, smoothly faded out as the base gets darker.
      const billFade = billPatternFade(baseR, baseG, baseB);
      if (billFade > 0) {
        const glitch = sampleLightGlitchColor(x, y, w, h, basePixels, glitchSeed);
        const strength = CONFIG.lightGlitchStrength * billFade;
        pixels[idx] = blendChannel(pixels[idx], glitch.r, strength);
        pixels[idx + 1] = blendChannel(pixels[idx + 1], glitch.g, strength);
        pixels[idx + 2] = blendChannel(pixels[idx + 2], glitch.b, strength);
        pixels[idx + 3] = 255;

        // If the base is truly white ("paper"), do only the light glitch and skip the darker-area pattern.
        if (!isNotWhite(baseR, baseG, baseB)) continue;
      }

      const refColor = sampleReferenceColor(x, y, w, h, reference);
      const hue = calculateHue(refColor.r, refColor.g, refColor.b);
      const saturation = calculateSaturation(refColor.r, refColor.g, refColor.b);

      // Always use Pattern 3 (Fractal Geometric).
      const shouldDrawPattern = drawPattern_FractalGeometric(x, y, hue, saturation);
      if (!shouldDrawPattern) continue;

      // Draw pattern lines darker than the light tint background.
      const currentR = pixels[idx];
      const currentG = pixels[idx + 1];
      const currentB = pixels[idx + 2];
      pixels[idx] = Math.round(currentR - (currentR - baseR) * CONFIG.lineBlend);
      pixels[idx + 1] = Math.round(currentG - (currentG - baseG) * CONFIG.lineBlend);
      pixels[idx + 2] = Math.round(currentB - (currentB - baseB) * CONFIG.lineBlend);
      pixels[idx + 3] = 255;
    }
  }
  
  pg.updatePixels();
}

function clampInt(v, minV, maxV) {
  return Math.max(minV, Math.min(maxV, v));
}

function sampleBaseRGB(pixels, w, h, x, y) {
  const ix = clampInt(Math.floor(x), 0, w - 1);
  const iy = clampInt(Math.floor(y), 0, h - 1);
  const idx = (iy * w + ix) * 4;
  return { r: pixels[idx], g: pixels[idx + 1], b: pixels[idx + 2] };
}

function sampleLightGlitchColor(x, y, w, h, basePixels, glitchSeed = 0) {
  const seed = glitchSeed | 0;
  // Horizontal banding jitter (scanline glitch feel).
  const band = Math.floor(y / CONFIG.lightGlitchBandHeightPx);
  const bandRnd = pseudoRandom(band, 0, 9107 + seed);
  let shiftX = Math.floor((bandRnd * 2 - 1) * CONFIG.lightGlitchMaxShiftXPx);

  // Occasional stronger spikes within bands.
  const spike = pseudoRandom(band, Math.floor(x / 90), 90210 + seed);
  if (spike > 0.90) {
    const spikeAmt = (pseudoRandom(band, 1, 4455 + seed) * 2 - 1) * CONFIG.lightGlitchMaxShiftXPx * 3.2;
    shiftX += Math.floor(spikeAmt);
  }

  // Blocky vertical jitter.
  const blockX = Math.floor(x / CONFIG.lightGlitchBlockSizePx);
  const blockY = Math.floor(y / CONFIG.lightGlitchBlockSizePx);
  const blockJ = pseudoRandom(blockX, blockY, 12345 + seed);
  const shiftY = blockJ > 0.92 ? Math.floor((pseudoRandom(blockX, blockY, 5678 + seed) * 2 - 1) * CONFIG.lightGlitchMaxShiftYPx) : 0;

  // RGB channel split.
  const ch = CONFIG.lightGlitchChannelShiftPx;
  const cR = sampleBaseRGB(basePixels, w, h, x + shiftX + ch, y + shiftY);
  const cG = sampleBaseRGB(basePixels, w, h, x + shiftX, y + shiftY);
  const cB = sampleBaseRGB(basePixels, w, h, x + shiftX - ch, y + shiftY);
  let r = cR.r;
  let g = cG.g;
  let b = cB.b;

  // Occasional channel shuffle for harsher glitch frames.
  const shuffle = pseudoRandom(Math.floor(x / 60), band, 777 + seed);
  if (shuffle > 0.96) {
    const tmp = r;
    r = g;
    g = b;
    b = tmp;
  }

  // Add subtle pixel noise so it doesn't look too clean.
  const n = (pseudoRandom(Math.floor(x / 3), Math.floor(y / 3), 424242 + seed) * 2 - 1) * CONFIG.lightGlitchNoiseStrength;
  r = clampByte(Math.round(r + n));
  g = clampByte(Math.round(g - n * 0.6));
  b = clampByte(Math.round(b + n * 0.35));

  // Gentle scanline darkening.
  if ((y & 1) === 0) {
    const s = 1 - CONFIG.lightGlitchScanlineStrength;
    r = clampByte(Math.round(r * s));
    g = clampByte(Math.round(g * s));
    b = clampByte(Math.round(b * s));
  }

  return { r, g, b };
}

function isNotWhite(r, g, b) {
  return r < CONFIG.whiteThreshold || g < CONFIG.whiteThreshold || b < CONFIG.whiteThreshold;
}

function luma(r, g, b) {
  // Relative luminance-ish (sRGB coefficients). Good enough for thresholding.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function billPatternFade(r, g, b) {
  const y = luma(r, g, b);
  // Fade = 0 at/below end; 1 at/above start.
  return smoothstep(CONFIG.billPatternFadeEndLuma, CONFIG.billPatternFadeStartLuma, y);
}

function clampByte(v) {
  return Math.max(0, Math.min(255, v));
}

function mixColor(a, b, t) {
  return {
    r: clampByte(Math.round(a.r + (b.r - a.r) * t)),
    g: clampByte(Math.round(a.g + (b.g - a.g) * t)),
    b: clampByte(Math.round(a.b + (b.b - a.b) * t))
  };
}

function blendChannel(current, target, strength) {
  return clampByte(Math.round(current + (target - current) * strength));
}

function darkenColor(c, amount) {
  const mul = 1 - amount;
  // Keep it "ink-like" (not pure black) but clearly visible.
  return {
    r: clampByte(Math.round(c.r * mul)),
    g: clampByte(Math.round(c.g * mul)),
    b: clampByte(Math.round(c.b * mul))
  };
}

function getReferencePattern(capturePattern, basePixels, w, h) {
  if (capturePattern === 'front-reuse' && patternCache.front.pixels) return patternCache.front;
  if (capturePattern === 'back-reuse' && patternCache.back.pixels) return patternCache.back;
  return { pixels: basePixels, w, h };
}

function sampleReferenceColor(x, y, w, h, reference) {
  const refX = reference.w === w ? x : Math.floor((x / w) * reference.w);
  const refY = reference.h === h ? y : Math.floor((y / h) * reference.h);
  const refIdx = (refY * reference.w + refX) * 4;
  const p = reference.pixels;
  return { r: p[refIdx], g: p[refIdx + 1], b: p[refIdx + 2] };
}

// Helper function to calculate hue
function calculateHue(r, g, b) {
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  
  let hue = 0;
  if (maxChannel !== minChannel) {
    if (maxChannel === r) {
      hue = 60 * (((g - b) / (maxChannel - minChannel)) % 6);
    } else if (maxChannel === g) {
      hue = 60 * (((b - r) / (maxChannel - minChannel)) + 2);
    } else {
      hue = 60 * (((r - g) / (maxChannel - minChannel)) + 4);
    }
  }
  if (hue < 0) hue += 360;
  
  return hue;
}

// Helper function to calculate saturation
function calculateSaturation(r, g, b) {
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const lightness = (maxChannel + minChannel) / 2;
  
  return maxChannel === minChannel ? 0 : 
    (maxChannel - minChannel) / (lightness < 128 ? maxChannel + minChannel : 510 - maxChannel - minChannel);
}

// Dynamic Generative Pattern Functions

// Pseudo-random hash function for deterministic generation
function hash(x, y, seed = 0) {
  let h = (seed + x * 73856093) ^ (y * 19349663);
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) & 2147483647;
}

function pseudoRandom(x, y, seed = 0) {
  return (hash(x, y, seed) % 256) / 256;
}

function fract(t) {
  return t - Math.floor(t);
}

function positiveMod(n, m) {
  return ((n % m) + m) % m;
}

// Pattern 3: Fractal-like geometric patterns
function drawPattern_FractalGeometric(x, y, hue, saturation) {
  const lineWidth = 0.55;
  
  // Local seed for position-aware variation
  const localSeed = Math.floor(hue) + Math.floor(x / 12) * 7 + Math.floor(y / 12) * 13;
  
  // Multi-scale grid based on saturation and hue
  let result = false;
  
  const hueRad = hue * Math.PI / 180;
  
  // Compute fractal-like subdivisions with hue influence
  const scales = [40, 100, 25, 60];
  scales.forEach((scale, i) => {
    const px = x % scale;
    const py = y % scale;
    const threshold = (i * 0.15 + saturation * 0.2);
    
    // Crosshatch pattern at this scale
    const isGrid = (px < lineWidth || px > scale - lineWidth || 
                   py < lineWidth || py > scale - lineWidth);
    
    // Diagonal divisions - modulated by hue
    const diag1Offset = Math.sin(hueRad + i) * 5;
    const diag2Offset = Math.cos(hueRad + i) * 5;
    const diagDist = Math.min(Math.abs(px - py + diag1Offset), Math.abs(px + py - scale + diag2Offset));
    const isDiag = diagDist < lineWidth + threshold;
    
    // Probability based on hue and local position
    const hueProb = Math.abs(Math.sin(hueRad + i * 0.5)) > 0.5;
    
    if ((isGrid || isDiag) && hueProb) {
      result = true;
    }
  });
  
  // Add some noise-based detail with local variation
  const detail = pseudoRandom(Math.floor(x / 15), Math.floor(y / 15), localSeed) > (0.7 - saturation * 0.3);
  
  return result || detail;
}

// ==================== DOWNLOAD FUNCTIONALITY ====================

document.addEventListener('DOMContentLoaded', initializeDownloadModal);

function initializeDownloadModal() {
  const modal = document.getElementById('downloadModal');
  const openBtn = document.getElementById('openDownloadBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const previewContainer = document.getElementById('billPreviews');

  const selectedBills = new Set();
  createBillPreviews(previewContainer, selectedBills);

  const showModal = () => modal.classList.remove('hidden');
  const hideModal = () => modal.classList.add('hidden');

  openBtn.addEventListener('click', showModal);
  closeBtn.addEventListener('click', hideModal);
  cancelBtn.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  downloadBtn.addEventListener('click', () =>
    handleDownload({ downloadBtn, modal, previewContainer, selectedBills })
  );
}

function createBillPreviews(container, selectedBills) {
  bills.forEach((_, index) => {
    const preview = document.createElement('div');
    preview.className = 'bill-preview';
    preview.dataset.billIndex = index;
    preview.innerHTML = `<div class="bill-preview-number">Bill ${index + 1}</div>`;
    preview.addEventListener('click', () => toggleBillSelection(preview, index, selectedBills));
    container.appendChild(preview);
  });
}

function toggleBillSelection(preview, index, selectedBills) {
  if (selectedBills.has(index)) {
    selectedBills.delete(index);
    preview.classList.remove('selected');
    return;
  }
  selectedBills.add(index);
  preview.classList.add('selected');
}

function getExportSides(choice) {
  return choice === 'both' ? ['front', 'back'] : [choice];
}

function resetPreviewSelection(container, selectedBills) {
  selectedBills.clear();
  container.querySelectorAll('.bill-preview.selected').forEach((preview) => {
    preview.classList.remove('selected');
  });
}

async function handleDownload({ downloadBtn, modal, previewContainer, selectedBills }) {
  if (selectedBills.size === 0) {
    alert('Please select at least one canvas to download');
    return;
  }

  const side = document.querySelector('input[name="side"]:checked').value;
  const format = document.querySelector('input[name="format"]:checked').value;
  const sides = getExportSides(side);
  const billsToDownload = Array.from(selectedBills).sort((a, b) => a - b);
  const totalFiles = billsToDownload.length * sides.length;

  downloadBtn.disabled = true;
  downloadBtn.textContent = `Processing (0/${totalFiles})...`;

  try {
    const zip = new JSZip();
    let processedCount = 0;

    for (const billIndex of billsToDownload) {
      const billNum = billIndex + 1;
      for (const sideName of sides) {
        const blob = await captureCanvasSide(billIndex, sideName, format);
        const filename = `bill_${billNum}_${sideName}.${format}`;
        zip.file(filename, blob);
        processedCount++;
        downloadBtn.textContent = `Processing (${processedCount}/${totalFiles})...`;
      }
    }

    downloadBtn.textContent = 'Creating ZIP...';
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvases.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    modal.classList.add('hidden');
    resetPreviewSelection(previewContainer, selectedBills);
  } catch (error) {
    console.error('Download error:', error);
    alert('Error during download: ' + error.message);
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download';
  }
}



async function captureCanvasSide(billIndex, side, format) {
  const container = document.getElementById('canvas-container');
  const rows = container.querySelectorAll('.bill-row');
  
  if (billIndex >= rows.length) {
    throw new Error(`Bill ${billIndex + 1} not found`);
  }

  const row = rows[billIndex];
  const sideDiv = side === 'front' ? row.children[0] : row.children[1];
  
  if (!sideDiv) {
    throw new Error(`Canvas not found for bill ${billIndex + 1} ${side}`);
  }

  // Use html2canvas to capture the entire rendered content
  const canvas = await html2canvas(sideDiv, {
    useCORS: true,
    allowTaint: true,
    scale: 1,
    backgroundColor: null
  });

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate blob'));
        }
      },
      `image/${format}`,
      0.95
    );
  });
}

