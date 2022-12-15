/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const weeb = require('../../../utils/weeb.js');
const emotes = require('../../../data/emotes.json').sEmote;
const emoteList = [];
for (let key in emotes) emoteList.push(key);

module.exports = new CommandInterface({
	alias: emoteList,
	distinctAlias: true,

	args: '',

	desc: 'Express your emotions!',

	example: ['owo ' + emoteList.join('|')],

	related: ['owo slap', 'owo kiss', 'owo hug', 'and more'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['emotes'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: function (p) {
		let emote = emotes[p.command];
		if (emote == undefined) return;
		if (emote.alt != undefined) emote = emotes[emote.alt];
		let text = emote.msg[Math.floor(Math.random() * emote.msg.length)];
		text = text.replace(/\?/, p.msg.author.username);
		weeb.grab(p, emote.name, 'gif', text);
	},
});
