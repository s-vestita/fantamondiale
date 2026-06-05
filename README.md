# Fantamondiale

Simulatore Mondiale 2026: calendario gironi, tabellone, listone fanta, rosa e piazzati.

## Requisiti

- [Node.js](https://nodejs.org/) (v18+)

## Avvio

```bash
cd fantamondiale
npm install    # solo la prima volta (o dopo aver cancellato node_modules)
npm run dev
```

Apri **http://localhost:5173/** nel browser.

## Rosa simulata

La rosa viene salvata in **`rosa.json`** nella cartella del progetto (sul disco, non nel browser). Con `npm run dev` attivo, il pulsante **Salva** nel tab *Simulatore rosa* scrive direttamente quel file. Puoi anche modificarlo a mano o fare backup copiando `rosa.json`.

## Altri comandi

```bash
npm run build    # build di produzione in dist/
npm run preview  # anteprima della build
```
