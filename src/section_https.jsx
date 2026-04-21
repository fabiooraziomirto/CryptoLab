// Section 7 — HTTPS Simulation
const HTTPSSection = () => {
  const [secure, setSecure] = useState(true);
  const [certValid, setCertValid] = useState(true);

  const req = "POST /login  user=jose  pass=hospital2026";
  const cipher = "a7X2d9§Kp0µQ1w·Ll88▒nR4Zz+3V…";

  return (
    <SectionShell
      eyebrow="07 · HTTPS nella vita reale"
      title="Il piccolo lucchetto nel browser"
      intro="HTTPS incapsula ogni richiesta in un tunnel sicuro. Prima che i dati inizino a scorrere, il browser verifica un certificato firmato da un'autorita fidata, dimostrando che il sito e davvero chi dice di essere."
      summary={[
        "HTTP invia i dati in chiaro: chiunque sulla rete puo leggerli.",
        "HTTPS cifra la connessione, quindi solo il server puo leggere i dati.",
        "Certificati e autorita fidate impediscono a Trudy di impersonare il sito.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Toggle label="Usa HTTPS" value={secure} onChange={setSecure} />
          <Toggle label="Certificato valido" value={certValid} onChange={setCertValid} />
          <div className="ml-auto">
            <Pill tone={secure && certValid ? 'green' : secure ? 'amber' : 'coral'}>
              {secure && certValid ? 'Fidato e cifrato' : secure ? 'Cifrato ma non fidato' : 'HTTP in chiaro'}
            </Pill>
          </div>
        </div>

        {/* Browser mockup */}
        <div className="rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="bg-stone-100 border-b border-stone-200 px-3 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-stone-300" />
              <span className="w-3 h-3 rounded-full bg-stone-300" />
              <span className="w-3 h-3 rounded-full bg-stone-300" />
            </div>
            <div className={`flex-1 rounded-md border px-3 py-1.5 text-[12px] font-mono flex items-center gap-2 ${
              secure && certValid
                ? 'bg-white border-stone-200 text-stone-700'
                : secure
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              <span className="text-[11px]">
                {secure && certValid ? '🔒' : secure ? '⚠' : '⚠'}
              </span>
              <span>
                {secure ? 'https://' : 'http://'}
                <span className="font-semibold">hospital-portal.edu</span>/login
              </span>
              {secure && certValid && <span className="ml-auto text-emerald-700 text-[10px]">Sicuro</span>}
              {secure && !certValid && <span className="ml-auto text-amber-800 text-[10px]">Non privata</span>}
              {!secure && <span className="ml-auto text-rose-700 text-[10px]">Non sicura</span>}
            </div>
          </div>
          <div className="grid md:grid-cols-[1fr_auto_1fr]">
            <div className="p-5 border-r border-stone-200">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Tu invii</div>
              <div className="font-mono text-[12.5px] p-3 rounded-lg bg-stone-50 border border-stone-200 break-all">
                {req}
              </div>
            </div>
            <div className="flex items-center justify-center p-3">
              <Arrow label={secure ? 'cifrato' : 'chiaro'} />
            </div>
            <div className="p-5">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Cosa vede Trudy</div>
              <div className={`font-mono text-[12.5px] p-3 rounded-lg break-all border ${
                secure ? 'bg-stone-900 text-amber-200 border-stone-900' : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                {secure ? cipher : req}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate card */}
        <div className="mt-6 grid md:grid-cols-[auto_1fr] gap-4 items-stretch">
          <div className={`rounded-xl border p-4 w-full md:w-[260px] ${
            certValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-md grid place-items-center text-[11px] font-bold text-white ${
                certValid ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {certValid ? '✓' : '✗'}
              </span>
              <div className="text-[12px] font-semibold">
                {certValid ? 'Certificato' : 'Errore certificato'}
              </div>
            </div>
            <dl className="text-[11.5px] font-mono space-y-1 text-stone-800">
              <div className="flex justify-between"><dt className="text-stone-500">Emesso per</dt><dd>hospital-portal.edu</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">Emesso da</dt><dd>{certValid ? 'Let’s Encrypt' : '⚠ CA sconosciuta'}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">Valido fino al</dt><dd>2026-10-14</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">SHA-256</dt><dd>7a:4e:bd…</dd></div>
            </dl>
          </div>
          <div className="text-[13px] text-stone-700 leading-relaxed">
            <p className="mb-2">
              Le <span className="font-semibold">autorita fidate (CA)</span> sono organizzazioni gia considerate affidabili dal browser.
              Firmano digitalmente i certificati solo dopo aver verificato che il proprietario del sito controlli davvero il dominio.
            </p>
            <p>
              {certValid
                ? 'Qui il certificato e firmato da una CA fidata: il browser mostra il lucchetto e procede.'
                : 'Un certificato emesso da un soggetto sconosciuto puo significare che Trudy sta impersonando il sito. Il browser blocca la connessione.'}
            </p>
          </div>
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { HTTPSSection });
