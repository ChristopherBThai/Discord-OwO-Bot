const CommandInterface = require('../../commandinterface.js');
const altercoinflip = require('../patreon/altercoinflip.js');

const maxBet = 50000;
const cowoncy = "<:cowoncy:416043450337853441>";
const spin = "<a:coinflip:436677458339823636>";
const heads = "<:head:436677933977960478>";
const tails = "<:tail:436677926398853120>";

module.exports = new CommandInterface({

	alias:["coinflip","cf","coin","flip"],

	args:"[head|tail] {bet}",

	desc:"Flip a coin to earn some cowoncy! You can also shorten the command like in the example!",

	example:["owo coinflip head 25","owo cf t 25"],

	related:["owo money"],

	cooldown:15000,
	half:90,
	six:500,
	bot:true,

	execute: function(p){
		var global=p.global,msg=p.msg,con=p.con,args=p.args;

		//Syntax Check
		var bet = 1,arg1 = args[0];
		if(global.isInt(arg1)){
			bet = parseInt(arg1);
			arg1 = args[1];
		}else if(arg1&&arg1.toLowerCase()=='all'){
			bet = "all";
			arg1 = args[1];
		}else if(global.isInt(args[1])){
			bet = parseInt(args[1]);
		}else if(args[1]&&args[1].toLowerCase()=='all'){
			bet = "all";
		}else if(args.length!=1){
			p.send("**🚫 | "+msg.author.username+"**, Invalid arguments!!",3000);
			return;
		}

		//Get user choice
		var choice = 'h';
		if(arg1!=undefined)
			arg1 = arg1.toLowerCase();
		if(arg1=='heads'||arg1=='h'||arg1=='head')
			choice = 'h';
		else if(arg1=='tails'||arg1=='t'||arg1=='tail')
			choice = 't';

		//Final syntax check
		if(bet==0){
			p.send("**🚫 | "+msg.author.username+"**, You can't bet 0 dum dum!",3000);
			return;
		}else if(bet<0){
			msg.channel.send("**🚫 | "+msg.author.username+"**, Do you understand how to bet cowoncy???",3000);
			return;
		}else if(choice==undefined){
			msg.channel.send("**🚫 | "+msg.author.username+"**, You must choose either `heads` or `tails`!",3000);
			return;
		}

		var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			if(result[0]==undefined||result[0].money==0||(bet!="all"&&result[0].money<bet)){
				p.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
				return;
			}else{
				if(bet=="all") bet = result[0].money;

				if(maxBet&&bet>maxBet)
					bet = maxBet;

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
					p.logger.value('cowoncy',(bet*((win)?(1):(-1))),['command:coinflip','id:'+msg.author.id]);
					p.logger.value('gamble',((win)?(1):(-1)),['command:coinflip','id:'+msg.author.id]);
					var text = "**"+msg.author.username+"** spent **"+cowoncy+" "+(p.global.toFancyNum(bet))+"** and chose "+((choice=='h')?"**heads**":"**tails**");
					var text2 = text;
					text2 += "\nThe coin spins... "+((win)?((choice=='h')?heads:tails):((choice=='h')?tails:heads))+" and you ";
					if(win)
						text2 += "won **"+cowoncy+" "+(p.global.toFancyNum(bet*2))+"**!!";
					else
						text2 += "lost it all... :c";
					text += "\nThe coin spins... "+spin;

					/* Legendary patreon stuff */
					text = altercoinflip.alter(p.msg.author.id,text);
					text2 = altercoinflip.alter(p.msg.author.id,text2);

					msg.channel.send(text)
						.then(message => setTimeout(function(){
							message.edit(text2)
								.catch(err => console.error(err));
						},2000))
						.catch(err => console.error(err));
					p.quest("gamble");
				});
			}
		});
	}

})
