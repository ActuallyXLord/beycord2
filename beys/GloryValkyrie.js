const Beyblade = require("./Beyblade.js");

// Custom bey. Not in any spawn list in index.js, so it never drops randomly.
class GloryValkyrie extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Glory Valkyrie",
      "Attack",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/GloryValkyrie.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    // Special: Chrono Tempest. Needs 2 charges. The flagship attack: a storm of rapid strikes for heavy damage.
    this.specials = [{
      name: "Chrono Tempest",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(65 + (e.lvl || 1) * 0.5);
        t.hp -= dmg;
        t.stability -= 12;
        e.sp -= 2;
        say(s, `[${e.username}] Glory Valkyrie unleashed **Chrono Tempest** for ${dmg} damage.`);
      }
    }];

    // Passive: Spring Rebound. Every 14 seconds it rebounds off the stadium wall on its spring blades and hits the opponent.
    this.passives = [{
      name: "Spring Rebound",
      requires: function (e, t, s) { return t.hp > 0; },
      execute: function (e, t, s) {
        const dmg = Math.round(14 + (e.lvl || 1) * 0.2);
        t.hp -= dmg;
        t.stability -= 3;
        say(s, `[${e.username}] Glory Valkyrie rebounded off the wall with **Spring Rebound** for ${dmg} damage.`);
      },
      cd: 14000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["glory", "gloryvalkyrie"];
  }
}

module.exports = GloryValkyrie;
