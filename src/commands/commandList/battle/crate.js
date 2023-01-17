/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const crateShake = '<a:crateshake:523771259172028420>';
const crateOpen = '<a:crateopen:523771437408845852>';
const weaponUtil = require('./util/weaponUtil.js');
const maxBoxes = 50;

module.exports = new CommandInterface({
	alias: ['crate', 'weaponcrate', 'wc'],

	args: '{count}',

	desc: 'Opens a crate to find weapons!',

	example: [],

	related: ['owo weapon', 'owo battle'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		if (p.args.length > 0 && p.global.isInt(p.args[0])) {
			await openCrate(p, parseInt(p.args[0]));
		} else if (p.options.count) {
			await openCrate(p, parseInt(p.options.count));
		} else if (p.args.length > 0 && p.args[0].toLowerCase() == 'all') {
			let sql = `SELECT boxcount FROM crate INNER JOIN user ON crate.uid = user.uid WHERE id = ${p.msg.author.id};`;
			let result = await p.query(sql);
			if (!result || result[0].boxcount <= 0) {
				p.errorMsg(", you don't have any more weapon crates!");
				return;
			}
			let boxcount = result[0].boxcount;
			if (boxcount > maxBoxes) boxcount = maxBoxes;
			await openCrate(p, boxcount);
		} else {
			await openCrate(p);
		}
	},
});

async function openCrate(p, count = 1) {
	if (count <= 0) {
		p.errorMsg(', you must open more than one crate silly!', 3000);
		return;
	}
	if (count > maxBoxes) {
		count = maxBoxes;
	}

	/* Decrement crate count */
	let sql = `UPDATE crate INNER JOIN user ON crate.uid = user.uid SET crate.boxcount = crate.boxcount - ${count} WHERE user.id = ${p.msg.author.id} AND boxcount >= ${count};`;
	sql += `SELECT uid FROM user WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	if (result[0].changedRows == 0 || !result[1][0]) {
		p.errorMsg(", You don't have any weapon crates!", 3000);
		return;
	}

	let uid = result[1][0].uid;
	if (!uid) {
		p.errorMsg(', It looks like something went wrong...', 3000);
		return;
	}

	let weaponsList = weaponUtil.getRandomWeapons(uid, count);

	for (let i in weaponsList) {
		let weapon = weaponsList[i];
		result = await p.query(weapon.weaponSql);
		let uwid = result.insertId;
		if (!uwid) {
			p.errorMsg(', Uh oh. Something went wrong! The weapon passive could not be applied');
			console.error('Unable to add weapon passive to: ' + uwid);
		} else {
			weapon.uwid = uwid;
			let uwidList = [];
			for (let j = 0; j < weapon.passives.length; j++) uwidList.push(uwid);
			await p.query(weapon.passiveSql, uwidList);
		}
	}

	/* Construct text */
	let text1, text2;
	if (count == 1) {
		let weapon = weaponsList[0];
		text1 =
			p.config.emoji.blank +
			' **| ' +
			p.msg.author.username +
			'** opens a weapon crate\n' +
			crateShake +
			' **|** and finds a ...';
		text2 =
			weapon.emoji +
			' **| ' +
			p.msg.author.username +
			'** opens a weapon crate\n' +
			crateOpen +
			' **|** and finds a `' +
			weaponUtil.shortenUWID(weapon.uwid) +
			'` ' +
			weapon.rank.emoji +
			' ' +
			weapon.emoji;
		for (var i = 0; i < weapon.passives.length; i++) {
			text2 += ' ' + weapon.passives[i].emoji;
		}
		text2 += ' ' + weapon.avgQuality + '%';
	} else {
		weaponsList.sort((a, b) => {
			return b.avgQuality - a.avgQuality;
		});
		let allWeaponEmojis = '';
		for (let i in weaponsList) {
			allWeaponEmojis += weaponsList[i].emoji;
		}
		text1 =
			p.config.emoji.blank +
			' **| ' +
			p.msg.author.username +
			'** opens ' +
			count +
			' weapon crates\n' +
			crateShake +
			' **|** and finds...';
		text2 =
			p.config.emoji.blank +
			' **| ' +
			p.msg.author.username +
			'** opens ' +
			count +
			' weapon crates\n' +
			crateOpen +
			' **|** and finds: ' +
			allWeaponEmojis;
	}

	/* Send and edit message */
	let message = await p.send(text1);
	setTimeout(function () {
		message.edit(text2);
	}, 3000);
}
