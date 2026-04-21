// Section 6 — Digital Signature
const SignatureSection = () => {
  const [original, setOriginal] = useState("Prescribe 500mg of amoxicillin, 3x/day.");
  const [tampered, setTampered] = useState("Prescribe 500mg of amoxicillin, 3x/day.");
  const [signed, setSigned] = useState(false);

  const originalHash = useMemo(() => tinyHash(original), [original]);
  const tamperedHash = useMemo(() => tinyHash(tampered), [tampered]);
  // "signature" = hash + fixed fake private transform (just reverse for visual)
  const signature = useMemo(() => originalHash.split('').reverse().join('') + '7e', [originalHash]);
  const valid = originalHash === tamperedHash && signed;

  return (
    <SectionShell
      eyebrow="06 · Digital signatures"
      title="Proving a message wasn’t changed — and really came from you"
      intro="A digital signature combines hashing with asymmetric crypto. Alice hashes her message, ‘signs’ the hash with her private key, and anyone with her public key can verify that it’s untouched and truly hers."
      summary={[
        "A hash is a short fingerprint of a message — any tiny change produces a completely different hash.",
        "Alice signs the hash with her private key; Bob verifies using her public key.",
        "If the message was altered in transit, verification fails and Bob knows not to trust it.",
      ]}
    >
      <Card className="p-7">
        {/* Step 1: Alice signs */}
        <div className="mb-6">
          <StepHeader n="1" title="Alice writes and signs" />
          <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch mt-3">
            <Pane label="Original message" tone="blue">
              <textarea
                value={original}
                onChange={(e) => { setOriginal(e.target.value); setTampered(e.target.value); setSigned(false); }}
                className="w-full h-[80px] p-2 rounded-md border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
              />
            </Pane>
            <div className="flex items-center justify-center"><Arrow label="hash" /></div>
            <Pane label="Hash (fingerprint)" tone="ink">
              <div className="font-mono text-[12px] text-amber-200 p-1 break-all">{originalHash}</div>
            </Pane>
            <div className="flex items-center justify-center"><Arrow label="sign w/ private key" /></div>
            <Pane label="Signature" tone={signed ? 'green' : 'coral'}>
              <div className="font-mono text-[11.5px] p-1 break-all min-h-[40px]">
                {signed ? signature : <span className="text-stone-400">not signed yet</span>}
              </div>
              <Button size="sm" variant={signed ? 'secondary' : 'primary'} className="mt-2 w-full" onClick={() => setSigned(true)}>
                {signed ? '✓ signed' : 'Sign message'}
              </Button>
            </Pane>
          </div>
        </div>

        {/* Step 2: Transit / tamper */}
        <div className="mb-6">
          <StepHeader n="2" title="In transit — Trudy may tamper" />
          <div className="mt-3 rounded-xl border border-stone-200 p-4 bg-stone-50">
            <label className="text-[11px] uppercase tracking-wider text-rose-600 mb-1.5 block">Trudy edits the message</label>
            <textarea
              value={tampered}
              onChange={(e) => setTampered(e.target.value)}
              className="w-full h-[70px] p-2 rounded-md border border-rose-200 bg-white text-[13px] resize-none focus:outline-none focus:border-rose-500"
              placeholder="Try changing 500mg to 5000mg…"
            />
            {tampered !== original && (
              <div className="mt-2 text-[12px] text-rose-700">
                ⚠ Modified — this changes the hash completely.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Bob verifies */}
        <div>
          <StepHeader n="3" title="Bob verifies" />
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <Pane label="Hash Bob computes now" tone="neutral">
              <div className="font-mono text-[12px] p-1 break-all">{tamperedHash}</div>
            </Pane>
            <Pane label="Hash recovered from signature" tone="neutral">
              <div className="font-mono text-[12px] p-1 break-all">{signed ? originalHash : '—'}</div>
            </Pane>
            <div
              className={`rounded-xl border p-4 flex flex-col items-center justify-center ${
                !signed
                  ? 'bg-stone-50 border-stone-200 text-stone-500'
                  : valid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              <div className="text-[32px] leading-none mb-2">
                {!signed ? '•' : valid ? '✓' : '✗'}
              </div>
              <div className="text-[13px] font-semibold text-center">
                {!signed ? 'Sign first to verify' : valid ? 'Signature valid — trust it' : 'Signature INVALID — reject!'}
              </div>
              {signed && !valid && (
                <div className="text-[11px] mt-1 text-rose-700 text-center">Hashes don’t match → message changed</div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </SectionShell>
  );
};

const Pane2 = Pane; // re-use

// lightweight re-export
if (typeof Pane === 'undefined') { /* provided by AES section */ }

const StepHeader = ({ n, title }) => (
  <div className="flex items-center gap-3">
    <span className="w-7 h-7 rounded-full bg-stone-900 text-white grid place-items-center font-mono text-[12px]">{n}</span>
    <span className="text-[14px] font-semibold text-stone-900">{title}</span>
  </div>
);

Object.assign(window, { SignatureSection, StepHeader });
