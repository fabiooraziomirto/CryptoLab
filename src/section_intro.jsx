// Section 1 -- Alice, Bob, Trudy
const SPEED_DURATION = { slow: 7, normal: 3.5, fast: 1.4 };

const IntroSection = () => {
  const [msg, setMsg] = useState("Meet me at the library at 7pm.");
  const [encrypted, setEncrypted] = useState(false);
  const [intercepting, setIntercepting] = useState(true);
  const [speed, setSpeed] = useState('normal');
  const [packetCount, setPacketCount] = useState(1);
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => { setRestartKey((k) => k + 1); }, [msg, encrypted, intercepting, speed, packetCount]);

  const dur = SPEED_DURATION[speed];

  const ciphertext = useMemo(() => {
    if (!encrypted) return msg;
    return btoa(unescape(encodeURIComponent(msg))).replace(/=/g, '');
  }, [msg, encrypted]);

  const packetLabel = encrypted
    ? '\uD83D\uDD12 ' + ciphertext.slice(0, 22) + (ciphertext.length > 22 ? '\u2026' : '')
    : msg.slice(0, 34);

  const trudyView = encrypted
    ? (ciphertext ? '\uD83D\uDD12 ' + ciphertext.slice(0, 28) + (ciphertext.length > 28 ? '\u2026' : '') : '\u2014')
    : msg;

  const packetClass = `px-3 py-1.5 rounded-md font-mono text-[12px] whitespace-nowrap border shadow-sm ${
    encrypted
      ? 'bg-stone-900 text-amber-200 border-stone-700'
      : 'bg-white text-stone-900 border-stone-300'
  }`;

  return (
    <SectionShell
      eyebrow="01 \u00B7 Introduction"
      title="Alice wants to message Bob. Trudy is listening."
      intro="Before cryptography, every message travels like a postcard \u2014 anyone on the path can read it. Toggle encryption on and watch what changes for Trudy."
      summary={[
        "Without encryption, a message is readable by anyone who intercepts it.",
        "Encryption turns readable plaintext into scrambled ciphertext.",
        "Even if Trudy captures encrypted traffic, she can't read the message without the key.",
      ]}
    >
      <Card className="p-7">
        {/* Status pills + toggles */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Pill tone={encrypted ? 'green' : 'coral'}>
              <span className={`w-1.5 h-1.5 rounded-full ${encrypted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {encrypted ? 'Encrypted channel' : 'Plain channel'}
            </Pill>
            <Pill tone={intercepting ? 'amber' : 'neutral'}>
              Trudy: {intercepting ? 'intercepting' : 'idle'}
            </Pill>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Toggle label="Encryption" value={encrypted} onChange={setEncrypted} />
            <Toggle label="Trudy listens" value={intercepting} onChange={setIntercepting} />
          </div>
        </div>

        {/* Speed + packet count + play/pause controls */}
        <div className="flex flex-wrap items-center gap-6 mb-5 p-3 bg-stone-50 rounded-xl border border-stone-200">
          {/* Play / Pause */}
          <button
            onClick={() => setPaused((p) => !p)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
              paused
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
            }`}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <polygon points="2,1 11,6 2,11" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="4" height="10" rx="1"/>
                <rect x="7" y="1" width="4" height="10" rx="1"/>
              </svg>
            )}
            {paused ? 'Play' : 'Pause'}
          </button>

          <div className="w-px h-5 bg-stone-300 hidden md:block" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 shrink-0">Speed</span>
            {['slow', 'normal', 'fast'].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-colors ${
                  speed === s
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-stone-300 hidden md:block" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 shrink-0">Packets in pipe</span>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPacketCount(n)}
                className={`w-8 h-8 rounded-lg text-[12px] font-medium border transition-colors ${
                  packetCount === n
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Wire diagram */}
        <div className="relative h-[220px]">
          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-[2px] bg-stone-300" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2"><Avatar who="alice" /></div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2"><Avatar who="bob" /></div>

          {intercepting && (
            <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
              <Avatar who="trudy" />
              <div className="mt-1 text-[10px] font-mono text-rose-600">\u2193 eavesdrop</div>
            </div>
          )}

          {/* PAUSED: show packets stacked at Bob */}
          {paused && Array.from({ length: packetCount }, (_, i) => (
            <div
              key={`paused-${i}`}
              className="absolute top-1/2 -translate-y-1/2 transition-all"
              style={{ right: 84 + i * 6, marginTop: i * -3 }}
            >
              <div className={packetClass} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {packetLabel}
              </div>
            </div>
          ))}

          {/* PLAYING: flying packets evenly staggered */}
          {!paused && Array.from({ length: packetCount }, (_, i) => (
            <div
              key={`${restartKey}-${i}`}
              className="absolute top-1/2 cl-fly-packet"
              style={{
                left: 80,
                animationDuration: `${dur}s`,
                animationDelay: `-${(i / packetCount) * dur}s`,
              }}
            >
              <div className={packetClass} style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {packetLabel}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes cl-fly-packet {
            0%   { transform: translate(0, -50%);                           opacity: 0; }
            8%   { opacity: 1; }
            88%  { opacity: 1; }
            100% { transform: translate(calc(100vw - 300px - 160px), -50%); opacity: 0; }
          }
          .cl-fly-packet { animation: cl-fly-packet linear infinite; }
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
              What Trudy sees {intercepting ? '' : "(she's not looking)"}
            </label>
            <MonoBlock tone={encrypted ? 'ink' : 'coral'} className="h-[88px] overflow-auto">
              {intercepting ? trudyView : <span className="text-stone-400">\u2014</span>}
            </MonoBlock>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3 text-[13px]">
          <Fact label="Confidentiality" text="Only Bob should read Alice's message." />
          <Fact label="Integrity"       text="The message shouldn't change on the way." />
          <Fact label="Authentication"  text="Bob should know it's really from Alice." />
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
