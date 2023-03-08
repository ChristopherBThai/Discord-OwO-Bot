/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const canvasUtil = require('./canvasUtil.js');

module.exports = new CommandInterface({
	alias: ['communism', 'communismcat'],

	args: '{text}',

	desc: 'Generate a communism cat meme!',

	example: ['owo communism our meme'],

	related: [],

	permissions: ['sendMessages', 'attachFiles'],

	group: ['memegeneration'],

	cooldown: 20000,
	half: 100,
	six: 500,
	bot: true,

	execute: function (p) {
		let args = p.args.join(' ').replace(/\s*\|\s*/g, '\n');
		if (args.length < 1) {
			p.errorMsg(', you need at least 1 arguments!', 3000);
			p.setCooldown(5);
			return;
		}
		canvasUtil.loadBackground(
			'./src/data/images/communism.png',
			function (err, ctx, canvas, _image) {
				if (err) {
					p.errorMsg(', Uh oh... this command broke..', 3000);
					return;
				}

				let textArgs = {
					x: 10,
					y: 60,
					width: 436,
					height: 150,
					size: 25,
					align: 'left',
					color: 'black',
					text: args,
					font: 'Arial',
				};

				canvasUtil.addText(textArgs, p, ctx, canvas, function () {
					let buf = canvas.toBuffer();
					p.send('**🖼 | ' + p.msg.author.username + '** generated a meme!', null, {
						file: buf,
						name: 'meme.png',
					});
				});
			}
		);
	},
});
