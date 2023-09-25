/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const WeaponInterface = require('../battle/WeaponInterface.js');

module.exports = new CommandInterface({
	alias: ['addallweapons', 'aaw'],

	owner: true,

	execute: async function (p) {
		const id = p.args[0];
		let stat = p.args[1];
		const uid = await p.global.getUid(id);

		if (!p.global.isInt(stat)) {
			return p.errorMsg(', stat not an integer');
		}
		stat = parseInt(stat);

		if (stat < 0 || stat > 100) {
			return p.errorMsg(', stat is invalid');
		}

		if (!uid) {
			return p.errorMsg(', invalid user id');
		}
		let sql = `SELECT uw.uwid, uw.wid, uwp.wpid
			FROM user_weapon uw
				LEFT JOIN user_weapon_passive uwp ON uw.uwid = uwp.uwid
			WHERE uid = ${uid} AND avg = ${stat};`;
		let result = await p.query(sql);

		let existingWeapons = {};
		result.forEach((weapon) => {
			if (!existingWeapons[weapon.uwid]) {
				existingWeapons[weapon.uwid] = {
					wid: weapon.wid,
					wpid: [],
				};
			}
			if (weapon.wpid) {
				existingWeapons[weapon.uwid].wpid.push(weapon.wpid);
			}
		});
		let formattedWeapons = {};
		for (let i in existingWeapons) {
			const weapon = existingWeapons[i];
			if (!formattedWeapons[weapon.wid]) {
				formattedWeapons[weapon.wid] = [];
			}
			formattedWeapons[weapon.wid].push(weapon.wpid.join(','));
		}

		const allWeapons = getAllWeapons();

		addMissingWeapons.bind(this)(formattedWeapons, allWeapons, stat);
	},
});

function getAllWeapons() {
	const weapons = {};
	for (let wid in WeaponInterface.weapons) {
		const weapon = new WeaponInterface.weapons[wid](null, null, true);
		if (weapon.passiveCount && weapon.availablePassives.length) {
			weapons[wid] = getAllPassives(weapon.passiveCount, weapon.availablePassives);
		} else {
			weapons[wid] = [];
		}
	}
	return weapons;
}

function getAllPassives(count, passives) {
	let result = [];
	if (count <= 0) {
		return result;
	}
	const prev = getAllPassives(count - 1, passives);
	passives.forEach((passive) => {
		if (prev.length) {
			prev.forEach((prevPassive) => {
				result.push(prevPassive + ',' + passive);
			});
		} else {
			result.push(passive);
		}
	});

	return result;
}

async function addMissingWeapons(existingWeapons, allWeapons, stat) {
	for (let allWid in allWeapons) {
		let allPassives = allWeapons[allWid];
		if (allPassives.length === 0) {
			if (!existingWeapons[allWid]) {
				await addWeapon.bind(this)(allWid, [], stat);
			}
		} else {
			let existingPassives =
				existingWeapons[allWid]?.map((passives) => {
					return passives
						.split(',')
						.sort((a, b) => parseInt(a) - parseInt(b))
						.join(',');
				}) || [];
			for (let i in allPassives) {
				let allPassive = allPassives[i]
					.split(',')
					.sort((a, b) => parseInt(a) - parseInt(b))
					.join(',');
				if (!existingPassives.includes(allPassive)) {
					let passives = allPassive.split(',');
					passives = passives.map((passive) => {
						return parseInt(passive);
					});
					await addWeapon.bind(this)(allWid, passives, stat);
				}
			}
		}
	}
}

async function addWeapon(wid, passives, stat) {
	console.log(`Adding weapon ${wid}: ${passives}`);
	const weapon = new WeaponInterface.weapons[wid](null, null, null, {
		passives,
		statOverride: stat,
	});
	await weapon.save(this.msg.author.id);
	await delay(500);
}

function delay(ms) {
	return new Promise((res) => {
		setTimeout(res, ms);
	});
}
