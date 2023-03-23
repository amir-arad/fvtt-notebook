// after scaling the dimentions of a scene, hse this script to scale all scene drawings to fit.
// notice, it does not take some things into account, such as non-proportional scale, background offset etc.
const SCALE = 10;
(async () => {
    for (const d of game.scenes.active.drawings) {
        await d.update ({
            x : d.x * SCALE,
            y : d.y * SCALE,
            shape : {
                width : d.shape.width * SCALE,
                height : d.shape.height * SCALE,
                points: d.shape.points.map(p => p * SCALE),
            },
        });
    }
})();