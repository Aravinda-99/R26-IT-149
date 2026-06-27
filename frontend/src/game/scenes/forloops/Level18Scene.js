/**
 * Level18Scene — Loop Architect  (Restructuring Phase)
 * Canvas: 800×600 | All Phaser 3 graphics primitives
 * Click-to-select + click-to-place block system
 */
import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

/* ── Layout ─────────────────────────────────────────────────────── */
const W = 800, H = 600;
const ED_X = 6, ED_Y = 52, ED_W = 370, ED_H = 290;   // editor panel
const VIS_X = 382, VIS_Y = 52, VIS_W = 412, VIS_H = 290; // visual panel
const CON_Y = 58, CON_H = 38;                           // console strip
const VZ_X = 388, VZ_Y = 100, VZ_W = 400, VZ_H = 240; // visual zone
const GUT_W = 30, TAB_H = 24;
const CX = ED_X + GUT_W + 4;   // 40  code text start x
const CY = ED_Y + TAB_H + 4;   // 80  code text start y
const CLH = 16;                  // code line height
const TRAY_X = 6, TRAY_Y = 348, TRAY_W = 788, TRAY_H = 158;
const RUN_X = 105, RUN_Y = 514, RUN_W = 160, RUN_H = 34;

/* ── Syntax token colours ───────────────────────────────────────── */
const TC = {
  keyword:'#ff4081', number:'#ffd740', operator:'#ff8a65',
  string:'#00e676', method:'#4fc3f7', comment:'#546e7a',
  punct:'#78909c', variable:'#00e5ff', default:'#e0e0e0',
};
const KW = new Set(['public','class','static','void','int','for','if','else',
  'while','return','System','String','true','false','println','print']);

/* ── Category colours ───────────────────────────────────────────── */
const CC = { init:'#00e5ff', condition:'#ffd740', update:'#00e676', body:'#b0bec5' };

/* ── 8 Projects ─────────────────────────────────────────────────── */
const PROJECTS = [
  { id:1, title:'Hello Repeater', filename:'HelloRepeater.java',
    briefing:'Print "Hello World" exactly 5 times.',
    expectedOutput:'Hello World\nHello World\nHello World\nHello World\nHello World',
    preCode:['public class HelloRepeater {','    public static void main(String[] args) {'],
    postCode:['    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 0', condition:'i < 5', update:'i++', body:'System.out.println("Hello World");' },
    blocks:[
      {text:'int i = 0', category:'init'}, {text:'int i = 1', category:'init'},
      {text:'i < 5', category:'condition'}, {text:'i <= 5', category:'condition'},
      {text:'i++', category:'update'},
      {text:'System.out.println("Hello World");', category:'body'},
      {text:'System.out.println(i);', category:'body'},
    ], visual:'greeting_cards' },

  { id:2, title:'Countdown Timer', filename:'Countdown.java',
    briefing:'Build a countdown from 5 to 1, then "Launch!" prints automatically.',
    expectedOutput:'5\n4\n3\n2\n1\nLaunch!',
    preCode:['public class Countdown {','    public static void main(String[] args) {'],
    postCode:['        System.out.println("Launch!");','    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 5', condition:'i >= 1', update:'i--', body:'System.out.println(i);' },
    blocks:[
      {text:'int i = 5', category:'init'}, {text:'int i = 1', category:'init'},
      {text:'i >= 1', category:'condition'}, {text:'i > 0', category:'condition'},
      {text:'i < 5', category:'condition'},
      {text:'i--', category:'update'}, {text:'i++', category:'update'},
      {text:'System.out.println(i);', category:'body'},
    ], visual:'rocket_launch' },

  { id:3, title:'Sum Calculator', filename:'SumCalc.java',
    briefing:'Calculate the sum of numbers from 1 to 10.',
    expectedOutput:'Total: 55',
    preCode:['public class SumCalc {','    public static void main(String[] args) {','        int sum = 0;'],
    postCode:['        System.out.println("Total: " + sum);','    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 1', condition:'i <= 10', update:'i++', body:'sum += i;' },
    blocks:[
      {text:'int i = 1', category:'init'}, {text:'int i = 0', category:'init'},
      {text:'i <= 10', category:'condition'}, {text:'i < 10', category:'condition'},
      {text:'i++', category:'update'},
      {text:'sum += i;', category:'body'}, {text:'sum = i;', category:'body'},
    ], visual:'balance_scale' },

  { id:4, title:'Even Number Printer', filename:'EvenPrinter.java',
    briefing:'Print all even numbers from 2 to 20.',
    expectedOutput:'2\n4\n6\n8\n10\n12\n14\n16\n18\n20',
    preCode:['public class EvenPrinter {','    public static void main(String[] args) {'],
    postCode:['    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 2', condition:'i <= 20', update:'i += 2', body:'System.out.println(i);' },
    blocks:[
      {text:'int i = 2', category:'init'}, {text:'int i = 0', category:'init'},
      {text:'i <= 20', category:'condition'}, {text:'i < 20', category:'condition'},
      {text:'i += 2', category:'update'}, {text:'i++', category:'update'},
      {text:'System.out.println(i);', category:'body'},
    ], visual:'number_line' },

  { id:5, title:'Star Pattern Builder', filename:'StarPattern.java',
    briefing:'Print a triangle of stars: row 1 = *, row 2 = **, up to row 5.',
    expectedOutput:'*\n**\n***\n****\n*****',
    preCode:['public class StarPattern {','    public static void main(String[] args) {'],
    postCode:['    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 1', condition:'i <= 5', update:'i++', body:'for(j<i) print("*"); println();' },
    blocks:[
      {text:'int i = 1', category:'init'}, {text:'int i = 0', category:'init'},
      {text:'i <= 5', category:'condition'}, {text:'i < 5', category:'condition'},
      {text:'i++', category:'update'},
      {text:'for(j<i) print("*"); println();', category:'body'},
      {text:'System.out.println("*");', category:'body'},
    ], visual:'pyramid_crane' },

  { id:6, title:'Multiplication Table', filename:'MultiTable.java',
    briefing:'Print the multiplication table for 7 (7×1 through 7×10).',
    expectedOutput:'7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70',
    preCode:['public class MultiTable {','    public static void main(String[] args) {'],
    postCode:['    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 1', condition:'i <= 10', update:'i++', body:'println("7 x "+i+" = "+(7*i))' },
    blocks:[
      {text:'int i = 1', category:'init'}, {text:'int i = 0', category:'init'},
      {text:'i <= 10', category:'condition'}, {text:'i < 10', category:'condition'},
      {text:'i++', category:'update'},
      {text:'println("7 x "+i+" = "+(7*i))', category:'body'},
      {text:'println(7 * i)', category:'body'},
    ], visual:'chalkboard' },

  { id:7, title:'Array Sum', filename:'ArraySum.java',
    briefing:'Calculate the sum of all scores in the array to find the average.',
    expectedOutput:'Average: 87',
    preCode:['public class ArraySum {','    public static void main(String[] args) {',
             '        int[] scores = {85,92,78,95,88};','        int total = 0;'],
    postCode:['        System.out.println("Average: "+(total/scores.length));','    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'}, body:{label:'body'} },
    correct:{ init:'int i = 0', condition:'i < scores.length', update:'i++', body:'total += scores[i];' },
    blocks:[
      {text:'int i = 0', category:'init'}, {text:'int i = 1', category:'init'},
      {text:'i < scores.length', category:'condition'}, {text:'i <= scores.length', category:'condition'},
      {text:'i++', category:'update'},
      {text:'total += scores[i];', category:'body'}, {text:'total += i;', category:'body'},
    ], visual:'scoreboard' },

  { id:8, title:'FizzBuzz Lite', filename:'FizzBuzz.java',
    briefing:'Print 1–15. Multiples of 3→"Fizz", of 5→"Buzz", of both→"FizzBuzz".',
    expectedOutput:'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
    preCode:['public class FizzBuzz {','    public static void main(String[] args) {'],
    postCode:['    }','}'],
    slots:{ init:{label:'init'}, condition:{label:'condition'}, update:{label:'update'},
            body1:{label:'body'}, body2:{label:'body'}, body3:{label:'body'}, body4:{label:'body'} },
    correct:{ init:'int i = 1', condition:'i <= 15', update:'i++',
              body1:'if(i%15==0) print("FizzBuzz")',
              body2:'else if(i%3==0) print("Fizz")',
              body3:'else if(i%5==0) print("Buzz")',
              body4:'else print(i)' },
    blocks:[
      {text:'int i = 1', category:'init'}, {text:'int i = 0', category:'init'},
      {text:'i <= 15', category:'condition'}, {text:'i < 15', category:'condition'},
      {text:'i++', category:'update'},
      {text:'if(i%15==0) print("FizzBuzz")', category:'body', slot:'body1'},
      {text:'else if(i%3==0) print("Fizz")', category:'body', slot:'body2'},
      {text:'else if(i%5==0) print("Buzz")', category:'body', slot:'body3'},
      {text:'else print(i)', category:'body', slot:'body4'},
      {text:'if(i%3==0) print("Fizz")', category:'body', slot:'body1'},
    ], visual:'conveyor_belt' },
];

const BIT_FB = {
  wrong_count:   'Your loop ran the wrong number of times. Check your init value and condition.',
  off_by_one:    'Off by one! i < 5 gives values 0-4 (5 iterations). i <= 5 gives 0-5 (6 iterations).',
  wrong_body:    'The loop structure looks right but the body produces wrong results.',
  wrong_start:   'Output starts at the wrong value. The init (int i = ?) sets where counting begins.',
  wrong_step:    'Spacing between values is wrong. i++ steps by 1; i += 2 steps by 2.',
  wrong_direction:'Count down? Use i-- not i++.',
  wrong_order:   'In FizzBuzz, check i%15 FIRST, then i%3, then i%5, then the else.',
  array_bounds:  'Use i < array.length, NOT i <= array.length. Arrays go from 0 to length-1.',
  accumulate_err:'sum += i ADDS each time. sum = i REPLACES the previous sum (wrong!).',
  generic:       'Something is off with your loop. Check init, condition, update, and body carefully.',
};

/* ═══════════════════════════════════════════════════════════════════
   Scene
═══════════════════════════════════════════════════════════════════ */
export class Level18Scene extends Phaser.Scene {
  constructor() { super({ key: 'Level18Scene' }); }

  init() {
    this.currentProject = 0;
    this.totalScore = 0;
    this.firstTryCorrect = 0;
    this.projectAttempts = 0;
    this.projectStartTime = 0;
    this.projectResults = [];
    this._placed = {};       // slotKey → block text
    this._running = false;
    this._interactionDisabled = false;
    this._selectedBlock = null; // { text, category, trayEl }
    this._trayBlocks = [];      // { el, text, category, trayX, trayY, used }
    this._slotEls = {};         // slotKey → { bg, txt, zone }
    this._editorObjs = [];      // text/graphic objects in editor code area
    this._visualEls = [];       // objects in visual zone
    this._consoleText = null;
    this._runBtnGfx = null; this._runBtnTxt = null; this._runBtnZone = null;
    this._lineHighlight = null;
    this._loopMonitor = null; this._loopMonTxt = null;
    this._bitCont = null; this._bitBubble = null; this._bitBubbleTxt = null; this._bitTimer = null;
    this._tabTxt = null;
    this._ambientParts = [];
    this._levelStartTime = 0;
    this._vizRocket = null; // per-visual state
    this._vizCards = [];
    this._vizScaleBlocks = [];
    this._vizChalkLines = [];
    this._vizConvBoxes = { Fizz:0, Buzz:0, FizzBuzz:0, Number:0 };
    this._vizCountTotal = 0;
    this._vizPyramidBlocks = [];
    this._vizNLPillars = [];
    this._vizSBCards = [];
  }

  preload() {}

  create() {
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this._levelStartTime = Date.now();

    const pg = this.make.graphics({ add: false });
    pg.fillStyle(0xffffff); pg.fillCircle(4, 4, 4);
    pg.generateTexture('p18', 8, 8); pg.destroy();

    this._createBackground();
    this._createHUD();
    this._createEditorFrame();
    this._createVisualFrame();
    this._createBlockTray();
    this._createRunButton();
    this._createBit();

    this._showBriefing(0);
  }

  update() {
    this._ambientParts.forEach(p => {
      p.y -= p.speed;
      p.x += p.dx;
      if (p.y < 0) { p.y = 610; p.x = Phaser.Math.Between(10, W-10); }
    });
  }

  /* ── Background ─────────────────────────────────────────────── */
  _createBackground() {
    this.add.rectangle(W/2, H/2, W, H, 0x0b0f14);
    // Ambient strips
    const lL = this.add.rectangle(1, H/2, 3, H, 0x1565c0).setAlpha(0.08);
    const lR = this.add.rectangle(W-2, H/2, 3, H, 0x1565c0).setAlpha(0.08);
    [lL, lR].forEach(l => this.tweens.add({ targets: l, alpha: 0.14, duration: 4000, yoyo: true, repeat: -1 }));
    // Subtle grid in visual area
    const gg = this.add.graphics();
    gg.lineStyle(1, 0x1565c0, 0.06);
    for (let x = VZ_X; x <= VZ_X + VZ_W; x += 28) gg.lineBetween(x, VZ_Y, x, VZ_Y + VZ_H);
    for (let y = VZ_Y; y <= VZ_Y + VZ_H; y += 22) gg.lineBetween(VZ_X, y, VZ_X + VZ_W, y);
    // Ambient particles
    for (let i = 0; i < 28; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(10, W-10), Phaser.Math.Between(0, H), 1, 0x4fc3f7
      ).setAlpha(Phaser.Math.FloatBetween(0.04, 0.10));
      p.speed = Phaser.Math.FloatBetween(0.1, 0.25);
      p.dx = Phaser.Math.FloatBetween(-0.05, 0.05);
      this._ambientParts.push(p);
    }
  }

  /* ── HUD ─────────────────────────────────────────────────────── */
  _createHUD() {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0e13, 0.96); bg.fillRect(0, 0, W, 50);
    bg.lineStyle(1, 0x21262d, 1); bg.lineBetween(0, 50, W, 50);
    this.add.text(14, 10, 'LOOP ARCHITECT', { fontFamily:'Arial', fontSize:'13px', color:'#b0bec5', fontStyle:'bold' });
    this.add.text(14, 28, 'Restructuring Phase — For Loops', { fontFamily:'Arial', fontSize:'10px', color:'#546e7a' });
    // Progress dots
    const dots = [];
    for (let i = 0; i < 8; i++) {
      const dx = 330 + i * 50, dy = 28;
      const dot = this.add.circle(dx, dy, 6, 0x1a1a2e).setStrokeStyle(1, 0x2a2a4a);
      dots.push(dot);
    }
    this._hudDots = dots;
    // Progress bar
    const pbG = this.add.graphics();
    pbG.fillStyle(0x1a1a2e); pbG.fillRoundedRect(310, 16, 400, 6, 3);
    this._hudBarFill = this.add.graphics();
    this._updateHUDProgress(0);
    // Score
    this.add.text(W-115, 8, 'SCORE', { fontFamily:'Arial', fontSize:'9px', color:'#546e7a' });
    this._scoreTxt = this.add.text(W-115, 20, '0', { fontFamily:'Arial', fontSize:'16px', color:'#ffffff', fontStyle:'bold' });
    this._accTxt = this.add.text(W-115, 38, 'Accuracy: ---', { fontFamily:'Arial', fontSize:'9px', color:'#78909c' });
  }

  _updateHUDProgress(n) {
    if (this._hudBarFill) {
      this._hudBarFill.clear();
      if (n > 0) {
        this._hudBarFill.fillStyle(0x00e5ff); this._hudBarFill.fillRoundedRect(310, 16, (n/8)*400, 6, 3);
      }
    }
    if (this._hudDots) {
      this._hudDots.forEach((d, i) => {
        if (i < n) { d.setFillStyle(0x00e676); d.setStrokeStyle(0); }
        else if (i === n) { d.setFillStyle(0x0d1117); d.setStrokeStyle(2, 0x00e5ff); }
        else { d.setFillStyle(0x1a1a2e); d.setStrokeStyle(1, 0x2a2a4a); }
      });
    }
  }

  /* ── Editor frame ───────────────────────────────────────────── */
  _createEditorFrame() {
    const g = this.add.graphics();
    g.fillStyle(0x0d1117); g.fillRoundedRect(ED_X, ED_Y, ED_W, ED_H, 8);
    g.lineStyle(1, 0x21262d); g.strokeRoundedRect(ED_X, ED_Y, ED_W, ED_H, 8);
    // Tab bar
    g.fillStyle(0x161b22); g.fillRect(ED_X, ED_Y, ED_W, TAB_H);
    this._tabTxt = this.add.text(ED_X+12, ED_Y+5, 'HelloRepeater.java', {
      fontFamily:'Courier New', fontSize:'11px', color:'#b0bec5'
    });
    // Tab accent
    this.add.rectangle(ED_X + 65, ED_Y + TAB_H - 1, 140, 2, 0x00e5ff);
    // Gutter
    g.fillStyle(0x0d1117, 0.5); g.fillRect(ED_X, ED_Y+TAB_H, GUT_W, ED_H-TAB_H);
    this._editorGfx = g;
    // Cursor blink
    this._cursor = this.add.rectangle(CX, CY+2, 2, 14, 0x00e5ff).setAlpha(0);
    this.tweens.add({ targets: this._cursor, alpha: 1, duration: 600, yoyo: true, repeat: -1 });
  }

  /* ── Visual frame ───────────────────────────────────────────── */
  _createVisualFrame() {
    const g = this.add.graphics();
    g.fillStyle(0x0d1117); g.fillRoundedRect(VIS_X, VIS_Y, VIS_W, VIS_H, 8);
    g.lineStyle(1, 0x21262d); g.strokeRoundedRect(VIS_X, VIS_Y, VIS_W, VIS_H, 8);
    // Console strip
    g.fillStyle(0x000000); g.fillRect(VIS_X+4, CON_Y, VIS_W-8, CON_H);
    this.add.text(VIS_X+8, CON_Y+3, '> output', { fontFamily:'Courier New', fontSize:'9px', color:'#546e7a' });
    this._consoleText = this.add.text(VIS_X+8, CON_Y+14, '', {
      fontFamily:'Courier New', fontSize:'11px', color:'#00e676', wordWrap:{ width: VIS_W-20 }
    });
    // Idle cursor
    this._idleCursor = this.add.text(VIS_X+8, CON_Y+14, '█', {
      fontFamily:'Courier New', fontSize:'11px', color:'#00e676'
    }).setAlpha(0.4);
    this.tweens.add({ targets: this._idleCursor, alpha: 0.8, duration: 500, yoyo: true, repeat: -1 });
    // Visual zone "run to see" label
    this._vzDefaultTxt = this.add.text(VZ_X+VZ_W/2, VZ_Y+VZ_H/2, 'Run your code to see results', {
      fontFamily:'Arial', fontSize:'13px', color:'#2a2a4a'
    }).setOrigin(0.5);
  }

  /* ── Block Tray ─────────────────────────────────────────────── */
  _createBlockTray() {
    const g = this.add.graphics();
    g.fillStyle(0x0a0e13); g.fillRoundedRect(TRAY_X, TRAY_Y, TRAY_W, TRAY_H, 6);
    g.lineStyle(1, 0x21262d); g.lineBetween(TRAY_X, TRAY_Y, TRAY_X+TRAY_W, TRAY_Y);
    this.add.text(TRAY_X+10, TRAY_Y+6, 'CODE BLOCKS', {
      fontFamily:'Arial', fontSize:'9px', color:'#3d4450', fontStyle:'bold', letterSpacing: 2
    });
  }

  /* ── Run Button ─────────────────────────────────────────────── */
  _createRunButton() {
    const glowG = this.add.graphics();
    glowG.fillStyle(0x00e676, 0.12); glowG.fillRoundedRect(RUN_X-3, RUN_Y-3, RUN_W+6, RUN_H+6, 18);
    this.tweens.add({ targets: glowG, alpha: 0.05, duration: 1000, yoyo: true, repeat: -1 });
    this._runBtnGfx = this.add.graphics();
    this._runBtnTxt = this.add.text(RUN_X + RUN_W/2, RUN_Y + RUN_H/2, '▶ COMPILE & RUN', {
      fontFamily:'Arial', fontSize:'12px', color:'#0a0a1a', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(5);
    this._runBtnZone = this.add.zone(RUN_X, RUN_Y, RUN_W, RUN_H).setOrigin(0).setDepth(6).setInteractive();
    this._runBtnZone.on('pointerover', () => { if (!this._interactionDisabled && this._runEnabled) this._runBtnGfx.clear(), this._drawRunBtn(0x00e876); });
    this._runBtnZone.on('pointerout', () => { if (this._runEnabled) this._drawRunBtn(0x00c853); });
    this._runBtnZone.on('pointerdown', () => { if (!this._interactionDisabled && this._runEnabled) this._onCompileRun(); });
    this._runEnabled = false;
    this._drawRunBtn(0x00c853, 0.3);
  }

  _drawRunBtn(color, alpha) {
    this._runBtnGfx.clear();
    this._runBtnGfx.fillStyle(color || 0x00c853, alpha || 1);
    this._runBtnGfx.fillRoundedRect(RUN_X, RUN_Y, RUN_W, RUN_H, 17);
  }

  _enableRun() {
    this._runEnabled = true;
    this._drawRunBtn(0x00c853, 1);
    this.tweens.add({ targets: this._runBtnGfx, alpha: 1, duration: 300 });
    this.tweens.add({ targets: this._runBtnTxt, alpha: 1, duration: 300 });
  }

  _disableRun() {
    this._runEnabled = false;
    this._drawRunBtn(0x00c853, 0.3);
    this._runBtnTxt.setAlpha(0.3);
  }

  /* ── Bit Mascot ─────────────────────────────────────────────── */
  _createBit() {
    this._bitCont = this.add.container(W+80, 490);
    const g = this.add.graphics();
    g.fillStyle(0x14b8a6); g.fillRoundedRect(-14,-28,28,24,4);
    g.fillStyle(0x0d9488); g.fillCircle(0,-36,10);
    g.fillStyle(0x00e5ff); g.fillCircle(-4,-37,2.5); g.fillCircle(4,-37,2.5);
    g.lineStyle(2,0x00e5ff,0.8); g.lineBetween(0,-46,0,-53);
    g.fillStyle(0xffd740); g.fillCircle(0,-55,3);
    this._bitCont.add(g);
  }

  /* ── Project Briefing ───────────────────────────────────────── */
  _showBriefing(idx) {
    const cfg = PROJECTS[idx];
    this._briefEls = [];

    const cw = 460, ch = 220, cx = W/2 - cw/2, cy = H;
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.65); ov.fillRect(0, 0, W, H);
    ov.setAlpha(0); this.tweens.add({ targets: ov, alpha: 1, duration: 250 });
    this._briefEls.push(ov);

    const card = this.add.graphics();
    card.fillStyle(0x0d1117); card.fillRoundedRect(cx, cy, cw, ch, 12);
    card.lineStyle(2, 0xffd740); card.strokeRoundedRect(cx, cy, cw, ch, 12);
    card.fillStyle(0xffd740); card.fillRect(cx, cy+16, 5, ch-32);
    this._briefEls.push(card);

    const badge = this.add.circle(cx+30, cy+32, 16, 0xffd740);
    const badgeTxt = this.add.text(cx+30, cy+32, String(idx+1), {
      fontFamily:'Arial', fontSize:'12px', color:'#0a0a1a', fontStyle:'bold'
    }).setOrigin(0.5);
    const title = this.add.text(cx+55, cy+22, cfg.title, {
      fontFamily:'Arial', fontSize:'17px', color:'#ffffff', fontStyle:'bold', wordWrap:{ width: cw-70 }
    });
    const desc = this.add.text(cx+16, cy+52, cfg.briefing, {
      fontFamily:'Arial', fontSize:'12px', color:'#b0bec5', wordWrap:{ width: cw-28 }
    });
    // Output preview box
    const prevLines = cfg.expectedOutput.split('\n').slice(0, 5).join('\n') + (cfg.expectedOutput.split('\n').length > 5 ? '\n...' : '');
    const prevBg = this.add.graphics();
    prevBg.fillStyle(0x000000); prevBg.fillRoundedRect(cx+16, cy+115, cw-32, 58, 4);
    const prevLbl = this.add.text(cx+20, cy+117, '> expected output', {
      fontFamily:'Courier New', fontSize:'9px', color:'#546e7a'
    });
    const prevTxt = this.add.text(cx+20, cy+129, prevLines, {
      fontFamily:'Courier New', fontSize:'10px', color:'#00e676', wordWrap:{ width: cw-40 }
    });
    // Start button
    const sbg = this.add.graphics();
    sbg.fillStyle(0x00e5ff); sbg.fillRoundedRect(cx+cw/2-60, cy+184, 120, 28, 14);
    const sTxt = this.add.text(cx+cw/2, cy+198, 'START ▶', {
      fontFamily:'Arial', fontSize:'12px', color:'#0a0a1a', fontStyle:'bold'
    }).setOrigin(0.5);
    const sZone = this.add.zone(cx+cw/2-60, cy+184, 120, 28).setOrigin(0).setInteractive();

    [card, badge, badgeTxt, title, desc, prevBg, prevLbl, prevTxt, sbg, sTxt, sZone].forEach(e => this._briefEls.push(e));

    // Slide in
    const targets = [card, badge, badgeTxt, title, desc, prevBg, prevLbl, prevTxt, sbg, sTxt];
    const targetY = H/2 - ch/2;
    this.tweens.add({ targets, y: `-=${cy - targetY}`, duration: 380, ease: 'Back.easeOut' });
    sZone.y = targetY + (cy - targetY) + 184 - cy;

    // Reposition zone correctly after tween
    this.time.delayedCall(380, () => {
      const finalCardY = H/2 - ch/2;
      sZone.y = finalCardY + 184; sZone.x = cx+cw/2-60;
    });

    sZone.on('pointerdown', () => {
      this._briefEls.forEach(el => { this.tweens.add({ targets: el, alpha: 0, duration: 200, onComplete: () => el.destroy() }); });
      this.time.delayedCall(250, () => this._loadProject(cfg));
    });
  }

  /* ── Load Project ───────────────────────────────────────────── */
  _loadProject(cfg) {
    this._clearProject();
    this._placed = {};
    Object.keys(cfg.slots).forEach(k => { this._placed[k] = null; });
    this.projectAttempts = 0;
    this.projectStartTime = Date.now();
    this._tabTxt && this._tabTxt.setText(cfg.filename);
    this._renderEditor(cfg);
    this._renderBlocks(cfg);
    this._setupVisual(cfg.visual);
    this._disableRun();
    this._vzDefaultTxt && this._vzDefaultTxt.setVisible(true);
    this._consoleText && this._consoleText.setText('');
    this._idleCursor && this._idleCursor.setVisible(true);
  }

  _clearProject() {
    this._editorObjs.forEach(el => { if (el && el.active) el.destroy(); });
    this._editorObjs = [];
    this._slotEls = {};
    this._trayBlocks.forEach(b => { if (b.el && b.el.active) b.el.destroy(); });
    this._trayBlocks = [];
    this._clearVisual();
    this._selectedBlock = null;
    if (this._lineHighlight && this._lineHighlight.active) this._lineHighlight.destroy();
    this._lineHighlight = null;
    if (this._loopMonitor && this._loopMonitor.active) this._loopMonitor.destroy();
    this._loopMonitor = null; this._loopMonTxt = null;
  }

  _clearVisual() {
    this._visualEls.forEach(el => { if (el && el.active) el.destroy(); });
    this._visualEls = [];
    this._vizCards = []; this._vizScaleBlocks = []; this._vizChalkLines = [];
    this._vizPyramidBlocks = []; this._vizNLPillars = []; this._vizSBCards = [];
    this._vizRocket = null;
    this._vizConvBoxes = { Fizz:0, Buzz:0, FizzBuzz:0, Number:0 };
    this._vizCountTotal = 0;
  }

  _ve(el) { if (el) this._visualEls.push(el); return el; }
  _ee(el) { if (el) this._editorObjs.push(el); return el; }

  /* ── Editor Code Rendering ──────────────────────────────────── */
  _renderEditor(cfg) {
    const slotKeys = Object.keys(cfg.slots);
    const bodySlots = slotKeys.filter(k => k.startsWith('body'));
    let line = 0;

    // Pre-code
    cfg.preCode.forEach(codeLine => {
      this._renderCodeLine(codeLine, CX, CY + line * CLH);
      this._renderLineNum(line + 1, ED_X + GUT_W - 4, CY + line * CLH);
      line++;
    });

    // For loop structure
    const indent1 = '        '; // 2 levels (8 spaces)
    const indent2 = '            '; // 3 levels

    // "        for ("
    const forY = CY + line * CLH;
    this._renderCodeLine(indent1 + 'for (', CX, forY);
    this._renderLineNum(line + 1, ED_X + GUT_W - 4, forY);
    line++;

    // Init slot
    this._makeSlot('init', indent2, ';', line, cfg);
    line++;

    // Condition slot
    this._makeSlot('condition', indent2, ';', line, cfg);
    line++;

    // Update slot
    this._makeSlot('update', indent2, '', line, cfg);
    line++;

    // ") {"
    this._renderCodeLine(indent1 + ') {', CX, CY + line * CLH);
    this._renderLineNum(line + 1, ED_X + GUT_W - 4, CY + line * CLH);
    line++;

    // Body slot(s)
    bodySlots.forEach(bk => {
      this._makeSlot(bk, indent2 + '  ', '', line, cfg);
      line++;
    });

    // "}"
    this._renderCodeLine(indent1 + '}', CX, CY + line * CLH);
    this._renderLineNum(line + 1, ED_X + GUT_W - 4, CY + line * CLH);
    line++;

    // Post-code
    cfg.postCode.forEach(codeLine => {
      this._renderCodeLine(codeLine, CX, CY + line * CLH);
      this._renderLineNum(line + 1, ED_X + GUT_W - 4, CY + line * CLH);
      line++;
    });

    this._totalEditorLines = line;
    // Position cursor at blank zone
    this._cursor.setPosition(CX + 12, CY + (cfg.preCode.length + 1) * CLH + 2);
  }

  _makeSlot(slotKey, indentStr, suffix, lineNum, cfg) {
    const sy = CY + lineNum * CLH;
    const slotW = 170, slotH = CLH - 1;
    const slotX = CX + this._textWidth(indentStr);

    // Line number
    this._renderLineNum(lineNum + 1, ED_X + GUT_W - 4, sy);

    // Indent text
    if (indentStr) this._ee(this.add.text(CX, sy, indentStr, { fontFamily:'Courier New', fontSize:'11px', color: TC.punct }));

    // Slot background
    const slotBg = this.add.graphics();
    slotBg.fillStyle(0x1a2030, 0.8); slotBg.fillRoundedRect(slotX, sy - 1, slotW, slotH, 3);
    this._ee(slotBg);

    // Dashed border (drawn as short segments)
    const dg = this.add.graphics();
    this._drawDashedRect(dg, slotX, sy-1, slotW, slotH, 0x00e5ff, 0.4);
    this._ee(dg);

    // Placeholder text
    const cat = cfg.slots[slotKey].label;
    const ph = this.add.text(slotX + slotW/2, sy + slotH/2 - 1, `[ ${cat} ]`, {
      fontFamily:'Courier New', fontSize:'10px', color: '#' + (parseInt(CC[cat === 'body' ? 'body' : cat].replace('#',''), 16) & 0xffffff).toString(16).padStart(6,'0')
    }).setOrigin(0.5).setAlpha(0.35);
    this._ee(ph);

    // Filled text (hidden initially)
    const ft = this.add.text(slotX + 4, sy, '', { fontFamily:'Courier New', fontSize:'11px', color: CC[cat] }).setVisible(false);
    this._ee(ft);

    // Suffix text
    if (suffix) {
      const sfx = this.add.text(slotX + slotW + 2, sy, suffix, { fontFamily:'Courier New', fontSize:'11px', color: TC.punct });
      this._ee(sfx);
    }

    // Interactive zone
    const zone = this.add.zone(slotX, sy-1, slotW, slotH).setOrigin(0).setInteractive();
    zone.on('pointerover', () => {
      if (this._placed[slotKey]) return; // occupied: hover on filled slot
      if (this._selectedBlock) {
        const cat2 = cfg.slots[slotKey].label;
        if (this._selectedBlock.category === cat2 || (this._selectedBlock.category === 'body' && cat2 === 'body')) {
          slotBg.clear(); slotBg.fillStyle(0x002233, 1); slotBg.fillRoundedRect(slotX, sy-1, slotW, slotH, 3);
        }
      }
    });
    zone.on('pointerout', () => {
      if (!this._placed[slotKey]) { slotBg.clear(); slotBg.fillStyle(0x1a2030, 0.8); slotBg.fillRoundedRect(slotX, sy-1, slotW, slotH, 3); }
    });
    zone.on('pointerdown', () => this._onSlotClick(slotKey, slotX, sy, slotW, slotH, slotBg, dg, ph, ft, cfg));
    this._ee(zone);

    this._slotEls[slotKey] = { bg: slotBg, dg, ph, ft, zone, slotX, sy, slotW, slotH, cat };
  }

  _drawDashedRect(g, x, y, w, h, color, alpha) {
    g.lineStyle(1, color, alpha);
    // top and bottom
    for (let i = x; i < x+w-3; i += 7) g.lineBetween(i, y, Math.min(i+4, x+w), y);
    for (let i = x; i < x+w-3; i += 7) g.lineBetween(i, y+h, Math.min(i+4, x+w), y+h);
    // left and right
    for (let j = y; j < y+h-3; j += 7) g.lineBetween(x, j, x, Math.min(j+4, y+h));
    for (let j = y; j < y+h-3; j += 7) g.lineBetween(x+w, j, x+w, Math.min(j+4, y+h));
  }

  _onSlotClick(slotKey, slotX, sy, slotW, slotH, slotBg, dg, ph, ft, cfg) {
    if (this._interactionDisabled) return;
    const cat = cfg.slots[slotKey].label;

    if (this._placed[slotKey]) {
      // Return block to tray
      const txt = this._placed[slotKey];
      this._placed[slotKey] = null;
      ft.setVisible(false).setText('');
      ph.setVisible(true);
      slotBg.clear(); slotBg.fillStyle(0x1a2030, 0.8); slotBg.fillRoundedRect(slotX, sy-1, slotW, slotH, 3);
      dg.setAlpha(1);
      // Re-enable tray block
      const tb = this._trayBlocks.find(b => b.text === txt && b.used);
      if (tb) { tb.used = false; tb.el.setAlpha(1); if (tb.el.input) tb.el.input.enabled = true; }
      this._disableRun();
      return;
    }

    if (!this._selectedBlock) return;
    if (this._selectedBlock.category !== cat && !(this._selectedBlock.category === 'body' && cat === 'body')) return;
    // Also allow specific body slots for FizzBuzz
    if (slotKey.startsWith('body') && slotKey !== 'body' && this._selectedBlock.slot && this._selectedBlock.slot !== slotKey) {
      // For FizzBuzz blocks that have a specific target slot - still allow any body slot
    }

    // Place block
    const blockText = this._selectedBlock.text;
    this._placed[slotKey] = blockText;
    ft.setText(blockText).setColor(CC[cat] || '#b0bec5').setVisible(true);
    ph.setVisible(false);
    slotBg.clear(); slotBg.fillStyle(0x0d2030, 1); slotBg.fillRoundedRect(slotX, sy-1, slotW, slotH, 3);
    dg.setAlpha(0.2);

    // Mark tray block as used
    const tb = this._trayBlocks.find(b => b.el === this._selectedBlock.trayEl);
    if (tb) { tb.used = true; tb.el.setAlpha(0.2); if (tb.el.input) tb.el.input.enabled = false; }

    // Snap ring
    this._snapRing(slotX + slotW/2, sy + slotH/2, CC[cat]);

    this._selectedBlock = null;
    // Check if all filled
    if (this._checkAllFilled(cfg)) this._enableRun();
  }

  _snapRing(x, y, color) {
    const g = this.add.graphics().setDepth(100);
    const hex = parseInt(color.replace('#',''), 16);
    this.tweens.add({
      targets: { r: 0 }, r: 1, duration: 280,
      onUpdate: t => {
        g.clear(); g.lineStyle(2, hex, 1 - t.getValue());
        g.strokeCircle(x, y, t.getValue() * 28);
      },
      onComplete: () => g.destroy()
    });
  }

  _checkAllFilled(cfg) {
    return Object.keys(cfg.slots).every(k => this._placed[k] !== null && this._placed[k] !== undefined);
  }

  _renderLineNum(n, x, y) {
    this._ee(this.add.text(x, y, String(n), { fontFamily:'Courier New', fontSize:'10px', color:'#3d4450' }).setOrigin(1, 0));
  }

  _renderCodeLine(line, x, y) {
    let cx = x;
    this._tokenize(line).forEach(tok => {
      const t = this._ee(this.add.text(cx, y, tok.text, { fontFamily:'Courier New', fontSize:'11px', color: TC[tok.type] || TC.default }));
      cx += t.width;
    });
  }

  _textWidth(str) {
    // Approximate: Courier New 11px ≈ 6.6px/char
    return str.length * 6.6;
  }

  _tokenize(line) {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
      if (line[i]==='/' && line[i+1]==='/') { tokens.push({ text: line.slice(i), type:'comment' }); break; }
      if (line[i]==='"') {
        let s='"'; i++;
        while (i < line.length && line[i]!=='"') s+=line[i++];
        if (i<line.length) s+=line[i++];
        tokens.push({ text:s, type:'string' }); continue;
      }
      if (line[i]===' '||line[i]==='\t') {
        let ws=''; while (i<line.length && (line[i]===' '||line[i]==='\t')) ws+=line[i++];
        tokens.push({ text:ws, type:'default' }); continue;
      }
      if (line[i]==='.'){ const m=line.slice(i).match(/^\.(println?|length)\b/); if(m){ tokens.push({text:m[0],type:'method'}); i+=m[0].length; continue; } }
      if (/[0-9]/.test(line[i])) { let n=''; while(i<line.length&&/[0-9]/.test(line[i])) n+=line[i++]; tokens.push({text:n,type:'number'}); continue; }
      if (/[a-zA-Z_]/.test(line[i])) {
        let id=''; while(i<line.length&&/[a-zA-Z0-9_]/.test(line[i])) id+=line[i++];
        const type = KW.has(id)?'keyword':(id.length<=2&&/^[a-z]/.test(id))?'variable':'default';
        tokens.push({text:id,type}); continue;
      }
      const two=line.slice(i,i+2);
      if(['++','--','+=','-=','<=','>=','==','!=','//'].includes(two)){ tokens.push({text:two,type:'operator'}); i+=2; continue; }
      if ('<>=+*/-!'.includes(line[i])) { tokens.push({text:line[i],type:'operator'}); i++; continue; }
      tokens.push({text:line[i],type:'(){};,'.includes(line[i])?'punct':'default'}); i++;
    }
    return tokens;
  }

  /* ── Block Tray Rendering ───────────────────────────────────── */
  _renderBlocks(cfg) {
    this._trayBlocks = [];
    const shuffled = [...cfg.blocks];
    let bx = TRAY_X + 10, by = TRAY_Y + 24;
    const ROW2_Y = by + 38;
    let col = 0;

    shuffled.forEach((blk, idx) => {
      const label = blk.text;
      const colHex = parseInt((CC[blk.category] || '#b0bec5').replace('#',''), 16);
      const bw = Math.max(72, label.length * 7 + 24);
      const bh = 30;

      if (bx + bw > TRAY_X + TRAY_W - 10) {
        bx = TRAY_X + 10;
        by = ROW2_Y;
      }

      const container = this.add.container(bx, by);
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(0, 0, bw, bh, 15);
      bg.lineStyle(1, colHex, 0.55); bg.strokeRoundedRect(0, 0, bw, bh, 15);
      const accent = this.add.graphics();
      accent.fillStyle(colHex); accent.fillRoundedRect(4, (bh-18)/2, 4, 18, 2);
      const txt = this.add.text(bw/2+4, bh/2, label, {
        fontFamily:'Courier New', fontSize:'10px', color: CC[blk.category] || '#b0bec5', fontStyle:'bold'
      }).setOrigin(0.5);
      container.add([bg, accent, txt]);
      container.setSize(bw, bh).setInteractive({ useHandCursor: true });

      // Gentle idle float (staggered)
      this.tweens.add({ targets: container, y: by - 2, duration: 2500, yoyo: true, repeat: -1, ease:'Sine.easeInOut', delay: idx*150 });

      container.on('pointerover', () => {
        if (container.__used) return;
        bg.clear(); bg.fillStyle(0x2a2a4e); bg.fillRoundedRect(0,0,bw,bh,15);
        bg.lineStyle(2, colHex, 1); bg.strokeRoundedRect(0,0,bw,bh,15);
      });
      container.on('pointerout', () => {
        if (container.__used) return;
        if (this._selectedBlock && this._selectedBlock.trayEl === container) return;
        bg.clear(); bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(0,0,bw,bh,15);
        bg.lineStyle(1, colHex, 0.55); bg.strokeRoundedRect(0,0,bw,bh,15);
      });
      container.on('pointerdown', () => {
        if (container.__used || this._interactionDisabled) return;
        if (this._selectedBlock && this._selectedBlock.trayEl === container) {
          // Deselect
          this._selectedBlock = null;
          bg.clear(); bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(0,0,bw,bh,15);
          bg.lineStyle(1, colHex, 0.55); bg.strokeRoundedRect(0,0,bw,bh,15);
          return;
        }
        // Deselect previous
        if (this._selectedBlock) {
          const prev = this._selectedBlock;
          const pg2 = prev.trayEl.getAt(0);
          if (pg2 && pg2.active) {
            const pc = parseInt((CC[prev.category]||'#b0bec5').replace('#',''), 16);
            const pw = prev.trayEl.width;
            const ph = 30;
            pg2.clear(); pg2.fillStyle(0x1a1a2e); pg2.fillRoundedRect(0,0,pw,ph,15);
            pg2.lineStyle(1, pc, 0.55); pg2.strokeRoundedRect(0,0,pw,ph,15);
          }
        }
        // Select this block
        bg.clear(); bg.fillStyle(0x002244); bg.fillRoundedRect(0,0,bw,bh,15);
        bg.lineStyle(2, colHex, 1); bg.strokeRoundedRect(0,0,bw,bh,15);
        this._selectedBlock = { text: blk.text, category: blk.category, slot: blk.slot, trayEl: container };
      });

      const tbEntry = { el: container, text: blk.text, category: blk.category, trayX: bx, trayY: by, used: false };
      container.__tbEntry = tbEntry;
      this._trayBlocks.push(tbEntry);

      bx += bw + 8;
      col++;
    });
  }

  /* ── Simulation Engine ──────────────────────────────────────── */
  _simulateProject(cfg) {
    const placed = this._placed;
    const initText = placed['init'] || '';
    const condText = placed['condition'] || '';
    const updText = placed['update'] || '';

    const initM = initText.match(/\w+\s+(\w+)\s*=\s*(-?\d+)/);
    let i = initM ? parseInt(initM[2]) : 0;

    const condFn = this._makeCondFn(condText);
    const updFn = this._makeUpdFn(updText);

    const bodyKeys = Object.keys(cfg.slots).filter(k => k.startsWith('body')).sort();
    const vars = { sum: 0, total: 0 };
    const iterations = [];
    const allOutput = [];
    let guard = 0;

    while (condFn(i) && guard++ < 250) {
      const outputs = [];
      if (cfg.id === 8) {
        const bodies = bodyKeys.map(k => placed[k]).filter(Boolean);
        const out = this._evalFizzBuzz(bodies, i);
        if (out !== null) { outputs.push(String(out)); allOutput.push(String(out)); }
      } else {
        bodyKeys.forEach(bk => {
          const out = this._evalBody(placed[bk], i, vars, cfg);
          if (out !== null && out !== undefined) { outputs.push(String(out)); allOutput.push(String(out)); }
        });
      }
      iterations.push({ i, outputs });
      i = updFn(i);
    }

    // Post-code output
    (cfg.postCode || []).forEach(line => {
      if (line.includes('"Launch!"')) allOutput.push('Launch!');
      if (line.includes('"Total: "') && line.includes('sum')) allOutput.push('Total: ' + vars.sum);
      if (line.includes('"Average: "')) allOutput.push('Average: ' + Math.floor(vars.total / 5));
    });

    return { allOutput, iterations, vars };
  }

  _makeCondFn(text) {
    if (!text) return () => false;
    const t = text.replace('scores.length', '5');
    const m = t.match(/(<=|>=|<|>|==|!=)\s*(-?\d+)/);
    if (!m) return () => false;
    const [, op, limStr] = m, lim = parseInt(limStr);
    switch(op) {
      case '<':  return i => i < lim;
      case '<=': return i => i <= lim;
      case '>':  return i => i > lim;
      case '>=': return i => i >= lim;
      case '==': return i => i === lim;
      case '!=': return i => i !== lim;
      default:   return () => false;
    }
  }

  _makeUpdFn(text) {
    if (!text) return i => i;
    if (text.includes('++')) return i => i + 1;
    if (text.includes('--')) return i => i - 1;
    const mPlus  = text.match(/\+=\s*(-?\d+)/);
    if (mPlus)  return i => i + parseInt(mPlus[1]);
    const mMinus = text.match(/-=\s*(-?\d+)/);
    if (mMinus) return i => i - parseInt(mMinus[1]);
    return i => i + 1;
  }

  _evalBody(text, i, vars, cfg) {
    if (!text) return null;
    if (/println\("Hello World"\)|print\("Hello World"\)/.test(text)) return 'Hello World';
    if (/println\(i\)|print\(i\)/.test(text) && !text.includes('"')) return String(i);
    if (/sum\s*\+=\s*i/.test(text)) { vars.sum += i; return null; }
    if (/sum\s*=\s*i/.test(text) && !/\+=/.test(text)) { vars.sum = i; return null; }
    if (/total\s*\+=\s*scores\[i\]/.test(text)) {
      const sc = [85,92,78,95,88];
      if (i >= 0 && i < sc.length) vars.total += sc[i];
      return null;
    }
    if (/total\s*\+=\s*i/.test(text)) { vars.total += i; return null; }
    if (text.includes('j<i') || (text.includes('"*"') && text.includes('j'))) return '*'.repeat(i);
    if (/println\("?\*"?\)/.test(text)) return '*';
    if (text.includes('"7 x "') && text.includes('println')) return `7 x ${i} = ${7*i}`;
    if (/println\(7\s*[\*×]\s*i\)/.test(text)) return String(7*i);
    return null;
  }

  _evalFizzBuzz(bodies, i) {
    let firstCond = true;
    for (const body of bodies) {
      if (!body) continue;
      const isElse = body.trim().startsWith('else');
      if (!isElse) { firstCond = true; }
      if (body.includes('%15') && i%15===0) return 'FizzBuzz';
      if (body.includes('%3') && body.includes('Fizz') && i%3===0) return 'Fizz';
      if (body.includes('%5') && body.includes('Buzz') && i%5===0) return 'Buzz';
      if (isElse && !body.includes('%') && !body.includes('if')) return String(i);
    }
    return String(i);
  }

  _classifyError(cfg, actual) {
    const exp = cfg.expectedOutput.trim().split('\n');
    const act = actual.trim().split('\n');
    if (act.length !== exp.length) {
      if (act.length === 0) return 'wrong_body';
      return act.length < exp.length ? 'wrong_count' : 'off_by_one';
    }
    const first_exp = exp[0], first_act = act[0];
    if (first_exp !== first_act) {
      if (!isNaN(parseInt(first_exp)) && !isNaN(parseInt(first_act))) {
        const diff = parseInt(first_act) - parseInt(first_exp);
        if (Math.abs(diff) === 1) return 'off_by_one';
        if (diff > 0) return 'wrong_start';
      }
      return 'wrong_body';
    }
    return 'generic';
  }

  /* ── Compile & Run Flow ─────────────────────────────────────── */
  async _onCompileRun() {
    if (this._running || this._interactionDisabled) return;
    this._running = true;
    this._interactionDisabled = true;
    this.projectAttempts++;
    const cfg = PROJECTS[this.currentProject];

    // Compilation animation
    this._runBtnTxt.setText('COMPILING...');
    this._drawRunBtn(0xffd740, 1);
    await this._delay(700);
    this._runBtnTxt.setText('RUNNING...');
    this._drawRunBtn(0x00c853, 1);
    await this._delay(300);

    this._vzDefaultTxt && this._vzDefaultTxt.setVisible(false);
    this._idleCursor && this._idleCursor.setVisible(false);
    this._consoleText.setText('');

    // Loop monitor
    this._showLoopMonitor();

    // Simulate
    const result = this._simulateProject(cfg);

    // Animate execution
    await this._animateExecution(cfg, result);

    // Evaluate
    const actual = result.allOutput.join('\n').trim();
    const expected = cfg.expectedOutput.trim();

    if (actual === expected) {
      await this._onCorrect(cfg);
    } else {
      await this._onWrong(cfg, actual, expected);
    }
    this._running = false;
  }

  _showLoopMonitor() {
    if (this._loopMonitor && this._loopMonitor.active) this._loopMonitor.destroy();
    const mx = ED_X + ED_W - 128, my = ED_Y + 28;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0d1117); g.fillRoundedRect(mx, my, 118, 24, 5);
    g.lineStyle(1, 0x00e5ff); g.strokeRoundedRect(mx, my, 118, 24, 5);
    this._loopMonitor = g;
    this._loopMonTxt = this.add.text(mx+6, my+4, 'i = --', {
      fontFamily:'Courier New', fontSize:'11px', color:'#00e5ff'
    }).setDepth(21);
  }

  async _animateExecution(cfg, result) {
    const hlBg = this.add.graphics().setDepth(15).setAlpha(0);
    this._lineHighlight = hlBg;

    const preLines = cfg.preCode.length;
    const bodySlotCount = Object.keys(cfg.slots).filter(k=>k.startsWith('body')).length;
    // for loop structure: "for (", init, cond, update, ") {", body(s), "}"
    const forLoopLines = 1 + 3 + 1 + bodySlotCount + 1; // 7+ lines

    // Pre-code highlight
    for (let l = 0; l < preLines; l++) {
      this._moveHighlight(hlBg, l);
      await this._delay(150);
    }

    // Loop execution
    const condLineIdx = preLines + 2; // after "for (" and init
    const bodyLineStart = preLines + 5;

    let consoleStr = '';
    let iterCount = 0;

    for (const iter of result.iterations) {
      // Highlight condition
      this._moveHighlight(hlBg, condLineIdx);
      this._loopMonTxt && this._loopMonTxt.setText(`i = ${iter.i}`);
      this.tweens.add({ targets: this._loopMonTxt, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true });
      await this._delay(220);

      // Highlight body
      for (let b = 0; b < bodySlotCount; b++) {
        this._moveHighlight(hlBg, bodyLineStart + b);
        await this._delay(150);
      }

      // Console output
      for (const out of iter.outputs) {
        consoleStr += (consoleStr ? '\n' : '') + out;
        this._consoleText.setText(consoleStr);
      }

      // Visual animation
      await this._animVisualIter(cfg.visual, iter.i, iter.outputs[0]);
      iterCount++;
    }

    // Post-code highlight
    const postStart = preLines + forLoopLines;
    for (let l = 0; l < cfg.postCode.length; l++) {
      this._moveHighlight(hlBg, postStart + l);
      await this._delay(150);
      // Post-code output (Launch!, Total:, Average:)
      const postLine = cfg.postCode[l];
      let postOut = null;
      if (postLine.includes('"Launch!"')) postOut = 'Launch!';
      if (postLine.includes('"Total: "') && postLine.includes('sum')) postOut = 'Total: ' + result.vars.sum;
      if (postLine.includes('"Average: "')) postOut = 'Average: ' + Math.floor(result.vars.total / 5);
      if (postOut) {
        consoleStr += (consoleStr ? '\n' : '') + postOut;
        this._consoleText.setText(consoleStr);
      }
    }

    hlBg.clear();
    await this._delay(300);
  }

  _moveHighlight(g, lineIdx) {
    g.clear();
    const y = CY + lineIdx * CLH - 2;
    g.fillStyle(0xffd740, 0.08);
    g.fillRect(ED_X + GUT_W, y, ED_W - GUT_W - 4, CLH + 1);
  }

  async _animVisualIter(type, i, output) {
    switch(type) {
      case 'greeting_cards': return this._iterGreeting(i);
      case 'rocket_launch':  return this._iterRocket(i);
      case 'balance_scale':  return this._iterScale(i);
      case 'number_line':    return this._iterNumberLine(i);
      case 'pyramid_crane':  return this._iterPyramid(i);
      case 'chalkboard':     return this._iterChalkboard(i);
      case 'scoreboard':     return this._iterScoreboard(i);
      case 'conveyor_belt':  return this._iterConveyor(i, output);
    }
  }

  /* ── Visual: Greeting Cards ─────────────────────────────────── */
  _setupGreetingCards() {}

  _iterGreeting(iter) {
    return new Promise(resolve => {
      const cx = VZ_X + 30 + iter * 68, cy = VZ_Y + 60;
      const g = this._ve(this.add.graphics());
      g.fillStyle(0x1a1a2e); g.fillRoundedRect(0, 0, 56, 78, 6);
      g.lineStyle(1.5, 0x00e5ff); g.strokeRoundedRect(0, 0, 56, 78, 6);
      g.fillStyle(0xffd740); g.fillStar(28, 14, 5, 8, 4);
      g.setPosition(VZ_X - 60, cy);
      const lbl = this._ve(this.add.text(cx + 4, cy + 30, 'Hello\nWorld', {
        fontFamily:'Arial', fontSize:'10px', color:'#e0e0e0', fontStyle:'bold', align:'center'
      }).setVisible(false));
      this.tweens.add({
        targets: g, x: cx, duration: 280, ease:'Back.easeOut',
        onComplete: () => { lbl.setVisible(true); resolve(); }
      });
    });
  }

  _completeGreeting() {
    this._vizCards.forEach(g => {
      this.tweens.add({ targets: g, scaleX: 1.08, scaleY: 1.08, duration: 200, yoyo: true });
    });
  }

  /* ── Visual: Rocket Launch ──────────────────────────────────── */
  _setupRocketLaunch() {
    const bx = VZ_X + 60, by = VZ_Y + VZ_H - 30;
    const pad = this._ve(this.add.rectangle(bx, by, 70, 8, 0x546e7a));
    // Rocket
    const rg = this._ve(this.add.graphics());
    rg.fillStyle(0xb0bec5); rg.fillRoundedRect(-12, -50, 24, 55, 4);
    rg.fillStyle(0xf44336); rg.fillTriangle(-12, -50, 12, -50, 0, -72);
    rg.fillStyle(0x1565c0); rg.fillTriangle(-18, -4, -12, -4, -12, 10); rg.fillTriangle(12, -4, 18, -4, 12, 10);
    rg.fillStyle(0x00e5ff); rg.fillCircle(0, -30, 5);
    rg.setPosition(bx, by - 30);
    this._vizRocket = rg;
    // Countdown display
    const dg = this._ve(this.add.graphics());
    dg.fillStyle(0x0a0a1a); dg.fillRoundedRect(0, 0, 110, 64, 6);
    dg.lineStyle(2, 0xff1744); dg.strokeRoundedRect(0, 0, 110, 64, 6);
    dg.setPosition(VZ_X + 170, VZ_Y + 80);
    this._vizCountTxt = this._ve(this.add.text(VZ_X + 225, VZ_Y + 112, '5', {
      fontFamily:'Courier New', fontSize:'36px', color:'#ff1744', fontStyle:'bold'
    }).setOrigin(0.5));
  }

  _iterRocket(i) {
    return new Promise(resolve => {
      if (!this._vizCountTxt || !this._vizCountTxt.active) { resolve(); return; }
      this.tweens.add({
        targets: this._vizCountTxt, scaleY: 0, duration: 130,
        onComplete: () => {
          if (!this._vizCountTxt || !this._vizCountTxt.active) { resolve(); return; }
          this._vizCountTxt.setText(String(i));
          this.tweens.add({ targets: this._vizCountTxt, scaleY: 1, duration: 130, onComplete: () => resolve() });
        }
      });
    });
  }

  _completeRocket() {
    if (!this._vizCountTxt || !this._vizCountTxt.active) return;
    this._vizCountTxt.setText('GO!').setColor('#00e676');
    if (!this._vizRocket || !this._vizRocket.active) return;
    this.time.delayedCall(200, () => {
      if (this._vizRocket && this._vizRocket.active)
        this.tweens.add({ targets: this._vizRocket, y: VZ_Y - 80, duration: 1400, ease:'Cubic.easeIn' });
    });
  }

  /* ── Visual: Balance Scale ──────────────────────────────────── */
  _setupBalanceScale() {
    const cx = VZ_X + 100, cy = VZ_Y + 160;
    // Base triangle
    const bg2 = this._ve(this.add.graphics());
    bg2.fillStyle(0x546e7a); bg2.fillTriangle(cx-30, cy+40, cx+30, cy+40, cx, cy);
    // Beam
    this._vizBeam = this._ve(this.add.rectangle(cx, cy, 160, 4, 0x78909c));
    // Left plate
    this._ve(this.add.rectangle(cx-72, cy+30, 50, 8, 0x37474f));
    this._ve(this.add.graphics()).lineStyle(1, 0x546e7a).lineBetween(cx-80, cy, cx-80, cy+28).lineBetween(cx-64, cy, cx-64, cy+28);
    this._vizSumTxt = this._ve(this.add.text(cx-80, cy+45, '0', {
      fontFamily:'Courier New', fontSize:'18px', color:'#00e5ff', fontStyle:'bold'
    }).setOrigin(0.5));
    // Number queue (1-10)
    const qy = VZ_Y + 50;
    for (let n = 1; n <= 10; n++) {
      const qx = VZ_X + 155 + (n-1)*22;
      const qg = this._ve(this.add.graphics());
      qg.fillStyle(0x1a1a2e); qg.fillRect(0, 0, 18, 18);
      qg.lineStyle(1, 0xffd740); qg.strokeRect(0, 0, 18, 18);
      qg.setPosition(qx, qy);
      this._ve(this.add.text(qx+9, qy+9, String(n), {
        fontFamily:'Courier New', fontSize:'9px', color:'#ffd740'
      }).setOrigin(0.5));
      this._vizScaleBlocks.push(qg);
    }
  }

  _iterScale(i) {
    return new Promise(resolve => {
      const idx = i - 1;
      if (idx < 0 || idx >= this._vizScaleBlocks.length) { resolve(); return; }
      const blk = this._vizScaleBlocks[idx];
      if (!blk || !blk.active) { resolve(); return; }
      // Lift and fly to plate
      this.tweens.add({ targets: blk, y: '-=15', duration: 150, onComplete: () => {
        this.tweens.add({ targets: blk, x: VZ_X+38, y: VZ_Y+190, duration: 380, ease:'Quad.easeInOut', onComplete: () => {
          if (blk.active) blk.setAlpha(0);
          if (this._vizSumTxt && this._vizSumTxt.active) {
            const newSum = parseInt(this._vizSumTxt.text) + i;
            this._vizSumTxt.setText(String(newSum));
          }
          if (this._vizBeam && this._vizBeam.active) {
            const tilt = Math.min(-idx * 0.8, -8);
            this.tweens.add({ targets: this._vizBeam, angle: tilt, duration: 180 });
          }
          resolve();
        }});
      }});
    });
  }

  _completeScale(vars) {
    if (this._vizSumTxt && this._vizSumTxt.active) {
      this._vizSumTxt.setColor('#ffd740');
      this.tweens.add({ targets: this._vizSumTxt, scaleX: 1.4, scaleY: 1.4, duration: 200, yoyo: true });
    }
  }

  /* ── Visual: Number Line ────────────────────────────────────── */
  _setupNumberLine() {
    const ly = VZ_Y + 130;
    const g = this._ve(this.add.graphics());
    g.lineStyle(2, 0x78909c); g.lineBetween(VZ_X+4, ly, VZ_X+VZ_W-4, ly);
    for (let n = 0; n <= 20; n++) {
      const tx = VZ_X + 4 + n * 19.7;
      const tickH = n % 2 === 0 ? 10 : 6;
      g.lineStyle(1, 0x546e7a); g.lineBetween(tx, ly, tx, ly + tickH);
      if (n % 4 === 0 || n === 20) {
        this._ve(this.add.text(tx, ly + 13, String(n), {
          fontFamily:'Courier New', fontSize:'8px', color:'#3d4450'
        }).setOrigin(0.5, 0));
      }
    }
    this._vizNLPillars = [];
  }

  _iterNumberLine(i) {
    return new Promise(resolve => {
      const ly = VZ_Y + 130;
      const tx = VZ_X + 4 + i * 19.7;
      const pillar = this._ve(this.add.rectangle(tx, ly, 6, 0, 0x00e676, 0.5));
      pillar.setOrigin(0.5, 0);
      this.tweens.add({ targets: pillar, height: 80, y: ly - 80, duration: 280, ease:'Quad.easeOut', onComplete: () => {
        const badge = this._ve(this.add.circle(tx, ly - 90, 11, 0x00e676));
        this._ve(this.add.text(tx, ly - 90, String(i), {
          fontFamily:'Courier New', fontSize:'9px', color:'#ffffff'
        }).setOrigin(0.5));
        badge.setScale(0);
        this.tweens.add({ targets: badge, scaleX: 1, scaleY: 1, duration: 180, ease:'Back.easeOut', onComplete: resolve });
      }});
      this._vizNLPillars.push(pillar);
    });
  }

  _completeNumberLine() {
    this._vizNLPillars.forEach((p, idx) => {
      this.time.delayedCall(idx * 60, () => {
        if (p && p.active) this.tweens.add({ targets: p, alpha: 1, duration: 80, yoyo: true });
      });
    });
  }

  /* ── Visual: Pyramid Crane ──────────────────────────────────── */
  _setupPyramidCrane() {
    const craneX = VZ_X + VZ_W - 50, craneBaseY = VZ_Y + 40;
    // Tower
    this._ve(this.add.rectangle(craneX, craneBaseY + 120, 6, 200, 0xffd740).setOrigin(0.5, 1));
    // Arm
    this._ve(this.add.rectangle(craneX - 75, craneBaseY, 150, 5, 0xffd740).setOrigin(0, 0.5));
    // Cabin
    this._ve(this.add.rectangle(craneX, craneBaseY + 8, 16, 12, 0x37474f).setOrigin(0.5));
    // Hook line + hook
    const hookLine = this._ve(this.add.rectangle(craneX - 150, craneBaseY + 5, 1, 30, 0x78909c));
    this._ve(this.add.triangle(craneX - 150, craneBaseY + 38, -4, 0, 4, 0, 0, 8, 0x78909c));
    this._vizPyramidHookX = craneX - 150;
    this._vizPyramidBaseY = VZ_Y + VZ_H - 20;
    this._vizPyramidBlocks = [];
  }

  _iterPyramid(row) {
    return new Promise(async resolve => {
      const numBlocks = row;
      const bw = 18, bh = 14;
      const rowY = this._vizPyramidBaseY - (row - 1) * (bh + 1);
      const rowStartX = VZ_X + 20 + (5 - row) * (bw/2);
      for (let j = 0; j < numBlocks; j++) {
        await new Promise(rb => {
          const bx = rowStartX + j * bw;
          const blk = this._ve(this.add.graphics());
          blk.fillStyle(0xffd740); blk.fillRect(0, 0, bw-1, bh);
          blk.setPosition(bx, VZ_Y + 40);
          this._ve(this.add.text(bx + bw/2, VZ_Y + 40 + bh/2, '★', {
            fontFamily:'Arial', fontSize:'8px', color:'#1a1a00'
          }).setOrigin(0.5));
          this.tweens.add({ targets: blk, y: rowY, duration: 220, ease:'Bounce.easeOut', delay: j*80, onComplete: () => rb() });
          this._vizPyramidBlocks.push(blk);
        });
      }
      resolve();
    });
  }

  _completePyramid() {
    this._vizPyramidBlocks.forEach(b => {
      if (b && b.active) this.tweens.add({ targets: b, alpha: 0.6, duration: 100, yoyo: true, repeat: 2 });
    });
  }

  /* ── Visual: Chalkboard ─────────────────────────────────────── */
  _setupChalkboard() {
    const bx = VZ_X + 10, by = VZ_Y + 10;
    const g = this._ve(this.add.graphics());
    g.fillStyle(0x3e2723); g.fillRect(bx-6, by-6, 382, 222);
    g.fillStyle(0x2e7d32); g.fillRect(bx, by, 370, 210);
    g.fillStyle(0x5d4037); g.fillRect(bx, by + 210, 370, 8);
    this._vizChalkX = bx + 10; this._vizChalkY = by + 12;
    this._vizChalkLines = [];
  }

  _iterChalkboard(i) {
    return new Promise(resolve => {
      const text = `7 × ${i} = ${7*i}`;
      const ty = this._vizChalkY + (i-1) * 18;
      if (ty > VIS_Y + VIS_H - 25) { resolve(); return; }
      const t = this._ve(this.add.text(this._vizChalkX, ty, '', {
        fontFamily:'Courier New', fontSize:'13px', color:'#e8f5e9'
      }));
      this._vizChalkLines.push(t);
      let idx = 0;
      const ev = this.time.addEvent({ delay: 35, repeat: text.length-1, callback: () => {
        t.setText(text.substring(0, ++idx));
      }});
      this.time.delayedCall(text.length * 35 + 80, () => { ev.remove(); resolve(); });
    });
  }

  _completeChalkboard() {
    const stamp = this._ve(this.add.graphics());
    stamp.lineStyle(4, 0xf44336); stamp.strokeCircle(0, 0, 32);
    const sX = VZ_X + VZ_W - 80, sY = VZ_Y + 60;
    stamp.setPosition(sX, sY).setAngle(-15).setScale(2);
    this._ve(this.add.text(sX, sY, 'A+', {
      fontFamily:'Arial', fontSize:'22px', color:'#f44336', fontStyle:'bold'
    }).setOrigin(0.5).setAngle(-15));
    this.tweens.add({ targets: stamp, scaleX: 1, scaleY: 1, duration: 180, ease:'Cubic.easeOut' });
    this.cameras.main.shake(150, 0.004);
  }

  /* ── Visual: Scoreboard ─────────────────────────────────────── */
  _setupScoreboard() {
    const scores = [85,92,78,95,88];
    const cy = VZ_Y + 60;
    this._vizSBCards = [];
    scores.forEach((sc, idx) => {
      const cx = VZ_X + 20 + idx * 76;
      const bg = this._ve(this.add.graphics());
      bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(0, 0, 60, 82, 6);
      bg.lineStyle(1.5, 0xffd740); bg.strokeRoundedRect(0, 0, 60, 82, 6);
      bg.setPosition(cx, cy);
      const qMark = this._ve(this.add.text(cx+30, cy+41, '?', {
        fontFamily:'Arial', fontSize:'20px', color:'#546e7a', fontStyle:'bold'
      }).setOrigin(0.5));
      const scoreTxt = this._ve(this.add.text(cx+30, cy+41, String(sc), {
        fontFamily:'Courier New', fontSize:'18px', color:'#ffd740', fontStyle:'bold'
      }).setOrigin(0.5).setVisible(false));
      this._vizSBCards.push({ bg, qMark, scoreTxt, score: sc, cx, cy });
    });
    // Total display
    const tdg = this._ve(this.add.graphics());
    tdg.fillStyle(0x0a0a1a); tdg.fillRoundedRect(0,0,220,40,6);
    tdg.lineStyle(1.5, 0x00e5ff); tdg.strokeRoundedRect(0,0,220,40,6);
    tdg.setPosition(VZ_X + 20, VZ_Y + 165);
    this._vizTotalTxt = this._ve(this.add.text(VZ_X + 130, VZ_Y + 185, 'Total: 0', {
      fontFamily:'Courier New', fontSize:'15px', color:'#00e5ff', fontStyle:'bold'
    }).setOrigin(0.5));
    this._vizRunTotal = 0;
  }

  _iterScoreboard(i) {
    const idx = i;
    if (idx >= this._vizSBCards.length) return Promise.resolve();
    const card = this._vizSBCards[idx];
    if (!card) return Promise.resolve();
    return new Promise(resolve => {
      this.tweens.add({ targets: card.qMark, scaleX: 0, duration: 130, onComplete: () => {
        card.qMark.setVisible(false);
        card.scoreTxt.setVisible(true).setScaleX(0);
        this.tweens.add({ targets: card.scoreTxt, scaleX: 1, duration: 130, onComplete: () => {
          this._vizRunTotal += card.score;
          if (this._vizTotalTxt && this._vizTotalTxt.active)
            this._vizTotalTxt.setText('Total: ' + this._vizRunTotal);
          resolve();
        }});
      }});
    });
  }

  _completeScoreboard() {
    if (this._vizTotalTxt && this._vizTotalTxt.active) {
      const divG = this._ve(this.add.graphics());
      divG.lineStyle(1.5, 0x78909c);
      const tx = this._vizTotalTxt.x - 60;
      this.time.delayedCall(200, () => {
        if (divG.active) { divG.lineBetween(tx, VZ_Y+193, tx+120, VZ_Y+193); }
        this._ve(this.add.text(tx+20, VZ_Y+197, '÷ 5', {
          fontFamily:'Courier New', fontSize:'11px', color:'#78909c'
        }));
        this._ve(this.add.text(this._vizTotalTxt.x, VZ_Y+212, '= 87', {
          fontFamily:'Courier New', fontSize:'18px', color:'#ffd740', fontStyle:'bold'
        }).setOrigin(0.5).setScale(0)).then ? null :
        this.tweens.add({ targets: this._ve(this.add.text(this._vizTotalTxt.x, VZ_Y+212, '= 87', {
          fontFamily:'Courier New', fontSize:'18px', color:'#ffd740', fontStyle:'bold'
        }).setOrigin(0.5).setScale(0)), scaleX:1, scaleY:1, duration:280, ease:'Back.easeOut' });
      });
    }
  }

  /* ── Visual: Conveyor Belt ──────────────────────────────────── */
  _setupConveyor() {
    const bly = VZ_Y + 110;
    // Belt
    const bg2 = this._ve(this.add.graphics());
    bg2.fillStyle(0x37474f); bg2.fillRoundedRect(VZ_X+4, bly, 360, 28, 4);
    // Rollers
    this._ve(this.add.circle(VZ_X+18, bly+14, 13, 0x455a64).setStrokeStyle(1, 0x546e7a));
    this._ve(this.add.circle(VZ_X+350, bly+14, 13, 0x455a64).setStrokeStyle(1, 0x546e7a));
    // Scanner arch
    const sg = this._ve(this.add.graphics());
    sg.lineStyle(2, 0x00e5ff);
    sg.lineBetween(VZ_X+175, bly-24, VZ_X+175, bly);
    sg.lineBetween(VZ_X+225, bly-24, VZ_X+225, bly);
    sg.lineBetween(VZ_X+175, bly-24, VZ_X+225, bly-24);
    // Scanning line
    const scanLine = this._ve(this.add.rectangle(VZ_X+200, bly-18, 50, 1, 0x00e5ff)).setAlpha(0.5);
    this.tweens.add({ targets: scanLine, alpha: 0.9, duration: 400, yoyo: true, repeat: -1 });
    // Bins
    const binData = [
      { label:'Fizz', color:0x00e676, x: VZ_X+10 },
      { label:'Buzz', color:0xff8a65, x: VZ_X+105 },
      { label:'FB', color:0xffd740, x: VZ_X+200 },
      { label:'Num', color:0x78909c, x: VZ_X+295 },
    ];
    this._vizBinYs = {};
    binData.forEach(bin => {
      const bg3 = this._ve(this.add.graphics());
      bg3.fillStyle(bin.color, 0.15); bg3.fillRoundedRect(0, 0, 75, 55, 4);
      bg3.lineStyle(1, bin.color, 0.5); bg3.strokeRoundedRect(0, 0, 75, 55, 4);
      bg3.setPosition(bin.x, VZ_Y + VZ_H - 65);
      this._ve(this.add.text(bin.x + 37, VZ_Y+VZ_H-58, bin.label, {
        fontFamily:'Courier New', fontSize:'9px', color: '#'+bin.color.toString(16).padStart(6,'0')
      }).setOrigin(0.5, 0));
      this._vizBinYs[bin.label] = VZ_Y + VZ_H - 40;
    });
    this._vizConvBeltY = bly;
    this._vizConvBoxes = { Fizz:0, Buzz:0, FB:0, Num:0 };
  }

  _iterConveyor(i, output) {
    return new Promise(resolve => {
      const bly = this._vizConvBeltY;
      const box = this._ve(this.add.graphics());
      const labelStr = output || String(i);
      let binKey = 'Num', borderCol = 0x78909c;
      if (String(i).length === 0) {}
      if (output === 'FizzBuzz') { binKey = 'FB'; borderCol = 0xffd740; }
      else if (output === 'Fizz') { binKey = 'Fizz'; borderCol = 0x00e676; }
      else if (output === 'Buzz') { binKey = 'Buzz'; borderCol = 0xff8a65; }

      box.fillStyle(0x1a1a2e); box.fillRoundedRect(0, 0, 28, 28, 3);
      box.lineStyle(1.5, borderCol); box.strokeRoundedRect(0, 0, 28, 28, 3);
      box.setPosition(VZ_X + 4, bly + 1);
      const lbl = this._ve(this.add.text(VZ_X + 18, bly + 15, String(i), {
        fontFamily:'Courier New', fontSize:'9px', color:'#e0e0e0'
      }).setOrigin(0.5));
      this.tweens.add({
        targets: [box, lbl], x: '+=' + 180, duration: 500, ease:'Linear',
        onComplete: () => {
          // After scan
          this.time.delayedCall(180, () => {
            const stampG = this._ve(this.add.graphics());
            stampG.fillStyle(borderCol, 0.7);
            stampG.fillRoundedRect(-20, -8, 40, 16, 3);
            const stx = (lbl.active ? lbl.x : VZ_X + 190), sty = bly + 15;
            stampG.setPosition(stx, sty);
            this._ve(this.add.text(stx, sty, labelStr.length > 4 ? labelStr.substring(0,4) : labelStr, {
              fontFamily:'Courier New', fontSize:'7px', color:'#000000', fontStyle:'bold'
            }).setOrigin(0.5));
            if (box.active) box.destroy(); if (lbl.active) lbl.destroy();
            resolve();
          });
        }
      });
    });
  }

  _completeConveyor() {
    this._ve(this.add.text(VZ_X + VZ_W/2, VZ_Y + 35, 'COMPLETE!', {
      fontFamily:'Arial', fontSize:'16px', color:'#ffd740', fontStyle:'bold'
    }).setOrigin(0.5).setScale(0)).then ? null :
    this.tweens.add({ targets: this._visualEls[this._visualEls.length-1], scaleX:1, scaleY:1, duration:300, ease:'Back.easeOut' });
  }

  /* ── Setup Visual Router ────────────────────────────────────── */
  _setupVisual(type) {
    this._clearVisual();
    switch(type) {
      case 'greeting_cards': this._setupGreetingCards(); break;
      case 'rocket_launch':  this._setupRocketLaunch();  break;
      case 'balance_scale':  this._setupBalanceScale();  break;
      case 'number_line':    this._setupNumberLine();    break;
      case 'pyramid_crane':  this._setupPyramidCrane();  break;
      case 'chalkboard':     this._setupChalkboard();    break;
      case 'scoreboard':     this._setupScoreboard();    break;
      case 'conveyor_belt':  this._setupConveyor();      break;
    }
  }

  _completeVisual(type) {
    switch(type) {
      case 'greeting_cards': this._completeGreeting();    break;
      case 'rocket_launch':  this._completeRocket();      break;
      case 'balance_scale':  this._completeScale();       break;
      case 'number_line':    this._completeNumberLine();  break;
      case 'pyramid_crane':  this._completePyramid();     break;
      case 'chalkboard':     this._completeChalkboard();  break;
      case 'scoreboard':     this._completeScoreboard();  break;
      case 'conveyor_belt':  this._completeConveyor();    break;
    }
  }

  /* ── Correct / Wrong ────────────────────────────────────────── */
  async _onCorrect(cfg) {
    if (this._loopMonitor && this._loopMonitor.active) this._loopMonitor.destroy();
    if (this._loopMonTxt && this._loopMonTxt.active) this._loopMonTxt.destroy();

    // Flash console green
    const cBg = this.add.graphics().setDepth(60);
    cBg.lineStyle(2, 0x00e676); cBg.strokeRect(VIS_X+4, CON_Y, VIS_W-8, CON_H);
    this.time.delayedCall(600, () => { if (cBg.active) cBg.destroy(); });

    this._completeVisual(cfg.visual);

    // PROJECT COMPLETE banner
    const banner = this.add.text(W/2, H/2, '✓ PROJECT COMPLETE', {
      fontFamily:'Arial', fontSize:'22px', color:'#00e676', fontStyle:'bold'
    }).setOrigin(0.5).setScale(0).setDepth(200);
    this.tweens.add({ targets: banner, scaleX: 1.1, scaleY: 1.1, duration: 250, ease:'Back.easeOut',
      onComplete: () => this.tweens.add({ targets: banner, scaleX:1, scaleY:1, duration:80, onComplete: () => {
        this.time.delayedCall(900, () => { this.tweens.add({ targets: banner, alpha:0, duration:250, onComplete: () => banner.destroy() }); });
      }})
    });

    // Score
    const isFirst = this.projectAttempts === 1;
    if (isFirst) this.firstTryCorrect++;
    const pts = isFirst ? 150 : 100;
    this.totalScore += pts;
    this._scoreTxt.setText(String(this.totalScore));
    const acc = Math.round((this.firstTryCorrect / (this.currentProject + 1)) * 100);
    this._accTxt.setText(`Accuracy: ${acc}%`);
    const timeSpent = Math.round((Date.now() - this.projectStartTime) / 1000);
    this.projectResults.push({ id: cfg.id, correct: true, attempts: this.projectAttempts, time: timeSpent, firstTry: isFirst });

    this._updateHUDProgress(this.currentProject + 1);
    await this._delay(2200);

    this.currentProject++;
    this._interactionDisabled = false;
    if (this.currentProject >= PROJECTS.length) {
      this._levelComplete();
    } else {
      this._showBriefing(this.currentProject);
    }
  }

  async _onWrong(cfg, actual, expected) {
    if (this._loopMonitor && this._loopMonitor.active) this._loopMonitor.destroy();
    if (this._loopMonTxt && this._loopMonTxt.active) this._loopMonTxt.destroy();

    // Flash console red
    const cBg = this.add.graphics().setDepth(60);
    cBg.lineStyle(2, 0xf44336); cBg.strokeRect(VIS_X+4, CON_Y, VIS_W-8, CON_H);

    // Diff overlay
    this._showDiff(expected, actual);
    const errType = this._classifyError(cfg, actual);
    await this._delay(400);
    await this._showBitFeedback(BIT_FB[errType] || BIT_FB.generic);
    if (cBg.active) cBg.destroy();

    // Reset all placed blocks
    Object.keys(this._placed).forEach(k => {
      if (this._placed[k]) {
        const el = this._slotEls[k];
        if (el) {
          el.ft && el.ft.setVisible(false);
          el.ph && el.ph.setVisible(true);
          el.bg && (el.bg.clear(), el.bg.fillStyle(0x1a2030, 0.8), el.bg.fillRoundedRect(el.slotX, el.sy-1, el.slotW, el.slotH, 3));
          el.dg && el.dg.setAlpha(1);
        }
        const tb = this._trayBlocks.find(b => b.text === this._placed[k] && b.used);
        if (tb) { tb.used = false; tb.el.setAlpha(1); tb.el.__used = false; if (tb.el.input) tb.el.input.enabled = true; }
        this._placed[k] = null;
      }
    });
    this._selectedBlock = null;
    this._disableRun();
    this._runBtnTxt.setText('▶ COMPILE & RUN');
    this._interactionDisabled = false;
  }

  _showDiff(expected, actual) {
    const dg = this.add.graphics().setDepth(100);
    dg.fillStyle(0x0d1117); dg.fillRoundedRect(VIS_X+4, VIS_Y+VIS_H-170, VIS_W-8, 160, 6);
    dg.lineStyle(1.5, 0xf44336); dg.strokeRoundedRect(VIS_X+4, VIS_Y+VIS_H-170, VIS_W-8, 160, 6);
    const dy = VIS_Y + VIS_H - 165;
    this.add.text(VIS_X+10, dy, 'Expected:', { fontFamily:'Courier New', fontSize:'9px', color:'#00e676' }).setDepth(101);
    this.add.text(VIS_X+10, dy+12, expected.split('\n').slice(0,5).join('\n'), {
      fontFamily:'Courier New', fontSize:'9px', color:'#00e676', wordWrap:{width:180}
    }).setDepth(101);
    this.add.text(VIS_X+210, dy, 'Your Output:', { fontFamily:'Courier New', fontSize:'9px', color:'#f44336' }).setDepth(101);
    this.add.text(VIS_X+210, dy+12, actual.split('\n').slice(0,5).join('\n'), {
      fontFamily:'Courier New', fontSize:'9px', color:'#f44336', wordWrap:{width:180}
    }).setDepth(101);
    // Click to dismiss
    const zone = this.add.zone(VIS_X+4, VIS_Y+VIS_H-170, VIS_W-8, 160).setOrigin(0).setInteractive().setDepth(102);
    zone.on('pointerdown', () => { dg.destroy(); zone.destroy(); });
    // Auto-dismiss
    this.time.delayedCall(4000, () => { if (dg.active) dg.destroy(); if (zone.active) zone.destroy(); });
  }

  _showBitFeedback(msg) {
    return new Promise(resolve => {
      if (this._bitBubble && this._bitBubble.active) this._bitBubble.destroy();
      if (this._bitBubbleTxt && this._bitBubbleTxt.active) this._bitBubbleTxt.destroy();
      if (this._bitTimer) { this._bitTimer.remove(); this._bitTimer = null; }

      const bx = W - 90, by = 470;
      this._bitCont.setPosition(W+80, 490);
      this.tweens.add({ targets: this._bitCont, x: bx, duration: 250, ease:'Back.easeOut' });

      const tw = Math.min(msg.length * 6.8 + 24, 230);
      const bubX = bx - tw - 8, bubY = by - 72;
      const lines = Math.ceil(msg.length / 32);
      const th = lines * 17 + 20;

      const bg = this.add.graphics().setDepth(162);
      bg.fillStyle(0xffffff, 0.97); bg.fillRoundedRect(bubX, bubY, tw, th, 6);
      bg.fillStyle(0xffffff, 0.97);
      bg.fillTriangle(bx-8, bubY+th, bx+4, bubY+th+10, bx+4, bubY+th);
      this._bitBubble = bg;

      const txt = this.add.text(bubX+8, bubY+8, msg, {
        fontFamily:'Arial', fontSize:'10px', color:'#1a1a2e', wordWrap:{width:tw-14}
      }).setDepth(163);
      this._bitBubbleTxt = txt;

      const dismiss = () => {
        if (this._bitTimer) { this._bitTimer.remove(); this._bitTimer = null; }
        if (bg.active) bg.destroy();
        if (txt.active) txt.destroy();
        this._bitBubble = null; this._bitBubbleTxt = null;
        this.tweens.add({ targets: this._bitCont, x: W+80, duration: 200, onComplete: () => resolve() });
      };
      this._bitTimer = this.time.delayedCall(3200, dismiss);
      this.input.once('pointerdown', () => { if (this._bitTimer) dismiss(); });
    });
  }

  /* ── Level Complete ─────────────────────────────────────────── */
  _levelComplete() {
    // Save
    try { GameManager.completeLevel(17, Math.round((this.firstTryCorrect / 8) * 100)); } catch(e) {}
    try { BadgeSystem.unlock('loop_architect'); } catch(e) {}

    // City reveal in visual zone
    this._clearVisual();
    const bgOv = this._ve(this.add.graphics());
    bgOv.fillStyle(0x0a0e13, 0.9); bgOv.fillRect(0, 0, W, H);

    PROJECTS.forEach((proj, idx) => {
      const result = this.projectResults[idx] || { attempts: 1 };
      const col = idx % 4, row = Math.floor(idx / 4);
      const bx = 80 + col * 165, baseY = H - 80;
      const bh = result.firstTry ? 100 : result.attempts <= 2 ? 75 : 50;
      const roofColor = result.firstTry ? 0xffd740 : result.attempts <= 2 ? 0x78909c : 0xcd7f32;

      const bld = this._ve(this.add.graphics());
      bld.fillStyle(0x1a2035); bld.fillRect(bx, baseY - bh, 130, bh);
      bld.fillStyle(roofColor, 0.8); bld.fillRect(bx, baseY - bh - 6, 130, 6);
      bld.setY(H);
      this.time.delayedCall(idx * 160 + 400, () => {
        if (bld.active) this.tweens.add({ targets: bld, y: 0, duration: 220, ease:'Quad.easeOut' });
      });
      this.time.delayedCall(idx * 160 + 660, () => {
        this._ve(this.add.text(bx + 65, baseY - bh/2, proj.title.split(' ').slice(0,-1).join('\n') || proj.title, {
          fontFamily:'Arial', fontSize:'8px', color:'#546e7a', align:'center', wordWrap:{width:120}
        }).setOrigin(0.5));
      });
    });

    // Score breakdown overlay
    this.time.delayedCall(1600, () => {
      const ov2 = this.add.graphics().setDepth(200).setAlpha(0);
      ov2.fillStyle(0x000814, 0.9); ov2.fillRect(0, 0, W, H);
      this.tweens.add({ targets: ov2, alpha: 1, duration: 500 });

      this.add.text(W/2, 44, 'ALL PROJECTS COMPLETE!', {
        fontFamily:'Arial', fontSize:'28px', color:'#ffd740', fontStyle:'bold'
      }).setOrigin(0.5).setDepth(201);

      PROJECTS.forEach((proj, idx) => {
        const res = this.projectResults[idx] || {};
        const stars = res.firstTry ? '★★★' : res.attempts <= 2 ? '★★☆' : '★☆☆';
        const starsCol = res.firstTry ? '#ffd740' : res.attempts <= 2 ? '#78909c' : '#cd7f32';
        this.time.delayedCall(idx * 180, () => {
          this.add.text(W/2 - 180, 90 + idx * 28, `${idx+1}. ${proj.title}`, {
            fontFamily:'Courier New', fontSize:'12px', color:'#e0e0e0'
          }).setDepth(201);
          this.add.text(W/2 + 100, 90 + idx * 28, stars, {
            fontFamily:'Arial', fontSize:'12px', color: starsCol
          }).setDepth(201);
        });
      });

      const totalTime = Math.round((Date.now() - this._levelStartTime) / 1000);
      const mins = Math.floor(totalTime / 60), secs = totalTime % 60;
      const overallAcc = Math.round((this.firstTryCorrect / 8) * 100);

      this.time.delayedCall(1500, () => {
        this.add.text(W/2, 340, `Total Score: ${this.totalScore}`, {
          fontFamily:'Arial', fontSize:'20px', color:'#ffd740', fontStyle:'bold'
        }).setOrigin(0.5).setDepth(201);
        this.add.text(W/2, 368, `Overall Accuracy: ${overallAcc}%`, {
          fontFamily:'Arial', fontSize:'14px', color:'#00e5ff'
        }).setOrigin(0.5).setDepth(201);
        this.add.text(W/2, 390, `Total Time: ${mins}m ${secs}s`, {
          fontFamily:'Arial', fontSize:'13px', color:'#78909c'
        }).setOrigin(0.5).setDepth(201);

        // Badge
        const badge = this.add.graphics().setDepth(201).setScale(0);
        badge.lineStyle(3, 0xffd740); badge.strokeCircle(0, 0, 32);
        badge.lineStyle(2, 0x00e5ff); badge.strokeCircle(0, 0, 16);
        badge.setPosition(W/2, 440);
        this.tweens.add({ targets: badge, scaleX: 1, scaleY: 1, duration: 380, ease:'Back.easeOut', onComplete: () => {
          this.tweens.add({ targets: badge, angle: 5, duration: 3000, yoyo: true, repeat: -1 });
        }});
        this.add.text(W/2, 440, '⚙', { fontFamily:'Arial', fontSize:'22px', color:'#ffd740' }).setOrigin(0.5).setDepth(202);
        this.add.text(W/2, 478, 'LOOP ARCHITECT', {
          fontFamily:'Arial', fontSize:'14px', color:'#ffd740', fontStyle:'bold'
        }).setOrigin(0.5).setDepth(201);

        // Buttons
        const rg = this.add.graphics().setDepth(201);
        rg.lineStyle(1.5, 0x78909c); rg.strokeRoundedRect(W/2-170, 508, 100, 36, 6);
        this.add.text(W/2-120, 526, 'RETRY', {
          fontFamily:'Arial', fontSize:'13px', color:'#78909c'
        }).setOrigin(0.5).setDepth(202);
        this.add.zone(W/2-170, 508, 100, 36).setOrigin(0).setInteractive().setDepth(203)
          .on('pointerdown', () => this.scene.restart());

        const mg = this.add.graphics().setDepth(201);
        mg.fillStyle(0x00e676); mg.fillRoundedRect(W/2+30, 508, 140, 36, 6);
        this.add.text(W/2+100, 526, 'MODULE COMPLETE →', {
          fontFamily:'Arial', fontSize:'11px', color:'#0a0a1a', fontStyle:'bold'
        }).setOrigin(0.5).setDepth(202);
        this.add.zone(W/2+30, 508, 140, 36).setOrigin(0).setInteractive().setDepth(203)
          .on('pointerdown', () => this.scene.start('MenuScene'));
      });

      // Confetti
      for (let i = 0; i < 20; i++) {
        this.time.delayedCall(i * 60, () => {
          try {
            const ps = this.add.particles(Phaser.Math.Between(60, W-60), -10, 'p18', {
              speedY:{min:120,max:260}, lifespan:1100,
              tint:[0x00e5ff,0xffd740,0xff4081,0x00e676], quantity:3
            }).setDepth(205);
            this.time.delayedCall(1200, () => { if (ps.active) ps.destroy(); });
          } catch(e) {}
        });
      }
    });
  }

  /* ── Utilities ──────────────────────────────────────────────── */
  _delay(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }
}
