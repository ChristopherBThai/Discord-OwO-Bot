const CommandInterface = require('../../commandinterface.js');

const ranks = {};
const animals = require('../../../../tokens/owo-animals.json');

module.exports = new CommandInterface({

	alias:["owodex","od","dex"],

	args:"{animal}",

	desc:"Use the owodex to get information on a pet!",

	example:["owodex dog","owodex cat"],

	related:["owo zoo"],

	cooldown:3000,
	half:150,
	six:500,

	execute: function(p){
		return;
		var global=p.global,con=p.con,msg=p.msg,args=p.args;

		var animal = (args[0])?global.validAnimal(args[0]):undefined;


		if(args.length>1||args.length==0){
			p.send("**🚫 | "+msg.author.username+"**, Wrong syntax!!",3000);
			return;
		}else if(!animal){
			p.send("**🚫 | "+msg.author.username+"**, I could not find that animal in your zoo!",3000);
			return;
		}

		var sql = "SELECT * FROM animal WHERE id = "+msg.author.id+" AND name = '"+animal.value+"';";
		con.query(sql,function(err,result){
			if(err) {console.error(err);return;}
			console.log(result);
			console.log(animal);
			msg.channel.send("`sell: "+result[0].sellcount+"\nsacr: "+result[0].saccount+"`");
		});
	}

})

