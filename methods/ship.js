//Ships two users
const global = require('./global.js');
const vowels = ['a','e','i','o','u','y'];

exports.ship = function(msg,args){
	var user1, user2;
	if(args.length==2){
		if(global.isUser(args[0])){
			user1 = global.getUser(args[0]);
			if(user1==undefined){
				msg.channel.send("Could not find that user!")
					.then(message => message.delete(3000));
				return;
			}
		}else{
			msg.channel.send("That's not a user!")
				.then(message => message.delete(3000));
			return;;
		}
		if(global.isUser(args[1])){
			user2 = global.getUser(args[1]);
			if(user2==undefined){
				msg.channel.send("Could not find that user!")
					.then(message => message.delete(3000));
				return;
			}
		}else{
			msg.channel.send("That's not a user!")
				.then(message => message.delete(3000));
			return;
		}
	}else if(args.length==1){
		user1 = msg.author;
		if(global.isUser(args[0])){
			user2 = global.getUser(args[0]);
			if(user2==undefined){
				msg.channel.send("Could not find that user!")
					.then(message => message.delete(3000));
				return;
			}
		}else{
			msg.channel.send("That's not a user!")
				.then(message => message.delete(3000));
			return;
		}
	}else{
		msg.channel.send("Invalid arguments! >:c")
			.then(message => message.delete(3000));
		return;
	}

	var name1 = user1.username;
	var name2 = user2.username;
	var name = combinename(name1,name2);
	msg.channel.send("**"+name1+"** 💞 **"+name2+"** = **" + name+"**");
	console.log("\x1b[36m%s\x1b[0m","\t"+name1 + " + " + name2 + " = " + name);
}

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

