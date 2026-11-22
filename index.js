const Discord = require('discord.js');
const Topgg = require("@top-gg/sdk");
const topgg = new Topgg.Api(process.env.topggApi)
const Eris = require("eris-additions")(require("eris"));
const fs = require('fs');
require('dotenv').config();
const { MongoClient } = require("mongodb");
const { spawn } = require('child_process');
const { TIMEOUT } = require('dns');
const mongo = new MongoClient(process.env.MONGOURL, {useUnifiedTopology: true});

//Mongo on Connect
mongo.connect((err) => {
    if(err) throw err;
    console.log("Connection to MongoDB database established successfully!");
});

process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));

fs.mkdirSync('/tmp/tempimages', {recursive: true});

//HANDLERS ####################################################################################

//Discord.Collection Clients Adder
const client = new Eris(process.env.TOKEN, {restMode:true, maxShards: "auto", intents: [32768,'guilds','guildsMembers','guildBans','guildEmojis','guildIntegrations','guildWebhooks','guildInvites','guildVoiceStates','guildPresenses','guildIntegrations','guildMessages','guildMessageReactions','guildMessageTyping','directMessages','directMessageReactions','directMessageTyping']});
client.commands = new (Discord.Collection || Map)();
client.beys = new (Discord.Collection || Map)();
client.parts = new (Discord.Collection || Map)();
client.items = new (Discord.Collection || Map)();
client.spawns = new (Discord.Collection || Map)();
client.bosssystems = new (Discord.Collection || Map)();
client.bosses = new (Discord.Collection || Map)();
client.aliases = new (Discord.Collection || Map)();
client.quests = new (Discord.Collection || Map)();
client.expboost = new (Discord.Collection || Map)();
client.valtzboost = new (Discord.Collection || Map)();
client.availablebeys = new (Discord.Collection || Map)();
client.commonbeys = new (Discord.Collection || Map)();
client.specialbeys = new (Discord.Collection || Map)();
client.rarebeys = new (Discord.Collection || Map)();
client.legendarybeys = new (Discord.Collection || Map)();
client.shadowbeys = new (Discord.Collection || Map)();
client.codes = new (Discord.Collection || Map)();
client.restarttime = new (Discord.Collection || Map)();

//Spawn Client
const spawner = require(`./systems/spawnsystem.js`);
client.spawns.set(spawner.name || spawner.help.name, spawner);

//Boss Client
const bosssystem = require(`./systems/bosssystem.js`);
client.bosssystems.set(bosssystem.name || bosssystem.help.name, bosssystem);

//Command Handler
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name || command.help.name, command);
    command.help.aliases.forEach(aliases => {
        client.aliases.set(aliases, command.help.name);
    });
}

//Boss Handler
const bossFiles = fs.readdirSync('./bosses').filter(file => file.endsWith(".js"));
for(const file of bossFiles){
    const boss = require(`./bosses/${file}`);
    const bossc = new boss("1","1");
    client.bosses.set(bossc.name, boss);
}

const codeFiles = fs.readdirSync('./codes').filter(file => file.endsWith(".js"));
for(const file of codeFiles){
    const code = require(`./codes/${file}`);
    client.codes.set(code.name, code);
}

//Bey Handler
const beyFiles = fs.readdirSync('./beys').filter(file => file.endsWith(".js") && file !== ".gitignore" && file !== "Beyblade.js");
for (const file of beyFiles) {
    const bey = require(`./beys/${file}`);
    const beyc = new bey("1","1");
    client.beys.set(beyc.name, bey);
    //client.availablebeys.set(beyc.name, bey);
}

//Items Handler
const itemFiles = fs.readdirSync('./items').filter(file => file.endsWith(".js") && file !== "Part.js" && file !== "Beyblade.js" && file !== "Quest.js");
for (const file of itemFiles) {
    const item = require(`./items/${file}`);
    client.items.set(item.name, item);
}

//Quest Handler
const questFiles = fs.readdirSync('./quests').filter(file => file.endsWith(".js"));
for (const file of questFiles) {
    const quest = require(`./quests/${file}`);
    client.quests.set(quest.name, quest);
}

//Part Handler
const partFiles = fs.readdirSync('./parts').filter(file => file.endsWith(".js"));
for (const file of partFiles) {
    const part = require(`./parts/${file}`);
    client.parts.set(part.name, part);
}

//Rarities System
["WildWyvern","AceDragon","ArcBahamut","UnionAchilles","DrigerSlash","Odin","Neptune","BlazeRagnaruk","SurtrS2","StormSpriggan","KaiserKerbeus","XenoXcalibur","BeastBehemoth","WizardFafnir","OrpheusO2","BushinAshura","GeistFafnir","ZillionZeus","Yggdrasil","InfernoIfrit","Caynox","DragoonFantom","Nepstrius","Roktavor","Treptune","Valtryek","Xcalius","DragoonFighter","DuoAeclipse","DuoArtemis","ShadowOrichalcum"].forEach(file =>{
    const bey1 = require(`./beys/${file}`);
    const beyc1 = new bey1("1","1");
    client.commonbeys.set(beyc1.name, bey1);
    ["JudgementJoker","ScrewTrident","Wyvern","BusterXcalibur","HyrusH2","Kerbeus","KillerDeathscyther","Evileye","ChoZValkyrie","NightmareLonginus","Spriggan","RevivePhoenix","SiegXcalibur","RockLeone","DracielShield","Xcalibur","DeadPhoenix", "LostLonginus","Doomscizor","Evipero","Odax","Spryzen","Unicrest","Wyvron","Yegdrion","DranzerFlame","DuoApollos","Orichalcum"].forEach(file =>{
        const bey2 = require(`./beys/${file}`);
        const beyc2 = new bey2("1","1");
        client.specialbeys.set(beyc2.name, bey2);
        ["UnlockUnicorn","MaximusGaruda","KreisSatan","GalaxyZeus","DeadHades","VenomDiabolos","IstrosI2","DeepChaos","ExceedEvileye","AcidAnubis","LegendSpriggan","DarkDeathscyther","HellSalamander","GaiaDragoon","ZAchilles","TornadoWyvern","StormPegasus","GodValkyrie","Ragnaruk","AtlasAnubionA2","BeastBetromothB2","FerroFengriffF2","GigaGaianonG2","JumboJormuntorJ2","KingKerbeusK2","StormSpryzenS2","XenoXcaliusX2","YugenYegdrionY2","ZillionZeutronZ2","RagingRoktavorR2","WildWyvronW2","BerserkRoktavorR3","DeepCaynoxC3","KineticSatombS3","LostLuinorL2","MadMinoborosM2","MaximusGarudaG3","PhrenicPhantazusP2","ShelterRegulusR3","SurgeXcaliusX3"].forEach(file =>{
            const bey3 = require(`./beys/${file}`);
            const beyc3 = new bey3("1","1");
            client.rarebeys.set(beyc3.name, bey3);
            ["VictoryValkyrie","DragoonStorm","NovaNeptune","ShelterRegulus","LightningLDrago","GuardianKerbeus","BloodyLonginus","EarthAquila","YaegerYggdrasil","Trident","TyrosT2","MadMinoboros","KingKerbeus","Unicorn","DranzerSpiral","ObeliskOdin","Deathscyther","ChoZSpriggan","PsychicPhantom","DarkDoomscizorD2","EpicEviperoE2","InfernoIfritorI2","NovaNepstriusN2","QuillQuetzikoQ2","AlterCogniteC3","BlastJinniusJ3","DrainFafnirF3","KrusherDoomscizorD3","NightmareLuinorL3","SpryzenRequiemS3","TempestWyvronW3"].forEach(file =>{
                const bey4 = require(`./beys/${file}`);
                const beyc4 = new bey4("1","1");
                client.legendarybeys.set(beyc4.name, bey4);
                ["GigantGaia","DrainFafnir","JailJormungand","SpryzenRequiem","HolyHorusood","SlashValkyrie","RisingRagnaruk","BeatKukulcan","FlameSagittario","Valkyrie","DiomedesD2","BlastJinnius","Minoboros","PrimeApocalypse","Horusood","WinningValkyrie","Chaos","FangFenrir","StrikeGodValkyrie","HyperHorusoodH2","OmniOdaxO2","UberUnicrestU2","VictoryValtryekV2","ArcBalkeshB3","BoomKhalzarK3","GenesisValtryekV3","LegendSpryzenS3","OrichalcumO3","StrikeValtryekV3","TwinNoctemisN3"].forEach(file =>{
                    const bey5 = require(`./beys/${file}`);
                    const beyc5 = new bey5("1","1");
                    client.shadowbeys.set(beyc5.name, bey5);
                })
            })
        })
    })
})

//MESSAGE ####################################################################################

//On Message Create
client.on('messageCreate', async (message) => {
    if(!message.guild) return;
    const db = mongo.db("main");
    const testForNumber = Math.floor(Math.random() * 30);
    const testForNumber2 = Math.floor(Math.random()*200);
    const raritytest = Math.floor(Math.random() * 30)
    
    //Configuration
    let channel = await db.collection("channels").findOne({_id: message.channel.id});
    if (!channel){
        db.collection("channels").insertOne({_id: message.channel.id, bey: "nothing", type: "nothing", answer: "number"})
    }
    let guild = await db.collection("guilds").findOne({_id: message.guild.id});
    if(!guild){
        guild = {_id: message.guild.id,redirect: "nothing",prefix: ";",bey: "nothing",type: "nothing",answer: "number",disabled: []};
        await db.collection("guilds").insertOne(guild);
    }
    let prefix = guild.prefix;
    
    //Prefix and help
    if(message.content.toLowerCase() === ";prefix"){
        client.createMessage(message.channel.id, `The prefix for this server is \`${prefix}\`. Have fun blading!`);
    }
    
    //Spawn Beys & Bosses
    if(testForNumber === 0){
        let available;
        if(raritytest >= 20){
            available = ["Wild Wyvern","Ace Dragon","Arc Bahamut","Union Achilles","Driger Slash","Odin","Neptune","Blaze Ragnaruk","Surtr S2","Storm Spriggan","Kaiser Kerbeus","Xeno Xcalibur","Beast Behemoth","Wizard Fafnir","Orpheus O2","Bushin Ashura","Geist Fafnir","Zillion Zeus","Yggdrasil","Inferno Ifrit","Caynox","Dragoon Fantom","Nepstrius","Roktavor","Treptune","Valtryek","Xcalius","Dragoon Fighter","Duo Aeclipse","Duo Artemis","Shadow Orichalcum"];
        } else if(raritytest >= 10){
            available = ["Judgement Joker","Screw Trident","Wyvern","Buster Xcalibur","Hyrus H2","Kerbeus","Killer Deathscyther","Evileye","ChoZ Valkyrie","Nightmare Longinus","Spriggan","Revive Phoenix","Sieg Xcalibur","Rock Leone","Draciel Shield","Xcalibur","Dead Phoenix", "Lost Longinus","Doomscizor","Evipero","Odax","Spryzen","Unicrest","Wyvron","Yegdrion","Dranzer Flame","Duo Apollos","Orichalcum"];
        } else if(raritytest >= 5){
            available = ["Unlock Unicorn","Maximus Garuda","Kreis Satan","Galaxy Zeus","Dead Hades","Venom Diabolos","Istros I2","Deep Chaos","Exceed Evileye","Acid Anubis","Legend Spriggan","Dark Deathscyther","Hell Salamander","Gaia Dragoon","Z Achilles","Tornado Wyvern","Storm Pegasus","God Valkyrie","Ragnaruk","Atlas Anubion A2","Beast Betromoth B2","Ferro Fengriff F2","Giga Gaianon G2","Jumbo Jormuntor J2","King Kerbeus K2","Storm Spryzen S2","Xeno Xcalius X2","Yugen Yegdrion Y2","Zillion Zeutron Z2","Raging Roktavor R2","Wild Wyvron W2","Berserk Roktavor R3","Deep Caynox C3","Kinetic Satomb S3","Lost Luinor L2","Mad Minoboros M2","Maximus Garuda G3","Phrenic Phantazus P2","Shelter Regulus R3","Surge Xcalius X3"];
        } else if(raritytest >= 3){
            available = ["Victory Valkyrie","Dragoon Storm","Nova Neptune","Shelter Regulus","Lightning L Drago","Guardian Kerbeus","Bloody Longinus","Earth Aquila","Yaeger Yggdrasil","Trident","Tyros T2","Mad Minoboros","King Kerbeus","Unicorn","Dranzer Spiral","Obelisk Odin","Deathscyther","ChoZ Spriggan","Psychic Phantom","Dark Doomscizor D2","Epic Evipero E2","Inferno Ifritor I2","Nova Nepstrius N2","Quill Quetziko Q2","Alter Cognite C3","Blast Jinnius J3","Drain Fafnir F3","Krusher Doomscizor D3","Nightmare Luinor L3","Spryzen Requiem S3","Tempest Wyvron W3"];
        } else if(raritytest >= 0){
            available = ["Gigant Gaia","Drain Fafnir","Jail Jormungand","Spryzen Requiem","HolyHorusood","Slash Valkyrie","Rising Ragnaruk","Beat Kukulcan","Flame Sagittario","Valkyrie","Diomedes D2","Blast Jinnius","Minoboros","Prime Apocalypse","Horusood","Winning Valkyrie","Chaos","Fang Fenrir","Strike God Valkyrie","Hyper Horusood H2","Omni Odax O2","Uber Unicrest U2","Victory Valtryek V2","Arc Balkesh B3","Boom Khalzar K3","Genesis Valtryek V3","Legend Spryzen S3","Orichalcum O3","Strike Valtryek V3","Twin Noctemis N3"];
    }
    client.spawns.get('spawnsystem').run(message, prefix, db, available, client);
    }

    if(testForNumber2 === 0){
        client.bosssystems.get('bosssystem').run(client, message, prefix, null, db).catch(err => console.error('Boss spawn failed:', err))
    }
    
    let info = await db.collection("users").findOne({_id: message.author.id}, {_id: 0, beys: 1, main: 1});
    if (info){
        if(info.banned === true) return;

        //Check current bey
        if((info.main+1) > info.beys.length){
            db.collection("users").updateOne({_id: message.author.id}, {$set: {main: 0}});
        }

        //Random Function
        function random(min, max){
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        }

        //EXP System
        let crntbey = info.beys[info.main];
        let booster1 = client.expboost.get(message.author.id);
        let exp;
        let boostMult = booster1 ? 1.5 : 1;
        if(info.xpBoost && info.xpBoost.until > Date.now()) boostMult = Math.max(boostMult, info.xpBoost.mult || 2); // ;xpshop boost
        exp = crntbey.xp+Math.floor(random(1,20)*boostMult);
        let levelNew = Math.min(100, Math.floor(exp/300) + 1); // level L covers xp (L-1)*300 to L*300, same as claim.js, gift.js and ;info
        let staramount = random(0,2);
        function updateLevel(){
            if(levelNew>crntbey.level){
                let lvlupquest = info.quests.filter(quest => quest.name === "LevelUpABeyOnce");
                if(lvlupquest[0]){
                    lvlupquest.forEach(que => {
                        let foundindex = info.quests.indexOf(que);
                        if(info.quests[foundindex.completed] != true){
                            info.quests[foundindex].completed = true;
                            let embed = new Discord.MessageEmbed()
                            .setTitle(`**${crntbey.name}** just got to level **${levelNew}**!`)
                            .setColor("#50c878")
                            .setDescription("You completed your quest!")
                            db.collection("users").updateOne({ _id: message.author.id },{ $set:{[`beys.${info.main}.level`]:levelNew,[`beys.${info.main}.xp`]:exp,stars:info.stars+staramount, coins: info.coins+100, quests: info.quests}});
                            message.channel.createMessage({embed:embed}).then(message => {
                                setTimeout(() => message.delete(), 5000)
                            })
                        }
                      });
                    } else {
                        let embed = new Discord.MessageEmbed()
                            .setTitle(`**${crntbey.name}** just got to level **${levelNew}**!`)
                            .setColor("#50c878")
                            db.collection("users").updateOne({ _id: message.author.id },{ $set:{[`beys.${info.main}.level`]:levelNew,[`beys.${info.main}.xp`]:exp,stars:info.stars+staramount, coins: info.coins+100, quests: info.quests}});
                            message.channel.createMessage({embed:embed}).then(message => {
                                setTimeout(() => message.delete(), 5000)
                            })
                    }

                
            } else {
                db.collection("users").updateOne({ _id: message.author.id },{ $set:{[`beys.${info.main}.xp`]:exp,stars:info.stars+staramount}});
            }
        }
        if(crntbey.level<20){
            updateLevel();
        } else if(((crntbey.level>=20) && (crntbey.level<40)) && (crntbey.gen===2)){
            updateLevel();
        } else if(((crntbey.level>=40) && (crntbey.level<60)) && (crntbey.gen===3)){
            updateLevel();
        } else if(((crntbey.level>=60) && (crntbey.level<80)) && (crntbey.gen===4)){
            updateLevel();
        } else if(((crntbey.level>=80) && (crntbey.level<100)) && (crntbey.gen===5)){
            updateLevel();
        }
        
        //Blader Level
        let levelpf;
        let xpPf = info.xp;
        if(xpPf<200){
            levelpf=1;
        }
        if(xpPf>=200){
            levelpf=2;
        }
        if(xpPf>=900){
            levelpf=3;
        }
        if(xpPf>=1500){
            levelpf=4;
        }
        if(xpPf>=2200){
            levelpf=5;
        }
        if(levelpf>info.level){
            db.collection("users").updateOne({ _id: message.author.id },{ $set:{level:levelpf,coins:info.coins+1000}});
        }
        
        //Vote
        const now = new Date();
      //  let voted = await topgg.hasVoted(message.author.id);
        if(now-info.lastVoted>(720*60*100)*2){
            db.collection("users").updateOne({ _id: message.author.id },{ $set:{streaks:0}});
        }

    //Total Wins
        db.collection("users").updateOne({ _id: message.author.id },{ $set:{totalwins:info.wins+(info.rank*100)}});
    }

    //Command Handler Part. 2
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    message.reply = content => {
        message.channel.createMessage({content:content, messageReferenceID: message.id, everyone:true});
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(client.commands.has(command)) {
        let cmd = client.commands.get(command);
        try {
            cmd.run(client, message, args, prefix, {}, db);
        } catch (error) {
            console.error(error);
            message.reply(`something happened while trying to run this command. Try again later?`);
        }
    } else {
        try{
        let cmd = client.commands.get(client.aliases.get(command));
        cmd.run(client, message, args, prefix, {}, db);
        } catch(e){
        }
    }
});

client.on('error', err => console.error('Client error:', err));

//Emoji remapper: the bot's custom emojis used to live on another author's servers. After running ;emojisetup
//they exist as emojis owned by this bot, and every outgoing request has the old ids swapped for the new ones.
client.emojiMap = {};
const EMOJI_RE = /<(a?):([A-Za-z0-9_]+):(\d{15,})>/g;
function remapEmojis(value, seen, depth){
    if(typeof value === "string") return value.replace(EMOJI_RE, (m, a, n, id) => client.emojiMap[id] ? `<${a}:${client.emojiMap[id].name}:${client.emojiMap[id].id}>` : m);
    if(!value || typeof value !== "object" || depth > 8 || Buffer.isBuffer(value) || value instanceof Uint8Array) return value;
    if(seen.has(value)) return value;
    seen.add(value);
    for(const key of Object.keys(value)){
        const v = value[key];
        if(typeof v === "string" || (v && typeof v === "object")){
            try{ value[key] = remapEmojis(v, seen, depth + 1); }catch(e){}
        }
    }
    return value;
}
const origRequest = client.requestHandler.request.bind(client.requestHandler);
client.requestHandler.request = function(method, url, auth, body, ...rest){
    if(body && typeof body === "object" && Object.keys(client.emojiMap).length){
        try{ body = remapEmojis(body, new WeakSet(), 0); }catch(e){ console.error("emoji remap failed:", e); }
    }
    return origRequest(method, url, auth, body, ...rest);
};
client.loadEmojiMap = async function(){
    try{
        const doc = await mongo.db("main").collection("settings").findOne({_id: "emojimap"});
        client.emojiMap = (doc && doc.map) || {};
        console.log(`Loaded ${Object.keys(client.emojiMap).length} emoji mappings.`);
    }catch(err){
        console.error("Could not load the emoji map, retrying in 5s:", err.message);
        setTimeout(() => client.loadEmojiMap(), 5000);
    }
};

//Client
client.on('ready', () => {
    console.log('Beycord is online.');
    client.loadEmojiMap();
    client.editStatus({name: `with Beyblades in ${client.guilds.size} servers! | ;prefix`});
});

client.connect();