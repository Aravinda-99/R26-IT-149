/**
 * TutorialReplayButton — Manual Tutorial Replay
 * ================================================
 * A small on-screen icon that lets testers/demoers replay a level's
 * intro tutorial without touching the "seen once" localStorage flag
 * (e.g. level25_tutorial_done) that gates it for regular players.
 *
 * Clicking it restarts the scene, passing { forceTutorial: true } as
 * init data. Each wired level's init()/checkTutorial() honor that flag
 * to force the tutorial to run again -- the stored flag itself is never
 * read from or written to here. A full scene restart (rather than
 * calling runTutorial() directly mid-round) avoids leftover round
 * UI/state, since init()/create() run exactly as they would on a normal
 * level load.
 *
 * Each level's HUD is a hand-designed, one-off layout -- the hearts/lives
 * row alone sits at y:24, y:26, or y:30 (and x-spacing of either 26px or
 * 28px per heart) depending on the file, so there is no single constant
 * that lines up with all of them. There's no DOM/CSS here to reach for
 * (this whole HUD is drawn on a canvas via absolute Phaser coordinates,
 * not flex containers), so the direct equivalent of "align-items: center"
 * / "compute layout from the real sibling, not a guess" is: read the
 * position off the actual hearts GameObjects. Callers pass:
 *   - `centerY` as `this.lifeIcons[0].y` (any heart -- they share a row)
 *   - `rightmostHeartX` as `this.lifeIcons[2].x` (the actual last heart)
 * so the badge is guaranteed to sit at the same height as the hearts and
 * just clear of the last one, regardless of each level's own spacing --
 * and stays correct even if a level's HUD is redesigned later. `W` is
 * still used, but only as a last-resort clamp so the badge can never
 * render past the canvas edge, not as its primary position source.
 *
 * The icon itself is drawn as vector Graphics (an arc + arrowhead), not a
 * Unicode text glyph ("↻" isn't in Arial's core glyph set, so it likely
 * renders via a silently-substituted fallback font with its own, probably
 * mismatched, vertical metrics -- Phaser's Text setOrigin(0.5) centers on
 * the *font's measured ascent/descent box*, not the glyph's visual ink,
 * so a font swap for one character is a real, font-dependent source of
 * "close but not quite" vertical offset). An arc drawn with a radius from
 * (cx, cy) is centered on that point by construction -- no font/glyph
 * ambiguity possible.
 *
 * Sized to roughly match the hearts' own ~18-20px footprint (r:9, ~18px
 * diameter) rather than the original r:13 (~28px) badge, which was wide
 * enough on its own to cover most of a heart at typical heart spacing.
 */
export function addTutorialReplayButton(scene, W, rightmostHeartX, centerY) {
  const r = 9;
  const cy = centerY;

  // Gap budget from the last heart's center to the badge's center:
  // ~10px for the heart glyph's own half-width + a genuine ~10px visible
  // gap + the badge's own radius. Then hard-clamped so the badge can
  // never render past the canvas edge even in a level with unusually
  // tight HUD spacing.
  const heartHalfWidth = 10;
  const visualGap = 10;
  const edgeMargin = 6;
  const desiredCx = rightmostHeartX + heartHalfWidth + visualGap + r;
  const cx = Math.min(desiredCx, W - r - edgeMargin);

  const depth = 500; // above all normal HUD/round content

  const toRad = (deg) => (deg * Math.PI) / 180;
  const iconR = 4.5;
  const startAngle = toRad(-30);
  const endAngle = toRad(250);

  const bg = scene.add.graphics().setDepth(depth);
  const drawBg = (hover) => {
    bg.clear();
    bg.fillStyle(0x0a0a14, hover ? 0.95 : 0.75);
    bg.fillCircle(cx, cy, r);
    bg.lineStyle(1.5, hover ? 0xffd740 : 0x546e7a, 1);
    bg.strokeCircle(cx, cy, r);
  };
  drawBg(false);

  const icon = scene.add.graphics().setDepth(depth + 1);
  const drawIcon = (color) => {
    icon.clear();
    icon.lineStyle(1.6, color, 1);
    icon.beginPath();
    icon.arc(cx, cy, iconR, startAngle, endAngle, false);
    icon.strokePath();

    // Arrowhead at the arc's leading end, tangent to the curve there.
    const tipX = cx + Math.cos(endAngle) * iconR;
    const tipY = cy + Math.sin(endAngle) * iconR;
    const tangent = endAngle + Math.PI / 2;
    const headLen = 3;
    const headWidth = 2.5;
    const backX = tipX - Math.cos(tangent) * headLen;
    const backY = tipY - Math.sin(tangent) * headLen;
    const normalX = Math.cos(endAngle);
    const normalY = Math.sin(endAngle);
    icon.fillStyle(color, 1);
    icon.fillTriangle(
      tipX, tipY,
      backX + normalX * headWidth, backY + normalY * headWidth,
      backX - normalX * headWidth, backY - normalY * headWidth
    );
  };
  drawIcon(0xb0bec5);

  const zone = scene.add.zone(cx, cy, r * 2 + 4, r * 2 + 4)
    .setInteractive({ useHandCursor: true })
    .setDepth(depth + 2);
  zone.on("pointerover", () => { drawBg(true); drawIcon(0xffd740); });
  zone.on("pointerout", () => { drawBg(false); drawIcon(0xb0bec5); });
  zone.on("pointerdown", () => scene.scene.restart({ forceTutorial: true }));

  return { g: bg, icon, zone };
}
