/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Snail extends PassiveInterface {
	init() {
		this.id = 20;
		this.name = 'Snail';
		this.basicDesc = '';
		this.emojis = [
			'<:csnail:1107928492668104734>',
			'<:usnail:1107928528760094743>',
			'<:rsnail:1107928524112805950>',
			'<:esnail:1107928496187133992>',
			'<:msnail:1107928521130643466>',
			'<:lsnail:1107928501148975125>',
			'<:fsnail:1107928499202818118>',
		];
		this.statDesc =
			'Your pet snail fights with you. Whenever you attack an animal, snail will slap a random enemy for **?%** of the damage dealt.';
		this.qualityList = [[5, 15]];
	}

	postAttack(animal, _attackee, damage, type, tags) {
		if (tags.has('snail', animal)) return;
		let logs = new Log();

		let snailDamage = (damage * this.stats[0]) / 100;

		/* Grab an enemy that I'm attacking */
		const allies = tags.getAnimalAllies(animal);
		const enemies = tags.getAnimalEnemies(animal);
		let attacking = WeaponInterface.getAttacking(animal, allies, enemies, { ignoreChoose: true });
		if (!attacking) return;

		const copyTags = tags.copyAdd('snail', animal, {
			me: animal,
			allies: tags.allies,
			enemies: tags.enemies,
		});
		// damage variable already has res applied, no need to recalculate res twice.
		snailDamage = WeaponInterface.inflictDamage(animal, attacking, snailDamage, type, copyTags, {
			bypassRes: true,
		});
		logs.push(
			`[SNAIL] ${animal.nickname}'s pet snail slapped ${attacking.nickname} for ${snailDamage.amount} HP`,
			snailDamage.logs
		);

		return logs;
	}
};
