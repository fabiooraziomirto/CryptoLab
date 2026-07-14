// Section — DES (Data Encryption Standard)
const DESSection = () => {
  const [msg, setMsg] = useState("Secret: launch at dawn");
  const [key, setKey] = useState(() => randomKey(7));
  const [bobKey, setBobKey] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [animStep, setAnimStep] = useState(null); // null | 0..15

  const cipher = useMemo(() => fakeDES(msg, key), [msg, key]);

  const bobEffective = bobKey || key;
  const bobDecrypted = useMemo(() => fakeDESDecrypt(cipher, bobEffective), [cipher, bobEffective]);
  const bobMatch = bobEffective === key;
  const bobGarbled = !bobDecrypted || /[^\x20-\x7E]/.test(bobDecrypted);

  const handleNewKey = () => { setKey(randomKey(7)); setBobKey(''); };
  const handleCopyKey = () => setBobKey(key);

  // Feistel round animation data (conceptual, derived from key)
  const subkeys = useMemo(() => {
    const sk = desSubkeys(key);
    return sk.map((v) => v.toString(16).padStart(8, '0').toUpperCase());
  }, [key]);

  return (
    <SectionShell
      eyebrow="Modern · DES"
      title="Data Encryption Standard"
      intro="DES (1977) was the first widely-adopted symmetric cipher. It uses a 56-bit key and a Feistel network of 16 rounds. By 1999 it was broken by brute force — but its design influenced all modern block ciphers."
      summary={[
        "DES uses a 56-bit key — too short for today's computers (brute-forced in < 24h in 1999).",
        "A Feistel network splits data into two halves and mixes them over 16 rounds.",
        "The same structure encrypts and decrypts — just reverse the subkey order.",
        "DES was superseded by Triple DES and then AES.",
      ]}
    >
      {/* Mode switcher */}
      <div className="flex gap-2">
        {['encrypt', 'decrypt', 'feistel'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors capitalize ${
              mode === m
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {m === 'feistel' ? 'Feistel rounds' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Encrypt tab */}
      {mode === 'encrypt' && (
        <Card className="p-7">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Avatar who="alice" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-0.5">DES key (56 bits = 7 chars)</div>
                <span className="font-mono text-[15px] font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 inline-block">{key}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCopyKey}>↓ Give to Bob</Button>
              <Button variant="secondary" size="sm" onClick={handleNewKey}>↻ New key</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <Pane label="Plaintext" tone="blue">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="w-full h-[110px] p-3 rounded-lg border border-blue-200 bg-white text-[13px] resize-none focus:outline-none focus:border-blue-500"
              />
            </Pane>
            <Arrow label="DES encrypt" />
            <Pane label="Ciphertext (base64)" tone="ink">
              <MonoBlock tone="ink" className="h-[110px] overflow-auto">{cipher}</MonoBlock>
            </Pane>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Key size</div>
              <div className="text-[18px] font-semibold text-stone-900">56 bit</div>
              <div className="text-[11px] text-rose-600 mt-1">⚠ Broken in 1999</div>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Block size</div>
              <div className="text-[18px] font-semibold text-stone-900">64 bit</div>
              <div className="text-[11px] text-stone-500 mt-1">8 bytes per block</div>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Rounds</div>
              <div className="text-[18px] font-semibold text-stone-900">16</div>
              <div className="text-[11px] text-stone-500 mt-1">Feistel rounds</div>
            </div>
          </div>
        </Card>
      )}

      {/* Decrypt tab */}
      {mode === 'decrypt' && (
        <Card className="p-7">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Avatar who="bob" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-0.5">Bob's key (type it)</div>
                <input
                  value={bobKey}
                  onChange={(e) => setBobKey(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 7))}
                  placeholder={key}
                  className={`font-mono text-[15px] px-3 py-1 rounded-lg border focus:outline-none w-[130px] ${
                    bobKey === ''
                      ? 'border-stone-300 bg-white'
                      : bobMatch
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                      : 'border-rose-400 bg-rose-50 text-rose-900'
                  }`}
                />
              </div>
            </div>
            {bobKey !== '' && <Pill tone={bobMatch ? 'green' : 'coral'}>{bobMatch ? '✓ Correct' : '✗ Wrong key'}</Pill>}
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <Pane label="Ciphertext received" tone="ink">
              <MonoBlock tone="ink" className="h-[110px] overflow-auto">{cipher}</MonoBlock>
            </Pane>
            <Arrow label="DES decrypt" />
            <Pane label="Result" tone={bobKey === '' ? 'blue' : bobMatch ? 'green' : 'coral'}>
              <MonoBlock tone={bobKey === '' ? 'neutral' : bobMatch ? 'green' : 'coral'} className="h-[110px] overflow-auto">
                {bobKey === ''
                  ? <span className="text-stone-400">Enter key to decrypt…</span>
                  : bobMatch
                  ? bobDecrypted
                  : <span>⚠ {bobGarbled ? 'Garbled — wrong key' : bobDecrypted}</span>
                }
              </MonoBlock>
            </Pane>
          </div>

          <div className="mt-3 text-[12px] text-stone-500">
            DES decryption = same Feistel network, but subkeys applied in <strong>reverse order</strong>.
          </div>
        </Card>
      )}

      {/* Feistel visualization tab */}
      {mode === 'feistel' && (
        <Card className="p-7">
          <div className="mb-5">
            <div className="text-[15px] font-semibold text-stone-900 mb-1">Feistel Network — 16 rounds</div>
            <div className="text-[13px] text-stone-600">
              Each round: swap left (L) and right (R) halves. Right half goes through function F mixed with a subkey, then XORed with left half.
            </div>
          </div>

          {/* Central diagram */}
          <div className="flex gap-6 items-start">
            {/* Block diagram */}
            <div className="flex-1 min-w-0">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 rounded-lg bg-blue-100 border border-blue-300 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-blue-700 mb-1">L₀ (left half)</div>
                  <div className="font-mono text-[12px] text-blue-900">32 bits</div>
                </div>
                <div className="flex-1 rounded-lg bg-violet-100 border border-violet-300 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-violet-700 mb-1">R₀ (right half)</div>
                  <div className="font-mono text-[12px] text-violet-900">32 bits</div>
                </div>
              </div>

              <div className="space-y-2">
                {Array.from({ length: 16 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setAnimStep(animStep === i ? null : i)}
                    className={`w-full rounded-lg border p-2.5 text-left transition-all ${
                      animStep === i
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-stone-500 w-8">R{i + 1}</span>
                        <span className="text-[11px] text-stone-700">
                          L{i + 1} = R{i} · R{i + 1} = L{i} ⊕ F(R{i}, K{i + 1})
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-700 bg-amber-100 border border-amber-200 rounded px-2 py-0.5">
                        K{i + 1}
                      </span>
                    </div>
                    {animStep === i && (
                      <div className="mt-2 pt-2 border-t border-amber-200">
                        <div className="text-[11px] text-stone-600 mb-1">Subkey for round {i + 1}:</div>
                        <div className="font-mono text-[12px] text-amber-800 bg-white border border-amber-200 rounded px-2 py-1">
                          {subkeys[i]}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-3">
                <div className="flex-1 rounded-lg bg-emerald-100 border border-emerald-300 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">L₁₆ → ciphertext left</div>
                  <div className="font-mono text-[12px] text-emerald-900">32 bits</div>
                </div>
                <div className="flex-1 rounded-lg bg-emerald-100 border border-emerald-300 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">R₁₆ → ciphertext right</div>
                  <div className="font-mono text-[12px] text-emerald-900">32 bits</div>
                </div>
              </div>
            </div>

            {/* Side legend */}
            <div className="w-[200px] shrink-0 space-y-3">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="text-[11px] font-semibold text-amber-900 mb-2">Key schedule</div>
                <div className="text-[11px] text-amber-800">
                  The 56-bit key is split and rotated to produce 16 different 48-bit subkeys — one per round.
                </div>
              </div>
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                <div className="text-[11px] font-semibold text-stone-900 mb-2">⊕ = XOR</div>
                <div className="text-[11px] text-stone-600">
                  XOR is self-inverse: A⊕B⊕B = A. This is why the same Feistel network decrypts with reversed subkeys.
                </div>
              </div>
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
                <div className="text-[11px] font-semibold text-rose-900 mb-2">Why DES failed</div>
                <div className="text-[11px] text-rose-800">
                  56-bit key = 2⁵⁶ ≈ 72 quadrillion combinations. Sounds big, but dedicated hardware cracked it in 22 hours in 1999.
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </SectionShell>
  );
};

Object.assign(window, { DESSection });
