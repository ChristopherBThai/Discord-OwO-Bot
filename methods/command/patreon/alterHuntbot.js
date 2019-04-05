exports.alter = function(id,text,type){
	switch(id){
		case '111619509529387008':
			return lexus(text,type);
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

