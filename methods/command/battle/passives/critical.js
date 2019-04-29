const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Log = require('../util/logUtil.js');

module.exports = class Critical extends PassiveInterface{

	init(){
		this.id = 12;
		this.name = "Critical";
		this.basicDesc= "";
		this.emojis = ["<:ccritical:572285184251002912>","<:ucritical:572285186322989057>","<:rcritical:572285186293628939>","<:ecritical:572285186209742848>","<:mcritical:572285186398617600>","<:lcritical:572285186407137290>","<:fcritical:572285186226782211>"];
		this.statDesc = "Every attack has a **?%** chance to deal **?%** more damage.";
		this.qualityList = [[10,30],[25,50]];
	}

	attack(animal,attackee,damage,type,tags){
		if(Math.random()*100>this.stats[0]) return;

		let logs = new Log();

		let extraDamage = damage[0]*this.stats[1]/100;
		damage[1] += extraDamage;

		logs.push(`[CRIT] ${animal.nickname} dealt ${Math.round(extraDamage)} extra damage`);
		return logs;
	}

}
