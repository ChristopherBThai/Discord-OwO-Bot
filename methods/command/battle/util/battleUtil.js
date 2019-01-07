const Discord = require('discord.js');
const Error = require('../../../../handler/errorHandler.js');
const teamUtil = require('./teamUtil.js');
const weaponUtil = require('./weaponUtil.js');
const animalUtil = require('./animalUtil.js');
const battleImageUtil = require('../battleImage.js');

exports.getBattle = async function(p){
	/* And our team */
	let sql = `SELECT pet_team_battle.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid
			INNER JOIN pet_team_animal ON pet_team_battle.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid 
		WHERE user.id = ${p.msg.author.id} 
			AND active = 1
		ORDER BY pos ASC;`;
	/* Query enemy team */
	sql += `SELECT pet_team_battle.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid
			INNER JOIN pet_team_animal ON pet_team_battle.epgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid 
		WHERE user.id = ${p.msg.author.id} 
			AND active = 1
		ORDER BY pos ASC;`;

	let result = await p.query(sql);

	/* Grab pgid */
	let pgid = result[0][0]?result[0][0].pgid:undefined;
	let epgid = result[1][0]?result[1][0].pgid:undefined;

	if(!pgid||!epgid) return undefined;

	/* Parse teams */
	let pTeam = teamUtil.parseTeam(p,result[0],result[0]);
	for(let i in pTeam) animalUtil.stats(pTeam[i]);
	let eTeam = teamUtil.parseTeam(p,result[1],result[1]);
	for(let i in eTeam) animalUtil.stats(eTeam[i]);

	/* Combine result */
	let teams = {player:{name:result[0][0].tname,team:pTeam},enemy:{name:result[1][0].tname,team:eTeam}};

	return teams;
}

exports.initBattle = async function(p){
	/* Find random opponent */
	let sql = `SELECT COUNT(pgid) as count FROM pet_team`;
	let count = await p.query(sql);

	if(!count[0]) throw new Error("battleUtil sql is broken");

	count = Math.floor(Math.random()*count[0].count);

	/* Query random team */
	sql = `SELECT pet_team.pgid,tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE pet_team.pgid = (
			SELECT pgid FROM pet_team LIMIT 1 OFFSET ${count}	
		) ORDER BY pos ASC;`;
	sql += `SELECT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname 
		FROM 
			user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid 
		WHERE 
			a.pid IN (
				SELECT pid FROM pet_team LEFT JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid WHERE pet_team.pgid = (SELECT pgid FROM pet_team LIMIT 1 OFFSET ${count})
			);`;
	/* And our team */
	sql += `SELECT pet_team.pgid,tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY pos ASC;`;
	sql += `SELECT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND a.pid IN (SELECT pid FROM pet_team LEFT JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}));`;

	let result = await p.query(sql);

	let pgid = result[0][0]?result[0][0].pgid:undefined;
	let epgid = result[2][0]?result[2][0].pgid:undefined;

	if(!pgid||!epgid) throw new Error("Could not grab pgid");

	/* Parse */
	let eTeam = teamUtil.parseTeam(p,result[0],result[1]);
	let pTeam = teamUtil.parseTeam(p,result[2],result[3]);

	/* Init stats */
	let cphp="",cpwp="",cehp="",cewp="";
	for(let i in eTeam){
		animalUtil.stats(eTeam[i]);
		cehp += eTeam[i].stats.hp[0]+",";
		cewp += eTeam[i].stats.wp[0]+",";
	}
	for(let i in pTeam){
		animalUtil.stats(pTeam[i]);
		cphp += pTeam[i].stats.hp[0]+",";
		cpwp += pTeam[i].stats.wp[0]+",";
	}
	cphp = cphp.slice(0,-1);
	cpwp = cpwp.slice(0,-1);
	cehp = cehp.slice(0,-1);
	cewp = cewp.slice(0,-1);

	/* Combine all to one obj */
	let teams = {player:{name:result[0][0].tname,team:pTeam},enemy:{name:result[2][0].tname,team:eTeam}};

	/* Added the team into team_battle table */
	sql = `INSERT IGNORE INTO pet_team_battle (pgid,epgid,cphp,cpwp,cehp,cewp,active) VALUES (
			${pgid},${epgid},
			'${cphp}','${cpwp}',
			'${cehp}','${cewp}',
			1
		) ON DUPLICATE KEY UPDATE 
			epgid = ${epgid},
			cphp = '${cphp}', cpwp = '${cpwp}',
			cehp = '${cehp}', cewp = '${cewp}',
			active = 1,started = NOW();`;
	result = await p.query(sql);

	return teams;
}

exports.display = async function(p,team){
	let image = await battleImageUtil.generateImage(team);
	/* TODO add team info+image in embed */
	let pTeam = "";
	for(var i=0;i<team.player.team.length;i++){
		let player = team.player.team[i];
		pTeam += player.animal.value;
		if(player.weapon){
			pTeam += " - "+player.weapon.rank.emoji+player.weapon.emoji;
			let passives = player.weapon.passives;
			for(var j in passives){
				pTeam += passives[j].emoji;
			}
		}else
			pTeam += " - *no weapon*";
		pTeam += "\n";
	}
	let eTeam = "";
	for(var i=0;i<team.enemy.team.length;i++){
		let enemy = team.enemy.team[i];
		eTeam += enemy.animal.value;
		if(enemy.weapon){
			eTeam += " - "+enemy.weapon.rank.emoji+enemy.weapon.emoji;
			let passives = enemy.weapon.passives;
			for(var j in passives){
				eTeam+= passives[j].emoji;
			}
		}else
			eTeam += " - *no weapon*";
		eTeam += "\n";

	}
	let embed = {
		"color":p.config.embed_color,
		"author":{
			"name":p.msg.author.username+" goes into battle!",
			"icon_url":p.msg.author.avatarURL
		},
		"fields":[
		{
			"name":team.player.name,
			"value":pTeam,
			"inline":true
		},{
			"name":team.enemy.name,
			"value":eTeam,
			"inline":true
		}
		]
	}
	return {file:image,embed};
}
