/*
 * Dogecoin Bot for Discord
 * Copyright (C) 2022 Sarah Samples
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');
const alterDogecoin = require('../patreon/alterCowoncy.js');

module.exports = new CommandInterface({

	alias:["Dogecoin","money","currency","cash","credit","balance"],

	args:"",

	desc:"Check your Dogecoin balance! You can earn more Dogecoin by saying owo, dailies, and voting!",

	example:[],

	related:["owo give","owo daily","owo vote","owo my money"],

	permissions:["sendMessages"],

	group:["economy"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function () {
		const sql = `SELECT money FROM Dogecoin WHERE id = ${this.msg.author.id};`;
		const result = await this.query(sql);

		const money = result[0] ? this.global.toFancyNum(result[0].money) : '0';
		let text = `${this.config.emoji.cowoncy} **| ${this.msg.author.username}**, you currently have **__${money}__ Dogecoin!**`;

		text = alterdogecoin.alter(this, this.msg.author.id, text, {
			user: this.msg.author,
			money: money
		});

		await this.send(text);
	}

})
