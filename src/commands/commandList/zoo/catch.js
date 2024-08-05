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
const patreonUtil = require('./../patreon/utils/patreonUtil.js');
const teamUtil = require('../battle/util/teamUtil.js');
const lootboxChance = 0.05;
const rollPrice = 5;

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

		let sql = `SELECT money
			FROM cowoncy
			WHERE cowoncy.id = ${msg.author.id};`;
		sql += `SELECT name,nickname,animal.pid,pet_team.pgid,MAX(tmp.pgid) AS active
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
		if (result[0][0] == undefined || result[0][0].money < rollPrice) {
			p.errorMsg(", You don't have enough cowoncy!", 3000);
		} else {
			//Sort gem benefits
			let gems = {};
			let uid = undefined;
			for (let i = 0; i < result[3].length; i++) {
				let tempGem = gemUtil.getGem(result[3][i].gname);
				if (!(tempGem.type === 'Special' && !animalUtil.hasSpecials())) {
					tempGem.uid = result[3][i].uid;
					tempGem.activecount = result[3][i].activecount;
					tempGem.gname = result[3][i].gname;
					gems[tempGem.type] = tempGem;
					uid = result[3][i].uid;
				}
			}

			//Get animal
			let animal = await getAnimals(p, result, gems, uid);
			let sql = animal.sql;
			let text = animal.text;

			//Get Xp
			let petText, animalXp, pgid;
			const activePids = [];
			if (result[1][0]) {
				text += `\n${p.config.emoji.blank} **|** `;
				petText = '';
				for (let i in result[1]) {
					if (result[1][i].active) {
						let pet = p.global.validAnimal(result[1][i].name);
						petText += (pet.uni ? pet.uni : pet.value) + ' ';
						pgid = result[1][i].pgid;
						activePids.push(result[1][i].pid);
					}
				}
				animalXp = animal.xp;
				text += `${petText}gained **${animalXp}xp**!`;
			}
			await teamUtil.giveXPToUserTeams(p, p.msg.author, animalXp, {
				activePgid: pgid,
				activePids,
			});

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
				author: p.msg.member || p.msg.author,
				name: p.getName(),
				lootboxText: lootbox ? lootbox.text : '',
				petText,
				animalXp,
				gemText: animal.gemText,
				animalText: animal.text,
				animalEmojis: animal.animalText,
				animals: animal.animals,
			});
			//text += "\n⚠ **|** `battle` and `hunt` cooldowns have increased to prevent rateLimits issues.\n<:blank:427371936482328596> **|** They will revert back to `15s` in the future.";

			await p.query(sql);
			p.logger.decr('cowoncy', -5, { type: 'hunt' }, p.msg);
			for (let i in animal.animals) {
				let tempAnimal = p.global.validAnimal(animal.animals[i].value);
				p.logger.incr(
					'animal',
					tempAnimal.count,
					{ rank: tempAnimal.rank, name: tempAnimal.name },
					p.msg
				);
				p.logger.incr('zoo', tempAnimal.points * tempAnimal.count, {}, p.msg);
			}
			p.quest('hunt');
			p.quest('find', 1, animal.typeCount);
			p.quest('xp', animal.xp);
			await p.send(text);
			p.event.getEventItem.bind(this)();
		}
	},
});

async function getAnimals(p, result, gems, uid) {
	/* Parse if user is a patreon */
	const supporter = await patreonUtil.getSupporterRank(p, p.msg.author);
	let patreon = supporter.benefitRank > 0;

	let count = 1;
	const opt = {
		patreon: patreon || !!gems['Patreon'],
		manual: true,
	};
	if (Object.keys(gems).length != 0) {
		opt.gem = true;
		opt.lucky = gems['Lucky'];
		opt.special = gems['Special'];
		if (gems['Hunting']) count += gems['Hunting'].amount;
		if (gems['Empowering']) count *= 2;
		if (gems['Patreon']) count += 1;
	}

	let { ordered, animalSql, typeCount, xp } = await animalUtil.getMultipleAnimals(
		count,
		p.msg.author,
		opt
	);

	let sql = animalSql + ' UPDATE cowoncy SET money = money - 5 WHERE id = ' + p.msg.author.id + ';';
	sql += getGemSql(uid, gems, count);

	let { animalText, text, gemText } = getText(p, ordered, gems, count);

	return {
		sql: sql,
		xp: xp,
		animals: ordered,
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

function getGemSql(uid, gems, animalCount) {
	/* Construct sql statements for gem usage */
	let sql = '';
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
			Math.trunc(animalCount / 2) +
			', 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Empowering'].gname +
			"';";
	}
	if (gems['Lucky']) {
		// make lucky gems last twice as long if you're running all 3 gems
		let luckySubtract =
			huntingActive && empoweringActive ? Math.trunc(animalCount / 2) : animalCount;

		sql +=
			'UPDATE user_gem SET activecount = GREATEST(activecount - ' +
			luckySubtract +
			', 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Lucky'].gname +
			"';";
	}
	if (gems['Special']) {
		// make special gems last twice as long if you're running all 3 gems
		let specialSubtract =
			huntingActive && empoweringActive ? Math.trunc(animalCount / 2) : animalCount;

		sql +=
			'UPDATE user_gem SET activecount = GREATEST(activecount - ' +
			specialSubtract +
			', 0) WHERE uid = ' +
			uid +
			" AND gname = '" +
			gems['Special'].gname +
			"';";
	}
	return sql;
}

function getText(p, animals, gems, animalCount) {
	/* Construct output message for user */
	let animalText = global.unicodeAnimal(animals[0].value);
	let text =
		'**🌱 | ' +
		p.getName() +
		'** spent 5 <:cowoncy:416043450337853441> and caught a ' +
		animals[0].text +
		' ' +
		global.unicodeAnimal(animals[0].value) +
		'!';
	let gemText;
	if (animals[0].text.charAt(2) == 'u' || animals[0].text.charAt(2) == 'e')
		text = text.replace(' a ', ' an ');

	if (Object.keys(gems).length > 0) {
		text = '**🌱 | ' + p.getName() + '**, hunt is empowered by ';
		gemText = '';
		for (let i in gems) {
			let remaining = gems[i].activecount;
			let subtract = 1;
			if (gems[i].type == 'Patreon' || gems[i].type == 'Hunting') {
				subtract = 1;
			} else if (gems[i].type == 'Empowering') {
				subtract = Math.trunc(animalCount / 2);
			} else if (
				['Lucky', 'Special'].includes(gems[i].type) &&
				gems['Hunting'] &&
				gems['Empowering']
			) {
				subtract = Math.trunc(animalCount / 2);
			} else {
				subtract = animalCount;
			}
			remaining -= subtract;
			if (remaining < 0) remaining = 0;
			gemText += gems[i].emoji + '`[' + remaining + '/' + gems[i].length + ']` ';
		}
		text += gemText + ' !\n**<:blank:427371936482328596> |** You found: ';
		animalText = '';
		for (let i = 0; i < animals.length; i++) {
			for (let j = 0; j < animals[i].count; j++) {
				animalText += ' ' + global.unicodeAnimal(animals[i].value);
			}
		}
		text += animalText;
	}

	return {
		animalText,
		text,
		gemText,
	};
}
