# Grafic variație (%) cu etichete auto-poziționate — Community Visualization pentru Looker Studio

Acest folder conține o vizualizare custom care recreează graficul tău din Excel:
coloane + linie conector + etichetă de % care se poziționează **automat** deasupra
(verde) sau dedesubt (roșu), în funcție de semnul variației. Nu mai muți nimic manual —
se leagă live la un Google Sheet / BigQuery și se actualizează singură.

## De ce funcționează fără muncă manuală

Diferența față de Excel: în `src/index.js`, poziția etichetei (`labelY`) e calculată
direct din semnul procentului (`isPos`), nu e o poziție fixă setată din UI. Când
adaugi o lună nouă cu valoare mai mică, eticheta sare automat dedesubt; nu există
pas manual de repoziționat.

## Pași de urmat (o singură dată, ~15-20 minute)

### 1. Instalează Node.js
Dacă nu ai deja: https://nodejs.org (versiunea LTS).

### 2. Instalează dependențele și fă build
În acest folder, din terminal:
```
npm install
npm run build
```
Asta generează `dist/variance_waterfall_chart.js` — fișierul pe care Looker Studio
îl va încărca efectiv.

### 3. Găzduiește folderul online (GitHub Pages e cel mai simplu, gratuit)
- Creează un repo nou pe GitHub, ex. `variance-chart`.
- Încarcă TOT folderul (inclusiv `dist/`, `manifest.json`, `src/viz_config.json`).
- Settings → Pages → activează pentru branch-ul `main`, folder root.
- Vei primi un URL de tipul:
  `https://<user-ul-tau>.github.io/variance-chart/`

### 4. Verifică URL-urile din `manifest.json`
Trebuie să fie accesibile public la:
- `https://<user>.github.io/variance-chart/dist/variance_waterfall_chart.js`
- `https://<user>.github.io/variance-chart/src/viz_config.json`

(iconițele le poți lăsa cum sunt, sunt opționale)

### 5. Înregistrează componenta în Looker Studio
1. Mergi la https://lookerstudio.google.com
2. Creează un raport nou → Add a chart → **Build your own visualization** (jos de tot)
3. Se deschide un ecran unde introduci URL-ul către `manifest.json`:
   `https://<user>.github.io/variance-chart/manifest.json`
4. Apasă "Validate and Add" → componenta apare în panoul de grafice.

### 6. Conectează datele
- Adaugă o sursă de date (Google Sheets e cel mai simplu — un tab cu 2 coloane:
  `Luna` și `Valoare`).
- Selectează graficul nou creat.
- Dimension = `Luna`, Metric = `Valoare`.
- Din panoul Style poți schimba culorile (verde/roșu), simbolul monedei, numărul
  de zecimale la %.

### 7. Actualizare automată
De acum, orice rând nou adăugat în Google Sheet apare automat în grafic — nu mai
trebuie să atingi codul sau să repoziționezi vreo etichetă.

## Pentru a testa local înainte de a publica (opțional)
Deschide `src/index.js`, pune `LOCAL = true`, rulează `npm run watch` și deschide
`dist/variance_waterfall_chart.js` printr-un `index.html` simplu cu
`<div id="container"></div>` + `<script src="dist/variance_waterfall_chart.js"></script>`.

## Dacă vrei să modific ceva vizual
Spune-mi exact ce (ex: capetele liniei mai groase, alt font, procent cu o zecimală
by default etc.) și actualizez `src/index.js`.
