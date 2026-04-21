// Section 4 - Alberti disk (polyalphabetic idea)
const AlbertiSection = () => {
  const [msg, setMsg] = useState("MEET BOB AT NOON");
  const [seed, setSeed] = useState(7);

  const words = useMemo(
    () => msg.toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean),
    [msg]
  );

  const shifts = useMemo(() => {
    const out = [];
    let s = seed;
    for (let i = 0; i < words.length; i++) {
      s = (s * 17 + 11) % 26;
      out.push((s + i) % 26);
    }
    return out;
  }, [seed, words.length]);

  const encryptedWords = useMemo(
    () => words.map((w, i) => caesarShift(w, shifts[i] || 0)),
    [words, shifts]
  );

  const cipher = encryptedWords.join(' ');

  return (
    <SectionShell
      eyebrow="04 - Cifrari classici"
      title="Disco di Alberti: ruota l'alfabeto durante il messaggio"
      intro="L'idea di Alberti precede la crittografia moderna: non mantenere una sostituzione fissa. Passa a un alfabeto diverso mentre scrivi, cosi l'analisi delle frequenze diventa piu difficile."
      summary={[
        "Cesare usa un solo spostamento fisso per tutto il messaggio.",
        "La cifratura in stile Alberti cambia spostamento durante il messaggio.",
        "Cambiare alfabeto nel tempo e l'idea chiave dei cifrari polialfabetici.",
      ]}
    >
      <Card className="p-7">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Messaggio</label>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 text-[15px] font-mono focus:outline-none focus:border-stone-900"
            />
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-wider text-stone-500">Posizione iniziale del disco (seed)</label>
                <span className="font-mono text-[13px] text-stone-900">{seed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value, 10))}
                className="w-full accent-stone-900"
              />
            </div>
          </div>

          <div className="rounded-xl bg-stone-900 text-amber-200 font-mono p-5 min-w-[240px]">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Testo cifrato</div>
            <div className="text-[16px] break-words">{cipher || '-'}</div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-[12px] border border-stone-200 rounded-lg overflow-hidden">
            <thead className="bg-stone-100 text-stone-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left px-3 py-2">Parola #</th>
                <th className="text-left px-3 py-2">Chiaro</th>
                <th className="text-left px-3 py-2">Shift</th>
                <th className="text-left px-3 py-2">Cifrato</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-stone-500">Scrivi un messaggio con lettere.</td>
                </tr>
              )}
              {words.map((w, i) => (
                <tr key={i} className="border-t border-stone-200">
                  <td className="px-3 py-2 font-mono text-stone-500">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-stone-900">{w}</td>
                  <td className="px-3 py-2 font-mono text-blue-700">k = {shifts[i]}</td>
                  <td className="px-3 py-2 font-mono text-stone-900">{encryptedWords[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-[12.5px] text-blue-900">
          <span className="font-semibold">Collegamento con Vigenere:</span> se la sequenza degli shift e guidata da una parola chiave,
          ottieni un classico cifrario polialfabetico. Alberti ha introdotto per primo l'idea fondamentale: cambiare alfabeto mentre si scrive.
        </div>
      </Card>
    </SectionShell>
  );
};

Object.assign(window, { AlbertiSection });
