const CommandInterface = require('../../commandinterface.js');

const badwords = require('../../../../tokens/badwords.json');

module.exports = new CommandInterface({
	
	alias:["rename"],

	args:"[animal] [name]",

	desc:"Rename an animal from your zoo!",

	example:["owo rename dog doggy"],

	related:["owo zoo","owo battle", "owo hunt"],

	cooldown:3000,
	half:200,
	six:500,

	execute: async function(p){
		if(p.args.length<2){
			p.errorMsg(", The correct command is `owo rename [animal] [name]`!");
			return;
		}

		var animal = p.args.shift();
		var name = p.args.join(" ");

		/* Validity check */
		animal = p.global.validAnimal(animal);
		if(!animal){
			p.errorMsg(", I coulnd't find that animal! D:");
			return;
		}
		if(name.length>35){
			p.errorMsg(", The nickname is too long!",3000);
			return;
		}else if(name==""){
			p.errorMsg(", Invalid nickname!",3000);
			return;
		}

		/* Alter names to be appropriate */
		var offensive = 0;
		var shortnick = name.replace(/\s/g,"").toLowerCase();
		for(var i=0;i<badwords.length;i++){
			if(shortnick.includes(badwords[i]))
				offensive = 1;
		}
		name = name.replace(/https:/gi,"https;");
		name = name.replace(/http:/gi,"http;");
		name = name.replace(/@everyone/gi,"everyone");
		name = name.replace(/<@!?[0-9]+>/gi,"User");
		name = name.replace(/[*`]+/gi,"'");

		let sql = `UPDATE animal SET nickname = ? WHERE id = ${p.msg.author.id} AND name = '${animal.value}'`;
		let result = await p.query(sql,[name]);

		if(result.affectedRows==0){
			p.errorMsg(", you do no own this pet!",3000);
		}else{
			p.replyMsg("🌱",", you successfully named your pet to **"+((animal.uni)?animal.uni:animal.value)+" "+name+"**!");
		}
	}

})
