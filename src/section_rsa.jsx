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
      eyebrow="05 · Asymmetric encryption"
      title="Two keys, and one of them is public"
      intro="Asymmetric encryption (RSA, ECC) uses a key pair. Anyone can lock a message using Bob’s public key — but only Bob, holding the matching private key, can unlock it."
      summary={[
        "Each person has a public key (shareable) and a private key (secret).",
        "Messages locked with the public key can only be opened with the private key.",
        "This solves the ‘how do we share a secret key?’ problem of symmetric crypto.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="blue">Bob’s public key</Pill>
            <span className="font-mono text-[13px]">(e = {keys.e}, n = {keys.n})</span>
            <Pill tone="coral">Bob’s private key</Pill>
            <span className="font-mono text-[13px]">(d = {keys.d}, n = {keys.n})</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setKeys(genToyRSA())}>↻ New key pair</Button>
        </div>

        {/* Flow */}
        <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
          <Pane label="Alice’s message" tone="blue">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value.toUpperCase().slice(0, 14))}
              className="w-full p-2 rounded-md border border-blue-200 bg-white font-mono text-[14px] focus:outline-none focus:border-blue-500"
            />
            <div className="mt-2 text-[11px] text-blue-700">Encrypts with Bob’s public key</div>
          </Pane>
          <div className="flex items-center justify-center">
            <Arrow label="🔒 encrypt" />
          </div>
          <Pane label="On the wire (Trudy sees numbers)" tone="ink">
            <div className="font-mono text-[12px] text-amber-200 break-words">
              {encrypted.join(' · ')}
            </div>
          </Pane>
          <div className="flex items-center justify-center">
            <Arrow label="🔑 decrypt" />
          </div>
          <Pane label="Bob reads" tone="green">
            <div className="font-mono text-[14px] text-emerald-900 p-1">{decrypted}</div>
            <div className="mt-2 text-[11px] text-emerald-700">Decrypts with Bob’s private key</div>
          </Pane>
        </div>

        {/* Key cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white grid place-items-center text-[11px] font-bold">🔓</span>
              <div className="text-[13px] font-semibold text-blue-900">Public key — share freely</div>
            </div>
            <p className="text-[12.5px] text-blue-900/80 leading-relaxed">
              Bob publishes this on his website, in his email signature, anywhere. It’s used to lock messages to him.
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-rose-600 text-white grid place-items-center text-[11px] font-bold">🔑</span>
              <div className="text-[13px] font-semibold text-rose-900">Private key — never shared</div>
            </div>
            <p className="text-[12.5px] text-rose-900/80 leading-relaxed">
              Only Bob has this. It’s the only key that can open messages locked with his public key.
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200 text-[12.5px] text-stone-700">
          <span className="font-semibold">Behind the scenes:</span> real RSA uses primes hundreds of digits long.
          Here we’re using tiny primes ({keys.p} × {keys.q} = {keys.n}) so you can see the numbers move.
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { RSASection });
