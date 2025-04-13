// File: game.js
// Logica principale del gioco e interazione con l'interfaccia
// (Versione con annullamento selezione target migliorato)

// ==================== 1. Riferimenti Elementi DOM ====================
const turnIndicator = document.getElementById('turn-indicator');
const endTurnButton = document.getElementById('end-turn-button');
// Giocatore 1
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
// Giocatore 2
const player2Info = document.getElementById('info-player-2');
const player2Hp = document.getElementById('hp-player-2');
const player2Res = document.getElementById('res-player-2');
const player2MaxRes = document.getElementById('max-res-player-2');
const player2DeckCount = document.getElementById('deck-count-2');
const player2GraveyardCount = document.getElementById('graveyard-count-2');
const player2GraveyardDisplay = document.getElementById('graveyard-count-2-display');
const player2GraveyardClickable = document.getElementById('graveyard-info-player-2');
const player2Hand = document.getElementById('hand-player-2');
const player2Field = document.getElementById('field-player-2');
const player2Area = document.getElementById('player-area-2');
// Modale Cimitero
const graveyardModal = document.getElementById('graveyard-modal');
const graveyardModalTitle = document.getElementById('modal-title-graveyard');
const graveyardModalBody = document.getElementById('modal-body-graveyard');
// Modale Log
const logModal = document.getElementById('log-modal');
const logModalTitle = document.getElementById('modal-title-log');
const logModalBody = document.getElementById('modal-body-log');
const showLogButton = document.getElementById('show-log-button');
// Bottoni chiusura (collezione)
const closeButtons = document.querySelectorAll('.close-button');
// Collezione di tutti i modali per listener click esterno
const modals = document.querySelectorAll('.modal');


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
    selectingTarget: null, // Info per l'azione di targeting { action, sourceCardId, filter, callback }
    potentialTargets: [],
    pendingActionInfo: null // Info per annullare { type, cardId, originalHandIndex, costPaid }
};


// ==================== 3. Funzioni Utilità ====================
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }
function addLogMessage(message) { if (!logModalBody) { console.error("Elemento corpo modale log non trovato!"); return; } const p = document.createElement('p'); const now = new Date(); const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`; p.innerHTML = `<span style="color: #888;">[${timeString} T:${gameState.turnNumber}]</span> ${message}`; logModalBody.appendChild(p); logModalBody.scrollTop = logModalBody.scrollHeight; }
function getPlayerState(playerId) { return gameState.players.find(p => p.id === playerId) || null; }
function getOpponentState(currentPlayerId) { const opponentId = currentPlayerId === 1 ? 2 : 1; return getPlayerState(opponentId); }
// function getCardData(cardId) { ... } // Da cards.js


// ==================== 4. Funzioni di Rendering ====================
function renderCard(cardId, location = 'hand') { const cardData = getCardData(cardId); const cardDiv = document.createElement('div'); cardDiv.classList.add('card'); cardDiv.dataset.cardId = cardId; cardDiv.dataset.location = location; const cardName = document.createElement('div'); cardName.classList.add('card-name'); cardName.textContent = cardData.nome; const cardCost = document.createElement('div'); cardCost.classList.add('card-cost'); cardCost.textContent = cardData.costo; const cardArt = document.createElement('div'); cardArt.classList.add('card-art'); const cardAbility = document.createElement('div'); cardAbility.classList.add('card-ability'); cardAbility.style.display = 'none'; cardAbility.textContent = cardData.abilita; cardDiv.appendChild(cardName); cardDiv.appendChild(cardCost); cardDiv.appendChild(cardArt); cardDiv.appendChild(cardAbility); if (cardData.forza !== null || cardData.punti_ferita !== null) { const cardStats = document.createElement('div'); cardStats.classList.add('card-stats'); const forzaSpan = document.createElement('span'); forzaSpan.textContent = cardData.forza !== null ? cardData.forza : '-'; const pfSpan = document.createElement('span'); pfSpan.textContent = cardData.punti_ferita !== null ? cardData.punti_ferita : '-'; cardStats.appendChild(forzaSpan); cardStats.appendChild(pfSpan); cardDiv.appendChild(cardStats); } if(cardData.abilita) { let tooltipText = `${cardData.nome} (${cardData.costo})\n`; if (cardData.forza !== null) tooltipText += ` F: ${cardData.forza}`; if (cardData.punti_ferita !== null) tooltipText += ` PF: ${cardData.punti_ferita}`; tooltipText += `\nAbilità: ${cardData.abilita}`; cardDiv.title = tooltipText; } const setFallbackText = () => { cardArt.textContent = 'Immagine non disponibile'; cardArt.style.display = 'flex'; cardArt.style.alignItems = 'center'; cardArt.style.justifyContent = 'center'; cardArt.style.textAlign = 'center'; cardArt.style.fontSize = '0.9em'; cardArt.style.color = '#ccc'; cardArt.style.backgroundImage = 'none'; }; if (cardData.illustrazione) { const img = new Image(); img.onload = () => { cardArt.style.backgroundImage = `url('${cardData.illustrazione}')`; cardArt.textContent = ''; cardArt.style.display = ''; cardArt.style.alignItems = ''; cardArt.style.justifyContent = ''; }; img.onerror = () => { /* console.log(`Errore caricamento immagine: ${cardData.illustrazione}`); */ setFallbackText(); }; img.src = cardData.illustrazione; } else { setFallbackText(); } if (!gameState.gameEnded) { if (location === 'hand' && gameState.currentPlayerId === 1 && getPlayerState(1)?.hand.includes(cardId)) { cardDiv.addEventListener('click', handleHandCardClick); } else if (location === 'field') { cardDiv.addEventListener('click', handleFieldCardClick); } } return cardDiv; }
function renderHand(playerId) { const playerState = getPlayerState(playerId); const handElement = (playerId === 1) ? player1Hand : player2Hand; handElement.innerHTML = ''; if (playerId === 1) { playerState.hand.forEach(cardId => { const cardElement = renderCard(cardId, 'hand'); handElement.appendChild(cardElement); }); } else { for (let i = 0; i < playerState.hand.length; i++) { const placeholder = document.createElement('div'); placeholder.classList.add('card-placeholder'); placeholder.title = "Carta avversaria"; handElement.appendChild(placeholder); } } }
function renderField(playerId) { const playerState = getPlayerState(playerId); const fieldElement = (playerId === 1) ? player1Field : player2Field; fieldElement.innerHTML = ''; playerState.field.forEach(cardIdOrObject => { const cardId = (typeof cardIdOrObject === 'string') ? cardIdOrObject : cardIdOrObject.id; const cardElement = renderCard(cardId, 'field'); fieldElement.appendChild(cardElement); }); }
function renderPlayerInfo(playerId) { const playerState = getPlayerState(playerId); if (!playerState) return; if (playerId === 1) { player1Hp.textContent = playerState.hp; player1Res.textContent = playerState.currentResources; player1MaxRes.textContent = playerState.maxResources; player1DeckCount.textContent = playerState.deck.length; player1GraveyardCount.textContent = playerState.graveyard.length; } else { player2Hp.textContent = playerState.hp; player2Res.textContent = playerState.currentResources; player2MaxRes.textContent = playerState.maxResources; player2DeckCount.textContent = playerState.deck.length; player2GraveyardCount.textContent = playerState.graveyard.length; if(player2GraveyardDisplay) player2GraveyardDisplay.textContent = playerState.graveyard.length; } }
function renderGame() { renderPlayerInfo(1); renderPlayerInfo(2); renderHand(1); renderHand(2); renderField(1); renderField(2); turnIndicator.textContent = gameState.currentPlayerId; endTurnButton.disabled = gameState.gameEnded || gameState.currentPlayerId !== 1 || !!gameState.selectingTarget; if (!gameState.gameEnded && gameState.currentPlayerId === 1) { player1Area.classList.add('active-turn'); player2Area.classList.remove('active-turn'); player1Deck.style.cursor = 'default'; player1Deck.title = `Mazzo (${getPlayerState(1)?.deck.length || 0} carte)`; } else if (!gameState.gameEnded && gameState.currentPlayerId === 2) { player1Area.classList.remove('active-turn'); player2Area.classList.add('active-turn'); player1Deck.style.cursor = 'default'; player1Deck.title = `Mazzo (${getPlayerState(1)?.deck.length || 0} carte)`; } else { player1Area.classList.remove('active-turn'); player2Area.classList.remove('active-turn'); player1Deck.style.cursor = 'default'; } const player1 = getPlayerState(1); const player2 = getPlayerState(2); if (!gameState.gameEnded && player1 && (player1.hp <= 0 || (player1.deck.length === 0 && player1.hand.length === 0 && player1.field.length === 0))) { endGame(2); } else if (!gameState.gameEnded && player2 && (player2.hp <= 0 || (player2.deck.length === 0 && player2.hand.length === 0 && player2.field.length === 0))) { endGame(1); } if (!gameState.selectingTarget) { clearHighlights(); } }


// ==================== 5. Logica Azioni di Gioco ====================
function startTurn(playerId) { if (gameState.gameEnded) return; console.log(`Inizio turno ${gameState.turnNumber} per Giocatore ${playerId}`); addLogMessage(`Inizio turno per Giocatore ${playerId}.`); gameState.currentPlayerId = playerId; const player = getPlayerState(playerId); if (!player) return; if (player.maxResources < 10) { player.maxResources++; } player.currentResources = player.maxResources; drawCard(playerId); renderGame(); if (playerId === 2) { endTurnButton.disabled = true; addLogMessage("Giocatore 2 sta pensando..."); setTimeout(runOpponentTurn, 1500); } else { endTurnButton.disabled = !!gameState.selectingTarget; } }
function drawCard(playerId) { const player = getPlayerState(playerId); if (!player || gameState.gameEnded) return; if (player.deck.length > 0) { const drawnCardId = player.deck.shift(); player.hand.push(drawnCardId); addLogMessage(`Giocatore ${playerId} pesca una carta.`); console.log(`Giocatore ${playerId} pesca ${drawnCardId}`); } else { player.hp -= 1; addLogMessage(`Giocatore ${playerId} ha finito le carte e subisce 1 danno da fatica! HP: ${player.hp}`); console.warn(`Giocatore ${playerId} ha tentato di pescare da un mazzo vuoto.`); } }
function handleEndTurnClick() { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) { console.warn("Impossibile passare il turno ora."); return; } console.log("Giocatore 1 passa il turno."); addLogMessage("Giocatore 1 termina il suo turno."); gameState.turnNumber++; startTurn(2); }
function handleHandCardClick(event) { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) return; const cardElement = event.currentTarget; const cardId = cardElement.dataset.cardId; const cardData = getCardData(cardId); const player = getPlayerState(1); if (!player) return; console.log(`Tentativo di giocare: ${cardData.nome} (ID: ${cardId})`); if (player.currentResources >= cardData.costo) { const requiresTarget = (cardId === 'm001'); if (requiresTarget) { console.log(`${cardData.nome} richiede un bersaglio.`); addLogMessage(`${cardData.nome}: Seleziona un bersaglio.`); player.currentResources -= cardData.costo; const cardIndex = player.hand.indexOf(cardId); if (cardIndex > -1) { player.hand.splice(cardIndex, 1); } else { console.error("Carta cliccata non trovata nella mano!", cardId, player.hand); player.currentResources += cardData.costo; return; } gameState.pendingActionInfo = { type: 'playCardFromHand', cardId: cardId, originalHandIndex: cardIndex, costPaid: cardData.costo }; console.log("Info per annullamento salvate:", gameState.pendingActionInfo); startTargetSelection({ action: cardData.abilita, sourceCardId: cardId, filter: (targetElement) => targetElement.classList.contains('card'), callback: (targetElement) => { console.log(`Target ${targetElement.dataset.cardId} selezionato per ${cardId}. Azione completata.`); const effectTargetCardId = targetElement.dataset.cardId; const effectTargetCardData = getCardData(effectTargetCardId); const effectTargetOwnerId = targetElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2; addLogMessage(`${cardData.nome} infligge 1 danno a ${effectTargetCardData.nome}. (Effetto solo log)`); console.log(`${cardData.nome} bersaglia ${effectTargetCardData.nome} (ID: ${effectTargetCardId}) del G${effectTargetOwnerId}`); const sourcePlayer = getPlayerState(1); if(sourcePlayer) { sourcePlayer.graveyard.push(cardId); } gameState.pendingActionInfo = null; gameState.selectingTarget = null; gameState.potentialTargets = []; clearHighlights(); renderGame(); } }); renderGame(); } else { console.log(`${cardData.nome} non richiede bersaglio. Azione immediata.`); player.currentResources -= cardData.costo; const cardIndex = player.hand.indexOf(cardId); if (cardIndex > -1) { player.hand.splice(cardIndex, 1); } else { console.error("Carta cliccata non trovata nella mano!", cardId, player.hand); player.currentResources += cardData.costo; return; } if (cardData.forza !== null || cardData.punti_ferita !== null) { player.field.push(cardId); addLogMessage(`Giocatore 1 gioca ${cardData.nome}.`); handleCardEffects(cardId, 'onPlay', 1); } else { addLogMessage(`Giocatore 1 lancia ${cardData.nome}.`); handleCardEffects(cardId, 'onPlay', 1); player.graveyard.push(cardId); } renderGame(); } } else { addLogMessage(`Risorse insufficienti per giocare ${cardData.nome} (costa ${cardData.costo}, hai ${player.currentResources}).`); console.log("Risorse insufficienti."); } }
function handleFieldCardClick(event) { if (gameState.gameEnded) return; const cardElement = event.currentTarget; const cardId = cardElement.dataset.cardId; const cardData = getCardData(cardId); const ownerId = cardElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2; if (gameState.selectingTarget) { if (gameState.potentialTargets.includes(cardElement)) { console.log(`Target valido selezionato: ${cardData.nome} (ID: ${cardId})`); gameState.selectingTarget.callback(cardElement); } else { console.log("Target non valido cliccato."); addLogMessage("Bersaglio non valido."); } return; } console.log(`Cliccato sulla carta in campo: ${cardData.nome} (ID: ${cardId}, Proprietario: ${ownerId})`); addLogMessage(`Cliccato su ${cardData.nome} sul campo.`); }
function handleCardEffects(cardId, trigger, playerId) { const cardData = getCardData(cardId); const player = getPlayerState(playerId); const opponent = getOpponentState(playerId); if (!player || !opponent) return; console.log(`Gestione effetto per ${cardData.nome}, trigger: ${trigger}, giocatore: ${playerId}`); if (trigger === 'onPlay') { switch (cardId) { case 'c003': if (player.deck.length > 0) { addLogMessage(`Esploratore Elfico: Guardi la prima carta del mazzo (${getCardData(player.deck[0]).nome}).`); } else { addLogMessage("Esploratore Elfico: Mazzo vuoto!"); } break; case 'm002': if (player.maxResources < 10) { player.maxResources++; addLogMessage(`Crescita Rigogliosa: Ottieni 1 mana massimo (ora ${player.maxResources}).`); } else { addLogMessage("Crescita Rigogliosa: Mana massimo già raggiunto."); } break; case 'm003': addLogMessage("Pesca Miracolosa: Peschi 2 carte."); drawCard(playerId); drawCard(playerId); break; } } }
function startTargetSelection(selectionInfo) { console.log("Inizio selezione target:", selectionInfo); if (!gameState.pendingActionInfo || gameState.pendingActionInfo.cardId !== selectionInfo.sourceCardId) { console.error("Tentativo di startTargetSelection senza un'azione pendente valida!"); cancelTargetSelection(); return; } gameState.selectingTarget = selectionInfo; gameState.potentialTargets = []; clearHighlights(); const allFieldCards = document.querySelectorAll('#field-player-1 .card, #field-player-2 .card'); allFieldCards.forEach(cardElement => { let isValid = true; if (selectionInfo.filter && !selectionInfo.filter(cardElement)) { isValid = false; } if(isValid) { cardElement.classList.add('potential-target'); gameState.potentialTargets.push(cardElement); } }); if (gameState.potentialTargets.length === 0) { addLogMessage(`Nessun bersaglio valido trovato per ${getCardData(selectionInfo.sourceCardId).nome}. Azione annullata.`); console.log("Nessun target valido trovato, annullamento automatico."); cancelTargetSelection(); } else { addLogMessage(`Seleziona un bersaglio per ${getCardData(selectionInfo.sourceCardId).nome}. (Click destro o ESC per annullare)`); renderGame(); } }
function clearHighlights() { document.querySelectorAll('.potential-target').forEach(el => el.classList.remove('potential-target')); }
function cancelTargetSelection() { console.log("Tentativo di annullare selezione target..."); if (gameState.selectingTarget && gameState.pendingActionInfo) { console.log("Annullamento in corso per:", gameState.pendingActionInfo); addLogMessage(`Azione per ${getCardData(gameState.pendingActionInfo.cardId).nome} annullata.`); const player = getPlayerState(1); const { type, cardId, originalHandIndex, costPaid } = gameState.pendingActionInfo; if (player && type === 'playCardFromHand') { player.currentResources += costPaid; console.log(`Risorse restituite: +${costPaid}, Totale: ${player.currentResources}`); player.hand.splice(originalHandIndex, 0, cardId); console.log(`Carta ${cardId} restituita alla mano indice ${originalHandIndex}`); } gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); renderGame(); } else { console.log("Nessuna azione di selezione target da annullare."); } }


// ==================== 6. Logica Avversario (IA Semplice) ====================
function runOpponentTurn() { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const player = getPlayerState(2); const opponent = getPlayerState(1); if (!player || !opponent) return; addLogMessage("Giocatore 2 (IA) sta agendo..."); const playCardAI = () => { let cardPlayed = false; const playableCards = player.hand .map((id, index) => ({ id, index, data: getCardData(id) })) .filter(c => player.currentResources >= c.data.costo) .sort((a, b) => b.data.costo - a.data.costo); if (playableCards.length > 0) { const cardToPlay = playableCards[0]; player.currentResources -= cardToPlay.data.costo; player.hand.splice(cardToPlay.index, 1); if (cardToPlay.data.forza !== null || cardToPlay.data.punti_ferita !== null) { player.field.push(cardToPlay.id); addLogMessage(`Giocatore 2 gioca ${cardToPlay.data.nome}.`); handleCardEffects(cardToPlay.id, 'onPlay', 2); } else { addLogMessage(`Giocatore 2 lancia ${cardToPlay.data.nome}.`); handleCardEffects(cardToPlay.id, 'onPlay', 2); player.graveyard.push(cardToPlay.id); } cardPlayed = true; renderGame(); } return cardPlayed; }; const attackAI = () => { let didAttack = false; const attackers = player.field .map(id => getCardData(id)) .filter(data => data.forza > 0); if (attackers.length > 0) { const attacker = attackers[0]; const damage = attacker.forza; opponent.hp -= damage; addLogMessage(`${attacker.nome} (IA) attacca Giocatore 1 per ${damage} danni. HP G1: ${opponent.hp}`); didAttack = true; renderGame(); } return didAttack; }; setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const played = playCardAI(); if (!played) addLogMessage("Giocatore 2 non gioca carte."); setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const attacked = attackAI(); if (!attacked && player.field.some(id => getCardData(id).forza > 0)) { addLogMessage("Le creature del Giocatore 2 non attaccano questo turno."); } setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; console.log("Giocatore 2 (IA) termina il turno."); addLogMessage("Giocatore 2 termina il suo turno."); if (!gameState.gameEnded) { startTurn(1); } }, 700); }, 800); }, 500); }


// ==================== 7. Gestione Modale ====================
function openModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.add('active'); } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.remove('active'); if (modalId === 'graveyard-modal' && graveyardModalBody) { graveyardModalBody.innerHTML = ''; } } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeAllModals() { document.querySelectorAll('.modal.active').forEach(modal => { closeModal(modal.id); }); }
function showGraveyard(playerId) { const player = getPlayerState(playerId); if (!player || !graveyardModalBody || !graveyardModalTitle) return; console.log(`Visualizza cimitero Giocatore ${playerId}`); graveyardModalTitle.textContent = `Cimitero Giocatore ${playerId}`; graveyardModalBody.innerHTML = ''; if (player.graveyard.length === 0) { graveyardModalBody.innerHTML = '<p>Nessuna carta nel cimitero.</p>'; } else { player.graveyard.forEach(cardId => { const cardElement = renderCard(cardId, 'modal'); graveyardModalBody.appendChild(cardElement); }); } openModal('graveyard-modal'); }
function handleGraveyardClick(event) { if (gameState.gameEnded) return; const playerId = parseInt(event.currentTarget.dataset.playerId, 10); if (!playerId) return; showGraveyard(playerId); }


// ==================== 8. Inizializzazione Event Listener ====================
function addEventListeners() {
    // Bottone fine turno
    endTurnButton.addEventListener('click', handleEndTurnClick);

    // Aree Cimitero Cliccabili
    if (player1Graveyard) { player1Graveyard.addEventListener('click', handleGraveyardClick); }
    if (player2GraveyardClickable) { player2GraveyardClickable.addEventListener('click', handleGraveyardClick); }
    else { console.warn("Elemento cliccabile per Cimitero Giocatore 2 non trovato."); }

    // Bottone Mostra Log
    if (showLogButton) { showLogButton.addEventListener('click', () => { openModal('log-modal'); }); }
    else { console.error("Bottone 'Mostra Log' non trovato!"); }

    // Bottoni Chiudi Modale
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalToClose = button.closest('.modal');
            if (modalToClose) { closeModal(modalToClose.id); }
        });
    });

    // Chiudi modale cliccando sullo sfondo
    modals.forEach(modalElement => {
         modalElement.addEventListener('click', (event) => {
             if (event.target === modalElement) { closeModal(modalElement.id); }
         });
    });

    // Annulla selezione target con click destro
    document.addEventListener('contextmenu', (event) => {
        if (gameState.selectingTarget) {
            event.preventDefault(); // Impedisce menu contestuale
            cancelTargetSelection();
        }
    });

    // NUOVO: Annulla selezione target o chiudi modali con tasto Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            console.log("Tasto Escape premuto.");
            // Priorità: Annullare selezione target se attiva
            if (gameState.selectingTarget) {
                console.log("Annullamento selezione target via ESC.");
                cancelTargetSelection();
            } else {
                // Altrimenti, chiudi tutti i modali aperti
                console.log("Chiusura modali via ESC.");
                closeAllModals();
            }
        }
    });
}


// ==================== 9. Inizializzazione Gioco ====================
function initGame() { console.log("Inizializzazione gioco..."); addLogMessage("Benvenuto nel Test LCG!"); const startingDeckP1 = ["c001", "c001", "c002", "c003", "c004", "c004", "m001", "m001", "m003", "c005", "c001", "c002", "c004", "m001", "m003"]; const startingDeckP2 = ["c001", "c002", "c002", "c003", "c004", "c005", "c005", "m001", "m002", "m003", "c001", "c003", "c004", "m002", "m001"]; gameState = { currentPlayerId: 1, turnNumber: 1, players: [ { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [...startingDeckP1], hand: [], field: [], graveyard: [] }, { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [...startingDeckP2], hand: [], field: [], graveyard: [] } ], gameEnded: false, winner: null, selectingTarget: null, potentialTargets: [], pendingActionInfo: null }; shuffleArray(gameState.players[0].deck); shuffleArray(gameState.players[1].deck); console.log("Mazzi mescolati."); const initialHandSize = 3; for (let i = 0; i < initialHandSize; i++) { if(gameState.players[0].deck.length > 0) gameState.players[0].hand.push(gameState.players[0].deck.shift()); if(gameState.players[1].deck.length > 0) gameState.players[1].hand.push(gameState.players[1].deck.shift()); } console.log("Mani iniziali pescate."); addEventListeners(); startTurn(1); }
function endGame(winnerId) { if (gameState.gameEnded) return; gameState.gameEnded = true; gameState.winner = winnerId; gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); addLogMessage(`Partita terminata! Giocatore ${winnerId} ha vinto!`); console.log(`Partita terminata! Vincitore: Giocatore ${winnerId}`); renderGame(); document.querySelectorAll('.card').forEach(card => { const clone = card.cloneNode(true); card.parentNode.replaceChild(clone, card); }); setTimeout(() => alert(`Partita terminata! Giocatore ${winnerId} ha vinto!`), 100); }


// ==================== Avvio ====================
document.addEventListener('DOMContentLoaded', initGame);