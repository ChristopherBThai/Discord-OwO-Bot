const CommandInterface = require('../../commandinterface.js');

const maxBet = 50000;
const deck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52];
const bjUtil = require('./blackjackUtil.js');

module.exports = new CommandInterface({

	alias:["blackjack","bj","21"],

	args:"{bet}",

	desc:"Gamble your money away in blackjack!\nYou can hit or stand by reacting with emojis! If the command stops responding, retype the command to resume the game!",

	example:[],

	related:["owo money"],

	cooldown:15000,
	half:100,
	six:600,
	bot:true,

	execute: function(p){
		var args=p.args,msg=p.msg,con=p.con;

		//Check if there is a bet amount
		var amount = 1;
		if(p.global.isInt(args[0]))
			amount = parseInt(args[0]);
		if(args[0]=='all')
			amount = "all";
		else if(amount==undefined){
			p.send("**🚫 | "+msg.author.username+"**, Invalid arguments!",3000);
			return;
		}else if(amount<=0){
			p.send("**🚫 | "+msg.author.username+"**, You can't bet that much silly!",3000);
			return;
		}

		var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
		sql += "SELECT * FROM blackjack LEFT JOIN blackjack_card ON blackjack.bjid = blackjack_card.bjid WHERE id = "+msg.author.id+" AND active = 1 ORDER BY sort ASC, dealer DESC;";
		if(amount=="all")
			if(maxBet)
				sql += "UPDATE cowoncy LEFT JOIN blackjack ON cowoncy.id = blackjack.id SET money = (IF(money >"+maxBet+",money - "+maxBet+",0)) WHERE cowoncy.id = "+msg.author.id+" AND money > 0 AND (active = 0 OR active IS NULL);";
			else
				sql += "UPDATE cowoncy LEFT JOIN blackjack ON cowoncy.id = blackjack.id SET money = 0 WHERE cowoncy.id = "+msg.author.id+" AND money > 0 AND (active = 0 OR active IS NULL);";
		else{
			if(maxBet&&amount>maxBet)
				amount = maxBet;
			sql += "UPDATE cowoncy LEFT JOIN blackjack ON cowoncy.id = blackjack.id SET money = money - "+amount+" WHERE cowoncy.id = "+msg.author.id+" AND money >= "+amount+" AND (active = 0 OR active IS NULL);";
		}
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			//Check for existing match
			if(result[1][0]){
				initBlackjack(p,money,result[1]);
			}else if(result[0][0]&&result[0][0].money){
				var money = result[0][0].money;
				if(maxBet&&money>maxBet) money = maxBet;
				if(amount=="all"){
					if(money<=0)
						p.send("**🚫 | "+msg.author.username+"**, You do not have enough cowoncy!",3000);
					else
						initBlackjack(p,money);
				}else{
					if(money<amount)
						p.send("**🚫 | "+msg.author.username+"**, You do not have enough cowoncy!",3000);
					else
						initBlackjack(p,amount);
				}
			}else{
				p.send("**🚫 | "+msg.author.username+"**, You do not have enough cowoncy!",3000);
			}
		});
	}

});

function blackjack(p,player,dealer,bet,resume){
	var embed = bjUtil.generateEmbed(p.msg.author,dealer,player,bet);
	const filter = (reaction, user) => (reaction.emoji.name === '👊'||reaction.emoji.name === '🛑') && user.id === p.msg.author.id;
	if(resume)
		embed.footer.text = "🎲 ~ resuming previous game";
	p.msg.channel.send({embed})
		.then(message => {

			message.react('👊')
				.then(mr => {

			message.react('🛑')
				.then(mr => {

			const collector = message.createReactionCollector(filter,{time:60000});

			collector.on('collect',r => {
				parseQuery({con:p.con,id:p.msg.author.id},function(nPlayer,nDealer){
					if(!nPlayer||!nDealer){
						collector.stop("done");
						message.edit("**🚫 |** This match is already finished");
						return;
					}
					//HIT
					if(r.emoji.name=='👊')
						hit(p,nPlayer,nDealer,message,bet,collector);

					//STOP
					else if(r.emoji.name=='🛑'){
						collector.stop("done");
						stop(p,nPlayer,nDealer,message,bet);
					}
				});
			});

			collector.on('end',(collected,reason) => {
				if(reason=="time")
					message.edit("**⏱ |** This session has expired. Retype `owo blackjack` to resume");
			});
		}).catch(error => message.edit("**🚫 |** I don't have permission to react with emojis!"));
		}).catch(error => message.edit("**🚫 |** I don't have permission to react with emojis!"));
		}).catch(console.error);
}

function initBlackjack(p,bet,existing){
	//If existing match
	if(existing){
		parseQuery({query:existing},function(player,dealer){
			if(!player||!dealer){
				p.send("Uh oh.. something went wrong...");
				return;
			}
			bet = existing[0].bet;
			blackjack(p,player,dealer,bet,true);
		});
	}else{
		var tdeck = deck.slice(0);
		var player= [bjUtil.randCard(tdeck,'f'),bjUtil.randCard(tdeck,'f')];
		var dealer = [bjUtil.randCard(tdeck,'f'),bjUtil.randCard(tdeck,'b')];
		var sql = "INSERT INTO blackjack (id,bet,date,active) VALUES ("+p.msg.author.id+","+bet+",NOW(),1) ON DUPLICATE KEY UPDATE bet = "+bet+",date = NOW(), active = 1;";
		sql += bjUtil.generateSQL(player,dealer,p.msg.author.id);
		p.con.query(sql,function(err,result){
			if(err){console.error(err);p.send("Something went wrong...");return;}
			blackjack(p,player,dealer,bet);
		});
		p.quest("gamble");
	}
}

function hit(p,player,dealer,msg,bet,collector){
	for(var i=0;i<player.length;i++)
		player[i].type = 'c';
	for(var i=0;i<dealer.length;i++){
		if(dealer[i].type == 'f')
			dealer[i].type = 'c';
	}

	var tdeck = bjUtil.initDeck(deck.slice(0),player,dealer);
	var card = bjUtil.randCard(tdeck,'f');
	player.push(card);
	var ppoints = bjUtil.cardValue(player).points;
	var dpoints = bjUtil.cardValue(dealer).points;

	if(ppoints>21){
		collector.stop("done");
		stop(p,player,dealer,msg,bet,true);
	}
	else{
		var sql = "INSERT INTO blackjack_card (bjid,card,dealer,sort) VALUES ((SELECT bjid FROM blackjack WHERE id = "+p.msg.author.id+"),"+card.card+",0,"+player.length+") ON DUPLICATE KEY UPDATE dealer = 0,sort= "+player.length+";";
		p.con.query(sql,function(err,result){
			if(err){console.error(err);msg.edit("Something went wrong...");return;}
			var embed = bjUtil.generateEmbed(p.msg.author,dealer,player,bet);
			msg.edit({embed})
				.catch(console.error);
		});
	}
}

function stop(p,player,dealer,msg,bet,fromHit){
	if(!fromHit)
		for(var i=0;i<player.length;i++)
			player[i].type = 'c';
	for(var i=0;i<dealer.length;i++){
		if(dealer[i].type == 'b')
			dealer[i].type = 'f';
		else
			dealer[i].type = 'c';
	}

	var ppoints = bjUtil.cardValue(player).points;
	var dpoints = bjUtil.cardValue(dealer).points;
	var tdeck = bjUtil.initDeck(deck.slice(0),player,dealer);

	while(dpoints<17){
		dealer.push(bjUtil.randCard(tdeck,'f'));
		dpoints = bjUtil.cardValue(dealer).points;
	}

	//sql get winner
	var winner = undefined;
	//both bust
	if(ppoints>21&&dpoints>21)
		winner = 'tb';
	//tie
	else if(ppoints==dpoints)
		winner = 't';
	//player bust
	else if(ppoints>21)
		winner = 'l';
	//dealer bust
	else if(dpoints>21)
		winner = 'w';
	//player win
	else if(ppoints>dpoints)
		winner = 'w';
	//dealer win
	else
		winner = 'l';



	var sql = "UPDATE blackjack SET active = 0 WHERE id = "+p.msg.author.id+" AND active > 0;";
	var sql2 = "DELETE FROM blackjack_card WHERE bjid = (SELECT bjid FROM blackjack WHERE id = "+p.msg.author.id+");";
	if(winner=='w')
		sql2 += "UPDATE cowoncy SET money = money + "+bet*2+" WHERE id = "+p.msg.author.id+";";
	else if(winner=='t'||winner=='tb')
		sql2 += "UPDATE cowoncy SET money = money + "+bet+" WHERE id = "+p.msg.author.id+";";
	p.con.query(sql,function(err,result){
		if(err){console.error(err);msg.edit("Something went wrong...");return;}
		if(result.changedRows>0){
			p.con.query(sql2,function(err,result){
				if(err){console.error(err);msg.edit("Something went wrong...");return;}
				if(winner=='w'){
					p.logger.value('cowoncy',(bet),['command:blackjack','id:'+p.msg.author.id]);
					p.logger.value('gamble',1,['command:blackjack','id:'+p.msg.author.id]);
				}else if(winner=='l'){
					p.logger.value('cowoncy',(bet*-1),['command:blackjack','id:'+p.msg.author.id]);
					p.logger.value('gamble',-1,['command:blackjack','id:'+p.msg.author.id]);
				}
				var embed = bjUtil.generateEmbed(p.msg.author,dealer,player,bet,winner,bet);
				msg.edit({embed})
					.catch(console.error);
			});
		}
	});
}

function parseQuery(info,callback){
	if(info.query){
		var query = info.query;
		if(!query[0])
			callback();
		else{
			var player = [];
			var dealer = [];
			for(var i=0;i<query.length;i++){
				if(query[i].dealer==0)
					player.push({"card":query[i].card,"type":'c'});
				else if(query[i].dealer==1)
					dealer.push({"card":query[i].card,"type":'b'});
				else
					dealer.push({"card":query[i].card,"type":'c'});
			}
			callback(player,dealer);
		}
	}else{
		var sql = "SELECT * FROM blackjack LEFT JOIN blackjack_card ON blackjack.bjid = blackjack_card.bjid WHERE id = "+info.id+" AND active = 1 ORDER BY sort ASC ,dealer DESC;";
		info.con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			if(!result[0])
				callback();
			else{
				var player = [];
				var dealer = [];
				for(var i=0;i<result.length;i++){
					if(result[i].dealer==0)
						player.push({"card":result[i].card,"type":'c'});
					else if(result[i].dealer==1)
						dealer.push({"card":result[i].card,"type":'b'});
					else
						dealer.push({"card":result[i].card,"type":'c'});
				}
				callback(player,dealer);
			}
		});
	}
}
