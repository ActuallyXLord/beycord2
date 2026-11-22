const Beyblade = require("./Beyblade.js");

// Nightmare Luinor L3 (Attack, Left-spin). Data from the Beyblade wiki.
class NightmareLuinorL3 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Nightmare Luinor L3",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/1/13/L3_Ds.png/revision/latest?cb=20180530190349",
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
        say(s, `[${e.username}] Nightmare Luinor L3 used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Nightmare Luinor L3 dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["nightmareluinorl3"];
  }
}

module.exports = NightmareLuinorL3;
