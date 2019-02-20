const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const teamUtil = require('./util/teamUtil.js');
const battleUtil = require('./util/battleUtil.js');

module.exports = new CommandInterface({

	alias:["team","squad"],

	args:"{add|remove|rename}",

	desc:"",

	example:[],

	related:[],

	cooldown:3000,
	half:80,
	six:500,

	execute: async function(p){
		/* Parse sub command */
		var subcommand = p.args[0];
		if(subcommand != undefined)
			subcommand = subcommand.toLowerCase();

		/* Display team */
		if(p.args.length==0||subcommand=="display")
			await displayTeam(p);

		/* Add a new team member */
		else if(subcommand=="set"||subcommand=="s"||subcommand=="add"||subcommand=="a"||subcommand=="replace"){
			/* No changing while in battle */
			if((await battleUtil.inBattle(p)))
				p.errorMsg(", You cannot change your team while you're in battle! Please finish your `owo battle`!");
			else
				await add(p);

		/* Remove a team member */
		}else if(subcommand=="remove"||subcommand=="delete"||subcommand=="d"){
			/* No changing while in battle */
			if((await battleUtil.inBattle(p)))
				p.errorMsg(", You cannot change your team while you're in battle! Please finish your `owo battle`!");
			else
				await remove(p);

		/* Rename the team */
		}else if(subcommand=="rename"||subcommand=="r"||subcommand=="name")
			await rename(p);

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

async function displayTeam(p){
	try{
		await teamUtil.displayTeam(p);
	}catch(err){
		console.error(err);
		p.errorMsg(`, something went wrong... Try again!`,5000);
	}
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
	if(pos&&(!p.global.isInt(pos)||pos<=0||pos>3)){
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

	try{
		await teamUtil.renameTeam(p,name);
	}catch(err){
		console.error(err);
		p.errorMsg(`, something went wrong... Try again!`,5000);
	}

}
