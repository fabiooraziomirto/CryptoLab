// Sezione 02 — Cifrario di Cesare
const CaesarSection = () => {
  const [text, setText] = useState("HELLO BOB");
  const [k, setK] = useState(3);
  const [showBrute, setShowBrute] = useState(false);
  const [bits, setBits] = useState(56);
  const [triesPerSec, setTriesPerSec] = useState(1e9);

  const cipher = useMemo(() => caesarShift(text, k), [text, k]);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const bruteList = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({ k: i, out: caesarShift(cipher, -i) })),
    [cipher]
  );

  const keyCount = useMemo(() => 2 ** bits, [bits]);
  const seconds = useMemo(() => keyCount / triesPerSec, [keyCount, triesPerSec]);
  const years = seconds / (3600 * 24 * 365);

  const fmt = (n) => {
    if (!Number.isFinite(n) || n > 1e15) return n.toExponential(2);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(0);
  };

  return (
    <SectionShell
      eyebrow="02 · Cifrari classici"
      title="Cifrario di Cesare — sposta ogni lettera"
      intro="Il trucco di cifratura piu antico: spostare ogni lettera di k posizioni. Facile da capire, ma anche pericolosamente facile da rompere. Prova l'attacco brute force."
      summary={[
        "Il cifrario di Cesare ha solo 25 chiavi possibili.",
        "Un attaccante puo provarle tutte: questo si chiama brute force.",
        "I cifrari moderni usano spazi di chiavi enormi, quindi il brute force diventa impraticabile.",
      ]}
    >
      <Card className="p-7">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Il tuo messaggio</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900"
            />
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Spostamento (chiave k)</label>
                <span className="font-mono text-[13px] text-stone-900">k = {k}</span>
              </div>
              <input
                type="range" min="0" max="25" value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full accent-stone-900"
                aria-label={`Spostamento della chiave: ${k} posizioni`}
              />
            </div>
          </div>
          <div className="rounded-xl bg-stone-900 text-amber-200 font-mono p-5 min-w-[220px]">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Cifrato</div>
            <div className="text-[18px] break-all">{cipher || '—'}</div>
          </div>
        </div>

        {/* Alphabet wheels */}
        <div className="mt-7 overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'auto repeat(26, 28px)' }}>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 pr-2 self-center">Chiaro</div>
            {alphabet.map((c) => (
              <div key={c} className="w-7 h-7 rounded grid place-items-center border border-stone-200 text-[12px] font-mono text-stone-700">{c}</div>
            ))}
            <div className="text-[10px] uppercase tracking-wider text-stone-500 pr-2 self-center">Cifrato</div>
            {alphabet.map((c, i) => (
              <div
                key={c}
                className="w-7 h-7 rounded grid place-items-center border text-[12px] font-mono"
                style={{
                  background: '#1c1917',
                  color: '#fcd34d',
                  borderColor: '#1c1917',
                  transform: `translateY(${i % 2 === 0 ? 0 : 0}px)`,
                }}
              >
                {alphabet[(i + k) % 26]}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[15px] font-semibold text-stone-900">Attacco brute force</div>
            <div className="text-[13px] text-stone-600 mt-1">
              Trudy non conosce k. Ma le opzioni sono solo 26, quindi le prova tutte.
            </div>
          </div>
          <Button
            variant={showBrute ? 'secondary' : 'danger'}
            onClick={() => setShowBrute(!showBrute)}
            aria-label={showBrute ? 'Nascondi i risultati del brute force' : 'Avvia attacco brute force su tutti i 25 turni possibili'}
          >
            {showBrute ? 'Nascondi attacco' : 'Avvia brute force'}
          </Button>
        </div>
        {showBrute && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2">
            {bruteList.map(({ k: tryK, out }) => (
              <div
                key={tryK}
                className={`font-mono text-[12px] p-2 rounded-lg border flex items-center gap-3 ${
                  tryK === k ? 'bg-emerald-50 border-emerald-300' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <span className="text-stone-500 w-10">k={tryK}</span>
                <span className="text-stone-900 truncate">{out}</span>
                {tryK === k && <span className="ml-auto text-[10px] text-emerald-700 font-semibold">✓ TROVATA</span>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-7">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-[10px] uppercase tracking-wider text-blue-700 mb-2">Principio di Kerckhoffs</div>
            <div className="text-[13px] text-blue-900 leading-relaxed">
              Un crittosistema deve restare sicuro anche se l'attaccante conosce l'algoritmo.
              La sicurezza deve dipendere solo dalla segretezza della chiave.
            </div>
            <div className="mt-3 text-[12px] text-blue-900/80">
              Pubblicare l'algoritmo quindi va bene; il vero problema sono le chiavi corte o deboli.
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-[10px] uppercase tracking-wider text-stone-600 mb-2">Come la lunghezza della chiave fa esplodere lo spazio di ricerca</div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-stone-600">Lunghezza chiave (bit)</label>
                <span className="font-mono text-[12px]">{bits}</span>
              </div>
              <input
                type="range"
                min="8"
                max="128"
                step="8"
                value={bits}
                onChange={(e) => setBits(parseInt(e.target.value, 10))}
                className="w-full accent-stone-900"
                aria-label={`Lunghezza chiave: ${bits} bit`}
              />
            </div>

            <div className="mb-3">
              <label className="text-[11px] text-stone-600 mb-1 block">Tentativi al secondo</label>
              <select
                value={triesPerSec}
                onChange={(e) => setTriesPerSec(Number(e.target.value))}
                className="w-full p-2 rounded-md border border-stone-300 text-[12px] bg-white"
              >
                <option value={1e6}>1e6 tentativi/s</option>
                <option value={1e9}>1e9 tentativi/s</option>
                <option value={1e12}>1e12 tentativi/s</option>
              </select>
            </div>

            <div className="text-[12px] text-stone-700 space-y-1 font-mono">
              <div>chiavi: 2^{bits} ~ {fmt(keyCount)}</div>
              <div>tempo: {fmt(seconds)} secondi</div>
              <div>tempo: {fmt(years)} anni</div>
            </div>
          </div>
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { CaesarSection });
