const Beyblade = require("./Beyblade.js");

// Doomscizor (Attack, Right-spin). Data from the Beyblade wiki.
class Doomscizor extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Doomscizor",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/8/81/D_oa_hasbro.jpg/revision/latest?cb=20171104034737",
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
        say(s, `[${e.username}] Doomscizor used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Doomscizor dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["doomscizor"];
  }
}

module.exports = Doomscizor;
