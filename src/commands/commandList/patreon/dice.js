/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const message = [
	'What a lucky day!',
	'What a bad day...',
	'Nice!',
	'Oof',
	'Oh no...',
	'Yikes',
	'Hurray!',
	'Amazing!',
	'Yes!',
	'Oh!',
	'Oh my.',
	'Lucky!',
	'Aw..',
	'Booo..',
];

module.exports = new CommandInterface({
	alias: ['roll', 'd20'],

	args: '{# of faces}',

	desc: 'Roll a N-sided die! This command was created by Gut Funk!',

	example: ['owo roll', 'owo roll 20'],

	related: [],

	permissions: ['sendMessages'],

	group: ['fun'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: function (p) {
		var sides = 6;
		if (p.command == 'd20') sides = 20;
		if (p.args.length > 0 && p.global.isInt(p.args[0])) sides = parseInt(p.args[0]);

		let result = Math.ceil(sides * Math.random());
		result =
			'**<:blank:427371936482328596> |**  ' +
			message[Math.trunc(Math.random() * message.length)] +
			" It's a **" +
			result +
			'**!';

		p.send('**🎲 | ' + p.msg.author.username + '** rolls a ' + sides + '-sided die.\n' + result);
	},
});
