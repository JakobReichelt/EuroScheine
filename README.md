# Euro Bill Canvases

Generative Visualisierung von Euro-Geldscheinen mit prozeduralen Glitch- und Distortionseffekten.

## Übersicht

Das Projekt erzeugt mehrschichtige Canvas-Kompositionen für verschiedene Euro-Noten (€5 bis €200). Jede Note zeigt Vorder- und Rückseite mit angewandten Distortionen:

- Light-Area-Glitch: Farbversatz in hellen Bereichen
- Pixel-Displacement: Noise-basierte Verschiebung
- Luminance-Fading: Musterverblassung je nach Helligkeit

## Setup

```bash
python -m http.server 8000
```

Dann öffnen: `http://localhost:8000`

(Direktes Öffnen via `file://` funktioniert nicht wegen CORS)

## Struktur

```
.
├── index.html
├── sketch.js
├── style.css
└── assets/
    ├── Base/
    └── Top/
```

## Dependencies

- p5.js v1.10.0 (CDN)
- p5.sound
- jszip
- html2canvas

## Konfiguration

`CONFIG` in `sketch.js` anpassen:

```javascript
lightGlitchStrength: 0.92        // Glitch-Intensität
lightGlitchMaxShiftXPx: 70       // Horizontale Verschiebung
lightGlitchMaxShiftYPx: 18       // Vertikale Verschiebung
whiteThreshold: 240              // Hellschwelle
```

## Hochschule Hannover - 3. Semester
