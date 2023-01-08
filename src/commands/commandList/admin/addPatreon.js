/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const tada = '🎉';
const gear = '⚙';

module.exports = new CommandInterface({
	alias: ['addpatreon', 'addpatreons'],

	owner: true,

	execute: async function (p) {
		if (p.command == 'addpatreon') {
			let { user, date } = await addPatreon(p, p.args[0], p.args[1], p.args[2]);
			await p.replyMsg(
				tada,
				`, Updated **${user.username + '#' + user.discriminator}** patreon perks until **${date}**`
			);
		} else {
			await addPatreons(p);
		}
	},
});

async function addPatreons(p) {
	let success = '**Success**\n';
	let failed = '**Failed**\n';
	let lines = p.args.join(' ').split(/\n+/gi);
	for (let line of lines) {
		const args = line
			.replace(/[^ \d]/gi, ' ')
			.trim()
			.split(/\s+/gi);
		try {
			let result = await addPatreon(p, args[0], args[1], args[2]);
			if (result) {
				success += `\`${result.user.username}#${result.user.discriminator} -> ${result.date}\`\n`;
			} else {
				failed += `\`failed for [${args.join(', ')}]\`\n`;
			}
		} catch (err) {
			console.error(err);
			failed += `failed for [${args.join(', ')}]\n`;
		}
	}

	p.send(success + failed);
}

async function addPatreon(p, id, addMonths = 1, type = 1) {
	//Parse id
	if (!p.global.isUser(id) && !p.global.isUser('<@' + id + '>')) {
		p.errorMsg(', Invalid user id: ' + id, 3000);
		return;
	}

	// Parses # of months
	if (addMonths && p.global.isInt(addMonths)) addMonths = parseInt(addMonths);

	// Parse patreon type (use binary to parse flags)
	if (type && p.global.isInt(type)) type = parseInt(type);
	if (type && (type > 3 || type < 1)) {
		p.errorMsg(', wrong patreon types for ' + id);
		return;
	}

	// Query result
	let sql = `SELECT user.uid,patreonMonths,patreonTimer,TIMESTAMPDIFF(MONTH,patreonTimer,NOW()) AS monthsPassed,patreonType FROM user LEFT JOIN patreons ON user.uid = patreons.uid WHERE id = ${id}`;
	let result = await p.query(sql);
	let uid;
	let months = result[0] && result[0].patreonMonths ? result[0].patreonMonths : 0;
	let monthsPassed = p.global.isInt(result[0]?.monthsPassed) ? result[0].monthsPassed : months;
	if (!type) {
		if (result[0] && result[0].patreonType) type = result[0].patreonType;
		else type = 1;
	}

	// If uid does not exist
	if (result.length < 1 || !result[0].uid) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${id},0);`;
		result = await p.query(sql);
		uid = result.insertId;
	} else {
		uid = result[0].uid;
	}

	// reset timer or continue with current timer
	let date;
	if (months <= monthsPassed) {
		sql = `INSERT INTO patreons (uid,patreonMonths,patreonType) VALUES (${uid},${addMonths},${type}) ON DUPLICATE KEY UPDATE patreonType = ${type}, patreonMonths = ${addMonths},patreonTimer = NOW();`;
		date = new Date();
		date.setMonth(date.getMonth() + addMonths);
	} else {
		sql = `UPDATE patreons SET patreonType = ${type}, patreonMonths = patreonMonths + ${addMonths} WHERE uid = ${uid};`;
		date = new Date(result[0].patreonTimer);
		date.setMonth(date.getMonth() + addMonths + months);
	}
	date = date.toString();
	result = await p.query(sql);

	// Send msgs
	let user;
	if (addMonths > 0)
		user = await p.sender.msgUser(
			id,
			`${tada} **|** Your patreon has been extended by ${addMonths} month(s)!\n${p.config.emoji.blank} **|** Expires on: **${date}**`
		);
	else
		user = await p.sender.msgUser(
			id,
			`${gear} **|** Your patreon perks have been changed!\n${p.config.emoji.blank} **|** Expires on: **${date}**`
		);
	if (user && !user.dmError) return { user, date };
	else await p.errorMsg(', Failed to message user for ' + id, 3000);
}
