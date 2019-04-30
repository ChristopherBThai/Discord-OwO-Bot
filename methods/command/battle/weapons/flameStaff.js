const WeaponInterface = require('../WeaponInterface.js');
const battleUtil = require('../util/battleUtil.js');
const Logs = require('../util/logUtil.js');

module.exports = class FStaff extends WeaponInterface{

	init(){
		this.id = 9;
		this.name = "Flame Staff";
		this.basicDesc = "";
		this.emojis = [""];
		this.defaultEmoji = "";
		this.statDesc = "Deals **?%** of your MAG to a random enemy and applies **flame** for 3 turns";
		this.availablePassives = "all";
		this.passiveCount = 1;
		this.qualityList = [[60,80]];
		this.manaRange = [200,100];
		this.buffList = [3];
	}

	attackWeapon(me,team,enemy){
		if(me.stats.hp[0]<=0) return;

		/* No mana */
		if(me.stats.wp[0]<this.manaCost)
			return this.attackPhysical(me,team,enemy);
		
		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me,team,enemy);
		if(!attacking) return;

		let logs = new Logs();

		/* deplete weapon points*/
		let mana = WeaponInterface.useMana(me,this.manaCost,me,{me,allies:team,enemies:enemy});
		let manaLogs = new Logs();
		manaLogs.push(`[PDAG] ${me.nickname} used ${mana.amount} WP`,mana.logs);

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.mag,this.stats[0]/100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me,attacking,damage,WeaponInterface.MAGICAL,{me,allies:team,enemies:enemy});
		let buff = this.getBuffs(me)[0];
		let buffLogs = buff.bind(attacking,3,{me,allies:team,enemies:enemy});
		logs.push(`[PDAG] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP and applied flame`, damage.logs);
		logs.addSubLogs(buffLogs);

		logs.addSubLogs(manaLogs);

		return logs
	}
}
