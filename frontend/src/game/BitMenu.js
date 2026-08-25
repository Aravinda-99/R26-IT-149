/**
 * BitMenu — Shared 3-Choice Modal ("Make it easier" / "Review the basics" /
 * "Get an extra life and try again")
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
 * "Make it easier" and "Review the basics" aren't wired to real behavior
 * yet — just logged. "Get an extra life and try again" is wired to
 * GameManager.addLife(), the only one of the three simple enough to hook
 * up to existing game state right now.
 */

import { GameManager } from "./GameManager.js";

const OPTIONS = [
  { key: "easier", label: "Make it easier" },
  { key: "review", label: "Review the basics" },
  { key: "extraLife", label: "Get an extra life and try again" },
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
 *   ('easier' | 'review' | 'extraLife') once the player picks one
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
    const panelH = 260;
    const panelX = width / 2;
    const panelY = height / 2;

    const panelBg = scene.add.graphics().setDepth(depth + 1).setAlpha(0);
    panelBg.fillStyle(COLOR_PANEL_BG, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 16);
    panelBg.lineStyle(2, urgent ? COLOR_URGENT : COLOR_CYAN);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 16);
    created.push(panelBg);

    const titleText = scene.add.text(
      panelX,
      panelY - panelH / 2 + 34,
      title || (urgent
        ? "Bit noticed you're frustrated AND struggling with this one..."
        : "Bit has a suggestion..."),
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

    const buttonY0 = panelY - 15;
    const buttonSpacing = 62;

    const finish = (choice) => {
      created.forEach((obj) => obj.destroy());
      scene.inputLocked = false;

      if (choice === "extraLife") {
        const lives = GameManager.addLife(1);
        console.log("BitMenu choice: extraLife — granted bonus life, lives now:", lives);
      } else {
        console.log("BitMenu choice:", choice);
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
