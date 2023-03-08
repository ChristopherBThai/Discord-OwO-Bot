/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const gems = require('../../../data/gems.json');
for (let gem in gems.gems) gems.gems[gem].key = gem;
const ranks = {
	c: 'Common',
	u: 'Uncommon',
	r: 'Rare',
	e: 'Epic',
	m: 'Mythical',
	l: 'Legendary',
	f: 'Fabled',
};

exports.getItems = async function (p) {
	let sql = `SELECT gname, gcount FROM user_gem NATURAL JOIN user WHERE id = ${p.msg.author.id} AND gcount > 0;`;
	let result = await p.query(sql);
	let items = {};
	for (let i = 0; i < result.length; i++) {
		let item = gems.gems[result[i].gname];
		if (item) {
			items[item.key] = {
				key: item.key,
				emoji: item.emoji,
				id: item.id,
				count: result[i].gcount,
			};
		}
	}
	return items;
};

function getGemByID(id) {
	for (let gem in gems.gems) {
		if (gems.gems[gem].id == id) {
			return gems.gems[gem];
		}
	}
	return undefined;
}

exports.getGem = function (key) {
	/* Copy the gem object */
	return { ...gems.gems[key] };
};

exports.use = async function (p, ids) {
	if (ids.length > 4) {
		// all current gem types
		p.errorMsg(', you can only use up to four gems at one time!', 3000);
		return;
	}

	let sql = '';
	let invalidIds = [];
	let usedGemTypes = {};
	let gems = [];
	for (let i = 0; i < ids.length; i++) {
		let id = ids[i];
		let gem = getGemByID(id);
		if (!gem) {
			invalidIds.push(id);
		} else if (usedGemTypes[gem.type]) {
			p.errorMsg(`, you can not use multiple **${gem.type} Gems** at the same time!`, 3000);
			return;
		} else {
			gems.push(gem);
			usedGemTypes[gem.type] = true;
			sql += `UPDATE IGNORE user NATURAL JOIN user_gem ug NATURAL JOIN gem g
				SET gcount = gcount - 1,
					activecount = ${gem.length}
				WHERE gname = '${gem.key}'
					AND gcount > 0
					AND id = ${p.msg.author.id}
					AND (SELECT sum FROM
						(SELECT SUM(activecount) as sum,type FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = ${p.msg.author.id} GROUP BY type) as tmptable
						WHERE type = g.type) <= 0;`;
		}
	}
	if (invalidIds.length > 0) {
		p.errorMsg(`, one or more ids are not valid gems: ${invalidIds.toString()}`, 3000);
		return;
	}

	const results = await p.query(sql);

	let text = '';
	if (ids.length === 1) {
		if (!results || results.changedRows == 0) {
			text = `**🚫 | ${p.msg.author.username}**, you already have an active ${gems[0].type} gem or you do not own this gem!`;
		} else {
			text =
				`**${gems[0].emoji} | ${p.msg.author.username}**, you activated a(n) **${
					ranks[gems[0].key[0]]
				} ${gems[0].type} Gem**!\n` + getUseGemText(gems[0]);
		}
	} else {
		text = `**✨ | ${p.msg.author.username}**, you activated the following gems:`;
		for (let i = 0; i < results.length; i++) {
			if (!results[i] || results[i].changedRows == 0) {
				text += `\r\n**🚫 |** you already have an active ${gems[i].type} gem or you do not own this gem!`;
			} else {
				text +=
					`\r\n**${gems[i].emoji} |** A(n) **${ranks[gems[i].key[0]]} ${gems[i].type} Gem!**\r\n` +
					getUseGemText(gems[i]);
			}
		}
	}

	p.send(text);
};

function getUseGemText(gem) {
	let text = `**<:blank:427371936482328596> |** Your next ${gem.length} `;
	if (gem.type == 'Hunting') text += `manual hunts will be increased by ${gem.amount}`;
	else if (gem.type == 'Patreon')
		text +=
			'manual hunts will catch an extra animal and have a chance to contain Patreon exclusive animals!';
	else if (gem.type == 'Empowering')
		text += 'animals will be doubled! It can stack with Hunting gems!';
	else if (gem.type == 'Lucky')
		text += `animals will have a +${gem.amount}x higher chance of finding gem tiers!`;
	else text += 'ERROR!';
	return text;
}

exports.desc = async function (p, id) {
	const gem = getGemByID(id);
	if (!gem) {
		p.errorMsg(', There is no such item!', 3000);
		return;
	}
	const sql =
		'SELECT * FROM user NATURAL JOIN user_gem NATURAL JOIN gem WHERE id = ' +
		p.msg.author.id +
		" AND gname = '" +
		gem.key +
		"';";
	const result = await p.query(sql);
	if (!result[0]) {
		p.errorMsg(', you do not have this item!', 3000);
		return;
	}

	let text = '**ID:** ' + gem.id + '\n';
	if (gem.type == 'Hunting')
		text +=
			'A(n) ' +
			ranks[gem.key[0]] +
			' Hunting Gem!\nWhen activated, this gem will increase your manual hunt by ' +
			gem.amount +
			' for the next ' +
			gem.length +
			' hunts!\nCannot stack with other Hunting gems.';
	else if (gem.type == 'Patreon')
		text +=
			'A(n) ' +
			ranks[gem.key[0]] +
			' Patreon Gem!\nWhen activated, this gem will allow you to find Patreon/Custom pets when manually hunting for the next ' +
			gem.length +
			' hunts!\nYou will also hunt 1 extra animal per hunt!\nCannot stack with other Patreon gems.';
	else if (gem.type == 'Empowering')
		text +=
			'A(n) ' +
			ranks[gem.key[0]] +
			' Empowering Gem!\nWhen activated, this gem will double your next ' +
			gem.length +
			' animals!\nCannot stack with other Empowering gems, but can stack with Hunting gems.';
	else if (gem.type == 'Lucky')
		text +=
			'A(n) ' +
			ranks[gem.key[0]] +
			' Lucky Gem!\nWhen activated, this gem will increase your chance of finding gem pets by ' +
			gem.amount +
			'x for the next ' +
			gem.length +
			' animals!\nCannot stack with other Lucky gems.';
	const embed = {
		color: p.config.embed_color,
		fields: [
			{
				name: gem.emoji + ' ' + gem.key,
				value: text,
			},
		],
	};
	p.send({ embed });
};
