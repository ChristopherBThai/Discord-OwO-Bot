/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

/* eslint-disable-next-line */
const regex = /^[\x00-\x7F]{1,25}$/i;
const mentions = /<(?:@[!&]?|#)\d+>/g;
const settingEmoji = '⚙️';
const comments = [
	'I like it!',
	'Fancy!',
	'nice.',
	';)',
	'I love it <3',
	"It's perfect!",
	'amazing.',
	'wow',
	'Wonderful',
	'10/10',
	'🎉',
];

module.exports = new CommandInterface({
	alias: ['prefix'],

	args: '{newPrefix}',

	desc: 'Change the prefix for the server! Only Server admins are able to use this command.',

	example: ['owo prefix uwu', 'owo prefix owo'],

	related: [],

	permissions: ['sendMessages'],

	group: ['utility'],

	cooldown: 10000,

	execute: async function (p) {
		// display prefix
		if (!p.args.length) {
			let prefix = await p.redis.hget(p.msg.channel.guild.id, 'prefix');
			if (prefix) {
				p.replyMsg(settingEmoji, `, the current prefix is set to **\`${prefix}\`**!`);
				p.msg.channel.guild.prefix = prefix;
			} else {
				p.replyMsg(settingEmoji, ', no prefix is set for this server!');
			}
			return;
		}

		// Must have manage channels perm
		if (!p.msg.member.permissions.has('manageChannels')) {
			p.errorMsg(", you're not an admin! >:c", 3000);
			return;
		}

		// parse and validate prefix
		let prefix = p.args.join('').toLowerCase();
		if (!regex.test(prefix)) {
			p.errorMsg(
				', invalid prefix! Custom prefix must be under 25 character and exclude special characters',
				5000
			);
			return;
		} else if (mentions.test(prefix)) {
			p.errorMsg(', invalid prefix! Custom prefix must exclude mentions', 5000);
			return;
		}

		// save pefix
		if (prefix === p.config.prefix) {
			await p.redis.hdel(p.msg.channel.guild.id, 'prefix');
			p.msg.channel.guild.prefix = false;
		} else {
			await p.redis.hset(p.msg.channel.guild.id, 'prefix', prefix);
			p.msg.channel.guild.prefix = prefix;
		}

		p.replyMsg(
			settingEmoji,
			`, you successfully changed my server prefix to **\`${prefix}\`**! ${
				comments[Math.floor(Math.random() * comments.length)]
			}`
		);
	},
});
