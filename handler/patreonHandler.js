var url = require('url');
var patreon = require('patreon');
var patreonAPI = patreon.patreon;
var patreonOAuth = patreon.oauth;

// Use the client id and secret you received when setting up your OAuth account
const auth = require('../../tokens/owo-auth.json');
var CLIENT_ID = auth.patreonID;
var CLIENT_SECRET = auth.patreonSecret;

//var patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET);

//var patreon_client = patreonAPI(auth.patreonAccessToken);

var link = '/campaigns/1623609/members?include=user&fields%5Bmember%5D=full_name,last_charge_date,last_charge_status,lifetime_support_cents&fields%5Buser%5D=first_name,social_connections&page%5Bcount%5D=100';


function request(url){
	setTimeout(function(){requestRec(url)},15000);
}
async function requestRec(url){
	await patreon_client(url).then(function(result){
		let valid = validPayments(result.rawJson.data);
		did = parseDiscordUser(result,valid);
		console.log(did.join(",")+",")
		if(result.rawJson.links.next)
			requestRec(result.rawJson.links.next.replace("https://www.patreon.com/api/oauth2/v2",""));

	}).catch(console.error);
}

function validPayments(users){
	var valid = [];
	/*Check if the payment went though*/
	for(var i=0;i<users.length;i++){
		user = users[i];
		var test = false;
		if(user.attributes.last_charge_status=="Paid"&&checkDate(user.attributes.last_charge_date)){
			valid.push(parseInt(user.relationships.user.data.id));
		}
	}
	return valid;
}

function parseDiscordUser(result,valid){
	var dids = [];
	for(var i=0;i<result.rawJson.included.length;i++){
		var uid = parseInt(result.rawJson.included[i].id);
		if(valid.includes(uid) && (user = result.rawJson.included[i].attributes)){
			if(userInner = user.social_connections){
				if(userInner2 = userInner.discord){
					var discordID = userInner2.user_id;
					dids.push(discordID);
				}
			}
		}
	}
	return dids;
}

function checkDate(date){
	var userDate = new Date(date);
	var pastDate = new Date('2018-10-30');
	return userDate > pastDate
}

//request(link);
