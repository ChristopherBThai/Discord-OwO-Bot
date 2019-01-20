const PassiveInterface = require('../PassiveInterface.js');

/* +[5~20%] increase in magical resistance*/

module.exports = class MagicalResistance extends PassiveInterface{

	init(){
		this.id = 6;
		this.name = "Magical Resistance";
		this.basicDesc= "Increases your Magical Resistance";
		this.emojis = ["<:catt:535290412143738880>","<:uatt:535290420822016010>","<:ratt:535290420255522855>","<:eatt:535290419722977280>","<:matt:535290420150665216>","<:latt:535290420029030400>","<:fatt:535290419903463436>"];
		this.statDesc = "Increases your <:mr:531616156226945024>MR by **?%**";
		this.qualityList = [[5,20]];
	}

	alterStats(stats){
		let bonus = stats.mr[0]*(this.stats[0]/100);
		stats.mr[1] += bonus;
	}

}
