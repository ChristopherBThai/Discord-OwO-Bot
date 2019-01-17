const WeaponInterface = require('../WeaponInterface.js');

module.exports = class GreatSword extends WeaponInterface{

	init(){
		this.id = 1;
		this.name = "Great Sword";
		this.basicDesc = "A great sword that can slash a wide range of opponents";
		this.emojis = ["<:cgreatsword:535279248253124638>","<:ugreatsword:535279249028808735>","<:rgreatsword:535279249129472014>","<:egreatsword:535279248991191081>","<:mgreatsword:535279249125539858>","<:lgreatsword:535279249058168852>","<:fgreatsword:535279248923951116>"]
		this.statDesc = "Deals ? magic damage to a all opponents";
		this.availablePassives = [1,2,3,4,5,6];
		this.passiveCount = 1;
		this.qualityList = [[35,75]];
	}
}
