/**
 * Level9Scene — "Char Code Assessment Terminal" (Restructuring Phase)
 * ===================================================================
 * Complete 6 focused programming tasks about char declarations and
 * escape sequences using a lightweight DOM editor panel.
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";
import { WellbeingAPI } from "../../../api/api.js";
import { BehavioralRules } from "../../ml/BehavioralRules.js";

const W = 1280;
const H = 720;
const TOTAL_QUESTIONS = 6; // Updated to 6
const SKIP_PENALTY = 50;
const ACCURACY_THRESHOLD = 75;
const BONUS_FINAL = 500;

/* ── Validators: full-line flexible (whitespace-tolerant) ── */
function stripComments(s) {
  return s.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function compact(s) {
  return stripComments(s).replace(/\s+/g, " ").trim();
}

function mustMatch(re) {
  return (code) => re.test(compact(code));
}

function mustMatchAll(res) {
  return (code) => {
    const c = compact(code);
    return res.every(r => r.test(c));
  };
}

const QUESTIONS = [
  {
    id: 1,
    title: "Task 1: Basic Declaration",
    instruction: "Declare a char variable named 'grade' with the value 'A'.",
    starter: `// Declare char 'grade' with value 'A'\nchar grade = `,
    validate: mustMatch(/char\s+grade\s*=\s*'A'\s*;/),
    points: 50,
    hints: ["Use single quotes around one letter: 'A'"],
    wrong: [
      { test: (c) => /"/.test(c) && !/'/.test(c), msg: "Double quotes make a String — use single quotes for char!" },
      { test: (c) => /'AB'/.test(compact(c)), msg: "A char holds exactly ONE character inside quotes." },
    ],
  },
  {
    id: 2,
    title: "Task 2: Digit Characters",
    instruction: "Store the number 7 as a character symbol, not an integer.",
    starter: `// Store '7' as a char\nchar luckyNumber = `,
    validate: mustMatch(/char\s+luckyNumber\s*=\s*'7'\s*;/),
    points: 100,
    hints: ["Put single quotes around the number 7.", "char luckyNumber = '7';"],
    wrong: [{ test: (c) => /=\s*7\s*;/.test(c), msg: "That's an integer! Wrap it in single quotes: '7'" }],
  },
  {
    id: 3,
    title: "Task 3: The Space Character",
    instruction: "A space is a valid character. Assign a single space to 'blank'.",
    starter: `char blank = `,
    validate: mustMatch(/char\s+blank\s*=\s*'\s'\s*;/),
    points: 100,
    hints: ["Type a space inside single quotes: ' '"],
    wrong: [{ test: (c) => /''/.test(c), msg: "Empty quotes are invalid. You need exactly one space inside!" }],
  },
  {
    id: 4,
    title: "Task 4: Escape Sequence - Newline",
    instruction: "Declare a char named 'newline' that acts as a line break.",
    starter: `// Escape sequences start with \\\nchar newline = `,
    validate: mustMatch(/char\s+newline\s*=\s*'\\n'\s*;/),
    points: 100,
    hints: ["Use '\\n' (backslash + n)", "char newline = '\\n';"],
    wrong: [],
  },
  {
    id: 5,
    title: "Task 5: Escape Sequence - Single Quote",
    instruction: "Store a literal single quote. Escape it so it doesn't end the char early!",
    starter: `char singleQuote = `,
    validate: mustMatch(/char\s+singleQuote\s*=\s*'\\''\s*;/),
    points: 150,
    hints: ["char singleQuote = '\\'';"],
    wrong: [],
  },
  {
    id: 6,
    title: "Task 6: FINAL - Firewall Bypass",
    instruction: "MISSION: The system is locked! To hack the final firewall, you need to format an override command.\n\nTASK: Declare a char named 'tab' (to align the injection) and a char named 'quote' (to break the security loop). Use proper escape sequences!",
    starter: `// Inject the override payload\nchar tab = \nchar quote = `,
    validate: mustMatchAll([/char\s+tab\s*=\s*'\\t'\s*;/, /char\s+quote\s*=\s*'\\''\s*;/]),
    points: 500,
    hints: ["Use '\\t' for the tab space.", "Use '\\'' to escape the single quote.", "char tab = '\\t';\nchar quote = '\\'';"],
    wrong: [
      { test: (c) => /"/.test(c), msg: "Use single quotes for chars, not double quotes!" }
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════ */
export class Level9Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level9Scene" });
  }

  init() {
    this.wrongSubs = 0;
    if (GameManager.fusionEngine) GameManager.fusionEngine.resetForNewLevel();
    GameManager.interventionInFlight = false;
  }

  create() {
    const cam = this.cameras.main;
    const updateCamera = () => {
      const zoom = Math.min(this.scale.width / W, this.scale.height / H);
      cam.setZoom(zoom);
      cam.centerOn(W / 2, H / 2);

      // domRoot (the DOM code-editor panel) runs setScrollFactor(0) so camera
      // shake() doesn't jitter it — but that also makes it ignore the scroll
      // recentering above, since DOM elements are positioned via
      // camera.matrix (zoom + camera viewport) with scrollX/scrollY applied
      // separately per-object, scaled by scrollFactor. A scrollFactor(0)
      // object's local x therefore lands on-screen at
      // scale.width/2 + zoom * (x - scale.width/2) — so setting its x to
      // scale.width/2 is what actually re-centers it on a wide/pillarboxed
      // screen, not a scrollX change.
      if (this.domRoot) this.domRoot.x = this.scale.width / 2;
    };
    updateCamera();
    this.scale.on('resize', updateCamera, this);
    this.events.once('shutdown', () => this.scale.off('resize', updateCamera, this));

    this.physics.world.gravity.y = 0;

    this.currentQuestion = 0;
    this.score = 0;
    this.hintsUsed = 0;
    this.hintIdx = 0;
    this.correctSubs = 0;
    this.wrongSubs = 0;
    this.skips = 0;
    this.bossBonusEarned = false;
    this.isComplete = false;
    this.gameStarted = false;
    this.startTime = 0;
    this.domRoot = null;
    this.feedbackEl = null;

    this._drawWorld();
    this._generateTextures();
    this._createParticles();
    this._createHeroHud();

    const uiScene = this.scene.get("UIScene");
    if (uiScene?.setLevelLabel) {
      uiScene.setLevelLabel("Level 9: Restructuring — Char Code Assessment");
    }

    this._showIntro();
  }

  _drawWorld() {
    const g = this.add.graphics().setDepth(0);
    const top = 0x1a0a2e;
    const bot = 0x0a0612;
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(top),
        Phaser.Display.Color.IntegerToColor(bot),
        50,
        i
      );
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      // Oversized width so each gradient band covers the canvas regardless
      // of camera position/zoom on any aspect ratio; the Y span is left
      // untouched since it already correctly tiles 0..H (this level's
      // pillarboxing is horizontal only — the height fits the zoom exactly).
      g.fillRect(-W * 2, (H * i) / 50, W * 5, H / 50 + 1);
    }

  }

  _generateTextures() {
    if (!this.textures.exists("goldSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xffd700, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("goldSpark", 8, 8);
      g.destroy();
    }
  }

  _createParticles() {
    this.spark = this.add.particles(0, 0, "goldSpark", {
      speed: { min: 40, max: 180 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 900,
      blendMode: "ADD",
      emitting: false,
    }).setDepth(200);
  }

  _createHeroHud() {
    this.scoreTxt = this.add.text(16, 72, "Score: 0", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#86efac",
    }).setDepth(10);

    this.roomHudText = this.add.text(W / 2, 72, "Task 0 / 6", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#fbbf24",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(10);

    this.hintStatTxt = this.add.text(W - 16, 72, "Hints: 0", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#94a3b8",
    }).setOrigin(1, 0).setDepth(10);
  }

  _showIntro() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(100);

    const panel = this.add.graphics().setDepth(101);
    panel.fillStyle(0x0f172a, 0.98);
    panel.fillRoundedRect(W / 2 - 300, 100, 600, 400, 14);
    panel.lineStyle(2, 0xfbbf24);
    panel.strokeRoundedRect(W / 2 - 300, 100, 600, 400, 14);

    const title = this.add.text(W / 2, 140, "💻 CHAR CODE ASSESSMENT", {
      fontFamily: "Arial Black, Arial",
      fontSize: "20px",
      color: "#fbbf24",
    }).setOrigin(0.5).setDepth(102);

    const st = this.add.text(
      W / 2,
      250,
      "You are accessing the main terminal.\n\n" +
        "Complete 6 programming tasks focusing on 'char' declarations and escape sequences.\n\n" +
        "Java/C-style syntax required: char letter = 'A';\n\n" +
        "Submit when ready · Hints cost nothing · Skip costs -50 pts",
      {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#cbd5e1",
        align: "center",
        lineSpacing: 6,
      }
    )
      .setOrigin(0.5)
      .setDepth(102);

    const btn = this.add.rectangle(W / 2, 430, 220, 48, 0x7c3aed, 1).setDepth(102).setInteractive({ useHandCursor: true });
    const bt = this.add.text(W / 2, 430, "BEGIN ASSESSMENT", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#fff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(103);

    btn.on("pointerover", () => btn.setFillStyle(0x8b5cf6));
    btn.on("pointerout", () => btn.setFillStyle(0x7c3aed));
    btn.on("pointerup", () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      st.destroy();
      btn.destroy();
      bt.destroy();
      this._startAssessment();
    });
  }

  _startAssessment() {
    this.gameStarted = true;
    this.startTime = this.time.now;
    GameManager.set("lives", 5);
    this.currentQuestion = 1;
    this._mountEditor();
    this._loadQuestion(1);
  }

  _mountEditor() {
    const wrap = document.createElement("div");
    wrap.id = "l9-char-assessment-root";
    const gw = this.game?.config?.width ?? W;
    const panelW = Math.max(280, Math.min(752, gw - 24));

    wrap.style.cssText = [
      "box-sizing:border-box",
      "width:" + panelW + "px",
      "max-width:100%",
      "font-family:Consolas,'Courier New',monospace",
      "pointer-events:auto",
    ].join(";");

    wrap.innerHTML = `
      <div id="l9-panel" style="box-sizing:border-box;width:100%;max-width:100%;overflow:hidden;background:rgba(15,23,42,0.98);border:2px solid #fbbf24;border-radius:12px;padding:10px 12px;margin-top:200px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
        <div id="l9-story" style="color:#e2e8f0;font-size:11px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;min-height:64px;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:8px;max-width:100%;"></div>
        <div style="color:#94a3b8;font-size:9px;margin-bottom:6px;word-wrap:break-word;">CODE EDITOR — full lines + semicolons</div>
        <textarea id="l9-code" spellcheck="false" style="display:block;width:100%;max-width:100%;height:130px;background:#020617;color:#4ade80;border:1px solid #334155;border-radius:8px;padding:8px;font-size:12px;resize:vertical;outline:none;box-sizing:border-box;"></textarea>
        <div id="l9-feedback" style="min-height:22px;margin-top:6px;font-size:11px;color:#f87171;word-wrap:break-word;overflow-wrap:anywhere;"></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;justify-content:center;align-items:center;width:100%;box-sizing:border-box;">
          <button type="button" id="l9-submit" style="flex:1 1 auto;min-width:120px;max-width:100%;padding:8px 12px;background:#22c55e;border:none;border-radius:8px;color:#fff;font-weight:bold;cursor:pointer;font-family:inherit;font-size:12px;">SUBMIT CODE</button>
          <button type="button" id="l9-hint" style="flex:1 1 auto;min-width:100px;max-width:100%;padding:8px 12px;background:#3b82f6;border:none;border-radius:8px;color:#fff;font-weight:bold;cursor:pointer;font-family:inherit;font-size:12px;">HINT</button>
          <button type="button" id="l9-skip" style="flex:1 1 auto;min-width:120px;max-width:100%;padding:8px 12px;background:#64748b;border:none;border-radius:8px;color:#fff;font-weight:bold;cursor:pointer;font-family:inherit;font-size:11px;">SKIP (−50)</button>
        </div>
      </div>
    `;

    // x uses the raw canvas center (not W / 2) because this element has
    // scrollFactor(0) — see the domRoot correction in create()'s
    // updateCamera() for why that matters on a wide/pillarboxed screen.
    this.domRoot = this.add.dom(this.scale.width / 2, 0, wrap);
    this.domRoot.setOrigin(0.5, 0);
    this.domRoot.setScrollFactor(0);

    this.feedbackEl = () => document.getElementById("l9-feedback");
    this.codeEl = () => document.getElementById("l9-code");
    this.storyEl = () => document.getElementById("l9-story");

    document.getElementById("l9-submit").addEventListener("click", () => this._submit());
    document.getElementById("l9-hint").addEventListener("click", () => this._hint());
    document.getElementById("l9-skip").addEventListener("click", () => this._skip());
  }

  _loadQuestion(n) {
    const question = QUESTIONS[n - 1];
    if (!question) return;

    this.hintIdx = 0;
    const story = document.getElementById("l9-story");
    const ta = document.getElementById("l9-code");
    if (story) {
      story.innerHTML = `<strong style="color:#fbbf24">${question.title}</strong><br/><span style="color:#cbd5e1">${question.instruction}</span>`;
    }
    if (ta) {
      const start = question.starterFull || question.starter;
      ta.value = typeof start === "string" ? start : "";
      ta.focus();
    }
    if (this.feedbackEl()) this.feedbackEl().textContent = "";

    this.roomHudText.setText(`Task ${n} / ${TOTAL_QUESTIONS}`);
  }

  _submit() {
    if (this.isComplete) return;
    const question = QUESTIONS[this.currentQuestion - 1];
    const code = this.codeEl()?.value || "";

    for (const w of question.wrong || []) {
      if (w.test(code)) {
        this.wrongSubs++;
        if (this.wrongSubs === 3) this.runBehavioralCheck();
        this._setFeedback(w.msg, false);
        return;
      }
    }

    if (question.validate(code)) {
      this.correctSubs++;
      const pts = question.points;
      this.score += pts;
      GameManager.addXP(pts);
      GameManager.addScore(pts);
      this.scoreTxt.setText(`Score: ${this.score}`);
      this._setFeedback(`✓ Correct! +${pts} pts — ${question.title}`, true);
      this.spark.emitParticleAt(W / 2, 320, 20);
      this.cameras.main.flash(200, 52, 211, 76);

      if (this.currentQuestion === TOTAL_QUESTIONS) {
        this.bossBonusEarned = true;
        this.score += BONUS_FINAL;
        GameManager.addXP(BONUS_FINAL);
        GameManager.addScore(BONUS_FINAL);
        this.time.delayedCall(900, () => this._victory());
      } else {
        this.time.delayedCall(650, () => {
          this.currentQuestion++;
          this._loadQuestion(this.currentQuestion);
        });
      }
    } else {
      this.wrongSubs++;
      if (this.wrongSubs === 3) this.runBehavioralCheck();
      this._setFeedback("✗ Not quite — check quotes, escapes, and semicolons. Try again!", false);
      this.cameras.main.shake(120, 0.008);
    }
  }

  /** ML struggle check — reports real submission/timing stats (not rapid-fire: puzzle/coding task). */
  async runBehavioralCheck() {
    const attempts_count = this.correctSubs + this.wrongSubs;
    const time_taken_seconds = (this.time.now - this.startTime) / 1000;
    const misconception_repeat_count = this.wrongSubs;
    const combo_breaks = 0;

    try {
      const { prediction } = await WellbeingAPI.predictStruggle({
        attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks,
      });
      if (this.isComplete) return;
      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, false);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level9Scene: /api/wellbeing/predict-struggle unreachable", e);
    }
  }

  _setFeedback(msg, ok) {
    const el = this.feedbackEl();
    if (el) {
      el.style.color = ok ? "#4ade80" : "#f87171";
      el.textContent = msg;
    }
  }

  _hint() {
    const question = QUESTIONS[this.currentQuestion - 1];
    if (!question?.hints?.length) return;
    this.hintsUsed++;
    this.hintStatTxt.setText(`Hints: ${this.hintsUsed}`);
    const h = question.hints[Math.min(this.hintIdx, question.hints.length - 1)];
    this.hintIdx++;
    this._setFeedback(`💡 Hint: ${h}`, true);
  }

  _skip() {
    if (this.isComplete) return;
    this.skips++;
    this.score = Math.max(0, this.score - SKIP_PENALTY);
    GameManager.addScore(-SKIP_PENALTY);
    this.scoreTxt.setText(`Score: ${this.score}`);
    this._setFeedback(`Skipped (−${SKIP_PENALTY} pts).`, false);

    if (this.currentQuestion === TOTAL_QUESTIONS) {
      this.time.delayedCall(400, () => this._victory());
    } else {
      this.time.delayedCall(400, () => {
        this.currentQuestion++;
        this._loadQuestion(this.currentQuestion);
      });
    }
  }

  _victory() {
    this.isComplete = true;
    const total = this.correctSubs + this.wrongSubs;
    const acc = total > 0 ? Math.round((this.correctSubs / total) * 100) : 0;
    const minCorrect = Math.ceil(TOTAL_QUESTIONS * 0.75);
    const passed = acc >= ACCURACY_THRESHOLD && this.correctSubs >= minCorrect;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mm = Math.floor(elapsed / 60);
    const ss = String(elapsed % 60).padStart(2, "0");

    if (passed) {
      GameManager.completeLevel(8, acc); // ID doesn't change, matches your progress tracker setup
      BadgeSystem.unlock("char_wizard");
      /* saved by GameManager */
      this.cameras.main.flash(500, 255, 215, 100);
      for (let i = 0; i < 12; i++) {
        this.time.delayedCall(i * 80, () =>
          this.spark.emitParticleAt(Phaser.Math.Between(80, W - 80), Phaser.Math.Between(100, 400), 8)
        );
      }
    }

    if (this.domRoot) {
      this.domRoot.destroy();
      this.domRoot = null;
    }

    this._showEndScreen(passed, acc, `${mm}:${ss}`);
  }

  _showEndScreen(passed, acc, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.92).setDepth(300);

    const g = this.add.graphics().setDepth(301);
    g.fillStyle(0x0f172a, 0.98);
    g.fillRoundedRect(W / 2 - 300, 80, 600, 450, 14);
    g.lineStyle(2, 0xfbbf24);
    g.strokeRoundedRect(W / 2 - 300, 80, 600, 450, 14);

    const title = passed ? "🏆 ASSESSMENT PASSED!" : "ASSESSMENT FAILED";
    this.add
      .text(W / 2, 120, title, {
        fontFamily: "Arial Black",
        fontSize: "22px",
        color: passed ? "#fbbf24" : "#f87171",
      })
      .setOrigin(0.5)
      .setDepth(302);

    const lines = [
      `Correct submissions: ${this.correctSubs} / ${TOTAL_QUESTIONS}`,
      `Score: ${this.score}${this.bossBonusEarned ? ` (includes +${BONUS_FINAL} final-task bonus)` : ""}`,
      `Accuracy: ${acc}%`,
      `Time: ${timeStr}`,
      `Hints used: ${this.hintsUsed}`,
      `Skips: ${this.skips}`,
    ];

    lines.forEach((line, i) => {
      this.add
        .text(W / 2, 160 + i * 24, line, {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#e2e8f0",
        })
        .setOrigin(0.5)
        .setDepth(302);
    });

    const learnY = 330;
    if (passed) {
      this.add
        .text(W / 2, learnY, "Badge: Char Champion — char_wizard unlocked!", {
          fontSize: "14px",
          color: "#a78bfa",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(302);

      const bullets = [
        "✓ Chars use single quotes; strings use double quotes",
        "✓ Escape sequences: \\\\n \\\\t \\\\\\\\ \\\\'",
        "✓ Build text from chars; debug quote vs char mistakes",
      ];
      bullets.forEach((b, i) => {
        this.add
          .text(W / 2, learnY + 28 + i * 20, b, { fontSize: "11px", color: "#94a3b8" })
          .setOrigin(0.5)
          .setDepth(302);
      });
    } else {
      this.add
        .text(
          W / 2,
          learnY,
          `Need ${ACCURACY_THRESHOLD}%+ accuracy and ≥${Math.ceil(TOTAL_QUESTIONS * 0.75)} correct submissions.`,
          { fontSize: "13px", color: "#fca5a5" }
        )
        .setOrigin(0.5)
        .setDepth(302);
    }

    const by = 470;
    if (passed) {
      this._endBtn(W / 2 - 110, by, "MAIN MENU", 0x7c3aed, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._endBtn(W / 2 + 110, by, "REPLAY", 0x334155, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
    } else {
      this._endBtn(W / 2 - 100, by, "TRY AGAIN", 0xdc2626, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._endBtn(W / 2 + 100, by, "MENU", 0x475569, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    }
  }

  _endBtn(x, y, label, col, fn) {
    const b = this.add.rectangle(x, y, 180, 42, col, 1).setDepth(302).setInteractive({ useHandCursor: true });
    const t = this.add
      .text(x, y, label, { fontSize: "14px", color: "#fff", fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(303);
    b.on("pointerup", fn);
  }

  shutdown() {
    if (this.domRoot) {
      this.domRoot.destroy();
      this.domRoot = null;
    }
  }
}
