const BuffInterface = require('../BuffInterface.js');

module.exports = class Taunt extends BuffInterface{

	init(){
		this.id = 1;
		this.name = "Taunt";
		this.debuff = false;
		this.emoji = "<:taunt:546615322598440960>";
		this.statDesc = "Taunts the enemy team and reduces incoming damage by **?**%";
		this.qualityList = [[25,50]];
	}

	enemyChooseAttack(animal,attacker,attackee,ally,enemy){
		if(animal.stats.hp[0]>0)
			return animal;
		return attackee;
	}

	attacked(animal,attacker,damage,type){
		return damage - (damage*this.stats[0]/100);
	}
}
