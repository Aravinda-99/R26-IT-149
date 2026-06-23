/**
 * Level16Scene — Loop Train Express
 * Canvas: 800×600 (matches GameConfig)
 */
import Phaser from "phaser";

const W = 800, H = 600;
const TRACK_Y1 = 383, TRACK_Y2 = 395;
const TRAIN_Y  = 353;   // train container centre-y
const ST_SY    = 378;   // station bottom-y (just above top rail)
const ST_SPACING = 110; // px between consecutive station centres

// ─── Round data ───────────────────────────────────────────────────────────────
const ROUNDS = [
  {
    round:1, mission:"Deliver cargo to 3 stations, starting from Station 0.",
    blanks:["init_value"],
    correctValues:{init_value:0, condition_op:"<", condition_value:3, update:"i++"},
    options:{init_value:[0,1,3]}, stations:[0,1,2],
    prefilledDisplay:{condition:"i < 3", update:"i++"}
  },
  {
    round:2, mission:"Deliver cargo to 4 stations, starting from Station 0.",
    blanks:["condition_value"],
    correctValues:{init_value:0, condition_op:"<", condition_value:4, update:"i++"},
    options:{condition_value:[3,4,5]}, stations:[0,1,2,3],
    prefilledDisplay:{init:"int i = 0", update:"i++"}
  },
  {
    round:3, mission:"Deliver cargo to 5 stations, starting from Station 0.",
    blanks:["init_value","condition_value"],
    correctValues:{init_value:0, condition_op:"<", condition_value:5, update:"i++"},
    options:{init_value:[0,1], condition_value:[4,5,6]}, stations:[0,1,2,3,4],
    prefilledDisplay:{update:"i++"}
  },
  {
    round:4, mission:"Deliver cargo to Stations 2, 3, and 4 only.",
    blanks:["init_value","condition_value"],
    correctValues:{init_value:2, condition_op:"<", condition_value:5, update:"i++"},
    options:{init_value:[0,2,3], condition_value:[4,5,6]}, stations:[2,3,4],
    prefilledDisplay:{update:"i++"}
  },
  {
    round:5, mission:"Visit every OTHER station: 0, 2, 4.",
    blanks:["update"],
    correctValues:{init_value:0, condition_op:"<", condition_value:6, update:"i += 2"},
    options:{update:["i++","i += 2","i += 3"]}, stations:[0,2,4],
    prefilledDisplay:{init:"int i = 0", condition:"i < 6"}
  },
  {
    round:6, mission:"Visit Stations 1, 3, and 5.",
    blanks:["init_value","update"],
    correctValues:{init_value:1, condition_op:"<", condition_value:7, update:"i += 2"},
    options:{init_value:[0,1,2], update:["i++","i += 2","i += 3"]}, stations:[1,3,5],
    prefilledDisplay:{condition:"i < 7"}
  },
  {
    round:7, mission:"Deliver cargo to exactly 6 stations, starting from Station 0.",
    blanks:["init_value","condition_value","update"],
    correctValues:{init_value:0, condition_op:"<", condition_value:6, update:"i++"},
    options:{init_value:[0,1], condition_value:[5,6,7], update:["i++","i += 2"]},
    stations:[0,1,2,3,4,5], prefilledDisplay:{}
  },
  {
    round:8, mission:"Countdown! Visit Stations 5, 4, 3, 2, 1 in reverse.",
    blanks:["init_value","condition_value","update"],
    correctValues:{init_value:5, condition_op:">", condition_value:0, update:"i--"},
    options:{init_value:[5,4,0], condition_value:[0,1,-1], update:["i--","i++"]},
    stations:[5,4,3,2,1], prefilledDisplay:{}, conditionOptions:[">","<",">="]
  },
  {
    round:9, mission:"Visit every other station: 0, 2, 4, 6, 8.",
    blanks:["init_value","condition_value","update"],
    correctValues:{init_value:0, condition_op:"<=", condition_value:8, update:"i += 2"},
    options:{init_value:[0,1,2], condition_value:[8,9,10], update:["i++","i += 2","i += 3"]},
    stations:[0,2,4,6,8], prefilledDisplay:{}, conditionOptions:["<","<="]
  },
  {
    round:10, mission:"Final countdown! Visit Stations 4, 3, 2, 1, 0.",
    blanks:["init_value","condition_value","update"],
    correctValues:{init_value:4, condition_op:">=", condition_value:0, update:"i--"},
    options:{init_value:[4,5,3], condition_value:[0,1,-1], update:["i--","i++","i -= 2"]},
    stations:[4,3,2,1,0], prefilledDisplay:{}, conditionOptions:[">=",">","<="]
  }
];

const FEEDBACK = {
  too_few:      "You visited fewer stations than needed. Check your condition — maybe increase the limit value?",
  too_many:     "The train went too far! Your condition let the loop run extra iterations. Try a smaller limit.",
  wrong_start:  "The train started at the wrong station! Check your initialization — 'int i = ?' sets the start.",
  infinite_loop:"Infinite loop detected! The update moves i away from the limit forever. Check i++ vs i--.",
  wrong_step:   "The train skipped wrong stations. Check your update — i++ moves by 1, i += 2 moves by 2.",
  wrong_direction:"The train went the wrong direction! For counting down, use i-- instead of i++."
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export class Level16Scene extends Phaser.Scene {
  constructor() { super({ key:"Level16Scene" }); }

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  init() {
    this.currentRound = 0;
    this.score = 0;  this.combo = 0;  this.lives = 3;
    this.playerAnswers = {};
    this.currentBlankIndex = 0;
    this.isRunning = false;
    this.correctFirstTryCount = 0;
    this.totalRoundTime = 0;
    this.roundStartTime = 0;
    this.highestCombo = 0;
    this.scoreMultiplier = 1;
    this._conditionOp = "<";
    this._roundEls = [];
    this._bubbleGroup = [];
    this._trainIdleTween = null;
    this._awaitingCondValAfterOp = null;
    this._stations = [];
    this._stationXMap = {};
  }

  preload() {}

  create() {
    // Stop UIScene overlay — Level16 has its own HUD
    if (this.scene.isActive("UIScene")) this.scene.stop("UIScene");

    // Particle texture
    const pg = this.make.graphics({ add:false });
    pg.fillStyle(0xffffff); pg.fillCircle(4,4,4);
    pg.generateTexture("particle",8,8); pg.destroy();

    this.createBackground();
    this.createCitySkyline();
    this.createParallaxElements();
    this.createTrack();
    this.createHUD();
    this.createLoopMonitor();
    this.createBit();

    if (!localStorage.getItem("level16_tutorial_done")) {
      this.runTutorial();
    } else {
      this.startRound(0);
    }
  }

  update() {
    if (!this._billboards) return;
    this._billboards.forEach(b => {
      b.x -= b.speed;
      if (b.x < -110) b.x = W + 60 + Math.random() * 200;
    });
  }

  // ── Background ──────────────────────────────────────────────────────────────
  createBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x050520,0x050520,0x0a0a2a,0x0a0a2a,1);
    g.fillRect(0,0,W,H);

    for (let i=0; i<70; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(0,W),
        Phaser.Math.Between(0, H*0.55),
        Math.random()<0.5?1:2, 0xffffff
      ).setAlpha(Phaser.Math.FloatBetween(0.2,0.6));
      this.tweens.add({ targets:s, alpha:Phaser.Math.FloatBetween(0.7,1),
        duration:Phaser.Math.Between(1500,4000), yoyo:true, repeat:-1,
        delay:Phaser.Math.Between(0,2000) });
    }
  }

  createCitySkyline() {
    // horizon glow
    const hg = this.add.graphics();
    hg.fillStyle(0x6a1b9a,1); hg.fillRect(0,465,W,30); hg.setAlpha(0.15);

    const winColors=[0x00e5ff,0xff00ff,0xffd740,0x4fc3f7];
    for (let i=0;i<10;i++) {
      const bw=Phaser.Math.Between(28,65);
      const bh=Phaser.Math.Between(60,150);
      const bx=i*82+Phaser.Math.Between(-5,5);
      const by=H-bh;
      const bg=this.add.graphics();
      bg.fillStyle(0x0d0d1a); bg.fillRect(bx,by,bw,bh);
      for (let w=0;w<Phaser.Math.Between(3,7);w++) {
        const wx=bx+Phaser.Math.Between(3,bw-7);
        const wy=by+Phaser.Math.Between(5,bh-9);
        const wg=this.add.graphics();
        wg.fillStyle(Phaser.Utils.Array.GetRandom(winColors));
        wg.fillRect(wx,wy,4,4);
        wg.setAlpha(Phaser.Math.FloatBetween(0.3,1));
        this.tweens.add({ targets:wg, alpha:{from:0.3,to:1},
          duration:Phaser.Math.Between(2000,5000), yoyo:true, repeat:-1,
          delay:Phaser.Math.Between(0,3000) });
      }
    }
  }

  createParallaxElements() {
    this._billboards=[];
    for (let i=0;i<5;i++) {
      const bx=Phaser.Math.Between(0,W);
      const by=Phaser.Math.Between(80,280);
      const bw=Phaser.Math.Between(60,100); const bh=Phaser.Math.Between(28,45);
      const g=this.add.graphics();
      g.lineStyle(1,0x00e5ff,0.08); g.strokeRoundedRect(-bw/2,-bh/2,bw,bh,6);
      for(let l=0;l<3;l++){
        g.lineStyle(1,0xffffff,0.05);
        g.lineBetween(-bw/2+4,-bh/2+7+l*9,bw/2-4,-bh/2+7+l*9);
      }
      g.setPosition(bx,by);
      g.speed=Phaser.Math.FloatBetween(0.2,0.4);
      this._billboards.push(g);
    }
  }

  // ── Track ───────────────────────────────────────────────────────────────────
  createTrack() {
    const g=this.add.graphics();
    g.lineStyle(3,0x455a64);
    for(let x=0;x<=W;x+=40) g.lineBetween(x,TRACK_Y1,x,TRACK_Y2);
    g.lineStyle(2,0x78909c);
    g.lineBetween(0,TRACK_Y1,W,TRACK_Y1);
    g.lineBetween(0,TRACK_Y2,W,TRACK_Y2);

    const pr=this.add.graphics();
    pr.lineStyle(1,0x00e5ff,0.3); pr.lineBetween(0,389,W,389);
    this.tweens.add({ targets:pr, alpha:0.7, duration:1500, yoyo:true, repeat:-1 });
  }

  // ── Stations ────────────────────────────────────────────────────────────────
  createStations(indices) {
    this._stations.forEach(s=>s.container&&s.container.destroy());
    this._stations=[]; this._stationXMap={};

    const count=indices.length;
    const spread=(count-1)*ST_SPACING;
    const startX=Math.round((W-spread)/2);

    indices.forEach((idx,pos)=>{
      const sx = count===1 ? W/2 : startX+pos*ST_SPACING;
      const c=this.add.container(sx, ST_SY);

      const glowR=this.add.graphics();
      glowR.fillStyle(0x00e5ff,0.2); glowR.fillRoundedRect(-28,-76,56,76,4);
      glowR.setAlpha(0); c.add(glowR);

      const base=this.add.graphics();
      base.fillStyle(0x1a1a2e); base.fillRoundedRect(-25,-70,50,70,3);
      base.lineStyle(2,0x424242); base.strokeRoundedRect(-25,-70,50,70,3);
      c.add(base);

      const num=this.add.text(0,-35,String(idx),{
        fontFamily:"Courier New",fontSize:"22px",fontStyle:"bold",color:"#ffffff"
      }).setOrigin(0.5,0.5);
      c.add(num);

      const tri=this.add.graphics();
      tri.fillStyle(0x424242); tri.fillTriangle(-6,-76,6,-76,0,-68);
      c.add(tri);

      const sd={ index:idx,x:sx,container:c,glowR,base,num,tri,state:"unvisited",glowTween:null,checkTxt:null };
      this._stations.push(sd);
      this._stationXMap[idx]=sd;
    });
  }

  _setStationState(sd, state) {
    if(!sd) return;
    sd.state=state;
    if(sd.glowTween){sd.glowTween.stop();sd.glowTween=null;}
    if(sd.checkTxt){sd.checkTxt.destroy();sd.checkTxt=null;}
    const {base,num,glowR,tri,container}=sd;

    const paint=(borderHex,numColor,alpha,glowAlpha)=>{
      base.clear();
      base.fillStyle(0x1a1a2e); base.fillRoundedRect(-25,-70,50,70,3);
      base.lineStyle(2,borderHex); base.strokeRoundedRect(-25,-70,50,70,3);
      tri.clear(); tri.fillStyle(borderHex); tri.fillTriangle(-6,-76,6,-76,0,-68);
      num.setColor(numColor);
      container.setAlpha(alpha);
      glowR.setAlpha(glowAlpha);
    };

    if(state==="unvisited") { paint(0x424242,"#ffffff",0.5,0); }
    else if(state==="current") {
      paint(0x00e5ff,"#00e5ff",1,0.2);
      sd.glowTween=this.tweens.add({ targets:glowR, alpha:{from:0.15,to:0.35},
        duration:800,yoyo:true,repeat:-1 });
    } else if(state==="visited") {
      paint(0x00e676,"#00e676",1,0);
      const ck=this.add.text(0,-85,"✓",{fontFamily:"Arial",fontSize:"14px",color:"#00e676"}).setOrigin(0.5,0.5);
      container.add(ck); sd.checkTxt=ck;
    }
  }

  // ── Train ───────────────────────────────────────────────────────────────────
  createTrain() {
    if(this.trainContainer&&this.trainContainer.active) this.trainContainer.destroy();
    this.trainContainer=this.add.container(60, TRAIN_Y);

    const body=this.add.graphics();
    body.fillStyle(0x37474f); body.fillRoundedRect(-60,-18,120,36,8);
    this.trainContainer.add(body);

    const stripe=this.add.graphics();
    stripe.fillStyle(0x00e5ff); stripe.fillRect(-60,-2,120,4);
    this.trainContainer.add(stripe);

    const hglow=this.add.graphics();
    hglow.fillStyle(0x00e5ff,0.15); hglow.fillCircle(60,0,14);
    this.trainContainer.add(hglow);
    this.tweens.add({ targets:hglow, alpha:{from:0.1,to:0.25}, duration:1000,yoyo:true,repeat:-1 });

    const head=this.add.graphics();
    head.fillStyle(0x00e5ff,0.9); head.fillCircle(60,0,6);
    this.trainContainer.add(head);

    for(let i=0;i<2;i++){
      const w=this.add.graphics();
      w.fillStyle(0xff8f00); w.fillRect(20+i*20,-8,8,6);
      this.trainContainer.add(w);
    }
    this._startTrainIdle();
  }

  _startTrainIdle() {
    if(this._trainIdleTween) this._trainIdleTween.stop();
    const baseY=this.trainContainer.y;
    this._trainIdleTween=this.tweens.add({
      targets:this.trainContainer, y:baseY+1.5,
      duration:1200,ease:"Sine.easeInOut",yoyo:true,repeat:-1
    });
  }

  _stopTrainIdle() {
    if(this._trainIdleTween){this._trainIdleTween.stop();this._trainIdleTween=null;}
  }

  moveTrain(toX, reverse) {
    return new Promise(resolve=>{
      this._stopTrainIdle();
      this.trainContainer.setScale(reverse?-1:1,1);

      let trails=0;
      const tt=this.time.addEvent({ delay:60,repeat:4, callback:()=>{
        if(trails>=3)return; trails++;
        const tr=this.add.graphics();
        tr.fillStyle(0x37474f,0.12); tr.fillRoundedRect(-60,-18,120,36,8);
        tr.setPosition(this.trainContainer.x, this.trainContainer.y);
        this.tweens.add({ targets:tr,alpha:0,duration:350,onComplete:()=>tr.destroy() });
      }});

      this.tweens.add({
        targets:this.trainContainer, x:toX,
        duration:700, ease:"Cubic.easeInOut",
        onComplete:()=>{ tt.remove(); this._startTrainIdle(); resolve(); }
      });
    });
  }

  // ── HUD ─────────────────────────────────────────────────────────────────────
  createHUD() {
    const bar=this.add.graphics();
    bar.fillStyle(0x0f0f13,0.92); bar.fillRect(0,0,W,72);
    bar.lineStyle(1,0x1e1e3a); bar.lineBetween(0,72,W,72);

    this.add.text(20,14,"LOOP TRAIN EXPRESS",{fontFamily:"Arial",fontSize:"13px",fontStyle:"bold",color:"#b0bec5"});
    this.add.text(20,36,"Accretion Phase — For Loops",{fontFamily:"Arial",fontSize:"11px",color:"#546e7a"});

    this._scoreValue=0;
    this._scoreTxt=this.add.text(W-155,12,"SCORE: 0",{fontFamily:"Arial",fontSize:"16px",fontStyle:"bold",color:"#ffffff"});
    this._comboTxt=this.add.text(W-155,38,"×1",{fontFamily:"Arial",fontSize:"14px",fontStyle:"bold",color:"#ffd740"});

    this._lifeInds=[];
    for(let i=0;i<3;i++){
      const g=this.add.graphics();
      g.fillStyle(0x00e5ff); g.fillRoundedRect(0,0,18,9,3);
      g.setPosition(W-72+i*24, 55);
      this._lifeInds.push(g);
    }
  }

  _animateScore(to) {
    const from=this._scoreValue, dur=500, t0=this.time.now;
    const ev=this.time.addEvent({ delay:16,repeat:Math.ceil(dur/16), callback:()=>{
      const t=Math.min((this.time.now-t0)/dur,1);
      this._scoreValue=Math.floor(from+(to-from)*t);
      this._scoreTxt.setText("SCORE: "+this._scoreValue);
      if(t>=1)ev.remove();
    }});
  }

  _updateCombo() {
    const mults=[1,1,1.5,1.5,2.0,2.0,2.5,2.5,3.0];
    this.scoreMultiplier=mults[Math.min(this.combo,mults.length-1)]||3.0;
    const lbl=this.combo>0?`×${this.scoreMultiplier.toFixed(1)}`:"×1";
    this._comboTxt.setText(lbl);
    if(this._comboPulse){this._comboPulse.stop();this._comboPulse=null;}
    if(this.combo>=2){
      this._comboPulse=this.tweens.add({ targets:this._comboTxt,
        scaleX:{from:1,to:1.15},scaleY:{from:1,to:1.15},
        duration:600,yoyo:true,repeat:-1 });
    } else { this._comboTxt.setScale(1); }
  }

  // ── Loop Monitor ────────────────────────────────────────────────────────────
  createLoopMonitor() {
    this._monCont=this.add.container(W/2, 36);
    const bg=this.add.graphics();
    bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(-250,-25,500,50,8);
    bg.lineStyle(1,0x2a2a4a); bg.strokeRoundedRect(-250,-25,500,50,8);
    this._monCont.add(bg);
    this._monTexts={};
    this._rebuildMonitor();
  }

  _rebuildMonitor() {
    Object.values(this._monTexts).forEach(t=>t&&t.destroy());
    this._monTexts={};
    const segs=[
      {k:"kw",  txt:"for",        col:"#ff4081", x:-238, bold:true},
      {k:"p1",  txt:" (",         col:"#ffffff",  x:-208},
      {k:"init",txt:"int i = ?",  col:"#00e5ff",  x:-188},
      {k:"s1",  txt:";",          col:"#ffffff",  x:-70},
      {k:"cond",txt:"? < ?",      col:"#ffd740",  x:-56},
      {k:"s2",  txt:";",          col:"#ffffff",  x:72},
      {k:"upd", txt:"?",          col:"#00e676",  x:86},
      {k:"p2",  txt:")",          col:"#ffffff",  x:160},
    ];
    segs.forEach(s=>{
      const t=this.add.text(s.x,0,s.txt,{
        fontFamily:"Courier New",fontSize:"14px",
        fontStyle:s.bold?"bold":"normal",color:s.col
      }).setOrigin(0,0.5);
      this._monCont.add(t);
      this._monTexts[s.k]=t;
    });
  }

  _refreshMonitor(roundCfg) {
    if(!roundCfg||!this._monTexts.init) return;
    const blanks=roundCfg.blanks||[];
    const correct=roundCfg.correctValues||{};
    const pre=roundCfg.prefilledDisplay||{};
    const op=this._conditionOp||correct.condition_op;

    const initTxt = blanks.includes("init_value")
      ? (this.playerAnswers.init_value!==undefined
          ? `int i = ${this.playerAnswers.init_value}` : "int i = ___")
      : (pre.init||`int i = ${correct.init_value}`);

    const condTxt = blanks.includes("condition_value")
      ? (this.playerAnswers.condition_value!==undefined
          ? `i ${op} ${this.playerAnswers.condition_value}` : `i ${op} ___`)
      : (pre.condition||`i ${op} ${correct.condition_value}`);

    const updTxt = blanks.includes("update")
      ? (this.playerAnswers.update!==undefined ? this.playerAnswers.update : "___")
      : (pre.update||correct.update);

    this._monTexts.init.setText(initTxt);
    this._monTexts.cond.setText(condTxt);
    this._monTexts.upd.setText(updTxt);
  }

  _flashMonPart(part) {
    const map={init:"init",condition:"cond",update:"upd"};
    const colMap={init:0x00e5ff,condition:0xffd740,update:0x00e676};
    const t=this._monTexts[map[part]];
    if(!t) return;
    const f=this.add.graphics().setDepth(12);
    f.fillStyle(colMap[part],0.25);
    f.fillRect(t.x-2,-14,Math.max(t.width,30)+4,28);
    this._monCont.add(f);
    this.tweens.add({ targets:f,alpha:0,duration:500,onComplete:()=>f.destroy() });
  }

  // ── Bit ─────────────────────────────────────────────────────────────────────
  createBit() {
    this._bitC=this.add.container(W+60, 280);

    const body=this.add.graphics();
    body.fillStyle(0x37474f); body.fillRoundedRect(-20,-17,40,35,10);
    this._bitC.add(body);

    const eye=this.add.graphics();
    eye.fillStyle(0x00e5ff); eye.fillCircle(0,0,8);
    eye.fillStyle(0xffffff); eye.fillCircle(0,0,3);
    this._bitC.add(eye);

    const ant=this.add.graphics();
    ant.lineStyle(2,0x78909c); ant.lineBetween(0,-17,0,-32);
    ant.fillStyle(0xffd740); ant.fillCircle(0,-34,3);
    this._bitC.add(ant);
    this.tweens.add({ targets:ant, alpha:{from:0.6,to:1}, duration:800,yoyo:true,repeat:-1 });

    this.tweens.add({ targets:this._bitC, y:this._bitC.y+4,
      duration:2000,ease:"Sine.easeInOut",yoyo:true,repeat:-1 });
  }

  _bitIn()  { return new Promise(r=>{ this._bitC.setX(W+60);
    this.tweens.add({ targets:this._bitC,x:700,duration:400,ease:"Back.easeOut",onComplete:r }); }); }
  _bitOut() { return new Promise(r=>{ this.tweens.add({ targets:this._bitC,x:W+60,duration:300,onComplete:r });
    if(this._bubble){this._bubble.destroy();this._bubble=null;} }); }

  showBitMsg(msg) {
    return new Promise(resolve=>{
      if(this._bubble){this._bubble.destroy();this._bubble=null;}
      const maxW=300;
      const bc=this.add.container(this._bitC.x-170, this._bitC.y-50).setScale(0).setDepth(30);
      this._bubble=bc;

      const bg=this.add.graphics();
      bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(-maxW/2,-55,maxW,110,10);
      bg.lineStyle(1,0x00e5ff); bg.strokeRoundedRect(-maxW/2,-55,maxW,110,10);
      bc.add(bg);

      const txt=this.add.text(0,0,"",{
        fontFamily:"Arial",fontSize:"13px",color:"#e0e0e0",
        wordWrap:{width:maxW-20},align:"center"
      }).setOrigin(0.5,0.5);
      bc.add(txt);

      this.tweens.add({ targets:bc,scaleX:1,scaleY:1,duration:200,ease:"Back.easeOut" });

      let i=0;
      const tw=this.time.addEvent({ delay:25,repeat:msg.length-1,
        callback:()=>{ i++; txt.setText(msg.substring(0,i)); } });

      const dismiss=()=>{
        tw.remove();
        if(this._autoTimer){this._autoTimer.remove();this._autoTimer=null;}
        this.input.off("pointerdown",dismiss);
        if(!bc.active) return;
        this.tweens.add({ targets:bc,alpha:0,duration:200,
          onComplete:()=>{ if(bc.active)bc.destroy(); this._bubble=null; resolve(); } });
      };
      this._autoTimer=this.time.delayedCall(msg.length*25+3000, dismiss);
      this.input.once("pointerdown",dismiss);
    });
  }

  // ── Tutorial ────────────────────────────────────────────────────────────────
  runTutorial() {
    const ov=this.add.graphics().setDepth(50);
    ov.fillStyle(0x000000); ov.fillRect(0,0,W,H);
    this.tweens.add({ targets:ov,alpha:0,duration:800, onComplete:async()=>{
      ov.destroy();
      this.createStations([0,1,2,3,4]);
      this._stations.forEach(s=>this._setStationState(s,"unvisited"));
      this.createTrain();
      this.trainContainer.setPosition(this._stations[0].x-80, TRAIN_Y);

      await this._bitIn();
      await this.showBitMsg("Welcome, Engineer! I'm Bit. This train runs on Loop Power. Let me show you how a for loop controls the train!");

      this._monTexts.init.setText("int i = 0");
      this._setStationState(this._stations[0],"current");
      await this.showBitMsg("INITIALIZATION — we set counter i to 0. That's the starting station!");

      this._monTexts.cond.setText("i < 4");
      await this.showBitMsg("CONDITION — the train keeps running as long as i is less than 4!");

      this._monTexts.upd.setText("i++");
      await this.showBitMsg("UPDATE — after each stop, i increases by 1, moving to the next station!");

      await this.showBitMsg("Now watch the loop run!");
      await this._tutorialLoop();

      await this._bitIn();
      await this.showBitMsg("Your turn, Engineer! Configure the loop to complete each mission. Good luck!");
      await this._bitOut();
      localStorage.setItem("level16_tutorial_done","1");
      this.startRound(0);
    }});
  }

  async _tutorialLoop() {
    for(let iter=0;iter<4;iter++){
      const sd=this._stations.find(s=>s.index===iter);
      if(!sd) continue;
      this.floatText(W/2,320,`i = ${iter}`,"#00e5ff","hold");
      await this._condAnim(`${iter} < 4`,true);
      this._setStationState(sd,"current");
      await this.moveTrain(sd.x,false);
      this._setStationState(sd,"visited");
      await this.dropCargo(sd.x);
      this.floatText(sd.x,310,"i++","#00e676","up");
      await this._delay(600);
    }
    this.floatText(W/2,320,"i = 4","#00e5ff","hold");
    await this._condAnim("4 < 4",false);
    await this._bitIn();
    await this.showBitMsg("The condition is FALSE! The loop STOPS.");
    this._showBanner("LOOP COMPLETE","#ffd740",0xffd740);
    await this._delay(2500);
  }

  _condAnim(expr,pass) {
    return new Promise(resolve=>{
      const t=this.add.text(W/2,290,`${expr} ?`,{
        fontFamily:"Arial",fontSize:"16px",color:"#ffffff"
      }).setOrigin(0.5,0.5).setDepth(10);

      this.time.delayedCall(400,()=>{
        const ic=this.add.text(W/2+80,290,pass?"✅":"❌",{
          fontFamily:"Arial",fontSize:"20px"
        }).setOrigin(0.5,0.5).setScale(0).setDepth(10);

        this.tweens.add({ targets:ic,scaleX:1,scaleY:1,duration:200 });
        if(!pass) this.tweens.add({ targets:ic,x:ic.x+5,duration:50,yoyo:true,repeat:5 });

        this.time.delayedCall(700,()=>{
          this.tweens.add({ targets:[t,ic],alpha:0,duration:200,
            onComplete:()=>{ t.destroy();ic.destroy();resolve(); } });
        });
      });
    });
  }

  _showBanner(msg,txtColor,borderHex) {
    const b=this.add.container(W/2,-50).setDepth(20);
    const bg=this.add.graphics();
    bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(-130,-22,260,44,8);
    bg.lineStyle(2,borderHex); bg.strokeRoundedRect(-130,-22,260,44,8);
    b.add(bg);
    b.add(this.add.text(0,0,msg,{fontFamily:"Arial",fontSize:"20px",fontStyle:"bold",color:txtColor}).setOrigin(0.5,0.5));
    this.tweens.add({ targets:b,y:180,duration:600,ease:"Bounce.easeOut",
      onComplete:()=>this.time.delayedCall(1800,()=>{
        this.tweens.add({ targets:b,alpha:0,duration:400,onComplete:()=>b.destroy() });
      }) });
  }

  // ── Gameplay ────────────────────────────────────────────────────────────────
  startRound(idx) {
    this._clearRound();
    if(idx>=ROUNDS.length){ this.levelComplete(); return; }

    this.currentRound=idx;
    this.playerAnswers={};
    this.currentBlankIndex=0;
    this.isRunning=false;
    this._awaitingCondValAfterOp=null;
    this.roundStartTime=this.time.now;

    const cfg=ROUNDS[idx];
    this._conditionOp=cfg.correctValues.condition_op; // default; player may override
    this._currentRoundCfg=cfg;

    this.createStations(cfg.stations);
    this._stations.forEach(s=>this._setStationState(s,"unvisited"));

    if(!this.trainContainer||!this.trainContainer.active) this.createTrain();
    const firstSt=this._stationXMap[cfg.stations[0]];
    this.trainContainer.setPosition((firstSt?firstSt.x:80)-80, TRAIN_Y);
    this.trainContainer.setScale(1,1);
    this._startTrainIdle();

    this._refreshMonitor(cfg);
    this._showMissionCard(cfg);
  }

  _showMissionCard(cfg) {
    const c=this.add.container(W+220,130).setDepth(5);
    this._roundEls.push(c);
    const bg=this.add.graphics();
    bg.fillStyle(0x1a1a2e); bg.fillRoundedRect(-210,-48,420,96,12);
    bg.fillStyle(0xffd740); bg.fillRect(-210,-48,5,96);
    bg.lineStyle(1,0x2a2a4a); bg.strokeRoundedRect(-210,-48,420,96,12);
    c.add(bg);
    c.add(this.add.text(-196,-36,`ROUND ${cfg.round}/10`,{fontFamily:"Arial",fontSize:"10px",fontStyle:"bold",color:"#78909c"}));
    c.add(this.add.text(-196,-18,cfg.mission,{fontFamily:"Arial",fontSize:"13px",color:"#e0e0e0",wordWrap:{width:385}}));

    this.tweens.add({ targets:c,x:W/2,duration:400,ease:"Back.easeOut",
      onComplete:()=>this.time.delayedCall(500,()=>{
        this.tweens.add({ targets:c,x:W-215,y:130,duration:280,
          onComplete:()=>this._nextBubbles(cfg) });
      }) });
  }

  _nextBubbles(cfg) {
    const blanks=cfg.blanks;
    if(this.currentBlankIndex>=blanks.length){ this._showRun(); return; }

    const blankKey=blanks[this.currentBlankIndex];

    // For condition_value with conditionOptions: show operator bubbles first
    if(blankKey==="condition_value" && cfg.conditionOptions){
      this._awaitingCondValAfterOp={ blankKey, options:cfg.options[blankKey]||[], cfg };
      this._spawnBubbles("condition_op", cfg.conditionOptions, cfg);
    } else {
      this._spawnBubbles(blankKey, cfg.options[blankKey]||[], cfg);
    }
  }

  _spawnBubbles(blankKey, options, cfg) {
    this._bubbleGroup.forEach(b=>b&&b.destroy());
    this._bubbleGroup=[];

    const totalW=(options.length)*88;
    const x0=W/2-totalW/2+44;

    options.forEach((opt,i)=>{
      const bx=x0+i*88;
      const bc=this.add.container(bx, H).setDepth(8);
      this._bubbleGroup.push(bc);
      this._roundEls.push(bc);

      const bg=this.add.graphics();
      bg.fillStyle(0x1e1e3a); bg.fillRoundedRect(-34,-17,68,34,17);
      bg.lineStyle(1,0x00e5ff); bg.strokeRoundedRect(-34,-17,68,34,17);
      bc.add(bg);
      bc.add(this.add.text(0,0,String(opt),{
        fontFamily:"Courier New",fontSize:"14px",fontStyle:"bold",color:"#00e5ff"
      }).setOrigin(0.5,0.5));

      const settleY=490+i*3;
      this.tweens.add({ targets:bc,y:settleY,duration:450,ease:"Back.easeOut",delay:i*60,
        onComplete:()=>{
          this.tweens.add({ targets:bc,y:settleY+4,
            duration:1800+i*200,ease:"Sine.easeInOut",yoyo:true,repeat:-1 });
        }
      });

      bc.setInteractive(new Phaser.Geom.Rectangle(-34,-17,68,34),Phaser.Geom.Rectangle.Contains);
      bc.on("pointerover",()=>{ this.tweens.add({targets:bc,scaleX:1.1,scaleY:1.1,duration:120}); });
      bc.on("pointerout", ()=>{ this.tweens.add({targets:bc,scaleX:1,scaleY:1,duration:120}); });
      bc.on("pointerdown",()=>{ if(!this.isRunning) this._onBubble(blankKey,opt,cfg); });
    });
  }

  _onBubble(blankKey, value, cfg) {
    // Fade all current bubbles
    this._bubbleGroup.forEach(b=>{
      this.tweens.killTweensOf(b);
      this.tweens.add({ targets:b,alpha:0,duration:180,onComplete:()=>b.destroy() });
    });
    this._bubbleGroup=[];

    this.playerAnswers[blankKey]=value;

    if(blankKey==="condition_op"){
      this._conditionOp=value;
      this._refreshMonitor(cfg);
      // Now show condition_value bubbles
      if(this._awaitingCondValAfterOp){
        const {blankKey:vk,options:vo,cfg:vc}=this._awaitingCondValAfterOp;
        this._awaitingCondValAfterOp=null;
        this.time.delayedCall(280,()=>this._spawnBubbles(vk,vo,vc));
      }
      return;
    }

    this._refreshMonitor(cfg);
    this.currentBlankIndex++;

    if(this.currentBlankIndex>=cfg.blanks.length){
      this.time.delayedCall(280,()=>this._showRun());
    } else {
      this.time.delayedCall(280,()=>this._nextBubbles(cfg));
    }
  }

  _showRun() {
    if(this._runBtn) this._runBtn.destroy();
    const btn=this.add.container(W/2,115).setDepth(10);
    this._runBtn=btn; this._roundEls.push(btn);

    const glow=this.add.graphics();
    glow.fillStyle(0x00e676,0.12); glow.fillRoundedRect(-62,-21,124,42,21);
    btn.add(glow);
    this.tweens.add({ targets:glow,alpha:0.32,duration:800,yoyo:true,repeat:-1 });

    const bg=this.add.graphics();
    bg.fillStyle(0x00e676); bg.fillRoundedRect(-58,-18,116,36,18);
    btn.add(bg);
    btn.add(this.add.text(0,0,"▶ RUN",{fontFamily:"Arial",fontSize:"15px",fontStyle:"bold",color:"#0a0a1a"}).setOrigin(0.5,0.5));

    btn.setInteractive(new Phaser.Geom.Rectangle(-58,-18,116,36),Phaser.Geom.Rectangle.Contains);
    btn.on("pointerover",()=>this.tweens.add({targets:btn,scaleX:1.05,scaleY:1.05,duration:100}));
    btn.on("pointerout", ()=>this.tweens.add({targets:btn,scaleX:1,scaleY:1,duration:100}));
    btn.on("pointerdown",()=>{
      if(this.isRunning) return;
      this.tweens.add({ targets:btn,scaleX:0.93,scaleY:0.93,duration:75,yoyo:true });
      this.time.delayedCall(150,()=>this._run());
    });
  }

  _run() {
    if(this.isRunning) return;
    this.isRunning=true;
    if(this._runBtn) this._runBtn.disableInteractive();
    this._bubbleGroup.forEach(b=>b&&b.destroy()); this._bubbleGroup=[];
    this.executeLoop(ROUNDS[this.currentRound]);
  }

  // ── Loop execution ───────────────────────────────────────────────────────────
  async executeLoop(cfg) {
    const cv=cfg.correctValues;
    const initVal = this.playerAnswers.init_value!==undefined ? Number(this.playerAnswers.init_value) : cv.init_value;
    const condOp  = this.playerAnswers.condition_op || this._conditionOp || cv.condition_op;
    const condVal = this.playerAnswers.condition_value!==undefined ? Number(this.playerAnswers.condition_value) : cv.condition_value;
    const updExpr = this.playerAnswers.update || cv.update;

    const check=i=>{ if(condOp==="<")return i<condVal; if(condOp==="<=")return i<=condVal;
                     if(condOp===">")return i>condVal; if(condOp===">=")return i>=condVal; return false; };
    const apply=i=>{ if(updExpr==="i++")return i+1; if(updExpr==="i--")return i-1;
                     if(updExpr==="i += 2")return i+2; if(updExpr==="i += 3")return i+3;
                     if(updExpr==="i -= 2")return i-2; return i+1; };

    const isRev=updExpr==="i--"||updExpr==="i -= 2";
    if(isRev) this.trainContainer.setScale(-1,1);

    const visited=[];
    let i=initVal, iter=0;

    while(check(i)&&iter<20){
      this.floatText(W/2,330,`i = ${i}`,"#00e5ff","hold");
      await this._condAnim(`${i} ${condOp} ${condVal}`,true);

      if(iter===0) this._flashMonPart("init");
      this._flashMonPart("condition");

      const sd=this._stationXMap[i];
      if(sd){
        this._setStationState(sd,"current");
        await this.moveTrain(sd.x, isRev);
        this._setStationState(sd,"visited");
        await this.dropCargo(sd.x);
        visited.push(i);
      }

      this._flashMonPart("update");
      const label=updExpr==="i--"||updExpr==="i -= 2" ? (updExpr==="i--"?"-1":"-2") : (updExpr==="i++"?"+1":updExpr==="i += 2"?"+2":"+3");
      this.floatText(sd?sd.x:W/2, 315, label, isRev?"#ff8f00":"#00e676","up");
      await this._delay(280);
      i=apply(i); iter++;
    }

    // Exit condition flash
    this.floatText(W/2,330,`i = ${i}`,"#00e5ff","hold");
    if(iter<20) await this._condAnim(`${i} ${condOp} ${condVal}`,false);

    // Evaluate
    const exp=cfg.stations;
    const ok=visited.length===exp.length && visited.every((v,k)=>v===exp[k]);

    if(ok){ await this.onCorrect(); }
    else   { await this.onWrong(this._errType(visited,exp,initVal,updExpr,iter)); }
  }

  _errType(visited,expected,initVal,updExpr,iter){
    if(iter>=20) return "infinite_loop";
    if(visited.length>0&&visited[0]!==expected[0]) return "wrong_start";
    if(visited.length<expected.length) return "too_few";
    if(visited.length>expected.length) return "too_many";
    const isRev=updExpr==="i--"||updExpr==="i -= 2";
    if(isRev!==(expected.length>1&&expected[1]<expected[0])) return "wrong_direction";
    return "wrong_step";
  }

  // ── Results ─────────────────────────────────────────────────────────────────
  async onCorrect() {
    this.correctFirstTryCount++;
    this.totalRoundTime+=(this.time.now-this.roundStartTime)/1000;
    this._stations.forEach(s=>{
      if(s.state==="visited")
        this.tweens.add({ targets:s.container,alpha:0.5,duration:130,yoyo:true,repeat:3 });
    });
    this.createConfetti(W/2,340);

    this.combo++;
    if(this.combo>this.highestCombo) this.highestCombo=this.combo;
    this._updateCombo();

    const earned=Math.floor(100*this.scoreMultiplier);
    this.score+=earned;
    this._animateScore(this.score);

    const banner=this.add.text(W/2,H/2,"✓ CORRECT",{
      fontFamily:"Arial",fontSize:"30px",fontStyle:"bold",color:"#00e676"
    }).setOrigin(0.5,0.5).setScale(0).setDepth(30);
    this.tweens.add({ targets:banner,scaleX:1.2,scaleY:1.2,duration:200,
      onComplete:()=>{ this.tweens.add({ targets:banner,scaleX:1,scaleY:1,duration:100 });
        this.time.delayedCall(700,()=>this.tweens.add({ targets:banner,alpha:0,duration:280,onComplete:()=>banner.destroy() })); } });

    await this._delay(1400);
    this.startRound(this.currentRound+1);
  }

  async onWrong(errType) {
    this.combo=0; this._updateCombo();
    this._loseLife();

    if(errType==="infinite_loop"){
      for(let b=0;b<3;b++){
        await this.moveTrain(this.trainContainer.x-50,false);
        await this.moveTrain(this.trainContainer.x+50,false);
      }
      const w=this.add.text(W/2,H/2-30,"⚠ INFINITE LOOP!",{
        fontFamily:"Arial",fontSize:"24px",fontStyle:"bold",color:"#f44336"
      }).setOrigin(0.5,0.5).setDepth(30);
      this.tweens.add({ targets:w,alpha:0.3,duration:350,yoyo:true,repeat:3,onComplete:()=>w.destroy() });
    } else if(errType==="too_many"){
      this.cameras.main.shake(300,0.004);
      const ov=this.add.graphics().setDepth(29);
      ov.fillStyle(0xf44336,0.2); ov.fillRect(0,0,W,H);
      this.tweens.add({ targets:ov,alpha:0,duration:400,onComplete:()=>ov.destroy() });
    }

    if(this.lives<=0){ await this._delay(400); this.gameOver(); return; }

    await this._bitIn();
    await this.showBitMsg(FEEDBACK[errType]||FEEDBACK.wrong_step);
    await this._bitOut();
    await this._delay(350);
    this.startRound(this.currentRound);
  }

  _loseLife() {
    const idx=this.lives-1;
    this.lives--;
    if(idx>=0&&this._lifeInds[idx]){
      const g=this._lifeInds[idx];
      this.tweens.add({ targets:g,alpha:0.15,duration:280 });
      g.clear(); g.fillStyle(0x424242,0.15); g.fillRoundedRect(0,0,18,9,3);
    }
  }

  gameOver() {
    const ov=this.add.graphics().setDepth(50);
    ov.fillStyle(0x000000,0.82); ov.fillRect(0,0,W,H);
    this.add.text(W/2,H/2-70,"GAME OVER",{fontFamily:"Arial",fontSize:"42px",fontStyle:"bold",color:"#f44336"}).setOrigin(0.5,0.5).setDepth(51);
    this.add.text(W/2,H/2-20,`Score: ${this.score}`,{fontFamily:"Arial",fontSize:"22px",color:"#ffffff"}).setOrigin(0.5,0.5).setDepth(51);
    const rb=this.add.container(W/2,H/2+50).setDepth(51);
    const bg=this.add.graphics(); bg.fillStyle(0x00e676); bg.fillRoundedRect(-60,-18,120,36,18); rb.add(bg);
    rb.add(this.add.text(0,0,"RETRY",{fontFamily:"Arial",fontSize:"16px",fontStyle:"bold",color:"#0a0a1a"}).setOrigin(0.5,0.5));
    rb.setInteractive(new Phaser.Geom.Rectangle(-60,-18,120,36),Phaser.Geom.Rectangle.Contains);
    rb.on("pointerdown",()=>this.scene.restart());
  }

  levelComplete() {
    this.totalRoundTime+=(this.time.now-this.roundStartTime)/1000;
    const accuracy=this.correctFirstTryCount/10;
    const stars=accuracy>=0.9?3:accuracy>=0.7?2:1;
    const livesBonus=this.lives*200;
    const total=this.score+livesBonus;
    console.log("Level 16 complete",{level:16,score:total,accuracy,avgTime:this.totalRoundTime/10,comboMax:this.highestCombo,stars,livesRemaining:this.lives,timestamp:Date.now()});

    // Final station
    const fs=this.add.container(720,ST_SY).setDepth(5);
    const fg=this.add.graphics();
    fg.fillStyle(0x1a1a2e); fg.fillRoundedRect(-38,-96,76,96,4);
    fg.lineStyle(3,0xffd740); fg.strokeRoundedRect(-38,-96,76,96,4);
    fs.add(fg);
    fs.add(this.add.text(0,-48,"★",{fontFamily:"Arial",fontSize:"26px",color:"#ffd740"}).setOrigin(0.5,0.5));
    this.tweens.add({ targets:fs,y:fs.y-2,duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut" });

    this.moveTrain(720,false).then(()=>this._endScreen(total,livesBonus,stars));
  }

  _endScreen(total,livesBonus,stars) {
    const ov=this.add.graphics().setDepth(60);
    ov.fillStyle(0x000000,0); ov.fillRect(0,0,W,H);
    this.tweens.add({ targets:ov,alpha:0.85,duration:600 });

    const c=this.add.container(W/2,H/2).setDepth(61).setAlpha(0);
    this.tweens.add({ targets:c,alpha:1,duration:600,delay:400 });

    c.add(this.add.text(0,-220,"LEVEL COMPLETE!",{fontFamily:"Arial",fontSize:"32px",fontStyle:"bold",color:"#ffd740"}).setOrigin(0.5,0.5));

    const lines=[
      {txt:`Base Score: ${this.score}`,col:"#ffffff",d:300},
      {txt:`Lives Bonus: +${livesBonus}`,col:"#00e5ff",d:600},
      {txt:"──────────────",col:"#ffffff",d:900},
      {txt:`TOTAL: ${total}`,col:"#ffd740",d:1200,big:true},
    ];
    lines.forEach((l,i)=>{
      const t=this.add.text(0,-160+i*38,l.txt,{
        fontFamily:"Arial",fontSize:l.big?"22px":"17px",fontStyle:l.big?"bold":"normal",color:l.col
      }).setOrigin(0.5,0.5).setAlpha(0);
      c.add(t);
      this.time.delayedCall(l.d,()=>this.tweens.add({ targets:t,alpha:1,duration:280 }));
    });

    for(let s=0;s<3;s++){
      const st=this.add.text(-50+s*50,40,"★",{
        fontFamily:"Arial",fontSize:"36px",color:s<stars?"#ffd740":"#424242"
      }).setOrigin(0.5,0.5).setScale(0);
      c.add(st);
      this.time.delayedCall(1600+s*180,()=>
        this.tweens.add({ targets:st,scaleX:1.3,scaleY:1.3,duration:130,
          onComplete:()=>this.tweens.add({ targets:st,scaleX:1,scaleY:1,duration:90 }) }));
    }

    c.add(this.add.text(0,140,"🔄 FOR LOOP SCHEMA ACQUIRED",{fontFamily:"Arial",fontSize:"12px",color:"#ffd740"}).setOrigin(0.5,0.5));

    const mkBtn=(x,lbl,col,cb)=>{
      const b=this.add.container(x,195);
      const w2=lbl.length*8+30;
      const bg=this.add.graphics();
      bg.fillStyle(col); bg.fillRoundedRect(-w2/2,-17,w2,34,17);
      b.add(bg);
      b.add(this.add.text(0,0,lbl,{fontFamily:"Arial",fontSize:"13px",fontStyle:"bold",
        color:col===0x00e676?"#0a0a1a":"#ffffff"}).setOrigin(0.5,0.5));
      b.setInteractive(new Phaser.Geom.Rectangle(-w2/2,-17,w2,34),Phaser.Geom.Rectangle.Contains);
      b.on("pointerdown",cb); c.add(b);
    };
    mkBtn(-90,"RETRY",0x546e7a,()=>this.scene.restart());
    mkBtn(70,"NEXT →",0x00e676,()=>{ if(this.scene.get("Level17Scene"))this.scene.start("Level17Scene"); else console.log("Level17Scene not yet registered."); });
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  async dropCargo(x) {
    return new Promise(resolve=>{
      const cg=this.add.graphics();
      cg.fillStyle(0x8d6e63); cg.fillRoundedRect(-9,-9,18,18,3);
      cg.lineStyle(1,0xffd740); cg.strokeRoundedRect(-9,-9,18,18,3);
      cg.setPosition(x, ST_SY-90);
      this.tweens.add({ targets:cg,y:ST_SY-30,duration:280,ease:"Bounce.easeOut",
        onComplete:()=>this.time.delayedCall(350,()=>{
          this.tweens.add({ targets:cg,alpha:0,duration:250,onComplete:()=>{ cg.destroy();resolve(); } });
        }) });
    });
  }

  createConfetti(x,y) {
    const em=this.add.particles(x,y,"particle",{
      speed:{min:80,max:220}, angle:{min:0,max:360}, gravityY:120,
      lifespan:1400, scale:{start:3.5,end:0}, alpha:{start:1,end:0},
      tint:[0x00e5ff,0x00e676,0xffd740,0xff4081], emitting:false
    });
    em.explode(45);
    this.time.delayedCall(1800,()=>em.destroy());
  }

  floatText(x,y,txt,color,dir) {
    const t=this.add.text(x,y,txt,{fontFamily:"Arial",fontSize:"16px",fontStyle:"bold",color})
      .setOrigin(0.5,0.5).setDepth(20);
    if(dir==="up")
      this.tweens.add({ targets:t,y:y-38,alpha:0,duration:650,onComplete:()=>t.destroy() });
    else
      this.tweens.add({ targets:t,alpha:0,duration:1100,delay:750,onComplete:()=>t.destroy() });
    return t;
  }

  _delay(ms){ return new Promise(r=>this.time.delayedCall(ms,r)); }

  _clearRound() {
    this._roundEls.forEach(el=>{ if(el&&el.active){ this.tweens.killTweensOf(el); el.destroy(); } });
    this._roundEls=[];
    this._bubbleGroup=[];
    if(this._runBtn){ this._runBtn.destroy(); this._runBtn=null; }
  }
}
