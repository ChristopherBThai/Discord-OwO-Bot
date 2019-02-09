const WeaponInterface = require('../WeaponInterface.js');

module.exports = class Rune extends WeaponInterface{

	init(){
		this.id = 4;
		this.disabled = true;
		this.name = "Rune of the Forgotten";
		this.basicDesc = "This item is rewarded to those who played owo bot before the new battle update!\nThis item will increase all stats.";
		this.emojis = ["<:crune:543662985558884363>","<:urune:543662986384900107>","<:rrune:543662986565255168>","<:erune:543662986393419787>","<:mrune:543662986749804544>","<:lrune:543662986837884928>","<:frune:543662986753998874>"];
		this.defaultEmoji = "<:rune:543662986431037481>";
		this.statDesc = "Increase ALL stats by ?%. This weapon does not have an active ability.";
		this.availablePassives = [];
		this.passiveCount = 0;
		this.qualityList = [[5,15]];
	}

	alterStats(stats){
		super.alterStats(stats);
		let bonus = stats.hp[1]*(this.stats[0]/100);
		stats.hp[3] += bonus;
		bonus = stats.att[0]*(this.stats[0]/100);
		stats.att[1] += bonus;
		bonus = stats.pr[0]*(this.stats[0]/100);
		stats.pr[1] += bonus;
		bonus = stats.wp[1]*(this.stats[0]/100);
		stats.wp[3] += bonus;
		bonus = stats.mag[0]*(this.stats[0]/100);
		stats.mag[1] += bonus;
		bonus = stats.mr[0]*(this.stats[0]/100);
		stats.mr[1] += bonus;
	}

}
