/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const weaponUtil = require('./util/weaponUtil.js');
const battleUtil = require('./util/battleUtil.js');
const rerollUtil = require('./util/rerollUtil.js');
const battleFriendUtil = require('./util/battleFriendUtil.js');
const uwidMax = 10;

module.exports = new CommandInterface({
	alias: ['weapon', 'w', 'weapons', 'wep'],

	args: '',

	desc: '',

	example: [],

	related: ['owo crate', 'owo battle'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		/* Display weapons */
		if (p.args.length == 0) {
			await weaponUtil.display(p);

			/* Reroll weapon stats */
		} else if (['rr', 'reroll'].includes(p.args[0])) {
			await rerollUtil.reroll(p);

			/* Describe weapon */
		} else if (p.args.length == 1) {
			if (p.global.isInt(p.args[0]) && weaponUtil.getWID(parseInt(p.args[0]) - 100)) {
				await weaponUtil.display(p, 0, 0, { wid: parseInt(p.args[0]) - 100 });
			} else if (p.global.isUser(p.args[0])) {
				await weaponUtil.askDisplay(p, p.args[0].match(/[0-9]+/)[0]);
			} else {
				let uwid = p.args[0];
				if (uwid.length < uwidMax) await weaponUtil.describe(p, uwid);
				else p.errorMsg(', Invalid arguments! Use `owo weapon {uniqueWeaponId}`');
			}

			/* Unequip weapon */
		} else if (p.args.length == 2 && (p.args[0] == 'unequip' || p.args[0] == 'ue')) {
			/* No changing while in battle */
			if (await battleUtil.inBattle(p)) {
				p.errorMsg(
					", You cannot change your weapon while you're in battle! Please finish your `owo battle`!",
					3000
				);
				return;
			} else if (await battleFriendUtil.inBattle(p)) {
				p.errorMsg(
					', You cannot change your weapon while you have a pending battle! Use `owo db` to decline it!',
					3000
				);
				return;
			}

			let uwid = p.args[1];
			if (uwid.length < uwidMax) await weaponUtil.unequip(p, uwid);
			else p.errorMsg(', Invalid arguments! Use `owo weapon unequip {weaponId}`');

			/* view someone's weapons by category */
		} else if (
			p.args.length == 2 &&
			p.global.isUser(p.args[0]) &&
			p.global.isInt(p.args[1]) &&
			weaponUtil.getWID(parseInt(p.args[1]) - 100)
		) {
			await weaponUtil.askDisplay(p, p.args[0].match(/[0-9]+/)[0], {
				wid: parseInt(p.args[1]) - 100,
			});

			/* Equip weapon */
		} else if (p.args.length == 2) {
			/* No changing while in battle */
			if (await battleUtil.inBattle(p)) {
				p.errorMsg(
					", You cannot change your weapon while you're in battle! Please finish your `owo battle`!",
					3000
				);
				return;
			} else if (await battleFriendUtil.inBattle(p)) {
				p.errorMsg(
					', You cannot change your weapon while you have a pending battle! Use `owo db` to decline it!',
					3000
				);
				return;
			}

			let uwid = p.args[0];
			let pet = p.args[1];

			if (uwid.length >= uwidMax) {
				p.errorMsg(', Invalid arguments! Use `owo weapon {uniqueWeaponId} {animalPos|animal}`');
				return;
			} else if (p.global.isInt(pet)) {
				pet = parseInt(pet);
				if (pet < 1 || pet > 3) {
					p.errorMsg(', Invalid arguments! Use `owo weapon {uniqueWeaponId} {animalPos|animal}`');
					return;
				}
			} else {
				pet = p.global.validAnimal(pet);
				if (!pet) {
					p.errorMsg(', Invalid arguments! Use `owo weapon {uniqueWeaponId} {animalPos|animal}`');
					return;
				}
			}

			await weaponUtil.equip(p, uwid, pet);

			/* Else */
		} else {
			p.errorMsg(', Invalid arguments', 3000);
		}
	},
});
