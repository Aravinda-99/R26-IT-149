import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";
import { PanelFit } from "../../PanelFit.js";

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
    const cam = this.cameras.main;
    const updateCamera = () => {
      const zoom = Math.min(this.scale.width / W, this.scale.height / H);
      cam.setZoom(zoom);
      cam.centerOn(W / 2, H / 2);
    };
    updateCamera();
    this.scale.on('resize', updateCamera, this);
    this.events.once('shutdown', () => this.scale.off('resize', updateCamera, this));

    this.physics.world.gravity.y = 0;
    this.projIdx = 0; this.score = 0; this.projDone = 0; this.projCorrect = 0;
    this.elements = []; this.userAnswers = []; this.currentDropdown = null;
    this._drawIDE(); this._createHUD();
    const ui = this.scene.get("UIScene");
    if (ui && ui.setLevelLabel) ui.setLevelLabel("Level 15: Code Builder Pro");
    this._showIntro();
  }

  _drawIDE() {
    this.add.rectangle(W / 2, H / 2, W * 5, H * 3, 0x1e1e1e).setDepth(0);
    // Menu bar (Stretched — Y/height unchanged)
    this.add.rectangle(W / 2, 71, W * 5, 30, 0x2d2d30).setDepth(1);
    ["File", "Edit", "View", "Run", "Help"].forEach((m, i) => {
      this.add.text(20 + i * 70, 71, m, { fontFamily: "Arial", fontSize: "16px", color: "#cccccc" }).setOrigin(0, 0.5).setDepth(2);
    });
    // Status bar (Stretched — Y/height unchanged)
    this.statusBg = this.add.rectangle(W / 2, H - 15, W * 5, 30, 0x007acc).setDepth(1);
    this.statusTxt = this.add.text(W / 2, H - 15, "Ready", { fontFamily: "Arial", fontSize: "16px", color: "#fff" }).setOrigin(0.5).setDepth(2);
  }

  _createHUD() {
    this.projTxt = this.add.text(W / 2, 71, `Project 0/${PROJECTS.length}`, { fontFamily: "Arial", fontSize: "16px", color: "#fbbf24", fontStyle: "bold" }).setOrigin(0.5).setDepth(3);
    this.scoreTxt = this.add.text(W - 20, 71, `Score: 0`, { fontFamily: "Arial", fontSize: "16px", color: "#4ade80" }).setOrigin(1, 0.5).setDepth(3);
  }

  _addEl(...els) { els.forEach(e => this.elements.push(e)); }
  _clear() { this.elements.forEach(e => { try { e.destroy(); } catch { } }); this.elements = []; }

  _showIntro() {
    PanelFit.arm(this);
    const ov = this.add.rectangle(W / 2, H / 2, W * 5, H * 3, 0x000000, 0.85).setDepth(200);
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

  _measure(str, fontSize, bold) {
    const m = this.add.text(0, 0, str, { fontFamily: "Courier New", fontSize: `${fontSize}px`, fontStyle: bold ? "bold" : "normal" });
    const w = m.width, h = m.height;
    m.destroy();
    return { w, h };
  }

  _loadProject() {
    this._clear();
    const p = PROJECTS[this.projIdx];
    this.userAnswers = new Array(p.blanks.length).fill(null);
    this.projTxt.setText(`Project ${this.projIdx + 1}/${PROJECTS.length}`);
    this.statusTxt.setText(`${p.icon} ${p.title}.java`);

    const PAD = 14, CODE_FONT = 20, LINE_H = 28, GAP = 8;
    const CODE_X = 76, NUM_RIGHT = 62;

    const hdr = this.add.text(40, 98, `${p.icon} Client: ${p.client}   •   Task: ${p.title}`, { fontFamily: "Arial", fontSize: "20px", color: "#4fc3f7", fontStyle: "bold" }).setDepth(11);
    const hint = this.add.text(40, hdr.y + hdr.height + 4, p.reqs.map(r => "• " + r).join("  |  "), { fontFamily: "Arial", fontSize: "20px", color: "#81c784" }).setDepth(11);
    const cTop = 90, cH = (hint.y + hint.height + 8) - cTop;
    const cpg = this.add.graphics().setDepth(10);
    cpg.fillStyle(0x2d2d30, 0.95); cpg.fillRoundedRect(20, cTop, W - 40, cH, 8);
    cpg.lineStyle(2, 0x007acc, 0.5); cpg.strokeRoundedRect(20, cTop, W - 40, cH, 8);
    this._addEl(cpg, hdr, hint);

    const maxLines = Math.max(...PROJECTS.map(pr => pr.code.length));
    const eTop = cTop + cH + 8, eH = maxLines * LINE_H + 2 * PAD;
    const eg = this.add.graphics().setDepth(10);
    eg.fillStyle(0x1e1e1e, 1); eg.fillRoundedRect(20, eTop, W - 40, eH, 8);
    eg.lineStyle(1, 0x3e3e42); eg.strokeRoundedRect(20, eTop, W - 40, eH, 8);
    this._addEl(eg);

    const widest = Math.max(this._measure("___", CODE_FONT, true).w, ...p.blanks.flatMap(bl => bl.opts.map(o => this._measure(o, CODE_FONT, true).w)));
    const bw = Math.max(60, Math.ceil(widest) + 24);
    const th = this._measure("Mg", CODE_FONT, false).h;       // text height of one code line
    const codeStyle = { fontFamily: "Courier New", fontSize: `${CODE_FONT}px`, color: "#d4d4d4" };

    let blankCounter = 0;
    this.blankBtns = [];
    p.code.forEach((line, li) => {
      const ly = eTop + PAD + li * LINE_H;
      this._addEl(this.add.text(NUM_RIGHT, ly, `${li + 1}`, { fontFamily: "Courier New", fontSize: `${CODE_FONT}px`, color: "#6a737d" }).setOrigin(1, 0).setDepth(11));

      const parts = line.split("___");
      let cx = CODE_X;
      parts.forEach((rawPart, pi) => {
        if (pi > 0) {
          const bi = blankCounter++;
          const blank = p.blanks[bi];
          const bx = cx;
          const bbg = this.add.graphics().setDepth(11);
          const drawBox = (fill, line) => {
            bbg.clear();
            bbg.fillStyle(fill, 0.6); bbg.fillRoundedRect(bx, ly - 2, bw, th + 4, 4);
            bbg.lineStyle(1, line); bbg.strokeRoundedRect(bx, ly - 2, bw, th + 4, 4);
          };
          drawBox(0x0d47a1, 0x42a5f5);
          const btxt = this.add.text(bx + bw / 2, ly + th / 2, "___", { fontFamily: "Courier New", fontSize: `${CODE_FONT}px`, color: "#ffcc80", fontStyle: "bold" }).setOrigin(0.5).setDepth(12);
          const bhit = this.add.rectangle(bx + bw / 2, ly + th / 2, bw, th + 4).setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(13);
          this._addEl(bbg, btxt, bhit);
          this.blankBtns.push({ bbg, btxt, bhit, bi, blank, cx: bx, ly });

          // Dropdown Menu Logic
          bhit.on("pointerup", () => {
            // 1. Destroy any currently open dropdown
            if (this.currentDropdown) {
              this.currentDropdown.destroy();
            }

            const OPT_H = 32;
            const dropW = Math.max(bw, 76);
            const dropH = blank.opts.length * OPT_H;
            const dropContainer = this.add.container(bx + bw / 2 - dropW / 2, ly + th + 6).setDepth(200);
            this.currentDropdown = dropContainer;

            // 2. Draw Dropdown Background (VS Code Dark Style)
            const dbg = this.add.graphics();
            dbg.fillStyle(0x252526, 0.98);
            dbg.fillRoundedRect(0, 0, dropW, dropH, 4);
            dbg.lineStyle(1, 0x454545);
            dbg.strokeRoundedRect(0, 0, dropW, dropH, 4);
            dropContainer.add(dbg);

            // 3. Add Options
            blank.opts.forEach((opt, idx) => {
              const optY = idx * OPT_H;
              const optHit = this.add.rectangle(dropW / 2, optY + OPT_H / 2, dropW - 4, OPT_H - 4).setInteractive({ useHandCursor: true });
              const optTxt = this.add.text(dropW / 2, optY + OPT_H / 2, opt, {
                fontFamily: "Courier New", fontSize: "20px", color: "#d4d4d4", fontStyle: "bold"
              }).setOrigin(0.5);

              // Hover effects
              optHit.on("pointerover", () => optHit.setFillStyle(0x094771, 1));
              optHit.on("pointerout", () => optHit.setFillStyle(0x000000, 0));

              // Select option
              optHit.on("pointerup", () => {
                this.userAnswers[bi] = opt;
                btxt.setText(opt);
                btxt.setColor("#ffd700");
                drawBox(0x1b5e20, 0x66bb6a);

                dropContainer.destroy();
                this.currentDropdown = null;
              });

              dropContainer.add([optHit, optTxt]);
            });

            this._addEl(dropContainer);
          });
          cx += bw + GAP;
        }
        let part = rawPart;
        if (pi > 0) part = part.replace(/^\s+/, "");
        if (pi < parts.length - 1) part = part.replace(/\s+$/, "");
        if (part) {
          const pt = this.add.text(cx, ly, part, codeStyle).setDepth(11);
          this._addEl(pt);
          cx += pt.width;
          if (pi < parts.length - 1) cx += GAP;
        }
      });
    });

    const RUN_Y = 546;
    const oTop = eTop + eH + 8, oBottom = RUN_Y - 26;
    const og = this.add.graphics().setDepth(10);
    og.fillStyle(0x1e1e1e, 1); og.fillRoundedRect(20, oTop, W - 40, oBottom - oTop, 8);
    og.lineStyle(1, 0x3e3e42); og.strokeRoundedRect(20, oTop, W - 40, oBottom - oTop, 8);
    this._addEl(og);
    this._addEl(this.add.text(W - 36, oTop + 8, "OUTPUT", { fontFamily: "Arial", fontSize: "18px", color: "#888", fontStyle: "bold" }).setOrigin(1, 0).setDepth(11));
    this.outputTxt = this.add.text(36, oTop + 8, "Click blanks to select operators, then Run Code.", { fontFamily: "Courier New", fontSize: "18px", color: "#4ec9b0", lineSpacing: 2, wordWrap: { width: W - 190 } }).setDepth(11);
    this._addEl(this.outputTxt);

    // Run button
    const runBg = this.add.rectangle(W / 2, RUN_Y, 190, 40, 0x007acc).setDepth(20).setInteractive({ useHandCursor: true });
    runBg.setStrokeStyle(2, 0x4fc3f7);
    const runTxt = this.add.text(W / 2, RUN_Y, "▶ Run Code", { fontFamily: "Arial", fontSize: "20px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(21);
    this._addEl(runBg, runTxt);
    runBg.on("pointerover", () => runBg.setFillStyle(0x005a9e));
    runBg.on("pointerout", () => runBg.setFillStyle(0x007acc));
    runBg.on("pointerup", () => this._runCode());
  }

  _highlight(text) { return text; }

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
    const ov = this.add.rectangle(W / 2, H / 2, W * 5, H * 3, 0x000000, 0.6).setDepth(300);
    const pg = this.add.graphics().setDepth(301);
    pg.fillStyle(0x252526, 0.98); pg.fillRoundedRect(W / 2 - 250, H / 2 - 115, 500, 230, 12);
    pg.lineStyle(3, passed ? 0x4caf50 : 0xd32f2f); pg.strokeRoundedRect(W / 2 - 250, H / 2 - 115, 500, 230, 12);
    const ic = this.add.text(W / 2, H / 2 - 78, passed ? "✅ PROJECT COMPLETE!" : "❌ Try Again", { fontFamily: "Arial", fontSize: "24px", color: passed ? "#4ade80" : "#ef5350", fontStyle: "bold" }).setOrigin(0.5).setDepth(302);
    const sc = this.add.text(W / 2, H / 2 - 36, `${p.icon} ${p.title}`, { fontFamily: "Arial", fontSize: "20px", color: "#e0e0e0" }).setOrigin(0.5).setDepth(302);
    const exp = this.add.text(W / 2, H / 2 + 2, `Correct operators: ${p.blanks.map(b => b.ans).join("  ")}`, { fontFamily: "Courier New", fontSize: "18px", color: "#ffd700" }).setOrigin(0.5).setDepth(302);
    const nb = this.add.rectangle(W / 2, H / 2 + 66, 210, 46, passed ? 0x007acc : 0xd32f2f).setDepth(302).setInteractive({ useHandCursor: true });
    const nt = this.add.text(W / 2, H / 2 + 66, passed ? "Next Project →" : "Retry", { fontFamily: "Arial", fontSize: "20px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(303);
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
    PanelFit.arm(this);
    this._clear();
    const acc = PROJECTS.length > 0 ? Math.round((this.projCorrect / PROJECTS.length) * 100) : 0;
    const passed = acc >= 60;
    if (passed) { GameManager.completeLevel(14, acc); BadgeSystem.unlock("code_master"); /* saved by GameManager */ this.cameras.main.flash(600, 100, 255, 100); }

    const ov = this.add.rectangle(W / 2, H / 2, W * 5, H * 3, 0x000000, 0.85).setDepth(200);
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
