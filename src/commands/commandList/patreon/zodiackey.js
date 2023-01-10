/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const owner = '707939636835516457';
const data = 'zodiac';
const keys = {
	aquarius: {
		name: 'aquarius',
		emoji: '<:aquarius:798036174064975923>',
	},
	pisces: {
		name: 'pisces',
		emoji: '<:pisces:798036174345207839>',
	},
	aries: {
		name: 'aries',
		emoji: '<:aries:798036174236549131>',
	},
	taurus: {
		name: 'taurus',
		emoji: '<:taurus:798036174874607617>',
	},
	gemini: {
		name: 'gemini',
		emoji: '<:gemini:798036174643527680>',
	},
	cancer: {
		name: 'cancer',
		emoji: '<:cancer:798036274493259817>',
	},
	leo: {
		name: 'leo',
		emoji: '<:leo:798036174890860554>',
	},
	virgo: {
		name: 'virgo',
		emoji: '<:virgo:798036274359304263>',
	},
	libra: {
		name: 'libra',
		emoji: '<:libra:798036175007776838>',
	},
	scorpio: {
		name: 'scorpio',
		emoji: '<:scorpio:798036174731083786>',
	},
	sagittarius: {
		name: 'sagittarius',
		emoji: '<:sagittarius:798036174006124606>',
	},
	capricorn: {
		name: 'capricorn',
		emoji: '<:capricorn:798036174417297468>',
	},
};
const dataNames = [];
for (let key in keys) {
	dataNames.push(`${data}_${keys[key].name}`);
}

module.exports = new CommandInterface({
	alias: ['zodiackey', 'zk'],

	args: '[zodiac key name] {@user}',

	desc: 'Give a zodiac key to someone! You can only gain one if you receive it! There are 12 in total to collect: Aquarius, Pisces, Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius and Capricorn. This command was created by ?707939636835516457?',

	example: ['owo zodiackey scorpio @Direwolf'],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		if (p.args.length <= 0) {
			display(p);
			p.setCooldown(5);
		} else if (p.args.length == 1) {
			p.errorMsg(', Invalid arguments', 3000);
			p.setCooldown(5);
		} else {
			const key = keys[p.args[0].toLowerCase()];
			if (!key) {
				p.errorMsg(', Invalid key name', 3000);
				p.setCooldown(5);
				return;
			}

			let user = p.getMention(p.args[1]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild, p.args[1]);
				if (!user) {
					p.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					p.setCooldown(5);
					return;
				}
			}
			if (user.id == p.msg.author.id) {
				p.errorMsg(', You cannot give it yourself!!', 3000);
				p.setCooldown(5);
				return;
			}

			give(p, key, user);
		}
	},
});

async function display(p) {
	let counts = await p.redis.hmget('data_' + p.msg.author.id, dataNames);
	let text = `**${p.msg.author.username}**, you currently have:\n`;
	let hasKeys = false;
	let keyArray = Object.keys(keys);
	for (let i in keyArray) {
		if (counts[i] && counts[i] != '0') {
			const key = keys[keyArray[i]];
			const count = p.global.toSmallNum(parseInt(counts[i]));
			text += ` ${key.emoji}${count}`;
			hasKeys = true;
		}
	}
	if (hasKeys) {
		p.send(text);
	} else {
		p.errorMsg(', you do not have any zodiac keys.', 3000);
	}
	p.setCooldown(5);
}

async function give(p, key, user) {
	const dataName = `${data}_${key.name}`;
	if (p.msg.author.id != owner) {
		let result = await p.redis.hincrby('data_' + p.msg.author.id, dataName, -1);

		// Error checking
		if (result == null || result < 0) {
			if (result < 0) p.redis.hincrby('data_' + p.msg.author.id, dataName, 1);
			p.errorMsg(', you do not have any ' + key.name + ' keys to give! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.hincrby('data_' + user.id, dataName, 2);
	p.send(
		`${key.emoji} **| ${user.username}** has gained 2 ${key.name} keys from **${p.msg.author.username}**!`
	);
}
