/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const request = require('request');
const WeaponInterface = require('./WeaponInterface.js');

/* Generates a battle image by my battle image generation api */
exports.generateImage = function (teams) {
	/* Construct json for POST request */
	var info = generateJson(teams);
	info.password = process.env.GEN_PASS;

	/* Returns a promise to avoid callback hell */
	try {
		return new Promise((resolve, _reject) => {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/imagegen`,
					json: true,
					body: info,
				},
				(error, res, body) => {
					if (error) {
						resolve('');
						return;
					}
					if (res.statusCode == 200) resolve(body);
					else resolve('');
				}
			);
		});
	} catch (err) {
		return '';
	}
};

/* Generates a json depending on the battle info */
function generateJson(teams) {
	var json = {
		player: {
			teamName: teams.player.name,
			animals: [],
		},
		enemy: {
			teamName: teams.enemy.name,
			animals: [],
		},
	};

	for (let i = 0; i < teams.player.team.length; i++)
		json.player.animals.push(generateAnimalJson(teams.player.team[i]));
	for (let i = 0; i < teams.enemy.team.length; i++)
		json.enemy.animals.push(generateAnimalJson(teams.enemy.team[i]));
	return json;
}

function generateAnimalJson(animal) {
	let weapon = animal.weapon;
	let stat = animal.stats;

	/* Parse animal info */
	let animalID = animal.animal.value.match(/:[0-9]+>/g);
	if (animalID) animalID = animalID[0].match(/[0-9]+/g)[0];
	else animalID = animal.animal.value.substring(1, animal.animal.value.length - 1);
	if (animal.animal.hidden) animalID = animal.animal.hidden;
	let nickname = animal.nickname;
	if (!nickname) nickname = animal.animal.name;

	/* Parse weapon info */
	let weaponID;
	if (weapon) {
		weaponID = weapon.emoji.match(/:[0-9]+>/g);
		if (weaponID) weaponID = weaponID[0].match(/[0-9]+/g)[0];
	}

	/* Parse hp/wp */
	let hp = {
		current: Math.ceil(stat.hp[0]),
		max: Math.ceil(stat.hp[1] + stat.hp[3]),
		previous: Math.ceil(stat.hp[2]),
	};
	if (hp.current < 0) hp.current = 0;
	if (hp.previous < 0) hp.previous = 0;
	let wp = {
		current: Math.ceil(stat.wp[0]),
		max: Math.ceil(stat.wp[1] + stat.wp[3]),
		previous: Math.ceil(stat.wp[2]),
	};
	if (wp.current < 0) wp.current = 0;
	if (wp.previous < 0) wp.current = 0;

	let buffs = [];

	for (let i in animal.buffs) {
		let buff = animal.buffs[i];
		buff = buff.emoji.match(/:[0-9]+>/g);
		if (buff) buffs.push(buff[0].match(/[0-9]+/g)[0]);
	}

	return {
		animal_name: nickname,
		animal_image: animalID,
		weapon_image: weaponID,
		animal_level: stat.lvl,
		animal_hp: hp,
		animal_wp: wp,
		animal_att: Math.ceil(stat.att[0] + stat.att[1]),
		animal_mag: Math.ceil(stat.mag[0] + stat.mag[1]),
		animal_pr: WeaponInterface.resToPrettyPercent(stat.pr),
		animal_mr: WeaponInterface.resToPrettyPercent(stat.mr),
		animal_buffs: buffs,
	};
}
