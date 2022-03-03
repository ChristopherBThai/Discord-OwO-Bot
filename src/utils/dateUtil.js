/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Utility to check/parse dates */

const overrideWithinDay = false;

/* Checks if the given date is past midnight */
exports.afterMidnight = function(date){

	/* Grab current time */
	let now = new Date();
	let sqlNow = toMySQL(now);
	let midnight = new Date(now.getFullYear(),now.getMonth(),now.getDate());

	/* Calculate time until midnight */
	let temp = Math.trunc(((midnight-now)+86400000)/1000);
	let seconds = temp%60;
	temp = Math.trunc(temp/60);
	let minutes = temp%60
	temp = Math.trunc(temp/60);
	let hours = temp%24;
	temp = Math.trunc(temp/24);
	let days = temp;

	/* If there is no data */
	if(!date) return {after:true,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow,now};

	let pDate = new Date(date);
	let diff = midnight - pDate;

	/* Not past midnight */
	if(diff<=0) return {after:false,diff:diff,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow,now};

	/* Within 1 day */
	else if(diff<=172810000) return {after:true,diff:diff,withinDay:true,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow,now};

	/* Over 1 full day */
	else return {after:true,diff:diff,withinDay: (overrideWithinDay || false) ,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow,now};
}

function toMySQL(date){
	return "'"+date.getFullYear() + '-' +
		('00' + (date.getMonth()+1)).slice(-2) + '-' +
		('00' + date.getDate()).slice(-2) + ' ' +
		('00' + date.getHours()).slice(-2) + ':' +
		('00' + date.getMinutes()).slice(-2) + ':' +
		('00' + date.getSeconds()).slice(-2) + "'";
}
