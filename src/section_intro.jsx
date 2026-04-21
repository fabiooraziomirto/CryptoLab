// Section 1 — Alice, Bob, Trudy
const IntroSection = () => {
  const [msg, setMsg] = useState("Meet me at the library at 7pm.");
  const [encrypted, setEncrypted] = useState(false);
  const [intercepting, setIntercepting] = useState(true);
  const [flyKey, setFlyKey] = useState(0);

  useEffect(() => { setFlyKey((k) => k + 1); }, [msg, encrypted, intercepting]);

  const ciphertext = useMemo(() => {
    if (!encrypted) return msg;
    return btoa(unescape(encodeURIComponent(msg))).replace(/=/g, '');
  }, [msg, encrypted]);

  const trudyView = encrypted
    ? (ciphertext ? '🔒 ' + ciphertext.slice(0, 28) + (ciphertext.length > 28 ? '…' : '') : '—')
    : msg;

  return (
    <SectionShell
      eyebrow="01 · Introduction"
      title="Alice wants to message Bob. Trudy is listening."
      intro="Before cryptography, every message travels like a postcard — anyone on the path can read it. Toggle encryption on and watch what changes for Trudy."
      summary={[
        "Without encryption, a message is readable by anyone who intercepts it.",
        "Encryption turns readable plaintext into scrambled ciphertext.",
        "Even if Trudy captures encrypted traffic, she can’t read the message without the key.",
      ]}
    >
      <Card className="p-7">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Pill tone={encrypted ? 'green' : 'coral'}>
              <span className={`w-1.5 h-1.5 rounded-full ${encrypted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {encrypted ? 'Encrypted channel' : 'Plain channel'}
            </Pill>
            <Pill tone={intercepting ? 'amber' : 'neutral'}>
              Trudy: {intercepting ? 'intercepting' : 'idle'}
            </Pill>
          </div>
          <div className="flex items-center gap-2">
            <Toggle label="Encryption" value={encrypted} onChange={setEncrypted} />
            <Toggle label="Trudy listens" value={intercepting} onChange={setIntercepting} />
          </div>
        </div>

        {/* Wire diagram */}
        <div className="relative h-[220px] mt-4">
          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-[2px] bg-stone-300" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2"><Avatar who="alice" /></div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2"><Avatar who="bob" /></div>

          {intercepting && (
            <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
              <Avatar who="trudy" />
              <div className="mt-1 text-[10px] font-mono text-rose-600">↓ eavesdrop</div>
            </div>
          )}

          {/* Flying packet */}
          <div
            key={flyKey}
            className="absolute top-1/2 -translate-y-1/2 cl-fly"
            style={{ left: 80 }}
          >
            <div
              className={`px-3 py-1.5 rounded-md font-mono text-[12px] whitespace-nowrap border ${
                encrypted
                  ? 'bg-stone-900 text-amber-200 border-stone-900'
                  : 'bg-white text-stone-900 border-stone-300'
              }`}
              style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {encrypted ? '🔒 ' + ciphertext.slice(0, 22) + (ciphertext.length > 22 ? '…' : '') : msg.slice(0, 34)}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes cl-fly {
            0%   { transform: translate(0, -50%); opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translate(calc(100vw - 260px - 180px), -50%); opacity: 0; }
          }
          .cl-fly { animation: cl-fly 3.2s linear infinite; }
          @media (min-width: 900px) { .cl-fly { animation-duration: 3.6s; } }
        `}</style>

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Alice types</label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full h-[88px] p-3 rounded-lg border border-stone-300 text-[14px] resize-none focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">
              What Trudy sees {intercepting ? '' : '(she’s not looking)'}
            </label>
            <MonoBlock tone={encrypted ? 'ink' : 'coral'} className="h-[88px] overflow-auto">
              {intercepting ? trudyView : <span className="text-stone-400">—</span>}
            </MonoBlock>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3 text-[13px]">
          <Fact
            label="Confidentiality"
            text="Only Bob should read Alice’s message."
          />
          <Fact
            label="Integrity"
            text="The message shouldn’t change on the way."
          />
          <Fact
            label="Authentication"
            text="Bob should know it’s really from Alice."
          />
        </div>
      </Card>
    </SectionShell>
  );
};

const Toggle = ({ label, value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
      value
        ? 'bg-stone-900 text-white border-stone-900'
        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
    }`}
  >
    <span className={`w-7 h-4 rounded-full relative transition ${value ? 'bg-emerald-400' : 'bg-stone-300'}`}>
      <span
        className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
        style={{ left: value ? 14 : 2 }}
      />
    </span>
    {label}
  </button>
);

const Fact = ({ label, text }) => (
  <div className="rounded-xl border border-stone-200 p-3">
    <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">{label}</div>
    <div className="text-stone-800">{text}</div>
  </div>
);

Object.assign(window, { IntroSection, Toggle, Fact });
