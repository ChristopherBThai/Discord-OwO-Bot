const ranks = [0.20,0.20,0.20,0.20,0.14,0.05,0.01];
module.exports = class PassiveInterface{

	constructor(qualities,noCreate){

		this.init();
		if(noCreate) return;

		if(!qualities) qualities = this.randomQualities();

		let avgQuality = qualities.reduce((a,b)=>a+b,0)/qualities.length;
		let emoji = this.getEmoji(avgQuality);
		let stats = this.toStats(qualities);
		/* Construct desc */
		let desc = this.statDesc;
		for(var i=0;i<stats.length;i++){
			desc = desc.replace('?',stats[i]);
		}
		/* Check if it has enough emojis */
		if(this.emojis.length!=7) throw new Error(`[${args.id}] does not have 7 emojis`);

		this.avgQuality = avgQuality;
		this.qualities = qualities;
		this.emoji = emoji;
		this.stats = stats;
		this.desc = desc;
		this.sqlStat = qualities.join(",");
	}

	randomQualities(){
		var qualities = [];
		for(var i=0;i<this.qualityList.length;i++)
			qualities.push(Math.trunc(Math.random()*101));
		return qualities;
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

	alterStats(stats){}

	static get getID(){return new this(null,true).id}
}

