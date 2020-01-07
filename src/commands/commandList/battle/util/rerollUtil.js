/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const weaponUtil = require('./weaponUtil.js');
const passiveArray = ["passive","p"];
const statArray = ["stat","stats","s"];
const yesEmoji = '✅';
const noEmoji = '❎';
const retryEmoji = '🔄';
const rerollPrice = 100;
const shardEmoji = '<:weaponshard:655902978712272917>';

exports.reroll = async function(p){
	const embed = {
		author:{
			name:p.msg.author.username+", are you sure you want to reroll?",
			icon_url:p.msg.author.dynamicAvatarURL()
		},
		description:"Rerolling will cost **"+rerollPrice+" "+shardEmoji+" Weapon Shards** and AUTOMATICALLY APPLY THE CHANGES TO YOUR WEAPON!\nYour current stats/passives will be LOST!",
		color: p.config.embed_color
	}
	let msg = await p.send({embed});

	await msg.addReaction(yesEmoji);
	await msg.addReaction(noEmoji);

	let filter = (emoji,userID) => [yesEmoji,noEmoji].includes(emoji.name)&&p.msg.author.id == userID;
	let collector = p.reactionCollector.create(msg,filter,{time:120000});

	collector.on('collect', (emoji) => {
		collector.stop("clicked");
		if(emoji.name===yesEmoji){
			initMsg(p, msg);
		}else if(emoji.name===noEmoji){
			embed.color = 16711680;
			msg.edit({embed});
		}
	});

	collector.on('end',async function(reason){
		if(reason!="clicked"){
			embed.color = 6381923;
			await msg.edit({content:"This message is now inactive",embed});
		}
	});

}

async function initMsg(p,msg){
	// Parse argments
	let args = parseArgs(p);
	if(!args) return;
	let {rrType, uwid} = args;

	// Grab weapon
	let weapon = await getWeapon(p,uwid);
	if(!weapon) return;

	// Check if enough shards
	if(!(await useShards(p))){
		p.errorMsg(", you need "+rerollPrice+" "+shardEmoji+" Weapon Shards to reroll a weapon!",4000);
		return;
	}

	// Get rerolled weapon
	let newWeapon = await fetchNewWeapon(p,weapon,rrType);
	if(!newWeapon){
		p.errorMsg(", failed to change weapon stats!");
		return;
	}
	
	// Send message
	await sendMessage(p,weapon,newWeapon,rrType,msg,true);
}

async function applyChange(p, weapon){
	let uwid = weapon.ruwid;
	let stat = weapon.sqlStat;
	let avg = weapon.avgQuality;
	let sql = `UPDATE user_weapon SET stat = '${stat}', avg = ${avg}, rrcount = rrcount + 1 WHERE uwid = ${uwid};`;
	for(let i in weapon.passives){
		let passive = weapon.passives[i];
		let stat = passive.sqlStat;
		let pcount = passive.pcount;
		let wpid = passive.id;
		sql += `UPDATE user_weapon_passive SET stat = '${stat}', wpid = ${wpid} WHERE uwid = ${uwid} AND pcount = ${pcount};`;
	}

	let result = await p.query(sql);
	for(let i in result){
		if(result[i].affectedRows<=0)
			return false;
	}
	return true;
}

function parseArgs(p){
	/* Parse reroll type and weapon id */
	let rrType, uwid;
	if(passiveArray.includes(p.args[1])){
		rrType = "p";
		uwid = p.args[2];
	}else if(passiveArray.includes(p.args[2])){
		rrType = "p";
		uwid = p.args[1];
	}else if(["stat","stats","s"].includes(p.args[1])){
		rrType = "s";
		uwid = p.args[2];
	}else if(["stat","stats","s"].includes(p.args[2])){
		rrType = "s";
		uwid = p.args[1];
	}else{
		p.errorMsg(", invalid syntax! Please use the format: `owo w rr {weaponID} [passive|stat]`!",5000);
		return;
	}

	/* Convert uwid into decimal */
	uwid = weaponUtil.expandUWID(uwid);
	if(!uwid){
		p.errorMsg(", invalid syntax! Please use the format: `owo w rr {weaponID} [passive|stat]`!",5000);
		return;
	}
	return {rrType, uwid};
}

async function getWeapon(p,uwid){
	/* Grab weapon from database */
	let sql = `SELECT user.uid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user INNER JOIN user_weapon a ON user.uid = a.uid LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid WHERE a.uwid = ${uwid} AND user.id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	/* Check if valid */
	if(!result[0]){
		p.errorMsg(", I could not find a weapon with that unique weapon id!",4000);
		return;
	}

	/* Parse weapon to get info */
	let weapon = weaponUtil.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = weaponUtil.parseWeapon(weapon);

	/* If no weapon */
	if(!weapon){
		p.errorMsg(", I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!",4000);
		return;
	}else if(weapon.unsellable){
		p.errorMsg(", I can't reroll this weapon!",4000);
		return;
	}

	return weapon;
}

async function sendMessage(p,oldWeapon,newWeapon,rrType,msg,addRerollEmoji){
	let embed = createEmbed(p,oldWeapon,newWeapon);
	if(!msg){
		/* send and construct reaction collector */
		msg = await p.send({embed});
	}else{
		msg.edit({embed});
	}

	if(addRerollEmoji)
		await msg.addReaction(retryEmoji);

	let filter = (emoji,userID) => retryEmoji == emoji.name&&p.msg.author.id == userID;
	let collector = p.reactionCollector.create(msg,filter,{time:900000,idle:120000});

	collector.on('collect', async (emoji) => {
			collector.stop("clicked");
			if(emoji.name===retryEmoji){
				if(!(await useShards(p))){
					embed.color = 16711680;
					msg.edit({content:"You don't have enough "+shardEmoji+" Weapon Shards!",embed});
				}else{
					newWeapon = await fetchNewWeapon(p,oldWeapon,rrType);
					if(!newWeapon){
						embed.color = 16711680;
						msg.edit({content:"Failed to change weapon stats!!",embed});
					}else{
						sendMessage(p,oldWeapon,newWeapon,rrType,msg);
					}
				}
			}
	});

	collector.on('end',async function(reason){
		if(reason!="clicked"){
			embed.color = 6381923;
			await msg.edit({content:"This message is now inactive",embed});
		}
	});
}

async function useShards(p){
	/* check if enough shards */
	let sql = `UPDATE shards INNER JOIN user ON shards.uid = user.uid SET shards.count = shards.count - ${rerollPrice} WHERE user.id = ${p.msg.author.id} AND shards.count >= ${rerollPrice};`;
	let result = await p.query(sql);
	if(result.changedRows >= 1){
		p.logger.value('weaponshards',(-1*rerollPrice),['id:'+p.msg.author.id,'type:reroll']);
		return true;
	}
	return false;
}

async function fetchNewWeapon(p,weapon,type){
	/* Get new weapon */
	let newWeapon;
	if(type=="p") newWeapon = weapon.rerollPassives();
	else if(type=="s") newWeapon = weapon.rerollStats();
	else p.errorMsg(", It seems like javascript broke.. This should never happen!",3000);
	newWeapon.uwid = weapon.uwid;
	newWeapon.ruwid = weapon.ruwid;
	for(let i in weapon.passives){
		newWeapon.passives[i].pcount = weapon.passives[i].pcount;
	}

	if(await applyChange(p,newWeapon))
		return newWeapon;
	else
		return null;
}

function createEmbed(p,oldWeapon, newWeapon){
	const embed = {
		author:{
			name:p.msg.author.username+" spent "+rerollPrice+" Weapon Shards to reroll!",
			icon_url:p.msg.author.dynamicAvatarURL()
		},
		footer:{
			text: yesEmoji+" to keep the changes | "+noEmoji+" to discard the changes | "+retryEmoji+" to try again"
		},
		color: p.config.embed_color,
		fields:[
			parseDescription("OLD WEAPON", oldWeapon),
			parseDescription("NEW WEAPON", newWeapon)
		]
	}

	embed.fields[0].value += "\n‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗";
	return embed;
}

function parseDescription(title,weapon){
	let desc = `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%\n`;
	desc += `**WP Cost:** ${Math.ceil(weapon.manaCost)} <:wp:531620120976687114>`;
	desc += `\n**Description:** ${weapon.desc}\n`;
	if(weapon.buffList.length>0){
		desc += `\n`;
		let buffs = weapon.getBuffs();
		for(let i in buffs){
			desc += `${buffs[i].emoji} **${buffs[i].name}** - ${buffs[i].desc}\n`;
		}
	}
	if(weapon.passives.length<=0)
		desc += `\n**Passives:** None`;
	for(let i=0;i<weapon.passives.length;i++){
		let passive = weapon.passives[i];
		desc += `\n${passive.emoji} **${passive.name}** - ${passive.desc}`;
	}
	return {name:weapon.emoji+" **"+title+"**",value:desc};
}
