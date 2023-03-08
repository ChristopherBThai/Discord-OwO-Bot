/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class ManaTap extends PassiveInterface {
	init() {
		this.id = 9;
		this.name = 'Mana Tap';
		this.basicDesc = '';
		this.emojis = [
			'<:cmanatap:562175424742948865>',
			'<:umanatap:562175425028292618>',
			'<:rmanatap:562175424902332446>',
			'<:emanatap:562175424814120970>',
			'<:mmanatap:562175424918978580>',
			'<:lmanatap:562175425175093279>',
			'<:fmanatap:562175424403079199>',
		];
		this.statDesc =
			'All damage you deal replenishes your ' +
			WeaponInterface.wpEmoji +
			'WP for **?%** of the damage dealt!';
		this.qualityList = [[15, 30]];
	}

	postAttack(animal, attackee, damage, type, tags) {
		let logs = new Log();

		let totalDamage = damage.reduce((a, b) => a + b, 0);
		let mana = (totalDamage * this.stats[0]) / 100;
		mana = WeaponInterface.replenish(animal, mana, animal, tags);

		logs.push(`[MTAP] ${animal.nickname} replenished ${mana.amount} WP`, mana.logs);
		return logs;
	}
};
