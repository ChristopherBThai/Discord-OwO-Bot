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
		return {id:this.id,name:this.name,desc:this.desc,
			qualities,
			sqlStat:qualities.join(","),
			avgQuality,
			desc,
			stats
		}
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

