
/**
 * Grabs bot's info
 */
exports.info = function(client,msg){
	var embed = "```md\n< OwO Bot Info >\n"+
		"> Session Started on: "+client.readyAt+"\n"+
		"> Ping "+client.ping+"ms\n\n"+
		"# Talking to "+client.users.size+" people\n"+
		"# In "+client.guilds.size+" Guilds and "+client.channels.size+" channels";
	client.guilds.array().forEach(function(ele){
		var guild = "\n\t"+ele.name;
		guild += "\n\t\t> "+ele.members.size+" Users";
		guild += "\n\t\t> "+ele.channels.size+" Channels";
		guild += "\n\t\t> Joined on "+ele.joinedAt;
		if(embed.length+guild.length>=2000){
			embed += "```";
			msg.channel.send(embed);
			embed = "```md"+guild;
		}else
			embed += guild;
	});
	var date = new Date();
	embed += ("\n\n> "+date.getMonth()+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"```");
	msg.channel.send(embed);
	console.log("Admin Command: info");
}
