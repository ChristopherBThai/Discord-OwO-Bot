/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const global = require('../../../utils/global.js');
const dateUtil = require('../../../utils/dateUtil.js');
const gemUtil = require('./gemUtil.js');
const animalUtil = require('./animalUtil.js');
const alterHunt = require('./../patreon/alterHunt.js');
const lootboxChance = 0.05;

module.exports = new CommandInterface({
	alias: ['hunt', 'h', 'catch'],

	args: '',

	desc: 'Hunt for some animals for your zoo!\nHigher ranks are harder to find!',

	example: [],

	related: ['owo zoo', 'owo sell', 'owo lootbox'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 15000,
	half: 80,
	six: 500,
	bot: true,

	execute: async function (p) {
		let msg = p.msg;

		let sql = `SELECT
				money,
				IF(
					patreonAnimal = 1
					OR (TIMESTAMPDIFF(MONTH, patreonTimer, NOW()) < patreonMonths)
					OR (endDate > NOW()),
				1,0) as patreon
			FROM cowoncy
				LEFT JOIN user ON cowoncy.id = user.id
				LEFT JOIN patreons ON user.uid = patreons.uid
				LEFT JOIN patreon_wh ON user.uid = patreon_wh.uid
			WHERE cowoncy.id = ${msg.author.id};`;
		sql += `SELECT name,nickname,animal.pid,MAX(tmp.pgid) AS active
			FROM user u
				INNER JOIN pet_team ON u.uid = pet_team.uid
				INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
				INNER JOIN animal ON pet_team_animal.pid = animal.pid
				LEFT JOIN (SELECT pt2.pgid FROM user u2
						INNER JOIN pet_team pt2 ON pt2.uid = u2.uid
						LEFT JOIN pet_team_active pt_act ON pt2.pgid = pt_act.pgid
					WHERE u2.id = ${p.msg.author.id}
					ORDER BY pt_act.pgid DESC, pt2.pgid ASC LIMIT 1) tmp
					ON tmp.pgid = pet_team.pgid
				WHERE u.id = ${p.msg.author.id}
				GROUP BY animal.pid
				ORDER BY pet_team_animal.pos ASC;`;
		sql +=
			'SELECT *,TIMESTAMPDIFF(HOUR,claim,NOW()) as time FROM lootbox WHERE id = ' +
			msg.author.id +
			';';
		sql +=
			'SELECT uid,activecount,gname,type FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = ' +
			msg.author.id +
			' AND activecount > 0;';
		let result = await p.query(sql);
		if (result[0][0] == undefined || result[0][0].money < this.animals.rollprice) {
			p.errorMsg(", You don't have enough cowoncy!", 3000);
		} else {
			//Sort gem benefits
			let gems = {};
			let uid = undefined;
			for (let i = 0; i < result[3].length; i++) {
				let tempGem = gemUtil.getGem(result[3][i].gname);
				tempGem.uid = result[3][i].uid;
				tempGem.activecount = result[3][i].activecount;
				tempGem.gname = result[3][i].gname;
				gems[tempGem.type] = tempGem;
				uid = result[3][i].uid;
			}

			//Get animal
			let animal = getAnimals(p, result, gems, uid);
			let sql = animal.sql;
			let text = animal.text;

			//Get Xp
			let petText, animalXp;
			if (result[1][0]) {
				text += `\n${p.config.emoji.blank} **|** `;
				petText = '';
				for (let i in result[1]) {
					sql += `UPDATE animal SET xp = xp + ${
						result[1][i].active ? animal.xp : Math.round(animal.xp / 2)
					} WHERE pid = ${result[1][i].pid};`;
					if (result[1][i].active) {
						let pet = p.global.validAnimal(result[1][i].name);
						petText += (pet.uni ? pet.uni : pet.value) + ' ';
					}
				}
				animalXp = animal.xp;
				text += `${petText}gained **${animalXp}xp**!`;
			}

			//Get Lootbox
			let lbReset = dateUtil.afterMidnight(result[2][0] ? result[2][0].claim : undefined);
			let lootbox;
			if (!result[2][0] || result[2][0].claimcount < 3 || lbReset.after) {
				lootbox = getLootbox(p, result[2][0], lbReset);
				sql += lootbox.sql;
				text += lootbox.text;
			}

			//Alter text for legendary tier patreons
			text = await alterHunt.alter(p, p.msg.author.id, text, {
				author: p.msg.author,
				lootboxText: lootbox ? lootbox.text : '',
				petText,
				animalXp,
				gemText: animal.gemText,
				animalText: animal.text,
				animalEmojis: animal.animalText,
				animal: animal.animal,
			});
			//text += "\n⚠ **|** `battle` and `hunt` cooldowns have increased to prevent rateLimits issues.\n<:blank:427371936482328596> **|** They will revert back to `15s` in the future.";

			await p.query(sql);
			p.logger.decr('cowoncy', -5, { type: 'hunt' }, p.msg);
			for (let i in animal.animal) {
				let tempAnimal = p.global.validAnimal(animal.animal[i][1]);
				p.logger.incr('animal', 1, { rank: tempAnimal.rank, name: tempAnimal.name }, p.msg);
				p.logger.incr('zoo', tempAnimal.points, {}, p.msg);
			}
			p.quest('hunt');
			p.quest('find', 1, animal.typeCount);
			p.quest('xp', animal.xp);
			await p.send(text);
			p.event.getEventItem.bind(this)();
		}
	},
});

function getAnimals(p, result, gems, uid) {
	/* Parse if user is a patreon */
	let patreon = result[0][0].patreon == 1;
	let patreonGem = gems['Patreon'] ? true : false;

	/* If no gems */
	let gemLength = Object.keys(gems).length;
	let animal;
	if (gemLength == 0) {
		animal = [animalUtil.randAnimal({ patreon: patreon, manual: true })];

		/* If gems... */
	} else {
		/* Calculate how many animals we need */
		let count = 1;
		if (gems['Hunting']) count += gems['Hunting'].amount;
		if (gems['Empowering']) count *= 2;

		/* Grabs 1-2 animal to check for patreongem */
		animal = [
			animalUtil.randAnimal({
				patreon: patreon || patreonGem,
				gem: true,
				lucky: gems['Lucky'],
				manual: true,
			}),
		];
		if (gems['Patreon'])
			animal.push(
				animalUtil.randAnimal({
					patreon: true,
					gem: true,
					lucky: gems['Lucky'],
					manual: true,
				})
			);

		/* Get the rest of the animals */
		for (let i = 1; i < count; i++) {
			animal.push(
				animalUtil.randAnimal({
					patreon: patreon,
					gem: true,
					lucky: gems['Lucky'],
					manual: true,
				})
			);
		}
	}

	/* Construct sql statement for animal insertion */
	let sql = '';
	let xp = 0;
	let insertAnimal = 'INSERT INTO animal (count,totalcount,id,name) VALUES ';
	let typeCount = {};
	for (let i = 0; i < animal.length; i++) {
		let type = animal[i][2];
		xp += animal[i][3];
		insertAnimal += '(1,1,' + p.msg.author.id + ",'" + animal[i][1] + "'),";
		if (!typeCount[type]) typeCount[type] = 0;
		typeCount[type] += 1;
	}
	sql +=
		insertAnimal.slice(0, -1) +
		' ON DUPLICATE KEY UPDATE count = count +1,totalcount = totalcount+1;';
	let insertCount = '';
	for (let key in typeCount) {
		insertCount +=
			'INSERT INTO animal_count (id,' +
			key +
			') VALUES (' +
			p.msg.author.id +
			',' +
			typeCount[key] +
			') ON DUPLICATE KEY UPDATE ' +
			key +
			' = ' +
			key +
			'+' +
			typeCount[key] +
			';';
	}
	sql += insertCount + 'UPDATE cowoncy SET money = money - 5 WHERE id = ' + p.msg.author.id + ';';

	/* Construct sql statements for gem usage */
	let huntingActive = false;
	let empoweringActive = false;
	if (gems['Patreon'])
		sql +=
			'UPDATE user_gem SET activecount = GREATEST(activecount - 1, 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Patreon'].gname +
			"';";
	if (gems['Hunting']) {
		huntingActive = true;
		sql +=
			'UPDATE user_gem SET activecount = GREATEST(activecount - 1, 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Hunting'].gname +
			"';";
	}
	if (gems['Empowering']) {
		empoweringActive = true;
		sql +=
			'UPDATE user_gem SET activecount = GREATEST(activecount - ' +
			Math.trunc(animal.length / 2) +
			', 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Empowering'].gname +
			"';";
	}
	if (gems['Lucky']) {
		// make lucky gems last twice as long if you're running all 3 gems
		let luckySubtract =
			huntingActive && empoweringActive ? Math.trunc(animal.length / 2) : animal.length;

		sql +=
			'UPDATE user_gem SET activecount = GREATEST(activecount - ' +
			luckySubtract +
			', 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Lucky'].gname +
			"';";
	}

	/* Construct output message for user */
	let animalText = global.unicodeAnimal(animal[0][1]);
	let text =
		'**🌱 | ' +
		p.msg.author.username +
		'** spent 5 <:cowoncy:416043450337853441> and caught a ' +
		animal[0][0] +
		' ' +
		global.unicodeAnimal(animal[0][1]) +
		'!';
	let gemText;
	if (animal[0][0].charAt(2) == 'u' || animal[0][0].charAt(2) == 'e')
		text = text.replace(' a ', ' an ');
	if (gemLength > 0) {
		text = '**🌱 | ' + p.msg.author.username + '**, hunt is empowered by ';
		gemText = '';
		for (let i in gems) {
			let remaining =
				gems[i].activecount -
				(gems[i].type == 'Patreon' || gems[i].type == 'Hunting'
					? 1
					: gems[i].type == 'Empowering' ||
					  (gems[i].type == 'Lucky' && huntingActive && empoweringActive)
					? Math.trunc(animal.length / 2)
					: animal.length);
			if (remaining < 0) remaining = 0;
			gemText += gems[i].emoji + '`[' + remaining + '/' + gems[i].length + ']` ';
		}
		text += gemText + ' !\n**<:blank:427371936482328596> |** You found: ';
		for (let i = 1; i < animal.length; i++) animalText += ' ' + global.unicodeAnimal(animal[i][1]);
		text += animalText;
	}

	return {
		sql: sql,
		xp: xp,
		animal: animal,
		text: text,
		typeCount: typeCount,
		gemText,
		animalText,
	};
}

function getLootbox(p, query, lbReset) {
	let rand = Math.random();
	let sql =
		'INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES (' +
		p.msg.author.id +
		',1,1,' +
		lbReset.sql +
		') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1, claimcount = 1, claim = ' +
		lbReset.sql +
		';';
	let count = 1;
	if (!query || lbReset.after) rand = 0;
	else {
		sql =
			'UPDATE IGNORE lootbox SET boxcount = boxcount + 1, claimcount = claimcount + 1 WHERE id = ' +
			p.msg.author.id +
			';';
		count = query.claimcount + 1;
	}
	if (rand <= lootboxChance) {
		return {
			sql: sql,
			text:
				'\n**<:box:427352600476647425> |** You found a **lootbox**! `[' +
				count +
				'/3] RESETS IN: ' +
				lbReset.hours +
				'H ' +
				lbReset.minutes +
				'M ' +
				lbReset.seconds +
				'S`',
		};
	} else return { sql: '', text: '' };
}
