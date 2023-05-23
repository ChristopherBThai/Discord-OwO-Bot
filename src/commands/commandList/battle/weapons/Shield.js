/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const battleUtil = require('../util/battleUtil.js');
const Logs = require('../util/logUtil.js');

module.exports = class Shield extends WeaponInterface {
	init() {
		this.id = 5;
		this.name = "Defender's Aegis";
		this.basicDesc = '';
		this.emojis = [
			'<:cshield:546552025828163585>',
			'<:ushield:546552083348848641>',
			'<:rshield:546552083600506900>',
			'<:eshield:546552026088210434>',
			'<:mshield:546552083621609482>',
			'<:lshield:546552083353174026>',
			'<:fshield:546552026084016149>',
		];
		this.defaultEmoji = '<:shield:546552900986601493>';
		this.statDesc = 'Adds a **taunt** buff to your animal for 2 turns';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [];
		this.manaRange = [250, 150];
		this.buffList = [1];
	}

	preTurn(animal, ally, enemy, action) {
		if (action != battleUtil.weapon) return;

		if (animal.disabled && !animal.disabled.canAttack) return;

		/* If dead */
		if (animal.stats.hp[0] <= 0) return;

		/* No mana */
		if (animal.stats.wp[0] < this.manaCost) return;

		/* check if we already have the buff or not */
		for (let i in animal.buffs) if (animal.buffs[i].id == this.buffList[0]) return;

		let logs = new Logs();

		/* Grab buff and bind it to our animal */
		let buff = this.getBuffs(animal)[0];
		let buffLogs = buff.bind(animal, 2, {
			me: animal,
			allies: ally,
			enemies: enemy,
		});
		logs.push(`[AEGIS] ${animal.nickname} used taunt`);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(animal, this.manaCost, animal, {
			me: animal,
			allies: ally,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[AEGIS] ${animal.nickname} used ${mana.amount} WP`, mana.logs);

		logs.addSubLogs(buffLogs);
		logs.addSubLogs(manaLogs);

		return logs;
	}

	attackWeapon(me, team, enemy) {
		/* Don't attack if we used an ability */
		for (let i in me.buffs)
			if (me.buffs[i].id == this.buffList[0] && me.buffs[i].justCreated) return;
		return this.attackPhysical(me, team, enemy);
	}
};
