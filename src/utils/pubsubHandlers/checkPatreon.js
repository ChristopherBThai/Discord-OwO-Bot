/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const supportGuild = '420104212895105044';
const daily = '449429399217897473';
const animal = '449429255781351435';

exports.handle = async function (main, message) {
	// Parse info
	let { userID } = JSON.parse(message);
	if (!userID) return;

	// Grab guild
	let guild = main.bot.guilds.get(supportGuild);
	if (!guild) return;

	// Grab member
	let member = await main.fetch.getMember(guild, userID);

	let dailyPerk, animalPerk;
	if (member) {
		//Check user has the roles
		for (let i in member.roles) {
			let role = member.roles[i];
			if (role == daily) dailyPerk = true;
			if (role == animal) animalPerk = true;
		}
	} else {
		dailyPerk = 0;
		animalPerk = 0;
	}

	// Add to database
	let sql =
		'UPDATE IGNORE user SET patreonDaily = ' +
		(dailyPerk ? 1 : 0) +
		',patreonAnimal = ' +
		(animalPerk ? 1 : 0) +
		' WHERE id = ' +
		userID +
		';';
	await main.mysqlhandler.query(sql);
};
