const Beyblade = require("./Beyblade.js");

// Owner-only custom bey (left spin). Not in any spawn list in index.js, so it never drops randomly.
class MeteorDragoon extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Meteor Dragoon",
      "Attack",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/MeteorDragoon.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };

    // Special: Dragonic Overdrive. Needs 2 charges. A very powerful attack that hits hard and shakes the opponent.
    this.specials = [{
      name: "Dragonic Overdrive",
      requires: function (e, t, s) { return e.sp >= 2; },
      execute: function (e, t, s) {
        const dmg = Math.round(70 + (e.lvl || 1) * 0.5);
        t.hp -= dmg;
        t.stability -= 15;
        e.sp -= 2;
        say(s, `[${e.username}] Meteor Dragoon used **Dragonic Overdrive** and smashed the opponent for ${dmg} damage.`);
      }
    }];

    // Passive: Spin Steal. Every 12 seconds it siphons 0.4 stamina from the opponent.
    this.passives = [{
      name: "Spin Steal",
      requires: function (e, t, s) { return t.stamina > 0.4; },
      execute: function (e, t, s) {
        t.stamina -= 0.4;
        e.stamina = Math.min(10, e.stamina + 0.4);
        say(s, `[${e.username}] Meteor Dragoon stole 0.4 stamina with **Spin Steal**.`);
      },
      cd: 12000
    }];

    this.modes = [];
    this.sd = 1;
    this.sdchangable = false;
    this.aliases = ["meteor", "meteordragoon"];
  }
}

module.exports = MeteorDragoon;
