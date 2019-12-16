/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function(id,text,type){
	switch(id){
		case '111619509529387008':
			return lexus(text,type);
		case '242718397836558337':
			return shippig(text,type);
		case '255750356519223297':
			return spotifybot(text,type);
		case '250383887312748545':
			return elsa(text,type);
		case '192692796841263104':
			return dalu(text,type);
		case '323347251705544704':
			return rikudou(text,type);
		default:
			return text;
	}
}

function lexus(text,type){
	let lunawave = "<a:lunawave:556733830224936971>";
	let lunajump = "<a:lunajump:556733828480106496>";
	switch(type){
		case 'hb':
			text.color = 15704149;
			text.fields[0].name = lunawave+" `Bork! I am Luna! I will find friends for you, master!`";
			if(text.fields.length>=8){
				text.fields[7].name = lunajump+" Luna is still searching!";
				text.fields[7].value = text.fields[7].value.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Bork! I am still looking for friends. I will be back in")
					.replace("DONE","done")
					.replace("`\n","!`\n")
					.replace("ANIMALS CAPTURED","friends made!")
			}
			return text;
		case 'progress':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,lunajump)
				.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Bork! I am still looking for friends. I will be back in")
				.replace("`\n","!`\n")
				.replace("DONE","done")
				.replace("ANIMALS CAPTURED","friends made!")
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,lunajump);
			return text;
		case 'spent':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,lunawave)
				.replace("BEEP BOOP.","Arf!")
				.replace("YOU SPENT","you spent")
				.replace("I WILL BE BACK IN","I will be back in")
				.replace("WITH","with")
				.replace("ANIMALS","friends")
				.replace("ESSENCE, AND","essence, and")
				.replace("EXPERIENCE","experience!");
			return text;
		case 'returned':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,lunawave)
				.replace("BEEP BOOP. I AM BACK WITH","Woof! I am back with")
				.replace("ANIMALS","friends")
				.replace("ESSENCE, AND","essence, and")
				.replace("EXPERIENCE","experience!");
		default:
			return text;
	}
}

function shippig(text,type){
	switch(type){
		case 'hb':
			text.color = 6315775;
			text.fields[0].name = "<:pandabag:566537378303311872> `Hi! I am Roo! I will kidnap animals for you!`";
			if(text.fields.length>=8){
				text.fields[7].name = "<a:roonyoom:566536940846055444> Roo is still kidnapping!";
				text.fields[7].value = text.fields[7].value.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Roo will be back in")
					.replace("DONE","done")
					.replace("`\n","!`\n")
					.replace("ANIMALS CAPTURED","animals captured!")
			}
			return text;
		case 'progress':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,"<a:roonyoom:566536940846055444>")
				.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Roo is still kidnapping and will be back in")
				.replace("`\n","!`\n")
				.replace("DONE","done")
				.replace("ANIMALS CAPTURED","animals captured!")
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,"<:pandabag:566537378303311872>");
			return text;
		case 'spent':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,"<a:roosellout:566537379670786048>")
				.replace("`BEEP BOOP. `","")
				.replace("YOU SPENT","you payed roo")
				.replace("I WILL BE BACK IN","and will be back in")
				.replace("WITH","with")
				.replace("ANIMALS","animals")
				.replace("ESSENCE, AND","essence, and")
				.replace("EXPERIENCE","experience!");
			return text;
		case 'returned':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,"<:pandabag:566537378303311872>")
				.replace("BEEP BOOP. I AM BACK WITH","Roo kidnapped")
				.replace("ANIMALS","animals")
				.replace("ESSENCE, AND","essence, and")
				.replace("EXPERIENCE","experience!");
		default:
			return text;
	}
}

function spotifybot(text,type){
	let spotify = '<a:spotify:577027003656437766>';
	let swipeup = '<a:swipeup:577026648646483969>';
	let nowplaying = '<a:nowplaying:577026647434330132>';
	switch(type){
		case 'hb':
			text.color = 1947988;
			delete text.author;
			text.fields[0].name = nowplaying+" ***Spotify*** *music stops playing...* OH NO! Need more Songs?\n"+spotify+" `SPOTIFYBOT can add Songs to your Playlist.`";
			text.fields[1].value = text.fields[1].value.replace(/(\r\n|\n|\r)/gm," *Oh? You need better songs?*\n");
			text.fields[2].value = text.fields[2].value.replace(/(\r\n|\n|\r)/gm," *How about a longer Playlist?*\n");
			text.fields[3].value = text.fields[3].value.replace(/(\r\n|\n|\r)/gm," *Want Spotify Premium??*\n");
			text.fields[4].value = text.fields[4].value.replace(/(\r\n|\n|\r)/gm," *Hmm, what about a New Playlist?*\n");
			text.fields[5].value = text.fields[5].value.replace(/(\r\n|\n|\r)/gm," *Or do you want more Sponsors??*\n");
			if(text.fields.length>=8){
				text.fields[7].name = spotify+" SPOTIFYBOT is currently adding songs!";
				text.fields[7].value = text.fields[7].value.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Oops! Looks like the SPOTIFY Playlist is incomplete.\nNEW SONGS ADDED IN")
					.replace("ANIMALS CAPTURED","SONGS ADDED")
			}
			return text;
		case 'progress':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,spotify)
				.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Oops! Looks like the SPOTIFY Playlist is incomplete.`\n<:blank:427371936482328596> **|** `NEW SONGS ADDED IN")
				.replace("ANIMALS CAPTURED","SONGS ADDED!")
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,spotify);
			return text;
		case 'spent':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,spotify)
				.replace("`BEEP BOOP. `","")
				.replace("cowoncy","cowoncy AND GOT Spotify Premium!")
				.replace("ANIMALS","SONGS")
			return text;
		case 'returned':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,spotify)
				.replace("BEEP BOOP. I AM","SPOTIFY Playlist is ready! I AM")
				.replace("ANIMALS","SONGS")
		default:
			return text;
	}
}

function elsa(text,type){
	let shiryu1 = "<:shiryu:608487137058226186>";
	let shiryu2 = "<a:shiryuuu:608487444836253696>";
	switch(type){
		case 'hb':
			text.author.name = text.author.name.replace("HuntBot","Bronze Knight");
			text.description = shiryu1+" **`I will scour the cosmos for you, my mistress`**";
			text.color = 7319500;
			if(text.fields.length>=8){
				text.fields[7].name = shiryu1+" I'm still gathering knights.";
				text.fields[7].value = text.fields[7].value.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","I'll be back in")
					.replace("DONE","done")
					.replace("ANIMALS CAPTURED","knights found")
			}
			text.fields.shift()
			return text;
		case 'progress':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,shiryu1)
				.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","I'm still gathering knights. I'll be back in")
				.replace("DONE","done")
				.replace("ANIMALS CAPTURED","knights found")
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,shiryu1);
			return text;
		case 'spent':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,shiryu1)
				.replace(/BEEP BOOP\. `\*\*`[^`]+`\*\*`, YOU SPENT/gi,"As you wish, my mistress. You spent")
				.replace("I WILL BE BACK IN","I will return in")
				.replace("WITH","with")
				.replace("ANIMALS","animals")
				.replace("ESSENCE, AND","essence, and")
				.replace("EXPERIENCE","experience");
			return text;
		case 'returned':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,shiryu2)
				.replace("BEEP BOOP. I AM BACK WITH","Mistress, I have returned with")
				.replace("ANIMALS","knights")
				.replace("ESSENCE, AND","essence, and")
				.replace("EXPERIENCE","experience");
		default:
			return text;
	}
}

function dalu(text,type){
	let foxbot = '<:foxbot:653394747880374272>';
	switch(type){
		case 'hb':
			text.fields[0].name = foxbot+' `Hai Hai Master. I am KitsuneBot. Ready to find more food for you!`';
			text.fields[0].value = blank;
			text.author.name = text.author.name.replace("HuntBot","KitsuneBot");
			text.color = 63996;
			text.fields[1].name = text.fields[1].name.replace("⏱ Efficiency","<a:foxefficiency:653394748333096960> Found Enemies");
			text.fields[2].name = text.fields[2].name.replace("⏳ Duration","<a:foxduration:653394748501131293> Hunt Time");
			text.fields[3].name = text.fields[3].name.replace("<:cowoncy:416043450337853441> Cost","<a:foxcost:653394748446343168> Endurance");
			text.fields[4].name = text.fields[4].name.replace("🔧 Gain","<a:foxgain:653394748836675594> Hunting Friends");
			text.fields[5].name = text.fields[5].name.replace("⚔ Experience","<a:foxxp:653394749604233286> Combat Amount");
			text.fields[6].name = text.fields[6].name.replace("<a:essence:451638978299428875> Animal Essence","<a:foxessence:653394748777824259> Fox Helpers");
			if(text.fields.length>=8){
				text.fields[7].name = foxbot+" KitsuneBot will be back soon!";
				text.fields[7].value = text.fields[7].value.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Estimated time to be back:");
			}
			return text;
		case 'progress':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,foxbot)
				.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Estimated time to be back:");
			return text;
		case 'password':
			text = text.split("\n")[0].replace(/<:[a-z]bot:[0-9]+>/gi,foxbot);
			return text
		case 'spent':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,foxbot)
				.replace("`BEEP BOOP. `","")
				.replace("YOU SPENT","you spent")
				.replace("I WILL BE BACK IN","I will be back soon in")
				.replace("WITH","with")
				.replace("ANIMALS","animals")
				.replace("ESSENCE","Hunting Friends")
				.replace("AND","and")
				.replace("EXPERIENCE","Combat Amount");
			return text;
		case 'returned':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,foxbot)
				.replace("BEEP BOOP. I AM BACK WITH","I am back with")
				.replace("ANIMALS","animals")
				.replace("AND","and")
				.replace("ESSENCE","Hunting Friends")
				.replace("EXPERIENCE","Combat Amount");
			return text;
		default:
			return text;
	}
}

function rikudou(text,type){
	let emoji1 = '<:emoji1:655689103014363157>';
	let emoji2 = '<:emoji2:655689103316353034>';
	let emoji3 = '<:emoji3:655689103555166208>';
	switch(type){
		case 'hb':
			text.fields[0].name = emoji1+' `Rikudou, are you ready to go on another mission?`';
			text.fields[0].value = emoji3+" The Mission Assignment Desk has a S rank mission for you!";
			text.color = 255;
			text.fields[1].name = text.fields[1].name.replace("Efficiency","Chakra Levels").slice(0,-1) + " How are your chakra Levels doing?`";
			text.fields[2].name = text.fields[2].name.replace("Duration","Mission Length").slice(0,-1) + " Phew! This is one tedious mission!`";
			text.fields[3].name = text.fields[3].name.replace("Cost","Ryō").slice(0,-1) + " Do you have enough Ryō?`";
			text.fields[4].name = text.fields[4].name.slice(0,-1)+" Want to become Hokage? Time to gain more Reputation!`";
			text.fields[5].name = text.fields[5].name.replace("Experience","Training").slice(0,-1) + " Time for more training Shinobi!`";
			if(text.fields.length>=8){
				text.fields[7].name = emoji2+" Rikudou is currently out on a mission!";
				text.fields[7].value = text.fields[7].value.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Sorry, Rikudou is still out on a mission! You may request Rikudou for another mission at a later time. RIKUDOU WILL BE BACK IN");
			}
			return text;
		case 'progress':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,emoji2)
				.replace("BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN","Sorry, Rikudou is still out on a mission! You may request Rikudou for another mission at a later time.`\n"+blank+" **|** `RIKUDOU WILL BE BACK IN");
			return text;
		case 'password':
			text = text.split("\n")[0].replace(/<:[a-z]bot:[0-9]+>/gi,emoji1);
			return text
		case 'spent':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,emoji3)
				.replace("`BEEP BOOP. `","")
				.replace("YOU SPENT","you spent")
				.replace("I WILL BE BACK IN","I will be back in")
				.replace("WITH","with")
				.replace("ANIMALS","ninjas")
				.replace("ESSENCE","essence")
				.replace("AND","and")
				.replace("EXPERIENCE","experience");
			return text;
		case 'returned':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi,emoji1)
				.replace("BEEP BOOP. I AM BACK WITH","I am back with")
				.replace("ANIMALS","ninjas")
				.replace("AND","and")
				.replace("ESSENCE","essence")
				.replace("EXPERIENCE","experience");
			return text;
		default:
			return text;
	}
}

