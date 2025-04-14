// File: cards.js
// Contiene i dati delle carte con la nuova struttura.
// Gli effetti sono temporaneamente rimossi, verranno gestiti tramite 'keywords' in futuro.

// IMPORTANTE: Le funzioni di effetto diretto (onPlay, getTargetInfo) sono state rimosse.
// La logica del gioco dovrà essere adattata.

const cardDatabase = [
    {
      id: "c001",
      nome: "Ratto Gigante",
      illustrazione: "images/c001.jpg",
      attacco: 1,         // Precedentemente 'forza'
      punti_ferita: 1,
      costo: 1,
      tipo: "unità",      // Nuovo campo tipo
      description: "Una semplice unità base.",
      keywords: [],       // Campo keywords, vuoto per ora
    },
    {
      id: "c002",
      nome: "Guardiano del Cancello",
      illustrazione: "images/c002.jpg",
      attacco: 0,
      punti_ferita: 4,
      costo: 2,
      tipo: "unità",
      description: "Provocazione (Le creature nemiche devono attaccare questa creatura se possibile).",
      keywords: ["Provocazione"], // Mantenuto keyword esistente
    },
    {
      id: "c003",
      nome: "Esploratore Elfico",
      illustrazione: "images/c003.jpg",
      attacco: 2,
      punti_ferita: 1,
      costo: 2,
      tipo: "unità",
      description: "Quando entra in gioco, puoi guardare la prima carta del tuo mazzo.", // Descrizione effetto passato
      keywords: [], // Effetto 'onPlay' rimosso, dovrà diventare keyword/trigger
    },
     {
      id: "c004",
      nome: "Guerriero Veterano",
      illustrazione: "images/c004.jpg",
      attacco: 3,
      punti_ferita: 3,
      costo: 3,
      tipo: "unità",
      description: "", // Nessuna abilità = nessuna descrizione
      keywords: [],
    },
     {
      id: "c005",
      nome: "Golem d'Ossa",
      illustrazione: "images/c005.jpg",
      attacco: 4,
      punti_ferita: 5,
      costo: 5,
      tipo: "unità",
      description: "Lento (Non può attaccare nel turno in cui viene giocato).",
      keywords: ["Lento"], // Mantenuto keyword esistente
    },
    {
      id: "m001",
      nome: "Dardo Incantato",
      illustrazione: "images/m001.jpg",
      attacco: null,        // N/A per poteri
      punti_ferita: null, // N/A per poteri
      costo: 1,
      tipo: "potere",     // Precedentemente magia/evento
      description: "Infliggi 1 danno a un'unità bersaglio.", // Effetto passato, richiedeva target
      keywords: [], // Funzioni getTargetInfo/onTargetSelected rimosse
    },
    {
      id: "m002",
      nome: "Crescita Rigogliosa",
      illustrazione: "images/m002.jpg",
      attacco: null,
      punti_ferita: null,
      costo: 2,
      tipo: "potere",
      description: "Ottieni 1 cristallo di risorsa massimo permanente.", // Effetto passato
      keywords: [], // Funzione onPlay rimossa
    },
    {
      id: "m003",
      nome: "Pesca Miracolosa",
      illustrazione: "images/m003.jpg",
      attacco: null,
      punti_ferita: null,
      costo: 3,
      tipo: "potere",
      description: "Pesca 2 carte.", // Effetto passato
      keywords: [], // Funzione onPlay rimossa
    },
    // --- Esempi nuovi tipi (da creare con i tuoi dati) ---
    {
      id: "h001", // Prefisso 'h' per eroe (esempio)
      nome: "Eroe Valoroso",
      illustrazione: "images/h001.jpg", // Immagine placeholder
      attacco: 2,
      punti_ferita: 25, // Gli eroi potrebbero avere più vita?
      costo: 0, // Gli eroi sono in gioco dall'inizio? Costo 0?
      tipo: "eroe",
      description: "Il tuo eroe principale.",
      keywords: [],
    },
     {
      id: "t001", // Prefisso 't' per terreno (esempio)
      nome: "Foresta Antica",
      illustrazione: "images/t001.jpg", // Immagine placeholder
      attacco: null,
      punti_ferita: null, // I terreni hanno vita? Forse durata?
      costo: 2,
      tipo: "terreno",
      description: "Le tue unità guadagnano +1 Attacco mentre questo terreno è in gioco.",
      keywords: [], // Effetto passivo/continuo
    },
     {
      id: "o001", // Prefisso 'o' per obiettivo (esempio)
      nome: "Conquista il Forte",
      illustrazione: "images/o001.jpg", // Immagine placeholder
      attacco: null,
      punti_ferita: null, // Gli obiettivi hanno vita/contatore?
      costo: 0, // Obiettivo iniziale?
      tipo: "obiettivo",
      description: "Vinci la partita se controlli 3 unità alla fine del tuo turno.",
      keywords: [], // Condizione di vittoria
    }
    // --- Aggiungi qui le tue altre carte con la nuova struttura ---
    /* Modello da copiare:
    {
      id: "unique_id",
      nome: "Nome Carta",
      illustrazione: "images/unique_id.jpg",
      attacco: X | null,
      punti_ferita: Y | null,
      costo: Z,
      tipo: "eroe" | "unità" | "potere" | "terreno" | "obiettivo",
      description: "Descrizione testuale della carta e/o del suo effetto.",
      keywords: ["Keyword1", "Keyword2"] // Lista di keyword per effetti/abilità
    },
    */
  ];
  
  
  // --- Funzione Helper (Mantenuta) ---
  // Restituisce l'oggetto completo della carta dato l'ID
  function getCardData(cardId) {
      const cardData = cardDatabase.find(card => card.id === cardId);
      if (!cardData) {
          console.error(`Dati non trovati per la carta con ID: ${cardId}`);
          // Restituisce un oggetto di default più semplice
          return { id: cardId, nome: "Sconosciuta", costo: 0, tipo: "sconosciuto", description: "Errore Dati", attacco: null, punti_ferita: null, keywords:[] };
      }
      return cardData;
  }
  
  // Funzione per ottenere TUTTI gli ID delle carte nel database (Mantenuta)
  function getAllCardIds() {
      return cardDatabase.map(card => card.id);
  }
  
  console.log(`Caricate ${cardDatabase.length} definizioni di carte (Nuova Struttura).`);