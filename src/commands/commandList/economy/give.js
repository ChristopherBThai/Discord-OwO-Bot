/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const alterGive = require('../patreon/alterGive.js');
const cowoncyUtils = require('./utils/cowoncyUtils.js');

module.exports = new CommandInterface({

	alias:["give","send"],

	args:"{@user} {amount}",

	desc:"Send some cowoncy to other users! This command must contain a @mention and an amount\n\nThere is a limit on how much cowoncy you can receive and give.",

	example:["owo give @Scuttler 25"],

	related:["owo money"],

	permissions:["sendMessages"],

	group:["economy"],

	cooldown:5000,
	half:100,
	six:500,
	bot:true,

	execute: async function() {
		let amount, id, invalid;

		//Grab ID and Amount
		for(let i = 0; i < this.args.length; i++) {
			if(this.global.isInt(this.args[i]) && !amount) {
				amount = parseInt(this.args[i]);
			} else if(this.global.isUser(this.args[i]) && !id) {
				id = this.args[i].match(/[0-9]+/)[0];
			} else {
				invalid = true;
			}
		}

		//Check for valid amount/id
		if(invalid || !id || !amount || amount <= 0) {
			return this.send("**🚫 | " + this.msg.author.username + "**, Invalid arguments! :c", 3000);
		}

		//Check if valid user
		let user = await this.getMention(id);
		if(!user) {
			return this.send("**🚫 | "+this.msg.author.username+"**, I could not find that user!", 3000);
		} else if(user.bot) {
			return this.send("**🚫 | "+this.msg.author.username+"**, You can't send cowoncy to a bot silly!", 3000);
		} else if(user.id == this.msg.author.id) {
			return this.send("**💳 | "+this.msg.author.username+"** sent **"+(this.global.toFancyNum(amount))+" cowoncy** to... **"+user.username+"**... *but... why?*");
		}

		//Gives money
		const con = await this.startTransaction()
		try {
			const canGive = await cowoncyUtils.canGive.bind(this)(this.msg.author, user, amount, con);
			if (canGive.error) {
				this.errorMsg(canGive.error);
				return con.rollback();
			}

			let sql = `UPDATE cowoncy SET money = money - ${amount} WHERE id = ${this.msg.author.id} AND money >= ${amount};`;
			sql += `INSERT INTO cowoncy (id, money) VALUES (${id}, ${amount}) ON DUPLICATE KEY UPDATE money = money + ${amount};`;
			sql += `INSERT INTO transaction (sender, reciever, amount) VALUES (${this.msg.author.id}, ${id}, ${amount});`;
			sql += canGive.sql;
			let result = await con.query(sql);

			if (!result[0].changedRows) {
				this.errorMsg(', you silly hooman! You don\'t have enough cowoncy!', 3000);
				return con.rollback();
			}

			await con.commit();
		} catch (err) {
			console.error(err);
			this.errorMsg(", there was an error sending cowoncy! Please try again later.", 3000);
			return con.rollback();
		}

		let text = `**💳 | ${this.msg.author.username}** sent **${this.global.toFancyNum(amount)} cowoncy** to **${user.username}**!`;
		text = alterGive.alter(this, this.msg.author.id, text, {
			from: this.msg.author,
			to: user,
			amount: this.global.toFancyNum(amount)
		});

		this.send(text);
		this.neo4j.give(this.msg,user, amount);
		this.logger.incr(`cowoncy`, amount, {type:'given'}, this.msg);
		this.logger.decr(`cowoncy`, -1 * amount, {type:'give'}, this.msg);
	}

})
