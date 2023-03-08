/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
/* eslint-disable no-unused-vars */

module.exports = class BuffInterface {
	/* Constructor */
	constructor(from, qualities, duration, noCreate) {
		this.init();
		if (noCreate) return;

		/* Initialize random qualities if it doesnt have any */
		if (!qualities) qualities = this.randomQualities();
		if (!duration) duration = 0;

		/* Calculate avg quality of this buff */
		let avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;

		/* Construct stats based on qualities */
		let stats = this.toStats(qualities);

		/* Construct desc */
		let desc = this.statDesc;
		for (let i = 0; i < stats.length; i++) {
			desc = desc.replace('?', stats[i]);
		}

		this.from = from;
		this.avgQuality = avgQuality;
		this.qualities = qualities;
		this.duration = duration;
		this.stats = stats;
		this.desc = desc;
		this.sqlStat = qualities.join(',');
	}

	/* Get random qualities based on quality list */
	randomQualities() {
		let qualities = [];
		for (let i = 0; i < this.qualityList.length; i++)
			qualities.push(Math.trunc(Math.random() * 101));
		return qualities;
	}

	/* Converts qualities into stats */
	toStats(qualities) {
		if (qualities.length != this.qualityList.length)
			throw new Error('Array size does not match in toStats. Buff id:' + this.id);
		let stats = [];
		for (let i = 0; i < qualities.length; i++) {
			let quality = qualities[i];
			if (quality > 100) quality = 100;
			if (quality < 0) quality = 0;
			let min = this.qualityList[i][0];
			let max = this.qualityList[i][1];

			/* rounds to 2 decimal places */
			stats.push(Math.round((min + (max - min) * (quality / 100)) * 100) / 100);
		}
		return stats;
	}

	/* Bind this buff to an animal */
	bind(animal, duration, tags = {}) {
		if (duration) this.duration = duration;
		animal.buffs.push(this);
		this.justCreated = true;
	}

	/* If the buff owner is attacking*/
	attack(animal, attackee, damage, type, last) {}
	/* If the buff owner is attacked */
	attacked(animal, attacker, damage, type, last) {}
	/* If the buff owner is healing */
	heal(animal, healer, amount, tag) {}
	/* If the buff owner is healed */
	healed(animal, healer, amount, tag) {}
	/* If the passive owner is replenishing */
	replenish(animal, healer, amount, tag) {}
	/* If the passive owner is replenished */
	replenished(animal, healer, amount, tag) {}
	/* If the buff owner is attacking (after bonus damage) */
	postAttack(animal, attackee, damage, type, last) {}
	/* If the buff owner is attacked (after bonus damage) */
	postAttacked(animal, attacker, damage, type, last) {}
	/* If the buff owner is healing(after bonus heal) */
	postHeal(animal, healer, amount, tag) {}
	/* If the buff owner is healed (after bonus heal) */
	postHealed(animal, healer, amount, tag) {}
	/* If the passive owner is replenishing (after bonus heal) */
	postReplenish(animal, healer, amount, tag) {}
	/* If the passive owner is replenished (after bonus heal) */
	postReplenished(animal, healer, amount, tag) {}

	/* when an enemy chooses an opponent */
	enemyChooseAttack(animal, attacker, ally, enemy) {}

	/* If the passive owner is allowed to attack */
	canAttack(me, ally, enemy, action, result) {}

	/* End of turn. Descrease duration by one */
	postTurn(animal, ally, enemy, action) {
		this.duration -= 1;
		if (this.duration <= 0) {
			for (let i = 0; i < animal.buffs.length; i++) {
				if (animal.buffs[i].id == this.id && animal.buffs[i].from.pid == this.from.pid) {
					animal.buffs[i].markedForDeath = true;
				}
			}
		}
		if (this.justCreated) this.justCreated = false;
	}

	preTurn(animal, ally, enemy, action) {}

	static get getID() {
		return new this(null, null, null, true).id;
	}
	static get getQualityList() {
		return new this(null, null, null, true).qualityList;
	}
};
