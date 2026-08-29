/**
 * BitMenu — Shared 3-Choice Modal ("Review the basics" / "Get an extra life
 * and try again" / "Go to menu list")
 * ==============================================================================
 * A single reusable component, visually modeled on the existing choice-bubble
 * pattern used across level scenes (rounded-rect Graphics + Text, hover
 * states, hand cursor — see Level19Scene._showBubbles() and
 * Level34Scene.showOptionBubbles()), but built generically against any
 * scene's camera size rather than a level's own local layout constants.
 *
 * Freezes the underlying level the same way every other pause-like moment
 * in this codebase does — scene.inputLocked = true — for the duration the
 * menu is open, then releases it once the player picks an option.
 *
 * "Review the basics" restarts the current scene with its tutorial forced —
 * unless the scene sets its own `baseTutorialScene` (e.g. a rapid-fire
 * Tuning-phase level pointing back at its wing's Accretion-phase intro),
 * in which case it navigates there instead. "Get an extra life and try
 * again" calls GameManager.addLife() for the global count, and also the
 * scene's own addLife() when it defines one — most methods-wing levels
 * track lives locally (this.lives / this.lifeIcons) rather than through
 * GameManager, so the global-only call was previously a no-op for them.
 * "Go to menu list" returns to MenuScene.
 */

import { GameManager } from "./GameManager.js";

const OPTIONS = [
  { key: "review", label: "Review the basics" },
  { key: "extraLife", label: "Get an extra life and try again" },
  { key: "menu", label: "Go to menu list" },
];

const COLOR_CYAN = 0x00e5ff;
const COLOR_URGENT = 0xff5252;
const COLOR_GOLD = 0xffd740;
const COLOR_PANEL_BG = 0x1a1a2e;
const COLOR_BTN_BG = 0x0e1810;
const COLOR_BTN_BG_HOVER = 0x1e1e3a;

/**
 * Shows the 3-choice Bit menu on top of the given scene.
 * @param {Phaser.Scene} scene — the currently active level scene
 * @param {object} [opts]
 * @param {boolean} [opts.urgent=false] — BIT_MENU_URGENT styling: red accent
 *   border and "Review the basics" visually emphasized
 * @param {string} [opts.title]
 * @returns {Promise<string>} resolves with the chosen option's key
 *   ('review' | 'extraLife' | 'menu') once the player picks one
 */
export function showBitMenu(scene, { urgent = false, title } = {}) {
  return new Promise((resolve) => {
    if (!scene) {
      resolve(null);
      return;
    }

    scene.inputLocked = true;

    const { width, height } = scene.cameras.main;
    const depth = 1000; // sit above all normal in-level UI
    const created = [];

    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
      .setDepth(depth)
      .setAlpha(0);
    created.push(overlay);

    const panelW = Math.min(460, width - 40);
    const panelX = width / 2;
    const panelY = height / 2;

    // Layout constants — panelH is derived from these plus the title's
    // actual (possibly word-wrapped) rendered height, so the background
    // always wraps its content exactly instead of a guessed fixed height.
    const TOP_PADDING = 32;
    const TITLE_GAP = 26;
    const BUTTON_H = 46;
    const BUTTON_GAP = 18;
    const BOTTOM_PADDING = 32;
    const buttonCount = OPTIONS.length;

    // Created first (off-panel position) purely to measure its wrapped
    // height — repositioned once panelH/panelTop are known below.
    const titleText = scene.add.text(
      panelX,
      0,
      title || (urgent
        ? "Bit noticed you're frustrated AND struggling with this one..."
        : "Bit noticed you're struggling with this one..."),
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
        wordWrap: { width: panelW - 40 },
        align: "center",
      }
    ).setOrigin(0.5).setDepth(depth + 2).setAlpha(0);
    created.push(titleText);

    const buttonsBlockH = buttonCount * BUTTON_H + (buttonCount - 1) * BUTTON_GAP;
    const panelH = TOP_PADDING + titleText.height + TITLE_GAP + buttonsBlockH + BOTTOM_PADDING;
    const panelTop = panelY - panelH / 2;

    titleText.y = panelTop + TOP_PADDING + titleText.height / 2;

    const panelBg = scene.add.graphics().setDepth(depth + 1).setAlpha(0);
    panelBg.fillStyle(COLOR_PANEL_BG, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelTop, panelW, panelH, 16);
    panelBg.lineStyle(2, urgent ? COLOR_URGENT : COLOR_CYAN);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelTop, panelW, panelH, 16);
    created.push(panelBg);

    const buttonY0 = panelTop + TOP_PADDING + titleText.height + TITLE_GAP + BUTTON_H / 2;
    const buttonSpacing = BUTTON_H + BUTTON_GAP;

    const finish = (choice) => {
      created.forEach((obj) => obj.destroy());
      scene.inputLocked = false;

      if (choice === "extraLife") {
        const lives = GameManager.addLife(1);
        if (typeof scene.addLife === "function") scene.addLife();
        console.log("BitMenu choice: extraLife — granted bonus life, lives now:", lives);
      } else if (choice === "review") {
        if (scene.baseTutorialScene) {
          scene.scene.start(scene.baseTutorialScene, { forceTutorial: true });
        } else {
          scene.scene.restart({ forceTutorial: true });
        }
      } else if (choice === "menu") {
        scene.scene.start("MenuScene");
      }

      resolve(choice);
    };

    OPTIONS.forEach((opt, i) => {
      const emphasize = urgent && opt.key === "review";
      const by = buttonY0 + i * buttonSpacing;
      const bw = panelW - 60;
      const bh = 46;

      const container = scene.add.container(panelX, by).setDepth(depth + 2).setAlpha(0);
      const bg = scene.add.graphics();

      const draw = (stroke, fill) => {
        bg.clear();
        bg.fillStyle(fill, 1);
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 10);
        bg.lineStyle(emphasize ? 3 : 2, stroke, 1);
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 10);
      };
      draw(emphasize ? COLOR_URGENT : COLOR_CYAN, COLOR_BTN_BG);

      const label = scene.add.text(0, 0, opt.label, {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#e0e0e0",
        fontStyle: "bold",
      }).setOrigin(0.5);

      container.add([bg, label]);
      container.setSize(bw, bh).setInteractive({ useHandCursor: true });
      created.push(container);

      // Note: these handlers deliberately do NOT check scene.inputLocked —
      // that flag is what THIS menu uses to freeze the underlying level's
      // own gameplay while it's open; the menu's own buttons are the one
      // thing that should stay live.
      container.on("pointerover", () => draw(COLOR_GOLD, COLOR_BTN_BG_HOVER));
      container.on("pointerout", () => draw(emphasize ? COLOR_URGENT : COLOR_CYAN, COLOR_BTN_BG));
      container.on("pointerdown", () => finish(opt.key));

      scene.tweens.add({ targets: container, alpha: 1, duration: 220, delay: 80 + i * 80 });
    });

    scene.tweens.add({ targets: overlay, alpha: 1, duration: 180 });
    scene.tweens.add({ targets: [panelBg, titleText], alpha: 1, duration: 220, delay: 80 });
  });
}
