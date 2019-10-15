/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

class Fetch{

	constructor(main){
		this.main = main;
		this.bot = main.bot;
	}

	async getUser(userID,cache=true){
		if(!userID) return;
		let user = this.bot.users.get(userID);
		if(!user){
			user = await this.bot.getRESTUser(userID);
			if(user&&cache){
				this.bot.users.add(user,this.bot,false);
			}
		}
		return user;
	}

	async getMember(guildID,userID,cache=true){
		if(!userID) return;
		let guild = await this.getGuild(guildID,cache);
		if(!guild) return;
		let member = guild.members.get(userID);
		if(!member){
			member = await guild.getRESTMember(userID);
			if(!member.id) member.id = member.user.id;
			if(member&&cache){
				guild.members.add(member,guild,false);
			}
		}
		return member;
	}

	async getGuild(guildID,cache=true){
		if(!guildID) return;
		let guild = this.bot.guilds.get(guildID);
		if(!guild){
			guild = await this.bot.getRESTGuild(guildID);
			if(guild&&cache){
				this.bot.guilds.add(guild,this.bot,false);
			}
		}
		return guild;
	}

}

module.exports = Fetch;
