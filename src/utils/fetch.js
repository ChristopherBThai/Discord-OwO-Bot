class Fetch{

	constructor(main){
		this.main = main;
		this.bot = main.bot;
	}

	async getMember(guildID,userID,cache=true){
		let guild = await this.getGuild(guildID,cache);
		let member = guild.members.get(userID);
		if(!member){
			member = await guild.getRESTMember(userID);
			if(!member.id) member.id = member.user.id;
			if(cache){
				guild.members.add(member,guild,false);
			}
		}
		return member;
	}

	async getGuild(guildID,cache=true){
		let guild = this.bot.guilds.get(guildID);
		if(!guild){
			guild = await this.bot.getRESTGuild(guildID);
			if(cache){
				this.bot.guilds.add(guild,this.bot,false);
			}
		}
		return guild;
	}

}

module.exports = Fetch;
