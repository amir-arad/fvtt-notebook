// configure all monsters to have an inventory

(async () => {
    for (const m of game.actors.values()){
        if (m.type === 'monster'){
            await m.update({system : {config : {enableInventory : true}}});
        }
    }
})();