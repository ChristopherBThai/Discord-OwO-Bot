const BuffInterface = require('../BuffInterface.js');
const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Poison extends BuffInterface{

	init(){
		this.id = 3;
		this.name = "Flame";
		this.debuff = true;
		this.emoji = "<:flame:572657585400971277>";
		this.statDesc = "Deals **?%** of your "+WeaponInterface.magEmoji+" MAG at the end of the turn. Apply flame on a target that already has flame will explode and deal **?%** damage to the target.";
		this.qualityList = [[20,40],[40,60]];
	}

	// Override
	bind(animal,duration,tags){
		if(tags.flame) return;
		let logs = new Logs();
		for(let i in animal.buffs){
			if(animal.buffs[i].id == this.id && animal.buffs[i].from.pid==this.from.pid){
				animal.buffs.splice(animal.buffs.indexOf(this),1);
				let damage = WeaponInterface.getDamage(this.from.stats.mag,this.stats[1]/100);
				damage = WeaponInterface.inflictDamage(this.from,animal,damage,WeaponInterface.MAGICAL,{...tags,flame:true});
				logs.push(`[FLAME] Exploded and damaged ${animal.nickname} for ${damage.amount} HP`, damage.logs);
			}
		}

		super.bind(animal,duration,tags);
		return logs;
	}

	postTurn(animal,ally,enemy,action){
		if(!this.from) return;

		let logs = new Logs();

		// Calculate and deal damage
		let damage = WeaponInterface.getDamage(this.from.stats.mag,this.stats[0]/100);
		damage = WeaponInterface.inflictDamage(this.from,animal,damage,WeaponInterface.MAGICAL,{me:this.from,allies:enemy,enemies:ally});
		logs.push(`[FLAME] ${this.from.nickname} damaged ${animal.nickname} for ${damage.amount} HP`, damage.logs);
		
		super.postTurn(animal,ally,enemy,action);

		return logs;
	}

}
