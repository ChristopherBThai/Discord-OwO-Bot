/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function (p, id, text, info) {
	switch(id) {
		case '456598711590715403':
			return lexx(p, info);
		case '605994815317999635':
			return rhine(p, info);
		default:
			return text;
	}
}

function lexx (p, info) {
	const embed = {
		color: p.config.embed_color,
		image: {
			url: "https://cdn.discordapp.com/attachments/696878982758531152/838655133638328320/TakeMyMoney.png"
		},
		description: `💰 **|** **${info.from.username}** says: "Take My Money",`
			+ `\n${blank} **|** sent **${info.amount}** cowoncy`
			+ `\n${blank} **|** to **${info.to.username}**`
	}
	return { embed };
}

function rhine (p, info) {
	const embed = {
		color: 16758232,
		image: {
			url: "https://media.discordapp.net/attachments/887582241243422721/889401388633833472/lines-stars-757683.gif"
		},
		description: `💬 **|** **${info.from.username}** says: "Save money and money will save you."`
			+ `\n💵 **|** sent **${info.amount} cowoncy**`
			+ `\n🌸 **|** to **${info.to.username}**`
	}
	return { embed };
}
