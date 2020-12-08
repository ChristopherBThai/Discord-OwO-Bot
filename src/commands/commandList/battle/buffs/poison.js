/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Poison extends BuffInterface{

	init(){
		this.id = 2;
		this.name = "Poison";
		this.debuff = true;
		this.emoji = "<:poison:572311805704273920>";
		this.statDesc = "Deals **?%** of your "+WeaponInterface.magEmoji+" MAG at the end of the turn and reduces damage dealt by the target by 15%";
		this.qualityList = [[60,85]];
	}

	// Override
	bind(animal,duration,tags){
		for(let i in animal.debuffs){
			if(animal.debuffs[i].id == this.id && animal.debuffs[i].from.pid==this.from.pid){
				animal.debuffs[i].duration += duration;
				return;
			}
		}

		super.bind(animal,duration,tags);
	}

	attack(animal,attackee,damage,type,last){
		let logs = new Logs();

		let bonus = damage[0]*(.15);
		damage[1] -= bonus;

		logs.push(`[POIS] damage dealt was decreased by ${Math.round(bonus)}`);
		return logs;
	}

	postTurn(animal,ally,enemy,action){
		if(!this.from) return;
		if(animal.stats.hp[0]<=0) return;

		let logs = new Logs();

		// Calculate and deal damage
		let damage = WeaponInterface.getDamage(this.from.stats.mag,this.stats[0]/100);
		damage = WeaponInterface.inflictDamage(this.from,animal,damage,WeaponInterface.MAGICAL,{me:this.from,allies:enemy,enemies:ally});
		logs.push(`[POIS] ${this.from.nickname} damaged ${animal.nickname} for ${damage.amount} HP`, damage.logs);
		
		console.log("poison damage");

		super.postTurn(animal,ally,enemy,action);

		return logs;
	}

}
