/**
 * Level15Scene — "Code Builder Pro" (Restructuring Phase)
 * ========================================================
 * IDE-style fill-in-the-blank code editor. 8 real-world projects
 * where player selects correct operators to complete Java code.
 */
import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

const W = 800, H = 600;

const PROJECTS = [
  {
    client: "Online Store", title: "Shopping Cart", icon: "🛒",
    code: ["int qty = 4;", "double price = 12.99;", "double sub = qty ___ price;", "double total = sub ___ 5.99;"],
    blanks: [{ line: 2, ans: "*", opts: ["*", "+", "-", "/"] }, { line: 3, ans: "+", opts: ["+", "-", "*", "/"] }],
    output: "sub = 51.96\ntotal = 57.95", reqs: ["Use * for subtotal", "Use + to add shipping"]
  },
  {
    client: "School System", title: "Grade Calculator", icon: "📊",
    code: ["int t1=85, t2=92, t3=78;", "int sum = t1 ___ t2 ___ t3;", "int avg = sum ___ 3;", "boolean pass = avg ___ 70;"],
    blanks: [{ line: 1, ans: "+", opts: ["+", "-", "*"] }, { line: 1, ans: "+", opts: ["+", "-", "*"] }, { line: 2, ans: "/", opts: ["/", "*", "+", "%"] }, { line: 3, ans: ">=", opts: [">=", "<=", "==", ">"] }],
    output: "sum = 255\navg = 85\npass = true", reqs: ["Use + to sum", "Use / for average", "Use >= to check pass"]
  },
  {
    client: "Game Dev", title: "Even/Odd Checker", icon: "🔢",
    code: ["int num = 17;", "int rem = num ___ 2;", "boolean even = rem ___ 0;", "boolean odd = ___ even;"],
    blanks: [{ line: 1, ans: "%", opts: ["%", "/", "*", "-"] }, { line: 2, ans: "==", opts: ["==", "!=", ">", "<"] }, { line: 3, ans: "!", opts: ["!", "&&", "||", "=="] }],
    output: "rem = 1\neven = false\nodd = true", reqs: ["Use % for remainder", "Use == to compare", "Use ! to negate"]
  },
  {
    client: "Weather App", title: "Temp Converter", icon: "🌡️",
    code: ["int celsius = 25;", "double f = celsius ___ 9.0;", "f = f ___ 5.0;", "f = f ___ 32;"],
    blanks: [{ line: 1, ans: "*", opts: ["*", "+", "-", "/"] }, { line: 2, ans: "/", opts: ["/", "*", "+", "-"] }, { line: 3, ans: "+", opts: ["+", "-", "*", "/"] }],
    output: "f = 225.0\nf = 45.0\nf = 77.0 (final)", reqs: ["Formula: (C*9/5)+32", "Use * then / then +"]
  },
  {
    client: "Security", title: "Login Validator", icon: "🔐",
    code: ["boolean validUser = true;", "boolean validPass = true;", "boolean login = validUser ___ validPass;", "if(login) access();"],
    blanks: [{ line: 2, ans: "&&", opts: ["&&", "||", "!", "=="] }],
    output: "login = true\naccess() called", reqs: ["Both must be true → use &&"]
  },
  {
    client: "Leaderboard", title: "Score Ranking", icon: "🏆",
    code: ["int score = 850;", "boolean gold = score ___ 900;", "boolean silver = score ___ 700;", "// gold=false, silver=true"],
    blanks: [{ line: 1, ans: ">=", opts: [">=", ">", "==", "<="] }, { line: 2, ans: ">=", opts: [">=", ">", "==", "<="] }],
    output: "gold = false\nsilver = true\nRank: Silver 🥈", reqs: ["Use >= for threshold checks"]
  },
  {
    client: "Inventory", title: "Counter System", icon: "📦",
    code: ["int stock = 50;", "stock ___ 20;", "stock ___ 15;", "stock ___ ;"],
    blanks: [{ line: 1, ans: "+=", opts: ["+=", "-=", "*=", "="] }, { line: 2, ans: "-=", opts: ["-=", "+=", "/=", "="] }, { line: 3, ans: "++", opts: ["++", "--", "+=", "-="] }],
    output: "stock = 70\nstock = 55\nstock = 56", reqs: ["Use += to add", "Use -= to remove", "Use ++ to increment"]
  },
  {
    client: "Registration", title: "User Validator (Final)", icon: "🎯",
    code: ["int age = 22;", "boolean validAge = age ___ 18;", "boolean validName = true;", "boolean allOk = validAge ___ validName;", "int score = 0;", "score ___ 30;", "score ___ ;"],
    blanks: [{ line: 1, ans: ">=", opts: [">=", "<=", "==", ">"] }, { line: 3, ans: "&&", opts: ["&&", "||", "!", "=="] }, { line: 5, ans: "+=", opts: ["+=", "-=", "*=", "="] }, { line: 6, ans: "++", opts: ["++", "--", "+=", "-="] }],
    output: "validAge = true\nallOk = true\nscore = 31", reqs: ["Use >= for age", "Use && for both", "Use += and ++"]
  },
];

export class Level15Scene extends Phaser.Scene {
  constructor() { super({ key: "Level15Scene" }); }

  create() {
    this.physics.world.gravity.y = 0;
    this.projIdx = 0; this.score = 0; this.projDone = 0; this.projCorrect = 0;
    this.elements = []; this.userAnswers = [];
    this._drawIDE(); this._createHUD();
    const ui = this.scene.get("UIScene");
    if (ui && ui.setLevelLabel) ui.setLevelLabel("Level 15: Code Builder Pro");
    this._showIntro();
  }

  _drawIDE() {
    // BG
    this.add.rectangle(W / 2, H / 2, W, H, 0x1e1e1e).setDepth(0);
    // Menu bar
    this.add.rectangle(W / 2, 71, W, 30, 0x2d2d30).setDepth(1);
    ["File", "Edit", "View", "Run", "Help"].forEach((m, i) => {
      this.add.text(20 + i * 60, 71, m, { fontFamily: "Arial", fontSize: "12px", color: "#cccccc" }).setOrigin(0, 0.5).setDepth(2);
    });
    // Status bar
    this.statusBg = this.add.rectangle(W / 2, H - 15, W, 30, 0x007acc).setDepth(1);
    this.statusTxt = this.add.text(W / 2, H - 15, "Ready", { fontFamily: "Arial", fontSize: "12px", color: "#fff" }).setOrigin(0.5).setDepth(2);
  }

  _createHUD() {
    this.projTxt = this.add.text(W / 2, 71, `Project 0/${PROJECTS.length}`, { fontFamily: "Arial", fontSize: "12px", color: "#fbbf24", fontStyle: "bold" }).setOrigin(0.5).setDepth(3);
    this.scoreTxt = this.add.text(W - 20, 71, `Score: 0`, { fontFamily: "Arial", fontSize: "12px", color: "#4ade80" }).setOrigin(1, 0.5).setDepth(3);
  }

  _addEl(...els) { els.forEach(e => this.elements.push(e)); }
  _clear() { this.elements.forEach(e => { try { e.destroy(); } catch { } }); this.elements = []; }

  _showIntro() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x1e1e1e, 0.98); pg.fillRoundedRect(W / 2 - 280, 60, 560, 460, 16);
    pg.lineStyle(3, 0x007acc); pg.strokeRoundedRect(W / 2 - 280, 60, 560, 460, 16);
    const t1 = this.add.text(W / 2, 100, "💻 CODE BUILDER PRO 💻", { fontFamily: "Arial", fontSize: "26px", color: "#4fc3f7", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    const t2 = this.add.text(W / 2, 140, "Build Real Java Programs!", { fontFamily: "Arial", fontSize: "16px", color: "#81d4fa" }).setOrigin(0.5).setDepth(202);
    const t3 = this.add.text(W / 2, 270,
      "You're a professional programmer!\n" +
      "Clients need real programs written.\n\n" +
      "📋 Read the client requirements\n" +
      "💻 Fill in the missing OPERATORS\n" +
      "▶ Run the code to test it\n" +
      "✅ Pass all tests to complete\n\n" +
      `Complete ${PROJECTS.length} projects to graduate!`,
      { fontFamily: "Arial", fontSize: "14px", color: "#b0bec5", align: "center", lineSpacing: 6 }).setOrigin(0.5).setDepth(202);
    const bb = this.add.rectangle(W / 2, 460, 220, 48, 0x007acc).setDepth(202).setInteractive({ useHandCursor: true });
    bb.setStrokeStyle(2, 0x4fc3f7);
    const bt = this.add.text(W / 2, 460, "START CODING", { fontFamily: "Arial", fontSize: "18px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    bb.on("pointerover", () => bb.setFillStyle(0x005a9e));
    bb.on("pointerout", () => bb.setFillStyle(0x007acc));
    bb.on("pointerup", () => { [ov, pg, t1, t2, t3, bb, bt].forEach(e => e.destroy()); this._loadProject(); });
  }

  _loadProject() {
    this._clear();
    const p = PROJECTS[this.projIdx];
    this.userAnswers = new Array(p.blanks.length).fill(null);
    this.projTxt.setText(`Project ${this.projIdx + 1}/${PROJECTS.length}`);
    this.statusTxt.setText(`${p.icon} ${p.title}.java`);

    // Client panel
    const cpg = this.add.graphics().setDepth(10);
    cpg.fillStyle(0x2d2d30, 0.95); cpg.fillRoundedRect(20, 90, W - 40, 65, 8);
    cpg.lineStyle(2, 0x007acc, 0.5); cpg.strokeRoundedRect(20, 90, W - 40, 65, 8);
    this._addEl(cpg);
    this._addEl(this.add.text(40, 100, `${p.icon} Client: ${p.client}`, { fontFamily: "Arial", fontSize: "14px", color: "#4fc3f7", fontStyle: "bold" }).setDepth(11));
    this._addEl(this.add.text(40, 120, `Task: ${p.title}`, { fontFamily: "Arial", fontSize: "13px", color: "#e0e0e0" }).setDepth(11));
    this._addEl(this.add.text(40, 140, p.reqs.map(r => "• " + r).join("  |  "), { fontFamily: "Arial", fontSize: "11px", color: "#81c784" }).setDepth(11));

    // Code editor area
    const eg = this.add.graphics().setDepth(10);
    eg.fillStyle(0x1e1e1e, 1); eg.fillRoundedRect(20, 165, W - 40, 240, 8);
    eg.lineStyle(1, 0x3e3e42); eg.strokeRoundedRect(20, 165, W - 40, 240, 8);
    this._addEl(eg);

    // Line numbers + code
    let blankCounter = 0;
    this.blankBtns = [];
    p.code.forEach((line, li) => {
      const ly = 180 + li * 28;
      // Line number
      this._addEl(this.add.text(35, ly, `${li + 1}`, { fontFamily: "Courier New", fontSize: "13px", color: "#6a737d" }).setDepth(11));

      if (line.includes("___")) {
        // Split around blanks
        const parts = line.split("___");
        let cx = 55;
        parts.forEach((part, pi) => {
          if (pi > 0) {
            // Render blank button
            const bi = blankCounter;
            blankCounter++;
            const blank = p.blanks[bi];
            const bw = 50;
            const bbg = this.add.graphics().setDepth(11);
            bbg.fillStyle(0x0d47a1, 0.6); bbg.fillRoundedRect(cx, ly - 8, bw, 22, 4);
            bbg.lineStyle(1, 0x42a5f5); bbg.strokeRoundedRect(cx, ly - 8, bw, 22, 4);
            const btxt = this.add.text(cx + bw / 2, ly + 3, "___", { fontFamily: "Courier New", fontSize: "13px", color: "#ffcc80", fontStyle: "bold" }).setOrigin(0.5).setDepth(12);
            const bhit = this.add.rectangle(cx + bw / 2, ly + 3, bw, 22).setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(13);
            this._addEl(bbg, btxt, bhit);
            this.blankBtns.push({ bbg, btxt, bhit, bi, blank, cx, ly });

            // Cycle through options on click
            let optIdx = -1;
            bhit.on("pointerup", () => {
              optIdx = (optIdx + 1) % blank.opts.length;
              this.userAnswers[bi] = blank.opts[optIdx];
              btxt.setText(blank.opts[optIdx]);
              btxt.setColor("#ffd700");
              bbg.clear(); bbg.fillStyle(0x1b5e20, 0.6); bbg.fillRoundedRect(cx, ly - 8, bw, 22, 4);
              bbg.lineStyle(1, 0x66bb6a); bbg.strokeRoundedRect(cx, ly - 8, bw, 22, 4);
            });
            cx += bw + 4;
          }
          // Render code text with basic highlighting
          const colored = this._highlight(part);
          const pt = this.add.text(cx, ly, part, { fontFamily: "Courier New", fontSize: "13px", color: "#d4d4d4" }).setDepth(11);
          this._addEl(pt);
          cx += pt.width + 2;
        });
      } else {
        const ct = this.add.text(55, ly, line, { fontFamily: "Courier New", fontSize: "13px", color: "#d4d4d4" }).setDepth(11);
        this._addEl(ct);
      }
    });

    // Output panel
    const og = this.add.graphics().setDepth(10);
    og.fillStyle(0x1e1e1e, 1); og.fillRoundedRect(20, 415, W - 40, 100, 8);
    og.lineStyle(1, 0x3e3e42); og.strokeRoundedRect(20, 415, W - 40, 100, 8);
    this._addEl(og);
    this._addEl(this.add.text(35, 420, "OUTPUT", { fontFamily: "Arial", fontSize: "11px", color: "#888", fontStyle: "bold" }).setDepth(11));
    this.outputTxt = this.add.text(35, 435, "Click blanks to select operators, then Run Code.", { fontFamily: "Courier New", fontSize: "12px", color: "#4ec9b0", lineSpacing: 3 }).setDepth(11);
    this._addEl(this.outputTxt);

    // Run button
    const runBg = this.add.rectangle(W / 2, 540, 180, 36, 0x007acc).setDepth(20).setInteractive({ useHandCursor: true });
    runBg.setStrokeStyle(2, 0x4fc3f7);
    const runTxt = this.add.text(W / 2, 540, "▶ Run Code", { fontFamily: "Arial", fontSize: "15px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(21);
    this._addEl(runBg, runTxt);
    runBg.on("pointerover", () => runBg.setFillStyle(0x005a9e));
    runBg.on("pointerout", () => runBg.setFillStyle(0x007acc));
    runBg.on("pointerup", () => this._runCode());
  }

  _highlight(text) { return text; }// simplified — color handled by Phaser text

  _runCode() {
    const p = PROJECTS[this.projIdx];
    // Check all blanks filled
    if (this.userAnswers.some(a => a === null)) {
      this.outputTxt.setText("⚠ Fill in all blanks first!");
      this.outputTxt.setColor("#ffa726");
      return;
    }
    this.statusTxt.setText("Running...");
    this.statusBg.setFillStyle(0x4caf50);

    // Simulate execution animation
    this.time.delayedCall(600, () => {
      const allCorrect = p.blanks.every((b, i) => this.userAnswers[i] === b.ans);
      this.projDone++;
      if (allCorrect) {
        this.projCorrect++;
        this.score += 200;
        this.scoreTxt.setText(`Score: ${this.score}`);
        GameManager.addXP(100); GameManager.addScore(200);
        this.outputTxt.setText(`✅ All tests passed!\n${p.output}`);
        this.outputTxt.setColor("#4ade80");
        this.statusTxt.setText("✓ Success");
        this.cameras.main.flash(300, 50, 200, 50);
      } else {
        this.outputTxt.setText(`❌ Tests failed!\nExpected: ${p.blanks.map(b => b.ans).join(", ")}\nYour: ${this.userAnswers.join(", ")}`);
        this.outputTxt.setColor("#ef5350");
        this.statusTxt.setText("✗ Failed");
        this.statusBg.setFillStyle(0xd32f2f);
        this.cameras.main.shake(200, 0.008);
      }

      this.time.delayedCall(1500, () => {
        this.statusBg.setFillStyle(0x007acc);
        this._showProjectResult(allCorrect, p);
      });
    });
  }

  _showProjectResult(passed, p) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(300);
    const pg = this.add.graphics().setDepth(301);
    pg.fillStyle(0x252526, 0.98); pg.fillRoundedRect(W / 2 - 220, H / 2 - 100, 440, 200, 12);
    pg.lineStyle(3, passed ? 0x4caf50 : 0xd32f2f); pg.strokeRoundedRect(W / 2 - 220, H / 2 - 100, 440, 200, 12);
    const ic = this.add.text(W / 2, H / 2 - 60, passed ? "✅ PROJECT COMPLETE!" : "❌ Try Again", { fontFamily: "Arial", fontSize: "20px", color: passed ? "#4ade80" : "#ef5350", fontStyle: "bold" }).setOrigin(0.5).setDepth(302);
    const sc = this.add.text(W / 2, H / 2 - 25, `${p.icon} ${p.title}`, { fontFamily: "Arial", fontSize: "14px", color: "#e0e0e0" }).setOrigin(0.5).setDepth(302);
    const exp = this.add.text(W / 2, H / 2 + 5, `Correct operators: ${p.blanks.map(b => b.ans).join("  ")}`, { fontFamily: "Courier New", fontSize: "13px", color: "#ffd700" }).setOrigin(0.5).setDepth(302);
    const nb = this.add.rectangle(W / 2, H / 2 + 60, 180, 40, passed ? 0x007acc : 0xd32f2f).setDepth(302).setInteractive({ useHandCursor: true });
    const nt = this.add.text(W / 2, H / 2 + 60, passed ? "Next Project →" : "Retry", { fontFamily: "Arial", fontSize: "15px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(303);
    nb.on("pointerup", () => {
      [ov, pg, ic, sc, exp, nb, nt].forEach(e => e.destroy());
      if (passed) {
        this.projIdx++;
        if (this.projIdx >= PROJECTS.length) { this._showResults(); return; }
        this._loadProject();
      } else { this._loadProject(); }
    });
  }

  _showResults() {
    this._clear();
    const acc = PROJECTS.length > 0 ? Math.round((this.projCorrect / PROJECTS.length) * 100) : 0;
    const passed = acc >= 60;
    if (passed) { GameManager.completeLevel(14, acc); BadgeSystem.unlock("code_master"); /* saved by GameManager */ this.cameras.main.flash(600, 100, 255, 100); }

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);
    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x1e1e1e, 0.98); pg.fillRoundedRect(W / 2 - 260, 60, 520, 480, 16);
    pg.lineStyle(3, passed ? 0x4caf50 : 0xd32f2f); pg.strokeRoundedRect(W / 2 - 260, 60, 520, 480, 16);
    this.add.text(W / 2, 95, passed ? "💻 MASTER DEVELOPER! 💻" : "💻 Keep Coding!", { fontFamily: "Arial", fontSize: "24px", color: passed ? "#4ade80" : "#fbbf24", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    this.add.text(W / 2, 130, `Projects: ${this.projCorrect}/${PROJECTS.length} | Score: ${this.score}`, { fontFamily: "Arial", fontSize: "16px", color: "#e2e8f0" }).setOrigin(0.5).setDepth(202);
    this.add.text(W / 2, 155, `Code Quality: ${acc}%`, { fontFamily: "Arial", fontSize: "14px", color: "#94a3b8" }).setOrigin(0.5).setDepth(202);

    let py = 190;
    PROJECTS.forEach((p, i) => {
      const done = i < this.projIdx;
      this.add.text(W / 2, py, `${p.icon} ${p.title}: ${done ? "✓" : "—"}`, { fontFamily: "Arial", fontSize: "12px", color: done ? "#4ade80" : "#64748b" }).setOrigin(0.5).setDepth(202);
      py += 20;
    });

    if (passed) {
      this.add.text(W / 2, py + 15, "🏆 Badge: Code Master 👑", { fontFamily: "Arial", fontSize: "16px", color: "#ffd700", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
      this.add.text(W / 2, py + 40, "🎉 OPERATORS MODULE COMPLETE! 🎉", { fontFamily: "Arial", fontSize: "14px", color: "#4fc3f7", fontStyle: "bold" }).setOrigin(0.5).setDepth(202);
    }

    const by = 500;
    const rb = this.add.rectangle(W / 2 - 90, by, 160, 44, 0x475569).setDepth(202).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 - 90, by, passed ? "Replay" : "Retry", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    rb.on("pointerup", () => this.scene.restart());
    const mb = this.add.rectangle(W / 2 + 90, by, 160, 44, 0x007acc).setDepth(202).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 + 90, by, "Menu", { fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(203);
    mb.on("pointerup", () => this.scene.start("MenuScene"));
  }
}
