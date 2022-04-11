/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

var url = require('url');
var patreon = require('patreon');

var patreonAPI,patreonOAuth,patreonOAuthClient,patreon_client;
var link = '/campaigns/1623609?include=benefits.deliverables.user&fields%5Bbenefit%5D=title&fields%5Buser%5D=full_name,social_connections';

exports.request = async function(){
	patreonAPI = patreon.patreon;
	patreonOAuth = patreon.oauth;
	patreonOAuthClient = patreonOAuth(process.env.PATREON_CLIENT_ID, process.env.PATREON_CLIENT_SECRET);
	patreon_client = patreonAPI(process.env.PATREON_ACCESS_TOKEN);
	return await requestRec(link);
}

async function requestRec(url){
	console.log('requesting...');
	let result = await patreon_client(url)
	console.log('request done');
	let res = {};

	// Grab benefits
	let benefits = {};
	for(let i in result.rawJson.included){
		let obj = result.rawJson.included[i];
		if(obj.type=='benefit'){
			benefits[obj.id] = {title:obj.attributes.title,users:[],deliverable:[]}
			for(let j in obj.relationships.deliverables.data){
				let deliverable = obj.relationships.deliverables.data[j];
				benefits[obj.id].deliverable.push(deliverable.id);
			}
			res[obj.attributes.title] = [];
		}
	}

	// Grab deliverables
	for(let i in result.rawJson.included){
		let obj = result.rawJson.included[i];
		if(obj.type=='deliverable'&&obj.attributes.delivery_status=='not_delivered'){
			for(let j in benefits){
				if(benefits[j].deliverable.includes(obj.id)){
					benefits[j].users.push(obj.relationships.user.data.id);
				}
			}
		}
	}

	//Grab users
	const users = {};
	for(let i in result.rawJson.included){
		let obj = result.rawJson.included[i];
		if(obj.type=='user'){
			users[obj.id] = obj;
			
		}
	}

	for (let i in benefits){
		for (let j in benefits[i].users) {
			const user = users[benefits[i].users[j]];
			if (user) {
				res[benefits[i].title].push({
					name: user.attributes.full_name,
					discordID:(user.attributes.social_connections?.discord ? user.attributes.social_connections.discord.user_id : null)
				});
			}
		}
	}

	return res;
}

