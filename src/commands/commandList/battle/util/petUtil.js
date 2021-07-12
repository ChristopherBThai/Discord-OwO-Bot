/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const teamUtil = require('./teamUtil.js');
const animalUtil = require('./animalUtil.js');
const WeaponInterface = require('../WeaponInterface.js');

/* get and parse animals from the database */
exports.getAnimals = async function(p){
	/* Query animals and weapons */
	let sql = `SELECT animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM animal
			LEFT JOIN user_weapon ON user_weapon.pid = animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE animal.id = ${p.msg.author.id}
			AND animal.xp > 0
		ORDER BY xp DESC LIMIT 25;`;

	let result = await p.query(sql);

	/* Parse data */
	let animals = teamUtil.parseTeam(p,result,result);
	for(let i in animals) animalUtil.stats(animals[i]);

	return animals;
}

/* Construct embed message */
exports.getDisplay = function(p,animals){
	let embed = {
		"author":{
			"name":p.msg.author.username+"'s pets",
			"icon_url":p.msg.author.avatarURL
		},
		"color": p.config.embed_color,
		"fields":[]
	};

	let letterCount = embed.author.name.length;


	for(let i in animals){
		let animal = animals[i];

		let digits = 1;
		let tempDigit = Math.log10(animal.stats.hp[1]+animal.stats.hp[3])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.wp[1]+animal.stats.wp[3])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.att[0]+animal.stats.att[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.mag[0]+animal.stats.mag[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.pr[0]+animal.stats.pr[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.mr[0]+animal.stats.mr[1])+1;
		if(tempDigit>digits) digits = tempDigit;
		digits = Math.trunc(digits);

		let hp = (''+Math.ceil(animal.stats.hp[1]+animal.stats.hp[3])).padStart(digits,"0");
		let wp = (''+Math.ceil(animal.stats.wp[1]+animal.stats.wp[3])).padStart(digits,"0");
		let att = (''+Math.ceil(animal.stats.att[0]+animal.stats.att[1])).padStart(digits,"0");
		let mag = (''+Math.ceil(animal.stats.mag[0]+animal.stats.mag[1])).padStart(digits,"0");
		let pr = WeaponInterface.resToPrettyPercent(animal.stats.pr);
		let mr = WeaponInterface.resToPrettyPercent(animal.stats.mr);
		let stats = `<:hp:531620120410456064> \`${hp}\` <:wp:531620120976687114> \`${wp}\`\n<:att:531616155450998794> \`${att}\` <:mag:531616156231139338> \`${mag}\`\n<:pr:531616156222488606> \`${pr}\` <:mr:531616156226945024> \`${mr}\``;
		let weapon = animal.weapon;
		let weaponText = "";
		if(weapon){
			weaponText += `\`${weapon.uwid}\` ${weapon.rank.emoji} ${weapon.emoji} `;
			for(var j=0;j<weapon.passives.length;j++){
				weaponText += `${weapon.passives[j].emoji} `;
			}
			weaponText += `${weapon.avgQuality}%`;
		}

		let field = {
			"name":(animal.animal.uni?animal.animal.uni:animal.animal.value)+" "+p.replaceMentions((animal.nickname?animal.nickname:animal.animal.name)),
			"value":`Lvl.${animal.stats.lvl} \`[${p.global.toFancyNum(animal.stats.xp[0])}/${p.global.toFancyNum(animal.stats.xp[1])}]\`\n${stats}\n${weaponText}`,
			"inline":true
		};

		/* Discord embed char limit */
		letterCount += field.name.length + field.value.length;
		if(letterCount>6000)
			return {embed}

		embed.fields.push(field);
	}

	return {embed};
}

exports.giveXp = async function(p,team,xp) {
	let sql = '';
	let xpMapping = {};
	if (team) {
		// battle - oppposing team

		// get highest level
		let highestLvl = 1;
		for (let i in team.team) {
			if(team.team[i].stats.lvl > highestLvl) highestLvl = team.team[i].stats.lvl;
		}

		//full xp with bonus xp (will be level diff only, already calculated)
		let xpGain = xp.base + xp.bonus;

		// calculate xp per pet on team
		for (let i in team.team) {
			// catch up multiplier gets applied
			let lvl = team.team[i].stats.lvl;

			let multiplier = lvl < highestLvl ? 2 + ((highestLvl-lvl)/10) : 1;
			// hard cap at 10
			if (multiplier > 10) multiplier = 10;

			xpMapping[team.team[i].pid] = Math.round(multiplier * xpGain);
		}

	}
	else {
		// something done by the user (battling, hunting, huntbot), give exp to all pets on teams

		// find and map all the user's pets on teams and whether team is active or not
		sql = `SELECT ANIMAL.pid, ANIMAL.xp, PET_TEAM.pgid, CASE WHEN PET_TEAM_ACTIVE.PGID IS NOT NULL THEN 1 ELSE 0 END AS active FROM USER INNER JOIN PET_TEAM TEAM ON USER.UID = TEAM.UID INNER JOIN PET_TEAM_ANIMAL PET_TEAM ON TEAM.PGID = PET_TEAM.PGID INNER JOIN ANIMAL ON PET_TEAM.PID = ANIMAL.PID LEFT JOIN pet_team_active PET_TEAM_ACTIVE ON PET_TEAM.PGID = PET_TEAM_ACTIVE.PGID WHERE USER.ID = ${p.msg.author.id} ORDER BY ACTIVE DESC`;
		let results = await p.query(sql);
		let teams = {};
		results.forEach(animal => {
			if (teams[animal.pgid]) {
				teams[animal.pgid].animals.push({
					id: animal.pid,
					lvl: animalUtil.toLvl(animal.xp).lvl
				});
			}
			else {
				teams[animal.pgid] = {
					active: animal.active,
					animals: [{
						id: animal.pid,
						lvl: animalUtil.toLvl(animal.xp).lvl
					}]
				};
			}
		});

		// assign exp per team
		for (let id in teams) {
			let team = teams[id];
			
			// get highest level
			let highestLvl = 1;
			for (let i in team.animals) {
				if(team.animals[i].lvl > highestLvl) highestLvl = team.animals[i].lvl;
			}

			// assign xp
			team.animals.forEach(animal => {
				if (xpMapping[animal.id]) return; // skip, already mapped

				let xpGain = xp.base;
				if (xp.inactiveHalf) {
					// hunting, inactive team gets half (no bonus xp)
					if (!team.active) xpGain = xpGain / 2;
				}
				else {
					// battling, active team gets bonus xp
					if (team.active) xpGain = xpGain + xp.bonus;

					// all teams get catch up multiplier applied
					let multiplier = animal.lvl < highestLvl ? 2 + ((highestLvl-animal.lvl)/10) : 1;
					// hard cap at 10
					if (multiplier > 10) multiplier = 10;

					xpGain = xpGain * multiplier;
				}
				xpMapping[animal.id] = Math.round(xpGain);
			});
		}
	}
	
	// build out query
	let cases = '';
	for (let id in xpMapping) {
		cases += ` WHEN animal.pid = ${id} THEN ${xpMapping[id]}`;
	}
	sql = `UPDATE IGNORE animal SET xp = xp + (CASE ${cases} ELSE 0 END) WHERE pid IN (${Object.keys(xpMapping)})`;
	
	return await p.query(sql);
}
