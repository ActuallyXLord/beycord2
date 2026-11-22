const Beyblade = require("./Beyblade.js");

// Drain Fafnir F3 (Stamina, Left-spin). Data from the Beyblade wiki.
class DrainFafnirF3 extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Drain Fafnir F3",
      "Stamina",
      "https://static.wikia.nocookie.net/beyblade/images/1/10/F3_7CS.jpg/revision/latest?cb=20180110184722",
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
        say(s, `[${e.username}] Drain Fafnir F3 used **Endless Spin** and circled tirelessly and wore the opponent down for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Spin Keep",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.4);
        say(s, `[${e.username}] Drain Fafnir F3 recovered 0.4 stamina with **Spin Keep**.`);
      },
      cd: 14000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["drainfafnirf3"];
  }
}

module.exports = DrainFafnirF3;
