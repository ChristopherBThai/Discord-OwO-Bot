/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const owo = require('@zuzak/owo');
const alterOwo = require('../patreon/alterOwo.js');

module.exports = new CommandInterface({
	alias: ['owo', 'owoify', 'ify'],

	args: '{text}',

	desc: "OwOify your text! You can also just type 'owo owoify' to OwOify the message above yours!",

	example: ['owo owoify Hello, I like OwO Bot!', 'owo owoify'],

	related: [],

	permissions: ['sendMessages'],

	group: ['social'],

	cooldown: 3000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let text;
		let author;

		// Check if we need to view previous msgs
		if (p.args.length <= 0) {
			let msgs = await p.global.getChannelMessages(p.msg.channel, 1, p.msg.id);
			if (!msgs || !msgs[0] || !msgs[0].content) {
				p.errorMsg(', there is no message before yours! UwU', 3000);
				return;
			}
			text = msgs[0].content;
			author = msgs[0].author;
		} else {
			text = p.args.join(' ');
		}

		// OwOify
		const owofied = p.replaceMentions(owo(text));
		text = owofied;
		// If its from a previous msg
		if (author) text = '**' + author.username + ':** ' + text;
		text = alterOwo.alter(p.msg.author.id, text, {
			user: p.msg.author,
			author: author || p.msg.author,
			text: owofied,
		});
		await p.send(text);
	},
});
