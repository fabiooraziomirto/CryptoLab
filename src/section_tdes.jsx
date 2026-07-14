// Section — Triple DES (3DES)
const TDESSection = () => {
  const [msg, setMsg] = useState("Classified: transfer $1,000,000");
  const [k1, setK1] = useState(() => randomKey(7));
  const [k2, setK2] = useState(() => randomKey(7));
  const [k3, setK3] = useState(() => randomKey(7));
  const [bobKeys, setBobKeys] = useState({ k1: '', k2: '', k3: '' });
  const [mode, setMode] = useState('encrypt');
  const [showSteps, setShowSteps] = useState(false);

  const cipher = useMemo(() => fake3DES(msg, k1, k2, k3), [msg, k1, k2, k3]);

  // Intermediate steps for visualization
  const step1 = useMemo(() => fakeDES(msg, k1), [msg, k1]);
  const step2 = useMemo(() => {
    try { return fakeDESDecrypt(step1, k2); } catch { return ''; }
  }, [step1, k2]);
  const step3 = useMemo(() => fake3DES(msg, k1, k2, k3), [msg, k1, k2, k3]);

  const bk1 = bobKeys.k1 || k1;
  const bk2 = bobKeys.k2 || k2;
  const bk3 = bobKeys.k3 || k3;
  const bobDecrypted = useMemo(() => fake3DESDecrypt(cipher, bk1, bk2, bk3), [cipher, bk1, bk2, bk3]);
  const bobMatch = bk1 === k1 && bk2 === k2 && bk3 === k3;
  const bobGarbled = !bobDecrypted || /[^\x20-\x7E]/.test(bobDecrypted);

  const newKeys = () => {
    setK1(randomKey(7)); setK2(randomKey(7)); setK3(randomKey(7));
    setBobKeys({ k1: '', k2: '', k3: '' });
  };
  const copyKeys = () => setBobKeys({ k1, k2, k3 });

  const keyInputClass = (bk, k) =>
    bk === ''
      ? 'border-stone-300 bg-white'
      : bk === k
      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
      : 'border-rose-400 bg-rose-50 text-rose-900';

  return (
    <SectionShell
      eyebrow="Modern · 3DES"
      title="Triple DES — EDE"
      intro="Triple DES applies DES three times: Encrypt with K1, Decrypt with K2, Encrypt with K3. This EDE structure gives an effective key of 112–168 bits — and stays backward-compatible with single-key DES when K1=K2=K3."
      summary={[
        "3DES = Encrypt(K1) → Decrypt(K2) → Encrypt(K3) — the EDE pattern.",
        "Effective key length: 112 bits (2-key) or 168 bits (3-key).",
        "The middle 'Decrypt' step is intentional: if K1=K2=K3 it degrades to plain DES.",
        "3DES is deprecated since 2023 — AES is faster and more secure.",
      ]}
    >
      {/* Mode switcher */}
      <div className="flex gap-2">
        {['encrypt', 'decrypt', 'ede'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
              mode === m
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {m === 'ede' ? 'EDE diagram' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Encrypt */}
      {mode === 'encrypt' && (
        <Card className="p-7">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Avatar who="alice" />
              <div className="flex gap-4">
                {[['K1', k1], ['K2', k2], ['K3', k3]].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">{label}</div>
                    <span className="font-mono text-[13px] bg-amber-50 border border-amber-200 rounded px-2 py-0.5">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={copyKeys}>↓ Give keys to Bob</Button>
              <Button variant="secondary" size="sm" onClick={newKeys}>↻ New keys</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-5">
            <Pane label="Plaintext" tone="blue">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="w-full h-[100px] p-3 rounded-lg border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
              />
            </Pane>
            <Arrow label="3DES EDE" />
            <Pane label="Ciphertext" tone="ink">
              <MonoBlock tone="ink" className="h-[100px] overflow-auto">{cipher}</MonoBlock>
            </Pane>
          </div>

          <button
            onClick={() => setShowSteps(!showSteps)}
            className="text-[12px] text-stone-600 underline underline-offset-2 hover:text-stone-900"
          >
            {showSteps ? '▲ Hide intermediate steps' : '▼ Show EDE intermediate steps'}
          </button>

          {showSteps && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-[10px] uppercase tracking-wider text-blue-700 mb-1">Step 1 — Encrypt with K1</div>
                <MonoBlock tone="blue">{step1}</MonoBlock>
              </div>
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="text-[10px] uppercase tracking-wider text-violet-700 mb-1">Step 2 — Decrypt with K2</div>
                <MonoBlock className="bg-violet-100 border-violet-300 text-violet-900">{step2}</MonoBlock>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">Step 3 — Encrypt with K3 (= final ciphertext)</div>
                <MonoBlock tone="green">{step3}</MonoBlock>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Key size</div>
              <div className="text-[18px] font-semibold text-stone-900">168 bit</div>
              <div className="text-[11px] text-amber-600 mt-1">112 effective bits</div>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Block size</div>
              <div className="text-[18px] font-semibold text-stone-900">64 bit</div>
              <div className="text-[11px] text-stone-500 mt-1">Same as DES</div>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Status</div>
              <div className="text-[15px] font-semibold text-rose-700">Deprecated</div>
              <div className="text-[11px] text-rose-600 mt-1">Since 2023 (NIST)</div>
            </div>
          </div>
        </Card>
      )}

      {/* Decrypt */}
      {mode === 'decrypt' && (
        <Card className="p-7">
          <div className="flex items-center gap-3 mb-5">
            <Avatar who="bob" />
            <div className="flex gap-4 flex-wrap">
              {[['K1', bk1, k1, 'k1'], ['K2', bk2, k2, 'k2'], ['K3', bk3, k3, 'k3']].map(([label, val, correct, field]) => (
                <div key={label}>
                  <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">Bob's {label}</div>
                  <input
                    value={bobKeys[field]}
                    onChange={(e) => setBobKeys((p) => ({ ...p, [field]: e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 7) }))}
                    placeholder={correct}
                    className={`font-mono text-[13px] px-2 py-1 rounded-lg border focus:outline-none w-[110px] ${keyInputClass(bobKeys[field], correct)}`}
                  />
                </div>
              ))}
            </div>
            {bobKeys.k1 !== '' && <Pill tone={bobMatch ? 'green' : 'coral'}>{bobMatch ? '✓ All correct' : '✗ Wrong'}</Pill>}
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <Pane label="Ciphertext received" tone="ink">
              <MonoBlock tone="ink" className="h-[100px] overflow-auto">{cipher}</MonoBlock>
            </Pane>
            <Arrow label="3DES DED" />
            <Pane label="Result" tone={bobKeys.k1 === '' ? 'blue' : bobMatch ? 'green' : 'coral'}>
              <MonoBlock tone={bobKeys.k1 === '' ? 'neutral' : bobMatch ? 'green' : 'coral'} className="h-[100px] overflow-auto">
                {bobKeys.k1 === ''
                  ? <span className="text-stone-400">Enter keys to decrypt…</span>
                  : bobMatch
                  ? bobDecrypted
                  : <span>⚠ {bobGarbled ? 'Garbled — wrong keys' : bobDecrypted}</span>
                }
              </MonoBlock>
            </Pane>
          </div>
          <div className="mt-3 text-[12px] text-stone-500">
            Decryption is DED: Decrypt(K3) → Encrypt(K2) → Decrypt(K1) — the exact reverse of EDE.
          </div>
        </Card>
      )}

      {/* EDE diagram */}
      {mode === 'ede' && (
        <Card className="p-7">
          <div className="text-[15px] font-semibold text-stone-900 mb-5">EDE: Encrypt → Decrypt → Encrypt</div>

          {/* Pipeline */}
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {/* Plaintext */}
            <div className="shrink-0 rounded-xl bg-blue-50 border border-blue-200 p-4 text-center w-[110px]">
              <div className="text-[10px] uppercase tracking-wider text-blue-700 mb-1">Plaintext</div>
              <div className="font-mono text-[11px] text-blue-900">M</div>
            </div>

            <PipeArrow />

            {/* E1 */}
            <div className="shrink-0 rounded-xl bg-amber-50 border-2 border-amber-400 p-4 text-center w-[130px]">
              <div className="text-[10px] uppercase tracking-wider text-amber-800 mb-1">DES Encrypt</div>
              <div className="font-mono text-[12px] font-semibold text-amber-900">K1 = {k1}</div>
            </div>

            <PipeArrow />

            {/* D */}
            <div className="shrink-0 rounded-xl bg-violet-50 border-2 border-violet-400 p-4 text-center w-[130px]">
              <div className="text-[10px] uppercase tracking-wider text-violet-800 mb-1">DES Decrypt</div>
              <div className="font-mono text-[12px] font-semibold text-violet-900">K2 = {k2}</div>
            </div>

            <PipeArrow />

            {/* E3 */}
            <div className="shrink-0 rounded-xl bg-amber-50 border-2 border-amber-400 p-4 text-center w-[130px]">
              <div className="text-[10px] uppercase tracking-wider text-amber-800 mb-1">DES Encrypt</div>
              <div className="font-mono text-[12px] font-semibold text-amber-900">K3 = {k3}</div>
            </div>

            <PipeArrow />

            {/* Ciphertext */}
            <div className="shrink-0 rounded-xl bg-stone-900 border border-stone-900 p-4 text-center w-[110px]">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Ciphertext</div>
              <div className="font-mono text-[11px] text-stone-300">C</div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="text-[12px] font-semibold text-amber-900 mb-2">Why Decrypt in the middle?</div>
              <div className="text-[12px] text-amber-800">
                If K1 = K2 = K3, the Decrypt in step 2 cancels the Encrypt of step 1, leaving only the final Encrypt with K3.
                Result: plain DES — backward compatible with legacy systems.
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
              <div className="text-[12px] font-semibold text-rose-900 mb-2">Meet-in-the-middle attack</div>
              <div className="text-[12px] text-rose-800">
                Double-DES (EE) would only give 57-bit security due to this attack — not 112 bits. The EDE structure of 3DES avoids it, giving true 112-bit security.
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-4">
            <div className="text-[12px] font-semibold text-stone-900 mb-2">DES → 3DES → AES timeline</div>
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { year: '1977', label: 'DES', color: 'bg-rose-100 border-rose-300 text-rose-800', note: '56-bit key' },
                { year: '1998', label: 'DES cracked', color: 'bg-rose-200 border-rose-400 text-rose-900', note: '22h brute force' },
                { year: '1999', label: '3DES standard', color: 'bg-amber-100 border-amber-300 text-amber-800', note: '112-bit security' },
                { year: '2001', label: 'AES standard', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', note: '128/256-bit' },
                { year: '2023', label: '3DES deprecated', color: 'bg-stone-100 border-stone-300 text-stone-700', note: 'NIST SP 800-131A' },
              ].map((item) => (
                <div key={item.year} className={`rounded-lg border p-3 text-center min-w-[100px] ${item.color}`}>
                  <div className="text-[10px] font-semibold">{item.year}</div>
                  <div className="text-[11px] font-bold mt-0.5">{item.label}</div>
                  <div className="text-[10px] mt-0.5 opacity-75">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </SectionShell>
  );
};

const PipeArrow = () => (
  <div className="shrink-0 flex items-center px-1">
    <div className="w-8 h-[2px] bg-stone-400 relative">
      <div className="absolute -right-1 -top-[3px] w-0 h-0 border-l-[6px] border-l-stone-400 border-y-[4px] border-y-transparent" />
    </div>
  </div>
);

Object.assign(window, { TDESSection });
