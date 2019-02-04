const CommandInterface = require('../../commandinterface.js');

const crate = "<:crate:523771259302182922>";
const crateShake = "<a:crateshake:523771259172028420>";
const crateOpen = "<a:crateopen:523771437408845852>";
const weaponUtil = require('./util/weaponUtil.js');

module.exports = new CommandInterface({
	
	alias:["crate","weaponcrate","wc"],

	args:"",

	desc:"Opens a crate to find weapons!",

	example:[],

	related:["owo weapon","owo battle"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		/* Decrement crate count */
		let sql = "UPDATE IGNORE crate SET boxcount = boxcount - 1 WHERE uid = (SELECT uid FROM user WHERE id = "+p.msg.author.id+") AND boxcount > 0;";
		sql += "SELECT uid FROM user WHERE id = "+p.msg.author.id+";";
		let result = await p.query(sql);

		/* Validate query */
		if((result[0].changedRows==0||!result[1][0])){
			p.send("**🚫 | "+p.msg.author.username+"**, You don't have any weapon crates!",3000);
			return;
		}

		/* Parse uid */
		let uid = result[1][0].uid;
		if(!uid){
			p.send("**🚫 | "+p.msg.author.username+"**, You don't have any weapon crates!",3000);
			return;
		}

		/* Get random weapon and construct sql */
		let weapon = weaponUtil.getRandomWeapon(p.msg.author.id);

		/* construct sql */
		sql = `INSERT INTO user_weapon (uid,wid,stat) VALUES (${uid},${weapon.id},'${weapon.sqlStat}');`;

		/* Insert weapon */
		result = await p.query(sql);		
		let uwid = result.insertId;
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

		/* Construct text */
		let text1 = p.config.emoji.blank+" **| "+p.msg.author.username+"** opens a weapon crate\n"+crateShake+" **|** and finds a ...";
		let text2 = weapon.emoji+" **| "+p.msg.author.username+"** opens a weapon crate\n"+crateOpen+" **|** and finds a `"+uwid+"` "+weapon.rank.emoji+" "+weapon.emoji;
		for(var i=0;i<weapon.passives.length;i++){
			text2 += " "+weapon.passives[i].emoji;
		}
		text2 += " "+weapon.avgQuality+"%";

		/* Send and edit message */
		let message = await p.msg.channel.send(text1);
		setTimeout(function(){message.edit(text2)},3000);
	}
})


