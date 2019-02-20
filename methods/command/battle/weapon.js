const CommandInterface = require('../../commandinterface.js');

const weaponUtil = require('./util/weaponUtil.js');
const battleUtil = require('./util/battleUtil.js');

module.exports = new CommandInterface({
	
	alias:["weapon","w","weapons","wep"],

	args:"",

	desc:"",

	example:[],

	related:["owo crate","owo battle"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){

		/* Display weapons */
		if(p.args.length==0){
			await weaponUtil.display(p);

		/* Describe weapon */
		}else if(p.args.length==1){
			var uwid = p.args[0];
			if(p.global.isInt(uwid))
				await weaponUtil.describe(p,uwid);
			else
				p.errorMsg(", Invalid arguments! Use `owo weapon {uniqueWeaponId}`");

		/* Unequip weapon */
		}else if(p.args.length==2&&(p.args[0]=="unequip"||p.args[0]=="ue")){
			/* No changing while in battle */
			if((await battleUtil.inBattle(p))){
				p.errorMsg(", You cannot change your weapon while you're in battle! Please finish your `owo battle`!");
				return;
			}

			var uwid = p.args[1];
			if(p.global.isInt(uwid))
				await weaponUtil.unequip(p,uwid);
			else
				p.errorMsg(", Invalid arguments! Use `owo weapon unequip {weaponId}`");

		/* Equip weapon */
		}else if(p.args.length==2){
			/* No changing while in battle */
			if((await battleUtil.inBattle(p))){
				p.errorMsg(", You cannot change your weapon while you're in battle! Please finish your `owo battle`!");
				return;
			}

			var uwid = p.args[0];
			var pet = p.args[1];

			if(!p.global.isInt(uwid)){
					p.errorMsg(", Invalid arguments! Use `owo weapon {uniqueWeaponId} {animalPos|animal}`");
					return;
			}else if(p.global.isInt(pet)){
				pet = parseInt(pet);
				if(pet<1||pet>3){
					p.errorMsg(", Invalid arguments! Use `owo weapon {uniqueWeaponId} {animalPos|animal}`");
					return;
				}
			}else{
				pet = p.global.validAnimal(pet);
				if(!pet){
					p.errorMsg(", Invalid arguments! Use `owo weapon {uniqueWeaponId} {animalPos|animal}`");
					return;
				}
			}

			await weaponUtil.equip(p,uwid,pet);

		/* Else */
		}else{
			p.errorMsg(", Invalid arguments",3000);
		}
	}

})
