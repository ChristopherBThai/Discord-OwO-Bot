/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const fs = require('fs');
const request = require('request').defaults({ encoding: null });
const { createCanvas, Image } = require('canvas');
const font = 'Impact';

exports.loadBackground = async function (file, callback) {
	fs.readFile(file, function (err, image) {
		if (err) {
			console.error('Could not grab drake.jpg [drake.js|execute]');
			callback(true);
			return;
		}
		let img = new Image();
		img.src = image;
		let canvas = new createCanvas(img.width, img.height);
		canvas.backgroundColor = 'white';
		let ctx = canvas.getContext('2d');
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.drawImage(img, 0, 0, img.width, img.height);
		callback(false, ctx, canvas, img);
	});
};
exports.addText = async function (args, p, ctx, canvas, callback) {
	let text = args.text;
	if (!text) {
		callback();
		return;
	}
	if (p.global.isUser(text)) {
		if (args.ifImage?.x) args = { ...args, x: args.x + args.ifImage.x };
		if (args.ifImage?.y) args = { ...args, y: args.y + args.ifImage.y };
		addUser(args, p, ctx, canvas, callback);
	} else if (/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi.test(text)) {
		if (args.ifImage?.x) args = { ...args, x: args.x + args.ifImage.x };
		if (args.ifImage?.y) args = { ...args, y: args.y + args.ifImage.y };
		addEmoji(args, p, ctx, canvas, callback);
	} else {
		addText(args, p, ctx, canvas, callback);
	}
};

async function addUser(args, p, ctx, canvas, callback) {
	let text = args.text;
	let url = await p.getMention(text);
	if (!url) {
		p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
		return;
	}

	ctx.save();

	const fontSize = args.imageFontSize || 20;
	ctx.font = fontSize + 'px ' + (args.font ? args.font : font);
	let x = args.x + args.width / 2 - args.imageSize / 2;
	let y = args.y - args.imageSize / 2;
	if (args.imageX) x = args.imageX;
	if (args.imageY) y = args.imageY;

	ctx.fillStyle = args.color;
	ctx.textAlign = 'center';
	ctx.textBaseLine = 'top';
	if (args.stroke) {
		ctx.lineWidth = args.stroke;
		ctx.fillStyle = 'black';
		ctx.strokeText(url.username, x + args.imageSize / 2, y + args.imageSize + 15);
		ctx.fillStyle = 'white';
	}
	ctx.fillText(url.username, x + args.imageSize / 2, y + args.imageSize + 15);

	ctx.restore();

	url = url.avatarURL.replace('.jpg', '.png').replace('.gif', '.png');
	if (!url) {
		p.send('**🚫 | ' + p.msg.author.username + '**, I could not find that user', 3000);
		return;
	}

	try {
		await request.get(url, callbackImage(p, ctx, x, y, args.imageSize, callback));
	} catch (err) {
		console.error(err);
		p.send('**🚫 | ' + p.msg.author.username + '**, could not grab the image', 3000);
	}
}

async function addEmoji(args, p, ctx, canvas, callback) {
	let text = args.text;
	let url = text.match(/:[0-9]+>/gi);
	if (!url || !url[0]) {
		p.send('**🚫 | ' + p.msg.author.username + '**, I could not grab the emoji', 3000);
		return;
	}
	url = 'https://cdn.discordapp.com/emojis/' + url[0].slice(1, url[0].length - 1) + '.png';
	let x = args.x + args.width / 2 - args.imageSize / 2;
	let y = args.y - args.imageSize / 2;
	if (args.imageX) x = args.imageX;
	if (args.imageY) y = args.imageY;

	try {
		request.get(url, callbackImage(p, ctx, x, y, args.imageSize, callback));
	} catch (err) {
		console.error(err);
		p.send('**🚫 | ' + p.msg.author.username + '**, could not grab the image', 3000);
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
		} else console.error(err);
	};
}

function addText(args, p, ctx, canvas, callback) {
	ctx.save();

	let text = args.text;
	text = text.replace(/<a?:/gi, '');
	text = text.replace(/:[0-9]+>/gi, '');
	//Check if we need to downsize font
	ctx.font = args.size + 'px ' + (args.font ? args.font : font);
	if (ctx.measureText(text).width > args.textWidth)
		ctx.font = args.size - 10 + 'px ' + (args.font ? args.font : font);

	//Format the text with new lines
	let tempText = text.split(' ');
	text = '';
	for (var i = 0; i < tempText.length; i++) {
		if (ctx.measureText(text + tempText[i] + ' ').width > args.width && i > 0) text += '\n';
		text += tempText[i] + ' ';
	}

	//Check if it will fit
	let measure = ctx.measureText(text);
	let height = Math.abs(measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent);
	if (measure.width > args.width || height > args.height) {
		p.send('**🚫 | ' + p.msg.author.username + '**, The text is too long!', 3000);
		return;
	}

	var x = args.x;
	var y = args.y;
	if (args.align == 'center') {
		ctx.textAlign = 'center';
		x += args.width / 2;
	}
	if (args.stroke) {
		ctx.lineWidth = args.stroke;
		ctx.fillStyle = 'black';
		ctx.strokeText(text, x, y - height / 2);
		ctx.fillStyle = 'white';
	} else ctx.fillStyle = args.color;
	ctx.fillText(text, x, y - height / 2);
	// ctx.rect(x-((args.align=="center")?args.width/2:0),y-(args.height/2),args.width,args.height);
	// ctx.stroke();

	ctx.restore();
	callback();
}

/* eslint-disable-next-line */
function addSimpleText(x, y, ctx, text, color) {
	ctx.save();
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
	ctx.restore();
}
