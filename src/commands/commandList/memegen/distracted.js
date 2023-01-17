/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const canvasUtil = require('./canvasUtil.js');

module.exports = new CommandInterface({
	alias: ['distractedbf', 'distracted'],

	args: '{gfText|@user|emoji} | {womenText|@user|emoji} | {bfText|@user|emoji}',

	desc: "Generate a distracted boyfriend meme! Seperate the three arguments with a '|' bar, or press 'Shift+Enter' between arguments",

	example: ['owo distracted Playing actual games | @OwO | @me'],

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
			if (
				p.global.isUser(args[args.length - 2]) ||
				/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(args[args.length - 2])
			) {
				args[args.length - 2] = '\n' + args[args.length - 2];
			}
		}
		args = args.join(' ').replace(/\s*\|\s*/g, '\n');
		args = args.split(/\n+/g);
		if (args.length < 2) {
			p.errorMsg(', you need at least 2 arguments!', 3000);
			p.setCooldown(5);
			return;
		}
		if (args.length > 3) {
			p.errorMsg(', you have too many arguments!', 3000);
			p.setCooldown(5);
			return;
		}
		canvasUtil.loadBackground(
			'./src/data/images/distracted.jpg',
			function (err, ctx, canvas, _image) {
				if (err) {
					p.errorMsg(', Uh oh... this command broke..', 3000);
					return;
				}

				let textArgs = {
					x: 500,
					y: 170,
					width: 200,
					height: 200,
					size: 30,
					stroke: 3,
					align: 'center',
					color: 'black',
					text: args[0],
					imageSize: 100,
				};

				canvasUtil.addText(textArgs, p, ctx, canvas, function () {
					textArgs.text = args[1];
					textArgs.x = 100;
					textArgs.y = 165;
					canvasUtil.addText(textArgs, p, ctx, canvas, function () {
						textArgs.text = args[2];
						textArgs.x = 300;
						textArgs.y = 120;
						canvasUtil.addText(textArgs, p, ctx, canvas, function () {
							let buf = canvas.toBuffer();
							p.send('**🖼 | ' + p.msg.author.username + '** generated a meme!', null, {
								file: buf,
								name: 'meme.png',
							});
						});
					});
				});
			}
		);
	},
});
