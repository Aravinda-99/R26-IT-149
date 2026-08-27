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
 * All three options are wired:
 * - "Review the basics" restarts the scene with forceTutorial: true.
 * - "Get an extra life and try again" always calls GameManager.addLife(),
 *   and additionally calls the active scene's own addLife() when it has one
 *   (currently: Level25Scene only) — most methods-wing levels (25-88) track
 *   lives in a fully local this.lives, not GameManager.state.lives, so the
 *   global call alone has no visible effect there. See the comment at the
 *   call site below for the rollout status.
 * - "Go to menu list" navigates via scene.scene.start("MenuScene") — the
 *   same scene key every level's own "RETURN TO MENU" button uses in
 *   gameOver() (verified in Level25Scene.js and Level34Scene.js).
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

    // ── Content-driven panel height ─────────────────────────────────
    // Was a fixed panelH=260 tuned for exactly 3 buttons at fixed 46px/
    // 62px-spacing metrics -- which, worked out precisely, already
    // overflowed the panel's own bottom edge by 2px (last button bottom
    // = panelY+132 vs panel bottom = panelY+130). Measuring the actual
    // title height and deriving panelH from the real button count fixes
    // that at the source and generalizes to any label length/option count
    // instead of a magic constant.
    const titleMessage = title || (urgent
      ? "Bit noticed you're frustrated AND struggling with this one..."
      : "Bit has a suggestion...");

    const topPadding = 20;
    const titleToButtonsGap = 20;
    const bottomPadding = 20;
    let buttonH = 46;
    let buttonSpacing = 62;
    let titleFontSize = 16;
    let labelFontSize = 15;

    // Measure the title at its base font size (wordWrap already fixed to
    // panelW-40, independent of panelH) before panelH/panelY are known.
    const titleText = scene.add.text(0, 0, titleMessage, {
      fontFamily: "Arial",
      fontSize: `${titleFontSize}px`,
      color: "#ffffff",
      fontStyle: "bold",
      wordWrap: { width: panelW - 40 },
      align: "center",
    }).setOrigin(0.5).setDepth(depth + 2).setAlpha(0);
    created.push(titleText);

    const n = OPTIONS.length;
    const buttonsBlockHeight = () => (n - 1) * buttonSpacing + buttonH;
    let desiredPanelH = topPadding + titleText.height + titleToButtonsGap + buttonsBlockHeight() + bottomPadding;

    // Clamp to 85% of camera height; if the natural content doesn't fit,
    // shrink spacing/button height/font sizes proportionally rather than
    // letting buttons spill past the panel's bottom edge.
    const maxPanelH = height * 0.85;
    if (desiredPanelH > maxPanelH) {
      const shrink = maxPanelH / desiredPanelH;
      buttonH *= shrink;
      buttonSpacing *= shrink;
      titleFontSize = Math.max(11, Math.round(titleFontSize * shrink));
      labelFontSize = Math.max(10, Math.round(labelFontSize * shrink));
      titleText.setFontSize(titleFontSize);
      desiredPanelH = topPadding + titleText.height + titleToButtonsGap + buttonsBlockHeight() + bottomPadding;
    }
    const panelH = Math.min(desiredPanelH, maxPanelH);

    // Keep the whole panel (top to bottom edge) within [20, height-20] --
    // the bottom-most button should never sit closer than 20px from the
    // camera's bottom edge. Falls back to plain centering only in the
    // (practically unreachable, given the clamp above) case where panelH
    // alone already exceeds height-40.
    const halfH = panelH / 2;
    const minCenterY = 20 + halfH;
    const maxCenterY = height - 20 - halfH;
    const panelY = minCenterY <= maxCenterY
      ? Math.min(Math.max(height / 2, minCenterY), maxCenterY)
      : height / 2;

    const panelBg = scene.add.graphics().setDepth(depth + 1).setAlpha(0);
    panelBg.fillStyle(COLOR_PANEL_BG, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 16);
    panelBg.lineStyle(2, urgent ? COLOR_URGENT : COLOR_CYAN);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 16);
    created.push(panelBg);

    // Reposition the (already-measured) title into its final spot now
    // that panelY/panelH are resolved.
    titleText.setPosition(panelX, panelY - panelH / 2 + topPadding + titleText.height / 2);

    const buttonY0 = panelY - panelH / 2 + topPadding + titleText.height + titleToButtonsGap + buttonH / 2;

    const finish = (choice) => {
      created.forEach((obj) => obj.destroy());
      scene.inputLocked = false;

      if (choice === "extraLife") {
        const globalLives = GameManager.addLife(1);
        // GameManager.state.lives is the source of truth for early levels
        // (index <21) that read it directly, but the methods-wing levels
        // (25-88) track lives in a fully local this.lives/this.lifeIcons
        // instead and never read GameManager's copy -- so on those, the
        // call above alone has no visible effect. Call the scene's own
        // addLife() too, when it has one, without removing the
        // GameManager call (kept so its counter stays meaningful for any
        // level that does read it).
        if (typeof scene.addLife === "function") {
          const sceneLives = scene.addLife(1);
          console.log("BitMenu choice: extraLife — granted bonus life. GameManager.lives:", globalLives, "| scene.lives:", sceneLives);
        } else {
          console.log("BitMenu choice: extraLife — granted bonus life, lives now:", globalLives);
        }
      } else if (choice === "review") {
        // Only the 22 Accretion-phase levels (e.g. Level34) support
        // init(data)/_forceTutorial/checkTutorial() honoring it -- verified
        // Level26 (Tuning-phase) does NOT, so this is not a universal
        // methods-wing pattern despite living in the original template.
        // Harmless everywhere either way: scene.scene.restart() always
        // works, it just won't force the tutorial to show on levels that
        // don't read forceTutorial -- there it behaves like a plain retry.
        console.log("BitMenu choice: review — restarting scene with forceTutorial: true");
        scene.scene.restart({ forceTutorial: true });
      } else if (choice === "menu") {
        // Same scene key used by every level's own "RETURN TO MENU" button
        // in gameOver() (verified in Level25Scene.js and Level34Scene.js) —
        // consistent with existing in-game navigation elsewhere.
        console.log("BitMenu choice: menu — navigating to MenuScene");
        scene.scene.start("MenuScene");
      } else {
        console.log("BitMenu choice:", choice);
      }

      resolve(choice);
    };

    OPTIONS.forEach((opt, i) => {
      const emphasize = urgent && opt.key === "review";
      const by = buttonY0 + i * buttonSpacing;
      const bw = panelW - 60;
      const bh = buttonH;

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
        fontSize: `${labelFontSize}px`,
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
