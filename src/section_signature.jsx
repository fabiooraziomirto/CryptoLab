// Section 6 — Digital Signature
const SignatureSection = () => {
  const [original, setOriginal] = useState("Prescrivi 500 mg di amoxicillina, 3 volte al giorno.");
  const [tampered, setTampered] = useState("Prescrivi 500 mg di amoxicillina, 3 volte al giorno.");
  const [signed, setSigned] = useState(false);

  const originalHash = useMemo(() => tinyHash(original), [original]);
  const tamperedHash = useMemo(() => tinyHash(tampered), [tampered]);
  // "signature" = hash + fixed fake private transform (just reverse for visual)
  const signature = useMemo(() => originalHash.split('').reverse().join('') + '7e', [originalHash]);
  const valid = originalHash === tamperedHash && signed;

  return (
    <SectionShell
      eyebrow="06 · Firme digitali"
      title="Dimostrare che un messaggio non e stato alterato e che arriva davvero da te"
      intro="Una firma digitale combina hashing e crittografia asimmetrica. Alice calcola l'hash del messaggio, 'firma' quell'hash con la sua chiave privata e chiunque abbia la sua chiave pubblica puo verificare che il contenuto sia integro e autentico."
      summary={[
        "Un hash e una breve impronta del messaggio: anche una modifica minuscola produce un hash completamente diverso.",
        "Alice firma l'hash con la sua chiave privata; Bob verifica usando la chiave pubblica.",
        "Se il messaggio viene alterato durante il tragitto, la verifica fallisce e Bob sa di non potersi fidare.",
      ]}
    >
      <Card className="p-7">
        {/* Step 1: Alice signs */}
        <div className="mb-6">
          <StepHeader n="1" title="Alice scrive e firma" />
          <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch mt-3">
            <Pane label="Messaggio originale" tone="blue">
              <textarea
                value={original}
                onChange={(e) => { setOriginal(e.target.value); setTampered(e.target.value); setSigned(false); }}
                className="w-full h-[80px] p-2 rounded-md border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
              />
            </Pane>
            <div className="flex items-center justify-center"><Arrow label="hash" /></div>
            <Pane label="Hash (impronta)" tone="ink">
              <div className="font-mono text-[12px] text-amber-200 p-1 break-all">{originalHash}</div>
            </Pane>
            <div className="flex items-center justify-center"><Arrow label="firma con chiave privata" /></div>
            <Pane label="Firma" tone={signed ? 'green' : 'coral'}>
              <div className="font-mono text-[11.5px] p-1 break-all min-h-[40px]">
                {signed ? signature : <span className="text-stone-400">non ancora firmato</span>}
              </div>
              <Button size="sm" variant={signed ? 'secondary' : 'primary'} className="mt-2 w-full" onClick={() => setSigned(true)}>
                {signed ? '✓ firmato' : 'Firma messaggio'}
              </Button>
            </Pane>
          </div>
        </div>

        {/* Step 2: Transit / tamper */}
        <div className="mb-6">
          <StepHeader n="2" title="Durante il tragitto — Trudy puo manomettere" />
          <div className="mt-3 rounded-xl border border-stone-200 p-4 bg-stone-50">
            <label className="text-[11px] uppercase tracking-wider text-rose-600 mb-1.5 block">Trudy modifica il messaggio</label>
            <textarea
              value={tampered}
              onChange={(e) => setTampered(e.target.value)}
              className="w-full h-[70px] p-2 rounded-md border border-rose-200 bg-white text-[13px] resize-none focus:outline-none focus:border-rose-500"
              placeholder="Prova a cambiare 500 mg in 5000 mg…"
            />
            {tampered !== original && (
              <div className="mt-2 text-[12px] text-rose-700">
                ⚠ Modificato: l'hash cambia completamente.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Bob verifies */}
        <div>
          <StepHeader n="3" title="Bob verifica" />
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <Pane label="Hash che Bob calcola ora" tone="neutral">
              <div className="font-mono text-[12px] p-1 break-all">{tamperedHash}</div>
            </Pane>
            <Pane label="Hash recuperato dalla firma" tone="neutral">
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
                {!signed ? 'Firma prima per verificare' : valid ? 'Firma valida — puoi fidarti' : 'Firma NON valida — rifiuta!'}
              </div>
              {signed && !valid && (
                <div className="text-[11px] mt-1 text-rose-700 text-center">Gli hash non coincidono → messaggio alterato</div>
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
