const fs = require("fs");
const http = require("http");
const url = require("url");

const replaceTemplate = (temp, member) => {
	let output = temp.replace(/{%NAME%}/g, member.name);
	output = output.replace(/{%IMAGE%}/g, member.image);
	output = output.replace(/{%POSITION%}/g, member.position);
	output = output.replace(/{%DESCRIPTION%}/g, member.description);
	output = output.replace(/{%ID%}/g, member.id);
	return output;
};

const tempOverview = fs.readFileSync(
	`${__dirname}/templates/template-overview.html`,
	"utf-8"
);

const tempCard = fs.readFileSync(
	`${__dirname}/templates/template-card.html`,
	"utf-8"
);

const tempMember = fs.readFileSync(
	`${__dirname}/templates/template-member.html`,
	"utf-8"
);

const data = fs.readFileSync(`${__dirname}/db/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
	const { query, pathname } = url.parse(req.url, true);

	if (pathname === "/" || pathname === "/overview") {
		res.writeHead(200, {
			"content-type": "text/html",
		});
		const cardsHtml = dataObj
			.map((el) => replaceTemplate(tempCard, el))
			.join("");
		const output = tempOverview.replace("{%MEMBER_CARDS%", cardsHtml);
		res.end(output);
	} else if (pathname === "/member") {
		res.writeHead(200, {
			"content-type": "text/html",
		});
		const member = dataObj[query.ID - 1];
		const output = replaceTemplate(tempMember, member);
		res.end(output);
	} else if (pathname === "/api") {
		res.writeHead(200, {
			"content-type": "application/json",
		});
		res.end(data);
	} else {
		res.writeHead(404, {
			"content-type": "text/html",
		});
		res.end("<h1>Page Not Found</h1>");
	}
});

server.listen(8000, `127.0.0.1`, () => console.log("listening on port 8000"));
