/* File: cards.js */
/* Contiene i dati del set di carte iniziale per il playtest. */
/* Gli effetti sono temporaneamente rimossi, verranno gestiti tramite 'keywords' in futuro. */

const cardDatabase = [
    {
      "id": "c001",
      "nome": "Uxariano Mascherato",
      "illustrazione": "images/1.jpg",
      "attacco": null,
      "punti_ferita": null, /* Gli eroi hanno HP gestiti nello stato giocatore */
      "costo": null, /* Costo non applicabile per eroi iniziali */
      "tipo": "Eroe",
      "description": "Può copiare l'abilità statica di un altro eroe per 1 turno",
      "keywords": []
    },
    {
      "id": "c002",
      "nome": "Demone del Crepaccio",
      "illustrazione": "images/2.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Eroe",
      "description": "Ignora gli effetti del terreno e infligge 2 danni alle strutture",
      "keywords": []
    },
    {
      "id": "c003",
      "nome": "Taumaturga Celestiale",
      "illustrazione": "images/3.jpg",
      "attacco": 1,
      "punti_ferita": 3,
      "costo": 3,
      "tipo": "Unità",
      "description": "Aumenta di 1 il costo dei poteri nemici che infliggono danno",
      "keywords": []
    },
    {
      "id": "c004",
      "nome": "Guardia del Sole",
      "illustrazione": "images/4.jpg",
      "attacco": 2,
      "punti_ferita": 4,
      "costo": 3,
      "tipo": "Unità",
      "description": "Se in una posizione adiacente all'eroe alleato, guadagna Armatura 1",
      "keywords": []
    },
    {
      "id": "c005",
      "nome": "Guerriero del Sepolcro",
      "illustrazione": "images/5.jpg",
      "attacco": 3,
      "punti_ferita": 3,
      "costo": 3,
      "tipo": "Unità",
      "description": "Se distrutto, infligge 1 danno all'unità più vicina",
      "keywords": []
    },
    {
      "id": "c006",
      "nome": "Mercenario Umano",
      "illustrazione": "images/6.jpg",
      "attacco": 2,
      "punti_ferita": 2,
      "costo": 2,
      "tipo": "Unità",
      "description": "Può essere arruolato da qualsiasi fazione",
      "keywords": []
    },
    {
      "id": "c007",
      "nome": "Cacciatore Celestiale",
      "illustrazione": "images/7.jpg",
      "attacco": 2,
      "punti_ferita": 2,
      "costo": 2,
      "tipo": "Unità",
      "description": "Ignora ostacoli durante il movimento",
      "keywords": []
    },
    {
      "id": "c008",
      "nome": "Assassino Abissale",
      "illustrazione": "images/8.jpg",
      "attacco": 3,
      "punti_ferita": 1,
      "costo": 3,
      "tipo": "Unità",
      "description": "Può colpire un'unità non vista e ritirarsi di 1 spazio",
      "keywords": []
    },
    {
      "id": "c009",
      "nome": "Clerico della Luce",
      "illustrazione": "images/9.jpg",
      "attacco": 1,
      "punti_ferita": 3,
      "costo": 2,
      "tipo": "Unità",
      "description": "Cura 1 danno a un alleato adiacente a ogni turno",
      "keywords": []
    },
    {
      "id": "c010",
      "nome": "Templare",
      "illustrazione": "images/10.jpg",
      "attacco": 3,
      "punti_ferita": 4,
      "costo": 4,
      "tipo": "Unità",
      "description": "Aumenta di 1 il primo danno inglitto ogni turno",
      "keywords": []
    },
    {
      "id": "c011",
      "nome": "Famiglio Volante",
      "illustrazione": "images/11.jpg",
      "attacco": 2,
      "punti_ferita": 1,
      "costo": 3,
      "tipo": "Unità",
      "description": "Può muoversi sopra le unità",
      "keywords": []
    },
    {
      "id": "c012",
      "nome": "Crociato",
      "illustrazione": "images/12.jpg",
      "attacco": 3,
      "punti_ferita": 4,
      "costo": 4,
      "tipo": "Unità",
      "description": "Ignora la prima fonte di danno subita ogni turno",
      "keywords": []
    },
    {
      "id": "c013",
      "nome": "Bruto Corazzato Abissale",
      "illustrazione": "images/13.jpg",
      "attacco": 4,
      "punti_ferita": 5,
      "costo": 4,
      "tipo": "Unità",
      "description": "Non può essere spinto o spostato",
      "keywords": []
    },
    {
      "id": "c014",
      "nome": "Speardancer Celestiale",
      "illustrazione": "images/14.jpg",
      "attacco": 2,
      "punti_ferita": 2,
      "costo": 2,
      "tipo": "Unità",
      "description": "Può attaccare due bersagli adiacenti",
      "keywords": []
    },
    {
      "id": "c015",
      "nome": "Incantatrice Abissale",
      "illustrazione": "images/15.jpg",
      "attacco": 1,
      "punti_ferita": 2,
      "costo": 3,
      "tipo": "Unità",
      "description": "Lancia maledizioni a distanza di 2 spazi",
      "keywords": []
    },
    {
      "id": "c016",
      "nome": "Ranger Umano",
      "illustrazione": "images/16.jpg",
      "attacco": 2,
      "punti_ferita": 2,
      "costo": 2,
      "tipo": "Unità",
      "description": "Ottiene +1 danno se non si muove in questo turno",
      "keywords": []
    },
    {
      "id": "o001",
      "nome": "Giustizia",
      "illustrazione": "images/17.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Obiettivo",
      "description": "Ottieni 1 punto per ogni nemico sconfitto che ha attaccato per primo",
      "keywords": []
    },
    {
      "id": "o002",
      "nome": "Dominio",
      "illustrazione": "images/18.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Obiettivo",
      "description": "Controlla più aree centrali del campo rispetto all'avversario",
      "keywords": []
    },
    {
      "id": "o003",
      "nome": "Sacrificio",
      "illustrazione": "images/19.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Obiettivo",
      "description": "Vinci se il tuo eroe è l'ultima unità in campo",
      "keywords": []
    },
    {
      "id": "o004",
      "nome": "Supremazia",
      "illustrazione": "images/20.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Obiettivo",
      "description": "Vinci controllando tutte le aree sacre contemporaneamente",
      "keywords": []
    },
    {
      "id": "o005",
      "nome": "Inganno",
      "illustrazione": "images/21.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Obiettivo",
      "description": "Concludi la partita senza mai rivelare un'unità finché non attacca",
      "keywords": []
    },
    {
      "id": "o006",
      "nome": "Viaggio",
      "illustrazione": "images/22.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Obiettivo",
      "description": "Raggiungi 3 aree diverse del campo con l’eroe",
      "keywords": []
    },
    {
      "id": "t001",
      "nome": "Arena",
      "illustrazione": "images/23.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "Dal turno 10, tutte le unità infliggono un danno aggiuntivo",
      "keywords": []
    },
    {
      "id": "t002",
      "nome": "Rovine del Mito",
      "illustrazione": "images/24.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "Le abilità globali hanno +1 effetto mentre si trovano qui",
      "keywords": []
    },
    {
      "id": "t003",
      "nome": "Collina del Giuramento",
      "illustrazione": "images/25.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "Tutte le unità con \"Giuramento\" guadagnano +1 difesa",
      "keywords": []
    },
    {
      "id": "t004",
      "nome": "Labirinto degli Uxariani",
      "illustrazione": "images/26.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "A fine turno, tutte le unità indietreggiano di una posizione se possibile",
      "keywords": []
    },
    {
      "id": "t005",
      "nome": "Valle del Primo Sogno",
      "illustrazione": "images/27.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "Le abilità delle unità aggiungono \"1\" al proprio effetto.",
      "keywords": []
    },
    {
      "id": "p001",
      "nome": "Benedizione della Luce",
      "illustrazione": "images/28.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 1,
      "tipo": "Potere",
      "description": "Cura 2 danni e fornisce \"Armatura 1\" l’unità bersaglio per 1 turno",
      "keywords": []
    },
    {
      "id": "p002",
      "nome": "Sussurro del Vuoto",
      "illustrazione": "images/29.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 2,
      "tipo": "Potere",
      "description": "L’unità colpita attacca un suo alleato al turno successivo",
      "keywords": []
    },
    {
      "id": "p003",
      "nome": "Lancia del Giuramento",
      "illustrazione": "images/30.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 2,
      "tipo": "Potere",
      "description": "Se equipaggiata da un Celestiale, infligge +1 danno e non può essere distrutta",
      "keywords": []
    },
    {
      "id": "p004",
      "nome": "Armatura del Sepolcro",
      "illustrazione": "images/31.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 5,
      "tipo": "Potere",
      "description": "Se questa unità subisce danno, infligge 1 danno a chi l’ha colpita",
      "keywords": []
    },
    {
      "id": "p005",
      "nome": "Furia Incarnata",
      "illustrazione": "images/32.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 2,
      "tipo": "Potere",
      "description": "L’unità ottiene +2 attacco ma subisce 1 danno alla fine del turno",
      "keywords": []
    },
    {
      "id": "p006",
      "nome": "Onda del Giuramento",
      "illustrazione": "images/33.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 3,
      "tipo": "Potere",
      "description": "Colpisce tutte le unità nemiche frontalmente rispetto all’eroe infliggendo 1 danno",
      "keywords": []
    },
    {
      "id": "p007",
      "nome": "Velo dell’Inganno",
      "illustrazione": "images/34.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 2,
      "tipo": "Potere",
      "description": "Scegli un’unità: diventa invisibile finché attacca o viene colpita",
      "keywords": []
    },
    {
      "id": "p008",
      "nome": "Fiamme dell’Abisso",
      "illustrazione": "images/35.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 3,
      "tipo": "Potere",
      "description": "Infligge 3 danni a tutte le unità adiacenti alla posizione bersaglio",
      "keywords": []
    },
    {
      "id": "p009",
      "nome": "Eco del Ricordo",
      "illustrazione": "images/36.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 2,
      "tipo": "Potere",
      "description": "Copia l’ultima azione fatta dall'unità bersaglio senza pagarne il costo",
      "keywords": []
    },
    {
      "id": "t006",
      "nome": "Città dei Celestiali",
      "illustrazione": "images/37.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "Le unità celestiali sul terreno di gioco ottengono +1 movimento",
      "keywords": []
    },
    {
      "id": "t007",
      "nome": "Città degli Abissali",
      "illustrazione": "images/38.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": null,
      "tipo": "Terreno",
      "description": "Le unità abissali terreno di gioco infliggono +1 danno",
      "keywords": []
    },
    {
      "id": "p010",
      "nome": "Alytia governa",
      "illustrazione": "images/39.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 4,
      "tipo": "Potere",
      "description": "Fornisce \"Armatura 1\" a tutte le unità alleate per 1 turno",
      "keywords": []
    },
    {
      "id": "p011",
      "nome": "Bodain governa",
      "illustrazione": "images/40.jpg",
      "attacco": null,
      "punti_ferita": null,
      "costo": 4,
      "tipo": "Potere",
      "description": "Infligge 1 danno a a tutte le unità nemiche",
      "keywords": []
    },
    {
      "id": "c017",
      "nome": "Alytia, guida dei Celestiali",
      "illustrazione": "images/41.jpg",
      "attacco": 2,
      "punti_ferita": 6, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Le unità alleate a distanza ricevono +1 movimento.",
      "keywords": []
    },
    {
      "id": "c018",
      "nome": "Bodain, condottiero Abissale",
      "illustrazione": "images/42.jpg",
      "attacco": 3,
      "punti_ferita": 5, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Tutte le unità nemiche che iniziano il turno adiacenti subiscono 1 danno",
      "keywords": []
    },
    {
      "id": "c019",
      "nome": "Fomrazione di Celestiali",
      "illustrazione": "images/43.jpg",
      "attacco": 2,
      "punti_ferita": 2,
      "costo": 2,
      "tipo": "Unità",
      "description": "Se sono almeno 2 sul campo, ottengono +1 difesa",
      "keywords": []
    },
    {
      "id": "c020",
      "nome": "Truppa di Abissali",
      "illustrazione": "images/44.jpg",
      "attacco": 2,
      "punti_ferita": 2,
      "costo": 2,
      "tipo": "Unità",
      "description": "Se sono almeno 2 sul campo, infliggono +1 danno",
      "keywords": []
    },
    {
      "id": "c021",
      "nome": "Lanciere Celestiale",
      "illustrazione": "images/45.jpg",
      "attacco": 3,
      "punti_ferita": 3,
      "costo": 3,
      "tipo": "Unità",
      "description": "Ottiene +1 portata se è vicino a un eroe celestiale",
      "keywords": []
    },
    {
      "id": "c022",
      "nome": "Guerriero Abissale d’Assalto",
      "illustrazione": "images/46.jpg",
      "attacco": 3,
      "punti_ferita": 3,
      "costo": 3,
      "tipo": "Unità",
      "description": "Ottiene +1 danno se ha subito almeno 1 ferita",
      "keywords": []
    },
    {
      "id": "c023",
      "nome": "Veythari Veggente",
      "illustrazione": "images/47.jpg",
      "attacco": 1,
      "punti_ferita": 4, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Può vedere le carte obiettivo dell’avversario per 1 turno",
      "keywords": []
    },
    {
      "id": "c024",
      "nome": "Veythari Ombroso",
      "illustrazione": "images/48.jpg",
      "attacco": 2,
      "punti_ferita": 3, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Se non attacca, obbliga un nemico vicino a rivelarsi",
      "keywords": []
    },
    {
      "id": "c025",
      "nome": "Aedrani Errante",
      "illustrazione": "images/49.jpg",
      "attacco": 1,
      "punti_ferita": 6, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Ignora maledizioni e può annullare una magia avversaria",
      "keywords": []
    },
    {
      "id": "c026",
      "nome": "Aedrani Silenziosa",
      "illustrazione": "images/50.jpg",
      "attacco": 2,
      "punti_ferita": 4, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Può curare 1 danno a se stessa ogni due turni",
      "keywords": []
    },
    {
      "id": "c027",
      "nome": "Yrnathi Nomade",
      "illustrazione": "images/51.jpg",
      "attacco": 2,
      "punti_ferita": 3, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Ogni volta che un alleato muore, ottiene +1 attacco",
      "keywords": []
    },
    {
      "id": "c028",
      "nome": "Yrnathi Veggente",
      "illustrazione": "images/52.jpg",
      "attacco": 1,
      "punti_ferita": 5, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Può guardare una carta dell’avversario ogni turno",
      "keywords": []
    },
    {
      "id": "c029",
      "nome": "Uxariana delle Maschere",
      "illustrazione": "images/53.jpg",
      "attacco": 2,
      "punti_ferita": 4, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Cambia abilità statica all'inizio di ogni turno",
      "keywords": []
    },
    {
      "id": "c030",
      "nome": "Uxariano del Silenzio",
      "illustrazione": "images/54.jpg",
      "attacco": 2,
      "punti_ferita": 4, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Mentre non parla (non attacca), ottiene +1 difesa",
      "keywords": []
    },
    {
      "id": "c031",
      "nome": "Morhakai della Lama",
      "illustrazione": "images/55.jpg",
      "attacco": 3,
      "punti_ferita": 3, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Può trasformarsi in un’unità alleata per 1 turno",
      "keywords": []
    },
    {
      "id": "c032",
      "nome": "Morhakai Ombrosa",
      "illustrazione": "images/56.jpg",
      "attacco": 2,
      "punti_ferita": 5, /* HP Eroe */
      "costo": null,
      "tipo": "Eroe",
      "description": "Una volta per partita, può annullare la propria eliminazione.",
      "keywords": []
    }
  ];
  
  
  /* --- Funzione Helper (Mantenuta) --- */
  /* Restituisce l'oggetto completo della carta dato l'ID */
  function getCardData(cardId) {
      const cardData = cardDatabase.find(card => card.id === cardId);
      if (!cardData) {
          console.error(`Dati non trovati per la carta con ID: ${cardId}`);
          /* Restituisce un oggetto di default più semplice */
          return { id: cardId, nome: "Sconosciuta", costo: 0, tipo: "sconosciuto", description: "Errore Dati", attacco: null, punti_ferita: null, keywords:[] };
      }
      return cardData;
  }
  
  /* Funzione per ottenere TUTTI gli ID delle carte nel database (Mantenuta) */
  function getAllCardIds() {
      return cardDatabase.map(card => card.id);
  }
  
  console.log(`Caricate ${cardDatabase.length} definizioni di carte dal set completo.`);