// Sezione — Encoding, Hashing e Crittografia
const ConceptsSection = () => {
  const [inputText, setInputText] = useState('Segreto123!');
  const [activeTab, setActiveTab] = useState('encoding');

  // Esempi live
  const b64 = useMemo(() => {
    try { return btoa(inputText); } catch { return 'Errore di codifica'; }
  }, [inputText]);
  
  const hash = useMemo(() => tinyHash(inputText), [inputText]);
  
  const encrypted = useMemo(() => xorCipher(inputText, 'CHIAVE'), [inputText]);

  const tabCls = (t) =>
    `px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`;

  return (
    <SectionShell
      eyebrow="Fondamenti"
      title="Le 3 parole più confuse in sicurezza"
      intro="Encoding, Hashing e Crittografia (Encryption) vengono spesso confuse tra loro, ma hanno scopi completamente diversi. Capire la differenza è il primo passo per non commettere errori di sicurezza basilari."
      summary={[
        "L'Encoding serve a far leggere i dati alle macchine. NON NASCONDE I DATI. Non usare mai Base64 per le password!",
        "L'Hashing serve a verificare l'integrità dei dati o per salvare password in sicurezza. È irreversibile.",
        "La Crittografia serve a mantenere i dati confidenziali. Richiede una chiave ed è reversibile.",
      ]}
    >
      <div className="flex gap-2 flex-wrap mb-6">
        <button className={tabCls('encoding')} onClick={() => setActiveTab('encoding')}>🔄 Codifica (Encoding)</button>
        <button className={tabCls('hashing')}  onClick={() => setActiveTab('hashing')}>🔗 Hashing</button>
        <button className={tabCls('crypto')}   onClick={() => setActiveTab('crypto')}>🔒 Crittografia</button>
      </div>

      <Card className="p-5 mb-6 bg-stone-50 border-stone-200">
        <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 block">Testo di prova</label>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full max-w-md p-2 rounded-lg border border-stone-300 text-[14px] font-mono focus:outline-none focus:border-stone-900 bg-white"
          placeholder="Scrivi qualcosa..."
        />
      </Card>

      {activeTab === 'encoding' && (
        <div className="space-y-4">
          <Card className="p-6 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-4">
              <span className="text-[32px] flex-shrink-0">🔄</span>
              <div>
                <h3 className="text-[16px] font-bold text-blue-900 mb-2">Codifica (Encoding)</h3>
                <p className="text-[13px] text-blue-800 leading-relaxed mb-4">
                  <strong>Scopo:</strong> Trasformare i dati in un formato compatibile per un altro sistema (es. trasformare un'immagine in testo per mandarla via email).<br/>
                  <strong>Sicurezza:</strong> NESSUNA. Chiunque conosca il formato può riconvertirlo (decodifica). Non ci sono chiavi o segreti.
                </p>
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <div className="text-[11px] uppercase tracking-wider text-blue-500 mb-1">Esempio Base64</div>
                  <div className="font-mono text-[14px] text-blue-900 break-all">{b64}</div>
                  <div className="mt-2 text-[11px] text-rose-600 font-medium">⚠️ Errore tipico: "Ho protetto la password mettendola in Base64". (Sbagliatissimo!)</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'hashing' && (
        <div className="space-y-4">
          <Card className="p-6 border-indigo-200 bg-indigo-50">
            <div className="flex items-start gap-4">
              <span className="text-[32px] flex-shrink-0">🔗</span>
              <div>
                <h3 className="text-[16px] font-bold text-indigo-900 mb-2">Hashing</h3>
                <p className="text-[13px] text-indigo-800 leading-relaxed mb-4">
                  <strong>Scopo:</strong> Creare un'"impronta digitale" univoca e di lunghezza fissa per un file o un testo.<br/>
                  <strong>Sicurezza:</strong> È un processo <em>a senso unico</em> (irreversibile). Dall'hash non puoi risalire al testo originale. Se cambi anche un solo carattere, l'hash cambia completamente.
                </p>
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <div className="text-[11px] uppercase tracking-wider text-indigo-500 mb-1">Esempio Hash (dimostrativo)</div>
                  <div className="font-mono text-[14px] text-indigo-900 break-all">{hash}</div>
                  <div className="mt-2 text-[11px] text-emerald-600 font-medium">✅ Uso corretto: Verificare se un file è stato scaricato correttamente o salvare le password nel database.</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'crypto' && (
        <div className="space-y-4">
          <Card className="p-6 border-emerald-200 bg-emerald-50">
            <div className="flex items-start gap-4">
              <span className="text-[32px] flex-shrink-0">🔒</span>
              <div>
                <h3 className="text-[16px] font-bold text-emerald-900 mb-2">Crittografia (Encryption)</h3>
                <p className="text-[13px] text-emerald-800 leading-relaxed mb-4">
                  <strong>Scopo:</strong> Mantenere i dati segreti a chi non è autorizzato a leggerli (confidenzialità).<br/>
                  <strong>Sicurezza:</strong> Trasforma i dati usando una <strong>chiave</strong> matematica. È un processo reversibile (decifratura), ma <em>solo</em> se possiedi la chiave corretta.
                </p>
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-500">Esempio Cifratura (simmetrica)</span>
                    <span className="text-[11px] text-emerald-600 font-mono">Chiave: "CHIAVE"</span>
                  </div>
                  <div className="font-mono text-[14px] text-emerald-900 break-all">{encrypted}</div>
                  <div className="mt-2 text-[11px] text-emerald-600 font-medium">✅ Uso corretto: Proteggere messaggi WhatsApp, HTTPS, file privati.</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </SectionShell>
  );
};

Object.assign(window, { ConceptsSection });
