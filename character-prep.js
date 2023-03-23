// prep characters:
// - make sure at most one empty GP item exists

(async () => {
  for (const c of game.actors.values()) {
    if (c.type === "character") {
      console.log(c);
      for (const i of c.items.filter(
        (i) => i.name === "Gold (gp)" && i.system.quantity.value === 0
      )) {
        c.items.delete(i.id);
      }
      if (!c.items.find((i) => i.name === "Gold (gp)")) {
        console.log("adding GP");
        await c.createEmbeddedDocuments("Item", [
          {
            name: "Gold (gp)",
            type: "item",
            img: "icons/commodities/currency/coin-plain-portal-gold.webp",
            data: game.items.find((i) => i.name === "Gold (gp)").system._source,
          },
        ]);
      }
    }
  }
})();
