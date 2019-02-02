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
		sql += "SELECT SUM(totalcount) as total FROM animal WHERE name = '"+animal.value+"';";
		con.query(sql,async function(err,result){
			if(err) {console.error(err);return;}
			if(!result[0][0]){
				p.send("**🚫 | "+msg.author.username+"**, I could not find that animal in your zoo!",3000);
				return;
			}
			var emoji = ((animal.uni)?animal.uni:animal.value);
			if(temp = emoji.match(/:[0-9]+>/)){
				temp = "https://cdn.discordapp.com/emojis/"+temp[0].match(/[0-9]+/)[0]+".";
				if(emoji.match(/<a:/))
					temp += "gif";
				else
					temp += "png";
				emoji = temp;
			}else emoji = undefined;

			var rankEmoji = animals.ranks[animal.rank];

			var points = animal.points;

			var sell = "???";
			if(result[0][0].sellcount>0)
				sell = animal.price+" Cowoncy | "+global.toFancyNum(result[0][0].sellcount)+" sold";

			var sac = "???";
			if(result[0][0].saccount>0)
				sac = animal.essence+" Essence | "+global.toFancyNum(result[0][0].saccount)+" killed";

			var alias = "None";
			if(animal.alt.length>0)
				alias = animal.alt.join(", ");

			let phys = "";
			let mag = "";
			if(result[0][0].xp >= 1001){
				phys = `<:hp:531620120410456064> \`${animal.hpr}\` <:att:531616155450998794> \`${animal.attr}\` <:pr:531616156222488606> \`${animal.prr}\` `;
				mag = `<:wp:531620120976687114> \`${animal.wpr}\` <:mag:531616156231139338> \`${animal.magr}\` <:mr:531616156226945024> \`${animal.mrr}\` `;
			}else{
				phys = `<:hp:531620120410456064> \`??\` <:att:531616155450998794> \`??\` <:pr:531616156222488606> \`??\``;
				mag = `<:wp:531620120976687114> \`??\` <:mag:531616156231139338> \`??\` <:mr:531616156226945024> \`??\``;
			}

			var rarity = global.toFancyNum(result[1][0].total)+" total caught";

			var nickname = "";
			if(result[0][0].nickname)
				nickname = "**Nickname:** "+result[0][0].nickname+"\n";

			var desc = "*No description created\nHave a fun/creative description?\nUse 'owo feedback'!*";
			if(animal.desc){
				desc = "*"+animal.desc+"*";
				if(descID = desc.match(/\?[0-9]+\?/))
					if(descID = descID[0].match(/[0-9]+/)){
						descID = await global.getUser(descID[0]);
						desc = desc.replace(/\s*\?[0-9]+\?\s*/,(descID)?"* ***"+descID.username+"*** \n*":"* ***A User*** *");
					}
			}

			const embed = {
				"title": ((animal.uni)?animal.uni:animal.value)+" "+animal.name,
				"color": 4886754,
				"thumbnail": {
					"url": (emoji)?emoji:p.client.user.displayAvatarURL
				},
				"description": desc+"\n\n"+nickname+"**Count:** "+result[0][0].count+"/"+result[0][0].totalcount+"\n**Rank:** "+rankEmoji+" "+animal.rank+"\n**Rarity:** "+rarity+"\n**Alias:** "+alias+"\n**Points:** "+points+"\n**Sell:** "+sell+"\n**Sacrifice:** "+sac+"\n"+phys+"\n"+mag
			};
			msg.channel.send({ embed });
		});
	}

})

