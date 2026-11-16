const https = require("https");

// The custom emojis the bot's code refers to (they used to live on the original author's servers).
const EMOJIS = [
  ["valtz", "899373217255407646"], ["valtz", "863052675968925716"], ["emptybar", "870717057656832010"],
  ["barfilled", "870717057891717201"], ["startbarfilled", "870717057723940894"], ["startbar", "870717057350647881"],
  ["endbar", "870717057598124112"], ["endbarfilled", "870717057518403594"], ["premiumvaltz", "899373241557209158"],
  ["premiumgt", "863052676077453372"], ["goldenvaltz", "863052675321823233"], ["giveawayticket", "863052676182966293"],
  ["haoyunshu", "669481031400816650"], ["versus", "898767596940308530"], ["level0", "722078650190528583"],
  ["black", "721678218859511829"], ["premiumbadge", "870768171592872007"], ["Stamina", "863052677213716530"],
  ["Defense", "863052677209915412"], ["Balance", "863052677193269249"], ["Balance", "760560740750458901"],
  ["Attack", "863052677357109258"], ["alert", "888867336457715772"], ["alert", "724198069226438686", true]
];

function download(url){
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if(res.statusCode !== 200){ res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

module.exports.run = async (client, message, args, prefix, player, db) => {
  if(message.author.id !== process.env.ownerID) return;
  const appId = client.user.id;
  const base = `/applications/${appId}/emojis`;
  let existing = {};
  try{
    const list = await client.requestHandler.request("GET", base, true);
    (list.items || []).forEach(e => { existing[e.name] = e; });
  }catch(err){
    return message.channel.createMessage("I couldn't read the bot's emoji list: " + (err.message || err));
  }
  const map = {};
  let created = 0, reused = 0;
  const failed = [];
  for(const [name, id, animated] of EMOJIS){
    const newName = `bc_${name.toLowerCase()}_${id.slice(-4)}`;
    try{
      let e = existing[newName];
      if(e) reused++;
      else{
        const ext = animated ? "gif" : "png";
        const img = await download(`https://cdn.discordapp.com/emojis/${id}.${ext}?size=128`);
        e = await client.requestHandler.request("POST", base, true, {name: newName, image: `data:image/${ext};base64,${img.toString("base64")}`});
        created++;
      }
      map[id] = {name: e.name, id: e.id, animated: !!e.animated};
    }catch(err){
      failed.push(`${name} (${id}): ${err.message || err}`);
    }
  }
  await db.collection("settings").updateOne({_id: "emojimap"}, {$set: {map}}, {upsert: true});
  client.emojiMap = map;
  let text = `Emoji setup done. Created ${created}, reused ${reused}, failed ${failed.length}.`;
  if(failed.length) text += "\n" + failed.slice(0, 6).join("\n");
  text += `\nTest: <:valtz:899373217255407646> <:versus:898767596940308530> <:Attack:863052677357109258>`;
  message.channel.createMessage(text);
};

module.exports.help = {
  name: "emojisetup",
  aliases: []
};
