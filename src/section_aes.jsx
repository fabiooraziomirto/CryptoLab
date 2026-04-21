// Sezione 04 — Crittografia simmetrica con AES-GCM reale (Web Crypto API)
const mutatePayload = (payload) => {
  const [iv, cipher] = String(payload || '').split(':');
  if (!iv || !cipher) return payload;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const chars = cipher.split('');
  for (let i = chars.length - 1; i >= 0; i--) {
    if (chars[i] === '=') continue;
    const idx = alphabet.indexOf(chars[i]);
    chars[i] = alphabet[(idx + 1 + alphabet.length) % alphabet.length] || 'A';
    break;
  }
  return `${iv}:${chars.join('')}`;
};

const AESSection = () => {
  const [msg, setMsg] = useState('Patient: J. Rivera - dosage 50mg');
  const [aliceKey, setAliceKey] = useState(() => randomKey(16));
  const [bobKey, setBobKey] = useState('');
  const [tamperPacket, setTamperPacket] = useState(false);
  const [packetState, setPacketState] = useState({
    status: 'loading',
    payload: '',
    ivHex: '',
    cipherHex: '',
    error: '',
  });
  const [decryptState, setDecryptState] = useState({ status: 'idle', text: '', error: '' });

  useEffect(() => {
    let cancelled = false;
    setPacketState((prev) => ({ ...prev, status: 'loading', error: '' }));

    encryptAesGcm(msg, aliceKey)
      .then((packet) => {
        if (cancelled) return;
        setPacketState({
          status: 'ready',
          payload: packet.payload,
          ivHex: packet.ivHex,
          cipherHex: packet.cipherHex,
          error: '',
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setPacketState({
          status: 'error',
          payload: '',
          ivHex: '',
          cipherHex: '',
          error: error.message || 'Cifratura fallita',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [msg, aliceKey]);

  const packetOnWire = useMemo(
    () => (tamperPacket ? mutatePayload(packetState.payload) : packetState.payload),
    [packetState.payload, tamperPacket]
  );

  useEffect(() => {
    setDecryptState({ status: 'idle', text: '', error: '' });
  }, [bobKey, packetOnWire]);

  const decryptForBob = async () => {
    if (!packetOnWire) return;
    setDecryptState({ status: 'loading', text: '', error: '' });
    try {
      const text = await decryptAesGcm(packetOnWire, bobKey);
      setDecryptState({ status: 'success', text, error: '' });
    } catch {
      setDecryptState({
        status: 'error',
        text: '',
        error: tamperPacket
          ? 'Autenticazione fallita: il pacchetto e stato modificato durante il tragitto.'
          : 'Autenticazione fallita: chiave errata o pacchetto corrotto.',
      });
    }
  };

  const browserReady = supportsWebCrypto();

  return (
    <SectionShell
      eyebrow="04 · Crittografia simmetrica"
      title="AES-GCM: stesso segreto, decrittazione reale"
      intro="Questa versione usa la Web Crypto API del browser. Alice cifra con un segreto condiviso, Bob puo decifrare solo con lo stesso segreto e ogni manomissione viene rilevata automaticamente."
      summary={[
        'AES e veloce, quindi protegge in modo efficiente grandi quantita di dati.',
        'Con AES-GCM la chiave corretta decifra, mentre una chiave sbagliata fallisce l\'autenticazione.',
        'Conta anche l\'integrita: se Trudy altera il pacchetto, Bob se ne accorge subito.',
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="blue">Segreto condiviso</Pill>
            <span className="font-mono text-[13px] text-stone-900">{aliceKey}</span>
            <Pill tone="amber">AES-256-GCM</Pill>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAliceKey(randomKey(16))}>
            Nuova chiave condivisa
          </Button>
        </div>

        {!browserReady && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-800">
            Questo browser non espone la Web Crypto API, quindi la demo AES reale non puo essere eseguita qui.
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          <Pane label="Testo in chiaro (Alice)" tone="blue">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[132px] p-3 rounded-lg border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
            />
            <div className="mt-3 text-[12px] text-blue-800 leading-relaxed">
              Alice combina il messaggio con un IV casuale appena generato e il suo segreto condiviso.
            </div>
          </Pane>

          <div className="flex items-center justify-center">
            <Arrow label="cifra" />
          </div>

          <Pane label="Pacchetto sul canale" tone="ink">
            <MonoBlock tone="ink" className="h-[132px] overflow-auto">
              {packetState.status === 'loading'
                ? 'Cifratura in corso...'
                : packetState.status === 'error'
                  ? packetState.error
                  : packetOnWire}
            </MonoBlock>
            <div className="mt-3 grid md:grid-cols-2 gap-2">
              <div className="rounded-lg border border-stone-700 bg-stone-950/40 p-2">
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">IV</div>
                <div className="font-mono text-[11px] text-stone-200 break-all">{packetState.ivHex || '-'}</div>
              </div>
              <div className="rounded-lg border border-stone-700 bg-stone-950/40 p-2">
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Cifrato + tag</div>
                <div className="font-mono text-[11px] text-stone-200 break-all">{packetState.cipherHex || '-'}</div>
              </div>
            </div>
          </Pane>
        </div>

        <div className="mt-6 border-t border-stone-200 pt-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-[15px] font-semibold text-stone-900">Bob prova a decifrare</div>
              <div className="text-[13px] text-stone-600 mt-1">
                Usa esattamente la stessa chiave per recuperare il testo in chiaro. Anche un solo errore blocca la decifratura.
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => setBobKey(aliceKey)}>
                Usa la chiave di Alice
              </Button>
              <button
                onClick={() => setTamperPacket((value) => !value)}
                className={`text-[12px] px-3 py-1.5 rounded-lg border font-medium ${
                  tamperPacket
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {tamperPacket ? 'Pacchetto manomesso' : 'Manometti pacchetto'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
            <Pane label="Chiave di Bob" tone={decryptState.status === 'error' ? 'coral' : 'green'}>
              <input
                value={bobKey}
                onChange={(e) => setBobKey(e.target.value.toUpperCase())}
                placeholder="Inserisci il segreto condiviso"
                className="w-full p-3 rounded-lg border border-stone-300 bg-white text-[13px] font-mono focus:outline-none focus:border-stone-900"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-[12px] text-stone-600">
                  Bob deve conoscere il segreto prima che questo funzioni.
                </div>
                <Button size="sm" onClick={decryptForBob} disabled={!browserReady || !packetOnWire || !bobKey}>
                  Decifra
                </Button>
              </div>
            </Pane>

            <div className="flex items-center justify-center">
              <Arrow label="decifra" />
            </div>

            <Pane label="Risultato per Bob" tone={decryptState.status === 'error' ? 'coral' : 'green'}>
              <MonoBlock tone={decryptState.status === 'error' ? 'coral' : 'green'} className="h-[96px] overflow-auto">
                {decryptState.status === 'idle' && 'Premi Decifra per testare la chiave di Bob.'}
                {decryptState.status === 'loading' && 'Verifica del pacchetto in corso...'}
                {decryptState.status === 'success' && decryptState.text}
                {decryptState.status === 'error' && decryptState.error}
              </MonoBlock>
            </Pane>
          </div>
        </div>
      </Card>

      <Card className="p-7">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-[11px] uppercase tracking-wider text-blue-700 mb-2">Perche Bob riesce</div>
            <div className="text-[13px] text-blue-900 leading-relaxed">
              Alice e Bob ricavano la stessa chiave AES dallo stesso segreto condiviso, quindi il browser puo invertire il testo cifrato.
            </div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-[11px] uppercase tracking-wider text-rose-700 mb-2">Perche la chiave sbagliata fallisce</div>
            <div className="text-[13px] text-rose-900 leading-relaxed">
              AES-GCM verifica un tag di autenticazione. Con la chiave sbagliata la verifica fallisce e Bob non ottiene alcun testo in chiaro.
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-[11px] uppercase tracking-wider text-amber-800 mb-2">Resta un problema aperto</div>
            <div className="text-[13px] text-amber-900 leading-relaxed">
              AES protegge i dati, ma non spiega come Alice e Bob si siano scambiati il segreto in modo sicuro.
            </div>
          </div>
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { AESSection });
