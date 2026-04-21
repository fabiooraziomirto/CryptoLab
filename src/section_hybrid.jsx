// Sezione 08 — Crittografia ibrida: il meglio di entrambi i mondi
const HybridSection = () => {
  const [keys, setKeys]             = useState(() => genToyRSA());
  const [msg, setMsg]               = useState('Referto di laboratorio pronto.\nCondividilo solo con Bob.');
  const [sessionKey, setSessionKey] = useState(() => randomKey(8));
  const [activeTab, setActiveTab]   = useState('flow'); // flow | why | real
  const [step, setStep]             = useState(0); // 0-4 stepped demo

  // ── Calcoli ────────────────────────────────────────────────────────────────
  const encryptedMsg = useMemo(() => xorCipher(msg, sessionKey),      [msg, sessionKey]);
  const wrappedKey   = useMemo(
    () => [...sessionKey].map((ch) => modpow(ch.charCodeAt(0), keys.e, keys.n)),
    [sessionKey, keys]
  );
  const unwrappedKey = useMemo(
    () => wrappedKey.map((v) => String.fromCharCode(modpow(v, keys.d, keys.n))).join(''),
    [wrappedKey, keys]
  );
  const finalPlain   = useMemo(() => xorCipherDecrypt(encryptedMsg, unwrappedKey), [encryptedMsg, unwrappedKey]);

  const tabCls = (t) =>
    `px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`;

  // ── Passi del flusso animato ───────────────────────────────────────────────
  const STEPS = [
    {
      actor: 'alice',
      icon: '🎲',
      title: 'Alice genera una chiave di sessione casuale',
      desc: 'Una chiave simmetrica usa-e-getta, piccola e casuale. Verrà usata una volta sola per cifrare questo messaggio.',
      color: 'bg-amber-50 border-amber-300',
      labelColor: 'text-amber-800',
      content: (
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider">Chiave di sessione:</span>
          <span className="font-mono text-[16px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg">{sessionKey}</span>
        </div>
      ),
    },
    {
      actor: 'alice',
      icon: '🔒',
      title: 'Cifra il messaggio con la chiave di sessione (simmetrico)',
      desc: 'La crittografia simmetrica è velocissima — può cifrare gigabyte in pochi millisecondi. Perfetta per i dati.',
      color: 'bg-stone-900 border-stone-900',
      labelColor: 'text-stone-300',
      content: (
        <div className="mt-2 space-y-1">
          <div className="text-[10px] text-stone-400 uppercase tracking-wider">Testo cifrato</div>
          <div className="font-mono text-[11px] text-amber-200 break-all leading-relaxed">
            {encryptedMsg.slice(0, 64)}{encryptedMsg.length > 64 ? '…' : ''}
          </div>
        </div>
      ),
    },
    {
      actor: 'alice',
      icon: '📦',
      title: 'Cifra la chiave di sessione con la chiave pubblica di Bob (asimmetrico)',
      desc: 'Solo RSA può fare questo: cifrare un segreto usando una chiave pubblica, in modo che solo Bob possa aprirlo con la sua chiave privata.',
      color: 'bg-blue-50 border-blue-300',
      labelColor: 'text-blue-800',
      content: (
        <div className="mt-2 space-y-1">
          <div className="text-[10px] text-blue-700 uppercase tracking-wider">
            Chiave di sessione cifrata con (e={keys.e}, n={keys.n})
          </div>
          <div className="font-mono text-[11px] text-blue-900 break-all leading-relaxed">
            {wrappedKey.slice(0, 8).join(' · ')}…
          </div>
        </div>
      ),
    },
    {
      actor: 'bob',
      icon: '🔑',
      title: 'Bob decifra la chiave di sessione con la sua chiave privata',
      desc: 'Solo Bob possiede la chiave privata, quindi solo lui può recuperare la chiave di sessione. Nessun altro può farlo, nemmeno Alice.',
      color: 'bg-rose-50 border-rose-300',
      labelColor: 'text-rose-800',
      content: (
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider">Chiave recuperata:</span>
          <span className="font-mono text-[16px] font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-lg">{unwrappedKey}</span>
          {unwrappedKey === sessionKey
            ? <span className="text-emerald-600 text-[12px] font-semibold">✔ Identica all'originale</span>
            : <span className="text-rose-600 text-[12px]">⚠ Mismatch</span>}
        </div>
      ),
    },
    {
      actor: 'bob',
      icon: '📨',
      title: 'Decifra il messaggio con la chiave di sessione recuperata',
      desc: 'Con la chiave di sessione in mano, Bob può decifrare il messaggio istantaneamente. Il canale è stato completamente sicuro.',
      color: 'bg-emerald-50 border-emerald-300',
      labelColor: 'text-emerald-800',
      content: (
        <div className="mt-2 font-mono text-[13px] text-emerald-900 whitespace-pre-wrap bg-emerald-100 rounded-lg p-3">
          {finalPlain || '—'}
        </div>
      ),
    },
  ];

  const currentStep = STEPS[step] || STEPS[0];

  return (
    <SectionShell
      eyebrow="08 · Crittografia moderna"
      title="Crittografia ibrida: la ricetta del mondo reale"
      intro="Nessun sistema reale usa solo AES o solo RSA. HTTPS, Signal, PGP, SSH usano tutti la crittografia ibrida: simmetrica per i dati (veloce), asimmetrica per lo scambio della chiave (sicuro). Questo è il cuore di Internet sicura."
      summary={[
        'La crittografia simmetrica (AES) è veloce ma richiede una chiave condivisa: come la consegniamo in sicurezza?',
        'La crittografia asimmetrica (RSA) risolve la consegna della chiave, ma è troppo lenta per i dati.',
        'La soluzione ibrida: usa RSA solo per consegnare una chiave AES casuale, poi usa AES per tutto il resto.',
        'Questa è la base di HTTPS, Signal, PGP, SSH e praticamente ogni protocollo sicuro moderno.',
      ]}
    >
      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        <button className={tabCls('flow')}    onClick={() => setActiveTab('flow')}>⚡ Flusso interattivo</button>
        <button className={tabCls('why')}     onClick={() => setActiveTab('why')}>🤔 Perché ibrida?</button>
        <button className={tabCls('real')}    onClick={() => setActiveTab('real')}>🌐 Nel mondo reale</button>
      </div>

      {/* ── TAB: flow ── */}
      {activeTab === 'flow' && (
        <div className="space-y-4">
          {/* Messaggio + controlli */}
          <Card className="p-5">
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Messaggio di Alice</label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded-lg border border-stone-300 text-[13px] font-mono resize-none focus:outline-none focus:border-stone-900"
                />
              </div>
              <div className="flex flex-col gap-2 pt-5">
                <Button variant="secondary" size="sm" onClick={() => setKeys(genToyRSA())}>↻ Nuove chiavi RSA</Button>
                <Button variant="secondary" size="sm" onClick={() => setSessionKey(randomKey(8))}>↻ Nuova chiave sessione</Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[12px] text-stone-500 flex-wrap">
              <span>Chiave pubblica Bob: <span className="font-mono">(e={keys.e}, n={keys.n})</span></span>
              <span className="text-stone-300">|</span>
              <span>Chiave privata Bob: <span className="font-mono">(d={keys.d}, n={keys.n})</span></span>
            </div>
          </Card>

          {/* Step navigator */}
          <div className="flex items-center gap-2 flex-wrap">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                  step === i
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">Passo {i + 1}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            ))}
          </div>

          {/* Step card */}
          <div className={`rounded-2xl border-2 p-6 transition-all ${currentStep.color}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Avatar who={currentStep.actor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] bg-stone-900 text-amber-300 px-2 py-0.5 rounded">
                    {String(step + 1).padStart(2, '0')} / {STEPS.length}
                  </span>
                  <span className={`text-[13px] font-bold ${currentStep.labelColor}`}>{currentStep.title}</span>
                </div>
                <p className="text-[13px] text-stone-600 leading-relaxed mb-1">{currentStep.desc}</p>
                {currentStep.content}
              </div>
            </div>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              ← Passo precedente
            </Button>
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${step === i ? 'bg-stone-900' : 'bg-stone-300'}`}
                  aria-label={`Vai al passo ${i + 1}`}
                />
              ))}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
            >
              Passo successivo →
            </Button>
          </div>

          {/* Schema compatto tutti i passi */}
          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-3">Schema completo del flusso</div>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { label: 'Messaggio', color: 'bg-stone-100 text-stone-700' },
                { label: '+ Chiave sessione', color: 'bg-amber-100 text-amber-800', arrow: true },
                { label: 'AES (simm.)', color: 'bg-stone-900 text-amber-200', arrow: true },
                { label: 'Testo cifrato', color: 'bg-stone-100 text-stone-700', arrow: true },
                { label: 'Chiave sessione cifrata con RSA', color: 'bg-blue-100 text-blue-800', arrow: true },
                { label: '→ Bob', color: 'bg-emerald-100 text-emerald-800', arrow: true },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {item.arrow && <span className="text-stone-400 text-[14px]">→</span>}
                  <span className={`text-[11px] px-2 py-1 rounded-lg font-medium ${item.color}`}>{item.label}</span>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: why ── */}
      {activeTab === 'why' && (
        <div className="space-y-4">
          {/* Confronto */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-5 border-blue-200 bg-blue-50">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 mb-2">Solo simmetrica (AES)</div>
              <div className="text-[28px] mb-2">⚡</div>
              <div className="text-[13px] font-semibold text-blue-900 mb-2">Pro: velocità</div>
              <ul className="text-[12px] text-blue-800 space-y-1 mb-3">
                <li>✔ Cifra gigabyte in millisecondi</li>
                <li>✔ Ideale per dati di grandi dimensioni</li>
                <li>✔ Computazionalmente leggera</li>
              </ul>
              <div className="text-[13px] font-semibold text-rose-700 mb-1">Contro: problema della chiave</div>
              <ul className="text-[12px] text-rose-700 space-y-1">
                <li>✘ Come condividi la chiave in sicurezza?</li>
                <li>✘ Se la chiave viene intercettata, tutto è compromesso</li>
              </ul>
            </Card>

            <Card className="p-5 border-violet-200 bg-violet-50">
              <div className="text-[11px] uppercase tracking-wider text-violet-600 mb-2">Solo asimmetrica (RSA)</div>
              <div className="text-[28px] mb-2">🔐</div>
              <div className="text-[13px] font-semibold text-violet-900 mb-2">Pro: scambio sicuro</div>
              <ul className="text-[12px] text-violet-800 space-y-1 mb-3">
                <li>✔ Chiave pubblica condivisibile liberamente</li>
                <li>✔ Non serve un canale sicuro preliminare</li>
                <li>✔ Abilita autenticazione e firma</li>
              </ul>
              <div className="text-[13px] font-semibold text-rose-700 mb-1">Contro: lentezza</div>
              <ul className="text-[12px] text-rose-700 space-y-1">
                <li>✘ Da 100× a 1000× più lenta di AES</li>
                <li>✘ Non scala per dati di grandi dimensioni</li>
              </ul>
            </Card>

            <Card className="p-5 border-emerald-300 bg-emerald-50" style={{ boxShadow: '0 0 0 2px #34d399' }}>
              <div className="text-[11px] uppercase tracking-wider text-emerald-600 mb-2">Ibrida (AES + RSA) ✔</div>
              <div className="text-[28px] mb-2">🏆</div>
              <div className="text-[13px] font-semibold text-emerald-900 mb-2">Prende il meglio da entrambi</div>
              <ul className="text-[12px] text-emerald-800 space-y-1">
                <li>✔ AES cifra i dati velocemente</li>
                <li>✔ RSA consegna la chiave AES in sicurezza</li>
                <li>✔ La chiave AES è casuale e usa-e-getta</li>
                <li>✔ Scala a qualsiasi dimensione di dati</li>
                <li>✔ Usata in HTTPS, Signal, PGP, SSH…</li>
              </ul>
            </Card>
          </div>

          {/* Analogia */}
          <Card className="p-6">
            <div className="text-[15px] font-semibold text-stone-900 mb-4">🏠 Analogia: la cassetta di sicurezza e il lucchetto</div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  step: '1',
                  icon: '📦',
                  color: 'bg-amber-50 border-amber-200',
                  title: 'Alice mette il messaggio in una cassetta',
                  text: 'La cassetta è chiusa con un lucchetto piccolo e veloce (AES). La chiave del lucchetto è un pezzo di carta dentro una busta.',
                },
                {
                  step: '2',
                  icon: '🔏',
                  color: 'bg-blue-50 border-blue-200',
                  title: 'Sigilla la busta con il lucchetto di Bob',
                  text: 'La busta con la chiave viene sigillata con il lucchetto speciale di Bob (RSA). Solo Bob ha la chiave di quel lucchetto.',
                },
                {
                  step: '3',
                  icon: '📬',
                  color: 'bg-emerald-50 border-emerald-200',
                  title: 'Bob riceve tutto e apre in ordine inverso',
                  text: 'Bob apre prima la busta con la sua chiave privata, trova la chiave del lucchetto piccolo, e poi apre la cassetta.',
                },
              ].map((item) => (
                <div key={item.step} className={`rounded-xl border p-4 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded">{item.step}</span>
                    <span className="text-[20px]">{item.icon}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-stone-900 mb-1">{item.title}</div>
                  <p className="text-[12px] text-stone-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Concetto chiave */}
          <div className="rounded-2xl border border-stone-200 bg-stone-900 text-stone-100 p-6">
            <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-3">Il concetto chiave</div>
            <p className="text-[14px] leading-relaxed text-stone-200">
              La chiave di sessione AES è <strong className="text-amber-300">usa-e-getta</strong>: viene generata casualmente,
              usata per un singolo messaggio, e poi scartata. Questo significa che anche se un attaccante riesce a
              craccare la chiave di una sessione, non può usarla per decifrare sessioni passate o future.
              Questa proprietà si chiama <strong className="text-amber-300">Perfect Forward Secrecy</strong>
              ed è una delle ragioni per cui i sistemi moderni sono così robusti.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB: real ── */}
      {activeTab === 'real' && (
        <div className="space-y-3">
          <div className="text-[14px] text-stone-600 mb-2 leading-relaxed">
            La crittografia ibrida non è un concetto astratto: è ciò che protegge le tue comunicazioni
            ogni giorno. Ecco dove la incontri senza saperlo.
          </div>
          {[
            {
              name: 'HTTPS / TLS',
              icon: '🔒',
              color: 'bg-blue-50 border-blue-200',
              badge: 'Il lucchetto del browser',
              badgeColor: 'bg-blue-100 text-blue-800',
              desc: 'Ogni volta che vedi il lucchetto nella barra del browser, sta girando TLS. Il browser e il server negoziano una chiave di sessione usando crittografia asimmetrica (ECDH o RSA), poi usano AES per tutto il traffico. La tua home banking, le tue email, questo sito: tutto protetto così.',
              detail: 'Protocollo: TLS 1.3 · Chiave sessione: ECDH · Cifratura: AES-256-GCM',
            },
            {
              name: 'Signal / WhatsApp',
              icon: '💬',
              color: 'bg-emerald-50 border-emerald-200',
              badge: 'Messaggi cifrati end-to-end',
              badgeColor: 'bg-emerald-100 text-emerald-800',
              desc: 'Signal usa il "Signal Protocol", che combina crittografia asimmetrica per lo scambio iniziale delle chiavi con AES per i messaggi. Ogni messaggio ha una chiave diversa (Double Ratchet Algorithm), garantendo che anche se una chiave viene compromessa, i messaggi precedenti restano al sicuro.',
              detail: 'Protocollo: Signal Protocol (Double Ratchet) · Chiave: X3DH · Cifratura: AES-256',
            },
            {
              name: 'PGP / Email sicura',
              icon: '📬',
              color: 'bg-violet-50 border-violet-200',
              badge: 'Email cifrate',
              badgeColor: 'bg-violet-100 text-violet-800',
              desc: 'Come hai visto nella sezione precedente, PGP usa esattamente questo schema: chiave di sessione AES per il corpo dell\'email, RSA per consegnare la chiave. Usato da giornalisti, attivisti e chiunque abbia bisogno di comunicazioni riservate.',
              detail: 'Standard: OpenPGP (RFC 4880) · Cifratura messaggio: AES-256 · Chiave: RSA o ECC',
            },
            {
              name: 'SSH',
              icon: '💻',
              color: 'bg-amber-50 border-amber-200',
              badge: 'Accesso remoto sicuro',
              badgeColor: 'bg-amber-100 text-amber-800',
              desc: 'Ogni volta che un amministratore di sistema si connette a un server remoto, usa SSH. Negoziazione iniziale con crittografia asimmetrica (le SSH key che trovi in ~/.ssh/), poi tutto il traffico della sessione è cifrato con AES. Lo stesso schema usato dai server cloud e dai sistemi bancari.',
              detail: 'Protocollo: SSH-2 · Chiave sessione: ECDH / Diffie-Hellman · Cifratura: AES-CTR',
            },
            {
              name: 'File cifrati (VeraCrypt / BitLocker)',
              icon: '💾',
              color: 'bg-stone-50 border-stone-200',
              badge: 'Disco cifrato',
              badgeColor: 'bg-stone-100 text-stone-700',
              desc: 'Anche la cifratura disco usa varianti dello schema ibrido: la password dell\'utente deriva una chiave asimmetrica, che a sua volta protegge la chiave AES con cui è cifrato tutto il disco. Così puoi cambiare password senza ricifrare il disco intero.',
              detail: 'Schema: Password → KDF → chiave master → chiave AES del volume',
            },
          ].map((item) => (
            <div key={item.name} className={`rounded-2xl border p-5 ${item.color}`}>
              <div className="flex items-start gap-4">
                <span className="text-[28px] flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[15px] font-semibold text-stone-900">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>{item.badge}</span>
                  </div>
                  <p className="text-[13px] text-stone-600 leading-relaxed mb-2">{item.desc}</p>
                  <div className="font-mono text-[11px] text-stone-500">{item.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
};

Object.assign(window, { HybridSection });
