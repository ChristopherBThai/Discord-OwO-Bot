/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function (p, id, text, info) {
	switch(id) {
		case '605994815317999635':
			return rhine(p, info);
		default:
			return text;
	}
}

function rhine (p, info) {
	const cashEmoji = '🏦';
	const embed = {
		color: 16758232,
		image: {
			url: "https://media.discordapp.net/attachments/886547029478768640/886950643074486272/rich_3.gif"
		},
		description: `${cashEmoji} **| ${info.user.username}**, you currently have **${info.money} cowoncy**!`
	}
	return { embed };
}
