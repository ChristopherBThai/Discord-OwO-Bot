ranks = [0.20,0.20,0.20,0.20,0.14,0.05,0.01];
module.exports = class PassiveInterface{

	constructor(args){
		/* Passive id */
		this.id = args.id 
		/* Passive name */
		this.name = args.name 
		/* Passive description*/
		this.desc = args.desc 
		/* Number of rand stats */
		this.qualityList = args.qualityList;
		/* Emoji */
		this.emojis= args.emojis;
		if(this.emojis.length!=7) throw new Error(`[${args.id}] does not have 7 emojis`);

		this.statDesc = args.statDesc;

		/* Initializes passive */
		/* Needs to return itself + random quality */
		this.init = args.init

		/* Check if args exists */
		for(var i in this)
			if(this[i]==undefined)
				throw new Error("Cound not initialize weapon with id"+args.id);

		this.disabled = args.disabled
	}

	randomQualities(){
		var qualities = [];
		for(var i=0;i<this.qualityList.length;i++)
			qualities.push(Math.trunc(Math.random()*101));
		return qualities;
	}

	clone(qualities,stats,desc){
		let avgQuality = qualities.reduce((a,b)=>a+b,0)/qualities.length;
		var emoji = this.getEmoji(avgQuality);
		var stats = this.toStats(qualities);

		/* Construct desc */
		var desc = this.statDesc;
		for(var i=0;i<stats.length;i++){
			desc = desc.replace('?',stats[i]);
		}

		return {id:this.id,name:this.name,desc:this.desc,
			qualities,
			sqlStat:qualities.join(","),
			avgQuality,
			desc,
			stats,
			emoji
		}
	}

	getEmoji(quality){
		/* If there are multiple quality, get avg */
		if(typeof quality == "string"){
			quality = parseInt(quality.split(','));
			quality = quality.reduce((a,b)=>a+b,0)/quality.length;
		}
		
		quality /= 100;

		/* Get correct rank */
		var count = 0;
		for(var i=0;i<ranks.length;i++){
			count += ranks[i];
			if(quality <= count)
				return this.emojis[i];
		}
		return this.emojis[0];

	}

	toStats(qualities){
		if(qualities.length != this.qualityList.length)
			throw new Error("Array size does not match in toStats. Passive id:"+this.id);
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
}

