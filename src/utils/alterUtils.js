/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const mysql = require('../botHandlers/mysqlHandler.js');
const global = require('./global.js');

exports.getAlterCommand = async function (
	dbName,
	user,
	type,
	replacers,
	appendText,
	forceEmbed,
	{ extraReplacers } = {}
) {
	const uid = await global.getUid(user.id);
	let sql;
	if (dbName === 'alterhunt' || dbName === 'alterbattle') {
		sql = `SELECT * FROM ${dbName} WHERE uid = ${uid} AND type = '${type}'`;
	} else {
		sql = `SELECT * FROM \`alter\` WHERE uid = ${uid} AND command = '${dbName}' AND type = '${type}'`;
	}
	const result = (await mysql.query(sql))[0];
	if (!result || !result.text) return;

	result.text += appendText || '';
	result.text = global.replacer(result.text, replacers);
	try {
		const extra = JSON.parse(result.extra);
		for (let i in extraReplacers) {
			if (extra[i]) {
				result.text = result.text.replace(extraReplacers[i], extra[i]);
			}
		}
	} catch (err) {
		/* no-op */
	}
	if (!forceEmbed && !result.isEmbed) {
		return result.text;
	}

	const content = {
		embed: {
			description: result.text,
			title: global.replacer(result.title, replacers),
			color: result.color || 1,
		},
	};
	if (result.sideImg) {
		content.embed.thumbnail = { url: result.sideImg };
	}
	if (result.footer) {
		content.embed.footer = { text: global.replacer(result.footer, replacers) };
	}
	if (result.bottomImg) {
		content.embed.image = { url: result.bottomImg };
	}
	if (result.author) {
		content.embed.author = {
			name: global.replacer(result.author, replacers),
			icon_url: result.showAvatar ? user.avatarURL : null,
		};
	}

	return content;
};
