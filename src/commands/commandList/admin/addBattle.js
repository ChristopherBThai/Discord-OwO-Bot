/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const { stripIndents } = require('common-tags');
const CommandInterface = require('../../CommandInterface');
const patreonUtil = require('../patreon/utils/patreonUtil');
const emoji = '🎉';

module.exports = new CommandInterface({
	alias: ['addbattle'],
	owner: true,

	execute: async function (p) {
		const list = await parseUsers(p);
		p.send(list.success + '\n\n' + list.failed);
	},
});

async function parseUsers(p) {
	let success = '';
	let failed = '';
	const ids = p.args.join(' ').split(/\s+/gi);
	for (let id of ids) {
		if (!p.global.isUser(`<@${id}>`)) {
			p.errorMsg(`, Invalid user id: ${id}`);
		} else {
			try {
				let result = await addPerk(p, id);
				if (result) {
					success += `\`[${result.user.id}] ${result.user.username}#${result.user.discriminator}\`\n`;
				} else {
					failed += `\`failed for [${id}]\`\n`;
				}
			} catch (err) {
				console.error(err);
				failed += `failed for [${id}]\n`;
			}
		}
	}
	return { success, failed };
}

async function addPerk(p, id) {
	// Fetch uid first
	await patreonUtil.giveCustomBattle(p, id);

	// Send msgs
	const user = await p.sender.msgUser(
		id,
		stripIndents`
		${emoji} **|** You received the ability to customize your **battle** command!
		${p.config.emoji.blank} **|** You can customize it in our website: https://owobot.com/user/customize/battle
	`
	);
	if (user && !user.dmError) return { user };
	else await p.errorMsg(`, Failed to message user for ${id}`);
}
