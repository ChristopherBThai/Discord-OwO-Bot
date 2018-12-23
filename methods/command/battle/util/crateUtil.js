const crate = "<:crate:523771259302182922>";

exports.getItems = async function(p){
	var sql = `SELECT cratetype,boxcount FROM crate WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND boxcount > 0;`;
	var result = await p.query(sql);
	var items = {};
	for(var i=0;i<result.length;i++){
		items[(100-result[i].cratetype)] = {emoji:crate,id:(100-result[i].cratetype),count:result[i].boxcount}
	}
	return items;
}
