const WeaponInterface = require('../WeaponInterface.js');
const battleUtil = require('../util/battleUtil.js');

module.exports = class Shield extends WeaponInterface{

	init(){
		this.id = 5;
		this.name = "Defender's Aegis";
		this.basicDesc = "";
		this.emojis = ["<:cshield:546552025828163585>","<:ushield:546552083348848641>","<:rshield:546552083600506900>","<:eshield:546552026088210434>","<:mshield:546552083621609482>","<:lshield:546552083353174026>","<:fshield:546552026084016149>"];
		this.defaultEmoji = "<:shield:546552900986601493>";
		this.statDesc = "Adds a **taunt** buff to your animal for 2 turns";
		this.availablePassives = [1,2,3,4,5,6];
		this.passiveCount = 1;
		this.qualityList = [];
		this.manaRange = [250,150];
		this.buffList = [1];
	}

	preTurn(animal,ally,enemy,action){
		if(action!=battleUtil.weapon)
			return;

		/* If dead */
		if(animal.stats.hp[0]<=0) return;

		/* No mana */
		if(animal.stats.wp[0]<this.manaCost)
			return;

		/* check if we already have the buff or not */
		for(let i in animal.buffs)
			if(animal.buffs[i].id == this.buffList[0])
				return;

		/* Grab buff and bind it to our animal */
		let buff = this.getBuffs()[0];
		buff.bind(animal,2);

		/* deplete weapon points*/
		this.useMana(animal);

	}

	attackWeapon(me,team,enemy){
		/* Don't attack if we used an ability */
		for(let i in me.buffs)
			if(me.buffs[i].id == this.buffList[0]&&me.buffs[i].justCreated)
				return;
		return this.attackPhysical(me,team,enemy);
	}
}
