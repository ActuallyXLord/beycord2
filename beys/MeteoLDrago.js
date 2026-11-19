const Beyblade = require("./Beyblade.js");

// Owner-only custom bey. Not in any spawn list in index.js, so it never drops randomly.
class MeteoLDrago extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Meteo L-Drago [Ultimate]",
      "Attack",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/MeteoLDrago.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    // Special: Supreme Flight. Needs 3 charges. L-Drago takes flight and dives on the opponent: huge damage,
    // a big stability hit, and it steals up to 1.5 stamina on the way.
    this.specials = [{
      name: "Supreme Flight",
      requires: function (e, t, s) { return e.sp >= 3; },
      execute: function (e, t, s) {
        const dmg = Math.round(120 + (e.lvl || 1) * 0.9);
        const stolen = Math.min(1.5, Math.max(0, t.stamina));
        t.hp -= dmg;
        t.stability -= 25;
        t.stamina -= stolen;
        e.stamina = Math.min(10, e.stamina + stolen);
        e.sp -= 3;
        say(s, `[${e.username}] Meteo L-Drago took flight with **Supreme Flight** and crashed down for ${dmg} damage, stealing ${stolen.toFixed(1)} stamina.`);
      }
    }];

    // Passive: Spin Steal. Every 7 seconds it siphons up to 1 stamina from the opponent and regains 8 stability.
    this.passives = [{
      name: "Spin Steal",
      requires: function (e, t, s) { return t.stamina > 0.4; },
      execute: function (e, t, s) {
        const stolen = Math.min(1, t.stamina);
        t.stamina -= stolen;
        e.stamina = Math.min(10, e.stamina + stolen);
        e.stability = Math.min(100, e.stability + 8);
        say(s, `[${e.username}] Meteo L-Drago stole ${stolen.toFixed(1)} stamina and regained 8 stability with **Spin Steal**.`);
      },
      cd: 7000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["meteo", "meteoldrago"];
  }
}

module.exports = MeteoLDrago;
