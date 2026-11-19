const Beyblade = require("./Beyblade.js");

// Custom bey (right spin, Attack). Not in any spawn list in index.js, so it never drops randomly. Give it with ;gift.
class BahamutBlitz extends Beyblade {
  constructor(firstOwner, id) {
    super(
      "Bahamut Blitz",
      "Attack",
      "https://raw.githubusercontent.com/ActuallyXLord/beycord2/dev/BahamutBlitz.png",
      firstOwner,
      id
    );
    const say = (logger, text) => { try { if (logger && typeof logger.add === "function") logger.add(text); } catch (e) {} };
    const MAX_SPEED = 5;

    // Special: Divine Roar. Needs 3 charges. Damage grows with the speed built up by Ignition Bit:
    // no speed = (95 + 0.7 x level), full speed (5 stacks) = 3.25x that. Spending it resets the speed.
    this.specials = [{
      name: "Divine Roar",
      requires: function (e, t, s) { return e.sp >= 3; },
      execute: function (e, t, s) {
        const speed = e.speed || 0;
        const dmg = Math.round((95 + (e.lvl || 1) * 0.7) * (1 + 0.45 * speed));
        t.hp -= dmg;
        t.stability -= 20;
        e.stability -= 8; // the recoil of a full-power roar
        e.sp -= 3;
        e.atk -= 2 * speed; // the speed bonus is spent
        e.speed = 0;
        say(s, `[${e.username}] Bahamut Blitz let out a **Divine Roar** at ${speed} speed for ${dmg} damage!`);
      }
    }];

    // Passive: Ignition Bit. Every 6 seconds it picks up another stack of speed (max 5). Each stack adds +2 attack
    // to normal hits and boosts Divine Roar, at the cost of a little stamina.
    this.passives = [{
      name: "Ignition Bit",
      requires: function (e, t, s) { return (e.speed || 0) < MAX_SPEED; },
      execute: function (e, t, s) {
        e.speed = (e.speed || 0) + 1;
        e.atk += 2;
        e.stamina = Math.max(0.5, e.stamina - 0.2);
        say(s, `[${e.username}] Bahamut Blitz's **Ignition Bit** bites the stadium floor: speed ${e.speed}/${MAX_SPEED}.`);
      },
      cd: 6000
    }];

    this.modes = [];
    this.sd = 0;
    this.sdchangable = false;
    this.aliases = ["bahamut", "blitz", "bahamutblitz"];
  }
}

module.exports = BahamutBlitz;
