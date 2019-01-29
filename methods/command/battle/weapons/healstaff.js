const WeaponInterface = require('../WeaponInterface.js');

module.exports = class HealStaff extends WeaponInterface{

	init(){
		this.id = 2;
		this.name = "Healing Staff";
		this.basicDesc = "A staff that can heal allies!";
		this.emojis = ["<:chealstaff:535283616016498688>","<:uhealstaff:535283616096321547>","<:rhealstaff:535283616100646912>","<:ehealstaff:535283615664439300>","<:mhealstaff:535283616242991115>","<:lhealstaff:535283616209567764>","<:fhealstaff:535283617019068426>"]
		this.defaultEmoji = "<:healstaff:538196865410138125>";
		this.statDesc = "Heals **?%** of your "+WeaponInterface.magEmoji+"MAG to the lowest health ally";
		this.availablePassives = [1,2,3,4,5,6];
		this.passiveCount = 1;
		this.qualityList = [[50,100]];
		this.manaRange = [250,150];
	}

	attackWeapon(me,team,enemy){
		if(me.stats.hp[0]<=0) return;

		/* No mana */
		if(me.stats.wp[0]<this.manaCost)
			return this.attackPhysical(me,team,enemy);
		
		/* Grab lowest hp */
		let lowest = WeaponInterface.getLowestHp(team);
		if(!lowest) return;

		/* Calculate heal */
		let heal = WeaponInterface.getDamage(me.stats.mag,this.stats[0]/100);

		/* Heal ally */
		heal = WeaponInterface.heal(lowest,heal);

		/* Everyone at full health */
		if(heal===0) return this.attackPhysical(me,team,enemy);

		/* deplete weapon points*/
		this.useMana(me);

		return `${me.nickname?me.nickname:me.animal.name}\`heals ${heal}\`${WeaponInterface.hpEmoji}\` to \`${lowest.nickname?lowest.nickname:lowest.animal.name}`
	}
}
