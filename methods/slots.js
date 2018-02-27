var slots = ["<:eggplant:417475705719226369>","<:heart:417475705899712522>","<:cherry:417475705178161162>","<:cowoncy:417475705912426496>","<:o_:417475705899843604>","<:w_:417475705920684053>"];
var moving = "<a:slot_gif:417473893368987649>";

exports.slots = function(con,msg){
	var amount = "5";
	var win = "nothing... :c";
	var machine = "**`___SLOTS___  `**\n "+moving+" "+moving+" "+moving+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`\n`|         |`";
	msg.channel.send(machine)
	.then(message => setTimeout(function(){
			var machine = "**`___SLOTS___  `**\n "+slots[0]+" "+moving+" "+moving+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`\n`|         |`";
			message.edit(machine)
			.then(message => setTimeout(function(){
					var machine = "**`___SLOTS___  `**\n "+slots[0]+" "+moving+" "+slots[0]+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`\n`|         |`";
					message.edit(machine)
					.then(message => setTimeout(function(){
							var machine = "**`___SLOTS___  `**\n "+slots[0]+" "+slots[2]+" "+slots[0]+"   "+msg.author.username+" bet <:cowoncy:416043450337853441> "+amount+"\n`|         |`  and won "+win+"\n`|         |`";
							message.edit(machine)

						},1000)
					);
				},1000)
			);
		},2000)
	);
	//setTimeout(function(){
		
	//},2000);
}
