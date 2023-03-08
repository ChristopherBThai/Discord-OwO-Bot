/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const fs = require('fs');
const { createCanvas, Image } = require('canvas');

module.exports = new CommandInterface({
	alias: ['spongebobchicken', 'schicken'],

	args: '{text}',

	desc: 'Creates a spongebob chicken meme!',

	example: ["owo spongebobchicken I don't like owo bot!"],

	related: [],

	cooldown: 20000,
	half: 100,
	six: 500,
	bot: true,

	permissions: ['sendMessages', 'attachFiles'],

	group: ['memegeneration'],

	execute: function (p) {
		fs.readFile('./src/data/images/spongebob_chicken.jpg', function (err, image) {
			if (err) {
				console.error(err);
				return;
			}

			let img = new Image();
			img.src = image;
			let canvas = createCanvas(img.width, img.height);
			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
			ctx.textAlign = 'left';

			//Format text
			let tempText = p.args.join(' ').toLowerCase().split('');
			if (tempText.length > 120) ctx.font = '20px Arial';
			else ctx.font = '30px Arial';
			for (let i = 1; i < tempText.length; i += 2) tempText[i] = tempText[i].toUpperCase();
			tempText = tempText.join('').split(' ');
			let text = '';
			for (let i = 0; i < tempText.length; i++) {
				if (ctx.measureText(text + tempText[i] + ' ').width > 700 && i > 0) text += '\n';
				text += tempText[i] + ' ';
			}

			let lines = text.split(/\r\n|\r|\n/).length - 1;
			// te = ctx.measureText(text);
			if (lines > 4) {
				p.send('**🚫 | ' + p.msg.author.username + '**, The text is too long!');
				p.setCooldown(5);
				return;
			}
			ctx.fillText(text, 10, 80 - lines * 15);

			let buf = canvas.toBuffer();
			p.send('**🖼 | ' + p.msg.author.username + '** generated a meme!', null, {
				file: buf,
				name: 'meme.png',
			});
		});
	},
});
