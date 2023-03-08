/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const blank = '<:blank:427371936482328596>';

exports.alter = function (id, text, info) {
	switch (id) {
		case '456598711590715403':
			return lexx(text, info);
	}
	return text;
};

function lexx(text, info) {
	return {
		embed: {
			description:
				`<:owo:816240095735578655> **| ${info.author.username}** says: "${info.text}"\n` +
				`${blank} **|** The more times I type in the word **OwO**,\n` +
				`${blank} **|** the Faster I will become a Multi-Billionaire.`,
			color: 8240363,
			thumbnail: {
				url: 'https://cdn.discordapp.com/attachments/696878982758531152/827948228099965008/Professor.png',
			},
		},
	};
}
