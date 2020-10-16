/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Mortality extends BuffInterface{

	init(){
		this.id = 9;
		this.name = "Mortality";
		this.debuff = true;
		this.emoji = "<:mortality:619458869730476042>";
		this.statDesc = "Decreases all healing for this animal by **?%**";
		this.qualityList = [[20,50]];
	}

	// Override
	bind(animal,duration,tags){
		for(let i in animal.debuffs){
			if(animal.debuffs[i].id == this.id){
				animal.debuffs[i].duration += duration;
				return;
			}
		}

		super.bind(animal,duration,tags);
	}

	postHealed(animal,healer,amount,tag){
		let logs = new Logs();

		let dec = amount[0]*(this.stats[0]/100);
		amount[1] -= dec;

		logs.push(`[MORT] Healing was decreased by ${Math.round(dec)}`);
		return logs
	}
}
