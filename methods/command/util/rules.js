const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({
	
	alias:["rule","rules"],

	args:"",

	desc:"Display the rules for owo bot!",

	example:[],

	related:["owo help"],

	cooldown:10000,
	half:80,
	six:500,

	execute: async function(p){
		/* Query for agree/disagree votes */
		var sql = "SELECT * FROM rules WHERE uid = (SELECT uid FROM user WHERE id = ?);";
		sql += "SELECT COUNT(*) as agree FROM rules WHERE opinion = 1;";
		sql += "SELECT COUNT(*) as disagree FROM rules WHERE opinion = -1;";
		var result = await p.query(sql,[BigInt(p.msg.author.id)]).catch(console.error);

		/* Parse query result */
		var voted = false;
		if(result[0][0]) voted = true;
		var agree = 0;
		if(result[1][0]) agree = parseInt(result[1][0].agree);
		var disagree = 0;
		if(result[2][0]) disagree = parseInt(result[2][0].disagree);
		
		/* Construct embed message */
		var description = "• You can **not** use macros/scripts for **any** commands\n• You can **not** use multiple accounts for **any** reason\n• Do not use any exploits and report any found in the bot\n• If you have any questions, use the feedback command!";
		var descriptionExtra = ""
		if(!voted) descriptionExtra = "\n\n*Reacting with either emoji means you will follow the rules and acknowlege the consequences*";
		else if(result[0][0].opinion == 1) descriptionExtra = "\n\nOwO what's this? You already agreed to these rules! <3";
		else descriptionExtra = "\n\nUwU you disagreed! You still have to follow these rules though! c:<";
		const embed = {
			"title": "Failure to follow these rules will result in a ban and/or account reset!",
			"description": description+descriptionExtra,
			"color": p.config.embed_color,
			"footer": {
				"text": p.global.toFancyNum(agree)+" Users agree | "+p.global.toFancyNum(disagree)+" Users disagree"
			},
			"author": {
				"name": "OwO Bot Rules",
				"icon_url": p.client.user.avatarURL
			}
		};

		/* Send message and add reactions if necessary */
		p.msg.channel.send({embed}).then(message => {if(!voted){

			message.react('👍')
				.then(mr => {

			message.react('👎')
				.then(mr => {

			/* Reaction collector */
			const filter = (reaction, user) => (reaction.emoji.name === '👍'||reaction.emoji.name === '👎') && user.id === p.msg.author.id;
			const collector = message.createReactionCollector(filter,{time:60000});
			collector.on('collect',r => {
				collector.stop("done");
				
				/* Construct sql */
				if(r.emoji.name=='👎'){
					var sql = "INSERT IGNORE INTO rules (uid,opinion) VALUES ((SELECT uid FROM user WHERE id = ?),-1)";
					embed.footer.text = p.global.toFancyNum(agree)+" Users agree | "+p.global.toFancyNum(disagree+1)+" Users disagree";
					embed.description = description + "\n\nUwU you disagreed! You still have to follow these rules though! c:<";
				}else{
					var sql = "INSERT IGNORE INTO rules (uid,opinion) VALUES ((SELECT uid FROM user WHERE id = ?),1)";
					embed.footer.text = p.global.toFancyNum(agree+1)+" Users agree | "+p.global.toFancyNum(disagree)+" Users disagree";
					embed.description = description + "\n\nOwO what's this? You agreed to these rules! <3";
				}
				sql = "INSERT IGNORE INTO user (id,count) VALUES (?,0);"+sql;

				/* Query and edit existing message */
				p.query(sql,[BigInt(p.msg.author.id),BigInt(p.msg.author.id)]).then(resulti => {
					message.edit({embed}).catch(console.error);
				}).catch(console.error);
			});

		}).catch(error => message.edit("**🚫 |** I don't have permission to react with emojis!"));
		}).catch(error => message.edit("**🚫 |** I don't have permission to react with emojis!"));
		}}).catch(console.error);
	}

})

