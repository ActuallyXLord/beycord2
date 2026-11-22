const Beyblade = require("./Beyblade.js");

// Custom bey (right spin, Defense). Not in any spawn list in index.js, so it never drops randomly. Give it with ;gift.
// Needs the damageTaken hook in commands/battlesystemv3.js (v19 or newer) for its damage reduction.
class KishinAshura extends Beyblade {
  constructor(firstOwner, id, data) {
    super(
      "Kishin Ashura",
      "Defense",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/KishinAshura.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    // Upgrade generation (1-5) comes from the owner's copy of the bey. Each generation tanks 1% more damage from basic attacks.
    const gen = Math.min(5, Math.max(1, Number(data && data.gen) || 1));
    this.damageTaken = 1 - gen * 0.01;

    // Special: Moment Counter. Needs 2 charges. Decent damage on its own, but if the opponent attacks this round
    // Ashura catches the strike at the perfect moment: 1.8x damage and a heavy stability hit.
    this.specials = [{
      name: "Moment Counter",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const countered = t.move === "attack";
        const dmg = Math.round((55 + (e.lvl || 1) * 0.4) * (countered ? 1.8 : 1));
        t.hp -= dmg;
        t.stability -= countered ? 18 : 6;
        e.sp -= 2;
        say(s, countered
          ? `[${e.username}] Kishin Ashura caught the attack with a perfect **Moment Counter** for ${dmg} damage!`
          : `[${e.username}] Kishin Ashura used **Moment Counter** but nothing struck it, dealing ${dmg} damage.`);
      }
    }];

    // Passive: Iron Resolve. Every 7 seconds it recovers 5 stability.
    this.passives = [{
      name: "Iron Resolve",
      requires: function (e, t, s) { return e.stability < 100; },
      execute: function (e, t, s) {
        e.stability = Math.min(100, e.stability + 5);
        say(s, `[${e.username}] Kishin Ashura braced itself with **Iron Resolve** (+5 stability).`);
      },
      cd: 7000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["ashura", "kishin", "kishinashura"];
  }
}

module.exports = KishinAshura;
