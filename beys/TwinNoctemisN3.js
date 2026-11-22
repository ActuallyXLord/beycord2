const Beyblade = require("./Beyblade.js");

// Twin Noctemis N3 (Attack, Right-spin). Data from the Beyblade wiki.
class TwinNoctemisN3 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Twin Noctemis N3",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/3/39/Twin_Noctemis_N3.jpg/revision/latest?cb=20180217233700",
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
        say(s, `[${e.username}] Twin Noctemis N3 used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Twin Noctemis N3 dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["twinnoctemisn3"];
  }
}

module.exports = TwinNoctemisN3;
