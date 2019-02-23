const PassiveInterface = require('../PassiveInterface.js');
const WeaponInterface = require('../WeaponInterface.js');

/* +[10~25%] lifesteal*/

module.exports = class Lifesteal extends PassiveInterface{

	init(){
		this.id = 7;
		this.name = "Lifesteal";
		this.basicDesc= "All attacks heal you!";
		this.emojis = ["<:clifesteal:548729308038955018>","<:ulifesteal:548729400477089793>","<:rlifesteal:548729400493867018>","<:elifesteal:548729398644178944>","<:mlifesteal:548729400078893057>","<:llifesteal:548729400447729664>","<:flifesteal:548729400473026560>"];
		this.statDesc = "All damage you deal heals you for **?%** of the damage dealt!";
		this.qualityList = [[10,25]];
	}

	postAttack(animal,attackee,damage,type,last){
		let totalDamage = damage.reduce((a,b)=>a+b,0);
		WeaponInterface.heal(animal,totalDamage*this.stats[0]/100);
	}

}
