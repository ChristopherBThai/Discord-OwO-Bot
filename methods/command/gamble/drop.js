const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["drop","pickup"],

	args:"{amount}",

	desc:"Drop some cowoncy in a channel with 'owo drop {amount}'! Users can pick it up with 'owo pickup'",

	example:["owo drop 3000"],

	related:[],

	cooldown:60000,
	half:50,
	six:300,
	bot:true,

	execute: async function(p){
		if(p.command=="drop")
			drop(p);
		else if(p.command=="pickup")
			pickup(p);
	}

})

function drop(p){
	var amount;
	if(p.global.isInt(p.args[0])) amount = parseInt(p.args[0]);
	if(!amount){
		p.send("**🚫 | "+p.msg.author.username+"**, Please specify the drop amount!",3000);
		return;
	}
	if(amount<=0){
		p.send("**🚫 | "+p.msg.author.username+"**, Invalid arguments!",3000);
		return;
	}
	var sql = "INSERT INTO cowoncydrop (channel,amount) VALUES ("+p.msg.channel.id+","+amount+") ON DUPLICATE KEY UPDATE amount = amount + "+amount+";";
	sql += "SELECT * FROM cowoncydrop WHERE channel = "+p.msg.channel.id+";";
	var sql = `SELECT money FROM cowoncy WHERE id = ${p.msg.author.id};
		CALL CowoncyDrop(${p.msg.author.id},${p.msg.channel.id},${amount});
		SELECT amount FROM cowoncydrop WHERE channel = ${p.msg.channel.id};`;
	p.con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		if(!result[2][0]){
			p.send("**🚫 | "+p.msg.author.username+"**, an error has occured!! Oh uh...",3000);
			return;
		}
		if(!result[0][0]||result[0][0].money<amount){
			p.send("**🚫 | "+p.msg.author.username+"**, you don't have enough cowoncy! >:c",3000);
			return;
		}
		var totalAmount = result[2][0].amount;
		p.logger.value('cowoncy',(amount*-1),['command:drop','id:'+p.msg.author.id]);
		p.send("** | "+p.msg.author.username+"** dropped **"+p.global.toFancyNum(amount)+"** cowoncy! Use `owo pickup` to pick it up!\n**<:blank:427371936482328596> |** There is a total of **"+totalAmount+"** cowoncy in this channel!");
	});
}

function pickup(p){
	var sql = `SELECT amount FROM cowoncydrop WHERE channel = ${p.msg.channel.id};
		CALL CowoncyPickup(${p.msg.author.id},${p.msg.channel.id});`;
	p.con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		if(!result[0][0]||result[0][0].amount<=0){
			sql = `SELECT money FROM cowoncy WHERE id = ${p.msg.author.id};
				CALL CowoncyDropHundred(${p.msg.author.id},${p.msg.channel.id});`;
			p.con.query(sql,function(err,result){
				if(err){console.error(err);return;}
				if(result[0][0]&&result[0][0].money>0){
					var amount = result[0][0].money;
					if(amount>100)
						amount = 100;
					p.logger.value('cowoncy',(amount*-1),['command:drop','id:'+p.msg.author.id]);
					p.send("**🚫 | "+p.msg.author.username+"**! There is no cowoncy dropped on this channel!\n**<:blank:427371936482328596> |** You felt nice so you dropped **"+amount+"** cowoncy!");
				}else{
					p.send("**🚫 | "+p.msg.author.username+"**! There is no cowoncy dropped on this channel!");
				}
			});
		}else{
			var amount = result[0][0].amount;
			p.logger.value('cowoncy',amount,['command:drop','id:'+p.msg.author.id]);
			p.send("** | "+p.msg.author.username+"**, you picked up **"+amount+"** cowoncy from this channel!");
		}
	});
}
