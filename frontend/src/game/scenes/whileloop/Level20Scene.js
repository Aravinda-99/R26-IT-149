import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

const W = 800, H = 600;

const HUD_H = 52;
const CODE_X = 18, CODE_Y = HUD_H + 8, CODE_W = 338, CODE_H = 318;
const ANS_X = 364, ANS_Y = HUD_H + 8, ANS_W = 418, ANS_H = 318;
const DIV_X = 360;
const STAB_CX = 400, STAB_Y = H - 28, STAB_W = 450, STAB_H = 14;
const ANOM_Y0 = HUD_H + 5, ANOM_Y1 = H - 60;
const TIMER_W = 270, TIMER_H = 10, TIMER_Y = HUD_H - 14;

const WAVES = [
  {
    type: "predict_output",
    code: ["int x = 1;", "while (x <= 3) {", "  print(x);", "  x++;", "}"],
    question: "What is printed?",
    options: ["1 2 3", "0 1 2 3", "1 2 3 4", "1 2"],
    correct: 0,
    concept: "while loops repeat as long as the condition is true!",
  },
  {
    type: "fix_bug",
    code: ["int n = 0;", "while (n < 5) {", "  print(n);", "}"],
    question: "Fix the infinite loop:",
    options: ["Add n++; inside loop", "Change n < 5 to n > 5", "Remove the loop", "Change n=0 to n=5"],
    correct: 0,
    concept: "Always update the variable — or loop forever!",
  },
  {
    type: "while_vs_for",
    code: ["for (int i=0; i<4; i++) {", "  print(i);", "}"],
    question: "Equivalent while loop?",
    options: [
      "int i=0; while(i<4){ print(i); i++; }",
      "int i=0; while(i<=4){ print(i); i++; }",
      "int i=1; while(i<4){ print(i); i++; }",
      "while(true){ print(i); }",
    ],
    correct: 0,
    concept: "for and while are two sides of the same loop!",
  },
  {
    type: "trace_variable",
    code: ["int x = 10;", "while (x > 0) {", "  x -= 3;", "}", "print(x);"],
    question: "What is printed?",
    options: ["-2", "0", "1", "-1"],
    correct: 3,
    concept: "Trace variables step-by-step: 10→7→4→1→-2",
  },
  {
    type: "will_it_loop",
    code: ["int x = 5;", "while (x < 3) {", "  print(x);", "  x++;", "}"],
    question: "How many times does the loop body run?",
    options: ["0 times", "3 times", "5 times", "Forever"],
    correct: 0,
    concept: "Condition false at start — loop never runs!",
  },
  {
    type: "predict_output",
    code: ["int i = 2;", "while (i <= 16) {", "  print(i);", "  i *= 2;", "}"],
    question: "What is printed?",
    options: ["2 4 8 16", "2 4 8", "4 8 16", "2 4 8 16 32"],
    correct: 0,
    concept: "Multiplying inside a loop grows exponentially fast!",
  },
  {
    type: "fix_bug",
    code: ["int x = 1;", "while (x = 10) {", "  print(x);", "  x++;", "}"],
    question: "What is the bug?",
    options: ["= should be !=", "= should be <=", "x++ should be x--", "Missing semicolon"],
    correct: 1,
    concept: "= assigns, == compares. Mix them up and chaos follows!",
  },
  {
    type: "while_vs_for",
    code: ["int i=0;", "while(i<10){", "  if(i%2==0)", "    print(i);", "  i++;", "}"],
    question: "Equivalent for loop?",
    options: [
      "for(int i=0;i<10;i++) if(i%2==0) print(i);",
      "for(int i=0;i<=10;i++) if(i%2==0) print(i);",
      "for(int i=1;i<10;i++) if(i%2==0) print(i);",
      "for(int i=0;i<10;i+=2) print(i);",
    ],
    correct: 0,
    concept: "Converting loops — same logic, different syntax!",
  },
  {
    type: "trace_variable",
    code: ["int a=0, b=1;", "while(a < 8){", "  int t=a+b;", "  a=b; b=t;", "}", "print(a);"],
    question: "What is printed?",
    options: ["8", "13", "5", "21"],
    correct: 1,
    concept: "Fibonacci! a traces: 0,1,1,2,3,5,8,13",
  },
  {
    type: "will_it_loop",
    code: ["int x = 1;", "while(x != 0){", "  x = x * 2;", "}"],
    question: "Does this loop terminate?",
    options: ["No — infinite loop", "Yes — stops quickly", "Yes — after 32 steps", "Depends on x"],
    correct: 0,
    concept: "Multiplying a non-zero number never reaches 0 — infinite!",
  },
  {
    type: "predict_output",
    code: ["int sum=0, i=1;", "while(i<=5){", "  sum += i; i++;", "}", "print(sum);"],
    question: "What is printed?",
    options: ["15", "10", "14", "21"],
    correct: 0,
    concept: "Accumulator pattern — sum 1+2+3+4+5 = 15!",
  },
  {
    type: "fix_bug",
    code: ["int n = 100;", "while(n > 1){", "  n = n / 2;", "}", "print(n);"],
    question: "What does print(n) output?",
    options: ["0", "1", "2", "50"],
    correct: 0,
    concept: "Integer division truncates — 100→50→25→12→6→3→1→0",
  },
  {
    type: "while_vs_for",
    code: ["int x=10;", "while(x>=1){", "  print(x);", "  x-=3;", "}"],
    question: "Equivalent for loop?",
    options: [
      "for(int x=10;x>=1;x-=3) print(x);",
      "for(int x=10;x>1;x-=3) print(x);",
      "for(int x=10;x>=0;x-=3) print(x);",
      "for(int x=10;x!=1;x-=3) print(x);",
    ],
    correct: 0,
    concept: "Countdown with step — match the condition exactly!",
  },
  {
    type: "trace_variable",
    code: ["int x=5, y=1;", "while(x>0){", "  y=y*x;", "  x--;", "}", "print(y);"],
    question: "What is printed?",
    options: ["120", "60", "24", "5"],
    correct: 0,
    concept: "Factorial! 5×4×3×2×1 = 120",
  },
  {
    type: "will_it_loop",
    code: ["int x=0;", "while(x<10){", "  x+=3;", "  if(x==9) break;", "}", "print(x);"],
    question: "What is printed?",
    options: ["9", "10", "12", "0"],
    correct: 0,
    concept: "break exits early — x goes 0→3→6→9 → break!",
  },
];

export class Level20Scene extends Phaser.Scene {
  constructor() { super({ key: "Level20Scene" }); }

  init() {
    this._wave = 0;
    this._score = 0;
    this._combo = 0;
    this._stability = 100;
    this._correct = 0;
    this._wrong = 0;
    this._timerVal = 0;
    this._timerEvent = null;
    this._waveEls = [];
    this._locked = false;
    this._gameOver = false;
    this._anomPhase = 0;
    this._anomOrbit = [];
    this._glitchBlocks = [];
  }

  preload() {
    if (!this.textures.exists("anom_orb")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xff00ff, 1); g.fillCircle(4, 4, 4);
      g.generateTexture("anom_orb", 8, 8); g.destroy();
    }
    if (!this.textures.exists("lvl20_spark")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillCircle(3, 3, 3);
      g.generateTexture("lvl20_spark", 6, 6); g.destroy();
    }
  }

  create() {
    if (this.scene.isActive("UIScene")) this.scene.stop("UIScene");
    GameManager.incrementAttempt(19);
    this._buildBG();
    this._buildCRT();
    this._buildHUD();
    this._buildAnomaly();
    this._buildStabilityBar();
    this._buildBit();
    this._buildGlitchBlocks();
    this._startWave();
  }

  update(time, delta) {
    if (this._gameOver) return;
    this._anomPhase += delta * 0.002;
    this._updateAnomalyOrbit();
    this._flickerAnomaly(time);
    this._updateGlitchBlocks(time);
  }

  // ─── Background ───────────────────────────────────────────────────────────

  _buildBG() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0014);
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a0033, 0.4);
    for (let x = 0; x <= W; x += 40) { grid.moveTo(x, 0); grid.lineTo(x, H); }
    for (let y = 0; y <= H; y += 40) { grid.moveTo(0, y); grid.lineTo(W, y); }
    grid.strokePath();

    const frags = ["while", "{}", "!=", "++", "true", "break", "int", "<=", "print", "i++"];
    for (let i = 0; i < 10; i++) {
      const fx = Phaser.Math.Between(20, W - 40);
      const fy = Phaser.Math.Between(HUD_H + 20, H - 40);
      const ft = this.add.text(fx, fy, frags[i], {
        fontFamily: "monospace", fontSize: "11px", color: "#330055",
      }).setAlpha(0.18);
      this.tweens.add({
        targets: ft, y: fy - Phaser.Math.Between(30, 80), alpha: 0,
        duration: Phaser.Math.Between(3000, 7000), delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => { ft.setY(fy); ft.setAlpha(0.18); },
      });
    }

    const edges = this.add.graphics();
    edges.fillStyle(0xff0000, 0.06); edges.fillRect(0, 0, 3, H);
    edges.fillStyle(0x0000ff, 0.06); edges.fillRect(W - 3, 0, 3, H);
    edges.fillStyle(0x00ff00, 0.04); edges.fillRect(0, 0, W, 2);
    edges.fillStyle(0xff00ff, 0.04); edges.fillRect(0, H - 2, W, 2);
  }

  _buildCRT() {
    const crt = this.add.graphics().setDepth(50);
    for (let y = 0; y < H; y += 4) {
      crt.fillStyle(0x000000, 0.12); crt.fillRect(0, y, W, 2);
    }
    const vig = this.add.graphics().setDepth(49);
    for (let r = 0; r < 5; r++) {
      vig.lineStyle(18 + r * 8, 0x000000, 0.06 + r * 0.025);
      vig.strokeRect(0, 0, W, H);
    }
  }

  // ─── Glitch Blocks ────────────────────────────────────────────────────────

  _buildGlitchBlocks() {
    const colors = [0xff00ff, 0x00ffff, 0xff0000, 0xffff00, 0x00ff88];
    for (let i = 0; i < 6; i++) {
      const gb = this.add.rectangle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(HUD_H, H - 20),
        Phaser.Math.Between(30, 120), 3,
        Phaser.Math.RND.pick(colors), 0.4
      ).setDepth(1);
      this._glitchBlocks.push({ obj: gb, next: 0 });
    }
  }

  _updateGlitchBlocks(time) {
    for (const gb of this._glitchBlocks) {
      if (time > gb.next) {
        gb.obj.setX(Phaser.Math.Between(0, W));
        gb.obj.setY(Phaser.Math.Between(HUD_H, H - 20));
        gb.obj.setWidth(Phaser.Math.Between(20, 150));
        gb.obj.setAlpha(Math.random() * 0.45 + 0.05);
        gb.next = time + Phaser.Math.Between(300, 2000);
      }
    }
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────

  _buildHUD() {
    this.add.rectangle(W / 2, HUD_H / 2, W, HUD_H, 0x0d0020, 0.95).setDepth(10);
    this.add.rectangle(W / 2, HUD_H, W, 2, 0x9900ff, 1).setDepth(10);

    this._hudTitle = this.add.text(12, 10, "DEBUG DIMENSION", {
      fontFamily: "monospace", fontSize: "13px", color: "#ff00ff", fontStyle: "bold",
    }).setDepth(10);

    this._hudWave = this.add.text(12, 28, "WAVE 1/15", {
      fontFamily: "monospace", fontSize: "11px", color: "#cc88ff",
    }).setDepth(10);

    this._hudScore = this.add.text(210, 10, "SCORE: 0", {
      fontFamily: "monospace", fontSize: "13px", color: "#00ffff", fontStyle: "bold",
    }).setDepth(10);

    this._hudCombo = this.add.text(210, 28, "COMBO x1", {
      fontFamily: "monospace", fontSize: "11px", color: "#ff8800",
    }).setDepth(10);

    // Timer bar (centered top)
    this.add.rectangle(W / 2, TIMER_Y, TIMER_W, TIMER_H, 0x330033, 1).setDepth(10);
    this._timerBarFill = this.add.rectangle(W / 2, TIMER_Y, TIMER_W, TIMER_H, 0xff00ff, 1)
      .setOrigin(0.5).setDepth(11);
  }

  // ─── Anomaly ──────────────────────────────────────────────────────────────

  _buildAnomaly() {
    this._anomCont = this.add.container(W - 55, ANOM_Y0).setDepth(20);

    this._anomBodyGfx = this.add.graphics();
    this._anomCoreGfx = this.add.graphics();
    this._drawAnomalyBody(this._anomBodyGfx, 0xff00ff);
    this._drawAnomalyCore(this._anomCoreGfx, 0xff00ff);
    this._anomCont.add([this._anomBodyGfx, this._anomCoreGfx]);

    const eye = this.add.graphics();
    eye.fillStyle(0xffffff, 1); eye.fillCircle(0, -2, 6);
    eye.fillStyle(0xff0000, 1); eye.fillCircle(0, -2, 3);
    this._anomCont.add(eye);

    const lbl = this.add.text(0, 22, "GLITCH\nANOMALY", {
      fontFamily: "monospace", fontSize: "8px", color: "#ff44ff", align: "center",
    }).setOrigin(0.5, 0);
    this._anomCont.add(lbl);

    this._anomOrbit = [];
    const cols = [0xff00ff, 0x00ffff, 0xff4400];
    for (let i = 0; i < 3; i++) {
      const g = this.add.graphics().setDepth(21);
      g.fillStyle(cols[i], 1); g.fillCircle(0, 0, 3);
      this._anomOrbit.push({ g, phase: (i / 3) * Math.PI * 2, radius: 28 + i * 6 });
    }
  }

  _drawAnomalyBody(g, color) {
    g.clear();
    g.fillStyle(color, 0.22);
    g.lineStyle(2, color, 0.9);
    const pts = [];
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 18 + (i % 2 === 0 ? 8 : -5);
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
  }

  _drawAnomalyCore(g, color) {
    g.clear();
    g.lineStyle(2, color, 0.7);
    g.strokeCircle(0, 0, 12);
  }

  _updateAnomalyOrbit() {
    const cx = this._anomCont.x;
    const cy = this._anomCont.y;
    for (const o of this._anomOrbit) {
      o.phase += 0.03;
      o.g.setPosition(cx + Math.cos(o.phase) * o.radius, cy + Math.sin(o.phase) * o.radius);
    }
  }

  _flickerAnomaly(time) {
    if (time % 220 < 20) {
      const c = Phaser.Math.RND.pick([0xff00ff, 0x00ffff, 0xffffff]);
      this._drawAnomalyBody(this._anomBodyGfx, c);
      this._drawAnomalyCore(this._anomCoreGfx, c);
    }
  }

  _startAnomalyDescent(duration) {
    this.tweens.add({
      targets: this._anomCont, y: ANOM_Y1, duration, ease: "Linear",
      onComplete: () => {
        if (!this._locked && !this._gameOver) this._onTimeout();
      },
    });
  }

  _resetAnomalyPos() {
    this.tweens.killTweensOf(this._anomCont);
    this._anomCont.setY(ANOM_Y0);
  }

  // ─── Stability Bar ────────────────────────────────────────────────────────

  _buildStabilityBar() {
    this.add.rectangle(STAB_CX, STAB_Y, STAB_W + 4, STAB_H + 4, 0x330033, 1).setDepth(10);
    this.add.rectangle(STAB_CX, STAB_Y, STAB_W, STAB_H, 0x1a0033, 1).setDepth(10);
    this._stabFill = this.add.rectangle(
      STAB_CX - STAB_W / 2, STAB_Y, STAB_W, STAB_H, 0x00ff88, 1
    ).setOrigin(0, 0.5).setDepth(11);
    this._stabLabel = this.add.text(STAB_CX, STAB_Y - STAB_H - 4, "DIMENSION STABILITY: 100%", {
      fontFamily: "monospace", fontSize: "10px", color: "#00ff88",
    }).setOrigin(0.5, 1).setDepth(11);
  }

  _setStability(pct) {
    this._stability = Phaser.Math.Clamp(pct, 0, 100);
    const w = (this._stability / 100) * STAB_W;
    this.tweens.add({ targets: this._stabFill, width: w, duration: 300, ease: "Sine.Out" });
    const col = this._stability > 60 ? 0x00ff88 : this._stability > 30 ? 0xffaa00 : 0xff0044;
    this._stabFill.setFillStyle(col);
    const sc = this._stability > 60 ? "#00ff88" : this._stability > 30 ? "#ffaa00" : "#ff0044";
    this._stabLabel.setText(`DIMENSION STABILITY: ${Math.round(this._stability)}%`).setColor(sc);
    if (this._stability <= 0) this._triggerGameOver();
  }

  // ─── Bit Mascot ───────────────────────────────────────────────────────────

  _buildBit() {
    this._bitCont = this.add.container(W - 85, H - 85).setDepth(25);
    const body = this.add.graphics();
    body.fillStyle(0x6600cc, 1);
    body.fillRoundedRect(-20, -20, 40, 40, 8);
    body.fillStyle(0xffffff, 1);
    body.fillCircle(-7, -5, 5); body.fillCircle(7, -5, 5);
    body.fillStyle(0x220044, 1);
    body.fillCircle(-7, -5, 2); body.fillCircle(7, -5, 2);
    this._bitCont.add(body);

    this._bitSpeech = this.add.text(0, -46, "", {
      fontFamily: "monospace", fontSize: "9px", color: "#cc88ff", align: "center",
      wordWrap: { width: 140 }, backgroundColor: "#0d0020",
      padding: { x: 4, y: 3 },
    }).setOrigin(0.5, 1).setDepth(26);
    this._bitCont.add(this._bitSpeech);
  }

  _bitSay(msg, dur = 2800) {
    this._bitSpeech.setText(msg).setAlpha(1);
    this.tweens.add({ targets: this._bitCont, scaleX: 1.1, scaleY: 1.1, duration: 100, yoyo: true });
    if (this._bitTimer) this._bitTimer.remove();
    this._bitTimer = this.time.delayedCall(dur, () => {
      this.tweens.add({ targets: this._bitSpeech, alpha: 0, duration: 400 });
    });
  }

  // ─── Wave Flow ────────────────────────────────────────────────────────────

  _clearWave() {
    for (const el of this._waveEls) { if (el && el.destroy) el.destroy(); }
    this._waveEls = [];
    if (this._timerEvent) { this._timerEvent.remove(); this._timerEvent = null; }
    this._resetAnomalyPos();
  }

  _startWave() {
    if (this._wave >= WAVES.length) { this._levelComplete(); return; }
    this._clearWave();
    this._locked = false;
    this._hudWave.setText(`WAVE ${this._wave + 1}/15`);

    const waveData = WAVES[this._wave];
    const timeLimits = { predict_output: 18000, fix_bug: 20000, while_vs_for: 22000, trace_variable: 22000, will_it_loop: 15000 };
    const duration = timeLimits[waveData.type] || 18000;

    this._buildCodePanel(waveData);
    this._buildAnswerPanel(waveData);
    this._startTimer(duration);
    this._startAnomalyDescent(duration);
  }

  // ─── Code Panel ───────────────────────────────────────────────────────────

  _buildCodePanel(waveData) {
    const bg = this.add.graphics().setDepth(4);
    bg.fillStyle(0x0d0020, 0.95);
    bg.fillRoundedRect(CODE_X, CODE_Y, CODE_W, CODE_H, 6);
    bg.lineStyle(2, 0x6600cc, 0.8);
    bg.strokeRoundedRect(CODE_X, CODE_Y, CODE_W, CODE_H, 6);
    this._waveEls.push(bg);

    const typeLabels = {
      predict_output: "[ PREDICT OUTPUT ]",
      fix_bug: "[ FIX THE BUG ]",
      while_vs_for: "[ WHILE vs FOR ]",
      trace_variable: "[ TRACE VARIABLE ]",
      will_it_loop: "[ WILL IT LOOP? ]",
    };
    const typeColors = {
      predict_output: "#00ccff", fix_bug: "#ff4444",
      while_vs_for: "#ffaa00", trace_variable: "#44ff88", will_it_loop: "#ff44ff",
    };

    const typeLbl = this.add.text(CODE_X + CODE_W / 2, CODE_Y + 11, typeLabels[waveData.type] || waveData.type, {
      fontFamily: "monospace", fontSize: "11px", color: typeColors[waveData.type] || "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(5);
    this._waveEls.push(typeLbl);
    this.tweens.add({ targets: typeLbl, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });

    const div = this.add.graphics().setDepth(4);
    div.lineStyle(1, 0x440088, 0.5);
    div.moveTo(CODE_X + 8, CODE_Y + 28); div.lineTo(CODE_X + CODE_W - 8, CODE_Y + 28);
    div.strokePath();
    this._waveEls.push(div);

    let lineY = CODE_Y + 36;
    for (const line of waveData.code) {
      const tokens = this._tokenize(line);
      let tx = CODE_X + 10;
      for (const tok of tokens) {
        const t = this.add.text(tx, lineY, tok.text, {
          fontFamily: "monospace", fontSize: "12px", color: tok.color,
        }).setDepth(5);
        this._waveEls.push(t);
        tx += t.width;
      }
      lineY += 18;
    }

    const ql = this.add.text(CODE_X + CODE_W / 2, CODE_Y + CODE_H - 44, waveData.question, {
      fontFamily: "monospace", fontSize: "11px", color: "#ffcc44", align: "center",
      wordWrap: { width: CODE_W - 18 },
    }).setOrigin(0.5, 0).setDepth(5);
    this._waveEls.push(ql);
  }

  _tokenize(line) {
    const keywords = ["while", "for", "if", "int", "print", "break", "true", "false", "return"];
    const result = [];
    const parts = line.split(/(\b\w+\b|[^a-zA-Z0-9_\s]+|\s+)/g).filter(p => p.length > 0);
    for (const p of parts) {
      if (keywords.includes(p)) result.push({ text: p, color: "#ff88ff" });
      else if (/^\d+$/.test(p)) result.push({ text: p, color: "#ffaa44" });
      else if (/^[{}();,]$/.test(p)) result.push({ text: p, color: "#aaaaff" });
      else if (/^[+\-*/%=<>!&|]+$/.test(p)) result.push({ text: p, color: "#ff4488" });
      else if (/^\s+$/.test(p)) result.push({ text: p, color: "#ffffff" });
      else result.push({ text: p, color: "#dddddd" });
    }
    return result;
  }

  // ─── Answer Panel ─────────────────────────────────────────────────────────

  _buildAnswerPanel(waveData) {
    const bg = this.add.graphics().setDepth(4);
    bg.fillStyle(0x06001a, 0.95);
    bg.fillRoundedRect(ANS_X, ANS_Y, ANS_W, ANS_H, 6);
    bg.lineStyle(2, 0x440088, 0.7);
    bg.strokeRoundedRect(ANS_X, ANS_Y, ANS_W, ANS_H, 6);
    this._waveEls.push(bg);

    const hdr = this.add.text(ANS_X + ANS_W / 2, ANS_Y + 11, "SELECT YOUR ANSWER", {
      fontFamily: "monospace", fontSize: "11px", color: "#8844cc",
    }).setOrigin(0.5, 0).setDepth(5);
    this._waveEls.push(hdr);

    // Dashed divider
    const dv = this.add.graphics().setDepth(4);
    dv.lineStyle(1, 0x440088, 0.5);
    for (let y = CODE_Y; y < CODE_Y + CODE_H; y += 10) {
      dv.fillStyle(0x9900ff, 0.45); dv.fillRect(DIV_X, y, 2, 5);
    }
    this._waveEls.push(dv);

    const optH = 52, optPad = 6;
    const startY = ANS_Y + 34;

    waveData.options.forEach((opt, i) => {
      const ox = ANS_X + 10, oy = startY + i * (optH + optPad);
      const ow = ANS_W - 20;

      const optBg = this.add.graphics().setDepth(5);
      const drawDefault = () => {
        optBg.clear();
        optBg.fillStyle(0x1a0033, 0.9);
        optBg.fillRoundedRect(ox, oy, ow, optH, 5);
        optBg.lineStyle(1, 0x6600cc, 0.5);
        optBg.strokeRoundedRect(ox, oy, ow, optH, 5);
      };
      drawDefault();
      this._waveEls.push(optBg);

      const letter = ["A", "B", "C", "D"][i];
      const ll = this.add.text(ox + 10, oy + optH / 2, letter, {
        fontFamily: "monospace", fontSize: "13px", color: "#9944ff", fontStyle: "bold",
      }).setOrigin(0, 0.5).setDepth(6);
      this._waveEls.push(ll);

      const optTxt = this.add.text(ox + 28, oy + optH / 2, opt, {
        fontFamily: "monospace", fontSize: "11px", color: "#ccaaff",
        wordWrap: { width: ow - 38 },
      }).setOrigin(0, 0.5).setDepth(6);
      this._waveEls.push(optTxt);

      const hit = this.add.rectangle(ox + ow / 2, oy + optH / 2, ow, optH, 0x000000, 0)
        .setInteractive({ useHandCursor: true }).setDepth(7);
      this._waveEls.push(hit);

      hit.on("pointerover", () => {
        if (this._locked) return;
        optBg.clear();
        optBg.fillStyle(0x330055, 1);
        optBg.fillRoundedRect(ox, oy, ow, optH, 5);
        optBg.lineStyle(2, 0xaa44ff, 1);
        optBg.strokeRoundedRect(ox, oy, ow, optH, 5);
      });
      hit.on("pointerout", () => { if (!this._locked) drawDefault(); });
      hit.on("pointerdown", () => {
        if (this._locked) return;
        this._onAnswer(i, waveData.correct, optBg, ox, oy, ow, optH, waveData.concept);
      });
    });
  }

  // ─── Timer ────────────────────────────────────────────────────────────────

  _startTimer(duration) {
    this._timerVal = duration;
    this._timerBarFill.setDisplaySize(TIMER_W, TIMER_H);
    const interval = 100;
    this._timerEvent = this.time.addEvent({
      delay: interval, repeat: Math.floor(duration / interval) - 1,
      callback: () => {
        this._timerVal -= interval;
        const pct = Math.max(0, this._timerVal / duration);
        this._timerBarFill.setDisplaySize(TIMER_W * pct, TIMER_H);
        const col = pct > 0.5 ? 0xff00ff : pct > 0.25 ? 0xff8800 : 0xff0000;
        this._timerBarFill.setFillStyle(col);
      },
    });
  }

  // ─── Answer Handling ──────────────────────────────────────────────────────

  _onAnswer(chosen, correct, optBg, ox, oy, ow, optH, concept) {
    this._locked = true;
    if (this._timerEvent) { this._timerEvent.remove(); this._timerEvent = null; }
    this._resetAnomalyPos();

    const isCorrect = chosen === correct;
    optBg.clear();
    optBg.fillStyle(isCorrect ? 0x004422 : 0x330011, 1);
    optBg.fillRoundedRect(ox, oy, ow, optH, 5);
    optBg.lineStyle(3, isCorrect ? 0x00ff88 : 0xff0044, 1);
    optBg.strokeRoundedRect(ox, oy, ow, optH, 5);

    if (isCorrect) {
      this._correct++;
      this._combo++;
      const mult = this._combo >= 5 ? 3 : this._combo >= 3 ? 2 : 1;
      const bonus = Math.floor(this._timerVal / 1000) * 5;
      this._score += 100 * mult + bonus;
      this._hudScore.setText(`SCORE: ${this._score}`);
      this._hudCombo.setText(`COMBO x${mult}`);
      this._bitSay(concept);
      this._flashEffect(0x00ff88, false);
    } else {
      this._wrong++;
      this._combo = 0;
      this._hudCombo.setText("COMBO x1");
      this._setStability(this._stability - 20);
      this._bitSay("Not quite! " + concept);
      this._flashEffect(0xff0044, true);
    }

    this.time.delayedCall(1500, () => { this._wave++; this._startWave(); });
  }

  _onTimeout() {
    if (this._locked) return;
    this._locked = true;
    if (this._timerEvent) { this._timerEvent.remove(); this._timerEvent = null; }
    this._wrong++;
    this._combo = 0;
    this._hudCombo.setText("COMBO x1");
    this._setStability(this._stability - 20);
    this._bitSay("Time's up! " + WAVES[this._wave].concept);
    this._flashEffect(0xff4400, true);
    this.time.delayedCall(1500, () => { this._wave++; this._startWave(); });
  }

  _flashEffect(color, shake) {
    const fl = this.add.rectangle(W / 2, H / 2, W, H, color, 0.15).setDepth(30);
    this.time.delayedCall(300, () => fl.destroy());
    if (shake) this.cameras.main.shake(180, 0.007);
    else {
      this.add.particles(W / 2, H / 2 - 60, "lvl20_spark", {
        speed: { min: 80, max: 200 }, angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 }, lifespan: 600, quantity: 18,
        tint: [color, 0xffffff],
      });
    }
  }

  // ─── Game Over ────────────────────────────────────────────────────────────

  _triggerGameOver() {
    if (this._gameOver) return;
    this._gameOver = true;
    this._locked = true;
    this._clearWave();
    this.cameras.main.shake(500, 0.02);

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(40);
    const t = this.add.text(W / 2, H / 2 - 90, "DIMENSION DESTABILIZED!", {
      fontFamily: "monospace", fontSize: "20px", color: "#ff0044", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: t, alpha: 0.35, duration: 400, yoyo: true, repeat: -1 });

    this.add.text(W / 2, H / 2 - 52, `Reached Wave ${this._wave + 1}/15`, {
      fontFamily: "monospace", fontSize: "13px", color: "#cc88ff",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 - 18, `Score: ${this._score}`, {
      fontFamily: "monospace", fontSize: "16px", color: "#00ccff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(41);

    this._makeButton(W / 2 - 85, H / 2 + 60, "TRY AGAIN", 155, 38, 0x550000, 0xff0044, () => this.scene.restart(), 41);
    this._makeButton(W / 2 + 85, H / 2 + 60, "MENU", 120, 38, 0x220044, 0x9944ff, () => this.scene.start("MenuScene"), 41);
  }

  // ─── Level Complete ───────────────────────────────────────────────────────

  _levelComplete() {
    this._gameOver = true;
    this._locked = true;
    this._clearWave();

    const total = this._correct + this._wrong;
    const acc = total > 0 ? Math.round((this._correct / total) * 100) : 100;
    GameManager.completeLevel(19, acc);
    try { BadgeSystem.unlock("loop_debugger"); } catch (_) {}

    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : 1;
    const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(40);

    this.add.text(W / 2, H / 2 - 130, "DIMENSION STABILIZED!", {
      fontFamily: "monospace", fontSize: "22px", color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 - 96, "LEVEL 20 — DEBUG DIMENSION — COMPLETE", {
      fontFamily: "monospace", fontSize: "12px", color: "#00ffff",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 - 66, starStr, {
      fontFamily: "monospace", fontSize: "34px", color: "#ffcc00",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 - 30, `Score: ${this._score}`, {
      fontFamily: "monospace", fontSize: "18px", color: "#00ff88", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2, `Accuracy: ${acc}%    Waves: ${this._correct}/15 correct`, {
      fontFamily: "monospace", fontSize: "12px", color: "#ccaaff",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 + 24, "BADGE UNLOCKED: Loop Debugger ⚡", {
      fontFamily: "monospace", fontSize: "11px", color: "#ff88ff",
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 + 42, `Stability Remaining: ${Math.round(this._stability)}%`, {
      fontFamily: "monospace", fontSize: "10px", color: "#666688",
    }).setOrigin(0.5).setDepth(41);

    this.add.particles(W / 2, H / 2 - 70, "lvl20_spark", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 }, lifespan: 1200, quantity: 55,
      tint: [0xff00ff, 0x00ffff, 0xffcc00, 0xffffff],
    });

    this._makeButton(W / 2 - 85, H / 2 + 96, "PLAY AGAIN", 155, 38, 0x330066, 0xff00ff, () => this.scene.restart(), 41);
    this._makeButton(W / 2 + 85, H / 2 + 96, "MENU", 120, 38, 0x003333, 0x00ccff, () => this.scene.start("MenuScene"), 41);
  }

  // ─── Utility ──────────────────────────────────────────────────────────────

  _makeButton(cx, cy, label, w, h, fill, stroke, onClick, depth = 10) {
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(fill, 1); g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
    g.lineStyle(2, stroke, 1); g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
    const t = this.add.text(cx, cy, label, {
      fontFamily: "monospace", fontSize: "12px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(depth + 1);
    const hit = this.add.rectangle(cx, cy, w, h, 0, 0)
      .setInteractive({ useHandCursor: true }).setDepth(depth + 2);
    hit.on("pointerover", () => { g.setAlpha(0.75); t.setScale(1.05); });
    hit.on("pointerout", () => { g.setAlpha(1); t.setScale(1); });
    hit.on("pointerdown", onClick);
  }
}
