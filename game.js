// File: game.js
// Logica principale del gioco e interazione con l'interfaccia
// (Versione con gestione immagine mancante)

// ==================== 1. Riferimenti Elementi DOM ====================
const gameLog = document.getElementById('game-log');
const turnIndicator = document.getElementById('turn-indicator');
const endTurnButton = document.getElementById('end-turn-button');
const player1Info = document.getElementById('info-player-1');
const player1Hp = document.getElementById('hp-player-1');
const player1Res = document.getElementById('res-player-1');
const player1MaxRes = document.getElementById('max-res-player-1');
const player1DeckCount = document.getElementById('deck-count-1');
const player1GraveyardCount = document.getElementById('graveyard-count-1');
const player1Hand = document.getElementById('hand-player-1');
const player1Field = document.getElementById('field-player-1');
const player1Deck = document.getElementById('deck-player-1');
const player1Graveyard = document.getElementById('graveyard-player-1');
const player1Area = document.getElementById('player-area-1');
const player2Info = document.getElementById('info-player-2');
const player2Hp = document.getElementById('hp-player-2');
const player2Res = document.getElementById('res-player-2');
const player2MaxRes = document.getElementById('max-res-player-2');
const player2DeckCount = document.getElementById('deck-count-2');
const player2GraveyardCount = document.getElementById('graveyard-count-2');
const player2Hand = document.getElementById('hand-player-2');
const player2Field = document.getElementById('field-player-2');
const player2Area = document.getElementById('player-area-2');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalButton = document.querySelector('.close-button');


// ==================== 2. Stato del Gioco ====================
let gameState = {
    currentPlayerId: 1,
    turnNumber: 1,
    players: [
        { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [] },
        { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [] }
    ],
    gameEnded: false,
    winner: null,
    selectingTarget: null,
    potentialTargets: []
};


// ==================== 3. Funzioni Utilità ====================
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }
function addLogMessage(message) { const p = document.createElement('p'); p.textContent = `[Turno ${gameState.turnNumber}] ${message}`; gameLog.appendChild(p); gameLog.scrollTop = gameLog.scrollHeight; }
function getPlayerState(playerId) { return gameState.players.find(p => p.id === playerId) || null; }
function getOpponentState(currentPlayerId) { const opponentId = currentPlayerId === 1 ? 2 : 1; return getPlayerState(opponentId); }
// Funzione da cards.js (assumiamo sia presente)
// function getCardData(cardId) { ... }


// ==================== 4. Funzioni di Rendering ====================

/**
 * Crea e restituisce l'elemento HTML per una singola carta.
 * Gestisce l'immagine mancante.
 * @param {string} cardId L'ID della carta da renderizzare.
 * @param {string} location Da dove viene chiamata (es. 'hand', 'field', 'modal')
 * @returns {HTMLElement} L'elemento div della carta.
 */
function renderCard(cardId, location = 'hand') {
    const cardData = getCardData(cardId);
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.dataset.cardId = cardId;
    cardDiv.dataset.location = location;

    // --- Event listener specifici per posizione ---
    // Aggiungi listener solo se la carta è INTERAGIBILE in quella zona
    if (!gameState.gameEnded) { // Non aggiungere listener se il gioco è finito
        if (location === 'hand' && gameState.currentPlayerId === 1 && getPlayerState(1)?.hand.includes(cardId)) {
            cardDiv.addEventListener('click', handleHandCardClick);
        } else if (location === 'field') {
            cardDiv.addEventListener('click', handleFieldCardClick);
        }
        // Nessun listener per 'modal' o mano avversario
    }
    // --- Fine event listener ---

    // --- Gestione Immagine / Testo Alternativo ---
    const cardArt = document.createElement('div');
    cardArt.classList.add('card-art');
    if (cardData.illustrazione) {
        const img = new Image();
        img.onload = () => {
            // Immagine caricata con successo
            cardArt.style.backgroundImage = `url('${cardData.illustrazione}')`;
            cardArt.textContent = ''; // Assicurati che non ci sia testo se l'immagine carica
        };
        img.onerror = () => {
            // Errore caricamento immagine (non trovata, percorso errato, ecc.)
            cardArt.textContent = 'Immagine non disponibile';
            // Stile opzionale per il testo di fallback
            cardArt.style.display = 'flex';
            cardArt.style.alignItems = 'center';
            cardArt.style.justifyContent = 'center';
            cardArt.style.textAlign = 'center';
            cardArt.style.fontSize = '0.8em';
            cardArt.style.color = '#ccc';
            cardArt.style.backgroundImage = 'none'; // Rimuovi eventuale sfondo precedente
        };
        img.src = cardData.illustrazione; // Avvia il tentativo di caricamento
    } else {
        // Nessuna illustrazione specificata nei dati della carta
        cardArt.textContent = 'Immagine non disponibile';
         cardArt.style.display = 'flex';
         cardArt.style.alignItems = 'center';
         cardArt.style.justifyContent = 'center';
         cardArt.style.textAlign = 'center';
         cardArt.style.fontSize = '0.8em';
         cardArt.style.color = '#ccc';
    }
    // --- Fine Gestione Immagine ---

    const cardName = document.createElement('div'); cardName.classList.add('card-name'); cardName.textContent = cardData.nome;
    const cardCost = document.createElement('div'); cardCost.classList.add('card-cost'); cardCost.textContent = cardData.costo;
    let cardStatsHTML = ''; if (cardData.forza !== null || cardData.punti_ferita !== null) { cardStatsHTML = `<div class="card-stats"><span>${cardData.forza !== null ? cardData.forza : '-'}</span><span>${cardData.punti_ferita !== null ? cardData.punti_ferita : '-'}</span></div>`; }
    cardDiv.innerHTML = `
        ${cardName.outerHTML}
        ${cardCost.outerHTML}
        ${cardArt.outerHTML} <!-- Inserisce il div cardArt creato sopra -->
        ${cardStatsHTML}
        <div class="card-ability" style="display: none;">${cardData.abilita}</div>
    `;
    if(cardData.abilita) { let tooltipText = `${cardData.nome} (${cardData.costo})\n`; if (cardData.forza !== null) tooltipText += ` F: ${cardData.forza}`; if (cardData.punti_ferita !== null) tooltipText += ` PF: ${cardData.punti_ferita}`; tooltipText += `\nAbilità: ${cardData.abilita}`; cardDiv.title = tooltipText; }

    // Riassegna riferimento a cardArt dopo aver modificato innerHTML
    const cardArtInDiv = cardDiv.querySelector('.card-art');
    // Se il caricamento è asincrono e potrebbe finire dopo, riapplica stile/testo
    // Questo è necessario perché innerHTML ricrea gli elementi
     if (cardArtInDiv && cardArt.textContent) {
         cardArtInDiv.textContent = cardArt.textContent;
         Object.assign(cardArtInDiv.style, cardArt.style); // Copia gli stili applicati
     } else if (cardArtInDiv && cardArt.style.backgroundImage) {
         cardArtInDiv.style.backgroundImage = cardArt.style.backgroundImage;
     }

    return cardDiv;
}

function renderHand(playerId) {
    const playerState = getPlayerState(playerId);
    const handElement = (playerId === 1) ? player1Hand : player2Hand;
    handElement.innerHTML = '';
    if (playerId === 1) {
        playerState.hand.forEach(cardId => {
            const cardElement = renderCard(cardId, 'hand');
            handElement.appendChild(cardElement);
        });
    } else {
        for (let i = 0; i < playerState.hand.length; i++) { const placeholder = document.createElement('div'); placeholder.classList.add('card-placeholder'); placeholder.title = "Carta avversaria"; handElement.appendChild(placeholder); }
    }
}

function renderField(playerId) {
    const playerState = getPlayerState(playerId);
    const fieldElement = (playerId === 1) ? player1Field : player2Field;
    fieldElement.innerHTML = '';
    playerState.field.forEach(cardIdOrObject => {
        const cardId = (typeof cardIdOrObject === 'string') ? cardIdOrObject : cardIdOrObject.id;
        const cardElement = renderCard(cardId, 'field');
        fieldElement.appendChild(cardElement);
    });
}

function renderPlayerInfo(playerId) {
    const playerState = getPlayerState(playerId); if (!playerState) return;
    if (playerId === 1) { player1Hp.textContent = playerState.hp; player1Res.textContent = playerState.currentResources; player1MaxRes.textContent = playerState.maxResources; player1DeckCount.textContent = playerState.deck.length; player1GraveyardCount.textContent = playerState.graveyard.length; }
    else { player2Hp.textContent = playerState.hp; player2Res.textContent = playerState.currentResources; player2MaxRes.textContent = playerState.maxResources; player2DeckCount.textContent = playerState.deck.length; player2GraveyardCount.textContent = playerState.graveyard.length; }
 }

function renderGame() {
    renderPlayerInfo(1); renderPlayerInfo(2);
    renderHand(1); renderHand(2);
    renderField(1); renderField(2);
    turnIndicator.textContent = gameState.currentPlayerId;
    endTurnButton.disabled = gameState.gameEnded || gameState.currentPlayerId !== 1 || !!gameState.selectingTarget; // Disabilita anche durante selezione target

    if (!gameState.gameEnded && gameState.currentPlayerId === 1) {
        player1Area.classList.add('active-turn'); player2Area.classList.remove('active-turn');
        player1Deck.style.cursor = 'default';
        player1Deck.title = `Mazzo (${getPlayerState(1)?.deck.length || 0} carte)`;
    } else if (!gameState.gameEnded && gameState.currentPlayerId === 2) {
        player1Area.classList.remove('active-turn'); player2Area.classList.add('active-turn');
        player1Deck.style.cursor = 'default';
        player1Deck.title = `Mazzo (${getPlayerState(1)?.deck.length || 0} carte)`;
    } else {
         player1Area.classList.remove('active-turn'); player2Area.classList.remove('active-turn');
         player1Deck.style.cursor = 'default';
    }

    const player1 = getPlayerState(1); const player2 = getPlayerState(2);
    if (!gameState.gameEnded && player1 && (player1.hp <= 0 || (player1.deck.length === 0 && player1.hand.length === 0 && player1.field.length === 0))) {
        endGame(2);
    } else if (!gameState.gameEnded && player2 && (player2.hp <= 0 || (player2.deck.length === 0 && player2.hand.length === 0 && player2.field.length === 0))) {
        endGame(1);
    }

    if (!gameState.selectingTarget) {
        clearHighlights();
    }
}


// ==================== 5. Logica Azioni di Gioco ====================

function startTurn(playerId) {
    if (gameState.gameEnded) return;
    console.log(`Inizio turno ${gameState.turnNumber} per Giocatore ${playerId}`);
    addLogMessage(`Inizio turno per Giocatore ${playerId}.`);
    gameState.currentPlayerId = playerId;
    const player = getPlayerState(playerId);
    if (!player) return; // Sicurezza

    if (player.maxResources < 10) { player.maxResources++; }
    player.currentResources = player.maxResources;
    drawCard(playerId);
    renderGame();

     if (playerId === 2) {
        endTurnButton.disabled = true;
        addLogMessage("Giocatore 2 sta pensando...");
        setTimeout(runOpponentTurn, 1500);
    } else {
         endTurnButton.disabled = !!gameState.selectingTarget; // Riabilita se non si sta selezionando target
    }
}

function drawCard(playerId) {
    const player = getPlayerState(playerId);
    if (!player || gameState.gameEnded) return;
    if (player.deck.length > 0) {
        const drawnCardId = player.deck.shift();
        player.hand.push(drawnCardId);
        addLogMessage(`Giocatore ${playerId} pesca una carta.`);
        console.log(`Giocatore ${playerId} pesca ${drawnCardId}`);
    } else {
        player.hp -= 1;
        addLogMessage(`Giocatore ${playerId} ha finito le carte e subisce 1 danno da fatica! HP: ${player.hp}`);
        console.warn(`Giocatore ${playerId} ha tentato di pescare da un mazzo vuoto.`);
    }
    // RenderGame sarà chiamato da startTurn o altre azioni
}

function handleEndTurnClick() {
    if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) {
        console.warn("Impossibile passare il turno ora.");
        return;
    }
    console.log("Giocatore 1 passa il turno.");
    addLogMessage("Giocatore 1 termina il suo turno.");
    gameState.turnNumber++;
    startTurn(2);
}

function handleHandCardClick(event) {
    if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) return;
    const cardElement = event.currentTarget;
    const cardId = cardElement.dataset.cardId;
    const cardData = getCardData(cardId);
    const player = getPlayerState(1);
    if (!player) return;

    console.log(`Cliccato sulla carta in mano: ${cardData.nome} (ID: ${cardId})`);
    if (player.currentResources >= cardData.costo) {
        player.currentResources -= cardData.costo;
        const cardIndex = player.hand.indexOf(cardId);
        if (cardIndex > -1) { player.hand.splice(cardIndex, 1); }
        else { console.error("Carta cliccata non trovata nella mano!", cardId, player.hand); player.currentResources += cardData.costo; return; }

        if (cardData.forza !== null || cardData.punti_ferita !== null) {
            player.field.push(cardId);
            addLogMessage(`Giocatore 1 gioca ${cardData.nome}.`);
            handleCardEffects(cardId, 'onPlay', 1);
        } else {
             addLogMessage(`Giocatore 1 lancia ${cardData.nome}.`);
             handleCardEffects(cardId, 'onPlay', 1);
             player.graveyard.push(cardId);
        }
        renderGame(); // Aggiorna dopo aver giocato la carta con successo
    } else {
        addLogMessage(`Risorse insufficienti per giocare ${cardData.nome} (costa ${cardData.costo}, hai ${player.currentResources}).`);
        console.log("Risorse insufficienti.");
    }
}

function handleFieldCardClick(event) {
    if (gameState.gameEnded) return;
    const cardElement = event.currentTarget;
    const cardId = cardElement.dataset.cardId;
    const cardData = getCardData(cardId);
    const ownerId = cardElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2;

    if (gameState.selectingTarget) {
        if (gameState.potentialTargets.includes(cardElement)) {
             console.log(`Target selezionato: ${cardData.nome} (ID: ${cardId})`);
             // Esegui l'azione con il target, passando l'elemento cliccato
             gameState.selectingTarget.callback(cardElement);
             // Resetta stato selezione DOPO aver eseguito la callback
             gameState.selectingTarget = null;
             gameState.potentialTargets = [];
             clearHighlights();
             renderGame(); // Aggiorna UI (rimuove highlight, aggiorna stato se necessario)
        } else {
            console.log("Target non valido.");
            addLogMessage("Non puoi bersagliare quella carta/zona.");
            // Potresti voler annullare la selezione se cliccano su un target non valido
            // cancelTargetSelection(); // Funzione opzionale da creare
        }
        return;
    }

    console.log(`Cliccato sulla carta in campo: ${cardData.nome} (ID: ${cardId}, Proprietario: ${ownerId})`);
    addLogMessage(`Cliccato su ${cardData.nome} sul campo.`);
    // Qui andrebbe logica per attacco o abilità attivate
}

function handleCardEffects(cardId, trigger, playerId) {
     const cardData = getCardData(cardId);
     const player = getPlayerState(playerId);
     const opponent = getOpponentState(playerId);
     if (!player || !opponent) return; // Sicurezza

     console.log(`Gestione effetto per ${cardData.nome}, trigger: ${trigger}, giocatore: ${playerId}`);
     if (trigger === 'onPlay') {
         switch (cardId) {
             case 'c003': // Esploratore Elfico
                if (player.deck.length > 0) { addLogMessage(`Esploratore Elfico: Guardi la prima carta del mazzo (${getCardData(player.deck[0]).nome}).`); }
                else { addLogMessage("Esploratore Elfico: Mazzo vuoto!"); }
                break;
             case 'm001': // Dardo Incantato
                 addLogMessage("Dardo Incantato: Seleziona un bersaglio per infliggere 1 danno.");
                 startTargetSelection({
                     action: 'dealDamage',
                     amount: 1,
                     sourceCardId: cardId,
                     filter: (targetElement) => targetElement.classList.contains('card'), // Filtro: Solo carte
                     callback: (targetElement) => {
                         const targetCardId = targetElement.dataset.cardId;
                         const targetCardData = getCardData(targetCardId);
                         const targetOwnerId = targetElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2;
                         // Logica danno non implementata - solo log
                         addLogMessage(`Dardo Incantato infligge 1 danno a ${targetCardData.nome}. (Effetto solo log)`);
                         console.log(`Dardo Incantato bersaglia ${targetCardData.nome} (ID: ${targetCardId}) del G${targetOwnerId}`);
                         // Qui andrebbe la logica per modificare HP della carta bersaglio (richiede di salvare HP in gameState.players[x].field)
                         // o del giocatore se si bersaglia il giocatore.
                     }
                 });
                 break;
             case 'm002': // Crescita Rigogliosa
                 if (player.maxResources < 10) { player.maxResources++; addLogMessage(`Crescita Rigogliosa: Ottieni 1 mana massimo (ora ${player.maxResources}).`); }
                 else { addLogMessage("Crescita Rigogliosa: Mana massimo già raggiunto."); }
                 break;
             case 'm003': // Pesca Miracolosa
                 addLogMessage("Pesca Miracolosa: Peschi 2 carte.");
                 drawCard(playerId); drawCard(playerId);
                 break;
         }
     }
      // Chiamiamo renderGame qui se l'effetto ha modificato direttamente lo stato visibile
      // che non sia già gestito dal renderGame chiamato dopo handleHandCardClick
      // Es: Se un effetto "onPlay" modifica HP o risorse, non serve un altro renderGame() qui
      // Ma se pesca carte (come m003), il renderGame successivo mostrerà la mano aggiornata.
      // Se un effetto richiede selezione target (m001), NON chiamare renderGame qui per non cancellare l'highlight.
      if (cardId !== 'm001' && cardId !== 'c003') { // Non rerenderizzare subito per effetti con target o solo log
           // renderGame(); // Spesso non necessario qui, dipende dall'effetto
      }
}

function startTargetSelection(selectionInfo) {
    console.log("Inizio selezione target:", selectionInfo);
    gameState.selectingTarget = selectionInfo;
    gameState.potentialTargets = [];
    clearHighlights(); // Pulisce eventuali highlight precedenti

    // Identifica tutti gli elementi potenzialmente bersagliabili (carte + forse giocatori)
    const allFieldCards = document.querySelectorAll('#field-player-1 .card, #field-player-2 .card');
    // Potresti aggiungere qui riferimenti alle aree info dei giocatori se bersagliabili

    allFieldCards.forEach(cardElement => {
        let isValid = true;
        // Applica filtro se specificato
        if (selectionInfo.filter && !selectionInfo.filter(cardElement)) {
            isValid = false;
        }
        // Aggiungi altre condizioni (es. non bersagliare carte con "Stealth" o "Shroud")

        if(isValid) {
            cardElement.classList.add('potential-target');
            gameState.potentialTargets.push(cardElement);
        }
    });

    // Aggiungere qui logica per evidenziare giocatori se bersagliabili

    if (gameState.potentialTargets.length > 0) {
         addLogMessage(`Seleziona un bersaglio per ${selectionInfo.action}.`);
         renderGame(); // Aggiorna per disabilitare bottone fine turno etc.
    } else {
        addLogMessage(`Nessun bersaglio valido per ${selectionInfo.action}.`);
        console.log("Nessun target valido trovato.");
        // Annulla l'azione se non ci sono target
        gameState.selectingTarget = null;
         // Se l'azione ha consumato risorse/messo la carta al cimitero, potrebbe servire logica di rollback
    }
}

function clearHighlights() {
    document.querySelectorAll('.potential-target').forEach(el => el.classList.remove('potential-target'));
}

// Funzione opzionale per annullare la selezione
function cancelTargetSelection() {
    if (gameState.selectingTarget) {
        console.log("Selezione target annullata.");
        addLogMessage("Azione annullata.");
        clearHighlights();
        // Qui potresti dover ripristinare risorse o rimettere la carta in mano se l'azione è stata annullata completamente
        gameState.selectingTarget = null;
        gameState.potentialTargets = [];
        renderGame(); // Aggiorna l'UI
    }
}


// ==================== 6. Logica Avversario (IA Semplice) ====================
function runOpponentTurn() {
    if (gameState.gameEnded || gameState.currentPlayerId !== 2) return;
    const player = getPlayerState(2);
    const opponent = getPlayerState(1);
    if (!player || !opponent) return;
    addLogMessage("Giocatore 2 (IA) sta agendo...");

    // Funzione helper IA per giocare carta
    const playCardAI = () => {
        let cardPlayed = false;
        // Ordina le carte giocabili per costo (decrescente) - IA leggermente meno stupida
        const playableCards = player.hand
            .map((id, index) => ({ id, index, data: getCardData(id) }))
            .filter(c => player.currentResources >= c.data.costo)
            .sort((a, b) => b.data.costo - a.data.costo); // Gioca prima le più costose

        if (playableCards.length > 0) {
            const cardToPlay = playableCards[0]; // Prende la più costosa giocabile
            player.currentResources -= cardToPlay.data.costo;
            player.hand.splice(cardToPlay.index, 1); // Rimuove dall'indice originale

            if (cardToPlay.data.forza !== null || cardToPlay.data.punti_ferita !== null) {
                player.field.push(cardToPlay.id);
                addLogMessage(`Giocatore 2 gioca ${cardToPlay.data.nome}.`);
                handleCardEffects(cardToPlay.id, 'onPlay', 2);
            } else {
                addLogMessage(`Giocatore 2 lancia ${cardToPlay.data.nome}.`);
                handleCardEffects(cardToPlay.id, 'onPlay', 2);
                player.graveyard.push(cardToPlay.id);
            }
            cardPlayed = true;
            renderGame();
        }
        return cardPlayed;
    };

    // Funzione helper IA per attaccare
    const attackAI = () => {
         let didAttack = false;
         // Trova tutte le creature che possono attaccare (qui assumiamo tutte quelle in campo)
         const attackers = player.field
             .map(id => getCardData(id))
             .filter(data => data.forza > 0);

        if (attackers.length > 0) {
             // IA stupida: attacca il giocatore con la prima creatura
             const attacker = attackers[0];
             const damage = attacker.forza;
             opponent.hp -= damage;
             addLogMessage(`${attacker.nome} (IA) attacca Giocatore 1 per ${damage} danni. HP G1: ${opponent.hp}`);
             didAttack = true;
             renderGame(); // Aggiorna dopo attacco
         }
         return didAttack;
    };

    // Esecuzione azioni IA con piccoli ritardi tra le fasi
    setTimeout(() => {
        if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; // Ricontrolla
        const played = playCardAI();
        if (!played) addLogMessage("Giocatore 2 non gioca carte.");

        setTimeout(() => {
            if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; // Ricontrolla
            const attacked = attackAI();
             if (!attacked && player.field.some(id => getCardData(id).forza > 0)) {
                 addLogMessage("Le creature del Giocatore 2 non attaccano questo turno.");
             }

            // Fine turno IA
            setTimeout(() => {
                if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; // Ricontrolla
                console.log("Giocatore 2 (IA) termina il turno.");
                addLogMessage("Giocatore 2 termina il suo turno.");
                 // Passa il turno solo se il gioco non è finito durante le azioni IA
                if (!gameState.gameEnded) {
                     startTurn(1);
                }
            }, 700); // Ritardo prima di passare

        }, 800); // Ritardo dopo aver giocato carta

    }, 500); // Ritardo iniziale prima di giocare carta
}


// ==================== 7. Gestione Modale ====================
function openModal(title, cardIds) {
    modalTitle.textContent = title;
    modalBody.innerHTML = '';
    if (cardIds.length === 0) { modalBody.innerHTML = '<p>Nessuna carta in questa zona.</p>'; }
    else {
        cardIds.forEach(cardId => {
            const cardElement = renderCard(cardId, 'modal');
            // Stile opzionale per carte nel modale
             cardElement.style.width = '90px'; cardElement.style.height = '130px'; cardElement.style.fontSize = '0.8em'; cardElement.style.cursor = 'default';
             // Rimuovi effetto hover nel modale (se presente nel CSS)
             cardElement.style.borderColor = '#888'; cardElement.style.boxShadow = 'none';
            modalBody.appendChild(cardElement);
        });
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    modalBody.innerHTML = '';
}

function handleGraveyardClick(event) {
    if (gameState.gameEnded) return;
    const targetId = event.currentTarget.id;
    const playerId = targetId.includes('player-1') ? 1 : 2;
    const player = getPlayerState(playerId);
    if (!player) return;
    console.log(`Visualizza cimitero Giocatore ${playerId}`);
    openModal(`Cimitero Giocatore ${playerId}`, player.graveyard);
}


// ==================== 8. Inizializzazione Event Listener ====================
function addEventListeners() {
    endTurnButton.addEventListener('click', handleEndTurnClick);
    player1Graveyard.addEventListener('click', handleGraveyardClick);
    const player2Graveyard = document.getElementById('graveyard-player-2');
    if (player2Graveyard) { player2Graveyard.addEventListener('click', handleGraveyardClick); }
    else { console.error("Elemento Cimitero Giocatore 2 non trovato"); }
    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) { closeModal(); } });

    // Aggiungere listener per annullare selezione target (es. click destro)
     document.addEventListener('contextmenu', (event) => {
         if (gameState.selectingTarget) {
             event.preventDefault(); // Impedisce menu contestuale
             cancelTargetSelection();
         }
     });
}


// ==================== 9. Inizializzazione Gioco ====================
function initGame() {
    console.log("Inizializzazione gioco...");
    addLogMessage("Benvenuto nel Test LCG!");
    const startingDeckP1 = ["c001", "c001", "c002", "c003", "c004", "c004", "m001", "m001", "m003", "c005", "c001", "c002", "c004", "m001", "m003"];
    const startingDeckP2 = ["c001", "c002", "c002", "c003", "c004", "c005", "c005", "m001", "m002", "m003", "c001", "c003", "c004", "m002", "m001"];
    gameState = {
        currentPlayerId: 1, turnNumber: 1,
        players: [
            { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [...startingDeckP1], hand: [], field: [], graveyard: [] },
            { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [...startingDeckP2], hand: [], field: [], graveyard: [] }
        ],
        gameEnded: false, winner: null, selectingTarget: null, potentialTargets: []
    };
    shuffleArray(gameState.players[0].deck); shuffleArray(gameState.players[1].deck);
    console.log("Mazzi mescolati.");
    const initialHandSize = 3;
    for (let i = 0; i < initialHandSize; i++) {
         if(gameState.players[0].deck.length > 0) gameState.players[0].hand.push(gameState.players[0].deck.shift());
         if(gameState.players[1].deck.length > 0) gameState.players[1].hand.push(gameState.players[1].deck.shift());
    }
    console.log("Mani iniziali pescate.");
    addEventListeners(); // Aggiunge listener PRIMA di avviare il primo turno
    startTurn(1); // Avvia il primo turno
}

function endGame(winnerId) {
    if (gameState.gameEnded) return;
    gameState.gameEnded = true; gameState.winner = winnerId;
    gameState.selectingTarget = null; gameState.potentialTargets = [];
    clearHighlights(); // Assicurati che gli highlight siano rimossi
    addLogMessage(`Partita terminata! Giocatore ${winnerId} ha vinto!`);
    console.log(`Partita terminata! Vincitore: Giocatore ${winnerId}`);
    renderGame(); // Renderizza lo stato finale (bottoni disabilitati, etc)
    // Rimuovi listener dalle carte ora che il gioco è finito (opzionale, ma pulito)
    document.querySelectorAll('.card').forEach(card => {
        const clone = card.cloneNode(true); // Clona per rimuovere listener
        card.parentNode.replaceChild(clone, card);
    });
    setTimeout(() => alert(`Partita terminata! Giocatore ${winnerId} ha vinto!`), 100);
}

// ==================== Avvio ====================
document.addEventListener('DOMContentLoaded', initGame);