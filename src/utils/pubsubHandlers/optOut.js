/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (main, message) {
	const { id, remove } = JSON.parse(message);
	if (!id) {
		console.error(`Invalid opt out id: ${id}`);
		return;
	}
	if (remove) {
		delete main.optOut[id];
		console.log(`Removed ${id} to opt out`);
	} else {
		main.optOut[id] = true;
		console.log(`Added ${id} to opt out`);
	}
};
