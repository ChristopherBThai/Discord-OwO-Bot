/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const global = require('../../../utils/global.js');
const box = '<:box:427352600476647425>';
const fbox = '<a:flootbox:725570544065445919>';
const tempGem = require('../../../data/gems.json');
const ranks = {
	c: 'Common',
	u: 'Uncommon',
	r: 'Rare',
	e: 'Epic',
	m: 'Mythical',
	l: 'Legendary',
	f: 'Fabled',
};
var gems = {};
for (var key in tempGem.gems) {
	var temp = tempGem.gems[key];
	temp.key = key;
	if (!gems[temp.type]) gems[temp.type] = [];
	let rank = ranks[key[0]];
	if (!rank) throw 'Missing rank type for gems';
	temp.rank = rank;
	gems[temp.type].push(temp);
}
var typeCount = Object.keys(gems).length;

exports.getItems = async function (p) {
	let sql = `SELECT boxcount,fbox FROM lootbox WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	if (!result[0]) {
		return {};
	}

	let items = {};
	if (result[0].boxcount > 0) {
		items.box = { emoji: box, id: 50, count: result[0].boxcount };
	}
	if (result[0].fbox > 0) {
		items.fbox = { emoji: fbox, id: 49, count: result[0].fbox };
	}

	return items;
};

function getRandomGem({ tier } = {}) {
	let rand = Math.trunc(Math.random() * (typeCount - 1));
	let count = 0;
	let type = 'Hunting';

	for (let key in gems) {
		// Disable patreon gems
		if (key == 'Patreon') {
			count++;
			rand++;
		} else if (count == rand) {
			type = key;
			count++;
		} else {
			count++;
		}
	}

	if (global.isInt(type)) type = Object.keys(gems)[0];
	type = gems[type];

	let gem;
	if (!tier) {
		rand = Math.random();
		let sum = 0;
		for (let x in type) {
			sum += type[x].chance;
			if (rand < sum) {
				gem = type[x];
				rand = 100;
			}
		}
	} else {
		gem = type[tier];
	}
	return gem;
}

const getRandomGems = (exports.getRandomGems = function (uid, count = 1, opts) {
	let gemResult = {};
	for (let i = 0; i < count; i++) {
		let tempGem = getRandomGem(opts);
		if (!gemResult[tempGem.id]) gemResult[tempGem.id] = { gem: tempGem, count: 1 };
		else gemResult[tempGem.id].count++;
	}

	let sql = 'INSERT INTO user_gem (uid,gname,gcount) VALUES ';
	for (let i in gemResult) {
		sql += `(${uid},'${gemResult[i].gem.key}',${gemResult[i].count}),`;
	}
	sql = `${sql.slice(0, -1)} ON DUPLICATE KEY UPDATE gcount = gcount + VALUES(gcount);`;

	return { gems: gemResult, sql };
});

exports.getRandomFabledGems = function (uid, count = 1) {
	return getRandomGems(uid, count, { tier: '6' });
};

exports.desc = function (p, id) {
	let embed;
	if (id == 49) {
		const text =
			"**ID:** 49\nOpens a Fabled lootbox! All gems are fabled tier! Check how many you have in 'owo inv'!\nYou currently cannot get these lootboxes in the game.\nUse `owo inv` to check your inventory\nUse 'owo use {id}` to use the item!";
		embed = {
			color: p.config.embed_color,
			fields: [
				{
					name: fbox + ' Fabled Lootbox',
					value: text,
				},
			],
		};
	} else {
		const text =
			"**ID:** 50\nOpens a lootbox! Check how many you have in 'owo inv'!\nYou can get some more by hunting for animals. You can get a maximum of 3 lootboxes per day.\nUse `owo inv` to check your inventory\nUse 'owo use {id}` to use the item!";
		embed = {
			color: p.config.embed_color,
			fields: [
				{
					name: box + ' Lootbox',
					value: text,
				},
			],
		};
	}
	p.send({ embed });
};
