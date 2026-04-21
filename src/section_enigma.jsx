// Sezione — Macchina Enigma (Seconda Guerra Mondiale)
const EnigmaSection = (() => {

  // ── Rotor definitions (historical Enigma I rotors) ──────────────────────────
  // Each wiring is the substitution for A→Z in order.
  const ROTORS = [
    { name: 'I',   wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' }, // turnover at Q → R
    { name: 'II',  wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
    { name: 'III', wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  ];

  // Reflector B (Umkehrwalze B)
  const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ord = (c) => c.toUpperCase().charCodeAt(0) - 65;
  const chr = (n) => String.fromCharCode(((n % 26) + 26) % 26 + 65);

  // ── Core Enigma logic ────────────────────────────────────────────────────────
  // pos: array of 3 rotor positions (0-25); ringSettings: array of 3 (0-25)
  // plugboard: object like { A:'B', B:'A', ... }
  function enigmaEncryptChar(c, positions, ringSettings, plugboard) {
    if (!/[A-Z]/i.test(c)) return c;
    const ch = c.toUpperCase();

    // Plugboard in
    let sig = plugboard[ch] || ch;

    // Rotor stepping (before encryption)
    const pos = [...positions]; // mutable copy for stepping
    const notches = ROTORS.map((r) => r.notch);
    // Double-stepping anomaly
    const atNotch1 = A[pos[1]] === notches[1];
    const atNotch2 = A[pos[2]] === notches[2];
    if (atNotch1) { pos[0] = (pos[0] + 1) % 26; pos[1] = (pos[1] + 1) % 26; }
    else if (atNotch2) { pos[1] = (pos[1] + 1) % 26; }
    if (A[pos[2]] === notches[2]) pos[2] = (pos[2] + 1) % 26; // will be written back by caller

    // Copy stepped positions back
    positions[0] = pos[0];
    positions[1] = pos[1];
    positions[2] = pos[2];

    // Forward through rotors (right → left: rotor 2, 1, 0)
    let idx = ord(sig);
    for (let r = 2; r >= 0; r--) {
      const offset = (pos[r] - ringSettings[r] + 26) % 26;
      const entry  = (idx + offset + 26) % 26;
      const wired  = ord(ROTORS[r].wiring[entry]);
      idx = (wired - offset + 26) % 26;
    }

    // Reflector
    idx = ord(REFLECTOR_B[idx]);

    // Backward through rotors (left → right: rotor 0, 1, 2)
    for (let r = 0; r <= 2; r++) {
      const offset = (pos[r] - ringSettings[r] + 26) % 26;
      const entry  = (idx + offset + 26) % 26;
      const wired  = ROTORS[r].wiring.indexOf(chr(entry));
      idx = (wired - offset + 26) % 26;
    }

    // Plugboard out
    const out = plugboard[chr(idx)] || chr(idx);
    return out;
  }

  // Encrypt a full string, returning { ciphertext, finalPositions }
  function enigmaEncrypt(plaintext, startPositions, ringSettings, plugboard) {
    const pos = [...startPositions];
    let out = '';
    for (const c of plaintext.toUpperCase()) {
      if (/[A-Z]/.test(c)) {
        out += enigmaEncryptChar(c, pos, ringSettings, plugboard);
      } else {
        out += c;
      }
    }
    return { ciphertext: out, finalPositions: [...pos] };
  }

  // Parse plugboard string like "AB CD EF" → bidirectional map
  function parsePlugboard(str) {
    const pb = {};
    const pairs = str.toUpperCase().match(/[A-Z]{2}/g) || [];
    for (const pair of pairs) {
      if (pair[0] !== pair[1]) {
        pb[pair[0]] = pair[1];
        pb[pair[1]] = pair[0];
      }
    }
    return pb;
  }

  // ── Bombe-style attack simulation ───────────────────────────────────────────
  // Given a crib (known plaintext) and the ciphertext, try all start positions
  // for rotor III (fast rotor only, for demo speed) to find candidates.
  function bombeAttack(ciphertext, crib, ringSettings, plugboard) {
    const ct = ciphertext.replace(/[^A-Z]/gi, '').toUpperCase();
    const cr = crib.replace(/[^A-Z]/gi, '').toUpperCase();
    const results = [];
    for (let p2 = 0; p2 < 26; p2++) {
      for (let p1 = 0; p1 < 26; p1++) {
        for (let p0 = 0; p0 < 26; p0++) {
          const { ciphertext: dec } = enigmaEncrypt(ct, [p0, p1, p2], ringSettings, plugboard);
          if (dec.includes(cr)) {
            results.push({ pos: `${A[p0]}${A[p1]}${A[p2]}`, decrypted: dec });
            if (results.length >= 5) return results; // cap results
          }
        }
      }
    }
    return results;
  }

  // ── React Component ──────────────────────────────────────────────────────────
  return function EnigmaSection() {
    const [plaintext, setPlaintext]       = useState('WEATHER REPORT SUNNY');
    const [rotorPos, setRotorPos]         = useState([0, 0, 0]);   // A A A
    const [ringSettings, setRingSettings] = useState([0, 0, 0]);   // A A A
    const [plugboardStr, setPlugboardStr] = useState('AZ BX CW');
    const [activeTab, setActiveTab]       = useState('encrypt');   // encrypt | bombe | story
    const [crib, setCrib]                 = useState('WEATHER');
    const [bombeRunning, setBombeRunning] = useState(false);
    const [bombeResults, setBombeResults] = useState(null);
    const [bombeTried, setBombeTried]     = useState(0);
    const [lastKey, setLastKey]           = useState(null);
    const [signalPath, setSignalPath]     = useState([]);

    const plugboard = useMemo(() => parsePlugboard(plugboardStr), [plugboardStr]);

    const { ciphertext } = useMemo(
      () => enigmaEncrypt(plaintext.replace(/[^A-Za-z ]/g, ''), rotorPos, ringSettings, plugboard),
      [plaintext, rotorPos, ringSettings, plugboard]
    );

    // Live single-key press animation
    const pressKey = useCallback((letter) => {
      const pos = [...rotorPos];
      const path = [];
      const ch = letter.toUpperCase();

      // Stepping
      const notches = ROTORS.map((r) => r.notch);
      const atN1 = A[pos[1]] === notches[1];
      const atN2 = A[pos[2]] === notches[2];
      if (atN1)      { pos[0] = (pos[0]+1)%26; pos[1] = (pos[1]+1)%26; }
      else if (atN2) { pos[1] = (pos[1]+1)%26; }
      if (A[pos[2]] === notches[2]) pos[2] = (pos[2]+1)%26;

      // Plugboard in
      let sig = plugboard[ch] || ch;
      path.push({ stage: 'Plugboard in', char: sig });

      // Forward rotors
      let idx = ord(sig);
      for (let r = 2; r >= 0; r--) {
        const offset = (pos[r] - ringSettings[r] + 26) % 26;
        const entry  = (idx + offset + 26) % 26;
        const wired  = ord(ROTORS[r].wiring[entry]);
        idx = (wired - offset + 26) % 26;
        path.push({ stage: `Rotor ${ROTORS[r].name} →`, char: chr(idx) });
      }

      // Reflector
      idx = ord(REFLECTOR_B[idx]);
      path.push({ stage: 'Reflector B', char: chr(idx) });

      // Backward rotors
      for (let r = 0; r <= 2; r++) {
        const offset = (pos[r] - ringSettings[r] + 26) % 26;
        const entry  = (idx + offset + 26) % 26;
        const wired  = ROTORS[r].wiring.indexOf(chr(entry));
        idx = (wired - offset + 26) % 26;
        path.push({ stage: `Rotor ${ROTORS[r].name} ←`, char: chr(idx) });
      }

      // Plugboard out
      const out = plugboard[chr(idx)] || chr(idx);
      path.push({ stage: 'Plugboard out', char: out });

      setLastKey({ input: ch, output: out });
      setSignalPath(path);
      setRotorPos(pos);
    }, [rotorPos, ringSettings, plugboard]);

    const runBombe = useCallback(() => {
      setBombeRunning(true);
      setBombeResults(null);
      setBombeTried(0);
      let count = 0;
      const total = 26 * 26 * 26;
      const interval = setInterval(() => {
        count = Math.min(count + 400, total);
        setBombeTried(count);
        if (count >= total) {
          clearInterval(interval);
          const r = bombeAttack(ciphertext, crib, ringSettings, plugboard);
          setBombeResults(r);
          setBombeRunning(false);
        }
      }, 30);
    }, [ciphertext, crib, ringSettings, plugboard]);

    const posLabel = (p) => A[p];

    const tabCls = (t) =>
      `px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`;

    return (
      <SectionShell
        eyebrow="05 · Classical ciphers"
        title="Enigma — la macchina cifrante della Wehrmacht"
        intro="La macchina Enigma usava rotori, un pannello a spina e un riflettore per produrre una cifratura polialfabetica con miliardi di configurazioni possibili. Gli Alleati la decriptarono con la 'Bombe' di Turing, sfruttando testi in chiaro noti."
        summary={[
          "Enigma combina tre rotori che avanzano (stepping), creando un cifrario polialfabetico estremamente complesso.",
          "La proprietà chiave per la sicurezza è che nessuna lettera può cifrare se stessa — ma questo fu anche il suo tallone d'Achille.",
          "Alan Turing e il team di Bletchley Park costruirono la 'Bombe' per sfruttare i 'cribs' (testi noti) e ridurre lo spazio di ricerca.",
          "La crittanalisi di Enigma accorciò la guerra di stimati 2–4 anni e pose le basi della crittografia e informatica moderna.",
        ]}
      >
        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap">
          <button className={tabCls('encrypt')}  onClick={() => setActiveTab('encrypt')}>🔐 Cifra un messaggio</button>
          <button className={tabCls('keyboard')} onClick={() => setActiveTab('keyboard')}>⌨️  Tastiera interattiva</button>
          <button className={tabCls('bombe')}    onClick={() => setActiveTab('bombe')}>⚙️  Attacco Bombe</button>
          <button className={tabCls('story')}    onClick={() => setActiveTab('story')}>📖  La storia</button>
        </div>

        {/* ── TAB: encrypt ── */}
        {activeTab === 'encrypt' && (
          <Card className="p-7 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Rotor positions */}
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">Posizioni rotori (chiave del giorno)</div>
                <div className="flex gap-3">
                  {[0,1,2].map((r) => (
                    <div key={r} className="flex flex-col items-center gap-1">
                      <div className="text-[10px] text-stone-400 uppercase">Rot {ROTORS[r].name}</div>
                      <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-300 font-mono text-[22px] grid place-items-center font-bold select-none cursor-pointer"
                        onClick={() => setRotorPos(p => { const n=[...p]; n[r]=(n[r]+1)%26; return n; })}
                        title={`Clicca per avanzare il rotore ${ROTORS[r].name}`}
                        aria-label={`Rotore ${ROTORS[r].name}: posizione ${posLabel(rotorPos[r])}. Clicca per avanzare`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? setRotorPos(p => { const n=[...p]; n[r]=(n[r]+1)%26; return n; }) : null}
                      >
                        {posLabel(rotorPos[r])}
                      </div>
                      <div className="text-[9px] text-stone-400">↑ clicca</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ring settings */}
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">Ringstellung (offset anello)</div>
                <div className="flex gap-3">
                  {[0,1,2].map((r) => (
                    <div key={r} className="flex flex-col items-center gap-1">
                      <div className="text-[10px] text-stone-400 uppercase">Rot {ROTORS[r].name}</div>
                      <select
                        value={ringSettings[r]}
                        onChange={(e) => setRingSettings(p => { const n=[...p]; n[r]=parseInt(e.target.value); return n; })}
                        className="w-12 h-12 rounded-xl border border-stone-300 text-[13px] font-mono text-center focus:outline-none focus:border-stone-900"
                      >
                        {A.split('').map((l,i) => <option key={l} value={i}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plugboard */}
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">Steckerbrett (coppie di spina)</div>
                <input
                  value={plugboardStr}
                  onChange={(e) => setPlugboardStr(e.target.value.toUpperCase())}
                  placeholder="es. AB CD EF GH"
                  className="w-full p-3 rounded-lg border border-stone-300 text-[14px] font-mono focus:outline-none focus:border-stone-900"
                />
                <div className="text-[11px] text-stone-400 mt-1">Coppie separate da spazio (max 10)</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Testo in chiaro</label>
                <textarea
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value.toUpperCase())}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Testo cifrato (Enigma)</label>
                <div className="w-full p-3 rounded-xl bg-stone-900 text-amber-200 font-mono text-[15px] min-h-[88px] break-all leading-relaxed">
                  {ciphertext || '—'}
                </div>
              </div>
            </div>

            {/* Rotor visualisation */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">Stato rotori in tempo reale</div>
              <div className="flex gap-4 flex-wrap">
                {ROTORS.map((rot, r) => (
                  <div key={r} className="rounded-xl border border-stone-200 overflow-hidden" style={{width: 80}}>
                    <div className="bg-stone-100 text-[10px] uppercase tracking-wider text-stone-500 text-center py-1">Rot {rot.name}</div>
                    <div className="py-2">
                      {[-1,0,1].map((delta) => {
                        const p = ((rotorPos[r] + delta) % 26 + 26) % 26;
                        const isCurrent = delta === 0;
                        return (
                          <div key={delta} className={`text-center font-mono text-[13px] py-0.5 ${isCurrent ? 'bg-amber-300 font-bold text-stone-900' : 'text-stone-400'}`}>
                            {A[p]}
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-stone-50 text-[9px] text-stone-400 text-center py-1">notch {rot.notch}</div>
                  </div>
                ))}
                <div className="rounded-xl border border-stone-200 overflow-hidden" style={{width: 80}}>
                  <div className="bg-stone-100 text-[10px] uppercase tracking-wider text-stone-500 text-center py-1">Rifl. B</div>
                  <div className="py-2">
                    <div className="text-center font-mono text-[11px] text-stone-400 py-0.5">fisso</div>
                  </div>
                  <div className="bg-stone-50 text-[9px] text-stone-400 text-center py-1">UKW-B</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-[13px] text-blue-800">
              <strong>⚡ Proprietà chiave:</strong> Enigma è <em>auto-reciproca</em> — cifrare il testo cifrato con le stesse impostazioni restituisce il testo originale. Ma questo significa anche che <strong>nessuna lettera può cifrare se stessa</strong>, un punto debole sfruttato da Turing.
            </div>
          </Card>
        )}

        {/* ── TAB: keyboard ── */}
        {activeTab === 'keyboard' && (
          <Card className="p-7 space-y-6">
            <p className="text-[14px] text-stone-600">Premi un tasto per vedere il percorso del segnale elettrico attraverso i componenti della macchina. La posizione dei rotori avanza ad ogni pressione.</p>
            {/* Keyboard */}
            <div className="space-y-2">
              {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row) => (
                <div key={row} className="flex gap-2 flex-wrap justify-center">
                  {row.split('').map((k) => (
                    <button
                      key={k}
                      onClick={() => pressKey(k)}
                      aria-label={`Premi tasto Enigma ${k}`}
                      className="w-10 h-10 rounded-lg border-2 border-stone-300 bg-stone-50 text-stone-800 font-mono font-bold text-[15px] hover:bg-stone-200 hover:border-stone-400 active:bg-amber-200 transition-colors select-none"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Signal path */}
            {lastKey && (
              <div className="rounded-xl border border-stone-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-[30px] font-mono font-bold text-stone-900 w-10 text-center">{lastKey.input}</div>
                  <div className="text-stone-400 text-[20px]">→</div>
                  <div className="text-[30px] font-mono font-bold text-amber-500 w-10 text-center">{lastKey.output}</div>
                  <div className="text-[12px] text-stone-500 ml-2">Rotori: {rotorPos.map(p => A[p]).join(' ')}</div>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-stone-400 mb-2">Percorso del segnale</div>
                <div className="flex flex-wrap gap-2">
                  {signalPath.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-stone-300">›</span>}
                      <div className="rounded-lg bg-stone-100 px-2 py-1">
                        <div className="text-[9px] text-stone-400 uppercase">{step.stage}</div>
                        <div className="font-mono font-bold text-[14px] text-stone-900">{step.char}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!lastKey && (
              <div className="text-center text-stone-400 text-[14px] py-6">Premi un tasto per iniziare…</div>
            )}
            {/* Rotor display */}
            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-[11px] uppercase tracking-wider text-stone-500">Posizione rotori:</div>
              {[0,1,2].map((r) => (
                <div key={r} className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-400 uppercase">{ROTORS[r].name}</span>
                  <span className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 font-mono font-bold text-[14px] grid place-items-center">{A[rotorPos[r]]}</span>
                </div>
              ))}
              <button onClick={() => { setRotorPos([0,0,0]); setLastKey(null); setSignalPath([]); }} className="ml-2 text-[11px] text-stone-400 hover:text-stone-700 underline" aria-label="Reimposta posizione di tutti i rotori a AAA">reimposta</button>
            </div>
          </Card>
        )}

        {/* ── TAB: bombe ── */}
        {activeTab === 'bombe' && (
          <Card className="p-7 space-y-6">
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-[13px] text-rose-800">
              <strong>🔍 Come funziona la Bombe di Turing:</strong> Gli analisti di Bletchley Park spesso conoscevano porzioni del testo in chiaro (<em>cribs</em>) perché i messaggi tedeschi seguivano schemi prevedibili ("KEINE BESONDERENMELDUNGEN" = nessuna novità, o previsioni meteo standard). La Bombe testava migliaia di impostazioni al secondo per trovare quale configurazione produceva il crib noto nel punto giusto del cifrato.
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Testo cifrato da attaccare</label>
                <div className="w-full p-3 rounded-xl bg-stone-900 text-amber-200 font-mono text-[14px] min-h-[60px] break-all">{ciphertext || '—'}</div>
                <div className="text-[11px] text-stone-400 mt-1">Cifrato dalla scheda "Cifra un messaggio" con le impostazioni attuali</div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Crib (testo noto)</label>
                <input
                  value={crib}
                  onChange={(e) => setCrib(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                  className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900"
                  placeholder="es. WEATHER"
                />
                <div className="text-[11px] text-stone-400 mt-1">Deve essere una parola nota nel messaggio originale</div>
              </div>
            </div>

            <div>
              <Button onClick={runBombe} disabled={bombeRunning} variant="primary" aria-label={bombeRunning ? 'Attacco Bombe in esecuzione, attendere' : 'Avvia simulazione attacco Bombe'}>
                {bombeRunning ? '⚙️  Bombe in esecuzione…' : '▶  Avvia attacco Bombe'}
              </Button>
            </div>

            {(bombeRunning || bombeResults !== null) && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] text-stone-500 mb-1">
                    <span>Combinazioni testate</span>
                    <span>{bombeTried.toLocaleString()} / 17.576</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-75"
                      style={{ width: `${(bombeTried / 17576) * 100}%` }}
                    />
                  </div>
                </div>

                {bombeResults !== null && (
                  <div>
                    {bombeResults.length === 0 ? (
                      <div className="text-[13px] text-stone-500 rounded-xl bg-stone-50 border border-stone-200 p-4">
                        Nessuna corrispondenza trovata. Prova a modificare il crib o usa le stesse impostazioni della scheda di cifratura.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[12px] uppercase tracking-wider text-stone-500">Configurazioni candidate trovate:</div>
                        {bombeResults.map((r, i) => (
                          <div key={i} className="flex items-start gap-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                            <div className="rounded-lg bg-emerald-600 text-white font-mono font-bold text-[16px] w-16 h-12 grid place-items-center flex-shrink-0">{r.pos}</div>
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-emerald-700 mb-1">Posizione rotori: {r.pos}</div>
                              <div className="font-mono text-[13px] text-stone-800 break-all">{r.decrypted}</div>
                            </div>
                          </div>
                        ))}
                        <div className="text-[12px] text-stone-500">✅ La Bombe ha trovato la chiave! In Bletchley Park questo richiedeva ore di calcolo meccanico; qui ci sono voluti pochi secondi.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* ── TAB: story ── */}
        {activeTab === 'story' && (
          <div className="space-y-4">
            {[
              {
                year: '1918',
                icon: '🔧',
                title: 'Invenzione di Enigma',
                text: "L'ingegnere tedesco Arthur Scherbius brevetta la macchina Enigma originariamente per uso commerciale. La Wehrmacht la adotta e la modifica aggiungendo il pannello a spina (Steckerbrett) che moltiplica le combinazioni di 150 trilioni di volte.",
                color: 'bg-stone-50 border-stone-200',
              },
              {
                year: '1932',
                icon: '🇵🇱',
                title: 'I polacchi aprono la strada',
                text: "Il matematico polacco Marian Rejewski, con i colleghi Różycki e Zygalski, ricostruisce la cablatura interna dei rotori grazie a un informatore francese e alla matematica dei gruppi. Costruiscono le prime 'bomby' meccaniche. Prima della guerra, condividono tutto con Francia e Gran Bretagna.",
                color: 'bg-amber-50 border-amber-200',
              },
              {
                year: '1939–40',
                icon: '🏚️',
                title: 'Bletchley Park',
                text: "Il Governo britannico raduna matematici, linguisti, scacchisti a Bletchley Park (BP). Alan Turing e Gordon Welchman migliorano la bomba polacca creando la 'Bombe' elettromeccanica britannica che sfrutta i cribs — porzioni di testo noto — e la struttura ciclica di Enigma.",
                color: 'bg-blue-50 border-blue-200',
              },
              {
                year: '1941',
                icon: '⚓',
                title: 'Cattura dell\'U-110',
                text: "La Royal Navy cattura il sommergibile U-110 con una macchina Enigma navale intatta, rotori extra e i libri delle chiavi. Questa operazione (Operation Primrose) permette di leggere i messaggi della Marina per mesi, salvando migliaia di navi dalle navi-U.",
                color: 'bg-emerald-50 border-emerald-200',
              },
              {
                year: '1944',
                icon: '🖥️',
                title: 'Colossus e il dopo-Enigma',
                text: "Per decrittare il cifario Lorenz (usato da Hitler per le comunicazioni di alto livello), BP costruisce Colossus, considerato il primo computer elettronico programmabile della storia. Il lavoro di Turing e colleghi pone le basi teoriche dell'informatica moderna.",
                color: 'bg-rose-50 border-rose-200',
              },
              {
                year: '1974',
                icon: '🔓',
                title: 'Declassificazione',
                text: "Il programma ULTRA (nome in codice per la decrittazione di Enigma) viene declassificato. Si stima che la crittanalisi abbia accorciato la guerra di 2–4 anni e salvato milioni di vite. Winston Churchill la definì il 'goose that laid the golden eggs but never cackled'.",
                color: 'bg-purple-50 border-purple-200',
              },
            ].map((ev) => (
              <div key={ev.year} className={`rounded-2xl border p-5 ${ev.color}`}>
                <div className="flex gap-4 items-start">
                  <div className="text-[28px] flex-shrink-0">{ev.icon}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[11px] font-mono bg-stone-900 text-amber-300 px-2 py-0.5 rounded">{ev.year}</span>
                      <span className="font-semibold text-[15px] text-stone-900">{ev.title}</span>
                    </div>
                    <p className="text-[13px] text-stone-600 leading-relaxed">{ev.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>
    );
  };
})();

window.EnigmaSection = EnigmaSection;
