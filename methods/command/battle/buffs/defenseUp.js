const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class defenseUp extends BuffInterface{

	init(){
		this.id = 4;
		this.name = "Defense Up";
		this.debuff = false;
		this.emoji = "<:dfup:572988965838258176>";
		this.statDesc = "Reduces incoming damage by **?**%";
		this.qualityList = [[20,30]];
	}

	// Override
	bind(animal,duration,tags){
		for(let i in animal.buffs){
			if(animal.buffs[i].id == this.id && animal.buffs[i].from.pid==this.from.pid){
				animal.buffs[i].duration += duration;
				return;
			}
		}

		super.bind(animal,duration,tags);
	}

	attacked(animal,attacker,damage,type,last){
		let logs = new Logs();

		let negate = damage[0]*this.stats[0]/100;
		damage[1] -= negate;

		logs.push(`[DFUP] ${animal.nickname} negated ${Math.round(negate)} damage`);
		return logs
	}
}
