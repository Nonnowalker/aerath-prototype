// File: game.js
// (Versione finale con classi CSS, deck dinamici, effetti decentralizzati)

// ==================== 1. Riferimenti Elementi DOM ====================
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
const player2GraveyardDisplay = document.getElementById('graveyard-count-2-display');
const player2GraveyardClickable = document.getElementById('graveyard-info-player-2');
const player2Hand = document.getElementById('hand-player-2');
const player2Field = document.getElementById('field-player-2');
const player2Area = document.getElementById('player-area-2');
const graveyardModal = document.getElementById('graveyard-modal');
const graveyardModalTitle = document.getElementById('modal-title-graveyard');
const graveyardModalBody = document.getElementById('modal-body-graveyard');
const logModal = document.getElementById('log-modal');
const logModalTitle = document.getElementById('modal-title-log');
const logModalBody = document.getElementById('modal-body-log');
const showLogButton = document.getElementById('show-log-button');
const closeButtons = document.querySelectorAll('.close-button');
const modals = document.querySelectorAll('.modal');

// ==================== 2. Stato del Gioco ====================
// NOTA: Per gestire correttamente danno/morte creature, 'field'
// dovrebbe diventare un array di oggetti: es. { id: "c001", instanceId: "...", currentHp: 1 }
let gameState = {
    currentPlayerId: 1,
    turnNumber: 1,
    players: [
        { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [] }, // field: array di ID stringa (semplificato)
        { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [] }  // field: array di ID stringa (semplificato)
    ],
    gameEnded: false,
    winner: null,
    selectingTarget: null, // Info per l'azione di targeting { sourceCardId, targetInfo: { prompt, filter, onTargetSelected } }
    potentialTargets: [],
    pendingActionInfo: null // Info per annullare { type, cardId, originalHandIndex, costPaid }
};


// ==================== 3. Funzioni Utilità ====================
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }
function addLogMessage(message) { if (!logModalBody) { console.error("Elemento corpo modale log non trovato!"); return; } const p = document.createElement('p'); const now = new Date(); const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`; p.innerHTML = `<span class="log-timestamp">[${timeString} T:${gameState.turnNumber}]</span> ${message}`; logModalBody.appendChild(p); logModalBody.scrollTop = logModalBody.scrollHeight; }
function getPlayerState(playerId) { return gameState.players.find(p => p.id === playerId) || null; }
function getOpponentState(currentPlayerId) { const opponentId = currentPlayerId === 1 ? 2 : 1; return getPlayerState(opponentId); }
// Assumiamo che getCardData e getAllCardIds siano definite in cards.js
// e accessibili globalmente
// const getCardData = window.getCardData;
// const getAllCardIds = window.getAllCardIds;

/**
 * Crea il contesto da passare alle funzioni definite nelle carte.
 * @param {number} playerId - ID del giocatore che esegue l'azione.
 * @param {string} cardId - ID della carta coinvolta.
 * @returns {object} Oggetto contesto.
 */
function createCardContext(playerId, cardId) {
    return {
        gameState: gameState,
        playerId: playerId,
        cardId: cardId,
        addLog: addLogMessage,
        getPlayerState: getPlayerState,
        getOpponentState: getOpponentState,
        getCardData: getCardData, // Passa la funzione helper globale
        drawCard: drawCard, // Passa la funzione drawCard globale
        executeEffect: executeEffect, // Passa il gestore effetti generico
        startTargetSelection: startTargetSelection, // Passa la funzione per iniziare targeting
        // Potresti aggiungere altre funzioni helper se servono nelle carte
    };
}


// ==================== 4. Funzioni di Rendering ====================
function renderCard(cardId, location = 'hand') { const cardData = getCardData(cardId); const cardDiv = document.createElement('div'); cardDiv.classList.add('card'); cardDiv.dataset.cardId = cardId; cardDiv.dataset.location = location; const cardName = document.createElement('div'); cardName.classList.add('card-name'); cardName.textContent = cardData.nome; const cardCost = document.createElement('div'); cardCost.classList.add('card-cost'); cardCost.textContent = cardData.costo; const cardArt = document.createElement('div'); cardArt.classList.add('card-art'); const cardAbility = document.createElement('div'); cardAbility.classList.add('card-ability'); cardAbility.textContent = cardData.description; cardDiv.appendChild(cardName); cardDiv.appendChild(cardCost); cardDiv.appendChild(cardArt); /* cardDiv.appendChild(cardAbility); */ if (cardData.forza !== null || cardData.punti_ferita !== null) { const cardStats = document.createElement('div'); cardStats.classList.add('card-stats'); const forzaSpan = document.createElement('span'); forzaSpan.textContent = cardData.forza !== null ? cardData.forza : '-'; const pfSpan = document.createElement('span'); pfSpan.textContent = cardData.punti_ferita !== null ? cardData.punti_ferita : '-'; cardStats.appendChild(forzaSpan); cardStats.appendChild(pfSpan); cardDiv.appendChild(cardStats); } let tooltipText = `${cardData.nome} (${cardData.costo})\n`; if (cardData.forza !== null) tooltipText += `F:${cardData.forza} `; if (cardData.punti_ferita !== null) tooltipText += `PF:${cardData.punti_ferita}`; if (cardData.description) tooltipText += `\n${cardData.description}`; if (cardData.keywords && cardData.keywords.length > 0) tooltipText += `\nKeywords: ${cardData.keywords.join(', ')}`; cardDiv.title = tooltipText.trim(); const setFallbackText = () => { cardArt.textContent = 'Immagine non disponibile'; cardArt.classList.add('card-art-fallback'); }; const removeFallbackStyle = () => { cardArt.classList.remove('card-art-fallback'); cardArt.textContent = ''; }; if (cardData.illustrazione) { const img = new Image(); img.onload = () => { removeFallbackStyle(); cardArt.style.backgroundImage = `url('${cardData.illustrazione}')`; }; img.onerror = () => { cardArt.style.backgroundImage = 'none'; setFallbackText(); }; img.src = cardData.illustrazione; } else { setFallbackText(); } if (!gameState.gameEnded) { if (location === 'hand' && gameState.currentPlayerId === 1 && getPlayerState(1)?.hand.includes(cardId)) { cardDiv.addEventListener('click', handleHandCardClick); } else if (location === 'field') { cardDiv.addEventListener('click', handleFieldCardClick); } } return cardDiv; }
function renderHand(playerId) { const playerState = getPlayerState(playerId); const handElement = (playerId === 1) ? player1Hand : player2Hand; handElement.innerHTML = ''; if (playerId === 1) { playerState.hand.forEach(cardId => { const cardElement = renderCard(cardId, 'hand'); handElement.appendChild(cardElement); }); } else { for (let i = 0; i < playerState.hand.length; i++) { const placeholder = document.createElement('div'); placeholder.classList.add('card-placeholder'); placeholder.title = "Carta avversaria"; handElement.appendChild(placeholder); } } }
function renderField(playerId) { const playerState = getPlayerState(playerId); const fieldElement = (playerId === 1) ? player1Field : player2Field; fieldElement.innerHTML = ''; playerState.field.forEach(cardIdOrObject => { const cardId = (typeof cardIdOrObject === 'string') ? cardIdOrObject : cardIdOrObject.id; const cardElement = renderCard(cardId, 'field'); fieldElement.appendChild(cardElement); }); }
function renderPlayerInfo(playerId) { const playerState = getPlayerState(playerId); if (!playerState) return; if (playerId === 1) { player1Hp.textContent = playerState.hp; player1Res.textContent = playerState.currentResources; player1MaxRes.textContent = playerState.maxResources; player1DeckCount.textContent = playerState.deck.length; player1GraveyardCount.textContent = playerState.graveyard.length; } else { player2Hp.textContent = playerState.hp; player2Res.textContent = playerState.currentResources; player2MaxRes.textContent = playerState.maxResources; player2DeckCount.textContent = playerState.deck.length; player2GraveyardCount.textContent = playerState.graveyard.length; if(player2GraveyardDisplay) player2GraveyardDisplay.textContent = playerState.graveyard.length; } }
function renderGame() { renderPlayerInfo(1); renderPlayerInfo(2); renderHand(1); renderHand(2); renderField(1); renderField(2); turnIndicator.textContent = gameState.currentPlayerId; endTurnButton.disabled = gameState.gameEnded || gameState.currentPlayerId !== 1 || !!gameState.selectingTarget; if (!gameState.gameEnded) { if (gameState.currentPlayerId === 1) { player1Area.classList.add('active-turn'); player2Area.classList.remove('active-turn'); player1Deck.classList.remove('deck-inactive'); player1Deck.title = `Mazzo (${getPlayerState(1)?.deck.length || 0} carte)`; } else { player1Area.classList.remove('active-turn'); player2Area.classList.add('active-turn'); player1Deck.classList.add('deck-inactive'); player1Deck.title = `Mazzo (${getPlayerState(1)?.deck.length || 0} carte)`; } } else { player1Area.classList.remove('active-turn'); player2Area.classList.remove('active-turn'); player1Deck.classList.add('deck-inactive'); } const player1 = getPlayerState(1); const player2 = getPlayerState(2); if (!gameState.gameEnded && player1 && (player1.hp <= 0 || (player1.deck.length === 0 && player1.hand.length === 0 && player1.field.length === 0))) { endGame(2); } else if (!gameState.gameEnded && player2 && (player2.hp <= 0 || (player2.deck.length === 0 && player2.hand.length === 0 && player2.field.length === 0))) { endGame(1); } if (!gameState.selectingTarget) { clearHighlights(); } }


// ==================== 5. Logica Azioni di Gioco ====================

function startTurn(playerId) { if (gameState.gameEnded) return; console.log(`Inizio turno ${gameState.turnNumber} per Giocatore ${playerId}`); addLogMessage(`Inizio turno per Giocatore ${playerId}.`); gameState.currentPlayerId = playerId; const player = getPlayerState(playerId); if (!player) return; if (player.maxResources < 10) { player.maxResources++; } player.currentResources = player.maxResources; drawCard(playerId); renderGame(); if (playerId === 2) { endTurnButton.disabled = true; addLogMessage("Giocatore 2 sta pensando..."); setTimeout(runOpponentTurn, 1500); } else { endTurnButton.disabled = !!gameState.selectingTarget; } }
function drawCard(playerId) { const player = getPlayerState(playerId); if (!player || gameState.gameEnded) return; if (player.deck.length > 0) { const drawnCardId = player.deck.shift(); player.hand.push(drawnCardId); addLogMessage(`Giocatore ${playerId} pesca una carta.`); console.log(`Giocatore ${playerId} pesca ${drawnCardId}`); } else { player.hp -= 1; addLogMessage(`Giocatore ${playerId} ha finito le carte e subisce 1 danno da fatica! HP: ${player.hp}`); console.warn(`Giocatore ${playerId} ha tentato di pescare da un mazzo vuoto.`); } }
function handleEndTurnClick() { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) { console.warn("Impossibile passare il turno ora."); return; } console.log("Giocatore 1 passa il turno."); addLogMessage("Giocatore 1 termina il suo turno."); gameState.turnNumber++; startTurn(2); }

/**
 * Gestisce il click su una carta nella mano del Giocatore 1 (Refactored).
 * Utilizza la logica decentralizzata definita in cards.js.
 * @param {Event} event L'evento click.
 */
function handleHandCardClick(event) {
    if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) return;

    const cardElement = event.currentTarget;
    const cardId = cardElement.dataset.cardId;
    const cardData = getCardData(cardId);
    const player = getPlayerState(1);
    if (!player || !cardData) return;

    console.log(`Tentativo di giocare: ${cardData.nome} (ID: ${cardId})`);

    // 1. Verifica Costo Risorse
    if (player.currentResources >= cardData.costo) {

        // 2. Controlla se la carta richiede un target tramite getTargetInfo
        const hasTargeting = typeof cardData.getTargetInfo === 'function';

        if (hasTargeting) {
            // --- AZIONE CHE RICHIEDE TARGET ---
            console.log(`${cardData.nome} richiede un bersaglio.`);

            // Paga costo e rimuovi da mano (salva info per annullamento)
            player.currentResources -= cardData.costo;
            const cardIndex = player.hand.indexOf(cardId);
            if (cardIndex > -1) {
                 player.hand.splice(cardIndex, 1);
                 gameState.pendingActionInfo = { type: 'playCardFromHand', cardId: cardId, originalHandIndex: cardIndex, costPaid: cardData.costo };
                 console.log("Info per annullamento salvate:", gameState.pendingActionInfo);

                 // Prepara il contesto per getTargetInfo
                 const context = createCardContext(player.id, cardId);
                 // Ottieni le info di targeting dalla carta
                 const targetInfo = cardData.getTargetInfo(context);

                 // Avvia la selezione target usando le info dalla carta
                 startTargetSelection(cardId, targetInfo);

                 // Aggiorna UI per mostrare stato di selezione
                 renderGame();
            } else {
                console.error("Carta cliccata non trovata nella mano!", cardId, player.hand);
                player.currentResources += cardData.costo; // Restituisci risorse
            }

        } else {
            // --- AZIONE CHE NON RICHIEDE TARGET ---
            console.log(`${cardData.nome} non richiede bersaglio. Azione immediata.`);

            // Paga costo e rimuovi da mano
            player.currentResources -= cardData.costo;
            const cardIndex = player.hand.indexOf(cardId);
            if (cardIndex > -1) { player.hand.splice(cardIndex, 1); }
            else { console.error("Carta cliccata non trovata nella mano!", cardId, player.hand); player.currentResources += cardData.costo; return; }

            // Determina destinazione (campo o cimitero)
            const isCreature = cardData.forza !== null || cardData.punti_ferita !== null;
            if (isCreature) {
                player.field.push(cardId); // O oggetto se field gestisce oggetti
                addLogMessage(`Giocatore 1 gioca ${cardData.nome}.`);
            } else {
                addLogMessage(`Giocatore 1 lancia ${cardData.nome}.`);
                // Le magie senza target vanno subito al cimitero dopo l'effetto onPlay
                // (lo spostamento è gestito da executeEffect se necessario)
            }

            // Esegui l'effetto onPlay, se presente
            executeEffect(cardId, 'onPlay', player.id);

            // Le magie senza target vanno al cimitero dopo l'effetto
            if (!isCreature) {
                 player.graveyard.push(cardId);
            }

            // Aggiorna l'interfaccia
            renderGame();
        }

    } else {
        addLogMessage(`Risorse insufficienti per giocare ${cardData.nome} (costa ${cardData.costo}, hai ${player.currentResources}).`);
        console.log("Risorse insufficienti.");
    }
}


/**
 * Gestore generico per eseguire effetti definiti nelle carte.
 * @param {string} cardId - ID della carta il cui effetto va eseguito.
 * @param {string} trigger - Es. 'onPlay', 'onDeath', ecc.
 * @param {number} playerId - ID del giocatore contesto dell'effetto.
 * @param {object} [additionalContext={}] - Eventuali dati aggiuntivi specifici del trigger.
 */
function executeEffect(cardId, trigger, playerId, additionalContext = {}) {
    const cardData = getCardData(cardId);
    // Cerca la funzione corrispondente al trigger nei dati della carta
    const effectFunction = cardData && cardData[trigger];

    if (typeof effectFunction === 'function') {
        console.log(`Esecuzione effetto ${trigger} per ${cardData.nome}`);
        // Crea il contesto base
        const context = createCardContext(playerId, cardId);
        // Aggiungi eventuali dati specifici del trigger
        Object.assign(context, additionalContext);
        try {
            // Esegui la funzione definita nella carta!
            effectFunction(context);
        } catch (error) {
            console.error(`Errore durante l'esecuzione dell'effetto ${trigger} per ${cardId}:`, error);
            addLogMessage(`! Errore nell'effetto di ${cardData.nome} !`);
        }
    } else {
        // Nessuna funzione definita per questo trigger su questa carta
        // console.log(`Nessun effetto ${trigger} definito per ${cardData?.nome || cardId}`);
    }
}

/**
 * Gestisce il click su una carta sul campo (Refactored).
 * @param {Event} event L'evento click.
 */
function handleFieldCardClick(event) {
    if (gameState.gameEnded) return;
    const cardElement = event.currentTarget;
    const cardId = cardElement.dataset.cardId;
    const cardData = getCardData(cardId);
    if (!cardData) return;
    const ownerId = cardElement.closest('.player-area').id.includes('player-area-1') ? 1 : 2;

    // --- Gestione Selezione Target ---
    if (gameState.selectingTarget) {
        if (gameState.potentialTargets.includes(cardElement)) {
            console.log(`Target valido selezionato: ${cardData.nome} (ID: ${cardId})`);

            // Prepara il contesto per la callback onTargetSelected
            const context = createCardContext(1, gameState.selectingTarget.sourceCardId); // Assumiamo G1 triggera

            // Esegui la callback definita nella carta (onTargetSelected)
            if (typeof gameState.selectingTarget.targetInfo.onTargetSelected === 'function') {
                try {
                     gameState.selectingTarget.targetInfo.onTargetSelected(cardElement, context);
                } catch (error) {
                    console.error(`Errore durante l'esecuzione di onTargetSelected per ${gameState.selectingTarget.sourceCardId}:`, error);
                    addLogMessage(`! Errore nell'effetto target di ${getCardData(gameState.selectingTarget.sourceCardId)?.nome || '?'} !`);
                     // Potrebbe essere saggio annullare l'azione qui se onTargetSelected fallisce
                     cancelTargetSelection();
                     return; // Esce per evitare pulizia standard se fallisce
                }
            } else {
                console.warn(`Nessuna funzione onTargetSelected definita per ${gameState.selectingTarget.sourceCardId}`);
                 // L'azione ha consumato risorse ma non fa nulla sul target... Potrebbe essere un errore di design?
                 // Considera se annullare o meno in questo caso.
            }

            // Pulisci lo stato di selezione (azione completata)
            gameState.selectingTarget = null;
            gameState.potentialTargets = [];
            gameState.pendingActionInfo = null; // Azione completata, non più pendente
            clearHighlights();
            renderGame(); // Aggiorna UI dopo l'azione

        } else {
            console.log("Target non valido cliccato.");
            addLogMessage("Bersaglio non valido.");
        }
        return; // Esce dopo aver gestito il click durante la selezione target
    }
    // --- Fine Gestione Selezione Target ---

    console.log(`Cliccato sulla carta in campo: ${cardData.nome} (ID: ${cardId}, Proprietario: ${ownerId})`);
    addLogMessage(`Cliccato su ${cardData.nome} sul campo.`);
    // Qui andrebbe la logica per iniziare attacco, attivare abilità da campo, etc.
}


/**
 * Inizia il processo di selezione del bersaglio (Refactored).
 * @param {string} sourceCardId - ID della carta che richiede il target.
 * @param {object} targetInfo - Oggetto restituito da cardData.getTargetInfo().
 */
function startTargetSelection(sourceCardId, targetInfo) {
    console.log("Inizio selezione target per:", sourceCardId, "Info:", targetInfo);

    if (!targetInfo || typeof targetInfo.filter !== 'function' || typeof targetInfo.onTargetSelected !== 'function') {
        console.error(`Informazioni di targeting non valide o incomplete fornite per ${sourceCardId}`);
        cancelTargetSelection(); // Annulla l'azione pendente
        return;
    }

    // Verifica l'azione pendente (già fatto in handleHandCardClick, ma doppia sicurezza)
    if (!gameState.pendingActionInfo || gameState.pendingActionInfo.cardId !== sourceCardId) {
         console.error("Tentativo di startTargetSelection senza un'azione pendente valida!");
         cancelTargetSelection();
         return;
    }

    // Imposta lo stato di targeting
    gameState.selectingTarget = {
        sourceCardId: sourceCardId,
        targetInfo: targetInfo // Salva l'oggetto completo con prompt, filter, onTargetSelected
    };
    gameState.potentialTargets = [];
    clearHighlights();

    // Prepara contesto per il filtro
    const filterContext = createCardContext(1, sourceCardId); // Assumiamo G1

    // Identifica target validi usando il filtro della carta
    const allFieldCards = document.querySelectorAll('#field-player-1 .card, #field-player-2 .card');
    allFieldCards.forEach(cardElement => {
        let isValid = false;
        try {
             isValid = targetInfo.filter(cardElement, filterContext);
        } catch (error) {
            console.error(`Errore durante l'esecuzione del filtro target per ${sourceCardId}:`, error);
        }
        if (isValid) {
            cardElement.classList.add('potential-target');
            gameState.potentialTargets.push(cardElement);
        }
    });
    // Aggiungere qui logica per bersagliare giocatori se necessario

    // Controlla se ci sono target
    if (gameState.potentialTargets.length === 0 /* && !playerTargetsValid */) {
        addLogMessage(`Nessun bersaglio valido trovato per ${getCardData(sourceCardId).nome}. Azione annullata.`);
        console.log("Nessun target valido trovato, annullamento automatico.");
        cancelTargetSelection();
    } else {
        addLogMessage(`${targetInfo.prompt || `Seleziona un bersaglio per ${getCardData(sourceCardId).nome}.`} (Click destro o ESC per annullare)`);
        renderGame(); // Aggiorna UI per mostrare highlight e stato selezione
    }
}

function clearHighlights() { document.querySelectorAll('.potential-target').forEach(el => el.classList.remove('potential-target')); }

function cancelTargetSelection() { console.log("Tentativo di annullare selezione target..."); if (gameState.selectingTarget && gameState.pendingActionInfo) { console.log("Annullamento in corso per:", gameState.pendingActionInfo); addLogMessage(`Azione per ${getCardData(gameState.pendingActionInfo.cardId).nome} annullata.`); const player = getPlayerState(1); const { type, cardId, originalHandIndex, costPaid } = gameState.pendingActionInfo; if (player && type === 'playCardFromHand') { player.currentResources += costPaid; console.log(`Risorse restituite: +${costPaid}, Totale: ${player.currentResources}`); player.hand.splice(originalHandIndex, 0, cardId); console.log(`Carta ${cardId} restituita alla mano indice ${originalHandIndex}`); } gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); renderGame(); } else { console.log("Nessuna azione di selezione target da annullare."); } }


// ==================== 6. Logica Avversario (IA Semplice) ====================
// (Questa IA è molto semplice e NON usa ancora gli effetti decentralizzati
//  per le sue azioni, andrebbe migliorata)
function runOpponentTurn() { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const player = getPlayerState(2); const opponent = getPlayerState(1); if (!player || !opponent) return; addLogMessage("Giocatore 2 (IA) sta agendo..."); const playCardAI = () => { let cardPlayed = false; const playableCards = player.hand .map((id, index) => ({ id, index, data: getCardData(id) })) .filter(c => player.currentResources >= c.data.costo) .sort((a, b) => b.data.costo - a.data.costo); if (playableCards.length > 0) { const cardToPlay = playableCards[0]; const cardId = cardToPlay.id; const cardData = cardToPlay.data; // --- Logica IA Semplificata --- // NON gestisce target // Paga costo e rimuovi da mano player.currentResources -= cardData.costo; player.hand.splice(cardToPlay.index, 1); // Determina destinazione e logga const isCreature = cardData.forza !== null || cardData.punti_ferita !== null; if (isCreature) { player.field.push(cardId); addLogMessage(`Giocatore 2 gioca ${cardData.nome}.`); // Esegui effetto onPlay (se esiste) executeEffect(cardId, 'onPlay', player.id); } else { addLogMessage(`Giocatore 2 lancia ${cardData.nome}.`); // Esegui effetto onPlay (se esiste) executeEffect(cardId, 'onPlay', player.id); // Magia va al cimitero player.graveyard.push(cardId); } cardPlayed = true; renderGame(); } return cardPlayed; }; const attackAI = () => { let didAttack = false; const attackers = player.field .map(id => getCardData(id)) .filter(data => data && data.forza > 0 && !(data.keywords && data.keywords.includes('Lento'))); // Esempio: non attacca se 'Lento' (servirebbe gestione stato per Lento) if (attackers.length > 0) { const attacker = attackers[0]; const damage = attacker.forza; opponent.hp -= damage; addLogMessage(`${attacker.nome} (IA) attacca Giocatore 1 per ${damage} danni. HP G1: ${opponent.hp}`); didAttack = true; renderGame(); } return didAttack; }; setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const played = playCardAI(); if (!played) addLogMessage("Giocatore 2 non gioca carte."); setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; const attacked = attackAI(); if (!attacked && player.field.some(id => getCardData(id).forza > 0)) { /* addLogMessage("Le creature del Giocatore 2 non attaccano."); */ } setTimeout(() => { if (gameState.gameEnded || gameState.currentPlayerId !== 2) return; console.log("Giocatore 2 (IA) termina il turno."); addLogMessage("Giocatore 2 termina il suo turno."); if (!gameState.gameEnded) { startTurn(1); } }, 700); }, 800); }, 500); }


// ==================== 7. Gestione Modale ====================
function openModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.add('active'); } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.remove('active'); if (modalId === 'graveyard-modal' && graveyardModalBody) { graveyardModalBody.innerHTML = ''; } } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeAllModals() { document.querySelectorAll('.modal.active').forEach(modal => { closeModal(modal.id); }); }
function showGraveyard(playerId) { const player = getPlayerState(playerId); if (!player || !graveyardModalBody || !graveyardModalTitle) return; console.log(`Visualizza cimitero Giocatore ${playerId}`); graveyardModalTitle.textContent = `Cimitero Giocatore ${playerId}`; graveyardModalBody.innerHTML = ''; if (player.graveyard.length === 0) { graveyardModalBody.innerHTML = '<p>Nessuna carta nel cimitero.</p>'; } else { player.graveyard.forEach(cardId => { const cardElement = renderCard(cardId, 'modal'); graveyardModalBody.appendChild(cardElement); }); } openModal('graveyard-modal'); }
function handleGraveyardClick(event) { if (gameState.gameEnded) return; const playerId = parseInt(event.currentTarget.dataset.playerId, 10); if (!playerId) return; showGraveyard(playerId); }


// ==================== 8. Inizializzazione Event Listener ====================
function addEventListeners() { endTurnButton.addEventListener('click', handleEndTurnClick); if (player1Graveyard) { player1Graveyard.addEventListener('click', handleGraveyardClick); } if (player2GraveyardClickable) { player2GraveyardClickable.addEventListener('click', handleGraveyardClick); } else { console.warn("Elemento cliccabile per Cimitero Giocatore 2 non trovato."); } if (showLogButton) { showLogButton.addEventListener('click', () => { openModal('log-modal'); }); } else { console.error("Bottone 'Mostra Log' non trovato!"); } closeButtons.forEach(button => { button.addEventListener('click', () => { const modalToClose = button.closest('.modal'); if (modalToClose) { closeModal(modalToClose.id); } }); }); modals.forEach(modalElement => { modalElement.addEventListener('click', (event) => { if (event.target === modalElement) { closeModal(modalElement.id); } }); }); document.addEventListener('contextmenu', (event) => { if (gameState.selectingTarget) { event.preventDefault(); cancelTargetSelection(); } }); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (gameState.selectingTarget) { cancelTargetSelection(); } else { closeAllModals(); } } }); }


// ==================== 9. Inizializzazione Gioco ====================
function initGame() { console.log("Inizializzazione gioco..."); const allCardIds = typeof getAllCardIds === 'function' ? getAllCardIds() : null; if (!allCardIds || allCardIds.length === 0) { console.error("Impossibile inizializzare: getAllCardIds non trovata o non restituisce ID in cards.js!"); alert("Errore critico: Impossibile caricare le carte."); return; } const deckP1 = []; const deckP2 = []; const copiesPerCard = 2; for (let i = 0; i < copiesPerCard; i++) { deckP1.push(...allCardIds); deckP2.push(...allCardIds); } gameState = { currentPlayerId: 1, turnNumber: 1, players: [ { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [...deckP1], hand: [], field: [], graveyard: [] }, { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [...deckP2], hand: [], field: [], graveyard: [] } ], gameEnded: false, winner: null, selectingTarget: null, potentialTargets: [], pendingActionInfo: null }; addLogMessage("Benvenuto nel Test LCG!"); shuffleArray(gameState.players[0].deck); shuffleArray(gameState.players[1].deck); console.log(`Mazzi mescolati: G1 (${gameState.players[0].deck.length} carte), G2 (${gameState.players[1].deck.length} carte)`); const initialHandSize = 3; for (let i = 0; i < initialHandSize; i++) { if(gameState.players[0].deck.length > 0) gameState.players[0].hand.push(gameState.players[0].deck.shift()); if(gameState.players[1].deck.length > 0) gameState.players[1].hand.push(gameState.players[1].deck.shift()); } console.log("Mani iniziali pescate."); addEventListeners(); startTurn(1); }
function endGame(winnerId) { if (gameState.gameEnded) return; gameState.gameEnded = true; gameState.winner = winnerId; gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); addLogMessage(`Partita terminata! Giocatore ${winnerId} ha vinto!`); console.log(`Partita terminata! Vincitore: Giocatore ${winnerId}`); renderGame(); document.querySelectorAll('.card').forEach(card => { const clone = card.cloneNode(true); card.parentNode.replaceChild(clone, card); }); setTimeout(() => alert(`Partita terminata! Giocatore ${winnerId} ha vinto!`), 100); }


// ==================== Avvio ====================
document.addEventListener('DOMContentLoaded', initGame);