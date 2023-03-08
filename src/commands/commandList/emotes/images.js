/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const weeb = require('../../../utils/weeb.js');

module.exports = new CommandInterface({
	alias: ['gif', 'pic'],

	args: '{type}',

	desc: "Grabs a gif/pic with the given type. To list all the types, type 'owo gif'. Some listed types may not work",

	example: ['owo pic neko', 'owo gif neko'],

	related: ['owo gif', 'owo pic'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['fun'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: function (p) {
		var msg = p.msg,
			args = p.args;
		if (args.length == 0) {
			weeb.getTypes(p);
			return;
		} else if (args.length > 1) {
			p.send('**🚫 |** Wrong argument type! :c', 3000);
			return;
		}

		//Check for nsfw
		let nsfw = false;
		if (args[0] == 'nsfw') {
			if (!msg.channel.nsfw) {
				p.send('**🚫 |** nsfw channels only! >:c', 3000);
				return;
			} else if (p.command == 'gif') {
				p.send('**🚫 |** Sorry! I only have pics of nsfw! Please use `owo pic nsfw`', 3000);
				return;
			}
			nsfw = true;
			args[0] = 'neko';
		}

		//Grabs picture
		if (p.command == 'gif') weeb.grab(p, args[0], 'gif', args[0], nsfw);
		else if (Math.random() > 0.5) weeb.grab(p, args[0], 'png', args[0], nsfw);
		else weeb.grab(p, args[0], 'jpg', args[0], nsfw);
	},
});
