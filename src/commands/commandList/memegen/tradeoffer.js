/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const canvasUtil = require('./canvasUtil.js');

module.exports = new CommandInterface({
	alias: ['tradeoffer'],

	args: '{leftText|@user|emoji} | {rightText|@user|emoji} | {@user|emoji}',

	desc: "Generate a Trade Offer meme! Seperate the arguments with a '|' bar, or press 'Shift+Enter' between arguments",

	example: ['owo tradeoffer tons of animals | tons of captchas | @OwO'],

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
		if (args.length < 2 || args.length > 3) {
			p.errorMsg(
				', the correct arguments are `{leftText|@user|emoji} | {rightText|@user|emoji} | {@user|emoji}`',
				3000
			);
			p.setCooldown(5);
			return;
		}
		let hasThird = false;
		if (args.length === 3) {
			hasThird = true;
			if (
				!p.global.isUser(args[args.length - 1]) ||
				/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(args[args.length - 1])
			) {
				p.errorMsg(', the third argument must be a user or an emoji', 3000);
				p.setCooldown(5);
				return;
			}
		}
		canvasUtil.loadBackground(
			'./src/data/images/tradeoffer.jpg',
			function (err, ctx, canvas, _image) {
				if (err) {
					p.send('**🚫 | ' + p.msg.author.username + '**, Uh oh.. this command is broken!', 3000);
					return;
				}

				let textArgs = {
					x: 20,
					y: 300,
					width: 240,
					height: 220,
					size: 30,
					stroke: 3,
					color: 'black',
					text: args[0],
					imageSize: 120,
					align: 'center',
					ifImage: { y: -50 },
					imageFontSize: 35,
				};

				canvasUtil.addText(textArgs, p, ctx, canvas, function () {
					textArgs.text = args[1];
					textArgs.x = 347;
					canvasUtil.addText(textArgs, p, ctx, canvas, function () {
						if (hasThird) {
							textArgs.text = args[2];
							textArgs.x = 190;
							textArgs.y = 470;
							textArgs.imageSize = 165;
							canvasUtil.addText(textArgs, p, ctx, canvas, function () {
								let buf = canvas.toBuffer();
								p.send('**🖼 | ' + p.msg.author.username + '** generated a meme!', null, {
									file: buf,
									name: 'meme.png',
								});
							});
						} else {
							let buf = canvas.toBuffer();
							p.send('**🖼 | ' + p.msg.author.username + '** generated a meme!', null, {
								file: buf,
								name: 'meme.png',
							});
						}
					});
				});
			}
		);
	},
});
