// Section 5 — Asymmetric (RSA Simplified)
const RSASection = () => {
  const [keys, setKeys] = useState(() => genToyRSA());
  const [msg, setMsg] = useState("HI BOB");

  // Encrypt each char code with public key (e,n); decrypt with (d,n)
  const encrypted = useMemo(() => {
    return [...msg].map((ch) => modpow(ch.charCodeAt(0), keys.e, keys.n));
  }, [msg, keys]);
  const decrypted = useMemo(() => {
    return encrypted.map((v) => String.fromCharCode(modpow(v, keys.d, keys.n))).join("");
  }, [encrypted, keys]);

  return (
    <SectionShell
      eyebrow="05 · Crittografia asimmetrica"
      title="Due chiavi, e una di queste e pubblica"
      intro="La crittografia asimmetrica (RSA, ECC) usa una coppia di chiavi. Chiunque puo bloccare un messaggio usando la chiave pubblica di Bob, ma solo Bob, con la chiave privata corrispondente, puo sbloccarlo."
      summary={[
        "Ogni persona ha una chiave pubblica (condivisibile) e una chiave privata (segreta).",
        "I messaggi bloccati con la chiave pubblica si aprono solo con la chiave privata.",
        "Questo risolve il problema del 'come condividiamo un segreto?' tipico della crittografia simmetrica.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="blue">Chiave pubblica di Bob</Pill>
            <span className="font-mono text-[13px]">(e = {keys.e}, n = {keys.n})</span>
            <Pill tone="coral">Chiave privata di Bob</Pill>
            <span className="font-mono text-[13px]">(d = {keys.d}, n = {keys.n})</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setKeys(genToyRSA())}>↻ Nuova coppia di chiavi</Button>
        </div>

        {/* Flow */}
        <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
          <Pane label="Messaggio di Alice" tone="blue">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value.toUpperCase().slice(0, 14))}
              className="w-full p-2 rounded-md border border-blue-200 bg-white font-mono text-[14px] focus:outline-none focus:border-blue-500"
            />
            <div className="mt-2 text-[11px] text-blue-700">Cifra con la chiave pubblica di Bob</div>
          </Pane>
          <div className="flex items-center justify-center">
            <Arrow label="🔒 cifra" />
          </div>
          <Pane label="Sul canale (Trudy vede numeri)" tone="ink">
            <div className="font-mono text-[12px] text-amber-200 break-words">
              {encrypted.join(' · ')}
            </div>
          </Pane>
          <div className="flex items-center justify-center">
            <Arrow label="🔑 decifra" />
          </div>
          <Pane label="Bob legge" tone="green">
            <div className="font-mono text-[14px] text-emerald-900 p-1">{decrypted}</div>
            <div className="mt-2 text-[11px] text-emerald-700">Decifra con la chiave privata di Bob</div>
          </Pane>
        </div>

        {/* Key cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white grid place-items-center text-[11px] font-bold">🔓</span>
              <div className="text-[13px] font-semibold text-blue-900">Chiave pubblica — condividila liberamente</div>
            </div>
            <p className="text-[12.5px] text-blue-900/80 leading-relaxed">
              Bob la pubblica sul suo sito, nella firma email, ovunque. Serve per cifrare messaggi destinati a lui.
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-rose-600 text-white grid place-items-center text-[11px] font-bold">🔑</span>
              <div className="text-[13px] font-semibold text-rose-900">Chiave privata — mai condivisa</div>
            </div>
            <p className="text-[12.5px] text-rose-900/80 leading-relaxed">
              Solo Bob la possiede. E l'unica chiave che puo aprire i messaggi cifrati con la sua chiave pubblica.
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200 text-[12.5px] text-stone-700">
          <span className="font-semibold">Dietro le quinte:</span> il vero RSA usa numeri primi lunghi centinaia di cifre.
          Qui stiamo usando primi minuscoli ({keys.p} × {keys.q} = {keys.n}) per farti vedere come si muovono i numeri.
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { RSASection });
