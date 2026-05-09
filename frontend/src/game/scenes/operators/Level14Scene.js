/**
 * Level14Scene — "Calculation Arena" (Tuning Phase)
 * Combat arena where correct answers deal damage to enemies.
 * 5 waves × 6 enemies = 30 battles covering all operator types.
 */
import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

const W = 800, H = 600;

const WAVES = [
  {
    name: "Arithmetic", icon: "⚡", enemies: 6, hp: 40, time: 12, qs: [
      { q: "5 + 3", a: 8, opts: [8, 2, 15, 1] }, { q: "10 - 4", a: 6, opts: [6, 14, 40, 2] },
      { q: "4 * 3", a: 12, opts: [12, 7, 1, 43] }, { q: "20 / 4", a: 5, opts: [5, 80, 16, 24] },
      { q: "10 % 3", a: 1, opts: [1, 3, 0, 10] }, { q: "7 + 9", a: 16, opts: [16, 2, 63, 79] },
    ]
  },
  {
    name: "Comparison", icon: "🔍", enemies: 6, hp: 50, time: 10, qs: [
      { q: "5 == 5", a: "true", opts: ["true", "false"] }, { q: "10 != 8", a: "true", opts: ["true", "false"] },
      { q: "7 > 3", a: "true", opts: ["true", "false"] }, { q: "2 < 1", a: "false", opts: ["true", "false"] },
      { q: "5 >= 5", a: "true", opts: ["true", "false"] }, { q: "9 <= 4", a: "false", opts: ["true", "false"] },
    ]
  },
  {
    name: "Logical", icon: "🧠", enemies: 6, hp: 60, time: 12, qs: [
      { q: "true && true", a: "true", opts: ["true", "false"] }, { q: "true && false", a: "false", opts: ["true", "false"] },
      { q: "true || false", a: "true", opts: ["true", "false"] }, { q: "false || false", a: "false", opts: ["true", "false"] },
      { q: "!false", a: "true", opts: ["true", "false"] }, { q: "!true", a: "false", opts: ["true", "false"] },
    ]
  },
  {
    name: "Assignment", icon: "📝", enemies: 6, hp: 70, time: 10, qs: [
      { q: "x=10; x+=5; x=?", a: 15, opts: [15, 5, 50, 10] }, { q: "x=20; x-=8; x=?", a: 12, opts: [12, 28, 8, 160] },
      { q: "x=4; x*=3; x=?", a: 12, opts: [12, 7, 1, 43] }, { q: "x=20; x/=4; x=?", a: 5, opts: [5, 80, 16, 24] },
      { q: "x=10; x%=3; x=?", a: 1, opts: [1, 3, 30, 0] }, { q: "x=7; x+=3; x=?", a: 10, opts: [10, 4, 21, 73] },
    ]
  },
  {
    name: "Mixed Boss", icon: "👹", enemies: 6, hp: 80, time: 10, qs: [
      { q: "(5+3)*2", a: 16, opts: [16, 11, 13, 20] }, { q: "20/4 + 3", a: 8, opts: [8, 5, 23, 2] },
      { q: "x=5; x++; x=?", a: 6, opts: [6, 5, 4, 7] }, { q: "x=10; x--; x=?", a: 9, opts: [9, 11, 10, 8] },
      { q: "(7>5)&&(3<6)", a: "true", opts: ["true", "false"] }, { q: "15%4", a: 3, opts: [3, 0, 4, 11] },
    ]
  },
];

function lerpColor(a, b, t) { const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff, br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff; return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t); }

export class Level14Scene extends Phaser.Scene {
  constructor() { super({ key: "Level14Scene" }); }

  create() {
    this.physics.world.gravity.y = 0;
    this.waveIdx = 0; this.enemyIdx = 0; this.score = 0; this.combo = 0;
    this.playerHP = 100; this.playerMaxHP = 100; this.enemyHP = 0; this.enemyMaxHP = 0;
    this.totalBattles = WAVES.reduce((s, w) => s + w.enemies, 0);
    this.battlesWon = 0; this.battlesDone = 0; this.timerEvent = null;
    this.elements = []; this._genTex(); this._drawArena(); this._createHUD();
    this._drawPlayer(); this._drawEnemy();
    const ui = this.scene.get("UIScene");
    if (ui && ui.setLevelLabel) ui.setLevelLabel("Level 14: Calculation Arena");
    this._showIntro();
  }

  _genTex() {
    ["l14_red", "l14_blue", "l14_gold"].forEach((k, i) => {
      if (!this.textures.exists(k)) {
        const g = this.add.graphics(); g.fillStyle([0xff4444, 0x4488ff, 0xffd700][i], 1);
        g.fillCircle(4, 4, 4); g.generateTexture(k, 8, 8); g.destroy();
      }
    });
  }

  _drawArena() {
    const gfx = this.add.graphics().setDepth(0);
    for (let i = 0; i < 60; i++) { const t = i / 60; gfx.fillStyle(lerpColor(0x1a0a0a, 0x0a0a1a, t), 1); gfx.fillRect(0, Math.floor(H * i / 60), W, Math.ceil(H / 60) + 1); }
    // Floor
    const fg = this.add.graphics().setDepth(1);
    fg.fillStyle(0x333333, 1); fg.fillRect(0, 480, W, 120);
    fg.lineStyle(1, 0x555555, 0.3);
    for (let x = 0; x < W; x += 40)fg.lineBetween(x, 480, x, H);
    for (let y = 480; y < H; y += 40)fg.lineBetween(0, y, W, y);
    // Torches
    [80, 720].forEach(x => {
      [200, 400].forEach(y => {
        const tc = this.add.circle(x, y, 6, 0xff6600, 0.8).setDepth(2);
        this.tweens.add({ targets: tc, alpha: { from: 0.5, to: 1 }, scale: { from: 0.8, to: 1.2 }, duration: 300 + Math.random() * 200, yoyo: true, repeat: -1 });
      });
    });
  }

  _drawPlayer() {
    this.playerGfx = this.add.container(220, 420).setDepth(10);
    const body = this.add.rectangle(0, 0, 40, 60, 0x3b82f6);
    const head = this.add.circle(0, -40, 16, 0x60a5fa);
    const shield = this.add.circle(-25, 0, 18, 0x94a3b8); shield.setStrokeStyle(2, 0x64748b);
    const visor = this.add.rectangle(0, -40, 12, 4, 0x1e293b);
    this.playerGfx.add([body, head, shield, visor]);
    this.tweens.add({ targets: this.playerGfx, y: 418, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }

  _drawEnemy() {
    this.enemyGfx = this.add.container(580, 420).setDepth(10);
    const body = this.add.rectangle(0, 0, 50, 65, 0xdc2626);
    const head = this.add.circle(0, -42, 18, 0xb91c1c);
    const lh = this.add.triangle(-15, -60, 0, 0, -8, 0, -4, -15, 0xfbbf24);
    const rh = this.add.triangle(15, -60, 0, 0, 8, 0, 4, -15, 0xfbbf24);
    const le = this.add.circle(-8, -42, 5, 0xff0000); le.setStrokeStyle(1, 0xffffff);
    const re = this.add.circle(8, -42, 5, 0xff0000); re.setStrokeStyle(1, 0xffffff);
    this.enemyGfx.add([body, head, lh, rh, le, re]);
    this.tweens.add({ targets: this.enemyGfx, scaleY: 1.04, duration: 800, yoyo: true, repeat: -1 });
  }

  _createHUD() {
    const d = 100;
    this.waveTxt = this.add.text(W / 2, 12, "Wave 1/5", { fontFamily: "Arial", fontSize: "14px", color: "#fbbf24", fontStyle: "bold" }).setOrigin(0.5).setDepth(d);
    this.scoreTxt = this.add.text(16, 12, `Score: 0`, { fontFamily: "Arial", fontSize: "14px", color: "#e2e8f0", fontStyle: "bold" }).setDepth(d);
    this.comboTxt = this.add.text(W - 16, 12, "", { fontFamily: "Arial", fontSize: "14px", color: "#f59e0b", fontStyle: "bold" }).setOrigin(1, 0).setDepth(d);
    // HP bars
    this.pHPbg = this.add.rectangle(220, 370, 120, 12, 0x1e293b).setStrokeStyle(1, 0x475569).setDepth(d);
    this.pHPfill = this.add.rectangle(160, 370, 120, 10, 0x22c55e).setOrigin(0, 0.5).setDepth(d + 1);
    this.pHPtxt = this.add.text(220, 370, "100/100", { fontFamily: "Arial", fontSize: "9px", color: "#fff" }).setOrigin(0.5).setDepth(d + 2);
    this.eHPbg = this.add.rectangle(580, 370, 120, 12, 0x1e293b).setStrokeStyle(1, 0x475569).setDepth(d);
    this.eHPfill = this.add.rectangle(520, 370, 120, 10, 0xef4444).setOrigin(0, 0.5).setDepth(d + 1);
    this.eHPtxt = this.add.text(580, 370, "", { fontFamily: "Arial", fontSize: "9px", color: "#fff" }).setOrigin(0.5).setDepth(d + 2);
    // Timer bar
    this.timerBg = this.add.rectangle(W / 2, 32, 400, 8, 0x334155).setDepth(d);
    this.timerFill = this.add.rectangle(W / 2 - 200, 32, 400, 6, 0x22c55e).setOrigin(0, 0.5).setDepth(d + 1);
    // Question panel
    this.qPanel = this.add.graphics().setDepth(d);
    this.qPanel.fillStyle(0x1e293b, 0.95); this.qPanel.fillRoundedRect(W / 2 - 250, 50, 500, 80, 12);
    this.qPanel.lineStyle(2, 0x3b82f6, 0.6); this.qPanel.strokeRoundedRect(W / 2 - 250, 50, 500, 80, 12);
    this.qTxt = this.add.text(W / 2, 90, "", { fontFamily: "Courier New", fontSize: "28px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(d + 1);
  }

  _addEl(...els) { els.forEach(e => this.elements.push(e)); }
  _clear() { this.elements.forEach(e => { try { e.destroy(); } catch { } }); this.elements = []; }

  _updateHP() {
    const pw = Math.max(0, (this.playerHP / this.playerMaxHP) * 120);
    this.pHPfill.width = pw;
    this.pHPfill.setFillStyle(this.playerHP < 30 ? 0xef4444 : this.playerHP < 60 ? 0xfbbf24 : 0x22c55e);
    this.pHPtxt.setText(`${this.playerHP}/${this.playerMaxHP}`);
    const ew = Math.max(0, (this.enemyHP / this.enemyMaxHP) * 120);
    this.eHPfill.width = ew;
    this.eHPtxt.setText(`${this.enemyHP}/${this.enemyMaxHP}`);
  }

  _showIntro() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x1a0a0a, 0.98); pg.fillRoundedRect(W / 2 - 280, 70, 560, 440, 16);
    pg.lineStyle(3, 0xef4444); pg.strokeRoundedRect(W / 2 - 280, 70, 560, 440, 16);
    const t1 = this.add.text(W / 2, 110, "⚔️ CALCULATION ARENA ⚔️", { fontFamily: "Arial", fontSize: "26px", color: "#ef4444", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    const t2 = this.add.text(W / 2, 150, "Battle enemies with math!", { fontFamily: "Arial", fontSize: "16px", color: "#fca5a5" }).setOrigin(0.5).setDepth(202);
    const t3 = this.add.text(W / 2, 260,
      "Enemies challenge you with operator questions.\n\n" +
      "✅ Correct answer → YOU attack the enemy!\n" +
      "❌ Wrong answer → Enemy attacks YOU!\n" +
      "⏱️ Time runs out → Enemy attacks!\n\n" +
      "Survive 5 waves (30 battles) to win!\n" +
      "Build combos for bonus damage!",
      { fontFamily: "Arial", fontSize: "14px", color: "#cbd5e1", align: "center", lineSpacing: 6 }).setOrigin(0.5).setDepth(202);
    const bb = this.add.rectangle(W / 2, 450, 220, 48, 0xef4444).setDepth(202).setInteractive({ useHandCursor: true });
    bb.setStrokeStyle(2, 0xfca5a5);
    const bt = this.add.text(W / 2, 450, "ENTER ARENA", { fontFamily: "Arial", fontSize: "18px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    bb.on("pointerover", () => { bb.setFillStyle(0xdc2626); });
    bb.on("pointerout", () => { bb.setFillStyle(0xef4444); });
    bb.on("pointerup", () => { [ov, pg, t1, t2, t3, bb, bt].forEach(e => e.destroy()); this._startWave(); });
  }

  _startWave() {
    this._clear();
    const w = WAVES[this.waveIdx];
    this.waveTxt.setText(`Wave ${this.waveIdx + 1}/5: ${w.icon} ${w.name}`);
    this.enemyIdx = 0;
    // Wave intro
    const wt = this.add.text(W / 2, H / 2, `${w.icon} WAVE ${this.waveIdx + 1}\n${w.name}`, { fontFamily: "Arial", fontSize: "32px", color: "#fbbf24", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: wt, alpha: 0, y: H / 2 - 40, duration: 1500, delay: 800, onComplete: () => { wt.destroy(); this._spawnEnemy(); } });
  }

  _spawnEnemy() {
    this._clear();
    const w = WAVES[this.waveIdx];
    this.enemyHP = w.hp; this.enemyMaxHP = w.hp;
    this._updateHP();
    // Entrance
    this.enemyGfx.setAlpha(0); this.enemyGfx.x = 700;
    this.tweens.add({ targets: this.enemyGfx, alpha: 1, x: 580, duration: 400, ease: "Back.out", onComplete: () => this._askQuestion() });
  }

  _askQuestion() {
    this._clear();
    if (this.timerEvent) this.timerEvent.destroy();
    const w = WAVES[this.waveIdx];
    const q = w.qs[this.enemyIdx % w.qs.length];
    this.qTxt.setText(`${q.q} = ?`);
    // Timer
    this.timerFill.width = 400; this.timerFill.setFillStyle(0x22c55e);
    const dur = w.time * 1000;
    this.timerEvent = this.tweens.add({
      targets: this.timerFill, width: 0, duration: dur, ease: "Linear",
      onUpdate: () => { const pct = this.timerFill.width / 400; this.timerFill.setFillStyle(pct < 0.25 ? 0xef4444 : pct < 0.5 ? 0xfbbf24 : 0x22c55e); },
      onComplete: () => this._handleAnswer(null, q)
    });
    // Options
    const shuffled = [...q.opts].sort(() => Math.random() - 0.5);
    const gap = Math.min(150, 600 / shuffled.length);
    const sx = W / 2 - ((shuffled.length - 1) * gap) / 2;
    shuffled.forEach((opt, i) => {
      const bx = sx + i * gap;
      const bg = this.add.graphics().setDepth(100);
      bg.fillStyle(0x1e293b, 1); bg.fillRoundedRect(bx - 60, 500, 120, 50, 10);
      bg.lineStyle(2, 0x475569); bg.strokeRoundedRect(bx - 60, 500, 120, 50, 10);
      const txt = this.add.text(bx, 525, String(opt), { fontFamily: "Courier New", fontSize: "18px", color: "#e2e8f0", fontStyle: "bold" }).setOrigin(0.5).setDepth(101);
      const hit = this.add.rectangle(bx, 525, 120, 50).setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(102);
      hit.on("pointerover", () => { bg.clear(); bg.fillStyle(0x3b82f6, 0.3); bg.fillRoundedRect(bx - 60, 500, 120, 50, 10); bg.lineStyle(2, 0x3b82f6); bg.strokeRoundedRect(bx - 60, 500, 120, 50, 10); });
      hit.on("pointerout", () => { bg.clear(); bg.fillStyle(0x1e293b, 1); bg.fillRoundedRect(bx - 60, 500, 120, 50, 10); bg.lineStyle(2, 0x475569); bg.strokeRoundedRect(bx - 60, 500, 120, 50, 10); });
      hit.on("pointerup", () => this._handleAnswer(String(opt), q));
      this._addEl(bg, txt, hit);
    });
  }

  _handleAnswer(picked, q) {
    if (this.timerEvent) this.timerEvent.stop();
    this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());
    this.battlesDone++;
    const correct = picked === String(q.a);

    if (correct) {
      this.battlesWon++; this.combo++;
      const mult = this.combo >= 20 ? 3 : this.combo >= 10 ? 2 : this.combo >= 5 ? 1.5 : 1;
      const dmg = Math.round(40 * mult);
      this.enemyHP = Math.max(0, this.enemyHP - dmg);
      this.score += Math.round(100 * mult);
      this.scoreTxt.setText(`Score: ${this.score}`);
      GameManager.addXP(Math.round(50 * mult)); GameManager.addScore(100);
      // Attack animation
      const proj = this.add.circle(220, 420, 8, 0x3b82f6).setDepth(50);
      this.tweens.add({
        targets: proj, x: 580, y: 420, duration: 300, onComplete: () => {
          proj.destroy();
          this.cameras.main.shake(100, 0.005);
          const p = this.add.particles(580, 420, "l14_red", { speed: { min: 60, max: 150 }, scale: { start: 1, end: 0 }, lifespan: 400, emitting: false }).setDepth(50);
          p.emitParticleAt(580, 420, 15); this.time.delayedCall(500, () => p.destroy());
          // Damage popup
          const dt = this.add.text(580, 380, `-${dmg}`, { fontFamily: "Arial", fontSize: "20px", color: "#ef4444", fontStyle: "bold" }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets: dt, y: 340, alpha: 0, duration: 800, onComplete: () => dt.destroy() });
          this._updateHP();
        }
      });
      // Combo text
      if (this.combo >= 5) {
        const emoji = this.combo >= 20 ? "🔥🔥🔥" : this.combo >= 10 ? "🔥🔥" : "🔥";
        this.comboTxt.setText(`COMBO x${this.combo}! ${emoji}`);
        this.tweens.add({ targets: this.comboTxt, scale: { from: 1.3, to: 1 }, duration: 200 });
      } else { this.comboTxt.setText(this.combo > 1 ? `Combo: ${this.combo}` : ""); }
    } else {
      // Enemy attacks player
      this.combo = 0; this.comboTxt.setText("");
      this.playerHP = Math.max(0, this.playerHP - 20);
      const proj = this.add.circle(580, 420, 8, 0xef4444).setDepth(50);
      this.tweens.add({
        targets: proj, x: 220, y: 420, duration: 300, onComplete: () => {
          proj.destroy(); this.cameras.main.shake(200, 0.01);
          const dt = this.add.text(220, 380, "-20", { fontFamily: "Arial", fontSize: "20px", color: "#ef4444", fontStyle: "bold" }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets: dt, y: 340, alpha: 0, duration: 800, onComplete: () => dt.destroy() });
          this._updateHP();
        }
      });
    }

    this.time.delayedCall(800, () => {
      if (this.playerHP <= 0) { this._showGameOver(); return; }
      if (this.enemyHP <= 0) {
        // Enemy defeated
        const dp = this.add.particles(580, 420, "l14_gold", { speed: { min: 60, max: 200 }, scale: { start: 1, end: 0 }, lifespan: 600, emitting: false }).setDepth(50);
        dp.emitParticleAt(580, 420, 20); this.time.delayedCall(700, () => dp.destroy());
        this.enemyIdx++;
        if (this.enemyIdx >= WAVES[this.waveIdx].enemies) {
          this.waveIdx++;
          if (this.waveIdx >= WAVES.length) { this.time.delayedCall(500, () => this._showResults()); return; }
          this.time.delayedCall(500, () => this._startWave());
        } else { this.time.delayedCall(500, () => this._spawnEnemy()); }
      } else { this._askQuestion(); }
    });
  }

  _showGameOver() {
    this._clear();
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    this.add.text(W / 2, H / 2 - 30, "💀 Defeated!", { fontFamily: "Arial", fontSize: "28px", color: "#f87171", fontStyle: "bold" }).setOrigin(0.5).setDepth(201);
    this.add.text(W / 2, H / 2 + 10, `Score: ${this.score} | Battles: ${this.battlesWon}/${this.battlesDone}`, { fontFamily: "Arial", fontSize: "14px", color: "#94a3b8" }).setOrigin(0.5).setDepth(201);
    const rb = this.add.rectangle(W / 2 - 90, H / 2 + 60, 150, 44, 0xef4444).setDepth(201).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 - 90, H / 2 + 60, "Retry", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    rb.on("pointerup", () => this.scene.restart());
    const mb = this.add.rectangle(W / 2 + 90, H / 2 + 60, 150, 44, 0x475569).setDepth(201).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 + 90, H / 2 + 60, "Menu", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    mb.on("pointerup", () => this.scene.start("MenuScene"));
  }

  _showResults() {
    this._clear();
    const acc = this.battlesDone > 0 ? Math.round((this.battlesWon / this.battlesDone) * 100) : 0;
    const passed = acc >= 60;
    if (passed) { GameManager.completeLevel(13, acc); BadgeSystem.unlock("combat_calculator"); ProgressTracker.saveProgress(GameManager.getState()); this.cameras.main.flash(600, 100, 255, 100); }
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x1a0a0a, 0.98); pg.fillRoundedRect(W / 2 - 260, 80, 520, 440, 16);
    pg.lineStyle(3, passed ? 0x4ade80 : 0xef4444); pg.strokeRoundedRect(W / 2 - 260, 80, 520, 440, 16);
    this.add.text(W / 2, 115, passed ? "⚔️ ARENA CHAMPION! ⚔️" : "⚔️ Good Effort!", { fontFamily: "Arial", fontSize: "24px", color: passed ? "#4ade80" : "#fbbf24", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    this.add.text(W / 2, 155, `Battles Won: ${this.battlesWon}/${this.totalBattles}`, { fontFamily: "Arial", fontSize: "16px", color: "#e2e8f0" }).setOrigin(0.5).setDepth(202);
    this.add.text(W / 2, 180, `Accuracy: ${acc}% | Score: ${this.score} | Max Combo: ${this.combo}`, { fontFamily: "Arial", fontSize: "13px", color: "#94a3b8" }).setOrigin(0.5).setDepth(202);
    let wy = 220;
    WAVES.forEach((w, i) => {
      const done = i < this.waveIdx || (i === this.waveIdx && this.enemyIdx >= w.enemies);
      this.add.text(W / 2, wy, `${w.icon} ${w.name}: ${done ? "✓" : "—"}`, { fontFamily: "Arial", fontSize: "13px", color: done ? "#4ade80" : "#64748b" }).setOrigin(0.5).setDepth(202);
      wy += 22;
    });
    if (passed) {
      this.add.text(W / 2, wy + 15, "🏆 Badge: Combat Calculator ⚔️", { fontFamily: "Arial", fontSize: "16px", color: "#ffd700", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
      const cp = this.add.particles(0, 0, "l14_gold", { speed: { min: 40, max: 180 }, angle: { min: 230, max: 310 }, scale: { start: 1, end: 0.3 }, lifespan: 2500, gravityY: 120, emitting: false }).setDepth(210);
      cp.emitParticleAt(W / 2, 200, 40);
    }
    const by = 460;
    if (passed) {
      const nb = this.add.rectangle(W / 2 - 90, by, 160, 44, 0xef4444).setDepth(202).setInteractive({ useHandCursor: true });
      this.add.text(W / 2 - 90, by, "Level 15 →", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
      nb.on("pointerup", () => { GameManager.set("currentLevel", 15); GameManager.resetLevel(); this.scene.start("Level15Scene"); });
    }
    const rb = this.add.rectangle(W / 2 + 90, by, 160, 44, 0x475569).setDepth(202).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 + 90, by, passed ? "Replay" : "Retry", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    rb.on("pointerup", () => this.scene.restart());
  }
}
