const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["cookie","rep"],

	args:"{@user}",

	desc:"Give a user a cookie!",

	example:["owo cookie @user","owo cookie"],

	related:[],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		if(p.args.length==0)
			display(p.con,p.msg,p.send);
		else
			give(p.con,p.msg,p.args,p.global,p.send);

	}

})

async function give(con,msg,args,global,send){
	var id = "";
	if(args.length==1&&global.isUser(args[0]))
		id = args[0].match(/[0-9]+/)[0];
	else{
		send("**🚫 |** Wrong arguments! >:c",3000);
		return;
	}

	var user = await global.getUser(id);
	if(user==undefined){
		send("**🚫 |** Could not find that user!",3000);
		return;
	}else if(msg.author.id==user.id){
		send("**🚫 |** You can't give yourself a cookie, silly!",3000);
		return;
	}
	
	var sql = "SELECT TIMESTAMPDIFF(DAY,lasttime,NOW()) AS time, TIMESTAMPDIFF(HOUR,lasttime,NOW()) AS hour, TIMESTAMPDIFF(MINUTE,lasttime,NOW()) AS min,TIMESTAMPDIFF(SECOND,lasttime,NOW()) AS sec FROM rep WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		var result = rows[0];
		if(result!=undefined&&result.time<1){
			var hour = 23 - result.hour;
			var min= 59 - (result.min%60);
			var sec = 59 - (result.sec%60);
			send("**⏱ |** NU! **"+msg.author.username+"**! You need to wait **"+hour+"H "+min+"M "+sec+"S**!",3000);
			return;
		}else{
			sql = "INSERT INTO rep (id,count) VALUES ("+user.id+",1) ON DUPLICATE KEY UPDATE count = count + 1;";
			sql += "INSERT INTO rep (id,count,lasttime) VALUES ("+msg.author.id+",0,NOW()) ON DUPLICATE KEY UPDATE lasttime = NOW();";
			con.query(sql,function(err,rows,fields){
				if(err) throw err;
				send("**<a:cookieeat:423020737364885525> | "+user.username+"**! You got a cookie from **"+msg.author.username+"**! *nom nom nom c:<*");
			});
		}
	});

}

function display(con,msg,send){
	var sql = "SELECT count,TIMESTAMPDIFF(DAY,lasttime,NOW()) AS time, TIMESTAMPDIFF(HOUR,lasttime,NOW()) AS hour, TIMESTAMPDIFF(MINUTE,lasttime,NOW()) AS min,TIMESTAMPDIFF(SECOND,lasttime,NOW()) AS sec FROM rep WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,rows,fields){
		if(err){console.error(err);return;}
		var count = 0;
		if(rows[0]!=undefined)
			count = rows[0].count;
		var again = "You have one cookie to send!";
		if(rows[0]!=undefined&&rows[0].time<1){
			var hour = 23 - rows[0].hour;
			var min= 59 - (rows[0].min%60);
			var sec = 59 - (rows[0].sec%60);
			again = "You can send a cookie in **"+hour+"H "+min+"M "+sec+"S**! ";
		}
		send("**<a:cookieeat:423020737364885525> | "+msg.author.username+"**! You currently have **"+count+"** cookies! Yummy! c:<\n**<:blank:427371936482328596> |** "+again);
	});
}
