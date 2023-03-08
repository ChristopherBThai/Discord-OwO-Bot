/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const request = require('request');
const maxInt = 16777215;
const Vibrant = require('node-vibrant');
const colorEmoji = '🎨';
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';

module.exports = new CommandInterface({
	alias: ['color', 'randcolor', 'colour', 'randcolour'],

	args: '{@user|role @user|RGB|HEX|HSL}',

	desc: 'Use the command without any parameters to get a random color!\n\nYou can also tag a user as an argument to parse prominent colors from their avatar!\n\nYou can view color roles by adding the text "role" and tagging a user\n\nYou can also view specific colors with RGB, HEX, or HSL values!',

	example: [
		'owo color',
		'owo color @user',
		'owo color role @user',
		'owo color #FFFFFF',
		'owo color 255,255,255',
		'owo color S:50% L:50%',
	],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['utility'],

	cooldown: 4000,

	execute: async function (p) {
		let color, title, colors;

		// No argument = random color
		if (!p.args.length) {
			color = randColor();
			title = ', here is your random color!';
		} else {
			let args = p.args.join(' ').split(/[\s,]+/gi);
			let args2 = p.args.join('').replace('#', '').toUpperCase();
			title = ', here is your color for "' + p.args.join(' ') + '"';

			//parse user's avatar color
			if (
				args.length == 1 &&
				(p.global.isUser(p.args[0]) || (p.global.isInt(p.args[0]) && parseInt(p.args[0]) > maxInt))
			) {
				let id = p.args[0].match(/[0-9]+/)[0];
				let user = await p.fetch.getUser(id);
				if (!user) {
					p.errorMsg(', That user does not exist!', 3000);
					return;
				}
				let url = user.dynamicAvatarURL(null, 32);
				let palette;
				try {
					palette = await Vibrant.from(url).getPalette();
				} catch (err) {
					p.errorMsg(
						'... sowwy, I couldnt parse the average color of ' + user.username + "'s profile!",
						3000
					);
				}
				title = ', here is the prominent color for ' + user.username + "'s profile picture!";
				colors = [];
				for (let i in palette) {
					let values = parseRGB(palette[i]._rgb);
					values.name = i;
					values.population = palette[i]._population;
					values.avatar = user.dynamicAvatarURL('png', 256);
					colors.push(values);
				}

				//user role color
			} else if (
				args.length == 2 &&
				['r', 'role'].includes(args[0].toLowerCase()) &&
				(p.global.isUser(p.args[1]) || (p.global.isInt(p.args[1]) && parseInt(p.args[1]) > maxInt))
			) {
				let id = p.args[1].match(/[0-9]+/)[0];
				let user = await p.getMention(id);
				if (!user) {
					p.errorMsg(', That user does not exist!', 3000);
					return;
				}
				user = await p.fetch.getMember(p.msg.channel.guild, user.id);
				color = p.global.getRoleColor(user);
				if (!color) {
					p.errorMsg(', That user does not have a role color!', 3000);
					return;
				}
				title = ', here is the role color for **' + user.username + '**';
				color = parseHex(color.replace('#', '').toUpperCase().padStart(6, '0'));

				//randomHSL
			} else if (p.args.join(' ').includes('%')) {
				color = randHSL(p, p.args);

				//rgb values
			} else if (args.length == 3 && args.every(p.global.isInt)) {
				color = parseRGB(args);

				//int values
			} else if (p.args.length == 1 && p.global.isInt(p.args[0])) {
				color = parseIntValue(p.args[0]);

				//hex values
			} else if (args2.length == 6) {
				color = parseHex(args2);

				// role mention
			} else if (
				p.msg.roleMentions.length &&
				(args.length == 1 || (args.length == 2 && ['r', 'role'].includes(args[0].toLowerCase())))
			) {
				let role = p.msg.channel.guild.roles.get(p.msg.roleMentions[0]);
				color = parseIntValue(role.color);
			}
		}

		if (
			(!colors || colors.length == 0) &&
			(!color ||
				color.r > 255 ||
				color.g > 255 ||
				color.b > 255 ||
				!/[0-9,A-F]{6}/g.test(color.hex))
		) {
			p.errorMsg(", that's an invalid color!", 3000);
			return;
		}

		if (!colors) {
			let embed = await constructEmbed(color);
			await p.send({
				content: colorEmoji + ' **| ' + p.msg.author.username + '**' + title,
				embed,
			});
		} else {
			let page = 0;
			let embed = await constructEmbed(colors[page]);
			embed.footer = {
				text: colors[page].name + ' - population: ' + colors[page].population,
			};
			embed.image = {
				url: colors[page].avatar,
			};
			let msg = await p.send({
				content: colorEmoji + ' **| ' + p.msg.author.username + '**' + title,
				embed,
			});
			await msg.addReaction(prevPageEmoji);
			await msg.addReaction(nextPageEmoji);

			let filter = (emoji, userID) =>
				[nextPageEmoji, prevPageEmoji].includes(emoji.name) && userID == p.msg.author.id;
			let collector = p.reactionCollector.create(msg, filter, {
				time: 900000,
				idle: 120000,
			});

			collector.on('collect', async function (emoji) {
				if (emoji.name === nextPageEmoji) {
					if (page + 1 < colors.length) page++;
					else page = 0;
					embed = await constructEmbed(colors[page]);
					embed.footer = {
						text: colors[page].name + ' - population: ' + colors[page].population,
					};
					embed.image = {
						url: colors[page].avatar,
					};
					await msg.edit({
						content: colorEmoji + ' **| ' + p.msg.author.username + '**' + title,
						embed,
					});
				} else if (emoji.name === prevPageEmoji) {
					if (page > 0) page--;
					else page = colors.length - 1;
					embed = await constructEmbed(colors[page]);
					embed.footer = {
						text: colors[page].name + ' - population: ' + colors[page].population,
					};
					embed.image = {
						url: colors[page].avatar,
					};
					await msg.edit({
						content: colorEmoji + ' **| ' + p.msg.author.username + '**' + title,
						embed,
					});
				}
			});

			collector.on('end', async function (_collected) {
				await msg.edit({ content: 'This message is now inactive', embed });
			});
		}
	},
});

async function constructEmbed(color) {
	let description =
		'**HEX:** `' +
		color.hex +
		'`\n' +
		'**RGB:** `' +
		color.rgb +
		'`\n' +
		'**INT:** `' +
		color.intValue +
		'`\n' +
		'**HSL:** `' +
		color.hsl +
		'`';
	let uuid = await generateImage(color);
	let embed = {
		description,
		color: color.intValue,
		thumbnail: {
			url: `${process.env.GEN_HOST}/color/${uuid}`,
		},
	};
	return embed;
}

function parseIntValue(intValue) {
	intValue = parseInt(intValue);
	if (intValue > maxInt) return;
	let hex = intValue.toString(16).toUpperCase();
	if (hex.length > 6) return;
	hex = '0'.repeat(6 - hex.length) + hex;

	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	let { hsl, h, s, l } = rgbToHsl(r, g, b);

	return {
		r,
		g,
		b,
		hex: '#' + hex,
		intValue,
		rgb: r + ',' + g + ',' + b,
		h,
		s,
		l,
		hsl,
	};
}

function parseHex(hex) {
	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	let intValue = parseInt(hex.toLowerCase(), 16);

	let { hsl, h, s, l } = rgbToHsl(r, g, b);

	return {
		r,
		g,
		b,
		hex: '#' + hex,
		intValue,
		rgb: r + ',' + g + ',' + b,
		h,
		s,
		l,
		hsl,
	};
}

function parseRGB(rgb) {
	let r = parseInt(rgb[0]);
	let g = parseInt(rgb[1]);
	let b = parseInt(rgb[2]);

	let hex = toHex(r) + toHex(g) + toHex(b);

	let intValue = parseInt(hex.toLowerCase(), 16);

	let { hsl, h, s, l } = rgbToHsl(r, g, b);

	return {
		r,
		g,
		b,
		hex: '#' + hex,
		intValue,
		rgb: r + ',' + g + ',' + b,
		h,
		s,
		l,
		hsl,
	};
}

function randColor() {
	let r = Math.floor(Math.random() * 256);
	let g = Math.floor(Math.random() * 256);
	let b = Math.floor(Math.random() * 256);

	let hex = toHex(r) + toHex(g) + toHex(b);

	let intValue = parseInt(hex.toLowerCase(), 16);

	let { hsl, h, s, l } = rgbToHsl(r, g, b);

	return {
		r,
		g,
		b,
		hex: '#' + hex,
		intValue,
		rgb: r + ',' + g + ',' + b,
		h,
		s,
		l,
		hsl,
	};
}

function randHSL(p, args) {
	let h, s, l;
	let parsePercent = function (perc) {
		perc = parseFloat(perc.replace(/[HSVL%]/gi, ''));
		if (!perc) return -1;
		perc /= 100;
		if (perc > 1) perc = 1;
		if (perc < 0) perc = 0;
		return perc;
	};
	for (let i in args) {
		let arg = args[i].replace(/[:=]/gi, '').toUpperCase();
		switch (arg.charAt(0)) {
			case 'H':
				h = parsePercent(arg);
				if (h == -1) return;
				break;
			case 'S':
				s = parsePercent(arg);
				if (s == -1) return;
				break;
			case 'V':
				l = parsePercent(arg);
				if (l == -1) return;
				break;
			case 'L':
				l = parsePercent(arg);
				if (l == -1) return;
				break;
			default:
				return;
		}
	}

	let goldenRatio = 0.618033988749895;
	if (h === undefined) h = (Math.random() + goldenRatio) % 1;
	if (s === undefined) s = Math.random();
	if (l === undefined) l = Math.random();
	let { r, g, b } = hslToRgb(h, s, l);
	let hex = toHex(r) + toHex(g) + toHex(b);
	let intValue = parseInt(hex.toLowerCase(), 16);
	let hsl = Math.round(h * 100) + '%, ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%';
	return {
		r,
		g,
		b,
		hex: '#' + hex,
		intValue,
		rgb: r + ',' + g + ',' + b,
		h,
		s,
		l,
		hsl,
	};
}

function toHex(num) {
	let hex = num.toString(16).toUpperCase();
	if (hex.length < 2) {
		hex = '0' + hex;
	}
	return hex;
}
function rgbToHsl(r, g, b) {
	(r /= 255), (g /= 255), (b /= 255);
	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	let hsl = Math.round(h * 100) + '%, ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%';
	return { h, s, l, hsl };
}

function hslToRgb(h, s, l) {
	let r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		let hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

function generateImage(color) {
	/* Construct json for POST request */
	let info = color;
	info.password = process.env.GEN_PASS;

	/* Returns a promise to avoid callback hell */
	try {
		return new Promise((resolve, _reject) => {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/colorgen`,
					json: true,
					body: info,
				},
				(error, res, body) => {
					if (error) {
						resolve('');
						return;
					}
					if (res.statusCode == 200) resolve(body);
					else resolve('');
				}
			);
		});
	} catch (err) {
		return '';
	}
}
