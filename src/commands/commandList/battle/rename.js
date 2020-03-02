/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const badwords = require('../../../../../tokens/badwords.json');

module.exports = new CommandInterface({

	alias:["rename"],

	args:"[animal] [name]",

	desc:"Rename an animal from your zoo!",

	example:["owo rename dog doggy"],

	related:["owo zoo","owo battle", "owo hunt"],

	permissions:["sendMessages"],

	cooldown:3000,
	half:200,
	six:500,

	execute: async function(p){
		if(p.args.length<2){
			p.errorMsg(", The correct command is `owo rename [animal] [name]`!");
			return;
		}

		var animal = p.args.shift();
		var input = p.args.join(" ");

		/* Validity check */
		animal = p.global.validAnimal(animal);
		if(!animal){
			p.errorMsg(", I couldn't find that animal! D:");
			return;
		}
		if(input.length>35){
			p.errorMsg(", The nickname is too long!",3000);
			return;
		}else if(input==""){
			p.errorMsg(", Invalid nickname!",3000);
			return;
		}

		/* Alter names to be appropriate */
		const { name, offensive } = p.global.filteredName(input);

		let sql = `UPDATE animal SET nickname = ? , offensive = ${offensive} WHERE id = ${p.msg.author.id} AND name = '${animal.value}'`;
		let result = await p.query(sql,[name]);

		if(result.affectedRows==0){
			p.errorMsg(", you do no own this pet!",3000);
		}else{
			p.replyMsg("🌱",", you successfully named your pet to **"+((animal.uni)?animal.uni:animal.value)+" "+name+"**!");
		}
	}

})
