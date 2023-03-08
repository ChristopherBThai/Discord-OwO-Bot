/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');
const battleUtil = require('../util/battleUtil.js');

module.exports = class VanguardsBanner extends WeaponInterface {
	init() {
		this.id = 16;
		this.name = "Vanguard's Banner";
		this.basicDesc = '';
		this.emojis = [
			'<:cvban:618001307411677195>',
			'<:uvban:618001308355395584>',
			'<:rvban:618001308192079873>',
			'<:evban:618001307814461453>',
			'<:mvban:618001308682551306>',
			'<:lvban:618001308284354561>',
			'<:fvban:618001308544270337>',
		];
		this.defaultEmoji = '<:vban:618001308837740545>';
		this.statDesc =
			'Apply **Attack Up** to all allies for 2 turns. If the user has enough WP when the buff expires, the buff will be recasted with a stronger version.';
		this.availablePassives = 'all';
		this.passiveCount = 1;
		this.qualityList = [];
		this.manaRange = [300, 250];
		this.buffList = [6, 7, 8];
	}

	preTurn(animal, ally, enemy, action) {
		if (action != battleUtil.weapon) return;

		if (animal.disabled && !animal.disabled.canAttack) return;

		/* If dead */
		if (animal.stats.hp[0] <= 0) return;

		/* No mana */
		if (animal.stats.wp[0] < this.manaCost) return;

		// Determine what buff we have first
		let currentBuff;
		for (let i in animal.buffs) {
			let buff = animal.buffs[i];
			if (this.buffList.includes(buff.id)) {
				if (currentBuff && buff.id > currentBuff.id) {
					currentBuff = buff;
				} else if (!currentBuff) {
					currentBuff = buff;
				}
			}
		}

		// What our new buff should be
		let newBuff = 0;
		let oldBuffId;
		let newBuffName = 'Attack Up';
		if (currentBuff && currentBuff.duration > 1) return;
		else if (currentBuff) {
			newBuff = currentBuff.id + 1;
			if (newBuff > 8) newBuff = 8;
			newBuff -= 6;
			oldBuffId = currentBuff.id;
			if (newBuff == 1) newBuffName = 'Attack Up+';
			if (newBuff == 2) newBuffName = 'Attack Up++';
		}

		let logs = new Logs();

		// Grab buff and bind it to our animal
		let buffLogs = new Logs();

		for (let i = 0; i < ally.length; i++) {
			// Add new buff
			let buff = this.getBuffs(animal)[newBuff];
			buffLogs.push(buff.bind(ally[i], 3, { me: ally[i], allies: ally, enemies: enemy }));

			// Remove old buff
			if (oldBuffId) {
				for (let j in ally[i].buffs) {
					if (ally[i].buffs[j].from.pid == animal.pid && ally[i].buffs[j].id == oldBuffId) {
						ally[i].buffs[j].postTurn(ally[i], ally, enemy, action);
					}
				}
			}
		}
		logs.push(`[VBAN] ${animal.nickname} applied ${newBuffName} to all allies`);

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(animal, this.manaCost, animal, {
			me: animal,
			allies: ally,
			enemies: enemy,
		});
		let manaLogs = new Logs();
		manaLogs.push(`[VBAN] ${animal.nickname} used ${mana.amount} WP`, mana.logs);

		logs.addSubLogs(buffLogs);
		logs.addSubLogs(manaLogs);

		return logs;
	}

	attackWeapon(me, team, enemy) {
		/* Don't attack if we used an ability */
		for (let i in me.buffs) {
			let buff = me.buffs[i];
			if (this.buffList.includes(buff.id) && buff.from.pid == me.pid && buff.justCreated) {
				return;
			}
		}

		return this.attackPhysical(me, team, enemy);
	}
};
