// after scaling the dimentions of a scene background, hse this script to scale all scene children to fit.
// notice, it does not take some things into account, such as non-proportional scale, background offset etc.
const SCALE = 2;
(async () => {
  const scene = game.scenes.active;
  for (const d of scene.drawings) {
    await d.update({
      x: d.x * SCALE,
      y: d.y * SCALE,
      shape: {
        width: d.shape.width * SCALE,
        height: d.shape.height * SCALE,
        points: d.shape.points.map((p) => p * SCALE),
      },
    });
  }
  for (const w of scene.walls) {
    await w.update({ c: w.c.map((x) => x * SCALE) });
  }
  for (const t of scene.tokens) {
    await t.update({
      x: t.x * SCALE,
      y: t.y * SCALE,
    });
  }
  for (const t of scene.tiles) {
    await t.update({
      x: t.x * SCALE,
      y: t.y * SCALE,
    });
  }
  for (const l of scene.lights) {
    await l.update({
      x: l.x * SCALE,
      y: l.y * SCALE,
    });
  }
})();
