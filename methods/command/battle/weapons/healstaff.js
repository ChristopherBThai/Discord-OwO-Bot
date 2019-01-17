const WeaponInterface = require('../WeaponInterface.js');

module.exports = class HealStaff extends WeaponInterface{

	init(){
		this.id = 2;
		this.name = "Healing Staff";
		this.basicDesc = "A staff that can heal allies!";
		this.emojis = ["<:chealstaff:535283616016498688>","<:uhealstaff:535283616096321547>","<:rhealstaff:535283616100646912>","<:ehealstaff:535283615664439300>","<:mhealstaff:535283616242991115>","<:lhealstaff:535283616209567764>","<:fhealstaff:535283617019068426>"]
		this.statDesc = "Heals ? hp to the lowest ally";
		this.availablePassives = [1,2,3,4,5,6];
		this.passiveCount = 1;
		this.qualityList = [[50,100]];
	}
}
