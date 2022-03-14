const timerEmoji = '⏱';
const cooldown = {};
const lock = {};
let macro

exports.check = async function(p,command){
	let key = "cd_"+command+"_"+p.msg.author.id;

	// On cooldown
	if(cooldown[key] && !p.msg.interaction) return;

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
		ccd.lasttime = new Date(ccd.lasttime);
		diff = now - ccd.lasttime;

		//	Still in cooldown
		if(diff<mcommands[ccd.command].cd){
			if(command == "points"){
				if ( diff > -600000) {
					ccd.lasttime = new Date(ccd.lasttime.getTime() + 8000);
					await redis.hmset(key,ccd);
					await redis.expire(key);
				}
				now = false;
			}else{
				let {timerText, time} = parseTimer(mcommands[ccd.command].cd-diff);
				await p.replyMsg(timerEmoji,"! Please wait "+timerText+" and try again!",time, null, {ephemeral: true});
				cooldown[key] = true;
				setTimeout(() => {delete cooldown[key];}, time);
				now = false;
			}

		// Check for macros/bots
		}else{
			ccd.lasttime = now;
			await redis.hmset(key,ccd);
			await redis.expire(key);
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
		let valid = !!await macro.check(p,command,{diff,now});
		if(!valid && command=="points"){
			await setCooldown(p,command,600);
		} else if (!valid) {
			await setCooldown(p,command,10);
		}
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

const setCooldown = exports.setCooldown = async function(p,command,cooldown=0){
	let key = "cd_"+command+"_"+p.msg.author.id;
	let commandCooldown = p.commands[p.commandAlias].cooldown;

	let past = new Date(Date.now() + (cooldown*1000) - commandCooldown);
	await p.redis.hmset(key,{lasttime:past});
	await p.redis.expire(key);
}

exports.setMacro = function(m) {
	macro = m
}
