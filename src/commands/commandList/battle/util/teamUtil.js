/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const battleEmoji = '🛋';
const animalUtil = require('./animalUtil.js');
const WeaponInterface = require('../WeaponInterface.js');
const global = require('../../../../utils/global.js');
const mysql = require('../../../../botHandlers/mysqlHandler.js');
const defaultMaxTeams = 2;
let weaponUtil;

const filterTeams = `
SELECT pt2.pgid
FROM pet_team pt2
	LEFT JOIN pet_team_active pt_act
		ON pt2.pgid = pt_act.pgid
WHERE u.uid = pt2.uid
ORDER BY pt_act.pgid DESC, pt2.pgid ASC
LIMIT 1
`;

/*
 * Adds a member to the user's team
 * We will assume that all parameters are valid
 * (Error check before calling this function
 * pos = must be between 1-3
 * animal = valid animal
 */
exports.addMember = async function (p, animal, pos) {
	/* Get team and animal pid */
	let sql = `SELECT pos,pt.pgid,a.pid,name
		FROM user u
			INNER JOIN pet_team pt
				ON pt.uid = u.uid
			LEFT JOIN pet_team_animal pt_ani
				ON pt.pgid = pt_ani.pgid
			LEFT JOIN animal a
				ON pt_ani.pid = a.pid
		WHERE u.id = ${p.msg.author.id} AND pt.pgid = (${filterTeams})
		ORDER BY pos ASC;`;
	sql += `SELECT pid,count FROM animal WHERE name = ? AND id = ${p.msg.author.id};`;
	let result = await p.query(sql, [animal.value]);

	/* Check if its not a duplicate animal in team */
	let usedPos = [];
	for (let i = 0; i < result[0].length; i++) {
		if (result[0][i].name == animal.value) {
			p.errorMsg(', This animal is already in your team!', 3000);
			return;
		}

		/* Add used team pos to an array */
		usedPos.push(result[0][i].pos);
	}

	/* Check if position is available */
	if (!pos) {
		for (let i = 1; i < 4; i++) {
			if (!usedPos.includes(i)) {
				pos = i;
				i = 4;
			}
		}
	}
	if (!pos) {
		p.errorMsg(
			', Your team is full! Please specify a position with `owo team add {animal} {position}`!',
			5000
		);
		return;
	}

	/* Check if user owns animal */
	if (!result[1][0]) {
		p.errorMsg(', you do not own this animal!', 3000);
		return;
		/* eslint-disable-next-line */
	} else if (false && result[1][0].count < 1) {
		p.errorMsg(', you need at least 1 animal in the zoo!', 3000);
		return;
	}

	/* Add the new animal into the team */
	/* If there is no team, create one */
	if (!result[0][0]) {
		sql = `INSERT IGNORE INTO user (id) VALUES (${p.msg.author.id});
			INSERT IGNORE INTO pet_team (uid) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id} AND (SELECT pgid FROM pet_team p WHERE p.uid = user.uid) IS NULL));
			INSERT IGNORE INTO pet_team_animal (pgid,pid,pos) VALUES (
				(SELECT pgid FROM pet_team WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id})),
				${result[1][0].pid},
				1
			);`;
		/* If team exists */
	} else {
		sql = `INSERT INTO pet_team_animal (pgid,pid,pos) VALUES (
				${result[0][0].pgid},
				${result[1][0].pid},
				${pos}
			) ON DUPLICATE KEY UPDATE
				pid = ${result[1][0].pid};`;
	}

	/* Query and send message */
	await p.query(sql);

	for (let i = 0; i < result[0].length; i++) {
		if (result[0][i].pos == pos || !result[0][i].pid) result[0].splice(i, 1);
	}
	result[0].splice(pos - 1, 0, { name: animal.value, pos: pos });
	let team = parseTeam(result[0]);
	let text = '';
	for (let i = 0; i < team.length; i++) {
		text +=
			'[' +
			team[i].pos +
			']' +
			(team[i].animal.uni ? team[i].animal.uni : team[i].animal.value) +
			' ';
	}
	p.replyMsg(
		battleEmoji,
		`, Your team has been updated!\n**${p.config.emoji.blank} |** Your team: ${text}`
	);
};

/*
 * Removes a member to the user's team
 * We will assume that all parameters are valid
 * (Error check before calling this function
 * remove = must be either 1-3 or an animal
 */
exports.removeMember = async function (p, remove) {
	let sql = `SELECT pt.pgid
		FROM user u
			INNER JOIN pet_team pt
				ON pt.uid = u.uid
			LEFT JOIN pet_team_active pt_act
				ON pt.pgid = pt_act.pgid
		WHERE id = ${p.msg.author.id}
		ORDER BY pt_act.pgid DESC, pt.pgid ASC
		LIMIT 1;`;
	let result = await p.query(sql);
	if (!result[0] || !result[0].pgid) {
		p.errorMsg(', your team is already empty!', 3000);
		return;
	}
	const pgid = result[0].pgid;

	/* If its a position */
	if (p.global.isInt(remove)) {
		sql = `DELETE FROM pet_team_animal WHERE
			pgid = ${pgid} AND
			pos = ? AND
			(SELECT count FROM (SELECT COUNT(pid) AS count FROM pet_team_animal WHERE pgid = ${pgid}) a) > 1;`;

		/* If its an animal */
	} else {
		sql = `DELETE FROM pet_team_animal WHERE
			pgid = ${pgid} AND
			pid = (SELECT pid FROM animal WHERE name = ? AND id = ${p.msg.author.id}) AND
			(SELECT count FROM (SELECT COUNT(pid) AS count FROM pet_team_animal WHERE pgid = ${pgid}) a) > 1;`;
	}
	sql += `SELECT pos,pt.pgid,a.pid,name
		FROM user u
			INNER JOIN pet_team pt
				ON pt.uid = u.uid
			LEFT JOIN pet_team_animal pt_ani
				ON pt.pgid = pt_ani.pgid
			LEFT JOIN animal a
				ON pt_ani.pid = a.pid
		WHERE u.id = ${p.msg.author.id} AND pt.pgid = (${filterTeams})
		ORDER BY pos ASC;`;
	result = await p.query(sql, remove);

	if (result[1][0] && !result[1][0].pid) {
		p.errorMsg(", your team doesn't have an animal!");
		return;
	}

	let team = parseTeam(result[1]);
	let text = '';
	for (let i = 0; i < team.length; i++) {
		text +=
			'[' +
			team[i].pos +
			']' +
			(team[i].animal.uni ? team[i].animal.uni : team[i].animal.value) +
			' ';
	}
	if (result[0].affectedRows > 0) {
		p.replyMsg(
			battleEmoji,
			`, Successfully changed the team!\n**${p.config.emoji.blank} |** Your team: ${text}`
		);
	} else if (!result[1]) {
		p.errorMsg(', You do not have a team!', 3000);
	} else if (result[1].length == 1) {
		p.errorMsg(', You need to keep at least one animal in the team!', 3000);
	} else {
		p.errorMsg(
			`, I failed to remove that animal\n**${p.config.emoji.blank} |** Your team: ${text}`,
			5000
		);
	}
};

/*
 * Renames the team
 * (Error check before calling this function
 */
exports.renameTeam = async function (p, teamName) {
	/* Name filter */
	const { name, offensive } = p.global.filteredName(teamName);

	/* Validation check */
	if (name.length > 35) {
		p.errorMsg(', The team name is too long!', 3000);
		return;
	} else if (name.length <= 0) {
		p.errorMsg(', The name has invalid characters!', 3000);
		return;
	}

	const sql = `UPDATE IGNORE pet_team
		SET tname = ?, censor = ${offensive}
		WHERE pet_team.pgid = (SELECT pgid FROM
			(SELECT pt2.pgid
			FROM user
			INNER JOIN pet_team pt2
				ON user.uid = pt2.uid
			LEFT JOIN pet_team_active pt_act
				ON pt2.pgid = pt_act.pgid
			WHERE user.id = ${p.msg.author.id}
			ORDER BY pt_act.pgid DESC, pt2.pgid ASC
			LIMIT 1) tmp
		)`;
	const result = await p.query(sql, name);
	if (result.affectedRows > 0) {
		p.replyMsg(
			battleEmoji,
			p.replaceMentions(`, You successfully changed your team name to: **${name}**`)
		);
	} else {
		p.errorMsg(", You don't have a team! Please set one with `owo team add {animal}`", 5000);
	}
};

exports.getBattleTeam = async function ({ id, pgid }, level, notActive) {
	let pgidQuery = `(SELECT pt2.pgid FROM user u2
			INNER JOIN pet_team pt2
				ON pt2.uid = u2.uid
			LEFT JOIN pet_team_active pt_act
				ON pt2.pgid = pt_act.pgid
		WHERE u2.id = ${id}
		ORDER BY pt_act.pgid DESC, pt2.pgid ASC
		LIMIT 1)`;
	if (id && notActive) {
		pgidQuery = `(SELECT pt2.pgid FROM user u2
			INNER JOIN pet_team pt2
				ON pt2.uid = u2.uid
			LEFT JOIN pet_team_active pt_act
				ON pt2.pgid = pt_act.pgid
		WHERE u2.id = ${id}
			AND pt2.pgid NOT IN (
			  SELECT pgid FROM pet_team_active pt_act
					WHERE pt_act.uid = u2.uid
			)
		ORDER BY pt_act.pgid DESC, pt2.pgid ASC
		LIMIT 1)`;
	} else if (pgid) {
		pgidQuery = pgid;
	}
	const sql = `SELECT pet_team.censor as ptcensor, streak, highest_streak, animal.offensive as acensor,
			pet_team.pgid, tname, pos, animal.name, animal.nickname, animal.pid, animal.xp, user_weapon.uwid,
			user_weapon.wid, user_weapon.stat, user_weapon.rrcount, user_weapon.rrattempt, user_weapon.wear,
			user_weapon_passive.pcount, user_weapon_passive.wpid, user_weapon_passive.stat as pstat,
			user_weapon_kills.uwid as tt, user_weapon_kills.kills
		FROM pet_team
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
			LEFT JOIN user_weapon_kills ON user_weapon.uwid = user_weapon_kills.uwid
		WHERE pet_team.pgid = ${pgidQuery}
		ORDER BY pos ASC;`;
	let result = await this.query(sql);

	if (!result[0]) {
		return null;
	}
	pgid = result[0].pgid;

	let team = parseTeam(result, result);
	team.forEach((animal) => animalUtil.stats(animal, level));
	return {
		pgid: pgid,
		name: result[0].tname,
		streak: result[0].streak,
		highestStreak: result[0].highest_streak,
		team: team,
	};
};

exports.getBattleAnimal = async function ({ uwid, pid }, id) {
	if (pid) {
		throw 'pid not implemented yet';
	}
	let sql = `SELECT a.name, a.nickname, a.offensive as acensor, a.pid, a.xp,
					uw.uwid, uw.wid, uw.stat, uw.rrcount, uw.rrattempt, uw.wear,
					uwp.pcount, uwp.wpid, uwp.stat as pstat
				FROM user_weapon uw
					LEFT JOIN user_weapon_passive uwp
						ON uw.uwid = uwp.uwid
					LEFT JOIN animal a ON uw.pid = a.pid
				WHERE uw.uwid = ${uwid}`;
	if (id) {
		const uid = await global.getUid(id);
		sql += ` AND uw.uid = ${uid}`;
	}
	const result = await mysql.query(sql);
	if (!result[0]?.pid) {
		return {
			error: {
				animal: result[0]?.pid,
				weapon: result[0]?.uwid,
			},
		};
	}
	let team = parseTeam(result, result);
	team.forEach((animal) => animalUtil.stats(animal));
	return team[0];
};

/* eslint-disable-next-line */
const createTeamEmbed = (exports.createTeamEmbed = function (p, team, other = {}) {
	/* Parse query */
	let digits = 1;
	for (let i in team) {
		animalUtil.stats(team[i]);
		let tempDigit = Math.log10(team[i].stats.hp[1] + team[i].stats.hp[3]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.wp[1] + team[i].stats.wp[3]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.att[0] + team[i].stats.att[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.mag[0] + team[i].stats.mag[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.pr[0] + team[i].stats.pr[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(team[i].stats.mr[0] + team[i].stats.mr[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
	}
	digits = Math.trunc(digits);
	let streak = other.streak || 0;
	let highestStreak = other.highest_streak || 0;

	/* Convert data to user readable strings */
	let fields = [];
	for (let i = 1; i <= 3; i++) {
		let title = `[${i}] `;
		let body = '';
		let animal;
		for (let j = 0; j < team.length; j++) if (team[j].pos == i) animal = team[j];
		if (!animal) {
			title += 'none';
			body = '*`owo team add {animal} ' + i + '`*';
		} else {
			let hp = ('' + Math.ceil(animal.stats.hp[1] + animal.stats.hp[3])).padStart(digits, '0');
			let wp = ('' + Math.ceil(animal.stats.wp[1] + animal.stats.wp[3])).padStart(digits, '0');
			let att = ('' + Math.ceil(animal.stats.att[0] + animal.stats.att[1])).padStart(digits, '0');
			let mag = ('' + Math.ceil(animal.stats.mag[0] + animal.stats.mag[1])).padStart(digits, '0');
			let pr = WeaponInterface.resToPrettyPercent(animal.stats.pr);
			let mr = WeaponInterface.resToPrettyPercent(animal.stats.mr);
			title += p.replaceMentions(
				`${animal.animal.uni ? animal.animal.uni : animal.animal.value} **${
					animal.nickname ? animal.nickname : animal.animal.name
				}** `
			);
			body = `Lvl ${animal.stats.lvl} \`[${p.global.toFancyNum(
				animal.stats.xp[0]
			)}/${p.global.toFancyNum(
				animal.stats.xp[1]
			)}]\`\n<:hp:531620120410456064> \`${hp}\` <:wp:531620120976687114> \`${wp}\`\n<:att:531616155450998794> \`${att}\` <:mag:531616156231139338> \`${mag}\`\n<:pr:531616156222488606> \`${pr}\` <:mr:531616156226945024> \`${mr}\`\n`;
			let weapon = animal.weapon;
			if (weapon) {
				body += `\`${weapon.uwid}\` ${weapon.rank.emoji} ${weapon.emoji} `;
				for (let j = 0; j < weapon.passives.length; j++) {
					body += `${weapon.passives[j].emoji} `;
				}
				body += `${weapon.avgQuality}%`;
			}
		}
		fields.push({ name: title, value: body, inline: true });
	}

	/* Construct msg */
	return {
		author: {
			name: p.getName() + "'s " + p.replaceMentions(other.tname),
			icon_url: p.msg.author.avatarURL,
		},
		description:
			'`owo team add {animal} {pos}` Add an animal to your team\n`owo team remove {pos}` Removes an animal from your team\n`owo team rename {name}` Renames your team\n`owo rename {animal} {name}` Rename an animal\n`owo setteam {teamNum}` to set multiple teams',
		color: p.config.embed_color,
		footer: {
			text: `Current Streak: ${streak} | Highest Streak: ${highestStreak}`,
		},
		fields,
	};
});

/* Parses animals and weapons into json */
exports.parseTeam = parseTeam;
function parseTeam(animals, weapons, censor = false) {
	let result = [];

	/* get basic animal info */
	let used = [];
	for (let i = 0; i < animals.length; i++) {
		let animal = animals[i];
		if (!used.includes(animal.pid)) {
			used.push(animal.pid);
			let animalObj = global.validAnimal(animal.name);
			let nickname = censor && animal.acensor == 1 ? 'Censored' : animal.nickname;
			if (!nickname) nickname = animalObj.name;
			result.push({
				pid: animal.pid,
				animal: animalObj,
				nickname,
				streak: animals.streak,
				highestStreak: animals.highest_streak,
				pos: animal.pos,
				xp: animal.xp,
				buffs: [],
				debuffs: [],
			});
		}
	}

	if (weapons) {
		/* get weapon info */
		let weps = weaponUtil.parseWeaponQuery(weapons);

		/* Combine the two json */
		for (let key in weps) {
			let pid = weps[key].pid;
			for (let i = 0; i < result.length; i++)
				if (result[i].pid == pid) result[i].weapon = weaponUtil.parseWeapon(weps[key]);
		}
	}

	return result;
}

/* Checks if the team is dead */
exports.isDead = function (team) {
	let totalhp = 0;
	for (let i in team) {
		let hp = team[i].stats.hp[0];
		totalhp += hp < 0 ? 0 : hp;
	}
	return totalhp <= 0;
};

exports.giveXPToUserTeams = async function (
	p,
	user,
	xp,
	{ xpOverrides, activePgid, activePids, secondaryPgid, ignoreSecondary } = {}
) {
	const pgid = activePgid || (await getPrimaryPgid(p, user));
	if (!pgid) {
		return;
	}

	if (!activePids) {
		activePids = await getPrimaryPids(p, pgid);
	}
	await giveXpToPgid(p, pgid, xp, xpOverrides, activePids);

	if (ignoreSecondary) {
		return;
	}

	const secondaryXpOverrides = {};
	for (let i in activePids) {
		secondaryXpOverrides[activePids[i]] = 0;
	}
	const pgid2 = secondaryPgid || (await getSecondaryPgid(p, user));
	const secondaryActivePids = await getPrimaryPids(p, pgid2);
	if (secondaryActivePids.length) {
		await giveXpToPgid(p, pgid2, xp / 2, secondaryXpOverrides, secondaryActivePids);
	}
};

exports.updateTeamStreak = async function (pgid, { addStreak, resetStreak }) {
	let sql;
	if (addStreak) {
		sql = `UPDATE pet_team SET highest_streak = IF(streak+1 > highest_streak, streak+1, highest_streak), streak = streak + 1 WHERE pgid = ${pgid};`;
	}
	if (resetStreak) {
		sql = `UPDATE pet_team SET streak = 0 WHERE pgid = ${pgid};`;
	}

	sql && (await mysql.query(sql));
};

async function getSecondaryPgid(p, user) {
	const uid = await p.global.getUid(user.id);
	const sql = `SELECT pt.pgid, pta.pgid AS active FROM pet_team pt
			LEFT JOIN pet_team_active pta ON pt.pgid = pta.pgid
		WHERE pt.disabled = 0
			AND pt.uid = ${uid}
		ORDER BY pt.pgid ASC`;
	const result = await p.query(sql);
	if (!result.length) {
		return null;
	}
	const activeLoc =
		result.findIndex((row) => {
			return !!row.active;
		}) || 0;
	let nextLoc = (activeLoc + 1) % result.length;
	return result[nextLoc]?.pgid;
}

async function getPrimaryPgid(p, user) {
	const uid = await p.global.getUid(user.id);
	const sql = `SELECT pt.pgid
		FROM pet_team pt
			LEFT JOIN pet_team_active pta ON pt.pgid = pta.pgid
		WHERE pt.uid = ${uid}
		ORDER BY pta.pgid DESC, pt.pgid ASC LIMIT 1`;
	const result = await p.query(sql);
	return result[0]?.pgid;
}

async function getPrimaryPids(p, pgid) {
	const sql = `SELECT pid FROM pet_team_animal WHERE pgid = ${pgid}`;
	const result = await p.query(sql);
	const pids = [];
	for (let i in result) {
		pids.push(result[i].pid);
	}
	return pids;
}

exports.getPidFromTeam = function (team) {
	const pids = [];
	for (let i in team.team) {
		pids.push(team.team[i].pid);
	}
	return pids;
};

async function giveXpToPgid(p, pgid, xp, xpOverrides, pids) {
	if (!pgid) {
		return;
	}
	let sql = '';
	let cases;
	xp = Math.ceil(xp);
	if (xpOverrides) {
		cases = '';
		for (let pid in xpOverrides) {
			cases += ` WHEN animal.pid = ${pid} THEN ${xpOverrides[pid]}`;
		}
	}
	if (cases) {
		sql = `UPDATE animal 
			SET xp = xp + (CASE ${cases} ELSE ${xp} END)
			WHERE pid IN (${pids.join(',')});`;
	} else {
		sql = `UPDATE animal
			SET xp = xp + ${xp}
			WHERE pid IN (${pids.join(',')});`;
	}
	await p.query(sql);
}

exports.setWeaponUtil = function (util) {
	weaponUtil = util;
};

exports.getMaxTeams = async function (user, patreonRank) {
	let maxTeams = defaultMaxTeams;
	let patreon = patreonRank || (await this.patreonUtil.getSupporterRank(this, user));
	if (patreon?.benefitRank >= 3) {
		maxTeams++;
	}
	return maxTeams;
};
