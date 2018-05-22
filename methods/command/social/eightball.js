const CommandInterface = require('../../commandinterface.js');

var eightballCount = 55;

module.exports = new CommandInterface({
	
	alias:["eightball","8b","ask"],

	args:"{question}",

	desc:"Ask a question and get an answer!",

	example:["owo 8b Am I cute?"],

	related:[],

	cooldown:5000,
	half:100,
	six:500,

	execute: function(p){
		if(p.args.length==0)
			return;
		var id = Math.ceil(Math.random()*eightballCount);
		var sql = "SELECT answer FROM eightball WHERE id = "+id+";";
		p.con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}
			var question = p.args.join(" ");
				
			p.send("**🎱 | "+p.msg.author+" asked:**  "+question+"\n**<:blank:427371936482328596> | Answer:**  "+rows[0].answer);
		});
	}

})
