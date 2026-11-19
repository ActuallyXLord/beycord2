const Beyblade = require("./Beyblade.js");

// Custom bey (right spin). Not in any spawn list in index.js, so it never drops randomly. Give it with ;gift.
// Mode change: the owner picks Attack, Defense, Stamina or Balance with ;form before a battle. The battle engine
// (battlesystemv3.js) reads `forms` and treats the bey as that type for the whole fight.
class HonorAchilles extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Honor Achilles",
      "Balance",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/HonorAchilles.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    this.forms = ["Attack", "Defense", "Stamina", "Balance"];
    this.damageTaken = 0.85; // natural defense: basic attacks against it do 15% less damage

    // Special: Honor Breaker. Needs 2 charges. A strong strike. Its form changes the finish:
    // Attack form hits 15% harder, Defense form also steadies Achilles, Stamina form also steals spin.
    this.specials = [{
      name: "Honor Breaker",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const form = e.bey.type;
        let dmg = 75 + (e.lvl || 1) * 0.55;
        if (form === "Attack") dmg *= 1.15;
        dmg = Math.round(dmg);
        t.hp -= dmg;
        t.stability -= 14;
        e.sp -= 2;
        let extra = "";
        if (form === "Defense") { e.stability = Math.min(100, e.stability + 10); extra = " and steadied itself (+10 stability)"; }
        if (form === "Stamina") {
          const stolen = Math.min(1, Math.max(0, t.stamina));
          t.stamina -= stolen;
          e.stamina = Math.min(10, e.stamina + stolen);
          extra = ` and drew ${stolen.toFixed(1)} stamina`;
        }
        say(s, `[${e.username}] Honor Achilles struck with **Honor Breaker** for ${dmg} damage${extra}.`);
      }
    }];

    // Passive: Honor Guard. Every 8 seconds it recovers 6 stability.
    this.passives = [{
      name: "Honor Guard",
      requires: function (e, t, s) { return e.stability < 100; },
      execute: function (e, t, s) {
        e.stability = Math.min(100, e.stability + 6);
        say(s, `[${e.username}] Honor Achilles held its ground with **Honor Guard** (+6 stability).`);
      },
      cd: 8000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["honor", "honorachilles"];
  }
}

module.exports = HonorAchilles;
