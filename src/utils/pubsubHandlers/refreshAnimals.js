/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (main, message) {
	const { animalName } = JSON.parse(message);
	await main.animalUtil.reinitialize(animalName);
	if (animalName) {
		console.log(`Succesfully reinitialized animal: ${animalName}`);
	} else {
		console.log('Succesfully reinitialized animals');
	}
};
