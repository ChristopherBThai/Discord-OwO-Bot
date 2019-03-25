const teamUtil = require('./teamUtil.js');
const animalUtil = require('./animalUtil.js');

exports.challenge = async function(p,id,bet){

	/* Get opponent info */
	var opponent = await p.global.getUser(id);
	if(!opponent){
		p.errorMsg(", That is not a valid id!");
		return;
	}
	let user1 = p.msg.author.id;
	let user2 = opponent.id;
	if(p.msg.author.id>opponent.id){
		user1 = opponent.id;
		user2 = p.msg.author.id;
	}

	/* Query two teams */
	let sql = `SELECT pet_team.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid 
		WHERE user.id = ${id} 
		ORDER BY pos ASC;`;
	sql += `SELECT pet_team.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid 
		WHERE user.id = ${p.msg.author.id} 
		ORDER BY pos ASC;`;
	sql += `SELECT money from cowoncy where id = ${p.msg.author.id};`;
	sql += `SELECT money from cowoncy where id = ${opponent.id};`;
	sql += `SELECT * FROM user_battle WHERE (
			user1 IN (SELECT uid FROM user WHERE id IN (${user2},${user1})) OR
			user2 IN (SELECT uid FROM user WHERE id IN (${user2},${user1})) 
		) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 10;`;
	sql += `SELECT win1,win2,tie FROM user_battle 
			LEFT JOIN user u1 ON user_battle.user1 = u1.uid
			LEFT JOIN user u2 ON user_battle.user2 = u2.uid
		WHERE u1.id = ${user1} AND u2.id = ${user2};`;
	let result = await p.query(sql);

	/* Error check for teams */
	if(!result[0][0]){
		p.errorMsg(", The opponent doesn't have a team!",3000);
		return;
	}else if(!result[1][0]){
		p.errorMsg(", You don't have a team!",3000);
		return;
	}else if(!result[2][0]||result[2][0].money<bet){
		p.errorMsg(", You don't have enough cowoncy!",3000);
		return;
	}else if(!result[3][0]||result[3][0].money<bet){
		p.errorMsg(", The opponent doesn't have enough cowoncy!",3000);
		return;
	}else if(result[4][0]){
		p.errorMsg(", There is already a pending battle!",3000);
		return;
	}

	/* Parse teams */
	let pTeam = teamUtil.parseTeam(p,result[1],result[1]);
	for(let i in pTeam) animalUtil.stats(pTeam[i]);
	let eTeam = teamUtil.parseTeam(p,result[0],result[0]);
	for(let i in eTeam) animalUtil.stats(eTeam[i]);
	let player = {username:p.msg.author.username,
		id:p.msg.author.id,
		name:result[1][0].tname,
		team:pTeam};
	let enemy = {username:opponent.username,
		id:opponent.id,
		name:result[0][0].tname,
		team:eTeam};
	let stats = {};
	stats.tie = result[5][0]?result[5][0].tie:0;
	stats[user1] = result[5][0]?result[5][0].win1:0;
	stats[user2] = result[5][0]?result[5][0].win2:0;

	/* Insert challenge to database */
	sql = `INSERT INTO user_battle (user1,user2,sender,bet) values ((SELECT uid FROM user WHERE id = ${user1}),(SELECT uid FROM user WHERE id = ${user2}),(SELECT uid FROM user WHERE id = ${p.msg.author.id}),${bet}) ON DUPLICATE KEY UPDATE time = NOW(), sender = (SELECT uid FROM user WHERE id = ${p.msg.author.id}), bet = ${bet};`;
	result = p.query(sql);

	/* Send challenge request */
	let embed = toEmbedRequest(p,stats,bet,player,enemy);
	p.send({embed});
}

function toEmbedRequest(p,stats,bet,sender,receiver){
	let text = "";
	for(let i in sender.team){
		let animal = sender.team[i];
		text += "\nL."+animal.stats.lvl+" "+animal.animal.value + " ";
		text += animal.nickname?animal.nickname:animal.animal.name;
		if(animal.weapon){
			text += " | "+animal.weapon.rank.emoji+animal.weapon.emoji;
			let passives = animal.weapon.passives;
			for(var j in passives){
				text += passives[j].emoji;
			}
			text += " "+animal.weapon.avgQuality+"%";
		}
	}

	let text2 = "";
	for(let i in receiver.team){
		let animal = receiver.team[i];
		text2 += "\nL."+animal.stats.lvl+" "+animal.animal.value + " ";
		text2 += animal.nickname?animal.nickname:animal.animal.name;
		if(animal.weapon){
			text2 += " | "+animal.weapon.rank.emoji+animal.weapon.emoji;
			let passives = animal.weapon.passives;
			for(var j in passives){
				text2 += passives[j].emoji;
			}
			text2 += " "+animal.weapon.avgQuality+"%";
		}
	}

	var embed = {
		author:{
			name: sender.username+" challenged "+receiver.username+" to a battle!",
			icon_url: p.msg.author.avatarURL
		},
		description: "Bet amount: "+bet+" cowoncy\n`owo ab` to accept the battle!\n`owo db` to decline the battle!",
		fields: [
		{
			name:(sender.name?sender.name:sender.username+"'s Team")+(sender.id==receiver.id?"":" | "+(stats[sender.id]?stats[sender.id]:0)+" wins"),
			value: text,
			inline:true
		},{
			name:(receiver.name?receiver.name:receiver.username+"'s Team")+(sender.id==receiver.id?"":" | "+(stats[receiver.id]?stats[receiver.id]:0)+" wins"),
			value: text2,
			inline:true
		}],
		color:p.config.embed_color,
		footer:{
			text:"This challenge will expire in 10 minutes"
		},
		timestamp: new Date()
	}

	return embed;
}

exports.inBattle = async function(p){
	let sql = `SELECT * FROM user_battle WHERE (
			user1 = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) OR
			user2 = (SELECT uid FROM user WHERE id = ${p.msg.author.id})
		) AND TIMESTAMPDIFF(MINUTE,time,NOW()) < 10;`
	let result = await p.query(sql);
	return result[0];
}
