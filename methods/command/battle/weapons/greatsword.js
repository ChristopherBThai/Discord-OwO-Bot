const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class GreatSword extends WeaponInterface{

	init(){
		this.id = 1;
		this.name = "Great Sword";
		this.basicDesc = "A great sword that can slash a wide range of opponents";
		this.emojis = ["<:cgreatsword:535279248253124638>","<:ugreatsword:535279249028808735>","<:rgreatsword:535279249129472014>","<:egreatsword:535279248991191081>","<:mgreatsword:535279249125539858>","<:lgreatsword:535279249058168852>","<:fgreatsword:535279248923951116>"];
		this.defaultEmoji = "<:greatsword:538196865129250817>";
		this.statDesc = "Deals **?%** of your "+WeaponInterface.magEmoji+"MAG to all opponents";
		this.availablePassives = "all";
		this.passiveCount = 1;
		this.qualityList = [[35,65]];
		this.manaRange = [250,150];
	}

	attackWeapon(me,team,enemy){
		if(me.stats.hp[0]<=0) return;

		/* No mana */
		if(me.stats.wp[0]<this.manaCost)
			return this.attackPhysical(me,team,enemy);

		let logs = new Logs();

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.mag,this.stats[0]/100);

		/* Deal damage to all opponents*/
		for(let i=0;i<enemy.length;i++){
			if(enemy[i].stats.hp[0]>0){
				let dmg = WeaponInterface.inflictDamage(me,enemy[i],damage,WeaponInterface.MAGICAL);
				logs.push(`[GSWORD] ${me.nickname} damaged ${enemy[i].nickname} for ${dmg.amount} HP`, dmg.logs);
			}
		}

		/* deplete weapon points*/
		let mana = this.useMana(me);
		logs.push(`[BOW] ${me.nickname} used ${mana.amount} WP`,mana.logs);

		return logs;

	}
}
