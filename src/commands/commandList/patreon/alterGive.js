/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const alterUtils = require('../../../utils/alterUtils.js');

const blank = '<:blank:427371936482328596>';

exports.alter = async function (p, id, text, info) {
	const result = await checkDb(p, info);
	if (result) return result;
	if (
		info.senderlimit ||
		info.senderoverlimit ||
		info.receivelimit ||
		info.receiveoverlimit ||
		info.none
	) {
		return;
	}
	switch (id) {
		case '456598711590715403':
			return lexx(p, info);
		case '605994815317999635':
			return rhine(p, info);
		case '379213399973953537':
			return king(p, info);
		case '816005571575808000':
			return jayyy(p, info);
		case '692146302284202134':
			return leila(p, info);
		default:
			return await checkReceive(p, text, info);
	}
};

async function checkReceive(p, text, info) {
	info.receiver = true;
	const result = await checkDb(p, info);
	if (result) return result;
	switch (info.to.id) {
		case '816005571575808000':
			return jayyy(p, info);
		case '605994815317999635':
			return rhine(p, info);
		case '692146302284202134':
			return leila(p, info);
		default:
			return text;
	}
}

function checkDb(p, info) {
	let type, replacers;
	let user = info.from;
	if (info.receiver) {
		type = 'receive';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			amount: info.amount,
		};
		user = info.to;
	} else if (info.none) {
		type = 'none';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			amount: info.amount,
		};
	} else if (info.senderlimit) {
		type = 'senderlimit';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			limit: info.limit,
			limit_diff: info.limit_diff,
			amount: info.amount,
		};
	} else if (info.senderoverlimit) {
		type = 'senderoverlimit';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			limit: info.limit,
			amount: info.amount,
		};
	} else if (info.receivelimit) {
		type = 'receivelimit';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			limit: info.limit,
			limit_diff: info.limit_diff,
			amount: info.amount,
		};
	} else if (info.receiveoverlimit) {
		type = 'receiveoverlimit';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			limit: info.limit,
			amount: info.amount,
		};
	} else {
		type = 'give';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
			amount: info.amount,
		};
	}

	return alterUtils.getAlterCommand('give', user, type, replacers);
}

function lexx(p, info) {
	const embed = {
		color: p.config.embed_color,
		image: {
			url: 'https://cdn.discordapp.com/attachments/696878982758531152/838655133638328320/TakeMyMoney.png',
		},
		description:
			`💰 **|** **${info.from.username}** says: "Take My Money",` +
			`\n${blank} **|** sent **${info.amount}** cowoncy` +
			`\n${blank} **|** to **${info.to.username}**`,
	};
	return { embed };
}

function rhine(p, info) {
	const smile = '<a:smile:1078625522839457924>';
	const blossom = '<a:rhn_cherrytree:1124358034848743555>';
	const thanks = '<a:thank:1078625521778298901>';
	let embed;
	if (info.receiver) {
		embed = {
			color: 16762075,
			image: {
				url: 'https://media.discordapp.net/attachments/826119648868040775/1060107451321569280/ezgif-4-44fc74e5e7.gif',
			},
			description:
				`${blossom} **${info.to.username}** received a cherry blossoms tree with **${info.amount} blossoms** in her garden!` +
				`\n${thanks} "Thank you so much, **${info.from.username}**!"`,
		};
	} else {
		embed = {
			color: 16762075,
			image: {
				url: 'https://media.discordapp.net/attachments/826119648868040775/1060105165945970719/main-qimg-4ebf09188c61866237c4420e1ea7cd2f.gif',
			},
			description:
				`${smile} "Hi, **${info.to.username}**!"` +
				`\n${blossom} **${info.from.username}** planted a cherry blossoms tree in your garden and it now has **${info.amount} blossoms** on it!`,
		};
	}
	return { embed };
}

function king(p, info) {
	const embed = {
		color: 1245180,
		image: {
			url: 'https://media.discordapp.net/attachments/775674852303700008/962756882949341204/204180c6-c717-46d0-a1e2-9062dbc2ad03-1-1-1.png',
		},
		description:
			`📜 **|** **${info.from.username}** says: "When We Have No Money, We Got No Power"` +
			`\n💰 **|** sent **${info.amount} uwu!**` +
			`\n🚀 **|** to **${info.to.username}**`,
	};
	return { embed };
}

function jayyy(p, info) {
	if (info.receiver) {
		const embed = {
			color: 15509716,
			image: {
				url: 'https://cdn.discordapp.com/attachments/921261347688308766/1103640755291037767/20230430_213350.gif',
			},
			description:
				`<:heart:1120280184684294164> **| ${info.to.username}** receives **${info.amount} Blossoms** <:flower:1120280186051625020> from **${info.from.username}**! <:heart2:1120280187389620275><:heart2:1120280187389620275>` +
				`\n<:heart3:1120280182595538954> **| ${info.to.username}** hopes these **Blossoms** bring serenity in you!!<a:bud:1120280188899557476><a:bud:1120280188899557476>`,
		};
		return { embed };
	} else {
		const embed = {
			color: 15509716,
			image: {
				url: 'https://cdn.discordapp.com/attachments/921261347688308766/1103640366109950002/20230504_160739_1.gif',
			},
			description:
				`<:heart:1120280184684294164> **| ${info.from.username}** shares **${info.amount} Blossoms** <:flower:1120280186051625020> with **${info.to.username}**! <:heart2:1120280187389620275><:heart2:1120280187389620275>` +
				`\n<:heart3:1120280182595538954> **| ${info.from.username}** hopes these **Blossoms** bring serenity in you!!<a:bud:1120280188899557476><a:bud:1120280188899557476>`,
		};
		return { embed };
	}
}

function leila(p, info) {
	const star1 = '<:star1:1079721491148587028>';
	const star2 = '<:star2:1079721494520811520>';
	const star3 = '<:star3:1079721493564510278>';
	const sparkle1 = '<a:sparkle:1079721492587229204>';
	const sparkle2 = '<a:sparkle2:1079721490108387358>';

	if (info.receiver) {
		const msg =
			`${star1} **| ${info.from.username}** just sent ${star3} **${info.amount} stars** to **${info.to.username}**` +
			`\n${sparkle2} **|** Thank you for completing my galaxy ${sparkle2}`;
		return msg;
	} else {
		const msg =
			`${star1} **| ${info.from.username}** just sent **${star2} ${info.amount} stars** to **${info.to.username}**!` +
			`\n${sparkle1} **|** You're a part of my galaxy ${sparkle1}`;
		return msg;
	}
}
