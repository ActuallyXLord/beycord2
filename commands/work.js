const Discord = require("discord.js");

// Work for 100-400 Valtz. The better the payout, the longer the cooldown (5 to 10 minutes).
const MIN_PAY = 100, MAX_PAY = 400;
const MIN_CD = 5 * 60 * 1000, MAX_CD = 10 * 60 * 1000;

const jobs = [
  "repaired launchers at the Beyblade shop",
  "refereed a local tournament",
  "delivered Beyblade parts around town",
  "cleaned the stadium after a big battle",
  "tuned up bey bearings for a customer",
  "sold snacks at a championship match",
  "tested new launcher grips",
  "painted a battle stadium",
  "coached a beginner blader",
  "sorted a crate of spare parts"
];

module.exports.run = async (client, message, args, prefix, player, db) => {
  const stats = await db.collection("users").findOne({_id: message.author.id});
  if(!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);
  const now = Date.now();
  const ready = stats.workReadyAt || 0;
  if(ready > now){
    const left = ready - now;
    const mins = Math.floor(left / 60000), secs = Math.ceil((left % 60000) / 1000);
    return message.reply(`you're still tired from your last shift. Try again in **${mins}m ${secs}s**.`);
  }
  const pay = MIN_PAY + Math.floor(Math.random() * (MAX_PAY - MIN_PAY + 1));
  const cooldown = Math.round(MIN_CD + ((pay - MIN_PAY) / (MAX_PAY - MIN_PAY)) * (MAX_CD - MIN_CD));
  // Only pay out if the cooldown is still clear in the database (stops double-spending the command).
  const res = await db.collection("users").updateOne(
    {_id: message.author.id, $or: [{workReadyAt: {$exists: false}}, {workReadyAt: {$lte: now}}]},
    {$inc: {coins: pay}, $set: {workReadyAt: now + cooldown}}
  );
  if(!res.matchedCount) return message.reply("you're still tired from your last shift. Try again in a moment.");
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const embed = new Discord.MessageEmbed()
    .setTitle(`You ${job} and earned ${pay} Valtz.`)
    .setDescription(`You can work again in **${Math.round(cooldown / 60000 * 10) / 10} minutes**.`)
    .setColor("#50c878");
  message.channel.createMessage({embed: embed});
};

module.exports.help = {
  name: "work",
  aliases: ["job", "w"]
};
