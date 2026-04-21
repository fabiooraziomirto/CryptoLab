// Section 2 — Caesar Cipher
const CaesarSection = () => {
  const [text, setText] = useState("HELLO BOB");
  const [k, setK] = useState(3);
  const [showBrute, setShowBrute] = useState(false);

  const cipher = useMemo(() => caesarShift(text, k), [text, k]);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const bruteList = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({ k: i, out: caesarShift(cipher, -i) })),
    [cipher]
  );

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
    </SectionShell>
  );
};

Object.assign(window, { CaesarSection });
