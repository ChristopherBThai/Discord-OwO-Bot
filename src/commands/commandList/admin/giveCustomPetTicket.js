/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['givecustompetticket', 'gcpt'],

	owner: true,
	admin: true,
	manager: true,

	execute: async function (p) {
		const list = await parseUsers(p);
		p.send(list.success + '\n\n' + list.failed);
	},
});

async function parseUsers(p) {
	let success = '';
	let failed = '';
	const lines = p.args.join(' ').split(/\n+/gi);
	for (let line of lines) {
		const args = line
			.replace(/[^ \d]/gi, ' ')
			.trim()
			.split(/\s+/gi);
		try {
			let result = await giveTicket(p, args[0], args[1]);
			if (result) {
				success += `\`[${result.count}] [${result.user.id}] ${p.getUniqueName(result.user)}\`\n`;
			} else {
				failed += `\`failed for [${args.join(', ')}]\`\n`;
			}
		} catch (err) {
			console.error(err);
			failed += `failed for [${args.join(', ')}]\n`;
		}
	}
	return { success, failed };
}

async function giveTicket(p, id, count = 1) {
	//Parse id
	if (!p.global.isUser(id) && !p.global.isUser('<@' + id + '>')) {
		p.errorMsg(', Invalid user id: ' + id);
		return;
	}

	// Parses count
	if (count && p.global.isInt(count)) count = parseInt(count);
	if (!count) {
		p.errorMsg(', invalid # of tickets');
		return;
	}

	let type = 'custom_pet_tickets';
	let name = 'Custom Pet Ticket';
	if (Math.abs(count) > 1) name += 's';
	let emoji = p.config.emoji.perkTicket.custom_pet;

	// Fetch uid first
	const uid = await p.global.getUid(id);

	// Query result
	let sql = `INSERT INTO user_item (uid, name, count) VALUES (${uid}, '${type}', ${count}) ON DUPLICATE KEY update count = count + ${count};`;
	await p.query(sql);

	// Send msgs
	let user;
	if (count > 0)
		user = await p.sender.msgUser(
			id,
			`${emoji} **|** Thank you! You received **${count} ${emoji} ${name}**!`
		);
	else
		user = await p.sender.msgUser(
			id,
			`${emoji} **|** Sorry about that. You have lost **${Math.abs(count)} ${emoji} ${name}**.`
		);

	if (user && !user.dmError) return { user, count };
	else await p.errorMsg(', Failed to message user for ' + id);
}
