/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const blank = '<:blank:427371936482328596>';

exports.alter = function (p, id, text, info) {
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
			return checkReceive(p, text, info);
	}
};

function checkReceive(p, text, info) {
	info.receiver = true;
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
	const blossom = '<a:blossom2:1078625520419348481>';
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
			color: 11455218,
			image: {
				url: 'https://cdn.discordapp.com/attachments/921261347688308766/1032283209062416394/GIF-221019_175021.gif',
			},
			description:
				`<:snow1:1034776453348335646> **| ${info.to.username}** receives **${info.amount} Snowballs** <a:snow2:1034776454476603473> from **${info.from.username}**! <a:snow3:1034776452169728000><a:snow3:1034776452169728000>` +
				`\n<:snow4:1034776448759771176> **| ${info.to.username}**:Happy Winters Cutie!! <:snow6:1034776455491637258><:snow6:1034776455491637258>`,
		};
		return { embed };
	} else {
		const embed = {
			color: 11254221,
			image: {
				url: 'https://cdn.discordapp.com/attachments/921261347688308766/1032286989619314809/GIF-221019_190636.gif',
			},
			description:
				`<:snow1:1034776453348335646> **| ${info.from.username}** shares **${info.amount} Snowballs** <a:snow2:1034776454476603473> with **${info.to.username}**! <a:snow3:1034776452169728000><a:snow3:1034776452169728000>` +
				`\n<:snow4:1034776448759771176> **| ${info.from.username}** hopes you can make a cute **Snowman**<a:snow5:1034776450160676876> now!! <:snow6:1034776455491637258><:snow6:1034776455491637258>`,
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
