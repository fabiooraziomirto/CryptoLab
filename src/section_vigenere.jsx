// Section 3 — Vigenère Cipher
const VigenereSection = () => {
  const [msg, setMsg] = useState("ATTACK AT DAWN");
  const [key, setKey] = useState("LEMON");

  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "") || "A";
  const cipher = useMemo(() => vigenere(msg, cleanKey, true), [msg, cleanKey]);

  // Build aligned rows: plain / key / cipher
  const rows = useMemo(() => {
    const P = msg.toUpperCase();
    let j = 0;
    const cells = [];
    for (let i = 0; i < P.length; i++) {
      const c = P[i];
      if (/[A-Z]/.test(c)) {
        const kChar = cleanKey[j % cleanKey.length];
        const shift = kChar.charCodeAt(0) - 65;
        const cipherChar = String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
        cells.push({ p: c, k: kChar, c: cipherChar });
        j++;
      } else {
        cells.push({ p: c === ' ' ? '·' : c, k: '', c: c === ' ' ? '·' : c, space: true });
      }
    }
    return cells;
  }, [msg, cleanKey]);

  return (
    <SectionShell
      eyebrow="03 · Cifrari classici"
      title="Cifrario di Vigenere — la chiave e una parola"
      intro="Invece di spostare tutte le lettere della stessa quantita, qui lo spostamento cambia lettera per lettera seguendo una parola chiave. Prova parole diverse e osserva l'allineamento."
      summary={[
        "Usare una parola chiave rende il cifrario molto piu difficile da forzare rispetto a Cesare.",
        "Ma la parola chiave si ripete: ed e proprio questo a far emergere il pattern.",
        "I cifrari classici ci insegnano che lunghezza della chiave e casualita contano davvero.",
      ]}
    >
      <Card className="p-7">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Messaggio</label>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Parola chiave</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900"
              placeholder="LEMON"
            />
          </div>
        </div>

        {/* Aligned grid */}
        <div className="mt-7 overflow-x-auto">
          <div className="inline-flex flex-col gap-1.5 min-w-full">
            <Row label="Chiaro"  cells={rows.map((r) => r.p)} tone="stone" />
            <Row label="Chiave"  cells={rows.map((r) => r.k)} tone="amber" emphasize />
            <Row label="Cifrato" cells={rows.map((r) => r.c)} tone="ink" />
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900">
          <span className="font-semibold">Nota: </span>
          la parola chiave <span className="font-mono">{cleanKey}</span> si ripete continuamente. Se il messaggio e abbastanza lungo,
          il pattern diventa visibile e quindi attaccabile.
        </div>
      </Card>
    </SectionShell>
  );
};

const Row = ({ label, cells, tone, emphasize }) => {
  const tones = {
    stone: 'bg-white border-stone-200 text-stone-800',
    amber: 'bg-amber-50 border-amber-300 text-amber-900',
    ink: 'bg-stone-900 border-stone-900 text-amber-200',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 w-14">{label}</div>
      <div className="flex gap-1">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`w-7 h-8 grid place-items-center rounded border font-mono text-[13px] ${tones[tone]} ${
              emphasize ? 'font-bold' : ''
            }`}
          >
            {c || ' '}
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { VigenereSection });
