// Vite-ready App entry. Re-exports the same components used by CryptoLab.html.
// The seven section files register components on window; we import them for
// side-effects and then read them back. This mirrors the preview exactly.
import './shared.jsx';
import './section_intro.jsx';
import './section_concepts.jsx';
import './section_attacks.jsx';
import './section_caesar.jsx';
import './section_alberti.jsx';
import './section_vigenere.jsx';
import './section_enigma.jsx';
import './section_aes.jsx';
import './section_des.jsx';
import './section_rsa.jsx';
import './section_hybrid.jsx';
import './section_signature.jsx';
import './section_https.jsx';
import './section_pgp.jsx';

// The original app.jsx calls ReactDOM.createRoot directly (because it runs
// via Babel in the preview). For the Vite build we expose a component and
// let main.jsx render it.
import React, { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'intro',     label: 'Alice, Bob e Trudy',        group: 'Fondamenti', comp: 'IntroSection' },
  { id: 'concepts',  label: 'Codifica, Hash e Cifratura',group: 'Fondamenti', comp: 'ConceptsSection' },
  { id: 'attacks',   label: 'Tipi di attacco',           group: 'Fondamenti', comp: 'AttacksSection' },
  { id: 'caesar',    label: 'Cifrario di Cesare',        group: 'Classici',   comp: 'CaesarSection' },
  { id: 'alberti',   label: 'Disco di Alberti',          group: 'Classici',   comp: 'AlbertiSection' },
  { id: 'vigenere',  label: 'Cifrario di Vigenere',      group: 'Classici',   comp: 'VigenereSection' },
  { id: 'enigma',    label: 'Macchina Enigma',           group: 'Classici',   comp: 'EnigmaSection' },
  { id: 'aes',       label: 'Crittografia simmetrica',   group: 'Moderni',    comp: 'AESSection' },
  { id: 'legacy',    label: 'DES e 3DES',                group: 'Moderni',    comp: 'LegacyBlockSection' },
  { id: 'rsa',       label: 'Crittografia asimmetrica',  group: 'Moderni',    comp: 'RSASection' },
  { id: 'hybrid',    label: 'Crittografia ibrida',       group: 'Moderni',    comp: 'HybridSection' },
  { id: 'signature', label: 'Firma digitale',            group: 'Moderni',    comp: 'SignatureSection' },
  { id: 'https',     label: 'HTTPS nel mondo reale',     group: 'Mondo reale', comp: 'HTTPSSection' },
  { id: 'pgp',       label: 'Email sicura con PGP',      group: 'Mondo reale', comp: 'PGPSection' },
];

const GROUP_COLORS = {
  Fondamenti: 'bg-blue-50 text-blue-700 border-blue-200',
  Classici: 'bg-amber-50 text-amber-800 border-amber-200',
  Moderni: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Mondo reale': 'bg-stone-100 text-stone-700 border-stone-200',
};

function Dashboard({ onOpenSection }) {
  const byGroup = SECTIONS.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  const total = SECTIONS.length;

  return (
    <div className="max-w-[1150px] mx-auto px-8 py-10">
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 text-stone-100 p-7 md:p-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-stone-300 mb-2">Panoramica CryptoLab</div>
        <h1 className="text-[30px] md:text-[36px] leading-tight font-semibold tracking-tight mb-3">
          Percorso interattivo nella sicurezza
        </h1>
        <p className="text-[14px] text-stone-200 max-w-[760px] leading-relaxed">
          Inizia dai fondamenti e avanza fino ai casi reali. Ogni sezione è interattiva e costruita
          per consolidare i concetti della lezione in modo visuale.
        </p>

        <div className="mt-6 flex gap-3">
          <div className="rounded-xl bg-white/10 border border-white/20 p-4 min-w-[120px]">
            <div className="text-[11px] uppercase tracking-wider text-stone-300 mb-1">Sezioni totali</div>
            <div className="text-[24px] font-semibold">{total}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-7">
        {Object.entries(byGroup).map(([group, items]) => (
          <div key={group}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border font-medium ${GROUP_COLORS[group]}`}>
                {group}
              </span>
              <span className="text-[12px] text-stone-500">{items.length} argomenti</span>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((s, idx) => {
                return (
                  <div key={s.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-500">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="text-[15px] font-semibold text-stone-900 mb-3">{s.label}</div>

                    <button
                      onClick={() => onOpenSection(s.id)}
                      className="w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-[12px] font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                    >
                      Apri sezione
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(() => localStorage.getItem('cryptolab.section') || 'dashboard');

  useEffect(() => {
    localStorage.setItem('cryptolab.section', active);
  }, [active]);

  if (active === 'dashboard') {
    return <Dashboard onOpenSection={setActive} />;
  }

  const selected = SECTIONS.find((s) => s.id === active) || SECTIONS[0];
  const Active = window[selected.comp] || window.IntroSection;
  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-[1100px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <button
            onClick={() => setActive('dashboard')}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          >
            Panoramica
          </button>
          <div className="text-[11px] uppercase tracking-wider text-stone-500 truncate">{selected.group} - {selected.label}</div>
        </div>
      </div>
      <Active />
    </div>
  );
}
