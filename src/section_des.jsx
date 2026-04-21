// Section — DES and 3DES comparison
const DES_IP = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7,
];

const DES_FP = [
  40, 8, 48, 16, 56, 24, 64, 32,
  39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26,
  33, 1, 41, 9, 49, 17, 57, 25,
];

const DES_E = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1,
];

const DES_P = [
  16, 7, 20, 21,
  29, 12, 28, 17,
  1, 15, 23, 26,
  5, 18, 31, 10,
  2, 8, 24, 14,
  32, 27, 3, 9,
  19, 13, 30, 6,
  22, 11, 4, 25,
];

const DES_PC1 = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4,
];

const DES_PC2 = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32,
];

const DES_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

const DES_SBOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

const DES_MASK_28 = (1n << 28n) - 1n;
const DES_MASK_32 = (1n << 32n) - 1n;

const sanitizeHexKey = (value) => value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 16);

const randomHexKey = (length = 16) => {
  const bytes = new Uint8Array(length / 2);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytesToHex(bytes).slice(0, length);
};

const mutateHexKey = (value) => {
  if (!value) return value;
  const chars = value.split('');
  const last = chars[chars.length - 1] || '0';
  chars[chars.length - 1] = last === 'F' ? '0' : 'F';
  return chars.join('');
};

const permuteBits = (value, table, inputBits) => {
  let out = 0n;
  for (const position of table) {
    const bit = (value >> BigInt(inputBits - position)) & 1n;
    out = (out << 1n) | bit;
  }
  return out;
};

const rotateLeft28 = (value, shift) => {
  const amount = BigInt(shift);
  return ((value << amount) | (value >> (28n - amount))) & DES_MASK_28;
};

const hexToBigInt = (hex) => BigInt(`0x${hex}`);

const bytesToBigInt = (bytes) => {
  let out = 0n;
  for (const byte of bytes) out = (out << 8n) | BigInt(byte);
  return out;
};

const bigIntToBytes = (value, size) => {
  const out = new Uint8Array(size);
  let current = value;
  for (let i = size - 1; i >= 0; i--) {
    out[i] = Number(current & 0xffn);
    current >>= 8n;
  }
  return out;
};

const createDesSubkeys = (keyHex) => {
  if (sanitizeHexKey(keyHex).length !== 16) throw new Error('Le chiavi DES richiedono 16 caratteri esadecimali');
  const key56 = permuteBits(hexToBigInt(keyHex), DES_PC1, 64);
  let c = key56 >> 28n;
  let d = key56 & DES_MASK_28;
  const subkeys = [];

  for (const shift of DES_SHIFTS) {
    c = rotateLeft28(c, shift);
    d = rotateLeft28(d, shift);
    subkeys.push(permuteBits((c << 28n) | d, DES_PC2, 56));
  }

  return subkeys;
};

const desFeistel = (right, subkey) => {
  const expanded = permuteBits(right, DES_E, 32) ^ subkey;
  let out = 0n;

  for (let box = 0; box < 8; box++) {
    const shift = BigInt((7 - box) * 6);
    const chunk = Number((expanded >> shift) & 0x3fn);
    const row = ((chunk & 0b100000) >> 4) | (chunk & 1);
    const col = (chunk >> 1) & 0b1111;
    out = (out << 4n) | BigInt(DES_SBOXES[box][row][col]);
  }

  return permuteBits(out, DES_P, 32);
};

const processDesBlock = (block, subkeys, decrypt = false) => {
  const orderedSubkeys = decrypt ? [...subkeys].reverse() : subkeys;
  const initial = permuteBits(block, DES_IP, 64);
  let left = (initial >> 32n) & DES_MASK_32;
  let right = initial & DES_MASK_32;

  for (const subkey of orderedSubkeys) {
    const nextLeft = right;
    const nextRight = left ^ desFeistel(right, subkey);
    left = nextLeft;
    right = nextRight;
  }

  return permuteBits((right << 32n) | left, DES_FP, 64);
};

const pkcs7Pad = (bytes) => {
  const remainder = bytes.length % 8;
  const padSize = remainder === 0 ? 8 : 8 - remainder;
  const out = new Uint8Array(bytes.length + padSize);
  out.set(bytes);
  out.fill(padSize, bytes.length);
  return out;
};

const pkcs7Unpad = (bytes) => {
  if (!bytes.length) return bytes;
  const padSize = bytes[bytes.length - 1];
  if (padSize < 1 || padSize > 8) throw new Error('Padding non valido');
  for (let i = bytes.length - padSize; i < bytes.length; i++) {
    if (bytes[i] !== padSize) throw new Error('Padding non valido');
  }
  return bytes.slice(0, bytes.length - padSize);
};

const encryptBlockSeries = (bytes, blockFn) => {
  const padded = pkcs7Pad(bytes);
  const out = new Uint8Array(padded.length);
  for (let i = 0; i < padded.length; i += 8) {
    const block = bytesToBigInt(padded.subarray(i, i + 8));
    out.set(bigIntToBytes(blockFn(block), 8), i);
  }
  return out;
};

const decryptBlockSeries = (bytes, blockFn) => {
  if (!bytes.length || bytes.length % 8 !== 0) throw new Error('Il testo cifrato deve essere un multiplo di 8 byte');
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 8) {
    const block = bytesToBigInt(bytes.subarray(i, i + 8));
    out.set(bigIntToBytes(blockFn(block), 8), i);
  }
  return pkcs7Unpad(out);
};

const encryptDesMessage = (text, keyHex) => {
  const subkeys = createDesSubkeys(sanitizeHexKey(keyHex));
  const plainBytes = new TextEncoder().encode(text);
  return bytesToHex(encryptBlockSeries(plainBytes, (block) => processDesBlock(block, subkeys, false)));
};

const decryptDesMessage = (cipherHex, keyHex) => {
  const normalizedCipher = cipherHex.replace(/\s+/g, '');
  const subkeys = createDesSubkeys(sanitizeHexKey(keyHex));
  const cipherBytes = Uint8Array.from(
    normalizedCipher.match(/.{1,2}/g) || [],
    (pair) => parseInt(pair, 16)
  );
  const plainBytes = decryptBlockSeries(cipherBytes, (block) => processDesBlock(block, subkeys, true));
  return new TextDecoder().decode(plainBytes);
};

const encryptTripleDesMessage = (text, keys) => {
  const k1 = createDesSubkeys(sanitizeHexKey(keys.k1));
  const k2 = createDesSubkeys(sanitizeHexKey(keys.k2));
  const k3 = createDesSubkeys(sanitizeHexKey(keys.k3));
  const plainBytes = new TextEncoder().encode(text);

  const out = encryptBlockSeries(plainBytes, (block) => {
    const step1 = processDesBlock(block, k1, false);
    const step2 = processDesBlock(step1, k2, true);
    return processDesBlock(step2, k3, false);
  });

  return bytesToHex(out);
};

const decryptTripleDesMessage = (cipherHex, keys) => {
  const normalizedCipher = cipherHex.replace(/\s+/g, '');
  const cipherBytes = Uint8Array.from(
    normalizedCipher.match(/.{1,2}/g) || [],
    (pair) => parseInt(pair, 16)
  );
  const k1 = createDesSubkeys(sanitizeHexKey(keys.k1));
  const k2 = createDesSubkeys(sanitizeHexKey(keys.k2));
  const k3 = createDesSubkeys(sanitizeHexKey(keys.k3));

  const out = decryptBlockSeries(cipherBytes, (block) => {
    const step1 = processDesBlock(block, k3, true);
    const step2 = processDesBlock(step1, k2, false);
    return processDesBlock(step2, k1, true);
  });

  return new TextDecoder().decode(out);
};

const formatHexBlocks = (value) => value.replace(/(.{16})/g, '$1 ').trim();

const safeDecrypt = (fn) => {
  try {
    return fn();
  } catch {
    return 'output illeggibile / padding non valido';
  }
};

const LegacyBlockSection = () => {
  const [mode, setMode] = useState('des');
  const [msg, setMsg] = useState('I sistemi legacy compaiono ancora in ospedali e bancomat.');
  const [desKey, setDesKey] = useState(() => randomHexKey());
  const [tripleKeys, setTripleKeys] = useState(() => ({
    k1: randomHexKey(),
    k2: randomHexKey(),
    k3: randomHexKey(),
  }));

  const desCipher = useMemo(() => {
    try {
      return { ok: true, text: formatHexBlocks(encryptDesMessage(msg, desKey)) };
    } catch (error) {
      return { ok: false, text: error.message };
    }
  }, [msg, desKey]);

  const desPlain = useMemo(() => {
    if (!desCipher.ok) return 'Inserisci prima una chiave completa di 16 cifre esadecimali.';
    return safeDecrypt(() => decryptDesMessage(desCipher.text, desKey));
  }, [desCipher, desKey]);

  const desWrong = useMemo(
    () => (desCipher.ok
      ? safeDecrypt(() => decryptDesMessage(desCipher.text, mutateHexKey(desKey)))
      : 'Serve prima un testo cifrato valido.'),
    [desCipher, desKey]
  );

  const tripleCipher = useMemo(() => {
    try {
      return { ok: true, text: formatHexBlocks(encryptTripleDesMessage(msg, tripleKeys)) };
    } catch (error) {
      return { ok: false, text: error.message };
    }
  }, [msg, tripleKeys]);

  const triplePlain = useMemo(() => {
    if (!tripleCipher.ok) return 'Compila prima tutte e tre le chiavi da 16 cifre esadecimali.';
    return safeDecrypt(() => decryptTripleDesMessage(tripleCipher.text, tripleKeys));
  }, [tripleCipher, tripleKeys]);

  const tripleWrong = useMemo(
    () => (tripleCipher.ok
      ? safeDecrypt(() => decryptTripleDesMessage(tripleCipher.text, { ...tripleKeys, k3: mutateHexKey(tripleKeys.k3) }))
      : 'Serve prima un testo cifrato valido.'),
    [tripleCipher, tripleKeys]
  );

  const currentCipher = mode === 'des' ? desCipher.text : tripleCipher.text;
  const currentPlain = mode === 'des' ? desPlain : triplePlain;
  const wrongPlain = mode === 'des' ? desWrong : tripleWrong;
  const strengthLabel = mode === 'des' ? 'chiave da 56 bit, obsoleta' : 'chiave da 112/168 bit, solo legacy';

  const tabClass = (value) =>
    `px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
      mode === value ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
    }`;

  return (
    <SectionShell
      eyebrow="Moderni · Cifrari a blocchi legacy"
      title="DES e 3DES: da dove arriva AES"
      intro="DES e 3DES sono cifrari a blocchi fondamentali nella storia. Studiare questi algoritmi aiuta ancora a capire perche contano la lunghezza della chiave, la struttura dei round e la migrazione verso AES."
      summary={[
        'DES cifra blocchi da 64 bit con una chiave effettiva da 56 bit, quindi oggi il brute force e realistico.',
        '3DES applica DES tre volte, migliorando la sicurezza ma restando lento e solo legacy.',
        'AES ha sostituito entrambi perche e piu veloce, piu semplice da distribuire e sicuro con chiavi moderne.',
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <button className={tabClass('des')} onClick={() => setMode('des')}>DES</button>
            <button className={tabClass('3des')} onClick={() => setMode('3des')}>3DES</button>
            <Pill tone={mode === 'des' ? 'coral' : 'amber'}>{strengthLabel}</Pill>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setDesKey(randomHexKey());
              setTripleKeys({ k1: randomHexKey(), k2: randomHexKey(), k3: randomHexKey() });
            }}
          >
            Nuove chiavi demo
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Messaggio</label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[110px] p-3 rounded-lg border border-stone-300 text-[13px] resize-none focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="space-y-3">
            {mode === 'des' ? (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Chiave DES (16 caratteri esadecimali)</label>
                <input
                  value={desKey}
                  onChange={(e) => setDesKey(sanitizeHexKey(e.target.value))}
                  className="w-full p-3 rounded-lg border border-stone-300 text-[13px] font-mono focus:outline-none focus:border-stone-900"
                  placeholder="133457799BBCDFF1"
                />
              </div>
            ) : (
              <div className="grid gap-3">
                {['k1', 'k2', 'k3'].map((keyId, index) => (
                  <div key={keyId}>
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">
                      Chiave {index + 1} (16 caratteri esadecimali)
                    </label>
                    <input
                      value={tripleKeys[keyId]}
                      onChange={(e) => setTripleKeys((prev) => ({ ...prev, [keyId]: sanitizeHexKey(e.target.value) }))}
                      className="w-full p-3 rounded-lg border border-stone-300 text-[13px] font-mono focus:outline-none focus:border-stone-900"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          <Pane label="Cifra" tone="blue">
            <div className="text-[13px] text-blue-900 leading-relaxed">
              {mode === 'des'
                ? 'Una chiave DES da 56 bit guida 16 round di Feistel su ciascun blocco da 64 bit.'
                : '3DES esegue DES tre volte in sequenza EDE: cifra, decifra, cifra.'}
            </div>
            <div className="mt-3 text-[12px] text-blue-800">
              L\'output e mostrato come blocchi di testo cifrato in esadecimale.
            </div>
          </Pane>

          <div className="flex items-center justify-center">
            <Arrow label="cifra" />
          </div>

          <Pane label="Testo cifrato" tone="ink">
            <MonoBlock tone="ink" className="h-[120px] overflow-auto">{currentCipher}</MonoBlock>
          </Pane>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Pane label="Decifra con la chiave corretta" tone="green">
            <MonoBlock tone="green" className="h-[82px] overflow-auto">{currentPlain || '-'}</MonoBlock>
          </Pane>
          <Pane label="Decifra con la chiave sbagliata" tone="coral">
            <MonoBlock tone="coral" className="h-[82px] overflow-auto">{wrongPlain}</MonoBlock>
          </Pane>
        </div>
      </Card>

      <Card className="p-7">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: 'DES',
              tone: 'coral',
              body: 'Chiave effettiva da 56 bit, blocchi da 64 bit, storicamente importante ma oggi attaccabile con brute force.',
            },
            {
              title: '3DES',
              tone: 'amber',
              body: 'Tre passaggi DES rafforzano il progetto, ma le prestazioni sono scarse e gli standard lo stanno abbandonando.',
            },
            {
              title: 'AES',
              tone: 'green',
              body: 'Chiavi da 128/192/256 bit, efficiente in software e hardware, ed e la scelta moderna di default per la crittografia simmetrica.',
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl border p-4 ${
              item.tone === 'coral'
                ? 'border-rose-200 bg-rose-50'
                : item.tone === 'amber'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-emerald-200 bg-emerald-50'
            }`}>
              <div className="text-[11px] uppercase tracking-wider mb-2">
                {item.title}
              </div>
              <div className="text-[13px] leading-relaxed text-stone-800">{item.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { LegacyBlockSection });
