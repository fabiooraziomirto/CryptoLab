// Section 4 — Symmetric (AES-style)
const AESSection = () => {
  const [msg, setMsg] = useState("Patient: J. Rivera — dosage 50mg");
  const [key, setKey] = useState(() => randomKey(16));
  const [bobKey, setBobKey] = useState('');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' | 'decrypt'

  const cipher = useMemo(() => fakeAES(msg, key), [msg, key]);

  const bobEffectiveKey = bobKey || key;
  const bobDecrypted = useMemo(() => fakeAESDecrypt(cipher, bobEffectiveKey), [cipher, bobEffectiveKey]);
  const bobMatch = bobEffectiveKey === key;
  const bobGarbled = !bobDecrypted || /[^\x20-\x7E]/.test(bobDecrypted);

  const handleNewKey = () => {
    const k = randomKey(16);
    setKey(k);
    setBobKey('');
  };

  const handleCopyKey = () => setBobKey(key);

  return (
    <SectionShell
      eyebrow="04 · Symmetric encryption"
      title="Same key to lock and unlock"
      intro="In symmetric encryption (like AES), Alice and Bob share one secret key. It's fast and robust — but the key itself has to be exchanged somehow, without Trudy seeing it."
      summary={[
        "Symmetric = one shared key for both encryption and decryption.",
        "It's fast, which makes it great for bulk data.",
        "The hard part is getting the key to the other side safely.",
        "A wrong key produces unreadable garbage — authentication is implicit.",
      ]}
    >
      {/* Mode switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('encrypt')}
          className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
            mode === 'encrypt'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          Encrypt (Alice)
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
            mode === 'decrypt'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          Decrypt (Bob)
        </button>
      </div>

      {/* Alice encrypts */}
      <Card className="p-7">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Avatar who="alice" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-0.5">Alice's secret key</div>
              <span className="font-mono text-[14px] font-semibold text-stone-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 inline-block">{key}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyKey}>
              ↓ Give key to Bob
            </Button>
            <Button variant="secondary" size="sm" onClick={handleNewKey}>
              ↻ New key
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <Pane label="Plaintext" tone="blue">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[110px] p-3 rounded-lg border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
            />
          </Pane>
          <Arrow label="AES encrypt" />
          <Pane label="Ciphertext (on the wire)" tone="ink">
            <MonoBlock tone="ink" className="h-[110px] overflow-auto">{cipher}</MonoBlock>
          </Pane>
        </div>

        <div className="mt-4 text-[12px] text-stone-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Ciphertext changes in real time as you type. The key controls everything.
        </div>
      </Card>

      {/* Bob decrypts */}
      {mode === 'decrypt' && (
        <Card className="p-7">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Avatar who="bob" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-0.5">Bob's key (type it)</div>
                <input
                  value={bobKey}
                  onChange={(e) => setBobKey(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 16))}
                  placeholder={`e.g. ${key}`}
                  className={`font-mono text-[14px] px-3 py-1 rounded-lg border focus:outline-none w-[180px] ${
                    bobKey === ''
                      ? 'border-stone-300 bg-white'
                      : bobMatch
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                      : 'border-rose-400 bg-rose-50 text-rose-900'
                  }`}
                />
              </div>
            </div>
            {bobKey !== '' && (
              <Pill tone={bobMatch ? 'green' : 'coral'}>
                {bobMatch ? '✓ Correct key' : '✗ Wrong key'}
              </Pill>
            )}
            {bobKey === '' && (
              <span className="text-[12px] text-stone-500">Type the key above, or click "Give key to Bob" on Alice's side</span>
            )}
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <Pane label="Ciphertext received" tone="ink">
              <MonoBlock tone="ink" className="h-[110px] overflow-auto">{cipher}</MonoBlock>
            </Pane>
            <Arrow label="AES decrypt" />
            <Pane label="Result" tone={bobKey === '' ? 'blue' : bobMatch ? 'green' : 'coral'}>
              <MonoBlock
                tone={bobKey === '' ? 'neutral' : bobMatch ? 'green' : 'coral'}
                className="h-[110px] overflow-auto"
              >
                {bobKey === ''
                  ? <span className="text-stone-400">Waiting for key…</span>
                  : bobMatch
                  ? bobDecrypted
                  : <span>⚠ {bobGarbled ? 'Garbled bytes — wrong key' : bobDecrypted}</span>
                }
              </MonoBlock>
            </Pane>
          </div>

          {!bobMatch && bobKey !== '' && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-800">
              Wrong key → output is meaningless garbage. This is AES's implicit authentication.
            </div>
          )}
          {bobMatch && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-[13px] text-emerald-800">
              Correct key → Bob reads the original plaintext.
            </div>
          )}
        </Card>
      )}

      {/* Key exchange note */}
      <Card className="p-5 bg-amber-50 border-amber-200">
        <div className="text-[13px] font-semibold text-amber-900 mb-1">The key exchange problem</div>
        <div className="text-[13px] text-amber-800">
          Alice and Bob need to share the key <em>before</em> communicating — but how do they do that securely?
          If Trudy intercepts the key, she can decrypt everything. This is why in practice AES is combined with
          asymmetric key exchange (see the <strong>Hybrid</strong> section).
        </div>
      </Card>
    </SectionShell>
  );
};

const Pane = ({ label, tone, children }) => {
  const tones = {
    blue:  'bg-blue-50 border-blue-200',
    ink:   'bg-stone-900 border-stone-900',
    green: 'bg-emerald-50 border-emerald-200',
    coral: 'bg-rose-50 border-rose-200',
    amber: 'bg-amber-50 border-amber-200',
  };
  const labelTones = {
    blue: 'text-blue-700',
    ink: 'text-stone-400',
    green: 'text-emerald-700',
    coral: 'text-rose-700',
    amber: 'text-amber-800',
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} p-3`}>
      <div className={`text-[10px] uppercase tracking-wider mb-2 ${labelTones[tone]}`}>{label}</div>
      {children}
    </div>
  );
};

const Arrow = ({ label }) => (
  <div className="flex flex-col items-center gap-1 px-2">
    <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
    <div className="w-10 h-[2px] bg-stone-400 relative">
      <div className="absolute -right-1 -top-[3px] w-0 h-0 border-l-[6px] border-l-stone-400 border-y-[4px] border-y-transparent" />
    </div>
  </div>
);

Object.assign(window, { AESSection, Pane, Arrow });
