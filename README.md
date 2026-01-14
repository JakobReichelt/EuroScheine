# Euro Bill Canvases

An interactive p5.js visualization that generates artistic renderings of Euro banknotes with applied noise distortion, color effects, and glitch aesthetics.

## Overview

This project creates layered canvas compositions for various denominations of Euro currency. Each denomination displays both front and back sides with procedurally applied visual effects including:

- **Light area glitch effects** - Distorted color sampling in lighter regions
- **Noise distortion** - Complex noise-based pixel displacement
- **Pattern fading** - Luminance-aware pattern blending
- **Multi-layered composition** - Base image + noise distortion + overlay top layer

## Features

- **Multiple Euro denominations** - Renders 6 different bill denominations (€5, €10, €20, €50, €100, €200)
- **Front and back rendering** - Each denomination includes both sides
- **Procedural effects** - Deterministic glitch patterns that vary per bill
- **Web-based interface** - Built with p5.js and vanilla JavaScript
- **High-quality output** - Pixel-density aware rendering

## Project Structure

```
.
├── index.html          # Main HTML entry point with p5.js setup
├── sketch.js           # p5.js sketch with core visualization logic
├── style.css           # Styling for canvas layout and containers
└── assets/
    ├── Base/           # Base layer images for each bill denomination
    └── Top/            # Overlay images for each bill denomination
```

## Installation & Usage

### Prerequisites

- Any modern web browser with JavaScript enabled
- Local HTTP server (required to load assets due to CORS restrictions)

### Running Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Code
   ```

2. Start a local HTTP server. Choose one of:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with http-server package)
   npx http-server
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

**Note:** Opening the file directly with `file://` will not work due to browser CORS restrictions on loading images.

## Configuration

The `CONFIG` object in `sketch.js` allows customization of visual effects:

- `whiteThreshold` - Luminance threshold for light area detection
- `tintStrength` - Strength of color tinting effect
- `lineBlend` - Blend strength for line effects
- `lightGlitchStrength` - Intensity of glitch effect in light areas
- `lightGlitchMaxShiftXPx` - Maximum horizontal pixel displacement
- `lightGlitchMaxShiftYPx` - Maximum vertical pixel displacement
- `billPatternFadeStartLuma` / `billPatternFadeEndLuma` - Luminance range for pattern fading

## Dependencies

- [p5.js v1.10.0](https://p5js.org/) - Creative coding framework
- [p5.sound addon](https://p5js.org/reference/#/libraries/p5.sound) - Audio library
- [jszip v3.10.1](https://stuk.github.io/jszip/) - ZIP file handling
- [html2canvas v1.4.1](https://html2canvas.hertzen.com/) - Canvas to image conversion

All dependencies are loaded via CDN in `index.html`.

## Technical Details

### Rendering Pipeline

1. **Preload** - Load base and back images for all denominations
2. **Setup** - Generate deterministic glitch seeds and create bill rows
3. **Per-Bill Processing**:
   - Apply noise distortion to base layer
   - Cache pattern data for first denomination (reused for others)
   - Overlay top layer image
   - Apply glitch effects in light regions
   - Combine layers with blend modes

### Browser Compatibility

Requires a modern browser with support for:
- Canvas API
- Fetch/XHR (for loading images)
- ES6 JavaScript

## Course Context

This project is part of a Hochschule Hannover semester assignment for a media/design course focused on generative aesthetics and procedural imagery.

## License

[Specify your license here - e.g., MIT, Creative Commons, etc.]

## Author

Created for Hochschule Hannover - 3. Semester Qualifizierung Geldscheine project
