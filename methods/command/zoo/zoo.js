const CommandInterface = require('../../commandinterface.js');

var animals = require('../../../../tokens/owo-animals.json');
var patreon = "";
var cpatreon = "";
var secret = "";
var secret2 = "";
var secret3 = "";
var display = "";
initDisplay();


module.exports = new CommandInterface({
	
	alias:["zoo"],

	args:"{display}",

	desc:"Displays your zoo! Some animals are rarer than others! Use the 'display' args to display all your animals from your history!",

	example:["owo zoo","owo zoo display"],

	related:["owo hunt","owo sell"],

	cooldown:45000,
	half:20,
	six:100,

	execute: function(p){
		var con=p.con,msg=p.msg,global=p.global;
		var sql = "SELECT count,name FROM animal WHERE id = "+msg.author.id+";";
		if(p.args[0]&&p.args[0].toLowerCase()=="display"){
			sql = "SELECT (totalcount) as count,name FROM animal WHERE id = "+msg.author.id+";";
			sql += "SELECT common,uncommon,rare,epic,mythical,legendary,fabled,MAX(totalcount) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = "+msg.author.id+" GROUP BY id;";
		}else{
			sql += "SELECT common,uncommon,rare,epic,mythical,legendary,fabled,MAX(count) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = "+msg.author.id+" GROUP BY id;";
		}
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			var text = "🌿 🌱 🌳** "+msg.author.username+"'s zoo! **🌳 🌿 🌱\n";
			text += display;
			var additional0 = "";
			var additional = "";
			var additional2 = "";
			var additional3 = "";
			var additional4 = "";
			var row = result[0];
			var count = result[1][0];
			var digits= 2;
			if(count!=undefined)
				digits= Math.trunc(Math.log10(count.biggest)+1);
			for(var i=0;i<row.length;i++){
				text = text.replace("~"+row[i].name,global.unicodeAnimal(row[i].name)+toSmallNum(row[i].count,digits));
				if(animals.patreon.indexOf(row[i].name)>0){
					if(additional0=="") additional0 = patreon;
					additional0 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
				}
				if(animals.cpatreon.indexOf(row[i].name)>0){
					if(additional4=="") additional4 = cpatreon;
					additional4 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
				}
				if(animals.legendary.indexOf(row[i].name)>0){
					if(additional=="") additional = secret;
					additional += row[i].name+toSmallNum(row[i].count,digits)+"  ";
				}
				else if(animals.fabled.indexOf(row[i].name)>0){
					if(additional2=="") additional2 = secret2;
					additional2 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
				}
				else if(animals.special.indexOf(row[i].name)>0){
					if(additional3=="") additional3 = secret3;
					additional3 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
				}
			}
			text = text.replace(/~:[a-zA-Z_0-9]+:/g,animals.question+toSmallNum(0,digits));
			text += additional0;
			text += additional4;
			text += additional;
			text += additional2;
			text += additional3;
			if(count!=undefined){
				var total = count.common*animals.points.common+
					count.uncommon*animals.points.uncommon+
					count.rare*animals.points.rare+
					count.epic*animals.points.epic+
					count.mythical*animals.points.mythical+
					count.legendary*animals.points.legendary+
					count.fabled*animals.points.fabled;
				text += "\n**Zoo Points: __"+total+"__**\n\t**";
				if(count.fabled>0)
					text += "F-"+count.fabled+", ";
				if(count.legendary>0)
					text += "L-"+count.legendary+", ";
				text += "M-"+count.mythical+", ";
				text += "E-"+count.epic+", ";
				text += "R-"+count.rare+", ";
				text += "U-"+count.uncommon+", ";
				text += "C-"+count.common+"**";
			}
			p.send(text)
		});
	}

})

function toSmallNum(count,digits){
	var result = "";
	var num = count;
	for(i=0;i<digits;i++){
		var digit = count%10;
		count = Math.trunc(count/10);
		result = animals.numbers[digit]+result;
	}
	return result;
}

function initDisplay(){
	var gap = "  ";
	display = animals.ranks.common+"   ";
	for (i=1;i<animals.common.length;i++)
		display += "~"+animals.common[i]+gap;
	display += "\n"+animals.ranks.uncommon+"   ";
	for (i=1;i<animals.uncommon.length;i++)
		display += "~"+animals.uncommon[i]+gap;
	display += "\n"+animals.ranks.rare+"   ";
	for (i=1;i<animals.rare.length;i++)
		display += "~"+animals.rare[i]+gap;
	display += "\n"+animals.ranks.epic+"   ";
	for (i=1;i<animals.epic.length;i++)
		display += "~"+animals.epic[i]+gap;
	display += "\n"+animals.ranks.mythical+"   ";
	for (i=1;i<animals.mythical.length;i++)
		display += "~"+animals.mythical[i]+gap;
	patreon = "\n"+animals.ranks.patreon+"    ";
	cpatreon = "\n"+animals.ranks.cpatreon+"    ";
	secret = "\n"+animals.ranks.legendary+"    ";
	secret2 = "\n"+animals.ranks.fabled+"    ";
	secret3 = "\n"+animals.ranks.special+"    ";
}
