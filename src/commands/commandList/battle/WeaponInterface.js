/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
/* eslint-disable no-unused-vars */

const Logs = require('./util/logUtil.js');
const requireDir = require('require-dir');
const ranks = [
	[0.2, 'Common', '<:common:416520037713838081>'],
	[0.2, 'Uncommon', '<:uncommon:416520056269176842>'],
	[0.2, 'Rare', '<:rare:416520066629107712>'],
	[0.2, 'Epic', '<:epic:416520722987614208>'],
	[0.14, 'Mythical', '<:mythic:416520808501084162>'],
	[0.05, 'Legendary', '<a:legendary:417955061801680909>'],
	[0.01, 'Fabled', '<a:fabled:438857004493307907>'],
];

module.exports = class WeaponInterface {
	/* Constructor */
	constructor(cpassives, qualities, noCreate) {
		this.init();
		if (this.availablePassives === 'all') {
			this.availablePassives = [];
			for (let i in passives) {
				if (!passives[i].disabled) this.availablePassives.push(i);
			}
		}
		if (noCreate) return;

		/* Keep track of quality list length for buff quality purposes */
		this.initialQualityListLength = this.qualityList.length;
		/* Buff qualities are always in the middle */
		if (this.buffList) {
			for (let i in this.buffList) {
				let buff = buffs[this.buffList[i]];
				this.qualityList = this.qualityList.concat(buff.getQualityList);
			}
		} else {
			this.buffList = [];
		}
		/* Mana will also have a quality (always last in quality array) */
		if (this.manaRange) this.qualityList.push(this.manaRange);

		/* Get random vars if not present */
		if (!cpassives) cpassives = this.randomPassives();
		if (!qualities) qualities = this.randomQualities();

		/* Construct stats */
		let stats = this.toStats(qualities);

		/* Check if it has enough emojis */
		if (this.emojis.length != 7) throw `[${this.id}] does not have 7 emojis`;

		/* Get the quality of the weapon */
		let avgQuality = 0;
		if (cpassives.length > 0) {
			let totalQualities = qualities.reduce((a, b) => a + b, 0);
			let qualityCount = qualities.length;
			for (let i = 0; i < cpassives.length; i++) {
				totalQualities += cpassives[i].qualities.reduce((a, b) => a + b, 0);
				qualityCount += cpassives[i].qualities.length;
			}
			avgQuality = totalQualities / qualityCount;
		} else {
			avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
		}
		avgQuality = Math.trunc(avgQuality);

		let emoji = this.getEmoji(avgQuality);

		/* Determine rank */
		let rank = 0;
		for (let i = 0; i < ranks.length; i++) {
			rank += ranks[i][0];
			if (avgQuality / 100 <= rank) {
				rank = ranks[i];
				i = ranks.length;
			} else if (i == ranks.length - 1) {
				rank = ranks[0];
			}
		}
		rank = {
			name: rank[1],
			emoji: rank[2],
		};

		/* Construct desc */
		let desc = this.statDesc;
		for (let i = 0; i < stats.length; i++) {
			desc = desc.replace('?', stats[i]);
		}

		this.weaponQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
		this.qualities = qualities;
		this.sqlStat = qualities.join(',');
		this.avgQuality = avgQuality;
		this.desc = desc;
		this.stats = stats;
		if (this.manaRange) this.manaCost = stats[stats.length - 1];
		else this.manaCost = 0;
		this.passives = cpassives;
		this.rank = rank;
		this.emoji = emoji;
		this.buffs = this.getBuffs();
	}

	/* Alters the animal's stats */
	alterStats(stats) {
		for (let i = 0; i < this.passives.length; i++) this.passives[i].alterStats(stats);
	}

	/* Grabs a random passive(s) */
	randomPassives() {
		let randPassives = [];
		for (let i = 0; i < this.passiveCount; i++) {
			let rand = Math.floor(Math.random() * this.availablePassives.length);
			let passive = this.availablePassives[rand];
			passive = passives[passive];
			if (!passive)
				throw (
					'Could not get passive[' + this.availablePassives[rand] + '] for weapon[' + this.id + ']'
				);
			randPassives.push(new passive());
		}
		return randPassives;
	}

	/* Inits random qualities */
	randomQualities() {
		let qualities = [];
		for (let i = 0; i < this.qualityList.length; i++)
			qualities.push(Math.trunc(Math.random() * 101));
		return qualities;
	}

	/* Converts qualities to stats */
	toStats(qualities) {
		if (qualities.length != this.qualityList.length)
			throw 'Array size does not match in toStats. Weapon id:' + this.id;
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

	/* Get the corresponding buff classes */
	getBuffs(from) {
		let buffClasses = [];
		let index = this.initialQualityListLength;
		if (this.buffList) {
			for (let i in this.buffList) {
				let buff = buffs[this.buffList[i]];
				let buffQualityLength = buff.getQualityList.length;
				buffClasses.push(new buff(from, this.qualities.slice(index, index + buffQualityLength)));
				index += buffQualityLength;
			}
		}
		return buffClasses;
	}

	/* Actions */
	/* Physical attack */
	attackPhysical(me, team, enemy) {
		return WeaponInterface.basicAttack(me, team, enemy);
	}

	/* Weapon attack */
	attackWeapon(me, team, enemy) {
		return this.attackPhysical(me, team, enemy);
	}

	/* Get list of alive animals */
	static getAlive(team) {
		let alive = [];
		for (let i in team) {
			if (team[i].stats.hp[0] > 0) alive.push(team[i]);
		}
		return alive;
	}

	/* Uses mana */
	static useMana(me, amount, from, tags) {
		let logs = new Logs();

		me.stats.wp[0] -= amount;
		if (me.stats.wp[0] < 0) me.stats.wp[0] = 0;

		return { amount: Math.round(amount), logs };
	}

	preTurn(animal, ally, enemy, action) {}
	postTurn(animal, ally, enemy, action) {}

	/* Basic attack when animal has no weapon */
	static basicAttack(me, team, enemy) {
		if (me.stats.hp[0] <= 0) return;

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me, team, enemy);
		if (!attacking) return;

		let logs = new Logs();

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me, attacking, damage, WeaponInterface.PHYSICAL, {
			me,
			allies: team,
			enemies: enemy,
		});

		logs.push(
			`[PHYS] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP`,
			damage.logs
		);

		return logs;
	}

	/* Get an enemy to attack */
	static getAttacking(me, team, enemy, { hasBuff } = {}) {
		let alive = WeaponInterface.getAlive(enemy);

		let hasBuffOverride = false;
		for (let i in enemy) {
			if (enemy[i].stats.hp[0] > 0) {
				for (let j in enemy[i].buffs) {
					let animal = enemy[i].buffs[j].enemyChooseAttack(enemy[i], me, team, enemy);
					if (animal) {
						hasBuffOverride = true;
						if (hasBuff) {
							if (WeaponInterface.hasGoodBuff(animal)) {
								return animal;
							}
						} else {
							return animal;
						}
					}
				}
			}
		}
		if (hasBuffOverride) return;

		let enemyList = alive;
		if (hasBuff) {
			enemyList = alive.filter(WeaponInterface.hasGoodBuff);
		}
		return enemyList[Math.trunc(Math.random() * enemyList.length)];
	}

	/* Get a random animal */
	static getRandomAnimal(team, { hasDebuff, isAlive } = {}) {
		let list = (isAlive && WeaponInterface.getAlive(team)) || team;

		if (hasDebuff) {
			list = list.filter(WeaponInterface.hasBadBuff);
		}

		return list[Math.trunc(Math.random() * list.length)];
	}

	/* Calculate the damage output (Either mag or att) */
	static getDamage(stat, multiplier = 1) {
		return Math.round(multiplier * (stat[0] + stat[1]) + (Math.random() * 100 - 50));
	}

	/* Get mixed damage */
	static getMixedDamage(stat1, percent1, stat2, percent2) {
		return Math.round(
			(stat1[0] + stat1[1]) * percent1 +
				(stat2[0] + stat2[1]) * percent2 +
				(Math.random() * 100 - 50)
		);
	}

	/* Deals damage to an opponent */
	static inflictDamage(attacker, attackee, damage, type, tags = {}) {
		let totalDamage = 0;
		if (type == WeaponInterface.PHYSICAL)
			totalDamage = damage * (1 - WeaponInterface.resToPercent(attackee.stats.pr));
		else if (type == WeaponInterface.MAGICAL)
			totalDamage = damage * (1 - WeaponInterface.resToPercent(attackee.stats.mr));
		else if (type == WeaponInterface.TRUE) totalDamage = damage;
		else throw 'Invalid attack type';

		let subLogs = new Logs();

		if (totalDamage < 0) totalDamage = 0;
		totalDamage = [totalDamage, 0];

		/* Bonus damage calculation */
		/* Event for attackee */
		for (let i in attackee.buffs)
			subLogs.push(attackee.buffs[i].attacked(attackee, attacker, totalDamage, type, tags));
		if (attackee.weapon)
			for (let i in attackee.weapon.passives)
				subLogs.push(
					attackee.weapon.passives[i].attacked(attackee, attacker, totalDamage, type, tags)
				);
		/* Event for attacker */
		for (let i in attacker.buffs)
			subLogs.push(attacker.buffs[i].attack(attacker, attackee, totalDamage, type, tags));
		if (attacker.weapon)
			for (let i in attacker.weapon.passives)
				subLogs.push(
					attacker.weapon.passives[i].attack(attacker, attackee, totalDamage, type, tags)
				);

		/* After bonus damage calculation */
		/* Event for attackee */
		for (let i in attackee.buffs)
			subLogs.push(attackee.buffs[i].postAttacked(attackee, attacker, totalDamage, type, tags));
		if (attackee.weapon)
			for (let i in attackee.weapon.passives)
				subLogs.push(
					attackee.weapon.passives[i].postAttacked(attackee, attacker, totalDamage, type, tags)
				);
		/* Event for attacker */
		for (let i in attacker.buffs)
			subLogs.push(attacker.buffs[i].postAttack(attacker, attackee, totalDamage, type, tags));
		if (attacker.weapon)
			for (let i in attacker.weapon.passives)
				subLogs.push(
					attacker.weapon.passives[i].postAttack(attacker, attackee, totalDamage, type, tags)
				);

		totalDamage = totalDamage.reduce((a, b) => a + b, 0);
		if (totalDamage < 0) totalDamage = 0;
		attackee.stats.hp[0] -= totalDamage;
		return { amount: Math.round(totalDamage), logs: subLogs };
	}

	/* heals */
	static heal(me, amount, from, tags = {}) {
		let max = me.stats.hp[1] + me.stats.hp[3];
		/* Full health */
		if (!me || me.stats.hp[0] >= max) return { amount: 0 };

		let subLogs = new Logs();
		let totalHeal = [amount, 0];

		/* Bonus heal calculation */
		/* Event for me*/
		for (let i in me.buffs) subLogs.push(me.buffs[i].healed(me, from, totalHeal, tags));
		if (me.weapon)
			for (let i in me.weapon.passives)
				subLogs.push(me.weapon.passives[i].healed(me, from, totalHeal, tags));
		/* Event for from*/
		for (let i in from.buffs) subLogs.push(from.buffs[i].heal(me, from, totalHeal, tags));
		if (from.weapon)
			for (let i in from.weapon.passives)
				subLogs.push(from.weapon.passives[i].heal(me, from, totalHeal, tags));

		/* Adjust healing if its overheal */
		if (me.stats.hp[0] + totalHeal.reduce((a, b) => a + b, 0) > max) {
			let over = me.stats.hp[0] + totalHeal.reduce((a, b) => a + b) - max;
			if (totalHeal[1] >= over) totalHeal[1] -= over;
			else {
				over -= totalHeal[1];
				totalHeal[1] = 0;
				totalHeal[0] -= over;
			}
		}

		/* After bonus heal calculation */
		/* Event for me*/
		for (let i in me.buffs) subLogs.push(me.buffs[i].postHealed(me, from, totalHeal, tags));
		if (me.weapon)
			for (let i in me.weapon.passives)
				subLogs.push(me.weapon.passives[i].postHealed(me, from, totalHeal, tags));
		/* Event for from*/
		for (let i in from.buffs) subLogs.push(from.buffs[i].postHeal(me, from, totalHeal, tags));
		if (from.weapon)
			for (let i in from.weapon.passives)
				subLogs.push(from.weapon.passives[i].postHeal(me, from, totalHeal, tags));

		totalHeal = totalHeal.reduce((a, b) => a + b, 0);
		if (totalHeal < 0) totalHeal = 0;

		me.stats.hp[0] += totalHeal;
		if (me.stats.hp[0] > max) {
			totalHeal -= me.stats.hp[0] - max;
			me.stats.hp[0] = max;
		}
		if (totalHeal < 0) totalHeal = 0;

		return { amount: Math.round(totalHeal), logs: subLogs };
	}

	/* replenishes mana*/
	static replenish(me, amount, from, tags = {}) {
		let max = me.stats.wp[1] + me.stats.wp[3];
		/* Full mana */
		if (!me || me.stats.wp[0] >= max) return { amount: 0 };

		let subLogs = new Logs();
		let total = [amount, 0];

		/* Bonus calculation */
		/* Event for me*/
		for (let i in me.buffs) subLogs.push(me.buffs[i].replenished(me, from, total, tags));
		if (me.weapon)
			for (let i in me.weapon.passives)
				subLogs.push(me.weapon.passives[i].replenished(me, from, total, tags));
		/* Event for from*/
		for (let i in from.buffs) subLogs.push(from.buffs[i].replenish(me, from, total, tags));
		if (from.weapon)
			for (let i in from.weapon.passives)
				subLogs.push(from.weapon.passives[i].replenish(me, from, total, tags));

		/* Adjust if its over */
		if (me.stats.wp[0] + total.reduce((a, b) => a + b, 0) > max) {
			let over = me.stats.wp[0] + total.reduce((a, b) => a + b) - max;
			if (total[1] >= over) total[1] -= over;
			else {
				over -= total[1];
				total[1] = 0;
				total[0] -= over;
			}
		}

		/* After bonus calculation */
		/* Event for me*/
		for (let i in me.buffs) subLogs.push(me.buffs[i].postReplenished(me, from, total, tags));
		if (me.weapon)
			for (let i in me.weapon.passives)
				subLogs.push(me.weapon.passives[i].postReplenished(me, from, total, tags));
		/* Event for from*/
		for (let i in from.buffs) subLogs.push(from.buffs[i].postReplenish(me, from, total, tags));
		if (from.weapon)
			for (let i in from.weapon.passives)
				subLogs.push(from.weapon.passives[i].postReplenish(me, from, total, tags));

		total = total.reduce((a, b) => a + b, 0);
		if (total < 0) total = 0;

		me.stats.wp[0] += total;
		if (me.stats.wp[0] > max) {
			total -= me.stats.wp[0] - max;
			me.stats.wp[0] = max;
		}
		if (total < 0) total = 0;

		return { amount: Math.round(total), logs: subLogs };
	}

	getEmoji(quality) {
		/* If there are multiple quality, get avg */
		if (typeof quality == 'string') {
			quality = parseInt(quality.split(','));
			quality = quality.reduce((a, b) => a + b, 0) / quality.length;
		}

		quality /= 100;

		/* Get correct rank */
		let count = 0;
		for (let i = 0; i < ranks.length; i++) {
			count += ranks[i][0];
			if (quality <= count) return this.emojis[i];
		}
		return this.emojis[0];
	}

	rerollStats() {
		let WeaponClass = weapons[this.id];
		if (!WeaponClass) throw 'Weapon Not Found for reroll';

		let newQualities = this.randomQualities();
		let newPassives = [];
		for (let i in this.passives) {
			let PassiveClass = passives[this.passives[i].id];
			if (!PassiveClass) throw 'Weapon Passive Not Found for reroll';
			newPassives.push(new PassiveClass());
		}

		return new WeaponClass(newPassives, newQualities);
	}

	rerollPassives() {
		let WeaponClass = weapons[this.id];
		if (!WeaponClass) throw 'Weapon Not Found for reroll';

		return new WeaponClass(null, this.qualities);
	}

	/* Get lowest hp animal */
	static getLowestHp(team, { noBuff } = {}) {
		let lowest = undefined;
		for (let i = 0; i < team.length; i++) {
			if (team[i].stats.hp[0] > 0) {
				if (noBuff && WeaponInterface.hasBuff(team[i], noBuff)) {
					/* blank */
				} else if (!lowest) {
					lowest = team[i];
				} else {
					let lowestHp = lowest.stats.hp[0] / (lowest.stats.hp[1] + lowest.stats.hp[3]);
					let animalHp = team[i].stats.hp[0] / (team[i].stats.hp[1] + team[i].stats.hp[3]);
					if (lowestHp > animalHp) {
						lowest = team[i];
					}
				}
			}
		}
		return lowest;
	}

	/* Get lowest wp animal */
	static getLowestWp(team) {
		let lowest = undefined;
		for (let i = 0; i < team.length; i++)
			if (team[i].stats.hp[0] > 0)
				if (
					!lowest ||
					lowest.stats.wp[0] / (lowest.stats.wp[1] + lowest.stats.wp[3]) >
						team[i].stats.wp[0] / (team[i].stats.wp[1] + team[i].stats.wp[3])
				)
					lowest = team[i];
		return lowest;
	}

	static hasBuff(animal, buffId) {
		for (let i in animal.buffs) {
			if (animal.buffs[i].id === buffId) {
				return true;
			}
		}
		return false;
	}

	static hasGoodBuff(animal) {
		for (let i in animal.buffs) {
			if (!animal.buffs[i].debuff) {
				return true;
			}
		}
		return false;
	}

	static hasBadBuff(animal) {
		for (let i in animal.buffs) {
			if (animal.buffs[i].debuff) {
				return true;
			}
		}
		return false;
	}

	/* Gets a dead animal */
	static getDead(team) {
		for (let i = 0; i < team.length; i++) if (team[i].stats.hp[0] <= 0) return team[i];
	}

	/* Check if the animal is at max or higher health */
	static isMaxHp(animal) {
		let hp = animal.stats.hp;
		return hp[0] >= hp[1] + hp[3];
	}

	/* Check if the animal is at max or higher health */
	static isMaxWp(animal) {
		let wp = animal.stats.wp;
		return wp[0] >= wp[1] + wp[3];
	}

	/* Checks if the animal can attack or not */
	static canAttack(animal, ally, enemy, action) {
		let result = { alive: animal.stats.hp[0] > 0 };
		result.result = result.alive;

		let subLogs = new Logs();
		for (let i in animal.buffs)
			subLogs.push(animal.buffs[i].canAttack(animal, ally, enemy, action, result));
		if (animal.weapon)
			for (let i in animal.weapon.passives)
				subLogs.push(animal.weapon.passives[i].canAttack(animal, ally, enemy, action, result));

		result = result.result;
		return { canAttack: result, logs: subLogs };
	}

	/* Convert resistance to percent */
	static resToPercent(res) {
		res = res[0] + res[1];
		res = (res / (100 + res)) * 0.8;
		return res;
	}

	/* Convert resistance to pretty print percent */
	static resToPrettyPercent(res) {
		res = WeaponInterface.resToPercent(res);
		return Math.round(res * 100) + '%';
	}

	static get allPassives() {
		return passives;
	}
	static get allBuffs() {
		return buffs;
	}
	static get weapons() {
		return weapons;
	}
	static get PHYSICAL() {
		return 'p';
	}
	static get MAGICAL() {
		return 'm';
	}
	static get TRUE() {
		return 't';
	}
	static get ranks() {
		return ranks;
	}
	static get strEmoji() {
		return '<:att:531616155450998794>';
	}
	static get magEmoji() {
		return '<:mag:531616156231139338>';
	}
	static get hpEmoji() {
		return '<:hp:531620120410456064>';
	}
	static get wpEmoji() {
		return '<:wp:531620120976687114>';
	}
	static get prEmoji() {
		return '<:pr:531616156222488606>';
	}
	static get mrEmoji() {
		return '<:mr:531616156226945024>';
	}
	static get getID() {
		return new this(null, null, true).id;
	}
	static get disabled() {
		return new this(null, null, true).disabled;
	}
	static get getName() {
		return new this(null, null, true).name;
	}
	static get unsellable() {
		return new this(null, null, true).unsellable;
	}
	static get getDesc() {
		return new this(null, null, true).basicDesc;
	}
	static get getEmoji() {
		return new this(null, null, true).defaultEmoji;
	}
};

const passiveDir = requireDir('./passives');
const passives = {};
for (let key in passiveDir) {
	let passive = passiveDir[key];
	passives[passive.getID] = passive;
}
const buffDir = requireDir('./buffs');
const buffs = {};
for (let key in buffDir) {
	let buff = buffDir[key];
	if (!buff.disabled) buffs[buff.getID] = buff;
}
const weaponDir = requireDir('./weapons');
const weapons = {};
for (let key in weaponDir) {
	let weapon = weaponDir[key];
	weapons[weapon.getID] = weapon;
}
