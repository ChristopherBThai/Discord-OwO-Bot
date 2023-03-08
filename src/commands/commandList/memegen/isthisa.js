/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const fs = require('fs');
const request = require('request').defaults({ encoding: null });
const { Canvas, Image } = require('canvas');

module.exports = new CommandInterface({
	alias: ['isthisa'],

	args: '{bottomText} | {butterflyText|@user|emoji} | {personText|@user|emoji}',

	desc: "Creates a 'is this a ___?' meme! You can also tag a user to use their image!",

	example: ['owo isthisa Is this an AI? | @OwO | me'],

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
			)
				args[args.length - 2] = '\n' + args[args.length - 2];
		}
		args = args.join(' ').replace(/\s*\|\s*/g, '\n');
		args = args.split(/\n+/g);
		if (args.length > 3) {
			p.errorMsg(', you have more than 3 arguments!', 3000);
			p.setCooldown(5);
			return;
		} else if (args.length < 1) {
			p.errorMsg(', you need at least 1 argument!', 3000);
			p.setCooldown(5);
			return;
		}
		fs.readFile('./src/data/images/isthisa.jpg', function (err, image) {
			if (err) {
				console.error(err);
				return;
			}
			let img = new Image();
			img.src = image;
			let canvas = new Canvas(img.width, img.height);
			canvas.backgroundColor = 'white';
			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);

			if (!addBottomText(p, args[0], ctx, canvas)) return;
			addButterflyText(p, args[1], ctx, canvas, function () {
				addPersonText(p, args[2], ctx, canvas, function () {
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

function addBottomText(p, text, ctx, canvas) {
	if (!text) return false;
	text = text.replace(/<a?:/gi, '');
	text = text.replace(/:[0-9]+>/gi, '');
	ctx.textAlign = 'center';
	ctx.font = '40px Impact';
	if (ctx.measureText(text).width > 730) ctx.font = '30px Impact';
	if (ctx.measureText(text).width > 730) {
		p.send('**🚫 | ' + p.msg.author.username + '**, The bottom text is too long!', 3000);
		return false;
	}

	writeText(canvas.width / 2, 543, ctx, text);
	return true;
}

async function addButterflyText(p, text, ctx, canvas, callback) {
	if (!text) {
		callback();
		return;
	}
	ctx.textAlign = 'center';
	if (p.global.isUser(text)) {
		let url = await p.fetch.getUser(text);
		if (!url) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
			return;
		}
		ctx.font = '20px Impact';
		writeText(582, 210, ctx, url.username, 3);
		url = url.avatarURL;
		if (!url) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
			return;
		}
		try {
			await request.get(url, callbackImage(p, ctx, 537, 75, 90, callback));
		} catch (err) {
			console.error(err);
			p.send('**🚫 | ' + p.msg.author.username + '**, could not grab the image', 3000);
		}
	} else if (/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(text)) {
		let url = text.match(/:[0-9]+>/gi);
		if (!url || !url[0]) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the emoji', 3000);
			return;
		}
		url = 'https://cdn.discordapp.com/emojis/' + url[0].slice(1, url[0].length - 1) + '.png';
		try {
			await request.get(url, callbackImage(p, ctx, 537, 75, 90, callback));
		} catch (err) {
			console.error(err);
			p.send('**🚫 | ' + p.msg.author.username + '**, could not grab the image', 3000);
		}
	} else {
		text = text.replace(/<a?:/gi, '');
		text = text.replace(/:[0-9]+>/gi, '');
		ctx.font = '30px Impact';
		if (ctx.measureText(text).width > 300) ctx.font = '15px Impact';
		let tempText = text.split(' ');
		text = '';
		for (let i = 0; i < tempText.length; i++) {
			if (ctx.measureText(text + tempText[i] + ' ').width > 300 && i > 0) text += '\n';
			text += tempText[i] + ' ';
		}
		if (ctx.measureText(text).width > 300 || text.split(/\r\n|\r|\n/).length > 3) {
			p.send('**🚫 | ' + p.msg.author.username + '**, The butterfly text is too long!', 3000);
			return;
		}

		writeText(582, 140, ctx, text, 3);
		callback();
	}
}

async function addPersonText(p, text, ctx, canvas, callback) {
	if (!text) {
		callback();
		return;
	}
	ctx.textAlign = 'center';
	if (p.global.isUser(text)) {
		let url = await p.fetch.getUser(text);
		if (!url) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
			return;
		}
		ctx.font = '20px Impact';
		writeText(270, 350, ctx, url.username, 3);
		url = url.avatarURL;
		if (!url) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
			return;
		}
		try {
			await request.get(url, callbackImage(p, ctx, 195, 170, 150, callback));
		} catch (err) {
			console.error(err);
			p.send('**🚫 | ' + p.msg.author.username + '**, could not grab the image', 3000);
		}
	} else if (/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(text)) {
		let url = text.match(/:[0-9]+>/gi);
		if (!url || !url[0]) {
			p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the emoji', 3000);
			return;
		}
		url = 'https://cdn.discordapp.com/emojis/' + url[0].slice(1, url[0].length - 1) + '.png';
		try {
			await request.get(url, callbackImage(p, ctx, 195, 170, 150, callback));
		} catch (err) {
			console.error(err);
			p.send('**🚫 | ' + p.msg.author.username + '**, could not grab the image', 3000);
		}
	} else {
		text = text.replace(/<a?:/gi, '');
		text = text.replace(/:[0-9]+>/gi, '');
		ctx.font = '30px Impact';
		if (ctx.measureText(text).width > 300) ctx.font = '15px Impact';
		let tempText = text.split(' ');
		text = '';
		for (let i = 0; i < tempText.length; i++) {
			if (ctx.measureText(text + tempText[i]).width > 300 && i > 0) text += '\n';
			text += tempText[i] + ' ';
		}
		if (ctx.measureText(text).width > 300) {
			p.send('**🚫 | ' + p.msg.author.username + '**, The person text is too long!', 3000);
			return;
		}

		writeText(270, 180, ctx, text, 3);
		callback();
	}
}

function callbackImage(p, ctx, x, y, size, callback) {
	return function (err, response, body) {
		if (!err && response.statusCode == 200) {
			let img = new Image();
			img.onload = function () {
				ctx.drawImage(img, x, y, size, size);
				callback();
			};
			img.onerror = function () {
				p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the image', 3000);
			};
			img.src = body;
		} else p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the image', 3000);
	};
}

function writeText(x, y, ctx, text, linewidth = 8) {
	ctx.lineWidth = linewidth;
	ctx.fillStyle = 'black';
	ctx.strokeText(text, x, y);
	ctx.fillStyle = 'white';
	ctx.fillText(text, x, y);
}
