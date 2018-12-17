const CommandInterface = require('../../commandinterface.js');

const crate = "<:box:427352600476647425>";
const crateShake = "<a:boxshake:427004983460888588>";
const crateOpen = "<a:boxopen:427019823747301377>";
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
		var result = await p.query(sql);

		/* Validate query */
		if(false&&result.changedRows==0){
			p.send("**🚫 | "+p.msg.author.username+"**, You don't have ay weapon crates!",3000);
			return;
		}

		/* Get random weapon and construct sql */
		var weapon = crateUtil.getRandomWeapon(p.msg.author.id);
		console.log(weapon);
		return;
		var text1 = p.config.emoji.blank+" **| "+p.msg.author.username+"** opens a weapon crate\n"+boxShake+" **|** and finds a ...";
		var text2 = weapon.emoji+" **| "+p.msg.author.username+"** opens a weapon crate\n"+boxOpen+" **|** and finds a" + ((weapon.name.charAt(0)=='E' || weapon.name.charAt(0)=='U') ? "n" : "") + " **"+weapon.rank+" "+weapon.name+"**!";

		/* Insert weapon */
		result = await p.query(weapon.sql).catch(err => {
			p.query("INSERT IGNORE INTO user (id) VALUES ("+p.msg.author.id+");"+weapon.sql);
		});
		
		/* Send and edit message */
		var message = p.msg.channel.send(text1);
		setTimeout(function(){message.edit(text2)},3000);
	}
})


