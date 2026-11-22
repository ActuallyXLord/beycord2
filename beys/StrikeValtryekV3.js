const Beyblade = require("./Beyblade.js");

// Strike Valtryek V3 (Attack, Right-spin). Data from the Beyblade wiki.
class StrikeValtryekV3 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Strike Valtryek V3",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/5/53/Strike_Valtryek_V3.jpg/revision/latest?cb=20180217233712",
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
        say(s, `[${e.username}] Strike Valtryek V3 used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Strike Valtryek V3 dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["strikevaltryekv3"];
  }
}

module.exports = StrikeValtryekV3;
