const Discord = require("discord.js");

// EXP boost store. Boosts are saved on the user (xpBoost: {mult, until}) so they survive restarts.
// index.js reads info.xpBoost when a message earns EXP for the main bey.
const MULT = 2;
const MAX_STACK_MS = 2 * 60 * 60 * 1000; // total time on the clock can never exceed 2 hours
const PACKS = [
  { name: "1 Minute", ms: 60 * 1000, price: 100 },
  { name: "5 Minutes", ms: 5 * 60 * 1000, price: 450 },
  { name: "10 Minutes", ms: 10 * 60 * 1000, price: 850 },
  { name: "15 Minutes", ms: 15 * 60 * 1000, price: 1200 },
  { name: "30 Minutes", ms: 30 * 60 * 1000, price: 2200 },
  { name: "1 Hour", ms: 60 * 60 * 1000, price: 4000 }
];

function left(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const parts = [];
  if (h) parts.push(h + "h");
  if (m) parts.push(m + "m");
  if (!h && (r || !m)) parts.push(r + "s");
  return parts.join(" ");
}

module.exports.run = async (client, message, args, prefix, player, db) => {
  const stats = await db.collection("users").findOne({ _id: message.author.id });
  if (!stats) return message.reply(`you haven't started the game yet. Please type \`${prefix}start\` to begin the game.`);
  const now = Date.now();
  const active = stats.xpBoost && stats.xpBoost.until > now ? stats.xpBoost : null;

  if (args[0] && ["buy", "purchase"].includes(args[0].toLowerCase())) {
    const n = parseInt(args[1]);
    const pack = PACKS[n - 1];
    if (!pack) return message.reply(`pick a pack number from 1 to ${PACKS.length}, for example \`${prefix}xpshop buy 2\`.`);
    if ((stats.coins || 0) < pack.price) return message.reply(`you need ${pack.price} Valtz for that pack but only have ${stats.coins || 0}.`);
    const current = active ? active.until : now;
    const until = current + pack.ms;
    if (until - now > MAX_STACK_MS) return message.reply(`that would put you over the 2 hour limit. You have ${left(current - now)} left, so pick a shorter pack or wait.`);
    // charge and activate in one write, only if the player can still afford it
    const res = await db.collection("users").updateOne(
      { _id: message.author.id, coins: { $gte: pack.price } },
      { $inc: { coins: -pack.price }, $set: { xpBoost: { mult: MULT, until } } }
    );
    if (!res.matchedCount) return message.reply("you can't afford that pack anymore.");
    const embed = new Discord.MessageEmbed()
      .setTitle("EXP Boost purchased")
      .setColor("#50c878")
      .setDescription(`**x${MULT} EXP** for **${pack.name}** bought for <:valtz:899373217255407646>${pack.price}.\nTime left on your boost: **${left(until - now)}**.`)
      .setFooter(`Valtz: ${stats.coins - pack.price}`);
    return message.channel.createMessage({ embed });
  }

  const embed = new Discord.MessageEmbed()
    .setTitle("**EXP BOOST SHOP**")
    .setColor("#7f7fff")
    .setDescription(`Each boost gives **x${MULT} EXP** to your main Bey from chatting. Buying while a boost is active adds time (up to 2 hours total).\nBuy with \`${prefix}xpshop buy <number>\`.\n\n` +
      (active ? `Active boost: **x${active.mult || MULT}**, **${left(active.until - now)}** left.` : "You have no active EXP boost."));
  PACKS.forEach((p, i) => embed.addField(`**[${i + 1}]:** x${MULT} EXP, ${p.name}`, `Price: <:valtz:899373217255407646>${p.price}`, true));
  embed.setFooter(`Valtz: ${stats.coins}`).setTimestamp();
  message.channel.createMessage({ embed });
};

module.exports.help = {
  name: "xpshop",
  aliases: ["boostshop", "xpboost", "xps"],
  desc: "Buy timed EXP boosts.",
  usage: "xpshop - Show the EXP boost shop. xpshop buy <number> - Buy a boost."
};
