const request = require('request');
const imagegenAuth = require('../../../../tokens/imagegen.json');

/* Generates a battle image by my battle image generation api */
exports.generateImage = function(player,teams){
	/* Construct json for POST request */
	var info = generateJson(teams);
	info.password = imagegenAuth.password;
	console.log(info);

	/* Returns a promise to avoid callback hell */
	return new Promise( (resolve, reject) => {
		request({
			method:'POST',
			uri:imagegenAuth.battleImageUri,
			encoding:null,
			json:true,
			body: info,
		},(error,res,body)=>{
			if(error){
				reject(error);
				console.error(error);
				return;
			}
			resolve(body);
		});
	});
}

/* Generates a json depending on the battle info */
function generateJson(teams){
	var json = {
		player:{
			teamName:teams.player.name,
			animals:[]
		},
		enemy:{
			teamName:teams.enemy.name,
			animals:[]
		}
	};

	for(i=0;i<teams.player.team.length;i++)
		json.player.animals.push(generateAnimalJson(teams.player.team[i]));
	for(i=0;i<teams.enemy.team.length;i++)
		json.enemy.animals.push(generateAnimalJson(teams.enemy.team[i]));
	return json;
}

function generateAnimalJson(animal){
	var animalID = animal.name.match(/:[0-9]+>/g);
	if(animalID) animalID = animalID[0].match(/[0-9]+/g)[0];
	else animalID = animal.name.substring(1,animal.name.length-1);
	if(!animal.nickname) animal.nickname = animal.name.match(/:[\w]+:/gi)[0].match(/[\w]+/gi)[0];
	return {
		animal_name:animal.nickname,
		animal_image:animalID,
		weapon_image:"307922660741087235",
		animal_level:animal.lvl,
		animal_hp:{
			current:1423,
			max:2000,
			previous:1500
		},
		animal_wp:{
			current:341,
			max:1000,
			previous:500
		},
		animal_att:100,
		animal_mag:250,
		animal_pr:100,
		animal_mr:100,
		animal_debuff:{}
	}
}
