// Definição das habilidades
const habilidades = [
    { nome: "Lança-Chamas", dano: 40, precisao: 85, descricao: "Um poderoso jato de fogo que pode queimar o alvo.", tipo: "fire" },
    { nome: "Choque do Trovão", dano: 35, precisao: 90, descricao: "Um ataque elétrico que pode paralisar o oponente.", tipo: "electric" },
    { nome: "Jato D'água", dano: 30, precisao: 100, descricao: "Um forte jato de água que nunca erra.", tipo: "water" },
    { nome: "Raio Solar", dano: 50, precisao: 70, descricao: "Um poderoso raio de energia solar, porém menos preciso.", tipo: "grass" },
    { nome: "Investida", dano: 25, precisao: 95, descricao: "Um ataque físico básico, mas confiável.", tipo: "normal" }
];

// Elementos do DOM
const setupScreen = document.getElementById('setup-screen');
const battleScreen = document.getElementById('battle-screen');
const gameOverScreen = document.getElementById('game-over');
const playerNameInput = document.getElementById('player-name');
const skillCards = document.querySelectorAll('.skill-card');
const selectedCountDisplay = document.getElementById('selected-count');
const startButton = document.getElementById('btn-start');
const attackButton = document.getElementById('btn-attack');
const playAgainButton = document.getElementById('btn-play-again');
const battleLog = document.getElementById('battle-log');
const selectedSkillsContainer = document.getElementById('selected-skills');
const playerHealthBar = document.getElementById('player-health');
const npcHealthBar = document.getElementById('npc-health');
const playerHpText = document.getElementById('player-hp-text');
const npcHpText = document.getElementById('npc-hp-text');
const playerPokemonName = document.getElementById('player-pokemon-name');
const victoryMessage = document.getElementById('victory-message');
const defeatMessage = document.getElementById('defeat-message');

// Modal elements
const skillModal = document.getElementById('skill-modal');
const closeModal = document.querySelector('.close');
const modalSkillName = document.getElementById('modal-skill-name');
const modalSkillDesc = document.getElementById('modal-skill-desc');
const modalSkillStats = document.getElementById('modal-skill-stats');

// Estado do jogo
let selectedSkills = [];
let npcSkills = [];
let playerHealth = 100;
let npcHealth = 100;
let currentTurn = 1;
let battleInProgress = false;
let selectedAttack = null;

// Inicialização
function init() {
    // Event listeners para seleção de habilidades
    skillCards.forEach(card => {
        card.addEventListener('click', () => selectSkill(card));
    });

    // Event listeners para botões
    startButton.addEventListener('click', startBattle);
    attackButton.addEventListener('click', performAttack);
    playAgainButton.addEventListener('click', resetGame);

    // Event listeners para modal
    closeModal.addEventListener('click', () => {
        skillModal.style.display = "none";
    });

    window.addEventListener('click', (e) => {
        if (e.target === skillModal) {
            skillModal.style.display = "none";
        }
    });

    // Atualiza o botão de início conforme o nome do Pokémon é digitado
    playerNameInput.addEventListener('input', () => {
        startButton.disabled = !(selectedSkills.length === 3 && playerNameInput.value.trim() !== '');
    });
}

// Seleção de habilidades
function selectSkill(card) {
    const skillId = parseInt(card.getAttribute('data-id'));

    // Se já está selecionada, desseleciona
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedSkills = selectedSkills.filter(id => id !== skillId);
    }
    // Se não está selecionada e temos menos de 3 selecionadas, seleciona
    else if (selectedSkills.length < 3) {
        card.classList.add('selected');
        selectedSkills.push(skillId);
    }
    // Se já temos 3 selecionadas, mostra alerta
    else {
        alert("Você já selecionou 3 habilidades! Desmarque uma para selecionar outra.");
    }

    // Atualiza contagem
    selectedCountDisplay.textContent = `Habilidades selecionadas: ${selectedSkills.length}/3`;

    // Habilita/desabilita botão de início
    startButton.disabled = !(selectedSkills.length === 3 && playerNameInput.value.trim() !== '');
}

// Iniciar batalha
function startBattle() {
    if (selectedSkills.length !== 3) {
        alert("Selecione 3 habilidades antes de iniciar a batalha!");
        return;
    }

    if (playerNameInput.value.trim() === '') {
        alert("Digite um nome para o seu Pokémon!");
        return;
    }

    // Define o nome do Pokémon do jogador
    playerPokemonName.textContent = playerNameInput.value;

    // Escolhe 3 habilidades aleatórias para o NPC
    npcSkills = [];
    while (npcSkills.length < 3) {
        const randomSkill = Math.floor(Math.random() * 5);
        if (!npcSkills.includes(randomSkill)) {
            npcSkills.push(randomSkill);
        }
    }

    // Adiciona habilidades selecionadas à tela de batalha
    selectedSkillsContainer.innerHTML = '';
    selectedSkills.forEach(skillId => {
        const skill = habilidades[skillId];
        const skillElement = document.createElement('div');
        skillElement.className = `selected-skill ${skill.tipo}`;
        skillElement.textContent = skill.nome;
        skillElement.setAttribute('data-skill-id', skillId);

        skillElement.addEventListener('click', () => {
            // Remove seleção anterior
            document.querySelectorAll('.selected-skill').forEach(el => {
                el.style.border = 'none';
            });

            // Marca esta como selecionada
            skillElement.style.border = '2px solid #333';
            selectedAttack = skillId;
        });

        // Mostra detalhes ao clicar
        skillElement.addEventListener('click', () => showSkillDetails(skillId));

        selectedSkillsContainer.appendChild(skillElement);
    });

    // Esconde tela de configuração e mostra tela de batalha
    setupScreen.style.display = 'none';
    battleScreen.style.display = 'block';

    // Mostra controles de batalha
    document.querySelector('.battle-controls').style.display = 'block';

    // Inicia a batalha
    battleInProgress = true;
    addLogEntry("A batalha começou! É a sua vez de atacar.");
}

// Realizar ataque
function performAttack() {
    if (!battleInProgress) return;

    if (selectedAttack === null) {
        alert("Selecione uma habilidade para atacar!");
        return;
    }

    const skill = habilidades[selectedAttack];

    // Verifica se o ataque acertou
    const hit = Math.random() * 100 <= skill.precisao;

    if (hit) {
        // Calcula dano
        npcHealth -= skill.dano;
        if (npcHealth < 0) npcHealth = 0;

        // Atualiza barra de vida do NPC
        updateHealthBar(npcHealthBar, npcHpText, npcHealth);

        addLogEntry(`Você usou ${skill.nome} e causou ${skill.dano} de dano!`);
    } else {
        addLogEntry(`Você tentou usar ${skill.nome}, mas errou o ataque!`);
    }

    // Verifica se o NPC foi derrotado
    if (npcHealth <= 0) {
        endBattle(true);
        return;
    }

    // Turno do NPC
    setTimeout(npcTurn, 1000);
}

// Turno do NPC
function npcTurn() {
    // NPC escolhe uma habilidade aleatória
    const randomIndex = Math.floor(Math.random() * npcSkills.length);
    const npcSkillId = npcSkills[randomIndex];
    const npcSkill = habilidades[npcSkillId];

    // Verifica se o ataque acertou
    const hit = Math.random() * 100 <= npcSkill.precisao;

    if (hit) {
        // Calcula dano
        playerHealth -= npcSkill.dano;
        if (playerHealth < 0) playerHealth = 0;

        // Atualiza barra de vida do jogador
        updateHealthBar(playerHealthBar, playerHpText, playerHealth);

        addLogEntry(`Rival usou ${npcSkill.nome} e causou ${npcSkill.dano} de dano!`);
    } else {
        addLogEntry(`Rival tentou usar ${npcSkill.nome}, mas errou o ataque!`);
    }

    // Verifica se o jogador foi derrotado
    if (playerHealth <= 0) {
        endBattle(false);
        return;
    }

    // Incrementa o turno
    currentTurn++;
    addLogEntry(`Turno ${currentTurn} - É a sua vez de atacar.`);

    // Reseta a seleção de ataque
    selectedAttack = null;
    document.querySelectorAll('.selected-skill').forEach(el => {
        el.style.border = 'none';
    });
}

// Fim da batalha
function endBattle(playerWon) {
    battleInProgress = false;

    if (playerWon) {
        addLogEntry("Vitória! Você derrotou seu rival!");
        victoryMessage.style.display = 'block';
        defeatMessage.style.display = 'none';
    } else {
        addLogEntry("Derrota! Seu Pokémon foi vencido!");
        victoryMessage.style.display = 'none';
        defeatMessage.style.display = 'block';
    }

    // Mostra tela de fim de jogo
    gameOverScreen.style.display = 'block';
    document.querySelector('.battle-controls').style.display = 'none';
}

// Resetar jogo
function resetGame() {
    // Reseta valores
    selectedSkills = [];
    npcSkills = [];
    playerHealth = 100;
    npcHealth = 100;
    currentTurn = 1;
    battleInProgress = false;
    selectedAttack = null;

    // Reseta interface
    updateHealthBar(playerHealthBar, playerHpText, playerHealth);
    updateHealthBar(npcHealthBar, npcHpText, npcHealth);

    // Reseta seleção de habilidades
    skillCards.forEach(card => {
        card.classList.remove('selected');
    });
    selectedCountDisplay.textContent = "Habilidades selecionadas: 0/3";

    // Limpa log de batalha
    battleLog.innerHTML = '<div class="log-entry">A batalha vai começar!</div>';

    // Esconde telas e mostra setup
    gameOverScreen.style.display = 'none';
    battleScreen.style.display = 'none';
    setupScreen.style.display = 'block';

    // Desabilita botão de início
    startButton.disabled = true;
}

// Atualiza barra de vida
function updateHealthBar(bar, text, health) {
    const percentage = (health / 100) * 100;
    bar.style.width = `${percentage}%`;
    text.textContent = `${health}/100 HP`;

    // Muda cor da barra baseado na vida
    if (percentage > 50) {
        bar.style.backgroundColor = '#4caf50'; // Verde
    } else if (percentage > 25) {
        bar.style.backgroundColor = '#ffc107'; // Amarelo
    } else {
        bar.style.backgroundColor = '#f44336'; // Vermelho
    }
}

// Adiciona entrada no log de batalha
function addLogEntry(text) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = text;
    battleLog.appendChild(entry);
    battleLog.scrollTop = battleLog.scrollHeight;
}

// Mostra detalhes da habilidade
function showSkillDetails(skillId) {
    const skill = habilidades[skillId];
    modalSkillName.textContent = skill.nome;
    modalSkillDesc.textContent = skill.descricao;
    modalSkillStats.innerHTML = `<span>Dano: ${skill.dano}</span><span>Precisão: ${skill.precisao}%</span>`;
    skillModal.style.display = "block";
}

// Inicializa o jogo
init();