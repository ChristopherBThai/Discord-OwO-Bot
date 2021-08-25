/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const request = require('request');
const WeaponInterface = require('../WeaponInterface.js');

exports.fetchBossImage = function ({lvl, animal, weapon, stats, rank, rewards }) {
	/* Parse animal info */
	let animalID = animal.value.match(/:[0-9]+>/g);
	if(animalID) animalID = animalID[0].match(/[0-9]+/g)[0];
	else animalID = animal.value.substring(1, animal.value.length-1);
	if(animal.hidden) animalID = animal.hidden;
	const nickname = animal.name;

	/* Parse hp/wp */
	let hp = {
		current: Math.ceil(stats.hp[0]),
		max: Math.ceil(stats.hp[1]+stats.hp[3]),
		previous: Math.ceil(stats.hp[2])
	};
	if(hp.current<0) hp.current = 0;
	if(hp.previous<0) hp.previous = 0;
	let wp = {
		current: Math.ceil(stats.wp[0]),
		max: Math.ceil(stats.wp[1]+stats.wp[3]),
		previous: Math.ceil(stats.wp[2])
	};
	if(wp.current<0) wp.current = 0;
	if(wp.previous<0) wp.current = 0;

	/* Parse weapon info */
	let weaponID;
	let passiveIDs = [];
	if(weapon){
		weaponID = weapon.emoji.match(/:[0-9]+>/g);
		if(weaponID) weaponID = weaponID[0].match(/[0-9]+/g)[0];
		weapon.passives?.forEach(passive => {
			passiveID = passive.emoji.match(/:[0-9]+>/g);
			if(passiveID) passiveIDs.push(passiveID[0].match(/[0-9]+/g)[0]);
		})
	}

	/* Construct json for POST request */
	const info = {
		rank,
		animal_name: nickname,
		animal_image: animalID,
		weapon_image: weaponID,
		weapon_passives: passiveIDs,
		animal_level: lvl,
		animal_hp: hp,
		animal_wp: wp,
		animal_att: Math.ceil(stats.att[0]+stats.att[1]),
		animal_mag: Math.ceil(stats.mag[0]+stats.mag[1]),
		animal_pr: WeaponInterface.resToPrettyPercent(stats.pr),
		animal_mr: WeaponInterface.resToPrettyPercent(stats.mr),
		rewards
	};
	info.password = process.env.IMAGE_GEN_PASS;

	/* Returns a promise to avoid callback hell */
	try{
		return new Promise( (resolve, reject) => {
			let req = request({
				method:'POST',
				uri:`${process.env.IMAGE_GEN_API}/bossgen`,
				json:true,
				body: info,
			},(error,res,body)=>{
				if(error){
					resolve("");
					return;
				}
				if(res.statusCode==200)
					resolve(body);
				else
					resolve("");
			});
		});
	}catch (err){
		console.error(err);
		return;
	}
}
