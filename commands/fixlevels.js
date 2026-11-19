const Discord = require("discord.js");

// A bey only earns xp when its generation matches its level (see index.js): under level 20 any gen,
// 20-39 needs gen 2, 40-59 gen 3, 60-79 gen 4, 80-99 gen 5. At exactly 20/40/60/80 it may sit on the
// old gen while it waits for ;upgrade. Anything else is a stuck bey, and this command repairs it.
function validGens(level){
  const base = Math.min(5, Math.floor(level / 20) + 1);
  if(level >= 20 && level < 100 && level % 20 === 0) return [base - 1, base];
  return [base];
}

module.exports.run = async (client, message, args, prefix, player, db) => {
  if(message.author.id !== process.env.ownerID) return;
  if(!args[0]) return message.channel.createMessage(`Usage: \`${prefix}fixlevels <@user|id|all> [check]\`. \`check\` only shows what would change.`);
  const check = args.some(a => a.toLowerCase() === "check");
  let query;
  if(args[0].toLowerCase() === "all") query = {};
  else{
    const id = message.mentions && message.mentions[0] ? message.mentions[0].id : args[0].replace(/[<@!>]/g, "");
    query = {_id: id};
  }
  const users = await db.collection("users").find(query).toArray();
  if(!users.length) return message.channel.createMessage("I found no player with a game profile.");
  const lines = [];
  let fixed = 0, waiting = 0;
  for(const u of users){
    if(!Array.isArray(u.beys)) continue;
    const set = {};
    u.beys.forEach((b, i) => {
      if(!b || typeof b.level !== "number") return;
      const name = b.bbname || b.name;
      const gen = b.gen || 1;
      const valid = validGens(b.level);
      if(!valid.includes(gen)){
        const target = valid[valid.length - 1];
        set[`beys.${i}.gen`] = target;
        fixed++;
        lines.push(`<@${u._id}> ${name}: level ${b.level}, gen ${gen} -> **gen ${target}**`);
      } else if(b.level >= 20 && b.level < 100 && b.level % 20 === 0 && gen === b.level / 20){
        waiting++;
        if(args[0].toLowerCase() !== "all") lines.push(`<@${u._id}> ${name}: level ${b.level} is the cap for gen ${gen}. It needs **${prefix}upgrade** (25 stars) to keep leveling.`);
      }
    });
    if(!check && Object.keys(set).length) await db.collection("users").updateOne({_id: u._id}, {$set: set});
  }
  const embed = new Discord.MessageEmbed()
    .setColor(fixed ? "#50c878" : "#7f7fff")
    .setTitle(check ? `Level check: ${fixed} problem(s) found` : `Level fix: ${fixed} change(s) made`)
    .setDescription((lines.slice(0, 20).join("\n") || "Nothing is wrong with these beys.") + (lines.length > 20 ? `\n...and ${lines.length - 20} more.` : "") + (waiting && args[0].toLowerCase() === "all" ? `\n\n${waiting} bey(s) are at a level cap and wait for an upgrade.` : ""));
  message.channel.createMessage({embed: embed});
};

module.exports.help = {
  name: "fixlevels",
  aliases: ["fixlevel", "fixbeys"]
};
