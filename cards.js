// File: cards.js
// Contiene i dati e la logica specifica delle carte.

// IMPORTANTE:
// Funzioni definite qui potrebbero usare funzioni definite in game.js
// (come addLogMessage, getPlayerState, ecc.).
// Assicurati che game.js sia caricato e che queste funzioni siano disponibili
// globalmente o passate correttamente tramite l'oggetto 'context'.

const cardDatabase = [
    {
      id: "c001",
      nome: "Ratto Gigante",
      illustrazione: "images/1.jpg",
      forza: 1,
      punti_ferita: 1,
      costo: 1,
      description: "Creatura base.", // Testo descrittivo per tooltip/UI
      // Nessuna abilità speciale = nessun campo effetto specifico
    },
    {
      id: "c002",
      nome: "Guardiano del Cancello",
      illustrazione: "images/2.jpg",
      forza: 0,
      punti_ferita: 4,
      costo: 2,
      description: "Provocazione (Le creature nemiche devono attaccare questa creatura se possibile).",
      // 'Provocazione' è una keyword, la sua logica sarà nel sistema di attacco
      keywords: ["Provocazione"],
    },
    {
      id: "c003",
      nome: "Esploratore Elfico",
      illustrazione: "images/3.jpg",
      forza: 2,
      punti_ferita: 1,
      costo: 2,
      description: "Quando entra in gioco, puoi guardare la prima carta del tuo mazzo.",
      /**
       * Effetto "Entra in Gioco".
       * @param {object} context - Contiene lo stato e le funzioni helper necessarie.
       * @param {object} context.gameState - Lo stato attuale del gioco.
       * @param {number} context.playerId - L'ID del giocatore che ha giocato la carta.
       * @param {string} context.cardId - L'ID di questa carta.
       * @param {function} context.addLog - Riferimento a addLogMessage.
       * @param {function} context.getPlayerState - Riferimento a getPlayerState.
       * @param {function} context.getCardData - Riferimento a getCardData.
       */
      onPlay: function(context) {
          const { gameState, playerId, addLog, getPlayerState, getCardData: internalGetCardData } = context;
          const player = getPlayerState(playerId);
          if (player && player.deck.length > 0) {
              const topCardData = internalGetCardData(player.deck[0]);
              addLog(`Esploratore Elfico: Guardi la prima carta del mazzo (${topCardData.nome}).`);
              // Qui potresti mostrare l'info solo al giocatore attivo in un'interfaccia più avanzata
          } else {
              addLog("Esploratore Elfico: Mazzo vuoto!");
          }
          // Non richiede target, non ritorna nulla di speciale
      }
    },
    {
      id: "c004",
      nome: "Guerriero Veterano",
      illustrazione: "images/4.jpg",
      forza: 3,
      punti_ferita: 3,
      costo: 3,
      description: "" // Nessuna abilità = nessuna descrizione speciale
    },
    {
      id: "c005",
      nome: "Golem d'Ossa",
      illustrazione: "images/5.jpg",
      forza: 4,
      punti_ferita: 5,
      costo: 5,
      description: "Lento (Non può attaccare nel turno in cui viene giocato).",
      // 'Lento' è una keyword, la logica sarà nel sistema di attacco/controllo azioni
      keywords: ["Lento"],
    },
    {
      id: "m001",
      nome: "Dardo Incantato",
      illustrazione: "images/17.jpg",
      forza: null,
      punti_ferita: null,
      costo: 1,
      description: "Infliggi 1 danno a una creatura bersaglio.",
      /**
       * Definisce i requisiti di targeting per giocare questa carta.
       * @param {object} context - Contesto di gioco.
       * @returns {object} Oggetto di configurazione del target.
       */
      getTargetInfo: function(context) {
          return {
              // Messaggio da mostrare all'utente
              prompt: "Seleziona una creatura bersaglio per Dardo Incantato.",
              // Funzione per validare un potenziale elemento target
              filter: (targetElement, context) => {
                  const targetCardId = targetElement?.dataset?.cardId;
                  if (!targetCardId) return false;
                  const targetCardData = context.getCardData(targetCardId);
                  // Deve essere una carta e avere punti_ferita (quindi creatura)
                  return targetElement.classList.contains('card') && targetCardData?.punti_ferita !== null;
              },
              // Azione da eseguire DOPO che un target valido è stato selezionato
              onTargetSelected: function(targetElement, context) {
                  const { gameState, playerId, cardId: sourceCardId, addLog, getPlayerState, getCardData: internalGetCardData } = context;
                  const targetCardId = targetElement.dataset.cardId;
                  const targetCardData = internalGetCardData(targetCardId);
                  const targetOwnerId = targetElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2;
  
                  addLog(`Dardo Incantato infligge 1 danno a ${targetCardData.nome}. (Effetto Log)`);
                  console.log(`Dardo Incantato bersaglia ${targetCardData.nome} (ID: ${targetCardId}) del G${targetOwnerId}`);
  
                  // -------- INIZIO LOGICA DANNO (DA IMPLEMENTARE MEGLIO) --------
                  // Trovare un modo per aggiornare gli HP della creatura nello stato del gioco.
                  // Questo richiede che gameState.players[x].field sia un array di oggetti
                  // con { id: '...', currentHp: X, ... } invece di solo ID stringa.
                  // Esempio concettuale (NON FUNZIONANTE CON LO STATO ATTUALE):
                  /*
                  const targetPlayerField = getPlayerState(targetOwnerId)?.field;
                  if (targetPlayerField) {
                      const targetCardIndex = targetPlayerField.findIndex(card => card.id === targetCardId);
                      if (targetCardIndex > -1) {
                          targetPlayerField[targetCardIndex].currentHp -= 1;
                          addLog(`${targetCardData.nome} ha ora ${targetPlayerField[targetCardIndex].currentHp} HP.`);
                          // Controllare se la creatura è morta
                          if (targetPlayerField[targetCardIndex].currentHp <= 0) {
                              addLog(`${targetCardData.nome} è distrutto!`);
                              // Spostare la carta dal campo al cimitero
                              getPlayerState(targetOwnerId).graveyard.push(targetCardId);
                              targetPlayerField.splice(targetCardIndex, 1);
                              // Qui potrebbero attivarsi effetti "onDeath"
                          }
                      }
                  }
                  */
                  // -------- FINE LOGICA DANNO (DA IMPLEMENTARE MEGLIO) --------
  
                  // Metti Dardo Incantato nel cimitero del giocatore che l'ha lanciato
                  const sourcePlayer = getPlayerState(playerId);
                  if (sourcePlayer) {
                      sourcePlayer.graveyard.push(sourceCardId);
                  }
              }
          };
      }
      // onPlay non è definito perché l'azione principale avviene dopo il targeting
    },
    {
      id: "m002",
      nome: "Crescita Rigogliosa",
      illustrazione: "images/m002.jpg",
      forza: null,
      punti_ferita: null,
      costo: 2,
      description: "Ottieni 1 cristallo di mana massimo permanente (max 10).",
      onPlay: function(context) {
          const { gameState, playerId, addLog, getPlayerState } = context;
          const player = getPlayerState(playerId);
          if (player) {
              if (player.maxResources < 10) {
                  player.maxResources++;
                  // Decidi se riempire anche le risorse attuali o no in base alle tue regole
                  // player.currentResources = player.maxResources;
                  addLog(`Crescita Rigogliosa: Ottieni 1 mana massimo (ora ${player.maxResources}).`);
              } else {
                  addLog("Crescita Rigogliosa: Mana massimo già raggiunto.");
              }
          }
      }
    },
    {
      id: "m003",
      nome: "Pesca Miracolosa",
      illustrazione: "images/m003.jpg",
      forza: null,
      punti_ferita: null,
      costo: 3,
      description: "Pesca 2 carte.",
      onPlay: function(context) {
          const { gameState, playerId, addLog, drawCard: internalDrawCard } = context;
           addLog("Pesca Miracolosa: Peschi 2 carte.");
           // Usa la funzione drawCard passata nel contesto (o globale)
           internalDrawCard(playerId);
           internalDrawCard(playerId);
      }
    }
    // --- Aggiungi qui le tue altre carte ---
    /* Modello:
     {
      id: "...",
      nome: "...",
      illustrazione: "...",
      forza: X | null,
      punti_ferita: Y | null,
      costo: Z,
      description: "...",
      keywords: ["...", "..."], // Opzionale
      // Funzione per effetti immediati (se non richiede target)
      onPlay: function(context) { ... }, // Opzionale
      // Funzione per definire requisiti di targeting
      getTargetInfo: function(context) { // Opzionale
          return {
              prompt: "...",
              filter: (targetElement, context) => { ... return true/false; },
              onTargetSelected: function(targetElement, context) { ... } // Effetto DOPO selezione
          };
      },
      // Altre funzioni per altri trigger (onDeath, onAttack, canAttack, ecc.) potrebbero essere aggiunte qui
     }
    */
  ];
  
  
  // --- Funzione Helper (Mantenuta) ---
  function getCardData(cardId) {
      const cardData = cardDatabase.find(card => card.id === cardId);
      if (!cardData) {
          console.error(`Dati non trovati per la carta con ID: ${cardId}`);
          // Fornisce un oggetto di default per evitare errori gravi
          return { id: cardId, nome: "Carta Sconosciuta", costo: 0, description: "Errore - Dati non trovati", forza: null, punti_ferita: null };
      }
      return cardData; // Restituisce l'oggetto completo
  }
  
  // Funzione per ottenere TUTTI gli ID delle carte nel database
  function getAllCardIds() {
      return cardDatabase.map(card => card.id);
  }
  
  console.log(`Caricate ${cardDatabase.length} definizioni di carte con effetti decentralizzati.`);