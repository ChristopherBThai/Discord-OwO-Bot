const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');

module.exports = class Taunt extends BuffInterface{

	init(){
		this.id = 1;
		this.name = "Taunt";
		this.debuff = false;
		this.emoji = "<:taunt:546615322598440960>";
		this.statDesc = "Taunts the enemy team and forces all opponents to attack this animal. Reduces incoming damage by **?**%";
		this.qualityList = [[25,40]];
	}

	enemyChooseAttack(animal,attacker,attackee,ally,enemy){
		if(animal.stats.hp[0]>0)
			return animal;
		return attackee;
	}

	attacked(animal,attacker,damage,type,last){
		damage[1] += -1*damage[0]*this.stats[0]/100;
	}
}
