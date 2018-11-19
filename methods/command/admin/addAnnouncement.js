const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["addannouncement"],

	admin:true,
	dm:true,

	execute: async function(p){
		var url = p.args[0];
		p.msg.channel.send("This is a test message! Does it look ok?",{file:url}).then(async function(message){
			var sql = "INSERT INTO announcement (url) VALUES (?)";
			p.query(sql,[url]).catch(console.error).then(result => {
				p.send("Added new announcement!");
			}).catch(function(err){
				p.send("Could not add to mysql");
				console.error(err);
			});
		}).catch(function(){
				p.send("Could not grab image");
		});
	}

})
