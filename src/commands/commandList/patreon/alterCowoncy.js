/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const _blank = '<:blank:427371936482328596>';

exports.alter = function (p, id, text, info) {
	switch (id) {
		case '605994815317999635':
			return rhine(p, info);
		default:
			return text;
	}
};

function rhine(p, info) {
	const cashEmoji = '<a:blossom:1078625518817128448>';
	const embed = {
		color: 16762075,
		image: {
			url: 'https://media.discordapp.net/attachments/886547029478768640/969854561760206848/ezgif-3-7bbcfd4a0b.gif',
		},
		description: `${cashEmoji} **${info.user.username}** has 88 cherry blossoms with **${info.money} blossoms** in total!`,
	};
	return { embed };
}
