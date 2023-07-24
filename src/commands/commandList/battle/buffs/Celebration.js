/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Celebration extends BuffInterface {
	init() {
		this.id = 10;
		this.name = 'Celebration';
		this.debuff = false;
		this.emoji = '<:celebration:1080450615806803968>';
		this.statDesc = `At the end of every turn, heal **?%** of your ${WeaponInterface.prEmoji}PR as ${WeaponInterface.hpEmoji}HP and restore **?%** of your ${WeaponInterface.mrEmoji}MR as ${WeaponInterface.wpEmoji}WP.`;
		this.qualityList = [
			[20, 50],
			[15, 40],
		];
	}

	postTurn(animal, ally, enemy, action) {
		if (!this.from) return;
		if (animal.stats.hp[0] <= 0) return;

		let logs = new Logs();

		// Calculate and heal
		let heal = WeaponInterface.getDamage(this.from.stats.pr, this.stats[0] / 100);
		heal = WeaponInterface.heal(animal, heal, this.from, {
			me: this.from,
			allies: ally,
			enemies: enemy,
		});
		let wp = WeaponInterface.getDamage(this.from.stats.mr, this.stats[1] / 100);
		wp = WeaponInterface.replenish(animal, wp, this.from, {
			me: this.from,
			allies: ally,
			enemies: enemy,
		});
		logs.push(
			`[CELEB] ${this.from.nickname} healed ${animal.nickname} for ${heal.amount} HP`,
			heal.logs
		);
		logs.push(
			`[CELEB] ${this.from.nickname} replenished ${animal.nickname} for ${wp.amount} WP`,
			wp.logs
		);

		super.postTurn(animal, ally, enemy, action);

		return logs;
	}
};
