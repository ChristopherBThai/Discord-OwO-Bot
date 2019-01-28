const WeaponInterface = require('../WeaponInterface.js');

module.exports = class Bow extends WeaponInterface{

	init(){
		this.id = 3;
		this.name = "Bow";
		this.basicDesc = "An accurate bow that will deal alot of damage to a single opponent";
		this.emojis = ["<:cbow:535283611260420096>","<:ubow:535283613198188594>","<:rbow:535283613374349316>","<:ebow:535283614334844937>","<:mbow:535283613802168323>","<:lbow:535283613391126529>","<:fbow:535283614099832872>"];
		this.defaultEmoji = "<:bow:538196864277807105>";
		this.statDesc = "Deals **?%** of your "+WeaponInterface.magEmoji+"MAG to a random opponent";
		this.availablePassives = [1,2,3,4,5,6];
		this.passiveCount = 1;
		this.qualityList = [[90,150]];
		this.manaRange = [250,150];
	}

	attackWeapon(me,team,enemy){
		if(me.stats.hp[0]<=0) return;

		/* No mana */
		if(me.stats.wp[0]<this.manaCost)
			return this.attackPhysical(me,team,enemy);
		
		/* Grab an enemy that I'm attacking */
		let alive = WeaponInterface.getAlive(enemy);
		let attacking = enemy[alive[Math.trunc(Math.random()*alive.length)]];
		if(!attacking) return;

		/* Calculate damage */
		let damage = WeaponInterface.getDamage(me.stats.mag,this.stats[0]/100);

		/* Deal damage */
		damage = WeaponInterface.inflictDamage(attacking,damage,WeaponInterface.MAGICAL);

		/* deplete weapon points*/
		this.useMana(me);

		return `${me.nickname?me.nickname:me.animal.name}\`deals ${damage}\`${WeaponInterface.magEmoji}\` to \`${attacking.nickname?attacking.nickname:attacking.animal.name}`
	}
}
