/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const request = require('request');
const { SHARDER_HOST, SHARDER_SERVER } = process.env;

exports.fetchInit = function () {
	return new Promise((resolve, reject) => {
		const url = `${SHARDER_HOST}/sharder-info/${SHARDER_SERVER}`;
		request.get(url, (err, res, body) => {
			if (err) reject(err);
			else if (res.statusCode == 200) resolve(JSON.parse(body));
			else reject(res);
		});
	});
};
