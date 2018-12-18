const CommandInterface = require('../../commandinterface.js');

const crate = "<:crate:523771259302182922>";
const crateShake = "<a:crateshake:523771259172028420>";
const crateOpen = "<a:crateopen:523771437408845852>";
const crateUtil = require('./util/crateUtil.js');

module.exports = new CommandInterface({
	
	alias:["crate","weaponcrate"],

	args:"",

	desc:"Opens a crate to find weapons!",

	example:[],

	related:["owo weapon","owo battle"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		/* Decrement crate count */
		var sql = "UPDATE IGNORE crate SET boxcount = boxcount - 1 WHERE uid = (SELECT uid FROM user WHERE id = "+p.msg.author.id+") AND boxcount > 0;";
		sql += "SELECT uid FROM user WHERE id = "+p.msg.author.id+";";
		var result = await p.query(sql);

		/* Validate query */
		if(false&&(result[0].changedRows==0||!result[1][0])){
			p.send("**🚫 | "+p.msg.author.username+"**, You don't have ay weapon crates!",3000);
			return;
		}

		/* Parse uid */
		var uid = result[1][0].uid;
		if(!uid){
			p.send("**🚫 | "+p.msg.author.username+"**, You don't have ay weapon crates!",3000);
			return;
		}

		/* Get random weapon and construct sql */
		var weapon = crateUtil.getRandomWeapon(p.msg.author.id);

		var text1 = p.config.emoji.blank+p.config.emoji.blank+" **| "+p.msg.author.username+"** opens a weapon crate\n"+p.config.emoji.blank+crateShake+" **|** and finds a ...";
		var text2 = weapon.rank.emoji+weapon.emoji+" **| "+p.msg.author.username+"** opens a weapon crate\n"+p.config.emoji.blank+crateOpen+" **|** and finds a" + ((weapon.rank.name.charAt(0)=='E' || weapon.rank.name.charAt(0)=='U') ? "n" : "") + " **"+weapon.rank.name+" "+weapon.name+"**!";

		/* construct sql */
		sql = `INSERT INTO user_weapon (uid,wid,stat) VALUES (${uid},${weapon.id},${weapon.sqlStat});`;

		/* Insert weapon */
		result = await p.query(sql);		
		var uwid = result.insertId;
		if(!uwid){
			p.errorMsg(", Uh oh. Something went wrong! The weapon passive could not be applied");
			console.error("Unable to add weapon passive to: "+uwid);
			return;
		}

		/* Insert passive */
		if(weapon.passives.length>0){
			sql = `INSERT INTO user_weapon_passive (uwid,pcount,wpid,stat) VALUES `;
			for(var i=0;i<weapon.passives.length;i++){
				sql += `(${uwid},${i},${weapon.passives[i].id},${weapon.passives[i].sqlStat}),`;
			}
			sql = `${sql.slice(0,-1)};`;
			result = await p.query(sql);
		}

		/* Send and edit message */
		var message = await p.msg.channel.send(text1);
		setTimeout(function(){message.edit(text2)},3000);
	}
})


