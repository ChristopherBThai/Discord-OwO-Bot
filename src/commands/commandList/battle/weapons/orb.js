/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const WeaponInterface = require('../WeaponInterface.js');
const Logs = require('../util/logUtil.js');

module.exports = class Orb extends WeaponInterface{

	init(){
		this.id = 6;
		this.name = "Orb of Potency";
		this.basicDesc = "";
		this.emojis = ["<:corb:548783035051409408>","<:uorb:548783216669097994>","<:rorb:548783216610246657>","<:eorb:548783035168849930>","<:morb:548783162646462464>","<:lorb:548783162566901770>","<:forb:548783035244478474>"];
		this.defaultEmoji = "<:orb:548783216379559966>";
		this.statDesc = "This weapon has no active ability, but comes with two passives! It deals 80% of your "+WeaponInterface.strEmoji+"STR and 80% of your "+WeaponInterface.magEmoji+"MAG as MIXED damage.";
		this.availablePassives = "all";
		this.passiveCount = 2;
		this.qualityList = [];
	}

	attackPhysical(me,team,enemy){
		if(me.stats.hp[0]<=0) return;

		/* Grab an enemy that I'm attacking */
		let attacking = WeaponInterface.getAttacking(me,team,enemy);
		if(!attacking) return;

		let logs = new Logs();

		/* Calculate damage */
		let damage = WeaponInterface.getMixedDamage(me.stats.att,.80,me.stats.mag,.80);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(me,attacking,damage,WeaponInterface.MIXED,{me,allies:team,enemies:enemy});

		logs.push(`[ORB] ${me.nickname} damaged ${attacking.nickname} for ${damage.amount} HP`, damage.logs);
		return logs;

	}

}
