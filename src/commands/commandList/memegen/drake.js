/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const canvasUtil = require('./canvasUtil.js');

module.exports = new CommandInterface({
	alias: ['drake'],

	args: '{topText|@user|emoji} | {bottomText|@user|emoji}',

	desc: "Generate a Drake meme! Seperate the two arguments with a '|' bar, or press 'Shift+Enter' between arguments",

	example: ['owo drake Using Discord to communicate with friends | Using discord to play OwO bot'],

	related: [],

	permissions: ['sendMessages', 'attachFiles'],

	group: ['memegeneration'],

	cooldown: 20000,
	half: 100,
	six: 500,
	bot: true,

	execute: function (p) {
		let args = p.args.slice();
		if (
			p.global.isUser(args[args.length - 1]) ||
			/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(args[args.length - 1])
		) {
			args[args.length - 1] = '\n' + args[args.length - 1];
		}
		args = args.join(' ').replace(/\s*\|\s*/g, '\n');
		args = args.split(/\n+/g);
		if (args.length != 2) {
			p.errorMsg(', you need 2 arguments!', 3000);
			p.setCooldown(5);
			return;
		}
		canvasUtil.loadBackground('./src/data/images/drake.jpg', function (err, ctx, canvas, _image) {
			if (err) {
				p.send('**🚫 | ' + p.msg.author.username + '**, Uh oh.. this command is broken!', 3000);
				return;
			}

			let textArgs = {
				font: 'Arial',
				x: 340,
				y: 130,
				width: 260,
				height: 250,
				size: 30,
				color: 'black',
				text: args[0],
				imageSize: 100,
			};

			canvasUtil.addText(textArgs, p, ctx, canvas, function () {
				textArgs.text = args[1];
				textArgs.y = 410;
				canvasUtil.addText(textArgs, p, ctx, canvas, function () {
					let buf = canvas.toBuffer();
					p.send('**🖼 | ' + p.msg.author.username + '** generated a meme!', null, {
						file: buf,
						name: 'meme.png',
					});
				});
			});
		});
	},
});
