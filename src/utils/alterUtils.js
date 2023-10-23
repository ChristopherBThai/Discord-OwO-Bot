/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const mysql = require('../botHandlers/mysqlHandler.js');
const global = require('./global.js');

exports.getAlterCommand = async function(dbName, user, type, replacers, appendText) {
	const sql = `SELECT ${dbName}.* from ${dbName} INNER JOIN user ON ${dbName}.uid = user.uid WHERE user.id = ${user.id} AND ${dbName}.type = '${type}'`;
	console.log(sql);
	const result = (await mysql.query(sql))[0];
	console.log(result);
	if (!result || !result.text) return;

	result.text += appendText || '';
	result.text = global.replacer(result.text, replacers);
	if (!result.isEmbed) {
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
}
