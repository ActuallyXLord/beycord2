const Beyblade = require("./Beyblade.js");

// Owner-only custom bey (left spin). Not in any spawn list in index.js, so it never drops randomly.
class BlackLightningLDrago extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Black Lightning L-Drago",
      "Attack",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/BlackLightningLDrago.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    // Special: Soaring Bite Strike. Needs 2 energy. It leaps and bites down for heavy damage.
    this.specials = [{
      name: "Soaring Bite Strike",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(55 + (e.lvl || 1) * 0.4);
        t.hp -= dmg;
        t.stability -= 12;
        e.sp -= 2;
        say(s, `[${e.username}] Black Lightning L-Drago used **Soaring Bite Strike** and bit down for ${dmg} damage.`);
      }
    }];

    // Passive: Charging. Every 10 seconds it gains 1 energy by itself (up to 4).
    this.passives = [{
      name: "Charging",
      requires: function (e, t, s) { return e.sp < 4; },
      execute: function (e, t, s) {
        e.sp++;
        say(s, `[${e.username}] Black Lightning L-Drago gathered energy with **Charging** (energy: ${e.sp}).`);
      },
      cd: 10000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["blacklightning", "blackldrago", "blacklightningldrago"];
  }
}

module.exports = BlackLightningLDrago;
