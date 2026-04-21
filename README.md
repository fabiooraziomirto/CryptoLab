# CryptoLab — Laboratorio interattivo di cybersicurezza e crittografia

Una web app interattiva, pensata per principianti, che insegna i concetti fondamentali di cybersicurezza e crittografia (confidenzialita, integrita, autenticazione, cifratura, attacchi) a studenti non tecnici, per esempio di Medicina.

Le sezioni pratiche includono:

1. Alice, Bob e Trudy — perche esiste la crittografia
2. Cifrario di Cesare (con attacco brute-force live)
3. Cifrario di Vigenere (basato su parola chiave)
4. Crittografia simmetrica con AES-GCM del browser
5. Confronto tra DES e 3DES
6. Crittografia asimmetrica (RSA semplificato)
7. Firme digitali (hash + firma + rilevazione manomissioni)
8. HTTPS nel mondo reale (lucchetto del browser, certificati, CA)

Tutto gira al 100% lato client, senza backend.

---

## Anteprima del progetto

Apri `CryptoLab.html`: e la versione React/Babel in un solo file usata per l'anteprima nel tool di design.

## Avvio locale della app Vite

```bash
npm install
npm run dev
```

Poi apri l'URL mostrato nel terminale.

## Deploy su GitHub Pages

1. Crea un repository GitHub (per esempio `cryptolab`) e pubblica questa cartella.
2. Apri `vite.config.js` e aggiorna il campo `base` in modo che corrisponda al nome del repository:
   ```js
   base: '/<your-repo-name>/'
   ```
   (oppure imposta `VITE_BASE=/<your-repo-name>/` come variabile d'ambiente)
   - Per un sito utente/organizzazione servito alla root, impostalo a `'/'`.
3. Esegui build e deploy:
   ```bash
   npm run deploy
   ```
   Questo comando esegue `vite build` e poi pubblica la cartella `dist/` nel branch `gh-pages` usando il pacchetto npm `gh-pages`.
4. Nelle impostazioni del repository → Pages, seleziona **Deploy from branch → `gh-pages` / root**.
5. Il sito sara online su `https://<user>.github.io/<repo-name>/`.

### Note

- La app e completamente statica: nessuna funzionalita server-side e nessuna libreria di routing. Le sezioni vengono renderizzate in modo condizionale in base allo stato React, salvato in `localStorage`.
- Tutti gli asset (font, React, Tailwind) vengono caricati da CDN nella preview HTML; nella build Vite vengono invece bundlati nella cartella `assets/` con nomi hashati.
