// File: game.js
// Logica principale del gioco e interazione con l'interfaccia
// (Versione con gestione immagine mancante migliorata e fix Cimitero 2)

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
 * Gestisce l'immagine mancante usando metodi DOM.
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

    // Elementi interni della carta
    const cardName = document.createElement('div');
    cardName.classList.add('card-name');
    cardName.textContent = cardData.nome;

    const cardCost = document.createElement('div');
    cardCost.classList.add('card-cost');
    cardCost.textContent = cardData.costo;

    const cardArt = document.createElement('div');
    cardArt.classList.add('card-art');

    const cardAbility = document.createElement('div');
    cardAbility.classList.add('card-ability');
    cardAbility.style.display = 'none'; // Nascosta di default
    cardAbility.textContent = cardData.abilita;

    // Aggiunge gli elementi base al div della carta
    cardDiv.appendChild(cardName);
    cardDiv.appendChild(cardCost);
    cardDiv.appendChild(cardArt); // Aggiunge il contenitore per l'arte/testo
    cardDiv.appendChild(cardAbility); // Aggiunge abilita nascosta

    // Aggiunge statistiche se presenti
    if (cardData.forza !== null || cardData.punti_ferita !== null) {
        const cardStats = document.createElement('div');
        cardStats.classList.add('card-stats');
        const forzaSpan = document.createElement('span');
        forzaSpan.textContent = cardData.forza !== null ? cardData.forza : '-';
        const pfSpan = document.createElement('span');
        pfSpan.textContent = cardData.punti_ferita !== null ? cardData.punti_ferita : '-';
        cardStats.appendChild(forzaSpan);
        cardStats.appendChild(pfSpan);
        cardDiv.appendChild(cardStats); // Aggiunge le stats alla fine
    }

    // Imposta il tooltip per l'abilità (se presente)
    if(cardData.abilita) {
        let tooltipText = `${cardData.nome} (${cardData.costo})\n`;
        if (cardData.forza !== null) tooltipText += ` F: ${cardData.forza}`;
        if (cardData.punti_ferita !== null) tooltipText += ` PF: ${cardData.punti_ferita}`;
        tooltipText += `\nAbilità: ${cardData.abilita}`;
        cardDiv.title = tooltipText;
    }

    // --- Gestione Immagine / Testo Alternativo (agisce sull'elemento cardArt) ---
    const setFallbackText = () => {
        cardArt.textContent = 'Immagine non disponibile';
        cardArt.style.display = 'flex';
        cardArt.style.alignItems = 'center';
        cardArt.style.justifyContent = 'center';
        cardArt.style.textAlign = 'center';
        cardArt.style.fontSize = '0.8em'; // O regola come preferisci
        cardArt.style.color = '#ccc';
        cardArt.style.backgroundImage = 'none'; // Assicurati che non ci sia sfondo
    };

    if (cardData.illustrazione) {
        const img = new Image();
        img.onload = () => {
            cardArt.style.backgroundImage = `url('${cardData.illustrazione}')`;
            cardArt.textContent = ''; // Rimuovi testo se l'immagine carica
             // Resetta stili specifici del testo di fallback, se necessario
             cardArt.style.display = ''; // Torna al default del CSS
             cardArt.style.alignItems = '';
             cardArt.style.justifyContent = '';
             // etc.
        };
        img.onerror = () => {
            console.log(`Errore caricamento immagine: ${cardData.illustrazione}`); // Log per conferma
            setFallbackText(); // Mostra testo alternativo
        };
        img.src = cardData.illustrazione;
    } else {
        setFallbackText(); // Mostra testo alternativo se non c'è URL
    }
    // --- Fine Gestione Immagine ---


    // --- Event listener specifici per posizione ---
    if (!gameState.gameEnded) {
        if (location === 'hand' && gameState.currentPlayerId === 1 && getPlayerState(1)?.hand.includes(cardId)) {
            cardDiv.addEventListener('click', handleHandCardClick);
        } else if (location === 'field') {
            cardDiv.addEventListener('click', handleFieldCardClick);
        }
    }
    // --- Fine event listener ---

    return cardDiv;
}


// --- Funzioni di rendering rimanenti (renderHand, renderField, etc.) ---
// Queste funzioni rimangono invariate, useranno la nuova renderCard

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
    endTurnButton.disabled = gameState.gameEnded || gameState.currentPlayerId !== 1 || !!gameState.selectingTarget;

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
// (startTurn, drawCard, handleEndTurnClick, handleHandCardClick, handleFieldCardClick, handleCardEffects, startTargetSelection, clearHighlights, cancelTargetSelection)
// --- Nessuna modifica necessaria in questa sezione rispetto alla versione precedente ---
function startTurn(playerId) { if (gameState.gameEnded) return; console.log(`Inizio turno ${gameState.turnNumber} per Giocatore ${playerId}`); addLogMessage(`Inizio turno per Giocatore ${playerId}.`); gameState.currentPlayerId = playerId; const player = getPlayerState(playerId); if (!player) return; if (player.maxResources < 10) { player.maxResources++; } player.currentResources = player.maxResources; drawCard(playerId); renderGame(); if (playerId === 2) { endTurnButton.disabled = true; addLogMessage("Giocatore 2 sta pensando..."); setTimeout(runOpponentTurn, 1500); } else { endTurnButton.disabled = !!gameState.selectingTarget; } }
function drawCard(playerId) { const player = getPlayerState(playerId); if (!player || gameState.gameEnded) return; if (player.deck.length > 0) { const drawnCardId = player.deck.shift(); player.hand.push(drawnCardId); addLogMessage(`Giocatore ${playerId} pesca una carta.`); console.log(`Giocatore ${playerId} pesca ${drawnCardId}`); } else { player.hp -= 1; addLogMessage(`Giocatore ${playerId} ha finito le carte e subisce 1 danno da fatica! HP: ${player.hp}`); console.warn(`Giocatore ${playerId} ha tentato di pescare da un mazzo vuoto.`); } }
function handleEndTurnClick() { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) { console.warn("Impossibile passare il turno ora."); return; } console.log("Giocatore 1 passa il turno."); addLogMessage("Giocatore 1 termina il suo turno."); gameState.turnNumber++; startTurn(2); }
function handleHandCardClick(event) { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) return; const cardElement = event.currentTarget; const cardId = cardElement.dataset.cardId; const cardData = getCardData(cardId); const player = getPlayerState(1); if (!player) return; console.log(`Cliccato sulla carta in mano: ${cardData.nome} (ID: ${cardId})`); if (player.currentResources >= cardData.costo) { player.currentResources -= cardData.costo; const cardIndex = player.hand.indexOf(cardId); if (cardIndex > -1) { player.hand.splice(cardIndex, 1); } else { console.error("Carta cliccata non trovata nella mano!", cardId, player.hand); player.currentResources += cardData.costo; return; } if (cardData.forza !== null || cardData.punti_ferita !== null) { player.field.push(cardId); addLogMessage(`Giocatore 1 gioca ${cardData.nome}.`); handleCardEffects(cardId, 'onPlay', 1); } else { addLogMessage(`Giocatore 1 lancia ${cardData.nome}.`); handleCardEffects(cardId, 'onPlay', 1); player.graveyard.push(cardId); } renderGame(); } else { addLogMessage(`Risorse insufficienti per giocare ${cardData.nome} (costa ${cardData.costo}, hai ${player.currentResources}).`); console.log("Risorse insufficienti."); } }
function handleFieldCardClick(event) { if (gameState.gameEnded) return; const cardElement = event.currentTarget; const cardId = cardElement.dataset.cardId; const cardData = getCardData(cardId); const ownerId = cardElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2; if (gameState.selectingTarget) { if (gameState.potentialTargets.includes(cardElement)) { console.log(`Target selezionato: ${cardData.nome} (ID: ${cardId})`); gameState.selectingTarget.callback(cardElement); gameState.selectingTarget = null; gameState.potentialTargets = []; clearHighlights(); renderGame(); } else { console.log("Target non valido."); addLogMessage("Non puoi bersagliare quella carta/zona."); } return; } console.log(`Cliccato sulla carta in campo: ${cardData.nome} (ID: ${cardId}, Proprietario: ${ownerId})`); addLogMessage(`Cliccato su ${cardData.nome} sul campo.`); }
function handleCardEffects(cardId, trigger, playerId) { const cardData = getCardData(cardId); const player = getPlayerState(playerId); const opponent = getOpponentState(playerId); if (!player || !opponent) return; console.log(`Gestione effetto per ${cardData.nome}, trigger: ${trigger}, giocatore: ${playerId}`); if (trigger === 'onPlay') { switch (cardId) { case 'c003': if (player.deck.length > 0) { addLogMessage(`Esploratore Elfico: Guardi la prima carta del mazzo (${getCardData(player.deck[0]).nome}).`); } else { addLogMessage("Esploratore Elfico: Mazzo vuoto!"); } break; case 'm001': addLogMessage("Dardo Incantato: Seleziona un bersaglio per infliggere 1 danno."); startTargetSelection({ action: 'dealDamage', amount: 1, sourceCardId: cardId, filter: (targetElement) => targetElement.classList.contains('card'), callback: (targetElement) => { const targetCardId = targetElement.dataset.cardId; const targetCardData = getCardData(targetCardId); const targetOwnerId = targetElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2; addLogMessage(`Dardo Incantato infligge 1 danno a ${targetCardData.nome}. (Effetto solo log)`); console.log(`Dardo Incantato bersaglia ${targetCardData.nome} (ID: ${targetCardId}) del G${targetOwnerId}`); } }); break; case 'm002': if (player.maxResources < 10) { player.maxResources++; addLogMessage(`Crescita Rigogliosa: Ottieni 1 mana massimo (ora ${player.maxResources}).`); } else { addLogMessage("Crescita Rigogliosa: Mana massimo già raggiunto."); } break; case 'm003': addLogMessage("Pesca Miracolosa: Peschi 2 carte."); drawCard(playerId); drawCard(playerId); break; } } }
function startTargetSelection(selectionInfo) { console.log("Inizio selezione target:", selectionInfo); gameState.selectingTarget = selectionInfo; gameState.potentialTargets = []; clearHighlights(); const allFieldCards = document.querySelectorAll('#field-player-1 .card, #field-player-2 .card'); allFieldCards.forEach(cardElement => { let isValid = true; if (selectionInfo.filter && !selectionInfo.filter(cardElement)) { isValid = false; } if(isValid) { cardElement.classList.add('potential-target'); gameState.potentialTargets.push(cardElement); } }); if (gameState.potentialTargets.length > 0) { addLogMessage(`Seleziona un bersaglio per ${selectionInfo.action}.`); renderGame(); } else { addLogMessage(`Nessun bersaglio valido per ${selectionInfo.action}.`); console.log("Nessun target valido trovato."); gameState.selectingTarget = null; } }
function clearHighlights() { document.querySelectorAll('.potential-target').forEach(el => el.classList.remove('potential-target')); }
function cancelTargetSelection() { if (gameState.selectingTarget) { console.log("Selezione target annullata."); addLogMessage("Azione annullata."); clearHighlights(); gameState.selectingTarget = null; gameState.potentialTargets = []; renderGame(); } }


// ==================== 6. Logica Avversario (IA Semplice) ====================
// --- Nessuna modifica necessaria rispetto alla versione precedente ---
function runOpponentTurn() { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const player = getPlayerState(2); const opponent = getPlayerState(1); if (!player || !opponent) return; addLogMessage("Giocatore 2 (IA) sta agendo..."); const playCardAI = () => { let cardPlayed = false; const playableCards = player.hand .map((id, index) => ({ id, index, data: getCardData(id) })) .filter(c => player.currentResources >= c.data.costo) .sort((a, b) => b.data.costo - a.data.costo); if (playableCards.length > 0) { const cardToPlay = playableCards[0]; player.currentResources -= cardToPlay.data.costo; player.hand.splice(cardToPlay.index, 1); if (cardToPlay.data.forza !== null || cardToPlay.data.punti_ferita !== null) { player.field.push(cardToPlay.id); addLogMessage(`Giocatore 2 gioca ${cardToPlay.data.nome}.`); handleCardEffects(cardToPlay.id, 'onPlay', 2); } else { addLogMessage(`Giocatore 2 lancia ${cardToPlay.data.nome}.`); handleCardEffects(cardToPlay.id, 'onPlay', 2); player.graveyard.push(cardToPlay.id); } cardPlayed = true; renderGame(); } return cardPlayed; }; const attackAI = () => { let didAttack = false; const attackers = player.field .map(id => getCardData(id)) .filter(data => data.forza > 0); if (attackers.length > 0) { const attacker = attackers[0]; const damage = attacker.forza; opponent.hp -= damage; addLogMessage(`${attacker.nome} (IA) attacca Giocatore 1 per ${damage} danni. HP G1: ${opponent.hp}`); didAttack = true; renderGame(); } return didAttack; }; setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const played = playCardAI(); if (!played) addLogMessage("Giocatore 2 non gioca carte."); setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const attacked = attackAI(); if (!attacked && player.field.some(id => getCardData(id).forza > 0)) { addLogMessage("Le creature del Giocatore 2 non attaccano questo turno."); } setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; console.log("Giocatore 2 (IA) termina il turno."); addLogMessage("Giocatore 2 termina il suo turno."); if (!gameState.gameEnded) { startTurn(1); } }, 700); }, 800); }, 500); }


// ==================== 7. Gestione Modale ====================
// --- Nessuna modifica necessaria rispetto alla versione precedente ---
function openModal(title, cardIds) { modalTitle.textContent = title; modalBody.innerHTML = ''; if (cardIds.length === 0) { modalBody.innerHTML = '<p>Nessuna carta in questa zona.</p>'; } else { cardIds.forEach(cardId => { const cardElement = renderCard(cardId, 'modal'); cardElement.style.width = '90px'; cardElement.style.height = '130px'; cardElement.style.fontSize = '0.8em'; cardElement.style.cursor = 'default'; cardElement.style.borderColor = '#888'; cardElement.style.boxShadow = 'none'; modalBody.appendChild(cardElement); }); } modal.classList.add('active'); }
function closeModal() { modal.classList.remove('active'); modalBody.innerHTML = ''; }
function handleGraveyardClick(event) { if (gameState.gameEnded) return; const targetId = event.currentTarget.id; const playerId = targetId.includes('player-1') ? 1 : 2; const player = getPlayerState(playerId); if (!player) return; console.log(`Visualizza cimitero Giocatore ${playerId}`); openModal(`Cimitero Giocatore ${playerId}`, player.graveyard); }


// ==================== 8. Inizializzazione Event Listener ====================
function addEventListeners() {
    endTurnButton.addEventListener('click', handleEndTurnClick);
    player1Graveyard.addEventListener('click', handleGraveyardClick);

    // CORREZIONE: Controlla se l'elemento esiste prima di aggiungere il listener
    const player2GraveyardElement = document.getElementById('graveyard-player-2');
    if (player2GraveyardElement) {
        // Se l'elemento ESISTE (improbabile con l'HTML attuale, ma per sicurezza)
        player2GraveyardElement.addEventListener('click', handleGraveyardClick);
    } else {
        // Se non esiste, logga un avviso invece di un errore bloccante
        console.warn("Elemento cliccabile per Cimitero Giocatore 2 (ID: graveyard-player-2) non trovato nell'HTML. Nessun listener aggiunto.");
    }

    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) { closeModal(); } });
    document.addEventListener('contextmenu', (event) => { if (gameState.selectingTarget) { event.preventDefault(); cancelTargetSelection(); } });
}


// ==================== 9. Inizializzazione Gioco ====================
// --- Nessuna modifica necessaria rispetto alla versione precedente ---
function initGame() { console.log("Inizializzazione gioco..."); addLogMessage("Benvenuto nel Test LCG!"); const startingDeckP1 = ["c001", "c001", "c002", "c003", "c004", "c004", "m001", "m001", "m003", "c005", "c001", "c002", "c004", "m001", "m003"]; const startingDeckP2 = ["c001", "c002", "c002", "c003", "c004", "c005", "c005", "m001", "m002", "m003", "c001", "c003", "c004", "m002", "m001"]; gameState = { currentPlayerId: 1, turnNumber: 1, players: [ { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [...startingDeckP1], hand: [], field: [], graveyard: [] }, { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [...startingDeckP2], hand: [], field: [], graveyard: [] } ], gameEnded: false, winner: null, selectingTarget: null, potentialTargets: [] }; shuffleArray(gameState.players[0].deck); shuffleArray(gameState.players[1].deck); console.log("Mazzi mescolati."); const initialHandSize = 3; for (let i = 0; i < initialHandSize; i++) { if(gameState.players[0].deck.length > 0) gameState.players[0].hand.push(gameState.players[0].deck.shift()); if(gameState.players[1].deck.length > 0) gameState.players[1].hand.push(gameState.players[1].deck.shift()); } console.log("Mani iniziali pescate."); addEventListeners(); startTurn(1); }

function endGame(winnerId) { if (gameState.gameEnded) return; gameState.gameEnded = true; gameState.winner = winnerId; gameState.selectingTarget = null; gameState.potentialTargets = []; clearHighlights(); addLogMessage(`Partita terminata! Giocatore ${winnerId} ha vinto!`); console.log(`Partita terminata! Vincitore: Giocatore ${winnerId}`); renderGame(); document.querySelectorAll('.card').forEach(card => { const clone = card.cloneNode(true); card.parentNode.replaceChild(clone, card); }); setTimeout(() => alert(`Partita terminata! Giocatore ${winnerId} ha vinto!`), 100); }

// ==================== Avvio ====================
document.addEventListener('DOMContentLoaded', initGame);