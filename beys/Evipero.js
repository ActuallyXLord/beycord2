const Beyblade = require("./Beyblade.js");

// Evipero (Defense, Right-spin). Data from the Beyblade wiki.
class Evipero extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Evipero",
      "Defense",
      "https://static.wikia.nocookie.net/beyblade/images/d/d9/E_wn_hasbro.jpg/revision/latest?cb=20171104041815",
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
        say(s, `[${e.username}] Evipero used **Iron Wall** and rammed the opponent from behind its guard for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Guard Stance",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.3);
        say(s, `[${e.username}] Evipero recovered 0.3 stamina with **Guard Stance**.`);
      },
      cd: 13000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["evipero"];
  }
}

module.exports = Evipero;
