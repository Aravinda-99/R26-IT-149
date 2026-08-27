/**
 * Level17Scene — Iteration Arena  (Tuning Phase)
 * Canvas: 800×600 | All Phaser 3 graphics primitives
 */
import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

const W = 800, H = 600;
const HUD_H = 55;
const CT_X = 22, CT_Y = 62, CT_W = 412, CT_H = 288;
const AZ_X = 448, AZ_Y = 62, AZ_W = 330, AZ_H = 288;
const DIV_X = 440;
const PL_X = 400, PL_Y = 470;
const DR_SY = 44, DR_EY = 445;
const TBX = 268, TBY = 26, TBW = 200, TBH = 12;

const TC = {
  keyword: '#ff4081', number: '#ffd740', operator: '#ff8a65',
  string: '#00e676', method: '#4fc3f7', comment: '#546e7a',
  punct: '#78909c', variable: '#00e5ff', default: '#e0e0e0',
};
const KW = new Set(['for','int','if','else','while','System','void','class','return',
  'true','false','println','print','length','out']);

/* ── 15 Waves ─────────────────────────────────────────────────── */
const WAVES = [
  { wave:1,  type:'predict_output',  timeLimit:12000,
    code:['for (int i = 0; i < 3; i++) {','    System.out.print(i + " ");','}'],
    question:'What does this loop print?',
    options:['0 1 2','1 2 3','0 1 2 3','0 1'], correctIndex:0, concept:'basic_loop' },

  { wave:2,  type:'predict_output',  timeLimit:12000,
    code:['for (int i = 1; i <= 4; i++) {','    System.out.print(i + " ");','}'],
    question:'What does this loop print?',
    options:['0 1 2 3','1 2 3 4','1 2 3 4 5','2 3 4'], correctIndex:1, concept:'inclusive_bound' },

  { wave:3,  type:'iteration_count', timeLimit:14000,
    code:['for (int i = 0; i < 7; i++) {','    System.out.print(i);','}'],
    question:'How many times does this loop execute?',
    correctAnswer:7, concept:'count_iterations' },

  { wave:4,  type:'execution_order', timeLimit:18000,
    code:['for (int i = 0; i < 3; i++) {','    System.out.println(i);','}'],
    question:'Order the 4 parts of a for-loop:',
    cards:['Initialize  i = 0','Check condition','Execute body','Update  i++'],
    cardColors:[0x00e5ff, 0xffd740, 0x00e676, 0xff4081],
    correctOrder:[0,1,2,3], concept:'loop_structure' },

  { wave:5,  type:'fix_bug',         timeLimit:14000,
    code:['for (int i = 0; i < 5; i++) {','    System.out.print(i + " ");','}',
          '// Expected: 0 1 2 3 4 5'],
    bugLine:0,
    question:'Fix the bug to print 0 through 5:',
    fixes:['Change < to <=','Change i++ to i--','Change 5 to 4'],
    correctFixIndex:0, concept:'off_by_one' },

  { wave:6,  type:'predict_output',  timeLimit:12000,
    code:['for (int i = 0; i < 10; i += 2) {','    System.out.print(i + " ");','}'],
    question:'What does this loop print?',
    options:['0 2 4 6 8','1 3 5 7 9','0 2 4 6 8 10','2 4 6 8'], correctIndex:0, concept:'step_increment' },

  { wave:7,  type:'iteration_count', timeLimit:14000,
    code:['for (int i = 10; i > 6; i--) {','    System.out.println(i);','}'],
    question:'How many times does this loop execute?',
    correctAnswer:4, concept:'decrement_loop' },

  { wave:8,  type:'loop_compare',    timeLimit:16000,
    loopA:['for (int i = 0; i < 5; i++) {','    System.out.print(i);','}'],
    loopB:['for (int i = 0; i <= 4; i++) {','    System.out.print(i);','}'],
    question:'Do these loops produce the SAME or DIFFERENT output?',
    options:['SAME','DIFFERENT'], correctIndex:0, concept:'bound_equivalence' },

  { wave:9,  type:'fix_bug',         timeLimit:14000,
    code:['for (int i = 5; i > 0; i++) {','    System.out.print(i + " ");','}'],
    bugLine:0,
    question:'This loop runs forever! Fix it:',
    fixes:['Change i++ to i--','Change i > 0 to i < 0','Change 5 to 0'],
    correctFixIndex:0, concept:'infinite_loop' },

  { wave:10, type:'predict_output',  timeLimit:12000,
    code:['for (int i = 5; i >= 1; i--) {','    System.out.print(i + " ");','}'],
    question:'What does this loop print?',
    options:['5 4 3 2 1','1 2 3 4 5','4 3 2 1 0','5 4 3 2 1 0'], correctIndex:0, concept:'countdown_loop' },

  { wave:11, type:'execution_order', timeLimit:18000,
    code:['for (int i = 0; i < 3; i++) {','    System.out.println(i);','}'],
    question:'After the first iteration, what runs next? (order 3 steps)',
    cards:['Initialize  i = 0','Update  i++','Check condition','Execute body'],
    cardColors:[0x00e5ff, 0xff4081, 0xffd740, 0x00e676],
    correctOrder:[1,2,3], excludeCard:0, concept:'loop_cycle' },

  { wave:12, type:'loop_compare',    timeLimit:16000,
    loopA:['for (int i = 2; i < 8; i += 2) {','    System.out.print(i);','}'],
    loopB:['for (int i = 2; i <= 6; i += 2) {','    System.out.print(i);','}'],
    question:'Do these loops produce the SAME or DIFFERENT output?',
    options:['SAME','DIFFERENT'], correctIndex:0, concept:'step_equivalence' },

  { wave:13, type:'fix_bug',         timeLimit:15000,
    code:['for (int i = 1; i < 5; i++) {','    System.out.print(i + " ");','}',
          '// Expected: 0 1 2 3 4'],
    bugLine:0,
    question:'Fix the loop to print 0 through 4:',
    fixes:['Change i=1 to i=0  AND  < to <=','Change i++ to i--','Change 5 to 4'],
    correctFixIndex:0, concept:'init_and_bound' },

  { wave:14, type:'iteration_count', timeLimit:14000,
    code:['for (int i = 3; i <= 9; i += 2) {','    System.out.println(i);','}'],
    question:'How many times does this loop execute?',
    correctAnswer:4, concept:'step_count' },

  { wave:15, type:'predict_output',  timeLimit:11000,
    code:['for (int i = 3; i <= 12; i += 3) {','    System.out.print(i + " ");','}'],
    question:'What does this loop print?',
    options:['3 6 9 12','3 6 9','6 9 12','3 6 9 12 15'], correctIndex:0, concept:'multiples' },
];

const BIT_FB = {
  basic_loop:       'i starts at 0 — first print is 0, not 1!',
  inclusive_bound:  'i <= 4 includes 4. i < 4 stops before reaching 4.',
  count_iterations: 'Count: from 0 up to (not including) 7 — that is 7 steps.',
  loop_structure:   'Init once → Check → Body → Update → Check again!',
  off_by_one:       'i < 5 stops at 4. Use i <= 5 to include 5.',
  step_increment:   'i += 2 skips every other number — even numbers only!',
  decrement_loop:   '10 > 6, 9 > 6, 8 > 6, 7 > 6 — exactly 4 iterations.',
  bound_equivalence:'i < 5 and i <= 4 both stop after i = 4. Same result!',
  infinite_loop:    'i++ makes i grow, never reaching <= 0. Use i-- instead.',
  countdown_loop:   'Starts at 5 and decrements — prints 5 4 3 2 1.',
  loop_cycle:       'After the body: Update (i++), then re-check the condition.',
  step_equivalence: '2, 4, 6 from both loops — identical three values!',
  init_and_bound:   'Start i at 0 AND use <= to include the last value.',
  step_count:       '3, 5, 7, 9 — four values with step 2.',
  multiples:        '3 → 6 → 9 → 12. Next 15 > 12, so the loop stops.',
};

/* ═══════════════════════════════════════════════════════════════════
   Scene Class
═══════════════════════════════════════════════════════════════════ */
export class Level17Scene extends Phaser.Scene {
  constructor() { super({ key: 'Level17Scene' }); }

  /* ── Lifecycle ─────────────────────────────────────────────── */
  init() {
    this.score = 0; this.combo = 0; this.maxCombo = 0; this.lives = 3;
    this.currentWave = 0; this.correctCount = 0;
    this._waveAnswered = false;
    this._waveStartTime = 0; this._curTimeLimit = 0;
    this._droneTween = null; this._droneSway = null; this._drone = null;
    this._fragments = []; this._waveEls = [];
    this._dashOff = 0;
    this._inputStr = ''; this._inputTxt = null;
    this._selCardIdx = null; this._slotContents = []; this._slotEls = []; this._poolEls = [];
    this._timerStartTime = 0;
    this._playerCont = null; this._bitCont = null;
    this._bitBubble = null; this._bitBubbleTxt = null; this._bitTimer = null;
    this._hudWaveTxt = null; this._hudScoreTxt = null; this._hudComboTxt = null;
    this._hudLifeGfx = []; this._timerGfx = null; this._divG = null;
  }

  preload() {}

  create() {
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');

    const pg = this.make.graphics({ add: false });
    pg.fillStyle(0xffffff); pg.fillCircle(4, 4, 4);
    pg.generateTexture('p17', 8, 8); pg.destroy();

    this.add.rectangle(W / 2, H / 2, W, H, 0x050510);
    this._createArenaFloor();
    this._createBarrierWalls();
    this._createFragments();
    this._createTitle();
    this._createHUD();
    this._createCodeTerminal();
    this._createAnswerPanel();
    this._divG = this.add.graphics();
    this._createPlayerAvatar();
    this._createBit();

    this.startWave(0);
  }

  update(time) {
    this._fragments.forEach(f => {
      f.y -= 0.15;
      if (f.y < 28) { f.y = 385; f.x = Phaser.Math.Between(30, W - 30); }
    });
    // Animated dashed divider
    this._dashOff = (this._dashOff + 0.5) % 12;
    if (this._divG) {
      this._divG.clear();
      this._divG.lineStyle(1, 0x00e5ff, 0.12);
      for (let y = CT_Y + 8; y < CT_Y + CT_H - 4; y += 12) {
        if (((y + (this._dashOff | 0)) % 12) < 6)
          this._divG.lineBetween(DIV_X, y, DIV_X, Math.min(y + 6, CT_Y + CT_H - 4));
      }
    }
    // Live timer bar
    if (!this._waveAnswered && this._timerStartTime > 0 && this._timerGfx) {
      const pct = Math.max(0, 1 - (time - this._timerStartTime) / this._curTimeLimit);
      this._drawTimerBar(pct);
    }
  }

  /* ── Setup ─────────────────────────────────────────────────── */
  _createArenaFloor() {
    const g = this.add.graphics();
    g.fillStyle(0x0a1628, 1);
    g.fillRect(0, 358, W, H - 358);
    g.lineStyle(1, 0x00e5ff, 0.07);
    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 358, x, H);
    for (let y = 358; y <= H; y += 30) g.lineBetween(0, y, W, y);
    g.lineStyle(2, 0x00e5ff, 0.28);
    g.lineBetween(0, 358, W, 358);
    g.lineStyle(1, 0x00e5ff, 0.1);
    g.lineBetween(0, 362, W, 362);
  }

  _createBarrierWalls() {
    const g = this.add.graphics();
    const colors = [0x00e5ff,0xff4081,0xffd740,0x00e676,0x9c27b0,0xff8a65,0x00e5ff,0xff4081];
    [70,105,140,175,210,245,280,315].forEach((y, i) => {
      g.fillStyle(colors[i % colors.length], 0.2);
      g.fillRect(0, y, 18, 22);
      g.fillRect(W - 18, y, 18, 22);
    });
    g.lineStyle(1, 0x00e5ff, 0.35);
    g.lineBetween(18, HUD_H, 18, 355);
    g.lineBetween(W - 18, HUD_H, W - 18, 355);
  }

  _createFragments() {
    const syms = ['01','10','if','{}','i++','<=','for','int','0x','&&','||','!='];
    for (let i = 0; i < 18; i++) {
      const t = this.add.text(
        Phaser.Math.Between(30, W - 30),
        Phaser.Math.Between(28, 380),
        syms[i % syms.length],
        { fontFamily: 'Courier New', fontSize: '10px' }
      ).setAlpha(Phaser.Math.FloatBetween(0.04, 0.11)).setTint(0x00e5ff);
      this._fragments.push(t);
    }
  }

  _createTitle() {
    this.add.text(W / 2, 30, 'ITERATION ARENA', {
      fontFamily: 'Arial Black', fontSize: '11px', color: '#00e5ff', letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0.3);
  }

  _createHUD() {
    const bg = this.add.graphics();
    bg.fillStyle(0x000814, 0.95); bg.fillRect(0, 0, W, HUD_H);
    bg.lineStyle(1, 0x00e5ff, 0.28); bg.lineBetween(0, HUD_H, W, HUD_H);

    this._hudWaveTxt = this.add.text(22, 14, 'WAVE 1 / 15', {
      fontFamily: 'Courier New', fontSize: '12px', color: '#00e5ff', fontStyle: 'bold'
    });

    // Timer track
    this._timerGfx = this.add.graphics();
    const tg = this.add.graphics();
    tg.fillStyle(0x0d2035, 1); tg.fillRoundedRect(TBX, TBY - TBH / 2, TBW, TBH, 6);
    tg.lineStyle(1, 0x00e5ff, 0.18); tg.strokeRoundedRect(TBX, TBY - TBH / 2, TBW, TBH, 6);
    this.add.text(TBX + TBW / 2, TBY - TBH / 2 - 10, 'TIME', {
      fontFamily: 'Courier New', fontSize: '9px', color: '#546e7a'
    }).setOrigin(0.5, 1);

    this.add.text(W - 160, 6, 'SCORE', { fontFamily: 'Courier New', fontSize: '9px', color: '#546e7a' });
    this._hudScoreTxt = this.add.text(W - 160, 18, '0', {
      fontFamily: 'Courier New', fontSize: '16px', color: '#ffd740', fontStyle: 'bold'
    });
    this.add.text(W - 78, 6, 'COMBO', { fontFamily: 'Courier New', fontSize: '9px', color: '#546e7a' });
    this._hudComboTxt = this.add.text(W - 55, 18, '×1', {
      fontFamily: 'Courier New', fontSize: '16px', color: '#00e5ff', fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    for (let i = 0; i < 3; i++) {
      const sg = this.add.graphics();
      this._hudLifeGfx.push(sg);
      this._drawShield(sg, 565 + i * 24, 16, 0xff4081, 1);
    }
    this._drawTimerBar(1);
  }

  _drawShield(g, x, y, color, alpha) {
    g.clear();
    if (alpha <= 0) g.fillStyle(0x1a1a2e, 0.4); else g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(x, y - 10); g.lineTo(x + 9, y - 10);
    g.lineTo(x + 9, y - 2); g.lineTo(x + 4.5, y + 6);
    g.lineTo(x, y - 2); g.closePath(); g.fillPath();
  }

  _drawTimerBar(pct) {
    if (!this._timerGfx || !this._timerGfx.active) return;
    this._timerGfx.clear();
    const color = pct > 0.5 ? 0x00e676 : pct > 0.25 ? 0xffd740 : 0xf44336;
    const blink = pct < 0.25 ? (0.7 + 0.3 * Math.sin(this.time.now / 150)) : 1;
    this._timerGfx.fillStyle(color, blink);
    this._timerGfx.fillRoundedRect(TBX, TBY - TBH / 2, Math.max(2, TBW * pct), TBH, 6);
  }

  _createCodeTerminal() {
    const g = this.add.graphics();
    g.fillStyle(0x080d18, 0.96); g.fillRoundedRect(CT_X, CT_Y, CT_W, CT_H, 6);
    g.lineStyle(1, 0x1e3a5f, 1); g.strokeRoundedRect(CT_X, CT_Y, CT_W, CT_H, 6);
    g.fillStyle(0x0d1b2a, 1); g.fillRect(CT_X, CT_Y, CT_W, 22);
    const dots = [0xf44336, 0xffd740, 0x00e676];
    dots.forEach((c, i) => { g.fillStyle(c, 0.8); g.fillCircle(CT_X + 12 + i * 16, CT_Y + 11, 4); });
    this.add.text(CT_X + CT_W / 2, CT_Y + 11, 'Challenge.java', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#546e7a'
    }).setOrigin(0.5);
  }

  _createAnswerPanel() {
    const g = this.add.graphics();
    g.fillStyle(0x08101f, 0.94); g.fillRoundedRect(AZ_X, AZ_Y, AZ_W, AZ_H, 6);
    g.lineStyle(1, 0x1e3a5f, 1); g.strokeRoundedRect(AZ_X, AZ_Y, AZ_W, AZ_H, 6);
    g.fillStyle(0x0d1b2a, 1); g.fillRect(AZ_X, AZ_Y, AZ_W, 22);
    this.add.text(AZ_X + AZ_W / 2, AZ_Y + 11, 'Your Answer', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#546e7a'
    }).setOrigin(0.5);
  }

  _createPlayerAvatar() {
    this._playerCont = this.add.container(PL_X, PL_Y);
    const g = this.add.graphics();
    g.fillStyle(0x00e5ff, 0.9); g.fillRoundedRect(-12, -32, 24, 26, 4);
    g.fillStyle(0x4fc3f7, 1); g.fillCircle(0, -42, 10);
    g.fillStyle(0x000814, 0.85); g.fillRect(-6, -46, 12, 6);
    g.fillStyle(0x00e5ff, 0.6); g.fillRect(-5, -45, 10, 4);
    g.fillStyle(0x0d47a1, 1); g.fillRect(-10, -6, 8, 14); g.fillRect(2, -6, 8, 14);
    g.fillStyle(0x00b0c8, 0.9); g.fillRect(-20, -30, 8, 18); g.fillRect(12, -30, 8, 18);
    this._playerCont.add(g);
    this.tweens.add({ targets: this._playerCont, y: PL_Y - 5, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _createBit() {
    this._bitCont = this.add.container(W + 80, 475);
    const g = this.add.graphics();
    g.fillStyle(0x14b8a6, 1); g.fillRoundedRect(-14, -28, 28, 24, 4);
    g.fillStyle(0x0d9488, 1); g.fillCircle(0, -36, 10);
    g.fillStyle(0x00e5ff, 1); g.fillCircle(-4, -37, 2.5); g.fillCircle(4, -37, 2.5);
    g.lineStyle(2, 0x00e5ff, 0.8); g.lineBetween(0, -46, 0, -53);
    g.fillStyle(0xffd740, 1); g.fillCircle(0, -55, 3);
    this._bitCont.add(g);
  }

  /* ── Wave management ───────────────────────────────────────── */
  async startWave(idx) {
    if (idx >= WAVES.length) { this._levelComplete(); return; }
    this._clearWave();
    this._waveAnswered = false;
    this.currentWave = idx;
    const cfg = WAVES[idx];
    this._curTimeLimit = cfg.timeLimit;
    this._hudWaveTxt.setText(`WAVE ${cfg.wave} / 15`);
    this.tweens.add({ targets: this._hudWaveTxt, scaleX: 1.3, scaleY: 1.3, duration: 110, yoyo: true });
    await this._waveTransition(cfg.wave);
    this._spawnDrone(cfg.timeLimit);
    this._timerStartTime = this.time.now;
    this._renderChallenge(cfg);
  }

  _waveTransition(n) {
    return new Promise(resolve => {
      const overlay = this.add.graphics().setDepth(190);
      overlay.fillStyle(0x000000, 0.45); overlay.fillRect(0, 0, W, H);
      const t = this.add.text(W / 2, H / 2 - 20, `WAVE ${n}`, {
        fontFamily: 'Arial Black', fontSize: '40px', color: '#ffd740'
      }).setOrigin(0.5).setScale(0).setDepth(200);
      const sub = this.add.text(W / 2, H / 2 + 26, WAVES[n - 1].type.replace(/_/g, ' ').toUpperCase(), {
        fontFamily: 'Courier New', fontSize: '13px', color: '#00e5ff', letterSpacing: 3
      }).setOrigin(0.5).setAlpha(0).setDepth(200);
      this.tweens.add({
        targets: t, scaleX: 1.1, scaleY: 1.1, duration: 220, ease: 'Back.Out',
        onComplete: () => {
          this.tweens.add({ targets: sub, alpha: 1, duration: 180 });
          this.time.delayedCall(600, () => {
            this.tweens.add({
              targets: [t, sub, overlay], alpha: 0, duration: 200,
              onComplete: () => { t.destroy(); sub.destroy(); overlay.destroy(); resolve(); }
            });
          });
        }
      });
    });
  }

  _spawnDrone(timeLimit) {
    const dx = Phaser.Math.Between(W * 0.25, W * 0.7);
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0xf44336, 0.95); g.fillRoundedRect(-18, -12, 36, 24, 5);
    g.fillStyle(0xff1744, 1); g.fillCircle(0, 0, 6);
    g.fillStyle(0xffffff, 0.85); g.fillCircle(0, 0, 3);
    g.fillStyle(0x9c27b0, 0.85); g.fillRect(-32, -4, 12, 4); g.fillRect(20, -4, 12, 4);
    g.fillStyle(0xffd740, 0.55); g.fillRect(-28, -9, 4, 12); g.fillRect(24, -9, 4, 12);
    g.setPosition(dx, DR_SY);
    this._drone = g;
    this._we(g);

    const ring = this.add.graphics().setDepth(49);
    this._we(ring);
    let ringR = 20;
    this.tweens.add({
      targets: { r: 0 }, r: 1, duration: 900, repeat: -1,
      onUpdate: tw => {
        if (!ring.active || !g.active) return;
        ring.clear();
        ring.lineStyle(1, 0xf44336, 0.4 * (1 - tw.getValue()));
        ring.strokeCircle(g.x, g.y, 20 + tw.getValue() * 22);
      }
    });

    this._droneTween = this.tweens.add({
      targets: g, y: DR_EY, duration: timeLimit, ease: 'Linear',
      onComplete: () => { if (!this._waveAnswered) this._droneReachesPlayer(); }
    });
    this._droneSway = this.tweens.add({
      targets: g, x: dx + 28, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  _clearWave() {
    this._waveEls.forEach(el => { if (el && el.active) el.destroy(); });
    this._waveEls = []; this._poolEls = []; this._slotEls = []; this._slotContents = [];
    this._selCardIdx = null; this._inputStr = ''; this._inputTxt = null;
    if (this._droneTween) { this._droneTween.stop(); this._droneTween = null; }
    if (this._droneSway) { this._droneSway.stop(); this._droneSway = null; }
    this._drone = null;
    this._timerStartTime = 0;
    this._drawTimerBar(0);
    if (this._bitBubble && this._bitBubble.active) { this._bitBubble.destroy(); this._bitBubble = null; }
    if (this._bitBubbleTxt && this._bitBubbleTxt.active) { this._bitBubbleTxt.destroy(); this._bitBubbleTxt = null; }
    if (this._bitTimer) { this._bitTimer.remove(); this._bitTimer = null; }
  }

  _we(el) { if (el) this._waveEls.push(el); return el; }

  /* ── Challenge renderers ───────────────────────────────────── */
  _renderChallenge(cfg) {
    if (cfg.type === 'loop_compare') {
      this._displayLoopCompare(cfg);
    } else if (cfg.code) {
      this._displayCode(cfg.code, cfg.bugLine);
    }
    const q = this._we(this.add.text(AZ_X + 12, AZ_Y + 30, cfg.question, {
      fontFamily: 'Courier New', fontSize: '11px', color: '#90caf9',
      wordWrap: { width: AZ_W - 22 }
    }).setDepth(10));

    if (cfg.type === 'predict_output')   this._renderMCQ(cfg);
    else if (cfg.type === 'fix_bug')     this._renderFixBug(cfg);
    else if (cfg.type === 'iteration_count') this._renderNumberPad(cfg);
    else if (cfg.type === 'execution_order') this._renderExecOrder(cfg);
    else if (cfg.type === 'loop_compare')    this._renderCompareButtons(cfg);
  }

  _displayCode(lines, bugLine) {
    const sy = CT_Y + 34, lh = 20;
    lines.forEach((line, i) => {
      this._we(this.add.text(CT_X + 5, sy + i * lh, `${i + 1}`, {
        fontFamily: 'Courier New', fontSize: '11px', color: '#37474f'
      }));
      if (i === bugLine) {
        const hl = this._we(this.add.graphics());
        hl.fillStyle(0xf44336, 0.08);
        hl.fillRect(CT_X + 24, sy + i * lh - 2, CT_W - 28, lh);
        hl.lineStyle(1, 0xf44336, 0.28);
        hl.lineBetween(CT_X + 24, sy + i * lh + lh - 2, CT_X + CT_W - 4, sy + i * lh + lh - 2);
      }
      this._renderCodeLine(line, CT_X + 28, sy + i * lh);
    });
  }

  _displayLoopCompare(cfg) {
    const g = this._we(this.add.graphics());
    const hw = (CT_W - 10) / 2;
    g.fillStyle(0x0d2035, 0.65); g.fillRoundedRect(CT_X + 4, CT_Y + 28, hw, 112, 3);
    g.fillStyle(0x0d2035, 0.65); g.fillRoundedRect(CT_X + 6 + hw, CT_Y + 28, hw, 112, 3);
    this._we(this.add.text(CT_X + 4 + hw / 2, CT_Y + 33, 'LOOP A', {
      fontFamily: 'Courier New', fontSize: '9px', color: '#00e5ff'
    }).setOrigin(0.5, 0));
    this._we(this.add.text(CT_X + 6 + hw + hw / 2, CT_Y + 33, 'LOOP B', {
      fontFamily: 'Courier New', fontSize: '9px', color: '#ff4081'
    }).setOrigin(0.5, 0));
    cfg.loopA.forEach((line, i) =>
      this._renderCodeLine(line, CT_X + 6, CT_Y + 46 + i * 18, '10px'));
    cfg.loopB.forEach((line, i) =>
      this._renderCodeLine(line, CT_X + 8 + hw, CT_Y + 46 + i * 18, '10px'));
  }

  _renderCodeLine(line, x, y, size) {
    let cx = x;
    this._tokenize(line).forEach(tok => {
      const t = this._we(this.add.text(cx, y, tok.text, {
        fontFamily: 'Courier New', fontSize: size || '12px', color: TC[tok.type] || TC.default
      }));
      cx += t.width;
    });
  }

  _tokenize(line) {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '/' && line[i + 1] === '/') {
        tokens.push({ text: line.slice(i), type: 'comment' }); break;
      }
      if (line[i] === '"') {
        let s = '"'; i++;
        while (i < line.length && line[i] !== '"') s += line[i++];
        if (i < line.length) s += line[i++];
        tokens.push({ text: s, type: 'string' }); continue;
      }
      if (line[i] === ' ' || line[i] === '\t') {
        let ws = '';
        while (i < line.length && (line[i] === ' ' || line[i] === '\t')) ws += line[i++];
        tokens.push({ text: ws, type: 'default' }); continue;
      }
      if (line[i] === '.') {
        const m = line.slice(i).match(/^\.(println?|length)\b/);
        if (m) { tokens.push({ text: m[0], type: 'method' }); i += m[0].length; continue; }
      }
      if (/[0-9]/.test(line[i])) {
        let n = '';
        while (i < line.length && /[0-9]/.test(line[i])) n += line[i++];
        tokens.push({ text: n, type: 'number' }); continue;
      }
      if (/[a-zA-Z_]/.test(line[i])) {
        let id = '';
        while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) id += line[i++];
        const type = KW.has(id) ? 'keyword' : (id.length <= 2 && /^[a-z]/.test(id)) ? 'variable' : 'default';
        tokens.push({ text: id, type }); continue;
      }
      const two = line.slice(i, i + 2);
      if (['++','--','+=','-=','<=','>=','==','!='].includes(two)) {
        tokens.push({ text: two, type: 'operator' }); i += 2; continue;
      }
      if ('<>=+*/-!'.includes(line[i])) {
        tokens.push({ text: line[i], type: 'operator' }); i++; continue;
      }
      tokens.push({ text: line[i], type: '(){};,'.includes(line[i]) ? 'punct' : 'default' });
      i++;
    }
    return tokens;
  }

  /* ─ MCQ (predict_output) ────────────────────────────────── */
  _renderMCQ(cfg) {
    const BW = 148, BH = 46, gap = 8;
    cfg.options.forEach((opt, idx) => {
      const bx = AZ_X + 14 + (idx % 2) * (BW + gap);
      const by = AZ_Y + 100 + Math.floor(idx / 2) * (BH + gap);
      this._btn(bx, by, BW, BH, opt, '#00e5ff', 0x001a1a, () => {
        if (!this._waveAnswered) this._onAnswer(idx === cfg.correctIndex, cfg);
      });
    });
  }

  /* ─ fix_bug ─────────────────────────────────────────────── */
  _renderFixBug(cfg) {
    const BW = AZ_W - 24, BH = 44;
    cfg.fixes.forEach((fix, idx) => {
      this._btn(AZ_X + 12, AZ_Y + 96 + idx * (BH + 8), BW, BH, fix, '#ffd740', 0x110e00, () => {
        if (!this._waveAnswered) this._onAnswer(idx === cfg.correctFixIndex, cfg);
      });
    });
  }

  /* ─ iteration_count number pad ──────────────────────────── */
  _renderNumberPad(cfg) {
    const dispY = AZ_Y + 92;
    const dg = this._we(this.add.graphics());
    dg.fillStyle(0x000814, 1); dg.fillRoundedRect(AZ_X + 12, dispY, AZ_W - 24, 34, 4);
    dg.lineStyle(1, 0x00e5ff, 0.5); dg.strokeRoundedRect(AZ_X + 12, dispY, AZ_W - 24, 34, 4);
    this._inputTxt = this._we(this.add.text(AZ_X + AZ_W / 2, dispY + 17, '?', {
      fontFamily: 'Courier New', fontSize: '20px', color: '#00e5ff', fontStyle: 'bold'
    }).setOrigin(0.5));

    const BW = 52, BH = 40, padY = dispY + 44;
    const keys = ['7','8','9','4','5','6','1','2','3','←','0','✓'];
    keys.forEach((k, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const bx = AZ_X + 12 + col * (BW + 4);
      const by = padY + row * (BH + 4);
      const tc = k === '✓' ? '#00e676' : k === '←' ? '#ff8a65' : '#e0e0e0';
      const bg = k === '✓' ? 0x003300 : k === '←' ? 0x1a0800 : 0x0d1b30;
      this._btn(bx, by, BW, BH, k, tc, bg, () => {
        if (this._waveAnswered) return;
        if (k === '←') {
          this._inputStr = this._inputStr.slice(0, -1);
          if (this._inputTxt) this._inputTxt.setText(this._inputStr || '?');
        } else if (k === '✓') {
          const ans = parseInt(this._inputStr);
          if (!isNaN(ans)) this._onAnswer(ans === cfg.correctAnswer, cfg);
        } else if (this._inputStr.length < 3) {
          this._inputStr += k;
          if (this._inputTxt) this._inputTxt.setText(this._inputStr);
        }
      });
    });
  }

  /* ─ execution_order ─────────────────────────────────────── */
  _renderExecOrder(cfg) {
    const hasExclude = cfg.excludeCard !== undefined;
    const poolIndices = cfg.cards.map((_, i) => i).filter(i => !hasExclude || i !== cfg.excludeCard);
    const numSlots = cfg.correctOrder.length;
    const CW = 138, CH = 38, gap = 6;
    const poolX = AZ_X + 10, slotX = AZ_X + 172;
    const startY = AZ_Y + (hasExclude ? 84 : 72);

    // Excluded card (grayed, pre-placed)
    if (hasExclude) {
      const eg = this._we(this.add.graphics());
      eg.fillStyle(0x1a1a2e, 0.7); eg.fillRoundedRect(poolX, AZ_Y + 30, CW, CH - 4, 4);
      eg.lineStyle(1, 0x37474f, 0.5); eg.strokeRoundedRect(poolX, AZ_Y + 30, CW, CH - 4, 4);
      this._we(this.add.text(poolX + CW / 2, AZ_Y + 30 + (CH - 4) / 2,
        cfg.cards[cfg.excludeCard], { fontFamily: 'Courier New', fontSize: '9px', color: '#37474f' }
      ).setOrigin(0.5));
      this._we(this.add.text(poolX + CW - 6, AZ_Y + 32, '✓', {
        fontFamily: 'Arial', fontSize: '11px', color: '#546e7a'
      }).setOrigin(1, 0));
    }

    const ordinals = ['1st','2nd','3rd','4th'];
    this._slotContents = new Array(numSlots).fill(null);
    this._slotEls = [];

    for (let s = 0; s < numSlots; s++) {
      const sy = startY + s * (CH + gap);
      this._we(this.add.text(slotX - 4, sy + CH / 2, ordinals[s], {
        fontFamily: 'Courier New', fontSize: '9px', color: '#546e7a'
      }).setOrigin(1, 0.5));

      const sg = this._we(this.add.graphics());
      sg.fillStyle(0x0d1b30, 0.9); sg.fillRoundedRect(slotX, sy, CW, CH, 4);
      sg.lineStyle(1, 0x1e3a5f, 1); sg.strokeRoundedRect(slotX, sy, CW, CH, 4);

      const stxt = this._we(this.add.text(slotX + CW / 2, sy + CH / 2, '—', {
        fontFamily: 'Courier New', fontSize: '10px', color: '#37474f'
      }).setOrigin(0.5));

      const zone = this._we(this.add.zone(slotX, sy, CW, CH).setOrigin(0).setInteractive());
      const slotIdx = s;
      zone.on('pointerdown', () => {
        if (this._waveAnswered) return;
        if (this._slotContents[slotIdx] !== null) {
          const retIdx = this._slotContents[slotIdx];
          this._slotContents[slotIdx] = null;
          stxt.setText('—').setColor('#37474f');
          sg.clear(); sg.fillStyle(0x0d1b30, 0.9); sg.fillRoundedRect(slotX, sy, CW, CH, 4);
          sg.lineStyle(1, 0x1e3a5f, 1); sg.strokeRoundedRect(slotX, sy, CW, CH, 4);
          const pEl = this._poolEls.find(p => p && p.cardIdx === retIdx);
          if (pEl) { pEl.bg.setAlpha(1); pEl.txt.setAlpha(1); pEl.zone.setInteractive(); this._restorePoolCard(pEl, cfg); }
          this._checkSubmit(cfg);
        } else if (this._selCardIdx !== null) {
          const cardIdx = this._selCardIdx;
          this._slotContents[slotIdx] = cardIdx;
          this._selCardIdx = null;
          const clr = cfg.cardColors[cardIdx];
          const hex = '#' + clr.toString(16).padStart(6, '0');
          stxt.setText(cfg.cards[cardIdx]).setColor(hex);
          sg.clear(); sg.fillStyle(clr, 0.12); sg.fillRoundedRect(slotX, sy, CW, CH, 4);
          sg.lineStyle(1, clr, 0.55); sg.strokeRoundedRect(slotX, sy, CW, CH, 4);
          const pEl = this._poolEls.find(p => p && p.cardIdx === cardIdx);
          if (pEl) { pEl.bg.setAlpha(0.15); pEl.txt.setAlpha(0.15); pEl.zone.disableInteractive(); }
          this._checkSubmit(cfg);
        }
      });
      this._slotEls.push({ sg, stxt, zone, sy });
    }

    // Pool cards
    this._poolEls = [];
    poolIndices.forEach((cardIdx, i) => {
      const py = startY + i * (CH + gap);
      const clr = cfg.cardColors[cardIdx];
      const hex = '#' + clr.toString(16).padStart(6, '0');
      const bg = this._we(this.add.graphics());
      bg.fillStyle(clr, 0.15); bg.fillRoundedRect(poolX, py, CW, CH, 4);
      bg.lineStyle(1, clr, 0.6); bg.strokeRoundedRect(poolX, py, CW, CH, 4);
      const txt = this._we(this.add.text(poolX + CW / 2, py + CH / 2, cfg.cards[cardIdx], {
        fontFamily: 'Courier New', fontSize: '10px', color: hex
      }).setOrigin(0.5));
      const zone = this._we(this.add.zone(poolX, py, CW, CH).setOrigin(0).setInteractive());
      const pEl = { bg, txt, zone, cardIdx, py, poolX, CW, CH, clr };
      this._poolEls.push(pEl);
      zone.on('pointerdown', () => {
        if (this._waveAnswered) return;
        if (this._selCardIdx === cardIdx) {
          this._selCardIdx = null;
          this._restorePoolCard(pEl, cfg);
        } else {
          if (this._selCardIdx !== null) {
            const prev = this._poolEls.find(p => p && p.cardIdx === this._selCardIdx);
            if (prev) this._restorePoolCard(prev, cfg);
          }
          this._selCardIdx = cardIdx;
          bg.clear(); bg.fillStyle(clr, 0.4); bg.fillRoundedRect(poolX, py, CW, CH, 4);
          bg.lineStyle(2, clr, 1); bg.strokeRoundedRect(poolX, py, CW, CH, 4);
        }
      });
    });
  }

  _restorePoolCard(pEl, cfg) {
    const { bg, poolX, py, CW, CH, clr } = pEl;
    bg.clear();
    bg.fillStyle(clr, 0.15); bg.fillRoundedRect(poolX, py, CW, CH, 4);
    bg.lineStyle(1, clr, 0.6); bg.strokeRoundedRect(poolX, py, CW, CH, 4);
  }

  _checkSubmit(cfg) {
    const allFilled = this._slotContents.every(s => s !== null);
    const existing = this._waveEls.find(el => el && el.active && el.__isSubmit);
    if (allFilled && !existing) {
      const z = this._we(this.add.zone(AZ_X + 12, AZ_Y + AZ_H - 48, AZ_W - 24, 36).setOrigin(0).setInteractive());
      z.__isSubmit = true;
      const bg = this._we(this.add.graphics());
      bg.fillStyle(0x003300, 1); bg.fillRoundedRect(AZ_X + 12, AZ_Y + AZ_H - 48, AZ_W - 24, 36, 5);
      bg.lineStyle(1.5, 0x00e676, 0.8); bg.strokeRoundedRect(AZ_X + 12, AZ_Y + AZ_H - 48, AZ_W - 24, 36, 5);
      this._we(this.add.text(AZ_X + AZ_W / 2, AZ_Y + AZ_H - 30, 'SUBMIT ORDER ▶', {
        fontFamily: 'Courier New', fontSize: '12px', color: '#00e676', fontStyle: 'bold'
      }).setOrigin(0.5));
      z.on('pointerdown', () => {
        if (this._waveAnswered) return;
        const correct = this._slotContents.every((c, i) => c === cfg.correctOrder[i]);
        this._onAnswer(correct, cfg);
      });
    }
  }

  /* ─ loop_compare buttons ───────────────────────────────── */
  _renderCompareButtons(cfg) {
    const BW = 148, BH = 52;
    cfg.options.forEach((opt, idx) => {
      const bx = AZ_X + 14 + idx * (BW + 10);
      const tc = opt === 'SAME' ? '#00e676' : '#f44336';
      const bg = opt === 'SAME' ? 0x003300 : 0x1a0000;
      this._btn(bx, AZ_Y + 100, BW, BH, opt, tc, bg, () => {
        if (!this._waveAnswered) this._onAnswer(idx === cfg.correctIndex, cfg);
      });
    });
  }

  /* ── Button factory ─────────────────────────────────────── */
  _btn(x, y, w, h, label, textColor, bgColor, onClick) {
    const g = this._we(this.add.graphics());
    g.fillStyle(bgColor !== undefined ? bgColor : 0x0d1b30, 1);
    g.fillRoundedRect(x, y, w, h, 5);
    const hexNum = parseInt(textColor.replace('#', ''), 16);
    g.lineStyle(1.5, hexNum, 0.55);
    g.strokeRoundedRect(x, y, w, h, 5);
    const t = this._we(this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'Courier New', fontSize: '11px', color: textColor, align: 'center',
      wordWrap: { width: w - 10 }
    }).setOrigin(0.5));
    const zone = this._we(this.add.zone(x, y, w, h).setOrigin(0).setInteractive());
    zone.on('pointerover', () => {
      g.clear(); g.fillStyle(bgColor !== undefined ? bgColor : 0x0d1b30, 1);
      g.fillRoundedRect(x, y, w, h, 5);
      g.lineStyle(2, hexNum, 1); g.strokeRoundedRect(x, y, w, h, 5);
      t.setScale(1.05);
    });
    zone.on('pointerout', () => {
      g.clear(); g.fillStyle(bgColor !== undefined ? bgColor : 0x0d1b30, 1);
      g.fillRoundedRect(x, y, w, h, 5);
      g.lineStyle(1.5, hexNum, 0.55); g.strokeRoundedRect(x, y, w, h, 5);
      t.setScale(1);
    });
    zone.on('pointerdown', onClick);
    return zone;
  }

  /* ── Answer handling ────────────────────────────────────── */
  async _onAnswer(isCorrect, cfg) {
    if (this._waveAnswered) return;
    this._waveAnswered = true;
    if (this._droneTween) { this._droneTween.stop(); this._droneTween = null; }
    if (this._droneSway) { this._droneSway.stop(); this._droneSway = null; }
    this._drawTimerBar(0);

    const elapsed = this.time.now - this._waveStartTime;
    const timePct = Math.max(0, 1 - elapsed / this._curTimeLimit);

    if (isCorrect) {
      this.correctCount++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const multi = this.combo >= 5 ? 3.0 : this.combo >= 3 ? 2.0 : this.combo >= 2 ? 1.5 : 1.0;
      const speed = timePct > 0.7 ? 50 : 0;
      const pts = Math.round((100 + speed) * multi);
      this.score += pts;
      this._hudScoreTxt.setText(`${this.score}`);
      this._hudComboTxt.setText(`×${multi % 1 === 0 ? multi | 0 : multi}`).setColor('#ffd740');
      this._flashRect(CT_X, CT_Y, CT_W, CT_H, 0x00e676);
      this._floatText(PL_X, PL_Y - 62, `+${pts}`, '#00e676');
      if (speed > 0) this._floatText(PL_X, PL_Y - 82, 'SPEED BONUS!', '#ffd740');
      this._playerPunch();
      await this._delay(200);
      await this._destroyDrone();
    } else {
      this.combo = 0;
      this._hudComboTxt.setText('×1').setColor('#00e5ff');
      this._flashRect(CT_X, CT_Y, CT_W, CT_H, 0xf44336);
      await this._droneFiresAtPlayer();
      this._loseLife();
      if (this.lives <= 0) { this._gameOver(); return; }
      await this._showBitFeedback(cfg.concept);
    }
    await this._delay(320);
    this.startWave(this.currentWave + 1);
  }

  async _droneReachesPlayer() {
    if (this._waveAnswered) return;
    this._waveAnswered = true;
    if (this._droneSway) { this._droneSway.stop(); this._droneSway = null; }
    await this._droneFiresAtPlayer();
    this._loseLife();
    if (this.lives <= 0) { this._gameOver(); return; }
    const cfg = WAVES[this.currentWave];
    await this._showBitFeedback(cfg.concept);
    await this._delay(320);
    this.startWave(this.currentWave + 1);
  }

  /* ── Animations ─────────────────────────────────────────── */
  _flashRect(x, y, w, h, color) {
    const fl = this.add.graphics().setDepth(80);
    fl.fillStyle(color, 0.15); fl.fillRoundedRect(x, y, w, h, 6);
    this.tweens.add({ targets: fl, alpha: 0, duration: 380, onComplete: () => fl.destroy() });
  }

  _playerPunch() {
    if (!this._playerCont) return;
    this.tweens.add({ targets: this._playerCont, x: PL_X + 16, duration: 80, yoyo: true, ease: 'Power2' });
  }

  _playerStumble() {
    if (!this._playerCont) return;
    this.tweens.add({ targets: this._playerCont, angle: 18, duration: 120, yoyo: true, ease: 'Bounce' });
    this.cameras.main.shake(250, 0.008);
  }

  _destroyDrone() {
    return new Promise(resolve => {
      if (!this._drone || !this._drone.active) { resolve(); return; }
      const dx = this._drone.x, dy = this._drone.y;
      const bolt = this.add.graphics().setDepth(90);
      bolt.fillStyle(0x00e5ff, 1); bolt.fillRect(-3, -3, 6, 6);
      bolt.setPosition(PL_X, PL_Y - 32);
      this.tweens.add({
        targets: bolt, x: dx, y: dy, duration: 140,
        onComplete: () => {
          bolt.destroy();
          try {
            const ps = this.add.particles(dx, dy, 'p17', {
              speed: { min: 70, max: 220 }, lifespan: 420,
              scale: { start: 1.2, end: 0 },
              tint: [0xf44336, 0xff8a65, 0xffd740], quantity: 18
            });
            this.time.delayedCall(500, () => { if (ps.active) ps.destroy(); });
          } catch (e) {}
          if (this._drone && this._drone.active) this._drone.destroy();
          this._drone = null;
          this._floatText(dx, dy - 18, 'DESTROYED!', '#ffd740');
          resolve();
        }
      });
    });
  }

  _droneFiresAtPlayer() {
    return new Promise(resolve => {
      if (!this._drone || !this._drone.active) { this._playerStumble(); resolve(); return; }
      const dx = this._drone.x, dy = this._drone.y;
      const bolt = this.add.graphics().setDepth(90);
      bolt.fillStyle(0xf44336, 1); bolt.fillCircle(0, 0, 5);
      bolt.setPosition(dx, dy);
      this.tweens.add({
        targets: bolt, x: PL_X, y: PL_Y - 22, duration: 200,
        onComplete: () => {
          bolt.destroy();
          this._playerStumble();
          this._flashRect(0, 0, W, H, 0xf44336);
          resolve();
        }
      });
    });
  }

  _floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Arial Black', fontSize: '16px', color
    }).setOrigin(0.5).setDepth(150);
    this.tweens.add({ targets: t, y: y - 44, alpha: 0, duration: 880, onComplete: () => t.destroy() });
  }

  _loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this._hudLifeGfx.forEach((g, i) =>
      this._drawShield(g, 565 + i * 24, 16, 0xff4081, i < this.lives ? 1 : 0));
  }

  /* ── Bit feedback ────────────────────────────────────────── */
  _showBitFeedback(concept) {
    return new Promise(resolve => {
      if (this._bitBubble && this._bitBubble.active) this._bitBubble.destroy();
      if (this._bitBubbleTxt && this._bitBubbleTxt.active) this._bitBubbleTxt.destroy();
      if (this._bitTimer) { this._bitTimer.remove(); this._bitTimer = null; }

      const msg = BIT_FB[concept] || 'Check your loop logic!';
      const bx = W - 100, by = 420;
      this._bitCont.setPosition(W + 80, 470);
      this.tweens.add({ targets: this._bitCont, x: bx, duration: 260, ease: 'Back.Out' });

      const tw = Math.min(msg.length * 7 + 24, 240);
      const bubX = bx - tw - 10, bubY = by - 70;
      const lines = Math.ceil(msg.length / 30);
      const th = lines * 18 + 18;

      const bg = this.add.graphics().setDepth(162);
      bg.fillStyle(0xffffff, 0.97); bg.fillRoundedRect(bubX, bubY, tw, th, 6);
      bg.fillStyle(0xffffff, 0.97);
      bg.fillTriangle(bx - 10, bubY + th, bx + 2, bubY + th + 10, bx + 2, bubY + th);
      this._bitBubble = bg;

      const txt = this.add.text(bubX + 8, bubY + 7, msg, {
        fontFamily: 'Arial', fontSize: '11px', color: '#1a1a2e',
        wordWrap: { width: tw - 16 }
      }).setDepth(163);
      this._bitBubbleTxt = txt;

      const dismiss = () => {
        if (this._bitTimer) { this._bitTimer.remove(); this._bitTimer = null; }
        if (bg.active) bg.destroy();
        if (txt.active) txt.destroy();
        this._bitBubble = null; this._bitBubbleTxt = null;
        this.tweens.add({ targets: this._bitCont, x: W + 80, duration: 200, onComplete: () => resolve() });
      };
      this._bitTimer = this.time.delayedCall(2600, dismiss);
      this.input.once('pointerdown', () => { if (this._bitTimer) dismiss(); });
    });
  }

  /* ── End states ──────────────────────────────────────────── */
  _gameOver() {
    this._clearWave();
    const ov = this.add.graphics().setDepth(200);
    ov.fillStyle(0x000000, 0.88); ov.fillRect(0, 0, W, H);
    this.add.text(W / 2, 155, 'GAME OVER', {
      fontFamily: 'Arial Black', fontSize: '44px', color: '#f44336'
    }).setOrigin(0.5).setDepth(201);
    this.add.text(W / 2, 218, `Score: ${this.score}   •   Wave ${this.currentWave + 1} / 15`, {
      fontFamily: 'Courier New', fontSize: '15px', color: '#e0e0e0'
    }).setOrigin(0.5).setDepth(201);
    this._endButtons(288);
  }

  _levelComplete() {
    this._clearWave();
    const acc = Math.round((this.correctCount / WAVES.length) * 100);
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : 1;

    for (let i = 0; i < 28; i++) {
      this.time.delayedCall(i * 45, () => {
        try {
          const ps = this.add.particles(Phaser.Math.Between(60, W - 60), -10, 'p17', {
            speedY: { min: 130, max: 270 }, lifespan: 1100,
            tint: [0x00e5ff, 0xffd740, 0xff4081, 0x00e676], quantity: 3
          });
          this.time.delayedCall(1200, () => { if (ps.active) ps.destroy(); });
        } catch (e) {}
      });
    }

    const ov = this.add.graphics().setDepth(200);
    ov.fillStyle(0x000814, 0.93); ov.fillRect(0, 0, W, H);
    ov.lineStyle(2, 0x14b8a6, 0.75); ov.strokeRoundedRect(W / 2 - 205, 60, 410, 445, 12);

    this.add.text(W / 2, 108, 'ITERATION ARENA', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#14b8a6', letterSpacing: 3
    }).setOrigin(0.5).setDepth(201);
    this.add.text(W / 2, 138, 'COMPLETE!', {
      fontFamily: 'Arial Black', fontSize: '38px', color: '#ffd740'
    }).setOrigin(0.5).setDepth(201);

    for (let s = 0; s < 3; s++) {
      this.add.text(W / 2 + (s - 1) * 54, 185, '★', {
        fontFamily: 'Arial', fontSize: '40px', color: s < stars ? '#ffd740' : '#37474f'
      }).setOrigin(0.5).setDepth(201);
    }

    const sy = 242;
    [['Accuracy', `${acc}%`], ['Score', `${this.score}`],
     ['Best Combo', `×${this.maxCombo}`], ['Waves Cleared', `${this.correctCount} / ${WAVES.length}`]
    ].forEach(([lbl, val], i) => {
      this.add.text(W / 2 - 115, sy + i * 30, lbl, {
        fontFamily: 'Courier New', fontSize: '13px', color: '#90caf9'
      }).setDepth(201);
      this.add.text(W / 2 + 115, sy + i * 30, val, {
        fontFamily: 'Courier New', fontSize: '13px', color: '#ffd740', align: 'right'
      }).setOrigin(1, 0).setDepth(201);
    });

    this.add.text(W / 2, sy + 4 * 30 + 14, '🔁  Loop Detective badge earned!', {
      fontFamily: 'Arial', fontSize: '13px', color: '#14b8a6'
    }).setOrigin(0.5).setDepth(201);

    // Save progress and unlock badge
    try { GameManager.completeLevel(16, acc); } catch (e) {}
    try { BadgeSystem.unlock('loop_detective'); } catch (e) {}

    this._endButtons(sy + 4 * 30 + 52);
  }

  _endButtons(y) {
    // Retry
    const rg = this.add.graphics().setDepth(201);
    rg.fillStyle(0x1a0000); rg.fillRoundedRect(W / 2 - 115, y, 100, 40, 6);
    rg.lineStyle(1.5, 0xf44336, 0.7); rg.strokeRoundedRect(W / 2 - 115, y, 100, 40, 6);
    this.add.text(W / 2 - 65, y + 20, 'RETRY', {
      fontFamily: 'Courier New', fontSize: '14px', color: '#f44336'
    }).setOrigin(0.5).setDepth(202);
    this.add.zone(W / 2 - 115, y, 100, 40).setOrigin(0).setInteractive().setDepth(202)
      .on('pointerdown', () => this.scene.restart());

    // Menu
    const mg = this.add.graphics().setDepth(201);
    mg.fillStyle(0x001a1a); mg.fillRoundedRect(W / 2 + 15, y, 100, 40, 6);
    mg.lineStyle(1.5, 0x14b8a6, 0.7); mg.strokeRoundedRect(W / 2 + 15, y, 100, 40, 6);
    this.add.text(W / 2 + 65, y + 20, 'MENU', {
      fontFamily: 'Courier New', fontSize: '14px', color: '#14b8a6'
    }).setOrigin(0.5).setDepth(202);
    this.add.zone(W / 2 + 15, y, 100, 40).setOrigin(0).setInteractive().setDepth(202)
      .on('pointerdown', () => this.scene.start('MenuScene'));
  }

  /* ── Utilities ───────────────────────────────────────────── */
  _delay(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }
}
