const CommandInterface = require('../../commandinterface.js');

const food = require('./food.js');
const shopUtil = require('./shopUtil.js');

module.exports = new CommandInterface({
	
	alias:["inventory","inv"],

	args:"",

	desc:"Displays your inventory! Use 'owo equip' to use them!",

	example:[],

	related:["owo equip"],

	cooldown:10000,
	half:80,
	six:500,

	execute: function(p){
		var con=p.con,msg=p.msg;
		food.getItems(con,msg.author.id,function(items){
			var text = "";
			var count = 0;
			for(var key in items){
				var item = items[key];
				text += "`"+item.id+"`"+item.key + shopUtil.toSmallNum(item.count,2);
				count++;
				if(count==4){
					text += "\n";
					count=0;
				}else
					text += "    ";
			}
			if(text=="")
				text = "Your inventory is empty :c";
			text = "**===== "+msg.author.username+"'s Inventory =====**\n"+text;
			p.send(text);
		});
	}

})

