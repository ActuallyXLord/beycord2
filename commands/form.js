// ;form [attack|defense|stamina|balance] - switch the mode of a bey that supports mode change (e.g. Honor Achilles).
// The choice is saved on the bey and applied at the start of its next battle.
module.exports.run = async (client, message, args, prefix, player, db) => {
  const stats = await db.collection("users").findOne({_id: message.author.id});
  if(!stats) return message.reply(`you haven't started the game yet. Type \`${prefix}start\` to begin.`);
  const bey = stats.beys[stats.main];
  if(!bey) return message.reply("you don't have a main bey.");
  const cls = client.beys.get(bey.name);
  const example = cls ? new cls("1", "1") : null;
  if(!example || !Array.isArray(example.forms)) return message.reply(`${bey.name} can't change modes.`);
  const current = bey.form && example.forms.includes(bey.form) ? bey.form : example.type;
  if(!args[0]) return message.reply(`**${bey.name}** is in **${current}** mode. Choose one of ${example.forms.map(f => `\`${f.toLowerCase()}\``).join(", ")} with \`${prefix}form <mode>\`.`);
  const want = example.forms.find(f => f.toLowerCase() === args[0].toLowerCase() || f.toLowerCase().startsWith(args[0].toLowerCase()));
  if(!want) return message.reply(`unknown mode. Choose one of ${example.forms.map(f => `\`${f.toLowerCase()}\``).join(", ")}.`);
  if(stats.states && stats.states.inBattle === true) return message.reply("you can't change modes during a battle.");
  await db.collection("users").updateOne({_id: message.author.id}, {$set: {[`beys.${stats.main}.form`]: want}});
  message.channel.createMessage(`**${bey.name}** switched to **${want}** mode. It takes effect in your next battle.`);
};

module.exports.help = {
  name: "form",
  aliases: ["mode", "modechange", "changemode"],
  desc: "Change the mode of a bey that supports it.",
  usage: "form [attack|defense|stamina|balance]"
};
