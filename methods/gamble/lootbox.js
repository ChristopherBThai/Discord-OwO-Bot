var global = require('./global.js');
var opengif = "<a:boxopen:427019823747301377> ";
var shakegif = "<a:boxshake:427004983460888588> ";
var box = "<:box:427352600476647425> ";
var blank = "<:blank:427371936482328596> ";

exports.open = function(msg,args){
	var count = 1;
	if(global.isInt(args[0]))
		count = parseInt(args[0]);
	if(count>25)
		count = 25;
	if(count<=0)
		count = 1;
	var text = blank.repeat(count) + "\n";
	text += shakegif.repeat(count)
	msg.channel.send(text)
		.then(message => setTimeout(function(){
			text = ":paperclip: ".repeat(count)+"\n"+opengif.repeat(count);
			message.edit(text);
		},Math.random()*2000+1000));
}
