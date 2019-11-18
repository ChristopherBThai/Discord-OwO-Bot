/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const tada = '🎉';
const gear = '⚙';

module.exports = new CommandInterface({

	alias:["addpatreon"],

	admin:true,
	dm:true,

	execute: async function(p){
		//Parse id
		if(!p.global.isUser(p.args[0])&&!p.global.isUser("<@"+p.args[0]+">")){
			p.errorMsg(", Invalid user id",3000);
			return;
		}

		// Parses # of months
		let addMonths = 0;
		if(p.args.length&&p.global.isInt(p.args[1]))
			addMonths = parseInt(p.args[1]);
		if(addMonths<0) addMonths = 0;
		// Parse patreon type (use binary to parse flags)
		let type;
		if(p.args[1]&&p.global.isInt(p.args[2]))
			type = parseInt(p.args[2]);
		if(type&&(type>3||type<1)){
			p.errorMsg(", wrong patreon types!");
			return;
		}

		// Query result
		let sql = `SELECT user.uid,patreonMonths,patreonTimer,TIMESTAMPDIFF(MONTH,patreonTimer,NOW()) AS monthsPassed,patreonType FROM user LEFT JOIN patreons ON user.uid = patreons.uid WHERE id = ${p.args[0]}`;
		let result = await p.query(sql);
		let uid;
		let months = result[0]&&result[0].patreonMonths?result[0].patreonMonths:0;
		let monthsPassed = result[0]&&result[0].monthsPassed?result[0].monthsPassed:months;
		if(!type){
			if(result[0]&&result[0].patreonType)
				type = result[0].patreonType;
			else
				type = 1;
		}

		// If uid does not exist
		if(result.length<1||!result[0].uid){
			sql = `INSERT IGNORE INTO user (id,count) VALUES (${p.args[0]},0);`;
			result = await p.query(sql);
			uid = result.insertId;
		}else{
			uid = result[0].uid;
		}

		// reset timer or continue with current timer
		let date;
		if(months<=monthsPassed){
			sql = `INSERT INTO patreons (uid,patreonMonths,patreonType) VALUES (${uid},${addMonths},${type}) ON DUPLICATE KEY UPDATE patreonType = ${type}, patreonMonths = ${addMonths},patreonTimer = NOW();`;
			date = new Date();
			date.setMonth(date.getMonth()+addMonths);
		}else{
			sql = `UPDATE patreons SET patreonType = ${type}, patreonMonths = patreonMonths + ${addMonths} WHERE uid = ${uid};`;
			date = new Date(result[0].patreonTimer);
			date.setMonth(date.getMonth()+addMonths+months);
		}
		date = date.toString();
		result = await p.query(sql);

		// Send msgs
		let user;
		if(addMonths>0)
			user = await p.sender.msgUser(p.args[0],`${tada} **|** Your patreon has been extended by ${addMonths} month(s)!\n${p.config.emoji.blank} **|** Expires on: **${date}**`);
		else
			user = await p.sender.msgUser(p.args[0],`${gear} **|** Your patreon perks have been changed!\n${p.config.emoji.blank} **|** Expires on: **${date}**`);
		if(user)
			await p.replyMsg(tada,`, Updated **${user.username+"#"+user.discriminator}** patreon perks until **${date}**`);
		else
			await p.errorMsg(', Failed to message user',3000);
	}

})
