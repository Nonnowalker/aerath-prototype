// File: game.js
// (Versione finale completa con griglia 6x6 e piazzamento IA - Corretto)

// ==================== 1. Riferimenti Elementi DOM ====================
const turnIndicator = document.getElementById('turn-indicator');
const endTurnButton = document.getElementById('end-turn-button');
const hpPlayer1 = document.getElementById('hp-player-1');
const resPlayer1 = document.getElementById('res-player-1');
const maxResPlayer1 = document.getElementById('max-res-player-1');
const deckCountP1Sidebar = document.getElementById('deck-count-1');
const handAreaP1 = document.getElementById('hand-area-player1');
const deckP1Element = document.getElementById('deck-player-1');
const deckP1CountDisplay = document.getElementById('deck-count-1-display');
const graveyardP1Element = document.getElementById('graveyard-player-1');
const graveyardCountP1Display = document.getElementById('graveyard-count-1-display');
const hpPlayer2 = document.getElementById('hp-player-2');
const resPlayer2 = document.getElementById('res-player-2');
const maxResPlayer2 = document.getElementById('max-res-player-2');
const deckCountP2Sidebar = document.getElementById('deck-count-2');
const handAreaP2 = document.getElementById('hand-area-player2');
const deckP2Element = document.getElementById('deck-player-2');
const deckP2CountDisplay = document.getElementById('deck-count-2-display');
const graveyardP2Element = document.getElementById('graveyard-player-2');
const graveyardCountP2Display = document.getElementById('graveyard-count-2-display');
const leftSidebar = document.querySelector('.left-sidebar');
const rightSidebar = document.querySelector('.right-sidebar');
const sharedFieldElement = document.getElementById('field-shared');
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
let gameState = {
    currentPlayerId: 1,
    turnNumber: 1,
    players: [
        { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [] },
        { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [] }
    ],
    grid: { rows: 6, cols: 6 }, // Griglia 6x6
    maxCreaturesPerPlayer: 4,
    gameEnded: false,
    winner: null,
    selectingTarget: null,
    potentialTargets: [],
    pendingActionInfo: null
};

// ==================== 3. Funzioni Utilità ====================
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }
function addLogMessage(message) { if (!logModalBody) { console.error("Elemento corpo modale log non trovato!"); return; } const p = document.createElement('p'); const now = new Date(); const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`; p.innerHTML = `<span class="log-timestamp">[${timeString} T:${gameState.turnNumber}]</span> ${message}`; logModalBody.appendChild(p); logModalBody.scrollTop = logModalBody.scrollHeight; }
function getPlayerState(playerId) { return gameState.players.find(p => p.id === playerId) || null; }
function getOpponentState(currentPlayerId) { const opponentId = currentPlayerId === 1 ? 2 : 1; return getPlayerState(opponentId); }
function generateInstanceId(playerId, cardId) { return `p${playerId}_${cardId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`; }
function createCardContext(playerId, cardId, instanceId = null) { return { gameState: gameState, playerId: playerId, cardId: cardId, instanceId: instanceId, addLog: addLogMessage, getPlayerState: getPlayerState, getOpponentState: getOpponentState, getCardData: getCardData, drawCard: drawCard, executeEffect: executeEffect, startTargetSelection: startTargetSelection, /* Aggiungere altre funzioni come modifyCreatureHp etc. */ }; }
function findEmptyPlacementSpot(playerId) {
    const playerState = getPlayerState(playerId);
    if (!playerState) return null;
    const placementRow = (playerId === 1) ? gameState.grid.rows - 1 : 0;
    for (let c = 0; c < gameState.grid.cols; c++) {
        const isOccupied = gameState.players.some(p => p.field.some(creature => creature.position.row === placementRow && creature.position.col === c ));
        if (!isOccupied) { return { row: placementRow, col: c }; }
    }
    return null;
}

// ==================== 4. Funzioni di Rendering ====================
function renderCard(cardId, location = 'hand', instanceId = null) {
    const cardData = getCardData(cardId);
    const cardDiv = document.createElement('div');
    cardDiv.dataset.cardId = cardId;
    if (instanceId) cardDiv.dataset.instanceId = instanceId;
    cardDiv.dataset.location = location;

    if (location === 'hand') {
        cardDiv.classList.add('card', 'in-hand');
    } else if (location === 'field') {
        cardDiv.classList.add('card', 'on-grid');
    } else if (location === 'modal') {
         cardDiv.classList.add('card', 'in-hand'); // Usa stile 'in-hand' per modale
         // Rimuovi interattività specifica per modale usando classi o stile
         cardDiv.style.cursor = 'default';
         cardDiv.style.transform = 'none';
         cardDiv.style.borderColor = '#666';
         cardDiv.style.boxShadow = 'none';
    } else {
         cardDiv.classList.add('card'); // Fallback generico
    }

    const cardName = document.createElement('div'); cardName.classList.add('card-name'); cardName.textContent = cardData.nome;
    const cardCost = document.createElement('div'); cardCost.classList.add('card-cost'); cardCost.textContent = cardData.costo;
    const cardArt = document.createElement('div'); cardArt.classList.add('card-art');
    cardDiv.appendChild(cardName); cardDiv.appendChild(cardCost); cardDiv.appendChild(cardArt);
    if (cardData.forza !== null || cardData.punti_ferita !== null) { const cardStats = document.createElement('div'); cardStats.classList.add('card-stats'); const forzaSpan = document.createElement('span'); forzaSpan.textContent = cardData.forza !== null ? cardData.forza : '-'; const pfSpan = document.createElement('span'); pfSpan.textContent = cardData.punti_ferita !== null ? cardData.punti_ferita : '-'; cardStats.appendChild(forzaSpan); cardStats.appendChild(pfSpan); cardDiv.appendChild(cardStats); }
    let tooltipText = `${cardData.nome} (${cardData.costo})\n`; if (cardData.forza !== null) tooltipText += `F:${cardData.forza} `; if (cardData.punti_ferita !== null) tooltipText += `PF:${cardData.punti_ferita}`; if (cardData.description) tooltipText += `\n${cardData.description}`; if (cardData.keywords && cardData.keywords.length > 0) tooltipText += `\nKeywords: ${cardData.keywords.join(', ')}`; cardDiv.title = tooltipText.trim();
    const setFallbackText = () => { cardArt.textContent = 'Immagine non disponibile'; cardArt.classList.add('card-art-fallback'); };
    const removeFallbackStyle = () => { cardArt.classList.remove('card-art-fallback'); cardArt.textContent = ''; };
    if (cardData.illustrazione) { const img = new Image(); img.onload = () => { removeFallbackStyle(); cardArt.style.backgroundImage = `url('${cardData.illustrazione}')`; }; img.onerror = () => { cardArt.style.backgroundImage = 'none'; setFallbackText(); }; img.src = cardData.illustrazione; } else { setFallbackText(); }

    if (!gameState.gameEnded) { if (location === 'hand' && gameState.currentPlayerId === 1 && getPlayerState(1)?.hand.includes(cardId)) { cardDiv.addEventListener('click', handleHandCardClick); } else if (location === 'field') { cardDiv.addEventListener('click', handleFieldCardClick); } } return cardDiv;
}

function renderHand(playerId) {
    const playerState = getPlayerState(playerId);
    const handElement = (playerId === 1) ? handAreaP1 : handAreaP2;
    if (!playerState || !handElement) return;
    handElement.innerHTML = '';
    if (playerId === 1) {
        playerState.hand.forEach(cardId => {
            const cardElement = renderCard(cardId, 'hand');
            handElement.appendChild(cardElement);
        });
    } else {
        for (let i = 0; i < playerState.hand.length; i++) {
            const placeholder = document.createElement('div');
            placeholder.classList.add('card-placeholder');
            placeholder.title = "Carta avversaria";
            handElement.appendChild(placeholder);
        }
    }
}

function renderField() {
    if (!sharedFieldElement) { console.error("Elemento campo condiviso (field-shared) non trovato!"); return; }
    sharedFieldElement.innerHTML = '';
    for (let r = 0; r < gameState.grid.rows; r++) {
        for (let c = 0; c < gameState.grid.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r; cell.dataset.col = c;
            let cellTitle = `Cella (F:${r}, C:${c})`;
            if (r === 0) { cell.classList.add('initial-placement-g2'); cellTitle = `Zona Schieramento G2 (F:${r}, C:${c})`; }
            else if (r === gameState.grid.rows - 1) { cell.classList.add('initial-placement-g1'); cellTitle = `Zona Schieramento G1 (F:${r}, C:${c})`; }
            let creatureInCell = null; let ownerId = null;
            for (const player of gameState.players) {
                const found = player.field.find(creature => creature.position.row === r && creature.position.col === c );
                if (found) { creatureInCell = found; ownerId = player.id; break; }
            }
            if (creatureInCell) {
                const cardElement = renderCard(creatureInCell.cardId, 'field', creatureInCell.instanceId);
                cardElement.classList.add(ownerId === 1 ? 'player1-card' : 'player2-card'); // Aggiungi classe proprietario
                cell.appendChild(cardElement);
                cellTitle += ` - Occupata da G${ownerId}: ${getCardData(creatureInCell.cardId)?.nome || '?'}`;
            } else {
                cell.addEventListener('click', handleGridCellClick);
            }
            cell.title = cellTitle;
            sharedFieldElement.appendChild(cell);
        }
    }
}

function renderPlayerInfo(playerId) {
    const playerState = getPlayerState(playerId);
    if (!playerState) return;
    if (playerId === 1) {
        if (hpPlayer1) hpPlayer1.textContent = playerState.hp;
        if (resPlayer1) resPlayer1.textContent = playerState.currentResources;
        if (maxResPlayer1) maxResPlayer1.textContent = playerState.maxResources;
        if (deckCountP1Sidebar) deckCountP1Sidebar.textContent = playerState.deck.length;
        if (deckP1Element) deckP1Element.title = `Mazzo G1 (${playerState.deck.length})`;
        if (graveyardCountP1Display) graveyardCountP1Display.textContent = playerState.graveyard.length;
    } else {
        if (hpPlayer2) hpPlayer2.textContent = playerState.hp;
        if (resPlayer2) resPlayer2.textContent = playerState.currentResources;
        if (maxResPlayer2) maxResPlayer2.textContent = playerState.maxResources;
        if (deckCountP2Sidebar) deckCountP2Sidebar.textContent = playerState.deck.length;
        if (deckP2Element) deckP2Element.title = `Mazzo G2 (${playerState.deck.length})`;
        if (graveyardCountP2Display) graveyardCountP2Display.textContent = playerState.graveyard.length;
    }
}

function renderGame() {
    renderPlayerInfo(1);
    renderPlayerInfo(2);
    renderHand(1);
    renderHand(2);
    renderField();
    if(turnIndicator) turnIndicator.textContent = gameState.currentPlayerId;
    if(endTurnButton) endTurnButton.disabled = gameState.gameEnded || gameState.currentPlayerId !== 1 || !!gameState.selectingTarget;
    if(showLogButton) showLogButton.disabled = gameState.gameEnded;
    if (!gameState.gameEnded) {
        if (gameState.currentPlayerId === 1) {
            if(rightSidebar) rightSidebar.classList.add('active-turn');
            if(leftSidebar) leftSidebar.classList.remove('active-turn');
            if(deckP1Element) deckP1Element.classList.remove('deck-inactive');
        } else {
            if(rightSidebar) rightSidebar.classList.remove('active-turn');
            if(leftSidebar) leftSidebar.classList.add('active-turn');
            if(deckP1Element) deckP1Element.classList.add('deck-inactive');
        }
    } else {
         if(rightSidebar) rightSidebar.classList.remove('active-turn');
         if(leftSidebar) leftSidebar.classList.remove('active-turn');
         if(deckP1Element) deckP1Element.classList.add('deck-inactive');
         if(deckP2Element) deckP2Element.classList.add('deck-inactive');
    }
    const player1 = getPlayerState(1); const player2 = getPlayerState(2);
    if (!gameState.gameEnded && player1 && (player1.hp <= 0 || (player1.deck.length === 0 && player1.hand.length === 0 && player1.field.length === 0))) { endGame(2); }
    else if (!gameState.gameEnded && player2 && (player2.hp <= 0 || (player2.deck.length === 0 && player2.hand.length === 0 && player2.field.length === 0))) { endGame(1); }
    if (!gameState.selectingTarget) {
        clearHighlights();
    }
}

// ==================== 5. Logica Azioni di Gioco ====================
function startTurn(playerId) { if (gameState.gameEnded) return; console.log(`Inizio turno ${gameState.turnNumber} per Giocatore ${playerId}`); addLogMessage(`Inizio turno per Giocatore ${playerId}.`); gameState.currentPlayerId = playerId; const player = getPlayerState(playerId); if (!player) return; if (player.maxResources < 10) { player.maxResources++; } player.currentResources = player.maxResources; player.field.forEach(c => { const cardData = getCardData(c.cardId); c.canAttackThisTurn = !cardData?.keywords?.includes('Lento'); }); drawCard(playerId); renderGame(); if (playerId === 2) { endTurnButton.disabled = true; addLogMessage("Giocatore 2 sta pensando..."); setTimeout(runOpponentTurn, 1500); } else { endTurnButton.disabled = !!gameState.selectingTarget; } }
function drawCard(playerId) { const player = getPlayerState(playerId); if (!player || gameState.gameEnded) return; if (player.deck.length > 0) { const drawnCardId = player.deck.shift(); player.hand.push(drawnCardId); addLogMessage(`Giocatore ${playerId} pesca una carta.`); console.log(`Giocatore ${playerId} pesca ${drawnCardId}`); } else { player.hp -= 1; addLogMessage(`Giocatore ${playerId} ha finito le carte e subisce 1 danno da fatica! HP: ${player.hp}`); console.warn(`Giocatore ${playerId} ha tentato di pescare da un mazzo vuoto.`); } }
function handleEndTurnClick() { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) { console.warn("Impossibile passare il turno ora."); return; } console.log("Giocatore 1 passa il turno."); addLogMessage("Giocatore 1 termina il suo turno."); gameState.turnNumber++; startTurn(2); }
function handleHandCardClick(event) {
    if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.selectingTarget) return;
    const cardElement = event.currentTarget;
    const cardId = cardElement.dataset.cardId;
    const cardData = getCardData(cardId);
    const player = getPlayerState(1);
    if (!player || !cardData) return;
    console.log(`Tentativo di giocare: ${cardData.nome} (ID: ${cardId})`);

    if (player.currentResources >= cardData.costo) {
        const isCreature = cardData.forza !== null || cardData.punti_ferita !== null;
        let placementSpot = null;
        if (isCreature) {
            if (player.field.length >= gameState.maxCreaturesPerPlayer) {
                addLogMessage(`Non puoi giocare ${cardData.nome}: massimo numero di creature (${gameState.maxCreaturesPerPlayer}) raggiunto.`);
                console.log("Limite creature raggiunto.");
                return;
            }
            placementSpot = findEmptyPlacementSpot(player.id);
            if (!placementSpot) {
                addLogMessage(`Non puoi giocare ${cardData.nome}: nessuna posizione libera nella tua zona di schieramento (Fila ${gameState.grid.rows - 1}).`);
                console.log("Nessuna posizione libera per il piazzamento.");
                return;
            }
        }
        const hasTargeting = typeof cardData.getTargetInfo === 'function';
        if (hasTargeting) {
            console.log(`${cardData.nome} richiede un bersaglio.`);
            player.currentResources -= cardData.costo;
            const cardIndex = player.hand.indexOf(cardId);
            if (cardIndex > -1) {
                 player.hand.splice(cardIndex, 1);
                 gameState.pendingActionInfo = { type: 'playCardFromHand', cardId: cardId, originalHandIndex: cardIndex, costPaid: cardData.costo };
                 console.log("Info per annullamento salvate:", gameState.pendingActionInfo);
                 const context = createCardContext(player.id, cardId);
                 const targetInfo = cardData.getTargetInfo(context);
                 startTargetSelection(cardId, targetInfo);
                 renderGame();
            } else {
                console.error("Carta cliccata non trovata nella mano!", cardId, player.hand);
                player.currentResources += cardData.costo;
            }
        } else {
            console.log(`${cardData.nome} non richiede bersaglio o è una creatura piazzabile.`);
            player.currentResources -= cardData.costo;
            const cardIndex = player.hand.indexOf(cardId);
            if (cardIndex > -1) { player.hand.splice(cardIndex, 1); }
            else { console.error("Carta cliccata non trovata nella mano!", cardId, player.hand); player.currentResources += cardData.costo; return; }
            if (isCreature) {
                if (!placementSpot) {
                     console.error("Errore logico: placementSpot non definito per creatura!");
                     addLogMessage(`! Errore piazzamento ${cardData.nome} !`);
                } else {
                    const instanceId = generateInstanceId(player.id, cardId);
                    const newCreature = {
                        cardId: cardId, instanceId: instanceId, position: placementSpot,
                        currentHp: cardData.punti_ferita,
                        canAttackThisTurn: !cardData.keywords?.includes('Lento'),
                        ownerId: player.id
                    };
                    player.field.push(newCreature);
                    addLogMessage(`Giocatore ${player.id} schiera ${cardData.nome} in Fila ${placementSpot.row}, Colonna ${placementSpot.col}.`);
                    executeEffect(cardId, 'onPlay', player.id, { instanceId: instanceId });
                }
            } else {
                addLogMessage(`Giocatore ${player.id} lancia ${cardData.nome}.`);
                executeEffect(cardId, 'onPlay', player.id);
                player.graveyard.push(cardId);
            }
            renderGame();
        } // Chiusura del blocco if (!hasTargeting)
    } else { // Chiusura del blocco if (player.currentResources >= cardData.costo)
        addLogMessage(`Risorse insufficienti per giocare ${cardData.nome} (costa ${cardData.costo}, hai ${player.currentResources}).`);
        console.log("Risorse insufficienti.");
    }
} // Chiusura della funzione handleHandCardClick
function executeEffect(cardId, trigger, playerId, additionalContext = {}) { const cardData = getCardData(cardId); const effectFunction = cardData && cardData[trigger]; if (typeof effectFunction === 'function') { console.log(`Esecuzione effetto ${trigger} per ${cardData.nome}`); const context = createCardContext(playerId, cardId, additionalContext.instanceId); Object.assign(context, additionalContext); try { effectFunction(context); } catch (error) { console.error(`Errore durante l'esecuzione dell'effetto ${trigger} per ${cardId}:`, error); addLogMessage(`! Errore nell'effetto di ${cardData.nome} !`); } } }
function handleFieldCardClick(event) { if (gameState.gameEnded) return; const cardElement = event.currentTarget; const cellElement = cardElement.closest('.grid-cell'); const instanceId = cardElement.dataset.instanceId; const cardId = cardElement.dataset.cardId; const cardData = getCardData(cardId); if (!cardData || !cellElement || !instanceId) return; let creatureState = null; let ownerId = null; for(const player of gameState.players) { const found = player.field.find(c => c.instanceId === instanceId); if (found) { creatureState = found; ownerId = player.id; break; } } if (!creatureState) { console.error(`Stato non trovato per creatura con instanceId: ${instanceId}`); return; } if (gameState.selectingTarget) { if (gameState.potentialTargets.includes(cardElement)) { console.log(`Target valido selezionato: ${cardData.nome} (Instance: ${instanceId})`); const context = createCardContext(1, gameState.selectingTarget.sourceCardId); if (typeof gameState.selectingTarget.targetInfo.onTargetSelected === 'function') { try { gameState.selectingTarget.targetInfo.onTargetSelected(cardElement, context); } catch (error) { console.error(`Errore onTargetSelected:`, error); cancelTargetSelection(); return; } } else { console.warn(`Nessuna onTargetSelected definita`); } gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); renderGame(); } else { console.log("Target non valido cliccato."); addLogMessage("Bersaglio non valido."); } return; } console.log(`Cliccato su ${cardData.nome} (Instance: ${instanceId}) in campo, Proprietario: ${ownerId}`); addLogMessage(`Cliccato su ${cardData.nome} (${creatureState.currentHp} HP) in F:${creatureState.position.row}, C:${creatureState.position.col}.`); }
function startTargetSelection(sourceCardId, targetInfo) { console.log("Inizio selezione target per:", sourceCardId, "Info:", targetInfo); if (!targetInfo || typeof targetInfo.filter !== 'function' || typeof targetInfo.onTargetSelected !== 'function') { console.error(`Informazioni di targeting non valide o incomplete fornite per ${sourceCardId}`); cancelTargetSelection(); return; } if (!gameState.pendingActionInfo || gameState.pendingActionInfo.cardId !== sourceCardId) { console.error("Tentativo di startTargetSelection senza un'azione pendente valida!"); cancelTargetSelection(); return; } gameState.selectingTarget = { sourceCardId: sourceCardId, targetInfo: targetInfo }; gameState.potentialTargets = []; clearHighlights(); const filterContext = createCardContext(1, sourceCardId); const allFieldCards = document.querySelectorAll('#field-shared .card.on-grid'); allFieldCards.forEach(cardElement => { let isValid = false; try { isValid = targetInfo.filter(cardElement, filterContext); } catch (error) { console.error(`Errore durante l'esecuzione del filtro target per ${sourceCardId}:`, error); } if (isValid) { cardElement.classList.add('potential-target'); gameState.potentialTargets.push(cardElement); } }); if (gameState.potentialTargets.length === 0) { addLogMessage(`Nessun bersaglio valido trovato per ${getCardData(sourceCardId).nome}. Azione annullata.`); console.log("Nessun target valido trovato, annullamento automatico."); cancelTargetSelection(); } else { addLogMessage(`${targetInfo.prompt || `Seleziona un bersaglio per ${getCardData(sourceCardId).nome}.`} (Click destro o ESC per annullare)`); renderGame(); } }
function clearHighlights() { document.querySelectorAll('.potential-target').forEach(el => el.classList.remove('potential-target')); }
function cancelTargetSelection() { console.log("Tentativo di annullare selezione target..."); if (gameState.selectingTarget && gameState.pendingActionInfo) { console.log("Annullamento in corso per:", gameState.pendingActionInfo); addLogMessage(`Azione per ${getCardData(gameState.pendingActionInfo.cardId).nome} annullata.`); const player = getPlayerState(1); const { type, cardId, originalHandIndex, costPaid } = gameState.pendingActionInfo; if (player && type === 'playCardFromHand') { player.currentResources += costPaid; console.log(`Risorse restituite: +${costPaid}, Totale: ${player.currentResources}`); player.hand.splice(originalHandIndex, 0, cardId); console.log(`Carta ${cardId} restituita alla mano indice ${originalHandIndex}`); } gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); renderGame(); } else { console.log("Nessuna azione di selezione target da annullare."); } }
function handleGridCellClick(event) { const cell = event.currentTarget; if (!cell.querySelector('.card')) { const row = cell.dataset.row; const col = cell.dataset.col; console.log(`Cliccata cella vuota: Fila ${row}, Colonna ${col}`); } }

// ==================== 6. Logica Avversario (IA con Piazzamento Aggiornato) ====================
function runOpponentTurn() {
    if (gameState.gameEnded || gameState.currentPlayerId !== 2) return;
    const player = getPlayerState(2); // Giocatore IA (G2)
    const opponent = getPlayerState(1);
    if (!player || !opponent) return;
    addLogMessage("Giocatore 2 (IA) sta agendo...");

    const playCardAI = () => {
        let cardPlayed = false;
        const playableCards = player.hand
            .map((id, index) => ({ id, index, data: getCardData(id) }))
            .filter(c => c.data && player.currentResources >= c.data.costo)
            .sort((a, b) => b.data.costo - a.data.costo);

        for (const cardToPlay of playableCards) {
            const cardId = cardToPlay.id;
            const cardData = cardToPlay.data;
            const isCreature = cardData.forza !== null || cardData.punti_ferita !== null;

            if (typeof cardData.getTargetInfo === 'function') {
                console.log(`IA: Salta ${cardData.nome} perchè richiede target.`);
                continue;
            }

            let placementSpot = null;
            if (isCreature) {
                if (player.field.length >= gameState.maxCreaturesPerPlayer) {
                    console.log(`IA: Limite creature (${gameState.maxCreaturesPerPlayer}) raggiunto.`);
                    continue;
                }
                placementSpot = findEmptyPlacementSpot(player.id); // Cerca posto per G2 (riga 0)
                if (!placementSpot) {
                    console.log(`IA: Nessuna posizione libera per piazzare ${cardData.nome}.`);
                    continue;
                }
            }

            console.log(`IA: Gioca ${cardData.nome}`);
            player.currentResources -= cardData.costo;
            const currentHandIndex = player.hand.indexOf(cardId);
             if (currentHandIndex > -1) {
                 player.hand.splice(currentHandIndex, 1);
             } else {
                 console.error(`IA Errore: Carta ${cardId} non trovata in mano dopo filtro!`);
                 player.currentResources += cardData.costo;
                 continue;
             }

            if (isCreature) {
                 if (placementSpot) {
                    const instanceId = generateInstanceId(player.id, cardId);
                    const newCreature = { cardId: cardId, instanceId: instanceId, position: placementSpot, currentHp: cardData.punti_ferita, canAttackThisTurn: !cardData.keywords?.includes('Lento'), ownerId: player.id };
                    player.field.push(newCreature);
                    addLogMessage(`Giocatore ${player.id} schiera ${cardData.nome} in Fila ${placementSpot.row}, Colonna ${placementSpot.col}.`);
                    executeEffect(cardId, 'onPlay', player.id, { instanceId: instanceId });
                } else {
                     console.error("IA Errore logico: posto piazzamento non trovato anche se controllato!");
                     addLogMessage(`! IA Errore piazzamento ${cardData.nome} !`);
                }
            } else {
                addLogMessage(`Giocatore ${player.id} lancia ${cardData.nome}.`);
                executeEffect(cardId, 'onPlay', player.id);
                player.graveyard.push(cardId);
            }
            cardPlayed = true;
            renderGame();
            break; // IA gioca solo UNA carta
        }
        return cardPlayed;
    };

    const attackAI = () => {
        let didAttack = false;
        const attackers = player.field
            .filter(c => { const d = getCardData(c.cardId); return d?.forza > 0 && c.canAttackThisTurn; });
        if (attackers.length > 0) {
            const attackerInstance = attackers[0];
            const attackerData = getCardData(attackerInstance.cardId);
            const damage = attackerData.forza;
            if (opponent) {
                opponent.hp -= damage;
                attackerInstance.canAttackThisTurn = false;
                addLogMessage(`${attackerData.nome} (IA) attacca Giocatore 1 per ${damage} danni. HP G1: ${opponent.hp}`);
                didAttack = true;
                renderGame();
            }
        }
        return didAttack;
    };

    setTimeout(() => {
        if (gameState.gameEnded || gameState.currentPlayerId !== 2) return;
        const played = playCardAI();
        const playableCardsExist = player.hand.some(id => { const data = getCardData(id); return data && player.currentResources >= data.costo && typeof data.getTargetInfo !== 'function'; });
        if (!played && playableCardsExist) { addLogMessage("Giocatore 2 non gioca carte."); }
        else if (!played) { addLogMessage("Giocatore 2 non ha carte giocabili."); }
        setTimeout(() => {
            if (gameState.gameEnded || gameState.currentPlayerId !== 2) return;
            const attacked = attackAI();
            setTimeout(() => {
                if (gameState.gameEnded || gameState.currentPlayerId !== 2) return;
                console.log("Giocatore 2 (IA) termina il turno.");
                addLogMessage("Giocatore 2 termina il suo turno.");
                if (!gameState.gameEnded) { startTurn(1); }
            }, 700);
        }, 800);
    }, 500);
}

// ==================== 7. Gestione Modale ====================
function openModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.add('active'); } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.remove('active'); if (modalId === 'graveyard-modal' && graveyardModalBody) { graveyardModalBody.innerHTML = ''; } } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeAllModals() { document.querySelectorAll('.modal.active').forEach(modal => { closeModal(modal.id); }); }
function showGraveyard(playerId) { const player = getPlayerState(playerId); if (!player || !graveyardModalBody || !graveyardModalTitle) return; console.log(`Visualizza cimitero Giocatore ${playerId}`); graveyardModalTitle.textContent = `Cimitero Giocatore ${playerId}`; graveyardModalBody.innerHTML = ''; if (player.graveyard.length === 0) { graveyardModalBody.innerHTML = '<p>Nessuna carta nel cimitero.</p>'; } else { player.graveyard.forEach(cardId => { const cardElement = renderCard(cardId, 'modal'); graveyardModalBody.appendChild(cardElement); }); } openModal('graveyard-modal'); }
function handleGraveyardClick(event) { if (gameState.gameEnded) return; const playerId = parseInt(event.currentTarget.dataset.playerId, 10); if (!playerId) return; showGraveyard(playerId); }

// ==================== 8. Inizializzazione Event Listener ====================
function addEventListeners() {
    if(endTurnButton) endTurnButton.addEventListener('click', handleEndTurnClick);
    if (graveyardP1Element) graveyardP1Element.addEventListener('click', handleGraveyardClick);
    if (graveyardP2Element) graveyardP2Element.addEventListener('click', handleGraveyardClick);
    if (showLogButton) { showLogButton.addEventListener('click', () => { openModal('log-modal'); }); }
    else { console.error("Bottone 'Mostra Log' non trovato!"); }
    closeButtons.forEach(button => { button.addEventListener('click', () => { const modalToClose = button.closest('.modal'); if (modalToClose) { closeModal(modalToClose.id); } }); });
    modals.forEach(modalElement => { modalElement.addEventListener('click', (event) => { if (event.target === modalElement) { closeModal(modalElement.id); } }); });
    document.addEventListener('contextmenu', (event) => { if (gameState.selectingTarget) { event.preventDefault(); cancelTargetSelection(); } });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (gameState.selectingTarget) { cancelTargetSelection(); } else { closeAllModals(); } } });
}

// ==================== 9. Inizializzazione Gioco ====================
function initGame() {
    console.log("Inizializzazione gioco...");
    if (typeof getCardData !== 'function' || typeof getAllCardIds !== 'function') { console.error("Errore critico: Funzioni getCardData o getAllCardIds non trovate. Assicurati che cards.js sia caricato correttamente PRIMA di game.js."); alert("Errore critico: Impossibile caricare le funzioni delle carte."); return; }
    const allCardIds = getAllCardIds();
    if (!allCardIds || allCardIds.length === 0) { console.error("Impossibile inizializzare: nessun ID carta trovato da cards.js!"); alert("Errore critico: Impossibile caricare le carte."); return; }
    const deckP1 = []; const deckP2 = []; const copiesPerCard = 2; // Metti 2 copie di ogni carta nel mazzo
    for (let i = 0; i < copiesPerCard; i++) { deckP1.push(...allCardIds); deckP2.push(...allCardIds); }
    gameState = { currentPlayerId: 1, turnNumber: 1, players: [ { id: 1, hp: 20, maxResources: 0, currentResources: 0, deck: [...deckP1], hand: [], field: [], graveyard: [] }, { id: 2, hp: 20, maxResources: 0, currentResources: 0, deck: [...deckP2], hand: [], field: [], graveyard: [] } ], grid: { rows: 6, cols: 6 }, maxCreaturesPerPlayer: 4, gameEnded: false, winner: null, selectingTarget: null, potentialTargets: [], pendingActionInfo: null };
    addLogMessage("Benvenuto nel Test LCG con Griglia 6x6!"); // Log iniziale aggiornato
    shuffleArray(gameState.players[0].deck); shuffleArray(gameState.players[1].deck);
    console.log(`Mazzi mescolati: G1 (${gameState.players[0].deck.length} carte), G2 (${gameState.players[1].deck.length} carte)`);
    const initialHandSize = 3;
    for (let i = 0; i < initialHandSize; i++) { if(gameState.players[0].deck.length > 0) gameState.players[0].hand.push(gameState.players[0].deck.shift()); if(gameState.players[1].deck.length > 0) gameState.players[1].hand.push(gameState.players[1].deck.shift()); }
    console.log("Mani iniziali pescate.");
    addEventListeners();
    startTurn(1); // Avvia il primo turno
}
function endGame(winnerId) { if (gameState.gameEnded) return; gameState.gameEnded = true; gameState.winner = winnerId; gameState.selectingTarget = null; gameState.potentialTargets = []; gameState.pendingActionInfo = null; clearHighlights(); addLogMessage(`Partita terminata! Giocatore ${winnerId} ha vinto!`); console.log(`Partita terminata! Vincitore: Giocatore ${winnerId}`); renderGame(); document.querySelectorAll('.card').forEach(card => { const clone = card.cloneNode(true); if(card.parentNode) card.parentNode.replaceChild(clone, card); }); setTimeout(() => alert(`Partita terminata! Giocatore ${winnerId} ha vinto!`), 100); }

// ==================== Avvio ====================
document.addEventListener('DOMContentLoaded', initGame);