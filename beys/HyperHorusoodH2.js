const Beyblade = require("./Beyblade.js");

// Hyper Horusood H2 (Stamina, Right-spin). Data from the Beyblade wiki.
class HyperHorusoodH2 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Hyper Horusood H2",
      "Stamina",
      "https://static.wikia.nocookie.net/beyblade/images/5/5c/H2_uc_hasbro.jpg/revision/latest?cb=20171108003650",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (err) {} };

    this.specials = [{
      name: "Endless Spin",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(40 + (e.lvl || 1) * 0.3);
        t.hp -= dmg;
        t.stability -= 4;
        e.sp -= 2;
        say(s, `[${e.username}] Hyper Horusood H2 used **Endless Spin** and circled tirelessly and wore the opponent down for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Spin Keep",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.4);
        say(s, `[${e.username}] Hyper Horusood H2 recovered 0.4 stamina with **Spin Keep**.`);
      },
      cd: 14000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["hyperhorusoodh2"];
  }
}

module.exports = HyperHorusoodH2;
