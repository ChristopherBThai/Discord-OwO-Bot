/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const _blank = '<:blank:427371936482328596>';

exports.alter = function (p, embed, opt) {
	switch (p.msg.author.id) {
		case '460987842961866762':
			return estee(p, embed, opt);
		default:
			return embed;
	}
};

function estee(p, embed, _opt) {
	embed.image = {
		url: 'https://i.imgur.com/SBwHXU8.gif',
	};
	return embed;
}
