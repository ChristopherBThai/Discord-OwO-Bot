const redis = require('./redis.js');
const logger = require('./logger.js');
var macro;
try{macro = require('../../tokens/macro.js');}catch(e){console.error("Missing macro.js. Please add this file to ../tokens/macro.js\n",e)}
const minXP = 10, maxXP = 15, dailyLimit = 3000;
var cooldown = {};
var banned = {};

exports.giveXP = async function(msg){

	// must be a text channel
	if(msg.channel.type=="dm") return;
	
	// Return if on cooldown (1min) or is a bot
	if(!cooldown||msg.author.bot||cooldown[msg.author.id]||banned[msg.author.id]||banned[msg.channel.id]) return;

	// Set cooldown of 1 minute
	cooldown[msg.author.id] = 1;

	// Give random amount of xp
	let gain = minXP + Math.floor(Math.random()*(1+maxXP-minXP));

	//Check if we hit the daily limit of xp
	let limit = await redis.hgetall("xplimit_"+msg.author.id);
	if(limit&&limit.day==getDate()){
		if(limit.xp>dailyLimit) return;
		else limit.xp = parseInt(limit.xp)+gain;
	}else{
		limit = {day:getDate(),xp:gain};
		gain += 500;
	}

	// Check for macros
	if(macro&&!macro.levelCheck(msg,limit))
		return;

	//console.log("["+msg.channel.id+"]"+msg.author.username+" earned "+gain+"xp");
	redis.hmset("xplimit_"+msg.author.id,limit);
	logger.value('xp',gain,['id:'+msg.author.id,'channel:'+msg.channel.id,'guild:'+msg.guild.id]);
	let xp = await redis.incr("user_xp",msg.author.id,gain);

}

exports.getUserLevel = async function(id){
	let xp = parseInt(await redis.getXP(id));
	return getLevel(xp);
}

exports.getUserRank = async function(id){
	let rank = parseInt(await redis.getRank("user_xp",id))+1;
	return rank;
}

exports.getGlobalRanking = async function(count){
	return await redis.getTop("user_xp",count);
}

exports.getNearbyXP = async function(rank,count=2){
	return await redis.getRange("user_xp",rank-count-1,rank+count-1);
}

function getXpRequired(lvl){
	return 5000+Math.pow(lvl*5,2);
}

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

function ban(id,time=3600000){
	banned[id] = true;
	setTimeout(() => { delete banned[id]; },time);
}

function permBan(id){
	banned[id] = true;
}
function removeBan(id){
	delete banned[id];
}

macro.initLevelCheck(ban);

const dateOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
function getDate(date){
	if(date) return (new Date(date)).toLocaleDateString("default",dateOptions);
	return (new Date()).toLocaleDateString("default",dateOptions);
}

setInterval(() => {
	cooldown = {};
}, 60000);
