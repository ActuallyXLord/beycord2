const Beyblade = require("./Beyblade.js");

// Omni Odax O2 (Attack, Right-spin). Data from the Beyblade wiki.
class OmniOdaxO2 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Omni Odax O2",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/6/66/O2_tx_hasbro.jpg/revision/latest?cb=20171105065845",
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
        say(s, `[${e.username}] Omni Odax O2 used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Omni Odax O2 dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["omniodaxo2"];
  }
}

module.exports = OmniOdaxO2;
