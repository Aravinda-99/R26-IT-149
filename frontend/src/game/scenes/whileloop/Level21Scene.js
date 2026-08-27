import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

const W = 800, H = 600;
const HUD_H = 48;
const ED_X = 11, ED_Y = 54, ED_W = 382, ED_H = 342;
const VIS_X = 404, VIS_Y = 54, VIS_W = 383, VIS_H = 342;
const TRAY_X = 11, TRAY_Y = 404, TRAY_W = 776, TRAY_H = 116;

const GUTTER_W = 28;
const CODE_X = ED_X + GUTTER_W;  // x where code text starts
const CODE_Y = ED_Y + 30;         // y of first code line (after tab bar)
const LINE_H = 18;

const CAT_COLOR = { init: 0x00e5ff, condition: 0xffd740, body: 0xb0bec5, update: 0x00e676 };
const CAT_HEX   = { init: "#00e5ff", condition: "#ffd740", body: "#b0bec5", update: "#00e676" };

const PROJECTS = [
  {
    id: 1, title: "Counter Stream", filename: "CounterStream.java",
    briefing: "Print numbers 1 through 5 using a while loop.",
    expectedOutput: "1\n2\n3\n4\n5",
    preLines:  ["public class CounterStream {", "  static void main() {"],
    postLines: ["  }", "}"],
    hasInit: true, preVars: {},
    slots: {
      init:      { correct: "int i = 1;",             category: "init"      },
      condition: { correct: "i <= 5",                 category: "condition" },
      body:      { correct: "System.out.println(i);", category: "body"      },
      update:    { correct: "i++;",                   category: "update"    },
    },
    blocks: [
      { text: "int i = 1;",             category: "init"      },
      { text: "int i = 0;",             category: "init"      },
      { text: "i <= 5",                 category: "condition" },
      { text: "i < 5",                  category: "condition" },
      { text: "i != 5",                 category: "condition" },
      { text: "System.out.println(i);", category: "body"      },
      { text: "i++;",                   category: "update"    },
      { text: "i--;",                   category: "update"    },
    ],
    visual: "data_pipe",
  },
  {
    id: 2, title: "Countdown Transmitter", filename: "CountdownTx.java",
    briefing: 'Transmit countdown from 10 to 1. "SIGNAL SENT" prints after.',
    expectedOutput: "10\n9\n8\n7\n6\n5\n4\n3\n2\n1\nSIGNAL SENT",
    preLines:  ["public class CountdownTx {", "  static void main() {"],
    postLines: ['    System.out.println("SIGNAL SENT");', "  }", "}"],
    hasInit: true, preVars: {},
    slots: {
      init:      { correct: "int sig = 10;",             category: "init"      },
      condition: { correct: "sig >= 1",                  category: "condition" },
      body:      { correct: "System.out.println(sig);",  category: "body"      },
      update:    { correct: "sig--;",                    category: "update"    },
    },
    blocks: [
      { text: "int sig = 10;",            category: "init"      },
      { text: "int sig = 1;",             category: "init"      },
      { text: "int sig = 0;",             category: "init"      },
      { text: "sig >= 1",                 category: "condition" },
      { text: "sig > 1",                  category: "condition" },
      { text: "sig > 0",                  category: "condition" },
      { text: "System.out.println(sig);", category: "body"      },
      { text: "sig--;",                   category: "update"    },
      { text: "sig++;",                   category: "update"    },
    ],
    visual: "radio_tower",
  },
  {
    id: 3, title: "Sum Accumulator", filename: "SumAccum.java",
    briefing: "Keep adding numbers from 1 upward until the sum exceeds 20.",
    expectedOutput: "Sum: 21",
    preLines:  ["public class SumAccum {", "  static void main() {", "    int sum = 0;"],
    postLines: ['    System.out.println("Sum: " + sum);', "  }", "}"],
    hasInit: true, preVars: { sum: 0 },
    slots: {
      init:      { correct: "int i = 1;",  category: "init"      },
      condition: { correct: "sum <= 20",   category: "condition" },
      body:      { correct: "sum += i;",   category: "body"      },
      update:    { correct: "i++;",        category: "update"    },
    },
    blocks: [
      { text: "int i = 1;",  category: "init"      },
      { text: "int i = 0;",  category: "init"      },
      { text: "sum <= 20",   category: "condition" },
      { text: "sum < 20",    category: "condition" },
      { text: "i <= 20",     category: "condition" },
      { text: "sum += i;",   category: "body"      },
      { text: "sum += 1;",   category: "body"      },
      { text: "sum = i;",    category: "body"      },
      { text: "i++;",        category: "update"    },
      { text: "i += 2;",     category: "update"    },
    ],
    visual: "funnel",
  },
  {
    id: 4, title: "Password Validator", filename: "PassCheck.java",
    briefing: 'Check passwords until valid. Correct password is "correct" (attempt 3).',
    expectedOutput: "Access Granted at attempt 3",
    preLines:  ["public class PassCheck {", "  static void main() {",
                '    String[] a = {"abc","1234","correct"};',
                "    int index = 0;", "    boolean valid = false;"],
    postLines: ['    System.out.println("Access Granted at attempt " + index);', "  }", "}"],
    hasInit: false, preVars: { index: 0, valid: false },
    slots: {
      condition: { correct: "!valid",                            category: "condition" },
      body:      { correct: "valid = a[index].equals(\"correct\");", category: "body" },
      update:    { correct: "index++;",                          category: "update"    },
    },
    blocks: [
      { text: "!valid",                          category: "condition" },
      { text: "valid == true",                   category: "condition" },
      { text: "index < 4",                       category: "condition" },
      { text: 'valid = a[index].equals("correct");', category: "body" },
      { text: "valid = true;",                   category: "body"      },
      { text: "index++;",                        category: "update"    },
      { text: "index--;",                        category: "update"    },
    ],
    visual: "locked_terminal",
  },
  {
    id: 5, title: "Halving Processor", filename: "HalveProc.java",
    briefing: "Start at 256. Keep halving until below 2. Print each value.",
    expectedOutput: "256\n128\n64\n32\n16\n8\n4\n2",
    preLines:  ["public class HalveProc {", "  static void main() {"],
    postLines: ["  }", "}"],
    hasInit: true, preVars: {},
    slots: {
      init:      { correct: "int val = 256;",          category: "init"      },
      condition: { correct: "val >= 2",                category: "condition" },
      body:      { correct: "System.out.println(val);",category: "body"      },
      update:    { correct: "val = val / 2;",          category: "update"    },
    },
    blocks: [
      { text: "int val = 256;",          category: "init"      },
      { text: "int val = 128;",          category: "init"      },
      { text: "val >= 2",                category: "condition" },
      { text: "val > 2",                 category: "condition" },
      { text: "val >= 0",                category: "condition" },
      { text: "System.out.println(val);",category: "body"      },
      { text: "val = val / 2;",          category: "update"    },
      { text: "val = val - 2;",          category: "update"    },
      { text: "val--;",                  category: "update"    },
    ],
    visual: "shrinking_block",
  },
  {
    id: 6, title: "Digit Counter", filename: "DigitCount.java",
    briefing: "Count how many digits are in 987654 by dividing by 10 until 0.",
    expectedOutput: "Digits: 6",
    preLines:  ["public class DigitCount {", "  static void main() {",
                "    int number = 987654;", "    int digits = 0;"],
    postLines: ['    System.out.println("Digits: " + digits);', "  }", "}"],
    hasInit: false, preVars: { number: 987654, digits: 0 },
    slots: {
      condition: { correct: "number > 0",          category: "condition" },
      body:      { correct: "digits++;",           category: "body"      },
      update:    { correct: "number = number / 10;", category: "update" },
    },
    blocks: [
      { text: "number > 0",          category: "condition" },
      { text: "number >= 0",         category: "condition" },
      { text: "digits < 6",          category: "condition" },
      { text: "digits++;",           category: "body"      },
      { text: "digits += number;",   category: "body"      },
      { text: "number = number / 10;",category: "update"  },
      { text: "number = number - 1;",category: "update"   },
      { text: "number = number % 10;",category: "update"  },
    ],
    visual: "digit_strip",
  },
  {
    id: 7, title: "Maximum Finder", filename: "MaxFinder.java",
    briefing: "Find the maximum value in the data array [34,78,12,95,43].",
    expectedOutput: "Max: 95",
    preLines:  ["public class MaxFinder {", "  static void main() {",
                "    int[] data = {34,78,12,95,43};", "    int max = data[0];"],
    postLines: ['    System.out.println("Max: " + max);', "  }", "}"],
    hasInit: true, preVars: { max: 34 },
    slots: {
      init:      { correct: "int i = 1;",                         category: "init"      },
      condition: { correct: "i < data.length",                    category: "condition" },
      body:      { correct: "if(data[i]>max) max=data[i];",       category: "body"      },
      update:    { correct: "i++;",                               category: "update"    },
    },
    blocks: [
      { text: "int i = 1;",                    category: "init"      },
      { text: "int i = 0;",                    category: "init"      },
      { text: "i < data.length",               category: "condition" },
      { text: "i <= data.length",              category: "condition" },
      { text: "i < 5",                         category: "condition" },
      { text: "if(data[i]>max) max=data[i];",  category: "body"      },
      { text: "max = data[i];",                category: "body"      },
      { text: "i++;",                          category: "update"    },
      { text: "i += 2;",                       category: "update"    },
    ],
    visual: "bar_chart",
  },
  {
    id: 8, title: "Fibonacci Generator", filename: "FibGen.java",
    briefing: "Generate Fibonacci numbers until the value exceeds 100.",
    expectedOutput: "0\n1\n1\n2\n3\n5\n8\n13\n21\n34\n55\n89",
    preLines:  ["public class FibGen {", "  static void main() {", "    int a=0, b=1;"],
    postLines: ["  }", "}"],
    hasInit: false, preVars: { a: 0, b: 1 },
    slots: {
      condition: { correct: "a <= 100",                  category: "condition" },
      body:      { correct: "System.out.println(a);",   category: "body"      },
      update:    { correct: "int temp=a; a=b; b=temp+b;",category: "update"  },
    },
    blocks: [
      { text: "a <= 100",                   category: "condition" },
      { text: "a < 100",                    category: "condition" },
      { text: "b <= 100",                   category: "condition" },
      { text: "System.out.println(a);",     category: "body"      },
      { text: "int temp=a; a=b; b=temp+b;", category: "update"   },
      { text: "a = a + b;",                 category: "update"    },
      { text: "a++; b++;",                  category: "update"    },
    ],
    visual: "golden_spiral",
  },
];

const BIT_FEEDBACK = {
  wrong_count:     "Your loop ran the wrong number of times. Check init, condition, and update — they all affect how many iterations happen.",
  off_by_one:      "Off by one! i <= 5 includes 5 (runs 5 times). i < 5 stops at 4 (runs 4 times).",
  wrong_body:      "The loop structure is right, but the body operation is wrong.",
  wrong_init:      "Starting value matters! int i=0 starts at 0, int i=1 starts at 1.",
  wrong_direction: "Counting up when you should count down? Use i-- instead of i++.",
  accumulate_err:  "sum += i ADDS i to sum each time. sum = i REPLACES sum — losing all previous additions!",
  boolean_logic:   "!valid means 'while NOT valid' — loops until valid becomes true.",
  array_bounds:    "Use i < data.length, NOT i <= data.length — that would go out of bounds!",
  fibonacci_err:   "Fibonacci swap needs a temp variable: save a in temp, set a=b, then b=temp+b.",
  halving_err:     "val/2 halves each time (256→128→64…). val-2 just subtracts 2.",
  digit_err:       "number/10 strips the last digit: 987654→98765→…→0. That's 6 divisions = 6 digits!",
  generic:         "Not quite! Check your init, condition, and update carefully.",
};

export class Level21Scene extends Phaser.Scene {
  constructor() { super({ key: "Level21Scene" }); }

  init() {
    this._proj = 0;
    this._totalScore = 0;
    this._firstTry = 0;
    this._attempts = 0;
    this._results = [];
    this._waveEls = [];
    this._visEls = [];
    this._slots = {};
    this._placed = {};
    this._trayBlocks = [];
    this._executing = false;
    this._streamDots = [];
    this._ambientParts = [];
  }

  preload() {
    if (!this.textures.exists("l21_dot")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillCircle(3, 3, 3);
      g.generateTexture("l21_dot", 6, 6); g.destroy();
    }
  }

  create() {
    if (this.scene.isActive("UIScene")) this.scene.stop("UIScene");
    GameManager.incrementAttempt(20);
    this._buildBG();
    this._buildHUD();
    this._buildEditorFrame();
    this._buildVisualFrame();
    this._buildTray();
    this._buildBit();
    this._showBriefing(0);
  }

  update() {
    for (const d of this._streamDots) {
      d.x += d.speed;
      if (d.x > W + 5) d.x = -5;
    }
    for (const p of this._ambientParts) {
      p.obj.y -= 0.08;
      p.obj.x += Math.sin(p.phase) * 0.03;
      p.phase += 0.04;
      if (p.obj.y < 0) p.obj.y = H - 10;
    }
  }

  // ─── Background ──────────────────────────────────────────────────────────

  _buildBG() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080c12);

    // Data stream dots (bottom strip)
    const speeds = [0.35, 0.4, 0.45, 0.5, 0.38];
    const ys = [530, 545, 558, 572, 586];
    for (let r = 0; r < 5; r++) {
      for (let i = 0; i < 35; i++) {
        const x = i * 23 + Phaser.Math.Between(-5, 5);
        const dot = this.add.rectangle(x, ys[r], 2, 2, 0x00e5ff, 0.07);
        this._streamDots.push({ x: dot.x, y: ys[r], speed: speeds[r], obj: dot });
        // Link obj.x to our tracker
        Object.defineProperty(this._streamDots[this._streamDots.length - 1], 'x', {
          get: () => dot.x, set: (v) => { dot.x = v; },
        });
      }
    }

    // Ambient particles
    for (let i = 0; i < 20; i++) {
      const obj = this.add.circle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H - 10),
        1, 0x4fc3f7, Phaser.Math.FloatBetween(0.03, 0.07)
      );
      this._ambientParts.push({ obj, phase: Math.random() * Math.PI * 2 });
    }

    // Ambient side strips
    const ls = this.add.rectangle(1, H / 2, 3, H, 0x1565c0, 0.06);
    const rs = this.add.rectangle(W - 1, H / 2, 3, H, 0x1565c0, 0.06);
    this.tweens.add({ targets: [ls, rs], alpha: 0.1, duration: 4500, yoyo: true, repeat: -1 });
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  _buildHUD() {
    this.add.rectangle(W / 2, HUD_H / 2, W, HUD_H, 0x0a0e13, 0.96).setDepth(10);
    this.add.rectangle(W / 2, HUD_H, W, 1, 0x21262d, 1).setDepth(10);

    this.add.text(14, 10, "DATA STREAM PROCESSOR", {
      fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#b0bec5", fontStyle: "bold",
    }).setDepth(10);
    this.add.text(14, 28, "Restructuring Phase — While Loops", {
      fontFamily: "Arial, sans-serif", fontSize: "9px", color: "#546e7a",
    }).setDepth(10);

    // Progress bar
    this.add.rectangle(330, 22, 210, 8, 0x1a1a2e, 1).setDepth(10);
    this._progressFill = this.add.rectangle(225, 22, 0, 8, 0x00e5ff, 1)
      .setOrigin(0, 0.5).setDepth(11);

    // Project dots
    this._projDots = [];
    for (let i = 0; i < 8; i++) {
      const dx = 228 + i * 26;
      const g = this.add.graphics().setDepth(11);
      g.fillStyle(0x1a1a2e, 1); g.fillCircle(dx, 36, 5);
      g.lineStyle(1, 0x2a2a4a, 1); g.strokeCircle(dx, 36, 5);
      this._projDots.push({ g, x: dx });
    }

    this._hudScore = this.add.text(W - 14, 10, "SCORE: 0", {
      fontFamily: "Arial, sans-serif", fontSize: "13px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(1, 0).setDepth(10);
    this._hudAcc = this.add.text(W - 14, 28, "Accuracy: ---", {
      fontFamily: "Arial, sans-serif", fontSize: "10px", color: "#78909c",
    }).setOrigin(1, 0).setDepth(10);
  }

  _updateHUD() {
    this._hudScore.setText("SCORE: " + this._totalScore);
    const done = this._results.filter(r => r.correct).length;
    const tot = this._results.length;
    if (tot > 0) this._hudAcc.setText(`Accuracy: ${Math.round(done / tot * 100)}%`);

    const w = Math.max(0, (this._proj / 8) * 206);
    this.tweens.add({ targets: this._progressFill, width: w, duration: 500 });

    for (let i = 0; i < 8; i++) {
      const dot = this._projDots[i];
      dot.g.clear();
      if (i < this._proj) {
        dot.g.fillStyle(0x00e676, 1); dot.g.fillCircle(dot.x, 36, 5);
        dot.g.fillStyle(0xffffff, 1);
        dot.g.fillTriangle(dot.x - 2, 36, dot.x + 1, 36 + 3, dot.x + 1, 36 - 3);
      } else if (i === this._proj) {
        dot.g.lineStyle(2, 0x00e5ff, 0.6); dot.g.strokeCircle(dot.x, 36, 5);
        dot.g.fillStyle(0x0d1117, 1); dot.g.fillCircle(dot.x, 36, 4);
      } else {
        dot.g.fillStyle(0x1a1a2e, 1); dot.g.fillCircle(dot.x, 36, 5);
        dot.g.lineStyle(1, 0x2a2a4a, 1); dot.g.strokeCircle(dot.x, 36, 5);
      }
    }
  }

  // ─── Editor Frame ─────────────────────────────────────────────────────────

  _buildEditorFrame() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(ED_X, ED_Y, ED_W, ED_H, 8);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(ED_X, ED_Y, ED_W, ED_H, 8);

    // Tab bar
    g.fillStyle(0x161b22, 1);
    g.fillRect(ED_X + 1, ED_Y + 1, ED_W - 2, 26);

    // Tab
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(ED_X + 8, ED_Y + 3, 120, 20, 4);
    g.lineStyle(2, 0x00e5ff, 1);
    g.moveTo(ED_X + 8, ED_Y + 23); g.lineTo(ED_X + 128, ED_Y + 23);
    g.strokePath();

    this._tabFilename = this.add.text(ED_X + 28, ED_Y + 13, "Project.java", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#8b949e",
    }).setOrigin(0, 0.5).setDepth(4);

    // Gutter divider
    g.lineStyle(1, 0x21262d, 0.5);
    g.moveTo(ED_X + GUTTER_W, ED_Y + 28); g.lineTo(ED_X + GUTTER_W, ED_Y + ED_H - 1);
    g.strokePath();
  }

  // ─── Visual Panel Frame ───────────────────────────────────────────────────

  _buildVisualFrame() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(VIS_X, VIS_Y, VIS_W, VIS_H, 8);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(VIS_X, VIS_Y, VIS_W, VIS_H, 8);

    // Console strip
    g.fillStyle(0x000000, 1);
    g.fillRoundedRect(VIS_X + 4, VIS_Y + 4, VIS_W - 8, 44, 5);

    this._consoleLabel = this.add.text(VIS_X + 10, VIS_Y + 10, "> output", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#3d4450",
    }).setDepth(4);
    this._consoleText = this.add.text(VIS_X + 10, VIS_Y + 24, "", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#00e676",
    }).setDepth(4);

    // Default idle text
    this._visIdle = this.add.text(VIS_X + VIS_W / 2, VIS_Y + 210, "Run your code to see results", {
      fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#1a2a3a",
    }).setOrigin(0.5).setDepth(4);
  }

  // ─── Block Tray ───────────────────────────────────────────────────────────

  _buildTray() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x0a0e13, 1);
    g.fillRoundedRect(TRAY_X, TRAY_Y, TRAY_W, TRAY_H, 6);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(TRAY_X, TRAY_Y, TRAY_W, TRAY_H, 6);

    this._trayLabel = this.add.text(TRAY_X + 10, TRAY_Y + 6, "CODE BLOCKS", {
      fontFamily: "Arial, sans-serif", fontSize: "8px", color: "#2d3640", fontStyle: "bold",
    }).setDepth(4);
  }

  _clearTray() {
    for (const b of this._trayBlocks) {
      if (b.cont && b.cont.active) b.cont.destroy();
    }
    this._trayBlocks = [];
  }

  _populateTray(blocks) {
    this._clearTray();
    const ROW1_Y = TRAY_Y + 36;
    const ROW2_Y = TRAY_Y + 76;
    let x = TRAY_X + 14;
    let row = 0;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const tw = Math.min(b.text.length * 6.2 + 26, 220);
      const th = 28;
      const cy = row === 0 ? ROW1_Y : ROW2_Y;

      const cont = this.add.container(x + tw / 2, cy).setDepth(8);
      const bg = this.add.graphics();
      const col = CAT_COLOR[b.category] || 0xffffff;
      const hexCol = CAT_HEX[b.category] || "#ffffff";

      const drawBg = (hov) => {
        bg.clear();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRoundedRect(-tw / 2, -th / 2, tw, th, 12);
        bg.lineStyle(hov ? 2 : 1, hov ? col : 0x2a2a4a, 1);
        bg.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 12);
        bg.fillStyle(col, 1);
        bg.fillRoundedRect(-tw / 2 + 4, -9, 4, 18, 2);
      };
      drawBg(false);

      const t = this.add.text(-tw / 2 + 14, 0, b.text, {
        fontFamily: "'Courier New', monospace", fontSize: "9px", color: hexCol, fontStyle: "bold",
      }).setOrigin(0, 0.5);

      cont.add([bg, t]);
      cont.setSize(tw, th);
      cont.setInteractive(new Phaser.Geom.Rectangle(-tw / 2, -th / 2, tw, th), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(cont);
      cont.input.cursor = "pointer";

      const bd = { text: b.text, category: b.category, origX: x + tw / 2, origY: cy, inSlot: null, drawBg, bg, tw, th };
      cont.blockData = bd;
      this._trayBlocks.push({ cont, data: bd });

      // Hover events
      cont.on("pointerover", () => { if (!bd.inSlot) { drawBg(true); cont.setScale(1.04); } });
      cont.on("pointerout", () => { if (!bd.inSlot) { drawBg(false); cont.setScale(1); } });

      // Idle bob
      const bobBase = cont.y;
      this.tweens.add({
        targets: cont, y: bobBase - 2.5, duration: 2400 + i * 150,
        yoyo: true, repeat: -1, ease: "Sine.easeInOut",
      });

      x += tw + 10;
      if (x + 80 > TRAY_X + TRAY_W && row === 0) { x = TRAY_X + 14; row = 1; }
    }
  }

  // ─── Drag System ──────────────────────────────────────────────────────────

  _setupDrag() {
    // Remove previous listeners
    this.input.off("dragstart"); this.input.off("drag"); this.input.off("dragend");

    this.input.on("dragstart", (pointer, obj) => {
      if (!obj.blockData || this._executing) return;
      obj.setDepth(25);
      this.tweens.killTweensOf(obj);
      obj.setScale(1.07); obj.setAlpha(0.88);

      // If already in slot, un-place it
      if (obj.blockData.inSlot) {
        const slotKey = obj.blockData.inSlot;
        this._unplaceBlock(slotKey);
      }
    });

    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!obj.blockData) return;
      obj.setPosition(dragX, dragY);

      // Magnetic highlight on valid slots
      for (const [key, slot] of Object.entries(this._slots)) {
        if (!slot.ph) continue;
        const dist = Phaser.Math.Distance.Between(dragX, dragY, slot.cx, slot.cy);
        const match = slot.category === obj.blockData.category && !slot.filled;
        slot.ph.setAlpha(match && dist < 60 ? 1.0 : 0.55);
      }
    });

    this.input.on("dragend", (pointer, obj) => {
      if (!obj.blockData) return;
      obj.setScale(1.0); obj.setAlpha(1.0);

      // Find nearest valid slot
      let best = null, bestDist = 55;
      for (const [key, slot] of Object.entries(this._slots)) {
        if (slot.filled) continue;
        if (slot.category !== obj.blockData.category) continue;
        const d = Phaser.Math.Distance.Between(obj.x, obj.y, slot.cx, slot.cy);
        if (d < bestDist) { bestDist = d; best = key; }
      }

      if (best) {
        this._snapToSlot(obj, best);
      } else {
        this._returnToTray(obj);
      }

      // Reset slot highlights
      for (const slot of Object.values(this._slots)) {
        if (slot.ph) slot.ph.setAlpha(0.55);
      }
    });
  }

  _snapToSlot(blockCont, slotKey) {
    const slot = this._slots[slotKey];
    slot.filled = true;
    slot.block = blockCont;
    blockCont.blockData.inSlot = slotKey;

    if (slot.ph) slot.ph.setVisible(false);
    if (slot.placeholderText) slot.placeholderText.setVisible(false);

    // Show placed text
    if (slot.placedText) slot.placedText.destroy();
    const col = CAT_HEX[slot.category] || "#ffffff";
    slot.placedText = this.add.text(slot.x, slot.cy, blockCont.blockData.text, {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color: col,
    }).setOrigin(0, 0.5).setDepth(6);
    this._waveEls.push(slot.placedText);

    // Tween block off-screen (we use the placed text as the display)
    this.tweens.add({
      targets: blockCont, x: -100, alpha: 0, duration: 200,
    });
    blockCont.setDepth(1);

    // Snap ring
    const ring = this.add.graphics().setDepth(6);
    ring.lineStyle(2, CAT_COLOR[slot.category], 1);
    ring.strokeCircle(slot.cx, slot.cy, 5);
    this.tweens.add({ targets: ring, alpha: 0, scaleX: 4, scaleY: 4, duration: 280, onComplete: () => ring.destroy() });

    this._placed[slotKey] = blockCont.blockData.text;
    this._checkAllFilled();
  }

  _unplaceBlock(slotKey) {
    const slot = this._slots[slotKey];
    if (!slot) return;
    slot.filled = false;
    if (slot.placedText) { slot.placedText.setVisible(false); }
    if (slot.ph) slot.ph.setVisible(true);
    if (slot.placeholderText) slot.placeholderText.setVisible(true);
    slot.block = null;
    delete this._placed[slotKey];
    this._disableProcessBtn();
  }

  _returnToTray(blockCont) {
    const d = blockCont.blockData;
    // Restore bob animation
    this.tweens.add({
      targets: blockCont, x: d.origX, y: d.origY, alpha: 1, duration: 280, ease: "Cubic.easeOut",
      onComplete: () => {
        blockCont.setDepth(8);
        const bobBase = d.origY;
        this.tweens.add({ targets: blockCont, y: bobBase - 2.5, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      },
    });
  }

  _checkAllFilled() {
    const needed = Object.keys(this._slots);
    const allFilled = needed.every(k => this._placed[k] !== undefined);
    if (allFilled) this._enableProcessBtn();
  }

  // ─── Process Button ────────────────────────────────────────────────────────

  _buildProcessBtn() {
    if (this._processBtn) { this._processBtn.cont.destroy(); }
    const bx = ED_X + ED_W / 2, by = TRAY_Y - 12;
    const bw = 180, bh = 36;

    const g = this.add.graphics().setDepth(7);
    g.fillStyle(0x00c853, 1); g.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 18);

    const t = this.add.text(bx, by, "▶  PROCESS STREAM", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#0a0a1a", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(8);

    const hit = this.add.rectangle(bx, by, bw, bh, 0, 0)
      .setInteractive({ useHandCursor: true }).setDepth(9);

    hit.on("pointerover", () => { g.setAlpha(0.85); });
    hit.on("pointerout", () => { g.setAlpha(1); });
    hit.on("pointerdown", () => { if (!this._executing) this._onProcess(); });

    this._processBtn = { cont: this.add.container(0, 0, [g, t, hit]), g, t, hit };
    this._waveEls.push(g, t, hit);
    this._disableProcessBtn();
  }

  _enableProcessBtn() {
    if (!this._processBtn) return;
    this._processBtn.g.setAlpha(1);
    this._processBtn.t.setAlpha(1);
    this._processBtn.hit.setAlpha(1);
  }

  _disableProcessBtn() {
    if (!this._processBtn) return;
    this._processBtn.g.setAlpha(0.28);
    this._processBtn.t.setAlpha(0.28);
  }

  // ─── Project Briefing ─────────────────────────────────────────────────────

  _showBriefing(index) {
    if (index >= PROJECTS.length) { this._levelComplete(); return; }
    this._attempts = 0;
    const proj = PROJECTS[index];

    // Clear everything
    this._clearWaveEls();
    this._clearVisEls();
    this._clearTray();
    this._slots = {};
    this._placed = {};
    this._consoleText.setText("");
    if (this._visIdle) this._visIdle.setVisible(true);

    this._updateHUD();
    this._tabFilename.setText(proj.filename);

    // Briefing card
    const cx = W / 2, cy = H / 2;
    const cw = 420, ch = 180;

    const card = this.add.graphics().setDepth(30);
    card.fillStyle(0x0d1117, 1);
    card.fillRoundedRect(cx - cw / 2, cy - ch / 2, cw, ch, 10);
    card.lineStyle(2, 0xffd740, 1);
    card.strokeRoundedRect(cx - cw / 2, cy - ch / 2, cw, ch, 10);
    card.fillStyle(0xffd740, 1);
    card.fillRect(cx - cw / 2, cy - ch / 2 + 10, 4, ch - 20);
    card.fillCircle(cx - cw / 2 + 26, cy - ch / 2 + 22, 14);

    const numLabel = this.add.text(cx - cw / 2 + 26, cy - ch / 2 + 22, String(proj.id), {
      fontFamily: "Arial", fontSize: "12px", color: "#0a0a1a", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(31);

    const title = this.add.text(cx - cw / 2 + 48, cy - ch / 2 + 16, proj.title, {
      fontFamily: "Arial", fontSize: "16px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0, 0.5).setDepth(31);

    const desc = this.add.text(cx - cw / 2 + 16, cy - ch / 2 + 46, proj.briefing, {
      fontFamily: "Arial", fontSize: "11px", color: "#b0bec5",
      wordWrap: { width: cw - 32 },
    }).setOrigin(0, 0).setDepth(31);

    const oLabel = this.add.text(cx - cw / 2 + 16, cy - ch / 2 + 90, "Expected:", {
      fontFamily: "Arial", fontSize: "9px", color: "#546e7a",
    }).setDepth(31);
    const previewLines = proj.expectedOutput.split("\n").slice(0, 3).join("  ");
    const oText = this.add.text(cx - cw / 2 + 16, cy - ch / 2 + 103, previewLines + (proj.expectedOutput.split("\n").length > 3 ? "  ..." : ""), {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#00e676",
    }).setDepth(31);

    // START button
    const startG = this.add.graphics().setDepth(31);
    startG.fillStyle(0x00e5ff, 1);
    startG.fillRoundedRect(cx + cw / 2 - 96, cy + ch / 2 - 40, 80, 28, 14);
    const startT = this.add.text(cx + cw / 2 - 56, cy + ch / 2 - 26, "START", {
      fontFamily: "Arial", fontSize: "11px", color: "#0a0a1a", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(32);
    const startHit = this.add.rectangle(cx + cw / 2 - 56, cy + ch / 2 - 26, 80, 28, 0, 0)
      .setInteractive({ useHandCursor: true }).setDepth(33);

    const briefEls = [card, numLabel, title, desc, oLabel, oText, startG, startT, startHit];

    card.setY(card.y + 30); card.setAlpha(0);
    for (const el of briefEls) {
      this.tweens.add({ targets: el, alpha: el === card ? 1 : (el.alpha || 1), y: (el.y || 0) - (el === card ? 0 : 0), duration: 300 });
    }

    startHit.on("pointerdown", () => {
      for (const el of briefEls) el.destroy();
      this._loadProject(proj);
    });
    startHit.on("pointerover", () => startG.setAlpha(0.8));
    startHit.on("pointerout", () => startG.setAlpha(1));
  }

  _loadProject(proj) {
    this._clearWaveEls();
    this._clearVisEls();
    if (this._visIdle) this._visIdle.setVisible(false);
    this._consoleText.setText("");
    this._placed = {};
    this._slots = {};

    this._renderCode(proj);
    this._populateTray(proj.blocks);
    this._setupDrag();
    this._buildProcessBtn();
    this._setupVisual(proj.visual, proj);

    this._projectStartTime = Date.now();
    this._currentProj = proj;
  }

  // ─── Code Rendering ───────────────────────────────────────────────────────

  _renderCode(proj) {
    let lineNum = 1;

    const addLine = (text, indent, syntaxColor) => {
      const y = CODE_Y + (lineNum - 1) * LINE_H;
      // Line number
      const ln = this.add.text(ED_X + GUTTER_W - 4, y + LINE_H / 2, String(lineNum), {
        fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#3d4450",
      }).setOrigin(1, 0.5).setDepth(5);
      this._waveEls.push(ln);

      // Code text
      const ix = CODE_X + indent * 19;
      const tokens = this._tokenize(text);
      let tx = ix;
      for (const tok of tokens) {
        const t = this.add.text(tx, y + LINE_H / 2, tok.text, {
          fontFamily: "'Courier New', monospace", fontSize: "10px", color: tok.color,
        }).setOrigin(0, 0.5).setDepth(5);
        this._waveEls.push(t);
        tx += t.width;
      }
      lineNum++;
      return y;
    };

    const addSlot = (key, category, indentLevel, prefixText) => {
      const y = CODE_Y + (lineNum - 1) * LINE_H;
      const ix = CODE_X + indentLevel * 19;

      // Line number
      const ln = this.add.text(ED_X + GUTTER_W - 4, y + LINE_H / 2, String(lineNum), {
        fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#3d4450",
      }).setOrigin(1, 0.5).setDepth(5);
      this._waveEls.push(ln);

      let tx = ix;
      // Prefix (e.g. "while (")
      if (prefixText) {
        const pre = this.add.text(tx, y + LINE_H / 2, prefixText, {
          fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#ff4081",
        }).setOrigin(0, 0.5).setDepth(5);
        this._waveEls.push(pre);
        tx += pre.width;
      }

      // Slot placeholder
      const sw = category === "condition" ? 110 : category === "update" ? 150 : 180;
      const ph = this.add.graphics().setDepth(5);
      const col = CAT_COLOR[category];
      const hexCol = CAT_HEX[category];
      ph.lineStyle(1, col, 0.55);
      ph.strokeRoundedRect(tx, y + 1, sw, LINE_H - 2, 3);
      this._waveEls.push(ph);

      const ptLabel = this.add.text(tx + 4, y + LINE_H / 2, `drag ${key}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", color: hexCol, alpha: 0.25,
      }).setOrigin(0, 0.5).setDepth(5);
      this._waveEls.push(ptLabel);

      // Suffix (e.g. ") {" for condition)
      if (category === "condition") {
        const suf = this.add.text(tx + sw + 2, y + LINE_H / 2, ") {", {
          fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#78909c",
        }).setOrigin(0, 0.5).setDepth(5);
        this._waveEls.push(suf);
      } else if (category === "init") {
        // No suffix for init
      }

      this._slots[key] = {
        x: tx, y: y + 1, w: sw, h: LINE_H - 2, cy: y + LINE_H / 2, cx: tx + sw / 2,
        category, filled: false, block: null, ph, placeholderText: ptLabel, placedText: null,
      };
      lineNum++;
    };

    // Pre-code lines
    for (const line of proj.preLines) {
      const indent = (line.match(/^(\s*)/)[0].length / 2);
      addLine(line.trim(), indent, null);
    }

    // While structure
    const whileIndent = proj.preLines.length >= 2 ? 2 : 1;
    const bodyIndent = whileIndent + 1;

    if (proj.hasInit !== false) {
      addSlot("init", "init", whileIndent, null);
    }

    addSlot("condition", "condition", whileIndent, "while (");

    // Body slot
    addSlot("body", "body", bodyIndent, null);

    // Update slot
    addSlot("update", "update", bodyIndent, null);

    // Closing brace
    const y = CODE_Y + (lineNum - 1) * LINE_H;
    const brace = this.add.text(CODE_X + whileIndent * 19, y + LINE_H / 2, "}", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#78909c",
    }).setOrigin(0, 0.5).setDepth(5);
    this._waveEls.push(brace);
    lineNum++;

    // Post-code lines
    for (const line of proj.postLines) {
      const indent = (line.match(/^(\s*)/)[0].length / 2);
      addLine(line.trim(), indent, null);
    }
  }

  _tokenize(line) {
    const KW = ["public", "class", "static", "void", "int", "while", "boolean", "String", "if", "new", "return"];
    const result = [];
    const parts = line.split(/(\b\w[\w.]*\b|"[^"]*"|'[^']*'|[^a-zA-Z0-9_"'\s]+|\s+)/g).filter(p => p.length > 0);
    for (const p of parts) {
      if (KW.includes(p)) result.push({ text: p, color: "#ff4081" });
      else if (/^".*"$/.test(p) || /^'.*'$/.test(p)) result.push({ text: p, color: "#00e676" });
      else if (/^\d+$/.test(p)) result.push({ text: p, color: "#ffd740" });
      else if (/^[{}();,\[\]]/.test(p)) result.push({ text: p, color: "#78909c" });
      else if (/^[+\-*/%=<>!&|]+/.test(p)) result.push({ text: p, color: "#ff8a65" });
      else if (/^\s+$/.test(p)) result.push({ text: p, color: "#ffffff" });
      else result.push({ text: p, color: "#c9d1d9" });
    }
    return result;
  }

  // ─── Execution ────────────────────────────────────────────────────────────

  async _onProcess() {
    this._executing = true;
    this._disableProcessBtn();

    // Compilation flash
    if (this._processBtn) this._processBtn.t.setText("COMPILING...");
    await this._delay(600);
    if (this._processBtn) this._processBtn.t.setText("PROCESSING...");
    await this._delay(400);

    // Simulate
    const proj = this._currentProj;
    const sim = this._simulate(proj, this._placed);
    const actual = sim.output;
    const expected = proj.expectedOutput;

    // Animate iterations
    await this._animateExecution(proj, sim.iterations, sim.snapshots);

    // Type output
    this._consoleText.setText("");
    for (let i = 0; i < actual.length; i++) {
      await this._delay(20);
      const lines = actual.slice(0, i + 1);
      this._consoleText.setText(lines.join("\n"));
    }

    await this._delay(300);

    this._attempts++;
    const isCorrect = actual.join("\n") === expected;

    if (isCorrect) {
      await this._onCorrect();
    } else {
      await this._onIncorrect(proj, actual, expected);
    }

    this._executing = false;
  }

  _simulate(proj, placed) {
    const vars = { ...proj.preVars };
    const DATA = [34, 78, 12, 95, 43];
    const output = [];
    const snapshots = [];
    let iter = 0, MAX = 60;

    // Apply init if present
    if (placed.init) this._applyInit(placed.init, vars);

    while (iter < MAX) {
      const condOk = this._evalCond(placed.condition || "", vars, DATA);
      if (!condOk) break;
      snapshots.push({ ...vars, _iter: iter });
      this._execBody(placed.body || "", vars, output, DATA);
      this._execUpdate(placed.update || "", vars, DATA);
      iter++;
    }
    return { output, iterations: iter, snapshots };
  }

  _applyInit(text, vars) {
    const m = text.match(/int\s+(\w+)\s*=\s*(\d+)/);
    if (m) vars[m[1]] = parseInt(m[2]);
  }

  _evalCond(text, vars, data) {
    const t = text.trim();
    if (!t) return false;
    if (t === "!valid") return !vars.valid;
    if (t === "valid == true") return vars.valid === true;
    if (t === "i < data.length") return (vars.i !== undefined ? vars.i : 0) < data.length;
    if (t === "i <= data.length") return (vars.i !== undefined ? vars.i : 0) <= data.length;
    if (t === "i < 5") return (vars.i || 0) < 5;
    const m = t.match(/^(\w+)\s*(<=|>=|<|>|!=|==)\s*(\d+)$/);
    if (m) {
      const l = vars[m[1]] !== undefined ? vars[m[1]] : 0;
      const r = parseInt(m[3]);
      switch (m[2]) {
        case "<=": return l <= r;
        case ">=": return l >= r;
        case "<":  return l < r;
        case ">":  return l > r;
        case "!=": return l !== r;
        case "==": return l === r;
      }
    }
    return false;
  }

  _execBody(text, vars, output, data) {
    const t = text.trim();
    if (t === "System.out.println(i);") { output.push(String(vars.i)); return; }
    if (t === "System.out.println(sig);") { output.push(String(vars.sig)); return; }
    if (t === "System.out.println(val);") { output.push(String(vars.val)); return; }
    if (t === "System.out.println(a);") { output.push(String(vars.a)); return; }
    if (t === "sum += i;") { vars.sum = (vars.sum || 0) + (vars.i || 0); return; }
    if (t === "sum += 1;") { vars.sum = (vars.sum || 0) + 1; return; }
    if (t === "sum = i;")  { vars.sum = vars.i || 0; return; }
    if (t === 'valid = a[index].equals("correct");') {
      const atts = ["abc", "1234", "correct"];
      vars.valid = atts[vars.index] === "correct"; return;
    }
    if (t === "valid = true;") { vars.valid = true; return; }
    if (t === "digits++;") { vars.digits = (vars.digits || 0) + 1; return; }
    if (t === "digits += number;") { vars.digits = (vars.digits || 0) + (vars.number || 0); return; }
    if (t === "if(data[i]>max) max=data[i];" || t === "if(data[i] > max) max = data[i];") {
      const idx = vars.i || 0;
      if (idx < data.length && data[idx] > vars.max) vars.max = data[idx]; return;
    }
    if (t === "max = data[i];") {
      const idx = vars.i || 0;
      if (idx < data.length) vars.max = data[idx]; return;
    }
  }

  _execUpdate(text, vars, data) {
    const t = text.trim();
    if (t === "i++;" || t === "i++") { vars.i = (vars.i || 0) + 1; return; }
    if (t === "i--;" || t === "i--") { vars.i = (vars.i || 0) - 1; return; }
    if (t === "i += 2;") { vars.i = (vars.i || 0) + 2; return; }
    if (t === "sig--;") { vars.sig = (vars.sig || 0) - 1; return; }
    if (t === "sig++;") { vars.sig = (vars.sig || 0) + 1; return; }
    if (t === "val = val / 2;") { vars.val = Math.floor((vars.val || 0) / 2); return; }
    if (t === "val = val - 2;") { vars.val = (vars.val || 0) - 2; return; }
    if (t === "val--;") { vars.val = (vars.val || 0) - 1; return; }
    if (t === "index++;") { vars.index = (vars.index || 0) + 1; return; }
    if (t === "index--;") { vars.index = (vars.index || 0) - 1; return; }
    if (t === "number = number / 10;") { vars.number = Math.floor((vars.number || 0) / 10); return; }
    if (t === "number = number - 1;") { vars.number = (vars.number || 0) - 1; return; }
    if (t === "number = number % 10;") { vars.number = (vars.number || 0) % 10; return; }
    if (t === "int temp=a; a=b; b=temp+b;") {
      const tmp = vars.a; vars.a = vars.b; vars.b = tmp + vars.b; return;
    }
    if (t === "a = a + b;") { const old = vars.a; vars.a = vars.b; vars.b = old + vars.b; return; }
    if (t === "a++; b++;") { vars.a = (vars.a || 0) + 1; vars.b = (vars.b || 0) + 1; return; }
  }

  async _animateExecution(proj, iterations, snapshots) {
    for (let i = 0; i < Math.min(iterations, 12); i++) {
      await this._animateVisStep(proj.visual, i, snapshots[i] || {});
      await this._delay(50);
    }
  }

  // ─── Visual Animations ────────────────────────────────────────────────────

  _setupVisual(type, proj) {
    this._clearVisEls();
    if (this._visIdle) this._visIdle.setVisible(false);

    const VCX = VIS_X + VIS_W / 2;
    const VCY = VIS_Y + 50 + VIS_H / 2;  // below console strip

    switch (type) {
      case "data_pipe":    this._setupDataPipe(VCX, VCY); break;
      case "radio_tower":  this._setupRadioTower(VCX, VCY); break;
      case "funnel":       this._setupFunnel(VCX, VCY); break;
      case "locked_terminal": this._setupLockedTerminal(VCX, VCY); break;
      case "shrinking_block": this._setupShrinkingBlock(VCX, VCY); break;
      case "digit_strip":  this._setupDigitStrip(VCX, VCY); break;
      case "bar_chart":    this._setupBarChart(VCX, VCY); break;
      case "golden_spiral": this._setupGoldenSpiral(VCX, VCY); break;
    }
  }

  async _animateVisStep(type, i, snap) {
    switch (type) {
      case "data_pipe":    await this._stepDataPipe(snap); break;
      case "radio_tower":  await this._stepRadioTower(snap); break;
      case "funnel":       await this._stepFunnel(snap); break;
      case "locked_terminal": await this._stepLockedTerminal(snap, i); break;
      case "shrinking_block": await this._stepShrinkingBlock(snap); break;
      case "digit_strip":  await this._stepDigitStrip(i); break;
      case "bar_chart":    await this._stepBarChart(snap, i); break;
      case "golden_spiral": await this._stepSpiral(snap, i); break;
    }
  }

  // DATA PIPE
  _setupDataPipe(cx, cy) {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a2a3a, 1);
    g.fillRoundedRect(cx - 170, cy - 14, 280, 28, 14);
    g.lineStyle(1, 0x2a3a4a, 1);
    g.strokeRoundedRect(cx - 170, cy - 14, 280, 28, 14);
    g.lineStyle(2, 0x00e5ff, 1); g.strokeCircle(cx - 164, cy, 16);
    this._visEls.push(g);

    const cont = this.add.graphics().setDepth(4);
    cont.fillStyle(0x0d1117, 1); cont.fillRoundedRect(cx + 118, cy - 50, 60, 90, 6);
    cont.lineStyle(1, 0x00e5ff, 0.6); cont.strokeRoundedRect(cx + 118, cy - 50, 60, 90, 6);
    this._visEls.push(cont);
    this.add.text(cx + 148, cy - 58, "Output", { fontFamily: "Arial", fontSize: "9px", color: "#546e7a" }).setOrigin(0.5).setDepth(4);
    this._visEls.push(this.children.list[this.children.list.length - 1]);

    this._pipeOrbCount = 0;
  }

  async _stepDataPipe(snap) {
    const cx = VIS_X + VIS_W / 2, cy = VIS_Y + 50 + VIS_H / 2;
    const val = snap.i !== undefined ? snap.i : "";
    const orb = this.add.circle(cx - 164, cy, 11, 0x00e5ff, 0.85).setDepth(5);
    const nt = this.add.text(cx - 164, cy, String(val), {
      fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#0a0a1a", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(6);
    this._visEls.push(orb, nt);

    await this._tween({ targets: [orb, nt], x: cx + 148, duration: 380, ease: "Cubic.easeInOut" });
    this.tweens.add({ targets: [orb, nt], scaleX: 0.7, scaleY: 0.7, y: cy - 30 + this._pipeOrbCount * 18, duration: 150 });
    this._pipeOrbCount++;
  }

  // RADIO TOWER
  _setupRadioTower(cx, cy) {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x37474f, 1);
    g.fillTriangle(cx - 130, cy + 60, cx - 100, cy - 50, cx - 70, cy + 60);
    for (let i = 0; i < 3; i++) {
      const ty = cy + 40 - i * 30;
      g.fillStyle(0x546e7a, 1);
      g.fillRect(cx - 130 + (i * 5), ty, 30 - i * 5, 3);
    }
    this._visEls.push(g);

    const disp = this.add.graphics().setDepth(4);
    disp.fillStyle(0x0a0a1a, 1); disp.fillRoundedRect(cx - 40, cy - 40, 80, 50, 6);
    disp.lineStyle(2, 0xff1744, 1); disp.strokeRoundedRect(cx - 40, cy - 40, 80, 50, 6);
    this._visEls.push(disp);

    this._radioNumText = this.add.text(cx, cy - 15, "10", {
      fontFamily: "'Courier New', monospace", fontSize: "28px", color: "#ff1744", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(this._radioNumText);
  }

  async _stepRadioTower(snap) {
    const val = snap.sig !== undefined ? snap.sig : "";
    const cx = VIS_X + VIS_W / 2, cy = VIS_Y + 50 + VIS_H / 2;

    await this._tween({ targets: this._radioNumText, scaleY: 0, duration: 100 });
    this._radioNumText.setText(String(val));
    await this._tween({ targets: this._radioNumText, scaleY: 1, duration: 100 });

    // Signal pulse
    const ring = this.add.graphics().setDepth(5);
    ring.lineStyle(2, 0x00e5ff, 0.7); ring.strokeCircle(cx - 100, cy - 20, 5);
    this._visEls.push(ring);
    await this._tween({ targets: ring, scaleX: 12, scaleY: 12, alpha: 0, duration: 350 });
  }

  // FUNNEL
  _setupFunnel(cx, cy) {
    const g = this.add.graphics().setDepth(4);
    g.lineStyle(2, 0x00e5ff, 1);
    g.moveTo(cx - 70, cy - 60); g.lineTo(cx - 20, cy); g.lineTo(cx + 20, cy);
    g.lineTo(cx + 70, cy - 60); g.strokePath();
    g.lineStyle(2, 0x00e5ff, 0.4);
    g.moveTo(cx - 70, cy - 60); g.lineTo(cx + 70, cy - 60); g.strokePath();
    this._visEls.push(g);

    const sd = this.add.graphics().setDepth(4);
    sd.fillStyle(0x0a0a1a, 1); sd.fillRoundedRect(cx - 50, cy + 10, 100, 34, 5);
    sd.lineStyle(2, 0xffd740, 1); sd.strokeRoundedRect(cx - 50, cy + 10, 100, 34, 5);
    this._visEls.push(sd);

    this._funnelSumText = this.add.text(cx, cy + 27, "Sum: 0", {
      fontFamily: "'Courier New', monospace", fontSize: "14px", color: "#ffd740", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(this._funnelSumText);
    this._funnelCurrentSum = 0;
  }

  async _stepFunnel(snap) {
    const cx = VIS_X + VIS_W / 2, cy = VIS_Y + 50 + VIS_H / 2;
    const val = snap.i !== undefined ? snap.i : "";
    const badge = this.add.circle(cx, cy - 90, 13, 0x1a1a2e).setDepth(5);
    badge.setStrokeStyle(1, 0xffd740);
    const bt = this.add.text(cx, cy - 90, String(val), {
      fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#ffd740",
    }).setOrigin(0.5).setDepth(6);
    this._visEls.push(badge, bt);

    await this._tween({ targets: [badge, bt], y: cy - 5, duration: 300, ease: "Cubic.easeIn" });

    this._funnelCurrentSum += (snap.i || 0);
    this._funnelSumText.setText("Sum: " + this._funnelCurrentSum);
    this.tweens.add({ targets: this._funnelSumText, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true });
    this.tweens.add({ targets: [badge, bt], alpha: 0, duration: 150 });
  }

  // LOCKED TERMINAL
  _setupLockedTerminal(cx, cy) {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0a0a1a, 1); g.fillRoundedRect(cx - 120, cy - 80, 240, 160, 8);
    g.lineStyle(2, 0x3d4450, 1); g.strokeRoundedRect(cx - 120, cy - 80, 240, 160, 8);
    this._visEls.push(g);

    this.add.text(cx, cy - 68, "SECURITY TERMINAL", {
      fontFamily: "Arial", fontSize: "10px", color: "#546e7a", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(this.children.list[this.children.list.length - 1]);

    // Padlock
    const lock = this.add.graphics().setDepth(5);
    lock.lineStyle(3, 0xf44336, 1); lock.strokeCircle(cx + 80, cy - 50, 10);
    lock.fillStyle(0xf44336, 1); lock.fillRoundedRect(cx + 70, cy - 44, 20, 14, 3);
    this._visEls.push(lock);
    this._lockGfx = lock;

    this._termLines = [];
    this._termLineY = cy - 45;
  }

  async _stepLockedTerminal(snap, i) {
    const cx = VIS_X + VIS_W / 2;
    const attempts = ["abc", "1234", "correct"];
    const att = attempts[i] || "?";
    const isCorrect = att === "correct";
    const color = isCorrect ? "#00e676" : "#f44336";

    const t = this.add.text(cx - 110, this._termLineY, `> checking: ${att}`, {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#78909c",
    }).setDepth(6);
    this._visEls.push(t);
    await this._delay(300);

    t.setColor(color);
    const result = this.add.text(cx - 110, this._termLineY + 14, isCorrect ? "ACCESS GRANTED ✓" : "ACCESS DENIED ✗", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", color,
    }).setDepth(6);
    this._visEls.push(result);
    this._termLineY += 32;
    await this._delay(300);
  }

  // SHRINKING BLOCK
  _setupShrinkingBlock(cx, cy) {
    this._shrinkSize = 160;
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a2a3a, 1);
    g.fillRoundedRect(cx - 80, cy - 80, 160, 160, 8);
    g.lineStyle(2, 0x00e5ff, 1);
    g.strokeRoundedRect(cx - 80, cy - 80, 160, 160, 8);
    this._shrinkGfx = g;
    this._visEls.push(g);

    this._shrinkText = this.add.text(cx, cy, "256", {
      fontFamily: "'Courier New', monospace", fontSize: "28px", color: "#00e5ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(this._shrinkText);
    this._shrinkCX = cx; this._shrinkCY = cy;
  }

  async _stepShrinkingBlock(snap) {
    const val = snap.val !== undefined ? snap.val : "";
    const newSize = this._shrinkSize * 0.5;
    const cx = this._shrinkCX, cy = this._shrinkCY;

    // Draw slash line
    const slash = this.add.graphics().setDepth(5);
    slash.lineStyle(2, 0xffd740, 0.8);
    slash.moveTo(cx - this._shrinkSize / 2, cy); slash.lineTo(cx + this._shrinkSize / 2, cy);
    slash.strokePath();
    this._visEls.push(slash);
    await this._tween({ targets: slash, alpha: 0, duration: 300 });

    this._shrinkSize = newSize;
    const hs = newSize / 2;

    this._shrinkGfx.clear();
    this._shrinkGfx.fillStyle(0x1a2a3a, 1);
    this._shrinkGfx.fillRoundedRect(cx - hs, cy - hs, newSize, newSize, Math.max(2, newSize / 20));
    this._shrinkGfx.lineStyle(2, 0x00e5ff, 1);
    this._shrinkGfx.strokeRoundedRect(cx - hs, cy - hs, newSize, newSize, Math.max(2, newSize / 20));

    this._shrinkText.setText(String(val));
    this._shrinkText.setFontSize(Math.max(8, Math.min(28, newSize * 0.28)));
  }

  // DIGIT STRIP
  _setupDigitStrip(cx, cy) {
    this._digitCards = [];
    const digits = [9, 8, 7, 6, 5, 4];
    const startX = cx - 155;

    for (let i = 0; i < 6; i++) {
      const x = startX + i * 52;
      const g = this.add.graphics().setDepth(4);
      g.fillStyle(0x1a1a2e, 1); g.fillRoundedRect(x - 22, cy - 34, 44, 60, 6);
      g.lineStyle(1, 0xffd740, 0.7); g.strokeRoundedRect(x - 22, cy - 34, 44, 60, 6);
      const t = this.add.text(x, cy - 4, String(digits[i]), {
        fontFamily: "'Courier New', monospace", fontSize: "22px", color: "#ffd740", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(5);
      this._visEls.push(g, t);
      this._digitCards.push({ g, t, x });
    }

    const sd = this.add.graphics().setDepth(4);
    sd.fillStyle(0x0a0a1a, 1); sd.fillRoundedRect(cx - 46, cy + 38, 92, 30, 5);
    sd.lineStyle(2, 0x00e676, 1); sd.strokeRoundedRect(cx - 46, cy + 38, 92, 30, 5);
    this._visEls.push(sd);
    this._digitCountText = this.add.text(cx, cy + 53, "Count: 0", {
      fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#00e676", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(this._digitCountText);
    this._digitRemoved = 0;
  }

  async _stepDigitStrip() {
    const remaining = this._digitCards.filter(c => c.g.visible);
    if (remaining.length === 0) return;
    const card = remaining[remaining.length - 1];

    await this._tween({ targets: [card.g, card.t], y: (card.g.y || 0) - 10, duration: 100 });
    this.tweens.add({ targets: [card.g, card.t], x: card.x + 200, alpha: 0, duration: 320 });
    card.g.setVisible(false); card.t.setVisible(false);

    this._digitRemoved++;
    this._digitCountText.setText("Count: " + this._digitRemoved);
    this.tweens.add({ targets: this._digitCountText, scaleX: 1.3, scaleY: 1.3, duration: 150, yoyo: true });
    await this._delay(320);
  }

  // BAR CHART
  _setupBarChart(cx, cy) {
    const values = [34, 78, 12, 95, 43];
    this._barRects = [];
    const barW = 42, spacing = 54, startX = cx - 130, baseY = cy + 80;

    const g = this.add.graphics().setDepth(4);
    for (let i = 0; i < 5; i++) {
      const bx = startX + i * spacing;
      const bh = values[i] * 1.5;
      g.fillStyle(0x1a2a3a, 1);
      g.fillRoundedRect(bx - barW / 2, baseY - bh, barW, bh, 4);
      g.lineStyle(1, 0x3a4a5a, 1);
      g.strokeRoundedRect(bx - barW / 2, baseY - bh, barW, bh, 4);
      this._barRects.push({ x: bx, y: baseY - bh, w: barW, h: bh, val: values[i] });

      const vt = this.add.text(bx, baseY - bh - 8, String(values[i]), {
        fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#78909c",
      }).setOrigin(0.5, 1).setDepth(5);
      this._visEls.push(vt);
    }
    this._visEls.push(g);
    this._barGfx = g;

    const md = this.add.graphics().setDepth(4);
    md.fillStyle(0x0a0a1a, 1); md.fillRoundedRect(cx + 90, cy - 80, 80, 28, 5);
    md.lineStyle(1, 0xffd740, 0.8); md.strokeRoundedRect(cx + 90, cy - 80, 80, 28, 5);
    this._visEls.push(md);
    this._maxText = this.add.text(cx + 130, cy - 66, "max=34", {
      fontFamily: "'Courier New', monospace", fontSize: "12px", color: "#ffd740", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(this._maxText);
    this._barCurrentMax = 34;
    this._barGfx2 = g;
  }

  async _stepBarChart(snap, i) {
    const bar = this._barRects[i + 1];
    if (!bar) return;
    const cx = VIS_X + VIS_W / 2, cy = VIS_Y + 50 + VIS_H / 2;
    const baseY = cy + 80;

    // Highlight current bar
    this._barGfx.clear();
    const values = [34, 78, 12, 95, 43];
    for (let j = 0; j < 5; j++) {
      const bx = cx - 130 + j * 54;
      const bh = values[j] * 1.5;
      const isHighlight = j === i + 1;
      const isMax = values[j] === this._barCurrentMax;
      const col = isHighlight ? 0x00e5ff : isMax ? 0xffd740 : 0x1a2a3a;
      this._barGfx.fillStyle(col, 1);
      this._barGfx.fillRoundedRect(bx - 21, baseY - bh, 42, bh, 4);
      this._barGfx.lineStyle(1, isHighlight ? 0x00e5ff : 0x3a4a5a, 1);
      this._barGfx.strokeRoundedRect(bx - 21, baseY - bh, 42, bh, 4);
    }

    if (bar.val > this._barCurrentMax) {
      this._barCurrentMax = bar.val;
      this._maxText.setText("max=" + bar.val);
      this.tweens.add({ targets: this._maxText, scaleX: 1.2, scaleY: 1.2, duration: 150, yoyo: true });
    }
    await this._delay(350);
  }

  // GOLDEN SPIRAL
  _setupGoldenSpiral(cx, cy) {
    this._spiralGfx = this.add.graphics().setDepth(4);
    this._visEls.push(this._spiralGfx);
    this._spiralCX = cx - 20; this._spiralCY = cy + 10;
    this._spiralIter = 0;
    this._spiralCorner = { x: cx - 20, y: cy + 10 };
    this._spiralDir = 0; // 0=right,1=down,2=left,3=up
    this._spiralScale = 1.4;
    this._spiralColors = [0x00e5ff, 0xffd740];
  }

  async _stepSpiral(snap, i) {
    const val = snap.a !== undefined ? snap.a : 0;
    const g = this._spiralGfx;
    const col = this._spiralColors[i % 2];
    g.lineStyle(2, col, 0.8);
    const r = Math.max(5, Math.min(80, val * this._spiralScale));
    const { x: ox, y: oy } = this._spiralCorner;
    const d = this._spiralDir;

    // Draw quarter-circle arc
    let acx = ox, acy = oy;
    if (d === 0) { acx = ox; acy = oy - r; }
    else if (d === 1) { acx = ox + r; acy = oy; }
    else if (d === 2) { acx = ox; acy = oy + r; }
    else { acx = ox - r; acy = oy; }

    const startA = [Math.PI, Math.PI * 1.5, 0, Math.PI * 0.5][d];
    const endA = startA + Math.PI * 0.5;
    g.arc(acx, acy, r, startA, endA, false);
    g.strokePath();

    // Advance corner
    if (d === 0) this._spiralCorner = { x: ox + r, y: oy - r };
    else if (d === 1) this._spiralCorner = { x: ox + r, y: oy + r };
    else if (d === 2) this._spiralCorner = { x: ox - r, y: oy + r };
    else this._spiralCorner = { x: ox - r, y: oy - r };
    this._spiralDir = (this._spiralDir + 1) % 4;

    const nt = this.add.text(acx, acy, String(val), {
      fontFamily: "'Courier New', monospace", fontSize: "8px", color: col === 0x00e5ff ? "#00e5ff" : "#ffd740",
    }).setOrigin(0.5).setDepth(5);
    this._visEls.push(nt);
    this.tweens.add({ targets: nt, scaleX: 1.4, scaleY: 1.4, duration: 200, yoyo: true });
    await this._delay(250);
  }

  // ─── Result Handling ──────────────────────────────────────────────────────

  async _onCorrect() {
    const proj = this._currentProj;
    const firstTry = this._attempts === 1;
    if (firstTry) this._firstTry++;

    const pts = firstTry ? 150 : 100;
    this._totalScore += pts;
    this._results.push({ id: proj.id, correct: true, attempts: this._attempts, pts });
    this._updateHUD();

    // Flash green
    const fl = this.add.rectangle(VIS_X + VIS_W / 2, VIS_Y + VIS_H / 2, VIS_W, VIS_H, 0x00e676, 0.15).setDepth(20);
    this.time.delayedCall(350, () => fl.destroy());

    const ok = this.add.text(VIS_X + VIS_W / 2, VIS_Y + VIS_H / 2, "✓ STREAM PROCESSED", {
      fontFamily: "Arial", fontSize: "18px", color: "#00e676", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(21).setScale(0);
    this.tweens.add({ targets: ok, scaleX: 1.1, scaleY: 1.1, duration: 200, yoyo: false,
      onComplete: () => this.tweens.add({ targets: ok, scaleX: 1, scaleY: 1, duration: 100 }) });
    this._visEls.push(ok);

    await this._delay(2200);
    this._proj++;
    this._showBriefing(this._proj);
  }

  async _onIncorrect(proj, actual, expected) {
    this._results.push({ id: proj.id, correct: false, attempts: this._attempts });

    const errType = this._detectError(proj, actual, expected);

    // Show diff
    const dx = VIS_X + 6, dy = VIS_Y + VIS_H - 140, dw = VIS_W - 12, dh = 135;
    const dcard = this.add.graphics().setDepth(20);
    dcard.fillStyle(0x0d1117, 1); dcard.fillRoundedRect(dx, dy, dw, dh, 6);
    dcard.lineStyle(2, 0xf44336, 1); dcard.strokeRoundedRect(dx, dy, dw, dh, 6);
    this._waveEls.push(dcard);

    const eh = this.add.text(dx + 10, dy + 8, "Expected:", { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#546e7a" }).setDepth(21);
    const yh = this.add.text(dx + dw / 2 + 10, dy + 8, "Your Output:", { fontFamily: "'Courier New', monospace", fontSize: "9px", color: "#546e7a" }).setDepth(21);
    const el = this.add.text(dx + 10, dy + 22, expected.split("\n").slice(0, 4).join("\n"), { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#00e676", wordWrap: { width: dw / 2 - 16 } }).setDepth(21);
    const yl2 = this.add.text(dx + dw / 2 + 10, dy + 22, actual.slice(0, 4).join("\n"), { fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#f44336", wordWrap: { width: dw / 2 - 16 } }).setDepth(21);
    this._waveEls.push(eh, yh, el, yl2);

    this._showBit(BIT_FEEDBACK[errType] || BIT_FEEDBACK.generic);
    await this._delay(4000);

    // Reset
    dcard.destroy(); eh.destroy(); yh.destroy(); el.destroy(); yl2.destroy();
    this._resetForRetry();
  }

  _detectError(proj, actual, expected) {
    const exp = expected.split("\n");
    const act = actual;
    if (act.length < exp.length) return "wrong_count";
    if (act.length > exp.length) return "wrong_count";
    if (proj.id === 1 && this._placed.init === "int i = 0;") return "wrong_init";
    if (proj.id === 1 && this._placed.condition === "i < 5") return "off_by_one";
    if (proj.id === 3 && this._placed.body === "sum = i;") return "accumulate_err";
    if (proj.id === 4) return "boolean_logic";
    if (proj.id === 5) return "halving_err";
    if (proj.id === 6) return "digit_err";
    if (proj.id === 7) return "array_bounds";
    if (proj.id === 8) return "fibonacci_err";
    return "generic";
  }

  _resetForRetry() {
    // Return all placed blocks to tray
    for (const [key, slot] of Object.entries(this._slots)) {
      if (slot.filled && slot.block) {
        slot.block.blockData.inSlot = null;
        this._returnToTray(slot.block);
        slot.block.setPosition(-100, -100);
        slot.block.setAlpha(1);
      }
      slot.filled = false;
      slot.block = null;
      if (slot.placedText) { slot.placedText.setVisible(false); }
      if (slot.ph) slot.ph.setVisible(true);
      if (slot.placeholderText) slot.placeholderText.setVisible(true);
    }
    this._placed = {};

    // Restore tray blocks
    for (const b of this._trayBlocks) {
      b.cont.setPosition(b.data.origX, b.data.origY);
      b.cont.setAlpha(1); b.cont.setDepth(8);
      b.data.inSlot = null;
      this.tweens.add({ targets: b.cont, y: b.data.origY - 2.5, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    this._clearVisEls();
    this._setupVisual(this._currentProj.visual, this._currentProj);
    this._consoleText.setText("");
    this._disableProcessBtn();
  }

  // ─── Bit Mascot ───────────────────────────────────────────────────────────

  _buildBit() {
    this._bitCont = this.add.container(W + 60, H - 70).setDepth(28);
    const body = this.add.graphics();
    body.fillStyle(0x6600cc, 1); body.fillRoundedRect(-18, -18, 36, 36, 7);
    body.fillStyle(0xffffff, 1); body.fillCircle(-6, -4, 4); body.fillCircle(6, -4, 4);
    body.fillStyle(0x220044, 1); body.fillCircle(-6, -4, 2); body.fillCircle(6, -4, 2);
    this._bitCont.add(body);

    this._bitSpeechBG = this.add.graphics().setDepth(29);
    this._bitSpeechText = this.add.text(-90, -55, "", {
      fontFamily: "Arial", fontSize: "9px", color: "#cc88ff", align: "center",
      wordWrap: { width: 160 }, backgroundColor: "#0d0020", padding: { x: 4, y: 3 },
    }).setOrigin(0.5, 1).setDepth(29);
    this._bitCont.add([this._bitSpeechBG, this._bitSpeechText]);
  }

  _showBit(msg) {
    this._bitSpeechText.setText(msg);
    this.tweens.killTweensOf(this._bitCont);
    this.tweens.add({ targets: this._bitCont, x: W - 80, duration: 300, ease: "Back.easeOut" });
    if (this._bitTimer) this._bitTimer.remove();
    this._bitTimer = this.time.delayedCall(4000, () => {
      this.tweens.add({ targets: this._bitCont, x: W + 60, duration: 300 });
    });
  }

  // ─── Level Complete ───────────────────────────────────────────────────────

  _levelComplete() {
    const acc = this._firstTry / 8;
    GameManager.completeLevel(20, Math.round(acc * 100));
    try { BadgeSystem.unlock("stream_architect"); } catch (_) {}

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(40);

    this.add.text(W / 2, 60, "ALL STREAMS PROCESSED!", {
      fontFamily: "Arial", fontSize: "22px", color: "#ffd740", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(41);

    // Project list
    const listX = 80;
    PROJECTS.forEach((proj, i) => {
      const res = this._results.find(r => r.id === proj.id);
      const stars = res ? (res.attempts === 1 ? "★★★" : res.attempts === 2 ? "★★☆" : "★☆☆") : "☆☆☆";
      const y = 106 + i * 30;
      this.add.text(listX, y, `${proj.id}. ${proj.title}`, {
        fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#c9d1d9",
      }).setDepth(41);
      this.add.text(W - 80, y, stars, {
        fontFamily: "Arial", fontSize: "13px", color: "#ffd740",
      }).setOrigin(1, 0).setDepth(41);
    });

    const statsY = 106 + 8 * 30 + 16;
    this.add.text(W / 2, statsY, `Total Score: ${this._totalScore}`, {
      fontFamily: "Arial", fontSize: "18px", color: "#ffd740", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(41);
    this.add.text(W / 2, statsY + 26, `First-Try Rate: ${Math.round(acc * 100)}%`, {
      fontFamily: "Arial", fontSize: "13px", color: "#00e5ff",
    }).setOrigin(0.5).setDepth(41);
    this.add.text(W / 2, statsY + 46, "BADGE UNLOCKED: Stream Architect 🌊", {
      fontFamily: "Arial", fontSize: "11px", color: "#b0bec5",
    }).setOrigin(0.5).setDepth(41);

    this.add.particles(W / 2, 60, "l21_dot", {
      speed: { min: 100, max: 250 }, angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 }, lifespan: 1200, quantity: 50,
      tint: [0x00e5ff, 0xffd740, 0x00e676, 0xffffff],
    });

    this._makeButton(W / 2 - 80, statsY + 82, "RETRY", 130, 34, 0x1a1a2e, 0x546e7a, () => this.scene.restart(), 41);
    this._makeButton(W / 2 + 80, statsY + 82, "MENU", 130, 34, 0x003333, 0x00e5ff, () => this.scene.start("MenuScene"), 41);
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  _clearWaveEls() {
    for (const el of this._waveEls) { if (el && el.active && el.destroy) el.destroy(); }
    this._waveEls = [];
    this._slots = {};
  }

  _clearVisEls() {
    for (const el of this._visEls) { if (el && el.active && el.destroy) el.destroy(); }
    this._visEls = [];
  }

  _tween(config) {
    return new Promise(resolve => {
      this.tweens.add({ ...config, onComplete: resolve });
    });
  }

  _delay(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }

  _makeButton(cx, cy, label, w, h, fill, stroke, onClick, depth = 10) {
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(fill, 1); g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
    g.lineStyle(2, stroke, 1); g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
    const t = this.add.text(cx, cy, label, {
      fontFamily: "Arial", fontSize: "12px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(depth + 1);
    const hit = this.add.rectangle(cx, cy, w, h, 0, 0)
      .setInteractive({ useHandCursor: true }).setDepth(depth + 2);
    hit.on("pointerover", () => { g.setAlpha(0.75); });
    hit.on("pointerout", () => { g.setAlpha(1); });
    hit.on("pointerdown", onClick);
  }
}
