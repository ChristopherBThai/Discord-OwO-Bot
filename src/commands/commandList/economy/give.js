/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({

	alias:["give","send"],

	args:"{@user} {amount}",

	desc:"Send some cowoncy to other users! This command must contain a @mention and an amount",

	example:["owo give @Scuttler 25"],

	related:["owo money"],

	permissions:["sendMessages"],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: async function(p){
		let msg=p.msg, args=p.args, con=p.con, global=p.global;
		let amount=-1, id="", invalid=false;

		//Grab ID and Amount
		for(var i = 0;i<args.length;i++){
			if(global.isInt(args[i])&&amount==-1)
				amount = parseInt(args[i]);
			else if(global.isUser(args[i])&&id=="")
				id = args[i].match(/[0-9]+/)[0];
			else
				invalid = true;
		}

		//Check for valid amount/id
		if(invalid||id==""||amount<=0){
			p.send("**🚫 | "+msg.author.username+"**, Invalid arguments! :c",3000);
			return;
		}

		if(amount>1000000) amount = 1000000;


		//Check if valid user
		let user = await p.getMention(id);
		if(user==undefined){
			p.send("**🚫 | "+msg.author.username+"**, I could not find that user!",3000);
			return
		}else if(user.bot){
			p.send("**🚫 | "+msg.author.username+"**, You can't send cowoncy to a bot silly!",3000);
			return;
		}else if(user.id==msg.author.id){
			p.send("**💳 | "+msg.author.username+"** sent **"+(p.global.toFancyNum(amount))+" cowoncy** to... **"+user.username+"**... *but... why?*");
			return;
		}

		//Gives money
		var sql = `SELECT money FROM cowoncy WHERE id = ${msg.author.id} AND money >= ${amount};
			CALL CowoncyTransfer(${msg.author.id},${id},${amount})`;
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			if(rows[0][0]&&rows[0][0].money)
				p.logger.value('total_cowoncy',rows[0][0].money,['id:'+msg.author.id]);
			if(rows[0][0]==undefined||rows[0][0].money<amount){
				p.send("**🚫 |** Silly **"+msg.author.username+"**, you don't have enough cowoncy!",3000);
			}else{
				p.logger.value('cowoncy',(amount),['command:given','id:'+id,'by:'+msg.author.id]);
				p.logger.value('cowoncy',(amount*-1),['command:give','id:'+msg.author.id,'to:'+id]);
				p.send("**💳 | "+msg.author.username+"** sent **"+(p.global.toFancyNum(amount))+" cowoncy** to **"+user.username+"**!");
			}
		});
	}

})
