const Beyblade = require("./Beyblade.js");

// Custom bey (right spin, Balance). Not in any spawn list in index.js, so it never drops randomly. Give it with ;gift.
class SuppressSuperion extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Suppress Superion",
      "Balance",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/SuppressSuperion.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    // One special slot with two moves behind it (the battle engine uses the first special).
    // Needs 2 energy to select. With 3+ energy there is a 30% chance of Final Requiem, otherwise Counter Break.
    this.specials = [{
      name: "Counter Break / Final Requiem",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const lvl = e.lvl || 1;
        if (e.sp >= 3 && Math.random() < 0.3) {
          // Final Requiem: the big one. Costs 3 energy.
          const dmg = Math.round(110 + lvl * 0.8);
          t.hp -= dmg;
          t.stability -= 20;
          e.sp -= 3;
          say(s, `[${e.username}] Suppress Superion unleashed **Final Requiem** for ${dmg} damage.`);
        } else {
          // Counter Break: medium damage, and 50% more if the opponent attacked this round. Costs 2 energy.
          const countered = t.move === "attack";
          const dmg = Math.round((40 + lvl * 0.3) * (countered ? 1.5 : 1));
          t.hp -= dmg;
          t.stability -= countered ? 10 : 5;
          e.sp -= 2;
          say(s, countered
            ? `[${e.username}] Suppress Superion read the attack and hit back with **Counter Break** for ${dmg} damage.`
            : `[${e.username}] Suppress Superion used **Counter Break** for ${dmg} damage.`);
        }
      }
    }];

    // Passive: Steady Core. Every 10 seconds it recovers 3 stability.
    this.passives = [{
      name: "Steady Core",
      requires: function (e, t, s) { return e.stability < 100; },
      execute: function (e, t, s) {
        e.stability = Math.min(100, e.stability + 3);
        say(s, `[${e.username}] Suppress Superion steadied itself with **Steady Core** (+3 stability).`);
      },
      cd: 10000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["superion", "suppresssuperion"];
  }
}

module.exports = SuppressSuperion;
