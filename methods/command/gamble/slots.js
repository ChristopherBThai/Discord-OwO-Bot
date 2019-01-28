const CommandInterface = require('../../commandinterface.js');

const maxBet = 50000;
var slots = ["<:eggplant:417475705719226369>","<:heart:417475705899712522>","<:cherry:417475705178161162>","<:cowoncy:417475705912426496>","<:o_:417475705899843604>","<:w_:417475705920684053>"];
var moving = "<a:slot_gif:417473893368987649>";

module.exports = new CommandInterface({

	alias:["slots","slot","s"],

	args:"{amount}",

	desc:"Bet your money in the slot machine! Earn up to 10x your money!",

	example:["owo slots 1000","owo slots all","owo s 100"],

	related:["owo money","owo lottery","owo coinflip"],

	cooldown:15000,
	half:90,
	six:500,
	bot:true,

	execute: function(p){
		var global=p.global,msg=p.msg,args=p.args,con=p.con;
		//Check arguments
		var amount = 0;
		var all = false;
		if(args.length==0)
			amount = 1;
		else if(global.isInt(args[0])&&args.length==1)
			amount = parseInt(args[0]);
		else if(args.length==1&&args[0]=='all')
			all = true;
		else{
			p.send("**🚫 |** Invalid arguments!! :c",3000);
			return;
		}

		if(amount==0&&!all){
			p.send("**🚫 |** uwu.. you can't bet nothing silly!",3000);
			return;
		}else if(amount<0){
			p.send("**🚫 |** Do you want to lose even more money????",3000);
			return;
		}

		//Check if valid time and cowoncy
		var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			if(all&&result[0]!=undefined)
				amount = result[0].money
			if(maxBet&&amount>maxBet)
				amount = maxBet;
			if(result[0]==undefined||result[0].money<amount||result[0].money<=0){
				p.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
			}else{
				//Decide results
				var rslots = [];
				var rand = Math.random();
				var win = 0;
				var logging = 0;
				if(rand<=.20){//1x 20%
					win = amount;
					rslots.push(slots[0]);
					rslots.push(slots[0]);
					rslots.push(slots[0]);
					logging = 0;
				}else if(rand<=.40){ //2x 20%
					win = amount*2;
					rslots.push(slots[1]);
					rslots.push(slots[1]);
					rslots.push(slots[1]);
					logging = 1;
				}else if(rand<=.45){ //3x 5%
					win = amount*3;
					rslots.push(slots[2]);
					rslots.push(slots[2]);
					rslots.push(slots[2]);
					logging = 2;
				}else if(rand<=.475){ //4x 2.5%
					win = amount*4;
					rslots.push(slots[3]);
					rslots.push(slots[3]);
					rslots.push(slots[3]);
					logging = 3;
				}else if(rand<=.485){ //10x 1%
					win = amount*10;
					rslots.push(slots[4]);
					rslots.push(slots[5]);
					rslots.push(slots[4]);
					logging = 9;
				}else{
					logging = -1;
					var slot1 = Math.floor(Math.random()*(slots.length-1));
					var slot2 = Math.floor(Math.random()*(slots.length-1));
					var slot3 = Math.floor(Math.random()*(slots.length-1));
					if(slot3==slot1)
						slot2 = (slot1+Math.ceil(Math.random()*(slots.length-2)))%(slots.length-1);
					if(slot2==slots.length-2)
						slot2++;
					rslots.push(slots[slot1]);
					rslots.push(slots[slot2]);
					rslots.push(slots[slot3]);
				}
				var winmsg = (win==0)?"nothing... :c":"<:cowoncy:416043450337853441> "+(p.global.toFancyNum(win));

				var sql = "UPDATE cowoncy SET money = money + "+(win-amount)+" WHERE id = "+msg.author.id+" AND money >= "+amount+";";
				con.query(sql, function(err,result){
					if(err){console.error(err);return;}
					p.logger.value('cowoncy',(win-amount),['command:slots','id:'+msg.author.id]);
					p.logger.value('gamble',logging,['command:slots','id:'+msg.author.id]);
				});

				//Display slots
				var machine = "**`___SLOTS___  `**\n"+moving+" "+moving+" "+moving+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+(p.global.toFancyNum(amount))+"\n`|         |`\n`|         |`";
				msg.channel.send(machine)
				.then(message => setTimeout(function(){

				var machine = "**`___SLOTS___  `**\n"+rslots[0]+" "+moving+" "+moving+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+(p.global.toFancyNum(amount))+"\n`|         |`\n`|         |`";
				message.edit(machine)
				.then(message => setTimeout(function(){

				var machine = "**`___SLOTS___  `**\n"+rslots[0]+" "+moving+" "+rslots[2]+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+(p.global.toFancyNum(amount))+"\n`|         |`\n`|         |`";
				message.edit(machine)
				.then(message => setTimeout(function(){

				var machine = "**`___SLOTS___  `**\n"+rslots[0]+" "+rslots[1]+" "+rslots[2]+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+(p.global.toFancyNum(amount))+"\n`|         |`  and won "+winmsg+"\n`|         |`";
				message.edit(machine);


				},1000));
				},700));
				},1000))

				.catch(err => console.error(err));
				p.quest("gamble");
			}
		});
	}
});
