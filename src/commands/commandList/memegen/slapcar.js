/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const fs = require('fs');
const request = require('request');
const { createCanvas, Image } = require('canvas');
const textBoxHeight = 100;

module.exports = new CommandInterface({
	alias: ['slapcar', 'slaproof'],

	args: '{text} {@user|emoji}',

	desc: 'Creates a *slaps roof of car* meme! You can also tag a user after your text to use their image instead',

	example: ['owo slapcar This badboy can fit so much coffee @Scuttler', 'owo slapcar I slap cars'],

	related: [],

	group: ['memegeneration'],

	cooldown: 20000,
	half: 100,
	six: 500,
	bot: true,

	permissions: ['sendMessages', 'attachFiles'],

	execute: function (p) {
		if (p.global.isUser(p.args[p.args.length - 1])) user(p);
		else if (/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(p.args[p.args.length - 1])) emoji(p);
		else car(p);
	},
});

function car(p) {
	fs.readFile('./src/data/images/slap_car.jpg', function (err, image) {
		if (err) {
			console.error(err);
			return;
		}

		let img = new Image();
		img.src = image;
		let canvas = createCanvas(img.width, img.height + textBoxHeight);
		canvas.backgroundColor = 'white';
		let ctx = canvas.getContext('2d');
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, img.width, img.height + textBoxHeight);
		ctx.fillStyle = 'black';
		ctx.drawImage(img, 0, textBoxHeight, img.width, img.height);
		ctx.textAlign = 'left';

		//Format text
		if (p.args.join(' ').length > 120) ctx.font = '20px Arial';
		else ctx.font = '30px Arial';
		let text = '';
		for (let i = 0; i < p.args.length; i++) {
			if (ctx.measureText(text + p.args[i]).width > 700 && i > 0) text += '\n';
			text += p.args[i] + ' ';
		}

		let lines = text.split(/\r\n|\r|\n/).length - 1;
		// te = ctx.measureText(text);
		if (lines > 4) {
			p.send('**🚫 | ' + p.msg.author.username + '**, The text is too long!', 3000);
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
}

function user(p) {
	fs.readFile('./src/data/images/slap_transparent.png', async function (err, image) {
		if (err) {
			console.error(err);
			return;
		}
		let url = await p.getMention(p.args[p.args.length - 1]);
		if (!url) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
			return;
		}
		url = url.avatarURL.replace('.jpg', '.png').replace('.gif', '.png');

		request({ url: url, method: 'GET', encoding: null }, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				let img2 = new Image();
				img2.onload = function () {
					let img = new Image();
					img.src = image;
					let canvas = createCanvas(img.width, img.height + textBoxHeight);
					canvas.backgroundColor = 'white';
					let ctx = canvas.getContext('2d');
					ctx.fillStyle = 'white';
					ctx.fillRect(0, 0, img.width, img.height + textBoxHeight);
					ctx.fillStyle = 'black';
					ctx.drawImage(img2, 0, canvas.height - 330, 330, 330);
					ctx.drawImage(img, 0, textBoxHeight, img.width, img.height);
					ctx.textAlign = 'left';

					//Format text
					let tempText = p.args.slice(0, p.args.length - 1);
					if (tempText.join(' ').length > 120) ctx.font = '20px Arial';
					else ctx.font = '30px Arial';
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
				};
				img2.onerror = function () {
					p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the image', 3000);
				};
				img2.src = body;
			} else p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the image', 3000);
		});
	});
}

function emoji(p) {
	fs.readFile('./src/data/images/slap_transparent.png', async function (err, image) {
		if (err) {
			console.error(err);
			return;
		}

		let url = p.args[p.args.length - 1].match(/:[0-9]+>/gi);
		if (!url || !url[0]) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the emoji', 3000);
			p.setCooldown(5);
			return;
		}
		url = 'https://cdn.discordapp.com/emojis/' + url[0].slice(1, url[0].length - 1) + '.png';

		request({ url: url, method: 'GET', encoding: null }, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				let img2 = new Image();
				img2.onload = function () {
					let img = new Image();
					img.src = image;
					let canvas = createCanvas(img.width, img.height + textBoxHeight);
					canvas.backgroundColor = 'white';
					let ctx = canvas.getContext('2d');
					ctx.fillStyle = 'white';
					ctx.fillRect(0, 0, img.width, img.height + textBoxHeight);
					ctx.fillStyle = 'black';
					ctx.drawImage(img2, 0, canvas.height - 330, 330, 330);
					ctx.drawImage(img, 0, textBoxHeight, img.width, img.height);
					ctx.textAlign = 'left';

					//Format text
					let tempText = p.args.slice(0, p.args.length - 1);
					if (tempText.join(' ').length > 120) ctx.font = '20px Arial';
					else ctx.font = '30px Arial';
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
				};
				img2.onerror = function () {
					p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the image', 3000);
				};
				img2.src = body;
			} else p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the image', 3000);
		});
	});
}
