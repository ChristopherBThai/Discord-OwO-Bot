/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const mysql = require('../../../botHandlers/mysqlHandler.js');
const global = require('../../../utils/global.js');
const animals = require('../../../utils/animalInfoUtil.js');
const eventUtil = require('../../../utils/eventUtil.js');
const cacheUtil = require('../../../utils/cacheUtil.js');

let enableDistortedTier = true;
setTimeout(() => {
	// Disable distorted after 6 hours;
	enableDistortedTier = false;
}, 21600000);

function randAnimal(opts = {}) {
	const event = getEventAnimals();
	opts.event = event;
	const rarities = getRarities(opts);

	const rankName = getRandomRank(rarities);
	const rank = animals.getRank(rankName);
	let animalName;
	if (rankName !== 'special') {
		animalName = rank.animals[Math.floor(Math.random() * rank.animals.length)];
	} else {
		animalName = getRandomEventAnimal(event);
	}

	return animals.getAnimal(animalName);
}

function getRandomEventAnimal(event) {
	const totalRarity = event.reduce((sum, val) => sum + val.rarity, 0);
	const rand = Math.random() * totalRarity;

	let total = 0;
	for (let i in event) {
		total += event[i].rarity;
		if (rand < total) {
			return event[i].animal;
		}
	}
}

function getRandomRank(rarities) {
	const totalRarity = Object.values(rarities).reduce((sum, val) => sum + val, 0);
	const rand = Math.random() * totalRarity;

	let total = 0;
	for (let rank in rarities) {
		total += rarities[rank];
		if (rand < total) {
			return rank;
		}
	}
}

function getRarities(opts) {
	const rarity = {};
	const ranks = animals.getRanks();
	for (let key in ranks) {
		const rank = ranks[key];
		if (!rank.conditional) {
			rarity[key] = rank.rarity;
		} else {
			rarity[key] = 0;
		}
	}

	if (opts.patreon) {
		const patreon = animals.getRank('patreon');
		rarity[patreon.id] = patreon.rarity;
		rarity['common'] -= patreon.rarity;
		const cpatreon = animals.getRank('cpatreon');
		rarity[cpatreon.id] = cpatreon.rarity;
		rarity['common'] -= cpatreon.rarity;
	}

	if (opts.gem) {
		const gem = animals.getRank('gem');
		let gemRarity = gem.rarity;
		if (opts.lucky) {
			gemRarity *= opts.lucky.amount;
		}
		rarity[gem.id] = gemRarity;
		rarity['common'] -= gemRarity;
	}

	if (enableDistortedTier && opts.manual) {
		const distorted = animals.getRank('distorted');
		rarity[distorted.id] = distorted.rarity;
		rarity['common'] -= distorted.rarity;
	}

	if (opts.huntbot) {
		const bot = animals.getRank('bot');
		rarity[bot.id] = opts.huntbot;
		rarity['common'] -= opts.huntbot;
	}

	if (opts.event) {
		let specialRarity = opts.event.reduce((sum, val) => sum + val.rarity, 0);
		if (opts.special) {
			specialRarity *= 2;
		}
		if (opts.huntbot) {
			specialRarity /= 4;
		}
		const special = animals.getRank('special');
		rarity[special.id] = specialRarity;
		rarity['common'] -= specialRarity;
	}

	return rarity;
}

function getEventAnimals() {
	const event = eventUtil.getCurrentActive();
	if (!event || !event.animals) {
		return [];
	}

	const eventAnimals = [];
	event.animals.forEach((animal) => {
		eventAnimals.push({
			animal: animal.animal,
			rarity: getEventRarity(animal, event),
		});
	});

	return eventAnimals;
}

function getEventRarity(animal, event) {
	const start = new Date(event.start).getTime();
	const end = new Date(event.end).getTime();
	const diff = end - start;
	let rate = animal.minRate;
	const now = Date.now();

	if (end < now || now < start) {
		return 0;
	}

	const percentDiff = (now - start) / diff;
	rate += (animal.maxRate - animal.minRate) * percentDiff;
	return rate;
}

exports.getMultipleAnimals = async function (count, user, opt) {
	const total = {};
	let xp = 0;
	for (let i = 0; i < count; i++) {
		let animal = randAnimal(opt);
		let rank = animals.getRank(animal.rank);
		xp += rank.xp;
		if (total[animal.value]) {
			total[animal.value].count++;
			total[animal.value].totalXp += rank.xp;
		} else {
			total[animal.value] = {
				count: 1,
				rank: rank.id,
				value: animal.value,
				text: `**${rank.id}** ${rank.emoji}`,
				totalXp: rank.xp,
				singleXp: rank.xp,
				rankSort: rank.order,
			};
		}
	}

	const ordered = sortAnimals(total);
	const { sql, typeCount } = await createSql(ordered, user);

	return {
		animals: total,
		ordered: ordered,
		animalSql: sql,
		xp: xp,
		typeCount,
	};
};

exports.zooScore = function (zoo) {
	let text = '';
	if (zoo.hidden > 0) text += 'H-' + zoo.hidden + ', ';
	if (zoo.fabled > 0) text += 'F-' + zoo.fabled + ', ';
	if (zoo.cpatreon > 0) text += 'CP-' + zoo.cpatreon + ', ';
	if (zoo.distorted > 0) text += 'D-' + zoo.distorted + ', ';
	if (zoo.bot > 0) text += 'B-' + zoo.bot + ', ';
	if (zoo.gem > 0) text += 'G-' + zoo.gem + ', ';
	if (zoo.legendary > 0) text += 'L-' + zoo.legendary + ', ';
	if (zoo.patreon > 0 || zoo.cpatreon > 0) text += 'P-' + zoo.patreon + ', ';
	text += 'M-' + zoo.mythical + ', ';
	if (zoo.special > 0) text += 'S-' + zoo.special + ', ';
	text += 'E-' + zoo.epic + ', ';
	text += 'R-' + zoo.rare + ', ';
	text += 'U-' + zoo.uncommon + ', ';
	text += 'C-' + zoo.common;
	return text;
};

exports.hasSpecials = function () {
	const event = eventUtil.getCurrentActive();
	return !!event?.animals;
};

exports.getPid = async function (id, pet) {
	const uid = await global.getUid(id);
	let sql;
	if (global.isInt(pet) && parseInt(pet) < 10) {
		sql = `SELECT pt_ani.pid FROM pet_team pt
					LEFT JOIN pet_team_animal pt_ani
						ON pt.pgid = pt_ani.pgid
					LEFT JOIN pet_team_active pt_act
						ON pt.pgid = pt_act.pgid
				WHERE pt.uid = ${uid} AND pos = ${pet}
				ORDER BY pt_act.pgid DESC, pt.pgid ASC LIMIT 1;`;
	} else {
		sql = `SELECT pid FROM animal WHERE name = '${pet.value}' AND id = ${id}`;
	}
	const result = await mysql.query(sql);
	return result[0]?.pid;
};

/**
 * Sorts an array of animals by rank then alphabetical order
 */
function sortAnimals(animals) {
	const animalList = [];
	for (let value in animals) {
		animalList.push(animals[value]);
	}
	animalList.sort((a, b) => {
		if (a.rankSort < b.rankSort) {
			return -1;
		} else if (a.rankSort > b.rankSort) {
			return 1;
		} else if (a.value < b.value) {
			return -1;
		} else if (a.value > b.value) {
			return 1;
		} else {
			return 0;
		}
	});
	return animalList;
}

async function createSql(orderedAnimal, user) {
	let animalSql = [];
	let animalCountSql = {};

	let animalCase = '( CASE\n';
	let animals = [];
	orderedAnimal.forEach((animal) => {
		animalSql.push(`(${user.id}, '${animal.value}', ${animal.count}, ${animal.count})`);
		animals.push(`'${animal.value}'`);
		animalCase += `WHEN name = '${animal.value}' THEN ${animal.count}\n`;
		if (!animalCountSql[animal.rank])
			animalCountSql[animal.rank] = {
				rank: animal.rank,
				count: 0,
			};
		animalCountSql[animal.rank].count += animal.count;
	});
	animalCountSql = Object.values(animalCountSql);
	animalCase += 'ELSE 0 END)';

	let sql = `UPDATE animal SET 
			count = count + ${animalCase}, totalcount = totalcount + ${animalCase}
			WHERE id = ${user.id} AND name in (${animals.join(',')});`;
	sql += `INSERT INTO animal_count (id, ${animalCountSql
		.map((animalCount) => animalCount.rank)
		.join(',')})
			VALUES (${user.id}, ${animalCountSql.map((animalCount) => animalCount.count).join(',')})
			ON DUPLICATE KEY UPDATE
				${animalCountSql
					.map((animalCount) => {
						return `${animalCount.rank} = ${animalCount.rank} + ${animalCount.count}`;
					})
					.join(',')};
			`;
	await checkDbInsert(user.id, orderedAnimal);
	return {
		sql,
		typeCount: animalCountSql,
	};
}

async function checkDbInsert(id, animals) {
	for (let i in animals) {
		await cacheUtil.insertAnimal(id, animals[i].value);
	}
}
