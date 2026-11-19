const Beyblade = require("./Beyblade.js");

// Dragoon Fantom (Attack, Left-spin). Data from the Beyblade wiki.
class DragoonFantom extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Dragoon Fantom",
      "Attack",
      "https://static.wikia.nocookie.net/beyblade/images/b/b2/Dragoon_F_.G.V.png/revision/latest?cb=20180215084722",
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
        say(s, `[${e.username}] Dragoon Fantom used **Burst Rush** and slammed into the opponent for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Sharp Edge",
      requires: function (e, t, s) { return t.hp > 6; },
      execute: function (e, t, s) {
        t.hp -= 6;
        say(s, `[${e.username}] Dragoon Fantom dealt 6 damage with **Sharp Edge**.`);
      },
      cd: 11000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["dragoonfantom"];
  }
}

module.exports = DragoonFantom;
