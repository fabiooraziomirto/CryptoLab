// Section 4 — Symmetric (AES-style)
const AESSection = () => {
  const [msg, setMsg] = useState("Patient: J. Rivera — dosage 50mg");
  const [key, setKey] = useState(() => randomKey(16));
  const [showDecrypt, setShowDecrypt] = useState(false);
  const [wrongKey, setWrongKey] = useState("");
  const [useWrong, setUseWrong] = useState(false);

  const cipher = useMemo(() => fakeAES(msg, key), [msg, key]);
  const decrypted = useMemo(() => fakeAESDecrypt(cipher, useWrong ? (wrongKey || 'X') : key), [cipher, key, useWrong, wrongKey]);

  return (
    <SectionShell
      eyebrow="04 · Symmetric encryption"
      title="Same key to lock and unlock"
      intro="In symmetric encryption (like AES), Alice and Bob share one secret key. It’s fast and robust — but the key itself has to be exchanged somehow, without Trudy seeing it."
      summary={[
        "Symmetric = one shared key for both encryption and decryption.",
        "It’s fast, which makes it great for bulk data.",
        "The hard part is getting the key to the other side safely.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Pill tone="blue">Shared secret</Pill>
            <span className="font-mono text-[13px] text-stone-900">{key}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setKey(randomKey(16))}>
            ↻ Generate new key
          </Button>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          <Pane label="Plaintext (Alice)" tone="blue">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[120px] p-3 rounded-lg border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
            />
          </Pane>
          <div className="flex items-center justify-center">
            <Arrow label="encrypt" />
          </div>
          <Pane label="Ciphertext (on the wire)" tone="ink">
            <MonoBlock tone="ink" className="h-[120px] overflow-auto">{cipher}</MonoBlock>
          </Pane>
        </div>

        <div className="mt-5 border-t border-stone-200 pt-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-[15px] font-semibold text-stone-900">Bob decrypts</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setUseWrong(!useWrong); setShowDecrypt(true); }}
                className={`text-[12px] px-3 py-1.5 rounded-lg border font-medium ${
                  useWrong ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {useWrong ? '✗ wrong key' : 'try wrong key'}
              </button>
              <Button size="sm" onClick={() => setShowDecrypt(!showDecrypt)}>
                {showDecrypt ? 'Hide' : 'Decrypt'}
              </Button>
            </div>
          </div>
          {useWrong && (
            <div className="mt-3">
              <input
                value={wrongKey}
                onChange={(e) => setWrongKey(e.target.value.toUpperCase())}
                placeholder="Type any wrong key…"
                className="w-full max-w-xs p-2 rounded-lg border border-rose-300 font-mono text-[13px] focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
          {showDecrypt && (
            <div className="mt-4 grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
              <Pane label="Using key" tone={useWrong ? 'coral' : 'green'}>
                <div className="font-mono text-[13px] p-3">{useWrong ? (wrongKey || '—') : key}</div>
              </Pane>
              <div className="flex items-center justify-center">
                <Arrow label="decrypt" />
              </div>
              <Pane label="Result for Bob" tone={useWrong ? 'coral' : 'green'}>
                <MonoBlock tone={useWrong ? 'coral' : 'green'} className="h-[60px] overflow-auto">
                  {useWrong
                    ? (decrypted.match(/[^\x20-\x7E]/) ? '⚠ garbled bytes — wrong key' : decrypted || '⚠ garbled bytes')
                    : decrypted}
                </MonoBlock>
              </Pane>
            </div>
          )}
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
  };
  const labelTones = {
    blue: 'text-blue-700',
    ink: 'text-stone-400',
    green: 'text-emerald-700',
    coral: 'text-rose-700',
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} p-3`}>
      <div className={`text-[10px] uppercase tracking-wider mb-2 ${labelTones[tone]}`}>{label}</div>
      {children}
    </div>
  );
};

const Arrow = ({ label }) => (
  <div className="flex flex-col items-center">
    <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">{label}</div>
    <div className="w-12 h-[2px] bg-stone-400 relative">
      <div className="absolute -right-1 -top-[3px] w-0 h-0 border-l-[6px] border-l-stone-400 border-y-[4px] border-y-transparent" />
    </div>
  </div>
);

Object.assign(window, { AESSection, Pane, Arrow });
