// Section 2 — Caesar Cipher
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
      eyebrow="02 · Classical ciphers"
      title="Caesar cipher — shift each letter"
      intro="The oldest encryption trick in the book: shift every letter by k positions. Easy to understand, and dangerously easy to break. Try the brute-force attack."
      summary={[
        "Caesar cipher has only 25 possible keys.",
        "An attacker can simply try them all — this is called brute force.",
        "Modern ciphers use astronomically large key spaces so brute force is hopeless.",
      ]}
    >
      <Card className="p-7">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Your message</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900"
            />
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Shift (key k)</label>
                <span className="font-mono text-[13px] text-stone-900">k = {k}</span>
              </div>
              <input
                type="range" min="0" max="25" value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full accent-stone-900"
              />
            </div>
          </div>
          <div className="rounded-xl bg-stone-900 text-amber-200 font-mono p-5 min-w-[220px]">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Encrypted</div>
            <div className="text-[18px] break-all">{cipher || '—'}</div>
          </div>
        </div>

        {/* Alphabet wheels */}
        <div className="mt-7 overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'auto repeat(26, 28px)' }}>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 pr-2 self-center">Plain</div>
            {alphabet.map((c) => (
              <div key={c} className="w-7 h-7 rounded grid place-items-center border border-stone-200 text-[12px] font-mono text-stone-700">{c}</div>
            ))}
            <div className="text-[10px] uppercase tracking-wider text-stone-500 pr-2 self-center">Cipher</div>
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
            <div className="text-[15px] font-semibold text-stone-900">Brute-force attack</div>
            <div className="text-[13px] text-stone-600 mt-1">
              Trudy doesn’t know k. But there are only 26 options — she tries them all.
            </div>
          </div>
          <Button variant={showBrute ? 'secondary' : 'danger'} onClick={() => setShowBrute(!showBrute)}>
            {showBrute ? 'Hide attack' : 'Run brute force'}
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
                {tryK === k && <span className="ml-auto text-[10px] text-emerald-700 font-semibold">✓ HIT</span>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-7">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-[10px] uppercase tracking-wider text-blue-700 mb-2">Kerckhoffs principle</div>
            <div className="text-[13px] text-blue-900 leading-relaxed">
              A cryptosystem must remain secure even if the attacker knows the algorithm.
              Security should rely only on the secrecy of the key.
            </div>
            <div className="mt-3 text-[12px] text-blue-900/80">
              So publishing the algorithm is fine; short or weak keys are the real problem.
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-[10px] uppercase tracking-wider text-stone-600 mb-2">How key length explodes search space</div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-stone-600">Key length (bits)</label>
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
              />
            </div>

            <div className="mb-3">
              <label className="text-[11px] text-stone-600 mb-1 block">Guesses per second</label>
              <select
                value={triesPerSec}
                onChange={(e) => setTriesPerSec(Number(e.target.value))}
                className="w-full p-2 rounded-md border border-stone-300 text-[12px] bg-white"
              >
                <option value={1e6}>1e6 guesses/s</option>
                <option value={1e9}>1e9 guesses/s</option>
                <option value={1e12}>1e12 guesses/s</option>
              </select>
            </div>

            <div className="text-[12px] text-stone-700 space-y-1 font-mono">
              <div>keys: 2^{bits} ~ {fmt(keyCount)}</div>
              <div>time: {fmt(seconds)} seconds</div>
              <div>time: {fmt(years)} years</div>
            </div>
          </div>
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { CaesarSection });
