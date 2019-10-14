/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Utility to check/parse dates */

/* Checks if the given date is past midnight */
exports.afterMidnight = function(date){

	/* Grab current time */
	var now = new Date();
	let sqlNow = toMySQL(now);
	var midnight = new Date(now.getFullYear(),now.getMonth(),now.getDate());

	/* Calculate time until midnight */
	var temp = Math.trunc(((midnight-now)+86400000)/1000);
	var seconds = temp%60;
	temp = Math.trunc(temp/60);
	var minutes = temp%60
	temp = Math.trunc(temp/60);
	var hours = temp%24;
	temp = Math.trunc(temp/24);
	var days = temp;

	/* If there is no data */
	if(!date) return {after:true,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow};

	var pDate = new Date(date);
	var diff = midnight - pDate;

	/* Not past midnight */
	if(diff<=0) return {after:false,diff:diff,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow};

	/* Within 1 day */
	else if(diff<=172810000) return {after:true,diff:diff,withinDay:true,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow};

	/* Over 1 full day */
	else return {after:true,diff:diff,withinDay:false,seconds:seconds,minutes:minutes,hours:hours,days:days,sql:sqlNow};
}

function toMySQL(date){
	return "'"+date.getFullYear() + '-' +
		('00' + (date.getMonth()+1)).slice(-2) + '-' +
		('00' + date.getDate()).slice(-2) + ' ' +
		('00' + date.getHours()).slice(-2) + ':' +
		('00' + date.getMinutes()).slice(-2) + ':' +
		('00' + date.getSeconds()).slice(-2) + "'";
}
