export type QuestionType = 'multiple-choice' | 'drag-drop' | 'calculation';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string; // Optional hint for when user struggles
  xp: number;
}

export interface LessonSection {
  title: string;
  content: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  sections: LessonSection[];
  questions: Question[];
  requiredLevel: number;
}

export const lessons: Record<number, Lesson> = {
  1: {
    id: 1,
    title: 'Introduzione a Bitcoin',
    description: 'Scopri cos\'è Bitcoin, come funziona la blockchain e perché è una rivoluzione finanziaria',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    requiredLevel: 1,
    sections: [
      {
        title: 'Cos\'è Bitcoin?',
        content: 'Bitcoin è la prima criptovaluta decentralizzata al mondo, creata nel 2009 da Satoshi Nakamoto. Non è controllata da nessuna banca o governo, ma da una rete distribuita di computer in tutto il mondo. Bitcoin permette di inviare valore digitale direttamente da persona a persona, senza intermediari.'
      },
      {
        title: 'La Blockchain',
        content: 'La blockchain è il registro pubblico distribuito su cui vengono registrate tutte le transazioni Bitcoin. Ogni "blocco" contiene un gruppo di transazioni, e i blocchi sono collegati tra loro in una "catena". Questa struttura rende estremamente difficile alterare le transazioni passate, garantendo sicurezza e trasparenza.'
      },
      {
        title: 'Perché Bitcoin ha Valore?',
        content: 'Bitcoin ha valore per tre motivi principali: 1) Scarsità - ci saranno solo 21 milioni di bitcoin, 2) Utilità - permette trasferimenti rapidi e sicuri, 3) Rete - più persone lo usano, più diventa prezioso. Come l\'oro digitale, Bitcoin è un store of value resistente alla censura.'
      },
      {
        title: 'Mining e Sicurezza',
        content: 'I miner usano potenza computazionale per validare le transazioni e aggiungere nuovi blocchi alla blockchain. In cambio ricevono bitcoin come ricompensa. Questo processo chiamato "Proof of Work" rende la rete sicura: per attaccarla servirebbe più potenza di calcolo di tutti i miner onesti messi insieme, cosa economicamente non conveniente.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Chi ha creato Bitcoin?',
        options: [
          'Elon Musk',
          'Satoshi Nakamoto',
          'Vitalik Buterin',
          'La NSA'
        ],
        correctAnswer: 1,
        explanation: 'Bitcoin è stato creato da Satoshi Nakamoto nel 2009. La sua vera identità rimane ancora sconosciuta.',
        xp: 50
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Quanti bitcoin esisteranno in totale?',
        options: [
          '10 milioni',
          '21 milioni',
          '100 milioni',
          'Infiniti'
        ],
        correctAnswer: 1,
        explanation: 'Il limite massimo di bitcoin è fissato a 21 milioni. Questa scarsità programmata è una caratteristica fondamentale di Bitcoin.',
        xp: 50
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Cos\'è la blockchain?',
        options: [
          'Un tipo di criptovaluta',
          'Un registro distribuito di transazioni',
          'Un algoritmo di mining',
          'Un wallet digitale'
        ],
        correctAnswer: 1,
        explanation: 'La blockchain è un registro pubblico e distribuito che contiene tutte le transazioni Bitcoin in ordine cronologico.',
        xp: 75
      }
    ]
  },

  2: {
    id: 2,
    title: 'Volatilità e Prezzo di Bitcoin',
    description: 'Comprendi i cicli di mercato, la volatilità e cosa muove il prezzo di Bitcoin',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    requiredLevel: 1,
    sections: [
      {
        title: 'Cosa Causa la Volatilità',
        content: 'Bitcoin è noto per la sua alta volatilità. I fattori principali includono: 1) Mercato relativamente piccolo rispetto ad asset tradizionali, 2) Notizie e sentiment del mercato, 3) Regolamentazioni governative, 4) Adozione istituzionale, 5) Eventi tecnici come halving. La volatilità è sia un rischio che un\'opportunità per i trader.'
      },
      {
        title: 'I Cicli di Mercato di Bitcoin',
        content: 'Bitcoin segue cicli di circa 4 anni legati agli "halving" (dimezzamento della ricompensa dei miner). Tipicamente dopo ogni halving segue un bull market, poi un top, un bear market, e un periodo di accumulazione. Comprendere questi cicli ti aiuta a posizionarti meglio strategicamente.'
      },
      {
        title: 'Analisi On-Chain',
        content: 'L\'analisi on-chain studia i dati direttamente dalla blockchain per capire il comportamento dei detentori di bitcoin. Metriche importanti includono: indirizzi attivi, bitcoin in movimento, supply su exchange, profitti/perdite degli investitori. Questi dati ti danno insight sul sentiment di mercato.'
      },
      {
        title: 'Correlazioni di Mercato',
        content: 'Bitcoin ha mostrato diverse correlazioni nel tempo: a volte con l\'oro (store of value), a volte con tech stocks (risk-on asset). Negli ultimi anni la correlazione con i mercati tradizionali è aumentata, specialmente con il NASDAQ. Capire queste dinamiche è fondamentale per il risk management.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Ogni quanti anni circa avviene l\'halving di Bitcoin?',
        options: [
          '2 anni',
          '4 anni',
          '6 anni',
          '10 anni'
        ],
        correctAnswer: 1,
        explanation: 'L\'halving di Bitcoin avviene circa ogni 4 anni, o più precisamente ogni 210,000 blocchi minati.',
        xp: 50
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Quale fattore NON influenza tipicamente la volatilità di Bitcoin?',
        options: [
          'Annunci di regolamentazione governativa',
          'Adozione da parte di aziende',
          'Il prezzo del petrolio',
          'Sentiment sui social media'
        ],
        correctAnswer: 2,
        explanation: 'Il prezzo del petrolio ha una correlazione molto bassa con Bitcoin. Gli altri fattori invece influenzano significativamente la volatilità.',
        xp: 75
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Cosa indica un alto numero di bitcoin che si spostano dagli exchange ai wallet personali?',
        options: [
          'Gli investitori vogliono vendere',
          'Gli investitori stanno accumulando per il lungo termine',
          'Il prezzo sta per crollare',
          'Non ha alcun significato'
        ],
        correctAnswer: 1,
        explanation: 'Quando i bitcoin lasciano gli exchange significa che gli investitori li stanno mettendo in cold storage, segnale di accumulo e holding a lungo termine.',
        xp: 100
      }
    ]
  },

  3: {
    id: 3,
    title: 'Cosa Sono le Opzioni',
    description: 'Introduzione al mondo delle opzioni: put, call, strike, scadenza e premium',
    difficulty: 'beginner',
    estimatedTime: '25 min',
    requiredLevel: 2,
    sections: [
      {
        title: 'Opzioni: Il Concetto Base',
        content: 'Un\'opzione è un contratto che ti dà il DIRITTO (ma non l\'obbligo) di comprare o vendere un asset a un prezzo prestabilito entro una certa data. È come un "coupon" che ti permette di bloccare un prezzo futuro. Le opzioni Bitcoin funzionano esattamente come quelle su azioni, ma con BTC come sottostante.'
      },
      {
        title: 'Call vs Put',
        content: 'Ci sono due tipi di opzioni: CALL (diritto di COMPRARE) e PUT (diritto di VENDERE). Esempio: una call a $50k ti permette di comprare BTC a $50k anche se il prezzo sale a $80k. Una put a $40k ti permette di vendere BTC a $40k anche se il prezzo scende a $30k.'
      },
      {
        title: 'Componenti di un\'Opzione',
        content: 'Ogni opzione ha 4 elementi chiave: 1) STRIKE PRICE - il prezzo di esercizio, 2) SCADENZA - quando il contratto termina, 3) PREMIUM - il prezzo che paghi per l\'opzione, 4) SOTTOSTANTE - l\'asset (nel nostro caso BTC). Questi elementi determinano il valore e il rischio dell\'opzione.'
      },
      {
        title: 'Comprare vs Vendere Opzioni',
        content: 'Puoi essere BUYER (compratore) o SELLER (venditore) di opzioni. Il buyer paga un premium e ha diritti limitati al premium pagato. Il seller riceve il premium ma assume obblighi potenzialmente illimitati. Nella Wheel Strategy, vendiamo opzioni per raccogliere premium regolarmente.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Una CALL option ti dà il diritto di:',
        options: [
          'Vendere l\'asset',
          'Comprare l\'asset',
          'Tenere l\'asset',
          'Scambiare l\'asset'
        ],
        correctAnswer: 1,
        explanation: 'Una CALL option ti dà il diritto (non l\'obbligo) di COMPRARE l\'asset sottostante al prezzo strike.',
        xp: 50
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Se vendi un\'opzione, cosa ricevi?',
        options: [
          'Il diritto di comprare',
          'Il diritto di vendere',
          'Il premium',
          'Niente'
        ],
        correctAnswer: 2,
        explanation: 'Quando vendi un\'opzione, ricevi immediatamente il premium, ma assumi l\'obbligo di onorare il contratto se richiesto.',
        xp: 75
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quale elemento NON è parte di un contratto di opzione?',
        options: [
          'Strike price',
          'Data di scadenza',
          'Dividend yield',
          'Premium'
        ],
        correctAnswer: 2,
        explanation: 'Il dividend yield non è rilevante per le opzioni Bitcoin. Strike, scadenza e premium sono i componenti essenziali.',
        xp: 75
      }
    ]
  },

  4: {
    id: 4,
    title: 'Cash-Secured Put',
    description: 'Impara la prima gamba della Wheel Strategy: vendere put per generare income',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    requiredLevel: 3,
    sections: [
      {
        title: 'Cos\'è una Cash-Secured Put',
        content: 'Una Cash-Secured Put (CSP) è quando VENDI una put option avendo il cash necessario per comprare BTC se assegnato. Esempio: vendi una put strike $40k, tieni $40k in cash. Se BTC scende sotto $40k, compri BTC a quel prezzo. Se resta sopra, tieni il premium. È un modo per "farsi pagare per aspettare" un prezzo di entrata.'
      },
      {
        title: 'Calcolo del Premium e Rendimento',
        content: 'Il premium che ricevi dipende da: 1) Volatilità implicita (IV) - più alta, più premium, 2) Distanza dello strike dal prezzo attuale - più lontano, meno premium, 3) Tempo a scadenza - più tempo, più premium. Un buon target è 1-3% del capitale investito al mese (12-36% annualizzato).'
      },
      {
        title: 'Selezione dello Strike',
        content: 'Scegli uno strike a cui saresti FELICE di comprare BTC. Considera: 1) Livelli di supporto tecnico, 2) Prezzo medio di mercato, 3) Il tuo punto di vista sul prezzo. Strike "Out of the Money" (sotto il prezzo attuale) sono più sicuri ma danno meno premium. Strike "At the Money" danno più premium ma più probabilità di assegnazione.'
      },
      {
        title: 'Gestione del Rischio',
        content: 'I rischi principali sono: 1) BTC crolla molto sotto il tuo strike (ma se volevi comprarlo, va bene), 2) BTC sale molto e perdi l\'opportunità (ma hai il premium). Per mitigare: vendi put solo a strike che ti vanno bene, non investire tutto in una scadenza, considera strike più conservativi in mercati incerti.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Quando vendi una Cash-Secured Put, il tuo profitto massimo è:',
        options: [
          'Illimitato',
          'Il premium ricevuto',
          'La differenza tra strike e prezzo di mercato',
          'Zero'
        ],
        correctAnswer: 1,
        explanation: 'Quando vendi una put, il massimo che puoi guadagnare è il premium ricevuto. Non puoi guadagnare più di quello, ma è tuo sin dall\'inizio.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Se vendi una put a strike $45,000 e ricevi $500 di premium, qual è il tuo breakeven?',
        options: [
          '$45,000',
          '$45,500',
          '$44,500',
          '$40,000'
        ],
        correctAnswer: 2,
        explanation: 'Il breakeven è strike - premium ricevuto = $45,000 - $500 = $44,500. A quel prezzo sei in pareggio anche se assegnato.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quale scenario è MEGLIO per vendere put con alto premium?',
        options: [
          'Bassa volatilità, mercato calmo',
          'Alta volatilità, mercato nervoso',
          'Trend fortemente rialzista',
          'Non fa differenza'
        ],
        correctAnswer: 1,
        explanation: 'Alta volatilità implicita significa premium più alti. I mercati nervosi e incerti offrono i migliori premi per i venditori di opzioni.',
        xp: 150
      }
    ]
  },

  5: {
    id: 5,
    title: 'Covered Call',
    description: 'La seconda gamba della Wheel: vendere call sul BTC che possiedi per generare income extra',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    requiredLevel: 4,
    sections: [
      {
        title: 'Cos\'è una Covered Call',
        content: 'Una Covered Call (CC) è quando VENDI una call option possedendo già il BTC sottostante. Esempio: hai 1 BTC comprato a $40k, lo vendi a call strike $50k per $800. Se BTC resta sotto $50k tieni BTC + $800. Se sale sopra $50k, vendi il tuo BTC a $50k ma tieni i $800. In entrambi i casi, generi reddito extra.'
      },
      {
        title: 'Quando Vendere Covered Call',
        content: 'Le covered call sono ideali quando: 1) Possiedi già BTC e vuoi generare income, 2) Pensi che il prezzo resterà flat o salirà moderatamente, 3) Vuoi ridurre il costo base del tuo BTC, 4) Sei disposto a vendere BTC a un prezzo target. Evita in strong uptrend dove preferiresti tenere BTC.'
      },
      {
        title: 'Scelta dello Strike per le Call',
        content: 'Strike "Out of the Money" (sopra il prezzo attuale): meno premium ma tieni BTC più facilmente. Strike "At the Money": più premium ma alta probabilità di vendere BTC. Strike "In the Money": massimo premium ma quasi certo che vendi BTC. Considera il tuo target di vendita: se venderesti BTC a $55k, vendi call a quello strike.'
      },
      {
        title: 'Gestione della Posizione',
        content: 'Se BTC sale verso il tuo strike: 1) Lascia che venga assegnato (vendi a profitto), 2) Fai roll up/out per strike più alto, 3) Chiudi la call in perdita per tenere BTC. Se BTC scende: la call scade senza valore, tieni BTC + premium, puoi vendere nuova call. Il premium riduce il tuo costo base nel tempo.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Con una Covered Call, il tuo rischio massimo è:',
        options: [
          'Il premium ricevuto',
          'La perdita sul BTC sottostante',
          'Illimitato',
          'Zero'
        ],
        correctAnswer: 1,
        explanation: 'Il rischio principale è la perdita sul BTC posseduto. Il premium ricevuto aiuta a ridurre questa perdita, ma non la elimina.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Hai comprato BTC a $40k, vendi call strike $50k per $1k. Se BTC sale a $55k e vieni assegnato, qual è il tuo profitto totale?',
        options: [
          '$10,000',
          '$11,000',
          '$15,000',
          '$5,000'
        ],
        correctAnswer: 1,
        explanation: 'Guadagno su BTC: $50k - $40k = $10k. Premium call: $1k. Totale: $11k. Non realizzi il guadagno extra da $50k a $55k perché hai venduto a $50k.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quale affermazione è VERA per le covered call?',
        options: [
          'Limitano il profitto massimo verso l\'alto',
          'Eliminano completamente il rischio',
          'Funzionano meglio in strong downtrend',
          'Richiedono margine aggiuntivo'
        ],
        correctAnswer: 0,
        explanation: 'Le covered call limitano il profitto massimo allo strike scelto, ma in cambio ricevi premium regolari che riducono il rischio verso il basso.',
        xp: 150
      }
    ]
  },

  6: {
    id: 6,
    title: 'La Wheel Strategy Completa',
    description: 'Unisci put e call in un ciclo perpetuo di generazione di income su Bitcoin',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    requiredLevel: 5,
    sections: [
      {
        title: 'Come Funziona la Wheel',
        content: 'La Wheel Strategy è un ciclo: 1) INIZIO: Vendi Cash-Secured Put per generare premium, 2) SE ASSEGNATO: Compri BTC al tuo strike, 3) CONTINUA: Vendi Covered Call sul BTC posseduto, 4) SE ASSEGNATO: Vendi BTC a profitto, 5) RIPETI: Torna a vendere put. Ad ogni step generi premium, che sia in cash o con BTC in portafoglio.'
      },
      {
        title: 'Esempio Pratico Completo',
        content: 'Capitale $50k, BTC a $50k. STEP 1: Vendi put strike $45k, ricevi $900 premium. BTC scende a $44k. STEP 2: Vieni assegnato, compri BTC a $45k. STEP 3: Vendi call strike $50k, ricevi $1k. BTC sale a $51k. STEP 4: Vieni assegnato, vendi BTC a $50k. Guadagno: $900 (put) + $1k (call) + $5k (profitto BTC) = $6,900 su $45k investiti = 15.3% in un ciclo!'
      },
      {
        title: 'Gestione del Capitale',
        content: 'Non usare MAI tutto il capitale in una posizione. Regola del 20-30%: usa solo 20-30% del capitale per ogni wheel cycle, così puoi vendere put a strike diversi o scadenze diverse. Questo ti protegge da draw down severi e ti permette di mediare il costo se BTC scende molto. Mantieni cash per opportunità.'
      },
      {
        title: 'Quando la Wheel NON Funziona',
        content: 'La Wheel soffre in: 1) Mercati fortemente direzionali - se BTC 10x, avresti guadagnato più holddando, 2) Crash improvvisi - potresti comprare BTC in caduta, 3) Bassa volatilità - premium bassi non compensano il tempo. Migliore in mercati range-bound o moderatamente volatili. Considera il contesto macro prima di entrare.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'La Wheel Strategy funziona meglio in quale tipo di mercato?',
        options: [
          'Strong uptrend con +100% in poche settimane',
          'Range-bound o moderatamente volatile',
          'Crash del -80%',
          'Volatilità zero'
        ],
        correctAnswer: 1,
        explanation: 'La Wheel è ottimale in mercati range-bound o con volatilità moderata, dove raccogli premium regolari senza movimenti estremi.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Quale percentuale del capitale è consigliabile usare per ogni wheel cycle?',
        options: [
          '100% - massimizza i rendimenti',
          '50% - equilibrato',
          '20-30% - consente diversificazione',
          '5% - troppo conservativo'
        ],
        correctAnswer: 2,
        explanation: 'Usare 20-30% per cycle ti permette di diversificare strike e scadenze, riducendo il rischio concentrato.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'In un ciclo completo della Wheel, quante volte generi premium?',
        options: [
          'Una volta (solo la put)',
          'Due volte (put + call)',
          'Tre volte (put + call + vendita BTC)',
          'Mai, guadagni solo dalla vendita di BTC'
        ],
        correctAnswer: 1,
        explanation: 'In un ciclo completo generi premium due volte: quando vendi la put iniziale e quando vendi la call sul BTC posseduto.',
        xp: 150
      }
    ]
  },

  7: {
    id: 7,
    title: 'Greeks: Delta, Theta, Vega',
    description: 'Comprendi le forze che muovono il prezzo delle opzioni e come usarle a tuo vantaggio',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    requiredLevel: 6,
    sections: [
      {
        title: 'Delta: La Sensibilità al Prezzo',
        content: 'Delta misura quanto cambia il prezzo dell\'opzione quando BTC si muove di $1. Delta va da 0 a 1 per call (0 a -1 per put). Esempio: call con delta 0.30 guadagna $0.30 per ogni $1 che BTC sale. Quando VENDI opzioni vuoi delta basso (lontano dal denaro), così il prezzo dell\'opzione non ti va contro se BTC si muove.'
      },
      {
        title: 'Theta: Il Tempo è Denaro',
        content: 'Theta rappresenta quanto valore perde l\'opzione ogni giorno che passa (time decay). Per i VENDITORI di opzioni, theta è il tuo alleato! Ogni giorno che passa senza movimento, l\'opzione che hai venduto perde valore, e tu guadagni. Le opzioni con scadenza entro 30-45 giorni hanno il theta decay più accelerato.'
      },
      {
        title: 'Vega: La Volatilità Implicita',
        content: 'Vega misura quanto cambia il prezzo dell\'opzione per ogni 1% di cambiamento nella volatilità implicita (IV). Quando vendi opzioni con IV alta, ricevi più premium. Se poi IV scende, l\'opzione perde valore anche senza movimento di prezzo. Strategia: vendi quando IV è alta (paura/incertezza), compra quando IV è bassa.'
      },
      {
        title: 'Usare i Greeks nella Wheel',
        content: 'Per la Wheel: 1) Cerca put/call con delta 0.20-0.40 (probability ~20-40% di finire ITM), 2) Preferisci scadenze 30-45 giorni per massimizzare theta, 3) Monitora IV: vendi quando è sopra media storica, 4) Se IV crolla dopo che hai venduto, considera di chiudere early per lock in profit. I Greeks ti dicono QUANDO entrare e uscire.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Se vendi una put con delta -0.25, cosa significa?',
        options: [
          'Hai 25% di probabilità di profitto',
          'L\'opzione perde $0.25 al giorno',
          'L\'opzione guadagna ~$0.25 per ogni $1 che BTC scende',
          'La volatilità è al 25%'
        ],
        correctAnswer: 2,
        explanation: 'Delta -0.25 significa che l\'opzione guadagna circa $0.25 di valore per ogni $1 che BTC scende (negativo per le put).',
        xp: 150
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Theta decay è più rapido per opzioni che scadono tra:',
        options: [
          '1-7 giorni',
          '30-45 giorni',
          '90-120 giorni',
          '180+ giorni'
        ],
        correctAnswer: 1,
        explanation: 'Il theta decay è più accelerato nelle ultime settimane prima della scadenza, con picco negli ultimi 7 giorni. Ma 30-45 giorni offre miglior bilanciamento rischio/rendimento.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quando è il momento MIGLIORE per vendere opzioni in termini di Vega?',
        options: [
          'Quando IV (volatilità implicita) è molto bassa',
          'Quando IV è nella media',
          'Quando IV è molto alta (sopra percentile 70-80)',
          'IV non è rilevante per venditori'
        ],
        correctAnswer: 2,
        explanation: 'Vendere quando IV è alta significa ricevere premium più alti. Quando IV scende, puoi chiudere early in profitto anche senza movimento di prezzo.',
        xp: 200
      }
    ]
  },

  8: {
    id: 8,
    title: 'Gestione del Rischio e Position Sizing',
    description: 'Proteggi il capitale: regole di risk management essenziali per la Wheel Strategy',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    requiredLevel: 7,
    sections: [
      {
        title: 'La Regola del 2% e Dimensione Posizione',
        content: 'Mai rischiare più del 2% del capitale totale in una singola posizione. Se hai $100k, non rischiare più di $2k per trade. Per la Wheel, questo significa: se vendi put strike $40k, assicurati che una perdita del 5% su quella posizione ($2k) sia accettabile. Position size = Capitale * 0.02 / Stop Loss percentuale. Rispetta SEMPRE questa regola.'
      },
      {
        title: 'Diversificazione Temporale e Strike',
        content: 'Non concentrare tutto su una scadenza o strike. Esempio: se hai $100k, invece di vendere 2 put strike $45k scadenza 30 giorni, vendi: 1 put $45k a 30 giorni, 1 put $40k a 45 giorni. Questo riduce il rischio di assignment simultaneo e ti permette di mediare costi se BTC scende. "Non mettere tutte le uova nello stesso paniere".'
      },
      {
        title: 'Stop Loss Mentali e Rolling Defensivo',
        content: 'Definisci PRIMA un punto di uscita. Esempio: se la put venduta va in perdita del 200% del premium ricevuto, chiudi o fai roll. Se hai venduto put per $1k e ora costa $3k ricomprarla, decidi: accetti assignment o fai roll out in tempo? Non lasciare che l\'ego ti blocchi in posizioni perdenti. Cut losses early se il trade thesis è invalidato.'
      },
      {
        title: 'Margin of Safety e Stress Testing',
        content: 'Sempre mantieni buffer di cash. Se tutto il capitale è impegnato in put vendute, un drawdown ti forza a scelte difficili. Regola: massimo 60-70% del capitale in posizioni attive, 30-40% in cash. Fai stress test: "E se BTC scende del 30% domani? Posso sostenere tutte le assignment?". Se la risposta è no, riduci position size.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Con $50,000 di capitale e regola del 2%, qual è il massimo rischio accettabile per trade?',
        options: [
          '$500',
          '$1,000',
          '$2,000',
          '$5,000'
        ],
        correctAnswer: 1,
        explanation: '$50,000 * 2% = $1,000. Questo è il massimo che dovresti rischiare in un singolo trade per proteggere il capitale.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Hai venduto put per $800 premium. A che punto dovresti considerare stop loss?',
        options: [
          'Mai, accetta sempre l\'assignment',
          'Quando la perdita supera il 100-200% del premium ($800-$1,600)',
          'Solo quando BTC va a zero',
          'Quando hai perso il 50% del capitale totale'
        ],
        correctAnswer: 1,
        explanation: 'Una regola comune è chiudere o roll quando la perdita supera 100-200% del premium ricevuto, per limitare i danni.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quale percentuale del capitale totale dovrebbe restare in cash come buffer?',
        options: [
          '0% - usa tutto per massimizzare rendimenti',
          '10% - minimo vitale',
          '30-40% - margin of safety',
          '80% - ultra conservativo'
        ],
        correctAnswer: 2,
        explanation: 'Mantenere 30-40% in cash ti permette di gestire assignment inaspettati, mediare costi, o cogliere opportunità durante crash.',
        xp: 150
      }
    ]
  },

  9: {
    id: 9,
    title: 'Roll & Adjust: Gestione Avanzata',
    description: 'Impara come e quando modificare le tue posizioni per ottimizzare profitti e gestire rischio',
    difficulty: 'advanced',
    estimatedTime: '30 min',
    requiredLevel: 8,
    sections: [
      {
        title: 'Cos\'è il Rolling?',
        content: 'Il rolling è una tecnica che ti permette di chiudere una posizione esistente e aprirne una nuova con una scadenza più lontana o uno strike diverso. Questo ti permette di evitare l\'assegnazione e continuare a raccogliere premium. Esistono 3 tipi: Roll OUT (stessa strike, scadenza più lontana), Roll UP/DOWN (strike diverso, stessa scadenza), Roll OUT AND UP/DOWN (entrambi).'
      },
      {
        title: 'Quando Fare Roll',
        content: 'Considera di fare roll quando: 1) La tua posizione è in perdita ma credi ancora nella strategia, 2) Vuoi evitare l\'assegnazione, 3) Puoi raccogliere premium addizionale che giustifica il rischio e il tempo extra. NON fare roll se: il trade thesis è invalidato, stai solo "kicking the can down the road" senza piano, o il premium netto è troppo basso.'
      },
      {
        title: 'Come Calcolare se il Roll Conviene',
        content: 'Per un roll vantaggioso valuta: 1) Credito netto ricevuto - devi ricevere più di quanto paghi per chiudere, 2) Tempo addizionale - ogni settimana extra che impegni vale? 3) Nuovo strike - sei ancora ok con quel prezzo? Formula: se ricevi >0.5% del capitale per settimana extra di impegno, il roll può valere la pena. Altrimenti meglio accettare assignment.'
      },
      {
        title: 'Roll Difensivo vs Aggressivo',
        content: 'Roll DIFENSIVO: roll out mantenendo stesso strike, massimizza tempo per recovery. Roll AGGRESSIVO: roll down/up per raccogliere più premium, ma aumenta rischio. Esempio: put $45k in perdita, BTC a $42k. Difensivo: roll a 45 giorni strike $45k per +$600. Aggressivo: roll a 30 giorni strike $40k per +$1,200. Scegli basandoti su outlook e risk tolerance.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Quando è il momento migliore per fare un roll di una put venduta?',
        options: [
          'Quando la posizione è in profitto del 50%',
          'Quando il prezzo di BTC scende vicino allo strike e vuoi evitare l\'assegnazione',
          'Solo alla scadenza',
          'Mai, è meglio accettare l\'assegnazione'
        ],
        correctAnswer: 1,
        explanation: 'Il momento ottimale per fare roll è quando il prezzo si avvicina allo strike e vuoi evitare l\'assegnazione, raccogliendo premium addizionale.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Cosa significa "roll out"?',
        options: [
          'Chiudere completamente la posizione',
          'Spostare la scadenza a una data futura mantenendo lo stesso strike',
          'Cambiare solo lo strike',
          'Vendere più contratti'
        ],
        correctAnswer: 1,
        explanation: '"Roll out" significa spostare la scadenza dell\'opzione a una data futura, mantenendo lo stesso strike price.',
        xp: 100
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Se hai venduto una put a strike $40,000 e BTC è ora a $38,000, quale strategia di roll è più difensiva?',
        options: [
          'Roll down a $38,000 con stessa scadenza',
          'Roll out alla prossima scadenza mensile allo stesso strike',
          'Roll down and out a $36,000 scadenza più lontana',
          'Non fare nulla'
        ],
        correctAnswer: 1,
        explanation: 'Roll out allo stesso strike è più difensivo perché ti dà più tempo per il recovery senza abbassare ulteriormente lo strike.',
        xp: 150
      }
    ]
  },

  10: {
    id: 10,
    title: 'Volatilità Implicita e IV Rank',
    description: 'Padroneggia l\'arte di vendere caro e comprare economico usando la volatilità',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    requiredLevel: 9,
    sections: [
      {
        title: 'Cos\'è la Volatilità Implicita',
        content: 'La Volatilità Implicita (IV) è l\'aspettativa del mercato su quanto BTC si muoverà in futuro. Alta IV = mercato si aspetta grandi movimenti = opzioni più costose. Bassa IV = mercato calmo = opzioni economiche. IV è espressa in % annualizzata. Esempio: IV al 80% significa che il mercato si aspetta che BTC possa muoversi ±80% nel prossimo anno.'
      },
      {
        title: 'IV Rank e IV Percentile',
        content: 'IV Rank confronta l\'IV attuale con il range degli ultimi 12 mesi. Formula: (IV attuale - IV min) / (IV max - IV min). Un IV Rank del 80% significa che l\'IV è nell\'80° percentile dell\'ultimo anno. REGOLA: Vendi opzioni quando IV Rank > 50-60%, compra quando < 30%. Questo ti assicura di vendere quando i premi sono alti.'
      },
      {
        title: 'Cicli di Volatilità su Bitcoin',
        content: 'Bitcoin ha pattern di volatilità prevedibili: 1) IV schizza durante crash (panic selling), 2) IV si comprime durante range-bound, 3) IV aumenta prima di eventi macro (halving, decisioni Fed). La migliore opportunità per vendere put è DOPO un crash quando IV è ai massimi ma BTC sta stabilizzando. "Be greedy when others are fearful".'
      },
      {
        title: 'IV Crush e Timing di Entrata',
        content: 'IV Crush è il crollo improvviso della volatilità dopo un evento. Esempio: BTC crasha, IV vola al 120%, vendi put, poi BTC stabilizza e IV crolla a 60% = le tue put perdono valore anche senza movimento di prezzo. Profitto facile! Evita invece di vendere durante low IV pre-evento, perché IV expansion ti andrebbe contro.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Un IV Rank del 75% significa:',
        options: [
          'Le opzioni sono al 75% del loro valore massimo',
          'L\'IV attuale è più alta del 75% dei valori degli ultimi 12 mesi',
          'Hai il 75% di probabilità di profitto',
          'Il prezzo di BTC salirà del 75%'
        ],
        correctAnswer: 1,
        explanation: 'IV Rank 75% significa che la volatilità corrente è più alta del 75% dei valori registrati nell\'ultimo anno = momento ottimo per vendere.',
        xp: 150
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Quando è il momento MIGLIORE per vendere put in termini di IV?',
        options: [
          'Durante mercati calmi con IV al 20%',
          'Subito dopo un crash quando IV è schizzata al 100%+',
          'Quando IV è nella media storica',
          'IV non influenza la strategia'
        ],
        correctAnswer: 1,
        explanation: 'Dopo un crash l\'IV è altissima (paura), i premium sono gonfiati. Quando il panico si calma, IV crolla e tu profitti.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Cosa può causare un "IV Crush"?',
        options: [
          'BTC che sale del 50% in un mese',
          'Stabilizzazione del mercato dopo forte volatilità',
          'Announcement di halving',
          'Aumento del volume di trading'
        ],
        correctAnswer: 1,
        explanation: 'IV Crush avviene quando il mercato si stabilizza dopo periodo di alta volatilità. L\'incertezza diminuisce, quindi anche l\'IV.',
        xp: 200
      }
    ]
  },

  11: {
    id: 11,
    title: 'Analisi Tecnica per la Wheel',
    description: 'Usa supporti, resistenze e indicatori per selezionare strike ottimali',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    requiredLevel: 10,
    sections: [
      {
        title: 'Supporti e Resistenze per Strike Selection',
        content: 'I livelli di supporto e resistenza sono fondamentali per scegliere strike intelligenti. SUPPORTO: livello di prezzo dove storicamente BTC ha trovato acquirenti. RESISTENZA: livello dove ha trovato venditori. Regola: vendi put con strike AI supporti maggiori, vendi call con strike ALLE resistenze maggiori. Questo aumenta le probabilità che le opzioni scadano OTM.'
      },
      {
        title: 'Indicatori di Momentum: RSI e MACD',
        content: 'RSI (Relative Strength Index) misura se BTC è ipercomprato (>70) o ipervenduto (<30). MACD mostra il trend e i cambiamenti di momentum. Per la Wheel: vendi put quando RSI<30 (oversold, probabile rimbalzo), vendi call quando RSI>70 (overbought, probabile correzione). Non vendere put con RSI>70 = rischi di vendere il top.'
      },
      {
        title: 'Volume Profile e Strike Liquidi',
        content: 'Il Volume Profile mostra a quali prezzi si è scambiato più volume. I "Point of Control" (POC) sono magneti di prezzo. Scegli strike vicini ai POC perché lì c\'è più liquidità e il prezzo tende a gravitare. Evita strike in "low volume nodes" dove il prezzo tende a passare velocemente senza consolidare.'
      },
      {
        title: 'Fibonacci Retracements',
        content: 'I livelli di Fibonacci (0.236, 0.382, 0.5, 0.618, 0.786) sono livelli chiave dove BTC spesso rimbalza o inverte. Dopo un rally, BTC tipicamente ritracia al 0.5-0.618 prima di continuare. Vendi put con strike al Fib 0.618 di un rally = alta probabilità che reggano. Questo combina analisi tecnica con vendita di opzioni.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Se BTC è a $55k e ha forte supporto a $50k, dove è meglio vendere una put?',
        options: [
          'Strike $52k (poco sotto il prezzo)',
          'Strike $50k (sul supporto)',
          'Strike $45k (ben sotto il supporto)',
          'Strike $60k (sopra il prezzo)'
        ],
        correctAnswer: 1,
        explanation: 'Vendere put sul supporto maggiore ($50k) massimizza premium mantenendo buona probabilità che il livello tenga.',
        xp: 150
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Con RSI a 25 (oversold), quale strategia è più intelligente?',
        options: [
          'Vendere call (BTC probabilmente scenderà ancora)',
          'Vendere put (BTC probabilmente rimbalzerà)',
          'Non fare nulla',
          'Comprare put (protezione dal crash)'
        ],
        correctAnswer: 1,
        explanation: 'RSI < 30 indica oversold, probabile rimbalzo. Vendere put in questo contesto ha alta probabilità di successo.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Dopo un rally da $40k a $60k, BTC tipicamente ritracia a quale livello Fibonacci prima di continuare?',
        options: [
          'Non ritracia mai',
          'Fib 0.236 ($55.3k) - retracement superficiale',
          'Fib 0.5-0.618 ($50k-$47.6k) - retracement sano',
          'Fib 1.0 ($40k) - ritorna al punto di partenza'
        ],
        correctAnswer: 2,
        explanation: 'I retracement al 50-61.8% sono più comuni e sani. Vendi put a quei livelli per strike ottimali.',
        xp: 200
      }
    ]
  },

  12: {
    id: 12,
    title: 'Tax Implications e Record Keeping',
    description: 'Gestisci correttamente le tasse e la documentazione delle tue operazioni',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    requiredLevel: 10,
    sections: [
      {
        title: 'Tassazione delle Opzioni',
        content: 'Le opzioni crypto sono tassate come capital gains. Se vendi opzioni che scadono OTM, il premium è reddito tassabile nell\'anno fiscale. Se vieni assegnato, il premium modifica il costo base. Esempio: vendi put strike $40k per $1k, assegnato → costo base = $39k. Se poi vendi BTC a $50k con call, gain = $50k - $39k = $11k (tassato).'
      },
      {
        title: 'Short-Term vs Long-Term Capital Gains',
        content: 'In molti paesi (es. USA): holding <1 anno = short-term gains (tassati come reddito ordinario, aliquota più alta), >1 anno = long-term gains (aliquota ridotta). La Wheel Strategy tipicamente genera short-term gains perché i cicli sono <1 anno. Considera questo nel calcolo del rendimento netto post-tasse.'
      },
      {
        title: 'Record Keeping Essenziale',
        content: 'Devi tracciare per OGNI trade: 1) Data apertura/chiusura, 2) Strike, scadenza, tipo (put/call), 3) Premium ricevuto/pagato, 4) Assignment date e prezzo, 5) Roll details. Usa spreadsheet o software dedicato. In caso di audit, devi dimostrare ogni transazione. Non improvvisare, la corretta documentazione è legge.'
      },
      {
        title: 'Wash Sale Rule e Ottimizzazione Fiscale',
        content: 'Wash Sale Rule: se vendi BTC in perdita e ricompri entro 30 giorni, la perdita fiscale può essere negata. Per la Wheel questo è rilevante se vendi BTC in perdita e poi vieni subito riassegnato con put. Strategia: tempo le operazioni per massimizzare le deduzioni fiscali e evitare wash sales. Consulta sempre un commercialista crypto.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Se vendi una put per $1,000 che scade senza valore, come è tassato?',
        options: [
          'Non è tassato',
          'Come capital gain di $1,000',
          'Come reddito ordinario',
          'Solo se supera $10,000'
        ],
        correctAnswer: 1,
        explanation: 'Il premium di opzioni vendute che scadono OTM è tassato come short-term capital gain nell\'anno fiscale.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Vendi put strike $40k per $1k, vieni assegnato. Qual è il tuo costo base in BTC?',
        options: [
          '$40,000',
          '$41,000',
          '$39,000',
          '$38,000'
        ],
        correctAnswer: 2,
        explanation: 'Il costo base = strike - premium ricevuto = $40,000 - $1,000 = $39,000. Questo riduce la tua base imponibile futura.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quale documento è ESSENZIALE tenere per ogni trade di opzioni?',
        options: [
          'Solo il profitto/perdita finale',
          'Niente, le piattaforme tracciano tutto',
          'Data, strike, premium, assignment details completi',
          'Solo le transazioni >$10,000'
        ],
        correctAnswer: 2,
        explanation: 'Devi documentare OGNI dettaglio per conformità fiscale. Non fare affidamento solo sulle piattaforme.',
        xp: 150
      }
    ]
  },

  13: {
    id: 13,
    title: 'Piattaforme e Tools per Options Trading',
    description: 'Scopri dove e come fare trading di opzioni Bitcoin in modo sicuro ed efficiente',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    requiredLevel: 11,
    sections: [
      {
        title: 'Exchange Principali per BTC Options',
        content: 'I principali exchange per opzioni Bitcoin: 1) DERIBIT - leader, alta liquidità, opzioni cash-settled, 2) CME - exchange regolamentato US, opzioni futures-based, 3) BINANCE - opzioni semplificate, buone per beginners, 4) OKX - buona liquidità, interfaccia user-friendly. Scegli basandoti su: liquidità, regolamentazione, fee, e se vuoi opzioni cash-settled o physical delivery.'
      },
      {
        title: 'Liquidità e Spreads',
        content: 'Liquidità è critica! Controlla sempre: 1) Bid-Ask spread - se troppo largo, perdi in entrata/uscita, 2) Open Interest - quante opzioni sono aperte a quello strike, 3) Volume - quanto si scambia. Su Deribit gli strike ATM e vicini hanno buona liquidità. Strike molto OTM possono avere spread del 10-20%, evitali. Target: spread <2-3% del premium.'
      },
      {
        title: 'Tools di Analisi Essenziali',
        content: 'Per analizzare opzioni usa: 1) OPTION PRICING CALCULATOR - per calcolare fair value e greeks, 2) IV RANK CHARTS - per vedere se IV è alta o bassa storicamente (Deribit metrics), 3) PROFIT/LOSS DIAGRAMS - visualizza payoff a scadenza, 4) PORTFOLIO GREEKS - monitora delta, theta, vega totali. Molti exchange offrono questi tools integrati.'
      },
      {
        title: 'Sicurezza e Custody',
        content: 'Per la Wheel devi tenere collaterale sull\'exchange. Rischio: hack o fallimento exchange. Mitigazione: 1) Usa exchange tier-1 con buona storia di sicurezza, 2) Abilita 2FA e whitelist withdrawal, 3) Non tenere più del necessario on-exchange, 4) Considera di diversificare su 2 exchange. Il capitale non impegnato va in cold storage.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Quale exchange è considerato leader per opzioni Bitcoin?',
        options: [
          'Coinbase',
          'Kraken',
          'Deribit',
          'Binance Spot'
        ],
        correctAnswer: 2,
        explanation: 'Deribit è l\'exchange con maggiore liquidità e volume per opzioni Bitcoin, preferito dai trader professionisti.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Quale bid-ask spread è accettabile per un trade di opzioni?',
        options: [
          '20-30% del premium',
          '10-15% del premium',
          '2-5% del premium',
          'Lo spread non importa'
        ],
        correctAnswer: 2,
        explanation: 'Uno spread del 2-5% è accettabile. Spreads più larghi erodono significativamente i profitti, specialmente su trade frequenti.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Dove dovresti tenere il capitale NON impegnato in posizioni attive?',
        options: [
          'Tutto sull\'exchange per facilità',
          'In un hot wallet per accesso veloce',
          'In cold storage (hardware wallet)',
          'In stablecoin su exchange'
        ],
        correctAnswer: 2,
        explanation: 'Il capitale non in uso dovrebbe essere in cold storage per massima sicurezza. Solo il collaterale necessario resta on-exchange.',
        xp: 150
      }
    ]
  },

  14: {
    id: 14,
    title: 'Psicologia del Trading e Discipline',
    description: 'Padroneggia la mente: gestisci emozioni, bias cognitivi e mantieni la disciplina',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    requiredLevel: 12,
    sections: [
      {
        title: 'I Bias Cognitivi Più Pericolosi',
        content: 'BIAS PRINCIPALI: 1) FOMO (Fear Of Missing Out) - vendere put/call quando dovresti stare fermo, 2) Loss Aversion - tenere posizioni perdenti troppo a lungo sperando in recovery, 3) Recency Bias - dare troppo peso agli eventi recenti, 4) Overconfidence - aumentare size dopo winning streak. Riconoscere questi bias è il primo passo per controllarli.'
      },
      {
        title: 'Il Trading Journal',
        content: 'Un journal non è solo per tracciare P&L, ma per capire i tuoi pattern emotivi. Registra: 1) Setup del trade (perché sei entrato), 2) Stato emotivo PRE trade (calmo? ansioso? FOMO?), 3) Esecuzione (hai seguito il piano?), 4) Risultato + lezione. Rivedi il journal settimanalmente. Spesso scoprirai che i trade peggiori sono quelli emotivi.'
      },
      {
        title: 'Gestione dello Stress e Burnout',
        content: 'La Wheel è una strategia a lungo termine, non un sprint. Per sostenibilità: 1) NON checkare i prezzi ogni ora, 2) Imposta alert ai livelli chiave, poi dimenticati, 3) Prendi break regolari - un giorno/settimana zero trading, 4) Non over-leverage mai, lo stress non vale il gain extra. "Il mercato sarà qui domani, ma tu devi essere mentalmente sano per tradarlo".'
      },
      {
        title: 'Disciplina e Checklist Pre-Trade',
        content: 'Prima di OGNI trade, passa questa checklist: ☐ IV Rank > 50%? ☐ Strike ai livelli tecnici chiave? ☐ Position size < 2% risk? ☐ Ho cash buffer? ☐ Sono emotivamente neutrale? ☐ Questo trade fa parte del mio piano? Se anche una sola risposta è "no", NON tradare. La disciplina ti salva dai peggiori errori, l\'impulso ti distrugge.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Quale bias ti porta a tenere posizioni perdenti troppo a lungo sperando che si riprendano?',
        options: [
          'FOMO (Fear of Missing Out)',
          'Loss Aversion',
          'Recency Bias',
          'Overconfidence'
        ],
        correctAnswer: 1,
        explanation: 'Loss Aversion è la tendenza a evitare di realizzare perdite, tenendo posizioni perdenti troppo a lungo invece di tagliare le perdite.',
        xp: 100
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Cosa dovrebbe contenere un trading journal oltre a P&L?',
        options: [
          'Solo i trade vincenti',
          'Solo i numeri finanziari',
          'Setup del trade, stato emotivo, esecuzione, e lezioni apprese',
          'Niente, basta guardare il conto'
        ],
        correctAnswer: 2,
        explanation: 'Un journal completo traccia emozioni e decision-making, non solo risultati. Questo ti aiuta a identificare e correggere pattern emotivi.',
        xp: 150
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Quale elemento NON dovrebbe essere in una pre-trade checklist?',
        options: [
          'IV Rank sopra 50%',
          'Position size entro limiti',
          'Previsione che BTC salirà sicuramente',
          'Strike ai livelli tecnici'
        ],
        correctAnswer: 2,
        explanation: 'Non si può mai essere "sicuri" della direzione. La checklist deve basarsi su probabilità, risk management, e regole obiettive.',
        xp: 150
      }
    ]
  },

  15: {
    id: 15,
    title: 'Master Strategies e Ottimizzazioni',
    description: 'Tecniche avanzate per massimizzare rendimenti: ratio spreads, calendars, e hybrid strategies',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    requiredLevel: 13,
    sections: [
      {
        title: 'Double Wheel Strategy',
        content: 'La Double Wheel è un\'evoluzione: invece di vendere 1 put, ne vendi 2 a strike diversi. Esempio: $100k capitale, BTC a $50k. Vendi put $48k per $800 E put $45k per $400. Se BTC scende, vieni assegnato a $48k (ok, è il primo), la put $45k scade = incassi entrambi i premium. Se crasha, vieni assegnato a entrambi = medii il costo. Più complesso ma più premium.'
      },
      {
        title: 'Calendar Spreads per Extra Juice',
        content: 'Calendar Spread: vendi put short-dated (30 giorni) e compri put long-dated (90 giorni) STESSO strike. Esempio: vendi put $45k a 30gg per $900, compri put $45k a 90gg per $1,200. Net: -$300. Dopo 30 giorni la short scade, hai solo la long put come protezione. Beneficio: riduci costo della protezione verso il basso grazie al premium raccolto.'
      },
      {
        title: 'Hybrid Wheel + DCA Strategy',
        content: 'Combina Wheel con Dollar Cost Averaging: alloca 70% del capitale alla Wheel, 30% a DCA mensile in spot BTC. Esempio: $100k → $70k Wheel, $30k = $2.5k/mese DCA. La Wheel genera income, il DCA accumula spot per ridurre il costo medio. In bull market il DCA offre upside illimitato che la Wheel limita. Best of both worlds.'
      },
      {
        title: 'Wheel in Different Market Regimes',
        content: 'BEAR MARKET: agggressivo su put (strike più bassi, più premium), conservativo su call (evita di vendere spot). BULL MARKET: conservativo su put (strike molto bassi, safety first), aggressivo su call (raccogli premium al rialzo). SIDEWAYS: ideale per Wheel standard, massimizza theta decay. Adatta la strategia al regime corrente, non usare sempre lo stesso approccio.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Nella Double Wheel Strategy, quale è il vantaggio principale?',
        options: [
          'Elimina completamente il rischio',
          'Raccogli più premium totale e medii costi se assegnato multiplo',
          'Non richiede capitale',
          'Garantisce profitti in ogni scenario'
        ],
        correctAnswer: 1,
        explanation: 'Vendere put a strike multipli aumenta il premium totale e, se assegnato multiplo, medii il costo di acquisto BTC.',
        xp: 150
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Un Calendar Spread con opzioni put serve principalmente a:',
        options: [
          'Massimizzare il premium senza protezione',
          'Ridurre il costo della protezione verso il basso',
          'Eliminare theta decay',
          'Aumentare delta exposure'
        ],
        correctAnswer: 1,
        explanation: 'Vendendo la put short-term raccogli premium che riduce il costo della put long-term di protezione.',
        xp: 200
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'In quale regime di mercato la Wheel Strategy performa MEGLIO?',
        options: [
          'Strong bull market con +300% in pochi mesi',
          'Crash violento -80%',
          'Mercato sideways o moderatamente volatile',
          'Performa uguale sempre'
        ],
        correctAnswer: 2,
        explanation: 'La Wheel è ottimale in mercati range-bound dove il theta decay lavora a tuo favore senza movimenti estremi che invalidano la strategia.',
        xp: 200
      }
    ]
  }
};