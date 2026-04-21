// Vite-ready App entry. Re-exports the same components used by CryptoLab.html.
// The seven section files register components on window; we import them for
// side-effects and then read them back. This mirrors the preview exactly.
import './shared.jsx';
import './section_intro.jsx';
import './section_caesar.jsx';
import './section_vigenere.jsx';
import './section_aes.jsx';
import './section_rsa.jsx';
import './section_signature.jsx';
import './section_https.jsx';

// The original app.jsx calls ReactDOM.createRoot directly (because it runs
// via Babel in the preview). For the Vite build we expose a component and
// let main.jsx render it.
import React, { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'intro',     label: 'Alice, Bob & Trudy',    group: 'Foundations',  comp: 'IntroSection' },
  { id: 'caesar',    label: 'Caesar cipher',         group: 'Classical',    comp: 'CaesarSection' },
  { id: 'vigenere',  label: 'Vigenère cipher',       group: 'Classical',    comp: 'VigenereSection' },
  { id: 'aes',       label: 'Symmetric (AES)',       group: 'Modern',       comp: 'AESSection' },
  { id: 'rsa',       label: 'Asymmetric (RSA)',      group: 'Modern',       comp: 'RSASection' },
  { id: 'signature', label: 'Digital signature',     group: 'Modern',       comp: 'SignatureSection' },
  { id: 'https',     label: 'HTTPS in the wild',     group: 'Real world',   comp: 'HTTPSSection' },
];

export default function App() {
  const [active, setActive] = useState(() => localStorage.getItem('cryptolab.section') || 'intro');
  useEffect(() => { localStorage.setItem('cryptolab.section', active); }, [active]);
  const Active = window[SECTIONS.find(s => s.id === active).comp];
  return <Active />;
}
