# Hurore Designer

Een browser-app om Syrisch-orthodoxe **Hurore** (priesterstola) te ontwerpen.
Je begint met een leeg sjabloon en bouwt je eigen ontwerp met symbolen,
kleuren en tekst.

## Functies

- **Leeg Hurore-sjabloon** — twee getailleerde stroken met rand en franje.
- **Symbolenbibliotheek** — kruisen (Latijns, Syrisch, Mar-Thoma, Bloemkruis),
  Eucharistische symbolen (druiventros, korenaar, kelk, IHS-hostie),
  Heilige Geest (duif met stralen, vlam, olijftak), monogrammen
  (Chi-Rho, Alpha/Omega, IHS, ܡܪܢ ܐܬܐ) en decoratie (sterren, rozet,
  wijnrank, blad, medaillon, sierornament).
- **Tekst** — voeg liturgische tekst toe met klassieke, Syrische of
  Gotische letters.
- **Kleurpresets** — Rood/Goud, Rood/Zilver, Wit/Goud, Blauw/Goud,
  Groen/Goud, Paars/Goud, Zwart/Zilver — of kies vrij.
- **Randstijlen** — brocaat, effen, koord of geen.
- **Bewerken** — slepen, schalen, draaien, spiegelen, dupliceren, laagvolgorde.
- **Opslaan / laden** als JSON, **export** naar SVG of PNG.
- **Auto-save** in de browser (localStorage), undo/redo (Ctrl+Z / Ctrl+Y).

## Gebruik

Open `index.html` lokaal in je browser, of bezoek de gedeployde site via
GitHub Pages.

## Deploy naar GitHub Pages

1. Push de repository naar GitHub.
2. Ga naar **Settings → Pages** en kies bij *Source* de optie
   **GitHub Actions**.
3. De workflow `.github/workflows/deploy-pages.yml` deployt de site
   automatisch bij elke push naar `main` (of de huidige feature branch).
4. Na een paar minuten is de app beschikbaar op
   `https://<gebruiker>.github.io/<repo>/`.

## Lokaal draaien

Er is geen build-stap nodig. Open `index.html` direct, of start een
eenvoudige server:

```bash
python3 -m http.server 8000
# of
npx serve
```

## Structuur

```
index.html              Hoofdpagina + layout
css/style.css           Styling (donker thema)
js/symbols.js           SVG-symbolenbibliotheek
js/hurore.js            Hurore-template renderer
js/app.js               App-logica (state, drag, export, undo)
.github/workflows/      GitHub Pages deploy workflow
```

## Sneltoetsen

| Toets             | Actie                |
|-------------------|----------------------|
| Ctrl/Cmd + Z      | Ongedaan maken       |
| Ctrl/Cmd + Shift + Z / Ctrl + Y | Opnieuw uitvoeren |
| Ctrl/Cmd + D      | Selectie dupliceren  |
| Delete / Backspace | Selectie verwijderen |
