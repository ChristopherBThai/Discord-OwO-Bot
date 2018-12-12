const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const battleUtil = require('./battleutil.js');
const petUtil = require('./petutil.js');
const teamUtil = require('./util/teamUtil.js');

module.exports = new CommandInterface({

	alias:["team","squad"],

	args:"{add|remove|rename}",

	desc:"",

	example:[],

	related:[],

	cooldown:5000,
	half:80,
	six:500,

	execute: function(p){
		/* Parse sub command */
		var subcommand = p.args[0];
		if(subcommand != undefined)
			subcommand = subcommand.toLowerCase();

		/* Display team */
		if(p.args.length==0)
			displayTeam(p);

		/* Add a new team member */
		if(subcommand=="set"||subcommand=="s"||subcommand=="add"||subcommand=="a"||subcommand=="replace")
			add(p);

		/* Remove a team member */
		else if(subcommand=="remove"||subcommand=="delete"||subcommand=="d")
			remove(p);

		/* Rename the team */
		else if(subcommand=="rename"||subcommand=="r"||subcommand=="name")
			rename(p);

		/* If they need help 
		else if(subcommand=="help"){
			p.help = true;
			p.hcommand = "team";
		}
		*/

		/* No command */
		else p.errorMsg(", wrong subcommand! Please check `owo help team`",3000);
	}

})

function displayTeam(p){
}

/*
 * owo add {animal} *{position}
 * Adds an animal to the team
 */
async function add(p){
	/* Check if valid # of args */
	if(p.args.length<=1){
		p.errorMsg(", the correct command is `owo team add {animal} {position}`!",5000);
		return;
	}

	/* Check if animal is valid */
	var animal = p.args[1];
	animal = p.global.validAnimal(animal);
	if(!animal){
		p.errorMsg(", I could not find this animal!",3000);
		return;
	}

	/* Check if position is valid (if any) */
	var pos = p.args[2];
	if(pos&&(pos<=0||pos>3)){
		p.errorMsg(", Invalid team position! It must be between `1-3`!",3000);
		return;
	}

	try{
		await teamUtil.addMember(p,animal,pos);
	}catch(err){
		console.error(err);
		p.errorMsg(`, something went wrong... Try again!`,5000);
	}
}

/*
 * owo remove {animal|position}
 */
async function remove(p){
	/* Check if valid # of args */
	if(p.args.length<2){
		p.errorMsg(", the correct command is `owo team remove {animal|position}`!",5000);
		return;
	}

	/* Parse args and validation */
	var remove = p.args[1];
	if(p.global.isInt(remove)){
		if(remove<1||remove>3){
			p.errorMsg(", Invalid team position! It must be between `1-3`!",3000);
			return;
		}
	}else{
		remove = p.global.validAnimal(remove);
		if(!remove){
			p.errorMsg(", I could not find this animal!",3000);
			return;
		}else remove = remove.value
	}

	try{
		await teamUtil.removeMember(p,remove);
	}catch(err){
		console.error(err);
		p.errorMsg(`, something went wrong... Try again!`,5000);
	}

}

/*
 * rename {name}
 */
async function rename(p){

	/* validate */
	if(p.args.length<2){
		p.errorMsg(", the correct command is `owo team rename {name}`!",5000);
		return;
	}
	
	/* grab name */
	var name = p.args.slice(1).join(" ");

	/* Name filter */
	var offensive = false;
	var shortnick = name.replace(/\s/g,"").toLowerCase();
	for(var i=0;i<badwords.length;i++){
		if(shortnick.includes(badwords[i]))
			offensive = true;
	}
	name = name.replace(/https:/gi,"https;");
	name = name.replace(/http:/gi,"http;");
	name = name.replace(/@everyone/gi,"everyone");
	name = name.replace(/<@!?[0-9]+>/gi,"User");

	/* Validation check */
	if(name.length>50){
		p.errorMsg(", The team name is too long!",3000);
		return;
	}

	try{
		await teamUtil.renameTeam(p,name);
	}catch(err){
		console.log(error);
		p.errorMsg(`, something went wrong... Try again!`,5000);
	}

}
