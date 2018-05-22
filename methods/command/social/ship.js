const CommandInterface = require('../../commandinterface.js');

const vowels = ['a','e','i','o','u','y'];

module.exports = new CommandInterface({
	
	alias:["ship","combine"],

	args:"{@user1} {@user2}",

	desc:"Ships two people!",

	example:["owo ship @OwO @Scuttler"],

	related:[],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		var args=p.args,msg=p.msg,global=p.global;
		var user1, user2;
		if(args.length==2){
			if(global.isUser(args[0])){
				user1 = await global.getUser(args[0]);
				if(user1==undefined){
					p.send("**🚫 |** Could not find that user!",3000);
					return;
				}
			}else{
				p.send("**🚫 |** That's not a user!",3000);
				return;;
			}
			if(global.isUser(args[1])){
				user2 = await global.getUser(args[1]);
				if(user2==undefined){
					p.send("**🚫 |** Could not find that user!",3000);
					return;
				}
			}else{
				p.send("**🚫 |** That's not a user!",3000);
				return;
			}
		}else if(args.length==1){
			user1 = msg.author;
			if(global.isUser(args[0])){
				user2 = await global.getUser(args[0]);
				if(user2==undefined){
					p.send("**🚫 |** Could not find that user!",3000);
					return;
				}
			}else{
				p.send("**🚫 |** That's not a user!",3000);
				return;
			}
		}else{
			p.send("**🚫 |** Invalid arguments! >:c",3000);
			return;
		}

		var name1 = user1.username;
		var name2 = user2.username;
		var name = combinename(name1,name2);
		p.send("**"+name1+"** 💞 **"+name2+"** = **" + name+"**");
	}

})

function combinename(name1,name2){
	var count1=-1,count2=-1;
	var mid1 = Math.ceil(name1.length/2)-1;
	var mid2 = Math.ceil(name2.length/2)-1;
	var noVowel1=false,noVowel2=false;
	for(i=mid1;i>=0;i--){
		count1++;
		if(vowels.includes(name1.charAt(i).toLowerCase())){
			i = -1;
		}else if(i==0){
			noVowel1=true;
		}
	}
	for(i=mid2;i<name2.length;i++){
		count2++;
		if(vowels.includes(name2.charAt(i).toLowerCase())){
			i = name2.length;
		}else if(i==name2.length-1){
			noVowel2=true;
		}
	}

	var name = "";
	if(noVowel1&&noVowel2){
		name = name1.substring(0,mid1+1);
		name += name2.substring(mid2);
	}else if(count1<=count2){
		name = name1.substring(0,mid1-count1+1);
		name += name2.substring(mid2);
	}else{
		name = name1.substring(0,mid1+1);
		name += name2.substring(mid2+count2);
	}
	return name;
}

