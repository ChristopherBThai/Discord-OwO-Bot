/**
 * Slot machine!
 */

const global = require('./global.js');

var slots = ["<:eggplant:417475705719226369>","<:heart:417475705899712522>","<:cherry:417475705178161162>","<:cowoncy:417475705912426496>","<:o_:417475705899843604>","<:w_:417475705920684053>"];
var moving = "<a:slot_gif:417473893368987649>";

/**
 * Slots
 */
exports.slots = function(con,msg,args){
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
		msg.channel.send("**🚫 |** Invalid arguments!! :c")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	if(amount==0&&!all){
		msg.channel.send("**🚫 |** uwu.. you can't bet nothing silly!")
			.catch(err => console.error(err));
		return;
	}else if(amount<0){
		msg.channel.send("**🚫 |** Do you want to lose even more money????")
			.catch(err => console.error(err));
		return;
	//}else if(amount>1000){
	//	amount = 1000;
	}

	//Check if valid time and cowoncy
	var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err) throw err;
		if(all&&result[0]!=undefined)
			amount = result[0].money
		if(result[0]==undefined||result[0].money<amount||result[0].money<=0){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
		}else{
			//Decide results
			var rslots = [];
			var rand = Math.random();
			var win = 0;
			if(rand<=.19){//1x 19%
				win = amount;
				rslots.push(slots[0]);
				rslots.push(slots[0]);
				rslots.push(slots[0]);
			}else if(rand<=.33){ //2x 14%
				win = amount*2;
				rslots.push(slots[1]);
				rslots.push(slots[1]);
				rslots.push(slots[1]);
			}else if(rand<=.42){ //3x 9%
				win = amount*3;
				rslots.push(slots[2]);
				rslots.push(slots[2]);
				rslots.push(slots[2]);
			}else if(rand<=.46){ //4x 4%
				win = amount*4;
				rslots.push(slots[3]);
				rslots.push(slots[3]);
				rslots.push(slots[3]);
			}else if(rand<=.47){ //10x 1%
				win = amount*10;
				rslots.push(slots[4]);
				rslots.push(slots[5]);
				rslots.push(slots[4]);
			}else{
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
			var winmsg = (win==0)?"nothing... :c":"<:cowoncy:416043450337853441> "+win;
			console.log("\x1b[36m%s\x1b[0m","	spent: "+amount+",  won: "+win);

			//SQL results
			var sql = "UPDATE cowoncy SET money = money + "+(win-amount)+" WHERE id = "+msg.author.id+";";
			con.query(sql, function(err,result){
				if(err) throw err;
				var machine = "**`___SLOTS___  `**\n"+moving+" "+moving+" "+moving+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`\n`|         |`";
				msg.channel.send(machine)
				.then(message => setTimeout(function(){
						var machine = "**`___SLOTS___  `**\n"+rslots[0]+" "+moving+" "+moving+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`\n`|         |`";
						message.edit(machine)
						.then(message => setTimeout(function(){
								var machine = "**`___SLOTS___  `**\n"+rslots[0]+" "+moving+" "+rslots[2]+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`\n`|         |`";
								message.edit(machine)
								.then(message => setTimeout(function(){
										var machine = "**`___SLOTS___  `**\n"+rslots[0]+" "+rslots[1]+" "+rslots[2]+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`  and won "+winmsg+"\n`|         |`";
										message.edit(machine)

									},1000)
								);
							},700)
						);
					},1000)
				)
				.catch(err => console.error(err));
			});
		}
	});
}

