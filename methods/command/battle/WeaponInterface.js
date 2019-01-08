const Error = require('../../../handler/errorHandler.js');
const PassiveInterface = require('./PassiveInterface.js');
const requireDir = require('require-dir');
const passiveDir = requireDir('./passives');
var passives = {};
for(var key in passiveDir){
	let passive = passiveDir[key];
	if(!passive.disabled) passives[passive.getID] = passive;
}
const ranks = [[0.20,"Common","<:common:416520037713838081>"],[0.20,"Uncommon","<:uncommon:416520056269176842>"],[0.20,"Rare","<:rare:416520066629107712>"],[0.20,"Epic","<:epic:416520722987614208>"],[0.14,"Mythical","<:mythic:416520808501084162>"],[0.05,"Legendary","<a:legendary:417955061801680909>"],[0.01,"Fabled","<a:fabled:438857004493307907>"]];

module.exports = class WeaponInterface{

	/* Constructor */
	constructor(passives,qualities,noCreate){

		this.init();
		if(noCreate) return;

		/* Get random vars if not present */
		if(!passives) passives = this.randomPassives();
		if(!qualities) qualities = this.randomQualities();

		/* Construct stats */
		let stats = this.toStats(qualities);

		/* Get the quality of the weapon */
		let avgQuality = 0;
		if(passives.length>0){
			let totalQualities = qualities.reduce((a,b)=>a+b,0);
			let qualityCount = qualities.length;
			for(var i=1;i<passives.length;i++){
				totalQualities += passives[i].qualities.reduce((a,b)=>a+b,0);
				qualityCount += passives[i].qualities.length;
			}
			avgQuality = totalQualities/qualityCount;
		}else{
			avgQuality = qualities.reduce((a,b)=>a+b,0)/qualities.length;
		}
		
		/* Determine rank */
		let rank = 0;
		for(var i=0;i<ranks.length;i++){
			rank += ranks[i][0];
			if(avgQuality/100<=rank){
				rank =  ranks[i];
				i = ranks.length;
			}else if(i==ranks.length-1){
				rank = ranks[0];
			}
		}
		rank = {
			name: rank[1],
			emoji: rank[2]
		}

		/* Construct desc */
		let desc = this.statDesc;
		for(var i=0;i<stats.length;i++){
			desc = desc.replace('?',stats[i]);
		}

		this.weaponQuality = qualities.reduce((a,b)=>a+b,0)/qualities.length;
		this.qualities = qualities;
		this.sqlStat = qualities.join(",");
		this.avgQuality = avgQuality;
		this.desc = desc;
		this.stats = stats;
		this.passives = passives;
		this.rank = rank;
	}

	/* Alters the animal's stats */
	alterStats(stats){
		for(var i=0;i<this.passives.length;i++)
			this.passives[i].alterStats(stats);
	}

	/* Grabs a random passive(s) */
	randomPassives(){
		let randPassives = [];
		for(var i=0;i<this.passiveCount;i++){
			let rand = Math.floor(Math.random()*this.availablePassives.length);
			let passive = this.availablePassives[rand];
			passive = passives[passive];
			if(!passive)
				throw new Error("Could not get passive["+this.availablePassives[rand]+"] for weapon["+this.id+"]");
			randPassives.push(new passive());
		}
		return randPassives;
	}

	/* Inits random qualities */
	randomQualities(){
		var qualities = [];
		for(var i=0;i<this.qualityList.length;i++)
			qualities.push(Math.trunc(Math.random()*101));
		return qualities;
	}

	/* Converts qualities to stats */
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

	/* Actions */
	/* Physical attack */
	attackPhysical(me,team,enemy){
		WeaponInterface.basicAttack(me,team,enemy);
	}

	/* Weapon attack */
	attackWeapon(me,team,enemy){
		WeaponInterface.basicAttack(me,team,enemy);
	}

	/* Get list of alive animals */
	static getAlive(team){
		let alive = [];
		for(var i in team)
			if(team[i].stats.hp[0]>0)
				alive.push(i);
		return alive;
	}

	/* Basic attack when animal has no weapon */
	static basicAttack(me,team,enemy){
		if(me.stats.hp<=0) return;
		
		/* Grab an enemy that I'm attacking */
		let alive = WeaponInterface.getAlive(enemy);
		let attacking = enemy[alive[Math.trunc(Math.random()*alive.length)]];

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.att);

		/* Deal damage */
		attacking.stats.hp[0] -= damage;
	}

	static getDamage(stat,multiplier=1){
		return Math.round(multiplier*(stat[0]+stat[1]+Math.random()*50-25));
	}

	static get allPassives(){return passives}
	static get getID(){return new this(null,null,true).id}
	static get getName(){return new this(null,null,true).name}
	static get getDesc(){return new this(null,null,true).basicDesc}
	static get getEmoji(){return new this(null,null,true).emoji}
}
