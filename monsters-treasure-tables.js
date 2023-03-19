// configure all monsters to use rollTables for treasure instead of compendium
(async () => {
  const fixTableNames = {
    // a bug in the buccaneers details, maybe just for me?
    "@RollTable[xxz4eDBsEzj9QhdX]":
      "@RollTable[xxz4eDBsEzj9QhdX]{Treasure Type A}",
  };
  const tables = [...game.tables.values()];
  for (const m of game.actors.values()) {
    if (m.type === "monster" && m.system.details.treasure.table) {
      if (fixTableNames[m.system.details.treasure.table]) {
        m.system.details.treasure.table =
          fixTableNames[m.system.details.treasure.table];
      }
      const nameMatches = m.system.details.treasure.table.match(/{(.*?)}/); // this is the place that "catches" the name of the original table: anyt test that is inside curley brackets (`{}`)
      if (nameMatches && nameMatches.length === 2) {
        const tableName = nameMatches[1];
        const table = tables.find((t) => t.name === tableName); // find a rollable table by that name
        if (table) {
          // only if found such a table, change the link in the document
          await m.update({
            system: {
              details: {
                treasure: { table: `@RollTable[${table.id}]{${table.name}}` },
              },
            },
          });
        }
      }
    }
  }
})();
