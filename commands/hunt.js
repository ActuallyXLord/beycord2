const Discord = require("discord.js");

const AI_ID = "827343111234519040";
const COOLDOWN = 3 * 60 * 1000;

// weight = how often it rolls, offset = opponent level relative to the player's bey,
// mult = reward multiplier
const DIFFICULTIES = [
  {name: "Easy", weight: 40, offset: -6, mult: 1},
  {name: "Normal", weight: 35, offset: -2, mult: 1.5},
  {name: "Hard", weight: 18, offset: 3, mult: 2.5},
  {name: "Nightmare", weight: 7, offset: 10, mult: 4}
];
const RARITIES = [
  {name: "Common", weight: 33, mult: 1, pool: "commonbeys"},
  {name: "Special", weight: 33, mult: 1.2, pool: "specialbeys"},
  {name: "Rare", weight: 17, mult: 1.5, pool: "rarebeys"},
  {name: "Legendary", weight: 7, mult: 2, pool: "legendarybeys"},
  {name: "Shadow", weight: 10, mult: 1.8, pool: "shadowbeys"}
];
const NAMES = ["Rogue Blader", "Street Challenger", "Rival Blader", "Masked Blader", "Wandering Blader", "Arena Veteran"];
const COLORS = {Easy: "#50c878", Normal: "#ffcf00", Hard: "#ff7600", Nightmare: "#b00020"};

function roll(list){
  const total = list.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for(const item of list){ r -= item.weight; if(r < 0) return item; }
  return list[0];
}

module.exports.run = async (client, message, args, prefix, player, db) => {
  const stats = await db.collection("users").findOne({_id: message.author.id});
  if(!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);
  if(stats.states && stats.states.inBattle === true) return message.reply(`you are already in a battle. If you are stuck, do \`${prefix}resetstates\`.`);
  const mine = stats.beys[stats.main];
  if(!mine) return message.reply("you don't have a bey to fight with.");
  if(mine.broken === true) return message.reply("your main bey is broken. Repair it or switch to another bey first.");
  const now = Date.now();
  if((stats.huntReadyAt || 0) > now){
    const left = stats.huntReadyAt - now;
    return message.reply(`your bey is still recovering. Hunt again in **${Math.floor(left / 60000)}m ${Math.ceil((left % 60000) / 1000)}s**.`);
  }

  // Owner-only: `;hunt hard` forces a difficulty (for testing).
  const forced = message.author.id === process.env.ownerID && args[0] ? DIFFICULTIES.find(d => d.name.toLowerCase() === args[0].toLowerCase()) : null;
  const diff = forced || roll(DIFFICULTIES);
  const rar = roll(RARITIES);
  const pool = Array.from((client[rar.pool] || new Map()).keys()).filter(n => client.beys.has(n));
  if(!pool.length) return message.reply("no opponents are available right now. Try again later.");
  const beyName = pool[Math.floor(Math.random() * pool.length)];
  const level = Math.max(1, Math.min(100, mine.level + diff.offset));
  const scale = diff.mult * rar.mult;
  const pve = {
    label: NAMES[Math.floor(Math.random() * NAMES.length)],
    beyName, level,
    difficulty: diff.name, rarity: rar.name,
    coins: Math.round((30 + Math.floor(Math.random() * 21)) * scale),
    xp: Math.round(10 * scale),
    consolationXp: Math.max(2, Math.round(3 * diff.mult))
  };

  // Claim the cooldown and the battle slot in one atomic step.
  const claim = await db.collection("users").updateOne(
    {_id: message.author.id, "states.inBattle": {$ne: true}, $or: [{huntReadyAt: {$exists: false}}, {huntReadyAt: {$lte: now}}]},
    {$set: {huntReadyAt: now + COOLDOWN, "states.inBattle": true}}
  );
  if(!claim.matchedCount) return message.reply("you can't start a hunt right now.");

  const intro = new Discord.MessageEmbed()
    .setColor(COLORS[diff.name])
    .setTitle(`${pve.label} challenges you!`)
    .setDescription(`**${diff.name}** | **${rar.name}** ${beyName} (Level ${level})\nWin to earn **${pve.coins} Valtz** and **${pve.xp} XP**.`);
  try{
    await message.channel.createMessage({embed: intro});
    const msg = await client.createMessage(message.channel.id, "Waiting for battle...");
    const ai = {id: AI_ID, username: pve.label, discriminator: "0001", avatarURL: client.user.avatarURL, bot: true};
    require("./battlesystemv3.js").run(client, message, args, db, prefix, message.author, ai, msg, pve);
  }catch(err){
    console.error("Hunt failed to start:", err);
    db.collection("users").updateOne({_id: message.author.id}, {$set: {"states.inBattle": false, huntReadyAt: 0}});
    message.channel.createMessage("The hunt failed to start. Try again.").catch(() => {});
  }
};

module.exports.help = {
  name: "hunt",
  aliases: ["pve", "fightbot"]
};
