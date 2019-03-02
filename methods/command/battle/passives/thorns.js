const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');

/* +[10~25%] thorns*/

module.exports = class Thorns extends PassiveInterface{

	init(){
		this.id = 8;
		this.name = "Thorns";
		this.basicDesc= "Reflect a percent of the damage dealt to you!";
		this.emojis = ["<:cthorns:548729308030566426>","<:uthorns:548729400661639168>","<:rthorns:548729400628346900>","<:ethorns:548729400632410122>","<:mthorns:548729400607113216>","<:lthorns:548729400649187338>","<:fthorns:548729400468963329>"];
		this.statDesc = "Reflect **?**% of the damage dealt to you as true damage";
		this.qualityList = [[15,35]];
	}

	postAttacked(animal,attacker,damage,type,last){
		/* Ignore if last flag is true */
		if(last) return;
		let totalDamage = damage.reduce((a,b)=>a+b,0)*this.stats[0]/100;
		if(totalDamage<1) return;
		WeaponInterface.inflictDamage(animal,attacker,totalDamage,WeaponInterface.TRUE,true);
	}
}
