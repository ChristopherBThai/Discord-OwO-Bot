const redis = require('./redis.js');
const logger = require('./logger.js');
const levelRewards = require('./levelRewards.js');
var macro;
try{macro = require('../../tokens/macro.js');}catch(e){console.error("Missing macro.js. Please add this file to ../tokens/macro.js\n",e)}
const minXP = 10, maxXP = 15, dailyLimit = 3000;
var banned = {};

exports.giveXP = async function(msg){

	// must be a text channel
	if(msg.channel.type=="dm") return;
	
	// Return if on banned or is a bot
	if(msg.author.bot||banned[msg.author.id]||banned[msg.channel.id]) return;

	// Set cooldown 
	if(!await redis.sadd('user_xp_cooldown',msg.author.id)) return;

	// Give random amount of xp
	let gain = minXP + Math.floor(Math.random()*(1+maxXP-minXP));

	//Check if we hit the daily limit of xp
	let limit = await redis.hgetall("xplimit_"+msg.author.id);
	let bonus = 0;
	if(limit&&limit.day==getDate()){
		if(limit.xp>dailyLimit) return;
		else limit.xp = parseInt(limit.xp)+gain;
	}else{
		limit = {day:getDate(),xp:gain,guilds:""};
		// Daily bonus xp
		bonus += 500;
	}

	// Distribute daily bonus for the server
	let guildBonus = 0;
	if(!limit.guilds) limit.guilds = [];
	else limit.guilds = limit.guilds.split(",");
	if(!limit.guilds.includes(msg.guild.id)){
		limit.guilds.push(msg.guild.id);
		guildBonus += 500;
	}
	limit.guilds = limit.guilds.join(",");

	// Check for macros
	if(macro&&!macro.levelCheck(msg,limit))
		return;

	// Distribute xp
	//console.log("["+msg.channel.id+"]"+msg.author.username+" earned "+gain+"xp");
	redis.hmset("xplimit_"+msg.author.id,limit);
	logger.value('xp',gain+bonus,['id:'+msg.author.id,'channel:'+msg.channel.id,'guild:'+msg.guild.id]);
	let xp = await redis.incr("user_xp",msg.author.id,gain+bonus);
	await redis.incr("user_xp_"+msg.guild.id,msg.author.id,gain+guildBonus);

	// Check if user leveled up
	let previousLvl = getLevel(xp-(gain+bonus)).level;
	let currentLvl = getLevel(xp).level;
	if(previousLvl != currentLvl){
		levelRewards.distributeRewards(msg);
	}

}

/* Get global user level */
exports.getUserLevel = async function(id){
	let xp = parseInt(await redis.getXP("user_xp",id));
	return getLevel(xp);
}

/* Get server user level */
exports.getUserServerLevel = async function(id,gid){
	let xp = parseInt(await redis.getXP("user_xp_"+gid,id));
	return getLevel(xp);
}

/* Get global user rank */
exports.getUserRank = async function(id){
	let rank = parseInt(await redis.getRank("user_xp",id))+1;
	return rank;
}

/* Get server user rank */
exports.getUserServerRank = async function(id,gid){
	let rank = parseInt(await redis.getRank("user_xp_"+gid,id))+1;
	return rank;
}

/* Get top global rankings */
exports.getGlobalRanking = async function(count){
	return await redis.getTop("user_xp",count);
}

/* Get top server rankings */
exports.getServerRanking = async function(gid,count){
	return await redis.getTop("user_xp_"+gid,count);
}

/* Get people close to a certain rank */
exports.getNearbyXP = async function(rank,count=2){
	let min = rank-count-1;
	if(min<0) min = 0;
	return await redis.getRange("user_xp",min,rank+count-1);
}

/* Get people close to a certain rank */
exports.getNearbyServerXP = async function(rank,gid,count=2){
	let min = rank-count-1;
	if(min<0) min = 0;
	return await redis.getRange("user_xp_"+gid,min,rank+count-1);
}

/* XP required for a level */
function getXpRequired(lvl){
	return 5000+Math.pow(lvl*7,2);
}

/*
let total = 0;
let totali = 0;
for(let i=1;i<51;i++){
	let xp = getXpRequired(i);
	total += xp;
	totali += i;
	console.log(i+" | "+xp+" ("+Math.round(xp/3500)+") | "+total+" ("+Math.round(total/3500)+") | "+totali);
}
*/

/* Get level from xp */
var getLevel = exports.getLevel = function(xp){
	if(!xp) xp = 0;
	let lvl = 0;
	let required = getXpRequired(lvl+1);
	while(xp>required){
		xp -= required;
		lvl++;
		required = getXpRequired(lvl+1);
	}
	return {level:lvl,currentxp:xp,maxxp:required}
}

/* Ban a user from getting xp */
function ban(id,time=3600000){
	banned[id] = true;
	setTimeout(() => { delete banned[id]; },time);
}

/* Permma ban a user from getting xp */
function permBan(id){
	banned[id] = true;
}

/* Remove a ban */
function removeBan(id){
	delete banned[id];
}

/* Some cheat detection stuff */
macro.initLevelCheck(ban);

/* Gets the current day as a string */
const dateOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
function getDate(date){
	if(date) return (new Date(date)).toLocaleDateString("default",dateOptions);
	return (new Date()).toLocaleDateString("default",dateOptions);
}
