const Discord = require("discord.js");

const AI_ID = "827343111234519040";

// Owner-only training dummy. It never attacks, never uses abilities, and its HP, stability and stamina
// refill after every round. Pick "End Training" in the move menu to stop. No rewards, no cooldown.
// `;dummy` uses a dummy at your bey's level, `;dummy <level>` sets the dummy's level (1-100).
module.exports.run = async (client, message, args, prefix, player, db) => {
  if(message.author.id !== process.env.ownerID) return message.reply("only the bot owner can use the training dummy.");
  const stats = await db.collection("users").findOne({_id: message.author.id});
  if(!stats) return message.reply(`you haven't started the game yet. Type \`${prefix}start\` to begin.`);
  if(stats.states && stats.states.inBattle === true) return message.reply(`you are already in a battle. If you are stuck, do \`${prefix}resetstates\`.`);
  const mine = stats.beys[stats.main];
  if(!mine) return message.reply("you don't have a bey to fight with.");

  const beyName = client.beys.has("Wild Wyvern") ? "Wild Wyvern" : Array.from(client.beys.keys())[0];
  const asked = parseInt(args[0]);
  const level = Math.max(1, Math.min(100, Number.isNaN(asked) ? mine.level : asked));
  const pve = {label: "Training Dummy", dummy: true, isBoss: false, beyName, level, difficulty: "Easy", rarity: "Common", coins: 0, xp: 0, consolationXp: 0, gv: 0};

  const claim = await db.collection("users").updateOne({_id: message.author.id, "states.inBattle": {$ne: true}}, {$set: {"states.inBattle": true}});
  if(!claim.matchedCount) return message.reply("you can't start a training session right now.");
  try{
    const intro = new Discord.MessageEmbed()
      .setColor("#7f7fff")
      .setTitle("Training Dummy")
      .setDescription(`A level ${level} dummy that doesn't fight back. Its HP, stability and stamina refill every round.\nTry your attacks, specials and passives. Choose **End Training** in the move menu to stop.`);
    await message.channel.createMessage({embed: intro});
    const msg = await client.createMessage(message.channel.id, "Waiting for battle...");
    const ai = {id: AI_ID, username: "Training Dummy", discriminator: "0001", avatarURL: client.user.avatarURL, bot: true};
    require("./battlesystemv3.js").run(client, message, args, db, prefix, message.author, ai, msg, pve);
  }catch(err){
    console.error("Dummy failed to start:", err);
    db.collection("users").updateOne({_id: message.author.id}, {$set: {"states.inBattle": false}});
    message.channel.createMessage("The training session failed to start. Try again.").catch(() => {});
  }
};

module.exports.help = {
  name: "dummy",
  aliases: ["training", "dummybot"],
  desc: "Owner only. Fight a dummy that doesn't fight back.",
  usage: "dummy [level]"
};
