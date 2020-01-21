const timerEmoji = '⏱';
const macro = require('../../../tokens/macro.js');

const cooldown = {};
const lock = {};

exports.check = async function(p,command){
	let key = "cd_"+command+"_"+p.msg.author.id;

	// On cooldown
	if(cooldown[key]) return;

	// Parse variables
	let {redis, mcommands} = p;
	let now,diff;

	// lock key
	if(lock[key]) return;
	else lock[key] = true;

	try{
		// Fetch last used time
		let ccd = await redis.hgetall(key);
		if(!ccd) ccd = {"command":command,"lasttime":new Date('January 1,2018')};

		// Calculate time difference 
		now = new Date();
		diff = now - new Date(ccd.lasttime);

		//	Still in cooldown
		if(diff<mcommands[ccd.command].cd){
			if(command == "points"){
				ccd.lasttime = now;
				await redis.hmset(key,ccd);
				now = false;
			}else{
				let {timerText, time} = parseTimer(mcommands[ccd.command].cd-diff);
				await p.replyMsg(timerEmoji,"! Please wait "+timerText+" and try again!",time);
				cooldown[key] = true;
				setTimeout(() => {delete cooldown[key];}, time);
				now = false;
			}

		// Check for macros/bots
		}else{
			ccd.lasttime = now;
			await redis.hmset(key,ccd);
		}
	}catch(e){
		console.error("cooldown.js check command");
		console.error(e);
		return;
	}finally{
		// We need to make sure we unlock the semaphore
		delete lock[key];
	}

	// Everything was a success, lets check for macro/botting
	if(now){
		if(command == "points") return true;
		let valid = !!await macro.check(p,command,{diff,now});
		return valid;
	}
}

// Parse cooldown left
function parseTimer(diff){
	let time = diff;
	if(time<1000) time = 1000;

	let mspercent = Math.trunc(((diff%1000)/1000)*100);
	diff = Math.trunc(diff/1000);
	let min = Math.trunc(diff/60)
	let sec = diff%60;
	let timerText = "**"+((min>0)?(min+"m "):"")+sec+"."+mspercent+"s**";
	return {min,sec,timerText,time}
}

exports.setCooldown = async function(p,command,cooldown=0){
	let key = "cd_"+command+"_"+p.msg.author.id;
	let commandCooldown = p.commands[p.commandAlias].cooldown;

	let past = new Date(Date.now() + (cooldown*1000) - commandCooldown);
	await p.redis.hmset(key,{lasttime:past});
}

