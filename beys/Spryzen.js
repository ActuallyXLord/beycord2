const Beyblade = require("./Beyblade.js");

// Spryzen (Defense, Right-spin). Data from the Beyblade wiki.
class Spryzen extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Spryzen",
      "Defense",
      "https://static.wikia.nocookie.net/beyblade/images/a/a3/S_hd.jpg/revision/latest?cb=20171104042710",
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
        say(s, `[${e.username}] Spryzen used **Iron Wall** and rammed the opponent from behind its guard for ${dmg} damage.`);
      }
    }];

    this.passives = [{
      name: "Guard Stance",
      requires: function (e, t, s) { return e.stamina < 10; },
      execute: function (e, t, s) {
        e.stamina = Math.min(10, e.stamina + 0.3);
        say(s, `[${e.username}] Spryzen recovered 0.3 stamina with **Guard Stance**.`);
      },
      cd: 13000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["spryzen"];
  }
}

module.exports = Spryzen;
