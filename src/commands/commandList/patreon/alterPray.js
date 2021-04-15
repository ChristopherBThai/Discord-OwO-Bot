/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function (id,text,info) {
	switch (id) {
		case '192692796841263104':
			return dalu(text, info);
		case '456598711590715403':
			return lexx(text, info);
		case '417350932662059009':
			return sky(text, info);
		default:
			return text;
	}
}

function dalu (text, info) {
	const color = 63996;
	const curseGif = "https://cdn.discordapp.com/attachments/630327294048600094/678523650739273728/foxsnow.gif";
	const prayGif = "https://cdn.discordapp.com/attachments/630327294048600094/678527424388005898/senkosan.gif";
	const prayEmoji = "<a:foxxobless:687509034311483450>";
	const curseEmoji = "<:foxxoeek:687509034726588445>";
	if (info.command == "pray") {
		if (info.user) {
			text = `${prayEmoji} **| Dalu** prays for **${info.user.username}**! The Fox Gods are in your favor!\n${blank} **|** you now have **${info.luck}**x more luck`;
		} else {
			text = `${prayEmoji} **| Dalu** prays... The Fox Gods are in your favor!\n${blank} **|** you now have **${info.luck}**x more luck`;
		}
		return {
			embed: {
				"description":text,
				"color":color,
				"thumbnail":{
					"url":prayGif
				}
			}
		}
	} else {
		if (info.user) {
			text = `${curseEmoji} **| Dalu** leaps at **${info.user.username}** and both fail!\n${blank} **|** you failed **${-1*info.luck}**x!`;
		} else {
			text = `${curseEmoji} **| Dalu** tries to do a big leap and fails horribly!\n${blank} **|** you failed **${-1*info.luck}**x!`;
		}
		return {
			embed: {
				"description":text,
				"color":color,
				"thumbnail":{
					"url":curseGif
				}
			}
		}
	}
}


function lexx (text, info) {
	const prayEmoji = "🙏";
	const curseEmoji = "👻";
	if (info.command == "pray") {
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
				"description": text,
				"color": 8240363,
				"thumbnail": {
					"url": "https://cdn.discordapp.com/attachments/696878982758531152/808528841529098260/BenderPray.gif"
				}
			}
		}
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
				"description": text,
				"color": 8240363,
				"thumbnail": {
					"url": "https://cdn.discordapp.com/attachments/696878982758531152/808638583644356618/Cursed.gif"
				}
			}
		}
	}
}

function sky (text, info) {
	const flower1 = "<:flower1:832180800543260683>";
	const flower2 = "<:flower2:832180800330006560>";
	const sunflower1 = "<:sunflower1:832180800363167775>";
	const sunflower2 = "<:sunflower2:832180800161316927>";
	const star = "<a:star:832180800442728539>";
	const spirit = "<a:spirit:832180799938756629>";
	const butterfly = "<a:butterfly:832180799989612565>";
	const potion = "<a:potion:832180800404717608>";
	if (info.command == "pray") {
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

