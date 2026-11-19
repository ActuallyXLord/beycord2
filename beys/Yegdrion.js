const Beyblade = require("./Beyblade.js");

// Yegdrion (Stamina, Right-spin). Data from the Beyblade wiki.
class Yegdrion extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Yegdrion",
      "Stamina",
      "https://static.wikia.nocookie.net/beyblade/images/1/17/Y_r.e..jpg/revision/latest?cb=20171104023601",
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
        say(s, `[${e.username}] Yegdrion used **Endless Spin** and circled tirelessly and wore the opponent down for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Spin Keep",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.4);
        say(s, `[${e.username}] Yegdrion recovered 0.4 stamina with **Spin Keep**.`);
      },
      cd: 14000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["yegdrion"];
  }
}

module.exports = Yegdrion;
