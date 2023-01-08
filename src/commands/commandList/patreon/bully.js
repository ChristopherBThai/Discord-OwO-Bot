/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const emotes = [
	'https://imgur.com/3SsZUVT.gif',
	'https://imgur.com/g005tMV.gif',
	'https://imgur.com/wzn0ghV.gif',
	'https://imgur.com/D8SIe4Z.gif',
	'https://imgur.com/xmj8XRD.gif',
	'https://imgur.com/N10WUeF.gif',
	'https://imgur.com/pO2smzw.gif',
	'https://imgur.com/UYKs7Q1.gif',
	'https://imgur.com/aBQJPvZ.gif',
	'https://imgur.com/meZ0TDz.gif',
	'https://imgur.com/jI8zhH6.gif',
	'https://imgur.com/eP7NKy7.gif',
	'https://imgur.com/a3upumA.gif',
	'https://imgur.com/Lbzh24f.gif',
];
const comments = ['Ha! Deserves it.', 'c:<', '>:3', 'hahaha!'];

module.exports = new CommandInterface({
	alias: ['bully'],

	args: ['@user'],

	desc: 'A custom command created by Geist! Bully your friends!',

	example: ['owo bully @user'],

	related: ['owo hug'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['actions'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		if (p.args.length != 1 || !p.global.isUser(p.args[0])) {
			p.errorMsg(', Please @tag someone to use this command!', 3000);
			return;
		}
		let target = p.getMention(p.args[0]);
		if (target == undefined) {
			p.send("**🚫 |** I couldn't find that user :c", 3000);
			return;
		}
		if (p.msg.author.id == target.id) {
			let text = '**' + p.msg.author.username + "**! Don't bully yourself!";
			p.send(text);
			return;
		}

		let emote = emotes[Math.trunc(Math.random() * emotes.length)];
		let comment = comments[Math.trunc(Math.random() * comments.length)];
		let embed = {
			color: 6315775,
			image: {
				url: emote,
			},
			author: {
				name: p.msg.author.username + ' bullies ' + target.username + '! ' + comment,
				url: emote,
				icon_url: p.msg.author.avatarURL,
			},
		};
		p.send({ embed });
		p.quest('emoteTo');
		p.quest('emoteBy', 1, target);
	},
});
