/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const crate = '<:crate:523771259302182922>';
const crateChance = 0.05;

exports.getItems = async function (p) {
	var sql = `SELECT cratetype,boxcount FROM crate WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND boxcount > 0;`;
	var result = await p.query(sql);
	var items = {};
	for (var i = 0; i < result.length; i++) {
		items[100 - result[i].cratetype] = {
			emoji: crate,
			id: 100 - result[i].cratetype,
			count: result[i].boxcount,
		};
	}
	return items;
};

exports.crateFromBattle = function (p, query, crateReset) {
	let rand = Math.random();
	let sql =
		'INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		'),0,1,1,' +
		crateReset.sql +
		') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1, claimcount = 1, claim = ' +
		crateReset.sql +
		';';
	let count = 1;
	if (!query || crateReset.after) rand = 0;
	else {
		sql =
			'UPDATE IGNORE user INNER JOIN crate ON user.uid = crate.uid SET boxcount = boxcount + 1, claimcount = claimcount + 1 WHERE id = ' +
			p.msg.author.id +
			' AND cratetype = 0;';
		count = query.claimcount + 1;
	}
	if (rand <= crateChance) {
		return {
			sql: sql,
			text:
				'\n**' +
				crate +
				' | ' +
				p.msg.author.username +
				'**, You found a **weapon crate**! `[' +
				count +
				'/3] RESETS IN: ' +
				crateReset.hours +
				'H ' +
				crateReset.minutes +
				'M ' +
				crateReset.seconds +
				'S`',
		};
	} else return { sql: undefined, text: undefined };
};
