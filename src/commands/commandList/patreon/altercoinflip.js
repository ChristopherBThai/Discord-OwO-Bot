/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.alter = function (id, text) {
	if (id == '220934553861226498') return geist(text);
	else return text;
};

function geist(text) {
	text = text.replace('<:tail:436677926398853120>', '<a:dtail:521261895395573760>');
	text = text.replace('<:head:436677933977960478>', '<a:dhead:521261895643299850>');
	text = text.replace('<a:coinflip:436677458339823636>', '<a:dcoin:521266344683896842>');
	text = text.replace('The coin spins...', 'He flips the fabled coin...');
	text = text.replace('you', 'he');
	var embed = {
		description: text,
		color: 6315775,
	};
	if (text.includes(' won ')) {
		embed.thumbnail = {
			url: 'https://cdn.discordapp.com/attachments/476656258527526922/522495882281877505/giphy_2.gif',
		};
	} else if (text.includes('lost it')) {
		embed.thumbnail = {
			url: 'https://cdn.discordapp.com/attachments/476656258527526922/521256113845567498/tenor_3.gif',
		};
	}
	return { embed };
}
