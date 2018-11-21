const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["announce","changelog","announcement","announcements"],

	args:"{disable|enable}",

	desc:"View the latest announcement! Announcements will also be displayed in your daily command! You can disable this by typing 'owo announcement disable'",

	example:["owo announcement","owo announcement enable","owo announcement disable"],

	related:["owo daily"],

	cooldown:10000,
	half:100,
	six:500,

	execute: function(p){
		if(p.args[0]&&(p.args[0]=='disable'||p.args[0]=='enable'))
			announcementSetting(p);
		else
			announcement(p);
	}

});

async function announcement(p){
	var sql = "SELECT * FROM announcement ORDER BY aid DESC LIMIT 1";
	var result = await p.query(sql).catch(console.error);
	if(!result[0])
		p.send("**📮 |** There are no announcements!",3000);
	else{
		var text = "**📮 |** This announcement was posted on: "+(new Date(result[0].adate)).toDateString();
		p.msg.channel.send(text,{file:result[0].url}).catch(err => {
			console.error(err);
			p.send("**📮 |** There are no announcements!",3000);
		});
	}
}

async function announcementSetting(p){
	if(p.args[0]=='enable'){
		var sql = "INSERT INTO user_announcement (uid,aid,disabled) values ((SELECT uid FROM user WHERE id = ?),(SELECT aid FROM announcement ORDER BY aid ASC LIMIT 1),0) ON DUPLICATE KEY UPDATE disabled = 0;";
		p.query(sql,[BigInt(p.msg.author.id)]).then(result => {
			p.send("**📮 | "+p.msg.author.username+"** You will now receive announcements in your daily command!");
		}).catch(err => {
			sql = "INSERT IGNORE INTO user (id,count) VALUES (?,0);"+sql;
			p.query(sql,[BigInt(p.msg.author.id),BigInt(p.msg.author.id)]).then(result => {
				p.send("**📮 | "+p.msg.author.username+"** You will now receive announcements in your daily command!");
			}).catch(console.error);
		});
	}else{
		var sql = "INSERT INTO user_announcement (uid,aid,disabled) values ((SELECT uid FROM user WHERE id = ?),(SELECT aid FROM announcement ORDER BY aid ASC LIMIT 1),1) ON DUPLICATE KEY UPDATE disabled = 1;";
		p.query(sql,[BigInt(p.msg.author.id)]).then(result => {
			p.send("**📮 | "+p.msg.author.username+"** You have disabled announcements!");
		}).catch(err => {
			sql = "INSERT IGNORE INTO user (id,count) VALUES (?,0);"+sql;
			p.query(sql,[BigInt(p.msg.author.id),BigInt(p.msg.author.id)]).then(result => {
				p.send("**📮 | "+p.msg.author.username+"** You have disabled announcements!");
			}).catch(console.error);
		});
	}
}

