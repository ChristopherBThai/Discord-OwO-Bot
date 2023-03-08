/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const request = require('request').defaults({ encoding: null });

exports.urlToBufferString = function (url) {
	return new Promise(function (res, rej) {
		try {
			request.get(url, (error, response, body) => {
				if (!error && response.statusCode == 200) {
					let data =
						'data:' +
						response.headers['content-type'] +
						';base64,' +
						Buffer.from(body).toString('base64');
					res(data);
				} else {
					rej('Failed to fetch image');
				}
			});
		} catch (err) {
			rej('Failed to fetch image');
		}
	});
};

exports.urlToBuffer = function (url) {
	return new Promise(function (res, rej) {
		try {
			request.get(url, (error, response, body) => {
				if (!error && response.statusCode == 200) {
					res(Buffer.from(body));
				} else {
					rej('Failed to fetch image');
				}
			});
		} catch (err) {
			rej('Failed to fetch image');
		}
	});
};
