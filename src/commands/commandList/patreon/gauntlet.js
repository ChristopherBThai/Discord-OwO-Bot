/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const yinyangEmoji = "<a:yinyang:678514299219476490>";
const gauntletEmoji = "<a:gauntlet:685758918869123120>";
const reverseEmoji = "<:reverse:685758918533971973>";
const snapEmoji = "<a:snap:685758919800258580>";
const pearEmoji = "🍐";
const owner = "549876586720133120";

module.exports = new CommandInterface({

	alias:["gauntlet"],

	args:"snap",

	desc:"Combine 4 yinyangs to create a thanos gauntlet! Snap to choose one of 3 events! This command was created by ! 「陰陽」 Kitsune ☯",

	example:[],

	related:[],

	permissions:["sendMessages"],

	cooldown:10000,
	half:80,
	six:400,
	bot:true,

	execute: async function(p){
		if(p.args.length==0){
			createGauntlet(p);
		}else{
			useGauntlet(p);
		}
	}
});

async function createGauntlet(p) {
	let gauntletCount = await p.redis.zscore("gauntlet",p.msg.author.id);
	if (gauntletCount==null || +gauntletCount) {
		p.send(await getDisplayText(p));
		return;
	}

	let result = await p.redis.incr("yinyang",p.msg.author.id,-4);
	const refund = +result<0||((+result+4)%6)<4;
	const displayText = await getDisplayText(p);
	if ( result==null || refund ) {
		if(result<0) p.redis.incr("yinyang",p.msg.author.id,4);
		p.errorMsg(`, you don't have enough yin yangs!\n${p.config.emoji.blank} **|** ${displayText}`);
		p.setCooldown(5);
		return;
	}

	await p.redis.incr("gauntlet",p.msg.author.id,1);
	p.replyMsg(gauntletEmoji,`, you combined 4 ${yinyangEmoji} to create one thanos gauntlet!\n${p.config.emoji.blank} **|** ${displayText}`);
}

async function getDisplayText(p) {
	const saved = await p.redis.zscore("universe_saved",p.msg.author.id) || 0;
	const destroyed = await p.redis.zscore("universed_destroyed",p.msg.author.id) || 0;
	const pears = await p.redis.zscore("pears",p.msg.author.id) || 0;
	return `${reverseEmoji} Universe saved: ${saved} | ${snapEmoji} Universe destroyed: ${destroyed} | ${pearEmoji} Pears collected: ${pears}`;
}

async function useGauntlet(p) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.incr("gauntlet",p.msg.author.id,-1);
		if (result==null||result<0) {
			if(result<0) p.redis.incr("gauntlet",p.msg.author.id,1);
			p.errorMsg(", you don't have a gauntlet!",3000);
			p.setCooldown(5);
			return;
		}
	}

	// choose/add stuff
	const rand = Math.floor(Math.random()*100);
	if (rand < 1) {
		await p.redis.incr("universe_saved",p.msg.author.id,1);
		p.replyMsg(reverseEmoji,", you have saved the earth by reversing!");
	} else if (rand < 21) {
		await p.redis.incr("universe_destroyed",p.msg.author.id,1);
		p.replyMsg(snapEmoji,", you have destroyed half of the universe's population! Astrocity!");
	} else {
		await p.redis.incr("pears",p.msg.author.id,1);
		p.replyMsg(pearEmoji,", you traded the mighty gauntlet for a sweet pear");
	}
}
