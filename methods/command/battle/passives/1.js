const PassiveInterface = require('../PassiveInterface.js');


module.exports = new PassiveInterface({

	id:1,
	name:"Strength",
	desc:"Increases your strength",

	/* +[5~20%] increase in strength */
	qualityList:[[5,20]],

	init:function(){
		let qualities = this.randomQualities();
		let stats = this.toStats(qualities);
		let desc = "Increases your strength by "+stats[0]+"%";

		let result = this.clone(qualities,stats,desc);

		return result;
	}

});
