/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Stinky extends BuffInterface {
	init() {
		this.id = 12;
		this.name = 'Stinky';
		this.debuff = true;
		this.emoji = '<:stinky:1154636430937698364>';
		this.statDesc = `Prevents any future buffs *AND* debuffs to be applied to this animal. On success, deal **?%** ${WeaponInterface.magEmoji}MAG to the animal.`;
		this.qualityList = [[20, 50]];
	}

	// Override
	preBind(animal, duration, tags, buffToAdd) {
		if (tags.has('stinky', this.from)) return;

		let logs = new Logs();

		let damage = WeaponInterface.getDamage(this.from.stats.mag, this.stats[0] / 100);
		const tagsCopy = tags.copyAdd('stinky', this.from);
		damage = WeaponInterface.inflictDamage(
			this.from,
			animal,
			damage,
			WeaponInterface.MAGICAL,
			tagsCopy
		);
		logs.push(
			`[STINK] Prevented ${buffToAdd.name} ${buffToAdd.debuff ? 'de' : ''}buff and damaged ${
				animal.nickname
			} for ${damage.amount} HP`,
			damage.logs
		);

		return {
			logs: logs,
			dontBind: true,
		};
	}
};
