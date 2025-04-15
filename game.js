/* File: game.js */
/* (Versione CSS Classes - Step 4 JS: Aggiornamento Funzioni Rendering) */

/* ==================== 1. Riferimenti Elementi DOM ==================== */
const turnIndicator = document.getElementById('turn-indicator');
const turnPlayerIndicator = document.getElementById('turn-player-indicator');
const endTurnButton = document.getElementById('end-turn-button');
const resPlayer1 = document.getElementById('res-player-1');
const maxResPlayer1 = document.getElementById('max-res-player-1');
const ecoDotsP1 = document.getElementById('eco-dots-1');
const deckCountP1Sidebar = document.getElementById('deck-count-1'); /* Span info */
const handAreaP1 = document.getElementById('hand-area-player1');
const deckP1Element = document.getElementById('deck-player-1'); /* Div deck */
const deckP1CountDisplay = document.getElementById('deck-count-1-display'); /* Span contatore */
const graveyardP1Element = document.getElementById('graveyard-player-1');
const graveyardCountP1Display = document.getElementById('graveyard-count-1-display');
const resPlayer2 = document.getElementById('res-player-2');
const maxResPlayer2 = document.getElementById('max-res-player-2');
const ecoDotsP2 = document.getElementById('eco-dots-2');
const deckCountP2Sidebar = document.getElementById('deck-count-2'); /* Span info */
const handAreaP2 = document.getElementById('hand-area-player2'); /* Placeholder mano G2 */
const deckP2Element = document.getElementById('deck-player-2'); /* Div deck */
const deckP2CountDisplay = document.getElementById('deck-count-2-display'); /* Span contatore */
const graveyardP2Element = document.getElementById('graveyard-player-2');
const graveyardCountP2Display = document.getElementById('graveyard-count-2-display');
const player1InfoArea = document.getElementById('player-1-info-area');
const player2InfoArea = document.getElementById('player-2-info-area');
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
const activeTerrainDisplayArea = document.querySelector('#active-terrain-display .card-display-area');
const heroDisplayP1 = document.querySelector('#hero-display-player-1 .card-display-area');
const objectiveDisplayP1 = document.querySelector('#objective-display-player-1 .card-display-area');
const heroDisplayP2 = document.querySelector('#hero-display-player-2 .card-display-area');
const phaseIndicatorP1 = document.getElementById('phase-indicator-1');
const phaseIndicatorP2 = document.getElementById('phase-indicator-2');
const phaseStepsP1 = { acquisizione: document.querySelector('#phase-indicator-1 #phase-acquisizione'), azione: document.querySelector('#phase-indicator-1 #phase-azione'), scarto: document.querySelector('#phase-indicator-1 #phase-scarto'), };
const phaseStepsP2 = { acquisizione: document.querySelector('#phase-indicator-2 #phase-acquisizione-2'), azione: document.querySelector('#phase-indicator-2 #phase-azione-2'), scarto: document.querySelector('#phase-indicator-2 #phase-scarto-2'), };


/* ==================== 2. STATI DEL GIOCO (Definizione) ==================== */
const GameStateEnum = { P1_ACQUISITION: 'P1_ACQUISITION', P1_ACTION: 'P1_ACTION', P1_ACTION_UNIT_SELECTED: 'P1_ACTION_UNIT_SELECTED', P1_DISCARD: 'P1_DISCARD', P2_ACQUISITION: 'P2_ACQUISITION', P2_ACTION_THINKING: 'P2_ACTION_THINKING', P2_DISCARD: 'P2_DISCARD', GAME_OVER: 'GAME_OVER', };

/* ==================== 3. Stato del Gioco (Oggetto Globale) ==================== */
let gameState = { currentPlayerId: 1, turnNumber: 1, activeTerrainId: null, currentState: null, selectedEntityForMovement: null, validMovementCells: [], players: [ { id: 1, heroId: null, objectiveId: null, objectiveCompleted: false, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [], maxHandSize: 5 }, { id: 2, heroId: null, objectiveId: null, objectiveCompleted: false, maxResources: 0, currentResources: 0, deck: [], hand: [], field: [], graveyard: [], maxHandSize: 5 } ], grid: { rows: 6, cols: 6 }, maxCreaturesPerPlayer: 4, maxTurnsPerPlayer: 10, gameEnded: false, winner: null, };

/* ==================== 4. Funzioni Utilità ==================== */
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }
function addLogMessage(message) { if (!logModalBody) { return; } const p = document.createElement('p'); const now = new Date(); const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`; p.innerHTML = `<span class="log-timestamp">[${timeString} T:${gameState.turnNumber} P:${gameState.currentPlayerId} ${gameState.currentState || 'INIT'}]</span> ${message}`; logModalBody.appendChild(p); logModalBody.scrollTop = logModalBody.scrollHeight; }
function getPlayerState(playerId) { return gameState.players.find(p => p.id === playerId) || null; }
function getOpponentState(currentPlayerId) { const opponentId = currentPlayerId === 1 ? 2 : 1; return getPlayerState(opponentId); }
function generateInstanceId(playerId, cardId) { return `p${playerId}_${cardId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`; }
function findEmptyPlacementSpot(playerId) { const playerState = getPlayerState(playerId); if (!playerState) return null; const currentCreatureCount = playerState.field.filter(entity => { const cardData = getCardData(entity.cardId); return cardData && (cardData.tipo?.trim().toLowerCase() === 'unità' || cardData.tipo?.trim().toLowerCase() === 'eroe'); }).length; if (currentCreatureCount >= gameState.maxCreaturesPerPlayer) { return null; } const placementRow = (playerId === 1) ? gameState.grid.rows - 1 : 0; for (let c = 0; c < gameState.grid.cols; c++) { const isOccupied = gameState.players.some(p => p.field.some(creature => creature.position.row === placementRow && creature.position.col === c )); if (!isOccupied) { return { row: placementRow, col: c }; } } return null; }
function getModifiedStats(entityState) { if (!entityState) return { attacco: 0, punti_ferita: 0, currentHp: 0, keywords: [] }; const baseCardData = getCardData(entityState.cardId); let modStats = { attacco: baseCardData?.attacco ?? 0, punti_ferita: baseCardData?.punti_ferita ?? 0, currentHp: entityState.currentHp, keywords: [...(baseCardData?.keywords || [])], }; if (gameState.activeTerrainId) { const terrainData = getCardData(gameState.activeTerrainId); if (gameState.activeTerrainId === 't001' && baseCardData?.tipo?.trim().toLowerCase() === 'unità') { modStats.attacco += 1; } } return modStats; }
function isValidAndEmptyCell(row, col) { if (row < 0 || row >= gameState.grid.rows || col < 0 || col >= gameState.grid.cols) { return false; } const isOccupied = gameState.players.some(p => p.field.some(entity => entity.position.row === row && entity.position.col === col) ); return !isOccupied; }

/* ==================== 5. Funzioni di Rendering (Aggiornate) ==================== */

function renderCard(cardId, location = 'hand', instanceId = null) {
    const baseCardData = getCardData(cardId);
    if (!baseCardData || baseCardData.id === 'unknown') { console.error(`Dati non validi per ID ${cardId} in renderCard.`); return null; }
    let displayData = baseCardData; let entityState = null;
    if (location === 'field' && instanceId) { for (const player of gameState.players) { const found = player.field.find(e => e.instanceId === instanceId); if (found) { entityState = found; break; } } if (entityState) { const modifiedStats = getModifiedStats(entityState); displayData = { ...baseCardData, attacco: modifiedStats.attacco, punti_ferita: modifiedStats.punti_ferita, }; } }
    const cardDiv = document.createElement('div'); cardDiv.dataset.cardId = cardId; if (instanceId) cardDiv.dataset.instanceId = instanceId; cardDiv.dataset.location = location;
    let cardClass = 'card'; if (location === 'hand') { cardClass += ' in-hand'; } else if (location === 'field') { cardClass += ' on-grid'; } else if (location === 'modal') { cardClass += ' in-hand in-modal'; } else if (location === 'terrain') { cardClass += ' terrain-card'; } else if (location === 'hero-display') { cardClass += ' in-hand in-display'; } else if (location === 'objective-display') { cardClass += ' in-hand in-display'; } cardDiv.className = cardClass;
    const cardName = document.createElement('div'); cardName.classList.add('card-name'); cardName.textContent = displayData.nome; const cardCost = document.createElement('div'); cardCost.classList.add('card-cost'); cardCost.textContent = displayData.costo; const cardArt = document.createElement('div'); cardArt.classList.add('card-art'); cardDiv.appendChild(cardName); cardDiv.appendChild(cardCost); cardDiv.appendChild(cardArt);
    if (location === 'field' && entityState) { const hpDisplay = document.createElement('div'); hpDisplay.classList.add('card-hp-display'); hpDisplay.textContent = `HP: ${entityState.currentHp}`; cardDiv.appendChild(hpDisplay); }
    if (displayData.attacco !== null || displayData.punti_ferita !== null) { const cardStats = document.createElement('div'); cardStats.classList.add('card-stats'); const attSpan = document.createElement('span'); attSpan.textContent = displayData.attacco !== null ? displayData.attacco : '-'; const pfSpan = document.createElement('span'); pfSpan.textContent = displayData.punti_ferita !== null ? displayData.punti_ferita : '-'; cardStats.appendChild(attSpan); cardStats.appendChild(pfSpan); cardDiv.appendChild(cardStats); }
    let tooltipText = `${baseCardData.nome} [${baseCardData.tipo.toUpperCase()}] (${baseCardData.costo})\n`; if (baseCardData.attacco !== null) tooltipText += `ATT:${baseCardData.attacco} `; if (baseCardData.punti_ferita !== null) tooltipText += `PF:${baseCardData.punti_ferita}`; tooltipText = tooltipText.trim() + '\n'; if (baseCardData.description) tooltipText += `\n${baseCardData.description}\n`; if (baseCardData.keywords && baseCardData.keywords.length > 0) { tooltipText += `\nKeywords: ${baseCardData.keywords.join(', ')}`; } if (location === 'field' && entityState) { tooltipText += `\nHP Attuali: ${entityState.currentHp}`; if (displayData.attacco !== baseCardData.attacco) { tooltipText += ` (ATT Mod: ${displayData.attacco})`; } if (entityState.hasPerformedAction) tooltipText += `\n(Ha già agito)`; } cardDiv.title = tooltipText.trim();
    const setFallbackText = () => { cardArt.textContent = 'Immagine non disponibile'; cardArt.classList.add('card-art-fallback'); cardArt.style.backgroundImage = 'none'; }; const removeFallbackStyle = () => { cardArt.classList.remove('card-art-fallback'); cardArt.textContent = ''; };
    if (baseCardData.illustrazione) { const img = new Image(); img.onload = () => { removeFallbackStyle(); cardArt.style.backgroundImage = `url('${baseCardData.illustrazione}')`; }; img.onerror = () => { setFallbackText(); }; img.src = baseCardData.illustrazione; } else { setFallbackText(); }
    /* Rimosso stile inline per modale/display */
    if (!gameState.gameEnded) { if (location === 'hand' && gameState.currentPlayerId === 1 && getPlayerState(1)?.hand.includes(cardId)) { cardDiv.addEventListener('click', handleHandCardClick); } else if (location === 'field') { cardDiv.addEventListener('click', handleFieldCardClick); } }
    if (entityState && entityState.hasPerformedAction) { cardDiv.classList.add('has-acted'); }
    return cardDiv;
}

function renderHand(playerId) {
    const playerState = getPlayerState(playerId);
    const handElement = (playerId === 1) ? handAreaP1 : handAreaP2;
    if (!playerState || !handElement) return;
    handElement.innerHTML = '';
    if (playerId === 1) { /* Mano G1 */
        playerState.hand.forEach(cardId => {
            const cardElement = renderCard(cardId, 'hand');
            if (cardElement instanceof Node) {
                handElement.appendChild(cardElement);
            } else { console.error(`renderCard mano G${playerId} ID ${cardId} non Nodo.`); }
        });
    } else { /* Mano G2 (Placeholder statico + conteggio) */
        const handPlaceholderContent = document.querySelector('#hand-area-player2 .hand-placeholder-content');
        if(handPlaceholderContent) {
             handPlaceholderContent.textContent = `(${playerState.hand.length} carte nascoste)`;
        } else {
             /* Fallback se il div non esiste */
             handElement.innerHTML = `<div class='card-placeholder'>(${playerState.hand.length} carte)</div>`;
        }
    }
}

function renderField() {
    if (!sharedFieldElement) { console.error("Elemento campo condiviso non trovato!"); return; }
    sharedFieldElement.innerHTML = '';
    const creatureMap = new Map();
    gameState.players.forEach(player => { player.field.forEach(entity => { const posKey = `${entity.position.row}-${entity.position.col}`; creatureMap.set(posKey, entity); }); });
    for (let r = 0; r < gameState.grid.rows; r++) { for (let c = 0; c < gameState.grid.cols; c++) { const cell = document.createElement('div'); cell.classList.add('grid-cell'); cell.dataset.row = r; cell.dataset.col = c; let cellTitle = `Cella (F:${r}, C:${c})`; if (r === 0) { cell.classList.add('initial-placement-g2'); cellTitle = `Zona Sch. G2 (F:${r}, C:${c})`; } else if (r === gameState.grid.rows - 1) { cell.classList.add('initial-placement-g1'); cellTitle = `Zona Sch. G1 (F:${r}, C:${c})`; } const posKey = `${r}-${c}`; const entityInCell = creatureMap.get(posKey); if (entityInCell) { const cardElement = renderCard(entityInCell.cardId, 'field', entityInCell.instanceId); if (cardElement instanceof Node) { cardElement.classList.add(entityInCell.ownerId === 1 ? 'player1-card' : 'player2-card'); if (entityInCell.isHero) { cardElement.classList.add('is-hero'); } if (entityInCell.instanceId === gameState.selectedEntityForMovement) { cardElement.classList.add('selected-for-move'); } cell.appendChild(cardElement); cellTitle += ` - G${entityInCell.ownerId}: ${getCardData(entityInCell.cardId)?.nome || '?'} (HP: ${entityInCell.currentHp})`; } else { console.error(`renderCard campo ${entityInCell.cardId} non Nodo.`); } } else { const isMovableCell = gameState.validMovementCells.some(validCell => validCell.row === r && validCell.col === c); if (isMovableCell) { cell.classList.add('movement-valid'); cellTitle += ' - Movimento possibile'; } cell.addEventListener('click', handleGridCellClick); } cell.title = cellTitle; sharedFieldElement.appendChild(cell); } }
}

/** Funzione Helper per renderizzare l'Eco */
function renderEcoDots(containerElement, current, max) { if (!containerElement) return; containerElement.innerHTML = ''; const maxVisualDots = 10; for (let i = 0; i < maxVisualDots; i++) { const dot = document.createElement('div'); dot.classList.add('eco-dot'); if (i < current) { dot.classList.add('active'); } else if (i < max) { dot.classList.add('max'); } containerElement.appendChild(dot); } }

/** Aggiorna le informazioni del giocatore nelle aree dedicate */
function renderPlayerInfo(playerId) {
    const playerState = getPlayerState(playerId);
    if (!playerState) return;
    const isP1 = playerId === 1;
    /* Riferimenti specifici per giocatore */
    const resEl = isP1 ? resPlayer1 : resPlayer2;
    const maxResEl = isP1 ? maxResPlayer1 : maxResPlayer2;
    const ecoDotsEl = isP1 ? ecoDotsP1 : ecoDotsP2;
    const deckCountEl = isP1 ? deckP1CountDisplay : deckP2CountDisplay;
    const graveyardCountEl = isP1 ? graveyardCountP1Display : graveyardCountP2Display;
    const deckEl = isP1 ? deckP1Element : deckP2Element;
    /* Riferimenti info sidebar rimossi perché duplici */
    /* const deckCountSidebarEl = isP1 ? deckCountP1Sidebar : deckCountP2Sidebar; */

    /* Aggiorna Eco */
    if (resEl) resEl.textContent = playerState.currentResources;
    if (maxResEl) maxResEl.textContent = playerState.maxResources;
    renderEcoDots(ecoDotsEl, playerState.currentResources, playerState.maxResources);

    /* Aggiorna Conteggi Mazzo/Cimitero */
    if (deckCountEl) deckCountEl.textContent = playerState.deck.length;
    if (deckEl) deckEl.title = `Mazzo G${playerId} (${playerState.deck.length})`;
    if (graveyardCountEl) graveyardCountEl.textContent = playerState.graveyard.length;

    /* Aggiorna HP (solo se l'elemento esiste - potrebbero essere rimossi dall'HTML) */
    /* const hpEl = isP1 ? hpPlayer1 : hpPlayer2; */
    /* if (hpEl) hpEl.textContent = playerState.hp; */
}

/** Renderizza Eroe, Terreno, Obiettivo */
function renderGameInfo() {
    /* Render Terreno */
    if (activeTerrainDisplayArea) { activeTerrainDisplayArea.innerHTML = ''; if (gameState.activeTerrainId) { const terrainCardData = getCardData(gameState.activeTerrainId); if (terrainCardData && terrainCardData.id !== 'unknown') { const terrainCardElement = renderCard(gameState.activeTerrainId, 'terrain'); if (terrainCardElement instanceof Node) { activeTerrainDisplayArea.appendChild(terrainCardElement); } else { console.error("renderCard Terreno non Nodo."); activeTerrainDisplayArea.innerHTML = '<span class="placeholder-text">(Errore Render)</span>'; } } else { activeTerrainDisplayArea.innerHTML = '<span class="placeholder-text">(Errore Dati)</span>'; } } else { activeTerrainDisplayArea.innerHTML = '<span class="placeholder-text">(Nessuno)</span>'; } }
    /* Render Eroi e Obiettivo G1 */
    gameState.players.forEach(player => { const heroDisplay = (player.id === 1) ? heroDisplayP1 : heroDisplayP2; const objectiveDisplay = (player.id === 1) ? objectiveDisplayP1 : null; if (heroDisplay) { heroDisplay.innerHTML = ''; if (player.heroId) { const heroCardData = getCardData(player.heroId); if (heroCardData && heroCardData.id !== 'unknown') { const heroInstance = player.field.find(e => e.cardId === player.heroId && e.isHero); const heroCardElement = renderCard(player.heroId, 'hero-display', heroInstance?.instanceId); if (heroCardElement instanceof Node) { heroDisplay.appendChild(heroCardElement); heroDisplay.title = `${heroCardData.nome} (Eroe)`; } else { console.error(`renderCard Eroe G${player.id} non Nodo.`); heroDisplay.innerHTML = '<span class="placeholder-text">(Errore Render)</span>'; } } else { heroDisplay.innerHTML = '<span class="placeholder-text">(Errore Dati)</span>'; } } else { heroDisplay.innerHTML = '<span class="placeholder-text">(Nessuno)</span>'; } } if (objectiveDisplay && player.id === 1) { objectiveDisplay.innerHTML = ''; if (player.objectiveId) { const objectiveCardData = getCardData(player.objectiveId); if (objectiveCardData && objectiveCardData.id !== 'unknown') { const objectiveCardElement = renderCard(player.objectiveId, 'objective-display'); if (objectiveCardElement instanceof Node) { objectiveDisplay.appendChild(objectiveCardElement); objectiveDisplay.title = `${objectiveCardData.nome} (Obiettivo)`; } else { console.error("renderCard Obiettivo G1 non Nodo."); objectiveDisplay.innerHTML = '<span class="placeholder-text">(Errore Render)</span>'; } } else { objectiveDisplay.innerHTML = '<span class="placeholder-text">(Errore Dati)</span>'; } } else { objectiveDisplay.innerHTML = '<span class="placeholder-text">(Nessuno)</span>'; } } });
}

/** Renderizza lo stato completo del gioco */
function renderGame() {
    renderPlayerInfo(1);
    renderPlayerInfo(2);
    renderGameInfo();
    renderHand(1); /* Mano G2 è statica */
    renderField();

    /* Aggiorna indicatori turno e giocatore */
    if(turnIndicator) turnIndicator.textContent = gameState.turnNumber;
    if(turnPlayerIndicator) turnPlayerIndicator.textContent = `G${gameState.currentPlayerId}`;

    /* Abilita/Disabilita controlli e highlight giocatore */
    const isPlayer1ActionState = gameState.currentPlayerId === 1 && (gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED);
    if(endTurnButton) endTurnButton.disabled = gameState.gameEnded || !isPlayer1ActionState;
    if(showLogButton) showLogButton.disabled = gameState.gameEnded;

    /* Aggiorna indicatore di fase visivo */
    const currentPhaseIndicator = (gameState.currentPlayerId === 1) ? phaseIndicatorP1 : phaseIndicatorP2;
    const otherPhaseIndicator = (gameState.currentPlayerId === 1) ? phaseIndicatorP2 : phaseIndicatorP1;
    const currentPhaseSteps = (gameState.currentPlayerId === 1) ? phaseStepsP1 : phaseStepsP2;
    const otherPhaseSteps = (gameState.currentPlayerId === 1) ? phaseStepsP2 : phaseStepsP1;

    if (currentPhaseIndicator && otherPhaseIndicator) {
        let activePhaseKey = null;
        if (gameState.currentState) {
            const stateString = gameState.currentState;
            if (stateString.includes('ACQUISITION')) activePhaseKey = 'acquisizione';
            else if (stateString.includes('ACTION') || stateString.includes('THINKING')) activePhaseKey = 'azione';
            else if (stateString.includes('DISCARD')) activePhaseKey = 'scarto';
        }

        /* Aggiorna indicatore giocatore CORRENTE */
        for (const phaseKey in currentPhaseSteps) {
            const stepElement = currentPhaseSteps[phaseKey];
            if (stepElement) {
                stepElement.classList.remove('active-phase', 'clickable');
                if (phaseKey === activePhaseKey && gameState.currentState !== GameStateEnum.GAME_OVER) {
                    stepElement.classList.add('active-phase');
                }
                if (!gameState.gameEnded && gameState.currentPlayerId === 1) {
                     if (phaseKey === 'azione' && gameState.currentState === GameStateEnum.P1_ACQUISITION) { stepElement.classList.add('clickable'); }
                     else if (phaseKey === 'scarto' && (gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED)) { stepElement.classList.add('clickable'); }
                 }
            }
        }
         currentIndicator.style.opacity = '1';

         /* Assicura che l'indicatore dell'altro giocatore sia spento */
         otherIndicator.style.opacity = '0.5';
         Object.values(otherPhaseSteps).forEach(el => el?.classList.remove('active-phase', 'clickable'));

         /* Gestione stato GAME_OVER */
          if (gameState.currentState === GameStateEnum.GAME_OVER) {
             Object.values(phaseStepsP1).forEach(el => el?.classList.remove('active-phase', 'clickable'));
             Object.values(phaseStepsP2).forEach(el => el?.classList.remove('active-phase', 'clickable'));
             if(phaseIndicatorP1) phaseIndicatorP1.style.opacity = '0.5';
             if(phaseIndicatorP2) phaseIndicatorP2.style.opacity = '0.5';
         }
    }

    /* Evidenzia giocatore attivo (Info Area colonna dx) */
    const infoAreaP1 = document.getElementById('player-1-info-area');
    const infoAreaP2 = document.getElementById('player-2-info-area');
    if (!gameState.gameEnded) { if (gameState.currentPlayerId === 1) { if(infoAreaP1) infoAreaP1.classList.add('active-turn'); if(infoAreaP2) infoAreaP2.classList.remove('active-turn'); if(deckP1Element) deckP1Element.classList.remove('deck-inactive'); } else { if(infoAreaP1) infoAreaP1.classList.remove('active-turn'); if(infoAreaP2) infoAreaP2.classList.add('active-turn'); if(deckP1Element) deckP1Element.classList.add('deck-inactive'); } } else { if(infoAreaP1) infoAreaP1.classList.remove('active-turn'); if(infoAreaP2) infoAreaP2.classList.remove('active-turn'); if(deckP1Element) deckP1Element.classList.add('deck-inactive'); if(deckP2Element) deckP2Element.classList.add('deck-inactive'); }
}


/* ==================== 6. State Machine: Transizioni e Azioni ==================== */
function transitionToState(newState) { if (gameState.gameEnded && newState !== GameStateEnum.GAME_OVER) { return; } if (!Object.values(GameStateEnum).includes(newState)) { console.error(`Stato non valido: ${newState}`); return; } const oldState = gameState.currentState; console.log(`Transizione Stato: ${oldState} -> ${newState}`); if (oldState === GameStateEnum.P1_ACTION_UNIT_SELECTED && newState !== GameStateEnum.P1_ACTION_UNIT_SELECTED) { clearMovementSelectionState(); } gameState.currentState = newState; addLogMessage(`--- Nuovo Stato: ${newState} ---`); enterStateActions(newState); renderGame(); }
function enterStateActions(state) { const player = getPlayerState(gameState.currentPlayerId); if (!player && state !== GameStateEnum.GAME_OVER) { console.error("Errore critico: Giocatore non trovato!"); return; } console.log(`Azioni ingresso per stato: ${state}`); switch (state) { case GameStateEnum.P1_ACQUISITION: addLogMessage(`Inizio Fase Acquisizione per G1.`); if (player.maxResources < 10) { player.maxResources++; } player.currentResources = player.maxResources; addLogMessage(`Eco: ${player.currentResources}/${player.maxResources}.`); drawCard(1); player.field.forEach(c => { c.hasPerformedAction = false; const d = getCardData(c.cardId); c.canAttackThisTurn = !d?.keywords?.includes('Lento'); }); break; case GameStateEnum.P2_ACQUISITION: const player2 = getPlayerState(2); if (!player2) break; addLogMessage(`Inizio Fase Acquisizione per G2.`); if (player2.maxResources < 10) { player2.maxResources++; } player2.currentResources = player2.maxResources; addLogMessage(`Eco IA: ${player2.currentResources}/${player2.maxResources}.`); drawCard(2); player2.field.forEach(c => { c.hasPerformedAction = false; const d = getCardData(c.cardId); c.canAttackThisTurn = !d?.keywords?.includes('Lento'); }); transitionToState(GameStateEnum.P2_ACTION_THINKING); break; case GameStateEnum.P1_ACTION: addLogMessage("Fase Azione: Gioca carte o muovi/attacca. Premi Spazio o bottone/indicatore per terminare."); if(endTurnButton) endTurnButton.disabled = false; break; case GameStateEnum.P1_ACTION_UNIT_SELECTED: addLogMessage("Unità selezionata. Clicca cella valida per muovere/attaccare, sull'unità o ESC per deselezionare."); if(endTurnButton) endTurnButton.disabled = false; break; case GameStateEnum.P1_DISCARD: case GameStateEnum.P2_DISCARD: if(endTurnButton) endTurnButton.disabled = true; startScartoLogic(); break; case GameStateEnum.P2_ACTION_THINKING: addLogMessage("IA sta pensando..."); if(endTurnButton) endTurnButton.disabled = true; runOpponentTurnActions(); break; case GameStateEnum.GAME_OVER: addLogMessage("Partita Conclusa."); if (endTurnButton) endTurnButton.disabled = true; break; default: console.warn(`Nessuna azione di ingresso definita per: ${state}`); } }

/* ==================== 7. Logica Azioni di Gioco e Fasi ==================== */
function advancePhase() { if (gameState.gameEnded) return; const currentPhase = gameState.currentState; const currentPlayerId = gameState.currentPlayerId; let nextState = null; let nextPlayerId = currentPlayerId; let nextTurnNumber = gameState.turnNumber; console.log(`Tentativo avanzamento da ${currentPhase} per G${currentPlayerId}`); if (currentPhase === GameStateEnum.P1_ACQUISITION) { nextState = GameStateEnum.P1_ACTION; } else if (currentPhase === GameStateEnum.P1_ACTION || currentPhase === GameStateEnum.P1_ACTION_UNIT_SELECTED) { nextState = GameStateEnum.P1_DISCARD; } else if (currentPhase === GameStateEnum.P1_DISCARD) { addLogMessage(`Fine turno ${gameState.turnNumber} per Giocatore 1.`); nextPlayerId = 2; nextState = GameStateEnum.P2_ACQUISITION; } else if (currentPhase === GameStateEnum.P2_DISCARD) { addLogMessage(`Fine turno ${gameState.turnNumber} per Giocatore 2.`); if (gameState.turnNumber >= gameState.maxTurnsPerPlayer) { endGame(0, `Limite ${gameState.maxTurnsPerPlayer} turni`); return; } nextPlayerId = 1; nextTurnNumber++; nextState = GameStateEnum.P1_ACQUISITION; } if (nextState) { gameState.currentPlayerId = nextPlayerId; gameState.turnNumber = nextTurnNumber; transitionToState(nextState); } else { console.error(`Errore logica avanzamento fase da ${currentPhase}!`); } }
function drawCard(playerId) { const player = getPlayerState(playerId); if (!player || gameState.gameEnded) return; if (player.deck.length > 0) { const drawnCardId = player.deck.shift(); player.hand.push(drawnCardId); addLogMessage(`G${playerId} pesca ${getCardData(drawnCardId)?.nome || 'carta'}.`); } else { addLogMessage(`G${playerId} finisce le carte!`); console.warn(`G${playerId} pesca da mazzo vuoto.`); } renderHand(playerId); }
function handleEndTurnClick() { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || !(gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED) ) { return; } console.log("G1 termina Fase Azione."); addLogMessage("G1 passa a Fase Scarto."); transitionToState(GameStateEnum.P1_DISCARD); }
function handleHandCardClick(event) { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || gameState.currentState !== GameStateEnum.P1_ACTION) { if(!gameState.gameEnded && gameState.currentState !== GameStateEnum.P1_ACTION) addLogMessage("Puoi giocare carte solo prima di selezionare un'unità."); return; } const cardElement = event.currentTarget; const cardId = cardElement.dataset.cardId; const cardData = getCardData(cardId); const player = getPlayerState(1); if (!player || !cardData) return; if (player.currentResources >= cardData.costo) { const typeLower = cardData.tipo?.trim().toLowerCase(); const isPlaceable = typeLower === 'unità' || typeLower === 'eroe'; let placementSpot = null; if (isPlaceable) { placementSpot = findEmptyPlacementSpot(player.id); if (!placementSpot) { addLogMessage(`Nessun posto/Limite per ${cardData.nome}.`); return; } } player.currentResources -= cardData.costo; const cardIndex = player.hand.indexOf(cardId); if (cardIndex > -1) { player.hand.splice(cardIndex, 1); } else { console.error("Carta non trovata!", cardId, player.hand); player.currentResources += cardData.costo; return; } if (isPlaceable) { if (!placementSpot) { console.error("Errore piazzamento!"); addLogMessage(`! Errore ${cardData.nome} !`); } else { const instanceId = generateInstanceId(player.id, cardId); const newEntity = { cardId: cardId, instanceId: instanceId, position: placementSpot, currentHp: cardData.punti_ferita, canAttackThisTurn: !cardData.keywords?.includes('Lento'), ownerId: player.id, isHero: typeLower === 'eroe', hasPerformedAction: false }; player.field.push(newEntity); addLogMessage(`G${player.id} schiera ${cardData.nome} [${cardData.tipo.toUpperCase()}] in F:${placementSpot.row}, C:${placementSpot.col}.`); processKeywords(cardId, 'onPlay', {playerId: player.id, instanceId: instanceId}); } } else if (typeLower === 'potere' || typeLower === 'terreno' || typeLower === 'obiettivo') { addLogMessage(`G${player.id} ${typeLower === 'potere' ? 'usa' : (typeLower === 'terreno' ? 'gioca' : 'rivela')} ${cardData.nome}.`); processKeywords(cardId, 'onPlay', {playerId: player.id}); player.graveyard.push(cardId); } else { addLogMessage(`Tipo non gestito: ${cardData.tipo}. Scartata.`); console.warn(`Tipo non gestito: ${cardData.tipo}`); player.graveyard.push(cardId); } renderGame(); } else { addLogMessage(`Eco insufficiente (${cardData.costo}).`); } }
function processKeywords(cardId, trigger, context) { const cardData = getCardData(cardId); if (cardData && cardData.keywords && cardData.keywords.length > 0) { console.log(`Processa keywords [${cardData.keywords.join(', ')}] per ${cardId} su trigger ${trigger}... (Non implementato)`); } }
function handleFieldCardClick(event) { if (gameState.gameEnded || gameState.currentPlayerId !== 1 || !(gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED)) { if(!gameState.gameEnded && !(gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED)) addLogMessage("Puoi selezionare unità solo durante la tua Fase Azione."); return; } const cardElement = event.currentTarget; const instanceId = cardElement.dataset.instanceId; if (!instanceId) return; const player = getPlayerState(gameState.currentPlayerId); const entityState = player?.field.find(c => c.instanceId === instanceId); if (!entityState || entityState.ownerId !== gameState.currentPlayerId) { console.log("Non puoi selezionare unità avversarie."); if (gameState.selectedEntityForMovement) { clearMovementSelectionState(); transitionToState(GameStateEnum.P1_ACTION); } return; } if (entityState.hasPerformedAction) { addLogMessage(`${getCardData(entityState.cardId).nome} ha già agito questo turno.`); return; } if (gameState.selectedEntityForMovement === instanceId) { console.log(`Deselezionata: ${getCardData(entityState.cardId).nome}`); clearMovementSelectionState(); transitionToState(GameStateEnum.P1_ACTION); } else { console.log(`Selezionata per movimento/azione: ${getCardData(entityState.cardId).nome}`); clearMovementSelectionState(); gameState.selectedEntityForMovement = instanceId; calculateValidMoves(entityState); transitionToState(GameStateEnum.P1_ACTION_UNIT_SELECTED); } }
function calculateValidMoves(entityState) { gameState.validMovementCells = []; if (!entityState) return; const { row: r, col: c } = entityState.position; const potentialMoves = [ { row: r - 1, col: c }, { row: r + 1, col: c }, { row: r, col: c - 1 }, { row: r, col: c + 1 }, ]; potentialMoves.forEach(move => { if (isValidAndEmptyCell(move.row, move.col)) { gameState.validMovementCells.push(move); } }); console.log("Celle valide per movimento:", gameState.validMovementCells); }
function clearMovementSelectionState() { gameState.selectedEntityForMovement = null; gameState.validMovementCells = []; clearHighlights(); }
function clearHighlights() { document.querySelectorAll('.selected-for-move, .movement-valid').forEach(el => el.classList.remove('selected-for-move', 'movement-valid')); }
function handleGridCellClick(event) { if (gameState.gameEnded || gameState.currentState !== GameStateEnum.P1_ACTION_UNIT_SELECTED) { return; } const cell = event.currentTarget; const clickedRow = parseInt(cell.dataset.row, 10); const clickedCol = parseInt(cell.dataset.col, 10); if (gameState.selectedEntityForMovement) { const isValidMove = gameState.validMovementCells.some( validCell => validCell.row === clickedRow && validCell.col === clickedCol ); if (isValidMove) { const player = getPlayerState(gameState.currentPlayerId); const entityToMove = player?.field.find(e => e.instanceId === gameState.selectedEntityForMovement); if (entityToMove) { const oldPos = { ...entityToMove.position }; entityToMove.position.row = clickedRow; entityToMove.position.col = clickedCol; entityToMove.hasPerformedAction = true; const cardData = getCardData(entityToMove.cardId); addLogMessage(`G${player.id} muove ${cardData.nome} da [${oldPos.row},${oldPos.col}] a [${clickedRow},${clickedCol}].`); console.log(`Mosso ${entityToMove.instanceId} a ${clickedRow},${clickedCol}`); clearMovementSelectionState(); transitionToState(GameStateEnum.P1_ACTION); } else { console.error("Errore: Entità selezionata non trovata!"); clearMovementSelectionState(); transitionToState(GameStateEnum.P1_ACTION); } } else { addLogMessage("Movimento annullato (cella non valida)."); clearMovementSelectionState(); transitionToState(GameStateEnum.P1_ACTION); } } else { console.log(`Cliccata cella vuota: Fila ${clickedRow}, Colonna ${clickedCol}`); } }
function checkWinConditions() { if (gameState.gameEnded) return false; const player1 = getPlayerState(1); const player2 = getPlayerState(2); if (!player1 || !player2) return false; const hero1 = player1.field.find(e => e.isHero); const hero2 = player2.field.find(e => e.isHero); if (hero1 && hero1.currentHp <= 0) { endGame(2, `${getCardData(hero1.cardId)?.nome || 'Eroe G1'} sconfitto`); return true; } if (hero2 && hero2.currentHp <= 0) { endGame(1, `${getCardData(hero2.cardId)?.nome || 'Eroe G2'} sconfitto`); return true; } const terrainCard = gameState.activeTerrainId ? getCardData(gameState.activeTerrainId) : null; if (terrainCard) { /* DA IMPLEMENTARE */ } const currentPlayer = getPlayerState(gameState.currentPlayerId); const currentObjective = currentPlayer.objectiveId ? getCardData(currentPlayer.objectiveId) : null; if (currentObjective && !currentPlayer.objectiveCompleted) { /* DA IMPLEMENTARE */ } return false; }
function startScartoLogic() { const player = getPlayerState(gameState.currentPlayerId); if (!player || gameState.gameEnded) return; addLogMessage("Esecuzione Logica Scarto..."); const cardsToDiscardCount = player.hand.length - player.maxHandSize; if (cardsToDiscardCount > 0) { addLogMessage(`Mano ${player.hand.length}/${player.maxHandSize}. Scartare ${cardsToDiscardCount}.`); const discarded = player.hand.splice(0, cardsToDiscardCount); player.graveyard.push(...discarded); discarded.forEach(cardId => addLogMessage(`G${player.id} scarta ${getCardData(cardId)?.nome || 'carta'}.`)); renderHand(player.id); } else { addLogMessage("Nessuna carta da scartare."); } let healedCount = 0; player.field.forEach(entity => { const baseData = getCardData(entity.cardId); if (baseData && baseData.punti_ferita !== null && entity.currentHp < baseData.punti_ferita) { entity.currentHp = baseData.punti_ferita; healedCount++; } }); if (healedCount > 0) { addLogMessage(`Curate ${healedCount} unità/eroi.`); renderField(); } if (checkWinConditions()) { return; } const nextState = (gameState.currentPlayerId === 1) ? GameStateEnum.P2_ACQUISITION : GameStateEnum.P1_ACQUISITION; let nextPlayerId = gameState.currentPlayerId === 1 ? 2 : 1; let nextTurnNumber = gameState.turnNumber; if (nextPlayerId === 1) { nextTurnNumber++; } gameState.currentPlayerId = nextPlayerId; gameState.turnNumber = nextTurnNumber; transitionToState(nextState); }

/* ==================== 8. Logica Avversario (IA Semplice) ==================== */
function runOpponentTurnActions() { if (gameState.gameEnded || gameState.currentPlayerId !== 2 || gameState.currentState !== GameStateEnum.P2_ACTION_THINKING) { return; } const player = getPlayerState(2); const opponent = getPlayerState(1); if (!player || !opponent) return; addLogMessage("IA sta eseguendo azioni..."); const playCardAI = () => { let cardPlayed = false; const playableCards = player.hand.map((id, index) => ({ id, index, data: getCardData(id) })).filter(c => c.data && player.currentResources >= c.data.costo).sort((a, b) => b.data.costo - a.data.costo); for (const cardToPlay of playableCards) { const cardId = cardToPlay.id; const cardData = cardToPlay.data; const typeLower = cardData.tipo?.trim().toLowerCase(); const isPlaceable = typeLower === 'unità' || typeLower === 'eroe'; let placementSpot = null; if (!isPlaceable) { continue; } placementSpot = findEmptyPlacementSpot(player.id); if (!placementSpot) { continue; } console.log(`IA: Gioca ${cardData.nome}`); player.currentResources -= cardData.costo; const currentHandIndex = player.hand.indexOf(cardId); if (currentHandIndex > -1) { player.hand.splice(currentHandIndex, 1); } else { console.error(`IA Errore: Carta ${cardId} non trovata!`); player.currentResources += cardData.costo; continue; } const instanceId = generateInstanceId(player.id, cardId); const newEntity = { cardId: cardId, instanceId: instanceId, position: placementSpot, currentHp: cardData.punti_ferita, canAttackThisTurn: !cardData.keywords?.includes('Lento'), ownerId: player.id, isHero: typeLower === 'eroe', hasPerformedAction: false }; player.field.push(newEntity); addLogMessage(`G${player.id} schiera ${cardData.nome} in Fila ${placementSpot.row}, Colonna ${placementSpot.col}.`); processKeywords(cardId, 'onPlay', {playerId: player.id, instanceId: instanceId}); cardPlayed = true; renderGame(); break; } return cardPlayed; }; const attackAI = () => { addLogMessage("IA: Salta Attacco"); return false; }; setTimeout(() => { if (gameState.gameEnded || gameState.currentState !== GameStateEnum.P2_ACTION_THINKING) return; addLogMessage("IA: Fase Azione - Gioca Carte..."); const played = playCardAI(); if (!played) { addLogMessage("IA non gioca carte."); } setTimeout(() => { if (gameState.gameEnded || gameState.currentState !== GameStateEnum.P2_ACTION_THINKING) return; addLogMessage("IA: Fase Azione - Muove/Attacca..."); attackAI(); if (gameState.gameEnded) return; setTimeout(() => { if (gameState.gameEnded || gameState.currentState !== GameStateEnum.P2_ACTION_THINKING) return; addLogMessage("IA termina Fase Azione."); transitionToState(GameStateEnum.P2_DISCARD); }, 500); }, 800); }, 500); }

/* ==================== 9. Gestione Modale ==================== */
function openModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.add('active'); } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeModal(modalId) { const modalElement = document.getElementById(modalId); if (modalElement) { modalElement.classList.remove('active'); if (modalId === 'graveyard-modal' && graveyardModalBody) { graveyardModalBody.innerHTML = ''; } } else { console.error(`Modale con ID "${modalId}" non trovato.`); } }
function closeAllModals() { document.querySelectorAll('.modal.active').forEach(modal => { closeModal(modal.id); }); }
function showGraveyard(playerId) { const player = getPlayerState(playerId); if (!player || !graveyardModalBody || !graveyardModalTitle) return; console.log(`Visualizza cimitero Giocatore ${playerId}`); graveyardModalTitle.textContent = `Cimitero Giocatore ${playerId}`; graveyardModalBody.innerHTML = ''; if (player.graveyard.length === 0) { graveyardModalBody.innerHTML = '<p>Nessuna carta nel cimitero.</p>'; } else { player.graveyard.forEach(cardId => { const cardElement = renderCard(cardId, 'modal'); if (cardElement instanceof Node) { graveyardModalBody.appendChild(cardElement); } }); } openModal('graveyard-modal'); }
function handleGraveyardClick(event) { if (gameState.gameEnded) return; const targetElement = event.currentTarget; const playerId = parseInt(targetElement.dataset.playerId, 10); if (!playerId) { console.warn("Player ID non trovato sull'elemento cimitero:", targetElement); return; } showGraveyard(playerId); }

/* ==================== 10. Inizializzazione Event Listener ==================== */
function addEventListeners() { if(endTurnButton) endTurnButton.addEventListener('click', handleEndTurnClick); if (graveyardP1Element) graveyardP1Element.addEventListener('click', handleGraveyardClick); if (graveyardP2Element) graveyardP2Element.addEventListener('click', handleGraveyardClick); if (showLogButton) { showLogButton.addEventListener('click', () => { openModal('log-modal'); }); } else { console.error("Bottone 'Mostra Log' non trovato!"); } closeButtons.forEach(button => { button.addEventListener('click', () => { const modalToClose = button.closest('.modal'); if (modalToClose) { closeModal(modalToClose.id); } }); }); modals.forEach(modalElement => { modalElement.addEventListener('click', (event) => { if (event.target === modalElement) { closeModal(modalElement.id); } }); }); if (phaseIndicatorP1) { phaseIndicatorP1.addEventListener('click', (event) => { if (gameState.gameEnded || gameState.currentPlayerId !== 1) return; const clickedStep = event.target.closest('.phase-step'); if (!clickedStep || !clickedStep.classList.contains('clickable')) return; const targetPhaseId = clickedStep.id; if (targetPhaseId === 'phase-azione' && gameState.currentState === GameStateEnum.P1_ACQUISITION) { addLogMessage("G1 passa a Fase Azione (Click)."); transitionToState(GameStateEnum.P1_ACTION); } else if (targetPhaseId === 'phase-scarto' && (gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED)) { addLogMessage("G1 passa a Fase Scarto (Click)."); transitionToState(GameStateEnum.P1_DISCARD); } }); } document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED) { console.log("Deselezione via ESC."); addLogMessage("Selezione annullata."); clearMovementSelectionState(); transitionToState(GameStateEnum.P1_ACTION); } else { closeAllModals(); } } else if (event.key === ' ' || event.code === 'Space') { if (gameState.gameEnded || gameState.currentPlayerId !== 1) return; if (document.activeElement === document.body || document.activeElement === null || document.activeElement.tagName === 'BUTTON') { event.preventDefault(); } if (gameState.currentState === GameStateEnum.P1_ACQUISITION) { addLogMessage("G1 passa a Fase Azione (Spazio)."); transitionToState(GameStateEnum.P1_ACTION); } else if (gameState.currentState === GameStateEnum.P1_ACTION || gameState.currentState === GameStateEnum.P1_ACTION_UNIT_SELECTED) { addLogMessage("G1 passa a Fase Scarto (Spazio)."); transitionToState(GameStateEnum.P1_DISCARD); } } }); }

/* ==================== 11. Inizializzazione Gioco ==================== */
function placeInitialHeroes() { console.log("Piazzamento Eroi..."); gameState.players.forEach(player => { if (player.heroId) { const heroData = getCardData(player.heroId); const placementSpot = findEmptyPlacementSpot(player.id); if (placementSpot && heroData) { const instanceId = generateInstanceId(player.id, player.heroId); const initialHp = heroData.punti_ferita ?? 20; const heroEntity = { cardId: player.heroId, instanceId: instanceId, position: placementSpot, currentHp: initialHp, canAttackThisTurn: true, ownerId: player.id, isHero: true, hasPerformedAction: false }; player.field.push(heroEntity); addLogMessage(`G${player.id} schiera ${heroData.nome} in F:${placementSpot.row}, C:${placementSpot.col}.`); } else { console.error(`Impossibile piazzare eroe ${heroData?.nome || player.heroId} per G${player.id}. Limite: ${player.field.length >= gameState.maxCreaturesPerPlayer}, Spot: ${placementSpot}`); addLogMessage(`! Errore: Impossibile piazzare eroe per G${player.id}!`); } } else { console.error(`Giocatore ${player.id} non ha un heroId!`); } }); }
function initGame() { console.log("Inizializzazione gioco..."); if (typeof getCardData !== 'function' || typeof getAllCardIds !== 'function') { console.error("Errore critico: Funzioni getCardData o getAllCardIds non trovate."); alert("Errore critico: Impossibile caricare le funzioni delle carte."); return; } const allCards = cardDatabase; if (!allCards || allCards.length === 0) { console.error("Impossibile inizializzare: nessuna carta trovata."); alert("Errore critico: Impossibile caricare le carte."); return; } const heroCards = allCards.filter(card => card.tipo?.trim().toLowerCase() === 'eroe'); const terrainCards = allCards.filter(card => card.tipo?.trim().toLowerCase() === 'terreno'); const objectiveCards = allCards.filter(card => card.tipo?.trim().toLowerCase() === 'obiettivo'); const deckCards = allCards.filter(card => { const typeLower = card.tipo?.trim().toLowerCase(); return typeLower === 'unità' || typeLower === 'potere'; }); console.log(`Trovati: ${heroCards.length} Eroi, ${terrainCards.length} Terreni, ${objectiveCards.length} Obiettivi, ${deckCards.length} Carte Mazzo.`); if (heroCards.length < 1 || terrainCards.length < 1 || objectiveCards.length < 1) { console.error("Errore: Non ci sono abbastanza carte Eroe/Terreno/Obiettivo definite!"); alert("Errore: Mancano carte Eroe, Terreno o Obiettivo!"); return; } const terrainIndex = Math.floor(Math.random() * terrainCards.length); const activeTerrain = terrainCards[terrainIndex]; let heroIndexes = [-1, -1]; heroIndexes[0] = Math.floor(Math.random() * heroCards.length); heroIndexes[1] = heroCards.length > 1 ? heroCards.findIndex((h, i) => i !== heroIndexes[0]) : heroIndexes[0]; if (heroIndexes[1] < 0) heroIndexes[1] = 0; const heroP1 = heroCards[heroIndexes[0]]; const heroP2 = heroCards[heroIndexes[1]]; let objectiveIndexes = [-1, -1]; objectiveIndexes[0] = Math.floor(Math.random() * objectiveCards.length); objectiveIndexes[1] = objectiveCards.length > 1 ? objectiveCards.findIndex((o, i) => i !== objectiveIndexes[0]) : objectiveIndexes[0]; if (objectiveIndexes[1] < 0) objectiveIndexes[1] = 0; const objectiveP1 = objectiveCards[objectiveIndexes[0]]; const objectiveP2 = objectiveCards[objectiveIndexes[1]]; const deckCardPoolIds = deckCards.map(card => card.id); const createPlayerDeck = () => { let deck = []; let cardCounts = {}; const maxDeckSize = 25; const maxCopies = 2; let shuffledPool = [...deckCardPoolIds]; shuffleArray(shuffledPool); for (const cardId of shuffledPool) { if (deck.length >= maxDeckSize) break; const currentCount = cardCounts[cardId] || 0; if (currentCount < maxCopies) { deck.push(cardId); cardCounts[cardId] = currentCount + 1; } } if (deck.length < maxDeckSize) { console.warn(`Mazzo creato con ${deck.length} carte (< ${maxDeckSize}).`); } return deck; }; const deckP1 = createPlayerDeck(); const deckP2 = createPlayerDeck(); gameState = { currentPlayerId: 1, turnNumber: 1, activeTerrainId: activeTerrain.id, currentState: null, selectedEntityForMovement: null, validMovementCells: [], players: [ { id: 1, heroId: heroP1.id, objectiveId: objectiveP1.id, objectiveCompleted: false, maxResources: 0, currentResources: 0, deck: deckP1, hand: [], field: [], graveyard: [], maxHandSize: 5 }, { id: 2, heroId: heroP2.id, objectiveId: objectiveP2.id, objectiveCompleted: false, maxResources: 0, currentResources: 0, deck: deckP2, hand: [], field: [], graveyard: [], maxHandSize: 5 } ], grid: { rows: 6, cols: 6 }, maxCreaturesPerPlayer: 4, maxTurnsPerPlayer: 10, gameEnded: false, winner: null, }; addLogMessage("Benvenuto in Oathfall - Playtest!"); addLogMessage(`Terreno: ${activeTerrain.nome}.`); addLogMessage(`Eroi: G1-${heroP1.nome} vs G2-${heroP2.nome}.`); const initialHandSize = 3; for (let i = 0; i < initialHandSize; i++) { drawCard(1); drawCard(2); } console.log("Mani iniziali pescate."); placeInitialHeroes(); addEventListeners(); transitionToState(GameStateEnum.P1_ACQUISITION); }
function endGame(winnerId, reason = "Condizione Vittoria") { if (gameState.gameEnded) return; gameState.gameEnded = true; gameState.winner = winnerId; addLogMessage(`Partita terminata! Giocatore ${winnerId === 0 ? 'Pareggio' : winnerId} ha vinto (${reason})!`); console.log(`Partita terminata! Vincitore: Giocatore ${winnerId}, Motivo: ${reason}`); gameState.currentState = GameStateEnum.GAME_OVER; renderGame(); document.querySelectorAll('.card.in-hand, .card.on-grid').forEach(card => { const clone = card.cloneNode(true); if(card.parentNode) card.parentNode.replaceChild(clone, card); }); setTimeout(() => alert(`Partita terminata! Giocatore ${winnerId === 0 ? 'Pareggio' : winnerId} ha vinto! (${reason})`), 100); }

/* ==================== 12. Avvio ==================== */
document.addEventListener('DOMContentLoaded', initGame);