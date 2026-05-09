/**
 * Level13Scene — "Math Magic Academy" (Accretion Phase)
 * ======================================================
 * Wizard academy where operators are spells. 5 chapters cover
 * arithmetic, comparison, logical, assignment, inc/dec operators.
 */
import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

const W = 800, H = 600;

const CHAPTERS = [
  {
    name: "Arithmetic Spells", icon: "✨", color: 0x7c3aed, spells: [
      { op: "+", q: "5 + 3 = ?", ans: 8, opts: [8, 2, 15, 1], tip: "+ combines numbers!", code: "int r = 5 + 3; // 8" },
      { op: "-", q: "10 - 4 = ?", ans: 6, opts: [6, 14, 40, 2], tip: "- removes the second from the first!", code: "int r = 10 - 4; // 6" },
      { op: "*", q: "4 * 3 = ?", ans: 12, opts: [12, 7, 1, 43], tip: "* makes groups of numbers!", code: "int r = 4 * 3; // 12" },
      { op: "/", q: "12 / 3 = ?", ans: 4, opts: [4, 36, 9, 15], tip: "/ divides into equal parts!", code: "int r = 12 / 3; // 4" },
      { op: "%", q: "10 % 3 = ?", ans: 1, opts: [1, 3, 0, 10], tip: "% gives the remainder after division!", code: "int r = 10 % 3; // 1" },
    ]
  },
  {
    name: "Comparison Spells", icon: "🔍", color: 0x0ea5e9, spells: [
      { op: "==", q: "5 == 5 → ?", ans: "true", opts: ["true", "false", "5", "0"], tip: "== checks if two values are EQUAL", code: "boolean r = (5 == 5); // true" },
      { op: "!=", q: "5 != 3 → ?", ans: "true", opts: ["true", "false", "2", "8"], tip: "!= checks if values are DIFFERENT", code: "boolean r = (5 != 3); // true" },
      { op: ">", q: "7 > 3 → ?", ans: "true", opts: ["true", "false", "4", "10"], tip: "> checks if left is bigger", code: "boolean r = (7 > 3); // true" },
      { op: "<", q: "2 < 9 → ?", ans: "true", opts: ["true", "false", "7", "11"], tip: "< checks if left is smaller", code: "boolean r = (2 < 9); // true" },
    ]
  },
  {
    name: "Logical Spells", icon: "🧠", color: 0xf59e0b, spells: [
      { op: "&&", q: "true && true → ?", ans: "true", opts: ["true", "false"], tip: "&& requires BOTH to be true", code: "boolean r = true && true; // true" },
      { op: "||", q: "true || false → ?", ans: "true", opts: ["true", "false"], tip: "|| requires AT LEAST ONE true", code: "boolean r = true || false; // true" },
      { op: "!", q: "!false → ?", ans: "true", opts: ["true", "false"], tip: "! FLIPS the value", code: "boolean r = !false; // true" },
    ]
  },
  {
    name: "Assignment Spells", icon: "📝", color: 0x10b981, spells: [
      { op: "=", q: "int x = 5;\nWhat is x?", ans: 5, opts: [5, 0, "null", "undefined"], tip: "= STORES a value in a variable", code: "int x = 5; // x is 5" },
      { op: "+=", q: "int x = 10;\nx += 5;\nx = ?", ans: 15, opts: [15, 5, 50, 10], tip: "+= is shorthand for x = x + 5", code: "x += 5; // same as x = x + 5" },
      { op: "-=", q: "int x = 20;\nx -= 8;\nx = ?", ans: 12, opts: [12, 28, 8, 20], tip: "-= is shorthand for x = x - 8", code: "x -= 8; // same as x = x - 8" },
    ]
  },
  {
    name: "Inc/Dec Spells", icon: "⏫", color: 0xec4899, spells: [
      { op: "++", q: "int x = 5;\nx++;\nx = ?", ans: 6, opts: [6, 5, 4, 7], tip: "++ adds 1 to the variable", code: "x++; // same as x = x + 1" },
      { op: "--", q: "int lives = 3;\nlives--;\nlives = ?", ans: 2, opts: [2, 3, 4, 1], tip: "-- subtracts 1 from the variable", code: "lives--; // same as x = x - 1" },
    ]
  },
];

function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t);
}

export class Level13Scene extends Phaser.Scene {
  constructor() { super({ key: "Level13Scene" }); }

  create() {
    this.physics.world.gravity.y = 0;
    this.chapterIdx = 0;
    this.spellIdx = 0;
    this.score = 0;
    this.lives = 3;
    this.totalSpells = CHAPTERS.reduce((s, c) => s + c.spells.length, 0);
    this.spellsDone = 0;
    this.correct = 0;
    this.elements = [];
    this._genTex();
    this._drawBg();
    this._createHUD();
    const ui = this.scene.get("UIScene");
    if (ui && ui.setLevelLabel) ui.setLevelLabel("Level 13: Math Magic Academy");
    this._showIntro();
  }

  _genTex() {
    if (!this.textures.exists("l13_spark")) {
      const g = this.add.graphics(); g.fillStyle(0xffd700, 1); g.fillCircle(4, 4, 4);
      g.generateTexture("l13_spark", 8, 8); g.destroy();
    }
  }

  _drawBg() {
    const gfx = this.add.graphics().setDepth(0);
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      gfx.fillStyle(lerpColor(0x1a0533, 0x0f172a, t), 1);
      gfx.fillRect(0, Math.floor(H * i / 60), W, Math.ceil(H / 60) + 1);
    }
    // Stars
    for (let i = 0; i < 80; i++) {
      const s = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.5, 2), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.8)).setDepth(1);
      this.tweens.add({ targets: s, alpha: { from: s.alpha, to: 0.1 }, duration: Phaser.Math.Between(1500, 4000), yoyo: true, repeat: -1 });
    }
  }

  _createHUD() {
    const d = 100;
    this.scoreTxt = this.add.text(16, 68, `Score: 0`, { fontFamily: "Arial", fontSize: "16px", color: "#ffd700", fontStyle: "bold" }).setDepth(d);
    this.livesTxt = this.add.text(W - 16, 68, "", { fontFamily: "Arial", fontSize: "18px" }).setOrigin(1, 0).setDepth(d);
    this._updateLives();
    this.progTxt = this.add.text(W / 2, 68, "Spell 0/0", { fontFamily: "Arial", fontSize: "12px", color: "#a78bfa" }).setOrigin(0.5, 0).setDepth(d);
    this.progBarBg = this.add.rectangle(W / 2, 88, 300, 10, 0x334155).setDepth(d);
    this.progBarFill = this.add.rectangle(W / 2 - 150, 88, 0, 8, 0x7c3aed).setOrigin(0, 0.5).setDepth(d + 1);
  }

  _updateLives() { this.livesTxt.setText("⭐".repeat(this.lives) + "☆".repeat(3 - this.lives)); }
  _updateProg() {
    this.progTxt.setText(`Spell ${this.spellsDone}/${this.totalSpells}`);
    this.tweens.add({ targets: this.progBarFill, width: 300 * (this.spellsDone / this.totalSpells), duration: 300, ease: "Cubic.out" });
  }

  _addEl(...els) { els.forEach(e => this.elements.push(e)); }
  _clear() { this.elements.forEach(e => { try { e.destroy(); } catch { } }); this.elements = []; }

  // ─── INTRO ───
  _showIntro() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x1a0533, 0.98); pg.fillRoundedRect(W / 2 - 300, 60, 600, 460, 16);
    pg.lineStyle(3, 0x7c3aed); pg.strokeRoundedRect(W / 2 - 300, 60, 600, 460, 16);
    const t1 = this.add.text(W / 2, 100, "🎓 MATH MAGIC ACADEMY", { fontFamily: "Arial", fontSize: "26px", color: "#a78bfa", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    const t2 = this.add.text(W / 2, 140, "Learn Operator Spells!", { fontFamily: "Arial", fontSize: "16px", color: "#c4b5fd" }).setOrigin(0.5).setDepth(202);
    const t3 = this.add.text(W / 2, 230,
      "Welcome, young wizard! Every operator is a magical spell.\n\n" +
      "✨ Arithmetic: +, -, *, /, %\n" +
      "🔍 Comparison: ==, !=, >, <\n" +
      "🧠 Logical: &&, ||, !\n" +
      "📝 Assignment: =, +=, -=\n" +
      "⏫ Increment: ++, --\n\n" +
      "Master all 5 chapters to graduate!",
      { fontFamily: "Arial", fontSize: "14px", color: "#cbd5e1", align: "center", lineSpacing: 6 }).setOrigin(0.5).setDepth(202);
    const bb = this.add.rectangle(W / 2, 460, 220, 48, 0x7c3aed).setDepth(202).setInteractive({ useHandCursor: true });
    bb.setStrokeStyle(2, 0xa78bfa);
    const bt = this.add.text(W / 2, 460, "BEGIN TRAINING", { fontFamily: "Arial", fontSize: "18px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    bb.on("pointerover", () => { bb.setFillStyle(0x6d28d9); this.tweens.add({ targets: [bb, bt], scaleX: 1.06, scaleY: 1.06, duration: 100 }); });
    bb.on("pointerout", () => { bb.setFillStyle(0x7c3aed); this.tweens.add({ targets: [bb, bt], scaleX: 1, scaleY: 1, duration: 100 }); });
    bb.on("pointerup", () => { [ov, pg, t1, t2, t3, bb, bt].forEach(e => e.destroy()); this._showChapterIntro(); });
  }

  // ─── CHAPTER INTRO ───
  _showChapterIntro() {
    this._clear();
    const ch = CHAPTERS[this.chapterIdx];
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(200);
    const bg = this.add.graphics().setDepth(201);
    bg.fillStyle(0x1e1b4b, 0.95); bg.fillRoundedRect(W / 2 - 250, H / 2 - 100, 500, 200, 16);
    bg.lineStyle(3, ch.color); bg.strokeRoundedRect(W / 2 - 250, H / 2 - 100, 500, 200, 16);
    const ic = this.add.text(W / 2, H / 2 - 50, ch.icon, { fontSize: "48px" }).setOrigin(0.5).setDepth(202);
    const nm = this.add.text(W / 2, H / 2 + 10, `Chapter ${this.chapterIdx + 1}: ${ch.name}`, { fontFamily: "Arial", fontSize: "22px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    const ct = this.add.text(W / 2, H / 2 + 45, `${ch.spells.length} spells to master`, { fontFamily: "Arial", fontSize: "14px", color: "#94a3b8" }).setOrigin(0.5).setDepth(202);
    this.tweens.add({ targets: ic, scale: { from: 0, to: 1 }, duration: 500, ease: "Back.out" });
    this.time.delayedCall(1500, () => { [ov, bg, ic, nm, ct].forEach(e => e.destroy()); this.spellIdx = 0; this._showSpell(); });
  }

  // ─── SPELL ───
  _showSpell() {
    this._clear();
    const ch = CHAPTERS[this.chapterIdx];
    const sp = ch.spells[this.spellIdx];
    this._updateProg();

    // Chapter label
    this._addEl(this.add.text(W / 2, 110, `${ch.icon} ${ch.name} — Spell ${this.spellIdx + 1}/${ch.spells.length}`,
      { fontFamily: "Arial", fontSize: "12px", color: "#94a3b8" }).setOrigin(0.5).setDepth(10));

    // Spell circle (rotating rune ring)
    const ring = this.add.container(W / 2, 260).setDepth(10);
    const glow = this.add.circle(0, 0, 120, ch.color, 0.08); ring.add(glow);
    const border = this.add.circle(0, 0, 120); border.setStrokeStyle(2, ch.color, 0.5); ring.add(border);
    this.tweens.add({ targets: ring, angle: 360, duration: 20000, repeat: -1 });
    this.tweens.add({ targets: glow, scale: { from: 1, to: 1.15 }, alpha: { from: 0.08, to: 0.2 }, duration: 1500, yoyo: true, repeat: -1 });
    this._addEl(ring);

    // Operator symbol
    const opTxt = this.add.text(W / 2, 210, sp.op, { fontFamily: "Courier New", fontSize: "48px", color: "#ffd700", fontStyle: "bold" }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: opTxt, scale: { from: 0, to: 1 }, duration: 400, ease: "Back.out" });
    this._addEl(opTxt);

    // Question
    const qTxt = this.add.text(W / 2, 280, sp.q, { fontFamily: "Courier New", fontSize: "20px", color: "#e2e8f0", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(20);
    this._addEl(qTxt);

    // Options
    const shuffled = [...sp.opts].sort(() => Math.random() - 0.5);
    const gap = Math.min(140, 560 / shuffled.length);
    const startX = W / 2 - ((shuffled.length - 1) * gap) / 2;

    shuffled.forEach((opt, i) => {
      const bx = startX + i * gap;
      const bg = this.add.graphics().setDepth(20);
      bg.fillStyle(0x1e293b, 1); bg.fillRoundedRect(bx - 55, 360, 110, 50, 10);
      bg.lineStyle(2, 0x475569); bg.strokeRoundedRect(bx - 55, 360, 110, 50, 10);
      const txt = this.add.text(bx, 385, String(opt), { fontFamily: "Courier New", fontSize: "18px", color: "#e2e8f0", fontStyle: "bold" }).setOrigin(0.5).setDepth(21);
      const hit = this.add.rectangle(bx, 385, 110, 50).setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(22);

      hit.on("pointerover", () => { bg.clear(); bg.fillStyle(ch.color, 0.3); bg.fillRoundedRect(bx - 55, 360, 110, 50, 10); bg.lineStyle(2, ch.color); bg.strokeRoundedRect(bx - 55, 360, 110, 50, 10); });
      hit.on("pointerout", () => { bg.clear(); bg.fillStyle(0x1e293b, 1); bg.fillRoundedRect(bx - 55, 360, 110, 50, 10); bg.lineStyle(2, 0x475569); bg.strokeRoundedRect(bx - 55, 360, 110, 50, 10); });
      hit.on("pointerup", () => this._checkAnswer(String(opt), sp, ch, bg, bx));
      this._addEl(bg, txt, hit);
    });
  }

  _checkAnswer(picked, sp, ch, bg, bx) {
    // Disable all
    this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());
    const isCorrect = picked === String(sp.ans);

    if (isCorrect) {
      this.correct++;
      this.score += 50;
      this.scoreTxt.setText(`Score: ${this.score}`);
      GameManager.addXP(50);
      GameManager.addScore(50);
      // Flash green
      this.cameras.main.flash(200, 50, 200, 50);
      // Particles
      const p = this.add.particles(W / 2, 260, "l13_spark", { speed: { min: 80, max: 250 }, scale: { start: 1.2, end: 0 }, lifespan: 700, blendMode: "ADD", emitting: false }).setDepth(50);
      p.emitParticleAt(W / 2, 260, 25);
      this.time.delayedCall(800, () => p.destroy());
    } else {
      this.lives = Math.max(0, this.lives - 1);
      this._updateLives();
      this.cameras.main.shake(200, 0.01);
      GameManager.loseLife();
    }

    // Show feedback
    this._showSpellFeedback(isCorrect, sp, ch);
  }

  _showSpellFeedback(isCorrect, sp, ch) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(300);
    const pg = this.add.graphics().setDepth(301);
    const fc = isCorrect ? 0x10b981 : 0xef4444;
    pg.fillStyle(0x1e293b, 0.98); pg.fillRoundedRect(W / 2 - 260, 140, 520, 340, 16);
    pg.lineStyle(3, fc); pg.strokeRoundedRect(W / 2 - 260, 140, 520, 340, 16);

    const icon = this.add.text(W / 2, 175, isCorrect ? "✅ CORRECT!" : "❌ WRONG!", { fontFamily: "Arial", fontSize: "22px", color: isCorrect ? "#4ade80" : "#f87171", fontStyle: "bold" }).setOrigin(0.5).setDepth(302);
    const ans = this.add.text(W / 2, 210, `Answer: ${sp.ans}`, { fontFamily: "Courier New", fontSize: "16px", color: "#ffd700" }).setOrigin(0.5).setDepth(302);
    const tip = this.add.text(W / 2, 245, `💡 ${sp.tip}`, { fontFamily: "Arial", fontSize: "13px", color: "#94a3b8", wordWrap: { width: 460 }, align: "center" }).setOrigin(0.5).setDepth(302);

    // Code box
    const cbg = this.add.graphics().setDepth(301);
    cbg.fillStyle(0x0f172a, 1); cbg.fillRoundedRect(W / 2 - 200, 275, 400, 60, 8);
    const cd = this.add.text(W / 2, 305, sp.code, { fontFamily: "Courier New", fontSize: "13px", color: "#67e8f9", align: "center" }).setOrigin(0.5).setDepth(302);

    const nb = this.add.rectangle(W / 2, 420, 180, 44, ch.color).setDepth(302).setInteractive({ useHandCursor: true });
    nb.setStrokeStyle(2, 0xffffff, 0.3);
    const nt = this.add.text(W / 2, 420, "Next →", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(303);
    nb.on("pointerup", () => {
      [ov, pg, icon, ans, tip, cbg, cd, nb, nt].forEach(e => e.destroy());
      this._nextSpell();
    });
  }

  _nextSpell() {
    this.spellsDone++;
    this.spellIdx++;
    const ch = CHAPTERS[this.chapterIdx];
    if (this.lives <= 0) { this._showGameOver(); return; }
    if (this.spellIdx >= ch.spells.length) {
      this.chapterIdx++;
      if (this.chapterIdx >= CHAPTERS.length) { this._showResults(); return; }
      this._showChapterIntro();
    } else {
      this._showSpell();
    }
  }

  _showGameOver() {
    this._clear();
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const t = this.add.text(W / 2, H / 2 - 30, "💀 Training Failed!", { fontFamily: "Arial", fontSize: "28px", color: "#f87171", fontStyle: "bold" }).setOrigin(0.5).setDepth(201);
    const s = this.add.text(W / 2, H / 2 + 10, `Score: ${this.score}  |  Spells: ${this.spellsDone}/${this.totalSpells}`, { fontFamily: "Arial", fontSize: "14px", color: "#94a3b8" }).setOrigin(0.5).setDepth(201);
    const rb = this.add.rectangle(W / 2 - 100, H / 2 + 60, 160, 44, 0x7c3aed).setDepth(201).setInteractive({ useHandCursor: true });
    const rt = this.add.text(W / 2 - 100, H / 2 + 60, "Retry", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    rb.on("pointerup", () => this.scene.restart());
    const mb = this.add.rectangle(W / 2 + 100, H / 2 + 60, 160, 44, 0x475569).setDepth(201).setInteractive({ useHandCursor: true });
    const mt = this.add.text(W / 2 + 100, H / 2 + 60, "Menu", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    mb.on("pointerup", () => this.scene.start("MenuScene"));
  }

  _showResults() {
    this._clear();
    const acc = this.totalSpells > 0 ? Math.round((this.correct / this.totalSpells) * 100) : 0;
    const passed = acc >= 60;

    if (passed) {
      GameManager.completeLevel(12, acc);
      BadgeSystem.unlock("math_wizard");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 100, 255, 100);
    }

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x1a0533, 0.98); pg.fillRoundedRect(W / 2 - 280, 60, 560, 480, 16);
    pg.lineStyle(3, passed ? 0x4ade80 : 0xef4444); pg.strokeRoundedRect(W / 2 - 280, 60, 560, 480, 16);

    this.add.text(W / 2, 95, passed ? "🎓 WIZARD GRADUATION! 🎓" : "📚 Keep Studying!", { fontFamily: "Arial", fontSize: "24px", color: passed ? "#4ade80" : "#fbbf24", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    this.add.text(W / 2, 135, `Spells Mastered: ${this.correct}/${this.totalSpells}`, { fontFamily: "Arial", fontSize: "16px", color: "#e2e8f0" }).setOrigin(0.5).setDepth(202);
    this.add.text(W / 2, 165, `Accuracy: ${acc}%   |   Score: ${this.score}`, { fontFamily: "Arial", fontSize: "14px", color: "#94a3b8" }).setOrigin(0.5).setDepth(202);

    // Chapter breakdown
    let cy = 210;
    CHAPTERS.forEach((ch, i) => {
      const done = i < this.chapterIdx || (i === this.chapterIdx);
      this.add.text(W / 2, cy, `${ch.icon} ${ch.name}: ${done ? "✓" : "—"}`, { fontFamily: "Arial", fontSize: "13px", color: done ? "#4ade80" : "#64748b" }).setOrigin(0.5).setDepth(202);
      cy += 24;
    });

    if (passed) {
      this.add.text(W / 2, cy + 15, "🏆 Badge: Math Wizard 🧙", { fontFamily: "Arial", fontSize: "16px", color: "#ffd700", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
      // Confetti
      const cp = this.add.particles(0, 0, "l13_spark", { speed: { min: 40, max: 180 }, angle: { min: 230, max: 310 }, scale: { start: 1, end: 0.3 }, lifespan: 2500, gravityY: 120, emitting: false }).setDepth(210);
      cp.emitParticleAt(W / 2, 200, 40);
    }

    // Buttons
    const by = 480;
    if (passed) {
      const nb = this.add.rectangle(W / 2 - 90, by, 160, 44, 0x7c3aed).setDepth(202).setInteractive({ useHandCursor: true });
      this.add.text(W / 2 - 90, by, "Level 14 →", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
      nb.on("pointerup", () => { GameManager.set("currentLevel", 14); GameManager.resetLevel(); this.scene.start("Level14Scene"); });
    }
    const rb = this.add.rectangle(W / 2 + 90, by, 160, 44, 0x475569).setDepth(202).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 + 90, by, passed ? "Replay" : "Retry", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    rb.on("pointerup", () => this.scene.restart());
  }
}
