/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const zooAnimalUtil = require('../../zoo/animalUtil.js');
const battleAnimalUtil = require('./animalUtil.js');
const weaponUtil = require('./weaponUtil.js');
const teamUtil = require('./teamUtil.js');
const WeaponInterface = require('../WeaponInterface.js');
const global = require('../../../../utils/global.js');

// TODO change rate
const appearRate = 1;
const bossLength = 1 * 60 * 60 * 1000;
const guildSizes = [5, 25, 100, 500, 1000];
const rates = [
	{ c:0.6,  u:0.3,  r:0.1,  e:0,    m:0,    l:0,    f:0 },
	{ c:0.2,  u:0.5,  r:0.2,  e:0.1,  m:0,    l:0,    f:0 },
	{ c:0.1,  u:0.2,  r:0.4,  e:0.2,  m:0.1,  l:0,    f:0 },
	{ c:0.04, u:0.1,  r:0.25, e:0.35, m:0.25, l:0.01, f:0 },
	{ c:0,    u:0.04, r:0.11, e:0.4,  m:0.4,  l:0.03, f:0.02 },
	{ c:0,    u:0,  r:0.1,  e:0.35, m:0.47, l:0.05, f:0.03 }
]
const lvls = { c:[30,39], u:[40,49], r:[50,59], e:[60,69], m:[70,79], l:[80,89], f:[90,100]}

const animalRankPoints = parseRankPoints();
const weaponRankPoints = parseWeaponPoints();

exports.shouldCreateBoss = async function (p) {
	if (Math.random() > appearRate) return false;
	const guildId = p.msg.channel.guild.id;

	// check if boss is already present
	let sql = `SELECT guild.id, guild_boss.active, guild_boss.created, guild_boss.boss_hp FROM guild LEFT JOIN guild_boss ON guild.id = guild_boss.gid WHERE guild.id = ${guildId};`
	let result = await p.query(sql);

	if (!result || !result[0]) {
		sql = `INSERT IGNORE INTO guild (id, count) VALUES (${guildId}, 0);`;
		await p.query(sql);
	} else if (!bossExpired(result[0])) {
		return false;
	}

	return true
}
	
exports.createBoss = async function (p) {
	const bossInfo = await generateBoss(p.msg.channel.guild.memberCount);
	const guildId = p.msg.channel.guild.id;
	
	// save to db
	sql = `INSERT INTO guild_boss (gid, active, created, boss_animal, boss_lvl, boss_hp, boss_wp) VALUES
  				(${guildId}, 1, ${p.global.toMySqlDate(bossInfo.time)}, '${bossInfo.animal.value}', ${bossInfo.lvl}, ${bossInfo.stats.hp[0]}, ${bossInfo.stats.wp[0]})
				ON DUPLICATE KEY UPDATE
					active = 1, created = NOW(), boss_animal = VALUES(boss_animal), boss_lvl = VALUES(boss_lvl), boss_hp = VALUES(boss_hp), boss_wp = VALUES(boss_wp);`;
	// delete existing data
	sql += `DELETE FROM boss_weapon_passive WHERE gid = ${guildId}; DELETE FROM boss_weapon WHERE gid = ${guildId}; DELETE FROM user_boss WHERE gid = ${guildId};`;
	// insert weapon and passives
	sql += `INSERT INTO boss_weapon (gid, wid, stat, avg) VALUES (${guildId}, ${bossInfo.weapon.id}, '${bossInfo.weapon.sqlStat}', ${bossInfo.weapon.avgQuality});`;
	const passiveSql = [];
	for (let i in bossInfo.weapon.passives) {
		const passive = bossInfo.weapon.passives[i];
		passiveSql.push(`(${guildId}, ${passive.id}, ${i}, '${passive.sqlStat}')`);
	}
	if (passiveSql.length) {
		sql += `INSERT INTO boss_weapon_passive (gid, wpid, pcount, stat) VALUES ${passiveSql.join(", ")};`;
	}

	const con = await p.startTransaction();
	try {
		result = await con.query(sql);
		con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		return;
	}
	
	return bossInfo;
}

exports.fetchBoss = async function (p) {
	let sql = `SELECT
			gb.active, gb.created, gb.boss_animal, gb.boss_lvl, gb.boss_hp, gb.boss_wp,
			bw.wid, bw.stat, bw.avg,
			bwp.pcount, bwp.wpid, bwp.stat as pstat
		FROM guild_boss gb
			INNER JOIN boss_weapon bw ON gb.gid = bw.gid
			INNER JOIN boss_weapon_passive bwp ON bw.gid = bwp.gid
		WHERE gb.gid = ${p.msg.channel.guild.id};`;
	let result = await p.query(sql);
	if (bossExpired(result[0])) return null;

	result[0].name = result[0].boss_animal;
	for (let i in result) {
		result[i].pid = 1;
		result[i].uwid = 1;
	}

	let team = teamUtil.parseTeam(p,result,result);

	const bossAnimal = team[0];
	bossAnimal.stats = parseStats(bossAnimal.animal, result[0].boss_lvl);
	bossAnimal.stats.hp[0] = result[0].boss_hp;
	bossAnimal.stats.wp[0] = result[0].boss_wp;
	bossAnimal.lvl = result[0].boss_lvl;
	bossAnimal.time = new Date(result[0].created);
	bossAnimal.rank = calculateRank(bossAnimal);
	bossAnimal.rewards = getRewards(bossAnimal.rank, bossAnimal.lvl);


	return bossAnimal;
}

async function generateBoss(memberCount) {
	// pick boss rank
	let guildSize = guildSizes.length;
	for (let i in guildSizes) {
		if (memberCount < guildSizes[i]) {
			guildSize = i;
			break;
		}
	}
	const rate = rates[guildSize];
	const rand = Math.random();
	let rank;
	let tempTotal = 0;
	for (let i in rate) {
		tempTotal += rate[i];
		if (rand <= tempTotal.toPrecision(12)) {
			rank = i;
			break;
		}
	}

	// pick animal
	const lvl = getLvl(rank);
	const animal = global.validAnimal(zooAnimalUtil.randAnimal()[1]);
	const stats = parseStats(animal, lvl);
	
	// generate weapon
	const weapon = weaponUtil.getRandomWeapon({extraPassive: 1});

	// Remove milliseconds because sql doesn't store milliseconds
	const currentTime = new Date(Math.floor(new Date().getTime() / 1000) * 1000);
	
	const bossInfo = { lvl, animal, weapon, stats, time: currentTime }
	bossInfo.rank = calculateRank(bossInfo);
	bossInfo.rewards = getRewards(bossInfo.rank, bossInfo.lvl);

	return bossInfo;
}


// TODO balance boss stats
function parseStats (animal, lvl) {
	const stats = battleAnimalUtil.parseStats(animal, lvl);
	stats.hp[0] = Math.round(stats.hp[0] * lvl * .8);
	stats.hp[1] = Math.round(stats.hp[1] * lvl * .8);
	stats.hp[2] = Math.round(stats.hp[2] * lvl * .8);
	return stats;
}

function getLvl (rank) {
	const lvlRange = lvls[rank];
	return Math.floor(lvlRange[0] + ((lvlRange[1] - lvlRange[0] + 1) * Math.random()))
}

// Calcualte overall rank from animal rarity, weapon rarity, and level
function calculateRank (bossInfo) {
	totalPoints = 0;
	totalPoints += animalRankPoints[bossInfo.animal.rank];
	totalPoints += weaponRankPoints[bossInfo.weapon.rank.name];
	totalPoints += bossInfo.lvl * 3;
	totalPoints /= 5;
	if (totalPoints < 30)
		return 'common';
	else if (totalPoints < 35)
		return 'uncommon'
	else if (totalPoints < 45)
		return 'rare'
	else if (totalPoints < 55)
		return 'epic'
	else if (totalPoints < 65)
		return 'mythical'
	else if (totalPoints < 75)
		return 'legendary'
	else 
		return 'fabled'
}

function getRewards (rank, lvl) {
	let lvlPercent;
	for (let i in lvls) {
		if (lvls[i][0] <= lvl && lvl <= lvls[i][1]) {
			lvlPercent = (lvl - lvls[i][0]) / (lvls[i][1] - lvls[i][0]);
		}
	}
	switch (rank) {
		case 'common':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
			]
		case 'uncommon':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
			]
		case 'rare':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(100000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(100000 + Math.round(500 * lvlPercent)) },
			]
		case 'epic':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
			]
		case 'mythical':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
			]
		case 'legendary':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
			]
		case 'fabled':
			return [
				{ img: 'fcrate',   text: global.toFancyNum(1 + Math.round(1 * lvlPercent)) },
				{ img: 'shards',   text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'cowoncy',  text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
				{ img: 'xp',       text: global.toFancyNum(1000 + Math.round(500 * lvlPercent)) },
			]
		default:
			throw "No rank for: " + rank;
	}
}

function parseRankPoints () {
	const points = JSON.parse(JSON.stringify(require('../../../../../../tokens/owo-animals.json').points));
	const order = [];
	for (let rank in points) {
		order.push(rank);
	}
	order.sort((a, b) => points[a] - points[b]);
	const fabledPosition = order.findIndex(rank => rank === 'fabled');
	for (let i in order) {
		points[order[i]] = Math.min(100, i * (100 / fabledPosition));
	}
	return points;
}

function parseWeaponPoints () {
	const points = {};
	for (let i in WeaponInterface.ranks) {
		points[WeaponInterface.ranks[i][1]] = i * (100 / (WeaponInterface.ranks.length - 1))
	}
	return points;
}

function bossExpired(row) {
	return !(row && row.boss_hp > 0 && row.active && (new Date() - new Date(row.created) < bossLength))
}

/*
setTimeout(async () => {
	let memberCounts = [1, 24, 99, 499, 999, 1001];
	for (let i in memberCounts) {
		let memberCount = memberCounts[i];
		console.log(`\nmember count: ${memberCount}`);
		let total = {'common':0, 'uncommon':0, 'rare':0, 'epic':0, 'mythical':0, 'legendary':0, 'fabled':0};
		let count = 100000;
		for (let i = 0; i < count; i++) {
			const rank = (await generateBoss(memberCount)).rank;
			total[rank]++;
		}
		for (let rank in total) {
			console.log(`${rank}: ${100 * (total[rank]/count)}`);
		}
	}
},100)
*/
