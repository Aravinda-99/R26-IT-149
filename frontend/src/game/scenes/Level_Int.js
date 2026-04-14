import Phaser from "phaser";

export class Level_Int extends Phaser.Scene {
  constructor() {
    super({ key: "Level_Int" });
  }

  preload() {
    // Preload custom assets required by the Game Flow
    this.load.image("robot", "/assets/images/robot.png");
    this.load.image("crate_whole", "/assets/images/crate_whole.png");
    this.load.image("crate_broken", "/assets/images/crate_broken.png");
  }

  create() {
    // 1. GAME STATE ENGINE
    this.gameState = {
      currentLevel: 1,
      score: 0,
      lives: 3,
      progress: 0,
      isMastered: false,
      collectedL1: 0 // Secondary tracking metric for Level 1 constraint
    };

    this.isTransitioning = false;
    this.isInstructionShowing = false;

    // Background
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // Physics Groups
    this.wholeCrates = this.physics.add.group();
    this.brokenCrates = this.physics.add.group();

    // Setup World Bounds
    this.physics.world.setBounds(0, 0, 800, 600);

    // Player (Robot)
    this.player = this.physics.add.sprite(400, 550, "robot");
    this._fitSpriteToHeight(this.player, 72);
    this.player.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(false);
    this.player.setImmovable(true);

    // Input Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // 2. UI & HUD ELEMENTS (Always Visible)
    this._createHUD();

    // Particles for success (fallback generated texture if absent)
    this._generateSparkTexture();
    this.successParticles = this.add.particles(0, 0, 'spark', { 
        speed: { min: 50, max: 200 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        emitting: false
    });

    // Boot Level 1 immediately
    this._startLevel(1);
    
    // Core Physics Collisions/Overlaps
    this.physics.add.overlap(this.player, this.wholeCrates, this._catchWholeCrate, null, this);
    this.physics.add.overlap(this.player, this.brokenCrates, this._catchBrokenCrate, null, this);
  }

  update(time, delta) {
    if (this.isTransitioning || this.isInstructionShowing || this.gameState.lives <= 0 || this.gameState.isMastered) {
      if (this.player.body) this.player.setVelocityX(0); // Stop sliding during UI blocking
      return;
    }

    // Smooth movement logic
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-450);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(450);
    } else {
      this.player.setVelocityX(0); 
    }

    // Clean up fallen rigidbodies off-screen
    this.wholeCrates.getChildren().forEach(crate => {
        if (crate.y > 650) crate.destroy();
    });
    this.brokenCrates.getChildren().forEach(crate => {
        if (crate.y > 650) crate.destroy();
    });
  }

  // ---------------------------------------------------------------------------
  // INSTRUCTION UI OVERLAY
  // ---------------------------------------------------------------------------

  showLevelInstruction(title, description, buttonText, onStartAction, codeSnippet = null, subDescription = null) {
    this.isInstructionShowing = true;
    
    // Dim Background Overlay
    const overlayBg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(200);
    
    // Futuristic Panel
    const panelHeight = codeSnippet ? 540 : 400;
    const panel = this.add.rectangle(400, 300, 650, panelHeight, 0x111122, 1).setDepth(201);
    panel.setStrokeStyle(4, 0x38bdf8);
    
    // Glowing Title
    const titleY = codeSnippet ? 90 : 160;
    const titleText = this.add.text(400, titleY, title, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "36px",
      color: "#38bdf8",
      fontStyle: "bold",
      align: "center",
      shadow: { blur: 15, color: "#38bdf8", fill: true }
    }).setOrigin(0.5).setDepth(202);

    // Description text
    const descY = codeSnippet ? 160 : 260;
    const descText = this.add.text(400, descY, description, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "24px",
      color: "#cbd5e1",
      align: "center",
      wordWrap: { width: 550, useAdvancedWrap: true },
      lineSpacing: 10
    }).setOrigin(0.5).setDepth(202);

    const elementsToDestroy = [overlayBg, panel, titleText, descText];

    if (codeSnippet) {
       const codeBg = this.add.rectangle(400, 275, 520, 110, 0x0f172a, 1).setDepth(202);
       codeBg.setStrokeStyle(2, 0x4ade80);
       const codeText = this.add.text(400, 275, codeSnippet, {
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#4ade80",
          align: "left",
          lineSpacing: 8
       }).setOrigin(0.5).setDepth(203);
       elementsToDestroy.push(codeBg, codeText);
    }

    if (subDescription) {
       const subText = this.add.text(400, 400, subDescription, {
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "22px",
          color: "#fbbf24",
          align: "center",
          wordWrap: { width: 550, useAdvancedWrap: true },
          fontStyle: "bold"
       }).setOrigin(0.5).setDepth(202);
       elementsToDestroy.push(subText);
    }

    // Start Button
    const btnY = codeSnippet ? 500 : 420;
    const startBtn = this._createInteractiveButton(400, btnY, buttonText, () => {
      // Clean up overlay elements
      elementsToDestroy.forEach(e => e.destroy());
      startBtn.destroy();
      
      // Unpause game
      this.isInstructionShowing = false;
      onStartAction();
    }, 202);
  }

  // ---------------------------------------------------------------------------
  // THE 3-PHASE SCHEMA THEORY FLOW
  // ---------------------------------------------------------------------------

  _startLevel(level) {
    this.gameState.currentLevel = level;
    this.isTransitioning = false;
    
    // Erase old artifacts to ensure clean starts
    this._clearCrates();
    
    // Purge old spawn loops
    if (this.spawnTimer) this.spawnTimer.remove();

    if (level === 1) {
      this.showLevelInstruction(
        "MISSION 1: ACCRETION", 
        "Integers (int) are whole numbers used for counting items like cargo crates. Catch 5 whole crates to initialize your knowledge.", 
        "I'm Ready!", 
        () => {
          this.levelText.setText("Level 1: Accretion - Meet the Integers (int)");
          this.spawnTimer = this.time.addEvent({ delay: 1500, callback: this._spawnCrateL1, callbackScope: this, loop: true });
        }
      );
    } 
    else if (level === 2) {
      this.showLevelInstruction(
        "MISSION 2: TUNING", 
        "Warning! 'int' variables cannot store decimal values. Catch the whole crates and DODGE the broken decimal crates (e.g., 2.5). Catching a decimal will damage your robot!", 
        "Start Mission", 
        () => {
          this.levelText.setText("Level 2: Tuning - Fix the Data Mismatch!");
          this.spawnTimer = this.time.addEvent({ delay: 1000, callback: this._spawnCrateL2, callbackScope: this, loop: true });
        }
      );
    } 
    else if (level === 3) {
      this.showLevelInstruction(
        "FINAL MISSION: LOGIC RESTRUCTURING", 
        "To unlock the final gate, you must solve this integer logic:", 
        "I solved it! Start Mission", 
        () => {
          this.levelText.setText("Level 3: Restructuring - Logic Application\nint goal = 10; int held = 6; int pick = ?;");
          this.spawnTimer = this.time.addEvent({ delay: 1200, callback: this._spawnCrateL3, callbackScope: this, loop: true });
        },
        "int target_cargo = 10;\nint current_cargo = 6;\nint missing_crates = target_cargo - current_cargo;",
        "Your Mission: Catch ONLY the crate that represents the value of 'missing_crates'.\n(Hint: 10 - 6 = ?)"
      );
    }
  }

  _levelComplete(level) {
    this.isTransitioning = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.player.setVelocityX(0);
    this._clearCrates();

    if (level === 1) {
      this._updateProgress(33);
      this._showTransitionPopup("LEVEL 1 COMPLETE: CONCEPT LEARNED!", "PLAY LEVEL 2", () => {
        this._startLevel(2);
      });
    } 
    else if (level === 2) {
      this._updateProgress(66);
      this._showTransitionPopup("LEVEL 2 COMPLETE: SCHEMA REFINED!", "FINAL CHALLENGE", () => {
        this._startLevel(3);
      });
    }
  }

  _gameMastered() {
    this.gameState.isMastered = true;
    this.isTransitioning = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.player.setVelocityX(0);
    this._clearCrates();
    this._updateProgress(100);

    // Massive particle explosion
    this.successParticles.emitParticleAt(400, 300, 200);
    this.cameras.main.flash(600, 255, 255, 255);

    // Final Screen Overlay
    this.overlayBg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(300);

    // Master of Integers High-Quality Badge (Generated Graphic rendering Gold)
    const badge = this.add.graphics().setDepth(301);
    badge.fillStyle(0xffd700, 1);
    badge.fillCircle(400, 200, 65);
    badge.lineStyle(6, 0xffaa00, 1);
    badge.strokeCircle(400, 200, 65);
    this.add.text(400, 200, "★", { fontSize: "68px", color: "#ffffff" }).setOrigin(0.5).setDepth(301);

    this.add.text(400, 320, "MASTER OF INTEGERS", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "48px",
      color: "#ffd700",
      fontStyle: "bold",
      align: "center",
      shadow: { blur: 15, color: "#ffaa00", fill: true }
    }).setOrigin(0.5).setDepth(301);

    this.add.text(400, 380, "CONGRATULATIONS: MASTERED", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "28px",
      color: "#4ade80",
      align: "center"
    }).setOrigin(0.5).setDepth(301);

    this._createInteractiveButton(400, 480, "RESTART MODULE", () => {
        this.scene.restart();
    }, 301);
  }

  _gameOver() {
    this.isTransitioning = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.player.setVelocityX(0);
    this._clearCrates();

    this._showTransitionPopup("GAME OVER\nZero Lives Remaining.", "RETRY LEVEL", () => {
        this.scene.restart(); // Restart entirely back to level 1 for penalty compliance
    }, "#ef4444");
  }

  // ---------------------------------------------------------------------------
  // COLLISION LOGIC DETAILED
  // ---------------------------------------------------------------------------

  _catchWholeCrate(player, crate) {
    if (this.isTransitioning || this.isInstructionShowing) return;
    
    this.successParticles.emitParticleAt(crate.x, crate.y, 25);
    const value = crate.getData('val');
    crate.destroy();
    
    // Action branches based on active Phase
    if (this.gameState.currentLevel === 1) {
      // ACCRETION: Goal collect 5 crates. Only Whole spawn.
      this.gameState.collectedL1++;
      this._flashText(this.scoreText, "#4ade80");
      if (this.gameState.collectedL1 >= 5) {
        this._levelComplete(1);
      }
    } 
    else if (this.gameState.currentLevel === 2) {
      // TUNING: Catching Whole yields 50 pts
      this.gameState.score += 50;
      this.scoreText.setText(`Score: ${this.gameState.score}`);
      this._flashText(this.scoreText, "#4ade80");

      if (this.gameState.score >= 300) {
        this._levelComplete(2);
      }
    }
    else if (this.gameState.currentLevel === 3) {
      // RESTRUCTURING: Exact match logic puzzle
      if (value === 4) {
        this._gameMastered();
      } else {
        this._handleError(`Logic Error: You caught int ${value}, but needed int 4!`);
      }
    }
  }

  _catchBrokenCrate(player, crate) {
    if (this.isTransitioning || this.isInstructionShowing) return;
    crate.destroy();

    // Catching float ALWAYS triggers penalty
    if (this.gameState.currentLevel === 3) {
      this._handleError("ERROR: Cannot pick double/float in an int operation!");
    } else {
      this._handleError("ERROR: cannot assign float to int!");
    }
  }

  _handleError(msg) {
    this.cameras.main.shake(250, 0.015);
    this.cameras.main.flash(200, 255, 0, 0);

    this.errorText.setText(msg);
    this.errorText.setAlpha(1);
    this.tweens.add({ targets: this.errorText, alpha: 0, duration: 2500, delay: 600 });

    this.gameState.lives--;
    this.livesText.setText(`Lives: ${this.gameState.lives}`);
    this._flashText(this.livesText, "#ef4444");

    if (this.gameState.lives <= 0) {
      this._gameOver();
    }
  }

  // ---------------------------------------------------------------------------
  // SPAWNER MECHANICS
  // ---------------------------------------------------------------------------

  _spawnCrateL1() {
    this._spawnDetailedCrate(true); // Only whole objects
  }

  _spawnCrateL2() {
    const isWhole = Phaser.Math.Between(0, 1) === 0;
    this._spawnDetailedCrate(isWhole);
  }

  _spawnCrateL3() {
    // Array predefined logic constraints: '4' is the answer block.
    const pool = [2, 4, 8, 1.5];
    const val = Phaser.Utils.Array.GetRandom(pool);
    const isWhole = Number.isInteger(val);
    this._spawnDetailedCrate(isWhole, val);
  }

  _spawnDetailedCrate(isWhole, specificValue = null) {
    const x = Phaser.Math.Between(50, 750);
    let crate, valText;

    if (isWhole) {
      crate = this.wholeCrates.create(x, -60, "crate_whole");
      this._fitSpriteToHeight(crate, 56);
      const val = specificValue !== null ? specificValue : Phaser.Math.Between(1, 99);
      crate.setData('val', val);
      valText = val.toString();
    } else {
      crate = this.brokenCrates.create(x, -60, "crate_broken");
      this._fitSpriteToHeight(crate, 56);
      const val = specificValue !== null ? specificValue : parseFloat((Phaser.Math.FloatBetween(1.1, 9.9)).toFixed(2));
      crate.setData('val', val);
      valText = val.toString();
    }

    crate.body.setAllowGravity(true);
    crate.setVelocityX(Phaser.Math.Between(-25, 25));
    crate.setAngularVelocity(Phaser.Math.Between(-30, 30));

    // Dynamic Text Anchor tied to physics object 
    const textObj = this.add.text(x, -60, valText, {
        fontFamily: "monospace", fontSize: "18px", color: "#ffffff", fontStyle: "bold",
        backgroundColor: "rgba(0,0,0,0.4)"
    }).setOrigin(0.5).setDepth(5);

    crate.setData('textObj', textObj);

    const syncText = () => {
        if (crate && crate.active) {
            textObj.setPosition(crate.x, crate.y);
            textObj.setRotation(crate.rotation);
        }
    };
    this.events.on('update', syncText);

    // Proper GC handler
    crate.on('destroy', () => {
        textObj.destroy();
        this.events.off('update', syncText);
    });
  }

  _clearCrates() {
    this.wholeCrates.clear(true, true);
    this.brokenCrates.clear(true, true);
  }

  // ---------------------------------------------------------------------------
  // INTERFACE ENGINE (HUD, UI, Buttons)
  // ---------------------------------------------------------------------------

  _createHUD() {
    // Info Container Background
    this.add.rectangle(400, 30, 800, 60, 0x111122, 0.9).setDepth(9);

    // Glowing Progress Bar (Background Array)
    this.progressBg = this.add.rectangle(400, 5, 800, 10, 0x333333).setOrigin(0.5, 0).setDepth(10);
    this.progressFg = this.add.rectangle(0, 5, 0, 10, 0x4ade80).setOrigin(0, 0).setDepth(11);

    // Dynamic HUD Phase Tracker
    this.levelText = this.add.text(400, 32, "", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "18px",
      color: "#38bdf8",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 4
    }).setOrigin(0.5).setDepth(10);

    // Real-Time Score Engine
    this.scoreText = this.add.text(20, 20, `Score: ${this.gameState.score}`, {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#fbbf24",
      stroke: "#d97706",
      strokeThickness: 3,
      shadow: { blur: 10, color: "#fbbf24", fill: true }
    }).setDepth(10);

    // Real-Time Lives Engine
    this.livesText = this.add.text(650, 20, `Lives: ${this.gameState.lives}`, {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#f87171",
      stroke: "#b91c1c",
      strokeThickness: 3,
      shadow: { blur: 10, color: "#f87171", fill: true }
    }).setDepth(10);

    // Error Feedback
    this.errorText = this.add.text(400, 450, "", {
      fontFamily: "monospace",
      fontSize: "28px",
      color: "#ffffff",
      backgroundColor: "#dc2626",
      padding: { x: 20, y: 10 },
      shadow: { blur: 10, color: "#dc2626", fill: true }
    }).setOrigin(0.5).setAlpha(0).setDepth(15);
  }

  _updateProgress(targetPercentage) {
    this.gameState.progress = targetPercentage;
    const targetWidth = (targetPercentage / 100) * 800;
    this.tweens.add({
      targets: this.progressFg,
      width: targetWidth,
      duration: 800,
      ease: 'Cubic.out'
    });
  }

  _showTransitionPopup(title, btnText, btnCallback, titleColor = "#4ade80") {
    // Create Blocking Overlay
    this.overlayBg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(100);
    
    this.overlayTitle = this.add.text(400, 250, title, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "36px",
        color: titleColor,
        align: "center",
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(101);

    this.overlayBtn = this._createInteractiveButton(400, 380, btnText, () => {
        this.overlayBg.destroy();
        this.overlayTitle.destroy();
        this.overlayBtn.destroy();
        btnCallback();
    }, 101);
  }

  _createInteractiveButton(x, y, text, onClick, depth = 10) {
    // Custom DOM-less Interactive API usage mapping directly to canvas clicks
    const btnText = this.add.text(x, y, text, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "28px",
      color: "#ffffff",
      backgroundColor: "#3b82f6",
      padding: { x: 25, y: 15 },
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(depth).setInteractive({ useHandCursor: true });

    btnText.on('pointerover', () => { btnText.setBackgroundColor("#2563eb").setTint(0xdddddd); });
    btnText.on('pointerout', () => { btnText.setBackgroundColor("#3b82f6").clearTint(); });
    btnText.on('pointerdown', () => { btnText.y += 3; });
    
    btnText.on('pointerup', () => { 
      btnText.y -= 3; 
      // Force minor execution delay to allow the visual 'click' bounce to render 100%
      this.time.delayedCall(60, onClick);
    });

    return btnText;
  }

  _flashText(textObj, colorHex) {
    const originalColor = textObj.style.color;
    textObj.setColor(colorHex);
    this.time.delayedCall(400, () => {
      if (textObj.active) textObj.setColor(originalColor);
    });
  }

  // ---------------------------------------------------------------------------
  // GRAPHICS FALLBACKS
  // ---------------------------------------------------------------------------

  _fitSpriteToHeight(sprite, targetHeightPx) {
    const h = sprite.frame?.height;
    if (!h || h <= 0) return;
    sprite.setScale(targetHeightPx / h);
  }

  _generateSparkTexture() {
    if (!this.textures.exists("spark")) {
        const g = this.add.graphics();
        g.fillStyle(0x4ade80, 1); 
        g.fillCircle(4, 4, 4);
        g.generateTexture("spark", 8, 8);
        g.destroy();
    }
  }
}
