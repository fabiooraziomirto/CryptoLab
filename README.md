# CryptoLab — Interactive Cybersecurity & Cryptography Lab

An interactive, beginner-friendly web app that teaches fundamental concepts of cybersecurity and cryptography (confidentiality, integrity, authentication, encryption, attacks) to non-technical students (e.g. Medicine).

Seven hands-on sections:

1. Alice, Bob & Trudy — why cryptography exists
2. Caesar cipher (with live brute-force attack)
3. Vigenère cipher (keyword-based)
4. Symmetric encryption (AES-style)
5. Asymmetric encryption (RSA, simplified)
6. Digital signatures (hashing + signing + tamper detection)
7. HTTPS in the wild (browser padlock, certificates, CAs)

Everything runs 100% client-side — no backend.

---

## Previewing in this project

Open `CryptoLab.html` — the single-file React/Babel version used for previewing in the design tool.

## Running the Vite app locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal.

## Deploying to GitHub Pages

1. Create a GitHub repo (e.g. `cryptolab`) and push this folder to it.
2. Open `vite.config.js` and update the `base` field to match the repo name:
   ```js
   base: '/<your-repo-name>/'
   ```
   (or set `VITE_BASE=/<your-repo-name>/` as an env variable)
   - For a user/organization site served at the root, set it to `'/'`.
3. Build and deploy:
   ```bash
   npm run deploy
   ```
   This runs `vite build` then publishes the `dist/` folder to the `gh-pages` branch via the `gh-pages` npm package.
4. In the repo settings → Pages, select **Deploy from branch → `gh-pages` / root**.
5. Your site will be live at `https://<user>.github.io/<repo-name>/`.

### Notes

- The app is fully static — no server-side features, no routing library. Sections are conditionally rendered based on React state (persisted in `localStorage`).
- All assets (fonts, React, Tailwind) are loaded from CDNs in the preview HTML; when built with Vite they are bundled under `assets/` with hashed filenames.
