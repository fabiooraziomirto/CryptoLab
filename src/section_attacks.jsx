// Section 2 -- Types of attack
const ATTACKS = [
  {
    id: 'tampering',
    label: 'Manomissione',
    tone: 'amber',
    icon: '\u270F\uFE0F',
    target: 'Integrita',
    tagline: 'Il messaggio viene modificato durante il tragitto.',
    desc: 'Trudy intercetta il messaggio e ne cambia il contenuto prima di inoltrarlo a Bob. Bob pensa che arrivi da Alice senza modifiche.',
    example: { before: 'Trasferisci 100\u20AC all\'IBAN IT60...1234', after: 'Trasferisci 100\u20AC all\'IBAN IT60...9999' },
    fix: 'Le firme digitali o un MAC (Message Authentication Code) permettono a Bob di rilevare qualsiasi modifica.',
  },
  {
    id: 'masquerade',
    label: 'Mascheramento',
    tone: 'coral',
    icon: '\uD83C\uDFAD',
    target: 'Autenticazione',
    tagline: 'Trudy finge di essere Alice.',
    desc: "Trudy invia un messaggio a Bob facendo credere che provenga da Alice. Senza autenticazione, Bob non puo distinguere i due casi.",
    example: { before: 'Da: alice@hospital.it\nCaro Bob, cancella il fascicolo del paziente.', after: 'Da: trudy@evil.net\n(finto alice@hospital.it)\nCaro Bob, cancella il fascicolo del paziente.' },
    fix: 'Le firme digitali dimostrano l\'identita del mittente usando la sua chiave privata.',
  },
  {
    id: 'dos',
    label: 'Denial of Service',
    tone: 'rose',
    icon: '\uD83D\uDCA3',
    target: 'Disponibilita',
    tagline: 'Trudy inonda il canale in modo che nessun altro possa usarlo.',
    desc: 'Trudy invia un numero enorme di richieste false al server di Bob, consumando tutte le sue risorse e impedendo agli utenti legittimi di ricevere risposta.',
    example: { before: 'Server: 3 req/s \u2192 risponde normalmente', after: 'Server: 50 000 req/s \u2192 sovraccarico, irraggiungibile' },
    fix: 'Rate limiting, CAPTCHA, firewall e infrastrutture distribuite aiutano a mitigare i DoS.',
  },
  {
    id: 'replay',
    label: 'Replay',
    tone: 'purple',
    icon: '\u23EE\uFE0F',
    target: 'Freshness',
    tagline: 'Un vecchio messaggio valido viene inviato di nuovo piu tardi.',
    desc: "Trudy registra un messaggio cifrato legittimo di Alice (per esempio 'Approva pagamento') e lo rinvia in un secondo momento, inducendo Bob a credere che Alice abbia fatto una nuova richiesta.",
    example: { before: 'Alice alle 10:00: \uD83D\uDD12 [Approva pagamento #42]', after: 'Trudy alle 15:30 lo rinvia: \uD83D\uDD12 [Approva pagamento #42]' },
    fix: 'Timestamp e nonce (numeri casuali monouso) rendono ogni messaggio unico; un replay viene rilevato subito.',
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
              attacca {attack.target}
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
          {launched ? 'Reimposta' : 'Avvia \u25B6'}
        </button>
      </div>

      {launched && (
        <div className="mt-3 space-y-3 text-[13px]">
          <p className="text-stone-700 leading-relaxed">{attack.desc}</p>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1.5">Normale</div>
              <pre className="font-mono text-[11.5px] text-emerald-900 whitespace-pre-wrap">{attack.example.before}</pre>
            </div>
            <div className={`rounded-xl border p-3 ${cfg.card}`}>
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{color: 'inherit', opacity: 0.7}}>Dopo l'attacco</div>
              <pre className="font-mono text-[11.5px] whitespace-pre-wrap">{attack.example.after}</pre>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="text-emerald-600 text-[16px] shrink-0">\u2705</span>
            <span className="text-[12.5px] text-emerald-900 leading-relaxed"><span className="font-semibold">Contromisura:</span> {attack.fix}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AttacksSection = () => (
  <SectionShell
    eyebrow="02 \u00B7 Minacce"
    title="Cosa puo fare davvero Trudy?"
    intro="Limitarsi a 'intercettare' un messaggio e solo l'inizio. Gli attaccanti di rete hanno quattro armi principali. Capirle chiarisce perche serve ciascuno strumento crittografico."
    summary={[
      "La manomissione colpisce l'integrita: il messaggio arriva modificato. Si contrasta con le firme digitali.",
      "Il mascheramento colpisce l'autenticazione: il mittente e falso. Si contrasta con certificati e firme.",
      "Il Denial of Service colpisce la disponibilita: il servizio diventa irraggiungibile. Si mitiga con l'infrastruttura.",
      "Il replay colpisce la freshness: un vecchio messaggio valido viene riutilizzato. Si blocca con timestamp e nonce.",
    ]}
  >
    <div className="space-y-4">
      {ATTACKS.map((a) => <AttackCard key={a.id} attack={a} />)}
    </div>

    <Card className="p-5 mt-2 bg-stone-900 border-stone-900">
      <div className="text-[11px] uppercase tracking-wider text-stone-400 mb-3">Triade CIA</div>
      <div className="grid md:grid-cols-3 gap-4 text-[13px]">
        {[
          { label: 'Confidenzialita', icon: '\uD83D\uDD12', desc: 'Solo i destinatari previsti possono leggere i dati.', color: 'text-blue-300' },
          { label: 'Integrita',       icon: '\u2705',        desc: 'I dati non vengono alterati senza essere rilevati.', color: 'text-emerald-300' },
          { label: 'Disponibilita',   icon: '\u26A1',        desc: 'I servizi restano accessibili agli utenti legittimi.', color: 'text-amber-300' },
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
