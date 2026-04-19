/**
 * Level9Scene — "Char Quest: The Typing Adventure" (Restructuring Phase)
 * =======================================================================
 * Adventure RPG: type Java-style char solutions to clear 20 rooms across
 * Castle → Forest → Mountain → Volcano. DOM code editor + story panels.
 *
 * Schema Theory: Restructuring — applying char knowledge in practical code
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

const W = 800;
const H = 600;
const TOTAL_ROOMS = 20;
const SKIP_PENALTY = 50;
const ACCURACY_THRESHOLD = 75;
const BONUS_FINAL = 500;

/* ── Room validators: full-line flexible (whitespace-tolerant) ── */
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

/**
 * ROOMS 1–20 — story, starter template, points, hints, validate()
 */
const ROOMS = [
  {
    id: 1,
    zone: "castle",
    title: "🏰 The Entrance Gate",
    story: "A guard blocks your path:\n\"Declare a char variable named password with the value 'A'!\"",
    starter: `// Declare char variable 'password' with value 'A'\nchar password = `,
    validate: mustMatch(/char\s+password\s*=\s*'A'\s*;/),
    points: 50,
    hints: [
      "Use single quotes around one letter: 'A'",
      "Full line: char password = 'A';",
    ],
    wrong: [
      { test: (c) => /"/.test(c) && !/'/.test(c), msg: "Double quotes make a String — use single quotes for char!" },
      { test: (c) => /'AB'/.test(compact(c)), msg: "A char holds exactly ONE character inside quotes." },
    ],
  },
  {
    id: 2,
    zone: "castle",
    title: "📚 The Royal Library",
    story: "A magical book asks:\n\"The first letter is 'A'. What comes next in the alphabet?\"",
    starter: `char first = 'A';\nchar second = `,
    validate: mustMatch(/char\s+first\s*=\s*'A'\s*;\s*char\s+second\s*=\s*'B'\s*;/),
    points: 50,
    hints: ["After 'A' comes 'B'.", "char second = 'B';"],
    wrong: [],
  },
  {
    id: 3,
    zone: "castle",
    title: "🔢 The Number Vault",
    story: "The safe asks for the CHARACTER for digit five — not the number 5!",
    starter: `// Store the character '5' (not int 5!)\nchar digitFive = `,
    validate: mustMatch(/char\s+digitFive\s*=\s*'5'\s*;/),
    points: 75,
    hints: ["Use quotes: '5' is a char; 5 alone is an int.", "char digitFive = '5';"],
    wrong: [
      { test: (c) => /=\s*5\s*;/.test(compact(c)) && !/'5'/.test(compact(c)), msg: "That's a NUMBER — use quotes: '5'" },
    ],
  },
  {
    id: 4,
    zone: "castle",
    title: "⚡ The Symbol Chamber",
    story: "Capture the @ symbol in a char variable named atSymbol.",
    starter: `char atSymbol = `,
    validate: mustMatch(/char\s+atSymbol\s*=\s*'@'\s*;/),
    points: 75,
    hints: ["Symbols use single quotes too: '@'", "char atSymbol = '@';"],
    wrong: [],
  },
  {
    id: 5,
    zone: "castle",
    title: "🌌 The Space Portal",
    story: "\"The hardest char is the one you cannot see!\" Declare a SPACE character.",
    starter: `// One space BETWEEN the quotes: ' '\nchar space = `,
    validate: mustMatch(/char\s+space\s*=\s*'\s'\s*;/),
    points: 100,
    hints: ["Type a space between the quotes: ' then SPACE then '", "'' is empty — ' ' is one space char."],
    wrong: [
      { test: (c) => /=\s*''\s*;/.test(compact(c)), msg: "'' is EMPTY. You need one space: ' '" },
    ],
  },
  {
    id: 6,
    zone: "forest",
    title: "🌲 The Newline Bridge",
    story: "Repair the bridge with a NEWLINE character — it splits text to the next line!",
    starter: `// Escape sequences start with \\\nchar newline = `,
    validate: mustMatch(/char\s+newline\s*=\s*'\\n'\s*;/),
    points: 100,
    hints: ["Newline in char: '\\n' (backslash + n)", "char newline = '\\n';"],
    wrong: [],
  },
  {
    id: 7,
    zone: "forest",
    title: "🕳️ The Tab Cave",
    story: "Create a TAB for indentation — used to align text in output.",
    starter: `char tab = `,
    validate: mustMatch(/char\s+tab\s*=\s*'\\t'\s*;/),
    points: 100,
    hints: ["Tab escape: '\\t'", "char tab = '\\t';"],
    wrong: [],
  },
  {
    id: 8,
    zone: "forest",
    title: "🪓 The Backslash Puzzle",
    story: "Store a single backslash. In source code you must escape it: '\\\\' → one \\.",
    starter: `// Two backslashes between quotes = one \\ char\nchar backslash = `,
    validate: mustMatch(/char\s+backslash\s*=\s*'\\\\'\s*;/),
    points: 100,
    hints: ["Literal backslash char is written '\\' in Java/C++ style.", "char backslash = '\\\\';"],
    wrong: [],
  },
  {
    id: 9,
    zone: "forest",
    title: "💬 The Quote Dilemma",
    story: "Store a single quote character — escape it inside single quotes: \\'",
    starter: `char quote = `,
    validate: mustMatch(/char\s+quote\s*=\s*'\\''\s*;/),
    points: 100,
    hints: ["Use: '\\''  (backslash + quote between outer quotes)", "char quote = '\\'';"],
    wrong: [],
  },
  {
    id: 10,
    zone: "forest",
    title: "🌲 Forest Exit",
    story: "Complete the spell: set newline so \"Hi\" and \"Bye\" can sit on two lines.",
    starter: `char h = 'H';\nchar i = 'i';\nchar newline = `,
    validate: mustMatch(/char\s+newline\s*=\s*'\\n'\s*;/),
    points: 150,
    hints: ["Same as the bridge: '\\n'", "char newline = '\\n';"],
    wrong: [],
  },
  {
    id: 11,
    zone: "mountain",
    title: "⛰️ The Name Carver",
    story: "Spell CAT — three chars, letter by letter.",
    starter: `// Spell "CAT"\nchar letter1 = \nchar letter2 = \nchar letter3 = `,
    validate: mustMatchAll([
      /char\s+letter1\s*=\s*'C'\s*;/,
      /char\s+letter2\s*=\s*'A'\s*;/,
      /char\s+letter3\s*=\s*'T'\s*;/,
    ]),
    points: 100,
    hints: ["Three lines: 'C', 'A', 'T'", "letter1 = 'C'; letter2 = 'A'; letter3 = 'T';"],
    wrong: [],
  },
  {
    id: 12,
    zone: "mountain",
    title: "🔠 Case Cavern",
    story: "Uppercase and lowercase are DIFFERENT chars. Show both 'A' and 'a'.",
    starter: `char upper = \nchar lower = `,
    validate: mustMatchAll([
      /char\s+upper\s*=\s*'A'\s*;/,
      /char\s+lower\s*=\s*'a'\s*;/,
    ]),
    points: 100,
    hints: ["'A' ≠ 'a' — they are two different char values.", "char upper = 'A';\nchar lower = 'a';"],
    wrong: [],
  },
  {
    id: 13,
    zone: "mountain",
    title: "🎨 Pattern Workshop",
    story: "Reuse two variables to build pattern A B A B — only need chars 'A' and 'B'.",
    starter: `char a = \nchar b = `,
    validate: mustMatchAll([
      /char\s+a\s*=\s*'A'\s*;/,
      /char\s+b\s*=\s*'B'\s*;/,
    ]),
    points: 150,
    hints: ["char a = 'A';\nchar b = 'B';"],
    wrong: [],
  },
  {
    id: 14,
    zone: "mountain",
    title: "🔐 Secret Message",
    story: "Decode \"H I\" — letter, SPACE, letter (not \"HI\").",
    starter: `char h = \nchar space = \nchar i = `,
    validate: mustMatchAll([
      /char\s+h\s*=\s*'H'\s*;/,
      /char\s+space\s*=\s*'\s'\s*;/,
      /char\s+i\s*=\s*'I'\s*;/,
    ]),
    points: 150,
    hints: ["Middle must be space char: ' '", "char h = 'H'; char space = ' '; char i = 'I';"],
    wrong: [],
  },
  {
    id: 15,
    zone: "mountain",
    title: "🏔️ Mountain Peak",
    story: "Build CODE then a newline — five char declarations.",
    starter: `char c = \nchar o = \nchar d = \nchar e = \nchar newline = `,
    validate: mustMatchAll([
      /char\s+c\s*=\s*'C'\s*;/,
      /char\s+o\s*=\s*'O'\s*;/,
      /char\s+d\s*=\s*'D'\s*;/,
      /char\s+e\s*=\s*'E'\s*;/,
      /char\s+newline\s*=\s*'\\n'\s*;/,
    ]),
    points: 200,
    hints: ["Last line: char newline = '\\n';", "Letters C,O,D,E then newline."],
    wrong: [],
  },
  {
    id: 16,
    zone: "volcano",
    title: "🔥 The Error Detector",
    story: "Buggy code used double quotes. Write the FIXED declaration with single quotes.",
    starter: `// WRONG: char bad = \"X\";\n// Your fix:\nchar fixed = `,
    validate: mustMatch(/char\s+fixed\s*=\s*'X'\s*;/),
    points: 150,
    hints: ["char fixed = 'X'; — single quotes only!"],
    wrong: [],
  },
  {
    id: 17,
    zone: "volcano",
    title: "🪤 The Multi-Char Trap",
    story: "'ABC' in quotes is invalid for char. Store only the FIRST letter.",
    starter: `// char wrong = 'ABC'; // too many!\nchar firstLetter = `,
    validate: mustMatch(/char\s+firstLetter\s*=\s*'A'\s*;/),
    points: 150,
    hints: ["One char only: 'A'", "char firstLetter = 'A';"],
    wrong: [],
  },
  {
    id: 18,
    zone: "volcano",
    title: "📋 Format Chamber",
    story: "Use a TAB escape to align labels and values in formatted output.",
    starter: `char tab = `,
    validate: mustMatch(/char\s+tab\s*=\s*'\\t'\s*;/),
    points: 200,
    hints: ["char tab = '\\t';"],
    wrong: [],
  },
  {
    id: 19,
    zone: "volcano",
    title: "💼 Real-World Path",
    story: "File paths need a backslash char — store it the same way as before: escaped.",
    starter: `char c = 'C';\nchar colon = ':';\nchar backslash = `,
    validate: mustMatchAll([
      /char\s+c\s*=\s*'C'\s*;/,
      /char\s+colon\s*=\s*':'\s*;/,
      /char\s+backslash\s*=\s*'\\\\'\s*;/,
    ]),
    points: 200,
    hints: ["char backslash = '\\\\';"],
    wrong: [],
  },
  {
    id: 20,
    zone: "volcano",
    title: "🔥 FINAL BOSS — Char Master",
    story: "Combine everything: quotes, newlines, and backslash — declare all five specials.",
    starter: `// Fill ALL five lines exactly:\nchar quote = \nchar quote2 = \nchar newline1 = \nchar backslash = \nchar newline2 = `,
    validate: mustMatchAll([
      /char\s+quote\s*=\s*'\\''\s*;/,
      /char\s+quote2\s*=\s*'\\''\s*;/,
      /char\s+newline1\s*=\s*'\\n'\s*;/,
      /char\s+backslash\s*=\s*'\\\\'\s*;/,
      /char\s+newline2\s*=\s*'\\n'\s*;/,
    ]),
    points: 500,
    hints: [
      "quote lines: '\\''",
      "newlines: '\\n'",
      "backslash literal: '\\\\'",
    ],
    wrong: [],
  },
];

/* ═══════════════════════════════════════════════════════════════ */
export class Level9Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level9Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    this.currentRoom = 0;
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
    this._createMapMarkers();
    this._createHeroHud();

    const uiScene = this.scene.get("UIScene");
    if (uiScene?.setLevelLabel) {
      uiScene.setLevelLabel("Level 9: Restructuring — Char Quest!");
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
      g.fillRect(0, (H * i) / 50, W, H / 50 + 1);
    }

    this.add.text(W / 2, 22, "CHAR QUEST", {
      fontFamily: "Georgia, serif",
      fontSize: "22px",
      color: "#fbbf24",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);

    this.add.text(W / 2, 44, "Kingdom of Code", {
      fontFamily: "Georgia, serif",
      fontSize: "12px",
      color: "#94a3b8",
    }).setOrigin(0.5).setDepth(5);
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

  _createMapMarkers() {
    const zones = [
      { emoji: "🏰", label: "Castle", range: "1-5", x: 120, y: 115, c: 0x6366f1 },
      { emoji: "🌲", label: "Forest", range: "6-10", x: 310, y: 115, c: 0x22c55e },
      { emoji: "⛰️", label: "Mountain", range: "11-15", x: 500, y: 115, c: 0x94a3b8 },
      { emoji: "🔥", label: "Volcano", range: "16-20", x: 690, y: 115, c: 0xef4444 },
    ];
    this.zoneLabels = [];
    zones.forEach(z => {
      const r = this.add.rectangle(z.x, z.y, 150, 64, z.c, 0.15).setDepth(3).setStrokeStyle(1, z.c, 0.4);
      const t = this.add.text(z.x, z.y - 8, `${z.emoji}\n${z.label}\n[${z.range}]`, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#e2e8f0",
        align: "center",
      }).setOrigin(0.5).setDepth(4);
      this.zoneLabels.push({ r, t, ...z });
    });

    this.heroMarker = this.add.text(W / 2, 168, "🧙", { fontSize: "28px" }).setOrigin(0.5).setDepth(6);
    this.roomHudText = this.add.text(W / 2, 198, "Room 0 / 20", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#fbbf24",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(6);
  }

  _createHeroHud() {
    this.scoreTxt = this.add.text(16, 72, "Score: 0", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#86efac",
    }).setDepth(10);

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
    panel.fillRoundedRect(40, 40, W - 80, H - 80, 14);
    panel.lineStyle(2, 0xfbbf24);
    panel.strokeRoundedRect(40, 40, W - 80, H - 80, 14);

    const title = this.add.text(W / 2, 85, "⌨️ CHAR QUEST: THE TYPING ADVENTURE", {
      fontFamily: "Arial Black, Arial",
      fontSize: "20px",
      color: "#fbbf24",
    }).setOrigin(0.5).setDepth(102);

    const st = this.add.text(
      W / 2,
      200,
      "You are a Programming Hero rescuing the Kingdom of Code.\n\n" +
        "Each room needs correct char declarations — type real code in the editor.\n" +
        "Java/C-style syntax: char name = 'X';  Escape: '\\\\n'  '\\\\t'  '\\\\\\\\'  '\\\\''\n\n" +
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

    const btn = this.add.rectangle(W / 2, 480, 220, 48, 0x7c3aed, 1).setDepth(102).setInteractive({ useHandCursor: true });
    const bt = this.add.text(W / 2, 480, "BEGIN QUEST", {
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
      this._startQuest();
    });
  }

  _startQuest() {
    this.gameStarted = true;
    this.startTime = this.time.now;
    GameManager.set("lives", 3);
    this.currentRoom = 1;
    this._mountEditor();
    this._loadRoom(1);
  }

  _mountEditor() {
    const wrap = document.createElement("div");
    wrap.id = "l9-char-quest-root";
    /* Fit inside 800×600 canvas: Phaser positions this node — do NOT set left/transform
       (they fight Phaser’s matrix() and clip the panel on the right). */
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

    this.domRoot = this.add.dom(W / 2, 0, wrap);
    this.domRoot.setOrigin(0.5, 0);
    this.domRoot.setScrollFactor(0);

    this.feedbackEl = () => document.getElementById("l9-feedback");
    this.codeEl = () => document.getElementById("l9-code");
    this.storyEl = () => document.getElementById("l9-story");

    document.getElementById("l9-submit").addEventListener("click", () => this._submit());
    document.getElementById("l9-hint").addEventListener("click", () => this._hint());
    document.getElementById("l9-skip").addEventListener("click", () => this._skip());
  }

  _loadRoom(n) {
    const room = ROOMS[n - 1];
    if (!room) return;

    this.hintIdx = 0;
    const story = document.getElementById("l9-story");
    const ta = document.getElementById("l9-code");
    if (story) {
      story.innerHTML = `<strong style="color:#fbbf24">${room.title}</strong><br/><span style="color:#cbd5e1">${room.story.replace(/\n/g, "<br/>")}</span>`;
    }
    if (ta) {
      const start = room.starterFull || room.starter;
      ta.value = typeof start === "string" ? start : "";
      ta.focus();
    }
    if (this.feedbackEl()) this.feedbackEl().textContent = "";

    this.roomHudText.setText(`Room ${n} / ${TOTAL_ROOMS}`);
    this._pulseHero(n);

    const zt = { castle: "🏰", forest: "🌲", mountain: "⛰️", volcano: "🔥" };
    this.heroMarker.setText(`🧙 ${zt[room.zone] || "✨"}`);
  }

  _pulseHero(room) {
    this.tweens.add({
      targets: this.heroMarker,
      scale: 1.15,
      duration: 200,
      yoyo: true,
    });
    this.zoneLabels.forEach(zl => {
      const [lo, hi] = zl.range.split("-").map(Number);
      const on = room >= lo && room <= hi;
      zl.r.setStrokeStyle(on ? 3 : 1, zl.c, on ? 1 : 0.4);
      zl.r.setFillStyle(zl.c, on ? 0.35 : 0.12);
    });
  }

  _submit() {
    if (this.isComplete) return;
    const room = ROOMS[this.currentRoom - 1];
    const code = this.codeEl()?.value || "";

    for (const w of room.wrong || []) {
      if (w.test(code)) {
        this.wrongSubs++;
        this._setFeedback(w.msg, false);
        return;
      }
    }

    if (room.validate(code)) {
      this.correctSubs++;
      const pts = room.points;
      this.score += pts;
      GameManager.addXP(pts);
      GameManager.addScore(pts);
      this.scoreTxt.setText(`Score: ${this.score}`);
      this._setFeedback(`✓ Correct! +${pts} pts — ${room.title}`, true);
      this.spark.emitParticleAt(W / 2, 320, 20);
      this.cameras.main.flash(200, 52, 211, 76);

      if (this.currentRoom === TOTAL_ROOMS) {
        this.bossBonusEarned = true;
        this.score += BONUS_FINAL;
        GameManager.addXP(BONUS_FINAL);
        GameManager.addScore(BONUS_FINAL);
        this.time.delayedCall(900, () => this._victory());
      } else {
        this.time.delayedCall(650, () => {
          this.currentRoom++;
          this._loadRoom(this.currentRoom);
        });
      }
    } else {
      this.wrongSubs++;
      this._setFeedback("✗ Not quite — check quotes, escapes, and semicolons. Try again!", false);
      this.cameras.main.shake(120, 0.008);
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
    const room = ROOMS[this.currentRoom - 1];
    if (!room?.hints?.length) return;
    this.hintsUsed++;
    this.hintStatTxt.setText(`Hints: ${this.hintsUsed}`);
    const h = room.hints[Math.min(this.hintIdx, room.hints.length - 1)];
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

    if (this.currentRoom === TOTAL_ROOMS) {
      this.time.delayedCall(400, () => this._victory());
    } else {
      this.time.delayedCall(400, () => {
        this.currentRoom++;
        this._loadRoom(this.currentRoom);
      });
    }
  }

  _victory() {
    this.isComplete = true;
    const total = this.correctSubs + this.wrongSubs;
    const acc = total > 0 ? Math.round((this.correctSubs / total) * 100) : 0;
    const minCorrect = Math.ceil(TOTAL_ROOMS * 0.75);
    const passed = acc >= ACCURACY_THRESHOLD && this.correctSubs >= minCorrect;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mm = Math.floor(elapsed / 60);
    const ss = String(elapsed % 60).padStart(2, "0");

    if (passed) {
      GameManager.completeLevel(8, acc);
      BadgeSystem.unlock("char_wizard");
      ProgressTracker.saveProgress(GameManager.getState());
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

    this._showEndScreen(acc >= ACCURACY_THRESHOLD, acc, `${mm}:${ss}`);
  }

  _showEndScreen(passed, acc, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.92).setDepth(300);

    const g = this.add.graphics().setDepth(301);
    g.fillStyle(0x0f172a, 0.98);
    g.fillRoundedRect(30, 30, W - 60, H - 60, 14);
    g.lineStyle(2, 0xfbbf24);
    g.strokeRoundedRect(30, 30, W - 60, H - 60, 14);

    const title = passed ? "🏆 CHAR MASTER — QUEST COMPLETE!" : "QUEST ENDED";
    this.add
      .text(W / 2, 70, title, {
        fontFamily: "Arial Black",
        fontSize: "22px",
        color: passed ? "#fbbf24" : "#f87171",
      })
      .setOrigin(0.5)
      .setDepth(302);

    const lines = [
      `Correct submissions: ${this.correctSubs} / ${TOTAL_ROOMS}`,
      `Score: ${this.score}${this.bossBonusEarned ? ` (includes +${BONUS_FINAL} final-room bonus)` : ""}`,
      `Accuracy: ${acc}%`,
      `Time: ${timeStr}`,
      `Hints used: ${this.hintsUsed}`,
      `Skips: ${this.skips}`,
    ];

    lines.forEach((line, i) => {
      this.add
        .text(W / 2, 120 + i * 26, line, {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#e2e8f0",
        })
        .setOrigin(0.5)
        .setDepth(302);
    });

    const learnY = 300;
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
          `Need ${ACCURACY_THRESHOLD}%+ accuracy and ≥${Math.ceil(TOTAL_ROOMS * 0.75)} correct submissions.`,
          { fontSize: "13px", color: "#fca5a5" }
        )
        .setOrigin(0.5)
        .setDepth(302);
    }

    const by = 480;
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
