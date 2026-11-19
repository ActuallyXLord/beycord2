const Beyblade = require("./Beyblade.js");

// Caynox (Stamina, Right-spin). Data from the Beyblade wiki.
class Caynox extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Caynox",
      "Stamina",
      "https://static.wikia.nocookie.net/beyblade/images/6/68/C_og_hasbro.jpg/revision/latest?cb=20171105085734",
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
        say(s, `[${e.username}] Caynox used **Endless Spin** and circled tirelessly and wore the opponent down for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Spin Keep",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.4);
        say(s, `[${e.username}] Caynox recovered 0.4 stamina with **Spin Keep**.`);
      },
      cd: 14000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["caynox"];
  }
}

module.exports = Caynox;
