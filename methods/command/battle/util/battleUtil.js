const Error = require('../../../../handler/errorHandler.js');
const teamUtil = require('./teamUtil.js');
const weaponUtil = require('./weaponUtil.js');
const animalUtil = require('./animalUtil.js');
const battleImageUtil = require('../battleImage.js');

exports.getBattle = function(p){
	return undefined;
}

exports.initBattle = async function(p){
	/* Find random opponent */
	let sql = `SELECT COUNT(pgid) as count FROM pet_team`;
	let count = await p.query(sql);

	if(!count[0]) throw new Error("battleUtil sql is broken");

	count = Math.floor(Math.random()*count[0].count);

	/* Query random team */
	sql = `SELECT tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE pet_team.pgid = (
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
	sql += `SELECT tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY pos ASC;`;
	sql += `SELECT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND a.pid IN (SELECT pid FROM pet_team LEFT JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}));`;

	let result = await p.query(sql);

	/* Parse */
	let eTeam = teamUtil.parseTeam(p,result[0],result[1]);
	let pTeam = teamUtil.parseTeam(p,result[2],result[3]);

	/* Init stats */
	for(let i in eTeam) animalUtil.stats(eTeam[i]);
	for(let i in pTeam) animalUtil.stats(pTeam[i]);

	/* Combine all to one obj */
	let teams = {player:{name:result[0][0].tname,team:pTeam},enemy:{name:result[2][0].tname,team:eTeam}};

	/* Added the team into team_battle table */
	//TODO

	return teams;
}

exports.display = async function(team){
	let image = await battleImageUtil.generateImage(team);
	return image;
}
