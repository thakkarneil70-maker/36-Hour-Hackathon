// ═══════ SYNTHOQUEST - Chemistry Synthesis Puzzle Game ═══════

// ── Game State ──────────────────────────────────────────────
const GameState = {
  currentScreen: 'menu',
  currentLevel: 1,
  score: 0,
  timeRemaining: 120, // 2 minutes in seconds
  timerInterval: null,
  attempts: 2,        // 2 chances total
  wrongAttempts: 0,
  pathway: [],
  currentMolecule: null,
  targetMolecule: null,
  isGameActive: false,
  xp: 0,
  streak: 0,
  badges: 0
};

// ── Chemistry Data ───────────────────────────────────────────
const ChemistryData = {
  reactions: [
    {
      id: 'nitration',
      name: 'Nitration',
      formula: 'HNO₃/H₂SO₄',
      icon: '🔴',
      description: 'Adds nitro group (−NO₂) via electrophilic aromatic substitution',
      applicableTo: ['benzene', 'toluene', 'chlorobenzene'],
      result: {
        benzene: 'nitrobenzene',
        toluene: 'nitrotoluene',
        chlorobenzene: 'nitrochlorobenzene'
      }
    },
    {
      id: 'sulfonation',
      name: 'Sulfonation',
      formula: 'SO₃/H₂SO₄',
      icon: '🟡',
      description: 'Adds sulfonic acid group (−SO₃H) — reversible EAS',
      applicableTo: ['benzene', 'toluene'],
      result: {
        benzene: 'benzenesulfonic_acid',
        toluene: 'toluenesulfonic_acid'
      }
    },
    {
      id: 'halogenation',
      name: 'Halogenation',
      formula: 'X₂/FeX₃',
      icon: '🟢',
      description: 'Adds halogen (Cl/Br) via Lewis acid-catalysed EAS',
      applicableTo: ['benzene', 'nitrobenzene'],
      result: {
        benzene: 'chlorobenzene',
        nitrobenzene: 'nitrochlorobenzene'
      }
    },
    {
      id: 'reduction',
      name: 'Reduction',
      formula: 'Sn/HCl or H₂/Pd',
      icon: '🔵',
      description: 'Reduces −NO₂ → −NH₂ (aniline formation)',
      applicableTo: ['nitrobenzene', 'nitrotoluene'],
      result: {
        nitrobenzene: 'aniline',
        nitrotoluene: 'toluidine'
      }
    },
    {
      id: 'acylation',
      name: 'Friedel-Crafts Acylation',
      formula: 'RCOCl/AlCl₃',
      icon: '🟠',
      description: 'Adds acyl group via Lewis acid catalysis',
      applicableTo: ['benzene', 'toluene'],
      result: {
        benzene: 'acetophenone',
        toluene: 'methylacetophenone'
      }
    },
    {
      id: 'alkylation',
      name: 'Friedel-Crafts Alkylation',
      formula: 'R-Cl/AlCl₃',
      icon: '🟣',
      description: 'Adds alkyl group via carbocation electrophile',
      applicableTo: ['benzene'],
      result: {
        benzene: 'toluene'
      }
    }
  ],
  molecules: {
    benzene:               { name: 'Benzene',               formula: 'C₆H₆' },
    nitrobenzene:          { name: 'Nitrobenzene',           formula: 'C₆H₅NO₂' },
    toluene:               { name: 'Toluene',                formula: 'C₆H₅CH₃' },
    chlorobenzene:         { name: 'Chlorobenzene',          formula: 'C₆H₅Cl' },
    aniline:               { name: 'Aniline',                formula: 'C₆H₅NH₂' },
    benzenesulfonic_acid:  { name: 'Benzenesulfonic Acid',   formula: 'C₆H₅SO₃H' },
    nitrotoluene:          { name: 'Nitrotoluene',           formula: 'C₆H₄(CH₃)NO₂' },
    nitrochlorobenzene:    { name: 'Nitrochlorobenzene',     formula: 'C₆H₄ClNO₂' },
    acetophenone:          { name: 'Acetophenone',           formula: 'C₆H₅COCH₃' },
    methylacetophenone:    { name: 'Methylacetophenone',     formula: 'C₆H₄(CH₃)COCH₃' },
    toluidine:             { name: 'Toluidine',              formula: 'C₆H₄(CH₃)NH₂' },
    toluenesulfonic_acid:  { name: 'Toluenesulfonic Acid',   formula: 'C₆H₄(CH₃)SO₃H' }
  }
};

// ── Levels Data ──────────────────────────────────────────────
const Levels = [
  {
    id: 1,
    name: 'First Reaction',
    difficulty: 'BEGINNER',
    diffClass: 'beginner',
    startMolecule: 'benzene',
    targetMolecule: 'nitrobenzene',
    timeLimit: 120,
    optimalSteps: 1,
    optimalPath: ['nitration'],
    hint: 'Benzene is easily nitrated — add a nitro group using HNO₃ and H₂SO₄.',
    explanation: `
      <h4>🔬 Nitration of Benzene → Nitrobenzene</h4>
      <p>This reaction is a classic <strong>Electrophilic Aromatic Substitution (EAS)</strong>.</p>
      <h5>Why does it happen?</h5>
      <p>The benzene ring's π-electron cloud acts as a nucleophile. Concentrated H₂SO₄ (a catalyst) reacts with HNO₃ to generate the highly electrophilic <strong>nitronium ion (NO₂⁺)</strong>:</p>
      <p class="reaction-eq">HNO₃ + H₂SO₄ → NO₂⁺ + HSO₄⁻ + H₂O</p>
      <p>The NO₂⁺ ion attacks benzene's π system, forming a carbocation intermediate (arenium ion / sigma complex). A proton is then lost, restoring aromaticity and yielding <strong>nitrobenzene</strong>.</p>
      <h5>Key Points</h5>
      <ul>
        <li>H₂SO₄ is a catalyst &amp; dehydrating agent — drives equilibrium toward NO₂⁺</li>
        <li>Temperature must be kept below 55 °C to prevent di-nitration</li>
        <li>Product: yellow, oily liquid with characteristic bitter-almond odour</li>
        <li>Used industrially to make aniline (rubber, dyes, pharmaceuticals)</li>
      </ul>
    `
  },
  {
    id: 2,
    name: 'Double Transformation',
    difficulty: 'INTERMEDIATE',
    diffClass: 'intermediate',
    startMolecule: 'benzene',
    targetMolecule: 'aniline',
    timeLimit: 120,
    optimalSteps: 2,
    optimalPath: ['nitration', 'reduction'],
    hint: 'You need two steps: first introduce a nitro group, then reduce it to an amino group.',
    explanation: `
      <h4>🔬 Benzene → Nitrobenzene → Aniline</h4>
      <p>This is a two-step indirect synthesis that cannot be done in one step because direct amination of benzene is not feasible under normal conditions.</p>
      <h5>Step 1 — Nitration (EAS)</h5>
      <p>As in Level 1, concentrated HNO₃/H₂SO₄ generates NO₂⁺, which substitutes a ring hydrogen to give nitrobenzene.</p>
      <h5>Step 2 — Reduction</h5>
      <p>The −NO₂ group is reduced to −NH₂ using <strong>Sn and HCl</strong> (Béchamp reduction) or catalytic <strong>H₂/Pd</strong>:</p>
      <p class="reaction-eq">C₆H₅−NO₂ + 3[H₂] →(Sn/HCl) C₆H₅−NH₂ + 2H₂O</p>
      <h5>Why is aniline important?</h5>
      <ul>
        <li>Precursor to azo dyes, polyurethanes, rubber accelerators</li>
        <li>The −NH₂ group is a weak base &amp; ortho/para-director in further EAS</li>
        <li>Can be further converted to diazonium salts for coupling reactions</li>
      </ul>
    `
  },
  {
    id: 3,
    name: 'Aromatic Mastery',
    difficulty: 'ADVANCED',
    diffClass: 'advanced',
    startMolecule: 'benzene',
    targetMolecule: 'toluidine',
    timeLimit: 120,
    optimalSteps: 3,
    optimalPath: ['alkylation', 'nitration', 'reduction'],
    hint: 'Three steps: add a methyl group first (Friedel-Crafts), then nitrate, then reduce.',
    explanation: `
      <h4>🔬 Benzene → Toluene → Nitrotoluene → Toluidine</h4>
      <p>This multi-step synthesis illustrates how substituents <em>direct</em> further reactions.</p>
      <h5>Step 1 — Friedel-Crafts Alkylation</h5>
      <p>Methyl chloride (CH₃Cl) with AlCl₃ as Lewis acid catalyst generates a carbocation CH₃⁺ that undergoes EAS on benzene:</p>
      <p class="reaction-eq">C₆H₆ + CH₃Cl → (AlCl₃) C₆H₅CH₃ + HCl</p>
      <h5>Step 2 — Directed Nitration</h5>
      <p>The methyl group is an <strong>electron-donating ortho/para-director</strong>. When nitration is performed, the NO₂⁺ preferentially attacks the 2- and 4-positions, yielding predominantly <em>para</em>-nitrotoluene (with some ortho).</p>
      <h5>Step 3 — Reduction</h5>
      <p>The −NO₂ group is reduced (Sn/HCl or H₂/Pd) to −NH₂, giving <strong>toluidine</strong> (aminotoluene).</p>
      <h5>Key Concepts</h5>
      <ul>
        <li>Alkyl groups activate the ring (faster reactions than benzene)</li>
        <li>Directing effects allow regioselective synthesis</li>
        <li>Toluidine isomers are important in dye &amp; pharmaceutical industries</li>
        <li>Friedel-Crafts alkylation can cause <em>polyalkylation</em> — controlled by stoichiometry</li>
      </ul>
    `
  }
];

// ── DOM Elements ─────────────────────────────────────────────
const El = {};
function cacheElements() {
  const ids = [
    'menuScreen','gameScreen','levelGrid',
    'backBtn','timerDisplay','timerBox','scoreDisplay','attemptsDisplay','attemptsBox',
    'reactionList','pathwayTrack','workspaceHint',
    'undoBtn','clearBtn','hintBtn','explainBtn',
    'completionModal','timeUpModal','failedModal','leaderboardModal',
    'retryBtn','nextLevelBtn','menuBtn',
    'timeUpRetryBtn','timeUpMenuBtn',
    'failedRetryBtn','failedMenuBtn',
    'leaderboardBtn','resetProgressBtn','closeLeaderboard','closeLeaderboardBtn',
    'startMolName','targetMolName','currentMolDisplay',
    'levelNum','levelName','diffBadge','stepCount',
    'tutorMessages','dailyBtn',
    'menuLevel','menuXP','menuStreak','menuBadges','dailyDesc',
    'completionTitle','completionSubtitle','completionStars','completionStats',
    'optimalSection','optimalPath',
    'timeUpScore','timeUpSteps','timeUpTime','timeUpOptimalPath',
    'failedScore','failedAttempts','failedTime','failedOptimalPath',
    'leaderboardList','screenFlash','streakBox','streakDisplay','starsDisplay'
  ];
  ids.forEach(id => { El[id] = document.getElementById(id); });
}

// ═══════ INITIALIZATION ═════════════════════════════════════
function init() {
  cacheElements();
  loadProgress();
  renderLevelGrid();
  setupEventListeners();
  updateMenuStats();
  setupDailyChallenge();
}

function loadProgress() {
  try {
    const saved = localStorage.getItem('synthoquest_progress');
    if (saved) {
      const data = JSON.parse(saved);
      GameState.xp      = data.xp      || 0;
      GameState.streak  = data.streak  || 0;
      GameState.badges  = data.badges  || 0;
    }
  } catch(e) { /* ignore corrupt save */ }
}

function saveProgress() {
  localStorage.setItem('synthoquest_progress', JSON.stringify({
    xp:     GameState.xp,
    streak: GameState.streak,
    badges: GameState.badges
  }));
}

function setupDailyChallenge() {
  if (El.dailyDesc) {
    const idx = new Date().getDate() % Levels.length;
    El.dailyDesc.textContent = `${Levels[idx].name} — ${Levels[idx].difficulty}`;
  }
  El.dailyBtn?.addEventListener('click', () => {
    const idx = new Date().getDate() % Levels.length;
    startLevel(Levels[idx].id);
  });
}

// ═══════ EVENT LISTENERS ════════════════════════════════════
function setupEventListeners() {
  El.leaderboardBtn?.addEventListener('click', showLeaderboard);
  El.resetProgressBtn?.addEventListener('click', resetProgress);

  El.backBtn?.addEventListener('click', backToMenu);
  El.undoBtn?.addEventListener('click', undoStep);
  El.clearBtn?.addEventListener('click', clearPathway);
  El.hintBtn?.addEventListener('click', showHint);
  El.explainBtn?.addEventListener('click', showExplainPanel);

  El.retryBtn?.addEventListener('click',      () => retryLevel());
  El.nextLevelBtn?.addEventListener('click',  nextLevel);
  El.menuBtn?.addEventListener('click',       backToMenu);
  El.timeUpRetryBtn?.addEventListener('click',() => retryLevel());
  El.timeUpMenuBtn?.addEventListener('click', backToMenu);
  El.failedRetryBtn?.addEventListener('click',() => retryLevel());
  El.failedMenuBtn?.addEventListener('click', backToMenu);

  El.closeLeaderboard?.addEventListener('click',    hideLeaderboard);
  El.closeLeaderboardBtn?.addEventListener('click', hideLeaderboard);
}

// ═══════ MENU ════════════════════════════════════════════════
function renderLevelGrid() {
  if (!El.levelGrid) return;
  El.levelGrid.innerHTML = '';
  Levels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = 'level-card';
    btn.innerHTML = `
      <span class="level-num">${level.id}</span>
      <span class="level-card-name">${level.name}</span>
      <span class="level-card-diff">${level.difficulty}</span>
    `;
    btn.addEventListener('click', () => startLevel(level.id));
    El.levelGrid.appendChild(btn);
  });
}

function updateMenuStats() {
  if (El.menuXP)     El.menuXP.textContent     = GameState.xp;
  if (El.menuStreak) El.menuStreak.textContent  = GameState.streak;
  if (El.menuBadges) El.menuBadges.textContent  = GameState.badges;

  let rank = 'Novice';
  if (GameState.xp >= 100)  rank = 'Apprentice';
  if (GameState.xp >= 300)  rank = 'Chemist';
  if (GameState.xp >= 500)  rank = 'Expert';
  if (GameState.xp >= 1000) rank = 'Master';
  if (El.menuLevel) El.menuLevel.textContent = rank;
}

function showLeaderboard() {
  El.leaderboardModal?.classList.add('active');
  renderLeaderboard();
}

function hideLeaderboard() {
  El.leaderboardModal?.classList.remove('active');
}

function renderLeaderboard() {
  if (!El.leaderboardList) return;
  const scores = [
    { name: 'ChemMaster',    score: 2500 },
    { name: 'ReactionKing',  score: 2100 },
    { name: 'SynthesisPro',  score: 1800 },
    { name: 'You',           score: GameState.xp }
  ].sort((a,b) => b.score - a.score);

  const medals = ['🥇','🥈','🥉'];
  El.leaderboardList.innerHTML = scores.map((entry, i) => `
    <div class="lb-entry ${entry.name === 'You' ? 'highlight' : ''}">
      <span class="lb-rank">${medals[i] || i+1}</span>
      <span class="lb-name">${entry.name}</span>
      <span class="lb-score">${entry.score} pts</span>
    </div>
  `).join('');
}

function resetProgress() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.removeItem('synthoquest_progress');
    GameState.xp = 0; GameState.streak = 0; GameState.badges = 0;
    updateMenuStats();
  }
}

// ═══════ GAME FLOW ═══════════════════════════════════════════
function startLevel(levelId) {
  const level = Levels.find(l => l.id === levelId);
  if (!level) return;

  // Reset state
  GameState.currentLevel    = levelId;
  GameState.score           = 0;
  GameState.timeRemaining   = level.timeLimit; // 120 seconds
  GameState.attempts        = 2;               // 2 chances
  GameState.wrongAttempts   = 0;
  GameState.pathway         = [];
  GameState.currentMolecule = level.startMolecule;
  GameState.targetMolecule  = level.targetMolecule;
  GameState.isGameActive    = true;

  // Update header UI
  if (El.levelNum)         El.levelNum.textContent         = level.id;
  if (El.levelName)        El.levelName.textContent        = level.name;
  if (El.diffBadge)        El.diffBadge.textContent        = level.difficulty;
  if (El.diffBadge)        El.diffBadge.className          = `diff-badge ${level.diffClass}`;
  if (El.startMolName)     El.startMolName.textContent     = ChemistryData.molecules[level.startMolecule].name;
  if (El.targetMolName)    El.targetMolName.textContent    = ChemistryData.molecules[level.targetMolecule].name;
  if (El.currentMolDisplay)El.currentMolDisplay.textContent= ChemistryData.molecules[level.startMolecule].name;
  if (El.scoreDisplay)     El.scoreDisplay.textContent     = '0';
  if (El.attemptsDisplay)  El.attemptsDisplay.textContent  = '2';
  if (El.attemptsBox)      El.attemptsBox.classList.remove('attempt-warning');
  if (El.stepCount)        El.stepCount.textContent        = '0';
  if (El.timerDisplay)     El.timerDisplay.textContent     = formatTime(120);
  if (El.timerBox)         El.timerBox.classList.remove('urgent');
  if (El.starsDisplay)     El.starsDisplay.innerHTML       = '<span class="star">☆</span><span class="star">☆</span><span class="star">☆</span>';

  renderReactions();
  renderPathway();

  // Welcome message
  if (El.tutorMessages) {
    El.tutorMessages.innerHTML = '';
    addTutorMsg(`Welcome to <strong>${level.name}</strong>! I'm Dr. Synth. 🧬<br>Convert <em>${ChemistryData.molecules[level.startMolecule].name}</em> into <em>${ChemistryData.molecules[level.targetMolecule].name}</em>. You have <strong>2 minutes</strong> and <strong>2 attempts</strong>. Choose wisely!`, 'info');
  }
  if (El.workspaceHint) El.workspaceHint.textContent = 'Click a reaction from the toolbar to begin your synthesis pathway';

  // Switch screens
  hideAllModals();
  El.menuScreen?.classList.remove('active');
  El.gameScreen?.classList.add('active');

  // Start timer
  startTimer();
}

// ── Timer ────────────────────────────────────────────────────
function startTimer() {
  clearInterval(GameState.timerInterval);
  GameState.timerInterval = setInterval(() => {
    if (!GameState.isGameActive) { clearInterval(GameState.timerInterval); return; }

    GameState.timeRemaining--;
    if (El.timerDisplay) El.timerDisplay.textContent = formatTime(GameState.timeRemaining);

    // Urgent pulse below 30 s
    if (GameState.timeRemaining <= 30) {
      El.timerBox?.classList.add('urgent');
    }

    if (GameState.timeRemaining <= 0) {
      endGame('timeUp');
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// ── End Game ─────────────────────────────────────────────────
function endGame(reason) {
  GameState.isGameActive = false;
  clearInterval(GameState.timerInterval);

  if      (reason === 'timeUp')    showTimeUpModal();
  else if (reason === 'failed')    showFailedModal();
  else if (reason === 'completed') showCompletionModal();
}

// ── Render Reactions Toolbar ──────────────────────────────────
function renderReactions() {
  if (!El.reactionList) return;
  El.reactionList.innerHTML = '';

  ChemistryData.reactions.forEach(reaction => {
    const card = document.createElement('button');
    const isApplicable = reaction.applicableTo.includes(GameState.currentMolecule);

    card.className = `reaction-card ${isApplicable ? 'available' : 'unavailable'}`;
    if (!isApplicable || !GameState.isGameActive) {
      card.disabled = true;
    }

    card.innerHTML = `
      <div class="rxn-icon" style="background:${reactionColor(reaction.id)}">${reaction.icon}</div>
      <div class="rxn-info">
        <span class="rxn-name">${reaction.name}</span>
        <span class="rxn-reagent">${reaction.formula}</span>
      </div>
      <div class="rxn-tooltip">
        <div class="rxn-tooltip-title">${reaction.name}</div>
        <div class="rxn-tooltip-desc">${reaction.description}</div>
        <div class="rxn-tooltip-mech">${reaction.formula}</div>
      </div>
    `;

    if (isApplicable && GameState.isGameActive) {
      card.addEventListener('click', () => applyReaction(reaction));
    }

    El.reactionList.appendChild(card);
  });
}

function reactionColor(id) {
  const map = {
    nitration:    'rgba(239,68,68,0.15)',
    sulfonation:  'rgba(245,158,11,0.15)',
    halogenation: 'rgba(34,197,94,0.15)',
    reduction:    'rgba(0,212,255,0.15)',
    acylation:    'rgba(249,115,22,0.15)',
    alkylation:   'rgba(168,85,247,0.15)'
  };
  return map[id] || 'rgba(255,255,255,0.05)';
}

// ── Apply Reaction ────────────────────────────────────────────
function applyReaction(reaction) {
  if (!GameState.isGameActive) return;

  const resultMol = reaction.result[GameState.currentMolecule];
  if (!resultMol) return;

  // Push step to pathway
  GameState.pathway.push({
    reaction: reaction.id,
    from: GameState.currentMolecule,
    to:   resultMol
  });

  GameState.currentMolecule = resultMol;
  if (El.currentMolDisplay) El.currentMolDisplay.textContent = ChemistryData.molecules[resultMol].name;
  if (El.stepCount)         El.stepCount.textContent         = GameState.pathway.length;

  // Scroll pathway
  renderPathway();
  renderReactions();

  // ── Check: Target reached ──────────────────────────────
  if (GameState.currentMolecule === GameState.targetMolecule) {
    const level     = Levels[GameState.currentLevel - 1];
    const basePoints = 100;
    const timeBonus  = Math.floor(GameState.timeRemaining / 2);
    const stepPenalty= Math.max(0, GameState.pathway.length - level.optimalSteps) * 10;
    const points     = Math.max(basePoints + timeBonus - stepPenalty, 50);

    GameState.score = points;
    if (El.scoreDisplay) El.scoreDisplay.textContent = points;

    // Update stars
    updateStarsDisplay(calculateStars());

    flashScreen('flash-green');
    addTutorMsg(`🎉 Excellent! You synthesised <strong>${ChemistryData.molecules[GameState.targetMolecule].name}</strong>!`, 'success');
    setTimeout(() => endGame('completed'), 800);
    return;
  }

  // ── Check: Dead end (no further reactions applicable) ────
  const canContinue = ChemistryData.reactions.some(r =>
    r.applicableTo.includes(GameState.currentMolecule) && r.result[GameState.currentMolecule]
  );

  if (!canContinue) {
    // Dead end = wrong attempt consumed
    GameState.wrongAttempts++;
    GameState.attempts--;

    if (El.attemptsDisplay) El.attemptsDisplay.textContent = GameState.attempts;
    if (GameState.attempts <= 1 && El.attemptsBox) El.attemptsBox.classList.add('attempt-warning');

    flashScreen('flash-red');
    addTutorMsg(`⚠️ Dead end! No reactions can be applied to <strong>${ChemistryData.molecules[GameState.currentMolecule].name}</strong>. That counts as a wrong attempt — <strong>${GameState.attempts}</strong> left.`, 'error');

    if (GameState.attempts <= 0) {
      setTimeout(() => endGame('failed'), 1000);
    } else {
      // Auto-reset pathway so they can try again
      setTimeout(() => {
        GameState.pathway         = [];
        GameState.currentMolecule = Levels[GameState.currentLevel - 1].startMolecule;
        if (El.currentMolDisplay) El.currentMolDisplay.textContent = ChemistryData.molecules[GameState.currentMolecule].name;
        if (El.stepCount)         El.stepCount.textContent         = '0';
        renderPathway();
        renderReactions();
        addTutorMsg(`🔄 Pathway reset. Try a different route!`, 'info');
      }, 1200);
    }
  } else {
    // Step applied — not a dead end, just progressing
    addTutorMsg(`➡ Applied <strong>${reaction.name}</strong>. Now at: <em>${ChemistryData.molecules[resultMol].name}</em>. Keep going!`, 'info');

    if (El.workspaceHint) El.workspaceHint.textContent = `Current: ${ChemistryData.molecules[resultMol].name} — choose the next reaction`;
  }
}

// ── Render Pathway (horizontal canvas) ───────────────────────
function renderPathway() {
  if (!El.pathwayTrack) return;
  El.pathwayTrack.innerHTML = '';

  const level = Levels[GameState.currentLevel - 1];

  // Start node
  El.pathwayTrack.appendChild(makeNode(
    ChemistryData.molecules[level.startMolecule].name,
    ChemistryData.molecules[level.startMolecule].formula,
    'start'
  ));

  // Steps
  GameState.pathway.forEach((step, i) => {
    const reactionData = ChemistryData.reactions.find(r => r.id === step.reaction);
    El.pathwayTrack.appendChild(makeConnector(reactionData ? reactionData.name : step.reaction));

    const isLast = (i === GameState.pathway.length - 1);
    const isTarget = step.to === GameState.targetMolecule;
    El.pathwayTrack.appendChild(makeNode(
      ChemistryData.molecules[step.to].name,
      ChemistryData.molecules[step.to].formula,
      isTarget ? 'correct' : (isLast ? 'current' : '')
    ));
  });
}

function makeNode(name, formula, state='') {
  const node = document.createElement('div');
  node.className = 'pathway-node';
  node.innerHTML = `
    <div class="node-mol-container ${state}">
      <canvas width="80" height="60"></canvas>
      <div class="node-mol-name">${name}</div>
    </div>
  `;
  // Draw simple hexagon representation
  const canvas = node.querySelector('canvas');
  drawMolecule(canvas, name);
  return node;
}

function makeConnector(label) {
  const conn = document.createElement('div');
  conn.className = 'pathway-connector';
  conn.innerHTML = `
    <div class="connector-arrow"></div>
    <div class="connector-label">${label}</div>
  `;
  return conn;
}

// Simple molecule visualiser — draws a benzene ring with annotation
function drawMolecule(canvas, name) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w/2, cy = h/2 - 6;
  const r = Math.min(w,h) * 0.28;

  ctx.clearRect(0,0,w,h);

  // Hexagon
  ctx.beginPath();
  for (let i=0; i<6; i++) {
    const angle = (Math.PI/3)*i - Math.PI/6;
    const x = cx + r*Math.cos(angle);
    const y = cy + r*Math.sin(angle);
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Inner circle (aromaticity)
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.55, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(96,165,250,0.4)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Label (first character)
  ctx.fillStyle   = '#e2e8f0';
  ctx.font        = `bold 9px monospace`;
  ctx.textAlign   = 'center';
  ctx.textBaseline= 'top';
  ctx.fillText(name.slice(0,3), cx, cy + r + 3);
}

// ── Undo / Clear ──────────────────────────────────────────────
function undoStep() {
  if (!GameState.isGameActive || GameState.pathway.length === 0) return;

  const last = GameState.pathway.pop();
  GameState.currentMolecule = last.from;
  if (El.currentMolDisplay) El.currentMolDisplay.textContent = ChemistryData.molecules[last.from].name;
  if (El.stepCount)         El.stepCount.textContent         = GameState.pathway.length;

  renderPathway();
  renderReactions();
  addTutorMsg('↩ Step undone — try a different reaction.', 'hint');
}

function clearPathway() {
  if (!GameState.isGameActive) return;

  GameState.pathway         = [];
  GameState.currentMolecule = Levels[GameState.currentLevel - 1].startMolecule;
  if (El.currentMolDisplay) El.currentMolDisplay.textContent = ChemistryData.molecules[GameState.currentMolecule].name;
  if (El.stepCount)         El.stepCount.textContent         = '0';
  if (El.workspaceHint)     El.workspaceHint.textContent     = 'Click a reaction from the toolbar to begin';

  renderPathway();
  renderReactions();
  addTutorMsg('🗑 Pathway cleared. Start fresh!', 'hint');
}

// ── Tutor Hint / Explain ──────────────────────────────────────
function showHint() {
  const level = Levels[GameState.currentLevel - 1];
  addTutorMsg(`💡 <strong>Hint:</strong> ${level.hint}`, 'hint');
}

function showExplainPanel() {
  const level = Levels[GameState.currentLevel - 1];
  addTutorMsg(`📖 <strong>Explanation:</strong><br>${level.explanation}`, 'hint');
}

// ── Tutor Messages ────────────────────────────────────────────
function addTutorMsg(html, type='info') {
  if (!El.tutorMessages) return;

  const div = document.createElement('div');
  div.className = `tutor-msg ${type}`;
  div.innerHTML = html;
  El.tutorMessages.appendChild(div);
  El.tutorMessages.scrollTop = El.tutorMessages.scrollHeight;
}

// ── Modals ────────────────────────────────────────────────────
function showCompletionModal() {
  if (!El.completionModal) return;

  const level = Levels[GameState.currentLevel - 1];
  const stars = calculateStars();

  if (El.completionTitle)    El.completionTitle.textContent    = 'Level Complete! 🎉';
  if (El.completionSubtitle) El.completionSubtitle.textContent = 'Outstanding work, chemist!';
  if (El.completionStars)    El.completionStars.innerHTML      = '⭐'.repeat(stars) + '☆'.repeat(3-stars);

  if (El.completionStats) El.completionStats.innerHTML = `
    <div class="comp-stat"><span class="comp-stat-val">${GameState.score}</span><span class="comp-stat-label">Score</span></div>
    <div class="comp-stat"><span class="comp-stat-val">${GameState.pathway.length}</span><span class="comp-stat-label">Steps</span></div>
    <div class="comp-stat" style="grid-column:span 2"><span class="comp-stat-val">${formatTime(level.timeLimit - GameState.timeRemaining)}</span><span class="comp-stat-label">Time Used</span></div>
  `;

  // Show or hide optimal path section
  const optSection = El.optimalSection;
  if (optSection) {
    if (GameState.pathway.length > level.optimalSteps) {
      optSection.style.display = 'block';
      if (El.optimalPath) El.optimalPath.innerHTML = buildOptimalPathHTML(level);
    } else {
      optSection.style.display = 'none';
    }
  }

  // Award XP
  GameState.xp += GameState.score;
  GameState.streak++;
  if (stars === 3) GameState.badges++;
  saveProgress();

  El.completionModal.classList.add('active');
}

function showTimeUpModal() {
  if (!El.timeUpModal) return;
  const level = Levels[GameState.currentLevel - 1];

  // No points awarded when time runs out
  if (El.timeUpScore) El.timeUpScore.textContent = '0';
  if (El.timeUpSteps) El.timeUpSteps.textContent = GameState.pathway.length;
  if (El.timeUpTime)  El.timeUpTime.textContent  = '2:00';

  if (El.timeUpOptimalPath) {
    El.timeUpOptimalPath.innerHTML = buildOptimalPathHTML(level) + buildExplanationHTML(level);
  }

  GameState.streak = 0;
  saveProgress();

  El.timeUpModal.classList.add('active');
}

function showFailedModal() {
  if (!El.failedModal) return;
  const level = Levels[GameState.currentLevel - 1];

  // No points for failing
  if (El.failedScore)    El.failedScore.textContent    = '0';
  if (El.failedAttempts) El.failedAttempts.textContent = GameState.wrongAttempts;
  if (El.failedTime)     El.failedTime.textContent     = formatTime(level.timeLimit - GameState.timeRemaining);

  if (El.failedOptimalPath) {
    El.failedOptimalPath.innerHTML = buildOptimalPathHTML(level) + buildExplanationHTML(level);
  }

  GameState.streak = 0;
  saveProgress();

  El.failedModal.classList.add('active');
}

// ── Build Solution HTML ───────────────────────────────────────
function buildOptimalPathHTML(level) {
  const path = level.optimalPath;
  let mol = level.startMolecule;
  let html = `<div class="optimal-steps">`;
  html += `<span class="opt-step">${ChemistryData.molecules[mol].name}</span>`;

  path.forEach(rxnId => {
    const rxn = ChemistryData.reactions.find(r => r.id === rxnId);
    if (!rxn) return;
    mol = rxn.result[mol];
    html += `<span class="opt-arrow">→</span><span class="opt-step">${rxn.name}</span>`;
    html += `<span class="opt-arrow">→</span><span class="opt-step solution-step">${ChemistryData.molecules[mol].name}</span>`;
  });

  html += `</div>`;
  return html;
}

function buildExplanationHTML(level) {
  return `
    <div class="explanation-box">
      <div class="explanation-header">📚 Why did this reaction happen?</div>
      <div class="explanation-body">${level.explanation}</div>
    </div>
  `;
}

// ── Navigation / Retry ────────────────────────────────────────
function retryLevel() {
  hideAllModals();
  startLevel(GameState.currentLevel);
}

function nextLevel() {
  hideAllModals();
  const next = GameState.currentLevel + 1;
  if (next <= Levels.length) {
    startLevel(next);
  } else {
    backToMenu();
  }
}

function backToMenu() {
  hideAllModals();
  clearInterval(GameState.timerInterval);
  GameState.isGameActive = false;

  El.gameScreen?.classList.remove('active');
  El.menuScreen?.classList.add('active');
  updateMenuStats();
}

function hideAllModals() {
  El.completionModal?.classList.remove('active');
  El.timeUpModal?.classList.remove('active');
  El.failedModal?.classList.remove('active');
  El.leaderboardModal?.classList.remove('active');
}

// ── Helpers ───────────────────────────────────────────────────
function calculateStars() {
  const level = Levels[GameState.currentLevel - 1];
  const steps = GameState.pathway.length;
  if (steps <= level.optimalSteps)     return 3;
  if (steps <= level.optimalSteps + 1) return 2;
  return 1;
}

function updateStarsDisplay(stars) {
  if (!El.starsDisplay) return;
  El.starsDisplay.innerHTML = '';
  for (let i=1; i<=3; i++) {
    const s = document.createElement('span');
    s.className = `star ${i <= stars ? 'earned' : ''}`;
    s.textContent = i <= stars ? '⭐' : '☆';
    El.starsDisplay.appendChild(s);
  }
}

function flashScreen(cls) {
  if (!El.screenFlash) return;
  El.screenFlash.className = `screen-flash ${cls}`;
  setTimeout(() => { El.screenFlash.className = 'screen-flash'; }, 600);
}

// ═══════ BOOT ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
