const requireDir = require('require-dir');
const WeaponInterface = require('../WeaponInterface.js');

const prices = {"Common":100,"Uncommon":250,"Rare":400,"Epic":600,"Mythical":2000,"Legendary":5000,"Fabled":20000};
const weaponEmoji = "🗡";
const weaponPerPage = 10;
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';

/* Initialize all the weapons */
const weaponsDir = requireDir('../weapons');
var weapons = {};
for(var key in weaponsDir){
	let weapon = weaponsDir[key];
	if(!weapon.disabled) weapons[weapon.getID] = weapon;
}

exports.getRandomWeapon = function(id){
	/* Grab a random weapon */
	let keys = Object.keys(weapons);
	let random = keys[Math.floor(Math.random()*keys.length)];
	let weapon = weapons[random];

	/* Initialize random stats */
	weapon = new weapon();

	return weapon;
}

exports.getItems = async function(p){
	var sql = `SELECT wid,count(uwid) AS count FROM user_weapon WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) GROUP BY wid`;
	var result = await p.query(sql);
	var items = {};
	for(var i = 0;i<result.length;i++){
		var key = result[i].wid;
		items[key] = {id:(key+100),count:result[i].count,emoji:weapons[key].getEmoji};
	}
	return items;
}

var parseWeapon = exports.parseWeapon = function(data){
	if(!data.parsed){
		/* Parse stats */
		data.stat = data.stat.split(",");
		for(var i=0;i<data.stat.length;i++)
			data.stat[i] = parseInt(data.stat[i]);

		/* Grab all passives */
		for(var i=0;i<data.passives.length;i++){
			let stats = data.passives[i].stat.split(",");
			for(var j=0;j<stats.length;j++)
				stats[j] = parseInt(stats[j]);
			let passive = new (WeaponInterface.allPassives[data.passives[i].id])(stats);
			data.passives[i] = passive; 
		}
		data.parsed = true;
	}

	/* Convert data to actual weapon data */
	let weapon = new (weapons[data.id])(data.passives,data.stat);
	weapon.uwid = data.uwid;
	weapon.pid = data.pid;
	weapon.animal = data.animal;

	return weapon;
}

var parseWeaponQuery = exports.parseWeaponQuery = function(query){
	/* Group weapons by uwid and add their respective passives */
	let weapons = {};
	for(var i=0;i<query.length;i++){
		if(query[i].uwid){
			var key = "_"+query[i].uwid;
			if(!(key in weapons)){
				weapons[key] = {
					uwid:query[i].uwid,
					pid:query[i].pid,
					id:query[i].wid,
					stat:query[i].stat,
					animal:{
						name:query[i].name,
						nickname:query[i].nickname
					},
					passives:[]
				};
			}
			if(query[i].wpid)
				weapons[key].passives.push({
					id:query[i].wpid,
					pcount:query[i].pcount,
					stat:query[i].pstat
				});
		}
	}
	return weapons;
}

/* Displays weapons with multiple pages */
exports.display = async function(p,pageNum=0){
	
	/* Construct initial page */
	let page = await getDisplayPage(p,pageNum);
	if(!page) return;

	/* Send msg and add reactions */
	let msg = await p.msg.channel.send({embed:page.embed});
	await msg.react(prevPageEmoji);
	await msg.react(nextPageEmoji);
	let filter = (reaction,user) => (reaction.emoji.name===nextPageEmoji||reaction.emoji.name===prevPageEmoji)&&user.id===p.msg.author.id;
	let collector = await msg.createReactionCollector(filter,{time:20000});

	collector.on('collect', async function(r){
		/* Save the animal's action */
		if(r.emoji.name===nextPageEmoji&&pageNum+1<page.maxPage) {
			pageNum++;
			page = await getDisplayPage(p,pageNum);
			msg.edit({embed:page.embed});
		}
		if(r.emoji.name===prevPageEmoji&&pageNum>0){
			pageNum--;
			page = await getDisplayPage(p,pageNum);
			msg.edit({embed:page.embed});
		}
	});

}

/* Gets a single page */
var getDisplayPage = async function(p,page){
	/* Query all weapons */
	let sql = `SELECT temp.*,user_weapon_passive.wpid,user_weapon_passive.pcount,user_weapon_passive.stat as pstat
		FROM 
			(SELECT user_weapon.uwid,user_weapon.wid,user_weapon.stat,animal.name,animal.nickname
			FROM  user
				INNER JOIN user_weapon ON user.uid = user_weapon.uid
				LEFT JOIN animal ON animal.pid = user_weapon.pid
			WHERE 
				user.id = ${p.msg.author.id}
			ORDER BY user_weapon.uwid DESC
			LIMIT ${weaponPerPage}
			OFFSET ${page*weaponPerPage}) temp
		LEFT JOIN
			user_weapon_passive ON temp.uwid = user_weapon_passive.uwid
	;`;
	sql += `SELECT COUNT(uwid) as count FROM user
			INNER JOIN user_weapon ON user.uid = user_weapon.uid
		WHERE 
			user.id = ${p.msg.author.id};`;
	var result = await p.query(sql);

	/* out of bounds or no weapon */
	if(!result[0][0]){
		p.errorMsg(", you do not have any weapons, or the page is out of bounds",3000);
		return;
	}
	
	/* Parse total weapon count */
	let totalCount = result[1][0].count;
	let nextPage = (((page+1)*weaponPerPage)<=totalCount);
	let prevPage = (page>0);
	let maxPage = Math.ceil(totalCount/weaponPerPage);


	/* Parse all weapons */
	let weapons = parseWeaponQuery(result[0]);

	/* Parse actual weapon data for each weapon */
	let desc = "Description: `owo weapon {weaponID}`\nEquip: `owo weapon {weaponID} {animal}`\nUnequip: `owo weapon unequip {weaponID}`\nSell `owo sell {weaponID}`\n";
	for(var key in weapons){
		let weapon = parseWeapon(weapons[key]);
		let emoji = `${weapon.rank.emoji}${weapon.emoji}`;
		for(var i=0;i<weapon.passives.length;i++){
			let passive = weapon.passives[i];
			emoji += passive.emoji;
		}
		desc += `\n\`${weapons[key].uwid}\` ${emoji} **${weapon.name}** | Quality: ${weapon.avgQuality}%`;
		if(weapons[key].animal.name){
			let animal = p.global.validAnimal(weapons[key].animal.name);
			desc += ` | ${(animal.uni)?animal.uni:animal.value} ${(weapons[key].animal.nickname)?weapons[key].animal.nickname:""}`;
		}
	}
	/* Construct msg */
	const embed = {
		"author":{
			"name":p.msg.author.username+"'s weapons",
			"icon_url":p.msg.author.avatarURL
		},
		"description":desc,
		"color": p.config.embed_color,
		"footer":{
			"text":"Page "+(page+1)+"/"+maxPage
		}
	};
	return {sql,embed,totalCount,nextPage,prevPage,maxPage}
}

exports.describe = async function(p,uwid){
	/* sql query */
	let sql = `SELECT a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid WHERE a.uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	var result = await p.query(sql);

	/* Check if valid */
	if(!result[0]){
		p.errorMsg(", I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!");
		return;
	}

	/* parse weapon to get info */
	var weapon = this.parseWeaponQuery(result);
	weapon = weapon[Object.keys(weapon)[0]];
	weapon = this.parseWeapon(weapon);

	/* If no weapon */
	if(!weapon){
		p.errorMsg(", I could not find a weapon with that unique weapon id! Please use `owo weapon` for the weapon ID!");
		return;
	}
	
	/* Parse image url */
	let url = weapon.emoji;
	if(temp = url.match(/:[0-9]+>/)){
		temp = "https://cdn.discordapp.com/emojis/"+temp[0].match(/[0-9]+/)[0]+".";
		if(url.match(/<a:/))
			temp += "gif";
		else
			temp += "png";
		url = temp;
	}

	/* Make description */
	let desc = `**Name:** ${weapon.name}\n`;
	desc += `**ID:** \`${uwid}\`\n`;
	desc += `**Sell Value:** ${prices[weapon.rank.name]}\n`;
	desc += `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%\n`;
	desc += `**WP Cost:** ${weapon.manaCost} <:wp:531620120976687114>`;
	desc += `\n**Description:** ${weapon.desc}\n`;
	if(weapon.passives.length<=0)
		desc += `\n**Passives:** None`;
	for(var i=0;i<weapon.passives.length;i++){
		let passive = weapon.passives[i];
		desc += `\n${passive.emoji} **${passive.name}** - ${passive.desc}`;
	}

	/* Construct embed */
	const embed ={
		"author":{
			"name":p.msg.author.username+"'s "+weapon.name,
			"icon_url":p.msg.author.avatarURL
		},
		"color":p.config.embed_color,
		"thumbnail":{
			"url":url
		},
		"description":desc
	};
	p.send({embed});
}

exports.equip = async function(p,uwid,pet){
	/* Construct sql depending in pet parameter */
	if(p.global.isInt(pet)){
		var pid = `(SELECT pid FROM user a LEFT JOIN pet_team b ON a.uid = b.uid LEFT JOIN pet_team_animal c ON b.pgid = c.pgid WHERE a.id = ${p.msg.author.id} AND pos = ${pet})`
	}else{
		var pid = `(SELECT pid FROM animal WHERE name = '${pet.value}' AND id = ${p.msg.author.id})`;
	}
	let sql = `UPDATE IGNORE user_weapon SET pid = NULL WHERE 
			uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND
			pid = ${pid} AND
			(SELECT * FROM (SELECT uwid FROM user_weapon WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND uwid = ${uwid}) a) IS NOT NULL;`
	sql += `UPDATE IGNORE user_weapon SET
			pid = ${pid}
		WHERE
			uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND
			uwid = ${uwid} AND
			${pid} IS NOT NULL;`;
	sql += `SELECT animal.name,animal.nickname,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal ON a.pid = animal.pid WHERE a.uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	let result = await p.query(sql);

	/* Success */
	if(result[1].changedRows>0){
		let animal = p.global.validAnimal(result[2][0].name);
		let nickname = result[2][0].nickname;
		let weapon = this.parseWeaponQuery(result[2]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		p.replyMsg(weaponEmoji,`, ${(animal.uni)?animal.uni:animal.value} **${(nickname)?nickname:animal.name}** is now wielding ${weapon.emoji} **${weapon.name}**!`);

	/* Already equipped */
	}else if(result[1].affectedRows>0){
		let animal = p.global.validAnimal(result[2][0].name);
		let nickname = result[2][0].nickname;
		let weapon = this.parseWeaponQuery(result[2]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		p.replyMsg(weaponEmoji,`, ${(animal.uni)?animal.uni:animal.value} **${(nickname)?nickname:animal.name}** is already wielding ${weapon.emoji} **${weapon.name}**!`);

	/* A Failure (like me!) */
	}else{
		p.errorMsg(", could not find that weapon or animal! The correct command is `owo weapon {weaponID} {animal}`");
	}
}

exports.unequip = async function(p,uwid){
	let sql = `SELECT animal.name,animal.nickname,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal ON a.pid = animal.pid WHERE a.uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	sql += `UPDATE IGNORE user_weapon SET pid = NULL WHERE uwid = ${uwid} AND uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id});`;
	let result =  await p.query(sql);

	/* Success */
	if(result[1].changedRows>0){
		let animal = p.global.validAnimal(result[0][0].name);
		let nickname = result[0][0].nickname;
		let weapon = this.parseWeaponQuery(result[0]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		p.replyMsg(weaponEmoji,`, Unequipped ${weapon.emoji} **${weapon.name}** from ${(animal.uni)?animal.uni:animal.value} **${(nickname)?nickname:animal.name}**`);


	/* No body using weapon */
	}else if(result[1].affectedRows>0){
		let weapon = this.parseWeaponQuery(result[0]);
		weapon = weapon[Object.keys(weapon)[0]];
		weapon = this.parseWeapon(weapon);
		p.replyMsg(weaponEmoji,`, No animal is using ${weapon.emoji} **${weapon.name}**`);

	/* Invalid */
	}else{
		p.errorMsg(`, Could not find a weapon with that id!`);
	}
}

/* Sells a weapon */
exports.sell = async function(p,uwid){
	let sql = `SELECT a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname 
		FROM user
			LEFT JOIN user_weapon a ON user.uid = a.uid
			LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid 
			LEFT JOIN animal c ON a.pid = c.pid 
		WHERE user.id = ${p.msg.author.id} AND a.uwid = ${uwid};`
	sql += `DELETE user_weapon_passive FROM user 
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid 
		LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE id = ${p.msg.author.id} 
			AND user_weapon_passive.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;
	sql += `DELETE user_weapon FROM user 
		LEFT JOIN user_weapon ON user.uid = user_weapon.uid 
		WHERE id = ${p.msg.author.id}
			AND user_weapon.uwid = ${uwid}
			AND user_weapon.pid IS NULL;`;

	let result = await p.query(sql);

	/* If an animal is using the weapon */
	if(result[0][0]&&result[0][0].name){
		p.errorMsg(", please unequip the weapon to sell it!",3000);
		return;
	}


	/* Check if deleted */
	if(result[2].affectedRows==0){
		p.errorMsg(", you do not have a weapon with this id!",3000);
		return;
	}
	
	/* Parse stats to determine price */
	let weapon = this.parseWeaponQuery(result[0]);
	for(var key in weapon){
		weapon = this.parseWeapon(weapon[key]);
	}

	/* Get weapon price */
	let price = prices[weapon.rank.name];
	if(!price){
		p.errorMsg(", Something went terribly wrong...");
		return;
	}

	/* Give cowoncy */
	sql = `UPDATE cowoncy SET money = money + ${price} WHERE id = ${p.msg.author.id}`;
	result = await p.query(sql);

	p.replyMsg(weaponEmoji,`, You sold a(n) **${weapon.rank.name} ${weapon.name}**  ${weapon.rank.emoji}${weapon.emoji} for **${price}** cowoncy!`);
}
