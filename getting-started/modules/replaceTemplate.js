module.exports = (temp, member) => {
	let output = temp.replace(/{%NAME%}/g, member.name);
	output = output.replace(/{%IMAGE%}/g, member.image);
	output = output.replace(/{%POSITION%}/g, member.position);
	output = output.replace(/{%DESCRIPTION%}/g, member.description);
	output = output.replace(/{%ID%}/g, member.id);
	return output;
};
