/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const request = require('request');
const levels = require('../../../../utils/levels.js');

exports.display = async function (p, user, opt) {
	/* Construct json for POST request */
	let info = await generateJson(p, user, opt);
	info.password = process.env.GEN_PASS;

	/* Returns a promise to avoid callback hell */
	try {
		return new Promise((resolve, _reject) => {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/levelgen`,
					json: true,
					body: info,
				},
				(error, res, body) => {
					if (error) {
						resolve('');
						return;
					}
					if (res.statusCode == 200) resolve(body);
					else resolve('');
				}
			);
		});
	} catch (err) {
		console.err(err);
		return '';
	}
};

async function generateJson(p, user, opt) {
	let avatarURL = user.dynamicAvatarURL('png');
	avatarURL = avatarURL.replace(/\?[a-zA-Z0-9=?&]+/gi, '');

	let promises = [
		getRank(p, user, opt),
		getBackground(p, user),
		opt.guild
			? levels.getUserServerLevel(user.id, p.msg.channel.guild.id)
			: levels.getUserLevel(user.id),
		getInfo(p, user),
	];
	promises = await Promise.all(promises);

	let rank = promises[0];
	let background = promises[1];
	let level = promises[2];
	let userInfo = promises[3];

	let aboutme = userInfo.about;
	let accent = userInfo.accent;
	let accent2 = userInfo.accent2;
	let title = userInfo.title;

	level = { lvl: level.level, maxxp: level.maxxp, currentxp: level.currentxp };

	return {
		theme: {
			background: background.id,
			name_color: background.color,
			accent,
			accent2,
		},
		user: {
			avatarURL,
			name: user.username,
			discriminator: user.discriminator,
			title,
		},
		aboutme,
		level,
		rank,
	};
}

async function getRank(p, user, opt) {
	let rank;
	if (opt.guild)
		rank = p.global.toFancyNum(await levels.getUserServerRank(user.id, p.msg.channel.guild.id));
	else rank = p.global.toFancyNum(await levels.getUserRank(user.id));
	if (!rank || rank == 'NaN') rank = 'Last';
	else rank = '#' + rank;
	return {
		img: 'trophy.png',
		text: rank,
	};
}

/* eslint-disable-next-line */
function shortenInt(value) {
	let newValue = value;
	if (value >= 1000) {
		let suffixes = ['', 'K', 'M', 'B', 'T'];
		let suffixNum = Math.floor((('' + value).length - 1) / 3);
		let shortValue = value / Math.pow(10, suffixNum * 3);
		let offset = Math.pow(10, 2 - Math.floor(Math.log10(shortValue)));
		if (offset == 0) shortValue = Math.round(shortValue);
		else shortValue = Math.round(shortValue * offset) / offset;
		newValue = shortValue + suffixes[suffixNum];
	}
	return newValue;
}

async function getBackground(p, user) {
	let sql = `SELECT b.name_color,b.bid FROM user u INNER JOIN user_profile up ON u.uid = up.uid INNER JOIN backgrounds b ON up.bid = b.bid WHERE id = ${user.id};`;
	let result = await p.query(sql);
	if (!result[0]) return { id: 1 };
	return { id: result[0].bid, color: result[0].name_color };
}

async function getInfo(p, user) {
	let sql = `SELECT user_profile.* from user_profile INNER JOIN user ON user.uid = user_profile.uid WHERE user.id = ${user.id};`;
	let result = await p.query(sql);
	let info = {
		about: "I'm just a plain human.",
		title: 'An OwO Bot User',
	};
	if (result[0]) {
		if (result[0].about) info.about = result[0].about;
		if (result[0].accent) info.accent = result[0].accent;
		if (result[0].accent2) info.accent2 = result[0].accent2;
		if (result[0].title) info.title = result[0].title;
	}
	return info;
}
