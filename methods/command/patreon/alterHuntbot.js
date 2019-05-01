/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

exports.alter = function(id,text,type){
	switch(id){
		case '111619509529387008':
			return lexus(text,type);
		case '242718397836558337':
			return shippig(text,type);
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
				.replace("EXPERIENCE","exprerience!");
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
				.replace("EXPERIENCE","exprerience!");
		default:
			return text;
	}
}
