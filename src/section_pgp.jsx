// Section 11 - PGP secure email
const PGPSection = () => {
  const [msg, setMsg] = useState("Patient data attached. Please keep confidential.");
  const [sessionKey, setSessionKey] = useState(() => randomKey(8));
  const [bobKeys, setBobKeys] = useState(() => genToyRSA());
  const [aliceKeys, setAliceKeys] = useState(() => genToyRSA());

  const digest = useMemo(() => tinyHash(msg), [msg]);
  const signature = useMemo(
    () => [...digest].map((ch) => modpow(ch.charCodeAt(0), aliceKeys.d, aliceKeys.n)),
    [digest, aliceKeys]
  );
  const signatureCheck = useMemo(
    () => signature.map((v) => String.fromCharCode(modpow(v, aliceKeys.e, aliceKeys.n))).join(''),
    [signature, aliceKeys]
  );

  const encryptedMsg = useMemo(() => fakeAES(msg, sessionKey), [msg, sessionKey]);
  const wrappedSession = useMemo(
    () => [...sessionKey].map((ch) => modpow(ch.charCodeAt(0), bobKeys.e, bobKeys.n)),
    [sessionKey, bobKeys]
  );

  const recoveredSession = useMemo(
    () => wrappedSession.map((v) => String.fromCharCode(modpow(v, bobKeys.d, bobKeys.n))).join(''),
    [wrappedSession, bobKeys]
  );
  const recoveredMsg = useMemo(() => fakeAESDecrypt(encryptedMsg, recoveredSession), [encryptedMsg, recoveredSession]);
  const recoveredDigest = useMemo(() => tinyHash(recoveredMsg), [recoveredMsg]);
  const signatureValid = recoveredDigest === signatureCheck;

  return (
    <SectionShell
      eyebrow="11 - Real world"
      title="PGP email: confidentiality + integrity + sender authenticity"
      intro="PGP combines ideas you already learned: hash + signature + hybrid encryption. One workflow gives all three properties needed for secure email."
      summary={[
        "Confidentiality: message encrypted with a random symmetric session key.",
        "Key delivery: session key encrypted with Bob's public key.",
        "Authenticity and integrity: Alice signs the message hash with her private key.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Button variant="secondary" size="sm" onClick={() => setSessionKey(randomKey(8))}>New session key</Button>
          <Button variant="secondary" size="sm" onClick={() => setBobKeys(genToyRSA())}>New Bob keys</Button>
          <Button variant="secondary" size="sm" onClick={() => setAliceKeys(genToyRSA())}>New Alice keys</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-stone-200 p-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Alice prepares message</div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[84px] p-2 rounded-md border border-stone-300 text-[13px] resize-none focus:outline-none focus:border-stone-900"
            />
            <div className="mt-2 text-[12px] text-stone-600">Hash: <span className="font-mono">{digest}</span></div>
            <div className="mt-1 text-[12px] text-stone-600">Signed hash (Alice private key):</div>
            <MonoBlock tone="blue" className="mt-1 h-[56px] overflow-auto">{signature.join(' . ')}</MonoBlock>
          </div>

          <div className="rounded-xl border border-stone-200 p-4">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Encrypted package sent to Bob</div>
            <div className="text-[12px] text-stone-600">Ciphertext</div>
            <MonoBlock tone="ink" className="mt-1 h-[52px] overflow-auto">{encryptedMsg}</MonoBlock>
            <div className="mt-2 text-[12px] text-stone-600">Session key encrypted with Bob public key</div>
            <MonoBlock tone="coral" className="mt-1 h-[52px] overflow-auto">{wrappedSession.join(' . ')}</MonoBlock>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-stone-200 p-4">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Bob verifies</div>
          <div className="grid md:grid-cols-3 gap-3 text-[12px]">
            <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
              <div className="text-stone-500 mb-1">Recovered session key</div>
              <div className="font-mono">{recoveredSession}</div>
            </div>
            <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
              <div className="text-stone-500 mb-1">Recovered message hash</div>
              <div className="font-mono">{recoveredDigest}</div>
            </div>
            <div className={`rounded-lg border p-3 ${signatureValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="text-stone-500 mb-1">Signature check</div>
              <div className={`font-semibold ${signatureValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                {signatureValid ? 'VALID' : 'INVALID'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { PGPSection });
