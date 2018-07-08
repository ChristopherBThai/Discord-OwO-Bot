const cards = ["<:cardback:457084762230751254>",
	"<:as:457412291457974272>","<:2s:457412287372722176>","<:3s:457412291382738954>","<:4s:457412290988343296>","<:5s:457412291059646465>","<:6s:457412291303047208>","<:7s:457412291302916096>","<:8s:457412291004989441>","<:9s:457412291378413578>","<:10s:457412291093069826>","<:js:457412291881598988>","<:qs:457412292007690251>","<:ks:457412292015816720>",
	"<:ac:457412292238114826>","<:2c:457412287389630475>","<:3c:457412291764420608>","<:4c:457412291290464267>","<:5c:457412291655106561>","<:6c:457412292166811659>","<:7c:457412292083187743>","<:8c:457412291780935691>","<:9c:457412291651043329>","<:10c:457412291877404674>","<:jc:457412292359880716>","<:qc:457412292469063682>","<:kc:457412292577853441>",
	"<:ah:457412292972249093>","<:2h:457412292766597140>","<:3h:457412292758470659>","<:4h:457412293056266250>","<:5h:457412293223776287>","<:6h:457412292993351682>","<:7h:457412293232164865>","<:8h:457412293207130123>","<:9h:457412293253267466>","<:10h:457412293236621312>","<:jh:457412293039226892>","<:qh:457412293278433280>","<:kh:457412293261524997>",
	"<:ad:457412293462982666>","<:2d:457412292116611084>","<:3d:457412292938563604>","<:4d:457412292775116800>","<:5d:457412293244747791>","<:6d:457412293068718103>","<:7d:457412293253267476>","<:8d:457412292976574476>","<:9d:457412293257330688>","<:10d:457412292871585794>","<:jd:457412292917854223>","<:qd:457412292980637729>","<:kd:457412293261524998>"];
const cardsf = ["<:cardback:457084762230751254>",
	"<a:asf:462499689502343169>","<a:2sf:462499688696905749>","<a:3sf:462499688826929163>","<a:4sf:462499689288171520>","<a:5sf:462499689582034944>","<a:6sf:462499689749676052>","<a:7sf:462499689422520341>","<a:8sf:462500702581817344>","<a:9sf:462499689728835584>","<a:10sf:462499689908928524>","<a:jsf:462499689367863297>","<a:qsf:462499689825173514>","<a:ksf:462499689892282368>",
	"<a:acf:462499689283977216>","<a:2cf:462499678441963530>","<a:3cf:462499685496651798>","<a:4cf:462499686687703040>","<a:5cf:462499687807713281>","<a:6cf:462499689305210890>","<a:7cf:462499687367311361>","<a:8cf:462499689141370881>","<a:9cf:462499689456074762>","<a:10cf:462499689535635457>","<a:jcf:462499688885518356>","<a:qcf:462499689741156352>","<a:kcf:462499688352841740>",
	"<a:ahf:462499687807844354>","<a:2hf:462499684770906112>","<a:3hf:462499685966544896>","<a:4hf:462499686196969512>","<a:5hf:462499686889291786>","<a:6hf:462499686922715136>","<a:7hf:462499686687703053>","<a:8hf:462499687581089792>","<a:9hf:462499687728152576>","<a:10hf:462499689166536708>","<a:jhf:462499687673626625>","<a:qhf:462499688893906954>","<a:khf:462499688411824128>",
	"<a:adf:462499689791488000>","<a:2df:462499687505723392>","<a:3df:462499688013234197>","<a:4df:462499688671870978>","<a:5df:462499689212805131>","<a:6df:462499689628172288>","<a:7df:462499689254617098>","<a:8df:462499689594617878>","<a:9df:462499687694336000>","<a:10df:462499689888219156>","<a:jdf:462499689644818432>","<a:qdf:462499689921642496>","<a:kdf:462500702724554762>"];
const deck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52];

const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["blackjack","bj"],

	args:"{bet}",

	desc:"Gamble your money away in blackjack! If the command stops responding, retype the command to resume the game!",

	example:[],

	related:["owo money"],

	cooldown:1000,
	half:80,
	six:500,

	execute: function(p){
		var args=p.args,msg=p.msg,con=p.con;

		//Check if there is a bet amount
		var amount = undefined;
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
		sql += "SELECT * FROM blackjack LEFT JOIN blackjack_card ON blackjack.bjid = blackjack_card.bjid WHERE id = "+msg.author.id+" AND active = 1;";
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			//Check for existing match
			if(false){

			}else if(result[0][0]&&result[0][0].money){
				var money = result[0][0].money;
				if(amount=="all"){
					if(money<=0)
						p.send("**🚫 | "+msg.author.username+"**, You do not have enough cowoncy!",3000);
					else
						initBlackjack(p,money,result[1]);
				}else{
					if(money<amount)
						p.send("**🚫 | "+msg.author.username+"**, You do not have enough cowoncy!",3000);
					else
						initBlackjack(p,amount,result[1]);
				}
			}else{
				p.send("**🚫 | "+msg.author.username+"**, You do not have enough cowoncy!",3000);
			}
		});
	}

});

function blackjack(p,deck,bet){
	p.send(bet);
}

function initBlackjack(p,bet){
	//If existing match
	if(false){

	}else{
		var tdeck = deck.slice(0);
		var hand = [randCard(tdeck),randCard(tdeck)];
		var dealer = [randCard(tdeck),randCard(tdeck)];
		var sql = "INSERT INTO blackjack (id,bet,date,active) VALUES ("+p.msg.author.id+","+bet+",NOW(),1) ON DUPLICATE KEY UPDATE bet = "+bet+",date = NOW(), active = 1;";
		sql += generateSQL(hand,dealer,p.msg.author.id);
		p.con.query(sql,function(err,result){
			if(err){console.error(err);p.send("Something went wrong...");return;}
		});
	}
}

function randCard(deck){
	return deck.splice(Math.floor(Math.random()*deck.length),1)[0];
}

function generateSQL(hand,dealer,id){
	id = "(SELECT bjid FROM blackjack WHERE id = "+id+")";
	var sql = "";
	for(var i=0;i<hand.length;i++)
		sql += "INSERT INTO blackjack_card (bjid,card,dealer) VALUES ("+id+","+hand[i]+",0);";
	for(var i=0;i<dealer.length;i++)
		sql += "INSERT INTO blackjack_card (bjid,card,dealer) VALUES ("+id+","+dealer[i]+","+(i+1)+");";
	return sql;
}

function diff(a,b){
	    return a.filter(function(i) {return b.indexOf(i) < 0;});
}

