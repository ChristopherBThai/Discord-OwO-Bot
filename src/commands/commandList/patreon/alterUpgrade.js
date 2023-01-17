/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const botEmoji = '🛠';

exports.alter = function (id, text) {
	switch (id) {
		case '255750356519223297':
			return spotifybot(text);
		default:
			return text;
	}
};

function spotifybot(text) {
	let spotify = '<a:spotify:577027003656437766>';
	return text.replace('HuntBot', 'SPOTIFYBOT').replace(botEmoji, spotify);
}
