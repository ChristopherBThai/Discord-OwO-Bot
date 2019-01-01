const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in strength */

module.exports = class Strength extends PassiveInterface{

	init(){
		this.id = 1;
		this.name = "Strength";
		this.basicDesc= "Increases your strength";
		this.emojis = ["<:cstrength:526207502078050315>","<:ustrength:526207502480703489>","<:rstrength:526207503311306752>","<:estrength:526207502472183818>","<:mstrength:526207502531166208>","<:lstrength:526207502300217380>","<:fstrength:526207502250016769>"];
		this.statDesc = "Increases your strength by ?%";
		this.qualityList = [[5,20]];
	}

	alterStats(stats){
		let bonus = stats.att[0]*(this.stats[0]/100);
		stats.att[1] += bonus;
	}

}
