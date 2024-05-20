/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
let unpauseTimer;
exports.handle = async function (main, message) {
	// Parse info
	let sec = parseInt(JSON.parse(message));
	if (!sec) return;
	clearTimeout(unpauseTimer);

	main.pause = true;

	console.log(`Pausing this shard for ${sec} seconds`);
	unpauseTimer = setTimeout(() => {
		main.pause = false;
		unpauseTimer = null;
		console.log(`Unpausing this shard`);
	}, sec * 1000);
};
