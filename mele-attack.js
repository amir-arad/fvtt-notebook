const MELEE_RANGE = 5;
const meleAttack = async function () {
  // Get Selected
  if (!OSRH.util.singleSelected()) {
    return;
  }
  const attackingToken = canvas.tokens.controlled[0];
  const selectedActor = attackingToken.actor;
  // Select Weapon
  let actorWeapons = selectedActor?.items.filter(
    (item) => item.type == "weapon" && item.system.melee
  );
  if (actorWeapons.length == 0) {
    ui.notifications.error("No melee weapons found.");
    return;
  }
  const target = game.user.targets.first();
  const distance = Math.round(
    game.canvas.grid.measureDistance(attackingToken, target)
  );
  if (distance > 5) {
    ui.notifications.error("Not adjacent to target.");
    return;
  }
  let atkOptions = "";
  for (let item of actorWeapons) {
    atkOptions += `<option value=${item.id}>${item.name} | ATK: ${item.system.damage}</option>`;
  }
  let dialogTemplate = `
     <h1> Pick a melee weapon </h1>
     <div style="display:flex; justify-content: space-between; margin-bottom: 1em;">
       <div>
       <select id="weapon" style="width: 150px">${atkOptions}</select>
       </div>
       <div>
       <input id="skip" type="checkbox" checked />Skip Dialog
       </div>
       </div>
     `;
  new Dialog({
    title: "Roll Melee Attack",
    content: dialogTemplate,
    buttons: {
      rollAtk: {
        label: "Roll Melee Attack",
        callback: async (html) => {
          let selected = html.find("#weapon")[0];
          let skipCheck = html.find("#skip")[0]?.checked;
          let weapon = selectedActor.items.find((i) => i.id == selected.value);
          const isMissile = weapon.system.missile;
          try {
            weapon.system.missile = false;
            await weapon.roll({ skipDialog: skipCheck });
          } finally {
            weapon.system.missile = isMissile;
          }
        },
      },
      close: {
        label: "Close",
      },
    },
  }).render(true);
};

void meleAttack();
