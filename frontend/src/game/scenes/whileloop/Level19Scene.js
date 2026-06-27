/**
 * Level19Scene — Power Core Charger (Accretion Phase — While Loops)
 * Canvas: 800×600
 */
import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

/* ── Canvas ──────────────────────────────────────────────────────────────── */
const W = 800, H = 600;

/* ── Core geometry (scaled from spec 1280×720 → 800×600) ─────────────────── */
const CORE_X = 355, CORE_Y = 265;
const CORE_W = 128, CORE_H = 196;
const CORE_L = CORE_X - CORE_W / 2;  // 291
const CORE_T = CORE_Y - CORE_H / 2;  // 167
const CORE_R = CORE_X + CORE_W / 2;  // 419
const CORE_B = CORE_Y + CORE_H / 2;  // 363
const CHAM_W = 104, CHAM_H = 156;
const CHAM_L = CORE_X - CHAM_W / 2;  // 303
const CHAM_T = CORE_T + 22;          // 189
const CHAM_B = CHAM_T + CHAM_H;      // 345
const FILL_W = CHAM_W - 6;           // 98
const FILL_BOTY = CHAM_B - 3;        // 342
const FILL_MAXH = CHAM_H - 6;        // 150

/* ── HUD & Monitor ───────────────────────────────────────────────────────── */
const HUD_H = 55;
const MON_W = 390, MON_H = 40, MON_X = (W - MON_W) / 2, MON_Y = 8;

/* ── Variable panel (right of core) ─────────────────────────────────────── */
const VP_X = 448, VP_Y = 214, VP_W = 150, VP_H = 110;

/* ── LED indicators (left of core) ──────────────────────────────────────── */
const LED_X = CORE_L - 14;
const LED_YS = [CORE_T + 32, CORE_T + 72, CORE_T + 112, CORE_T + 150];

/* ── Floor / Bit ─────────────────────────────────────────────────────────── */
const FLOOR_Y = 450;
const BIT_HIDE_X = 820, BIT_SHOW_X = 700, BIT_Y = 370;

/* ── Colour helpers ──────────────────────────────────────────────────────── */
const C = {
  kw: '#ff4081', cond: '#ffd740', body: '#00e5ff',
  punct: '#78909c', pos: '#00e676', neg: '#f44336',
  white: '#ffffff', dim: '#546e7a', text: '#e0e0e0',
  bg: 0x0a0e13, panel: 0x0d1117, panel2: 0x1a1a2e,
};

/* ── Rounds ─────────────────────────────────────────────────────────────── */
const ROUNDS = [
  { round:1, mission:'Charge the core to full. Starts at 0%, gaining 25% per cycle.',
    startCharge:0, blanks:['condition_value'],
    correctValues:{ condition_op:'<', condition_value:100, body_op:'+=', body_amount:25 },
    options:{ condition_value:[50, 100, 200] },
    prefilledDisplay:{ body:'charge += 25' }, conditionTemplate:'charge < [?]' },

  { round:2, mission:'Charge from 30%. Choose the right charge amount per cycle.',
    startCharge:30, blanks:['body_amount'],
    correctValues:{ condition_op:'<', condition_value:100, body_op:'+=', body_amount:10 },
    options:{ body_amount:[5, 10, 20] },
    prefilledDisplay:{ condition:'charge < 100' }, bodyTemplate:'charge += [?]' },

  { round:3, mission:'Charge from 0% at some rate. Configure both the target and the charge rate.',
    startCharge:0, blanks:['condition_value','body_amount'],
    correctValues:{ condition_op:'<', condition_value:100, body_op:'+=', body_amount:20 },
    options:{ condition_value:[80,100,120], body_amount:[10,20,30] },
    prefilledDisplay:{}, conditionTemplate:'charge < [?]', bodyTemplate:'charge += [?]' },

  { round:4, mission:'DRAIN the core! Start at 100%, remove energy each cycle until empty.',
    startCharge:100, blanks:['condition_full','body_full'],
    correctValues:{ condition_op:'>', condition_value:0, body_op:'-=', body_amount:15 },
    options:{
      condition_full:['charge > 0','charge < 0','charge >= 10'],
      body_full:['charge -= 15','charge -= 10','charge += 15']
    }, prefilledDisplay:{} },

  { round:5, mission:'Core at 60%. Adds 10% per cycle. Pick the right comparison operator.',
    startCharge:60, blanks:['condition_op'],
    correctValues:{ condition_op:'<', condition_value:100, body_op:'+=', body_amount:10 },
    options:{ condition_op:['<','<=','!=','>='] },
    prefilledDisplay:{ body:'charge += 10', condition_value:'100' },
    conditionTemplate:'charge [?] 100' },

  { round:6, mission:'Core at 200%. Cool it down to 50% or below. Set the condition and drain rate.',
    startCharge:200, blanks:['condition_full','body_full'],
    correctValues:{ condition_op:'>', condition_value:50, body_op:'-=', body_amount:30 },
    options:{
      condition_full:['charge > 50','charge >= 50','charge > 0'],
      body_full:['charge -= 30','charge -= 20','charge += 30']
    }, prefilledDisplay:{} },

  { round:7, mission:'DANGER! Which loop would cause an INFINITE LOOP? Pick the dangerous one.',
    startCharge:50, isSpecialRound:true, type:'infinite_loop_detection',
    cards:[
      { label:'A', code:'while(charge < 100) { charge += 10; }', isInfinite:false },
      { label:'B', code:'while(charge < 100) { charge -= 10; }', isInfinite:true },
      { label:'C', code:'while(charge > 0) { charge -= 20; }', isInfinite:false }
    ], correctIndex:1 },

  { round:8, mission:'Core at 0%. Charges 35% per cycle. Stop when charge reaches at least 90%.',
    startCharge:0, blanks:['condition_value'],
    correctValues:{ condition_op:'<', condition_value:90, body_op:'+=', body_amount:35 },
    options:{ condition_value:[90,100,70] },
    prefilledDisplay:{ body:'charge += 35' }, conditionTemplate:'charge < [?]' },

  { round:9, mission:'Two cores! Core A: 20% start, +25/cycle. Core B: 50% start, +10/cycle. Which fills first?',
    isSpecialRound:true, type:'comparison',
    coreA:{ start:20, increment:25 },
    coreB:{ start:50, increment:10 },
    correctAnswer:'A', options:['A','B'] },

  { round:10, mission:'Core at 10%. Charges 17% per cycle until ≥ 100%. What is the FINAL charge value?',
    startCharge:10, isSpecialRound:true, type:'predict_final',
    correctAnswer:112, options:[95, 112, 100, 78] },
];

const FEEDBACK = {
  wrong_condition:'The condition controls WHEN the loop stops. "charge < 100" means keep going while charge is below 100.',
  wrong_body:'The body runs every cycle. charge += 10 adds 10, charge -= 10 removes 10. Match the direction!',
  infinite_loop:'INFINITE LOOP! The body moves charge AWAY from the target. If checking charge < 100, charge must INCREASE!',
  wrong_threshold:'The condition is checked BEFORE each cycle. When false, the body already passed your target.',
  wrong_direction:'Charge is going the wrong way! To charge UP use +=, to drain DOWN use -=.',
  overshoot:'The charge overshot the target. With charge < 90 and +=35: 0→35→70→105. It lands at 105, not 90!',
  wrong_operator:'"<" stops BEFORE the value. "<=" includes it. "!=" stops when equal. Pick the right boundary!',
  comparison_wrong:'Count cycles: Core A needs (100-20)/25 = ~4 cycles, Core B needs (100-50)/10 = 5 cycles.',
  predict_wrong:'Trace: 10+17=27, 27+17=44, 44+17=61, 61+17=78, 78+17=95, 95+17=112. Loop exits at 112.',
};

/* ══════════════════════════════════════════════════════════════════════════
   Scene
══════════════════════════════════════════════════════════════════════════ */
export class Level19Scene extends Phaser.Scene {
  constructor() { super({ key: 'Level19Scene' }); }

  init() {
    this.currentRound = 0;
    this.totalScore = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.roundResults = [];
    this.playerAnswers = {};
    this._chargePercent = 0;
    this._running = false;
    this._interactLocked = false;
    this._dust = [];
    this._roundEls = [];
    this._ledLit = [false,false,false,false];
    this._roundStartTime = 0;
    this._levelStartTime = 0;
  }

  preload() {}

  create() {
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this._levelStartTime = Date.now();

    // Generate particle texture
    const pg = this.make.graphics({ add:false });
    pg.fillStyle(0xffffff); pg.fillCircle(3,3,3);
    pg.generateTexture('p19', 6, 6); pg.destroy();

    this._createBg();
    this._createFloor();
    this._createPipes();
    this._createSigns();
    this._createDust();
    this._createCore();
    this._createHUD();
    this._createMonitor();
    this._createVarPanel();
    this._createBit();
    this._checkTutorial();
  }

  update(time) {
    this._updateDust(time);
    this._updateWave(time);
  }

  /* ── Background ─────────────────────────────────────────────────────── */
  _createBg() {
    this.add.rectangle(W/2, H/2, W, H, 0x07090d);
  }

  _createFloor() {
    const g = this.add.graphics();
    for (let i = 0; i < 9; i++) {
      const y = FLOOR_Y + i * 18;
      g.fillStyle(i % 2 === 0 ? 0x12161c : 0x0e1218);
      g.fillRect(0, y, W, 18);
      g.lineStyle(1, 0x1a2a3a, 0.3);
      g.lineBetween(0, y, W, y);
    }
    // Grid lines on floor
    g.lineStyle(1, 0x1a2a3a, 0.1);
    for (let x = 0; x < W; x += 48) g.lineBetween(x, FLOOR_Y, x, H);
  }

  _createPipes() {
    const g = this.add.graphics();
    const pipeYs = [64, 76, 88];
    pipeYs.forEach((py, i) => {
      const h = [10, 8, 10][i];
      g.fillStyle(0x1a2a3a); g.fillRoundedRect(0, py, W, h, 4);
      g.lineStyle(1, 0x0f1520); g.strokeRoundedRect(0, py, W, h, 4);
    });
    // Energy glow pipe (second)
    const glowPipe = this.add.graphics();
    glowPipe.fillStyle(0xff8f00, 0.04); glowPipe.fillRoundedRect(2, 77, W-4, 5, 2);
    this.tweens.add({ targets: glowPipe, alpha: 0.12, duration: 3000, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    // Vertical connectors
    g.fillStyle(0x1a2a3a);
    [215, 600].forEach(vx => g.fillRect(vx, 76, 5, 38));
  }

  _createSigns() {
    const g = this.add.graphics();
    [[90,200],[650,280],[140,380],[700,340],[380,420]].forEach(([sx,sy]) => {
      g.fillStyle(0xffd740, 0.06);
      g.save();
      // Draw diamond (rotated square) using triangle pairs
      g.fillTriangle(sx, sy-10, sx+10, sy, sx, sy+10);
      g.fillTriangle(sx, sy-10, sx-10, sy, sx, sy+10);
      g.restore();
      this.add.text(sx, sy, '!', { fontFamily:'Arial', fontSize:'9px', color:'#ffd740' }).setOrigin(0.5).setAlpha(0.08);
    });
  }

  _createDust() {
    this._dust = [];
    for (let i = 0; i < 20; i++) {
      const c = this.add.circle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), 1, 0x4fc3f7
      ).setAlpha(Phaser.Math.FloatBetween(0.04, 0.08));
      c._idx = i;
      this._dust.push(c);
    }
  }

  _updateDust(time) {
    this._dust.forEach(d => {
      d.y += 0.1;
      d.x += Math.sin(time * 0.001 + d._idx) * 0.05;
      if (d.y > H + 4) { d.y = -4; d.x = Phaser.Math.Between(0, W); }
    });
  }

  /* ── Power Core ──────────────────────────────────────────────────────── */
  _createCore() {
    // Housing bg
    const g = this.add.graphics();
    g.fillStyle(0x0d1117); g.fillRoundedRect(CORE_L, CORE_T, CORE_W, CORE_H, 12);
    g.lineStyle(4, 0x2a3a4a); g.strokeRoundedRect(CORE_L, CORE_T, CORE_W, CORE_H, 12);
    // Corner bolts
    [[CORE_L+10, CORE_T+10],[CORE_R-10, CORE_T+10],[CORE_L+10, CORE_B-10],[CORE_R-10, CORE_B-10]].forEach(([bx,by]) => {
      g.fillStyle(0x2a3a4a); g.fillCircle(bx, by, 4);
      g.lineStyle(1, 0x3a4a5a); g.strokeCircle(bx, by, 4);
    });
    // Chamber
    g.fillStyle(0x050810); g.fillRoundedRect(CHAM_L, CHAM_T, CHAM_W, CHAM_H, 8);
    g.lineStyle(1, 0x1a2a3a); g.strokeRoundedRect(CHAM_L, CHAM_T, CHAM_W, CHAM_H, 8);

    // Ring decorations
    this._ringG = this.add.graphics();
    this._drawRings(0);

    // Fill glow behind (slightly wider, same color, low alpha)
    this._fillGlow = this.add.rectangle(
      CHAM_L + CHAM_W/2, FILL_BOTY, FILL_W + 4, 0, 0xf44336, 0.08
    ).setOrigin(0.5, 1).setDepth(1);

    // Energy fill bar
    this._fillBar = this.add.rectangle(
      CHAM_L + CHAM_W/2, FILL_BOTY, FILL_W, 0, 0xf44336
    ).setOrigin(0.5, 1).setDepth(2);

    // Wave line on fill top
    this._waveG = this.add.graphics().setDepth(3);
    this._waveOffset = 0;

    // Housing front frame (drawn on top to clip)
    const fg = this.add.graphics().setDepth(4);
    fg.fillStyle(0x0d1117, 0); // transparent fill to create border only
    fg.lineStyle(2, 0x2a3a4a);
    fg.strokeRoundedRect(CORE_L, CORE_T, CORE_W, CORE_H, 12);
    // Side panels (opaque strips that hide overflow)
    fg.fillStyle(0x0d1117);
    fg.fillRect(CORE_L, CORE_T, CHAM_L - CORE_L - 1, CORE_H);
    fg.fillRect(CHAM_L + CHAM_W + 1, CORE_T, CORE_R - (CHAM_L + CHAM_W) - 1, CORE_H);
    fg.fillRect(CORE_L, CORE_T, CORE_W, CHAM_T - CORE_T);
    fg.fillRect(CORE_L, CHAM_B, CORE_W, CORE_B - CHAM_B);

    // Percentage shadow
    this._pctShadow = this.add.text(CORE_X + 2, CORE_Y + 2, '0%', {
      fontFamily:'Courier New', fontSize:'34px', color:'#000000'
    }).setOrigin(0.5).setAlpha(0.3).setDepth(5);

    // Percentage text
    this._pctTxt = this.add.text(CORE_X, CORE_Y, '0%', {
      fontFamily:'Courier New', fontSize:'34px', color:'#ffffff', fontStyle:'bold'
    }).setOrigin(0.5).setAlpha(0.95).setDepth(6);

    // LEDs
    this._ledGlows = [];
    this._ledDots = [];
    LED_YS.forEach((ly, i) => {
      const glow = this.add.circle(LED_X, ly, 9, 0x00e676, 0.2).setDepth(4).setVisible(false);
      const dot = this.add.circle(LED_X, ly, 5, 0x1a1a2a).setDepth(5);
      dot.setStrokeStyle(1, 0x2a2a3a);
      this._ledGlows.push(glow);
      this._ledDots.push(dot);
    });
  }

  _drawRings(pct) {
    if (!this._ringG || !this._ringG.active) return;
    this._ringG.clear();
    const alpha = 0.1 + (pct / 100) * 0.3;
    const ry1 = CORE_T + CORE_H * 0.28;
    const ry2 = CORE_T + CORE_H * 0.72;
    this._ringG.lineStyle(2, 0x00e5ff, alpha);
    this._ringG.lineBetween(CORE_L + 8, ry1, CORE_R - 8, ry1);
    this._ringG.lineBetween(CORE_L + 8, ry2, CORE_R - 8, ry2);
  }

  _updateWave(time) {
    if (!this._fillBar || !this._fillBar.active) return;
    if (this._fillBar.height <= 0) { this._waveG.clear(); return; }
    const fillY = FILL_BOTY - this._fillBar.height;
    const fillX = CHAM_L + 3;
    const colHex = this._fillBar.fillColor;
    this._waveG.clear();
    this._waveG.lineStyle(1.5, colHex, 0.5);
    this._waveG.beginPath();
    this._waveG.moveTo(fillX, fillY + Math.sin(time * 0.003) * 2);
    for (let x = fillX; x <= fillX + FILL_W; x += 3) {
      this._waveG.lineTo(x, fillY + Math.sin(x * 0.08 + time * 0.003) * 2);
    }
    this._waveG.strokePath();
  }

  _fillColor(pct) {
    if (pct <= 30) return 0xf44336;
    if (pct <= 60) return 0xffd740;
    if (pct <= 90) return 0x00e5ff;
    return 0x00e676;
  }

  async _updateFill(targetPct, duration) {
    const clampedPct = Math.max(0, Math.min(200, targetPct));
    const targetH = Math.min((clampedPct / 100) * FILL_MAXH, FILL_MAXH);
    const color = this._fillColor(Math.min(clampedPct, 100));

    if (this._fillBar && this._fillBar.active) {
      this._fillBar.setFillStyle(color);
      this._fillGlow && this._fillGlow.active && this._fillGlow.setFillStyle(color);
      return new Promise(r => {
        this.tweens.add({
          targets: [this._fillBar, this._fillGlow],
          height: targetH,
          duration: duration || 400,
          ease: 'Cubic.easeOut',
          onComplete: () => r()
        });
      });
    }
    this._chargePercent = clampedPct;
    this._drawRings(clampedPct);
    return Promise.resolve();
  }

  async _updatePct(newVal) {
    this._chargePercent = newVal;
    this._drawRings(Math.min(newVal, 100));
    if (!this._pctTxt || !this._pctTxt.active) return;
    await new Promise(r => {
      this.tweens.add({
        targets: [this._pctTxt, this._pctShadow],
        scaleX: 0.8, scaleY: 0.8, alpha: 0,
        duration: 130, ease: 'Quad.easeIn',
        onComplete: () => {
          this._pctTxt.setText(newVal + '%');
          this._pctShadow.setText(newVal + '%');
          this._pctTxt.setAlpha(0).setScale(1.2);
          this._pctShadow.setAlpha(0).setScale(1.2);
          this.tweens.add({
            targets: [this._pctTxt, this._pctShadow],
            scaleX: 1, scaleY: 1, alpha: [0.95, 0.3],
            duration: 140, ease: 'Quad.easeOut',
            onComplete: () => r()
          });
        }
      });
    });
  }

  _checkLEDs(pct) {
    const thresholds = [25, 50, 75, 100];
    thresholds.forEach((thresh, i) => {
      if (pct >= thresh && !this._ledLit[i]) {
        this._ledLit[i] = true;
        this._lightLED(i);
      }
    });
  }

  _lightLED(i) {
    const dot = this._ledDots[i];
    const glow = this._ledGlows[i];
    if (!dot || !dot.active) return;
    dot.setFillStyle(0x00e676).setStrokeStyle(0);
    glow.setVisible(true).setScale(1);
    this.tweens.add({
      targets: glow, scaleX: 1.8, scaleY: 1.8, alpha: 0.4,
      duration: 150, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: glow, alpha: 0.2, duration: 400 });
      }
    });
  }

  _pulseRing(color) {
    const hexCol = parseInt(color.replace('#',''), 16);
    const g = this.add.graphics().setDepth(7);
    this.tweens.add({
      targets: { r: 18, a: 0.6, lw: 2 }, r: 90, a: 0, lw: 0.5,
      duration: 500, ease: 'Cubic.easeOut',
      onUpdate: t => {
        const v = t.targets[0];
        g.clear();
        g.lineStyle(v.lw, hexCol, v.a);
        g.strokeCircle(CORE_X, CORE_Y, v.r);
      },
      onComplete: () => g.destroy()
    });
  }

  _floatNum(amount, positive) {
    const txt = this.add.text(CORE_X, CORE_T + 20, (positive ? '+' : '-') + Math.abs(amount), {
      fontFamily:'Arial', fontSize:'18px', color: positive ? '#00e676' : '#f44336', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: txt, y: '-=40', alpha: 0, duration: 600, ease: 'Quad.easeOut', onComplete: () => txt.destroy() });
  }

  async _resetCore(startPct) {
    this._ledLit = [false,false,false,false];
    this._ledDots.forEach(d => { if (d.active) d.setFillStyle(0x1a1a2a).setStrokeStyle(1, 0x2a2a3a); });
    this._ledGlows.forEach(g => { if (g.active) g.setVisible(false); });
    if (this._fillBar) this._fillBar.setFillStyle(this._fillColor(startPct));
    await this._updateFill(startPct, 500);
    await this._updatePct(startPct);
  }

  _coreOverheat() {
    if (!this._fillBar || !this._fillBar.active) return;
    this._fillBar.setFillStyle(0xf44336);
    this.cameras.main.shake(800, 0.005);
    // Sparks
    for (let i = 0; i < 24; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const spd = Phaser.Math.FloatBetween(50, 120);
      const sp = this.add.circle(CORE_X, CORE_Y, 2, 0xff6600).setDepth(10);
      this.tweens.add({
        targets: sp,
        x: CORE_X + Math.cos(angle) * spd,
        y: CORE_Y + Math.sin(angle) * spd + 30,
        alpha: 0, duration: 600,
        onComplete: () => sp.destroy()
      });
    }
    const warn = this.add.text(CORE_X, CORE_T - 20, '⚠ OVERLOAD!', {
      fontFamily:'Arial', fontSize:'14px', color:'#f44336', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: warn, alpha: 0, duration: 300, yoyo:true, repeat:4, onComplete: () => warn.destroy() });
  }

  /* ── HUD ─────────────────────────────────────────────────────────────── */
  _createHUD() {
    const g = this.add.graphics().setDepth(30);
    g.fillStyle(0x0a0e13, 0.92); g.fillRect(0, 0, W, HUD_H);
    g.lineStyle(1, 0x1a2a3a); g.lineBetween(0, HUD_H, W, HUD_H);

    this.add.text(14, 10, 'POWER CORE CHARGER', { fontFamily:'Arial', fontSize:'13px', color:'#b0bec5', fontStyle:'bold' }).setDepth(31);
    this.add.text(14, 28, 'Accretion Phase — While Loops', { fontFamily:'Arial', fontSize:'10px', color:'#546e7a' }).setDepth(31);

    // Score
    this.add.text(W-80, 8, 'SCORE', { fontFamily:'Arial', fontSize:'9px', color:'#546e7a' }).setDepth(31);
    this._scoreTxt = this.add.text(W-80, 20, '0', { fontFamily:'Arial', fontSize:'18px', color:'#ffffff', fontStyle:'bold' }).setDepth(31);
    this.add.text(W-80, 40, '×1', { fontFamily:'Arial', fontSize:'12px', color:'#ffd740' }).setDepth(31);
    this._comboTxt = this.add.text(W-58, 40, '', { fontFamily:'Arial', fontSize:'12px', color:'#ffd740', fontStyle:'bold' }).setDepth(31);

    // Battery lives
    this._batteries = [];
    for (let i = 0; i < 3; i++) {
      const bx = W - 160 + i * 18;
      const bg2 = this.add.graphics().setDepth(31);
      bg2.fillStyle(0x00e5ff); bg2.fillRoundedRect(bx, 14, 12, 22, 3);
      bg2.fillStyle(0x00e5ff); bg2.fillRect(bx+4, 11, 4, 3);
      this._batteries.push({ gfx: bg2, lit: true });
    }
  }

  _updateScore(pts) {
    this.totalScore += pts;
    if (this._scoreTxt) this._scoreTxt.setText(String(this.totalScore));
  }

  _updateComboDisplay() {
    if (this._comboTxt) this._comboTxt.setText(this.combo > 1 ? '×' + this.combo : '');
  }

  _loseLife() {
    if (this.lives <= 0) return;
    this.lives--;
    const b = this._batteries[this.lives];
    if (b && b.gfx && b.gfx.active) {
      this.tweens.add({ targets: b.gfx, alpha: 0.12, duration: 400 });
      b.lit = false;
    }
    this.combo = 1;
    this._updateComboDisplay();
  }

  /* ── Loop Monitor (in HUD) ───────────────────────────────────────────── */
  _createMonitor() {
    const g = this.add.graphics().setDepth(31);
    g.fillStyle(0x1a1a2e); g.fillRoundedRect(MON_X, MON_Y, MON_W, MON_H, 8);
    g.lineStyle(1, 0x2a2a4a); g.strokeRoundedRect(MON_X, MON_Y, MON_W, MON_H, 8);

    // Static tokens: while, (, ), {, space }, }
    const cy = MON_Y + MON_H / 2;
    let tx = MON_X + 10;
    const mk = (text, color, bold) => {
      const t = this.add.text(tx, cy, text, {
        fontFamily:'Courier New', fontSize:'13px', color, fontStyle: bold ? 'bold' : 'normal'
      }).setOrigin(0, 0.5).setDepth(32);
      tx += t.width + 1;
      return t;
    };
    this._monWhile = mk('while', C.kw, true);
    mk(' (', C.punct, false);
    // Condition placeholder area
    this._monCondX = tx;
    this._monCondPh = this._makePlaceholder(tx, cy, 100);
    this._monCondTxt = this.add.text(tx, cy, '', { fontFamily:'Courier New', fontSize:'13px', color: C.cond }).setOrigin(0, 0.5).setDepth(32).setVisible(false);
    tx += 106;
    mk(') {', C.punct, false);
    // Body placeholder area
    this._monBodyX = tx;
    this._monBodyPh = this._makePlaceholder(tx, cy, 106);
    this._monBodyTxt = this.add.text(tx, cy, '', { fontFamily:'Courier New', fontSize:'13px', color: C.body }).setOrigin(0, 0.5).setDepth(32).setVisible(false);
    tx += 112;
    mk(' }', C.punct, false);

    // Flash overlay rects
    this._condFlash = this.add.rectangle(this._monCondX + 50, cy, 104, 30, 0xffd740, 0.12).setDepth(31.5).setAlpha(0);
    this._bodyFlash = this.add.rectangle(this._monBodyX + 53, cy, 112, 30, 0x00e5ff, 0.12).setDepth(31.5).setAlpha(0);
  }

  _makePlaceholder(x, y, w) {
    const g = this.add.graphics().setDepth(33);
    this._drawDash(g, x, y - 11, w, 22, 0x00e5ff, 0.6);
    this.tweens.add({ targets: g, alpha: 0.35, duration: 800, yoyo:true, repeat:-1 });
    return g;
  }

  _drawDash(g, x, y, w, h, col, a) {
    g.clear();
    g.lineStyle(1.5, col, a);
    for (let i = x; i < x+w-2; i += 6) g.lineBetween(i, y, Math.min(i+3, x+w), y);
    for (let i = x; i < x+w-2; i += 6) g.lineBetween(i, y+h, Math.min(i+3, x+w), y+h);
    for (let j = y; j < y+h-2; j += 6) g.lineBetween(x, j, x, Math.min(j+3, y+h));
    for (let j = y; j < y+h-2; j += 6) g.lineBetween(x+w, j, x+w, Math.min(j+3, y+h));
  }

  _setMonitorCond(text) {
    if (text === null) {
      this._monCondTxt.setVisible(false);
      this._monCondPh.setVisible(true);
    } else {
      this._monCondPh.setVisible(false);
      this._monCondTxt.setText(text).setVisible(true);
    }
  }

  _setMonitorBody(text) {
    if (text === null) {
      this._monBodyTxt.setVisible(false);
      this._monBodyPh.setVisible(true);
    } else {
      this._monBodyPh.setVisible(false);
      this._monBodyTxt.setText(text).setVisible(true);
    }
  }

  _flashMonitor(part, color) {
    const target = part === 'condition' ? this._condFlash : this._bodyFlash;
    if (!target || !target.active) return;
    target.setFillStyle(color === 'red' ? 0xf44336 : part === 'condition' ? 0xffd740 : 0x00e5ff, 0.12);
    this.tweens.add({ targets: target, alpha: 1, duration: 200, yoyo:true, hold:150, onComplete: () => target.setAlpha(0) });
  }

  /* ── Variable Panel ──────────────────────────────────────────────────── */
  _createVarPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(C.panel); g.fillRoundedRect(VP_X, VP_Y, VP_W, VP_H, 8);
    g.lineStyle(1, 0x2a3a4a); g.strokeRoundedRect(VP_X, VP_Y, VP_W, VP_H, 8);
    this.add.text(VP_X+8, VP_Y+6, 'VARIABLES', { fontFamily:'Arial', fontSize:'9px', color:'#546e7a', fontStyle:'bold' }).setDepth(11);

    this._varLabel = this.add.text(VP_X+8, VP_Y+24, 'charge = ', { fontFamily:'Courier New', fontSize:'14px', color:'#78909c', fontStyle:'bold' }).setDepth(11);
    this._varVal = this.add.text(VP_X+72, VP_Y+24, '0', { fontFamily:'Courier New', fontSize:'14px', color:'#00e5ff', fontStyle:'bold' }).setDepth(11);
    this._condCheckTxt = this.add.text(VP_X+8, VP_Y+52, '', { fontFamily:'Courier New', fontSize:'11px', color:'#ffd740', wordWrap:{width: VP_W-16} }).setDepth(11).setVisible(false);
    this._condCheckResult = this.add.text(VP_X+8, VP_Y+80, '', { fontFamily:'Courier New', fontSize:'11px', color:'#00e676' }).setDepth(11).setVisible(false);
  }

  _updateVar(val) {
    if (!this._varVal || !this._varVal.active) return;
    this._varVal.setText(String(val));
    this.tweens.add({ targets: this._varVal, scaleX:1.15, scaleY:1.15, duration:100, yoyo:true });
  }

  _updateCondCheck(expr, isTrue) {
    if (!this._condCheckTxt || !this._condCheckTxt.active) return;
    this._condCheckTxt.setText(expr + '?').setVisible(true);
    this._condCheckResult.setText(isTrue ? '✓ TRUE' : '✗ FALSE')
      .setColor(isTrue ? '#00e676' : '#f44336')
      .setVisible(true)
      .setScale(0);
    this.tweens.add({ targets: this._condCheckResult, scaleX:1, scaleY:1, duration:200, ease:'Back.easeOut' });
  }

  /* ── Bit Mascot ──────────────────────────────────────────────────────── */
  _createBit() {
    this._bitCont = this.add.container(BIT_HIDE_X, BIT_Y).setDepth(50);
    const g = this.add.graphics();
    // Body
    g.fillStyle(0x37474f); g.fillRoundedRect(-20, -15, 40, 32, 10);
    // Eye
    g.fillStyle(0x00e5ff); g.fillCircle(0, -4, 8);
    g.fillStyle(0xffffff); g.fillCircle(2, -5, 3);
    // Antenna
    g.lineStyle(2, 0x78909c); g.lineBetween(0, -15, 0, -28);
    const antTip = this.add.circle(0, -30, 3, 0xffd740).setDepth(51);
    this.tweens.add({ targets: antTip, alpha: 0.4, duration: 800, yoyo:true, repeat:-1 });
    this._bitCont.add([g, antTip]);
    this.tweens.add({ targets: this._bitCont, y: BIT_Y - 4, duration: 2000, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  }

  _showBit(msg) {
    return new Promise(resolve => {
      this.tweens.add({ targets: this._bitCont, x: BIT_SHOW_X, duration: 300, ease:'Back.easeOut' });
      // Destroy previous bubble
      if (this._bubbleG && this._bubbleG.active) this._bubbleG.destroy();
      if (this._bubbleTxt && this._bubbleTxt.active) this._bubbleTxt.destroy();
      if (this._bubbleZone && this._bubbleZone.active) this._bubbleZone.destroy();
      if (this._bubbleTimer) { this._bubbleTimer.remove(); this._bubbleTimer = null; }

      const bw = Math.min(230, msg.length * 7 + 24);
      const lineH = 18, chars = Math.ceil(bw / 7);
      const lines = Math.ceil(msg.length / chars);
      const bh = lines * lineH + 20;
      const bx = BIT_SHOW_X - bw - 14, by = BIT_Y - bh - 10;

      const bg = this.add.graphics().setDepth(60).setScale(0);
      bg.fillStyle(0x1a1a2e, 0.97); bg.fillRoundedRect(bx, by, bw, bh, 10);
      bg.lineStyle(1.5, 0x00e5ff); bg.strokeRoundedRect(bx, by, bw, bh, 10);
      // Pointer
      bg.fillStyle(0x1a1a2e); bg.fillTriangle(bx+bw-4, by+bh-12, bx+bw+10, by+bh-4, bx+bw-4, by+bh+2);
      this._bubbleG = bg;

      const txt = this.add.text(bx+10, by+10, '', {
        fontFamily:'Arial', fontSize:'12px', color:'#e0e0e0', wordWrap:{width:bw-20}
      }).setDepth(61);
      this._bubbleTxt = txt;

      this.tweens.add({ targets: bg, scaleX:1, scaleY:1, duration:200, ease:'Back.easeOut' });

      let idx = 0;
      const tw = this.time.addEvent({
        delay:25, repeat:msg.length-1,
        callback: () => { txt.setText(msg.substring(0, ++idx)); }
      });

      const dismiss = () => {
        tw.remove();
        if (bg.active) bg.destroy();
        if (txt.active) txt.destroy();
        if (zone.active) zone.destroy();
        resolve();
      };
      this._bubbleTimer = this.time.delayedCall(msg.length * 25 + 3200, dismiss);
      const zone = this.add.zone(bx, by, bw+20, bh+20).setOrigin(0).setInteractive().setDepth(62);
      this._bubbleZone = zone;
      zone.on('pointerdown', () => { if (this._bubbleTimer) { this._bubbleTimer.remove(); this._bubbleTimer = null; } dismiss(); });
    });
  }

  _hideBit() {
    this.tweens.add({ targets: this._bitCont, x: BIT_HIDE_X, duration: 250, ease:'Quad.easeIn' });
    [this._bubbleG, this._bubbleTxt, this._bubbleZone].forEach(el => { if (el && el.active) el.destroy(); });
    if (this._bubbleTimer) { this._bubbleTimer.remove(); this._bubbleTimer = null; }
  }

  /* ── Tutorial ────────────────────────────────────────────────────────── */
  _checkTutorial() {
    let done = false;
    try { done = localStorage.getItem('level19_tutorial_done') === 'true'; } catch(e) {}
    if (done) {
      this._startRound(0);
    } else {
      this._runTutorial().catch(e => this._startRound(0));
    }
  }

  async _runTutorial() {
    // Fade in
    const ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 1).setDepth(100);
    this.tweens.add({ targets: ov, alpha: 0, duration: 800 });
    await this._delay(900);
    ov.destroy();

    // Setup tutorial monitor
    this._setMonitorCond(null);
    this._setMonitorBody(null);

    // Step 1
    await this._showBit("Welcome, Technician! These Power Cores need charging. We use while loops to keep charging UNTIL they're full!");

    // Step 2 — while keyword
    this._monWhile.setScale(0);
    this.tweens.add({ targets: this._monWhile, scaleX:1, scaleY:1, duration:200, ease:'Back.easeOut' });
    await this._showBit("A while loop starts with 'while'. It means: KEEP DOING something as long as a condition is true.");

    // Step 3 — condition
    this._setMonitorCond('charge < 100');
    this._updateVar(0);
    this._updateCondCheck('0 < 100', true);
    this._condCheckTxt.setVisible(true);
    this._condCheckResult.setVisible(true);
    await this._showBit("This is the CONDITION — checked FIRST, before every cycle. Is charge less than 100? If YES → run the body. If NO → STOP!");

    // Step 4 — body
    this._setMonitorBody('charge += 15;');
    this._floatNum(15, true);
    await this._showBit("This is the BODY — the action that repeats. Each cycle adds 15 to charge. Something in the body MUST eventually make the condition false, or the loop runs FOREVER!");

    // Step 5 — auto-run
    await this._showBit("Unlike for loops, while loops have NO built-in counter. You don't know exactly how many times it runs — just keep going until the condition fails. Watch!");

    // Auto-run 7 iterations (charge 0→105 by +15)
    await this._tutorialAutoRun();

    // Step 6
    await this._showBit("See? We didn't know it would take 7 cycles. The while loop figured it out! YOUR turn, Technician!");
    this._hideBit();
    this._condCheckTxt.setVisible(false);
    this._condCheckResult.setVisible(false);
    try { localStorage.setItem('level19_tutorial_done', 'true'); } catch(e) {}
    await this._delay(300);
    this._startRound(0);
  }

  async _tutorialAutoRun() {
    let charge = 0;
    for (let iter = 0; iter < 7; iter++) {
      // Condition check
      this._flashMonitor('condition', 'cond');
      this._updateCondCheck(charge + ' < 100', true);
      await this._delay(400);
      // Body
      this._flashMonitor('body', 'body');
      await this._delay(250);
      charge += 15;
      const clamped = Math.min(charge, 100);
      await this._updateFill(clamped, 400);
      this._pulseRing('#00e5ff');
      this._floatNum(15, true);
      await this._updatePct(charge);
      this._updateVar(charge);
      this._checkLEDs(charge);
      await this._delay(700);
    }
    // Exit check
    this._flashMonitor('condition', 'cond');
    await this._delay(300);
    this._updateCondCheck(charge + ' < 100', false);
    const errTxt = this.add.text(CORE_X, CORE_T - 28, '✗ LOOP STOPS', {
      fontFamily:'Arial', fontSize:'13px', color:'#f44336', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(20);
    this.cameras.main.shake(200, 0.003);
    this.tweens.add({ targets: errTxt, alpha: 0, duration: 400, delay: 1800, onComplete: () => errTxt.destroy() });
    // LED 4
    this._checkLEDs(100);
    // Core glow
    const cg = this.add.graphics().setDepth(7);
    this.tweens.add({
      targets: { r:28, a:0.25 }, r:110, a:0,
      duration: 800, ease: 'Cubic.easeOut',
      onUpdate: t => { const v=t.targets[0]; cg.clear(); cg.lineStyle(2,0x00e676,v.a); cg.strokeCircle(CORE_X,CORE_Y,v.r); },
      onComplete: () => cg.destroy()
    });
    // Banner
    const banner = this.add.container(CORE_X, -60).setDepth(50);
    const banBg = this.add.graphics();
    banBg.fillStyle(0x1a1a2e); banBg.fillRoundedRect(-130, -22, 260, 44, 8);
    banBg.lineStyle(2, 0xffd740); banBg.strokeRoundedRect(-130, -22, 260, 44, 8);
    const banTxt = this.add.text(0, 0, 'CORE CHARGED — 7 CYCLES', {
      fontFamily:'Arial', fontSize:'13px', color:'#ffd740', fontStyle:'bold'
    }).setOrigin(0.5);
    banner.add([banBg, banTxt]);
    this.tweens.add({ targets: banner, y: 185, duration: 600, ease:'Bounce.easeOut', onComplete: () => {
      this.time.delayedCall(2000, () => this.tweens.add({ targets: banner, alpha:0, duration:400, onComplete: () => banner.destroy() }));
    }});
    await this._delay(3200);
    await this._resetCore(0);
  }

  /* ── Round management ────────────────────────────────────────────────── */
  _clearRound() {
    this._roundEls.forEach(el => { if (el && el.active) el.destroy(); });
    this._roundEls = [];
    this.playerAnswers = {};
    if (this._chargeBtn && this._chargeBtn.active) { this._chargeBtn.destroy(); this._chargeBtn = null; }
    if (this._chargeBtnTxt && this._chargeBtnTxt.active) { this._chargeBtnTxt.destroy(); this._chargeBtnTxt = null; }
    if (this._chargeBtnZone && this._chargeBtnZone.active) { this._chargeBtnZone.destroy(); this._chargeBtnZone = null; }
    if (this._chargeBtnGlow && this._chargeBtnGlow.active) { this._chargeBtnGlow.destroy(); this._chargeBtnGlow = null; }
    this._setMonitorCond(null);
    this._setMonitorBody(null);
    this._condCheckTxt && this._condCheckTxt.setVisible(false);
    this._condCheckResult && this._condCheckResult.setVisible(false);
  }

  _re(el) { if (el) this._roundEls.push(el); return el; }

  async _startRound(idx) {
    if (idx >= ROUNDS.length) { this._levelComplete(); return; }
    this._clearRound();
    const cfg = ROUNDS[idx];
    this._roundStartTime = Date.now();
    await this._resetCore(cfg.startCharge || 0);
    this._showMissionCard(cfg);
    await this._delay(300);

    if (cfg.isSpecialRound) {
      if (cfg.type === 'infinite_loop_detection') this._roundInfiniteDetect(cfg);
      else if (cfg.type === 'comparison') this._roundComparison(cfg);
      else if (cfg.type === 'predict_final') this._roundPredictFinal(cfg);
      return;
    }

    // Standard round — setup monitor with prefills/blanks
    this._setupMonitorForRound(cfg);
    this._nextBlankIdx = 0;
    this._showNextBubbles(cfg);
  }

  _setupMonitorForRound(cfg) {
    const pre = cfg.prefilledDisplay || {};
    // Build condition display
    if (pre.condition) {
      this._setMonitorCond(pre.condition);
      this.playerAnswers.condition_full = pre.condition;
    } else if (cfg.blanks.includes('condition_full')) {
      this._setMonitorCond(null);
    } else {
      // Template-based
      const op = cfg.correctValues.condition_op;
      const val = (pre.condition_value || (cfg.blanks.includes('condition_value') ? '[?]' : cfg.correctValues.condition_value));
      const opPart = cfg.blanks.includes('condition_op') ? '[?]' : op;
      this._setMonitorCond('charge ' + opPart + ' ' + val);
      if (!cfg.blanks.includes('condition_value') && !cfg.blanks.includes('condition_op')) {
        this.playerAnswers.condition_full = 'charge ' + op + ' ' + cfg.correctValues.condition_value;
      }
    }
    // Build body display
    if (pre.body) {
      this._setMonitorBody(pre.body);
      this.playerAnswers.body_full = pre.body;
    } else if (cfg.blanks.includes('body_full')) {
      this._setMonitorBody(null);
    } else {
      const bop = cfg.correctValues.body_op;
      const bamt = cfg.blanks.includes('body_amount') ? '[?]' : cfg.correctValues.body_amount;
      this._setMonitorBody('charge ' + bop + ' ' + bamt);
      if (!cfg.blanks.includes('body_amount')) {
        this.playerAnswers.body_full = 'charge ' + bop + ' ' + cfg.correctValues.body_amount;
      }
    }
  }

  _showNextBubbles(cfg) {
    const blanks = cfg.blanks;
    const nextBlank = blanks[this._nextBlankIdx];
    if (!nextBlank) {
      this._showChargeBtn();
      return;
    }
    const opts = cfg.options[nextBlank] || [];
    this._showBubbles(nextBlank, opts, (val) => {
      this._applyAnswer(nextBlank, val, cfg);
      this._nextBlankIdx++;
      this._showNextBubbles(cfg);
    });
  }

  _applyAnswer(blankKey, val, cfg) {
    this.playerAnswers[blankKey] = val;
    if (blankKey === 'condition_value') {
      const op = cfg.correctValues.condition_op;
      this._setMonitorCond('charge ' + op + ' ' + val);
      this.playerAnswers.condition_full = 'charge ' + op + ' ' + val;
    } else if (blankKey === 'body_amount') {
      const bop = cfg.correctValues.body_op;
      this._setMonitorBody('charge ' + bop + ' ' + val);
      this.playerAnswers.body_full = 'charge ' + bop + ' ' + val;
    } else if (blankKey === 'condition_full') {
      this._setMonitorCond(val);
      this.playerAnswers.condition_full = val;
    } else if (blankKey === 'body_full') {
      this._setMonitorBody(val);
      this.playerAnswers.body_full = val;
    } else if (blankKey === 'condition_op') {
      const valStr = cfg.prefilledDisplay.condition_value || cfg.correctValues.condition_value;
      this._setMonitorCond('charge ' + val + ' ' + valStr);
      this.playerAnswers.condition_full = 'charge ' + val + ' ' + valStr;
    }
  }

  _showBubbles(blankKey, options, callback) {
    const label = this.add.text(W/2, FLOOR_Y + 5, '▼ SELECT: ' + blankKey.replace(/_/g,' ').toUpperCase(), {
      fontFamily:'Arial', fontSize:'9px', color:'#546e7a'
    }).setOrigin(0.5).setDepth(20);
    this._re(label);

    const totalW = options.reduce((sum, o) => sum + String(o).length * 8.5 + 32, 0) + (options.length-1)*10;
    let ox = W/2 - totalW/2;

    options.forEach((opt, i) => {
      const txt = String(opt);
      const bw = txt.length * 8.5 + 32;
      const bh = 36;
      const bx = ox + bw/2, by = FLOOR_Y + 28;
      ox += bw + 10;

      const container = this._re(this.add.container(bx, H + 20).setDepth(21));
      const bg = this.add.graphics();
      bg.fillStyle(0x1e1e3a); bg.fillRoundedRect(-bw/2, -bh/2, bw, bh, 18);
      bg.lineStyle(1.5, 0x00e5ff); bg.strokeRoundedRect(-bw/2, -bh/2, bw, bh, 18);
      const t = this.add.text(0, 0, txt, { fontFamily:'Courier New', fontSize:'13px', color:'#00e5ff', fontStyle:'bold' }).setOrigin(0.5);
      container.add([bg, t]);
      container.setSize(bw, bh).setInteractive({ useHandCursor:true });

      this.tweens.add({ targets: container, y: by, duration: 320, delay: i*80, ease:'Back.easeOut' });
      this.tweens.add({ targets: container, y: by - 3, duration: 2200+i*200, yoyo:true, repeat:-1, ease:'Sine.easeInOut', delay:320+i*80 });

      container.on('pointerover', () => {
        bg.clear(); bg.fillStyle(0x2a2a5a); bg.fillRoundedRect(-bw/2,-bh/2,bw,bh,18);
        bg.lineStyle(2, 0xffffff); bg.strokeRoundedRect(-bw/2,-bh/2,bw,bh,18);
        this.tweens.add({ targets:container, scaleX:1.08, scaleY:1.08, duration:120 });
      });
      container.on('pointerout', () => {
        bg.clear(); bg.fillStyle(0x1e1e3a); bg.fillRoundedRect(-bw/2,-bh/2,bw,bh,18);
        bg.lineStyle(1.5, 0x00e5ff); bg.strokeRoundedRect(-bw/2,-bh/2,bw,bh,18);
        this.tweens.add({ targets:container, scaleX:1, scaleY:1, duration:120 });
      });
      container.on('pointerdown', () => {
        if (this._interactLocked) return;
        // Fly to monitor
        const monTarget = blankKey.startsWith('body') ? this._monBodyX + 50 : this._monCondX + 50;
        this.tweens.add({ targets:container, x: monTarget, y: MON_Y + MON_H/2, scaleX:0.6, scaleY:0.6, alpha:0, duration:280, ease:'Back.easeIn', onComplete: () => container.destroy() });
        // Hide sibling bubbles
        this._roundEls.forEach(el => {
          if (el && el.active && el !== container && el !== label && el.type === 'Container') {
            this.tweens.add({ targets:el, alpha:0, duration:200, onComplete:() => el.destroy() });
          }
        });
        this.time.delayedCall(300, () => callback(opt));
      });
    });
  }

  _showMissionCard(cfg) {
    const cw = 350, ch = 80;
    const cx = W/2 - cw/2, cy = H - ch - 10;
    const card = this._re(this.add.container(W + cw, cy).setDepth(15));
    const bg = this.add.graphics();
    bg.fillStyle(C.panel2); bg.fillRoundedRect(-cw/2, 0, cw, ch, 12);
    bg.fillStyle(0xffd740); bg.fillRect(-cw/2, 8, 5, ch-16);
    const rnd = this.add.text(-cw/2+12, 8, 'ROUND ' + cfg.round + '/10', {
      fontFamily:'Arial', fontSize:'10px', color:'#78909c', fontStyle:'bold'
    });
    const msg = this.add.text(-cw/2+12, 24, cfg.mission, {
      fontFamily:'Arial', fontSize:'11px', color:'#e0e0e0', wordWrap:{width:cw-24}
    });
    const sc = this.add.text(cw/2-10, ch-16, 'Start: '+(cfg.startCharge||0)+'%', {
      fontFamily:'Courier New', fontSize:'10px', color:'#00e5ff'
    }).setOrigin(1, 0);
    card.add([bg, rnd, msg, sc]);
    card.x = cw/2;
    this.tweens.add({ targets: card, x: W/2, duration: 400, ease:'Back.easeOut' });
  }

  _showChargeBtn() {
    const bx = CHARGE_BTN_X, by = 555;
    // Glow
    this._chargeBtnGlow = this._re(this.add.graphics().setDepth(22));
    this._chargeBtnGlow.fillStyle(0x00e676, 0.1);
    this._chargeBtnGlow.fillRoundedRect(bx-78, by-22, 156, 44, 22);
    this.tweens.add({ targets: this._chargeBtnGlow, alpha: 0.3, duration: 900, yoyo:true, repeat:-1 });

    this._chargeBtn = this._re(this.add.graphics().setDepth(23));
    this._chargeBtn.fillStyle(0x00c853); this._chargeBtn.fillRoundedRect(bx-75, by-20, 150, 40, 20);

    this._chargeBtnTxt = this._re(this.add.text(bx, by, '▶ CHARGE', {
      fontFamily:'Arial', fontSize:'14px', color:'#0a0a1a', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(24));

    this._chargeBtnZone = this._re(this.add.zone(bx-75, by-20, 150, 40).setOrigin(0).setInteractive({ useHandCursor:true }).setDepth(25));
    this._chargeBtnZone.on('pointerover', () => {
      this._chargeBtn.clear(); this._chargeBtn.fillStyle(0x00e876); this._chargeBtn.fillRoundedRect(bx-75,by-20,150,40,20);
    });
    this._chargeBtnZone.on('pointerout', () => {
      this._chargeBtn.clear(); this._chargeBtn.fillStyle(0x00c853); this._chargeBtn.fillRoundedRect(bx-75,by-20,150,40,20);
    });
    this._chargeBtnZone.on('pointerdown', () => {
      if (this._interactLocked) return;
      this.tweens.add({ targets: this._chargeBtn, alpha:0.7, scaleY:0.93, duration:60, yoyo:true, onComplete: () => this._onCharge() });
    });
  }

  /* ── Loop Execution ─────────────────────────────────────────────────── */
  async _onCharge() {
    this._interactLocked = true;
    const cfg = ROUNDS[this.currentRound];
    if (this._chargeBtnZone) this._chargeBtnZone.disableInteractive();

    // Parse player answers
    const condFull = this.playerAnswers.condition_full || (cfg.prefilledDisplay && cfg.prefilledDisplay.condition) || '';
    const bodyFull = this.playerAnswers.body_full || (cfg.prefilledDisplay && cfg.prefilledDisplay.body) || '';
    const { condOp, condVal } = this._parseCond(condFull);
    const { bodyOp, bodyAmt } = this._parseBody(bodyFull);

    // Simulate
    let charge = cfg.startCharge || 0;
    const iters = [];
    let guard = 0;
    while (this._evalCond(charge, condOp, condVal) && guard++ < 26) {
      const prev = charge;
      charge = this._applyBodyOp(charge, bodyOp, bodyAmt);
      iters.push({ prevCharge: prev, newCharge: charge });
    }
    const isInfinite = guard >= 26;

    // Determine if correct
    const correct = this._checkCorrect(cfg, charge, iters, condOp, condVal, bodyOp, bodyAmt);

    // Animate
    let currentCharge = cfg.startCharge || 0;
    if (isInfinite) {
      // Show 8 rapid iterations then overheat
      for (let j = 0; j < Math.min(8, iters.length); j++) {
        const it = iters[j];
        this._flashMonitor('condition', 'cond');
        await this._delay(180);
        this._flashMonitor('body', 'body');
        currentCharge = it.newCharge;
        await this._updateFill(Math.min(currentCharge, 100), 200);
        await this._updatePct(currentCharge);
        this._updateVar(currentCharge);
        await this._delay(180);
      }
      this._coreOverheat();
      await this._delay(1200);
      await this._showBit(FEEDBACK.infinite_loop);
      this._hideBit();
      this._loseLife();
      if (this.lives <= 0) { this._gameOver(); return; }
      this._interactLocked = false;
      await this._startRound(this.currentRound);
      return;
    }

    for (let j = 0; j < iters.length; j++) {
      const it = iters[j];
      this._flashMonitor('condition', 'cond');
      this._updateCondCheck(currentCharge + ' ' + condOp + ' ' + condVal, true);
      await this._delay(320);
      this._flashMonitor('body', 'body');
      const positive = bodyOp === '+=';
      currentCharge = it.newCharge;
      await this._updateFill(Math.min(currentCharge, 100), 400);
      this._pulseRing(positive ? '#00e5ff' : '#ffd740');
      this._floatNum(bodyAmt, positive);
      await this._updatePct(currentCharge);
      this._updateVar(currentCharge);
      this._checkLEDs(currentCharge);
      await this._delay(480);
    }
    // Final condition check (false)
    this._flashMonitor('condition', 'cond');
    this._updateCondCheck(currentCharge + ' ' + condOp + ' ' + condVal, false);
    await this._delay(500);

    if (correct) {
      await this._onCorrect();
    } else {
      const errType = this._classifyError(cfg, charge, condOp, bodyOp, bodyAmt);
      await this._onWrong(errType);
    }
  }

  _parseCond(text) {
    const m = text.match(/charge\s*([<>=!]+)\s*(-?\d+)/);
    if (m) return { condOp: m[1], condVal: parseInt(m[2]) };
    return { condOp: '<', condVal: 100 };
  }

  _parseBody(text) {
    const m = text.match(/charge\s*(\+=|-=)\s*(-?\d+)/);
    if (m) return { bodyOp: m[1], bodyAmt: parseInt(m[2]) };
    return { bodyOp: '+=', bodyAmt: 10 };
  }

  _evalCond(charge, op, val) {
    switch(op) {
      case '<':  return charge < val;
      case '<=': return charge <= val;
      case '>':  return charge > val;
      case '>=': return charge >= val;
      case '!=': return charge !== val;
      default:   return false;
    }
  }

  _applyBodyOp(charge, op, amt) {
    return op === '+=' ? charge + amt : charge - amt;
  }

  _checkCorrect(cfg, finalCharge, iters, condOp, condVal, bodyOp, bodyAmt) {
    const cv = cfg.correctValues;
    if (!cv) return true;
    // Simulate correct loop
    let ec = cfg.startCharge || 0;
    let eiters = 0;
    while (this._evalCond(ec, cv.condition_op, cv.condition_value) && eiters++ < 30) {
      ec = this._applyBodyOp(ec, cv.body_op, cv.body_amount);
    }
    return finalCharge === ec && iters.length === eiters;
  }

  _classifyError(cfg, finalCharge, condOp, bodyOp, bodyAmt) {
    const cv = cfg.correctValues;
    if (!cv) return 'wrong_condition';
    if (bodyOp !== cv.body_op) return 'wrong_direction';
    if (bodyAmt !== cv.body_amount) return 'wrong_body';
    if (condOp !== cv.condition_op) return 'wrong_operator';
    if (cv.condition_value !== undefined) {
      const parsedVal = this.playerAnswers.condition_value;
      if (parsedVal && parseInt(parsedVal) !== cv.condition_value) return 'wrong_threshold';
    }
    return 'wrong_condition';
  }

  async _onCorrect() {
    this.correctFirstTry++;
    this.combo = Math.min(this.combo + 0.5, 3);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this._updateComboDisplay();
    const pts = Math.round(100 * this.combo);
    this._updateScore(pts);

    this.roundResults.push({ round: this.currentRound+1, correct:true, attempts:1, time: Math.round((Date.now()-this._roundStartTime)/1000) });

    // All LEDs flash
    this._ledDots.forEach((d,i) => { if (d.active) this.tweens.add({ targets:d, alpha:0.4, duration:150, yoyo:true, repeat:3 }); });
    // Green aura
    const ag = this.add.graphics().setDepth(7);
    this.tweens.add({ targets:{r:28,a:0.35}, r:110, a:0, duration:800, ease:'Cubic.easeOut',
      onUpdate:t=>{const v=t.targets[0]; ag.clear(); ag.fillStyle(0x00e676,v.a); ag.fillCircle(CORE_X,CORE_Y,v.r);},
      onComplete:()=>ag.destroy() });
    // Confetti
    for (let i = 0; i < 14; i++) {
      this.time.delayedCall(i*60, () => {
        try {
          const p = this.add.particles(CORE_X, CORE_Y, 'p19', {
            speedX:{min:-180,max:180}, speedY:{min:-240,max:-80},
            lifespan:1200, tint:[0x00e5ff,0x00e676,0xffd740,0xff4081],
            quantity:3, scale:{start:1,end:0}, alpha:{start:1,end:0}, gravityY:150
          }).setDepth(15);
          this.time.delayedCall(1300, () => { if (p.active) p.destroy(); });
        } catch(e) {}
      });
    }
    // Banner
    const bnr = this.add.text(W/2, H/2, '✓ CHARGED!', {
      fontFamily:'Arial', fontSize:'28px', color:'#00e676', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(50).setScale(0);
    this.tweens.add({ targets:bnr, scaleX:1.2, scaleY:1.2, duration:220, ease:'Back.easeOut', onComplete:() => {
      this.tweens.add({ targets:bnr, scaleX:1, scaleY:1, duration:80, onComplete:() => {
        this.time.delayedCall(800, () => this.tweens.add({ targets:bnr, alpha:0, duration:250, onComplete:()=>bnr.destroy() }));
      }});
    }});
    await this._delay(1600);
    this._interactLocked = false;
    this.currentRound++;
    this._startRound(this.currentRound);
  }

  async _onWrong(errType) {
    this._loseLife();
    this.roundResults.push({ round:this.currentRound+1, correct:false, attempts:1, time:Math.round((Date.now()-this._roundStartTime)/1000) });

    this._flashMonitor('condition', 'red');
    this._flashMonitor('body', 'red');
    this.cameras.main.shake(200, 0.004);

    const msg = FEEDBACK[errType] || FEEDBACK.wrong_condition;
    await this._showBit(msg);
    this._hideBit();

    if (this.lives <= 0) { this._gameOver(); return; }
    this._interactLocked = false;
    await this._startRound(this.currentRound);
  }

  /* ── Special Round 7 — Infinite Loop Detection ───────────────────────── */
  _roundInfiniteDetect(cfg) {
    this._setMonitorCond('charge < 100');
    this._setMonitorBody('???');
    const cards = cfg.cards;
    const cx = [160, 390, 620];
    const cy = 485;
    const cw = 200, ch = 60;

    cards.forEach((card, i) => {
      const cont = this._re(this.add.container(cx[i], H + ch).setDepth(20));
      const bg = this.add.graphics();
      bg.fillStyle(C.panel2); bg.fillRoundedRect(-cw/2,-ch/2,cw,ch,10);
      bg.lineStyle(1.5, 0x2a2a4a); bg.strokeRoundedRect(-cw/2,-ch/2,cw,ch,10);
      const badge = this.add.circle(-(cw/2)+16, -(ch/2)+14, 12, 0xffd740);
      const badgeTxt = this.add.text(-(cw/2)+16, -(ch/2)+14, card.label, {
        fontFamily:'Arial', fontSize:'11px', color:'#0a0a1a', fontStyle:'bold'
      }).setOrigin(0.5);
      const codeTxt = this.add.text(-(cw/2)+32, -(ch/2)+8, card.code, {
        fontFamily:'Courier New', fontSize:'9px', color:'#b0bec5', wordWrap:{width:cw-38}
      });
      cont.add([bg, badge, badgeTxt, codeTxt]);
      cont.setSize(cw, ch).setInteractive({ useHandCursor:true });
      this.tweens.add({ targets:cont, y:cy, duration:360, delay:i*100, ease:'Back.easeOut' });

      cont.on('pointerover', () => { bg.clear(); bg.fillStyle(0x2a2a4e); bg.fillRoundedRect(-cw/2,-ch/2,cw,ch,10); bg.lineStyle(2,0xf44336); bg.strokeRoundedRect(-cw/2,-ch/2,cw,ch,10); this.tweens.add({targets:cont,scaleX:1.03,scaleY:1.03,duration:100}); });
      cont.on('pointerout', () => { bg.clear(); bg.fillStyle(C.panel2); bg.fillRoundedRect(-cw/2,-ch/2,cw,ch,10); bg.lineStyle(1.5,0x2a2a4a); bg.strokeRoundedRect(-cw/2,-ch/2,cw,ch,10); this.tweens.add({targets:cont,scaleX:1,scaleY:1,duration:100}); });
      cont.on('pointerdown', () => {
        if (this._interactLocked) return;
        this._interactLocked = true;
        if (card.isInfinite) {
          // Correct
          bg.clear(); bg.fillStyle(0x300000); bg.fillRoundedRect(-cw/2,-ch/2,cw,ch,10); bg.lineStyle(2,0xf44336); bg.strokeRoundedRect(-cw/2,-ch/2,cw,ch,10);
          const dangerTxt = this.add.text(cx[i], cy-10, '⚠ INFINITE!', { fontFamily:'Arial', fontSize:'12px', color:'#f44336', fontStyle:'bold' }).setOrigin(0.5).setDepth(25);
          this._roundEls.push(dangerTxt);
          this.time.delayedCall(800, () => { this._onInfiniteDetectCorrect(cfg, cards, i); });
        } else {
          // Wrong — show correct
          bg.clear(); bg.fillStyle(0x003000); bg.fillRoundedRect(-cw/2,-ch/2,cw,ch,10);
          const wrongG = this.add.graphics().setDepth(25); wrongG.lineStyle(2,0x00e676); wrongG.strokeRoundedRect(cx[i]-cw/2,cy-ch/2,cw,ch,10); this._roundEls.push(wrongG);
          const corrIdx = cfg.correctIndex;
          const corrCont = this._roundEls.find((el,j) => el && el.type==='Container' && j >= 0);
          this.time.delayedCall(500, () => this._showBit(FEEDBACK.infinite_loop).then(() => { this._hideBit(); this._loseLife(); this._interactLocked = false; if(this.lives<=0){this._gameOver();}else{this._startRound(this.currentRound);} }));
        }
      });
    });
  }

  async _onInfiniteDetectCorrect(cfg, cards, selectedIdx) {
    this.correctFirstTry++;
    this.combo = Math.min(this.combo + 0.5, 3);
    this._updateScore(Math.round(100 * this.combo));
    this.roundResults.push({ round:cfg.round, correct:true, attempts:1, time:Math.round((Date.now()-this._roundStartTime)/1000) });
    await this._showBit("Correct! That loop moves charge AWAY from 100, so it NEVER reaches the exit condition.");
    this._hideBit();
    await this._delay(400);
    this._interactLocked = false;
    this.currentRound++;
    this._startRound(this.currentRound);
  }

  /* ── Special Round 9 — Comparison ───────────────────────────────────── */
  _roundComparison(cfg) {
    const ax = 200, bx = 520, by = 260;
    const cw = 90, ch = 130;
    // Core A
    this._drawMiniCore(ax, by, cw, ch, 'CORE A', '#00e5ff', cfg.coreA.start);
    // Core B
    this._drawMiniCore(bx, by, cw, ch, 'CORE B', '#ff4081', cfg.coreB.start);
    // Buttons
    ['A WINS', 'B WINS'].forEach((lbl, i) => {
      const btnX = i === 0 ? ax : bx;
      const btn = this._re(this.add.graphics().setDepth(20));
      btn.fillStyle(i===0?0x00e5ff:0xff4081); btn.fillRoundedRect(btnX-55, 365, 110, 36, 18);
      const t = this._re(this.add.text(btnX, 383, lbl, {fontFamily:'Arial',fontSize:'12px',color:'#0a0a1a',fontStyle:'bold'}).setOrigin(0.5).setDepth(21));
      const z = this._re(this.add.zone(btnX-55,365,110,36).setOrigin(0).setInteractive({useHandCursor:true}).setDepth(22));
      z.on('pointerdown', () => {
        if (this._interactLocked) return;
        this._interactLocked = true;
        const isCorrect = (i===0 && cfg.correctAnswer==='A') || (i===1 && cfg.correctAnswer==='B');
        this._runComparisonAnim(cfg, ax, bx, by, cw, ch, isCorrect);
      });
    });
  }

  _drawMiniCore(cx, cy, cw, ch, label, col, startPct) {
    const g = this._re(this.add.graphics().setDepth(15));
    g.fillStyle(0x0d1117); g.fillRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 8);
    g.lineStyle(2, 0x2a3a4a); g.strokeRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 8);
    // Chamber
    const chl = cx-cw/2+6, cht = cy-ch/2+16, chw = cw-12, chh = ch-26;
    g.fillStyle(0x050810); g.fillRoundedRect(chl, cht, chw, chh, 4);
    // Fill
    const fh = Math.min(startPct/100, 1) * (chh-4);
    const fc = parseInt(col.replace('#',''), 16);
    g.fillStyle(fc, 0.8); g.fillRect(chl+2, cht+chh-4-fh, chw-4, fh);
    this._re(this.add.text(cx, cy-ch/2-12, label, { fontFamily:'Arial', fontSize:'10px', color:col, fontStyle:'bold' }).setOrigin(0.5).setDepth(16));
    this._re(this.add.text(cx, cy+ch/2+5, startPct+'%', { fontFamily:'Courier New', fontSize:'10px', color:col }).setOrigin(0.5).setDepth(16));
  }

  async _runComparisonAnim(cfg, ax, bx, by, cw, ch, isCorrect) {
    const colA = '#00e5ff', colB = '#ff4081';
    const colAH = 0x00e5ff, colBH = 0xff4081;
    let ca = cfg.coreA.start, cb = cfg.coreB.start;
    let donA = false, donB = false;
    const maxIter = 8;
    for (let j = 0; j < maxIter && (!donA || !donB); j++) {
      if (!donA) ca += cfg.coreA.increment;
      if (!donB) cb += cfg.coreB.increment;
      // Redraw cores
      this._drawMiniCore(ax, by, cw, ch, 'CORE A', colA, Math.min(ca, 100));
      this._drawMiniCore(bx, by, cw, ch, 'CORE B', colB, Math.min(cb, 100));
      if (ca >= 100 && !donA) { donA = true; }
      if (cb >= 100 && !donB) { donB = true; }
      await this._delay(340);
    }
    if (isCorrect) {
      await this._onCorrect();
    } else {
      await this._onWrong('comparison_wrong');
    }
  }

  /* ── Special Round 10 — Predict Final ───────────────────────────────── */
  _roundPredictFinal(cfg) {
    this._setMonitorCond('charge < 100');
    this._setMonitorBody('charge += 17');
    const opts = cfg.options;
    const bw = 80, bh = 36;
    const totalW = opts.length * (bw+10) - 10;
    let ox = W/2 - totalW/2;

    opts.forEach((val, i) => {
      const bx = ox + bw/2;
      const cont = this._re(this.add.container(bx, H+bh).setDepth(20));
      const bg = this.add.graphics();
      bg.fillStyle(C.panel2); bg.fillRoundedRect(-bw/2,-bh/2,bw,bh,18);
      bg.lineStyle(1.5, 0x00e5ff); bg.strokeRoundedRect(-bw/2,-bh/2,bw,bh,18);
      const t = this.add.text(0, 0, String(val), { fontFamily:'Courier New', fontSize:'14px', color:'#00e5ff', fontStyle:'bold' }).setOrigin(0.5);
      cont.add([bg, t]);
      cont.setSize(bw, bh).setInteractive({ useHandCursor:true });
      this.tweens.add({ targets:cont, y:490, duration:300, delay:i*80, ease:'Back.easeOut' });
      ox += bw + 10;

      cont.on('pointerdown', () => {
        if (this._interactLocked) return;
        this._interactLocked = true;
        const correct = val === cfg.correctAnswer;
        // Animate the progression
        this._animPredictFinal(cfg, correct, val);
      });
    });
  }

  async _animPredictFinal(cfg, correct, selected) {
    let c = cfg.startCharge;
    const steps = [];
    while (c < 100 && steps.length < 10) { c += 17; steps.push(c); }
    for (const s of steps) {
      await this._updateFill(Math.min(s,100), 280);
      await this._updatePct(s);
      this._updateVar(s);
      await this._delay(260);
    }
    if (correct) {
      await this._onCorrect();
    } else {
      const correctVal = cfg.correctAnswer;
      const hint = this.add.text(W/2, 440, 'Correct answer: ' + correctVal, {
        fontFamily:'Courier New', fontSize:'13px', color:'#ffd740'
      }).setOrigin(0.5).setDepth(25);
      this._roundEls.push(hint);
      await this._showBit(FEEDBACK.predict_wrong);
      this._hideBit();
      this._loseLife();
      if (this.lives <= 0) { this._gameOver(); return; }
      this._interactLocked = false;
      this._startRound(this.currentRound);
    }
  }

  /* ── Game Over ───────────────────────────────────────────────────────── */
  _gameOver() {
    this._clearRound();
    // Drain core
    this._updateFill(0, 500);
    this._pctTxt && this._pctTxt.setText('0%');
    this._ledDots.forEach(d => { if (d.active) d.setFillStyle(0x1a1a2a).setStrokeStyle(1, 0x2a2a3a); });
    this._ledGlows.forEach(g => { if (g.active) g.setVisible(false); });

    const ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0).setDepth(80);
    this.tweens.add({ targets: ov, alpha: 0.87, duration: 500 });

    this.time.delayedCall(600, () => {
      const gt = this.add.text(W/2, 220, 'GAME OVER', {
        fontFamily:'Arial', fontSize:'38px', color:'#f44336', fontStyle:'bold'
      }).setOrigin(0.5).setDepth(81).setScale(0);
      this.tweens.add({ targets:gt, scaleX:1.1, scaleY:1.1, duration:300, ease:'Back.easeOut', onComplete:()=>this.tweens.add({targets:gt,scaleX:1,scaleY:1,duration:100}) });
      this.add.text(W/2, 290, 'Score: '+this.totalScore, { fontFamily:'Arial', fontSize:'18px', color:'#ffffff' }).setOrigin(0.5).setDepth(81);
      this.add.text(W/2, 320, 'Rounds Completed: '+this.currentRound+' / 10', { fontFamily:'Arial', fontSize:'14px', color:'#78909c' }).setOrigin(0.5).setDepth(81);
      const retryG = this.add.graphics().setDepth(81);
      retryG.lineStyle(2,0xf44336); retryG.strokeRoundedRect(W/2-90,390,180,46,23);
      this.add.text(W/2, 413, 'RETRY', {fontFamily:'Arial',fontSize:'16px',color:'#f44336',fontStyle:'bold'}).setOrigin(0.5).setDepth(82);
      this.add.zone(W/2-90,390,180,46).setOrigin(0).setInteractive({useHandCursor:true}).setDepth(83).on('pointerdown',()=>this.scene.restart());
    });
  }

  /* ── Level Complete ──────────────────────────────────────────────────── */
  _levelComplete() {
    try { GameManager.completeLevel(18, Math.round((this.correctFirstTry/10)*100)); } catch(e) {}
    try { BadgeSystem.unlock('while_schema'); } catch(e) {}

    // Core overcharge
    this._updateFill(100, 400);
    for (let j = 0; j < 2; j++) {
      const cg = this.add.graphics().setDepth(7);
      const start = j === 0 ? 40 : 65;
      this.tweens.add({ targets:{r:start,a:0.2}, r:180, a:0, duration:1200, delay:j*180,
        onUpdate:t=>{const v=t.targets[0];cg.clear();cg.lineStyle(3,0xffd740,v.a);cg.strokeCircle(CORE_X,CORE_Y,v.r);},
        onComplete:()=>cg.destroy() });
    }
    this._ledDots.forEach((d,i)=>this.time.delayedCall(i*180,()=>{if(d.active){this.tweens.add({targets:d,alpha:0.4,duration:150,yoyo:true,repeat:2});}}));

    // Particle fountain (2s)
    const pFount = this.time.addEvent({ delay:80, repeat:24, callback:() => {
      try {
        const p = this.add.particles(CORE_X, CORE_T+10, 'p19', {
          speedY:{min:-180,max:-80}, speedX:{min:-40,max:40},
          tint:[0xffd740,0x00e5ff], lifespan:900, quantity:4, scale:{start:1,end:0}
        }).setDepth(12);
        this.time.delayedCall(1000,()=>{if(p.active)p.destroy();});
      } catch(e) {}
    }});

    // Stars calculation
    const acc = this.correctFirstTry / 10;
    const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    const livesBonus = this.lives * 200;
    const comboBonus = Math.round((this.maxCombo - 1) * 100);
    const grandTotal = this.totalScore + livesBonus + comboBonus;

    this.time.delayedCall(2200, () => {
      const ov = this.add.rectangle(W/2, H/2, W, H, 0x000814, 0).setDepth(90);
      this.tweens.add({ targets:ov, alpha:0.87, duration:500 });

      this.time.delayedCall(550, () => {
        this.add.text(W/2, 55, 'LEVEL COMPLETE!', {fontFamily:'Arial',fontSize:'30px',color:'#ffd740',fontStyle:'bold'}).setOrigin(0.5).setDepth(91);

        const lines = [
          ['Base Score: '+this.totalScore, '#ffffff'],
          ['Combo Bonus: +'+comboBonus, '#ffd740'],
          ['Lives Bonus: +'+livesBonus, '#00e5ff'],
          ['─────────────────', '#546e7a'],
          ['TOTAL: '+grandTotal, '#ffd740'],
        ];
        lines.forEach((ln, i) => {
          this.time.delayedCall(300 + i*280, () => {
            const bold = i===4;
            this.add.text(W/2, 110+i*30, ln[0], {
              fontFamily:'Arial', fontSize:bold?20:15, color:ln[1], fontStyle:bold?'bold':'normal'
            }).setOrigin(0.5).setDepth(91);
          });
        });

        // Stars
        this.time.delayedCall(1600, () => {
          for (let s = 0; s < 3; s++) {
            this.time.delayedCall(s*200, () => {
              const sc = s < stars ? 1.0 : 0.3;
              const st = this.add.text(W/2 - 48 + s*48, 280, '★', {
                fontFamily:'Arial', fontSize:'32px', color: s < stars ? '#ffd740' : '#2a2a4a'
              }).setOrigin(0.5).setDepth(91).setScale(0);
              this.tweens.add({ targets:st, scaleX:1.3, scaleY:1.3, duration:200, ease:'Back.easeOut', onComplete:()=>this.tweens.add({targets:st,scaleX:sc,scaleY:sc,duration:80}) });
            });
          }
        });

        // Badge
        this.time.delayedCall(2200, () => {
          const bg2 = this.add.graphics().setDepth(91).setScale(0);
          bg2.lineStyle(2,0xffd740); bg2.strokeCircle(0,0,26);
          bg2.lineStyle(1.5,0x00e5ff); bg2.strokeCircle(0,0,18);
          bg2.setPosition(W/2, 345);
          this.tweens.add({targets:bg2,scaleX:1,scaleY:1,duration:300,ease:'Back.easeOut'});
          this.add.text(W/2,345,'∞',{fontFamily:'Arial',fontSize:'18px',color:'#ffd740'}).setOrigin(0.5).setDepth(92);
          this.add.text(W/2,380,'WHILE LOOP SCHEMA ACQUIRED',{fontFamily:'Arial',fontSize:'12px',color:'#ffd740',fontStyle:'bold'}).setOrigin(0.5).setDepth(91);
        });

        // Buttons
        this.time.delayedCall(2800, () => {
          const retG = this.add.graphics().setDepth(91);
          retG.lineStyle(1.5,0x78909c); retG.strokeRoundedRect(W/2-230,430,130,40,20);
          this.add.text(W/2-165,450,'RETRY',{fontFamily:'Arial',fontSize:'13px',color:'#78909c'}).setOrigin(0.5).setDepth(92);
          this.add.zone(W/2-230,430,130,40).setOrigin(0).setInteractive({useHandCursor:true}).setDepth(93).on('pointerdown',()=>this.scene.restart());

          const nxtG = this.add.graphics().setDepth(91);
          nxtG.fillStyle(0x00e676); nxtG.fillRoundedRect(W/2+20,430,200,40,20);
          this.add.text(W/2+120,450,'NEXT LEVEL →',{fontFamily:'Arial',fontSize:'13px',color:'#0a0a1a',fontStyle:'bold'}).setOrigin(0.5).setDepth(92);
          this.add.zone(W/2+20,430,200,40).setOrigin(0).setInteractive({useHandCursor:true}).setDepth(93).on('pointerdown',()=>this.scene.start('MenuScene'));
        });
      });
    });

    const saveData = { level:19, score:grandTotal, accuracy:acc, comboMax:this.maxCombo, stars, livesRemaining:this.lives, roundDetails:this.roundResults, timestamp:Date.now() };
    console.log('Level 19 Complete:', saveData);
  }

  /* ── Utilities ───────────────────────────────────────────────────────── */
  _delay(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }

  _floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, { fontFamily:'Arial', fontSize:'14px', color, fontStyle:'bold' }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets:t, y:y-36, alpha:0, duration:700, onComplete:()=>t.destroy() });
    return t;
  }
}
