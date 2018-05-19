exports.createDisplay= function(user1,user2,battleInfo){
	var percent1 = Math.ceil((user1.hp/user1.mhp)*20);
	var percent2 = Math.ceil((user2.hp/user2.mhp)*20);
	
	//Sets up HP bar
	var value1 = "** "+user1.unicode+" "+user1.name+"**\n`Lvl "+user1.lvl+"` "+user1.fdisplay+"\n`";
	var value2 = "** "+user2.unicode+" "+user2.name+"**\n`Lvl "+user2.lvl+"` "+user2.fdisplay+"\n`";
	for(i=0;i<20;i++){
		if(i<percent1)
			value1 += "█";
		else
			value1 += "▁";
		if(i<percent2)
			value2 += "█";
		else
			value2 += "▁";
	}
	value1 += "`\n**`HP`**`: "+user1.hp+"/"+user1.mhp+"`    **`ATT`**`: "+user1.att+"`";
	value2 += "`\n**`HP`**`: "+user2.hp+"/"+user2.mhp+"`    **`ATT`**`: "+user2.att+"`";

	//Battle 
	var title = "Battle ("+battleInfo.count+"/3)!";
	var actions = "```diff\n+ "+battleInfo.line1+"\n- "+battleInfo.line2+"\n= "+battleInfo.line3+"\n= "+battleInfo.line4+"```";

	const embed = {
		  "color": battleInfo.color,
		  "fields": [{
				"name": user1.username,
				"value": value1,
			        "inline": true
			},{
				"name": user2.username,
			        "value": value2,
			        "inline": true
		  	},{
			        "name": title,
				"value": actions
			}]
	};
	return {embed};
}
