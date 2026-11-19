const Discord = require("discord.js");
const jimp = require("jimp");
const fs = require("fs");
const Logger = require("./Logger.js");

// Makes a flat (non-transparent) background transparent by flood-filling from the image border.
function removeBg(img) {
  const w = img.bitmap.width, h = img.bitmap.height, d = img.bitmap.data;
  const px = (x, y) => (y * w + x) * 4;
  const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].map(([x, y]) => px(x, y));
  if (corners.some(i => d[i + 3] < 200)) return img; // already transparent
  const bg = [0, 1, 2].map(c => corners.reduce((a, i) => a + d[i + c], 0) / 4);
  if (corners.some(i => Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 40)) return img; // corners disagree, not a flat background
  const dist = i => Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const k = y * w + x; if (seen[k]) return; if (dist(k * 4) > 60) return; seen[k] = 1; stack.push(k); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) { const k = stack.pop(), x = k % w, y = (k - x) / w; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  for (let k = 0; k < w * h; k++) if (seen[k]) d[k * 4 + 3] = 0;
  // soften the edge: border pixels that are close to the background colour become half transparent
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const k = y * w + x;
    if (seen[k] || !(seen[k - 1] || seen[k + 1] || seen[k - w] || seen[k + w])) continue;
    if (dist(k * 4) < 120) d[k * 4 + 3] = 110;
  }
  return img;
}

async function countdown(message, opponent1, opponent2, player, prefix, client, msg, logger){
  setTimeout(() => {
    msg.edit("3");
    setTimeout(() => {
      msg.edit("2");
      setTimeout(() => {
        msg.edit("1");
        setTimeout(() => {
          let motto = ["**Let it rip!**", "**Go shoot!**"];
          let mt =  Math.floor(Math.random() * motto.length);
          msg.edit(motto[mt]);
          awaitMoves(message, opponent1, opponent2, player, prefix, client, logger);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

async function awaitMoves(message, opponent1, opponent2, player, prefix, client, logger){
  let member1 = await message.guild.getRESTMember(opponent1.id);
  let member2 = await message.guild.getRESTMember(opponent2.id);
  if(opponent2.pve) member2 = {effectiveName: opponent2.pve.label};
  let paused = false;
  let state = "Began";
  let row = new Discord.MessageActionRow()
  .addComponents(
    new Discord.MessageSelectMenu()
    .setCustomId('actionselect')
    .setPlaceholder('Select a move')
    .addOptions([
      {label: "Attack", description: "Decreases the opponent's HP, and decreases your stability.", value: 'attack'},
      {label: "Spin", description: "Increases your stamina.", value: 'spin'},
      {label: "Defend", description: "Increases your stability.", value: 'defend'},
      {label: "Charge", description: "Charges your special move.", value: 'charge'},
      {label: "Special", description: "Use your bey's special move (needs energy).", value: 'special'}
    ]).setMaxValues(1))
  let embed = new Discord.MessageEmbed()
  .setTitle(`${member1.effectiveName} <:versus:898767596940308530> ${member2.effectiveName}`)
  .setColor("#7f7fff")
  .setDescription(`Status: **${state}**`)
  .addField(`__**${member1.effectiveName}**__`, `*Level ${opponent1.lvl} ${opponent1.bey.bbname || opponent1.bey.name} | ${opponent1.sd}*\n**HP:** ${Math.round(opponent1.hp)}\n**Stamina:** ${opponent1.stamina.toFixed(1)}\n**Stability:** ${opponent1.stability}%\n**Energy:** ${opponent1.sp}`, true)
  .addField(`__**${member2.effectiveName}**__`, `*Level ${opponent2.lvl} ${opponent2.bey.bbname || opponent2.bey.name} | ${opponent2.sd}*\n**HP:** ${Math.round(opponent2.hp)}\n**Stamina:** ${opponent2.stamina.toFixed(1)}\n**Stability:** ${opponent2.stability}%\n**Energy:** ${opponent2.sp}`, true)
  .setImage(`attachment://${opponent1.id}-${opponent2.id}.png`);

  // The battle image is rendered in the background; wait for it (up to 20s) instead of crashing if it is slow.
  const imagePath = `/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`;
  let battleimage = null;
  for(let i = 0; i < 40 && !battleimage; i++){
    try { battleimage = fs.readFileSync(imagePath); } catch(e) { await new Promise(r => setTimeout(r, 500)); }
  }
  const imageFile = () => battleimage ? {file: battleimage, name: `${opponent1.id}-${opponent2.id}.png`} : undefined;

  let be = await client.createMessage(message.channel.id, {embed:embed, components: [row]}, imageFile()).catch(err => {
    player.collection("users").updateOne({_id: opponent1.id}, {$set: {"states.inBattle": false}});
    player.collection("users").updateOne({_id: opponent2.id}, {$set: {"states.inBattle": false}});
    message.channel.createMessage("I failed to send the battle message! Please make sure I have the permissions to send embedded links and attach files to my messages. Inform a moderator of this server about this if you can't fix it.")
    return;
  });

  if(!be) return;
  if(opponent1.item && opponent1.item.avatarStart) opponent1.item.avatarStart(opponent1, opponent2, logger);
  if(opponent2.item && opponent2.item.avatarStart) opponent2.item.avatarStart(opponent2, opponent1, logger);
  
  
  const AI_ID = "827343111234519040";
  const aiPick = (ai, other) => {
    const sp = (ai.bey.specials || [])[0];
    let ok = false;
    try { ok = sp && sp.requires(ai, other, logger); } catch(e) { ok = false; }
    // How well the bot manages itself, by difficulty (plain AI battles count as Hard).
    const skill = opponent2.pve ? ({Easy: 0.25, Normal: 0.5, Hard: 0.85, Nightmare: 1, Boss: 1})[opponent2.pve.difficulty] || 0.5 : 0.95;
    const r = Math.random();
    // Every round costs about 1.5 stamina, so below 3 the bot has to spin or it loses by survivor.
    if(ai.stamina < 3 && Math.random() < skill) return "spin";
    if(ai.stability < 30 && Math.random() < skill) return "defend";
    if(ok && Math.random() < 0.15 + 0.55 * skill) return "special";
    if(skill > 0.9 && sp && ai.sp < 2 && r < 0.25) return "charge";
    return ["attack", "attack", "spin", "defend"][Math.floor(Math.random() * 4)];
  };
  const nm = p => (p === opponent1 ? member1.effectiveName : member2.effectiveName);
  const bn = p => p.bey.bbname || p.bey.name;
  const buildEmbed = () => new Discord.MessageEmbed()
    .setTitle(`${member1.effectiveName} <:versus:898767596940308530> ${member2.effectiveName}`)
    .setColor("#7f7fff")
    .setDescription(`Status: **${state}**\n\n${logger.logs.join("\n")}`)
    .addField(`__**${member1.effectiveName}**__`, `*Level ${opponent1.lvl} ${bn(opponent1)} | ${opponent1.sd}*\n**HP:** ${Math.max(0, Math.round(opponent1.hp))}\n**Stamina:** ${Math.max(0, opponent1.stamina).toFixed(1)}\n**Stability:** ${Math.max(0, Math.round(opponent1.stability))}%\n**Energy:** ${opponent1.sp}`, true)
    .addField(`__**${member2.effectiveName}**__`, `*Level ${opponent2.lvl} ${bn(opponent2)} | ${opponent2.sd}*\n**HP:** ${Math.max(0, Math.round(opponent2.hp))}\n**Stamina:** ${Math.max(0, opponent2.stamina).toFixed(1)}\n**Stability:** ${Math.max(0, Math.round(opponent2.stability))}%\n**Energy:** ${opponent2.sp}`, true)
    .setImage(`attachment://${opponent1.id}-${opponent2.id}.png`);
  const refresh = (final) => {
    be.edit({embed: buildEmbed(), components: final ? [] : [row]}, imageFile()).catch(err => console.error(err));
  };
  let idleTimer = null;
  const armIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if(be.ended) return;
      state = "Nobody responded, battle cancelled";
      end(opponent1, opponent2, "time-out", player);
    }, 180000);
  };
  armIdle();

  // Applies both players' chosen moves for the round.
  const applyMoves = () => {
    const pair = [[opponent1, opponent2], [opponent2, opponent1]];
    // 1) non-attack moves
    pair.forEach(([me, foe]) => {
      switch(me.move){
        case "spin": {
          const gain = me.bey.type === "Attack" ? 3 : me.bey.type === "Balance" ? 2.6 : 2;
          me.stamina = Math.min(10, me.stamina + gain);
          logger.add(`${nm(me)}'s ${bn(me)} spun up (+${gain} stamina).`);
          break;
        }
        case "defend":
          me.stability = Math.min(100, me.stability + 10);
          logger.add(`${nm(me)}'s ${bn(me)} braced for impact.`);
          break;
        case "charge":
          me.sp++;
          logger.add(`${nm(me)}'s ${bn(me)} charged its energy.`);
          break;
        case "special": {
          const sp = (me.bey.specials || [])[0];
          let ok = false;
          try { ok = sp && sp.requires(me, foe, logger); } catch(e) { ok = false; }
          if(ok){
            try { sp.execute(me, foe, logger); } catch(e) { console.error(e); logger.add(`${nm(me)}'s special fizzled.`); }
          } else {
            logger.add(`${nm(me)} tried to use a special but was not charged enough.`);
          }
          break;
        }
      }
    });
    // 2) attacks
    pair.forEach(([me, foe]) => {
      if(me.move !== "attack") return;
      let dmg = Math.max(1, me.atk);
      if(foe.move === "defend") dmg = Math.max(1, Math.round(dmg * 0.4));
      foe.hp -= dmg;
      me.stability -= 4;
      logger.add(`${nm(me)}'s ${bn(me)} hit for ${dmg} damage.`);
      if(foe.move === "defend" && foe.bey.type === "Defense" && Math.random() < 0.5){
        me.hp -= dmg;
        logger.add(`${nm(foe)}'s ${bn(foe)} reflected the hit!`);
      }
    });
  };

  function end(winner, loser, finish, player){
    be.ended = true;
    client.removeListener('interactionCreate', onInteraction);
    clearTimeout(idleTimer);
    if(finish !== "time-out" && finish !== "cancel") state = `Finished: <@${winner.id}> won by ${finish}`;
    refresh(true);
    if(opponent2.pve && finish !== "time-out" && finish !== "cancel"){
      const p = opponent2.pve;
      const won = winner.id === opponent1.id;
      const update = won
        ? {$set: {"states.inBattle": false}, $inc: Object.assign({coins: p.coins, xp: p.xp, "hunt.wins": 1}, p.gv > 0 ? {gv: p.gv} : {})}
        : {$set: {"states.inBattle": false}, $inc: {xp: p.consolationXp, "hunt.losses": 1}};
      player.collection("users").updateOne({_id: opponent1.id}, update).catch(err => console.error(err));
      const result = new Discord.MessageEmbed()
        .setColor(won ? "#50c878" : "#ff5555")
        .setTitle(won ? `Victory against ${p.label}!` : `${p.label} won this time.`)
        .setDescription(won
          ? `<@${opponent1.id}> won by ${finish} and earned **${p.coins} Valtz** and **${p.xp} XP**.${p.gv > 0 ? `\n\nThe ${p.isBoss ? "boss" : "opponent"} dropped **${p.gv} <:premiumvaltz:899373241557209158> Premium Valtz**!` : ""}`
          : `<@${opponent1.id}> lost by ${finish}, but still gained **${p.consolationXp} XP** for the practice.`);
      message.channel.createMessage({embed: result}).catch(err => console.error(err));
      return;
    }
    if(finish !== "time-out" && finish !== "cancel"){
    let bchance = Math.floor(Math.random() * 100);

    let lvlupquest = winner.stats.quests.filter(quest => quest.name === "Win3Battles");
    if(lvlupquest[0]){
      lvlupquest.forEach(que => {
        let foundindex = winner.stats.quests.indexOf(que);
        winner.stats.quests[foundindex].progress = winner.stats.quests[foundindex].progress + 1;
        if(winner.stats.quests[foundindex].progress === 3) winner.stats.quests[foundindex].completed = true;
      });
    }

    let lvlupquest2 = winner.stats.quests.filter(quest => quest.name === "Win5battles");
    if(lvlupquest2[0]){
      lvlupquest2.forEach(que => {
        let foundindex = winner.stats.quests.indexOf(que);
        winner.stats.quests[foundindex].progress = winner.stats.quests[foundindex].progress + 1;
        if(winner.stats.quests[foundindex].progress === 5) winner.stats.quests[foundindex].completed = true;
      });
    }

    if(!winner.stats.won.includes(loser.id)){
      winner.wins = winner.wins + 1;
      winner.stats.won.push(loser.id);
    }

    if(bchance <= 5){
      if(loser.id !== "827343111234519040") loser.stats.beys[loser.stats.main].broken = true;
      player.collection("users").updateOne({_id: winner.id}, {$set: {"states.inBattle": false, wins: winner.wins, coins: winner.valtz + 80, xp: winner.xp + 20, quests: winner.stats.quests, won: winner.stats.won}});
      player.collection("users").updateOne({_id: loser.id}, {$set: {beys: loser.stats.beys, "states.inBattle": false}});
    }else{
      player.collection("users").updateOne({_id: winner.id}, {$set: {"states.inBattle": false, coins: winner.valtz + 80, xp: winner.xp + 20, wins: winner.wins, quests: winner.stats.quests, won: winner.stats.won}});
      player.collection("users").updateOne({_id: loser.id}, {$set: {"states.inBattle": false, xp: loser.xp + 8}});
    }
  }else{
    player.collection("users").updateOne({_id: winner.id}, {$set: {"states.inBattle": false}});
    player.collection("users").updateOne({_id: loser.id}, {$set: {"states.inBattle": false}});
  }

    if(finish === "time-out" || finish === "cancel") message.channel.createMessage("The battle was cancelled because nobody responded.");
    else message.channel.createMessage(`<@${winner.id}> won the battle with a ${finish} finish!`);
    let webhookembed = new Discord.MessageEmbed()
    .setTitle(`${winner.username}#${winner.discriminator} (${winner.id}) won a battle with ${loser.username}#${loser.discriminator} (${loser.id})!`)
    .setDescription(`It was a ${finish} finish.`)
    .setTimestamp()
    .setColor("#ff7600");
    client.executeWebhook("900347913417400320", "5FSgUhDZ1e6FwF3oUaTNMfQmiDESkUiTV1__Jp9_53xAVxTulXlxuE1Y0h1p2AFPn9GS", {embeds: [webhookembed]}).catch(err => {console.error(err)});
    return;
  }
  const onInteraction = async interaction => {
    if(!interaction || !interaction.data || interaction.data.custom_id !== 'actionselect' || !Array.isArray(interaction.data.values) || !interaction.member) return;
    if(interaction.message && interaction.message.id !== be.id) return; // another battle's menu
    const ack = () => interaction.deferUpdate().catch(() => {});
    if(be.ended){
      client.removeListener('interactionCreate', onInteraction);
      return ack();
    }
    const uid = interaction.member.id;
    if(uid !== opponent1.id && uid !== opponent2.id) return interaction.createMessage({content: "This isn't your battle.", flags: 64}).catch(() => {});
    const me = uid === opponent1.id ? opponent1 : opponent2;
    const foe = me === opponent1 ? opponent2 : opponent1;
    if(me.move) return interaction.createMessage({content: "You already picked a move, waiting for your opponent.", flags: 64}).catch(() => {});
    const choice = interaction.data.values[0];
    if(choice === "special"){
      const sp = (me.bey.specials || [])[0];
      let ok = false;
      try { ok = sp && sp.requires(me, foe, logger); } catch(e) { ok = false; }
      if(!ok) return interaction.createMessage({content: sp ? `${sp.name} needs more energy. Use Charge first (energy: ${me.sp}).` : `${bn(me)} has no special move.`, flags: 64}).catch(() => {});
    }
    me.move = choice;
    ack();
    armIdle();
    if(foe.id === AI_ID && !foe.move) foe.move = aiPick(foe, me);
    if(!opponent1.move || !opponent2.move){
      state = `Waiting on **<@${foe.id}>**...`;
      refresh();
      return;
    }
    applyMoves();
    opponent1.move = "";
    opponent2.move = "";
    state = "Select a move!";
  // IDK????!!!!
  if(opponent1.stability > 100) opponent1.stability = 100;
  if(opponent2.stability > 100) opponent2.stability = 100;
  if(opponent1.item && opponent1.item.avatarPassive){
    opponent1.item.avatarPassive(opponent1, opponent2, logger);
  }
  if(opponent2.item && opponent2.item.avatarPassive){
    opponent2.item.avatarPassive(opponent2, opponent1, logger);
  }
  if(opponent1.launcher && opponent1.launcher.boost){
    opponent1.launcher.boost(opponent1, opponent2, logger);
  }
  if(opponent2.launcher && opponent2.launcher.boost){
    opponent2.launcher.boost(opponent2, opponent1, logger);
  }
  if((paused || (!opponent1.chosen || !opponent2.chosen)) && !be.ended) return;
    opponent1.bey.passives.forEach(async a => {
      let met = false;
      try{
        met = await a.requires(opponent1, opponent2, logger);
      }catch(err){
        console.error(err);
        met = false;
      }
      if(met && !a.onCD){
        try{
          a.execute(opponent1, opponent2, logger);
        }catch(err){
          console.error(err);
        }
        opponent1.bey.passives[opponent1.bey.passives.indexOf(a)].onCD = true;
        setTimeout(() => {
          opponent1.bey.passives[opponent1.bey.passives.indexOf(a)].onCD = false;
        }, a.cd);
      }
    });
    opponent2.bey.passives.forEach(async b => {
      let met2 = false;
      try{
        met2 = await b.requires(opponent2, opponent1, logger);
      }catch(err){
        console.error(err);
        met2 = false;
      }
      if(met2 && !b.onCD){
        try{ b.execute(opponent2, opponent1, logger); }catch(err){ console.error(err); }
        opponent2.bey.passives[opponent2.bey.passives.indexOf(b)].onCD = true;
        setTimeout(() => {
          opponent2.bey.passives[opponent2.bey.passives.indexOf(b)].onCD = false;
        }, b.cd);
      }
  });
  opponent1.bey.modes.forEach(async cn => {
    let c = opponent1.bey[cn];
    let met3 = false;
    try {
      met3 = await c.requires(opponent1, opponent2, logger);
    }catch(err){
      console.error(err);
      met3 = false;
    }
    if(met3 && !c.active){
      try{ c.boost(opponent1, opponent2, logger); }catch(err){ console.error(err); }
    }
  });
  opponent2.bey.modes.forEach(async dn => {
    let d = opponent2.bey[dn];
    let met4 = false;
    try {
      met4 = await d.requires(opponent2, opponent1, logger);
    }catch(err){
      console.error(err);
      met4 = false;
    }
    if(met4 && !d.active){
      try{ d.boost(opponent2, opponent1, logger); }catch(err){ console.error(err); }
    }
  });
  opponent1.stamina -= 1.2;
  opponent2.stamina -= 1.2;
  opponent1.stability -= 8;
  opponent2.stability -= 8;
  switch(opponent1.bey.type){
    case "Attack":
      opponent1.stamina -= 0.3;
      opponent1.stability -= 2;
    break;
    case "Balance":
      opponent1.stamina -= 0.2;
      opponent1.stability -= 1;
    break;
  }
  switch(opponent2.bey.type){
    case "Attack":
      opponent2.stamina -= 0.3;
      opponent2.stability -= 2;
    break;
    case "Balance":
      opponent2.stamina -= 0.2;
      opponent2.stability -= 1;
    break;
  }
  refresh();
  if(opponent1.stability <= 0){
    fs.unlink(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
      if(err) console.log(err);
    });
    return end(opponent2, opponent1, "ring-out", player);
  }
  if(opponent1.stamina <= 0){
    fs.unlink(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
      if(err) console.log(err);
    });
    return end(opponent2, opponent1, "survivor", player);
  }
  if(opponent1.hp <= 0){
    fs.unlink(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
      if(err) console.log(err);
    });
    return end(opponent2, opponent1, "burst", player);
  }
  if(opponent2.stability <= 0){
    fs.unlink(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
      if(err) console.log(err);
    });
    return end(opponent1, opponent2, "ring-out", player);
  }
  if(opponent2.stamina <= 0){
    fs.unlink(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
      if(err) console.log(err);
    });
    return end(opponent1, opponent2, "survivor", player);
  }
  if(opponent2.hp <= 0){
    fs.unlink(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, (err) => {
      if(err) console.log(err);
    });
    return end(opponent1, opponent2, "burst", player);
  }
  //if(!be.ended) chooseSpecial(logger, client, message);
    // IDK????!!!
  };
  client.on('interactionCreate', onInteraction);
}

async function attack(acted, victim, logger, message){
  return new Promise(async (resolve, reject) => {
  let bchance = Math.round(Math.random() * 100);
  let member1 = await message.guild.getRESTMember(acted.id);
  let member2 = await message.guild.getRESTMember(victim.id);
  if(acted.atk < 0) acted.atk = 1;
  let dmg = acted.atk;
  victim.hp -= dmg;
  //logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} dealt ${dmg} damage.`);
  if(bchance < 26 && acted.bey.type === "Attack" && acted.effectAllowed === true){
    let bleeddmg = setInterval(() => {
      victim.hp -= Math.round(((acted.lvl-1)*0.09)+1);
      victim.stability -= 1;
    }, 2000)
    setTimeout(() => {
      clearInterval(bleeddmg);
    }, 15000)
    //logger.add("The hit was fatal! The opponent might need some time to regain stability.")
    acted.effectAllowed = false;
    setTimeout(() => {
      acted.effectAllowed = true;
    }, 180000);
  }
  resolve(true);
  });
}

async function defend(acted, victim, logger, message){
  return new Promise(async (resolve, reject) => {
    let rchance = Math.round(Math.random() * 100);
    let member1 = await message.guild.getRESTMember(acted.id);
    let member2 = await message.guild.getRESTMember(victim.id);
    victim.atk = Math.round((victim.atk/100)*40);
    acted.stability += 10;
    if(acted.stability > 100) acted.stability = 100;
    //logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} blocked!`);
    if(rchance < 51 && acted.bey.type === "Defense" && victim.move === "attack" && acted.effectAllowed === true){
    acted.hp = acted.hp + victim.atk;
    victim.hp = victim.hp - victim.atk;
    //logger.add("Damage reflected!");
    acted.effectAllowed = false;
    setTimeout(() => {
      acted.effectAllowed = true;
    }, 180000);
  }
  resolve(true);
  });
}

async function spin(acted, victim, logger, message){
  if(acted.bey.type === "Attack") acted.stamina = acted.stamina + 3
  else if(acted.bey.type === "Balance") acted.stamina = acted.stamina + 2.6
  else acted.stamina = acted.stamina + 2;
}

async function charge(acted, victim, logger, message){
  return new Promise(async (resolve, reject) => {
    let member1 = await message.guild.getRESTMember(acted.id);
    acted.sp++;
    //logger.add(`[${member1.effectiveName}] ${acted.bey.bbname || acted.bey.name} charged its energy.`);
    resolve(true);
  })
}

module.exports.run = async (client, message, args, player, prefix, opponent1, opponent2, msg, pve) => {
  let stats1 = await player.collection("users").findOne({_id: opponent1.id});
  let stats2;
  if(pve){
    const cls = client.beys.get(pve.beyName);
    stats2 = {_id: opponent2.id, beys: [{name: pve.beyName, level: pve.level, id: "1", sd: new cls("1", "1").sd}], main: 0, quests: [], won: [], wins: 0, xp: 0, coins: 0, launcher: "default", states: {}};
    opponent2.pve = pve;
  } else stats2 = await player.collection("users").findOne({_id: opponent2.id});
  opponent1.hp = 100;
  opponent2.hp = 100;
  opponent1.move = "";
  opponent2.move = "";
  opponent1.atk = 20;
  opponent2.atk = 20;
  opponent1.stamina = 3;
  opponent2.stamina = 3;
  opponent1.stability = 100;
  opponent2.stability = 100;
  opponent1.sp = 0;
  opponent2.sp = 0;
  opponent1.sd = (v => (v === 1 || v === "Left") ? "Left" : "Right")(stats1.beys[stats1.main].sd);
  opponent2.sd = (v => (v === 1 || v === "Left") ? "Left" : "Right")(stats2.beys[stats2.main].sd);
  opponent1.bey = new (client.beys.get(stats1.beys[stats1.main].name))(opponent1.id, stats1.beys[stats1.main].id,stats1.beys[stats1.main]);
  opponent2.bey = new (client.beys.get(stats2.beys[stats2.main].name))(opponent2.id, stats2.beys[stats2.main].id,stats2.beys[stats2.main]);
  opponent1.lvl = stats1.beys[stats1.main].level;
  opponent2.lvl = stats2.beys[stats2.main].level;
  if(opponent2.id === "827343111234519040" && !pve){
    opponent2.lvl = opponent1.lvl;
    stats2.beys[stats2.main].level = opponent1.lvl;
    opponent2.bey = opponent1.bey;
  }
  const beyCard = (src, label) => jimp.read(/wikia\.nocookie\.net/.test(src) && !/format=original/.test(src) ? src + (src.includes("?") ? "&" : "?") + "format=original" : src).then(removeBg).catch(async () => {
    let img = new jimp(700, 700, 0x2b2d31ff);
    const font = await jimp.loadFont(jimp.FONT_SANS_64_WHITE);
    img.print(font, 0, 0, {text: label, alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_MIDDLE}, 700, 700);
    return img;
  });
  const assetsDir = require("path").join(__dirname, "..");
  const makeBackground = () => jimp.read(require("path").join(assetsDir, "background.jpg")).catch(() => new jimp(1950, 1000, 0x1a1a2eff));
  const makeVersus = () => jimp.read(require("path").join(assetsDir, "versus.png")).catch(async () => {
    let img = new jimp(300, 300, 0x00000000);
    const font = await jimp.loadFont(jimp.FONT_SANS_128_WHITE);
    img.print(font, 0, 0, {text: "VS", alignmentX: jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: jimp.VERTICAL_ALIGN_MIDDLE}, 300, 300);
    return img;
  });
  let jimps = [makeBackground(), makeVersus(), beyCard(opponent1.bey.image, opponent1.bey.name), beyCard(opponent2.bey.image, opponent2.bey.name)];
  Promise.all(jimps).then(data => {
    return Promise.all(jimps);
  }).then(async data => {
    data[2].resize(700,700);
    data[3].resize(700,700);
    data[1].resize(300,300);
    data[0].composite(data[2], 100, 240);
    data[0].composite(data[3], 1150, 240);
    data[0].composite(data[1], 830, 415);
    data[0].write(`/tmp/tempimages/${opponent1.id}-${opponent2.id}.png`, () => {
      console.log("Image written!")
    });
  }).catch(err => console.error("Battle image failed:", err));
  let health1 = (stats1.beys[stats1.main].level-1) * 9.1;
  let stamina1 = (stats1.beys[stats1.main].level-1) * 0.051;
  let health2 = (stats2.beys[stats2.main].level-1) * 9.1;
  let stamina2 = (stats2.beys[stats2.main].level-1) * 0.051;
  opponent1.hp = Math.floor(opponent1.hp + health1);
  opponent1.stamina = Math.floor(opponent1.stamina + stamina1);
  opponent2.hp = Math.floor(opponent2.hp + health2);
  opponent2.stamina = Math.floor(opponent2.stamina + stamina2);
  if(opponent1.stamina > 10) opponent1.stamina = 10;
  if(opponent2.stamina > 10) opponent2.stamina = 10;
  if(opponent1.hp > 1000) opponent1.hp = 1000;
  if(opponent2.hp > 1000) opponent2.hp = 1000;
  if(opponent1.bey.type === "Stamina") opponent1.stamina = opponent1.stamina + 2;
  if(opponent2.bey.type === "Stamina") opponent2.stamina = opponent2.stamina + 2;
  if(opponent1.bey.type === "Balance") opponent1.stamina = opponent1.stamina + 1;
  if(opponent2.bey.type === "Balance") opponent2.stamina = opponent2.stamina + 1;
  if(opponent1.sd === "Right") opponent1.atk = opponent1.atk + 2;
  if(opponent1.sd === "Left") opponent1.stamina = opponent1.stamina + 1;
  if(opponent2.sd === "Right") opponent2.atk = opponent2.atk + 2;
  if(opponent2.sd === "Left") opponent2.stamina = opponent2.stamina + 1;
  opponent1.maxstamina = opponent1.stamina;
  opponent2.maxstamina = opponent2.stamina;
  opponent1.maxhp = opponent1.hp;
  opponent2.maxhp = opponent2.hp;
  opponent1.wins = stats1.wins;
  opponent2.wins = stats2.wins;
  opponent1.xp = stats1.xp;
  opponent2.xp = stats2.xp;
  opponent1.valtz = stats1.coins;
  opponent2.valtz = stats2.coins;
  opponent1.stats = stats1;
  opponent2.stats = stats2;
  opponent1.effectAllowed = true;
  opponent2.effectAllowed = true;
  opponent1.atk = Math.round(opponent1.atk + ((opponent1.lvl-1) * 0.4));
  opponent2.atk = Math.round(opponent2.atk + ((opponent2.lvl-1) * 0.4));
  opponent1.pmessage = message;
  opponent2.pmessage = message;
  opponent1.moveChosen = false;
  opponent2.moveChosen = false;
  opponent1.chosen = true;
  opponent2.chosen = true;
  if(stats1.beys[stats1.main].attached) opponent1.item = new (client.items.get(stats1.beys[stats1.main].attached.name))(stats1.beys[stats1.main].attached);
  if(stats2.beys[stats2.main].attached) opponent2.item = new (client.items.get(stats2.beys[stats2.main].attached.name))(stats2.beys[stats2.main].attached);
  if(stats1.launcher !== "default") opponent1.launcher = new (client.items.get(stats1.launcher.name))(stats1.launcher);
  if(stats2.launcher !== "default") opponent2.launcher = new (client.items.get(stats2.launcher.name))(stats2.launcher);
  let logger = new Logger();
  countdown(message, opponent1, opponent2, player, prefix, client, msg, logger);
}

module.exports.help = {
    name: "battlesystemv3",
    aliases: []
}  