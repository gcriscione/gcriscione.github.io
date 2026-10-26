# Portfolio di Giovanni Criscione

Sito statico per una lettura rapida. Nessuna build e nessuna dipendenza esterna, font inclusi.

## Anteprima locale

Da questa cartella:

```powershell
python -m http.server 8000
```

Poi apri `http://localhost:8000`. Aprendo `index.html` direttamente funziona quasi tutto, ma conviene il server.

## Struttura

- `index.html`: contenuti (profilo, esperienza, formazione, competenze, contatti) e metadati.
- `assets/css/palette.css`: **tutti i colori** del sito (palette base, sfumature derivate e ruoli per tema chiaro/scuro). Per cambiare l'aspetto basta modificare questo file.
- `assets/css/styles.css`: font, misure e layout, una sezione per area della pagina. Non contiene colori.
- `assets/js/app.js`: tema chiaro/scuro, menu mobile, anno nel footer.
- `assets/js/hero3d.js`: rete neurale 3D nell'area `#hero-visual` dell'hero (Canvas, nessuna libreria). Numero di nodi e dimensioni sono nel file.
- `assets/images/`: `logo_gc.png` (originale), `logo-gc.png` (tessera scura per l'intestazione), `favicon.png`, `apple-touch-icon.png` (generate dal logo) e `avatar-192.webp` (foto tonda accanto al nome).
- `assets/icons/`: icone Tabler originali. Quelle usate sono incluse nello sprite SVG in cima al `<body>` di `index.html`.
- `documents/Giovanni_Criscione_CV.pdf`: CV scaricabile.

## Aggiungere un'icona

1. Scarica l'SVG da Tabler e salvalo in `assets/icons/`.
2. In `index.html`, nello sprite SVG, aggiungi `<symbol id="i-nome" viewBox="0 0 24 24">…</symbol>` con i `<path>` dell'icona (senza il path `stroke="none"`).
3. Usala con `<svg class="icon" aria-hidden="true"><use href="#i-nome"/></svg>`.

## Aggiornare i contenuti

I testi derivano dal CV del 18 ottobre 2026. Quando cambia il tuo percorso, aggiorna prima la presentazione nell'hero e l'esperienza.

## GitHub Pages

In **Settings → Pages** scegli **Deploy from a branch**, il branch da pubblicare e la cartella **/(root)**. Il repository deve chiamarsi `gcriscione.github.io`. I percorsi sono relativi.

Prima di pubblicare, controlla che il CV incluso e i recapiti siano quelli che vuoi rendere pubblici. `assets/images/Foto magistrale.jpg` è la foto originale e non è usata dal sito: non pubblicarla se non serve.
