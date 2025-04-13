// File: cards.js
// Contiene i dati di tutte le carte del gioco.
// Modifica questo file per aggiungere, rimuovere o cambiare le carte.

// IMPORTANTE:
// 1. Crea una cartella chiamata "images" nella stessa directory di index.html.
// 2. Dentro la cartella "images", inserisci i file immagine per le tue carte.
// 3. Il nome di ogni file immagine DEVE corrispondere all'ID della carta seguito da ".jpg"
//    (es. per la carta con id "c001", l'immagine deve essere "images/c001.jpg").
//    Se non hai immagini, puoi usare placeholder o commentare la linea 'illustrazione'.

const cardDatabase = [
  {
    id: "c001", // ID univoco della carta (c = creatura)
    nome: "Ratto Gigante",
    illustrazione: "images/c001.jpg", // Percorso relativo all'immagine
    forza: 1,         // Valore di attacco/forza
    punti_ferita: 1,  // Valore di difesa/punti ferita
    costo: 1,         // Costo per giocare la carta
    abilita: "Una creatura base senza abilità speciali." // Testo dell'abilità
  },
  {
    id: "c002",
    nome: "Guardiano del Cancello",
    illustrazione: "images/c002.jpg",
    forza: 0,
    punti_ferita: 4,
    costo: 2,
    abilita: "Provocazione (Le creature nemiche devono attaccare questa creatura se possibile)." // Esempio abilità keyword
  },
  {
    id: "c003",
    nome: "Esploratore Elfico",
    illustrazione: "images/c003.jpg",
    forza: 2,
    punti_ferita: 1,
    costo: 2,
    abilita: "Quando entra in gioco, puoi guardare la prima carta del tuo mazzo." // Esempio effetto "Entra in Gioco"
  },
   {
    id: "c004",
    nome: "Guerriero Veterano",
    illustrazione: "images/c004.jpg",
    forza: 3,
    punti_ferita: 3,
    costo: 3,
    abilita: "" // Nessuna abilità (stringa vuota)
  },
   {
    id: "c005",
    nome: "Golem d'Ossa",
    illustrazione: "images/c005.jpg",
    forza: 4,
    punti_ferita: 5,
    costo: 5,
    abilita: "Lento (Non può attaccare nel turno in cui viene giocato)."
  },
  {
    id: "m001", // ID univoco (m = magia/evento/abilità)
    nome: "Dardo Incantato",
    illustrazione: "images/m001.jpg",
    forza: null,        // Non applicabile per questa magia (usiamo null)
    punti_ferita: null, // Non applicabile (usiamo null)
    costo: 1,
    abilita: "Infliggi 1 danno a qualsiasi bersaglio." // Effetto diretto
  },
  {
    id: "m002",
    nome: "Crescita Rigogliosa",
    illustrazione: "images/m002.jpg",
    forza: null,
    punti_ferita: null,
    costo: 2,
    abilita: "Ottieni 1 cristallo di mana massimo permanente." // Modifica stato giocatore
  },
  {
    id: "m003",
    nome: "Pesca Miracolosa",
    illustrazione: "images/m003.jpg",
    forza: null,
    punti_ferita: null,
    costo: 3,
    abilita: "Pesca 2 carte." // Azione di gioco
  }
  // --- Aggiungi qui le tue altre carte ---
  /* Modello da copiare:
  {
    id: "unique_id", // Es: "c006", "m004", ecc.
    nome: "Nome della Carta",
    illustrazione: "images/unique_id.jpg",
    forza: X, // Usa null se non applicabile
    punti_ferita: Y, // Usa null se non applicabile
    costo: Z,
    abilita: "Descrizione dell'abilità o effetto."
  },
  */
];


// --- Funzione Helper (Opzionale ma Conveniente) ---
// Trova e restituisce i dati completi di una carta dato il suo ID.
// Sarà usata in game.js per ottenere i dettagli quando abbiamo solo l'ID.
function getCardData(cardId) {
    const cardData = cardDatabase.find(card => card.id === cardId);
    if (!cardData) {
        console.error(`Dati non trovati per la carta con ID: ${cardId}`);
        // Potresti restituire un oggetto di default o null per gestire l'errore
        return { id: cardId, nome: "Carta Sconosciuta", costo: 0, abilita: "Errore dati", forza: null, punti_ferita: null, illustratore: "" };
    }
    return cardData;
}

console.log(`Caricate ${cardDatabase.length} definizioni di carte.`); // Messaggio per verifica in console