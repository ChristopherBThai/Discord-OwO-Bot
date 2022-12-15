/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const axios = require('axios');

exports.request = async function (cookie) {
	console.log('getting cowoncy...');
	const cowoncyList = await getCowoncy(cookie);
	console.log('getting pets...');
	const petList = await getPets(cookie);
	console.log('getting customized command...');
	const customizedList = await getCustomizedCommand(cookie);
	console.log('getting custom command...');
	const commandList = await getCommand(cookie);
	return {
		cowoncy: cowoncyList,
		pet: petList,
		customizedCommand: customizedList,
		customCommand: commandList,
	};
};

function getCowoncy(cookie) {
	return getUsers(
		cookie,
		'https://www.patreon.com/api/reward-items/159691/deliverables?include=member.user.null&filter[delivery_status]=not_delivered&fields[user]=full_name,social_connections&json-api-version=1.0&page[count]=100&page[size]=100',
		[]
	);
}

function getPets(cookie) {
	return getUsers(
		cookie,
		'https://www.patreon.com/api/reward-items/120005/deliverables?include=member.user.null&filter[delivery_status]=not_delivered&fields[user]=full_name,social_connections&json-api-version=1.0&page[count]=100&page[size]=100',
		[]
	);
}

function getCustomizedCommand(cookie) {
	return getUsers(
		cookie,
		'https://www.patreon.com/api/reward-items/120006/deliverables?include=member.user.null&filter[delivery_status]=not_delivered&fields[user]=full_name,social_connections&json-api-version=1.0&page[count]=100&page[size]=100',
		[]
	);
}

function getCommand(cookie) {
	return getUsers(
		cookie,
		'https://www.patreon.com/api/reward-items/120008/deliverables?include=member.user.null&filter[delivery_status]=not_delivered&fields[user]=full_name,social_connections&json-api-version=1.0&page[count]=100&page[size]=100',
		[]
	);
}

async function getUsers(cookie, url, list) {
	if (!url.includes('/api/')) {
		url = url.replace('patreon.com', 'patreon.com/api');
	}
	try {
		const { data } = await axios.get(url, { headers: { cookie } });
		data.included?.forEach((item) => {
			if (item.type === 'user') {
				const discord = item.attributes?.social_connections?.discord;
				list.push({
					name: item.attributes?.full_name,
					discord: discord?.user_id,
				});
			}
		});

		if (data.links.next) {
			console.log('getting next page...');
			return getUsers(cookie, data.links.next, list);
		}
		return list;
	} catch (err) {
		console.error(err);
		return list;
	}
}

/*
var url = require('url');
var patreon = require('patreon');

var patreonAPI,patreonOAuth,patreonOAuthClient,patreon_client;
//var link = '/campaigns/1623609?include=benefits.deliverables.user&fields%5Bbenefit%5D=title&fields%5Buser%5D=full_name,social_connections';
const benefitLink = '/campaigns/1623609?include=benefits.deliverables&fields%5Bbenefit%5D=title';
const userLink = ''


exports.request = async function(){
	patreonAPI = patreon.patreon;
	patreonOAuth = patreon.oauth;
	patreonOAuthClient = patreonOAuth(process.env.PATREON_CLIENT_ID, process.env.PATREON_CLIENT_SECRET);
	patreon_client = patreonAPI(process.env.PATREON_ACCESS_TOKEN);
	return await requestRec();
}

async function requestRec () {
	console.log('requesting...');
	let result = await patreon_client(benefitLink)
	console.log('request done');
	let res = {};
	console.log(result);

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
	console.log(JSON.stringify(benefits, null, 2));

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

	console.log(JSON.stringify(benefits, null, 2));
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
*/
