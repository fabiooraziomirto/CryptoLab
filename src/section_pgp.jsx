// Sezione 11 — Email sicura con PGP (Pretty Good Privacy)
const PGPSection = () => {
  const [msg, setMsg]             = useState('Dati del paziente in allegato.\nMantienili riservati.');
  const [sessionKey, setSessionKey] = useState(() => randomKey(8));
  const [bobKeys, setBobKeys]     = useState(() => genToyRSA());
  const [aliceKeys, setAliceKeys] = useState(() => genToyRSA());
  const [tamper, setTamper]       = useState(false);
  const [activeTab, setActiveTab] = useState('flow'); // flow | verify | glossary

  // ── Lato Alice: firma + cifratura ──────────────────────────────────────────
  const msgToSign = tamper ? msg + ' [MANOMESSO]' : msg;

  const digest        = useMemo(() => tinyHash(msg),        [msg]);
  const digestTamper  = useMemo(() => tinyHash(msgToSign),  [msgToSign]);

  const signature = useMemo(
    () => [...digest].map((ch) => modpow(ch.charCodeAt(0), aliceKeys.d, aliceKeys.n)),
    [digest, aliceKeys]
  );

  const encryptedMsg  = useMemo(() => xorCipher(msg, sessionKey),       [msg, sessionKey]);
  const wrappedKey    = useMemo(
    () => [...sessionKey].map((ch) => modpow(ch.charCodeAt(0), bobKeys.e, bobKeys.n)),
    [sessionKey, bobKeys]
  );

  // ── Lato Bob: decifratura + verifica firma ─────────────────────────────────
  const recoveredSession = useMemo(
    () => wrappedKey.map((v) => String.fromCharCode(modpow(v, bobKeys.d, bobKeys.n))).join(''),
    [wrappedKey, bobKeys]
  );
  const recoveredMsg     = useMemo(() => xorCipherDecrypt(encryptedMsg, recoveredSession), [encryptedMsg, recoveredSession]);
  const recoveredDigest  = useMemo(() => tinyHash(tamper ? msgToSign : recoveredMsg), [recoveredMsg, msgToSign, tamper]);
  const signatureCheck   = useMemo(
    () => signature.map((v) => String.fromCharCode(modpow(v, aliceKeys.e, aliceKeys.n))).join(''),
    [signature, aliceKeys]
  );
  const signatureValid   = recoveredDigest === signatureCheck;

  const tabCls = (t) =>
    `px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`;

  // ── Step data per la visualizzazione del flusso ────────────────────────────
  const aliceSteps = [
    {
      n: '01',
      icon: '✍️',
      label: 'Alice scrive il messaggio',
      color: 'bg-blue-50 border-blue-200',
      labelColor: 'text-blue-700',
      content: <div className="font-mono text-[12px] text-blue-900 whitespace-pre-wrap">{msg}</div>,
    },
    {
      n: '02',
      icon: '🔗',
      label: 'Calcola l\'hash del messaggio',
      color: 'bg-indigo-50 border-indigo-200',
      labelColor: 'text-indigo-700',
      content: (
        <div>
          <div className="font-mono text-[13px] text-indigo-900 break-all">{digest}</div>
          <div className="text-[11px] text-indigo-600 mt-1">
            Qualsiasi modifica al testo cambia completamente questo valore.
          </div>
        </div>
      ),
    },
    {
      n: '03',
      icon: '🔑',
      label: 'Firma l\'hash con la sua chiave privata',
      color: 'bg-violet-50 border-violet-200',
      labelColor: 'text-violet-700',
      content: (
        <div>
          <div className="font-mono text-[11px] text-violet-900 break-all leading-relaxed">
            {signature.slice(0, 6).join(' · ')}…
          </div>
          <div className="text-[11px] text-violet-600 mt-1">
            Chiave privata di Alice: (d={aliceKeys.d}, n={aliceKeys.n})
          </div>
        </div>
      ),
    },
    {
      n: '04',
      icon: '🎲',
      label: 'Genera una chiave di sessione casuale',
      color: 'bg-amber-50 border-amber-200',
      labelColor: 'text-amber-800',
      content: (
        <div>
          <div className="font-mono text-[15px] text-amber-900 font-bold">{sessionKey}</div>
          <div className="text-[11px] text-amber-700 mt-1">
            Chiave simmetrica usa-e-getta. Cambia ad ogni messaggio.
          </div>
        </div>
      ),
    },
    {
      n: '05',
      icon: '🔒',
      label: 'Cifra il messaggio con la chiave di sessione',
      color: 'bg-stone-900 border-stone-900',
      labelColor: 'text-stone-400',
      content: (
        <div className="font-mono text-[11px] text-amber-200 break-all">{encryptedMsg.slice(0, 60)}…</div>
      ),
    },
    {
      n: '06',
      icon: '📦',
      label: 'Cifra la chiave di sessione con la chiave pubblica di Bob',
      color: 'bg-rose-50 border-rose-200',
      labelColor: 'text-rose-700',
      content: (
        <div>
          <div className="font-mono text-[11px] text-rose-900 break-all">
            {wrappedKey.slice(0, 6).join(' · ')}…
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            Chiave pubblica di Bob: (e={bobKeys.e}, n={bobKeys.n})
          </div>
        </div>
      ),
    },
  ];

  const bobSteps = [
    {
      n: '07',
      icon: '🔓',
      label: 'Bob decifra la chiave di sessione con la sua chiave privata',
      color: 'bg-rose-50 border-rose-200',
      labelColor: 'text-rose-700',
      content: (
        <div>
          <div className="font-mono text-[15px] text-rose-900 font-bold">{recoveredSession}</div>
          <div className="text-[11px] text-rose-600 mt-1">
            Chiave privata di Bob: (d={bobKeys.d}, n={bobKeys.n})
          </div>
        </div>
      ),
    },
    {
      n: '08',
      icon: '📨',
      label: 'Decifra il messaggio con la chiave di sessione',
      color: 'bg-emerald-50 border-emerald-200',
      labelColor: 'text-emerald-700',
      content: (
        <div className="font-mono text-[12px] text-emerald-900 whitespace-pre-wrap">{recoveredMsg}</div>
      ),
    },
    {
      n: '09',
      icon: '🔗',
      label: 'Ricalcola l\'hash del messaggio ricevuto',
      color: 'bg-indigo-50 border-indigo-200',
      labelColor: 'text-indigo-700',
      content: (
        <div className="font-mono text-[13px] text-indigo-900 break-all">{recoveredDigest}</div>
      ),
    },
    {
      n: '10',
      icon: '✅',
      label: 'Verifica la firma di Alice con la chiave pubblica di Alice',
      color: signatureValid ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300',
      labelColor: signatureValid ? 'text-emerald-700' : 'text-rose-700',
      content: (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[22px] font-bold ${signatureValid ? 'text-emerald-600' : 'text-rose-600'}`}>
              {signatureValid ? '✔ FIRMA VALIDA' : '✘ FIRMA NON VALIDA'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <div className="text-stone-500 mb-0.5">Hash ricalcolato</div>
              <div className="font-mono break-all">{recoveredDigest}</div>
            </div>
            <div>
              <div className="text-stone-500 mb-0.5">Hash dalla firma di Alice</div>
              <div className="font-mono break-all">{signatureCheck}</div>
            </div>
          </div>
          {!signatureValid && (
            <div className="mt-2 text-[11px] text-rose-700 font-medium">
              ⚠️ I due hash non corrispondono: il messaggio è stato modificato dopo la firma.
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <SectionShell
      eyebrow="11 · Mondo reale"
      title="Email sicura con PGP"
      intro="PGP (Pretty Good Privacy) è lo standard per proteggere le email. Combina crittografia ibrida (simmetrica + asimmetrica) e firma digitale per garantire le tre proprietà fondamentali: confidenzialità, integrità e autenticità del mittente."
      summary={[
        'Confidenzialità: il testo è cifrato con una chiave di sessione simmetrica casuale (veloce), poi la chiave stessa è cifrata con la chiave pubblica di Bob (sicura).',
        'Integrità: l\'hash del messaggio cambia completamente se anche un solo carattere viene modificato.',
        'Autenticità: la firma di Alice può essere verificata solo con la sua chiave pubblica; nessun altro può averla prodotta.',
        'PGP è crittografia ibrida: prende il meglio dalla crittografia simmetrica (velocità) e da quella asimmetrica (scambio sicuro delle chiavi).',
      ]}
    >
      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        <button className={tabCls('flow')}     onClick={() => setActiveTab('flow')}>📬 Flusso completo</button>
        <button className={tabCls('verify')}   onClick={() => setActiveTab('verify')}>🔍 Simula manomissione</button>
        <button className={tabCls('glossary')} onClick={() => setActiveTab('glossary')}>📖 Glossario</button>
      </div>

      {/* ── TAB: flow ── */}
      {activeTab === 'flow' && (
        <div className="space-y-4">
          {/* Controlli */}
          <Card className="p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">
                  Messaggio di Alice
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded-lg border border-stone-300 text-[13px] font-mono resize-none focus:outline-none focus:border-stone-900"
                />
              </div>
              <div className="flex flex-col gap-2 pt-5">
                <Button variant="secondary" size="sm" onClick={() => setSessionKey(randomKey(8))}>
                  ↻ Nuova chiave di sessione
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setBobKeys(genToyRSA())}>
                  ↻ Nuove chiavi di Bob
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setAliceKeys(genToyRSA())}>
                  ↻ Nuove chiavi di Alice
                </Button>
              </div>
            </div>
          </Card>

          {/* Flusso Alice */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar who="alice" />
              <div>
                <div className="text-[13px] font-semibold text-stone-900">Lato Alice — preparazione del pacchetto</div>
                <div className="text-[12px] text-stone-500">6 passi per produrre un'email sicura</div>
              </div>
            </div>
            <div className="space-y-2">
              {aliceSteps.map((step) => (
                <div key={step.n} className={`rounded-xl border p-4 ${step.color}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-[20px] flex-shrink-0">{step.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded">{step.n}</span>
                        <span className={`text-[12px] font-semibold ${step.labelColor}`}>{step.label}</span>
                      </div>
                      {step.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Freccia canale */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex-1 h-px bg-stone-300" />
            <div className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-[12px] text-stone-600">
              <span>📡</span> Canale pubblico (Trudy può leggere tutto, ma non può decifrare né falsificare)
            </div>
            <div className="flex-1 h-px bg-stone-300" />
          </div>

          {/* Flusso Bob */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar who="bob" />
              <div>
                <div className="text-[13px] font-semibold text-stone-900">Lato Bob — ricezione e verifica</div>
                <div className="text-[12px] text-stone-500">4 passi per leggere e autenticare il messaggio</div>
              </div>
            </div>
            <div className="space-y-2">
              {bobSteps.map((step) => (
                <div key={step.n} className={`rounded-xl border p-4 ${step.color}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-[20px] flex-shrink-0">{step.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded">{step.n}</span>
                        <span className={`text-[12px] font-semibold ${step.labelColor}`}>{step.label}</span>
                      </div>
                      {step.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: verify ── */}
      {activeTab === 'verify' && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="text-[15px] font-semibold text-stone-900 mb-1">Cosa succede se Trudy manomette il messaggio?</div>
            <p className="text-[13px] text-stone-600 mb-5 leading-relaxed">
              PGP protegge non solo la <em>confidenzialità</em> (chi può leggere), ma anche
              l'<em>integrità</em> (che il messaggio non sia stato alterato). Attiva la manomissione
              e osserva come cambia il risultato della verifica.
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">
                  Messaggio originale di Alice
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-stone-300 text-[13px] font-mono resize-none focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">
                  Messaggio ricevuto da Bob
                </label>
                <div className={`w-full p-3 rounded-lg border text-[13px] font-mono min-h-[96px] whitespace-pre-wrap ${tamper ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'}`}>
                  {tamper ? msgToSign : msg}
                </div>
              </div>
            </div>

            <button
              onClick={() => setTamper((v) => !v)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                tamper
                  ? 'border-rose-400 bg-rose-50'
                  : 'border-stone-300 bg-stone-50 hover:border-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[24px]">{tamper ? '☠️' : '😈'}</span>
                  <div>
                    <div className={`text-[14px] font-semibold ${tamper ? 'text-rose-800' : 'text-stone-800'}`}>
                      {tamper ? 'Manomissione attiva — il messaggio è stato alterato!' : 'Simula attacco di Trudy (man-in-the-middle)'}
                    </div>
                    <div className={`text-[12px] ${tamper ? 'text-rose-600' : 'text-stone-500'}`}>
                      {tamper ? 'Trudy ha aggiunto " [MANOMESSO]" al messaggio in transito.' : 'Clicca per simulare che Trudy alteri il contenuto del messaggio sul canale.'}
                    </div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${tamper ? 'bg-rose-500' : 'bg-stone-300'} relative flex-shrink-0`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${tamper ? 'left-6' : 'left-0.5'}`} />
                </div>
              </div>
            </button>

            <div className={`mt-4 rounded-xl border-2 p-5 ${signatureValid ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[28px]">{signatureValid ? '✅' : '🚨'}</span>
                <div>
                  <div className={`text-[16px] font-bold ${signatureValid ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {signatureValid ? 'Firma valida — messaggio integro e autentico' : 'Firma NON valida — integrità compromessa!'}
                  </div>
                  <div className={`text-[12px] ${signatureValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {signatureValid
                      ? 'Bob ha la certezza che il messaggio è esattamente quello che Alice ha scritto.'
                      : 'Bob sa che qualcuno ha modificato il messaggio dopo che Alice lo ha firmato. Non può fidarsi del contenuto.'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className={`rounded-lg p-3 ${signatureValid ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  <div className="text-stone-500 mb-1">Hash ricalcolato da Bob</div>
                  <div className="font-mono break-all">{recoveredDigest}</div>
                </div>
                <div className={`rounded-lg p-3 ${signatureValid ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  <div className="text-stone-500 mb-1">Hash estratto dalla firma di Alice</div>
                  <div className="font-mono break-all">{signatureCheck}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-[13px] font-semibold text-stone-900 mb-3">Perché Trudy non può forgiare una firma valida?</div>
            <div className="grid md:grid-cols-3 gap-3 text-[12px] text-stone-700">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="font-semibold text-blue-800 mb-1">🔑 La firma richiede la chiave privata</div>
                Per produrre una firma valida occorre la chiave privata di Alice, che solo lei conosce. Trudy non può calcolarla dalla chiave pubblica in modo efficiente.
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="font-semibold text-amber-800 mb-1">🔗 L'hash lega firma e contenuto</div>
                La firma copre l'hash del messaggio originale. Se Trudy modifica anche un solo carattere, l'hash cambia completamente e la firma non corrisponde più.
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="font-semibold text-emerald-800 mb-1">🌐 La chiave pubblica è verificabile</div>
                Chiunque può usare la chiave pubblica di Alice per verificare la firma. Non serve fidarsi di un intermediario: la matematica garantisce l'autenticità.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: glossary ── */}
      {activeTab === 'glossary' && (
        <div className="space-y-3">
          {[
            {
              term: 'PGP (Pretty Good Privacy)',
              icon: '📬',
              color: 'bg-stone-50 border-stone-200',
              def: 'Standard inventato da Phil Zimmermann nel 1991 per proteggere le comunicazioni email. Utilizza crittografia ibrida: AES per il messaggio, RSA per lo scambio della chiave.',
            },
            {
              term: 'Crittografia ibrida',
              icon: '⚡',
              color: 'bg-blue-50 border-blue-200',
              def: 'Combinazione di crittografia simmetrica (veloce, per il messaggio) e asimmetrica (per scambiare in sicurezza la chiave simmetrica). PGP usa questo approccio perché RSA è troppo lento per testi lunghi.',
            },
            {
              term: 'Chiave di sessione',
              icon: '🎲',
              color: 'bg-amber-50 border-amber-200',
              def: 'Chiave simmetrica casuale generata per cifrare un singolo messaggio. Viene usata una volta sola e poi scartata. Viene consegnata a Bob cifrandola con la sua chiave pubblica RSA.',
            },
            {
              term: 'Firma digitale',
              icon: '✍️',
              color: 'bg-violet-50 border-violet-200',
              def: 'Hash del messaggio cifrato con la chiave privata del mittente. Permette a chiunque con la chiave pubblica di verificare sia l\'autenticità del mittente (non ripudio) sia l\'integrità del messaggio.',
            },
            {
              term: 'Hash / Digest',
              icon: '🔗',
              color: 'bg-indigo-50 border-indigo-200',
              def: 'Funzione matematica che trasforma un testo di qualsiasi lunghezza in una stringa di lunghezza fissa. Proprietà chiave: è praticamente impossibile trovare due testi con lo stesso hash, e un minimo cambiamento nel testo produce un hash completamente diverso.',
            },
            {
              term: 'Web of Trust',
              icon: '🕸️',
              color: 'bg-emerald-50 border-emerald-200',
              def: 'Modello di PGP per validare le chiavi pubbliche: non esiste un\'autorità centrale (come nelle CA), ma gli utenti si certificano reciprocamente. Se Alice e Bob si fidano di Carol, e Carol ha firmato la chiave di Dave, Alice e Bob possono fidarsi di Dave.',
            },
            {
              term: 'Non ripudio',
              icon: '🧾',
              color: 'bg-rose-50 border-rose-200',
              def: 'Proprietà per cui il mittente non può negare di aver inviato un messaggio: solo chi possiede la chiave privata può produrre quella firma, quindi la paternità è matematicamente dimostrabile.',
            },
          ].map((item) => (
            <div key={item.term} className={`rounded-2xl border p-5 ${item.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-[22px] flex-shrink-0">{item.icon}</span>
                <div>
                  <div className="text-[14px] font-semibold text-stone-900 mb-1">{item.term}</div>
                  <p className="text-[13px] text-stone-600 leading-relaxed">{item.def}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
};

Object.assign(window, { PGPSection });
