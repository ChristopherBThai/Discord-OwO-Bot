const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["drop","pickup"],

	args:"{amount}",

	desc:"Drop some cowoncy in a channel with 'owo drop {amount}'! Users can pick it up with 'owo pickup {amount}' If you try to pick up more than what's on the floor, you'll lose that amount! Be careful!",

	example:["owo drop 3000"],

	related:[],

	cooldown:30000,
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
	var sql = `SELECT money FROM cowoncy WHERE id = ${p.msg.author.id};
		CALL CowoncyDrop(${p.msg.author.id},${p.msg.channel.id},${amount});`;
	p.con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		if(!result[0][0]||result[0][0].money<amount){
			p.send("**🚫 | "+p.msg.author.username+"**, you don't have enough cowoncy! >:c",3000);
			return;
		}
		p.logger.value('cowoncy',(amount*-1),['command:drop','id:'+p.msg.author.id]);
		p.send("**💰 | "+p.msg.author.username+"** dropped **"+p.global.toFancyNum(amount)+"** cowoncy!\n**<:blank:427371936482328596> |** Use `owo pickup` to pick it up! ",8000);
		p.quest("drop");
	});
}

function pickup(p){
	var amount;
	if(p.global.isInt(p.args[0])) amount = parseInt(p.args[0]);
	if(!amount){
		p.send("**🚫 | "+p.msg.author.username+"**, Please specify the pickup amount!",3000);
		return;
	}
	if(amount<=0){
		p.send("**🚫 | "+p.msg.author.username+"**, Invalid arguments!",3000);
		return;
	}
	var sql = `SELECT amount FROM cowoncydrop WHERE channel = ${p.msg.channel.id};
		SELECT money FROM cowoncy WHERE id = ${p.msg.author.id};
		CALL CowoncyPickup(${p.msg.author.id},${p.msg.channel.id},${amount});`;
	p.con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		//Not enough money
		if(!result[1][0]||result[1][0].money<amount){
			p.send("**🚫 | "+p.msg.author.username+"**, you can only pick up as much as you have!");
			return;
		}else if(result[0][0]&&amount <= result[0][0].amount&&amount<=result[1][0].money){
			p.logger.value('cowoncy',amount,['command:drop','id:'+p.msg.author.id]);
			p.send("**💰 | "+p.msg.author.username+"**, you picked up **"+amount+"** cowoncy from this channel!");
		}else{
			p.logger.value('cowoncy',(amount*-1),['command:drop','id:'+p.msg.author.id]);
			p.send("**💰 | "+p.msg.author.username+"**, there's not enough cowoncy on the floor!\n**<:blank:427371936482328596> |** You felt nice so you dropped **"+amount+"** cowoncy!",8000);
		}
	});
}
