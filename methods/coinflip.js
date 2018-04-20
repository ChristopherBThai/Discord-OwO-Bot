const global = require('./global.js');
var cowoncy = "<:cowoncy:416043450337853441>";
var spin = "<a:coinflip:436677458339823636>";
var heads = "<:head:436677933977960478>";
var tails = "<:tail:436677926398853120>";

exports.bet = function(con,msg,args){
	var bet = 1;
	var arg1 = args[0];
	if(global.isInt(arg1)){
		bet = parseInt(arg1);
		arg1 = args[1];
	}else if(arg1=='all'){
		bet = "all";
		arg1 = args[1];
	}else if(global.isInt(args[1])){
		bet = parseInt(args[1]);
	}else if(args[1]=='all'){
		bet = "all";
	}else if(args.length!=1){
		msg.channel.send("**🚫 | "+msg.author.username+"**, Invalid arguments!!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}
	var choice = undefined;
	arg1 = arg1.toLowerCase();
	if(arg1=='heads'||arg1=='h'||arg1=='head')
		choice = 'h';
	else if(arg1=='tails'||arg1=='t'||arg1=='tail')
		choice = 't';

	if(bet==0){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You can't bet 0 dum dum!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}else if(bet<0){
		msg.channel.send("**🚫 | "+msg.author.username+"**, Do you understand how to bet cowoncy???")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}else if(choice==undefined){
		msg.channel.send("**🚫 | "+msg.author.username+"**, You must choose either `heads` or `tails`!")
			.then(message => message.delete(3000))
			.catch(err => console.error(err));
		return;
	}

	var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
	con.query(sql,function(err,result){
		if(err){console.error(err);return;}
		if(result[0]==undefined||result[0].money==0||(bet!="all"&&result[0].money<bet)){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!")
				.then(message => message.delete(3000))
				.catch(err => console.error(err));
			return;
		}else{
			if(bet=="all")
				bet = result[0].money;
			if(bet>1000)
				bet = 1000;

			var rand = Math.random();
			var win = false;
			//tails
			if(rand>.5&&choice=="t")
				win = true;
			//heads
			else if(rand<.5&&choice=="h")
				win = true;

			var sql = "UPDATE cowoncy SET money = money "+((win)?"+":"-")+" "+bet+" WHERE id = "+msg.author.id+";";
			con.query(sql, function(err,result){
				if(err){console.error(err);return;}
				var text = "**"+msg.author.username+"** spent **"+cowoncy+" "+bet+"** and chose "+((choice=='h')?"**heads**":"**tails**");
				var text2 = "\nThe coin spins... "+spin;
				msg.channel.send(text+text2)
					.then(message => setTimeout(function(){
						var text2 = "\nThe coin spins... "+((win)?((choice=='h')?heads:tails):((choice=='h')?tails:heads))+" and you ";
						if(win)
							text2 += "won **"+cowoncy+" "+(bet*2)+"**!!";
						else
							text2 += "lost it all... :c";
						message.edit(text+text2)
						console.log("\x1b[36m%s\x1b[0m","	spent: "+bet+" and "+((win)?"won":"lost"));
						.catch(err => console.error(err));
					},2000))
					.catch(err => console.error(err));
			});
		}
	});
}
