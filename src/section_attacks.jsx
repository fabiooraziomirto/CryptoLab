// Section 2 -- Types of attack
const ATTACKS = [
  {
    id: 'tampering',
    label: 'Tampering',
    tone: 'amber',
    icon: '\u270F\uFE0F',
    target: 'Integrity',
    tagline: 'The message is modified in transit.',
    desc: 'Trudy intercepts the message and changes its content before forwarding it to Bob. Bob thinks it came from Alice unchanged.',
    example: { before: 'Transfer 100\u20AC to IBAN IT60...1234', after: 'Transfer 100\u20AC to IBAN IT60...9999' },
    fix: 'Digital signatures or a MAC (Message Authentication Code) let Bob detect any modification.',
  },
  {
    id: 'masquerade',
    label: 'Masquerade',
    tone: 'coral',
    icon: '\uD83C\uDFAD',
    target: 'Authentication',
    tagline: 'Trudy pretends to be Alice.',
    desc: "Trudy sends a message to Bob claiming it's from Alice. Without authentication, Bob can't tell the difference.",
    example: { before: 'From: alice@hospital.it\nDear Bob, cancel the patient file.', after: 'From: trudy@evil.net\n(spoofed as alice@hospital.it)\nDear Bob, cancel the patient file.' },
    fix: 'Digital signatures prove the identity of the sender using their private key.',
  },
  {
    id: 'dos',
    label: 'Denial of Service',
    tone: 'rose',
    icon: '\uD83D\uDCA3',
    target: 'Availability',
    tagline: 'Trudy floods the channel so nobody else can use it.',
    desc: 'Trudy sends an enormous number of fake requests to Bob\'s server, consuming all its resources so legitimate users get no response.',
    example: { before: 'Server: 3 req/s \u2192 responds normally', after: 'Server: 50 000 req/s \u2192 overloaded, unreachable' },
    fix: 'Rate limiting, CAPTCHAs, firewalls and distributed infrastructure help mitigate DoS.',
  },
  {
    id: 'replay',
    label: 'Replay',
    tone: 'purple',
    icon: '\u23EE\uFE0F',
    target: 'Freshness',
    tagline: 'A valid old message is re-sent later.',
    desc: "Trudy records a legitimate encrypted message from Alice (e.g. 'Approve payment') and sends it again later, tricking Bob into thinking Alice made a new request.",
    example: { before: 'Alice at 10:00: \uD83D\uDD12 [Approve payment #42]', after: 'Trudy at 15:30 re-sends: \uD83D\uDD12 [Approve payment #42]' },
    fix: 'Timestamps and nonces (random one-time numbers) make each message unique; a replay is immediately detected.',
  },
];

const toneConfig = {
  amber:  { pill: 'bg-amber-50 text-amber-800 border-amber-200',  card: 'border-amber-300 bg-amber-50',  badge: 'bg-amber-100 text-amber-800' },
  coral:  { pill: 'bg-rose-50 text-rose-700 border-rose-200',     card: 'border-rose-300 bg-rose-50',    badge: 'bg-rose-100 text-rose-700' },
  rose:   { pill: 'bg-red-50 text-red-700 border-red-200',        card: 'border-red-300 bg-red-50',      badge: 'bg-red-100 text-red-700' },
  purple: { pill: 'bg-purple-50 text-purple-700 border-purple-200', card: 'border-purple-300 bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
};

const AttackCard = ({ attack }) => {
  const [launched, setLaunched] = useState(false);
  const cfg = toneConfig[attack.tone];
  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${launched ? cfg.card : 'border-stone-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{attack.icon}</span>
            <span className="text-[15px] font-semibold text-stone-900">{attack.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.pill}`}>
              attacks {attack.target}
            </span>
          </div>
          <p className="text-[13px] text-stone-600">{attack.tagline}</p>
        </div>
        <button
          onClick={() => setLaunched((v) => !v)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
            launched
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
          }`}
        >
          {launched ? 'Reset' : 'Launch \u25B6'}
        </button>
      </div>

      {launched && (
        <div className="mt-3 space-y-3 text-[13px]">
          <p className="text-stone-700 leading-relaxed">{attack.desc}</p>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1.5">Normal</div>
              <pre className="font-mono text-[11.5px] text-emerald-900 whitespace-pre-wrap">{attack.example.before}</pre>
            </div>
            <div className={`rounded-xl border p-3 ${cfg.card}`}>
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{color: 'inherit', opacity: 0.7}}>After attack</div>
              <pre className="font-mono text-[11.5px] whitespace-pre-wrap">{attack.example.after}</pre>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="text-emerald-600 text-[16px] shrink-0">\u2705</span>
            <span className="text-[12.5px] text-emerald-900 leading-relaxed"><span className="font-semibold">Countermeasure:</span> {attack.fix}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AttacksSection = () => (
  <SectionShell
    eyebrow="02 \u00B7 Threats"
    title="What can Trudy actually do?"
    intro="Just 'intercepting' a message is only the beginning. Network attackers have four main weapons. Understanding them clarifies why we need each cryptographic tool."
    summary={[
      "Tampering attacks integrity: the message arrives modified. Fixed by digital signatures.",
      "Masquerade attacks authentication: the sender is fake. Fixed by certificates and signatures.",
      "Denial of Service attacks availability: the service becomes unreachable. Mitigated by infrastructure.",
      "Replay attacks freshness: a valid old message is re-used. Fixed by timestamps and nonces.",
    ]}
  >
    <div className="space-y-4">
      {ATTACKS.map((a) => <AttackCard key={a.id} attack={a} />)}
    </div>

    <Card className="p-5 mt-2 bg-stone-900 border-stone-900">
      <div className="text-[11px] uppercase tracking-wider text-stone-400 mb-3">The CIA Triad</div>
      <div className="grid md:grid-cols-3 gap-4 text-[13px]">
        {[
          { label: 'Confidentiality', icon: '\uD83D\uDD12', desc: 'Only intended recipients can read the data.', color: 'text-blue-300' },
          { label: 'Integrity',       icon: '\u2705',        desc: 'Data is not altered without detection.',        color: 'text-emerald-300' },
          { label: 'Availability',    icon: '\u26A1',        desc: 'Services remain accessible to legitimate users.', color: 'text-amber-300' },
        ].map((c) => (
          <div key={c.label}>
            <div className={`text-xl mb-1`}>{c.icon}</div>
            <div className={`font-semibold mb-1 ${c.color}`}>{c.label}</div>
            <div className="text-stone-400 leading-relaxed">{c.desc}</div>
          </div>
        ))}
      </div>
    </Card>
  </SectionShell>
);

Object.assign(window, { AttacksSection });
