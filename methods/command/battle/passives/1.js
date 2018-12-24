const PassiveInterface = require('../PassiveInterface.js');


module.exports = new PassiveInterface({

	id:1,
	name:"Strength",
	desc:"Increases your strength",
	emojis:["<:cstrength:526207502078050315>","<:ustrength:526207502480703489>","<:rstrength:526207503311306752>","<:estrength:526207502472183818>","<:mstrength:526207502531166208>","<:lstrength:526207502300217380>","<:fstrength:526207502250016769>"],

	statDesc:"Increases your strength by ?%",

	/* +[5~20%] increase in strength */
	qualityList:[[5,20]],

	init:function(){
		let qualities = this.randomQualities();
		let result = this.clone(qualities);

		return result;
	}

});
