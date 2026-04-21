// Section 8 - Hybrid cryptography
const HybridSection = () => {
  const [keys, setKeys] = useState(() => genToyRSA());
  const [msg, setMsg] = useState("Lab report ready. Share only with Bob.");
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
      eyebrow="08 - Modern cryptography"
      title="Hybrid cryptography: the real-world recipe"
      intro="Real systems combine both worlds: fast symmetric crypto for data, asymmetric crypto for key exchange. This is the core pattern behind HTTPS, secure email, and many protocols."
      summary={[
        "Data is encrypted with a random symmetric session key.",
        "That session key is encrypted with Bob's public key.",
        "Bob uses his private key to recover the session key, then decrypts the data.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="blue">Bob public key</Pill>
            <span className="font-mono text-[13px]">(e={keys.e}, n={keys.n})</span>
            <Pill tone="coral">Bob private key</Pill>
            <span className="font-mono text-[13px]">(d={keys.d}, n={keys.n})</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setKeys(genToyRSA())}>New key pair</Button>
            <Button variant="secondary" size="sm" onClick={() => setSessionKey(randomKey(8))}>New session key</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-stone-200 p-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Step 1 - Symmetric encryption</div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[84px] p-2 rounded-md border border-stone-300 text-[13px] resize-none focus:outline-none focus:border-stone-900"
            />
            <div className="mt-2 text-[12px] text-stone-600">Session key (AES-like): <span className="font-mono">{sessionKey}</span></div>
            <MonoBlock tone="ink" className="mt-2 h-[76px] overflow-auto">{encryptedMsg}</MonoBlock>
          </div>

          <div className="rounded-xl border border-stone-200 p-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Step 2 - Wrap key with RSA</div>
            <div className="text-[12px] text-stone-600 mb-2">Encrypted session key sent with the ciphertext:</div>
            <MonoBlock tone="blue" className="h-[76px] overflow-auto">{wrappedKey.join(' . ')}</MonoBlock>
            <div className="mt-3 text-[12px] text-stone-600">Bob decrypts key with private key: <span className="font-mono">{unwrappedKey}</span></div>
            <div className="mt-2 text-[12px] text-stone-600">Then decrypts message:</div>
            <MonoBlock tone="green" className="mt-1">{finalPlain || '-'}</MonoBlock>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[12.5px] text-emerald-900">
          <span className="font-semibold">Why this wins:</span> symmetric crypto gives speed, asymmetric crypto solves safe key delivery.
          Together, they scale to real internet traffic.
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { HybridSection });
