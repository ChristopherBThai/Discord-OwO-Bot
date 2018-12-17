const Error = require('../../../handler/errorHandler.js');
const PassiveInterface = require('./PassiveInterface.js');
const requireDir = require('require-dir');
const passiveDir = requireDir('./passives');
var passives = {};
for(var key in passiveDir){
	if(passiveDir[key] instanceof PassiveInterface){
		let passive = passiveDir[key];
		if(!passive.disabled)
			passives[passive.id] = passive;
	}
}

module.exports = class WeaponInterface{

	constructor(args){
		this.id = args.id; 
		this.name = args.name; 
		this.desc = args.desc; 
		this.passives = args.passives; 
		this.passiveCount = args.passiveCount;
		this.emoji = args.emoji;
		this.init = args.init;
		this.qualityList= args.qualityList;

		for(var i in this)
			if(this[i]==undefined)
				throw new Error("Cound not initialize weapon with id"+args.id);

		this.disabled = args.disabled

		for(var i=0;i<this.passives.length;i++)
			if(!(this.passives[i] in passives))
				throw new Error("Invalid passive id "+this.passives[i]);
	}

	randomPassives(){
		let randPassives = [];
		for(var i=0;i<this.passiveCount;i++){
			let rand = Math.floor(Math.random()*this.passives.length);
			let passive = this.passives[rand];
			passive = passives[passive];
			if(!passive)
				throw new Error("Could not get passive["+this.passives[rand]+"] for weapon["+this.id+"]");
			randPassives.push(passive.init());
		}
		return randPassives;
	}

	randomQualities(){
		var qualities = [];
		for(var i=0;i<this.qualityList.length;i++)
			qualities.push(Math.trunc(Math.random()*101));
		return qualities;
	}

	toStats(qualities){
		if(qualities.length != this.qualityList.length)
			throw new Error("Array size does not match in toStats. Weapon id:"+this.id);
		var stats = [];
		for(var i=0;i<qualities.length;i++){
			let quality = qualities[i];
			if(quality>100) quality = 100;
			if(quality<0) quality = 0;
			let min = this.qualityList[i][0];
			let max = this.qualityList[i][1];

			/* rounds to 2 decimal places */
			stats.push(Math.round((min + (max-min)*(quality/100))*100)/100);
		}
		return stats;
	}

	clone(passives,qualities,stats,desc){
		let avgQuality = 0;
		if(passives.length>0){
			let combinedQuality = passives[0].qualities;
			for(var i=1;i<passives.length;i++)
				combinedQuality = combinedQuality.concat(passives[i]);
			combinedQuality = combinedQuality.concat(qualities);
			avgQuality = combinedQuality.reduce((a,b)=>a+b,0)/combinedQuality.length;
		}else{
			avgQuality = qualities.reduce((a,b)=>a+b,0)/qualities.length;
		}
		return {id:this.id,name:this.name,desc:this.desc,
			qualities,
			sqlStat:qualities.join(","),
			avgQuality,
			desc,
			stats,
			passives
		}
	}
}

