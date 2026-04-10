// ====================================================
// EDULAB — Unified Script
// Merging: UserSystem, Inorganic, Organic, Chirality,
//          Math Lab, Algorithm Lab
// ====================================================

// ====================================================
// 1. USER SYSTEM
// ====================================================
const UserSystem = {
  currentUser: null,
  progress: { inorganic: 0, organic: 0, math: 0, chirality: 0, quiz: 0 },
  badges: [],

  init() {
    const saved = localStorage.getItem('eduLabUser');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.currentUser = data.username;
        this.progress = data.progress || this.progress;
        this.badges = data.badges || [];
        this.showMainApp();
      } catch (e) { localStorage.removeItem('eduLabUser'); }
    }
    document.getElementById('loginBtn')?.addEventListener('click', () => this.login());
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    document.getElementById('usernameInput')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.login();
    });
  },

  login() {
    const input = document.getElementById('usernameInput');
    const username = input?.value.trim();
    if (!username) { input.style.border = '1.5px solid #ef4444'; return; }
    this.currentUser = username;
    this.progress = { inorganic: 0, organic: 0, math: 0, chirality: 0, quiz: 0 };
    this.badges = [];
    this.save();
    this.showMainApp();
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('eduLabUser');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('usernameInput').value = '';
  },

  save() {
    if (!this.currentUser) return;
    localStorage.setItem('eduLabUser', JSON.stringify({
      username: this.currentUser, progress: this.progress,
      badges: this.badges, lastActive: new Date().toISOString()
    }));
    this.updateUI();
  },

  showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('navUserName').textContent = this.currentUser;
    this.updateUI();
  },

  updateProgress(module, percent) {
    if (this.progress[module] < percent) {
      this.progress[module] = percent;
      this.checkBadges();
      this.save();
    }
  },

  checkBadges() {
    const total = Object.values(this.progress).reduce((a, b) => a + b, 0) / 5;
    const newBadges = [];
    if (total >= 20 && !this.badges.includes('🌱')) newBadges.push('🌱');
    if (total >= 40 && !this.badges.includes('🌿')) newBadges.push('🌿');
    if (total >= 60 && !this.badges.includes('🔬')) newBadges.push('🔬');
    if (total >= 80 && !this.badges.includes('🏆')) newBadges.push('🏆');
    if (total >= 95 && !this.badges.includes('👑')) newBadges.push('👑');
    this.badges.push(...newBadges);
    if (newBadges.length > 0) this.showBadgeNotification(newBadges);
  },

  showBadgeNotification(newBadges) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#1e3a5f,#1a2744);border:1px solid rgba(59,130,246,0.4);padding:16px 22px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.4);z-index:10001;animation:slideIn 0.4s;color:#f1f5f9;font-family:Outfit,sans-serif;';
    div.innerHTML = `<strong style="color:#60a5fa;">🎉 Badge Earned!</strong><br><span style="font-size:1.5rem;">${newBadges.join(' ')}</span>`;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity='0'; div.style.transition='opacity 0.4s'; setTimeout(()=>div.remove(),400); }, 3000);
  },

  updateUI() {
    const total = Object.values(this.progress).reduce((a,b)=>a+b,0)/5;
    const fill = document.getElementById('navProgressFill');
    const pct = document.getElementById('navProgressPct');
    if (fill) fill.style.width = `${total}%`;
    if (pct) pct.textContent = `${Math.round(total)}%`;
    const bc = document.getElementById('navBadges');
    if (bc) bc.innerHTML = ['🌱','🌿','🔬','🏆','👑']
      .map(b=>`<span class="badge ${this.badges.includes(b)?'earned':''}">${b}</span>`).join('');
  }
};

// ====================================================
// 2. TOP-LEVEL NAVIGATION (Chemistry | Maths | Coding)
// ====================================================
function initTopNav() {
  const sections = {
    chemistry: document.getElementById('sectionChemistry'),
    maths: document.getElementById('sectionMaths'),
    coding: document.getElementById('sectionCoding')
  };
  const navBtns = document.querySelectorAll('.nav-btn');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.entries(sections).forEach(([key, el]) => {
        if (el) el.style.display = key === target ? 'block' : 'none';
      });
      // Init labs on first show
      if (target === 'maths') {
        initMathLab();
        // Check which math tab is active and init if needed
        const conicsTab = document.querySelector('[data-mathtab="conics"]');
        if (conicsTab?.classList.contains('active')) {
          setTimeout(() => initConicsLab(), 50);
        }
      }
      if (target === 'coding') AlgoLab.init();
    });
  });
}

// ====================================================
// 3. CHEMISTRY SUB-TABS
// ====================================================
function initChemSubTabs() {
  const panels = {
    inorganic: document.getElementById('chemInorganic'),
    organic: document.getElementById('chemOrganic'),
    chirality: document.getElementById('chemChirality'),
    quiz: document.getElementById('chemQuiz'),
    game: document.getElementById('chemGame')
  };

  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.chemtab;
      Object.entries(panels).forEach(([key, el]) => {
        if (el) el.style.display = key === target ? 'block' : 'none';
      });
      if (target === 'chirality' && !chiralityInitialized) {
        setTimeout(() => {
          initChiralityLab();
          const container = document.getElementById('threeContainer');
          if (container && chiralityCamera && chiralityRenderer) {
            chiralityCamera.aspect = container.clientWidth / container.clientHeight;
            chiralityCamera.updateProjectionMatrix();
            chiralityRenderer.setSize(container.clientWidth, container.clientHeight);
          }
        }, 50);
      }
    });
  });
}

// ====================================================
// 3b. MATH SUB-TABS
// ====================================================
function initMathSubTabs() {
  // Only conics lab now - no sub-tabs needed
  const mathConics = document.getElementById('mathConics');
  if (mathConics) {
    initConicsLab();
  }
}

// ====================================================
// 4. INORGANIC LAB
// ====================================================
const CHEMICALS = [
  { id: 'hcl',    name: 'Hydrochloric Acid',   formula: 'HCl',         color: '#ffb3b3' },
  { id: 'naoh',   name: 'Sodium Hydroxide',     formula: 'NaOH',        color: '#d6f5d6' },
  { id: 'cuso4',  name: 'Copper(II) Sulfate',   formula: 'CuSO₄',       color: '#66ccff' },
  { id: 'agno3',  name: 'Silver Nitrate',        formula: 'AgNO₃',       color: '#f5f5f5' },
  { id: 'pbno3',  name: 'Lead(II) Nitrate',      formula: 'Pb(NO₃)₂',   color: '#dddddd' },
  { id: 'ki',     name: 'Potassium Iodide',      formula: 'KI',          color: '#fff7b3' },
  { id: 'bacl2',  name: 'Barium Chloride',       formula: 'BaCl₂',       color: '#f0f0f0' },
  { id: 'na2co3', name: 'Sodium Carbonate',      formula: 'Na₂CO₃',      color: '#ffffff' },
  { id: 'fecl3',  name: 'Iron(III) Chloride',    formula: 'FeCl₃',       color: '#d9a066' },
  { id: 'znso4',  name: 'Zinc Sulfate',           formula: 'ZnSO₄',       color: '#cce0ff' },
  { id: 'zn',     name: 'Zinc Metal',             formula: 'Zn',          color: '#c0c0c0' },
  { id: 'k2cro4', name: 'Potassium Chromate',    formula: 'K₂CrO₄',     color: '#ffeb3b' },
  { id: 'nacl',   name: 'Sodium Chloride',        formula: 'NaCl',        color: '#f0f0f0' }
];

const REACTIONS = {
  'hcl|naoh': {
    equation: 'HCl + NaOH → NaCl + H₂O', explanation: 'Neutralization: forms salt and water.',
    color: '#b3e5fc', type: 'neutralization',
    detailedExplanation: {
      title: 'Acid-Base Neutralization',
      whatHappened: 'Hydrochloric acid (HCl) reacts with Sodium Hydroxide (NaOH) in a classic <strong>neutralization reaction</strong>.',
      mechanism: 'HCl dissociates into H⁺ and Cl⁻ ions. NaOH dissociates into Na⁺ and OH⁻ ions. H⁺ and OH⁻ combine to form water.',
      observation: 'Solution remains clear with slight temperature increase (exothermic reaction).',
      realWorld: 'Basis of antacid tablets neutralizing stomach acid.'
    }
  },
  'pbno3|ki': {
    equation: 'Pb(NO₃)₂ + 2KI → PbI₂ ↓ + 2KNO₃', explanation: 'Yellow precipitate of lead(II) iodide.',
    color: '#fff176', precipitateColor: '#fdd835', type: 'precipitation',
    detailedExplanation: {
      title: 'Double Displacement — Lead Iodide Precipitation',
      whatHappened: 'Lead(II) Nitrate and Potassium Iodide undergo a <strong>double displacement reaction</strong>.',
      mechanism: 'Pb²⁺ ions meet I⁻ ions. PbI₂ has very low solubility and crystallizes out.',
      observation: 'A brilliant <strong>golden-yellow precipitate</strong> forms immediately.',
      realWorld: 'Used in qualitative analysis to detect lead ions in solution.'
    }
  },
  'cuso4|naoh': {
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂ ↓ + Na₂SO₄', explanation: 'Blue precipitate of copper(II) hydroxide.',
    color: '#64b5f6', precipitateColor: '#1e88e5', type: 'precipitation',
    detailedExplanation: {
      title: 'Copper Hydroxide Precipitation',
      whatHappened: 'Copper(II) Sulfate reacts with Sodium Hydroxide to form <strong>Copper(II) Hydroxide</strong>.',
      mechanism: 'Cu²⁺ ions from CuSO₄ combine with OH⁻ ions from NaOH. Cu(OH)₂ is insoluble.',
      observation: 'A <strong>pale blue, jelly-like precipitate</strong> forms.',
      realWorld: 'Cu(OH)₂ is used as a fungicide in agriculture (Bordeaux mixture).'
    }
  },
  'bacl2|na2co3': {
    equation: 'BaCl₂ + Na₂CO₃ → BaCO₃ ↓ + 2NaCl', explanation: 'White precipitate of barium carbonate.',
    color: '#e0e0e0', precipitateColor: '#fafafa', type: 'precipitation',
    detailedExplanation: {
      title: 'Barium Carbonate Precipitation',
      whatHappened: 'Barium Chloride reacts with Sodium Carbonate forming insoluble <strong>Barium Carbonate (BaCO₃)</strong>.',
      mechanism: 'Ba²⁺ ions combine with CO₃²⁻ ions. BaCO₃ is practically insoluble.',
      observation: 'A dense <strong>white precipitate</strong> forms instantly, turning the solution milky.',
      realWorld: 'BaCO₃ is used in the manufacture of specialty glass and ceramics.'
    }
  },
  'fecl3|naoh': {
    equation: 'FeCl₃ + 3NaOH → Fe(OH)₃ ↓ + 3NaCl', explanation: 'Reddish-brown precipitate of iron(III) hydroxide.',
    color: '#a0522d', precipitateColor: '#8d4925', type: 'precipitation',
    detailedExplanation: {
      title: 'Iron(III) Hydroxide Precipitation',
      whatHappened: 'Iron(III) Chloride reacts with Sodium Hydroxide to produce <strong>Iron(III) Hydroxide</strong>.',
      mechanism: 'Fe³⁺ ions react with OH⁻ ions in a 1:3 ratio. Iron(III) hydroxide is highly insoluble.',
      observation: 'A thick, <strong>reddish-brown (rust-colored) precipitate</strong> forms.',
      realWorld: 'Fe(OH)₃ is the main component of rust. Used in water treatment.'
    }
  },
  'hcl|zn': {
    equation: 'Zn + 2HCl → ZnCl₂ + H₂ ↑', explanation: 'Hydrogen gas released — vigorous reaction!',
    color: '#ff7043', specialEffect: 'blast', type: 'gas-evolution',
    detailedExplanation: {
      title: 'Metal-Acid Reaction — Hydrogen Gas Evolution',
      whatHappened: 'Zinc metal reacts vigorously with Hydrochloric Acid in a <strong>single displacement reaction</strong>.',
      mechanism: 'Zinc loses 2 electrons to become Zn²⁺ (oxidation). H⁺ ions gain electrons to form H₂ gas.',
      observation: 'Vigorous <strong>bubbling and effervescence</strong> as hydrogen gas is released.',
      realWorld: 'Basis of how electrochemical cells (batteries) work.'
    }
  }
};

function hexToRgba(hex, alpha) {
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

let beakerContents = [];
let exploredReactions = [];
let currentReaction = null;

function initInorganicLab() {
  const chemList = document.getElementById('chemList');
  if (!chemList || chemList.children.length > 0) return;

  CHEMICALS.forEach(chem => {
    const div = document.createElement('div');
    div.className = 'chem';
    div.dataset.id = chem.id;
    div.innerHTML = `
      <div class="swatch" style="background:${chem.color}"></div>
      <div class="chem-info">
        <div class="chem-formula">${chem.formula}</div>
        <div class="chem-name">${chem.name}</div>
      </div>`;
    div.addEventListener('click', () => addToBeaker(chem.id, div));
    chemList.appendChild(div);
  });

  document.getElementById('mixBtn')?.addEventListener('click', mixChemicals);
  document.getElementById('resetBtn')?.addEventListener('click', resetInorganic);
  document.getElementById('explanationToggleBtn')?.addEventListener('click', toggleExplanation);
  document.getElementById('closeExplanation')?.addEventListener('click', () => {
    document.getElementById('explanationPanel')?.classList.remove('visible');
    document.getElementById('explanationToggleBtn')?.classList.remove('active');
  });
}

function addToBeaker(id, element) {
  if (beakerContents.length >= 2 || beakerContents.includes(id)) return;
  const chem = CHEMICALS.find(c => c.id === id);
  beakerContents.push(id);
  element.classList.add('selected');

  const tag = document.createElement('div');
  tag.className = 'chem-tag';
  tag.textContent = chem.formula;
  document.getElementById('contents')?.appendChild(tag);

  const liquid = document.getElementById('liquid');
  const curH = parseFloat(liquid.style.height)||0;
  liquid.style.height = (curH+25)+'%';
  liquid.style.background = `linear-gradient(180deg,${hexToRgba(chem.color,0.5)},${hexToRgba(chem.color,0.7)})`;

  playPourSound();
  updateBeakerText();
  const mixBtn = document.getElementById('mixBtn');
  if (mixBtn) mixBtn.disabled = beakerContents.length !== 2;
}

function updateBeakerText() {
  const el = document.getElementById('beakerContentsText');
  if (!el) return;
  if (beakerContents.length === 0) { el.textContent = 'No chemicals yet.'; return; }
  el.textContent = beakerContents.map(id => CHEMICALS.find(c=>c.id===id)?.formula).join(' + ');
}

function mixChemicals() {
  if (beakerContents.length !== 2) return;
  const [a, b] = beakerContents.sort();
  const key = `${a}|${b}`;
  const rxn = REACTIONS[key];
  const liquid = document.getElementById('liquid');
  const precipitate = document.getElementById('precipitate');

  playBubbles('beaker');

  if (rxn) {
    currentReaction = rxn;
    exploredReactions.push(key);
    liquid.classList.add('liquid-reacting');
    setTimeout(() => liquid.classList.remove('liquid-reacting'), 800);
    liquid.style.height = '55%';
    liquid.style.background = `linear-gradient(180deg,${hexToRgba(rxn.color,0.6)},${hexToRgba(rxn.color,0.85)})`;
    document.getElementById('beakerContentsText').innerHTML = rxn.equation;
    addLog(`<strong>${rxn.equation}</strong><br>${rxn.explanation}`);

    const eqBox = document.getElementById('reactionEquationBox');
    const eqText = document.getElementById('reactionEquationText');
    if (eqBox) eqBox.classList.add('has-reaction');
    if (eqText) eqText.innerHTML = `<strong>${rxn.equation}</strong>`;

    if (rxn.specialEffect === 'blast') {
      setTimeout(() => playBlast('beaker'), 300);
      setTimeout(() => playGasRelease(), 500);
      setTimeout(() => playSmoke(), 600);
    }
    if (rxn.precipitateColor) setTimeout(() => showPrecipitate(rxn.precipitateColor, 'precipitate', 'beaker'), 800);
    if (rxn.type === 'neutralization') {
      const beaker = document.getElementById('beaker');
      beaker.classList.add('beaker-glow');
      setTimeout(() => beaker.classList.remove('beaker-glow'), 1200);
    }
    const panel = document.getElementById('explanationPanel');
    if (panel?.classList.contains('visible')) renderExplanation(rxn);
    UserSystem.updateProgress('inorganic', Math.min(100, exploredReactions.length * 17));
  } else {
    addLog('No visible reaction. Try other combinations!');
    liquid.style.height = '50%';
    liquid.style.background = 'linear-gradient(180deg,rgba(129,212,250,0.4),rgba(79,195,247,0.6))';
    if (precipitate) precipitate.style.display = 'none';
    const eqText = document.getElementById('reactionEquationText');
    const eqBox = document.getElementById('reactionEquationBox');
    if (eqText) eqText.textContent = 'No visible reaction for this combination.';
    if (eqBox) eqBox.classList.remove('has-reaction');
    currentReaction = null;
  }

  document.querySelectorAll('.chem.selected').forEach(el => el.classList.remove('selected'));
  beakerContents = [];
  const contents = document.getElementById('contents');
  if (contents) contents.innerHTML = '';
  const mixBtn = document.getElementById('mixBtn');
  if (mixBtn) mixBtn.disabled = true;
}

function resetInorganic() {
  beakerContents = [];
  const contents = document.getElementById('contents');
  if (contents) contents.innerHTML = '';
  const liquid = document.getElementById('liquid');
  const precipitate = document.getElementById('precipitate');
  if (liquid) { liquid.style.height='0%'; liquid.style.background='linear-gradient(180deg,rgba(129,212,250,0.4),rgba(79,195,247,0.6))'; }
  if (precipitate) { precipitate.style.display='none'; precipitate.style.height='0%'; precipitate.classList.remove('settling'); }
  const mixBtn = document.getElementById('mixBtn');
  if (mixBtn) mixBtn.disabled = true;
  currentReaction = null;
  const eqText = document.getElementById('reactionEquationText');
  const eqBox = document.getElementById('reactionEquationBox');
  if (eqText) eqText.textContent = 'Add two chemicals and mix to see the reaction equation.';
  if (eqBox) eqBox.classList.remove('has-reaction');
  const expContent = document.getElementById('explanationContent');
  if (expContent) expContent.innerHTML = '<div class="explanation-placeholder"><div class="placeholder-icon">🧫</div><p>Mix two chemicals to see a detailed explanation.</p></div>';
  document.getElementById('beakerContentsText').textContent = 'No chemicals yet.';
  document.querySelectorAll('.chem.selected').forEach(el => el.classList.remove('selected'));
}

function toggleExplanation() {
  const panel = document.getElementById('explanationPanel');
  const btn = document.getElementById('explanationToggleBtn');
  if (!panel || !btn) return;
  const visible = panel.classList.contains('visible');
  if (visible) { panel.classList.remove('visible'); btn.classList.remove('active'); }
  else { panel.classList.add('visible'); btn.classList.add('active'); if (currentReaction) renderExplanation(currentReaction); }
}

function renderExplanation(rxn) {
  const content = document.getElementById('explanationContent');
  if (!content || !rxn?.detailedExplanation) return;
  const d = rxn.detailedExplanation;
  let badgeClass='badge-neutralization', badgeText='Neutralization', badgeIcon='⚖️';
  if (rxn.type==='precipitation'){badgeClass='badge-precipitate';badgeText='Precipitation';badgeIcon='⬇️';}
  else if (rxn.type==='gas-evolution'){badgeClass='badge-gas';badgeText='Gas Evolution';badgeIcon='💨';}
  content.innerHTML = `<div class="explanation-detail">
    <div class="explain-section"><div class="explain-section-title">${badgeIcon} Reaction Type</div><div class="explain-section-body"><span class="reaction-type-badge ${badgeClass}">${badgeIcon} ${badgeText}</span><div style="margin-top:8px;font-weight:700;color:var(--text-primary);">${d.title}</div></div></div>
    <div class="explain-section"><div class="explain-section-title">⚗️ Balanced Equation</div><div class="explain-equation">${rxn.equation}</div></div>
    <div class="explain-section"><div class="explain-section-title">🔬 What Happened?</div><div class="explain-section-body">${d.whatHappened}</div></div>
    <div class="explain-section"><div class="explain-section-title">⚙️ Mechanism</div><div class="explain-section-body">${d.mechanism}</div></div>
    <div class="explain-section"><div class="explain-section-title">👁️ Observation</div><div class="explain-section-body">${d.observation}</div></div>
    <div class="explain-section"><div class="explain-section-title">🌍 Real-World Application</div><div class="explain-section-body">${d.realWorld}</div></div>
  </div>`;
}

function addLog(html) {
  const logList = document.getElementById('logList');
  if (!logList) return;
  const li = document.createElement('li');
  li.innerHTML = html;
  logList.prepend(li);
}

// ====================================================
// 5. ORGANIC LAB
// ====================================================
const UNKNOWNS = [
  { id: 'flour',   name: 'Flour Suspension',    type: 'Carbohydrate (Starch)',       color: '#f5f5f5', idealReagent: 'iodine' },
  { id: 'egg',     name: 'Egg White',            type: 'Protein',                     color: '#fffacd', idealReagent: 'biuret' },
  { id: 'oil',     name: 'Cooking Oil',          type: 'Unsaturated Lipid',           color: '#ffe082', idealReagent: 'bromine' },
  { id: 'glucose', name: 'Glucose Solution',     type: 'Aldehyde (Reducing Sugar)',   color: '#e0f7fa', idealReagent: 'fehling' },
  { id: 'phenol',  name: 'Phenol Solution',      type: 'Aromatic Alcohol',            color: '#ede7f6', idealReagent: 'ferric' }
];
const REAGENTS = [
  { id: 'iodine',  name: 'Iodine Solution',      testFor: 'Starch',       color: '#bcaaa4' },
  { id: 'biuret',  name: 'Biuret Reagent',       testFor: 'Proteins',     color: '#90caf9' },
  { id: 'bromine', name: 'Bromine Water',         testFor: 'Unsaturation', color: '#ffb74d' },
  { id: 'fehling', name: "Fehling's Solution",    testFor: 'Aldehydes',    color: '#1976d2' },
  { id: 'ferric',  name: 'Ferric Chloride (FeCl₃)', testFor: 'Phenols',  color: '#fff59d' }
];
const TESTS_DATA = {
  'flour|iodine': {
    requiresHeat: false, finalColor: '#1a237e', resultText: 'Blue-Black Complex Formed!', badge:'Positive', badgeClass:'badge-positive',
    detailedExplanation:{title:'Iodine Test for Starch',whatHappened:'Iodine (yellow-brown) reacts with starch (amylose) to form an intense <strong>blue-black complex</strong>.',mechanism:'The linear polyiodide ion (I₅⁻) slips inside the coiled amylose helix, absorbing visible light and reflecting deep blue-black.',observation:'The milky suspension turns a striking blue-black instantly. No heat required.',realWorld:'Tests for complex carbs in foods; forensic science to detect counterfeit banknotes.'}
  },
  'egg|biuret': {
    requiresHeat: false, finalColor: '#ab47bc', resultText: 'Violet/Purple Complex Formed!', badge:'Positive', badgeClass:'badge-positive',
    detailedExplanation:{title:'Biuret Test for Proteins',whatHappened:'Cu²⁺ ions in Biuret Reagent coordinate with peptide bonds forming a <strong>violet complex</strong>.',mechanism:'In alkaline solution, copper(II) ions chelate with nitrogen lone pairs of peptide bonds (-CO-NH-).',observation:'The pale blue reagent turns a distinct violet/purple.',realWorld:'Used in medical labs to quantify protein levels in blood and urine.'}
  },
  'oil|bromine': {
    requiresHeat: false, finalColor: '#ffe082', resultText: 'Bromine Water Decolorized!', badge:'Positive', badgeClass:'badge-positive',
    detailedExplanation:{title:'Bromine Water Test for Unsaturation',whatHappened:'Orange/brown bromine water is <strong>decolorized</strong> as bromine adds across C=C double bonds in the oil.',mechanism:'Electrophilic addition: the double bond attacks Br₂, giving a colorless dibromoalkane.',observation:'The reddish-brown color disappears rapidly.',realWorld:'Used in food industry to determine the degree of unsaturation (iodine value) of fats.'}
  },
  'glucose|fehling': {
    requiresHeat: true, finalColor: '#d84315', resultText: 'Brick-Red Precipitate Formed!', badge:'Positive', badgeClass:'badge-positive',
    detailedExplanation:{title:"Fehling's Test for Aldehydes",whatHappened:'Glucose reduces Cu²⁺ ions in Fehling\'s solution to brick-red <strong>Copper(I) Oxide (Cu₂O)</strong> when heated.',mechanism:'The aldehyde group (-CHO) is oxidized to -COOH. Cu²⁺ is reduced to Cu⁺, precipitating as Cu₂O.',observation:'Deep blue mixture progresses through green → yellow → thick <strong>brick-red precipitate</strong> on heating.',realWorld:'Historically used to test for glucose in urine as an indicator of diabetes.'}
  },
  'phenol|ferric': {
    requiresHeat: false, finalColor: '#512da8', resultText: 'Deep Violet Complex Formed!', badge:'Positive', badgeClass:'badge-positive',
    detailedExplanation:{title:'Ferric Chloride Test for Phenols',whatHappened:'Phenol reacts with FeCl₃ forming an <strong>intense violet complex</strong>.',mechanism:'Phenoxide ions act as ligands, attaching to Fe³⁺ to form [Fe(OC₆H₅)₆]³⁻.',observation:'Pale yellow FeCl₃ turns dark violet/purple instantly.',realWorld:'Detects phenolic compounds in pharmaceuticals (aspirin, paracetamol) and natural products (tannins).'}
  }
};

let currentUnknown = null, currentReagent = null;
let testStage = 'select_unknown', currentOrganicReaction = null;

function initOrganicLab() {
  const unknownList = document.getElementById('unknownList');
  const reagentList = document.getElementById('reagentList');
  if (!unknownList || unknownList.children.length > 0) return;

  UNKNOWNS.forEach(u => {
    const div = document.createElement('div');
    div.className = 'chem'; div.dataset.id = u.id;
    div.innerHTML = `<div class="swatch" style="background:${u.color}"></div><div class="chem-info"><div class="chem-formula">${u.type}</div><div class="chem-name">${u.name}</div></div>`;
    div.addEventListener('click', () => selectUnknown(u, div));
    unknownList.appendChild(div);
  });

  REAGENTS.forEach(r => {
    const div = document.createElement('div');
    div.className = 'reagent'; div.dataset.id = r.id;
    div.innerHTML = `<div class="icon-swatch" style="background:${r.color}">💧</div><div class="chem-info"><div class="chem-name">${r.name}</div><div class="chem-desc">Tests for: ${r.testFor}</div></div>`;
    div.addEventListener('click', () => selectReagent(r, div));
    reagentList.appendChild(div);
  });

  document.getElementById('heatBtn')?.addEventListener('click', heatOrganic);
  document.getElementById('observeBtn')?.addEventListener('click', observeOrganic);
  document.getElementById('resetOrganicBtn')?.addEventListener('click', resetOrganic);

  const orgToggleBtn = document.getElementById('explanationToggleBtnOrg');
  const orgPanel = document.getElementById('explanationPanelOrg');
  orgToggleBtn?.addEventListener('click', () => {
    const vis = orgPanel.classList.contains('visible');
    if (vis) { orgPanel.classList.remove('visible'); orgToggleBtn.classList.remove('active'); }
    else { orgPanel.classList.add('visible'); orgToggleBtn.classList.add('active'); if (currentOrganicReaction) renderOrgExplanation(currentOrganicReaction); }
  });
  document.getElementById('closeExplanationOrg')?.addEventListener('click', () => {
    orgPanel.classList.remove('visible'); orgToggleBtn.classList.remove('active');
  });
}

function selectUnknown(u, elem) {
  if (testStage !== 'select_unknown' && testStage !== 'select_reagent') return;
  document.querySelectorAll('#unknownList .chem').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('#reagentList .reagent').forEach(el => el.classList.remove('highlight','selected'));
  currentUnknown = u;
  elem.classList.add('selected');
  orgLog('Selected sample: ' + u.name);
  const ideal = document.querySelector(`#reagentList .reagent[data-id="${u.idealReagent}"]`);
  if (ideal) ideal.classList.add('highlight');
  const liq = document.getElementById('liquidOrg');
  if (liq) { liq.style.height='25%'; liq.style.background=`linear-gradient(180deg,${hexToRgba(u.color,0.4)},${hexToRgba(u.color,0.8)})`; }
  playPourSound();
  const tag = document.getElementById('contentsOrg');
  if (tag) tag.innerHTML = `<div class="chem-tag">${u.name}</div>`;
  const beakerText = document.getElementById('beakerContentsTextOrg');
  if (beakerText) beakerText.textContent = `Sample: ${u.name}`;
  const eqBox = document.getElementById('reactionEquationBoxOrg');
  const eqText = document.getElementById('reactionEquationTextOrg');
  if (eqBox) eqBox.classList.remove('has-reaction');
  if (eqText) eqText.textContent = 'Great! Now select a reagent to test this sample.';
  currentReagent = null;
  const hBtn = document.getElementById('heatBtn');
  const oBtn = document.getElementById('observeBtn');
  if (hBtn) hBtn.disabled = true;
  if (oBtn) oBtn.disabled = true;
  const burner = document.getElementById('burner');
  if (burner) burner.classList.remove('heating');
  testStage = 'select_reagent';
}

function selectReagent(r, elem) {
  if (testStage !== 'select_reagent' || !currentUnknown) { if (!currentUnknown) orgLog('Please select an unknown sample first.'); return; }
  document.querySelectorAll('#reagentList .reagent').forEach(el => el.classList.remove('selected'));
  currentReagent = r;
  elem.classList.add('selected');
  orgLog(`Added ${r.name} to the sample.`);
  const liq = document.getElementById('liquidOrg');
  if (liq) { liq.style.height='55%'; liq.style.background=`linear-gradient(180deg,${hexToRgba(r.color,0.5)},${hexToRgba(currentUnknown.color,0.8)})`; }
  playPourSound();
  const tag = document.getElementById('contentsOrg');
  if (tag) tag.innerHTML = `<div class="chem-tag">${currentUnknown.name}</div><div class="chem-tag">${r.name}</div>`;
  const bText = document.getElementById('beakerContentsTextOrg');
  if (bText) bText.textContent = `${currentUnknown.name} + ${r.name}`;
  const testData = TESTS_DATA[`${currentUnknown.id}|${r.id}`];
  const hBtn = document.getElementById('heatBtn');
  const oBtn = document.getElementById('observeBtn');
  const eqText = document.getElementById('reactionEquationTextOrg');
  if (testData?.requiresHeat) {
    testStage = 'heat';
    if (eqText) eqText.textContent = 'This reaction requires heat! Click the Heat button.';
    if (hBtn) { hBtn.disabled=false; hBtn.classList.add('highlight-heat'); }
    if (oBtn) oBtn.disabled = true;
  } else {
    testStage = 'observe';
    if (eqText) eqText.textContent = 'Ready to observe. Click Observe.';
    if (hBtn) { hBtn.disabled=true; hBtn.classList.remove('highlight-heat'); }
    if (oBtn) oBtn.disabled = false;
  }
}

function heatOrganic() {
  if (testStage !== 'heat') return;
  const hBtn = document.getElementById('heatBtn');
  const oBtn = document.getElementById('observeBtn');
  const burner = document.getElementById('burner');
  hBtn.classList.remove('highlight-heat'); hBtn.classList.add('active');
  hBtn.innerHTML = '<span class="btn-icon">🔥</span> Heating...';
  if (burner) { burner.style.display='flex'; burner.classList.add('heating'); }
  orgLog('Heating the beaker...');
  playBubbles('beakerOrg');
  setTimeout(() => {
    if (burner) { burner.classList.remove('heating'); burner.style.display='none'; }
    hBtn.classList.remove('active');
    hBtn.innerHTML = '<span class="btn-icon">🔥</span> Heat';
    hBtn.disabled = true;
    testStage = 'observe';
    const eqText = document.getElementById('reactionEquationTextOrg');
    if (eqText) eqText.textContent = 'Heating complete! Click Observe to see results.';
    if (oBtn) oBtn.disabled = false;
  }, 2500);
}

function observeOrganic() {
  if (testStage !== 'observe') return;
  const testKey = `${currentUnknown.id}|${currentReagent.id}`;
  const testData = TESTS_DATA[testKey];
  const liq = document.getElementById('liquidOrg');
  const eqBox = document.getElementById('reactionEquationBoxOrg');
  const eqText = document.getElementById('reactionEquationTextOrg');
  const oBtn = document.getElementById('observeBtn');

  if (testData) {
    if (liq) liq.style.background = `linear-gradient(180deg,${hexToRgba(testData.finalColor,0.6)},${testData.finalColor})`;
    if (eqBox) eqBox.classList.add('has-reaction');
    if (eqText) eqText.innerHTML = `<strong>${testData.resultText}</strong>`;
    orgLog(`<strong>Positive Test!</strong> ${testData.resultText}`);
    if (testData.detailedExplanation?.title === "Fehling's Test for Aldehydes") {
      showPrecipitate(testData.finalColor, 'precipitateOrg', 'beakerOrg');
    }
    renderOrgExplanation(testData);
    currentOrganicReaction = testData;
    const panel = document.getElementById('explanationPanelOrg');
    const togBtn = document.getElementById('explanationToggleBtnOrg');
    if (!panel.classList.contains('visible')) { panel.classList.add('visible'); togBtn.classList.add('active'); }
    UserSystem.updateProgress('organic', Math.min(100, (Object.keys(TESTS_DATA).indexOf(testKey)+1)*20));
  } else {
    if (eqBox) eqBox.classList.remove('has-reaction');
    if (eqText) eqText.innerHTML = `<strong>Negative Test.</strong> No observable change.`;
    orgLog(`Negative result. ${currentReagent.name} does not react with ${currentUnknown.name}.`);
    currentOrganicReaction = null;
    renderOrgExplanation(null, 'Negative Result', `The ${currentReagent.name} is not the appropriate test for ${currentUnknown.type}.`);
  }
  playBubbles('beakerOrg');
  testStage = 'done';
  if (oBtn) oBtn.disabled = true;
}

function resetOrganic() {
  currentUnknown = null; currentReagent = null; testStage = 'select_unknown';
  document.querySelectorAll('#unknownList .chem').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('#reagentList .reagent').forEach(el => el.classList.remove('highlight','selected'));
  const liq = document.getElementById('liquidOrg');
  if (liq) { liq.style.height='0%'; liq.style.background='radial-gradient(circle,rgba(129,212,250,0.4),rgba(79,195,247,0.6))'; }
  currentOrganicReaction = null;
  const precOrg = document.getElementById('precipitateOrg');
  if (precOrg) { precOrg.style.display='none'; precOrg.style.height='0%'; }
  const tag = document.getElementById('contentsOrg');
  if (tag) tag.innerHTML = '';
  const bText = document.getElementById('beakerContentsTextOrg');
  if (bText) bText.textContent = 'No sample yet.';
  const eqBox = document.getElementById('reactionEquationBoxOrg');
  const eqText = document.getElementById('reactionEquationTextOrg');
  if (eqBox) eqBox.classList.remove('has-reaction');
  if (eqText) eqText.textContent = 'Select a sample and add a reagent to begin.';
  const hBtn = document.getElementById('heatBtn');
  const oBtn = document.getElementById('observeBtn');
  if (hBtn) { hBtn.disabled=true; hBtn.classList.remove('highlight-heat','active'); }
  if (oBtn) oBtn.disabled = true;
  const burner = document.getElementById('burner');
  if (burner) burner.style.display = 'none';
  const expContent = document.getElementById('explanationContentOrg');
  if (expContent) expContent.innerHTML = '<div class="explanation-placeholder"><div class="placeholder-icon">🌱</div><p>Observe a reaction to see its detailed explanation here.</p></div>';
  orgLog('Lab reset. Ready for next test.');
}

function renderOrgExplanation(testData, title='Explanation', defaultMessage='') {
  const content = document.getElementById('explanationContentOrg');
  if (!content) return;
  if (!testData) {
    content.innerHTML = `<div class="explanation-detail"><div class="explain-section"><div class="explain-section-title">🧪 Result</div><div class="explain-section-body"><span class="reaction-type-badge badge-negative">❌ Negative Test</span><div style="margin-top:8px;">${defaultMessage}</div></div></div></div>`;
    return;
  }
  const d = testData.detailedExplanation;
  content.innerHTML = `<div class="explanation-detail">
    <div class="explain-section"><div class="explain-section-title">🧪 Test Type</div><div class="explain-section-body"><span class="reaction-type-badge ${testData.badgeClass}">✅ ${testData.badge}</span><div style="margin-top:8px;font-weight:700;color:var(--text-primary);">${d.title}</div></div></div>
    <div class="explain-section"><div class="explain-section-title">🔬 What Happened?</div><div class="explain-section-body">${d.whatHappened}</div></div>
    <div class="explain-section"><div class="explain-section-title">⚙️ Mechanism</div><div class="explain-section-body">${d.mechanism}</div></div>
    <div class="explain-section"><div class="explain-section-title">👁️ Observation</div><div class="explain-section-body">${d.observation}</div></div>
    <div class="explain-section"><div class="explain-section-title">🌍 Real-World Application</div><div class="explain-section-body">${d.realWorld}</div></div>
  </div>`;
}

function orgLog(html) {
  const list = document.getElementById('orgLogList');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = html;
  list.prepend(li);
}

// ====================================================
// 6. SHARED VISUAL EFFECTS
// ====================================================
function playBubbles(beakerId = 'beaker') {
  const beaker = document.getElementById(beakerId);
  if (!beaker) return;
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 4 + Math.random()*12, delay = Math.random()*800;
    b.style.cssText = `position:absolute;bottom:0;left:${15+Math.random()*65}%;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.8),rgba(255,255,255,0.2));opacity:0.7;z-index:3;animation:rise ${1.5+Math.random()*1.5}s ease-out ${delay}ms forwards;`;
    beaker.appendChild(b);
    setTimeout(() => b.remove(), 3200+delay);
  }
}

function showPrecipitate(color, precipId='precipitate', beakerId='beaker') {
  const prec = document.getElementById(precipId);
  if (!prec) return;
  prec.style.display = 'block';
  prec.style.background = `linear-gradient(180deg,${hexToRgba(color,0.6)},${color})`;
  prec.style.height = '0%';
  prec.classList.remove('settling');
  const beaker = document.getElementById(beakerId);
  if (beaker) spawnPrecipitateParticles(color, beaker);
  setTimeout(() => { prec.classList.add('settling'); prec.style.height = '12%'; }, 600);
}

function spawnPrecipitateParticles(color, beaker) {
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    const size = 3+Math.random()*5, startX = 15+Math.random()*70, delay = Math.random()*1500, dur = 1800+Math.random()*1200;
    p.style.cssText = `position:absolute;top:30%;left:${startX}%;width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:0.8;z-index:4;pointer-events:none;`;
    const sway = (Math.random()-0.5)*30;
    if (p.animate) p.animate([{transform:'translate(0,0) scale(1)',opacity:0},{transform:`translate(${sway}px,60%) scale(0.4)`,opacity:0.2}],{duration:dur,delay,easing:'ease-in',fill:'forwards'});
    beaker.appendChild(p);
    setTimeout(() => p.remove(), dur+delay+200);
  }
}

function playGasRelease() {
  const bw = document.querySelector('#chemInorganic .beaker-wrapper');
  if (!bw) return;
  for (let i = 0; i < 30; i++) {
    const gas = document.createElement('div');
    gas.className = 'gas-particle';
    const size = 5+Math.random()*10, startX = 20+Math.random()*60, delay = Math.random()*1500;
    gas.style.cssText = `bottom:0;left:${startX}%;width:${size}px;height:${size}px;background:radial-gradient(circle,rgba(200,220,255,0.5),rgba(180,200,240,0.1));animation-delay:${delay}ms;animation-duration:${1.5+Math.random()*1.5}s;`;
    bw.appendChild(gas);
    setTimeout(() => gas.remove(), 3500+delay);
  }
}

function playSmoke() {
  const bw = document.querySelector('#chemInorganic .beaker-wrapper');
  if (!bw) return;
  for (let i = 0; i < 8; i++) {
    const smoke = document.createElement('div');
    smoke.className = 'smoke-particle';
    const size = 15+Math.random()*25, delay = i*200+Math.random()*300;
    smoke.style.cssText = `bottom:100%;left:${30+Math.random()*40}%;width:${size}px;height:${size}px;animation-delay:${delay}ms;animation-duration:${2+Math.random()}s;`;
    bw.appendChild(smoke);
    setTimeout(() => smoke.remove(), 3500+delay);
  }
}

function playBlast(beakerId='beaker') {
  const beaker = document.getElementById(beakerId);
  const liquid = document.getElementById(beakerId==='beaker'?'liquid':'liquidOrg');
  if (!beaker || !liquid) return;
  beaker.classList.add('shake','beaker-glow');
  setTimeout(() => beaker.classList.remove('shake','beaker-glow'), 800);
  liquid.classList.add('splash');
  setTimeout(() => liquid.classList.remove('splash'), 800);
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'blast-particle';
    const angle = Math.random()*2*Math.PI, dist = 40+Math.random()*100, size = 3+Math.random()*8;
    const colors = ['#ffb300','#ff7043','#fff176','#ff5722','#ffab40'];
    p.style.cssText = `width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};position:absolute;left:50%;bottom:45%;border-radius:50%;opacity:0.9;z-index:10;transform:translate(-50%,0);transition:all 0.7s cubic-bezier(0.25,0.46,0.45,0.94);`;
    beaker.appendChild(p);
    setTimeout(() => { p.style.transform=`translate(${Math.cos(angle)*dist}px,${-Math.sin(angle)*dist}px)`; p.style.opacity='0'; }, 30);
    setTimeout(() => p.remove(), 800);
  }
  playExplosionSound();
}

function playPourSound() {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type='sine'; osc.frequency.setValueAtTime(600,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.2);
    gain.gain.setValueAtTime(0.08,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.2);
  } catch {}
}

function playExplosionSound() {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type='triangle'; osc.frequency.setValueAtTime(400,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(20,ctx.currentTime+0.4);
    gain.gain.setValueAtTime(0.5,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.4);
  } catch {}
}

// ====================================================
// 7. QUIZ
// ====================================================
function initQuiz() {
  const startBtn = document.getElementById('startQuizBtn');
  if (startBtn) startBtn.addEventListener('click', startQuiz);
}

function startQuiz() {
  const quizContainer = document.getElementById('quizContainer');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');

  if (exploredReactions.length === 0) {
    quizQuestion.textContent = 'Mix some chemicals in the Inorganic Lab first to unlock questions!';
    quizContainer.style.display = 'block';
    return;
  }
  const randKey = exploredReactions[Math.floor(Math.random()*exploredReactions.length)];
  const reaction = REACTIONS[randKey];
  quizContainer.style.display = 'block';
  quizQuestion.textContent = `Which type of observation occurs in: ${reaction.equation}?`;
  const options = ['Gas released','Precipitate formed','Neutralization','No visible reaction'];
  quizOptions.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      const correct = (reaction.specialEffect==='blast' && opt==='Gas released') ||
        (reaction.precipitateColor && opt==='Precipitate formed') ||
        (!reaction.precipitateColor && !reaction.specialEffect && opt==='Neutralization');
      quizFeedback.textContent = correct ? '✅ Correct!' : '❌ Try again!';
      quizFeedback.style.color = correct ? '#10b981' : '#ef4444';
      if (correct) UserSystem.updateProgress('quiz', 100);
    });
    quizOptions.appendChild(btn);
  });
}

// ====================================================
// 8. CONICS LAB (Cone Slicing)
// ====================================================
let conicsInitialized = false;
let conicsAnimationId = null;

function initConicsLab() {
  if (conicsInitialized) return;
  conicsInitialized = true;

  const canvas = document.getElementById('conicsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const angleSlider = document.getElementById('planeAngle');
  const heightSlider = document.getElementById('planeHeight');
  const angleVal = document.getElementById('angleVal');
  const heightVal = document.getElementById('heightVal');
  const curveLabel = document.getElementById('curveLabel');

  // Cone parameters
  const coneHeight = 180;
  const coneBaseRadius = 120;
  const coneSlope = coneBaseRadius / coneHeight;

  // Animation state (smooth interpolated values)
  let currentAngle = 0;
  let currentHeight = 0;
  let targetAngle = 0;
  let targetHeight = 0;
  let lastCurveName = '';
  let curveStabilityCounter = 0;

  function toRad(deg) { return deg * Math.PI / 180; }

  // Get curve type with hysteresis for stability
  function getCurveType(angleDeg, prevType) {
    const absAngle = Math.abs(angleDeg);
    const planeSlope = Math.tan(toRad(absAngle));
    const thresholdLow = coneSlope * 0.85;
    const thresholdHigh = coneSlope * 1.15;

    // Special case: circle (horizontal plane with small tolerance)
    if (absAngle < 5) {
      return { name: 'Circle', color: '#10b981', desc: 'Plane parallel to base' };
    }

    // With hysteresis - prefer keeping current type near boundaries
    if (prevType === 'Parabola') {
      if (planeSlope < thresholdLow * 0.9) return { name: 'Ellipse', color: '#3b82f6', desc: 'Plane angle < cone slope' };
      if (planeSlope > thresholdHigh * 1.1) return { name: 'Hyperbola', color: '#ef4444', desc: 'Plane angle > cone slope' };
      return { name: 'Parabola', color: '#f59e0b', desc: 'Plane angle = cone slope' };
    }
    if (prevType === 'Ellipse' && planeSlope < thresholdHigh * 1.05) {
      if (planeSlope < thresholdLow) return { name: 'Ellipse', color: '#3b82f6', desc: 'Plane angle < cone slope' };
    }
    if (prevType === 'Hyperbola' && planeSlope > thresholdLow * 0.95) {
      if (planeSlope > thresholdHigh) return { name: 'Hyperbola', color: '#ef4444', desc: 'Plane angle > cone slope' };
    }

    // Standard classification
    if (planeSlope < thresholdLow) {
      return { name: 'Ellipse', color: '#3b82f6', desc: 'Plane angle < cone slope' };
    } else if (planeSlope < thresholdHigh) {
      return { name: 'Parabola', color: '#f59e0b', desc: 'Plane angle = cone slope' };
    } else {
      return { name: 'Hyperbola', color: '#ef4444', desc: 'Plane angle > cone slope' };
    }
  }

  // Smooth interpolation
  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function updateTargets() {
    targetAngle = parseFloat(angleSlider?.value || 0);
    targetHeight = parseFloat(heightSlider?.value || 0);
  }

  function drawCone(cx, cy, pulse = 0) {
    const apexY = cy - coneHeight;

    // Draw filled cone body with gradient
    const gradient = ctx.createLinearGradient(cx - coneBaseRadius, cy, cx + coneBaseRadius, cy);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(cx + coneBaseRadius, cy);
    ctx.ellipse(cx, cy, coneBaseRadius, coneBaseRadius * 0.25, 0, 0, Math.PI);
    ctx.lineTo(cx - coneBaseRadius, cy);
    ctx.closePath();
    ctx.fill();

    // Draw cone outline with glow
    ctx.save();
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
    ctx.shadowBlur = 8 + pulse * 4;

    // Right side (visible)
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(cx + coneBaseRadius, cy);
    ctx.stroke();

    // Base ellipse front
    ctx.beginPath();
    ctx.ellipse(cx, cy, coneBaseRadius, coneBaseRadius * 0.25, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Left side (hidden/dashed)
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(cx - coneBaseRadius, cy);
    ctx.stroke();

    // Base ellipse back
    ctx.beginPath();
    ctx.ellipse(cx, cy, coneBaseRadius, coneBaseRadius * 0.25, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Apex marker with pulse
    ctx.save();
    ctx.fillStyle = '#c4b5fd';
    ctx.shadowColor = 'rgba(196, 181, 253, 0.8)';
    ctx.shadowBlur = 12 + pulse * 6;
    ctx.beginPath();
    ctx.arc(cx, apexY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlane(cx, cy, angleDeg, height, curveType, pulse = 0) {
    const angleRad = toRad(angleDeg);
    const planeLength = 220;
    const heightOffset = height * 1.2;
    const planeY = cy - heightOffset;

    // Calculate plane endpoints
    const dx = planeLength * Math.cos(angleRad) / 2;
    const dy = planeLength * Math.sin(angleRad) / 2;

    // Draw plane with enhanced glow
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
    ctx.shadowBlur = 15 + pulse * 8;

    // Main plane line
    ctx.beginPath();
    ctx.moveTo(cx - dx, planeY - dy);
    ctx.lineTo(cx + dx, planeY + dy);
    ctx.stroke();

    // Plane endpoints (small circles)
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(cx - dx, planeY - dy, 4, 0, Math.PI * 2);
    ctx.arc(cx + dx, planeY + dy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw intersection curve
    drawIntersectionCurve(cx, cy, planeY, angleRad, curveType, pulse);

    return curveType;
  }

  function drawIntersectionCurve(cx, cy, planeY, angleRad, curve, pulse) {
    const curveOpacity = 0.9 + pulse * 0.1;

    ctx.save();
    ctx.strokeStyle = curve.color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = curve.color;
    ctx.shadowBlur = 12 + pulse * 6;
    ctx.globalAlpha = curveOpacity;

    ctx.beginPath();

    if (curve.name === 'Circle') {
      // Circle: proper intersection calculation
      const distFromApex = (cy - coneHeight) - planeY;
      const normalizedDist = Math.max(0, Math.min(1, distFromApex / coneHeight));
      const radius = coneBaseRadius * (1 - normalizedDist);
      const ry = radius * 0.3; // perspective flattening

      if (radius > 3) {
        ctx.ellipse(cx, planeY, radius, ry, 0, 0, Math.PI * 2);
      }

    } else if (curve.name === 'Ellipse') {
      // Ellipse: offset and rotated based on plane angle
      const distFromApex = (cy - coneHeight) - planeY;
      const normalizedDist = Math.max(0.1, Math.min(1, distFromApex / coneHeight));
      const rx = coneBaseRadius * (1 - normalizedDist) * 1.1;
      const ry = rx * 0.35;
      const rotation = angleRad * 0.3;

      ctx.ellipse(cx, planeY, rx, ry, rotation, 0, Math.PI * 2);

    } else if (curve.name === 'Parabola') {
      // Parabola: U-shaped curve
      const openDir = angleRad > 0 ? 1 : -1;
      const focalLength = 25;
      const vertexY = planeY + openDir * 20;

      for (let t = -60; t <= 60; t += 1.5) {
        const x = cx + t;
        const y = vertexY + openDir * (t * t) / (4 * focalLength);
        if (t === -60) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

    } else if (curve.name === 'Hyperbola') {
      // Hyperbola: two branches opening up/down
      const openDir = angleRad > 0 ? 1 : -1;
      const a = 30; // semi-major axis
      const b = 25; // semi-minor axis
      const centerY = planeY;

      // Draw two branches
      for (let branch = -1; branch <= 1; branch += 2) {
        let first = true;
        for (let t = 1.2; t <= 4; t += 0.08) {
          const xOffset = branch * a * Math.cosh(t);
          const yOffset = openDir * b * Math.sinh(t) * 0.5;

          // Only draw if within reasonable bounds
          if (Math.abs(xOffset) < 150) {
            const x = cx + xOffset;
            const y = centerY + yOffset;
            if (first) { ctx.moveTo(x, y); first = false; }
            else ctx.lineTo(x, y);
          }
        }
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  function animate() {
    // Smooth interpolation towards targets
    const lerpFactor = 0.12; // Lower = smoother but slower
    currentAngle = lerp(currentAngle, targetAngle, lerpFactor);
    currentHeight = lerp(currentHeight, targetHeight, lerpFactor);

    // Check if we're close enough to stop animation
    const angleDiff = Math.abs(currentAngle - targetAngle);
    const heightDiff = Math.abs(currentHeight - targetHeight);

    // Update slider display values during animation
    if (angleVal) angleVal.textContent = Math.round(currentAngle) + '°';
    if (heightVal) heightVal.textContent = Math.round(currentHeight);

    // Draw frame
    draw();

    // Continue animation if still moving
    if (angleDiff > 0.1 || heightDiff > 0.1) {
      conicsAnimationId = requestAnimationFrame(animate);
    } else {
      // Snap to final values
      currentAngle = targetAngle;
      currentHeight = targetHeight;
      draw();
      conicsAnimationId = null;
    }
  }

  function triggerAnimation() {
    updateTargets();
    if (!conicsAnimationId) {
      conicsAnimationId = requestAnimationFrame(animate);
    }
  }

  // Curve result canvas functions
  const resultCanvas = document.getElementById('curveResultCanvas');
  const resultCtx = resultCanvas?.getContext('2d');

  function drawCurveResult(curveType, progress = 1) {
    if (!resultCtx || !resultCanvas) return;

    const w = resultCanvas.width, h = resultCanvas.height;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.35 * progress;

    // Clear with subtle grid
    resultCtx.fillStyle = 'rgba(10, 14, 26, 1)';
    resultCtx.fillRect(0, 0, w, h);

    // Draw subtle grid
    resultCtx.strokeStyle = 'rgba(100, 100, 100, 0.08)';
    resultCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      resultCtx.beginPath();
      resultCtx.moveTo(x, 0); resultCtx.lineTo(x, h);
      resultCtx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      resultCtx.beginPath();
      resultCtx.moveTo(0, y); resultCtx.lineTo(w, y);
      resultCtx.stroke();
    }

    // Create gradient based on curve color
    function createGradient(color, x, y, r) {
      const g = resultCtx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
      g.addColorStop(0, color + 'cc');
      g.addColorStop(0.5, color + '88');
      g.addColorStop(1, color + '22');
      return g;
    }

    // Color mapping
    const colorMap = {
      'Circle': '#10b981',
      'Ellipse': '#3b82f6',
      'Parabola': '#f59e0b',
      'Hyperbola': '#ef4444'
    };
    const baseColor = colorMap[curveType.name] || curveType.color;

    // Glow effect setup
    resultCtx.save();
    resultCtx.shadowColor = baseColor;
    resultCtx.shadowBlur = 25;
    resultCtx.shadowOffsetX = 0;
    resultCtx.shadowOffsetY = 0;

    switch (curveType.name) {
      case 'Circle':
        // Filled circle with gradient depth
        const circleGrad = createGradient(baseColor, cx, cy, scale);
        resultCtx.fillStyle = circleGrad;
        resultCtx.beginPath();
        resultCtx.arc(cx, cy, scale, 0, Math.PI * 2);
        resultCtx.fill();

        // Inner highlight for 3D effect
        resultCtx.fillStyle = baseColor + '44';
        resultCtx.beginPath();
        resultCtx.arc(cx - scale*0.25, cy - scale*0.25, scale * 0.4, 0, Math.PI * 2);
        resultCtx.fill();

        // Rim glow
        resultCtx.strokeStyle = baseColor;
        resultCtx.lineWidth = 3;
        resultCtx.beginPath();
        resultCtx.arc(cx, cy, scale, 0, Math.PI * 2);
        resultCtx.stroke();
        break;

      case 'Ellipse':
        // Filled ellipse
        resultCtx.translate(cx, cy);
        resultCtx.scale(1, 0.6);

        const ellipseGrad = createGradient(baseColor, 0, 0, scale);
        resultCtx.fillStyle = ellipseGrad;
        resultCtx.beginPath();
        resultCtx.arc(0, 0, scale, 0, Math.PI * 2);
        resultCtx.fill();

        // Rim
        resultCtx.strokeStyle = baseColor;
        resultCtx.lineWidth = 3;
        resultCtx.beginPath();
        resultCtx.arc(0, 0, scale, 0, Math.PI * 2);
        resultCtx.stroke();
        resultCtx.setTransform(1, 0, 0, 1, 0, 0);
        break;

      case 'Parabola':
        // Filled parabola shape (U with base)
        const parabolaPath = new Path2D();
        const steps = 40;
        const width = scale * 1.8;
        const depth = scale * 0.9;

        // Build the filled U shape
        parabolaPath.moveTo(cx - width/2, cy + depth);
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * width - width/2;
          const y = (t * t) / (width * 0.5);
          parabolaPath.lineTo(cx + t, cy + y);
        }
        parabolaPath.lineTo(cx + width/2, cy + depth);
        parabolaPath.closePath();

        // Fill with vertical gradient for depth
        const paraGrad = resultCtx.createLinearGradient(cx, cy - depth, cx, cy + depth);
        paraGrad.addColorStop(0, baseColor + 'aa');
        paraGrad.addColorStop(0.5, baseColor + '66');
        paraGrad.addColorStop(1, baseColor + '22');
        resultCtx.fillStyle = paraGrad;
        resultCtx.fill(parabolaPath);

        // Rim
        resultCtx.strokeStyle = baseColor;
        resultCtx.lineWidth = 3;
        resultCtx.stroke(parabolaPath);

        // Inner highlight line
        resultCtx.strokeStyle = baseColor + '66';
        resultCtx.lineWidth = 8;
        resultCtx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * width - width/2;
          const y = (t * t) / (width * 0.5) + 5;
          if (i === 0) resultCtx.moveTo(cx + t, cy + y);
          else resultCtx.lineTo(cx + t, cy + y);
        }
        resultCtx.stroke();
        break;

      case 'Hyperbola':
        // Two filled hyperbola branches
        const a = scale * 0.35, b = scale * 0.55;

        for (let side of [-1, 1]) {
          const branchPath = new Path2D();
          let first = true;

          // Top curve
          for (let t = 0.5; t <= 3.5; t += 0.08) {
            const x = side * a * Math.cosh(t);
            const y = b * Math.sinh(t) - scale * 0.3;
            if (Math.abs(x) < scale && Math.abs(y) < scale) {
              if (first) { branchPath.moveTo(cx + x, cy + y); first = false; }
              else branchPath.lineTo(cx + x, cy + y);
            }
          }
          // Bottom curve (reverse)
          for (let t = 3.5; t >= 0.5; t -= 0.08) {
            const x = side * a * Math.cosh(t);
            const y = -b * Math.sinh(t) - scale * 0.3;
            if (Math.abs(x) < scale && Math.abs(y) < scale) {
              branchPath.lineTo(cx + x, cy + y);
            }
          }
          branchPath.closePath();

          // Fill with gradient
          const hx = cx + side * scale * 0.5;
          const hy = cy - scale * 0.3;
          const hyperGrad = createGradient(baseColor, hx, hy, scale * 0.6);
          resultCtx.fillStyle = hyperGrad;
          resultCtx.fill(branchPath);

          // Rim
          resultCtx.strokeStyle = baseColor;
          resultCtx.lineWidth = 3;

          // Redraw rim without closing line
          resultCtx.beginPath();
          first = true;
          for (let t = 0.5; t <= 3.5; t += 0.08) {
            const x = side * a * Math.cosh(t);
            const y = b * Math.sinh(t) - scale * 0.3;
            if (Math.abs(x) < scale && Math.abs(y) < scale) {
              if (first) { resultCtx.moveTo(cx + x, cy + y); first = false; }
              else resultCtx.lineTo(cx + x, cy + y);
            }
          }
          resultCtx.stroke();
        }
        break;
    }

    resultCtx.restore();

    // Label with glow
    resultCtx.fillStyle = '#ffffff';
    resultCtx.font = 'bold 18px "Space Grotesk"';
    resultCtx.textAlign = 'center';
    resultCtx.shadowColor = baseColor;
    resultCtx.shadowBlur = 15;
    resultCtx.fillText(curveType.name, cx, h - 25);
    resultCtx.shadowBlur = 0;
  }

  function updateCurveTypeItems(curveName) {
    document.querySelectorAll('.curve-type-item').forEach(item => {
      const isActive = item.dataset.type === curveName;
      item.classList.toggle('active', isActive);
    });
  }

  let currentCurveProgress = 0;
  let targetCurveName = '';

  function animateCurveTransition() {
    const curve = getCurveType(currentAngle, lastCurveName);

    if (curve.name !== targetCurveName) {
      targetCurveName = curve.name;
      currentCurveProgress = 0;
    }

    if (currentCurveProgress < 1) {
      currentCurveProgress += 0.05;
      if (currentCurveProgress > 1) currentCurveProgress = 1;
    }

    drawCurveResult(curve, currentCurveProgress);
    updateCurveTypeItems(curve.name);
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2 + 50;

    // Clear with slight trail effect
    ctx.fillStyle = 'rgba(10, 14, 26, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Determine curve type with stability
    const newCurve = getCurveType(currentAngle, lastCurveName);

    // Require 3 consistent frames before changing label (stability)
    if (newCurve.name !== lastCurveName) {
      curveStabilityCounter++;
      if (curveStabilityCounter < 3) {
        // Keep old name but use new visual
      } else {
        lastCurveName = newCurve.name;
        curveStabilityCounter = 0;
        // Update label only when stable
        if (curveLabel) {
          curveLabel.innerHTML = `You created: <span style="color:${newCurve.color}">${newCurve.name}</span><small style="display:block;margin-top:4px;font-size:0.75rem;color:var(--text-muted)">${newCurve.desc}</small>`;
        }
      }
    } else {
      curveStabilityCounter = 0;
    }

    // Subtle pulse based on curve type change
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;

    // Draw elements back-to-front
    drawCone(cx, cy, pulse * 0.5);
    drawPlane(cx, cy, currentAngle, currentHeight, newCurve, pulse);

    // Draw curve result visualization
    animateCurveTransition();
  }

  // Event listeners - trigger animation on input
  angleSlider?.addEventListener('input', triggerAnimation);
  heightSlider?.addEventListener('input', triggerAnimation);

  // Initialize
  updateTargets();
  currentAngle = targetAngle;
  currentHeight = targetHeight;

  // Set initial label
  const initialCurve = getCurveType(currentAngle, '');
  lastCurveName = initialCurve.name;
  targetCurveName = initialCurve.name;
  if (curveLabel) {
    curveLabel.innerHTML = `You created: <span style="color:${initialCurve.color}">${initialCurve.name}</span><small style="display:block;margin-top:4px;font-size:0.75rem;color:var(--text-muted)">${initialCurve.desc}</small>`;
  }

  // Start animation loop
  draw();

  // AI Tutor functionality - Conic Module
  initAITutorForModule('conic', () => ({
    curve: getCurveType(currentAngle, lastCurveName).name,
    angle: Math.round(currentAngle)
  }));
}

// ====================================================
// 8c. CONICS SUB-TABS
// ====================================================
function initConicsSubTabs() {
  const tabs = document.querySelectorAll('[data-conicstab]');
  const panels = {
    coneSlice: document.getElementById('coneSlicePanel'),
    focusDirectrix: document.getElementById('focusDirectrixPanel')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const target = tab.dataset.conicstab;
      Object.entries(panels).forEach(([key, el]) => {
        if (el) el.style.display = key === target ? 'block' : 'none';
        if (el) el.classList.toggle('active', key === target);
      });
      
      if (target === 'focusDirectrix') {
        setTimeout(() => initFocusDirectrixLab(), 50);
      }
    });
  });
}

// ====================================================
// GLOBAL AI TUTOR SYSTEM
// ====================================================
// Store current module state getter functions
const aiModuleGetters = {};
let currentActiveModule = 'general';

function initAITutorForModule(moduleName, stateGetter) {
  aiModuleGetters[moduleName] = stateGetter;
  currentActiveModule = moduleName;
}

function setActiveModule(moduleName) {
  if (aiModuleGetters[moduleName]) {
    currentActiveModule = moduleName;
  }
}

function getCurrentModuleState() {
  const getter = aiModuleGetters[currentActiveModule];
  return getter ? getter() : {};
}

// Global AI Tutor initialization
document.addEventListener('DOMContentLoaded', () => {
  // Delay to ensure all modules are loaded
  setTimeout(() => {
    initGlobalAITutor();
    initAITutorForPanel('Fd', 'conic-fd', () => ({
      curve: 'Parabola',
      focusY: parseFloat(document.getElementById('focusY')?.value || 80),
      directrixY: parseFloat(document.getElementById('directrixY')?.value || -80)
    }));
    
    // Chemistry AI Tutor - cross-domain questions allowed
    initAITutorForPanel('Chem', 'chemistry', () => ({
      beakerContents: document.getElementById('beakerContentsText')?.textContent || 'No chemicals',
      currentSection: 'chemistry'
    }));
    
    // Coding AI Tutor - cross-domain questions allowed
    initAITutorForPanel('Coding', 'coding', () => ({
      gridSize: document.getElementById('gridSize')?.value || '5',
      currentSection: 'coding'
    }));
  }, 100);
});

function initGlobalAITutor() {
  const explainBtn = document.getElementById('explainBtn');
  const aiResponse = document.getElementById('aiResponse');
  const aiQuestion = document.getElementById('aiQuestion');

  if (!explainBtn || !aiResponse) {
    console.log('AI Tutor: Cone Slice elements not found');
    return;
  }

  // Prevent duplicate listeners
  if (explainBtn.dataset.aiInitialized) return;
  explainBtn.dataset.aiInitialized = 'true';

  // Ensure initial message is set
  if (!aiResponse.textContent || aiResponse.textContent.trim() === '') {
    aiResponse.textContent = 'Click "Explain This" to learn about the current simulation!';
  }

  explainBtn.addEventListener('click', async () => {
    await handleAIRequest('conic', explainBtn, aiResponse, aiQuestion);
  });
}

// Initialize AI tutor for a specific panel
function initAITutorForPanel(suffix, moduleName, stateGetter) {
  const explainBtn = document.getElementById(`explainBtn${suffix}`);
  const aiResponse = document.getElementById(`aiResponse${suffix}`);
  const aiQuestion = document.getElementById(`aiQuestion${suffix}`);

  if (!explainBtn || !aiResponse) {
    console.log(`AI Tutor: Panel ${suffix} elements not found`);
    return;
  }

  // Prevent duplicate listeners
  if (explainBtn.dataset.aiInitialized) return;
  explainBtn.dataset.aiInitialized = 'true';

  // Ensure initial message
  if (!aiResponse.textContent || aiResponse.textContent.trim() === '') {
    aiResponse.textContent = 'Click "Explain This" to learn about the current simulation!';
  }

  explainBtn.addEventListener('click', async () => {
    const state = stateGetter();
    await handleAIRequestWithState(moduleName, state, explainBtn, aiResponse, aiQuestion);
  });
}

// Handle AI request with specific module
async function handleAIRequest(moduleName, explainBtn, aiResponse, aiQuestion) {
  const state = getCurrentModuleState();
  await handleAIRequestWithState(moduleName, state, explainBtn, aiResponse, aiQuestion);
}

// Rate limiter for AI requests
let lastAIRequestTime = 0;
const AI_REQUEST_COOLDOWN = 3000; // 3 seconds between requests

// Handle AI request with provided state - clean and simple
async function handleAIRequestWithState(moduleName, state, explainBtn, aiResponse, aiQuestion) {
  if (!aiResponse || !explainBtn) return;

  // Rate limiting check
  const now = Date.now();
  const timeSinceLastRequest = now - lastAIRequestTime;
  if (timeSinceLastRequest < AI_REQUEST_COOLDOWN) {
    const waitSeconds = Math.ceil((AI_REQUEST_COOLDOWN - timeSinceLastRequest) / 1000);
    aiResponse.textContent = `⏳ Please wait ${waitSeconds} seconds before asking again.`;
    return;
  }
  lastAIRequestTime = now;

  // Disable button and show loading
  explainBtn.disabled = true;
  const originalText = explainBtn.textContent;
  explainBtn.textContent = '⏳ Loading...';
  aiResponse.textContent = 'Thinking... 🤔';
  aiResponse.classList.add('loading');

  const question = aiQuestion?.value?.trim() || null;

  console.log('AI Request:', { module: moduleName, state, question });

  try {
    const response = await fetch('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: moduleName,
        state: state,
        question: question
      })
    });

    const data = await response.json();

    // Display API response directly
    aiResponse.textContent = data.reply || "I'm having trouble connecting right now—please try again in a moment.";

    // Clear input after successful request
    if (aiQuestion && data.reply && !data.reply.includes('trouble connecting')) {
      aiQuestion.value = '';
    }

  } catch (error) {
    console.error('AI Error:', error);
    aiResponse.textContent = "I'm having trouble connecting right now—please try again in a moment.";
  } finally {
    aiResponse.classList.remove('loading');
    explainBtn.disabled = false;
    explainBtn.textContent = originalText;
  }
}

// ====================================================
// 8d. FOCUS-DIRECTRIX PARABOLA LAB
// ====================================================
let fdInitialized = false;
let fdAnimationId = null;

function initFocusDirectrixLab() {
  if (fdInitialized) return;
  fdInitialized = true;

  const canvas = document.getElementById('fdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const focusYSlider = document.getElementById('focusY');
  const directrixYSlider = document.getElementById('directrixY');
  const focusYVal = document.getElementById('focusYVal');
  const directrixYVal = document.getElementById('directrixYVal');
  const toggleBtn = document.getElementById('toggleAnimation');

  // Animation state
  let currentFocusY = 80;
  let currentDirectrixY = -80;
  let targetFocusY = 80;
  let targetDirectrixY = -80;
  let isAnimating = true;
  let tracerT = 0;
  let tracerSpeed = 0.015;

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function toCanvasY(canvasHeight, y, centerY, scale) {
    return centerY - y * scale;
  }

  function drawGrid(cx, cy, scale) {
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = -200; x <= 200; x += 50) {
      ctx.beginPath();
      ctx.moveTo(cx + x, cy - 200);
      ctx.lineTo(cx + x, cy + 200);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = -200; y <= 200; y += 50) {
      ctx.beginPath();
      ctx.moveTo(cx - 200, cy - y);
      ctx.lineTo(cx + 200, cy - y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 220);
    ctx.lineTo(cx, cy + 220);
    ctx.moveTo(cx - 220, cy);
    ctx.lineTo(cx + 220, cy);
    ctx.stroke();
  }

  function drawDirectrix(cx, cy, dY, scale) {
    const y = toCanvasY(500, dY, cy, scale);

    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(cx - 200, y);
    ctx.lineTo(cx + 200, y);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 13px Outfit';
    ctx.fillText('Directrix', cx + 160, y - 8);

    ctx.restore();
  }

  function drawFocus(cx, cy, fY, scale) {
    const y = toCanvasY(500, fY, cy, scale);

    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(cx, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 13px Outfit';
    ctx.fillText('F', cx + 12, y - 8);

    ctx.restore();
  }

  function drawParabola(cx, cy, fY, dY, scale) {
    // Parabola: points equidistant from focus and directrix
    // For vertex form: y = (1/(4p)) * x^2 where p = (fY - dY)/2
    const p = (fY - dY) / 2; // focal length (distance from vertex to focus)
    const vertexY = (fY + dY) / 2;

    if (Math.abs(p) < 5) return; // Too flat to draw

    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    let first = true;
    for (let x = -200; x <= 200; x += 2) {
      // y = (1/(4p)) * x^2 + vertexY
      const y = (x * x) / (4 * p) + vertexY;
      const canvasY = toCanvasY(500, y, cy, scale);

      // Only draw if within reasonable bounds
      if (canvasY > 20 && canvasY < 480) {
        if (first) {
          ctx.moveTo(cx + x, canvasY);
          first = false;
        } else {
          ctx.lineTo(cx + x, canvasY);
        }
      }
    }
    ctx.stroke();

    // Draw vertex point
    const vertexCanvasY = toCanvasY(500, vertexY, cy, scale);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, vertexCanvasY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawTracer(cx, cy, fY, dY, scale, t) {
    // t goes from -1 to 1, map to x coordinate
    const x = t * 180;
    const p = (fY - dY) / 2;
    const vertexY = (fY + dY) / 2;
    const y = (x * x) / (4 * p) + vertexY;

    const pointX = cx + x;
    const pointY = toCanvasY(500, y, cy, scale);
    const focusCanvasY = toCanvasY(500, fY, cy, scale);
    const directrixCanvasY = toCanvasY(500, dY, cy, scale);

    // Draw distance lines
    ctx.save();

    // Line to focus (PF)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(cx, focusCanvasY);
    ctx.stroke();

    // Line to directrix (PD)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(pointX, directrixCanvasY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw tracer point
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Label P
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px Outfit';
    ctx.fillText('P', pointX + 12, pointY - 8);

    // Show distances
    const distPF = Math.abs(y - fY);
    const distPD = Math.abs(y - dY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px Outfit';
    ctx.fillText(`PF = ${distPF.toFixed(1)}`, pointX + 15, pointY + 5);
    ctx.fillText(`PD = ${distPD.toFixed(1)}`, pointX + 15, pointY + 18);

    ctx.restore();
  }

  function updateTargets() {
    targetFocusY = parseFloat(focusYSlider?.value || 80);
    targetDirectrixY = parseFloat(directrixYSlider?.value || -80);
  }

  function animate() {
    // Smooth interpolation
    currentFocusY = lerp(currentFocusY, targetFocusY, 0.12);
    currentDirectrixY = lerp(currentDirectrixY, targetDirectrixY, 0.12);

    // Update display values
    if (focusYVal) focusYVal.textContent = Math.round(currentFocusY);
    if (directrixYVal) directrixYVal.textContent = Math.round(currentDirectrixY);

    // Clear canvas with trail effect
    ctx.fillStyle = 'rgba(10, 14, 26, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const scale = 1; // 1 unit = 1 pixel

    // Draw elements
    drawGrid(cx, cy, scale);
    drawParabola(cx, cy, currentFocusY, currentDirectrixY, scale);
    drawDirectrix(cx, cy, currentDirectrixY, scale);
    drawFocus(cx, cy, currentFocusY, scale);

    // Animate tracer
    if (isAnimating) {
      tracerT += tracerSpeed;
      if (tracerT > 1) tracerT = -1;
    }
    drawTracer(cx, cy, currentFocusY, currentDirectrixY, scale, tracerT);

    // Continue animation
    const focusDiff = Math.abs(currentFocusY - targetFocusY);
    const directrixDiff = Math.abs(currentDirectrixY - targetDirectrixY);

    if (focusDiff > 0.1 || directrixDiff > 0.1 || isAnimating) {
      fdAnimationId = requestAnimationFrame(animate);
    } else {
      fdAnimationId = null;
    }
  }

  function triggerAnimation() {
    updateTargets();
    if (!fdAnimationId) {
      fdAnimationId = requestAnimationFrame(animate);
    }
  }

  // Event listeners
  focusYSlider?.addEventListener('input', triggerAnimation);
  directrixYSlider?.addEventListener('input', triggerAnimation);

  toggleBtn?.addEventListener('click', () => {
    isAnimating = !isAnimating;
    toggleBtn.textContent = isAnimating ? '⏸ Pause Tracing' : '▶ Resume Tracing';
    if (isAnimating && !fdAnimationId) {
      fdAnimationId = requestAnimationFrame(animate);
    }
  });

  // Initialize
  updateTargets();
  currentFocusY = targetFocusY;
  currentDirectrixY = targetDirectrixY;
  animate();

  // AI Tutor - Focus Directrix Module
  initAITutorForModule('conic-fd', () => ({
    curve: 'Parabola',
    focusY: Math.round(currentFocusY),
    directrixY: Math.round(currentDirectrixY)
  }));
}

// ====================================================
// 9. CHIRALITY LAB (3D — Three.js)
// ====================================================
let chiralityScene, chiralityCamera, chiralityRenderer, chiralityControls;
let moleculeGroup, centralCarbon;
let attachedAtoms = [], selectedAtomIndex = null, userRSPrediction = null;
let isBuilding = true, chiralityInitialized = false;

const AVAILABLE_ATOMS = [
  {symbol:'Br',name:'Bromine',color:0x4444ff,size:0.45,atomicNum:35},
  {symbol:'Cl',name:'Chlorine',color:0x44ff44,size:0.4,atomicNum:17},
  {symbol:'I',name:'Iodine',color:0x9c27b0,size:0.5,atomicNum:53},
  {symbol:'F',name:'Fluorine',color:0x00bcd4,size:0.35,atomicNum:9},
  {symbol:'OH',name:'Hydroxyl',color:0xff4444,size:0.38,atomicNum:8},
  {symbol:'NH2',name:'Amino',color:0x3f51b5,size:0.38,atomicNum:7},
  {symbol:'CH3',name:'Methyl',color:0x8d6e63,size:0.42,atomicNum:6},
  {symbol:'H',name:'Hydrogen',color:0xdddd00,size:0.25,atomicNum:1}
];

function initChiralityLab() {
  if (chiralityInitialized) return;
  try {
    const container = document.getElementById('threeContainer');
    if (!container) return;
    const width = container.clientWidth || 480, height = container.clientHeight || 480;
    chiralityScene = new THREE.Scene();
    chiralityCamera = new THREE.PerspectiveCamera(50, width/height, 0.1, 100);
    chiralityCamera.position.set(0, 0, 8);
    chiralityRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    chiralityRenderer.setSize(width, height);
    chiralityRenderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(chiralityRenderer.domElement);
    if (typeof THREE.OrbitControls !== 'undefined') {
      chiralityControls = new THREE.OrbitControls(chiralityCamera, chiralityRenderer.domElement);
      chiralityControls.enableDamping = true;
      chiralityControls.dampingFactor = 0.05;
    }
    chiralityScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5,5,5);
    chiralityScene.add(dirLight);
    createCentralCarbon();
    setupMoleculeBuilderInteraction();
    setupChiralityUI();
    animateChirality();
    chiralityInitialized = true;
    updateBuilderUI();
  } catch(err) { console.error('Chirality init error:', err); }
}

function createCentralCarbon() {
  moleculeGroup = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.4, 32, 32);
  const mat = new THREE.MeshPhongMaterial({color:0x333333, shininess:100, emissive:0x111111});
  centralCarbon = new THREE.Mesh(geo, mat);
  centralCarbon.userData = {isCarbon: true};
  moleculeGroup.add(centralCarbon);
  chiralityScene.add(moleculeGroup);
}

function addAtomToCarbon(symbol) {
  if (attachedAtoms.length >= 4) { showToast('Maximum 4 atoms attached!'); return; }
  const element = AVAILABLE_ATOMS.find(a => a.symbol === symbol);
  if (!element) return;
  const positions = [{x:1.5,y:1.5,z:1.5},{x:-1.5,y:-1.5,z:1.5},{x:-1.5,y:1.5,z:-1.5},{x:1.5,y:-1.5,z:-1.5}];
  const pos = positions[attachedAtoms.length];
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(element.size,32,32), new THREE.MeshPhongMaterial({color:element.color,shininess:100}));
  mesh.position.set(pos.x,pos.y,pos.z);
  mesh.userData = {atomIndex:attachedAtoms.length, element, isAttached:true};
  moleculeGroup.add(mesh);
  const bond = createBondVisual(pos,'solid',attachedAtoms.length);
  moleculeGroup.add(bond);
  attachedAtoms.push({mesh, element, priority:null, bondType:'solid', position:pos, bondMesh:bond});
  updateBuilderUI();
  showToast(`${element.name} attached!`);
  if (attachedAtoms.length === 4) {
    isBuilding = false;
    showToast('All 4 atoms attached! Now assign priorities and determine R/S.');
    const ac = document.getElementById('analysisControls');
    const ap = document.getElementById('atomPalette');
    if (ac) ac.style.display = 'block';
    if (ap) ap.style.display = 'none';
  }
}

function createBondVisual(endPos, type, atomIndex) {
  const dir = new THREE.Vector3(endPos.x,endPos.y,endPos.z).normalize();
  const length = Math.sqrt(endPos.x**2+endPos.y**2+endPos.z**2)-0.4-0.1;
  let bond;
  if (type==='wedge') {
    bond = new THREE.Mesh(new THREE.ConeGeometry(0.12,length,16), new THREE.MeshPhongMaterial({color:0x888888}));
    bond.position.copy(dir.clone().multiplyScalar(length/2+0.4));
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  } else if (type==='dash') {
    bond = new THREE.Group();
    for (let i=0;i<8;i++){
      const seg=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,length/12,8),new THREE.MeshPhongMaterial({color:0x888888}));
      seg.position.copy(dir.clone().multiplyScalar(0.45+i*length/8));
      seg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
      bond.add(seg);
    }
  } else {
    bond = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,length,16), new THREE.MeshPhongMaterial({color:0x888888}));
    bond.position.copy(dir.clone().multiplyScalar(length/2+0.4));
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  }
  bond.userData = {isBond:true, atomIndex, bondType:type};
  return bond;
}

function setupMoleculeBuilderInteraction() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const canvas = chiralityRenderer.domElement;
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse, chiralityCamera);
    const intersects = raycaster.intersectObjects(attachedAtoms.map(a=>a.mesh));
    if (intersects.length > 0) selectAttachedAtom(intersects[0].object.userData.atomIndex);
  });
}

function selectAttachedAtom(index) {
  if (selectedAtomIndex !== null && attachedAtoms[selectedAtomIndex]) attachedAtoms[selectedAtomIndex].mesh.material.emissive.setHex(0x000000);
  selectedAtomIndex = index;
  if (attachedAtoms[index]) attachedAtoms[index].mesh.material.emissive.setHex(0x444444);
  if (!isBuilding) {
    const ba = document.getElementById('bondAssignment');
    if (ba) ba.style.display = 'block';
    const ct = attachedAtoms[index].bondType;
    document.querySelectorAll('.bond-btn').forEach(b=>b.classList.remove('active'));
    document.getElementById(`set${ct.charAt(0).toUpperCase()+ct.slice(1)}`)?.classList.add('active');
  }
  updateBuilderUI();
}

function setBondType(type) {
  if (selectedAtomIndex===null||!attachedAtoms[selectedAtomIndex]){showToast('Please select an atom first!');return;}
  const atom = attachedAtoms[selectedAtomIndex];
  atom.bondType = type;
  moleculeGroup.remove(atom.bondMesh);
  atom.bondMesh = createBondVisual(atom.position, type, selectedAtomIndex);
  moleculeGroup.add(atom.bondMesh);
  document.querySelectorAll('.bond-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`set${type.charAt(0).toUpperCase()+type.slice(1)}`)?.classList.add('active');
  showToast(`Bond set to ${type.toUpperCase()}`);
}

function assignPriority(index, priority) {
  attachedAtoms.forEach(a=>{ if(a.priority===priority) a.priority=null; });
  attachedAtoms[index].priority = priority;
  const allSet = attachedAtoms.length===4 && attachedAtoms.every(a=>a.priority!==null);
  if (allSet) {
    const ps = document.getElementById('predictionStep');
    if (ps) ps.style.display='block';
  }
  updateBuilderUI();
}

function checkChiralityAnswer() {
  const resultEl = document.getElementById('chiralityResult');
  const sorted = [...attachedAtoms].map((a,i)=>({index:i,an:a.element.atomicNum})).sort((a,b)=>b.an-a.an);
  const correct = {};
  sorted.forEach((item,rank)=>correct[item.index]=rank+1);
  const priOk = attachedAtoms.every((a,i)=>a.priority===correct[i]);
  const actualConfig = determineActualConfiguration();
  const predOk = userRSPrediction===actualConfig;
  if (priOk && predOk) {
    resultEl.innerHTML=`🎉 CORRECT!<br>Priorities match atomic numbers ✓<br>Configuration ${actualConfig} ✓`;
    resultEl.className='result-display correct';
    document.getElementById('animateExplain').style.display='inline-block';
    UserSystem.updateProgress('chirality',100);
  } else {
    let msgs=[];
    if (!priOk){const co=sorted.map((it,i)=>`${i+1}=${attachedAtoms[it.index].element.symbol}`).join(', ');msgs.push(`Priorities should be: ${co}`);}
    if (!predOk) msgs.push(`Configuration is ${actualConfig}, not ${userRSPrediction}`);
    resultEl.innerHTML=`❌ ${msgs.join('<br>')}`;
    resultEl.className='result-display incorrect';
  }
  resultEl.style.display='block';
}

function determineActualConfiguration() {
  const p1=attachedAtoms.findIndex(a=>a.priority===1);
  const p2=attachedAtoms.findIndex(a=>a.priority===2);
  const p4=attachedAtoms.findIndex(a=>a.priority===4);
  if (p1===-1||p4===-1) return '?';
  const p1Sym=attachedAtoms[p1]?.element.symbol;
  const p2Sym=attachedAtoms[p2]?.element.symbol;
  if (p1Sym==='I'&&p2Sym==='Br') return 'R';
  if (p1Sym==='Br'&&p2Sym==='Cl') return 'R';
  if (p1Sym==='Br'&&p2Sym==='I') return 'S';
  return attachedAtoms[p4]?.bondType==='dash' ? 'R' : 'R';
}

function resetChirality() {
  if (moleculeGroup) chiralityScene.remove(moleculeGroup);
  attachedAtoms=[]; selectedAtomIndex=null; userRSPrediction=null; isBuilding=true;
  document.getElementById('atomPalette').style.display='block';
  document.getElementById('analysisControls').style.display='none';
  document.getElementById('predictionStep').style.display='none';
  document.getElementById('chiralityResult').style.display='none';
  document.getElementById('animateExplain').style.display='none';
  document.getElementById('checkChirality').disabled=true;
  document.querySelectorAll('.priority-btn,.rs-btn,.bond-btn').forEach(el=>el.classList.remove('active','selected'));
  document.getElementById('chiralityExplanation').innerHTML=`<strong>💡 How to Determine R/S:</strong><br>1. Assign priorities by atomic number (highest = 1)<br>2. Orient molecule so priority 4 points away<br>3. Trace 1→2→3: Clockwise = R, Counter-clockwise = S`;
  createCentralCarbon();
  updateBuilderUI();
  showToast('Molecule reset! Build a new chiral center.');
}

function setupChiralityUI() {
  document.querySelectorAll('.atom-btn').forEach(btn=>{
    btn.addEventListener('click',()=>addAtomToCarbon(btn.dataset.symbol));
  });
  document.querySelectorAll('.priority-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if (selectedAtomIndex===null){showToast('Click an attached atom first!');return;}
      const p=parseInt(btn.dataset.p);
      assignPriority(selectedAtomIndex,p);
      document.querySelectorAll('.priority-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.p)===p));
      const allSet=attachedAtoms.length===4&&attachedAtoms.every(a=>a.priority!==null);
      if (allSet&&userRSPrediction) document.getElementById('checkChirality').disabled=false;
    });
  });
  document.getElementById('predR')?.addEventListener('click',()=>{
    userRSPrediction='R';
    document.getElementById('predR').classList.add('selected');
    document.getElementById('predS').classList.remove('selected');
    const allSet=attachedAtoms.length===4&&attachedAtoms.every(a=>a.priority!==null);
    if (allSet) document.getElementById('checkChirality').disabled=false;
  });
  document.getElementById('predS')?.addEventListener('click',()=>{
    userRSPrediction='S';
    document.getElementById('predS').classList.add('selected');
    document.getElementById('predR').classList.remove('selected');
    const allSet=attachedAtoms.length===4&&attachedAtoms.every(a=>a.priority!==null);
    if (allSet) document.getElementById('checkChirality').disabled=false;
  });
  document.getElementById('checkChirality')?.addEventListener('click',checkChiralityAnswer);
  document.getElementById('animateExplain')?.addEventListener('click',()=>{
    const explanationEl=document.getElementById('chiralityExplanation');
    if (explanationEl) explanationEl.innerHTML=`<strong>🎬 R/S Summary:</strong><br>✓ Orient lowest priority (4) away from viewer<br>→ Trace path 1→2→3<br>☞ Clockwise = R | Counter-clockwise = S`;
  });
  document.getElementById('resetChirality')?.addEventListener('click',resetChirality);
  document.getElementById('setWedge')?.addEventListener('click',()=>setBondType('wedge'));
  document.getElementById('setDash')?.addEventListener('click',()=>setBondType('dash'));
  document.getElementById('setSolid')?.addEventListener('click',()=>setBondType('solid'));
}

function updateBuilderUI() {
  const list = document.getElementById('attachedAtomsList');
  if (!list) return;
  if (attachedAtoms.length===0) {
    list.innerHTML='<span style="color:#64748b;font-size:12px;">No atoms attached yet. Click atoms above to attach them to carbon.</span>';
  } else {
    list.innerHTML=attachedAtoms.map((a,i)=>`<div class="attached-atom-item ${selectedAtomIndex===i?'selected':''}" data-index="${i}">
      <span class="atom-dot" style="background:#${a.element.color.toString(16).padStart(6,'0')}"></span>
      <span class="atom-info">${a.element.symbol} (${a.element.name})</span>
      <span class="atom-priority">${a.priority||'—'}</span>
    </div>`).join('');
    list.querySelectorAll('.attached-atom-item').forEach(item=>{
      item.addEventListener('click',()=>{ selectAttachedAtom(parseInt(item.dataset.index)); });
    });
  }
  document.querySelectorAll('.atom-btn').forEach(btn=>{
    const already=attachedAtoms.some(a=>a.element.symbol===btn.dataset.symbol);
    btn.disabled=already||attachedAtoms.length>=4;
    btn.style.opacity=already?'0.5':'1';
  });
}

function showToast(message) {
  const existing=document.querySelector('.toast-message');
  if (existing) existing.remove();
  const toast=document.createElement('div');
  toast.className='toast-message';
  toast.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;border:1px solid rgba(59,130,246,0.3);color:#f1f5f9;padding:12px 24px;border-radius:25px;font-size:14px;z-index:10002;box-shadow:0 4px 20px rgba(0,0,0,0.4);font-family:Outfit,sans-serif;';
  toast.textContent=message;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; setTimeout(()=>toast.remove(),300); },2000);
}

function animateChirality() {
  requestAnimationFrame(animateChirality);
  const lab=document.getElementById('chemChirality');
  if (!lab||lab.style.display==='none') return;
  chiralityControls?.update();
  chiralityRenderer?.render(chiralityScene, chiralityCamera);
}

// ====================================================
// 10. ALGORITHM LAB
// ====================================================
const AlgoLab = {
  GRID_SIZE: 5, ANIMATION_SPEED: 5, isRunning: false, btSteps: 0, dpSteps: 0, userPrediction: null, elements: {},

  init() {
    this.elements = {
      btGrid: document.getElementById('btGrid'), dpGrid: document.getElementById('dpGrid'),
      btCounter: document.getElementById('btCounter'), dpCounter: document.getElementById('dpCounter'),
      btExplanation: document.getElementById('btExplanation'), dpExplanation: document.getElementById('dpExplanation'),
      btBar: document.getElementById('btBar'), dpBar: document.getElementById('dpBar'),
      perfSection: document.getElementById('perfSection'), answerReveal: document.getElementById('answerReveal'),
      predBacktrack: document.getElementById('predBacktrack'), predDP: document.getElementById('predDP'),
      startBtn: document.getElementById('startAlgoBtn')
    };
    this.createGrids();
  },

  createGrids() {
    const {btGrid,dpGrid}=this.elements;
    if (!btGrid||!dpGrid) return;
    btGrid.innerHTML=''; dpGrid.innerHTML='';
    btGrid.style.gridTemplateColumns=`repeat(${this.GRID_SIZE},50px)`;
    dpGrid.style.gridTemplateColumns=`repeat(${this.GRID_SIZE},50px)`;
    for (let r=0;r<this.GRID_SIZE;r++) for (let c=0;c<this.GRID_SIZE;c++) {
      const mk=(r===0&&c===0)?'start':(r===this.GRID_SIZE-1&&c===this.GRID_SIZE-1)?'end':'';
      ['btGrid','dpGrid'].forEach(id=>{
        const cell=document.createElement('div');
        cell.className='cell'; if(mk) cell.classList.add(mk);
        this.elements[id]?.appendChild(cell);
      });
    }
  },

  selectPrediction(type) {
    this.userPrediction=type;
    this.elements.predBacktrack?.classList.toggle('selected',type==='backtrack');
    this.elements.predDP?.classList.toggle('selected',type==='dp');
  },

  changeGridSize(size){this.GRID_SIZE=parseInt(size);this.reset();},
  changeSpeed(speed){this.ANIMATION_SPEED=parseInt(speed);},
  sleep(ms){return new Promise(r=>setTimeout(r,ms*(10/this.ANIMATION_SPEED)));},

  setBtCell(r,c,state,value=''){
    const cell=this.elements.btGrid?.children[r*this.GRID_SIZE+c];
    if(!cell) return; cell.className='cell';
    if(r===0&&c===0)cell.classList.add('start'); if(r===this.GRID_SIZE-1&&c===this.GRID_SIZE-1)cell.classList.add('end');
    if(state)cell.classList.add(state); if(value)cell.textContent=value;
  },
  setDpCell(r,c,state,value=''){
    const cell=this.elements.dpGrid?.children[r*this.GRID_SIZE+c];
    if(!cell) return; cell.className='cell';
    if(r===0&&c===0)cell.classList.add('start'); if(r===this.GRID_SIZE-1&&c===this.GRID_SIZE-1)cell.classList.add('end');
    if(state)cell.classList.add(state); if(value)cell.textContent=value;
  },
  explainBt(text){if(this.elements.btExplanation)this.elements.btExplanation.innerHTML=text;},
  explainDp(text){if(this.elements.dpExplanation)this.elements.dpExplanation.innerHTML=text;},
  updateBtCounter(){if(this.elements.btCounter)this.elements.btCounter.textContent=`Steps: ${this.btSteps}`;},
  updateDpCounter(){if(this.elements.dpCounter)this.elements.dpCounter.textContent=`Steps: ${this.dpSteps}`;},

  async backtrackingSolver() {
    this.btSteps=0;
    this.explainBt('<span class="highlight">Starting backtracking...</span><br>Exploring all paths recursively.');
    await this.sleep(800);
    const explore=async(r,c,path)=>{
      if(r>=this.GRID_SIZE||c>=this.GRID_SIZE){this.explainBt(`<span class="highlight">Out of bounds!</span> at (${r},${c}) — backtracking...`);await this.sleep(300);return 0;}
      this.btSteps++;this.updateBtCounter();
      path.push(`${r},${c}`);
      this.setBtCell(r,c,'exploring');
      this.explainBt(`<span class="highlight">Exploring:</span> cell (${r},${c})<br>Path length: ${path.length}`);
      await this.sleep(400);
      if(r===this.GRID_SIZE-1&&c===this.GRID_SIZE-1){this.setBtCell(r,c,'path-found');this.explainBt('<span class="highlight">🎉 Path found!</span>');await this.sleep(400);return 1;}
      let count=0;
      if(c+1<this.GRID_SIZE){this.explainBt(`<span class="highlight">Going RIGHT</span> from (${r},${c})`);await this.sleep(200);count+=await explore(r,c+1,path);}
      if(r+1<this.GRID_SIZE){this.explainBt(`<span class="highlight">Going DOWN</span> from (${r},${c})`);await this.sleep(200);count+=await explore(r+1,c,path);}
      path.pop();
      if(!(r===this.GRID_SIZE-1&&c===this.GRID_SIZE-1)){this.setBtCell(r,c,'backtracked');this.explainBt(`<span class="highlight">Backtracking</span> from (${r},${c})`);await this.sleep(200);}
      return count;
    };
    const total=await explore(0,0,[]);
    this.explainBt(`<span class="highlight">✅ Complete!</span><br>Total paths: ${total}<br>Recursive calls: ${this.btSteps}`);
    return this.btSteps;
  },

  async dpSolver() {
    this.dpSteps=0;
    const dp=Array(this.GRID_SIZE).fill(null).map(()=>Array(this.GRID_SIZE).fill(0));
    this.explainDp('<span class="highlight">Starting DP...</span><br>Each cell = ways to reach it.');
    await this.sleep(800);
    for(let c=0;c<this.GRID_SIZE;c++){dp[0][c]=1;this.dpSteps++;this.setDpCell(0,c,'dp-filled','1');this.explainDp(`<span class="highlight">Base:</span> Row 0, (0,${c})=1`);this.updateDpCounter();await this.sleep(300);}
    for(let r=1;r<this.GRID_SIZE;r++){dp[r][0]=1;this.dpSteps++;this.setDpCell(r,0,'dp-filled','1');this.explainDp(`<span class="highlight">Base:</span> Col 0, (${r},0)=1`);this.updateDpCounter();await this.sleep(300);}
    for(let r=1;r<this.GRID_SIZE;r++) for(let c=1;c<this.GRID_SIZE;c++){
      this.dpSteps++;
      this.setDpCell(r-1,c,'dp-reused'); this.setDpCell(r,c-1,'dp-reused');
      this.explainDp(`<span class="highlight">Reusing!</span> dp[${r}][${c}]=${dp[r-1][c]}+${dp[r][c-1]}=${dp[r-1][c]+dp[r][c-1]}`);
      await this.sleep(200);
      dp[r][c]=dp[r-1][c]+dp[r][c-1];
      this.setDpCell(r-1,c,'dp-filled',dp[r-1][c]); this.setDpCell(r,c-1,'dp-filled',dp[r][c-1]); this.setDpCell(r,c,'dp-filled',dp[r][c]);
      this.updateDpCounter(); await this.sleep(300);
    }
    const result=dp[this.GRID_SIZE-1][this.GRID_SIZE-1];
    this.explainDp(`<span class="highlight">✅ Complete!</span><br>Total paths: ${result}<br>Computations: ${this.dpSteps}`);
    return this.dpSteps;
  },

  async start() {
    if(this.isRunning) return;
    if(!this.userPrediction){alert('Please make a prediction first!');return;}
    this.isRunning=true;
    if(this.elements.startBtn) this.elements.startBtn.disabled=true;
    this.createGrids();
    if(this.elements.perfSection) this.elements.perfSection.classList.remove('visible');
    await Promise.all([this.backtrackingSolver(), this.dpSolver()]);
    this.showResults();
    this.isRunning=false;
    if(this.elements.startBtn) this.elements.startBtn.disabled=false;
    UserSystem.updateProgress('quiz',80);
  },

  showResults() {
    const max=Math.max(this.btSteps,this.dpSteps);
    if(this.elements.btBar){this.elements.btBar.style.width=`${(this.btSteps/max)*100}%`;this.elements.btBar.textContent=`${this.btSteps} steps`;}
    if(this.elements.dpBar){this.elements.dpBar.style.width=`${(this.dpSteps/max)*100}%`;this.elements.dpBar.textContent=`${this.dpSteps} steps`;}
    const btEl=document.getElementById('btSteps'),dpEl=document.getElementById('dpSteps'),spEl=document.getElementById('speedup');
    if(btEl)btEl.textContent=this.btSteps; if(dpEl)dpEl.textContent=this.dpSteps;
    const speedup=this.dpSteps>0?(this.btSteps/this.dpSteps).toFixed(1):0;
    if(spEl)spEl.textContent=`${speedup}x`;
    if(this.elements.perfSection)this.elements.perfSection.classList.add('visible');
    const isCorrect=this.userPrediction==='dp';
    if(this.elements.answerReveal){
      this.elements.answerReveal.classList.remove('hidden','correct','incorrect');
      this.elements.answerReveal.classList.add(isCorrect?'correct':'incorrect');
      this.elements.answerReveal.innerHTML=isCorrect
        ?`<h3>🎉 Correct Prediction!</h3><p>Dynamic Programming was <strong>${speedup}x faster</strong>!</p><p>DP avoids recomputation by storing and reusing results.</p>`
        :`<h3>❌ Not Quite!</h3><p>Dynamic Programming was actually <strong>${speedup}x faster</strong>!</p><p>Backtracking is exponential, DP is polynomial.</p>`;
      this.elements.answerReveal.scrollIntoView({behavior:'smooth'});
    }
  },

  reset() {
    this.isRunning=false; this.btSteps=0; this.dpSteps=0; this.userPrediction=null;
    if(this.elements.startBtn)this.elements.startBtn.disabled=false;
    if(this.elements.btCounter)this.elements.btCounter.textContent='Steps: 0';
    if(this.elements.dpCounter)this.elements.dpCounter.textContent='Steps: 0';
    if(this.elements.btExplanation)this.elements.btExplanation.innerHTML='Click "Start Simulation" to see backtracking in action...';
    if(this.elements.dpExplanation)this.elements.dpExplanation.innerHTML='Click "Start Simulation" to see dynamic programming in action...';
    if(this.elements.perfSection)this.elements.perfSection.classList.remove('visible');
    if(this.elements.answerReveal)this.elements.answerReveal.classList.add('hidden');
    if(this.elements.predBacktrack)this.elements.predBacktrack.classList.remove('selected');
    if(this.elements.predDP)this.elements.predDP.classList.remove('selected');
    this.createGrids();
  }
};

// ====================================================
// THEME TOGGLE
// ====================================================
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;
  
  const body = document.body;
  
  // Load saved preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    toggleBtn.textContent = '🌙';
  }
  
  toggleBtn.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      toggleBtn.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      toggleBtn.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// ====================================================
// BOOT
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
  UserSystem.init();
  initTopNav();
  initChemSubTabs();
  initMathSubTabs();
  initConicsSubTabs();
  initInorganicLab();
  initOrganicLab();
  initQuiz();
  AlgoLab.init();
  initThemeToggle();
  // Math labs init lazily when Maths nav or sub-tabs are clicked
});
