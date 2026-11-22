const Beyblade = require("./Beyblade.js");

// Tempest Wyvron W3 (Balance, Right-spin). Data from the Beyblade wiki.
class TempestWyvronW3 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Tempest Wyvron W3",
      "Balance",
      "https://static.wikia.nocookie.net/beyblade/images/d/da/W3.2G.T.jpeg/revision/latest?cb=20180801225213",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (err) {} };

    this.specials = [{
      name: "Perfect Balance",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(50 + (e.lvl || 1) * 0.4);
        t.hp -= dmg;
        t.stability -= 8;
        e.sp -= 2;
        say(s, `[${e.username}] Tempest Wyvron W3 used **Perfect Balance** and struck with balanced precision for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Steady Spin",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.2); t.hp -= 3;
        say(s, `[${e.username}] Tempest Wyvron W3 recovered 0.2 stamina and dealt 3 damage with **Steady Spin**.`);
      },
      cd: 12000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["tempestwyvronw3"];
  }
}

module.exports = TempestWyvronW3;
