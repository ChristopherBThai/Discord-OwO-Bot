/* Utility to check/parse dates */

/* Checks if the given date is past midnight */
exports.afterMidnight = function(date){

	/* Grab current time */
	var now = new Date();
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
	if(!date) return {after:true,seconds:seconds,minutes:minutes,hours:hours,days:days};

	var pDate = new Date(date);
	var diff = midnight - pDate;

	
	/* Not past midnight */
	if(diff<=0) return {after:false,diff:diff,seconds:seconds,minutes:minutes,hours:hours,days:days};

	/* Within 1 day */
	else if(diff<=172810000) return {after:true,diff:diff,withinDay:true,seconds:seconds,minutes:minutes,hours:hours,days:days};

	/* Over 1 full day */
	else return {after:true,diff:diff,withinDay:false,seconds:seconds,minutes:minutes,hours:hours,days:days};
}

