const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["give","send"],

	args:"{@user} {amount}",

	desc:"Send some cowoncy to other users! This command must contain a @mention and an amount",

	example:["owo give @Scuttler 25"],

	related:["owo money"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		var msg=p.msg, args=p.args, con=p.con, global=p.global;
		var amount=-1, id="", invalid=false;

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


		//Check if valid user
		var user = await global.getUser(id);
		if(user==undefined){
			p.send("**🚫 | "+msg.author.username+"**, I could not find that user!",3000);
			return
		}else if(user.bot){
			p.send("**🚫 | "+msg.author.username+"**, You can't send cowoncy to a bot silly!",3000);
			return;
		}else if(user.id==msg.author.id){
			p.send("**💳 | "+msg.author+"** sent **"+amount+" cowoncy** to... **"+user+"**... *but... why?*");
			return;
		}

		//Gives money
		var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
		con.query(sql,function(err,rows,fields){
			if(err){console.error(err);return;}
			if(rows[0]==undefined||rows[0].money<amount){
				p.send("**🚫 |** Silly **"+msg.author.username+"**, you don't have enough cowoncy!",3000);
			}else{
				sql = "UPDATE cowoncy SET money = money - "+amount+" WHERE id = "+msg.author.id+";"+
					"INSERT INTO cowoncy (id,money) VALUES ("+id+","+amount+") ON DUPLICATE KEY UPDATE money = money + "+amount+";";
				con.query(sql,function(err,rows,fields){
					if(err){console.error(err);return;}
					p.logger.value('cowoncy',(amount),['command:given','id:'+id]);
					p.logger.value('cowoncy',(amount*-1),['command:give','id:'+msg.author.id]);
					p.send("**💳 | "+msg.author.username+"** sent **"+amount+" cowoncy** to **"+user+"**!");
				});
			}
		});
	}

})
