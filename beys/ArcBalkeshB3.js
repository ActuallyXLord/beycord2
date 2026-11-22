const Beyblade = require("./Beyblade.js");

// Arc Balkesh B3 (Defense, Left-spin). Data from the Beyblade wiki.
class ArcBalkeshB3 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Arc Balkesh B3",
      "Defense",
      "https://static.wikia.nocookie.net/beyblade/images/2/27/B3.2B.At.jpeg/revision/latest?cb=20180911061851",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (err) {} };

    this.specials = [{
      name: "Iron Wall",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(45 + (e.lvl || 1) * 0.4);
        t.hp -= dmg;
        t.stability -= 6;
        e.sp -= 2;
        say(s, `[${e.username}] Arc Balkesh B3 used **Iron Wall** and rammed the opponent from behind its guard for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Guard Stance",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.3);
        say(s, `[${e.username}] Arc Balkesh B3 recovered 0.3 stamina with **Guard Stance**.`);
      },
      cd: 13000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["arcbalkeshb3"];
  }
}

module.exports = ArcBalkeshB3;
