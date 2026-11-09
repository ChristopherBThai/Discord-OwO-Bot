/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (main, message) {
	const { newId, oldId } = JSON.parse(message);
	console.log(`Attempting to reinitialized animal: ${oldId} -> ${newId}`);
	main.animalUtil.deleteAnimal(oldId);
	await main.animalUtil.reinitializeAnimal(newId);
	console.log(`Succesfully reinitialized animal: ${oldId} -> ${newId}`);
};
