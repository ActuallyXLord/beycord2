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

    // Special: Spring Rebound (same spring-blade gimmick as God Valkyrie's Jet Bound Launch).
    // Needs 2 charges. Rebounds off the stadium walls for a hard hit, refunds stamina and shakes the opponent.
    this.specials = [{
      name: "Spring Rebound",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(35 + (e.lvl || 1) * 0.3);
        t.hp -= dmg;
        t.stability -= 8;
        e.stamina = Math.min(10, e.stamina + 1);
        e.sp -= 2;
        say(s, `[${e.username}] Glory Valkyrie used **Spring Rebound**: it bounced off the walls on its spring blades for ${dmg} damage and kept its spin.`);
      }
    }];

    this.passives = [];
    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["glory", "gloryvalkyrie"];
  }
}

module.exports = GloryValkyrie;
