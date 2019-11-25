/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Taunt extends BuffInterface{

	init(){
		this.id = 1;
		this.name = "Taunt";
		this.debuff = false;
		this.emoji = "<:taunt:546615322598440960>";
		this.statDesc = "Taunts the enemy team and forces all opponents to attack this animal. Reduces incoming damage by **?**%";
		this.qualityList = [[30,50]];
	}

	enemyChooseAttack(animal,attacker,attackee,ally,enemy){
		if(animal.stats.hp[0]>0)
			return animal;
		return attackee;
	}

	attacked(animal,attacker,damage,type,last){
		let logs = new Logs();

		let negate = (damage[0]+damage[1])*this.stats[0]/100;
		damage[1] -= negate;

		logs.push(`[TAUNT] ${animal.nickname} negated ${Math.round(negate)} damage`);
		return logs
	}
}
