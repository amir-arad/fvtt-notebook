const MELEE_RANGE = 5;
const ammoData = [
  { name: " bow", ammoType: "arrow" },
  { name: "crossbow", ammoType: "bolt" },
  { name: "sling", ammoType: "stone" },
];

const missileAttack = async function () {
  // Get Selected
  if (!OSRH.util.singleSelected()) {
    return;
  }
  if (game.user.targets.size  < 1) {
    ui.notifications.error("No target.");
    return;
  }
  if (game.user.targets.size > 1) {
    ui.notifications.error("Too many targets");
    return;
  }
  const attackingToken = canvas.tokens.controlled[0];
  const selectedActor = attackingToken.actor;
  // Select Weapon
  let actorWeapons = selectedActor?.items.filter(
    (item) => item.type == "weapon" && item.system.missile
  );

  if (actorWeapons.length == 0) {
    ui.notifications.error("No missile weapons found.");
    return;
  }
  const target = game.user.targets.first();
  const distance = Math.round(
    game.canvas.grid.measureDistance(attackingToken, target)
  );
  if (distance < MELEE_RANGE) {
    ui.notifications.error("Too close to target.");
    return;
  }
  let atkOptions = "";
  for (const item of actorWeapons) {
    const ammoObjects = ammoData.filter((a) =>
      item?.name.toLowerCase().includes(a.name.toLowerCase())
    );
    if (ammoObjects.length) {
      const ammoItems = [
        ...new Set(
          ammoObjects.flatMap((a) =>
            selectedActor.items.filter(
              (i) =>
                i.name.toLowerCase().includes(a.ammoType.toLowerCase()) &&
                i.system.quantity?.value
            )
          )
        ),
      ];
      for (const ammoItem of ammoItems) {
        atkOptions += `<option value="${item.id}|${ammoItem.id}">${item.name} | ATK: ${item.system.damage} | ${ammoItem.name} x${ammoItem.system.quantity.value}</option>`;
      }
    } else {
      atkOptions += `<option value="${item.id}|thrown">${item.name} | ATK: ${item.system.damage} | Thrown </option>`;
    }
  }
  let dialogTemplate = `
     <h1> Pick a weapon </h1>
     <div style="display:flex; justify-content: space-between; margin-bottom: 1em;">
       <div>
       <select id="weapon" style="width: 150px">${atkOptions}</select>
       </div>
       <div style="width: 110px">
       <input id="ammoSpend" type="checkbox" checked />Spend Ammo
       </div>
       <div>
       <input id="skip" type="checkbox" checked />Skip Dialog
       </div>
       </div>
     `;
  new Dialog({
    title: "Roll Attack",
    content: dialogTemplate,
    buttons: {
      rollAtk: {
        label: "Roll Attack",
        callback: async (html) => {
          const [wId, aId] = html.find("#weapon")[0].value.split("|");
          const skipCheck = html.find("#skip")[0]?.checked;
          const ammoSpend = html.find(`#ammoSpend`)[0]?.checked;
          const weapon = selectedActor.items.find((i) => i.id == wId);
          const range = weapon.system.range;
          if (range.long < distance) {
            ui.notifications.error(
              `Target out of range (target is ${distance}' away, max range is ${range.long}')`
            );
            return;
          }
          const rangeMod =
            range.short >= distance ? 1 : range.medium < distance ? -1 : 0;
          const thac0Missiles = selectedActor.system.thac0.mod.missile;
          const isMelee = weapon.system.melee;
          selectedActor.system.thac0.mod.missile = thac0Missiles + rangeMod;
          weapon.system.melee = false;
          try {
            if (ammoSpend) {
              if (aId === "thrown") {
                await weapon.roll({ skipDialog: skipCheck });
                const target = game.user.targets.first();
                const pileData = await game.itempiles.API.createItemPile({
                  position: {
                    x: target.x,
                    y: target.y,
                  },
                  items: [weapon.clone()],
                });
                const pileToken = await fromUuid(pileData.tokenUuid);
                await pileToken.setFlag("token-z", "zIndex", -10);
                canvas.tokens.objects.sortDirty = canvas.primary.sortDirty = true;
                weapon.delete();
              } else {
                const ammo = selectedActor.items.find((i) => i.id == aId);
                await weapon.roll({ skipDialog: skipCheck });
                await ammo.update({
                  system: {
                    quantity: { value: ammo.system.quantity.value - 1 },
                  },
                });
              }
            } else {
              await weapon.roll({ skipDialog: skipCheck });
            }
          } finally {
            weapon.system.melee = isMelee;
            selectedActor.system.thac0.mod.missile = thac0Missiles;
          }
        },
      },
      close: {
        label: "Close",
      },
    },
  }).render(true);
};

void missileAttack();
