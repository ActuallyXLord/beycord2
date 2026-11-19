const Beyblade = require("./Beyblade.js");

// Roktavor (Attack, Right-spin). Data from the Beyblade wiki.
class Roktavor extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Roktavor",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/1/1e/R_ca_hasbro.jpg/revision/latest?cb=20171104035725",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (err) {} };

    this.specials = [{
      name: "Burst Rush",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(60 + (e.lvl || 1) * 0.5);
        t.hp -= dmg;
        t.stability -= 12;
        e.sp -= 2;
        say(s, `[${e.username}] Roktavor used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Roktavor dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["roktavor"];
  }
}

module.exports = Roktavor;
