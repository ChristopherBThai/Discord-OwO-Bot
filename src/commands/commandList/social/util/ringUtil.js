/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const alterBuy = require('../../patreon/alterBuy.js');
const rings = require('../../../../data/rings.json');
const cart = '🛒';
const sold = '💰';

exports.buy = async function (p, id) {
	let ring = rings[id];
	if (!ring) {
		p.errorMsg(', that item does not exist! Please choose one from `owo shop`!', 3000);
		return;
	}

	let sql = `UPDATE cowoncy SET money = money - ${ring.price} WHERE id = ${p.msg.author.id} AND money >= ${ring.price}`;
	let result = await p.query(sql);

	if (!result || result.changedRows < 1) {
		p.errorMsg(', you do not have enough cowoncy! >:c', 3000);
		return;
	}

	sql = `INSERT INTO user_ring (uid,rid,rcount) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),${ring.id},1) ON DUPLICATE KEY UPDATE rcount = rcount + 1;`;
	try {
		await p.query(sql);
	} catch (e) {
		if (e.code == 'ER_BAD_NULL_ERROR')
			await p.query(`INSERT INTO user (id,count) VALUES (${p.msg.author.id},0); ` + sql);
		else console.error(e);
	}

	// TODO neo4j
	p.logger.decr('cowoncy', -1 * ring.price, { type: 'ring' }, p.msg);
	let an = p.global.isVowel(ring.name) ? 'n' : '';
	let text = `${cart} **| ${p.msg.author.username}**, you bought a${an} ${ring.emoji} **${
		ring.name
	}** for **${p.global.toFancyNum(ring.price)}** ${p.config.emoji.cowoncy}!`;
	text = alterBuy.alter(p, text, {
		type: 'ring',
		an,
		ring,
		price: p.global.toFancyNum(ring.price),
		user: p.msg.author,
	});

	p.send(text);
};

exports.getItems = async function (p) {
	let sql = `SELECT rid,rcount FROM user_ring INNER JOIN user ON user.uid = user_ring.uid WHERE id = ${p.msg.author.id} AND rcount > 0;`;
	let result = await p.query(sql);
	if (!result[0]) {
		return {};
	}

	let items = {};

	for (let i in result) {
		let id = result[i].rid;
		let count = result[i].rcount;
		let ring = rings[id];

		items[id] = { emoji: ring.emoji, id: id, count };
	}

	return items;
};

exports.sell = async function (p, id) {
	let ring = rings[id];
	if (!ring) {
		p.errorMsg(', invalid ring id!', 3000);
		return;
	}

	let sql = `UPDATE user_ring INNER JOIN user ON user.uid = user_ring.uid SET rcount = rcount - 1 WHERE id = ${p.msg.author.id} AND rcount > 0 AND rid = ${id}`;
	let result = await p.query(sql);
	if (result.changedRows <= 0) {
		p.errorMsg(', you do not have that ring! >:c', 3000);
		return;
	}

	let price = Math.round(ring.price * 0.75);
	sql = `UPDATE cowoncy SET money = money + ${price} WHERE id = ${p.msg.author.id};`;
	await p.query(sql);
	// TODO neo4j
	p.logger.incr('cowoncy', price, { type: 'ring' }, p.msg);
	p.replyMsg(
		sold,
		', you sold a' +
			(p.global.isVowel(ring.name) ? 'n' : '') +
			' ' +
			ring.emoji +
			' **' +
			ring.name +
			'** for **' +
			p.global.toFancyNum(price) +
			'** ' +
			p.config.emoji.cowoncy
	);
};

var maxID = -1;
for (let i in rings) if (rings[i].id > maxID) maxID = rings[i].id;
exports.getMaxID = function () {
	return maxID;
};
