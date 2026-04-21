// Section 8 - Hybrid cryptography
const HybridSection = () => {
  const [keys, setKeys] = useState(() => genToyRSA());
  const [msg, setMsg] = useState("Referto di laboratorio pronto. Condividilo solo con Bob.");
  const [sessionKey, setSessionKey] = useState(() => randomKey(8));

  const encryptedMsg = useMemo(() => fakeAES(msg, sessionKey), [msg, sessionKey]);

  const wrappedKey = useMemo(
    () => [...sessionKey].map((ch) => modpow(ch.charCodeAt(0), keys.e, keys.n)),
    [sessionKey, keys]
  );

  const unwrappedKey = useMemo(
    () => wrappedKey.map((v) => String.fromCharCode(modpow(v, keys.d, keys.n))).join(''),
    [wrappedKey, keys]
  );

  const finalPlain = useMemo(
    () => fakeAESDecrypt(encryptedMsg, unwrappedKey),
    [encryptedMsg, unwrappedKey]
  );

  return (
    <SectionShell
      eyebrow="08 - Crittografia moderna"
      title="Crittografia ibrida: la ricetta del mondo reale"
      intro="I sistemi reali combinano entrambi i mondi: crittografia simmetrica veloce per i dati e crittografia asimmetrica per lo scambio della chiave. Questo e il modello alla base di HTTPS, email sicure e molti protocolli."
      summary={[
        "I dati vengono cifrati con una chiave di sessione simmetrica casuale.",
        "Quella chiave di sessione viene cifrata con la chiave pubblica di Bob.",
        "Bob usa la sua chiave privata per recuperare la chiave di sessione, poi decifra i dati.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="blue">Chiave pubblica di Bob</Pill>
            <span className="font-mono text-[13px]">(e={keys.e}, n={keys.n})</span>
            <Pill tone="coral">Chiave privata di Bob</Pill>
            <span className="font-mono text-[13px]">(d={keys.d}, n={keys.n})</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setKeys(genToyRSA())}>Nuova coppia di chiavi</Button>
            <Button variant="secondary" size="sm" onClick={() => setSessionKey(randomKey(8))}>Nuova chiave di sessione</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-stone-200 p-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Passo 1 - Crittografia simmetrica</div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[84px] p-2 rounded-md border border-stone-300 text-[13px] resize-none focus:outline-none focus:border-stone-900"
            />
            <div className="mt-2 text-[12px] text-stone-600">Chiave di sessione (stile AES): <span className="font-mono">{sessionKey}</span></div>
            <MonoBlock tone="ink" className="mt-2 h-[76px] overflow-auto">{encryptedMsg}</MonoBlock>
          </div>

          <div className="rounded-xl border border-stone-200 p-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Passo 2 - Proteggi la chiave con RSA</div>
            <div className="text-[12px] text-stone-600 mb-2">Chiave di sessione cifrata e inviata insieme al testo cifrato:</div>
            <MonoBlock tone="blue" className="h-[76px] overflow-auto">{wrappedKey.join(' . ')}</MonoBlock>
            <div className="mt-3 text-[12px] text-stone-600">Bob decifra la chiave con la sua chiave privata: <span className="font-mono">{unwrappedKey}</span></div>
            <div className="mt-2 text-[12px] text-stone-600">Poi decifra il messaggio:</div>
            <MonoBlock tone="green" className="mt-1">{finalPlain || '-'}</MonoBlock>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[12.5px] text-emerald-900">
          <span className="font-semibold">Perche funziona bene:</span> la crittografia simmetrica offre velocita, quella asimmetrica risolve la consegna sicura della chiave.
          Insieme scalano sul traffico reale di Internet.
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { HybridSection });
