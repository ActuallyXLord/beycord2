const Discord = require("discord.js");

// Level caps: a bey must reach the cap of its current generation before it can be upgraded.
const CAPS = {1: 20, 2: 40, 3: 60, 4: 80};

module.exports.run = async (client, message, args, prefix, player, db) => {
    let stats = await db.collection("users").findOne({_id: message.author.id});
    if(!stats) return message.reply(`you haven't started the game yet. Type \`\`${prefix}start\`\` to begin.`);
    let main = stats.beys[stats.main];
    let gen = main.gen || 1;
    let cap = CAPS[gen];
    if(!cap) return message.channel.createMessage("It looks like your equipped Bey does not need another upgrade.");
    if(main.level < cap) return message.channel.createMessage(`*Upgrade failed!*. Please reach the current level cap (Level ${cap}) before attempting an upgrade.`);
    if((stats.stars || 0) < 25) return message.channel.createMessage("*Upgrade failed!* You don't have enough stars.");
    let newGen = gen + 1;
    stats.beys[stats.main].gen = newGen;
    await db.collection("users").updateOne({_id: message.author.id}, {$set: {beys: stats.beys, stars: stats.stars - 25}});
    let embed = new Discord.MessageEmbed()
        .setTitle(`${main.bbname || main.name} is now upgraded to Generation ${newGen}!`)
        .setColor("#7f7fff")
        .setTimestamp();
    if(main.image) embed.setThumbnail(main.image);
    message.channel.createMessage({embed: embed});
}

module.exports.help = {
    name: "upgrade",
    desc: "Upgrades your equipped Bey to it's next generation.",
    usage: "upgrade <bey index>",
    aliases: ["genup", "generationup"],
    cooldown: 10
} 