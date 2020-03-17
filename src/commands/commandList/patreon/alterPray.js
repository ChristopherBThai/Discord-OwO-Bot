/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function(id,text,info){
	switch (id) {
		case '192692796841263104':
			return dalu(text,info);
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
