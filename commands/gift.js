// Owner-only: give a player a bey or items.
//   ;gift <@player|id> bey <bey name> [level]
//   ;gift <@player|id> item <item name> [amount]
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

function findByName(map, query) {
  const q = norm(query);
  const names = [...map.keys()];
  const exact = names.filter(n => norm(n) === q);
  if (exact.length === 1) return {name: exact[0]};
  const part = names.filter(n => norm(n).includes(q));
  if (part.length === 1) return {name: part[0]};
  if (part.length > 1) return {options: part.slice(0, 8)};
  return {};
}

module.exports.run = async (client, message, args, prefix, player, db) => {
  if (message.author.id !== process.env.ownerID) return;
  const usage = `Usage:\n\`${prefix}gift <@player|id> bey <bey name> [level]\`\n\`${prefix}gift <@player|id> item <item name> [amount]\``;
  if (args.length < 3) return message.channel.createMessage(usage);
  const m = String(args[0]).match(/\d{15,}/);
  if (!m) return message.channel.createMessage("I couldn't read that player. Mention them or paste their ID.\n" + usage);
  const targetId = m[0];
  const target = await db.collection("users").findOne({_id: targetId});
  if (!target) return message.channel.createMessage("That player has not started the game yet.");
  const kind = args[1].toLowerCase();
  const rest = args.slice(2);

  if (kind === "bey") {
    let level = 1;
    if (rest.length > 1 && /^\d+$/.test(rest[rest.length - 1])) level = Math.min(100, Math.max(1, parseInt(rest.pop())));
    const found = findByName(client.beys, rest.join(" "));
    if (found.options) return message.channel.createMessage("That matches several beys: " + found.options.join(", ") + ". Be more specific.");
    if (!found.name) return message.channel.createMessage("No bey with that name.");
    const cons = client.beys.get(found.name);
    const bey = new cons(targetId);
    bey.level = level;
    bey.xp = (level - 1) * 300;
    // xp only flows while the generation matches the level range
    bey.gen = Math.min(5, Math.floor(level / 20) + 1);
    await db.collection("users").updateOne({_id: targetId}, {$push: {beys: bey}});
    return message.channel.createMessage(`Gave <@${targetId}> a level ${level} ${bey.name}.`);
  }

  if (kind === "item") {
    let amount = 1;
    if (rest.length > 1 && /^\d+$/.test(rest[rest.length - 1])) amount = Math.min(25, Math.max(1, parseInt(rest.pop())));
    const found = findByName(client.items, rest.join(" "));
    if (found.options) return message.channel.createMessage("That matches several items: " + found.options.join(", ") + ". Be more specific.");
    if (!found.name) return message.channel.createMessage("No item with that name. Available: " + [...client.items.keys()].join(", "));
    const cons = client.items.get(found.name);
    const items = [];
    for (let i = 0; i < amount; i++) items.push(new cons());
    await db.collection("users").updateOne({_id: targetId}, {$push: {items: {$each: items}}});
    return message.channel.createMessage(`Gave <@${targetId}> ${amount} x ${items[0].name}.`);
  }

  return message.channel.createMessage(usage);
};

module.exports.help = {
  name: "gift",
  aliases: ["give"]
};
