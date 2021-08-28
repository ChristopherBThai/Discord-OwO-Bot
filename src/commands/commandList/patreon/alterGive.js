/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function(p, id, text, info){
	switch(id){
		case '456598711590715403':
			return lexx(p, info);
		default:
			return text;
	}
}

function lexx(p, info) {
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
