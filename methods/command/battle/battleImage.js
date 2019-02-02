const request = require('request');
const imagegenAuth = require('../../../../tokens/imagegen.json');

/* Generates a battle image by my battle image generation api */
exports.generateImage = function(teams){
	/* Construct json for POST request */
	var info = generateJson(teams);
	info.password = imagegenAuth.password;

	/* Returns a promise to avoid callback hell */
	try{
		return new Promise( (resolve, reject) => {
			let req = request({
				method:'POST',
				uri:imagegenAuth.battleImageUri,
				//encoding:null,
				json:true,
				body: info,
			},(error,res,body)=>{
				if(error){
					resolve("");
					console.error(error);
					return;
				}
				resolve(body);
			});
		});
	}catch (err){
		console.log(err);
		return "";
	}
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
	let weapon = animal.weapon;
	let stat = animal.stats;
	
	/* Parse animal info */
	let animalID = animal.animal.value.match(/:[0-9]+>/g);
	if(animalID) animalID = animalID[0].match(/[0-9]+/g)[0];
	else animalID = animal.animal.value.substring(1,animal.animal.value.length-1);
	let nickname = animal.nickname;
	if(!nickname) nickname = animal.animal.name;

	/* Parse weapon info */
	let weaponID;
	if(weapon){
		weaponID = weapon.emoji.match(/:[0-9]+>/g);
		if(weaponID) weaponID = weaponID[0].match(/[0-9]+/g)[0];
	}

	/* Parse hp/wp */
	let hp = {
		current:Math.ceil(stat.hp[0]),
		max:Math.ceil(stat.hp[1]+stat.hp[3]),
		previous:Math.ceil(stat.hp[2])
	};
	if(hp.current<0) hp.current = 0;
	if(hp.previous<0) hp.previous = 0;
	let wp = {
		current:Math.ceil(stat.wp[0]),
		max:Math.ceil(stat.wp[1]+stat.wp[3]),
		previous:Math.ceil(stat.wp[2])
	};
	if(wp.current<0) wp.current = 0;
	if(wp.previous<0) wp.current = 0;

	return {
		animal_name:nickname,
		animal_image:animalID,
		weapon_image:weaponID,
		animal_level:stat.lvl,
		animal_hp:hp,
		animal_wp:wp,
		animal_att:Math.ceil(stat.att[0]+stat.att[1]),
		animal_mag:Math.ceil(stat.mag[0]+stat.mag[1]),
		animal_pr:Math.ceil(stat.pr[0]+stat.pr[1]),
		animal_mr:Math.ceil(stat.mr[0]+stat.mr[1]),
		animal_debuff:{}
	}
}
