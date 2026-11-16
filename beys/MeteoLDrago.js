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

    // Special: Stellar Drain. Needs 2 charges. Steals about a third of the opponent's stamina.
    this.specials = [{
      name: "Stellar Drain",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const stolen = Math.max(1, Math.round(t.stamina * 0.35 * 10) / 10);
        t.stamina = Math.max(0, t.stamina - stolen);
        e.stamina = Math.min(10, e.stamina + stolen);
        t.stability -= 10;
        e.sp -= 2;
        say(s, `[${e.username}] Meteo L-Drago used **Stellar Drain** and stole ${stolen} stamina.`);
      }
    }];

    // Passive: Spin Steal. Every 12 seconds it siphons 0.4 stamina from the opponent.
    this.passives = [{
      name: "Spin Steal",
      requires: function (e, t, s) { return t.stamina > 0.4; },
      execute: function (e, t, s) {
        t.stamina -= 0.4;
        e.stamina = Math.min(10, e.stamina + 0.4);
        say(s, `[${e.username}] Meteo L-Drago stole 0.4 stamina with **Spin Steal**.`);
      },
      cd: 12000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["meteo", "meteoldrago"];
  }
}

module.exports = MeteoLDrago;
