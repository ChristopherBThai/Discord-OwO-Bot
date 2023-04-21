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
		case '460987842961866762':
			return estee(p, info);
		case '692146302284202134':
			return leila(p, info);
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
		description: `${cashEmoji} **${info.user.username}** has 88 cherry blossoms trees with **${info.money} blossoms** in total!`,
	};
	return { embed };
}

function estee(p, info) {
	const pearl = '<:pearl:1079713076368121876>';
	const dot = '<a:dot:1079713078033260544>';
	const sparkle = '<a:sparkle:1079713078993760336>';
	return `${pearl} **|** 𝚢𝚘𝚞𝚛 𝚘𝚌𝚎𝚊𝚗 𝚒𝚜 𝚏𝚒𝚕𝚕𝚎𝚍 𝚠𝚒𝚝𝚑 **${info.money}** 𝚙𝚎𝚊𝚛𝚕𝚜 ${dot} ${sparkle}`;
}

function leila(p, info) {
	const star = '<:star:1079724334022676551>';
	const moon = '<:moon:1079724332047151176>';
	return (
		`${star} **| ${info.user.username}**, your galaxy has **__${info.money}__** **stars!**` +
		`\n${p.config.emoji.blank} **|** You're the star in my galaxy ${moon}`
	);
}
