/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const blank = '<:blank:427371936482328596>';
const emoji = '🙏';
const curseEmoji = '👻';

exports.alter = function (id, text, info) {
	switch (id) {
		case '192692796841263104':
			return dalu(text, info);
		case '456598711590715403':
			return lexx(text, info);
		case '417350932662059009':
			return sky(text, info);
		case '707939636835516457':
			return dire(text, info);
		case '856036736970260490':
			return lapiis(text, info);
		case '460987842961866762':
			return estee(text, info);
		case '683742950668501001':
			return dadada(text, info);
		default:
			return text;
	}
};

function dalu(text, info) {
	const color = 63996;
	const curseGif =
		'https://cdn.discordapp.com/attachments/630327294048600094/678523650739273728/foxsnow.gif';
	const prayGif =
		'https://cdn.discordapp.com/attachments/630327294048600094/678527424388005898/senkosan.gif';
	const prayEmoji = '<a:foxxobless:687509034311483450>';
	const curseEmoji = '<:foxxoeek:687509034726588445>';
	if (info.command == 'pray') {
		if (info.user) {
			text = `${prayEmoji} **| Dalu** prays for **${info.user.username}**! The Fox Gods are in your favor!\n${blank} **|** you now have **${info.luck}**x more luck`;
		} else {
			text = `${prayEmoji} **| Dalu** prays... The Fox Gods are in your favor!\n${blank} **|** you now have **${info.luck}**x more luck`;
		}
		return {
			embed: {
				description: text,
				color: color,
				thumbnail: {
					url: prayGif,
				},
			},
		};
	} else {
		if (info.user) {
			text = `${curseEmoji} **| Dalu** leaps at **${
				info.user.username
			}** and both fail!\n${blank} **|** you failed **${-1 * info.luck}**x!`;
		} else {
			text = `${curseEmoji} **| Dalu** tries to do a big leap and fails horribly!\n${blank} **|** you failed **${
				-1 * info.luck
			}**x!`;
		}
		return {
			embed: {
				description: text,
				color: color,
				thumbnail: {
					url: curseGif,
				},
			},
		};
	}
}

function lexx(text, info) {
	const prayEmoji = '🙏';
	const curseEmoji = '👻';
	if (info.command == 'pray') {
		if (info.user) {
			text = `${prayEmoji} **| ${info.author.username}** prays to **${info.user.username}**\n`;
			text += `${blank} **|** you have **${info.luck}**\n`;
			text += `${blank} **|** luck Points so far!`;
		} else {
			text = `${prayEmoji} **| ${info.author.username}** prays and in return, you\n`;
			text += `${blank} **|** have accumulated **${info.luck}**\n`;
			text += `${blank} **|** luck Points so far!`;
		}
		return {
			embed: {
				description: text,
				color: 8240363,
				thumbnail: {
					url: 'https://cdn.discordapp.com/attachments/696878982758531152/808528841529098260/BenderPray.gif',
				},
			},
		};
	} else {
		if (info.user) {
			text = `${curseEmoji} **| ${info.author.username}** curses **${info.user.username}**\n`;
			text += `${blank} **|** you have accumulated **${info.luck}**\n`;
			text += `${blank} **|** luck Points so far!`;
		} else {
			text = `${curseEmoji} **| ${info.author.username}** being forever Cursed, you\n`;
			text += `${blank} **|** have accumulated **${info.luck}**\n`;
			text += `${blank} **|** luck Points so far!`;
		}
		return {
			embed: {
				description: text,
				color: 8240363,
				thumbnail: {
					url: 'https://cdn.discordapp.com/attachments/696878982758531152/1094391576001786067/Professor_Farnsworth.png',
				},
			},
		};
	}
}

function sky(text, info) {
	const flower1 = '<:flower1:832180800543260683>';
	const flower2 = '<:flower2:832180800330006560>';
	const sunflower1 = '<:sunflower1:832180800363167775>';
	const sunflower2 = '<:sunflower2:832180800161316927>';
	const star = '<a:star:832180800442728539>';
	const spirit = '<a:spirit:832180799938756629>';
	const butterfly = '<a:butterfly:832180799989612565>';
	const potion = '<a:potion:832180800404717608>';
	if (info.command == 'pray') {
		if (info.user) {
			text = `${butterfly} **|** ${flower1} Feeling awfully kind, **${info.author.username}** prays for **${info.user.username}**!\n`;
			text += `${blank} **|** you have **${info.luck}** luck points! ${sunflower2}`;
		} else {
			text = `${star} **|** ${sunflower1} **${info.author.username}** prays to her lucky stars..\n`;
			text += `${blank} **|** You have **${info.luck}** luck points! ${flower2}`;
		}
	} else {
		if (info.user) {
			text = `${potion} **|** ${flower1} **${info.author.username}** gleefully puts a curse on **${info.user.username}**!\n`;
			text += `${blank} **|** You have **${info.luck}** luck points! ${sunflower2}`;
		} else {
			text = `${spirit} **|** ${sunflower1} Whoopsies! **${info.author.username}** has accidently cursed herself!\n`;
			text += `${blank} **|** You have **${info.luck}** luck points! ${flower2}`;
		}
	}
	return text;
}

function dire(text, info) {
	let sideImg, bottomImg, title, color, desc;

	if (info.command == 'pray') {
		sideImg =
			'https://cdn.discordapp.com/attachments/771398927912009738/893263637857308732/image0.gif';
		bottomImg =
			'https://cdn.discordapp.com/attachments/771398927912009738/893263640818483280/image1.gif';
		color = 16514296;
		title = 'First Guild Master, Mavis, invokes Fairy Law!';
		if (info.user) {
			desc =
				`<a:flame_white:901377312065482752> **| ${info.author.username}**, invokes **Fairy Law** - one of FairyTail's **Three Grand Spells**!\n` +
				`<a:sparkle:901377312174510130> **| ${info.user.username}** envelops the entire area in light and inflicts massive damage to those who they perceive as foes in their heart...\n` +
				`<a:luck:901377312493277214> **| ${info.author.username}** has **${info.luck} luck points**!`;
		} else {
			desc =
				`<a:flame_white:901377312065482752> **| ${info.author.username}**, invokes **Fairy Law** - one of FairyTail's **Three Grand Spells**!\n` +
				`<a:luck:901377312493277214> **| ${info.author.username}** has **${info.luck} luck points**!`;
		}
	} else {
		sideImg =
			'https://cdn.discordapp.com/attachments/771398927912009738/893263444738998312/image0.gif';
		bottomImg =
			'https://cdn.discordapp.com/attachments/771398927912009738/893263445145841744/image1.gif';
		color = 1;
		title = 'The Emperor Spriggan, Zeref, is inflicted with the Contradictory Curse!';
		if (info.user) {
			desc =
				`<a:flame_black:901377311859957781> **| ${info.author.username}**, with the help of Ankhseram, inflicts the **Curse of Contradiction**!\n` +
				`<a:flame_black2:901377312157736961> **| ${info.user.username}** exudes black miasma killing all life it comes into contact with and will live in despair forever...\n` +
				`<a:luck:901377312493277214> **| ${info.author.username}** has **${info.luck} luck points**!`;
		} else {
			desc =
				`<a:flame_black:901377311859957781> **| ${info.author.username}**, with the help of Ankhseram, inflicts the **Curse of Contradiction**!\n` +
				`<a:luck:901377312493277214> **| ${info.author.username}** has **${info.luck} luck points**!`;
		}
	}
	return {
		embed: {
			description: desc,
			color: color,
			thumbnail: { url: sideImg },
			image: { url: bottomImg },
			title: title,
		},
	};
}

function lapiis(text, info) {
	if (info.command == 'pray') {
		let desc = text.replace(emoji, '<a:heart:965019226228269086>');
		return {
			embed: {
				description: desc,
				thumbnail: {
					url: 'https://c.tenor.com/HKIpSkjda9kAAAAi/tkthao219-bubududu.gif',
				},
				color: 16714382,
			},
		};
	} else {
		let desc = text.replace(curseEmoji, '<a:cry:993743688687681578>');
		return {
			embed: {
				description: desc,
				thumbnail: {
					url: 'https://c.tenor.com/KkDb5-sgVZkAAAAj/sad-anxious.gif',
				},
				color: 2395604,
			},
		};
	}
}

function estee(text, info) {
	if (info.command == 'pray') {
		let desc;
		if (info.user) {
			desc = `<a:heart:976025908290924544> **| ${info.author.username}** Enchants a little love spell on **${info.user}**, sleep my love.\n${blank} **|** Angels have blessed you with ${info.luck} sweet dreams!`;
		} else {
			desc = `<a:heart:976025908290924544> **| ${info.author.username}** Enchants a little love spell, sleep my love.\n${blank} **|** Angels have blessed you with ${info.luck} sweet dreams!`;
		}
		return {
			embed: {
				description: desc,
				image: {
					url: 'https://cdn.discordapp.com/attachments/810961856977174539/973157453002833960/output-onlinegiftools_5.gif',
				},
				color: 16777215,
			},
		};
	}
	return text;
}

function dadada(text, info) {
	if (info.command == 'curse') {
		let desc;
		if (info.user) {
			desc = `<a:curse1:993779469766623252> **| ${info.author.username}** puts a curse on **${info.user}**! You should be careful...<a:curse2:993779471230439504>\n<a:curse3:993779472140611655> **|** You have ${info.luck} luck point(s)! <a:curse4:993779473013026906>`;
		} else {
			desc = `<a:curse1:993779469766623252> **| ${info.author.username}** puts a curse! You should be careful...<a:curse2:993779471230439504>\n<a:curse3:993779472140611655> **|** You have ${info.luck} luck point(s)! <a:curse4:993779473013026906>`;
		}
		return {
			embed: {
				description: desc,
				image: { url: 'https://data.whicdn.com/images/354158989/original.gif' },
				color: 8240363,
			},
		};
	}
	return text;
}
