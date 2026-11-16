module.exports.run = async (client, message, args, prefix, player, db) => {
  if(message.author.id !== process.env.ownerID) return;
  const bosses = Array.from(client.bosses.values());
  let chosen;
  if(args[0]){
    const q = args.join(" ").toLowerCase().replace(/[^a-z0-9]/g, "");
    chosen = bosses.find(B => new B().name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q));
    if(!chosen) return message.channel.createMessage("Unknown boss. Available: " + bosses.map(B => new B().name).join(", "));
  }
  client.bosssystems.get("bosssystem").run(client, message, prefix, null, db, chosen).catch(err => {
    console.error("Boss spawn failed:", err);
    message.channel.createMessage("Boss spawn failed: " + err.message);
  });
};

module.exports.help = {
  name: "boss",
  aliases: ["spawnboss"]
};
