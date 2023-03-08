/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const weeb = require('../../../utils/weeb.js');
const emotes = require('../../../data/emotes.json').uEmote;
var emoteList = [];
for (var key in emotes) emoteList.push(key);

module.exports = new CommandInterface({
	alias: emoteList,
	distinctAlias: true,

	args: '',

	desc: 'Express your emotions on others!',

	example: ['owo ' + emoteList.join('|')],

	related: ['owo cry', 'owo pout', 'owo dance', 'and more'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['actions'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let global = p.global,
			args = p.args,
			msg = p.msg;
		if (!global.isUser(args[0])) {
			p.send('**🚫 |** Wrong arguments! Please tag someone!', 3000);
			return;
		}
		let target = await p.getMention(args[0]);
		if (target == undefined) {
			p.send("**🚫 |** I couldn't find that user :c", 3000);
			return;
		}
		let emote = emotes[p.command];
		if (emote == undefined) {
			p.send('**🚫 |** Wrong arguments! Please tag someone!', 3000);
			return;
		}
		if (emote.alt != undefined) emote = emotes[emote.alt];
		if (msg.author.id == target.id) {
			let text = emote.self[Math.floor(Math.random() * emote.self.length)];
			text = text.replace(/\?/, msg.author.username);
			p.send(text);
			return;
		}
		let text = emote.msg[Math.floor(Math.random() * emote.msg.length)];
		text = text.replace(/\?/, msg.author.username);
		text = text.replace(/\?/, target.username);
		weeb.grab(p, emote.name, 'gif', text);
		p.quest('emoteTo');
		p.quest('emoteBy', 1, target);
	},
});
