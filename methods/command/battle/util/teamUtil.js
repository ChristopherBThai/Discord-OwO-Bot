const badwords = require('../../../../../tokens/badwords.json');
const battleEmoji = "🛋";
const weaponUtil = require('./weaponUtil.js');
const animalUtil = require('./animalUtil.js');

/*
 * Adds a member to the user's team
 * We will assume that all parameters are valid
 * (Error check before calling this function
 * pos = must be between 1-3
 * animal = valid animal
 */
exports.addMember = async function(p,animal,pos){
	/* Get team and animal pid */
	var sql = `SELECT pos,pet_team.pgid,pid,name FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY pos ASC;`;
	sql += `SELECT pid,count FROM animal WHERE name = ? AND ID = ${p.msg.author.id};`;
	var result = await p.query(sql,[animal.value]);

	/* Check if its not a duplicate animal in team */
	var usedPos = [];
	for(var i=0;i<result[0].length;i++){
		if(result[0][i].name==animal.value){
			p.errorMsg(`, This animal is already in your team!`,3000);
			return;
		}
		
		/* Add used team pos to an array */
		usedPos.push(result[0][i].pos);
	}

	/* Check if position is available */
	if(!pos){
		for(var i=1;i<4;i++){
			if(!usedPos.includes(i)){
				pos = i;
				i = 4;
			}
		}
	}
	if(!pos){
		p.errorMsg(`, Your team is full! Please specify a position with \`owo team add {animal} {position}\`!`,5000);
		return;
	}

	/* Check if user owns animal */
	if(!result[1][0]){
		p.errorMsg(`, you do not own this animal!`,3000);
		return;
	}else if(false&&result[1][0].count<1){
		p.errorMsg(`, you need at least 1 animal in the zoo!`,3000);
		return;
	}

	/* Add the new animal into the team */
	/* If there is no team, create one */
	if(!result[0][0]){
		sql = `INSERT IGNORE INTO user (id) VALUES (${p.msg.author.id});
			INSERT IGNORE INTO pet_team (uid) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}));
			INSERT IGNORE INTO pet_team_animal (pgid,pid,pos) VALUES (
				(SELECT pgid FROM pet_team WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id})),
				${result[1][0].pid},
				1
			);`
	/* If team exists */
	}else{
		sql = `INSERT INTO pet_team_animal (pgid,pid,pos) VALUES (
				${result[0][0].pgid},
				${result[1][0].pid},
				${pos}
			) ON DUPLICATE KEY UPDATE
				pid = ${result[1][0].pid};`;
	}
	
	/* Query and send message */
	await p.query(sql);

	for(var i=0;i<result[0].length;i++){
		if(result[0][i].pos == pos)
			result[0].splice(i,1);
	}
	result[0].splice(pos-1,0,{name:animal.value,pos:pos});
	let team = parseTeam(p,result[0]);
	let text = "";
	for(var i=0;i<team.length;i++){
		text += "["+team[i].pos+"]"+((team[i].animal.uni)?team[i].animal.uni:team[i].animal.value)+" ";
	}
	p.replyMsg(battleEmoji,`, Your team has been updated!\n**${p.config.emoji.blank} |** Your team: ${text}`);
}

/*
 * Removes a member to the user's team
 * We will assume that all parameters are valid
 * (Error check before calling this function
 * remove = must be either 1-3 or an animal 
 */
exports.removeMember = async function(p,remove){
	let sql = `SELECT pos,animal.pid,name FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE user.id = ${p.msg.author.id} ORDER BY pos ASC;`;

	/* If its a position */
	if(p.global.isInt(remove)){
		sql = `DELETE FROM pet_team_animal WHERE 
			pgid = (SELECT pgid FROM pet_team WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id})) AND
			pos = ? AND
			(SELECT count FROM (SELECT COUNT(pid) as count FROM pet_team_animal WHERE pgid = (SELECT pgid FROM pet_team WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}))) as a) > 1;
		${sql}`;

	/* If its an animal */
	}else{
		sql = `DELETE FROM pet_team_animal WHERE 
			pgid = (SELECT pgid FROM pet_team WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id})) AND
			pid = (SELECT pid FROM animal WHERE name = ? AND id = ${p.msg.author.id}) AND
			(SELECT count FROM (SELECT COUNT(pid) as count FROM pet_team_animal WHERE pgid = (SELECT pgid FROM pet_team WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}))) as a) > 1;
		${sql}`;
	}

	let result = await p.query(sql,remove);

	var team = parseTeam(p,result[1]);
	let text = "";
	for(var i=0;i<team.length;i++){
		text += "["+team[i].pos+"]"+((team[i].animal.uni)?team[i].animal.uni:team[i].animal.value)+" ";
	}
	if(result[0].affectedRows>0){
		p.replyMsg(battleEmoji,`, Successfully changed the team!\n**${p.config.emoji.blank} |** Your team: ${text}`);
	}else if(!result[1]){
		p.errorMsg(`, You do not have a team!`,3000);
	}else if(result[1].length==1){
		p.errorMsg(`, You need to keep at least one animal in the team!`,3000);
	}else{
		p.errorMsg(`, I failed to remove that animal\n**${p.config.emoji.blank} |** Your team: ${text}`,5000);
	}
}

/*
 * Renames the team
 * (Error check before calling this function
 */
exports.renameTeam = async function(p,name){

	/* Name filter */
	var offensive = 0;
	var shortnick = name.replace(/\s/g,"").toLowerCase();
	for(var i=0;i<badwords.length;i++){
		if(shortnick.includes(badwords[i]))
			offensive = 1;
	}
	name = name.replace(/https:/gi,"https;");
	name = name.replace(/http:/gi,"http;");
	name = name.replace(/@everyone/gi,"everyone");
	name = name.replace(/<@!?[0-9]+>/gi,"User");
	name = name.replace(/[*`]+/gi,"'");

	/* Validation check */
	if(name.length>35){
		p.errorMsg(", The team name is too long!",3000);
		return;
	}else if(name.length<=0){
		p.errorMsg(", The name has invalid characters!",3000);
		return;
	}

	var sql = `UPDATE IGNORE pet_team SET tname = ?, censor = ${offensive} WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id})`;
	var result = await p.query(sql,name);
	if(result.affectedRows>0){
		p.replyMsg(battleEmoji,`, You successfully changed your team name to: **${name}**`);
	}else{
		p.errorMsg(", You don't have a team! Please set one with `owo team add {animal}`",5000);
	}
}

/*
 * Displays the team
 */
exports.displayTeam = async function(p){
	/* Query info */
	let sql = `SELECT tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY pos ASC;`;
	sql += `SELECT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND a.pid IN (SELECT pid FROM pet_team LEFT JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}));`;
	let result = await p.query(sql);
	if(!result[0][0]){
		p.errorMsg(", you don't have a team! Make one with `owo team add {animal}`");
		return;
	}

	/* Parse query */
	let team = parseTeam(p,result[0],result[1]);
	let digits = 1;
	for(let i in team){ 
		animalUtil.stats(team[i]);
		let tempDigit = Math.log10(team[i].stats.hp[1]+team[i].stats.hp[3])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.wp[1]+team[i].stats.wp[3])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.att[0]+team[i].stats.att[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.mag[0]+team[i].stats.mag[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.pr[0]+team[i].stats.pr[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.mr[0]+team[i].stats.mr[1])+1;
		if(tempDigit>digits) digits = tempDigit;
	}
	digits = Math.trunc(digits);

	/* Convert data to user readable strings */
	let fields = [];
	for(var i=1;i<=3;i++){
		let title = `[${i}] `;
		let body = "";
		let animal;
		for(var j=0;j<team.length;j++)
			if(team[j].pos==i)
				animal = team[j];
		if(!animal){
			title += "none";
			body = "*`owo team add {animal} "+i+"`*";
		}else{
			let hp = (''+Math.ceil(animal.stats.hp[1]+animal.stats.hp[3])).padStart(digits,"0");
			let wp = (''+Math.ceil(animal.stats.wp[1]+animal.stats.wp[3])).padStart(digits,"0");
			let att = (''+Math.ceil(animal.stats.att[0]+animal.stats.att[1])).padStart(digits,"0");
			let mag = (''+Math.ceil(animal.stats.mag[0]+animal.stats.mag[1])).padStart(digits,"0");
			let pr = (''+Math.ceil(animal.stats.pr[0]+animal.stats.pr[1])).padStart(digits,"0");
			let mr = (''+Math.ceil(animal.stats.mr[0]+animal.stats.mr[1])).padStart(digits,"0");
			title += `${(animal.animal.uni)?animal.animal.uni:animal.animal.value} **${(animal.nickname)?animal.nickname:animal.animal.name}** `;
			body = `Lvl ${animal.stats.lvl} [${animal.stats.xp[0]}/${animal.stats.xp[1]}]\n<:hp:531620120410456064> \`${hp}\` <:wp:531620120976687114> \`${wp}\`\n<:att:531616155450998794> \`${att}\` <:mag:531616156231139338> \`${mag}\`\n<:pr:531616156222488606> \`${pr}\` <:mr:531616156226945024> \`${mr}\`\n`;
			let weapon = animal.weapon;
			if(weapon){
				body += `\`${weapon.uwid}\` ${weapon.rank.emoji} ${weapon.emoji} `;
				for(var j=0;j<weapon.passives.length;j++){
					body += `${weapon.passives[j].emoji} `;
				}
				body += `${weapon.avgQuality}%`;
			}
		}
		fields.push({"name":title,"value":body,"inline":true});
	}

	/* Construct msg */
	const embed = {
		"author":{
			"name":p.msg.author.username+"'s "+result[0][0].tname,
			"icon_url":p.msg.author.avatarURL
		},
		"description":"`owo team add {animal} {pos}` Add an animal to your team\n`owo team remove {pos}` Removes an animal from your team\n`owo team rename {name}` Renames your team\n`owo rename {animal} {name}` Rename an animal",
		"color": p.config.embed_color,
		fields
	};
	p.send({embed});
}

/* Parses animals and weapons into json */
exports.parseTeam = parseTeam;
function parseTeam(p,animals,weapons,censor=false){
	let result = [];

	/* get basic animal info */
	let used = [];
	for(var i=0;i<animals.length;i++){
		let animal = animals[i];
		if(!used.includes(animal.pid)){
			used.push(animal.pid);
			result.push({
				pid:animal.pid,
				nickname:(censor&&animal.acensor==1)?"Censored":animal.nickname,
				pos:animal.pos,
				xp:animal.xp,
				animal:p.global.validAnimal(animal.name)
			});
		}
	}

	if(weapons){
		/* get weapon info */
		let weps = weaponUtil.parseWeaponQuery(weapons);

		/* Combine the two json */
		for(var key in weps){
			let pid = weps[key].pid;
			for(var i=0;i<result.length;i++)
				if(result[i].pid == pid)
					result[i].weapon = weaponUtil.parseWeapon(weps[key]);
		}
	}

	return result;
}

/* Checks if the team is dead */
exports.isDead = function(team){
	let totalhp = 0;
	for(var i in team){
		let hp = team[i].stats.hp[0];
		totalhp += hp<0?0:hp;
	}
	return totalhp<=0;
}

/* Distributes xp to team */
exports.giveXP = async function(p,team,xp){
	let sql = '';
	for(let i in team.team){
		sql += animalUtil.giveXP(team.team[i].pid,xp);
	}
	await p.query(sql);
}

