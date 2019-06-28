/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const mathEmoji = '<a:naruhodo:593971680737624065>';

const workerpool = require('workerpool');
const pool = workerpool.pool(__dirname+'/mathWorker.js');

module.exports = new CommandInterface({

	alias:["math","calc","calculate"],

	args:"{equation}",

	desc:"Let me do your math homework!",

	example:["owo math 2 + 2"],

	related:[],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		pool.exec('compute',[p.args.join(" ")])
			.timeout(1000)
			.then(function(result){
				if(result.mathjs){
					if(result.data)
						result = result.data+"";
					else if(result.entries)
						result = result.entries+"";
					if(result.length>1000)
						p.replyMsg(mathEmoji,", the answer is: **"+result.substr(0,1000)+"**...");
					else
						p.replyMsg(mathEmoji,", the answer is: **"+result+"**");
				}else if(typeof result == 'object')
					p.replyMsg(mathEmoji,", the answer is: **"+JSON.stringify(result)+"**");
				else
					p.replyMsg(mathEmoji,", the answer is: **"+result+"**");
			}).catch(function(err){
				if(err.message=='Promise timed out after 1000 ms')
					p.errorMsg(", that equation is too difficult for me... :c",3000);
				else
					p.errorMsg("... I don't think that's an equation silly head",3000);
			}).then(function(){
				pool.terminate();
			});


	}

})

